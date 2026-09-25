# Squadre BBS

Piattaforma per formare i gruppi del project work dell'EMBA della Bologna
Business School e generare idee di startup a partire dai profili dei
partecipanti.

## Cosa fa

Chi usa la piattaforma vede due schede.

- **Bacheca** (la home). In alto i post del master: ognuno contiene da 1 a 5
  idee, scritte a mano o generate, ed e' visibile a tutti oppure solo alle
  persone scelte da chi lo pubblica. Ci si candida con «Voglio partecipare» e
  l'autore accoglie chi vuole nella squadra. Sotto si generano le idee,
  partendo da una di tre strade:
  - **ho un'idea** e cerco le persone giuste: la scrivo, Claude la sviluppa
    (con due varianti e due alternative) e propone i compagni di strada;
  - **ho delle persone** ma non un'idea: le scelgo (elenco con caselle o
    «Sfoglia tutte le persone») e Claude genera idee compatibili;
  - **proposta completa**: Claude parte dal mio profilo e propone idee e
    squadre.
  Le squadre sono di 7 o 8: Claude completa quelle piu' piccole, con una
  riga di motivo per ogni persona proposta. Perche' nessuno resti fuori,
  l'ultimo posto di ogni squadra va a una delle persone coinvolte meno
  finora (la piu' compatibile fra loro). Comparire in una proposta generata
  vale 1 punto; essere fra i destinatari di una proposta pubblicata con i
  nomi, o nella squadra di un post, vale 3.
  Sotto i box ci sono scelte facoltative (`lib/scelte.js`): modello di
  business (B2B, B2C, indifferente), la persona del gruppo sulla cui
  competenza basare la startup (o tutte insieme), fino a 3 settori (dalla
  classificazione di Y Combinator), il tipo di startup e da dove partire
  (dalla lezione di Venezia), piu' un campo di testo libero.
  Una proposta generata si pubblica in due modi: **solo alle persone della
  proposta** (spuntate tutte, se ne tolgono o aggiungono quante si vuole,
  senza obbligo di arrivare a 7 o 8; ognuna vede perche' e' stata proposta)
  oppure **a tutto il master senza nomi** (si vede solo l'idea).
  Le istruzioni a Claude (`SISTEMA` in `api/genera.js`) seguono le linee
  guida del 24 settembre 2026: startup innovativa, scalabile, replicabile e
  sostenibile, requisito di startup innovativa, criteri della giuria, 3 idee
  grezze e affini per il 1 novembre con la bozza di 2-3 slide ciascuna.
  Ogni generazione propone 5 idee brevi (3 top e 2 di riserva) e costa **1
  credito**; su ogni idea «Approfondisci» fa scrivere a Claude domande di
  partenza, criteri spiegati e bozza delle slide (compreso nel credito).
  Ognuno ha 10 crediti (`BBS_CREDITI`), l'amministratore ne aggiunge da
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
  passioni, preferenza B2B/B2C, settori, ruolo nel team, idee, vincoli. Sotto,
  **le mie esperienze** una per una: per ogni lavoro cosa fa l'azienda
  (sito, settore, descrizione, condivisi con i colleghi che ci hanno
  lavorato) e cosa faceva la persona (dal testo del PDF), tutto modificabile.

Al primo accesso il profilo si collega da solo se il nome Google corrisponde
a un solo profilo libero; se no la prima schermata chiede «Chi sei?» con
completamento del nome. Chi sbaglia si scollega con «Questo non è il mio
profilo». Un **tutorial a fumetti** parte da solo la prima volta: i passi che
chiedono un'azione vanno avanti quando la persona la fa. Si rivede da **?**.

Solo per l'amministratore (`AMMINISTRATORI`):

- **Regia**: tutte le idee generate da tutti, chi ha scelto chi, i compagni
  suggeriti da Claude, e ogni post con chi e' stato invitato, chi e' in
  squadra e chi si e' candidato. Filtro per persona o idea.
- **Aziende**: tutte le aziende dove hanno lavorato le persone. Sito,
  settore e attivita' li ha cercati Claude una volta sola sui siti
  (`lib/siti-trovati.js`, con grado di fiducia); quelle senza sito o con un
  dubbio stanno in cima, da sistemare a mano, con «Leggi dal sito» che
  riempie la descrizione dalla pagina (senza costi). Si modificano anche le
  descrizioni dei ruoli. Le correzioni vanno nella tabella `siti`.
- **Regia → Costi e modello**: modello (Opus 5 o Sonnet 5) ed effort delle
  generazioni, con il costo medio reale di proposta e approfondimento e la
  proiezione su 500 generazioni.
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
`utenti`, `generazioni`, `siti`, `impostazioni`, `eventi` e `contatori` si creano da sole alla prima
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

La generazione lavora in due passi. Il passo 1 propone 5 idee brevi (1
credito); il passo 2 approfondisce solo le idee che qualcuno apre. Il testo
scritto da Claude e' la voce piu' cara, e cosi' si scrive per esteso solo
quello che verra' letto. Il prompt di sistema e l'elenco breve di tutti i
partecipanti sono uguali per ogni richiesta e stanno nella cache dei prompt
(chi genera entro 5 minuti da un altro paga quella parte un decimo). Le
informazioni sulle aziende si cercano una volta sola e si salvano: a ogni
generazione aggiungono poche righe di testo gia' pronte.

Modello ed effort si scelgono in Regia → Costi e modello, dove c'e' anche il
costo medio reale. `BBS_MODELLO` resta il modello di partenza se in Regia non
si e' scelto nulla.
