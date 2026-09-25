// lib/esperienze.js
// VERSION: 1.2.0
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
  if (!r || r.length > 80 || r.split(/\s+/).length > 11) return false;
  if (/^[•*\-–·|(]/.test(r)) return false;
  // minuscola: solo se ha la forma societaria o e' un nome breve ("effe due srl")
  const societa = /\b(srl|s\.r\.l|spa|s\.p\.a|snc|sas|srls|inc|ltd|gmbh|llc|group|gruppo)\b/i.test(r);
  if (/^[a-zà-ÿ]/.test(r) && !societa && !/\s[A-Z]/.test(r)) return false;
  // una riga con parole da ruolo e' un ruolo, non un'azienda
  if (!societa && /\b(manager|director|head of|engineer|specialist|responsabile|chief|officer|consultant|member|coordinator|analyst|responsible)\b/i.test(r)) return false;
  if (eLuogo(r)) return false;
  // una riga con una frase dentro ("2021. Launched deliveries") non e' un'azienda
  if (/[a-z0-9]{3,}\.\s+[A-Z][a-z]+\s+\S/.test(r)) return false;
  // "Ruolo | Ruolo" e "ruolo @ azienda, citta'" sono ruoli, non aziende
  if (/\s\|\s|\|$|\s@\s/.test(r)) return false;
  if (/[.:;,]$/.test(r) && !/\b(s\.p\.a|s\.r\.l|inc|ltd|co)\.$/i.test(r)) return false;
  if (PERIODO.test(r) || DURATA.test(r)) return false;
  if (/,/.test(r) && /\b(Italia|Italy|United States|Stati Uniti)[^,]*$/.test(r)) return false;   // e' un luogo
  return true;
}

// Citta' e luoghi che LinkedIn scrive sotto le date, da soli su una riga.
const CITTA = new Set(["bologna", "milano", "milan", "roma", "rome", "torino", "turin", "bergamo", "brescia", "modena", "reggio emilia", "parma",
  "piacenza", "ferrara", "ravenna", "rimini", "imola", "faenza", "forli", "forlì", "cesena", "carpi", "firenze", "florence", "padova", "verona",
  "venezia", "vicenza", "treviso", "genova", "napoli", "bari", "trento", "bolzano", "pisa", "pontedera", "london", "paris", "italy", "italia",
  "remote", "da remoto", "hybrid", "ibrido", "emea", "europe", "europa"]);
function eLuogo(r) {
  const t = String(r || "").trim();
  return CITTA.has(t.toLowerCase()) || /\([A-Z]{2}\)|\((Pi|Mo|Bo|Re|Pr|Fe|Ra|Rn|Fc|Mi|To|Bg|Bs)\)/.test(t) || /\b(Area|Metropolitan|Region)\b/.test(t)
    || (/,/.test(t) && t.split(/\s+/).length <= 6 && /\b(Italia|Italy|Emilia|Lombardia|Lombardy|Veneto|Toscana|Tuscany|Piemonte|USA|Spain|UK)\b/.test(t));
}

// Il luogo che LinkedIn mette sotto le date ("Bologna, Emilia-Romagna, Italia").
function sembraLuogo(r) {
  return r.length <= 70 && !/[.;:]$/.test(r) && r.split(/\s+/).length <= 8 && (/,/.test(r) || /\([A-Za-z]{2}\)|\b(Italia|Italy)\b/.test(r) || /^(remote|da remoto|hybrid|ibrido)$/i.test(r) || /^[A-ZÀ-Ý][\wÀ-ÿ'-]+( [A-ZÀ-Ý][\wÀ-ÿ'-]+)?$/.test(r) || /^[^A-Za-z]+$/.test(r));
}

// Una riga di periodo e' solo la data ("marzo 2017 - gennaio 2019 (1 anno
// 11 mesi)"): le righe di descrizione che cominciano con una data e
// continuano ("December 2014 - today: architetto") non contano.
const eDataSola = (r) => { const m = r.match(PERIODO); return !!m && /^\s*(\([^)]*\))?\s*$/.test(r.slice(m[0].length)); };

// Mesi di una durata scritta da LinkedIn: "4 years 10 months", "1 anno",
// "meno di un anno".
function mesi(t) {
  t = String(t || "").toLowerCase();
  if (/less than|meno di|weniger/.test(t)) return 1;
  const a = (t.match(/(\d+)\s*(years?|anni|anno|jahre?|ans?|años?)/) || [])[1] || 0;
  const m = (t.match(/(\d+)\s*(months?|mesi|mese|monate?|mois|meses?)/) || [])[1] || 0;
  return Number(a) * 12 + Number(m);
}
const mesiPeriodo = (r) => mesi((r.match(/\(([^)]*)\)/) || [])[1]);
// Il nome sopra una durata totale e' un'azienda anche se scritto minuscolo ("expert.ai").
const testaGruppo = (r) => !!r && r.length <= 80 && !eDataSola(r) && !DURATA.test(r) && !/^[•*\-–·|(]/.test(r)
  && (!/[.;:]$/.test(r) || /\b(s\.p\.a|s\.r\.l|inc|ltd|co|corp)\.$/i.test(r));

// Un ruolo scritto su due righe: la prima resta "aperta" (finisce con
// "and", "|", una virgola, una parentesi non chiusa) oppure la seconda
// comincia minuscola dopo una riga lunga.
function ruoloSpezzato(prima, ruolo) {
  if (!prima || eDataSola(prima) || DURATA.test(prima)) return false;
  if (/([,&|(]|\b(and|e|of|di|for|per|to|the|in|with|con|del|della))$/i.test(prima)) return true;
  if ((prima.match(/\(/g) || []).length > (prima.match(/\)/g) || []).length) return true;
  return /^[a-z]/.test(ruolo) && !/[.;:]$/.test(prima) && prima.split(/\s+/).length > 6;
}

// Ogni lavoro: azienda, ruolo, periodo e la descrizione scritta sotto il
// ruolo nel profilo (le righe fra il periodo e il lavoro successivo).
export function lavoriDa(testo) {
  const righe = String(testo || "").split(/\n/).map((r) => r.trim()).filter(Boolean);
  const out = [];
  // I luoghi: righe che compaiono piu' volte subito sotto una data
  // ("San Polo d'Enza"); non sono mai il nome di un'azienda.
  const dopoData = {};
  righe.forEach((r, i) => { if (i && eDataSola(righe[i - 1])) dopoData[r] = (dopoData[r] || 0) + 1; });
  const luogo = (r) => (dopoData[r] || 0) >= 2;
  // Piu' ruoli nella stessa azienda: sotto il nome c'e' la durata totale
  // ("4 years 10 months"); i ruoli seguenti restano in quell'azienda finche'
  // sopra un ruolo non compare il nome di un'altra azienda.
  let azienda = null, totale = 0, somma = 0;
  righe.forEach((r, i) => {
    if (!eDataSola(r) || i < 1) return;
    let ruolo = righe[i - 1], k = i - 2, inizio = i - 1;
    if (ruoloSpezzato(righe[k], ruolo)
      // sotto "Azienda / durata totale" il primo ruolo occupa due righe
      || (righe[k - 1] && DURATA.test(righe[k - 1]) && testaGruppo(righe[k - 2]) && !DURATA.test(righe[k]))
      // ruolo corto su due righe, con l'azienda subito sopra ("Coach to Commercial / Directors")
      || (ruolo.split(/\s+/).length === 1 && righe[k] && !sembraAzienda(righe[k]) && !/[.;:]$/.test(righe[k]) && !eDataSola(righe[k]) && !DURATA.test(righe[k]) && sembraAzienda(righe[k - 1]) && !luogo(righe[k]))) {
      ruolo = righe[k] + " " + ruolo; inizio = k; k -= 1;
    }
    const prima = righe[k];
    // una parola sola subito sotto una data, mentre i ruoli dell'azienda non
    // coprono ancora la sua durata totale, e' il luogo del ruolo di prima
    const luogoBreve = totale > 0 && somma < totale - 1 && k > 0 && eDataSola(righe[k - 1]) && /^[A-ZÀ-Ý][\wÀ-ÿ'’-]+$/.test(prima || "");
    if (prima && DURATA.test(prima) && testaGruppo(righe[k - 1])) {
      azienda = righe[k - 1]; inizio = k - 1; totale = mesi(prima); somma = 0;
    } else if (sembraAzienda(prima) && !luogo(prima) && !luogoBreve) { azienda = prima; inizio = k; totale = 0; somma = 0; }
    // sopra il ruolo c'e' un luogo o un pezzo di descrizione: stessa azienda
    else if (!azienda) return;   // descrizione o luogo sopra il ruolo: resta l'azienda di prima
    somma += mesiPeriodo(r);
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
