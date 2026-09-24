// api/genera.js
// VERSION: 1.2.0
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
          "ricavi", "perche_noi", "ruoli", "compagni", "rischi", "primo_passo", "punteggio"],
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
        },
      },
    },
  },
};

const SISTEMA = `Sei un advisor di startup che aiuta i partecipanti di un Executive MBA della Bologna Business School a preparare il project work: il gruppo deve proporre idee di startup.

Ricevi i profili delle persone (percorso professionale da LinkedIn, azienda con eventuali dati di bilancio AIDA, passioni e preferenze che hanno scritto loro). Proponi esattamente 5 idee in italiano, ordinate dalla migliore: le prime 3 con fascia "top", le ultime 2 con fascia "riserva" (valide ma piu' deboli o piu' rischiose).

Ogni idea deve:
- far leva in modo concreto sulle competenze, sui settori e sui contatti delle persone coinvolte (cita cosa porta ciascuno in "perche_noi");
- rispettare le preferenze dichiarate (B2B/B2C, settori, cose che non vogliono fare) quando ci sono;
- essere realistica per un project work: un problema verificabile, un cliente identificabile, un modo plausibile di fare ricavi;
- evitare idee generiche ("app che usa l'AI per...") senza un vantaggio specifico del team.

In "ruoli" assegna a ciascuna persona del gruppo un ruolo nel progetto, usando il suo id. In "compagni" metti gli id di altre persone del master (dall'elenco "altri partecipanti") che rafforzerebbero l'idea, con il motivo; nel modo "scopri" qui vanno da 2 a 4 persone scelte bene, nel modo "gruppo" al massimo 2, e solo se servono davvero. Usa solo id presenti nei dati. "punteggio" va da 1 a 10 ed e' la tua stima di quanto l'idea e' forte per questo team.`;

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

  const g = { id: nuovoId("g"), quando: new Date().toISOString(), chi: chi.email, autore: io.id, autoreNome: io.nome, modo, persone: scelti, note, idee, modello: risposta.model };
  await scrivi("generazioni", g.id, g);
  await segna(chi.email, "generazione", { modo, persone: scelti, titoli: idee.map((i) => i.titolo) });
  return res.status(200).json({ ...g, crediti: chi.admin ? null : await creditiDi(chi.email, u) });
}
