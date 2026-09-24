// api/bbs.js
// VERSION: 1.0.0
// La piattaforma dei gruppi per il project work del master BBS: un'unica
// funzione con dentro tutte le azioni, scelte con ?a=... (su Vercel Hobby le
// funzioni sono contate, meglio non spenderne una per azione).
//
//   GET  config            -> client id di Google per il pulsante
//   POST entra {credential}-> verifica Google, mette il cookie
//   POST esci
//   GET  dati              -> io, profili, bacheca, le mie generazioni
//   POST rivendica {id}    -> "questo profilo sono io"
//   POST nuovo-profilo     -> se il proprio profilo non e' stato importato
//   POST profilo {...}     -> aggiorna il MIO profilo (passioni, preferenze...)
//   POST idea {...}        -> pubblica o modifica una mia idea in bacheca
//   POST idea-elimina {id}
//   POST interesse {id,on} -> "mi interessa / voglio partecipare"
//   POST membro {id,profilo,on} -> l'autore accoglie (o toglie) qualcuno
//   Solo amministratori:
//   GET  statistiche
//   POST importa-profili {righe}   POST importa-aziende {righe}
//   POST scollega {id}              POST elimina-profilo {id}
//
// I dati stanno nel KV Upstash (lib/kv.js), sotto "bbs:".

import { verificaIdToken, clientDiAccesso } from "../lib/google-id.js";
import { firma, cookieDaMettere, cookieDaTogliere } from "../lib/sessione.js";
import { ceArchivio, comandi } from "../lib/kv.js";
import {
  K, esigiAccesso, sonoAmministratore, puoEntrare, corpoDi, nuovoId, tuttoHash, unoHash,
  scriviHash, lista, segna, chiaveAzienda, profiloPubblico,
} from "../lib/bbs.js";

export const config = { api: { bodyParser: { sizeLimit: "4mb" } } };

const CAMPI_PROFILO = ["nome", "linkedin", "titolo", "azienda", "ruolo", "citta", "esperienze",
  "formazione", "competenze", "linkedinTesto", "foto"];
const CAMPI_MIEI = ["passioni", "preferenza", "settori", "ruoloNelTeam", "cosaCerco", "ideeMie",
  "disponibilita", "nonVoglio"];

function testo(v, max = 4000) { return String(v == null ? "" : v).trim().slice(0, max); }
function ipDi(req) { return String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "?"; }

async function mioProfilo(email) {
  const u = await unoHash(K.utenti, email);
  if (!u || !u.profilo) return null;
  const p = await unoHash(K.profili, u.profilo);
  return p && p.email === email ? p : null;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const a = String(req.query.a || "");
  try {
    if (a === "config") return res.status(200).json({ clientId: clientDiAccesso() });
    if (a === "entra") return await entra(req, res);
    if (a === "esci") {
      res.setHeader("Set-Cookie", cookieDaTogliere());
      return res.status(200).json({ ok: true });
    }

    const chi = await esigiAccesso(req, res);
    if (!chi) return;
    const corpo = corpoDi(req);

    if (a === "dati") return await dati(chi, res);
    if (req.method !== "POST" && a !== "statistiche") return res.status(405).json({ error: "Metodo non consentito" });

    switch (a) {
      case "rivendica": return await rivendica(chi, corpo, res);
      case "nuovo-profilo": return await nuovoProfilo(chi, corpo, res);
      case "profilo": return await aggiornaProfilo(chi, corpo, res);
      case "idea": return await idea(chi, corpo, res);
      case "idea-elimina": return await ideaElimina(chi, corpo, res);
      case "interesse": return await interesse(chi, corpo, res);
      case "membro": return await membro(chi, corpo, res);
    }

    if (!chi.admin) return res.status(403).json({ error: "Riservato all'amministratore." });
    switch (a) {
      case "statistiche": return await statistiche(res);
      case "importa-profili": return await importaProfili(chi, corpo, res);
      case "importa-aziende": return await importaAziende(chi, corpo, res);
      case "scollega": return await scollega(chi, corpo, res);
      case "elimina-profilo": return await eliminaProfilo(chi, corpo, res);
    }
    return res.status(404).json({ error: "Azione sconosciuta" });
  } catch (e) {
    return res.status(500).json({ error: "Errore server: " + e.message });
  }
}

async function entra(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Metodo non consentito" });
  const segreto = process.env.SESSIONE_SEGRETO || "";
  if (segreto.length < 16) return res.status(500).json({ error: "Accesso non configurato: manca SESSIONE_SEGRETO." });
  if (!ceArchivio()) return res.status(500).json({ error: "Archivio non configurato." });

  const k = "bbs:porta:" + ipDi(req) + ":" + Math.floor(Date.now() / 600000);
  const [n] = await comandi([["INCR", k], ["EXPIRE", k, 900]]);
  if (Number(n) > 30) return res.status(429).json({ error: "Troppi tentativi. Riprova fra qualche minuto." });

  let g;
  try { g = await verificaIdToken(corpoDi(req).credential); }
  catch (e) { return res.status(401).json({ error: "Accesso Google non valido: " + e.message }); }
  if (!puoEntrare(g.email)) {
    await segna(g.email, "rifiutato", { ip: ipDi(req) });
    return res.status(403).json({ error: "L'account " + g.email + " non e' fra quelli del master. Entra con l'indirizzo che hai dato alla BBS." });
  }

  const adesso = new Date().toISOString();
  const prima = await unoHash(K.utenti, g.email);
  const u = { profilo: null, primo: adesso, accessi: 0, ...(prima || {}), email: g.email, nome: g.nome, foto: g.foto, ultimo: adesso };
  u.accessi = (u.accessi || 0) + 1;

  // Primo accesso: se Dario ha importato un profilo con questa email, e' suo.
  if (!u.profilo) {
    const profili = await tuttoHash(K.profili);
    const suo = Object.values(profili).find((p) => p.emailAttesa && p.emailAttesa.toLowerCase() === g.email && !p.email);
    if (suo) {
      suo.email = g.email;
      if (!suo.foto && g.foto) suo.foto = g.foto;
      await scriviHash(K.profili, suo.id, suo);
      u.profilo = suo.id;
    }
  }
  await scriviHash(K.utenti, g.email, u);
  await segna(g.email, prima ? "accesso" : "primo-accesso");

  res.setHeader("Set-Cookie", cookieDaMettere(await firma({ e: g.email, n: g.nome }, segreto)));
  return res.status(200).json({ email: g.email, nome: g.nome, admin: sonoAmministratore(g.email) });
}

async function dati(chi, res) {
  const [profili, aziende, bacheca, generazioni, u] = await Promise.all([
    tuttoHash(K.profili), tuttoHash(K.aziende), tuttoHash(K.bacheca), lista(K.generazioni, 300),
    unoHash(K.utenti, chi.email),
  ]);
  const io = u && u.profilo && profili[u.profilo] && profili[u.profilo].email === chi.email ? u.profilo : null;
  return res.status(200).json({
    io: { email: chi.email, nome: chi.nome, admin: chi.admin, profilo: io, foto: u && u.foto },
    profili: Object.values(profili).map((p) => profiloPubblico(p, aziende, chi.admin))
      .sort((x, y) => String(x.nome).localeCompare(String(y.nome))),
    bacheca: Object.values(bacheca).sort((x, y) => String(y.creata).localeCompare(String(x.creata))),
    generazioni: generazioni.filter((g) => g.chi === chi.email).slice(0, 30),
  });
}

async function rivendica(chi, corpo, res) {
  if (await mioProfilo(chi.email)) return res.status(409).json({ error: "Hai gia' un profilo collegato." });
  const p = await unoHash(K.profili, testo(corpo.id, 80));
  if (!p) return res.status(404).json({ error: "Profilo non trovato" });
  if (p.email) return res.status(409).json({ error: "Questo profilo e' gia' stato preso. Se e' il tuo, scrivi a Dario." });
  p.email = chi.email;
  await scriviHash(K.profili, p.id, p);
  const u = (await unoHash(K.utenti, chi.email)) || { email: chi.email };
  u.profilo = p.id;
  await scriviHash(K.utenti, chi.email, u);
  await segna(chi.email, "rivendica", { profilo: p.id, nome: p.nome });
  return res.status(200).json({ ok: true, id: p.id });
}

async function nuovoProfilo(chi, corpo, res) {
  if (await mioProfilo(chi.email)) return res.status(409).json({ error: "Hai gia' un profilo collegato." });
  const u = (await unoHash(K.utenti, chi.email)) || { email: chi.email };
  const p = { id: nuovoId("p"), email: chi.email, nome: testo(corpo.nome, 120) || chi.nome, origine: "creato", creato: new Date().toISOString() };
  for (const c of CAMPI_PROFILO) if (corpo[c] != null && c !== "nome") p[c] = testo(corpo[c], c === "linkedinTesto" ? 20000 : 4000);
  if (!p.foto && u.foto) p.foto = u.foto;
  await scriviHash(K.profili, p.id, p);
  u.profilo = p.id;
  await scriviHash(K.utenti, chi.email, u);
  await segna(chi.email, "nuovo-profilo", { profilo: p.id, nome: p.nome });
  return res.status(200).json({ ok: true, id: p.id });
}

async function aggiornaProfilo(chi, corpo, res) {
  const p = await mioProfilo(chi.email);
  if (!p) return res.status(404).json({ error: "Prima collega il tuo profilo." });
  for (const c of CAMPI_PROFILO) if (corpo[c] != null) p[c] = testo(corpo[c], c === "linkedinTesto" ? 20000 : 4000);
  p.extra = p.extra || {};
  for (const c of CAMPI_MIEI) if (corpo[c] != null) p.extra[c] = testo(corpo[c], 2000);
  p.aggiornato = new Date().toISOString();
  await scriviHash(K.profili, p.id, p);
  await segna(chi.email, "profilo", { profilo: p.id });
  return res.status(200).json({ ok: true });
}

async function idea(chi, corpo, res) {
  const io = await mioProfilo(chi.email);
  if (!io) return res.status(404).json({ error: "Prima collega il tuo profilo." });
  const titolo = testo(corpo.titolo, 160);
  if (!titolo) return res.status(400).json({ error: "Serve almeno un titolo." });
  let i = corpo.id ? await unoHash(K.bacheca, testo(corpo.id, 80)) : null;
  if (i && i.autore !== io.id && !chi.admin) return res.status(403).json({ error: "Puoi modificare solo le tue idee." });
  if (!i) i = { id: nuovoId("i"), autore: io.id, autoreNome: io.nome, creata: new Date().toISOString(), membri: [io.id], interessati: [] };
  Object.assign(i, {
    titolo,
    descrizione: testo(corpo.descrizione, 4000),
    modello: testo(corpo.modello, 20),
    settore: testo(corpo.settore, 120),
    cerco: testo(corpo.cerco, 1000),
    posti: Math.max(2, Math.min(8, Number(corpo.posti) || 5)),
    origine: corpo.origine === "generata" ? "generata" : (i.origine || "manuale"),
    aggiornata: new Date().toISOString(),
  });
  await scriviHash(K.bacheca, i.id, i);
  await segna(chi.email, corpo.id ? "idea-modificata" : "idea-pubblicata", { idea: i.id, titolo: i.titolo, origine: i.origine });
  return res.status(200).json({ ok: true, id: i.id });
}

async function ideaElimina(chi, corpo, res) {
  const io = await mioProfilo(chi.email);
  const i = await unoHash(K.bacheca, testo(corpo.id, 80));
  if (!i) return res.status(404).json({ error: "Idea non trovata" });
  if (!chi.admin && (!io || i.autore !== io.id)) return res.status(403).json({ error: "Puoi eliminare solo le tue idee." });
  await comandi([["HDEL", K.bacheca, i.id]]);
  await segna(chi.email, "idea-eliminata", { idea: i.id, titolo: i.titolo });
  return res.status(200).json({ ok: true });
}

async function interesse(chi, corpo, res) {
  const io = await mioProfilo(chi.email);
  if (!io) return res.status(404).json({ error: "Prima collega il tuo profilo." });
  const i = await unoHash(K.bacheca, testo(corpo.id, 80));
  if (!i) return res.status(404).json({ error: "Idea non trovata" });
  const s = new Set(i.interessati || []);
  if (corpo.on) s.add(io.id); else s.delete(io.id);
  i.interessati = [...s];
  await scriviHash(K.bacheca, i.id, i);
  await segna(chi.email, corpo.on ? "interesse" : "interesse-tolto", { idea: i.id, titolo: i.titolo, autore: i.autore });
  return res.status(200).json({ ok: true });
}

async function membro(chi, corpo, res) {
  const io = await mioProfilo(chi.email);
  const i = await unoHash(K.bacheca, testo(corpo.id, 80));
  if (!i) return res.status(404).json({ error: "Idea non trovata" });
  if (!chi.admin && (!io || i.autore !== io.id)) return res.status(403).json({ error: "Solo chi ha pubblicato l'idea sceglie la squadra." });
  const pid = testo(corpo.profilo, 80);
  const s = new Set(i.membri || []);
  if (corpo.on) {
    if (s.size >= (i.posti || 5) && !s.has(pid)) return res.status(409).json({ error: "La squadra e' al completo." });
    s.add(pid);
  } else if (pid !== i.autore) s.delete(pid);
  i.membri = [...s];
  await scriviHash(K.bacheca, i.id, i);
  await segna(chi.email, corpo.on ? "membro-aggiunto" : "membro-tolto", { idea: i.id, titolo: i.titolo, profilo: pid });
  return res.status(200).json({ ok: true });
}

// ---------------------------------------------------------------- admin

async function importaProfili(chi, corpo, res) {
  const righe = Array.isArray(corpo.righe) ? corpo.righe : [];
  if (!righe.length) return res.status(400).json({ error: "Nessuna riga da importare." });
  const esistenti = await tuttoHash(K.profili);
  const perLinkedin = {}, perNome = {};
  for (const p of Object.values(esistenti)) {
    if (p.linkedin) perLinkedin[String(p.linkedin).toLowerCase().replace(/\/+$/, "")] = p;
    perNome[chiaveAzienda(p.nome)] = p;
  }
  let nuovi = 0, aggiornati = 0;
  const cmd = [];
  for (const r of righe.slice(0, 500)) {
    const nome = testo(r.nome, 120);
    if (!nome) continue;
    const li = testo(r.linkedin, 300).toLowerCase().replace(/\/+$/, "");
    let p = (li && perLinkedin[li]) || perNome[chiaveAzienda(nome)];
    if (p) aggiornati++; else { p = { id: nuovoId("p"), origine: "import", creato: new Date().toISOString() }; nuovi++; }
    for (const c of CAMPI_PROFILO) if (r[c] != null && String(r[c]).trim()) p[c] = testo(r[c], c === "linkedinTesto" ? 20000 : 4000);
    if (r.email) p.emailAttesa = testo(r.email, 200).toLowerCase();
    cmd.push(["HSET", K.profili, p.id, JSON.stringify(p)]);
  }
  for (let i = 0; i < cmd.length; i += 100) await comandi(cmd.slice(i, i + 100));
  await segna(chi.email, "import-profili", { nuovi, aggiornati });
  return res.status(200).json({ ok: true, nuovi, aggiornati });
}

async function importaAziende(chi, corpo, res) {
  const righe = Array.isArray(corpo.righe) ? corpo.righe : [];
  if (!righe.length) return res.status(400).json({ error: "Nessuna riga da importare." });
  const cmd = [];
  for (const r of righe.slice(0, 2000)) {
    const k = chiaveAzienda(r.nome);
    if (!k) continue;
    const a = {};
    for (const [c, v] of Object.entries(r)) if (v != null && String(v).trim()) a[c] = testo(v, 500);
    a.chiave = k;
    cmd.push(["HSET", K.aziende, k, JSON.stringify(a)]);
  }
  for (let i = 0; i < cmd.length; i += 100) await comandi(cmd.slice(i, i + 100));
  await segna(chi.email, "import-aziende", { quante: cmd.length });
  return res.status(200).json({ ok: true, importate: cmd.length });
}

async function scollega(chi, corpo, res) {
  const p = await unoHash(K.profili, testo(corpo.id, 80));
  if (!p) return res.status(404).json({ error: "Profilo non trovato" });
  const email = p.email;
  delete p.email;
  await scriviHash(K.profili, p.id, p);
  if (email) {
    const u = await unoHash(K.utenti, email);
    if (u) { u.profilo = null; await scriviHash(K.utenti, email, u); }
  }
  await segna(chi.email, "scollega", { profilo: p.id, email });
  return res.status(200).json({ ok: true });
}

async function eliminaProfilo(chi, corpo, res) {
  const id = testo(corpo.id, 80);
  await comandi([["HDEL", K.profili, id]]);
  await segna(chi.email, "elimina-profilo", { profilo: id });
  return res.status(200).json({ ok: true });
}

async function statistiche(res) {
  const [profili, utenti, bacheca, generazioni, eventi, aziende] = await Promise.all([
    tuttoHash(K.profili), tuttoHash(K.utenti), tuttoHash(K.bacheca),
    lista(K.generazioni, 1000), lista(K.eventi, 1000), tuttoHash(K.aziende),
  ]);
  const nomeDi = (id) => (profili[id] && profili[id].nome) || id;

  // Chi viene messo insieme a chi: selezioni nella generazione, squadre e
  // interessi in bacheca. Ogni coppia pesa quante volte compare.
  const coppie = {}, cercati = {};
  const conta = (ids, peso) => {
    const u = [...new Set(ids.filter(Boolean))].sort();
    for (let i = 0; i < u.length; i++) for (let j = i + 1; j < u.length; j++) {
      const k = u[i] + "|" + u[j];
      coppie[k] = (coppie[k] || 0) + peso;
    }
  };
  for (const g of generazioni) {
    const autore = utenti[g.chi] && utenti[g.chi].profilo;
    if (g.modo === "gruppo") {
      conta([autore, ...(g.persone || [])], 1);
      for (const p of g.persone || []) if (p !== autore) cercati[p] = (cercati[p] || 0) + 1;
    }
  }
  for (const i of Object.values(bacheca)) {
    conta(i.membri || [], 3);
    for (const p of i.interessati || []) conta([i.autore, p], 1);
  }

  const settori = {}, modelli = {};
  for (const g of generazioni) for (const i of g.idee || []) {
    if (i.settore) settori[i.settore] = (settori[i.settore] || 0) + 1;
    if (i.modello) modelli[i.modello] = (modelli[i.modello] || 0) + 1;
  }
  for (const i of Object.values(bacheca)) {
    if (i.settore) settori[i.settore] = (settori[i.settore] || 0) + 1;
    if (i.modello) modelli[i.modello] = (modelli[i.modello] || 0) + 1;
  }
  const ordina = (o, n = 20) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n);

  const profiliArr = Object.values(profili);
  return res.status(200).json({
    numeri: {
      profili: profiliArr.length,
      collegati: profiliArr.filter((p) => p.email).length,
      completati: profiliArr.filter((p) => p.extra && (p.extra.passioni || p.extra.cosaCerco)).length,
      utenti: Object.keys(utenti).length,
      generazioni: generazioni.length,
      ideeGenerate: generazioni.reduce((s, g) => s + (g.idee || []).length, 0),
      bacheca: Object.keys(bacheca).length,
      aziende: Object.keys(aziende).length,
    },
    coppie: ordina(coppie, 40).map(([k, n]) => { const [a, b] = k.split("|"); return { a: nomeDi(a), b: nomeDi(b), n }; }),
    cercati: ordina(cercati, 30).map(([id, n]) => ({ nome: nomeDi(id), n })),
    settori: ordina(settori), modelli: ordina(modelli),
    utenti: Object.values(utenti).sort((a, b) => String(b.ultimo).localeCompare(String(a.ultimo)))
      .map((u) => ({ ...u, profiloNome: u.profilo ? nomeDi(u.profilo) : null })),
    generazioni: generazioni.map((g) => ({ ...g, personeNomi: (g.persone || []).map(nomeDi) })),
    bacheca: Object.values(bacheca).map((i) => ({ ...i, membriNomi: (i.membri || []).map(nomeDi), interessatiNomi: (i.interessati || []).map(nomeDi) })),
    eventi: eventi.slice(0, 400),
  });
}
