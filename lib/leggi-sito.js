// VERSION: 1.1.0
// Quando qualcuno cambia il sito di un'azienda nelle sue esperienze, si legge
// la pagina e l'AI ne ricava settore e descrizione, cosi' i dati tornano
// coerenti col sito nuovo.
import Anthropic from "@anthropic-ai/sdk";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

// Si leggono solo siti pubblici: niente indirizzi interni (anche scritti in
// decimale o IPv6, o raggiunti con un nome DNS o un redirect).
function privato(ip) {
  if (isIP(ip) === 6) {
    const x = ip.toLowerCase();
    if (x.startsWith("::ffff:")) return privato(x.slice(7));
    return x === "::" || x === "::1" || /^(fc|fd|fe8|fe9|fea|feb)/.test(x);
  }
  const [a, b] = ip.split(".").map(Number);
  return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
}
async function controlla(url) {
  const u = new URL(url);
  if (!/^https?:$/.test(u.protocol)) throw new Error("Indirizzo non valido.");
  const host = u.hostname.replace(/^\[|\]$/g, "");
  const indirizzi = isIP(host) ? [host] : (await lookup(host, { all: true })).map((x) => x.address);
  if (!indirizzi.length || indirizzi.some(privato)) throw new Error("Indirizzo non valido.");
}

const MODELLO_SITI = process.env.BBS_MODELLO_SITI || "claude-sonnet-5";

// Titolo, descrizione e un pezzo del testo visibile della pagina.
export async function leggiPagina(indirizzo) {
  let url = String(indirizzo || "").trim();
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  let r;
  for (let salti = 0; ; salti++) {
    await controlla(url);
    r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (Squadre BBS)" }, redirect: "manual", signal: AbortSignal.timeout(8000) });
    const dove = r.status >= 300 && r.status < 400 && r.headers.get("location");
    if (!dove) break;
    if (salti >= 4) throw new Error("Troppi rimandi.");
    url = new URL(dove, url).toString();
  }
  const html = (await r.text()).slice(0, 400000);
  const pulito = (t) => String(t || "").replace(/&amp;/g, "&").replace(/&#0?39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ").trim();
  const meta = (nome) => {
    const m = html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${nome}["'][^>]*>`, "i"));
    const c = m && m[0].match(/content=["']([^"']*)["']/i);
    return c ? c[1] : "";
  };
  const corpo = html.replace(/<(script|style|noscript|svg)[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ");
  return {
    url,
    titolo: pulito(meta("og:site_name") || (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]).slice(0, 200),
    descrizione: pulito(meta("description") || meta("og:description")).slice(0, 600),
    testo: pulito(corpo).slice(0, 4000),
  };
}

const SCHEMA = {
  type: "object", additionalProperties: false, required: ["settore", "descrizione"],
  properties: {
    settore: { type: "string", description: "Il settore in poche parole, in italiano, minuscolo (es. software per la logistica)" },
    descrizione: { type: "string", description: "Una o due frasi in italiano: cosa produce o vende l'azienda, a chi (aziende o consumatori), quanto e' grande se si capisce" },
  },
};

// Settore e descrizione dell'azienda letti dal sito. Senza AI (o se l'AI non
// risponde) resta la descrizione del sito, com'e'.
export async function descriviAzienda(nome, indirizzo) {
  const pagina = await leggiPagina(indirizzo);
  if (!process.env.ANTHROPIC_API_KEY) return { settore: "", descrizione: pagina.descrizione, url: pagina.url };
  try {
    const workspace = (process.env.ANTHROPIC_WORKSPACE_ID || "").trim();
    const client = new Anthropic(workspace ? { defaultHeaders: { "anthropic-workspace-id": workspace } } : {});
    const r = await client.beta.messages.create({
      model: MODELLO_SITI,
      max_tokens: 1500,
      output_config: { effort: "low", format: { type: "json_schema", schema: SCHEMA } },
      messages: [{ role: "user", content: `Azienda: ${nome}\nSito: ${pagina.url}\nTitolo: ${pagina.titolo}\nDescrizione del sito: ${pagina.descrizione}\n\nTesto della pagina:\n${pagina.testo}\n\nDimmi il settore e cosa fa questa azienda, in italiano. Se la pagina non basta, usa quello che sai dell'azienda; non inventare numeri.` }],
    });
    const blocco = r.content.find((b) => b.type === "text");
    const j = JSON.parse(blocco.text);
    return { settore: String(j.settore || "").slice(0, 120), descrizione: String(j.descrizione || "").slice(0, 600), url: pagina.url };
  } catch {
    return { settore: "", descrizione: pagina.descrizione, url: pagina.url };
  }
}
