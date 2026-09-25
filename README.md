# Squadre BBS

Piattaforma per formare i gruppi del project work dell'EMBA della Bologna
Business School e generare idee di startup a partire dai profili dei
partecipanti.

## Cosa fa

Chi usa la piattaforma vede due schede.

- **Bacheca** (la home). In alto i post del master: ognuno contiene da 1 a 5
  idee, scritte a mano o generate, ed e' visibile a tutti oppure solo alle
  persone scelte da chi lo pubblica. Ci si candida con «Voglio partecipare» e
  l'autore accoglie chi vuole nella squadra. Sotto ci sono i due motori:
  - **motore 1**: idee per me e le persone che scelgo (campo con
    completamento del nome, oppure «Sfoglia tutte le persone»);
  - **motore 2**: idee per me, con i compagni suggeriti da Claude.
  Le istruzioni a Claude (`SISTEMA` in `api/genera.js`) seguono le linee
  guida del 24 settembre 2026: startup innovativa, scalabile, replicabile e
  sostenibile, requisito di startup innovativa, criteri della giuria, 3 idee
  grezze e affini per il 1 novembre con la bozza di 2-3 slide ciascuna.
  Ogni generazione propone 5 idee (3 top e 2 di riserva) e costa **1
  credito**: ognuno ne ha 10 (`BBS_CREDITI`), l'amministratore ne aggiunge da
  Statistiche. Il credito si restituisce se la generazione fallisce. Le idee
  si selezionano (da 1 a 5) e si condividono con un clic.
- **Spunti**: circa 3.500 aziende di Y Combinator (attive o acquisite dal
  2021, piu' le piu' affermate di sempre) da `public/spunti-yc.json`, con
  ricerca, settore, zona e periodo. «Usa come spunto» porta l'azienda nelle
  indicazioni del generatore. Il file viene dalla directory pubblica di YC
  tramite yc-oss/api; si rigenera con lo stesso filtro quando serve.
  Accanto c'e' **TechCrunch**: le ultime notizie su startup, venture e
  raccolte fondi dai feed RSS pubblici (`api/spunti-tc.js`, in cache per
  un'ora), con ricerca e filtro per tema; anche qui «Usa come spunto».
- **Il mio profilo**: dati LinkedIn (anche dal PDF «Salva come PDF») piu'
  passioni, preferenza B2B/B2C, settori, ruolo nel team, idee, vincoli.

Al primo accesso il profilo si collega da solo se il nome Google corrisponde
a un solo profilo libero; se no la prima schermata chiede «Chi sei?» con
completamento del nome. Chi sbaglia si scollega con «Questo non è il mio
profilo». Un **tutorial a fumetti** parte da solo la prima volta: i passi che
chiedono un'azione vanno avanti quando la persona la fa. Si rivede da **?**.

Solo per l'amministratore (`AMMINISTRATORI`):

- **Regia**: tutte le idee generate da tutti, chi ha scelto chi, i compagni
  suggeriti da Claude, e ogni post con chi e' stato invitato, chi e' in
  squadra e chi si e' candidato. Filtro per persona o idea.
- **Statistiche**: coppie che si formano, persone piu' cercate, settori,
  B2B/B2C, accessi, crediti per persona (con «+5 crediti»), registro,
  esportazione CSV e JSON.
- **Importa** (non e' nel menu, si apre da `/#importa`): profili da CSV, JSON
  o PDF di LinkedIn, aziende da AIDA.
- **Vedi come utente**: pulsante in alto per usare la piattaforma come un
  collega qualsiasi (niente Regia, bacheca e crediti come i loro). Il server
  lo sa dall'intestazione `x-bbs-come-utente`, che puo' solo togliere
  permessi.

## Struttura

```
public/index.html   l'applicazione (una pagina)
public/vendor/      pdf.js (Mozilla, licenza Apache 2.0) per leggere i PDF di LinkedIn
api/bbs.js          accesso, profili, bacheca, import, statistiche (?a=...)
api/genera.js       generazione delle idee con Claude
lib/                accesso Google, cookie firmato, database Neon, funzioni comuni
```

I dati stanno su Postgres (Neon): le tabelle `profili`, `aziende`, `bacheca`,
`utenti`, `generazioni`, `eventi` e `contatori` si creano da sole alla prima
richiesta (vedi `lib/db.js`). Nel repo, che è pubblico, non c'è nessun dato
delle persone. Le funzioni girano a Francoforte (`vercel.json`), vicino al
database.

## Variabili d'ambiente su Vercel

| Variabile | A cosa serve |
|---|---|
| `GOOGLE_CLIENT_ID_ACCESSO` (o `GOOGLE_CLIENT_ID`) | client OAuth per il pulsante Google; nel client va aggiunta l'origine del sito |
| `SESSIONE_SEGRETO` | segreto per firmare il cookie (almeno 16 caratteri) |
| `DATABASE_URL` (o `POSTGRES_URL`) | database Neon; la mette Vercel quando colleghi il database al progetto |
| `ANTHROPIC_API_KEY` | generazione delle idee |
| `ANTHROPIC_WORKSPACE_ID` | solo se la chiave non appartiene a un workspace (id `wrkspc_…` dalla console Anthropic) |
| `AMMINISTRATORI` (o `BBS_AMMINISTRATORI`) | email di chi vede Statistiche e Importa |
| `BBS_DOMINI`, `BBS_INVITATI` | facoltative: limitano l'accesso a certi domini o a un elenco di email; senza, entra qualunque account Google |
| `BBS_MODELLO` | facoltativa, modello Claude (predefinito `claude-opus-5`) |
| `BBS_CREDITI` | facoltativa, crediti di partenza per persona (predefinito 10) |

## Formato dell'import profili

CSV con intestazioni come `nome;email;linkedin;titolo;azienda;ruolo;citta;esperienze;formazione;competenze`
(le intestazioni in inglese dell'export di LinkedIn vengono riconosciute).
Se c'è l'email, al primo accesso con quell'account il profilo si collega da solo.

## Costi delle generazioni

Ogni generazione chiama Claude una volta; il costo si legge in Regia. Per
tenerlo basso: l'elenco breve di tutti i partecipanti sta nel prompt di
sistema con la cache dei prompt (chi genera entro 5 minuti da un altro paga
quella parte un decimo), del gruppo si mandano le esperienze una volta sola e
tagliate, e Claude scrive i campi in modo asciutto. La voce che pesa di piu'
e' il testo scritto da Claude: per risparmiare ancora si puo' mettere
`BBS_MODELLO=claude-sonnet-5` su Vercel (circa il 60% in meno a token).
