// api/genera.js
// VERSION: 1.5.0
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
// Richiede ANTHROPIC_API_KEY. Il modello si cambia con BBS_MODELLO.

import Anthropic from "@anthropic-ai/sdk";
import { esigiAccesso, corpoDi, nuovoId, tutti, uno, scrivi, conta, correggi, segna, aziendaPer, creditiDi, chiaveCrediti, CREDITI_BASE, DIECI_ANNI } from "../lib/bbs.js";

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

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["idee"],
  properties: {
    idee: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["titolo", "fascia", "sintesi", "problema", "soluzione", "clienti", "modello", "settore",
          "ricavi", "perche_noi", "ruoli", "compagni", "rischi", "primo_passo", "punteggio",
          "fonte_idea", "differenziazione", "scalabilita", "replicabilita", "sostenibilita",
          "startup_innovativa", "valutazione", "criteri_startup", "punto_debole", "slide"],
        properties: {
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
        },
      },
    },
  },
};

// Le istruzioni seguono le linee guida date da Claudio Venezia (BBS) il
// 24 settembre 2026: cos'e' una startup, cosa va consegnato il 1 novembre,
// come valuta la giuria del 17 luglio.
const SISTEMA = `Sei un advisor di startup con esperienza di incubatori e venture capital. Aiuti i partecipanti dell'Executive MBA XXIV della Bologna Business School nel project work: ogni gruppo (da 5 a 8 persone) sviluppa per tutto l'anno un progetto di startup reale, che il 17 luglio presenta a una giuria di venture capitalist, business angel, imprenditori e accademici.

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

## Come trovare idee buone
Parti da una di queste domande e dichiarala in "fonte_idea": come evolvera' questo settore fra 5-10 anni e cosa servira'; cosa manca oggi; quale bisogno personale, anche latente, ha qualcuno del gruppo (molte startup nascono cosi'); quale modello che funziona all'estero (Silicon Valley, Y Combinator, TechCrunch) si puo' adattare; quale competenza rara del team apre un mercato. Le due cause principali di fallimento sono un prodotto senza un bisogno di mercato e una struttura che non si sostiene: evitale.

## I profili
Ricevi i profili delle persone: percorso professionale da LinkedIn, azienda con eventuali dati di bilancio AIDA, passioni e preferenze scritte da loro. Ogni idea deve far leva in modo concreto su competenze, settori e contatti di chi e' nel gruppo (scrivi in "perche_noi" cosa porta ciascuno) e rispettare le preferenze dichiarate (B2B/B2C, settori, cose che non vogliono fare). Niente idee generiche ("un'app con l'AI per...") senza un vantaggio specifico del team. Se nelle indicazioni c'e' uno spunto (per esempio un'azienda di Y Combinator), usalo come ispirazione da adattare al contesto italiano ed europeo, non da copiare.

## Cosa produrre
Esattamente 5 idee in italiano, dalla migliore: le prime 3 con fascia "top" (affini fra loro, pronte per il 1 novembre), le ultime 2 con fascia "riserva" (valide ma piu' deboli o piu' rischiose, anche in ambiti diversi).
- "differenziazione": come il bisogno e' risolto oggi e cosa cambia con questa idea.
- "scalabilita", "replicabilita", "sostenibilita": una o due frasi concrete ciascuna, non generiche, coerenti con i voti in "criteri_startup".
- "valutazione": da 1 a 10 come la vedrebbe la giuria su originalita', fattibilita', scalabilita' e investibilita'. Sii severo: un 8 deve essere meritato. "punteggio" e' il tuo giudizio complessivo per questo team.
- "slide": 2 o 3 slide per la consegna del 1 novembre, ciascuna con un titolo e 3-5 punti brevi (problema, soluzione, perche' questo team; niente numeri inventati).
- "ricavi": come potrebbe guadagnare, in modo plausibile, senza cifre.
- In "ruoli" assegna a ciascuna persona del gruppo un ruolo nel progetto, con il suo id. In "compagni" metti gli id di altre persone del master che rafforzerebbero l'idea, con il motivo: nel modo "scopri" da 2 a 4 persone scelte bene, nel modo "gruppo" al massimo 2 e solo se servono davvero (i gruppi sono di 5-8 persone). Usa solo id presenti nei dati.`;

function riassunto(p, aziende, lungo) {
  const az = aziendaPer(p.azienda, aziende);
  const x = p.extra || {};
  const righe = [
    `id: ${p.id}`,
    `nome: ${p.nome}`,
    p.titolo && `titolo: ${p.titolo}`,
    (p.ruolo || p.azienda) && `lavoro: ${[p.ruolo, p.azienda].filter(Boolean).join(" @ ")}`,
    az && `azienda (AIDA): ${[az.settore || az.ateco, az.fatturato && "fatturato " + az.fatturato, az.dipendenti && az.dipendenti + " dipendenti", az.citta].filter(Boolean).join(", ")}`,
    p.citta && `citta': ${p.citta}`,
    p.competenze && `competenze: ${p.competenze}`,
    lungo && p.esperienze && `esperienze: ${p.esperienze}`,
    lungo && p.formazione && `formazione: ${p.formazione}`,
    lungo && p.linkedinTesto && `dal profilo LinkedIn: ${String(p.linkedinTesto).slice(0, 3000)}`,
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

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Metodo non consentito" });
  const chi = await esigiAccesso(req, res);
  if (!chi) return;
  if (!process.env.ANTHROPIC_API_KEY) return res.status(501).json({ error: "Manca ANTHROPIC_API_KEY su Vercel." });

  const corpo = corpoDi(req);
  const modo = corpo.modo === "scopri" ? "scopri" : "gruppo";
  const note = String(corpo.note || "").slice(0, 1500);

  const u = await uno("utenti", chi.email);
  const [profili, aziende] = await Promise.all([tutti("profili"), tutti("aziende")]);
  const io = u && u.profilo && profili[u.profilo] && profili[u.profilo].email === chi.email ? profili[u.profilo] : null;
  if (!io) return res.status(400).json({ error: "Prima collega il tuo profilo (scheda Il mio profilo)." });

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
  const altri = Object.values(profili).filter((p) => !idGruppo.has(p.id));

  const testo = [
    `MODO: ${modo === "gruppo" ? "gruppo (le persone hanno gia' scelto di lavorare insieme)" : "scopri (una persona cerca idee e compagni di squadra)"}`,
    "",
    "## Gruppo",
    ...gruppo.map((p) => riassunto(p, aziende, true) + "\n"),
    "## Altri partecipanti del master",
    ...altri.map((p) => riassunto(p, aziende, false) + "\n"),
    note ? `## Indicazioni di chi chiede\n${note}` : "",
  ].join("\n");

  const client = new Anthropic();
  let risposta;
  try {
    risposta = await client.beta.messages.create({
      model: MODELLO,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      thinking: { type: "adaptive" },
      output_config: { effort: "medium", format: { type: "json_schema", schema: SCHEMA } },
      system: SISTEMA,
      messages: [{ role: "user", content: testo }],
    });
  } catch (e) {
    await restituisci();
    const stato = e instanceof Anthropic.RateLimitError ? 429 : 502;
    return res.status(stato).json({ error: "Claude non ha risposto: " + (e.message || e) });
  }
  if (risposta.stop_reason === "refusal" || risposta.stop_reason === "max_tokens") await restituisci();
  if (risposta.stop_reason === "refusal") return res.status(422).json({ error: "Claude ha rifiutato questa richiesta. Prova a cambiare le indicazioni." });
  if (risposta.stop_reason === "max_tokens") return res.status(502).json({ error: "Risposta troppo lunga e tagliata: riprova." });

  const blocco = risposta.content.find((b) => b.type === "text");
  let idee;
  try { idee = JSON.parse(blocco.text).idee; } catch { await restituisci(); return res.status(502).json({ error: "Risposta di Claude non leggibile: riprova." }); }

  const nomeDi = (id) => (profili[id] && profili[id].nome) || null;
  for (const i of idee) {
    i.ruoli = (i.ruoli || []).filter((r) => nomeDi(r.id)).map((r) => ({ ...r, nome: nomeDi(r.id) }));
    i.compagni = (i.compagni || []).filter((c) => nomeDi(c.id) && !idGruppo.has(c.id)).map((c) => ({ ...c, nome: nomeDi(c.id) }));
  }

  const costo = costoDi(risposta.model, risposta.usage);
  const g = { id: nuovoId("g"), quando: new Date().toISOString(), chi: chi.email, autore: io.id, autoreNome: io.nome, modo, persone: scelti, note, idee, modello: risposta.model, costo };
  await scrivi("generazioni", g.id, g);
  await segna(chi.email, "generazione", { modo, persone: scelti, titoli: idee.map((i) => i.titolo), usd: costo.usd });
  const perUtente = { ...g, crediti: chi.admin ? null : await creditiDi(chi.email, u) };
  if (!chi.adminVero) delete perUtente.costo;   // i costi li vede solo l'amministratore
  return res.status(200).json(perUtente);
}
