// lib/bbs.js
// VERSION: 1.1.0
// Pezzi comuni della piattaforma dei gruppi per il project work BBS:
// chi sta chiamando, chi e' amministratore, il registro degli eventi che
// alimenta le statistiche, l'aggancio fra profili e aziende AIDA.
// I dati stanno su Postgres (Neon): vedi lib/db.js per le tabelle.

import { leggi, leggiCookie, NOME_COOKIE } from "./sessione.js";
import { ceArchivio, segnaEvento } from "./db.js";

export { tutti, uno, scrivi, scriviMolti, togli, ultimi, eventi, conta, ceArchivio } from "./db.js";

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
  if (!perAdmin) delete out.email;
  return out;
}
