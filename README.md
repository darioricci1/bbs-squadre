# Squadre BBS

Piattaforma per formare i gruppi del project work dell'EMBA della Bologna
Business School e generare idee di startup a partire dai profili dei
partecipanti.

## Cosa fa

Chi usa la piattaforma vede due schede.

- **Bacheca** (la home). In alto i post del master: ognuno contiene da 1 a 5
  idee, scritte a mano o generate, ed e' visibile a tutti oppure solo alle
  persone scelte da chi lo pubblica. Le card sono quadrate e tutte uguali:
  se un post ha piu' idee si scorre dall'una all'altra (col dito o coi
  puntini in alto); in vista c'e' solo la frase che spiega l'idea, il resto
  nella finestra Dettagli. Con «Mi interessa» ci si candida: lo vede
  solo chi ha pubblicato l'idea (e l'amministratore), che accoglie chi vuole
  nella squadra. L'amministratore vede due esempi (una proposta a un gruppo e
  un'idea per tutti) che nessun altro vede. Le mie sono in blu, le altre in
  grigio. Le idee si generano in una finestra che sta tutta nello schermo, con tre
  box quadrati sempre aperti e tutti facoltativi: **hai un'idea?** (si puo'
  anche pubblicare cosi' com'e'), **hai compagni con cui la vorresti
  sviluppare?**, **vuoi dare piu' indicazioni all'AI?** (cursori e settore).
  Poi «Sviluppa con l'AI»: la finestra mostra solo le proposte, con un
  pulsante per tornare alle domande. Le generazioni precedenti sono in fondo
  alla bacheca, chiuse a tendina.
  Le squadre sono di 7 o 8: l'AI completa quelle piu' piccole, con una
  riga di motivo per ogni persona proposta. La squadra e' una sola per
  tutte le cinque proposte della stessa generazione. I risultati stanno in
  una schermata: cinque card affiancate, tutte selezionate all'inizio (un
  clic ne toglie una, Dettagli apre il testo intero), sotto la squadra come
  pulsanti da accendere e spegnere, poi la condivisione. Perche' nessuno resti fuori,
  l'ultimo posto di ogni squadra va a una delle persone coinvolte meno
  finora (la piu' compatibile fra loro). Comparire in una proposta generata
  vale 1 punto; essere fra i destinatari di una proposta pubblicata con i
  nomi, o nella squadra di un post, vale 3.
  Sotto i box ci sono scelte facoltative (`lib/scelte.js`): due cursori
  (B2B / indifferente / B2C; la mia competenza / decidi tu / tutto il
  gruppo), il settore da una tendina di 10 voci e un campo di testo libero.
  Il tipo di startup e la strada da cui nasce l'idea li sceglie Claude e li
  scrive su ogni idea.
  I risultati di ogni generazione: in cima **le persone** (io, chi avevo
  scelto e chi propone Claude, con ruolo, motivo e per quali idee), poi **le
  proposte** una per riga, da aprire e selezionare (fino a 5). Si condivide
  **con tutti, senza nomi**, oppure **con le persone selezionate**: chi si
  toglie non vede l'idea e sparisce anche dal testo. Un'idea scritta a mano
  si pubblica in bacheca con un clic, visibile a tutti.
  Le istruzioni a Claude (`SISTEMA` in `api/genera.js`) seguono le linee
  guida del 24 settembre 2026: startup innovativa, scalabile, replicabile e
  sostenibile, requisito di startup innovativa, criteri della giuria, 3 idee
  grezze e affini per il 1 novembre con la bozza di 2-3 slide ciascuna.
  Ogni generazione propone 5 idee brevi (3 top e 2 di riserva) e costa **1
  credito**. L'approfondimento (domande di partenza, slide) c'e' nel server
  ma per ora e' spento nella pagina (`APPROFONDISCI` in `index.html`), per
  risparmiare token.
  Ognuno ha 10 crediti (`BBS_CREDITI`), l'amministratore ne aggiunge da
  Regia. Il credito si restituisce se la generazione fallisce. Le idee
  si selezionano (da 1 a 5) e si condividono con un clic.
- **Spunti**: circa 3.500 aziende di Y Combinator (attive o acquisite dal
  2021, piu' le piu' affermate di sempre) da `public/spunti-yc.json`, ognuna
  con una riga in italiano che dice cosa fa (campo `it`, scritto da Claude una
  volta sola) e il link alla sua pagina. Settori come pillole da accendere e
  spegnere, ricerca, zona e periodo. Le notizie di TechCrunch sono nella stessa
  lista (una ogni sei card), con l'etichetta della fonte. «Usa come spunto»
  apre Genera idee con lo spunto gia' scritto in «La tua idea». «Usa come spunto» porta l'azienda nelle
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
- **Regia**: in alto, sempre aperto, quanto costa ogni generazione (tabella
  una per una con token e costo di proposta e approfondimenti, medie per
  modello ed effort, proiezione su 500 generazioni) e la scelta di modello
  (Opus 5 o Sonnet 5) ed effort. In fondo le statistiche: coppie che si formano, persone piu' cercate, settori,
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
| `AMMINISTRATORI` (o `BBS_AMMINISTRATORI`) | email di chi vede Regia, Aziende e Importa |
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
