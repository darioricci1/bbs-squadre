// VERSION: 1.2.0
// Quando qualcuno cambia il sito di un'azienda nelle sue esperienze, si legge
// la pagina e l'AI ne ricava settore e descrizione, cosi' i dati tornano
// coerenti col sito nuovo.
import Anthropic from "@anthropic-ai/sdk";
import dns from "node:dns";
import http from "node:http";
import https from "node:https";
import { isIP } from "node:net";

// Si leggono solo siti pubblici: niente indirizzi interni, comunque scritti
// (decimale, IPv6, IPv4 dentro IPv6) o raggiunti (nome DNS, redirect).
function privato(ip) {
  ip = String(ip || "").toLowerCase().replace(/^\[|\]$/g, "");
  if (isIP(ip) === 6) {
    const m4 = ip.match(/^(?:0*:)*:?ffff:(\d+\.\d+\.\d+\.\d+)$/) || ip.match(/^::(\d+\.\d+\.\d+\.\d+)$/);
    if (m4) return privato(m4[1]);
    const mh = ip.match(/^(?:0*:)*:?ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
    if (mh) { const a = parseInt(mh[1], 16), b = parseInt(mh[2], 16); return privato(`${a >> 8}.${a & 255}.${b >> 8}.${b & 255}`); }
    return ip === "::" || ip === "::1" || /^(fc|fd|fe[89ab]|ff)/.test(ip) || ip.startsWith("64:ff9b:") || ip.startsWith("::ffff:");
  }
  if (isIP(ip) !== 4) return true;
  const [a, b] = ip.split(".").map(Number);
  return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
}
// La risoluzione del nome si controlla quando ci si collega davvero: cosi'
// un DNS che cambia risposta fra il controllo e la connessione non passa.
function cercaSicuro(host, opz, cb) {
  if (typeof opz === "function") { cb = opz; opz = {}; }
  dns.lookup(host, { ...opz, all: true }, (err, lista) => {
    if (err) return cb(err);
    if (!lista.length || lista.some((x) => privato(x.address))) return cb(new Error("Indirizzo non valido."));
    if (opz.all) return cb(null, lista);
    cb(null, lista[0].address, lista[0].family);
  });
}
function scarica(url) {
  return new Promise((ok, ko) => {
    const u = new URL(url);
    if (!/^https?:$/.test(u.protocol)) return ko(new Error("Indirizzo non valido."));
    const host = u.hostname.replace(/^\[|\]$/g, "");
    if (isIP(host) && privato(host)) return ko(new Error("Indirizzo non valido."));
    const req = (u.protocol === "https:" ? https : http).get(u, { lookup: cercaSicuro, headers: { "User-Agent": "Mozilla/5.0 (Squadre BBS)" }, timeout: 8000 }, (r) => {
      const pezzi = []; let n = 0;
      r.on("data", (c) => { n += c.length; if (n <= 400000) pezzi.push(c); else r.destroy(); });
      r.on("close", () => ok({ status: r.statusCode, location: r.headers.location, html: Buffer.concat(pezzi).toString("utf8") }));
      r.on("error", ko);
    });
    req.on("timeout", () => req.destroy(Object.assign(new Error("troppo lento"), { name: "TimeoutError" })));
    req.on("error", ko);
  });
}

// Titolo, descrizione e un pezzo del testo visibile della pagina.
export async function leggiPagina(indirizzo) {
  let url = String(indirizzo || "").trim();
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  let r;
  for (let salti = 0; ; salti++) {
    r = await scarica(url);
    const dove = r.status >= 300 && r.status < 400 && r.location;
    if (!dove) break;
    if (salti >= 4) throw new Error("Troppi rimandi.");
    url = new URL(dove, url).toString();
  }
  const html = r.html;
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
