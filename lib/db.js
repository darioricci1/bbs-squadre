// lib/db.js
// VERSION: 1.0.0
// L'archivio su Postgres (Neon), parlato via HTTP con il driver serverless:
// una richiesta per query, niente connessioni da tenere aperte fra una
// funzione e l'altra.
//
// Ogni tabella tiene una chiave e il record intero in `dati` (jsonb): la
// forma dei record cambia spesso mentre la piattaforma cresce, e cosi' non
// serve una migrazione per ogni campo nuovo. Le tabelle si creano da sole
// alla prima richiesta.
//
//   profili      id    -> profilo (import LinkedIn + aggiunte della persona)
//   aziende      id    -> dati AIDA (id = nome normalizzato)
//   bacheca      id    -> idea pubblicata
//   utenti       id    -> account Google (id = email)
//   generazioni  id    -> idee generate, con chi e quando
//   eventi       serie -> registro di tutto quello che succede
//   contatori    chiave con scadenza, per i limiti (tentativi, generazioni)

import { neon } from "@neondatabase/serverless";

const URL_DB = () => process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
export const TABELLE = ["profili", "aziende", "bacheca", "utenti", "generazioni"];

export function ceArchivio() { return !!URL_DB(); }

let sql = null;
let pronto = null;

function db() {
  if (!sql) sql = neon(URL_DB());
  if (!pronto) {
    pronto = sql.transaction([
      ...TABELLE.map((t) => sql.query(`CREATE TABLE IF NOT EXISTS ${t} (
        id text PRIMARY KEY, dati jsonb NOT NULL, creato timestamptz NOT NULL DEFAULT now(),
        aggiornato timestamptz NOT NULL DEFAULT now())`)),
      sql.query(`CREATE INDEX IF NOT EXISTS generazioni_creato ON generazioni (creato DESC)`),
      sql.query(`CREATE TABLE IF NOT EXISTS eventi (
        serie bigserial PRIMARY KEY, quando timestamptz NOT NULL DEFAULT now(),
        chi text, tipo text, dati jsonb NOT NULL DEFAULT '{}')`),
      sql.query(`CREATE TABLE IF NOT EXISTS contatori (
        chiave text PRIMARY KEY, n integer NOT NULL, scade timestamptz NOT NULL)`),
    ]).catch((e) => { pronto = null; throw e; });
  }
  return pronto.then(() => sql);
}

function tabella(t) {
  if (!TABELLE.includes(t)) throw new Error("Tabella sconosciuta: " + t);
  return t;
}

/** Tutti i record di una tabella: { id: dati }. */
export async function tutti(t) {
  const s = await db();
  const righe = await s.query(`SELECT id, dati FROM ${tabella(t)}`);
  return Object.fromEntries(righe.map((r) => [r.id, r.dati]));
}

export async function uno(t, id) {
  const s = await db();
  const [r] = await s.query(`SELECT dati FROM ${tabella(t)} WHERE id = $1`, [String(id)]);
  return r ? r.dati : null;
}

export async function scrivi(t, id, dati) {
  const s = await db();
  await s.query(`INSERT INTO ${tabella(t)} (id, dati) VALUES ($1, $2::jsonb)
    ON CONFLICT (id) DO UPDATE SET dati = EXCLUDED.dati, aggiornato = now()`, [String(id), JSON.stringify(dati)]);
}

/** Tanti record in una query sola: `righe` e' un array di { id, dati }. */
export async function scriviMolti(t, righe) {
  if (!righe.length) return;
  const s = await db();
  await s.query(`INSERT INTO ${tabella(t)} (id, dati)
    SELECT x->>'id', x->'dati' FROM jsonb_array_elements($1::jsonb) AS x
    ON CONFLICT (id) DO UPDATE SET dati = EXCLUDED.dati, aggiornato = now()`, [JSON.stringify(righe)]);
}

export async function togli(t, id) {
  const s = await db();
  await s.query(`DELETE FROM ${tabella(t)} WHERE id = $1`, [String(id)]);
}

/** Gli ultimi `quanti` record, dal piu' recente. */
export async function ultimi(t, quanti = 500) {
  const s = await db();
  const righe = await s.query(`SELECT dati FROM ${tabella(t)} ORDER BY creato DESC LIMIT $1`, [quanti]);
  return righe.map((r) => r.dati);
}

export async function segnaEvento(chi, tipo, dettagli) {
  const s = await db();
  await s.query(`INSERT INTO eventi (chi, tipo, dati) VALUES ($1, $2, $3::jsonb)`, [chi, tipo, JSON.stringify(dettagli || {})]);
}

export async function eventi(quanti = 1000) {
  const s = await db();
  const righe = await s.query(`SELECT quando, chi, tipo, dati FROM eventi ORDER BY serie DESC LIMIT $1`, [quanti]);
  return righe.map((r) => ({ ...r.dati, quando: new Date(r.quando).toISOString(), chi: r.chi, tipo: r.tipo }));
}

/**
 * Conta un tentativo sotto `chiave` e torna quanti ce ne sono stati nella
 * finestra corrente. Scaduta la finestra, si riparte da 1.
 */
export async function conta(chiave, secondi) {
  const s = await db();
  const [r] = await s.query(`INSERT INTO contatori (chiave, n, scade) VALUES ($1, 1, now() + make_interval(secs => $2))
    ON CONFLICT (chiave) DO UPDATE SET
      n = CASE WHEN contatori.scade < now() THEN 1 ELSE contatori.n + 1 END,
      scade = CASE WHEN contatori.scade < now() THEN now() + make_interval(secs => $2) ELSE contatori.scade END
    RETURNING n`, [chiave, secondi]);
  return Number(r.n);
}
