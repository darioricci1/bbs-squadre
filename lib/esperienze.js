// lib/esperienze.js
// VERSION: 1.1.0
// Legge il testo delle esperienze come esce dal PDF di LinkedIn e ne ricava
// l'elenco dei posti di lavoro: azienda, ruolo, periodo. Il formato e':
//   Azienda / Ruolo / Periodo / [Luogo]
// oppure, per piu' ruoli nella stessa azienda:
//   Azienda / Durata totale / Ruolo / Periodo / [Luogo] / Ruolo / Periodo ...

const PERIODO = /^([A-Za-zÀ-ÿ]+\.?\s+)?\d{4}\s*[-–]\s*(([A-Za-zÀ-ÿ]+\.?\s+)?\d{4}|present|presente|oggi|heute|aujourd'hui|actualidad)\b/i;
const DURATA = /^(\d+\s+[A-Za-zÀ-ÿ]+(\s+\d+\s+[A-Za-zÀ-ÿ]+)?|less than a year|meno di un anno|weniger als ein jahr)$/i;

export function chiaveAziendaNome(nome) {
  return String(nome || "").toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/\b(s\.?\s?p\.?\s?a|s\.?\s?r\.?\s?l|s\.?\s?a\.?\s?s|s\.?\s?n\.?\s?c|spa|srl|srls|gmbh|ag|inc|llc|ltd|limited|plc|group|gruppo|holding|italia|italy|s\.?\s?a)\b\.?/g, " ")
    .replace(/[^a-z0-9]+/g, " ").trim();
}

// Una riga che sembra testo descrittivo (minuscola, elenco puntato, punto
// finale, troppo lunga) non puo' essere il nome di un'azienda.
function sembraAzienda(r) {
  if (!r || r.length > 70 || r.split(/\s+/).length > 9) return false;
  if (/^[a-zà-ÿ•*\-–·|(]/.test(r)) return false;
  if (/[.:;,]$/.test(r) && !/\b(s\.p\.a|s\.r\.l|inc|ltd|co)\.$/i.test(r)) return false;
  if (PERIODO.test(r) || DURATA.test(r)) return false;
  if (/,/.test(r) && /\b(Italia|Italy|United States|Stati Uniti)[^,]*$/.test(r)) return false;   // e' un luogo
  return true;
}

// Il luogo che LinkedIn mette sotto le date ("Bologna, Emilia-Romagna, Italia").
function sembraLuogo(r) {
  return r.length <= 70 && !/[.;:]$/.test(r) && r.split(/\s+/).length <= 8 && (/,/.test(r) || /\([A-Za-z]{2}\)|\b(Italia|Italy)\b/.test(r) || /^(remote|da remoto|hybrid|ibrido)$/i.test(r) || /^[A-ZÀ-Ý][\wÀ-ÿ'-]+( [A-ZÀ-Ý][\wÀ-ÿ'-]+)?$/.test(r) || /^[^A-Za-z]+$/.test(r));
}

// Ogni lavoro: azienda, ruolo, periodo e la descrizione scritta sotto il
// ruolo nel profilo (le righe fra il periodo e il lavoro successivo).
export function lavoriDa(testo) {
  const righe = String(testo || "").split(/\n/).map((r) => r.trim()).filter(Boolean);
  const out = [];
  // piu' ruoli nella stessa azienda solo se sotto il nome c'e' la durata
  // totale ("6 years"); se no ogni ruolo e' un'azienda nuova.
  let prec = -10, azienda = null, multi = false;
  righe.forEach((r, i) => {
    if (!PERIODO.test(r) || i < 1) return;
    const ruolo = righe[i - 1];
    const prima = righe[i - 2];
    let inizio = i - 1;
    const stessa = azienda && multi && (i - 2 === prec + 1 || !sembraAzienda(prima));
    if (prima && DURATA.test(prima) && sembraAzienda(righe[i - 3])) { azienda = righe[i - 3]; inizio = i - 3; multi = true; }
    else if (stessa) { /* un altro ruolo nella stessa azienda */ }
    else if (sembraAzienda(prima)) { azienda = prima; inizio = i - 2; multi = false; }
    else if (!azienda) return;   // riga strana: resta l'azienda di prima
    prec = i;
    if (azienda && azienda.length <= 80) out.push({ azienda, ruolo, periodo: r, attuale: /present|presente|oggi|heute/i.test(r), _i: i, _inizio: inizio });
  });
  out.forEach((l, k) => {
    const fine = k + 1 < out.length ? out[k + 1]._inizio : righe.length;
    const dopo = righe.slice(l._i + 1, fine);
    if (dopo.length && sembraLuogo(dopo[0])) { l.luogo = dopo.shift(); }
    l.descrizioneRuolo = dopo.join(" ").replace(/\s+/g, " ").trim().slice(0, 1200);
    delete l._i; delete l._inizio;
  });
  return out;
}
