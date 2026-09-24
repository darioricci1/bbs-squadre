// lib/bbs.js
// VERSION: 1.0.0
// Pezzi comuni della piattaforma dei gruppi per il project work BBS:
// chi sta chiamando, chi e' amministratore, lettura e scrittura dei dati
// nell'archivio KV, il registro degli eventi che alimenta le statistiche.
//
// Tutte le chiavi stanno sotto "bbs:":
//   bbs:profili      hash  id -> profilo (import LinkedIn + aggiunte della persona)
//   bbs:aziende      hash  chiave normalizzata -> dati AIDA dell'azienda
//   bbs:bacheca      hash  id -> idea pubblicata in bacheca
//   bbs:utenti       hash  email -> { email, nome, foto, profilo, primo, ultimo }
//   bbs:generazioni  lista delle idee generate (le piu' recenti in testa)
//   bbs:eventi       lista del registro (le piu' recenti in testa)

import { leggi, leggiCookie, NOME_COOKIE } from "./sessione.js";
import { ceArchivio, comandi, comando, hashInOggetto } from "./kv.js";

export const K = {
  profili: "bbs:profili",
  aziende: "bbs:aziende",
  bacheca: "bbs:bacheca",
  utenti: "bbs:utenti",
  generazioni: "bbs:generazioni",
  eventi: "bbs:eventi",
};

export function sonoAmministratore(email) {
  const elenco = String(process.env.BBS_AMMINISTRATORI || process.env.AMMINISTRATORI || "")
    .split(/[,;\s]+/).map((x) => x.trim().toLowerCase()).filter(Boolean);
  return !!elenco.length && elenco.includes(String(email || "").toLowerCase());
}

/**
 * Chi puo' entrare. Se BBS_DOMINI (es. "bbs.unibo.it,studio.unibo.it") o
 * BBS_INVITATI (elenco di email) sono impostati, entra solo chi ci sta
 * dentro; se non c'e' nessuno dei due, entra qualunque account Google.
 */
export function puoEntrare(email) {
  const e = String(email || "").toLowerCase();
  if (sonoAmministratore(e)) return true;
  const lista = (v) => String(v || "").split(/[,;\s]+/).map((x) => x.trim().toLowerCase()).filter(Boolean);
  const domini = lista(process.env.BBS_DOMINI);
  const invitati = lista(process.env.BBS_INVITATI);
  if (!domini.length && !invitati.length) return true;
  if (invitati.includes(e)) return true;
  return domini.some((d) => e.endsWith("@" + d));
}

/** Chi sta chiamando, dal cookie. Se non c'e', risponde 401 e torna null. */
export async function esigiAccesso(req, res) {
  const segreto = process.env.SESSIONE_SEGRETO || "";
  if (segreto.length < 16) { res.status(500).json({ error: "Accesso non configurato: manca SESSIONE_SEGRETO." }); return null; }
  if (!ceArchivio()) { res.status(500).json({ error: "Archivio non configurato: mancano KV_REST_API_URL e KV_REST_API_TOKEN." }); return null; }
  const c = await leggi(leggiCookie(req.headers && req.headers.cookie, NOME_COOKIE), segreto);
  if (!c || !c.e) { res.status(401).json({ error: "Devi accedere." }); return null; }
  return { email: c.e, nome: c.n || "", admin: sonoAmministratore(c.e) };
}

export function corpoDi(req) {
  if (typeof req.body === "string") { try { return JSON.parse(req.body); } catch { return {}; } }
  return req.body || {};
}

export function nuovoId(prefisso) {
  return prefisso + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function parse(v) { try { return JSON.parse(v); } catch { return null; } }

/** Tutto un hash, gia' decodificato: { campo: oggetto }. */
export async function tuttoHash(chiave) {
  const o = hashInOggetto(await comando("HGETALL", chiave)) || {};
  const out = {};
  for (const [k, v] of Object.entries(o)) { const p = parse(v); if (p) out[k] = p; }
  return out;
}

export async function unoHash(chiave, campo) {
  const v = await comando("HGET", chiave, campo);
  return v ? parse(v) : null;
}

export async function scriviHash(chiave, campo, valore) {
  await comando("HSET", chiave, campo, JSON.stringify(valore));
}

export async function lista(chiave, quanti = 500) {
  const arr = (await comando("LRANGE", chiave, 0, quanti - 1)) || [];
  return arr.map(parse).filter(Boolean);
}

/** Aggiunge in testa a una lista e la tiene lunga al massimo `tetto`. */
export async function inTesta(chiave, valore, tetto) {
  await comandi([["LPUSH", chiave, JSON.stringify(valore)], ["LTRIM", chiave, 0, tetto - 1]]);
}

/** Il registro: ogni cosa che succede finisce qui, e da qui le statistiche. */
export async function segna(chi, tipo, dettagli = {}) {
  try {
    await inTesta(K.eventi, { quando: new Date().toISOString(), chi, tipo, ...dettagli }, 5000);
  } catch { /* il registro non deve mai far fallire l'azione */ }
}

/** Il nome di un'azienda ridotto all'osso, per abbinare LinkedIn e AIDA. */
export function chiaveAzienda(nome) {
  return String(nome || "").toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/\b(s\.?\s?p\.?\s?a|s\.?\s?r\.?\s?l|s\.?\s?a\.?\s?s|s\.?\s?n\.?\s?c|spa|srl|sas|snc|societa|group|gruppo|holding|italia|italy|ltd|inc|gmbh|sa)\b\.?/g, " ")
    .replace(/[^a-z0-9]+/g, " ").trim();
}

/** L'azienda AIDA che corrisponde al nome scritto nel profilo, se c'e'. */
export function aziendaPer(nome, aziende) {
  const k = chiaveAzienda(nome);
  if (!k) return null;
  if (aziende[k]) return aziende[k];
  for (const [ka, a] of Object.entries(aziende)) {
    if (ka.length >= 4 && (k.startsWith(ka + " ") || ka.startsWith(k + " "))) return a;
  }
  return null;
}

/** Il profilo come lo vedono gli altri: senza email, con l'azienda agganciata. */
export function profiloPubblico(p, aziende, perAdmin = false) {
  const az = aziendaPer(p.azienda, aziende);
  const out = { ...p, aziendaInfo: az || null, rivendicato: !!p.email };
  if (!perAdmin) delete out.email;
  return out;
}
