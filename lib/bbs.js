// lib/bbs.js
// VERSION: 1.3.1
// Pezzi comuni della piattaforma dei gruppi per il project work BBS:
// chi sta chiamando, chi e' amministratore, il registro degli eventi che
// alimenta le statistiche, l'aggancio fra profili e aziende AIDA.
// I dati stanno su Postgres (Neon): vedi lib/db.js per le tabelle.

import { leggi, leggiCookie, NOME_COOKIE } from "./sessione.js";
import { ceArchivio, segnaEvento } from "./db.js";

export { tutti, uno, scrivi, scriviMolti, togli, ultimi, eventi, conta, contatore, correggi, ceArchivio } from "./db.js";
import { contatore } from "./db.js";

// I CREDITI. Ogni generazione di idee costa 1 credito; ognuno parte da
// BBS_CREDITI (10) piu' quelli che l'amministratore aggiunge (utente.bonus).
// Il contatore dei crediti usati vive dieci anni: in pratica non scade.
export const CREDITI_BASE = Number(process.env.BBS_CREDITI || 10);
export const DIECI_ANNI = 10 * 365 * 24 * 3600;
export const chiaveCrediti = (email) => "crediti:" + String(email).toLowerCase();
export async function creditiDi(email, utente) {
  const usati = await contatore(chiaveCrediti(email));
  const totale = CREDITI_BASE + Number((utente && utente.bonus) || 0);
  return { usati, totale, restano: Math.max(0, totale - usati) };
}

// CHI VEDE UN'IDEA DELLA BACHECA. "tutti": tutto il master. "scelti": solo
// chi l'ha pubblicata, le persone a cui e' destinata e chi e' gia' in squadra.
// L'amministratore vede tutto (e la pagina gli dice che e' riservata).
export function vedeIdea(i, io, admin) {
  // gli esempi li vede solo la persona per cui sono stati creati
  if (i.esempio) return !!io && i.soloPer === io;
  if (admin || i.visibilita !== "scelti") return true;
  return !!io && (i.autore === io || (i.destinatari || []).includes(io) || (i.membri || []).includes(io));
}

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
  if (!ceArchivio()) { res.status(500).json({ error: "Archivio non configurato: manca DATABASE_URL (collega il database Neon al progetto su Vercel)." }); return null; }
  const c = await leggi(leggiCookie(req.headers && req.headers.cookie, NOME_COOKIE), segreto);
  // c.inv: e' un link d'accesso, non una sessione (vale solo per entrare)
  if (!c || !c.e || c.inv) { res.status(401).json({ error: "Devi accedere." }); return null; }
  // "Modalita' utente": l'amministratore chiede di essere trattato come
  // tutti gli altri. Toglie soltanto permessi, quindi basta un'intestazione.
  const comeUtente = String((req.headers && req.headers["x-bbs-come-utente"]) || "") === "1";
  const admin = sonoAmministratore(c.e);
  return { email: c.e, nome: c.n || "", admin: admin && !comeUtente, adminVero: admin };
}

export function corpoDi(req) {
  if (typeof req.body === "string") { try { return JSON.parse(req.body); } catch { return {}; } }
  return req.body || {};
}

export function nuovoId(prefisso) {
  return prefisso + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/** Il registro: ogni cosa che succede finisce qui, e da qui le statistiche. */
export async function segna(chi, tipo, dettagli = {}) {
  try { await segnaEvento(chi, tipo, dettagli); } catch { /* il registro non deve mai far fallire l'azione */ }
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
  delete out.codiceLink;
  if (!perAdmin) delete out.email;
  return out;
}
