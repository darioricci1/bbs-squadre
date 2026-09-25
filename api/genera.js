// api/genera.js
// VERSION: 1.13.1
// Genera cinque idee di business per il project work (tre forti e due di
// riserva) partendo dai profili delle persone. Due modi:
//   modo "gruppo": io piu' le persone che ho scelto -> idee su misura per noi
//   modo "scopri": solo io -> idee su misura per me, e con chi farle
// Ogni generazione finisce nella tabella generazioni (per le statistiche).
//
// Ogni generazione costa 1 credito (vedi lib/bbs.js): il credito si prenota
// prima di chiamare Claude e si restituisce se la generazione non va a buon
// fine. L'amministratore non ha limiti.
//
// Per spendere meno:
// - l'elenco di tutti i partecipanti (in forma breve) sta nel prompt di
//   sistema, uguale per tutti, con la cache dei prompt: chi genera entro 5
//   minuti da un altro paga quella parte un decimo;
// - del gruppo si mandano le esperienze una volta sola (il testo del PDF di
//   LinkedIn solo se mancano) e tagliate a una lunghezza ragionevole;
// - Claude scrive i campi in modo asciutto.
//
// Richiede ANTHROPIC_API_KEY. Il modello si cambia con BBS_MODELLO. Se la
// chiave non appartiene a un workspace, serve anche ANTHROPIC_WORKSPACE_ID
// (l'id del workspace, dalla console Anthropic: Settings > Workspaces).

import Anthropic from "@anthropic-ai/sdk";
import { esigiAccesso, corpoDi, nuovoId, tutti, uno, scrivi, ultimi, conta, correggi, segna, aziendaPer, creditiDi, chiaveCrediti, CREDITI_BASE, DIECI_ANNI } from "../lib/bbs.js";
import { lavoriDi, presentazioneDa } from "../lib/lavori.js";
import { scelteDalCorpo, TIPI } from "../lib/scelte.js";

export const config = { maxDuration: 300 };

const MODELLO = process.env.BBS_MODELLO || "claude-opus-5";

// Prezzi di listino in dollari per milione di token (input, output). Servono
// a calcolare quanto e' costata ogni generazione, dai token che l'API stessa
// riporta nella risposta. La cache letta costa un decimo dell'input, quella
// scritta un quarto in piu'.
const PREZZI = {
  "claude-opus-5-5": [4, 20], "claude-opus-5": [5, 25], "claude-opus-4-8": [5, 25], "claude-opus-4-7": [5, 25],
  "claude-sonnet-5": [2, 10], "claude-sonnet-4-6": [3, 15], "claude-haiku-4-5": [1, 5],
  "claude-fable-5-1": [10, 50], "claude-fable-5": [10, 50],
};
function costoDi(modello, u) {
  const chiave = Object.keys(PREZZI).sort((a, b) => b.length - a.length).find((k) => String(modello || "").startsWith(k));
  const [pin, pout] = PREZZI[chiave] || PREZZI["claude-opus-5"];
  const input = Number(u && u.input_tokens) || 0, output = Number(u && u.output_tokens) || 0;
  const letta = Number(u && u.cache_read_input_tokens) || 0, scritta = Number(u && u.cache_creation_input_tokens) || 0;
  const usd = (input * pin + output * pout + letta * pin * 0.1 + scritta * pin * 1.25) / 1e6;
  return { usd: Math.round(usd * 10000) / 10000, input, output, cache: letta + scritta, modello: modello || "", listino: !!chiave };
}

// Tutti i campi di un'idea. La generazione lavora in due passi per spendere
// meno: il primo propone 5 idee in forma breve (CAMPI_BREVI), il secondo
// approfondisce solo l'idea che interessa (CAMPI_DETTAGLIO). Il testo scritto
// da Claude e' la voce piu' cara, e cosi' si scrive per esteso solo cio' che
// qualcuno leggera' davvero.
const CAMPI = {
  titolo: { type: "string" },
  fascia: { type: "string", enum: ["top", "riserva"] },
  sintesi: { type: "string" },
  problema: { type: "string" },
  soluzione: { type: "string" },
  clienti: { type: "string" },
  modello: { type: "string", enum: ["B2B", "B2C", "B2B2C"] },
  settore: { type: "string" },
  ricavi: { type: "string" },
  perche_noi: { type: "string" },
  ruoli: {
    type: "array",
    items: {
      type: "object", additionalProperties: false, required: ["id", "ruolo"],
      properties: { id: { type: "string" }, ruolo: { type: "string" } },
    },
  },
  compagni: {
    type: "array",
    items: {
      type: "object", additionalProperties: false, required: ["id", "motivo"],
      properties: { id: { type: "string" }, motivo: { type: "string" } },
    },
  },
  rischi: { type: "string" },
  primo_passo: { type: "string" },
  punteggio: { type: "integer" },
  tipo_startup: { type: "string", enum: TIPI.map(([, t]) => t) },
  fonte_idea: { type: "string", enum: ["trend 5-10 anni", "cosa manca", "bisogno di un founder", "modello estero da adattare", "competenza del team"] },
  differenziazione: { type: "string" },
  scalabilita: { type: "string" },
  replicabilita: { type: "string" },
  sostenibilita: { type: "string" },
  startup_innovativa: {
    type: "object", additionalProperties: false, required: ["requisito", "come"],
    properties: {
      requisito: { type: "string", enum: ["ricerca e sviluppo 15%", "personale qualificato", "brevetto o software registrato"] },
      come: { type: "string" },
    },
  },
  criteri_startup: {
    type: "object", additionalProperties: false, required: ["innovazione", "scalabilita", "replicabilita", "sostenibilita"],
    properties: { innovazione: { type: "integer" }, scalabilita: { type: "integer" }, replicabilita: { type: "integer" }, sostenibilita: { type: "integer" } },
  },
  punto_debole: { type: "string" },
  domande_di_partenza: {
    type: "object", additionalProperties: false, required: ["fra_5_10_anni", "cosa_manca", "bisogno_latente", "chi_lo_fa_gia"],
    properties: { fra_5_10_anni: { type: "string" }, cosa_manca: { type: "string" }, bisogno_latente: { type: "string" }, chi_lo_fa_gia: { type: "string" } },
  },
  valutazione: {
    type: "object", additionalProperties: false, required: ["originalita", "fattibilita", "scalabilita_investibilita"],
    properties: { originalita: { type: "integer" }, fattibilita: { type: "integer" }, scalabilita_investibilita: { type: "integer" } },
  },
  slide: {
    type: "array",
    items: {
      type: "object", additionalProperties: false, required: ["titolo", "punti"],
      properties: { titolo: { type: "string" }, punti: { type: "array", items: { type: "string" } } },
    },
  },
};
const CAMPI_BREVI = ["titolo", "fascia", "sintesi", "problema", "soluzione", "clienti", "modello", "settore",
  "perche_noi", "punteggio", "tipo_startup", "fonte_idea", "criteri_startup", "punto_debole"];
const CAMPI_DETTAGLIO = ["differenziazione", "ricavi", "scalabilita", "replicabilita", "sostenibilita",
  "startup_innovativa", "valutazione", "domande_di_partenza", "rischi", "primo_passo", "slide"];
const oggetto = (campi) => ({ type: "object", additionalProperties: false, required: campi, properties: Object.fromEntries(campi.map((c) => [c, CAMPI[c]])) });
// Una sola squadra per tutta la generazione, valida per ogni idea.
const SCHEMA = { type: "object", additionalProperties: false, required: ["idee", "compagni", "ruoli"],
  properties: { idee: { type: "array", items: oggetto(CAMPI_BREVI) }, compagni: CAMPI.compagni, ruoli: CAMPI.ruoli } };
const SCHEMA_DETTAGLIO = oggetto(CAMPI_DETTAGLIO);

// Le istruzioni seguono le linee guida date da Claudio Venezia (BBS) il
// 24 settembre 2026: cos'e' una startup, cosa va consegnato il 1 novembre,
// come valuta la giuria del 17 luglio.
const SISTEMA = `Sei un advisor di startup con esperienza di incubatori e venture capital. Aiuti i partecipanti dell'Executive MBA XXIV della Bologna Business School nel project work: ogni gruppo (7 o 8 persone) sviluppa per tutto l'anno un progetto di startup reale, che il 17 luglio presenta a una giuria di venture capitalist, business angel, imprenditori e accademici.

## La consegna a cui stai lavorando
Entro il 1 novembre ogni gruppo presenta 3 idee GREZZE, 2 o 3 slide ciascuna: il problema (un bisogno reale e verificabile) e l'intuizione di soluzione. Niente business plan, niente numeri inventati: quelli arrivano dopo, con l'analisi di mercato, dei concorrenti e dei clienti. La scuola sceglie poi con il gruppo l'idea a piu' alto potenziale. Le 3 idee migliori di un gruppo e' meglio che siano affini fra loro (stesso ambito o stesse competenze), cosi' il gruppo resta adatto qualunque venga scelta.

## Cosa rende un'idea una startup (e non una piccola impresa)
1. Innovazione: fa qualcosa di diverso dallo stato dell'arte. Non serve essere i primi al mondo; serve un elemento differenziante chiaro rispetto a come il bisogno e' risolto oggi. Se nessuno l'ha mai fatto, chiediti se e' perche' non funziona.
2. Scalabilita': i ricavi possono crescere molto piu' dei costi. Un ristorante che per crescere deve aprire locali e assumere non e' scalabile; un marketplace o un software, costruita la piattaforma, si'. Anche un business tradizionale puo' diventarlo se la tecnologia standardizza la produzione.
3. Replicabilita': lanciato a Bologna, si puo' portare altrove senza limiti geografici.
4. Sostenibilita' finanziaria nel lungo periodo: nel breve si puo' bruciare cassa per crescere, ma alla fine i ricavi devono superare i costi.
5. Requisito di startup innovativa (registro speciale): almeno uno fra spese di ricerca e sviluppo pari al 15% del maggiore fra costi e ricavi, un team con almeno un terzo di dottori di ricerca o due terzi di laureati magistrali, oppure un brevetto o un software registrato. Indica quello piu' plausibile e come.

## I quattro criteri sono vincolanti
Per ogni idea dai un voto da 1 a 10 a innovazione, scalabilita', replicabilita' e sostenibilita' ("criteri_startup"), con la stessa severita' di un investitore. Le 3 idee "top" devono avere almeno 6 in TUTTI e quattro: se un'idea non ci arriva, non proporla e sostituiscila con una migliore. Le 2 idee "riserva" possono avere un solo criterio sotto 6. In "punto_debole" scrivi il criterio piu' debole dell'idea e cosa servirebbe per rafforzarlo (per le top: il rischio principale su quei quattro criteri).

## Le domande di partenza (obbligatorie per ogni idea)
Claudio Venezia chiede di partire da queste domande: ogni idea deve rispondere a tutte e quattro, in modo concreto e specifico per quell'idea ("domande_di_partenza"):
- "fra_5_10_anni": come evolveranno nei prossimi 5-10 anni il bisogno e i prodotti o servizi che oggi lo risolvono, e quali nuove necessita' nasceranno attorno.
- "cosa_manca": cosa manca oggi nel mondo, o e' risolto solo in parte, che questa idea offre.
- "bisogno_latente": il bisogno personale o latente da cui nasce (se possibile di qualcuno del gruppo, osservando la vita quotidiana sua o di chi gli sta accanto) e perche' e' diffuso in una nicchia.
- "chi_lo_fa_gia": cosa si fa gia' in Silicon Valley o all'estero (startup di Y Combinator, casi visti su TechCrunch) su questo tema, e in cosa questa idea si differenzia o lo adatta all'Italia e all'Europa. Cita solo aziende che conosci davvero; se non ne conosci, dillo.

## Come trovare idee buone
Parti da una di queste domande e dichiarala in "fonte_idea": come evolvera' questo settore fra 5-10 anni e cosa servira'; cosa manca oggi; quale bisogno personale, anche latente, ha qualcuno del gruppo (molte startup nascono cosi'); quale modello che funziona all'estero (Silicon Valley, Y Combinator, TechCrunch) si puo' adattare; quale competenza rara del team apre un mercato. Le due cause principali di fallimento sono un prodotto senza un bisogno di mercato e una struttura che non si sostiene: evitale.

## I profili
Ricevi i profili delle persone: percorso professionale da LinkedIn con, per ogni azienda dove hanno lavorato, il settore e cosa fa (dal sito dell'azienda), l'azienda attuale con eventuali dati di bilancio AIDA, passioni e preferenze scritte da loro. Usa settori e aziende per capire quali mercati, clienti e processi ognuno conosce davvero. Ogni idea deve far leva in modo concreto su competenze, settori e contatti di chi e' nel gruppo (scrivi in "perche_noi" cosa porta ciascuno) e rispettare le preferenze dichiarate (B2B/B2C, settori, cose che non vogliono fare). Niente idee generiche ("un'app con l'AI per...") senza un vantaggio specifico del team. Se nelle indicazioni c'e' uno spunto (per esempio un'azienda di Y Combinator), usalo come ispirazione da adattare al contesto italiano ed europeo, non da copiare.

## Cosa produrre: due passi
Il lavoro si fa in due passi e il messaggio dice quale stai facendo.

PASSO 1, PROPOSTA. Esattamente 5 idee in italiano, dalla migliore: le prime 3 con fascia "top" (affini fra loro, pronte per il 1 novembre), le ultime 2 con fascia "riserva" (valide ma piu' deboli o piu' rischiose, anche in ambiti diversi). E' una proposta breve: ogni campo di testo in una o due frasi, senza ripetere in un campo cio' che hai gia' detto in un altro. Scegli le idee pensando gia' alle domande di partenza e ai quattro criteri, anche se i dettagli li scriverai solo al passo 2.
- "punteggio": il tuo giudizio complessivo da 1 a 10 per questo team.
- "tipo_startup": che tipo di startup e' (piattaforma o marketplace, software per aziende, app per consumatori, prodotto fisico con tecnologia, servizio tradizionale reso scalabile, deep tech); "fonte_idea": da quale delle strade per trovare idee nasce. Varia i tipi fra le idee quando ha senso.
- La squadra e' una sola per tutte e 5 le idee (vedi sotto): "compagni" e "ruoli" stanno fuori dalle idee.

PASSO 2, APPROFONDIMENTO. Ricevi una delle idee del passo 1 e scrivi i dettagli, coerenti con quello che l'idea dice gia':
- "differenziazione": come il bisogno e' risolto oggi e cosa cambia con questa idea.
- "scalabilita", "replicabilita", "sostenibilita": una o due frasi concrete ciascuna, non generiche, coerenti con i voti in "criteri_startup".
- "valutazione": da 1 a 10 come la vedrebbe la giuria su originalita', fattibilita', scalabilita' e investibilita'. Sii severo: un 8 deve essere meritato.
- "domande_di_partenza": le risposte alle quattro domande descritte sopra.
- "slide": 2 o 3 slide per la consegna del 1 novembre, ciascuna con un titolo e 3-5 punti brevi (problema, soluzione, perche' questo team; niente numeri inventati).
- "ricavi": come potrebbe guadagnare, in modo plausibile, senza cifre.
- "rischi" e "primo_passo": una o due frasi ciascuno; il primo passo deve essere concreto e fattibile in poche settimane.

## La squadra: 7 o 8 persone
I partecipanti sono circa 60 e i gruppi al massimo 8, quindi ogni squadra deve avere 7 o 8 persone. Nel messaggio trovi quante persone ha gia' il gruppo e quante ne devi proporre ("COMPAGNI DA PROPORRE"). La squadra e' UNA SOLA per tutte e 5 le idee: le stesse 7-8 persone devono poter lavorare su ognuna, quindi scegli le idee anche pensando a questa squadra. In "compagni" (fuori dalle idee) metti esattamente quel numero di persone, scelte dall'elenco del master fra chi non e' nel gruppo, per completare la squadra a 7-8: scegli chi copre le competenze che mancano (finanza, tecnologia, vendite, marketing, operations, settore) e chi ha passioni o preferenze compatibili. Per ognuno scrivi in "motivo" una riga breve (al massimo 15 parole) che dica cosa porta alla squadra, con un fatto concreto del suo profilo (un'azienda, un ruolo, una passione): la leggera' anche la persona proposta. In "ruoli" (fuori dalle idee) assegna un ruolo a ciascuna persona della squadra, gruppo compreso, con il suo id. Usa solo id presenti nei dati.`;

// Una persona in poche righe. "lungo" per chi e' nel gruppo: presentazione,
// ruoli con settore e attivita' di ogni azienda, formazione. Breve per
// l'elenco di tutti: ruolo attuale e settori dove ha lavorato.
function riassunto(p, aziende, siti, lungo) {
  const az = aziendaPer(p.azienda, aziende);
  const x = p.extra || {};
  const lavori = lavoriDi(p, siti);
  const settori = [...new Set(lavori.map((l) => l.info.settore).filter(Boolean))].slice(0, 4);
  const presentazione = presentazioneDa(p.esperienze);
  const righe = [
    `id: ${p.id}`,
    `nome: ${p.nome}`,
    p.titolo && `titolo: ${p.titolo}`,
    (p.ruolo || p.azienda) && `lavoro: ${[p.ruolo, p.azienda].filter(Boolean).join(" @ ")}`,
    az && `azienda (AIDA): ${[az.settore || az.ateco, az.fatturato && "fatturato " + az.fatturato, az.dipendenti && az.dipendenti + " dipendenti", az.citta].filter(Boolean).join(", ")}`,
    !lungo && settori.length && `settori dove ha lavorato: ${settori.join("; ")}`,
    p.citta && `citta': ${p.citta}`,
    p.competenze && `competenze: ${p.competenze}`,
    lungo && presentazione && `presentazione: ${presentazione.slice(0, 450)}`,
    // per ogni lavoro: cosa fa l'azienda e cosa faceva la persona, in breve
    lungo && lavori.length && "esperienze:\n" + lavori.slice(0, 6).map((l) => `- ${l.ruolo} @ ${l.info.nome || l.azienda} (${l.periodo.replace(/\s*\(.*\)$/, "")})` +
      (l.info.settore || l.info.descrizione ? `\n  azienda: ${[l.info.settore, l.info.descrizione].filter(Boolean).join(": ")}` : "") +
      (l.descrizioneRuolo ? `\n  ruolo: ${l.descrizioneRuolo.slice(0, 220)}` : "")).join("\n"),
    // se il PDF non si lascia leggere a ruoli, il testo cosi' com'e'
    lungo && !lavori.length && p.esperienze && `esperienze: ${String(p.esperienze).slice(0, 2500)}`,
    lungo && !p.esperienze && p.linkedinTesto && `dal profilo LinkedIn: ${String(p.linkedinTesto).slice(0, 2500)}`,
    lungo && p.formazione && `formazione: ${String(p.formazione).slice(0, 600)}`,
    x.passioni && `passioni: ${x.passioni}`,
    x.preferenza && `preferisce: ${x.preferenza}`,
    x.settori && `settori che gli interessano: ${x.settori}`,
    x.ruoloNelTeam && `ruolo che vorrebbe: ${x.ruoloNelTeam}`,
    x.cosaCerco && `cosa cerca nel progetto: ${x.cosaCerco}`,
    x.ideeMie && `idee che ha gia': ${x.ideeMie}`,
    x.nonVoglio && `non vuole: ${x.nonVoglio}`,
  ].filter(Boolean);
  return righe.join("\n");
}

// Modello ed effort li sceglie l'amministratore in Regia (tabella
// impostazioni); se non ha scelto, valgono BBS_MODELLO e "medium".
export const MODELLI = ["claude-opus-5", "claude-sonnet-5"];
export const EFFORT = ["low", "medium", "high"];
export async function impostazioniGenera() {
  const i = (await uno("impostazioni", "genera").catch(() => null)) || {};
  return {
    modello: MODELLI.includes(i.modello) ? i.modello : MODELLO,
    effort: EFFORT.includes(i.effort) ? i.effort : "medium",
  };
}

// Il prompt di sistema e l'elenco di tutti sono uguali per ogni richiesta,
// passo 1 e passo 2: stanno in cache e si pagano un decimo.
async function chiamaClaude({ modello, effort }, elenco, testo, schema) {
  const workspace = (process.env.ANTHROPIC_WORKSPACE_ID || "").trim();
  const client = new Anthropic(workspace ? { defaultHeaders: { "anthropic-workspace-id": workspace } } : {});
  const conFallback = /^claude-(opus-5|fable)/.test(modello);
  return client.beta.messages.create({
    model: modello,
    max_tokens: 16000,
    ...(conFallback ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" } : {}),
    thinking: { type: "adaptive" },
    output_config: { effort, format: { type: "json_schema", schema } },
    system: [
      { type: "text", text: SISTEMA },
      { type: "text", text: "## Elenco di tutti i partecipanti del master\n\n" + elenco, cache_control: { type: "ephemeral" } },
    ],
    messages: [{ role: "user", content: testo }],
  });
}

function erroreClaude(e) {
  if (/workspace/i.test(String(e.message))) return [502, "La chiave dell'AI su Vercel non e' legata a un workspace: crea una chiave dentro un workspace nella console Anthropic, oppure aggiungi su Vercel ANTHROPIC_WORKSPACE_ID con l'id del workspace, poi ridistribuisci."];
  return [e instanceof Anthropic.RateLimitError ? 429 : 502, "L'AI non ha risposto: " + (e.message || e)];
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Metodo non consentito" });
  const chi = await esigiAccesso(req, res);
  if (!chi) return;
  if (!process.env.ANTHROPIC_API_KEY) return res.status(501).json({ error: "Manca ANTHROPIC_API_KEY su Vercel." });

  const corpo = corpoDi(req);
  const modo = corpo.modo === "scopri" ? "scopri" : corpo.modo === "approfondisci" ? "approfondisci" : "gruppo";

  const u = await uno("utenti", chi.email);
  const [profili, aziende, siti, imp] = await Promise.all([tutti("profili"), tutti("aziende"), tutti("siti"), impostazioniGenera()]);
  const io = u && u.profilo && profili[u.profilo] && profili[u.profilo].email === chi.email ? profili[u.profilo] : null;
  if (!io) return res.status(400).json({ error: "Prima collega il tuo profilo (scheda Il mio profilo)." });
  // Elenco breve di tutti, sempre nello stesso ordine: e' la parte che va in cache.
  const elenco = Object.values(profili).sort((a, b) => a.id.localeCompare(b.id)).map((p) => riassunto(p, aziende, siti, false)).join("\n\n");
  const nomeDi = (id) => (profili[id] && profili[id].nome) || null;

  if (modo === "approfondisci") return approfondisci(chi, corpo, { profili, aziende, siti, imp, elenco }, res);

  const note = String(corpo.note || "").slice(0, 1500);
  // Motore 2: chi ha gia' un'idea la scrive, e Claude la sviluppa e cerca i
  // compagni di strada migliori per farla.
  // Anche con delle persone gia' scelte ("gruppo"). Con focus "compagni" si
  // cercano solo i compagni: una sola idea, quella scritta, e costa meno.
  const miaIdea = String(corpo.idea || "").trim().slice(0, 1500);
  const soloCompagni = !!miaIdea && corpo.focus === "compagni";
  const scelti = [...new Set((Array.isArray(corpo.persone) ? corpo.persone : []).map(String))]
    .filter((id) => id !== io.id && profili[id]).slice(0, 7);
  if (modo === "gruppo" && !scelti.length) return res.status(400).json({ error: "Scegli almeno una persona con cui lavorare." });

  let prenotato = false;
  if (!chi.admin) {
    const totale = CREDITI_BASE + Number((u && u.bonus) || 0);
    const usati = await conta(chiaveCrediti(chi.email), DIECI_ANNI);
    prenotato = true;
    if (usati > totale) {
      await correggi(chiaveCrediti(chi.email), -1);
      return res.status(402).json({ error: `Hai usato tutti i tuoi ${totale} crediti. Se te ne servono altri, chiedi a Dario.` });
    }
  }
  const restituisci = () => (prenotato ? correggi(chiaveCrediti(chi.email), -1).catch(() => {}) : null);

  const gruppo = [io, ...scelti.map((id) => profili[id])];
  const idGruppo = new Set(gruppo.map((p) => p.id));
  // Le scelte sotto i box: modello di business e la persona sulla cui
  // competenza costruire la startup (se no Claude mette insieme tutte).
  const modelloScelto = ["B2B", "B2C"].includes(corpo.modello) ? corpo.modello : "";
  // "io": la startup si basa soprattutto sulla mia competenza; "gruppo": su
  // quelle di tutti insieme; vuoto: decide Claude.
  const perno = corpo.perno === "io" ? io : idGruppo.has(String(corpo.perno || "")) ? profili[String(corpo.perno)] : null;
  const tuttoIlGruppo = corpo.perno === "gruppo";
  const { settori, tipo, fonte } = scelteDalCorpo(corpo);

  // Nessuno resta fuori: si conta quanto ogni persona e' gia' stata
  // coinvolta, e le meno coinvolte vanno a Claude come candidate per l'ultimo
  // posto di ogni squadra. Comparire in una proposta generata e rimasta li'
  // vale 1; essere scelti da qualcuno vale 1; essere fra i destinatari di una
  // proposta pubblicata con i nomi, o nella squadra di un post, vale 3.
  const esposizione = Object.fromEntries(Object.keys(profili).map((id) => [id, 0]));
  const piu = (id, n) => { if (id in esposizione) esposizione[id] += n; };
  const [storico, post] = await Promise.all([ultimi("generazioni", 1000).catch(() => []), tutti("bacheca").catch(() => ({}))]);
  for (const x of storico) {
    for (const id of x.persone || []) piu(id, 1);
    for (const i of x.idee || []) for (const c of i.compagni || []) piu(c.id, 1);
  }
  for (const i of Object.values(post)) {
    if (i.esempio) continue;
    if (i.visibilita === "scelti") for (const id of i.destinatari || []) piu(id, 3);
    for (const id of i.membri || []) if (id !== i.autore) piu(id, 3);
  }
  const pocoProposte = Object.keys(esposizione).filter((id) => !idGruppo.has(id))
    .sort((a, b) => esposizione[a] - esposizione[b] || Math.random() - 0.5).slice(0, 12);

  // Le squadre sono di 7 o 8: si propongono le persone che mancano.
  const daMin = Math.max(0, 7 - gruppo.length), daMax = Math.max(0, 8 - gruppo.length);
  const testo = [
    "PASSO 1, PROPOSTA.",
    `MODO: ${modo === "gruppo" ? "gruppo (le persone hanno gia' scelto di lavorare insieme)" : "scopri (una persona cerca idee e compagni di squadra)"}`,
    `IL GRUPPO HA GIA' ${gruppo.length} ${gruppo.length === 1 ? "PERSONA" : "PERSONE"}. COMPAGNI DA PROPORRE PER OGNI IDEA: ${daMin === daMax ? daMax : `da ${daMin} a ${daMax}`}${daMax === 0 ? " (la squadra e' gia' completa: lascia vuoto)" : ""}.`,
    "",
    "## Gruppo",
    ...gruppo.map((p) => riassunto(p, aziende, siti, true) + "\n"),
    "Gli altri partecipanti, fra cui scegliere i compagni da proporre, sono tutti quelli dell'elenco del master tranne le persone del gruppo.",
    daMax > 0 ? `\n## Chi e' stato proposto poco finora\nPerche' nessuno resti fuori dalle squadre: l'ULTIMO compagno della squadra deve essere una di queste persone, la piu' compatibile (anche se non e' perfetta, trova il ruolo in cui puo' essere utile e scrivilo nel motivo). Sono in ordine: le prime sono state proposte meno volte, a parita' di compatibilita' preferiscile.\n${pocoProposte.map((id) => `- ${id} ${profili[id].nome} (coinvolta finora: ${esposizione[id]} punti)`).join("\n")}` : "",
    note ? `## Indicazioni di chi chiede\n${note}` : "",
    modelloScelto ? `\n## Vincolo sul modello di business\nTutte e 5 le idee devono essere ${modelloScelto === "B2B" ? "B2B (clienti aziende); B2B2C va bene solo se chi paga sono le aziende" : "B2C (clienti consumatori finali); B2B2C va bene solo se il valore arriva al consumatore"}. In "modello" usa ${modelloScelto} o B2B2C.` : "",
    perno ? `\n## Su chi costruire la startup\nLe idee devono basarsi principalmente sulla competenza e sull'esperienza di ${perno.nome} (${perno.id}): il settore, i clienti o la tecnologia che conosce meglio sono il cuore del progetto, e gli altri completano cio' che manca. In "perche_noi" spiega cosa porta ${perno.nome}.` : tuttoIlGruppo ? `\n## Su chi costruire la startup\nNessuno in particolare: metti insieme le competenze di tutta la squadra${gruppo.length > 1 ? "" : " (tu e i compagni che proponi)"} e cerca le idee dove si combinano meglio.` : "",
    settori.length ? `\n## Settore\nLe idee devono stare ${settori.length === 1 ? "nel settore" : "in uno di questi settori (distribuiscile fra loro, o combinali)"}: ${settori.join("; ")}.` : "",
    tipo ? `\n## Tipo di startup\nTutte le idee devono essere di questo tipo: ${tipo[1]}, cioe' ${tipo[2]}. Tienilo coerente con scalabilita' e replicabilita'.` : "",
    fonte ? `\n## Da dove partire\nParti da questa strada per trovare le idee: ${fonte[1].toLowerCase()}. In "fonte_idea" metti "${fonte[0]}" almeno per le 3 idee top.` : "",
    miaIdea && soloCompagni ? `## L'idea che ha gia' chi chiede\n${miaIdea}\n\nQuesta persona vuole solo trovare i compagni giusti per QUESTA idea. Eccezione alla regola delle 5 idee: in "idee" metti UNA sola idea, fascia "top", che e' quella scritta, riordinata nei campi senza cambiarla. Concentrati sulla squadra: scegli chi serve davvero a realizzarla. Valutala comunque con severita' sui quattro criteri e segnala il punto debole.` : "",
    miaIdea && !soloCompagni ? `## L'idea che ha gia' chi chiede\n${miaIdea}\n\nQuesta persona ha gia' un'idea e cerca i compagni di strada migliori per realizzarla. Le 3 idee top sono questa idea sviluppata al meglio e due sue varianti vicine (un altro cliente, un altro modello di ricavo, un altro mercato); le 2 di riserva possono essere alternative diverse. Valutala con la stessa severita' sui quattro criteri: se ha un punto debole, dillo in "punto_debole" e proponi come rafforzarla. La squadra deve servire davvero a realizzarla.` : "",
  ].join("\n");

  let risposta;
  try { risposta = await chiamaClaude(imp, elenco, testo, SCHEMA); }
  catch (e) { await restituisci(); const [st, msg] = erroreClaude(e); await segna(chi.email, "errore-generazione", { errore: msg, tecnico: String(e.message || e).slice(0, 300) }); return res.status(st).json({ error: msg }); }
  if (risposta.stop_reason === "refusal" || risposta.stop_reason === "max_tokens") { await restituisci(); await segna(chi.email, "errore-generazione", { errore: risposta.stop_reason }); }
  if (risposta.stop_reason === "refusal") return res.status(422).json({ error: "L'AI ha rifiutato questa richiesta. Prova a cambiare le indicazioni." });
  if (risposta.stop_reason === "max_tokens") return res.status(502).json({ error: "Risposta troppo lunga e tagliata: riprova." });

  const blocco = risposta.content.find((b) => b.type === "text");
  let idee, uscita;
  try { uscita = JSON.parse(blocco.text); idee = uscita.idee; } catch { await restituisci(); await segna(chi.email, "errore-generazione", { errore: "risposta non leggibile" }); return res.status(502).json({ error: "Risposta dell'AI non leggibile: riprova." }); }

  // la stessa squadra vale per ogni idea (si copia in ognuna per la pagina)
  const vistiC = new Set();
  const compagni = (uscita.compagni || []).filter((c) => nomeDi(c.id) && !idGruppo.has(c.id) && !vistiC.has(c.id) && vistiC.add(c.id))
    .slice(0, daMax).map((c) => ({ ...c, nome: nomeDi(c.id) }));
  const ruoli = (uscita.ruoli || []).filter((r) => nomeDi(r.id)).map((r) => ({ ...r, nome: nomeDi(r.id) }));
  for (const i of idee) { i.compagni = compagni; i.ruoli = ruoli; }

  const costo = costoDi(risposta.model, risposta.usage);
  const g = { id: nuovoId("g"), quando: new Date().toISOString(), chi: chi.email, autore: io.id, autoreNome: io.nome, modo, persone: scelti, note, idea: miaIdea || undefined, focus: soloCompagni ? "compagni" : undefined, scelte: { modello: modelloScelto || "indifferente", perno: perno ? perno.id : null, pernoNome: perno ? perno.nome : null, gruppo: tuttoIlGruppo, settori }, idee, modello: risposta.model, effort: imp.effort, costo, costoProposta: costo };
  await scrivi("generazioni", g.id, g);
  await segna(chi.email, "generazione", { modo, persone: scelti, titoli: idee.map((i) => i.titolo), usd: costo.usd });
  const perUtente = { ...g, crediti: chi.admin ? null : await creditiDi(chi.email, u) };
  if (!chi.adminVero) { delete perUtente.costo; delete perUtente.costoProposta; }   // i costi li vede solo l'amministratore
  return res.status(200).json(perUtente);
}

// Passo 2: i dettagli di una sola idea (differenziazione, criteri spiegati,
// domande di partenza, slide...). Non costa crediti: fa parte della
// generazione. Ogni idea si approfondisce una volta, poi resta salvata.
async function approfondisci(chi, corpo, { profili, aziende, siti, imp, elenco }, res) {
  const g = await uno("generazioni", String(corpo.generazione || ""));
  if (!g || (g.chi !== chi.email && !chi.adminVero)) return res.status(404).json({ error: "Generazione non trovata." });
  const n = Number(corpo.indice);
  const idea = g.idee && g.idee[n];
  if (!idea) return res.status(404).json({ error: "Idea non trovata." });
  const pulita = (x) => { if (!chi.adminVero) { const { costo, costoProposta, ...r } = x; return r; } return x; };
  if (idea.approfondita) return res.status(200).json(pulita(g));

  const gruppo = [g.autore, ...(g.persone || [])].map((id) => profili[id]).filter(Boolean);
  const breve = Object.fromEntries(Object.entries(idea).filter(([k]) => ["titolo", "fascia", "sintesi", "problema", "soluzione", "clienti", "modello", "settore", "perche_noi", "fonte_idea", "criteri_startup", "punto_debole"].includes(k)));
  breve.ruoli = (idea.ruoli || []).map((r) => `${r.nome}: ${r.ruolo}`);
  breve.compagni_proposti = (idea.compagni || []).map((c) => `${c.nome}: ${c.motivo}`);
  const testo = [
    "PASSO 2, APPROFONDIMENTO dell'idea qui sotto.",
    "",
    // qui basta la forma breve: l'idea dice gia' chi porta cosa
    "## Gruppo",
    ...gruppo.map((p) => riassunto(p, aziende, siti, false) + "\n"),
    g.note ? `## Indicazioni di chi chiede\n${g.note}\n` : "",
    g.idea ? `## L'idea che aveva gia' chi chiede\n${g.idea}\n` : "",
    "## L'idea da approfondire",
    JSON.stringify(breve, null, 1),
  ].join("\n");

  let risposta;
  try { risposta = await chiamaClaude(imp, elenco, testo, SCHEMA_DETTAGLIO); }
  catch (e) { const [st, msg] = erroreClaude(e); return res.status(st).json({ error: msg }); }
  if (risposta.stop_reason === "refusal") return res.status(422).json({ error: "L'AI ha rifiutato questa richiesta." });
  if (risposta.stop_reason === "max_tokens") return res.status(502).json({ error: "Risposta troppo lunga e tagliata: riprova." });
  let dettagli;
  try { dettagli = JSON.parse(risposta.content.find((b) => b.type === "text").text); }
  catch { return res.status(502).json({ error: "Risposta dell'AI non leggibile: riprova." }); }

  // Si rilegge la generazione appena prima di scrivere: se nel frattempo e'
  // stata approfondita un'altra idea, non la si perde.
  const fresca = (await uno("generazioni", g.id)) || g;
  const costo = costoDi(risposta.model, risposta.usage);
  Object.assign(fresca.idee[n], dettagli, { approfondita: true, costoApprofondimento: costo.usd });
  const somma = (a, b) => Math.round(((Number(a) || 0) + (Number(b) || 0)) * 10000) / 10000;
  fresca.costo = { ...(fresca.costo || {}), usd: somma(fresca.costo && fresca.costo.usd, costo.usd),
    input: (fresca.costo?.input || 0) + costo.input, output: (fresca.costo?.output || 0) + costo.output, cache: (fresca.costo?.cache || 0) + costo.cache };
  fresca.approfondimenti = (fresca.approfondimenti || 0) + 1;
  await scrivi("generazioni", fresca.id, fresca);
  await segna(chi.email, "approfondimento", { generazione: g.id, titolo: idea.titolo, usd: costo.usd });
  return res.status(200).json(pulita(fresca));
}
