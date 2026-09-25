// lib/scelte.js
// VERSION: 1.1.0
// Le scelte facoltative sotto i box di generazione. Le usa il server per
// validare e scrivere il prompt, e la pagina per disegnare i pulsanti (le
// riceve con i dati).
//
// Settori: dieci gruppi ricavati dalla classificazione per industrie di Y
// Combinator (la stessa della scheda Spunti), tradotta e raggruppata.
// Tipi di startup e punti di partenza: dalla lezione di Claudio Venezia del
// 24 settembre 2026 (scalabilita' del marketplace contro il ristorante,
// software registrato, ricerca e sviluppo; le cinque strade per trovare
// un'idea).

export const SETTORI = [
  "AI e software", "Fintech e assicurazioni", "Salute e benessere", "Food e agricoltura", "Energia e ambiente",
  "Mobilità e automotive", "Industria e logistica", "Moda, lusso e design", "Casa ed edilizia", "Consumatori, retail e tempo libero",
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

/** Le scelte del corpo, ripulite: solo valori ammessi. Tipo di startup e
 *  punto di partenza non si chiedono piu': li sceglie Claude e li scrive
 *  nell'idea ("tipo_startup", "fonte_idea"). */
export function scelteDalCorpo(corpo) {
  const settore = SETTORI.includes(corpo.settore) ? corpo.settore : "";
  return { settori: settore ? [settore] : [], tipo: null, fonte: null };
}
