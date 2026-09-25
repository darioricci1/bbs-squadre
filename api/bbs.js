// api/bbs.js
// VERSION: 1.13.0
// La piattaforma dei gruppi per il project work del master BBS: un'unica
// funzione con dentro tutte le azioni, scelte con ?a=... (su Vercel Hobby le
// funzioni sono contate, meglio non spenderne una per azione).
//
//   GET  config            -> client id di Google per il pulsante
//   POST entra {credential}-> verifica Google, mette il cookie
//   POST esci
//   GET  dati              -> io, profili, bacheca, le mie generazioni
//   POST rivendica {id}    -> "questo profilo sono io"
//   POST lascia            -> "questo non e' il mio profilo"
//   POST nuovo-profilo     -> se il proprio profilo non e' stato importato
//   POST profilo {...}     -> aggiorna il MIO profilo (passioni, preferenze...)
//   POST idea {...}        -> pubblica o modifica un mio post in bacheca: da 1 a 5
//                             idee, per tutti o solo per persone scelte
//   POST idea-elimina {id}
//   POST interesse {id,on} -> "mi interessa / voglio partecipare"
//   POST membro {id,profilo,on} -> l'autore accoglie (o toglie) qualcuno
//   POST lavori {lavori:[...]}  -> descrizioni dei miei lavori (ruolo e azienda);
//                                  l'amministratore puo' passare {profilo}
//   Solo amministratori:
//   GET  statistiche
//   POST importa-profili {righe}   POST importa-aziende {righe}
//   POST crediti {email, piu}      -> aggiunge crediti a una persona
//   POST scollega {id}              POST elimina-profilo {id}
//   GET  aziende-lavoro            -> tutte le aziende dove hanno lavorato le
//                                     persone, con sito, settore e stato
//   POST azienda-salva {chiave, nome, sito, settore, descrizione, stato}
//   POST azienda-leggi {url}       -> titolo e descrizione letti dal sito
//   POST impostazioni {modello, effort} -> come genera Claude
//
// I dati stanno su Postgres (Neon), vedi lib/db.js.

import { verificaIdToken, clientDiAccesso } from "../lib/google-id.js";
import { firma, cookieDaMettere, cookieDaTogliere } from "../lib/sessione.js";
import {
  esigiAccesso, sonoAmministratore, puoEntrare, corpoDi, nuovoId, tutti, uno, scrivi, scriviMolti,
  togli, ultimi, eventi, conta, ceArchivio, segna, chiaveAzienda, profiloPubblico,
  creditiDi, vedeIdea,
} from "../lib/bbs.js";
import { lavoriDi, lavoriPubblici, infoAzienda, chiaveAziendaNome, idLavoro } from "../lib/lavori.js";
import { lavoriDa } from "../lib/esperienze.js";
import { SETTORI, TIPI, FONTI } from "../lib/scelte.js";
import { MODELLI, EFFORT, impostazioniGenera } from "./genera.js";

export const config = { api: { bodyParser: { sizeLimit: "4mb" } } };

const CAMPI_PROFILO = ["nome", "linkedin", "titolo", "azienda", "ruolo", "citta", "esperienze",
  "formazione", "competenze", "linkedinTesto", "foto"];
const CAMPI_MIEI = ["passioni", "preferenza", "settori", "ruoloNelTeam", "cosaCerco", "ideeMie",
  "disponibilita", "nonVoglio"];

function testo(v, max = 4000) { return String(v == null ? "" : v).trim().slice(0, max); }
function ipDi(req) { return String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "?"; }

async function mioProfilo(email) {
  const u = await uno("utenti", email);
  if (!u || !u.profilo) return null;
  const p = await uno("profili", u.profilo);
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
    if (req.method !== "POST" && a !== "statistiche" && a !== "aziende-lavoro") return res.status(405).json({ error: "Metodo non consentito" });

    switch (a) {
      case "rivendica": return await rivendica(chi, corpo, res);
      case "lascia": return await lascia(chi, res);
      case "nuovo-profilo": return await nuovoProfilo(chi, corpo, res);
      case "profilo": return await aggiornaProfilo(chi, corpo, res);
      case "idea": return await idea(chi, corpo, res);
      case "idea-elimina": return await ideaElimina(chi, corpo, res);
      case "interesse": return await interesse(chi, corpo, res);
      case "membro": return await membro(chi, corpo, res);
      case "lavori": return await salvaLavori(chi, corpo, res);
    }

    if (!chi.admin) return res.status(403).json({ error: "Riservato all'amministratore." });
    switch (a) {
      case "statistiche": return await statistiche(res);
      case "importa-profili": return await importaProfili(chi, corpo, res);
      case "importa-aziende": return await importaAziende(chi, corpo, res);
      case "scollega": return await scollega(chi, corpo, res);
      case "elimina-profilo": return await eliminaProfilo(chi, corpo, res);
      case "crediti": return await aggiungiCrediti(chi, corpo, res);
      case "aziende-lavoro": return await aziendeLavoro(res);
      case "azienda-salva": return await aziendaSalva(chi, corpo, res);
      case "azienda-leggi": return await aziendaLeggi(corpo, res);
      case "impostazioni": return await salvaImpostazioni(chi, corpo, res);
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

  const n = await conta("porta:" + ipDi(req), 600);
  if (n > 30) return res.status(429).json({ error: "Troppi tentativi. Riprova fra qualche minuto." });

  let g;
  try { g = await verificaIdToken(corpoDi(req).credential); }
  catch (e) { return res.status(401).json({ error: "Accesso Google non valido: " + e.message }); }
  if (!puoEntrare(g.email)) {
    await segna(g.email, "rifiutato", { ip: ipDi(req) });
    return res.status(403).json({ error: "L'account " + g.email + " non e' fra quelli del master. Entra con l'indirizzo che hai dato alla BBS." });
  }

  const adesso = new Date().toISOString();
  const prima = await uno("utenti", g.email);
  const u = { profilo: null, primo: adesso, accessi: 0, ...(prima || {}), email: g.email, nome: g.nome, foto: g.foto, ultimo: adesso };
  u.accessi = (u.accessi || 0) + 1;

  // Primo accesso: il profilo importato con questa email, oppure quello con
  // lo stesso nome dell'account Google.
  if (!u.profilo) {
    const profili = await tutti("profili");
    const suo = Object.values(profili).find((p) => p.emailAttesa && p.emailAttesa.toLowerCase() === g.email && !p.email)
      || profiloPerNome(g.nome, profili);
    if (suo) {
      suo.email = g.email;
      if (!suo.foto && g.foto) suo.foto = g.foto;
      await scrivi("profili", suo.id, suo);
      u.profilo = suo.id;
      await segna(g.email, "collegato-da-solo", { profilo: suo.id, nome: suo.nome });
    }
  }
  await scrivi("utenti", g.email, u);
  await segna(g.email, prima ? "accesso" : "primo-accesso");

  res.setHeader("Set-Cookie", cookieDaMettere(await firma({ e: g.email, n: g.nome }, segreto)));
  return res.status(200).json({ email: g.email, nome: g.nome, admin: sonoAmministratore(g.email) });
}

// Il nome dell'account Google contro i nomi dei profili non ancora presi.
// Si confrontano le parole, senza accenti ne' titoli: "Cosimo Senni" trova
// "Cosimo Senni Guidotti Magnani, Ph.D.". Deve esserci un solo candidato,
// se no si lascia scegliere alla persona con "Sono io".
function paroleNome(nome) {
  return new Set(String(nome || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s'-]/g, " ").split(/[\s'-]+/)
    .filter((w) => w.length > 1 && !["ph", "dott", "ing", "avv", "prof", "dr", "mba"].includes(w)));
}
export function profiloPerNome(nome, profili) {
  const g = paroleNome(nome);
  if (g.size < 2) return null;
  const contiene = (a, b) => [...a].every((w) => b.has(w));
  const attaccato = (a) => [...a].sort().join("");   // "dall ara" e "dallara" sono lo stesso nome
  const unito = (nome) => String(nome || "").toLowerCase().normalize("NFD").replace(/[^a-z]/g, "");
  const candidati = Object.values(profili).filter((p) => {
    if (p.email) return false;
    const n = paroleNome(p.nome);
    return n.size >= 2 && (contiene(g, n) || contiene(n, g) || attaccato(g) === attaccato(n) || unito(nome) === unito(p.nome));
  });
  return candidati.length === 1 ? candidati[0] : null;
}

async function dati(chi, res) {
  const [profili, aziende, bacheca, generazioni, letto, siti] = await Promise.all([
    tutti("profili"), tutti("aziende"), tutti("bacheca"), ultimi("generazioni", 300),
    uno("utenti", chi.email), tutti("siti"),
  ]);
  const u = letto || { email: chi.email, nome: chi.nome, profilo: null };
  // Chi e' entrato prima che il suo profilo esistesse: si collega adesso.
  if (!u.profilo) {
    const liberi = Object.fromEntries(Object.entries(profili).filter(([id]) => id !== u.lasciato));
    const suo = profiloPerNome(chi.nome, liberi);
    if (suo) {
      suo.email = chi.email;
      if (!suo.foto && u.foto) suo.foto = u.foto;
      u.profilo = suo.id;
      await Promise.all([scrivi("profili", suo.id, suo), scrivi("utenti", chi.email, u)]);
      await segna(chi.email, "collegato-da-solo", { profilo: suo.id, nome: suo.nome });
    }
  }
  const io = u && u.profilo && profili[u.profilo] && profili[u.profilo].email === chi.email ? u.profilo : null;
  // Per l'amministratore, una volta sola: un'idea di esempio "di un altro"
  // visibile solo a lui, per vedere come appare e come ci si candida. Non e'
  // attribuita a nessun compagno vero.
  if (chi.adminVero && io && u.esempioVersione !== 4) {
    const esempi = esempiBacheca(io, profili);
    for (const e of esempi) bacheca[e.id] = e;
    delete bacheca["esempio-" + io];
    u.esempioVersione = 4;
    await Promise.all([...esempi.map((e) => scrivi("bacheca", e.id, e)), togli("bacheca", "esempio-" + io), scrivi("utenti", chi.email, u)]);
  }
  const crediti = chi.admin ? null : await creditiDi(chi.email, u);
  return res.status(200).json({
    io: { email: chi.email, nome: chi.nome, admin: chi.admin, adminVero: chi.adminVero, profilo: io, foto: u && u.foto, crediti },
    profili: Object.values(profili).map((p) => {
      // i testi dei ruoli per intero solo nel proprio profilo, che si modifica
      const lavori = lavoriPubblici(p, siti).map((l) => p.id === io || l.descrizioneRuolo.length <= 300 ? l : { ...l, descrizioneRuolo: l.descrizioneRuolo.slice(0, 300) + "…" });
      const out = { ...profiloPubblico(p, aziende, chi.admin), lavori };
      delete out.lavoriMiei;
      return out;
    })
      .sort((x, y) => String(x.nome).localeCompare(String(y.nome))),
    // chi ha detto "mi interessa" lo vede solo l'autore (e l'amministratore)
    bacheca: Object.values(bacheca).filter((i) => vedeIdea(i, io, chi.admin))
      .map((i) => chi.admin || i.autore === io ? i : { ...i, interessati: (i.interessati || []).filter((x) => x === io) })
      .sort((x, y) => String(y.creata).localeCompare(String(x.creata))),
    scelte: { settori: SETTORI, tipi: TIPI, fonti: FONTI },
    generazioni: generazioni.filter((g) => g.chi === chi.email).slice(0, 30)
      .map((g) => { if (chi.adminVero) return g; const { costo, ...resto } = g; return resto; }),
  });
}

// Due esempi fatti con persone vere del master (cercate per nome, se no le
// prime disponibili), che vede solo l'amministratore (soloPer, vedi vedeIdea):
// una proposta generata da un compagno e condivisa col suo gruppo, e un'idea
// pubblicata per tutti.
function esempiBacheca(io, profili) {
  const tutti = Object.values(profili).filter((p) => p.id !== io);
  const presi = [];
  const trova = (nome) => {
    const p = tutti.find((x) => !presi.includes(x.id) && String(x.nome).toLowerCase().includes(nome)) || tutti.find((x) => !presi.includes(x.id));
    if (p) presi.push(p.id);
    return p || null;
  };
  const [autore, cfo, vendite, ingegnere, autrice2] = ["alessio sisi", "leming", "matteo magri", "andrea allegro", "sara saltini"].map(trova);
  const nome = (p, r) => (p ? p.nome : r);
  const ora = new Date().toISOString();
  const squadra = (ruoloMio) => `La squadra proposta:\n- ${nome(autore, "Chi l'ha generata")}: prodotto e ingegneria\n- ${nome(ingegnere, "Un ingegnere")}: processi e automazione\n- ${nome(cfo, "Una persona di finanza")}: finanza e modello di ricavo\n- ${nome(vendite, "Una persona di vendite")}: vendite B2B\n- ${profili[io] ? profili[io].nome : "Tu"}: ${ruoloMio}`;
  const gruppo = [cfo, vendite, ingegnere].filter(Boolean).map((p) => p.id);
  const idea = (titolo, settore, frase, problema, soluzione, clienti, tipo, conNomi) => ({
    titolo, modello: "B2B", settore, generata: true,
    descrizione: `${frase}\n\nProblema: ${problema}\nSoluzione: ${soluzione}\nClienti: ${clienti}\nTipo di startup: ${tipo}` + (conNomi ? "\n\n" + squadra("controllo di gestione e AI") : ""),
  });
  return [
    {
      id: "esempio-gruppo-" + io, esempio: true, soloPer: io, autore: autore ? autore.id : "esempio", autoreNome: nome(autore, "Un compagno"),
      creata: ora, aggiornata: ora, membri: [autore && autore.id].filter(Boolean), interessati: [],
      visibilita: "scelti", destinatari: [io, ...gruppo], proposti: [io, ...gruppo], origine: "generata", posti: 8,
      motivi: {
        [io]: "Porti controllo di gestione e AI: servono per misurare quanto la soluzione fa risparmiare ai clienti e per costruire il prodotto.",
        ...(cfo ? { [cfo.id]: "CFO in un gruppo industriale: costruisce il modello di ricavo e parla la lingua dei titolari." } : {}),
        ...(vendite ? { [vendite.id]: "Vende automazione di magazzino in Europa: conosce clienti e canali B2B." } : {}),
        ...(ingegnere ? { [ingegnere.id]: "Ingegnere di processo: sa dove si fermano le linee e perche'." } : {}),
      },
      titolo: "Tre idee per le fabbriche delle PMI",
      idee: [
        idea("Manutenzione predittiva per le macchine del packaging", "Industria e logistica",
          "Un sensore da applicare alle macchine gia' installate e un software che avvisa prima che si guastino.",
          "le PMI del packaging perdono giornate di produzione per fermi macchina imprevisti.", "sensori a basso costo e un'AI che impara dal comportamento di ogni macchina.",
          "costruttori di macchine e piccoli stabilimenti di confezionamento.", "Software per aziende (SaaS)", true),
        idea("Ricambi in giornata per le officine di moto e scooter", "Mobilità e automotive",
          "Una piattaforma che collega le officine ai magazzini ricambi della zona e prevede quali pezzi serviranno.",
          "le officine aspettano giorni i ricambi e perdono clienti.", "un marketplace dei ricambi con consegna in giornata.",
          "officine indipendenti e concessionari.", "Piattaforma o marketplace", true),
        idea("Controllo di gestione automatico per le PMI", "AI e software",
          "Un software che legge i dati del gestionale e ogni settimana manda al titolare margini, costi e allarmi.",
          "nelle PMI i numeri arrivano tardi, quando non si possono piu' correggere.", "collegamento ai dati esistenti e un'AI che scrive un rapporto chiaro.",
          "PMI manifatturiere dai 20 ai 200 dipendenti.", "Software per aziende (SaaS)", true),
      ],
      descrizione: "", modello: "B2B", settore: "Industria e logistica", cerco: "",
    },
    {
      id: "esempio-pubblica-" + io, esempio: true, soloPer: io, autore: autrice2 ? autrice2.id : "esempio", autoreNome: nome(autrice2, "Una compagna"),
      creata: ora, aggiornata: ora, membri: [autrice2 && autrice2.id].filter(Boolean), interessati: [],
      visibilita: "tutti", destinatari: [], origine: "generata", posti: 8, motivi: {},
      titolo: "Caldaie che si prenotano da sole la manutenzione",
      idee: [idea("Caldaie che si prenotano da sole la manutenzione", "Casa ed edilizia",
        "Un piccolo modulo che segnala quando la caldaia ha bisogno di assistenza e prenota il tecnico, prima che si guasti.",
        "le famiglie scoprono il guasto quando resta senza acqua calda, e i tecnici lavorano sempre in emergenza.", "un modulo connesso e un servizio che organizza gli interventi della zona.",
        "installatori e centri assistenza, e tramite loro le famiglie.", "Servizio tradizionale reso scalabile", false)],
      descrizione: "", modello: "B2B", settore: "Casa ed edilizia", cerco: "Chi conosce la vendita tramite installatori e chi sa di prodotti connessi",
    },
  ];
}

async function rivendica(chi, corpo, res) {
  if (await mioProfilo(chi.email)) return res.status(409).json({ error: "Hai gia' un profilo collegato." });
  const p = await uno("profili", testo(corpo.id, 80));
  if (!p) return res.status(404).json({ error: "Profilo non trovato" });
  if (p.email) return res.status(409).json({ error: "Questo profilo e' gia' stato preso. Se e' il tuo, scrivi a Dario." });
  p.email = chi.email;
  await scrivi("profili", p.id, p);
  const u = (await uno("utenti", chi.email)) || { email: chi.email };
  u.profilo = p.id;
  await scrivi("utenti", chi.email, u);
  await segna(chi.email, "rivendica", { profilo: p.id, nome: p.nome });
  return res.status(200).json({ ok: true, id: p.id });
}

// "Questo non e' il mio profilo": chi ha cliccato Sono io sulla persona
// sbagliata si scollega da solo, e il profilo torna libero.
async function lascia(chi, res) {
  const p = await mioProfilo(chi.email);
  const u = (await uno("utenti", chi.email)) || { email: chi.email };
  if (p) { delete p.email; await scrivi("profili", p.id, p); }
  u.profilo = null;
  u.lasciato = p ? p.id : null;   // non ricollegarlo da solo allo stesso profilo
  await scrivi("utenti", chi.email, u);
  await segna(chi.email, "lascia", { profilo: p && p.id, nome: p && p.nome });
  return res.status(200).json({ ok: true });
}

async function nuovoProfilo(chi, corpo, res) {
  if (await mioProfilo(chi.email)) return res.status(409).json({ error: "Hai gia' un profilo collegato." });
  const u = (await uno("utenti", chi.email)) || { email: chi.email };
  const p = { id: nuovoId("p"), email: chi.email, nome: testo(corpo.nome, 120) || chi.nome, origine: "creato", creato: new Date().toISOString() };
  for (const c of CAMPI_PROFILO) if (corpo[c] != null && c !== "nome") p[c] = testo(corpo[c], c === "linkedinTesto" ? 20000 : 4000);
  if (!p.foto && u.foto) p.foto = u.foto;
  await scrivi("profili", p.id, p);
  u.profilo = p.id;
  await scrivi("utenti", chi.email, u);
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
  await scrivi("profili", p.id, p);
  await segna(chi.email, "profilo", { profilo: p.id });
  return res.status(200).json({ ok: true });
}

// Un post della bacheca contiene da 1 a 5 idee (scritte a mano o generate)
// ed e' per tutti, oppure solo per le persone scelte.
function ideeDalCorpo(corpo) {
  const grezze = Array.isArray(corpo.idee) ? corpo.idee
    : [{ titolo: corpo.titolo, descrizione: corpo.descrizione, modello: corpo.modello, settore: corpo.settore }];
  return grezze.slice(0, 5).map((x) => ({
    titolo: testo(x && x.titolo, 160),
    descrizione: testo(x && x.descrizione, 4000),
    modello: testo(x && x.modello, 20),
    settore: testo(x && x.settore, 120),
    generata: !!(x && x.generata),
  })).filter((x) => x.titolo);
}

async function idea(chi, corpo, res) {
  const io = await mioProfilo(chi.email);
  if (!io) return res.status(404).json({ error: "Prima collega il tuo profilo." });
  const idee = ideeDalCorpo(corpo);
  if (!idee.length) return res.status(400).json({ error: "Serve almeno un'idea con un titolo." });
  const visibilita = corpo.visibilita === "scelti" ? "scelti" : "tutti";
  let destinatari = [];
  if (visibilita === "scelti") {
    const profili = await tutti("profili");
    destinatari = [...new Set((Array.isArray(corpo.destinatari) ? corpo.destinatari : []).map(String))]
      .filter((id) => profili[id] && id !== io.id).slice(0, 40);
    if (!destinatari.length) return res.status(400).json({ error: "Scegli almeno una persona con cui condividere." });
  }
  let i = corpo.id ? await uno("bacheca", testo(corpo.id, 80)) : null;
  if (i && i.autore !== io.id && !chi.admin) return res.status(403).json({ error: "Puoi modificare solo le tue idee." });
  if (!i) {
    // chi pubblica la propria idea puo' mettere subito in squadra i compagni scelti
    const profiliTutti = Array.isArray(corpo.membri) && corpo.membri.length ? await tutti("profili") : {};
    const compagni = [...new Set((Array.isArray(corpo.membri) ? corpo.membri : []).map(String))].filter((id) => profiliTutti[id] && id !== io.id).slice(0, 7);
    i = { id: nuovoId("i"), autore: io.id, autoreNome: io.nome, creata: new Date().toISOString(), membri: [io.id, ...compagni], interessati: [] };
  }
  Object.assign(i, {
    titolo: testo(corpo.titolo, 160) || (idee.length === 1 ? idee[0].titolo : idee.length + " idee di " + io.nome),
    idee, visibilita, destinatari,
    // la squadra proposta e' chi l'ha pubblicata piu' le persone con cui e'
    // condivisa: chi viene tolto dalla condivisione esce anche dalla squadra
    proposti: visibilita === "scelti" ? destinatari : [],
    // perche' ogni destinatario e' stato proposto (la riga di Claude, o
    // dell'autore): la vede chi riceve la proposta
    motivi: Object.fromEntries(destinatari.map((id) => [id, testo((corpo.motivi || {})[id], 240)]).filter(([, m]) => m)),
    descrizione: idee.length === 1 ? idee[0].descrizione : "",
    modello: idee.length === 1 ? idee[0].modello : "",
    settore: idee.length === 1 ? idee[0].settore : "",
    cerco: testo(corpo.cerco, 1000),
    posti: Number(corpo.posti) === 7 ? 7 : 8,   // squadre da 7 o 8 persone
    origine: idee.some((x) => x.generata) ? "generata" : "manuale",
    generazione: testo(corpo.generazione, 80) || i.generazione || "",
    aggiornata: new Date().toISOString(),
  });
  await scrivi("bacheca", i.id, i);
  await segna(chi.email, corpo.id ? "idea-modificata" : "idea-pubblicata",
    { idea: i.id, titolo: i.titolo, origine: i.origine, quante: idee.length, visibilita, destinatari });
  return res.status(200).json({ ok: true, id: i.id });
}

async function ideaElimina(chi, corpo, res) {
  const io = await mioProfilo(chi.email);
  const i = await uno("bacheca", testo(corpo.id, 80));
  if (!i) return res.status(404).json({ error: "Idea non trovata" });
  if (!chi.admin && (!io || i.autore !== io.id)) return res.status(403).json({ error: "Puoi eliminare solo le tue idee." });
  await togli("bacheca", i.id);
  await segna(chi.email, "idea-eliminata", { idea: i.id, titolo: i.titolo });
  return res.status(200).json({ ok: true });
}

async function interesse(chi, corpo, res) {
  const io = await mioProfilo(chi.email);
  if (!io) return res.status(404).json({ error: "Prima collega il tuo profilo." });
  const i = await uno("bacheca", testo(corpo.id, 80));
  if (!i || !vedeIdea(i, io.id, chi.admin)) return res.status(404).json({ error: "Idea non trovata" });
  const s = new Set(i.interessati || []);
  if (corpo.on) s.add(io.id); else s.delete(io.id);
  i.interessati = [...s];
  await scrivi("bacheca", i.id, i);
  await segna(chi.email, corpo.on ? "interesse" : "interesse-tolto", { idea: i.id, titolo: i.titolo, autore: i.autore });
  return res.status(200).json({ ok: true });
}

async function membro(chi, corpo, res) {
  const io = await mioProfilo(chi.email);
  const i = await uno("bacheca", testo(corpo.id, 80));
  if (!i) return res.status(404).json({ error: "Idea non trovata" });
  if (!chi.admin && (!io || i.autore !== io.id)) return res.status(403).json({ error: "Solo chi ha pubblicato l'idea sceglie la squadra." });
  const pid = testo(corpo.profilo, 80);
  const s = new Set(i.membri || []);
  if (corpo.on) {
    if (s.size >= (i.posti || 5) && !s.has(pid)) return res.status(409).json({ error: "La squadra e' al completo." });
    s.add(pid);
  } else if (pid !== i.autore) s.delete(pid);
  i.membri = [...s];
  await scrivi("bacheca", i.id, i);
  await segna(chi.email, corpo.on ? "membro-aggiunto" : "membro-tolto", { idea: i.id, titolo: i.titolo, profilo: pid });
  return res.status(200).json({ ok: true });
}

// ---------------------------------------------------------------- admin

async function importaProfili(chi, corpo, res) {
  const righe = Array.isArray(corpo.righe) ? corpo.righe : [];
  if (!righe.length) return res.status(400).json({ error: "Nessuna riga da importare." });
  const esistenti = await tutti("profili");
  const perLinkedin = {}, perNome = {};
  for (const p of Object.values(esistenti)) {
    if (p.linkedin) perLinkedin[String(p.linkedin).toLowerCase().replace(/\/+$/, "")] = p;
    perNome[chiaveAzienda(p.nome)] = p;
  }
  let nuovi = 0, aggiornati = 0;
  const scritti = [];
  for (const r of righe.slice(0, 500)) {
    const nome = testo(r.nome, 120);
    if (!nome) continue;
    const li = testo(r.linkedin, 300).toLowerCase().replace(/\/+$/, "");
    let p = (li && perLinkedin[li]) || perNome[chiaveAzienda(nome)];
    if (p) aggiornati++; else { p = { id: nuovoId("p"), origine: "import", creato: new Date().toISOString() }; nuovi++; }
    for (const c of CAMPI_PROFILO) if (r[c] != null && String(r[c]).trim()) p[c] = testo(r[c], c === "linkedinTesto" ? 20000 : 4000);
    if (r.email) p.emailAttesa = testo(r.email, 200).toLowerCase();
    scritti.push({ id: p.id, dati: p });
  }
  await scriviMolti("profili", scritti);
  await segna(chi.email, "import-profili", { nuovi, aggiornati });
  return res.status(200).json({ ok: true, nuovi, aggiornati });
}

async function importaAziende(chi, corpo, res) {
  const righe = Array.isArray(corpo.righe) ? corpo.righe : [];
  if (!righe.length) return res.status(400).json({ error: "Nessuna riga da importare." });
  const scritti = [];
  for (const r of righe.slice(0, 2000)) {
    const k = chiaveAzienda(r.nome);
    if (!k) continue;
    const a = {};
    for (const [c, v] of Object.entries(r)) if (v != null && String(v).trim()) a[c] = testo(v, 500);
    a.chiave = k;
    scritti.push({ id: k, dati: a });
  }
  await scriviMolti("aziende", scritti);
  await segna(chi.email, "import-aziende", { quante: scritti.length });
  return res.status(200).json({ ok: true, importate: scritti.length });
}

async function scollega(chi, corpo, res) {
  const p = await uno("profili", testo(corpo.id, 80));
  if (!p) return res.status(404).json({ error: "Profilo non trovato" });
  const email = p.email;
  delete p.email;
  await scrivi("profili", p.id, p);
  if (email) {
    const u = await uno("utenti", email);
    if (u) { u.profilo = null; await scrivi("utenti", email, u); }
  }
  await segna(chi.email, "scollega", { profilo: p.id, email });
  return res.status(200).json({ ok: true });
}

async function aggiungiCrediti(chi, corpo, res) {
  const email = testo(corpo.email, 200).toLowerCase();
  const u = await uno("utenti", email);
  if (!u) return res.status(404).json({ error: "Utente non trovato" });
  u.bonus = Math.max(-100, Math.min(1000, Number(u.bonus || 0) + Math.round(Number(corpo.piu) || 0)));
  await scrivi("utenti", email, u);
  await segna(chi.email, "crediti", { a: email, piu: Number(corpo.piu) || 0, bonus: u.bonus });
  return res.status(200).json({ ok: true, ...(await creditiDi(email, u)) });
}

async function eliminaProfilo(chi, corpo, res) {
  const id = testo(corpo.id, 80);
  await togli("profili", id);
  await segna(chi.email, "elimina-profilo", { profilo: id });
  return res.status(200).json({ ok: true });
}

// ---------------------------------------------------------------- lavori
// Le descrizioni di un lavoro: cosa faceva la persona (nel suo profilo) e cosa
// fa l'azienda (tabella siti, condivisa con chi ci ha lavorato). Ognuno
// modifica i suoi; l'amministratore anche quelli degli altri.
async function salvaLavori(chi, corpo, res) {
  const idProfilo = chi.admin && corpo.profilo ? String(corpo.profilo) : (await mioProfilo(chi.email) || {}).id;
  const [p, siti] = await Promise.all([idProfilo ? uno("profili", idProfilo) : null, tutti("siti")]);
  if (!p) return res.status(404).json({ error: "Profilo non trovato: collega prima il tuo profilo." });
  const miei = Object.fromEntries(lavoriDi(p, siti).map((l) => [l.id, l]));
  const nuoviSiti = [];
  p.lavoriMiei = p.lavoriMiei || {};
  for (const x of Array.isArray(corpo.lavori) ? corpo.lavori.slice(0, 60) : []) {
    const l = miei[String(x.id)];
    if (!l) continue;
    if (typeof x.descrizioneRuolo === "string") p.lavoriMiei[l.id] = { descrizioneRuolo: testo(x.descrizioneRuolo, 1500) };
    // l'azienda si tocca solo se nel corpo ci sono i suoi campi
    const prima = l.info;
    if (!["sito", "settore", "descrizioneAzienda"].some((k) => typeof x[k] === "string")) continue;
    const az = {
      sito: typeof x.sito === "string" ? testo(x.sito, 300) : prima.sito || "",
      settore: typeof x.settore === "string" ? testo(x.settore, 120) : prima.settore || "",
      descrizione: typeof x.descrizioneAzienda === "string" ? testo(x.descrizioneAzienda, 600) : prima.descrizione || "",
    };
    if (az.sito && !/^https?:\/\//i.test(az.sito)) az.sito = "https://" + az.sito;
    if (az.sito !== (prima.sito || "") || az.settore !== (prima.settore || "") || az.descrizione !== (prima.descrizione || "")) {
      nuoviSiti.push([l.chiave, { ...(siti[l.chiave] || {}), nome: prima.nome || l.azienda, ...az, stato: "verificata", da: chi.email, quando: new Date().toISOString() }]);
    }
  }
  await scrivi("profili", p.id, p);
  if (nuoviSiti.length) await scriviMolti("siti", nuoviSiti.map(([id, dati]) => ({ id, dati })));
  await segna(chi.email, "lavori", { profilo: p.id, aziende: nuoviSiti.map(([k]) => k) });
  return res.status(200).json({ ok: true, lavori: lavoriPubblici(p, { ...siti, ...Object.fromEntries(nuoviSiti) }) });
}

// Tutte le aziende dove hanno lavorato le persone, per la sezione Aziende:
// quelle da sistemare (dubbio, mancante) in cima.
async function aziendeLavoro(res) {
  const [profili, siti] = await Promise.all([tutti("profili"), tutti("siti")]);
  const elenco = {};
  for (const p of Object.values(profili)) {
    for (const l of lavoriDa(p.esperienze)) {
      const chiave = chiaveAziendaNome(l.azienda);
      if (!chiave) continue;
      const e = elenco[chiave] || (elenco[chiave] = { chiave, scritto: l.azienda, ...infoAzienda(chiave, l.azienda, siti), manuale: !!siti[chiave], persone: [] });
      const id = idLavoro(chiave, l.ruolo), mio = (p.lavoriMiei || {})[id];
      e.persone.push({ profilo: p.id, nome: p.nome, linkedin: p.linkedin || "", id, ruolo: l.ruolo, periodo: l.periodo,
        descrizioneRuolo: mio && typeof mio.descrizioneRuolo === "string" ? mio.descrizioneRuolo : l.descrizioneRuolo || "" });
    }
  }
  const ordine = { mancante: 0, dubbio: 1, trovata: 2, verificata: 3, ignorata: 4 };
  const lista = Object.values(elenco).sort((a, b) => (ordine[a.stato] - ordine[b.stato]) || b.persone.length - a.persone.length || String(a.nome || a.scritto).localeCompare(String(b.nome || b.scritto)));
  return res.status(200).json({ aziende: lista });
}

async function aziendaSalva(chi, corpo, res) {
  const chiave = testo(corpo.chiave, 200);
  if (!chiave) return res.status(400).json({ error: "Azienda mancante." });
  if (corpo.stato === "ripristina") { await togli("siti", chiave); return res.status(200).json({ ok: true }); }
  const stato = corpo.stato === "ignorata" ? "ignorata" : "verificata";
  let sito = testo(corpo.sito, 300);
  if (sito && !/^https?:\/\//i.test(sito)) sito = "https://" + sito;
  const r = { nome: testo(corpo.nome, 200), sito, settore: testo(corpo.settore, 120), descrizione: testo(corpo.descrizione, 600), stato, da: chi.email, quando: new Date().toISOString() };
  await scrivi("siti", chiave, r);
  await segna(chi.email, "azienda", { chiave, stato });
  return res.status(200).json({ ok: true, azienda: r });
}

// Legge titolo e descrizione dalla pagina di un sito, per riempire i campi
// senza chiamare Claude (costo zero).
async function aziendaLeggi(corpo, res) {
  let url = testo(corpo.url, 300);
  if (!url) return res.status(400).json({ error: "Scrivi l'indirizzo del sito." });
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  let host;
  try { host = new URL(url).hostname; } catch { return res.status(400).json({ error: "Indirizzo non valido." }); }
  if (/^(localhost|127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(host) || host.endsWith(".internal")) return res.status(400).json({ error: "Indirizzo non valido." });
  try {
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (Squadre BBS)" }, redirect: "follow", signal: AbortSignal.timeout(8000) });
    const html = (await r.text()).slice(0, 400000);
    const meta = (nome) => {
      const m = html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${nome}["'][^>]*>`, "i"));
      const c = m && m[0].match(/content=["']([^"']*)["']/i);
      return c ? c[1] : "";
    };
    const pulito = (t) => String(t || "").replace(/&amp;/g, "&").replace(/&#0?39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ").trim();
    const titolo = pulito(meta("og:site_name") || (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]);
    const descrizione = pulito(meta("description") || meta("og:description"));
    return res.status(200).json({ url: r.url || url, stato: r.status, titolo: titolo.slice(0, 200), descrizione: descrizione.slice(0, 600) });
  } catch (e) {
    return res.status(200).json({ url, errore: "Il sito non risponde (" + (e.name === "TimeoutError" ? "troppo lento" : e.message) + ")." });
  }
}

async function salvaImpostazioni(chi, corpo, res) {
  const attuali = await impostazioniGenera();
  const nuove = {
    modello: MODELLI.includes(corpo.modello) ? corpo.modello : attuali.modello,
    effort: EFFORT.includes(corpo.effort) ? corpo.effort : attuali.effort,
  };
  await scrivi("impostazioni", "genera", { ...nuove, da: chi.email, quando: new Date().toISOString() });
  await segna(chi.email, "impostazioni", nuove);
  return res.status(200).json(nuove);
}

async function statistiche(res) {
  const [profili, utenti, bachecaTutta, generazioni, registro, aziende] = await Promise.all([
    tutti("profili"), tutti("utenti"), tutti("bacheca"),
    ultimi("generazioni", 1000), eventi(1000), tutti("aziende"),
  ]);
  const nomeDi = (id) => (profili[id] && profili[id].nome) || id;
  const bacheca = Object.fromEntries(Object.entries(bachecaTutta).filter(([, i]) => !i.esempio));   // gli esempi non contano

  // Chi viene messo insieme a chi: selezioni nella generazione, squadre e
  // interessi in bacheca. Ogni coppia pesa quante volte compare.
  const coppie = {}, cercati = {};
  const contaCoppie = (ids, peso) => {
    const u = [...new Set(ids.filter(Boolean))].sort();
    for (let i = 0; i < u.length; i++) for (let j = i + 1; j < u.length; j++) {
      const k = u[i] + "|" + u[j];
      coppie[k] = (coppie[k] || 0) + peso;
    }
  };
  for (const g of generazioni) {
    const autore = utenti[g.chi] && utenti[g.chi].profilo;
    if (g.modo === "gruppo") {
      contaCoppie([autore, ...(g.persone || [])], 1);
      for (const p of g.persone || []) if (p !== autore) cercati[p] = (cercati[p] || 0) + 1;
    }
  }
  for (const i of Object.values(bacheca)) {
    contaCoppie(i.membri || [], 3);
    for (const d of i.destinatari || []) contaCoppie([i.autore, d], 2);
    for (const p of i.interessati || []) contaCoppie([i.autore, p], 1);
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
    utenti: await Promise.all(Object.values(utenti).sort((a, b) => String(b.ultimo).localeCompare(String(a.ultimo)))
      .map(async (u) => ({ ...u, profiloNome: u.profilo ? nomeDi(u.profilo) : null, crediti: await creditiDi(u.email, u) }))),
    generazioni: generazioni.map((g) => ({ ...g, personeNomi: (g.persone || []).map(nomeDi) })),
    spesa: (() => {
      const conCosto = generazioni.filter((g) => g.costo);
      const tot = conCosto.reduce((a, g) => a + (g.costo.usd || 0), 0);
      const perPersona = {};
      for (const g of conCosto) perPersona[g.autoreNome || g.chi] = (perPersona[g.autoreNome || g.chi] || 0) + g.costo.usd;
      return { totale: Math.round(tot * 100) / 100, generazioni: conCosto.length, media: conCosto.length ? Math.round((tot / conCosto.length) * 1000) / 1000 : 0,
        senzaDato: generazioni.length - conCosto.length,
        perPersona: Object.entries(perPersona).sort((a, b) => b[1] - a[1]).map(([nome, usd]) => ({ nome, usd: Math.round(usd * 100) / 100 })) };
    })(),
    bacheca: Object.values(bacheca).sort((x, y) => String(y.creata).localeCompare(String(x.creata)))
      .map((i) => ({ ...i, membriNomi: (i.membri || []).map(nomeDi), interessatiNomi: (i.interessati || []).map(nomeDi),
        destinatariNomi: (i.destinatari || []).map(nomeDi) })),
    eventi: registro.slice(0, 400),
    impostazioni: { ...(await impostazioniGenera()), modelli: MODELLI, livelli: EFFORT },
    // Costi medi per modello ed effort: proposta (passo 1) e approfondimento
    // (passo 2), per stimare quanto costeranno le prossime generazioni.
    costiMedi: (() => {
      const gruppi = {};
      for (const g of generazioni) {
        if (!g.costo) continue;
        const k = (g.modello || g.costo.modello || "?") + " · " + (g.effort || "medium") + (g.costoProposta ? "" : " · una sola passata");
        const x = gruppi[k] || (gruppi[k] = { chiave: k, generazioni: 0, proposta: 0, approfondimenti: 0, costoApprofondimenti: 0 });
        x.generazioni++;
        x.proposta += (g.costoProposta || g.costo).usd || 0;
        for (const i of g.idee || []) if (i.costoApprofondimento) { x.approfondimenti++; x.costoApprofondimenti += i.costoApprofondimento; }
      }
      return Object.values(gruppi).map((x) => ({
        chiave: x.chiave, generazioni: x.generazioni,
        mediaProposta: Math.round((x.proposta / x.generazioni) * 1000) / 1000,
        approfondimentiPerGenerazione: Math.round((x.approfondimenti / x.generazioni) * 10) / 10,
        mediaApprofondimento: x.approfondimenti ? Math.round((x.costoApprofondimenti / x.approfondimenti) * 1000) / 1000 : null,
        mediaTotale: Math.round(((x.proposta + x.costoApprofondimenti) / x.generazioni) * 1000) / 1000,
      }));
    })(),
  });
}
