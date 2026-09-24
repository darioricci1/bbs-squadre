# Squadre BBS

Piattaforma per formare i gruppi del project work dell'EMBA della Bologna
Business School e generare idee di startup a partire dai profili dei
partecipanti.

## Cosa fa

- **Accesso con Google.** Ognuno entra con il proprio account e collega il suo
  profilo (quello importato dal LinkedIn, con «Sono io») oppure ne crea uno.
- **Il mio profilo.** Dati LinkedIn più quello che la persona aggiunge:
  passioni, preferenza B2B/B2C, settori, ruolo che vorrebbe, idee che ha già,
  cose che non vuole fare, disponibilità. Può incollare il testo del proprio
  profilo LinkedIn (Salva come PDF, poi copia) per dare più contesto.
- **Persone.** Tutti i profili, con ricerca libera (nome, azienda, settore,
  passione) e i dati AIDA dell'azienda quando ci sono. Da qui si sceglie il
  gruppo.
- **Genera idee.** Claude propone 5 idee (3 top e 2 di riserva) in due modi:
  per me più le persone scelte, oppure solo per me con i compagni suggeriti.
  Ogni idea ha problema, soluzione, clienti, ricavi, perché questo team, ruoli,
  rischi e primo passo, e si pubblica in bacheca con un clic.
- **Bacheca.** Chiunque pubblica un'idea e dice chi cerca; gli altri si
  candidano, l'autore accoglie chi vuole nella squadra.
- **Statistiche e Importa** (solo amministratori; Importa non è nel menu, si apre da `/#importa`): chi si mette con chi,
  persone più cercate, settori e B2B/B2C delle idee, tutte le idee generate, la
  bacheca, gli accessi, il registro completo, esportazione JSON. Import dei
  profili (CSV o JSON, oppure molti PDF di LinkedIn insieme) e delle aziende
  esportate da AIDA (CSV).

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
| `AMMINISTRATORI` (o `BBS_AMMINISTRATORI`) | email di chi vede Statistiche e Importa |
| `BBS_DOMINI`, `BBS_INVITATI` | facoltative: limitano l'accesso a certi domini o a un elenco di email; senza, entra qualunque account Google |
| `BBS_MODELLO` | facoltativa, modello Claude (predefinito `claude-opus-5`) |
| `BBS_TETTO_GIORNO` | facoltativa, generazioni al giorno per persona (predefinito 15) |

## Formato dell'import profili

CSV con intestazioni come `nome;email;linkedin;titolo;azienda;ruolo;citta;esperienze;formazione;competenze`
(le intestazioni in inglese dell'export di LinkedIn vengono riconosciute).
Se c'è l'email, al primo accesso con quell'account il profilo si collega da solo.
