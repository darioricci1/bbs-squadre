// lib/scelte.js
// VERSION: 1.0.0
// Le scelte facoltative sotto i box di generazione. Le usa il server per
// validare e scrivere il prompt, e la pagina per disegnare i pulsanti (le
// riceve con i dati).
//
// Settori: dalla classificazione per industrie di Y Combinator (la stessa
// della scheda Spunti), tradotta e raggruppata.
// Tipi di startup e punti di partenza: dalla lezione di Claudio Venezia del
// 24 settembre 2026 (scalabilita' del marketplace contro il ristorante,
// software registrato, ricerca e sviluppo; le cinque strade per trovare
// un'idea).

export const SETTORI = [
  "AI e automazione", "Fintech e pagamenti", "Assicurazioni (insurtech)", "Software per aziende (SaaS)",
  "Salute e benessere", "Biotech e farmaceutico", "Food e bevande", "Agricoltura (agritech)",
  "Energia e clima", "Mobilità e automotive", "Logistica e supply chain", "Manifattura, robotica e industria 4.0",
  "Immobiliare e costruzioni", "Formazione (edtech)", "Lavoro e risorse umane", "Legale e compliance",
  "Retail ed e-commerce", "Marketing e vendite", "Sicurezza informatica", "Sport",
  "Turismo e tempo libero", "Moda, lusso e cosmetica", "Media, contenuti e gaming", "Casa e servizi alla persona",
  "Pubblica amministrazione", "Impatto sociale e terzo settore",
];

export const TIPI = [
  ["piattaforma", "Piattaforma o marketplace", "mette in contatto domanda e offerta e cresce acquisendo utenti, come Just Eat"],
  ["saas", "Software per aziende (SaaS)", "un software in abbonamento che risolve un problema di processo alle aziende"],
  ["app", "App per consumatori", "un'app o un servizio digitale usato direttamente dalle persone"],
  ["prodotto", "Prodotto fisico con tecnologia", "un dispositivo o un prodotto innovativo, con una componente tecnologica che lo rende difendibile"],
  ["servizio", "Servizio tradizionale reso scalabile", "un business tradizionale che la tecnologia standardizza e rende replicabile"],
  ["deeptech", "Deep tech: ricerca e brevetti", "nasce da ricerca e sviluppo e da un brevetto o una tecnologia proprietaria"],
];

// le chiavi coincidono con l'enum "fonte_idea" dello schema delle idee
export const FONTI = [
  ["trend 5-10 anni", "Come cambierà un settore fra 5-10 anni"],
  ["cosa manca", "Cosa manca oggi nel mondo"],
  ["bisogno di un founder", "Un bisogno personale, anche latente"],
  ["modello estero da adattare", "Un modello estero da adattare all'Italia"],
  ["competenza del team", "Una competenza rara del gruppo"],
];

/** Le scelte del corpo, ripulite: solo valori ammessi. */
export function scelteDalCorpo(corpo) {
  const settori = [...new Set((Array.isArray(corpo.settori) ? corpo.settori : []).map(String))].filter((s) => SETTORI.includes(s)).slice(0, 3);
  const tipo = TIPI.find(([k]) => k === corpo.tipo) || null;
  const fonte = FONTI.find(([k]) => k === corpo.fonte) || null;
  return { settori, tipo, fonte };
}
