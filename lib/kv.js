// lib/kv.js
// VERSION: 1.0.1
// L'archivio chiave-valore (Upstash, lo stesso collegato a mappakit), parlato
// direttamente via REST con fetch: nessuna dipendenza da installare, e gira
// uguale nelle funzioni e sull'Edge. Le chiavi di questo sito stanno tutte
// sotto il prefisso "bbs:" (squadre del master), cosi' non si pestano con
// quelle di mappakit e della mappa del vino.

export function ceArchivio() {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

/** Manda piu' comandi in un viaggio solo. Torna l'array dei risultati. */
export async function comandi(lista) {
  if (!ceArchivio() || !lista.length) return [];
  const r = await fetch(process.env.KV_REST_API_URL.replace(/\/+$/, "") + "/pipeline", {
    method: "POST",
    headers: { Authorization: "Bearer " + process.env.KV_REST_API_TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify(lista.map((c) => c.map((v) => (typeof v === "string" ? v : JSON.stringify(v))))),
  });
  if (!r.ok) throw new Error("Archivio KV: HTTP " + r.status);
  const j = await r.json();
  return j.map((x) => (x && "result" in x ? x.result : null));
}

export async function comando(...c) {
  const [r] = await comandi([c]);
  return r;
}

/** Un hash letto da Redis arriva come [campo, valore, campo, valore…]. */
export function hashInOggetto(arr) {
  if (!Array.isArray(arr)) return arr && typeof arr === "object" ? arr : null;
  const o = {};
  for (let i = 0; i + 1 < arr.length; i += 2) o[arr[i]] = arr[i + 1];
  return o;
}
