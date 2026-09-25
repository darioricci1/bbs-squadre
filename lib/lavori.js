// lib/lavori.js
// VERSION: 1.2.0
// Le aziende dove ha lavorato ogni persona, con sito, settore e cosa fanno.
// Due fonti, la seconda vince sulla prima:
//   - lib/siti-trovati.js: la ricerca automatica fatta una volta sola sui
//     siti delle aziende (con un grado di fiducia);
//   - la tabella "siti": le correzioni fatte a mano dall'amministratore
//     nella sezione Aziende.
// Per ogni lavoro ci sono due descrizioni: cosa fa l'azienda e cosa faceva la
// persona (dal testo sotto il ruolo nel PDF). Tutte e due si modificano dal
// profilo e restano della persona (profilo.lavoriMiei): se due persone hanno
// lavorato nella stessa azienda, le correzioni di una non toccano l'altra.
// La base comune e' la tabella siti, che corregge l'amministratore.
// Cosi' la generazione delle idee non deve cercare nulla: legge una riga
// gia' pronta per azienda, e costa pochi token in piu'.

import { SITI_TROVATI } from "./siti-trovati.js";
import { lavoriDa, chiaveAziendaNome } from "./esperienze.js";

export { chiaveAziendaNome };

// stato: verificata (a mano), trovata (automatica e sicura), dubbio,
// mancante (nessun sito), ignorata (non e' un'azienda: rumore del PDF)
export function infoAzienda(chiave, nome, siti) {
  const auto = SITI_TROVATI[chiave] || null;
  const mano = siti && siti[chiave];
  if (mano) return { ...(auto || {}), ...mano, stato: mano.stato || "verificata" };
  if (!auto) return { nome, stato: "mancante" };
  const stato = auto.tipo === "non_azienda" ? "ignorata" : !auto.sito && auto.tipo !== "libero_professionista" ? "mancante"
    : auto.fiducia === "alta" ? "trovata" : "dubbio";
  return { ...auto, stato };
}

/** Chiave di un lavoro dentro un profilo: azienda + ruolo. */
export const idLavoro = (chiave, ruolo) => chiave + "|" + chiaveAziendaNome(ruolo);

export function lavoriDi(p, siti) {
  const miei = p.lavoriMiei || {};
  return lavoriDa(p.esperienze).map((l) => {
    const chiave = chiaveAziendaNome(l.azienda);
    const id = idLavoro(chiave, l.ruolo);
    const mio = miei[id];
    const base = infoAzienda(chiave, l.azienda, siti);
    const info = mio && mio.azienda ? { ...base, ...mio.azienda, stato: base.stato === "ignorata" ? "ignorata" : "verificata" } : base;
    return { ...l, id, chiave, descrizioneRuolo: mio && typeof mio.descrizioneRuolo === "string" ? mio.descrizioneRuolo : l.descrizioneRuolo, info };
  }).filter((l) => l.chiave && l.info.stato !== "ignorata");
}

/** Versione leggera per il sito: cosa serve per mostrare e modificare il profilo. */
export function lavoriPubblici(p, siti) {
  return lavoriDi(p, siti).map((l) => ({
    id: l.id, chiave: l.chiave, azienda: l.info.nome || l.azienda, ruolo: l.ruolo, periodo: l.periodo, attuale: l.attuale,
    luogo: l.luogo || "", descrizioneRuolo: l.descrizioneRuolo || "",
    sito: l.info.sito || "", settore: l.info.settore || "", descrizioneAzienda: l.info.descrizione || "", stato: l.info.stato,
  }));
}

/** La presentazione in cima al PDF di LinkedIn (il riassunto della persona). */
export function presentazioneDa(testo) {
  const primo = String(testo || "").split(/\n\s*\n/)[0].trim();
  return primo.length > 60 && !/\n/.test(primo.slice(0, 200)) ? primo : "";
}
