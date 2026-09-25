// api/spunti-tc.js
// VERSION: 1.0.1
// Le ultime notizie di TechCrunch su startup, venture capital e raccolte
// fondi, per la scheda Spunti (l'altra fonte citata da Claudio Venezia oltre
// a Y Combinator). Legge i feed RSS pubblici di TechCrunch, toglie i doppioni
// e risponde in JSON. La risposta resta nella cache di Vercel per un'ora, cosi'
// TechCrunch viene interrogato al massimo una volta l'ora qualunque sia il
// numero di visite.

const FEED = [
  ...[1, 2, 3, 4, 5].map((n) => ["https://techcrunch.com/category/startups/feed/", n]),
  ...[1, 2, 3].map((n) => ["https://techcrunch.com/category/venture/feed/", n]),
  ...[1, 2].map((n) => ["https://techcrunch.com/tag/fundraising/feed/", n]),
];

// Le promozioni degli eventi TechCrunch non sono spunti: si scartano.
const PROMO = /\b(tickets?|passes|pass\b|% off|save \$|last chance|register|webinar|StrictlyVC|exhibit|Disrupt 20\d\d)/i;

const ENTITA = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
function pulisci(t) {
  return String(t || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITA[n.toLowerCase()] ?? m)
    .replace(/\s+/g, " ").trim();
}
const campo = (xml, tag) => { const m = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`)); return m ? m[1] : ""; };

export function leggiFeed(xml) {
  return xml.split("<item>").slice(1).map((it) => ({
    titolo: pulisci(campo(it, "title")),
    link: pulisci(campo(it, "link")),
    data: (() => { const d = new Date(pulisci(campo(it, "pubDate"))); return isNaN(d) ? "" : d.toISOString(); })(),
    autore: pulisci(campo(it, "dc:creator")),
    categorie: [...new Set([...it.matchAll(/<category>([\s\S]*?)<\/category>/g)]
      .map((m) => pulisci(m[1])).filter(Boolean).map((c) => c.charAt(0).toUpperCase() + c.slice(1)))]
      .filter((c) => !["TC", "In Brief", "Exclusive"].includes(c)).slice(0, 6),
    sintesi: pulisci(campo(it, "description")).slice(0, 400),
  })).filter((x) => x.titolo && x.link && !PROMO.test(x.titolo));
}

export default async function handler(req, res) {
  const risposte = await Promise.allSettled(FEED.map(async ([url, pagina]) => {
    const r = await fetch(pagina > 1 ? `${url}?paged=${pagina}` : url, { headers: { "User-Agent": "Mozilla/5.0 (Squadre BBS)" } });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return leggiFeed(await r.text());
  }));
  const visti = new Set(), articoli = [];
  for (const r of risposte) {
    if (r.status !== "fulfilled") continue;
    for (const a of r.value) if (!visti.has(a.link)) { visti.add(a.link); articoli.push(a); }
  }
  articoli.sort((a, b) => b.data.localeCompare(a.data));
  if (!articoli.length) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(502).json({ error: "TechCrunch non risponde, riprova fra poco." });
  }
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  return res.status(200).json({ aggiornato: new Date().toISOString(), fonte: "TechCrunch (feed RSS pubblici)", articoli });
}
