// lib/siti-trovati.js
// VERSION: 1.0.0
// Ricerca automatica (25 settembre 2026) del sito, del settore e dell'attivita'
// delle aziende dove hanno lavorato le persone, dai profili LinkedIn.
// Chiave = nome normalizzato (lib/esperienze.js). Le correzioni fatte a mano
// in Aziende stanno nella tabella siti e vincono su questi dati.
// fiducia: alta (sito aperto e coerente), media, bassa.

export const SITI_TROVATI = {
 "alluflon": {
  "nome": "Alluflon S.p.A.",
  "sito": "https://www.alluflon.com/",
  "settore": "pentolame antiaderente casalinghi",
  "descrizione": "Azienda italiana (Mondavio, PU) produttrice di pentole e padelle antiaderenti Made in Italy, B2C, esportate in oltre 50 paesi.",
  "sede": "Mondavio (PU), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "piaggio": {
  "nome": "Piaggio Group",
  "sito": "https://www.piaggiogroup.com/",
  "settore": "motocicli e veicoli leggeri",
  "descrizione": "Gruppo industriale italiano produttore di scooter, moto e veicoli commerciali leggeri (Piaggio, Vespa, Aprilia, Moto Guzzi), quotato in borsa.",
  "sede": "Pontedera (PI), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "piaggio c": {
  "nome": "Piaggio & C. S.p.A.",
  "sito": "https://www.piaggiogroup.com/",
  "settore": "motocicli e veicoli leggeri",
  "descrizione": "Ragione sociale della capogruppo del Gruppo Piaggio, stesso gruppo industriale del produttore di scooter e moto.",
  "sede": "Pontedera (PI), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": "Stessa realtà di 'Piaggio Group', ragione sociale completa"
 },
 "ducati motor": {
  "nome": "Ducati Motor Holding S.p.A.",
  "sito": "https://www.ducati.com/",
  "settore": "motociclette sportive",
  "descrizione": "Produttore italiano di motociclette sportive e da corsa di alta gamma, controllato dal gruppo Volkswagen/Audi, B2C.",
  "sede": "Bologna, Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "nlmk": {
  "nome": "NLMK Group",
  "sito": "https://nlmk.com/en/",
  "settore": "produzione siderurgica",
  "descrizione": "Gruppo siderurgico internazionale (russo, con stabilimenti in Europa e USA) produttore di acciaio e prodotti laminati, B2B.",
  "sede": "Lipetsk, Russia (sede legale gruppo)",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "vr": {
  "nome": "VR Group",
  "sito": "",
  "settore": "ingegneria/formatura metalli (non verificato)",
  "descrizione": "Non identificata con certezza: dal ruolo della persona (Forming Process Engineer R&D, settore siderurgico/automotive) potrebbe trattarsi di un gruppo industriale attivo nella formatura dei metalli.",
  "sede": "",
  "fiducia": "bassa",
  "tipo": "azienda",
  "nota": "Nome troppo generico ('VR Group'); nessuna azienda trovata con certezza che combaci col profilo (steel/automotive forming) del collega di NLMK; sito lasciato vuoto"
 },
 "hoerbiger": {
  "nome": "HOERBIGER Holding AG",
  "sito": "https://www.hoerbiger.com/",
  "settore": "componenti industriali e automotive",
  "descrizione": "Gruppo tecnologico svizzero-austriaco B2B, produce componenti per compressori, gas, motori e sistemi idraulici per veicoli.",
  "sede": "Zugo, Svizzera",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "volkswagen": {
  "nome": "Volkswagen Group Italia S.p.A.",
  "sito": "https://www.volkswagengroupitalia.it/",
  "settore": "importazione e distribuzione auto",
  "descrizione": "Filiale italiana del gruppo automobilistico tedesco Volkswagen, distribuisce i marchi del gruppo sul mercato italiano, B2B/B2C.",
  "sede": "Verona, Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "universita cattolica del sacro cuore": {
  "nome": "Università Cattolica del Sacro Cuore",
  "sito": "https://www.unicatt.it/",
  "settore": "istruzione universitaria",
  "descrizione": "La più grande università privata italiana, con più campus, offre corsi di laurea e ricerca in numerose discipline.",
  "sede": "Milano (sede centrale), Italia",
  "fiducia": "alta",
  "tipo": "universita_ente",
  "nota": ""
 },
 "bologna business school": {
  "nome": "Bologna Business School",
  "sito": "https://www.bbs.unibo.it/",
  "settore": "formazione manageriale ed executive",
  "descrizione": "Business school dell'Università di Bologna che eroga MBA, executive MBA e master post-laurea per manager e professionisti.",
  "sede": "Bologna, Italia",
  "fiducia": "alta",
  "tipo": "universita_ente",
  "nota": ""
 },
 "nova": {
  "nome": "Nova",
  "sito": "",
  "settore": "non identificato con certezza",
  "descrizione": "Non identificato con certezza: potrebbe trattarsi di una community/associazione di innovazione di cui le persone risultano 'membro' e 'membro e mentor', non un'azienda tradizionale.",
  "sede": "",
  "fiducia": "bassa",
  "tipo": "non_azienda",
  "nota": "Nome troppo generico; ruoli 'Member' e 'Member & Mentor' suggeriscono un network/community più che un datore di lavoro; nessuna corrispondenza certa trovata"
 },
 "associazione italiana per l intelligenza artificiale": {
  "nome": "Associazione Italiana per l'Intelligenza Artificiale (AIxIA)",
  "sito": "https://aixia.it/",
  "settore": "associazione scientifica IA",
  "descrizione": "Associazione scientifica no-profit italiana, fondata nel 1988, che riunisce accademici e ricercatori di intelligenza artificiale.",
  "sede": "Italia",
  "fiducia": "media",
  "tipo": "universita_ente",
  "nota": "Ruolo indicato è 'Member', coerente con un'associazione più che un datore di lavoro"
 },
 "villanova ai": {
  "nome": "Villanova.Ai S.p.A.",
  "sito": "https://villanova.ai/",
  "settore": "intelligenza artificiale generativa",
  "descrizione": "Società italiana nata nel 2025 da Tiscali ed Expert.ai per sviluppare modelli di IA generativa multilingue per PA e imprese, B2B.",
  "sede": "Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "expert system": {
  "nome": "Expert System S.p.A. (oggi Expert.ai)",
  "sito": "https://www.expert.ai/",
  "settore": "software di intelligenza artificiale semantica",
  "descrizione": "Software house italiana (Modena, 1989) specializzata in AI del linguaggio e analisi semantica di testi per aziende e PA, B2B.",
  "sede": "Modena, Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": "Il marchio/società è oggi noto come Expert.ai"
 },
 "telecom": {
  "nome": "TIM S.p.A. (già Telecom Italia)",
  "sito": "https://www.gruppotim.it/",
  "settore": "telecomunicazioni",
  "descrizione": "Principale operatore di telecomunicazioni italiano, fornisce rete fissa, mobile e servizi digitali a privati e imprese.",
  "sede": "Roma, Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": "Ruoli storici presso il centro ricerche TILAB, all'epoca Telecom Italia"
 },
 "apcoa": {
  "nome": "APCOA Italia S.p.A.",
  "sito": "https://www.apcoa.it/",
  "settore": "gestione parcheggi",
  "descrizione": "Principale operatore italiano/europeo di parcheggi (aeroporti, città, fiere), gestisce oltre 250 strutture in Italia, B2C/B2B.",
  "sede": "Mantova, Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "park control": {
  "nome": "Park&Control Italia",
  "sito": "https://www.park-control.it/",
  "settore": "gestione digitale parcheggi privati",
  "descrizione": "Società del gruppo APCOA specializzata nel controllo della sosta con targhe (ANPR) per centri commerciali e condomini, B2B.",
  "sede": "Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": "Controllata del Gruppo APCOA"
 },
 "lebez": {
  "nome": "Lebez S.p.A.",
  "sito": "https://www.lebez.com/",
  "settore": "distribuzione cartoleria e cancelleria",
  "descrizione": "Azienda di Correggio (RE), dal 1959, grossista B2B di articoli di cartoleria e cancelleria rivenduti a negozi specializzati in Italia.",
  "sede": "Correggio (RE), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "laborchimica": {
  "nome": "Laborchimica (Prato)",
  "sito": "",
  "settore": "commercio prodotti chimici",
  "descrizione": "Piccola impresa di Prato attiva nel commercio di prodotti chimici, di cui la persona risulta amministratore delegato/socio unico.",
  "sede": "Prato, Italia",
  "fiducia": "bassa",
  "tipo": "azienda",
  "nota": "Esiste un'altra società quasi omonima 'Laborchimica Srl' a Campi Bisenzio (FI) non collegata alla persona; non trovato un sito proprio verificabile per l'entità di Prato"
 },
 "findomestic banca": {
  "nome": "Findomestic Banca S.p.A.",
  "sito": "https://www.findomestic.it/",
  "settore": "credito al consumo",
  "descrizione": "Banca italiana specializzata in credito al consumo e prestiti personali, parte del gruppo BNP Paribas, B2C.",
  "sede": "Firenze, Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "clai": {
  "nome": "Gruppo CLAI",
  "sito": "https://www.clai.it/",
  "settore": "salumi e carni fresche",
  "descrizione": "Cooperativa agroalimentare di Imola (BO), produce e distribuisce carni fresche e salumi con marchi CLAI e Zuarina, B2B/B2C.",
  "sede": "Imola (BO), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "reflexallen": {
  "nome": "Reflexallen Group",
  "sito": "https://www.reflexallen.com/",
  "settore": "componentistica automotive",
  "descrizione": "Fornitore Tier 1 automotive con sede sulle colline di Modena, produce componenti pneumatici, elettrici e di sicurezza per veicoli, B2B.",
  "sede": "Modena, Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "vehicle service a dover company": {
  "nome": "Vehicle Service Group, A Dover Company",
  "sito": "https://vsgdover.com/",
  "settore": "attrezzature per officine e autofficine",
  "descrizione": "Divisione del gruppo americano Dover, produce ponti sollevatori, equilibratrici e attrezzature per officine (Ravaglioli, Rotary), B2B.",
  "sede": "Downers Grove (USA), con stabilimenti anche in Italia (Ravaglioli)",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "prysmian": {
  "nome": "Prysmian Group",
  "sito": "https://www.prysmiangroup.com/",
  "settore": "cavi e sistemi per energia e telecomunicazioni",
  "descrizione": "Multinazionale italiana leader mondiale nella produzione di cavi per energia e telecomunicazioni, B2B, quotata in borsa.",
  "sede": "Milano, Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "man energy solutions": {
  "nome": "MAN Energy Solutions",
  "sito": "https://www.man-es.com/",
  "settore": "motori e turbomacchine industriali",
  "descrizione": "Azienda tedesca (gruppo Volkswagen/TRATON) produttrice di motori diesel/gas, turbine e sistemi per navi e industria, B2B.",
  "sede": "Augusta, Germania",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "quadient": {
  "nome": "Quadient S.A.",
  "sito": "https://www.quadient.com/",
  "settore": "automazione postale e digitale",
  "descrizione": "Multinazionale francese (ex Neopost) fornitrice di soluzioni per gestione posta, spedizioni e customer experience, B2B.",
  "sede": "Bagneux, Francia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "atos worldgrid": {
  "nome": "Atos Worldgrid",
  "sito": "https://www.alten.com/",
  "settore": "consulenza IT per il settore energia",
  "descrizione": "Ex divisione del gruppo Atos specializzata in soluzioni IT per utility energetiche; acquisita da ALTEN nel 2024, B2B.",
  "sede": "Francia",
  "fiducia": "media",
  "tipo": "azienda",
  "nota": "Il ruolo della persona è precedente all'acquisizione da parte di ALTEN (2024); sito indicato è quello dell'attuale proprietario"
 },
 "dema": {
  "nome": "DEMA S.p.A.",
  "sito": "https://www.demaspa.it/",
  "settore": "aerostrutture aeronautiche",
  "descrizione": "Azienda italiana del Sud Italia specializzata in progettazione e produzione di strutture aeronautiche complesse per il settore aerospaziale, B2B.",
  "sede": "Somma Vesuviana (NA), Italia",
  "fiducia": "bassa",
  "tipo": "azienda",
  "nota": "Il tirocinio indicato ('Tirocinio Universitario Extramoenia') potrebbe riferirsi a una diversa piccola impresa locale con sigla simile in Emilia-Romagna, non verificabile con certezza"
 },
 "lozza": {
  "nome": "Lozza S.p.A.",
  "sito": "https://www.lozzaocchiali.com/",
  "settore": "occhialeria",
  "descrizione": "Storico marchio italiano di occhiali da vista e da sole (dal 1878), il più antico produttore di occhiali in Italia, B2C.",
  "sede": "Veneto, Italia",
  "fiducia": "media",
  "tipo": "azienda",
  "nota": "Sito ufficiale non aperto direttamente (errore temporaneo del server), identità confermata da fonti secondarie coerenti"
 },
 "metafora mobility solutions": {
  "nome": "Metafora Mobility Solutions",
  "sito": "",
  "settore": "consulenza mobilità e trasporti",
  "descrizione": "Non identificata con certezza tra le aziende omonime 'Metafora' trovate (USA/Australia); ruolo 'Operations Manager' coerente col settore trasporti.",
  "sede": "",
  "fiducia": "bassa",
  "tipo": "azienda",
  "nota": "Esistono più società chiamate 'Metafora' nel mondo (logistica USA, ingegneria del traffico Australia); nessuna corrisponde chiaramente al nome completo 'Metafora Mobility Solutions'"
 },
 "tesla": {
  "nome": "Tesla, Inc.",
  "sito": "https://www.tesla.com/",
  "settore": "veicoli elettrici ed energia",
  "descrizione": "Multinazionale statunitense produttrice di auto elettriche, sistemi di accumulo energetico e pannelli solari, B2C/B2B.",
  "sede": "Austin, Texas, USA",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "april 2021 launched deliveries and operations in slovenia": {
  "nome": "",
  "sito": "",
  "settore": "",
  "descrizione": "Frammento di testo (probabile descrizione di un'esperienza lavorativa in Tesla), non è il nome di un'azienda.",
  "sede": "",
  "fiducia": "bassa",
  "tipo": "non_azienda",
  "nota": "Rumore di parsing dal PDF LinkedIn: sembra una frase descrittiva legata all'esperienza Tesla in Slovenia, non un datore di lavoro distinto"
 },
 "metrica sports": {
  "nome": "Metrica Sports",
  "sito": "https://www.metrica-sports.com/",
  "settore": "analisi video e dati calcistici",
  "descrizione": "Startup olandese (Amsterdam) che sviluppa software di analisi video e dati tattici per club di calcio professionistici e amatoriali, B2B.",
  "sede": "Amsterdam, Paesi Bassi",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "stats perform": {
  "nome": "Stats Perform",
  "sito": "https://www.statsperform.com/",
  "settore": "dati sportivi e intelligenza artificiale",
  "descrizione": "Azienda britannica leader mondiale nella raccolta e analisi di dati sportivi (Opta) per media, broadcaster e scommesse, B2B.",
  "sede": "Londra, Regno Unito",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "thrifty car van rental": {
  "nome": "Thrifty Car & Van Rental",
  "sito": "https://www.thrifty.com/",
  "settore": "noleggio auto e furgoni",
  "descrizione": "Catena internazionale di autonoleggio per privati e aziende, con sede negli Stati Uniti, B2C/B2B.",
  "sede": "Estero, Florida, USA",
  "fiducia": "media",
  "tipo": "azienda",
  "nota": "Ruolo indicato ('Car detailer') è di livello base, presumibilmente presso una filiale locale del marchio"
 },
 "webster medications packaging delivery for local and remote": {
  "nome": "",
  "sito": "",
  "settore": "",
  "descrizione": "Frammento descrittivo (probabile riferimento al sistema di blister 'Webster' per farmaci) associato erroneamente a un nome azienda; la 'persona' riportata è 'communities', ulteriore segnale di rumore di parsing.",
  "sede": "",
  "fiducia": "bassa",
  "tipo": "non_azienda",
  "nota": "Rumore di parsing dal PDF LinkedIn, non è un'azienda"
 },
 "philips": {
  "nome": "Philips (Koninklijke Philips N.V.)",
  "sito": "https://www.philips.com/",
  "settore": "tecnologia medicale ed elettronica",
  "descrizione": "Multinazionale olandese attiva in tecnologia sanitaria, illuminazione ed elettronica di consumo, B2B/B2C.",
  "sede": "Amsterdam, Paesi Bassi",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "i player performance football": {
  "nome": "I-Player Performance Football",
  "sito": "",
  "settore": "consulenza tecnica calcio",
  "descrizione": "Presumibile micro-realtà di consulenza tecnica/performance nel calcio giovanile o dilettantistico, non identificata con certezza sul web.",
  "sede": "",
  "fiducia": "bassa",
  "tipo": "azienda",
  "nota": "Nessun sito ufficiale trovato con questo nome esatto; possibile piccola realtà locale o denominazione imprecisa su LinkedIn."
 },
 "pro sesto 1913": {
  "nome": "Pro Sesto 1913",
  "sito": "https://prosesto1913.com/",
  "settore": "società calcistica professionistica",
  "descrizione": "Società calcistica di Sesto San Giovanni (Milano) militante nei campionati professionistici/dilettantistici italiani (Serie C/Eccellenza).",
  "sede": "Sesto San Giovanni (MI), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "il nuovo calcio": {
  "nome": "Il Nuovo Calcio",
  "sito": "https://www.ilnuovocalcio.it/",
  "settore": "editoria sportiva",
  "descrizione": "Rivista mensile italiana dedicata alla tecnica e alla tattica calcistica, rivolta ad allenatori e appassionati (B2C/B2B editoria).",
  "sede": "Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": "Il ruolo indicato è 'Freelance Editor', collaborazione come collaboratore esterno."
 },
 "ac milan": {
  "nome": "AC Milan",
  "sito": "https://www.acmilan.com/",
  "settore": "club calcistico professionistico",
  "descrizione": "Storico club calcistico italiano di Serie A, tra i più titolati al mondo, con attività sportiva e commerciale (merchandising, media).",
  "sede": "Milano, Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "kedrion biopharma": {
  "nome": "Kedrion Biopharma",
  "sito": "https://www.kedrion.com/",
  "settore": "biofarmaceutico plasmaderivati",
  "descrizione": "Multinazionale farmaceutica italiana specializzata nella raccolta di plasma e nella produzione di farmaci plasmaderivati per ospedali e pazienti.",
  "sede": "Castelvecchio Pascoli, Lucca, Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "kedrion": {
  "nome": "Kedrion S.p.A.",
  "sito": "https://www.kedrion.com/",
  "settore": "biofarmaceutico plasmaderivati",
  "descrizione": "Stessa azienda della voce Kedrion Biopharma: multinazionale farmaceutica italiana dei plasmaderivati.",
  "sede": "Castelvecchio Pascoli, Lucca, Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": "Duplicato di 'kedrion biopharma'."
 },
 "granarolo": {
  "nome": "Granarolo S.p.A.",
  "sito": "https://www.granarolo.com/",
  "settore": "industria lattiero-casearia",
  "descrizione": "Gruppo alimentare italiano leader nel settore lattiero-caseario (latte, formaggi, yogurt) venduto B2C nella grande distribuzione.",
  "sede": "Bologna, Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "drivesec we secure your things": {
  "nome": "DRIVESEC S.r.l.",
  "sito": "https://www.drivesec.com/",
  "settore": "cybersecurity automotive e IoT",
  "descrizione": "Scale-up torinese che sviluppa soluzioni di cybersecurity per automotive, IoT e Industry 4.0, servendo clienti B2B (OEM e fornitori).",
  "sede": "Torino, Italia",
  "fiducia": "media",
  "tipo": "azienda",
  "nota": "Confermata da più fonti (LinkedIn, TheOrg, RocketReach); homepage non completamente accessibile per verifica diretta."
 },
 "stellantis": {
  "nome": "Stellantis N.V.",
  "sito": "https://www.stellantis.com/",
  "settore": "produzione automobilistica",
  "descrizione": "Gruppo automobilistico multinazionale (nato dalla fusione FCA-PSA) che produce e vende veicoli con marchi come Fiat, Jeep, Peugeot per il mercato B2C.",
  "sede": "Amsterdam, Paesi Bassi (sedi operative anche in Italia)",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "auto isac": {
  "nome": "Auto-ISAC (Automotive Information Sharing and Analysis Center)",
  "sito": "https://automotiveisac.com/",
  "settore": "condivisione informazioni cybersecurity automotive",
  "descrizione": "Organizzazione no-profit che raccoglie e condivide tra case automobilistiche e fornitori informazioni su minacce e vulnerabilità cyber dei veicoli.",
  "sede": "Stati Uniti",
  "fiducia": "alta",
  "tipo": "universita_ente",
  "nota": "Non è un'azienda ma un consorzio/ente di settore."
 },
 "marelli": {
  "nome": "Marelli Holdings",
  "sito": "https://www.marelli.com/",
  "settore": "componentistica automotive",
  "descrizione": "Fornitore globale (ex Magneti Marelli) di componenti e sistemi per l'industria automobilistica, tra cui elettronica e cybersecurity veicolare, B2B.",
  "sede": "Corbetta (MI), Italia / Giappone",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "december 2014 today cyber security system architect": {
  "nome": "December 2014 - today: Cyber Security system architect",
  "sito": "",
  "settore": "",
  "descrizione": "Non è un nome di azienda: è un frammento di descrizione di ruolo/periodo lavorativo generato da un errore di parsing del PDF LinkedIn.",
  "sede": "",
  "fiducia": "bassa",
  "tipo": "non_azienda",
  "nota": "Rumore di estrazione: titolo di ruolo con date, non un'organizzazione."
 },
 "universita di bologna": {
  "nome": "Università di Bologna",
  "sito": "https://www.unibo.it/",
  "settore": "istruzione universitaria e ricerca",
  "descrizione": "Ateneo pubblico italiano, uno dei più antichi al mondo, con attività di didattica e ricerca in tutte le discipline.",
  "sede": "Bologna, Italia",
  "fiducia": "alta",
  "tipo": "universita_ente",
  "nota": ""
 },
 "smalticeram": {
  "nome": "Smalticeram Group",
  "sito": "https://www.smalticeram.it/",
  "settore": "smalti e colori per ceramica",
  "descrizione": "Colorificio ceramico italiano che produce inchiostri digitali, smalti, graniglie e pigmenti per l'industria ceramica industriale, con filiali estere (B2B).",
  "sede": "Roteglia di Castellarano (RE), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "smaltochimica": {
  "nome": "Smaltochimica S.p.A.",
  "sito": "https://www.smaltochimica.it/",
  "settore": "chimica per la ceramica",
  "descrizione": "Azienda del distretto ceramico di Fiorano Modenese che produce additivi, leganti e fissativi chimici per smalti ceramici, venduti B2B nel mondo.",
  "sede": "Fiorano Modenese (MO), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "project automation": {
  "nome": "Project Group Automation S.r.l.",
  "sito": "https://pgautomation.eu/",
  "settore": "automazione industriale e robotica",
  "descrizione": "Azienda reggiana che progetta e realizza sistemi di automazione industriale, robotica e quadri elettrici su misura per clienti B2B manifatturieri.",
  "sede": "San Polo d'Enza (RE), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "ot consulting": {
  "nome": "OT Consulting S.r.l.",
  "sito": "https://www.otconsulting.com/",
  "settore": "consulenza e sviluppo software ICT",
  "descrizione": "Società di consulenza ICT che sviluppa software su misura e soluzioni di automazione/digitalizzazione per aziende clienti B2B.",
  "sede": "Reggio Emilia, Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "energee3": {
  "nome": "Energee3 S.r.l.",
  "sito": "https://www.energee3.com/",
  "settore": "consulenza e servizi ICT",
  "descrizione": "Società di servizi informatici reggiana che sviluppa software, data warehouse e consulenza organizzativa per aziende clienti B2B.",
  "sede": "Reggio Emilia, Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "dario ricci": {
  "nome": "Attività in proprio",
  "sito": "",
  "settore": "",
  "descrizione": "Nome della persona stessa (utente), usato su LinkedIn per un'attività individuale di AI Transformation e Controllo di Gestione, non un'azienda distinta.",
  "sede": "",
  "fiducia": "alta",
  "tipo": "libero_professionista",
  "nota": "Coincide con il nome del titolare del profilo: attività da libero professionista/freelance, non azienda terza."
 },
 "maior": {
  "nome": "Maior (ora Hitachi MMS)",
  "sito": "https://www.maior.it/",
  "settore": "software di workforce/service management",
  "descrizione": "Software house che sviluppava soluzioni per la pianificazione di risorse, turni e operations, oggi confluita nel gruppo Hitachi (Hitachi MMS), B2B.",
  "sede": "Bologna, Italia",
  "fiducia": "media",
  "tipo": "azienda",
  "nota": "Il sito maior.it reindirizza a hitachimms.com: l'azienda risulta acquisita dal gruppo Hitachi dopo il periodo di lavoro descritto."
 },
 "hiskill": {
  "nome": "HiSkill",
  "sito": "https://www.hiskill.it/",
  "settore": "consulenza e formazione aziendale",
  "descrizione": "Società di consulenza e formazione manageriale (Business Upgrade) con sedi in tutta Italia, rivolta ad aziende clienti B2B.",
  "sede": "Napoli, Italia (uffici anche a Bologna e altre città)",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "university of bologna": {
  "nome": "University of Bologna",
  "sito": "https://www.unibo.it/",
  "settore": "istruzione universitaria e ricerca",
  "descrizione": "Stessa istituzione della voce 'Università di Bologna' (nome in inglese).",
  "sede": "Bologna, Italia",
  "fiducia": "alta",
  "tipo": "universita_ente",
  "nota": "Duplicato di 'universita di bologna'."
 },
 "guerbet": {
  "nome": "Guerbet",
  "sito": "https://www.guerbet.com/",
  "settore": "mezzi di contrasto diagnostici",
  "descrizione": "Gruppo farmaceutico francese specializzato in mezzi di contrasto per imaging medicale, venduti B2B a ospedali e centri diagnostici.",
  "sede": "Villepinte, Francia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "teleflex incorporated": {
  "nome": "Teleflex Incorporated",
  "sito": "https://www.teleflex.com/",
  "settore": "dispositivi medici",
  "descrizione": "Multinazionale statunitense produttrice di dispositivi medici (anestesia, urologia, chirurgia) venduti B2B a ospedali e strutture sanitarie.",
  "sede": "Wayne, Pennsylvania, Stati Uniti",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "covidien": {
  "nome": "Covidien",
  "sito": "https://www.medtronic.com/",
  "settore": "dispositivi medici",
  "descrizione": "Ex multinazionale di dispositivi medici (chirurgia, respiratorio, vascolare), acquisita da Medtronic nel 2015 e non più operante come marchio autonomo.",
  "sede": "Dublino, Irlanda (storica)",
  "fiducia": "media",
  "tipo": "azienda",
  "nota": "Società non più esistente in forma autonoma: assorbita da Medtronic nel 2015, il sito storico reindirizza al gruppo acquirente."
 },
 "zanasi": {
  "nome": "Zanasi S.r.l.",
  "sito": "https://www.zanasicoding.com/",
  "settore": "marcatura e tracciabilità industriale",
  "descrizione": "Azienda modenese produttrice di sistemi di marcatura, codifica e tracciabilità a getto d'inchiostro per l'industria manifatturiera, B2B nel mondo.",
  "sede": "Sassuolo (MO), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "tradex": {
  "nome": "Tradex S.r.l.",
  "sito": "https://www.tradexsrl.com/",
  "settore": "marcatura e packaging per dispositivi medici",
  "descrizione": "Azienda milanese che fornisce soluzioni di marcatura, tracciabilità e packaging per produttori di dispositivi medici, mercato B2B.",
  "sede": "Milano, Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "beko europe": {
  "nome": "Beko Europe",
  "sito": "https://www.beko.com/",
  "settore": "elettrodomestici",
  "descrizione": "Joint venture tra Arçelik e Whirlpool per la produzione e vendita di elettrodomestici in Europa con il marchio Beko, mercato B2C.",
  "sede": "Comerio (VA), Italia / Istanbul, Turchia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "whirlpool corporation": {
  "nome": "Whirlpool Corporation",
  "sito": "https://www.whirlpoolcorp.com/",
  "settore": "elettrodomestici",
  "descrizione": "Multinazionale statunitense leader mondiale nella produzione di grandi elettrodomestici (frigoriferi, lavatrici) per il mercato B2C.",
  "sede": "Benton Harbor, Michigan, Stati Uniti",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "indesit company": {
  "nome": "Indesit Company",
  "sito": "https://www.whirlpoolcorp.com/",
  "settore": "elettrodomestici",
  "descrizione": "Ex gruppo italiano di elettrodomestici (marchi Indesit, Hotpoint), acquisito da Whirlpool nel 2014 e oggi parte del gruppo americano.",
  "sede": "Fabriano (AN), Italia",
  "fiducia": "media",
  "tipo": "azienda",
  "nota": "Società non più autonoma: confluita in Whirlpool Corporation dal 2014."
 },
 "koelliker": {
  "nome": "Gruppo Koelliker",
  "sito": "https://www.koelliker.it/",
  "settore": "importazione e distribuzione automobili",
  "descrizione": "Storico gruppo italiano (dal 1936) importatore e distributore di automobili (es. Mitsubishi, KG Mobility) per il mercato B2C italiano.",
  "sede": "Milano, Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "sida": {
  "nome": "Sida Group S.r.l.",
  "sito": "https://www.sidagroup.com/",
  "settore": "consulenza e formazione manageriale",
  "descrizione": "Società di consulenza strategica, finanza/controllo di gestione e formazione per imprese, con sedi ad Ancona e Roma, mercato B2B.",
  "sede": "Ancona, Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "barilla": {
  "nome": "Barilla Group",
  "sito": "https://www.barillagroup.com/",
  "settore": "industria alimentare (pasta e prodotti da forno)",
  "descrizione": "Gruppo alimentare italiano leader mondiale nella pasta e nei prodotti da forno, con marchi venduti B2C in oltre 100 paesi.",
  "sede": "Parma, Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "suzhou rovatti pumps co": {
  "nome": "Suzhou Rovatti Pumps Co. Ltd",
  "sito": "https://www.rovatti.cn/",
  "settore": "produzione di pompe industriali",
  "descrizione": "Filiale cinese del gruppo italiano la persona Pompe, produce pompe centrifughe per il mercato asiatico (irrigazione, industria, acquedotti), B2B.",
  "sede": "Taicang, Jiangsu, Cina",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "rovatti pompe": {
  "nome": "Rovatti Pompe S.p.A.",
  "sito": "https://www.rovatti.com/",
  "settore": "produzione di pompe industriali",
  "descrizione": "Storica azienda reggiana (dal 1952) produttrice di pompe centrifughe sommerse e di superficie per agricoltura, industria e acquedotti, B2B nel mondo.",
  "sede": "Fabbrico (RE), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "ey": {
  "nome": "EY (Ernst & Young)",
  "sito": "https://www.ey.com/",
  "settore": "revisione e consulenza",
  "descrizione": "Una delle quattro maggiori società mondiali di revisione contabile, consulenza fiscale e finanziaria, servizi B2B a imprese di ogni dimensione.",
  "sede": "Londra, Regno Unito (rete globale, forte presenza in Italia)",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "baker tilly wct wealth corporate tax": {
  "nome": "Baker Tilly WCT Wealth & Corporate Tax Italy",
  "sito": "https://www.wct-advisors.com/",
  "settore": "consulenza fiscale e societaria",
  "descrizione": "Studio di consulenza fiscale, societaria e patrimoniale torinese, membro del network internazionale Baker Tilly, mercato B2B.",
  "sede": "Torino, Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "rovatti france sarl": {
  "nome": "Rovatti France Sarl",
  "sito": "https://www.rovatti.com/",
  "settore": "pompe centrifughe industriali",
  "descrizione": "Filiale francese del gruppo italiano la persona Pompe, vende e distribuisce pompe centrifughe e elettropompe per uso industriale e agricolo (B2B).",
  "sede": "Palaiseau, Francia (gruppo con sede a Guastalla, RE)",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "fiorese ecologia": {
  "nome": "Fiorese Ecologia S.r.l.",
  "sito": "https://www.fioresegroup.it/i-settori/fiorese-ecologia/",
  "settore": "gestione e smaltimento rifiuti speciali",
  "descrizione": "Società del gruppo la persona che offre a imprese ed enti pubblici raccolta, trasporto, recupero e smaltimento di rifiuti speciali (B2B).",
  "sede": "Rossano Veneto (VI)",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "fiorese lubriservice": {
  "nome": "Fiorese Lubriservice S.r.l.",
  "sito": "https://www.fioresegroup.it/i-settori/fiorese-lubriservice/",
  "settore": "distribuzione lubrificanti industriali",
  "descrizione": "Società del gruppo la persona, distributore autorizzato Mobil/Total di oli e grassi lubrificanti per industria, autotrazione e agricoltura (B2B).",
  "sede": "Rossano Veneto (VI)",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "atl": {
  "nome": "ATL Group S.p.A.",
  "sito": "https://www.atlgroup.it/",
  "settore": "produzione divani e imbottiti",
  "descrizione": "Produttore italiano di divani, poltrone e componenti per l'imbottito, fornitore B2B di brand del mobile e della grande distribuzione.",
  "sede": "Faenza (RA)",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": "La persona vi ha ricoperto un ruolo IT (responsabile sistemi informativi); l'azienda opera nel settore mobile/imbottiti, non nell'informatica."
 },
 "cybertec": {
  "nome": "Cybertec S.r.l. (Gruppo Zucchetti)",
  "sito": "https://www.cyberplan.it/",
  "settore": "software di pianificazione della produzione",
  "descrizione": "Sviluppa CyberPlan, software di supply chain planning e scheduling per aziende manifatturiere (B2B), dal 2020 parte del Gruppo Zucchetti.",
  "sede": "Trieste",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "luxottica": {
  "nome": "Luxottica Group (ora EssilorLuxottica)",
  "sito": "https://www.essilorluxottica.com/",
  "settore": "occhiali e occhialeria",
  "descrizione": "Multinazionale leader mondiale nella progettazione, produzione e distribuzione di occhiali da vista e da sole, B2B e B2C con marchi propri e in licenza.",
  "sede": "Milano / Agordo (BL)",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "friul intagli industries": {
  "nome": "Friul Intagli Industries S.p.A.",
  "sito": "https://www.friulintagli.com/en/",
  "settore": "componenti e mobili in kit",
  "descrizione": "Maggiore produttore mondiale di componenti per mobili in kit, fornitore B2B di grandi brand del settore arredo tra cui IKEA.",
  "sede": "Prata di Pordenone (PN)",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "amedei toscana": {
  "nome": "Amedei",
  "sito": "https://amedei.it/",
  "settore": "cioccolato artigianale di lusso",
  "descrizione": "Produttore toscano di cioccolato bean-to-bar di alta gamma, dalla lavorazione della fava di cacao al prodotto finito, venduto B2C e B2B.",
  "sede": "Pontedera (PI), Toscana",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "illva saronno": {
  "nome": "ILLVA Saronno Holding S.p.A. (ora Disaronno Group)",
  "sito": "https://www.illva.com/",
  "settore": "liquori, vini e ingredienti",
  "descrizione": "Gruppo italiano di famiglia proprietario del marchio Disaronno, attivo in oltre 150 paesi con divisioni spirits, vini e ingredienti (B2B e B2C).",
  "sede": "Saronno (VA)",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": "Rebranding recente da ILLVA Saronno Holding a Disaronno Group."
 },
 "ferrero": {
  "nome": "Ferrero",
  "sito": "https://www.ferrero.com/",
  "settore": "dolciario",
  "descrizione": "Multinazionale italiana del dolciario (Nutella, Kinder, Ferrero Rocher), produzione e distribuzione B2C su scala globale.",
  "sede": "Alba (CN) / Lussemburgo",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "novartis": {
  "nome": "Novartis",
  "sito": "https://www.novartis.com/",
  "settore": "farmaceutica",
  "descrizione": "Multinazionale farmaceutica svizzera che sviluppa e commercializza farmaci innovativi, B2B (sistema sanitario) e istituzionale.",
  "sede": "Basilea, Svizzera",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "amanda wakeley": {
  "nome": "Amanda Wakeley",
  "sito": "",
  "settore": "moda di lusso femminile",
  "descrizione": "Storico marchio britannico di abiti da sera e capi eleganti da donna, fondato a Londra nel 1990, dichiarato in liquidazione nel 2026.",
  "sede": "Londra, Regno Unito",
  "fiducia": "media",
  "tipo": "azienda",
  "nota": "Marchio non più operativo (liquidazione 2026); sito ufficiale non attivo, per questo lasciato vuoto."
 },
 "the light studios": {
  "nome": "Light Studios",
  "sito": "https://www.lightstudios.org/",
  "settore": "fotografia di prodotto e moda",
  "descrizione": "Studio fotografico londinese specializzato in fotografia di prodotto, packshot ed e-commerce per brand di moda (B2B).",
  "sede": "Londra, Regno Unito",
  "fiducia": "media",
  "tipo": "azienda",
  "nota": "Nome generico; corrispondenza plausibile ma non certa con lo studio dove la persona ha fatto lo stage marketing."
 },
 "alpitronic": {
  "nome": "Alpitronic",
  "sito": "https://www.alpitronic.it/",
  "settore": "colonnine di ricarica elettrica",
  "descrizione": "Azienda altoatesina leader mondiale nella progettazione e produzione di stazioni di ricarica ultra-rapida per veicoli elettrici (B2B).",
  "sede": "Bolzano",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "brembo": {
  "nome": "Brembo",
  "sito": "https://www.brembo.com/",
  "settore": "sistemi frenanti automotive",
  "descrizione": "Multinazionale italiana leader mondiale nella progettazione e produzione di sistemi frenanti per auto, moto e veicoli industriali (B2B).",
  "sede": "Stezzano (BG)",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "capgemini engineering": {
  "nome": "Capgemini Engineering",
  "sito": "https://www.capgemini.com/it-it/servizi/capgemini-engineering/",
  "settore": "servizi di ingegneria e R&D",
  "descrizione": "Divisione del gruppo Capgemini specializzata in servizi di ingegneria, R&D e trasformazione digitale per clienti industriali e automotive (B2B).",
  "sede": "Parigi, Francia (gruppo globale)",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "responsible of p l": {
  "nome": "",
  "sito": "",
  "settore": "",
  "descrizione": "",
  "sede": "",
  "fiducia": "bassa",
  "tipo": "non_azienda",
  "nota": "Frammento di ruolo/titolo di lavoro (\"Responsible of P&L\"), non un nome di azienda."
 },
 "altran": {
  "nome": "Altran (ora Capgemini Engineering)",
  "sito": "https://www.capgemini.com/it-it/servizi/capgemini-engineering/",
  "settore": "consulenza e servizi di ingegneria",
  "descrizione": "Ex società francese di consulenza ingegneristica, acquisita da Capgemini nel 2020 e ribattezzata Capgemini Engineering (B2B).",
  "sede": "Parigi, Francia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": "Marchio confluito in Capgemini Engineering."
 },
 "star": {
  "nome": "STAR Italia",
  "sito": "",
  "settore": "manifattura automotive",
  "descrizione": "Non identificata con certezza tra le varie aziende automotive/industriali che usano il nome STAR in Italia.",
  "sede": "",
  "fiducia": "bassa",
  "tipo": "azienda",
  "nota": "Nome troppo generico per essere disambiguato con sicurezza; ruoli della persona (produzione/manifattura) coerenti con un fornitore automotive."
 },
 "pirelli": {
  "nome": "Pirelli",
  "sito": "https://www.pirelli.com/",
  "settore": "pneumatici",
  "descrizione": "Multinazionale italiana produttrice di pneumatici per auto, moto e mezzi industriali, venduti B2B e B2C in tutto il mondo.",
  "sede": "Milano",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "agustawestland": {
  "nome": "AgustaWestland (ora Leonardo Helicopters)",
  "sito": "https://www.leonardo.com/",
  "settore": "elicotteri e aerospazio-difesa",
  "descrizione": "Ex costruttore italo-britannico di elicotteri, oggi divisione elicotteri del gruppo Leonardo, cliente B2B (militare e civile).",
  "sede": "Cascina Costa di Samarate (VA)",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "italdesign giugiaro": {
  "nome": "Italdesign Giugiaro",
  "sito": "https://www.italdesign.it/",
  "settore": "design e ingegneria automotive",
  "descrizione": "Storica società italiana di design industriale e ingegneria automotive, parte del gruppo Volkswagen, opera B2B per case automobilistiche.",
  "sede": "Moncalieri (TO)",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "politecnico di torino": {
  "nome": "Politecnico di Torino",
  "sito": "https://www.polito.it/",
  "settore": "istruzione universitaria e ricerca",
  "descrizione": "Ateneo tecnico pubblico italiano, tra i principali politecnici europei per ingegneria e architettura.",
  "sede": "Torino",
  "fiducia": "alta",
  "tipo": "universita_ente",
  "nota": ""
 },
 "mcdonald s corporation": {
  "nome": "McDonald's Corporation",
  "sito": "https://www.mcdonalds.com/",
  "settore": "ristorazione fast food",
  "descrizione": "Multinazionale statunitense della ristorazione rapida, gestione diretta e in franchising di ristoranti in tutto il mondo (B2C).",
  "sede": "Chicago, Illinois, USA",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "arta capital": {
  "nome": "Artá Capital",
  "sito": "https://artacapital.com/en/",
  "settore": "private equity",
  "descrizione": "Società spagnola di private equity mid-market che investe in aziende familiari iberiche di media dimensione, servizio B2B/istituzionale.",
  "sede": "Madrid, Spagna",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "ferreira de rugs": {
  "nome": "Ferreira de Sá Rugs",
  "sito": "https://ferreiradesa.com/",
  "settore": "tappeti artigianali di lusso",
  "descrizione": "Produttore portoghese storico (dal 1946) di tappeti fatti a mano di alta gamma, venduti B2B a interior designer e rivenditori.",
  "sede": "Espinho, Portogallo",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "ey parthenon": {
  "nome": "EY-Parthenon",
  "sito": "https://www.ey.com/en_gl/ey-parthenon",
  "settore": "consulenza strategica",
  "descrizione": "Divisione di consulenza strategica del network globale EY, al servizio di grandi aziende e fondi (B2B).",
  "sede": "Londra, UK (network globale)",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "hodo advisory": {
  "nome": "HODO Advisory",
  "sito": "https://hodoadvisory.com/",
  "settore": "consulenza advisory e M&A",
  "descrizione": "Boutique di consulenza advisory italiana per operazioni straordinarie e strategia aziendale (B2B), presenza online ancora limitata.",
  "sede": "Italia",
  "fiducia": "media",
  "tipo": "azienda",
  "nota": "Sito ufficiale poco sviluppato al momento della verifica, informazioni limitate."
 },
 "start up my home": {
  "nome": "",
  "sito": "",
  "settore": "",
  "descrizione": "",
  "sede": "",
  "fiducia": "bassa",
  "tipo": "non_azienda",
  "nota": "Nome generico di una start-up (\"My Home\") non identificabile né verificabile come società specifica."
 },
 "oniro": {
  "nome": "ONIRO Group",
  "sito": "https://www.onirogroup.it/en",
  "settore": "arredamento di lusso",
  "descrizione": "Gruppo italiano dell'arredo di lusso (ex Jumbo Group), licenziatario di marchi come Roberto Cavalli Home ed Etro Home, B2B/B2C.",
  "sede": "Cantù (CO)",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "head of b2b contract channel and business development": {
  "nome": "",
  "sito": "",
  "settore": "",
  "descrizione": "",
  "sede": "",
  "fiducia": "bassa",
  "tipo": "non_azienda",
  "nota": "Frammento di titolo di ruolo (\"Head of Group B2B-Contract Channel...\"), non un nome di azienda."
 },
 "gessi": {
  "nome": "Gessi",
  "sito": "https://www.gessi.com/",
  "settore": "rubinetteria di lusso",
  "descrizione": "Azienda italiana produttrice di rubinetteria e accessori bagno/cucina di design, made in Italy, venduta B2B a distributori e rivenditori.",
  "sede": "Serramazzoni (MO)",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "project division director south region mediterraneans middle": {
  "nome": "",
  "sito": "",
  "settore": "",
  "descrizione": "",
  "sede": "",
  "fiducia": "bassa",
  "tipo": "non_azienda",
  "nota": "Frammento di titolo di ruolo (\"Project Division Director, South Region...\"), non un nome di azienda."
 },
 "alcar uno": {
  "nome": "Alcar Uno S.p.A.",
  "sito": "https://alcaruno.it/",
  "settore": "lavorazione carni suine",
  "descrizione": "Azienda emiliana specializzata nella selezione e lavorazione di tagli di carne suina e salumi (prosciutti, speck) per l'industria B2B.",
  "sede": "Castelnuovo Rangone (MO)",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "ingegneri riuniti": {
  "nome": "Ingegneri Riuniti S.p.A.",
  "sito": "https://www.ingegneririuniti.it/",
  "settore": "ingegneria civile e impiantistica",
  "descrizione": "Storico studio di ingegneria italiano (dal 1965) specializzato in progettazione civile, strutturale e impiantistica per committenti pubblici e privati.",
  "sede": "Modena",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "nexion": {
  "nome": "Nexion S.p.A.",
  "sito": "https://www.nexiongroup.com/en/",
  "settore": "attrezzature per autofficine",
  "descrizione": "Gruppo italiano leader mondiale nelle attrezzature per gommisti e autofficine (marchi Corghi, Sice, Tecnomotor), B2B.",
  "sede": "Correggio (RE)",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "teco automotive equipment": {
  "nome": "TECO Automotive Equipment",
  "sito": "https://www.tecoautomotive.com/",
  "settore": "attrezzature per pneumatici e officine",
  "descrizione": "Azienda italiana che progetta e produce smontagomme, equilibratrici e attrezzature per officine e gommisti, esportate in tutto il mondo (B2B).",
  "sede": "Correggio (RE)",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "comer industries": {
  "nome": "Comer Industries S.p.A.",
  "sito": "https://www.comerindustries.com",
  "settore": "riduttori e trasmissioni di potenza",
  "descrizione": "Multinazionale di Reggio Emilia che progetta e produce sistemi di trasmissione meccanica ed elettronica per macchine agricole e industriali (B2B).",
  "sede": "Reggiolo (RE), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "fidens": {
  "nome": "Fidens Consulting Srl",
  "sito": "https://www.fidensweb.it",
  "settore": "consulenza aziendale e fiscale",
  "descrizione": "Studio di consulenza aziendale, fiscale e in Business Intelligence (partner Microsoft Power BI) per PMI, tra Milano e Cinquefrondi (RC).",
  "sede": "Milano / Cinquefrondi (RC), Italia",
  "fiducia": "media",
  "tipo": "azienda",
  "nota": "Nome generico, non aperta direttamente la home page ma dati coerenti con provenienza calabrese della persona"
 },
 "evo bi": {
  "nome": "EVO-BI Srl",
  "sito": "https://www.evo-bi.com",
  "settore": "business intelligence e credito commerciale",
  "descrizione": "Spin-off dell'Università della Calabria che sviluppa software di Business Intelligence e gestione del credito commerciale con AI per PMI (B2B).",
  "sede": "Rende (CS), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "sevem": {
  "nome": "Sevem Srl",
  "sito": "https://www.sevemsrl.it",
  "settore": "spedizioni e trasporti",
  "descrizione": "Azienda di spedizioni e trasporto merci in Italia e all'estero, con centro operativo a Villa San Giovanni (RC), per aziende e privati.",
  "sede": "Villa San Giovanni (RC), Italia",
  "fiducia": "media",
  "tipo": "azienda",
  "nota": "Sede coerente con le altre esperienze calabresi della stessa persona"
 },
 "fe co": {
  "nome": "SA.FE.CO. Group Srl",
  "sito": "",
  "settore": "non identificato con certezza",
  "descrizione": "Piccola società con sede a Villa San Giovanni (RC); non è stato possibile verificare online l'attività specifica.",
  "sede": "Villa San Giovanni (RC), Italia",
  "fiducia": "bassa",
  "tipo": "azienda",
  "nota": "Trovata solo in registri camerali, nessun sito ufficiale reperito; sede coerente con altre esperienze calabresi della persona"
 },
 "quar security": {
  "nome": "Quar Security Srl",
  "sito": "",
  "settore": "vigilanza e sicurezza privata",
  "descrizione": "Presumibile istituto di vigilanza/sicurezza privata; non è stato possibile trovare un sito ufficiale o conferma indipendente.",
  "sede": "",
  "fiducia": "bassa",
  "tipo": "azienda",
  "nota": "Nessun riscontro online oltre al nome; settore dedotto dal nome"
 },
 "gleason corporation": {
  "nome": "Gleason Corporation",
  "sito": "https://www.gleason.com",
  "settore": "macchine utensili per ingranaggi",
  "descrizione": "Multinazionale americana leader in macchine, utensili e software per la produzione di ingranaggi, con filiale a Bologna, cliente B2B industriale.",
  "sede": "Rochester (NY, USA) / Bologna, Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "ferrari bibus": {
  "nome": "Ferrari BIBUS S.r.l.",
  "sito": "https://ferrari.bibus.com/it-it/",
  "settore": "distribuzione motori elettrici e riduttori",
  "descrizione": "Distributore di motori elettrici, inverter, riduttori e ventilatori industriali per l'industria, entrato nel gruppo BIBUS nel 2024.",
  "sede": "Soresina (CR), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": "Ex Ferrari Srl, oggi parte del gruppo BIBUS"
 },
 "bibus": {
  "nome": "BIBUS Italia Srl",
  "sito": "https://hydraulics.bibus.com/it-it/",
  "settore": "oleodinamica e componenti industriali",
  "descrizione": "System integrator per soluzioni di oleodinamica mobile e industriale, mecatronica e componenti, al servizio di aziende manifatturiere.",
  "sede": "San Giovanni in Persiceto (BO), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "ivas": {
  "nome": "Gruppo IVAS S.p.A.",
  "sito": "https://www.gruppoivas.com",
  "settore": "vernici e sistemi per l'edilizia",
  "descrizione": "Gruppo industriale (famiglia la persona, dal 1953) produttore di vernici, sistemi a cappotto termico e facciate ventilate, attivo in oltre 30 paesi.",
  "sede": "San Mauro Pascoli (FC), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "aliva": {
  "nome": "Aliva",
  "sito": "https://www.aliva.it",
  "settore": "sistemi a cappotto e facciate ventilate",
  "descrizione": "Brand/società del Gruppo IVAS specializzata in sistemi di isolamento a cappotto e facciate ventilate per l'edilizia, mercato B2B.",
  "sede": "San Mauro Pascoli (FC), Italia / UK",
  "fiducia": "media",
  "tipo": "azienda",
  "nota": "Esiste anche entità UK (alivauk.com); relazione con Gruppo IVAS confermata ma struttura societaria non del tutto chiara"
 },
 "fca fiat chrysler automobiles": {
  "nome": "FCA - Fiat Chrysler Automobiles (oggi Stellantis)",
  "sito": "https://www.stellantis.com",
  "settore": "produzione automobilistica",
  "descrizione": "Ex gruppo automobilistico italo-americano, confluito in Stellantis nel 2021; produce veicoli per il mercato B2C globale.",
  "sede": "Torino, Italia / Amsterdam, Paesi Bassi",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": "FCA come entità autonoma non esiste più, fusa in Stellantis"
 },
 "arbos": {
  "nome": "Arbos Group S.p.A. (Lovol Arbos Group)",
  "sito": "https://www.arbos.com",
  "settore": "trattori e macchine agricole",
  "descrizione": "Holding industriale controllata da Lovol Heavy Industry (Cina), produce trattori e macchine agricole con i marchi Arbos, Goldoni e MaterMacc.",
  "sede": "Campodarsego (PD) / Migliarina di Carpi (MO), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "new crazy colors": {
  "nome": "New Crazy Colors S.r.l.",
  "sito": "https://www.newcrazycolors.it",
  "settore": "allestimenti e visual merchandising",
  "descrizione": "\"Ideas Factory\" che realizza vetrine, allestimenti retail e progetti di visual merchandising per boutique di lusso, con sedi a Monza e Shanghai.",
  "sede": "Monza (MB), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "china chamber of commerce": {
  "nome": "China-Italy Chamber of Commerce",
  "sito": "https://www.cameraitacina.com",
  "settore": "associazione bilaterale imprese Italia-Cina",
  "descrizione": "Ente non profit riconosciuto da Italia e Cina che promuove l'internazionalizzazione delle imprese italiane e il business bilaterale in Cina.",
  "sede": "Pechino, Cina (uffici anche in altre città cinesi)",
  "fiducia": "alta",
  "tipo": "universita_ente",
  "nota": ""
 },
 "pwc": {
  "nome": "PwC",
  "sito": "https://www.pwc.com/it",
  "settore": "revisione e consulenza",
  "descrizione": "Network internazionale Big Four di revisione contabile, consulenza fiscale e advisory per grandi imprese e istituzioni (B2B).",
  "sede": "Londra, UK (sede globale) / Milano, Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "cmb societa cooperativa muratori e braccianti di carpi": {
  "nome": "CMB - Società Cooperativa Muratori e Braccianti di Carpi",
  "sito": "https://www.cmbcarpi.com",
  "settore": "costruzioni generali",
  "descrizione": "Storica cooperativa (dal 1908) attiva in edilizia civile e ospedaliera, opere pubbliche e private, con certificazione BIM.",
  "sede": "Carpi (MO), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "integrato di firenze linea 3 2 1": {
  "nome": "Tramvia di Firenze - Linea 3.2.1 (cantiere/progetto)",
  "sito": "",
  "settore": "non applicabile",
  "descrizione": "Nome di un cantiere/progetto (tratta tramviaria Libertà-Bagno a Ripoli a Firenze), non il nome di un'azienda; presumibilmente riferito al lavoro svolto per CMB.",
  "sede": "Firenze, Italia",
  "fiducia": "media",
  "tipo": "non_azienda",
  "nota": "Voce di parsing: è il nome di un cantiere/lotto, non un datore di lavoro"
 },
 "manelli impresa": {
  "nome": "Manelli Impresa S.p.A.",
  "sito": "https://manelligroup.com",
  "settore": "costruzioni generali",
  "descrizione": "General contractor pugliese specializzato in grandi opere pubbliche e private, infrastrutture, con circa 900 dipendenti e forte crescita.",
  "sede": "Monopoli (BA), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "mito ingegneria": {
  "nome": "Mito Ingegneria S.r.l.",
  "sito": "https://www.mitoingegneria.com",
  "settore": "studio di ingegneria",
  "descrizione": "Studio di ingegneria che supporta le aziende su qualità, sicurezza, gestione del rischio ambientale e gare d'appalto (B2B).",
  "sede": "Parma, Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "lopag costruzioni": {
  "nome": "Lopag Costruzioni Srl",
  "sito": "",
  "settore": "costruzioni edili",
  "descrizione": "Piccola impresa di costruzioni edili; non è stato possibile trovare un sito ufficiale, solo una pagina Facebook.",
  "sede": "",
  "fiducia": "bassa",
  "tipo": "azienda",
  "nota": "Nessun sito web ufficiale reperito, solo presenza social"
 },
 "impertek": {
  "nome": "Impertek S.r.l.",
  "sito": "https://www.impertek.com",
  "settore": "componenti per impermeabilizzazione",
  "descrizione": "Produttore dal 1985 di componenti per impermeabilizzazione e supporti per pavimentazioni sopraelevate, esporta per il 60% all'estero (B2B).",
  "sede": "Ceggia (VE), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "sit": {
  "nome": "SIT S.p.A.",
  "sito": "https://www.sitgroup.it",
  "settore": "componenti per il gas e misuratori",
  "descrizione": "Gruppo industriale padovano che sviluppa componenti per sicurezza ed efficienza di apparecchi a gas e misuratori gas, presente in 21 paesi.",
  "sede": "Padova, Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "universita degli studi di ferrara": {
  "nome": "Università degli Studi di Ferrara",
  "sito": "https://www.unife.it",
  "settore": "istruzione e ricerca universitaria",
  "descrizione": "Ateneo pubblico italiano che offre corsi di laurea e attività di ricerca in diverse discipline.",
  "sede": "Ferrara, Italia",
  "fiducia": "alta",
  "tipo": "universita_ente",
  "nota": ""
 },
 "sgr": {
  "nome": "Gruppo SGR S.p.A.",
  "sito": "https://www.grupposgr.it",
  "settore": "distribuzione e vendita gas ed energia",
  "descrizione": "Gruppo energetico riminese dal 1956, attivo in distribuzione gas, vendita di energia, efficienza energetica e rinnovabili, oltre 220.000 clienti.",
  "sede": "Rimini, Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "pickforwin com pronostici sportivi": {
  "nome": "Pickforwin.com - Pronostici sportivi",
  "sito": "http://www.pickforwin.com",
  "settore": "pronostici sportivi statistici",
  "descrizione": "Piccola startup riminese (dal 2011) che offre pronostici calcistici basati su modelli statistico-matematici a utenti privati (B2C).",
  "sede": "Rimini, Italia",
  "fiducia": "media",
  "tipo": "azienda",
  "nota": "Micro-impresa/progetto imprenditoriale personale del co-fondatore"
 },
 "bluenergy": {
  "nome": "Bluenergy Group S.p.A.",
  "sito": "https://www.bluenergygroup.it",
  "settore": "fornitura di luce e gas",
  "descrizione": "Multiutility del Friuli Venezia Giulia (dal 2002) che fornisce energia elettrica e gas a privati, condomini e aziende nel Nord Italia (B2C/B2B).",
  "sede": "Udine, Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "esa software": {
  "nome": "ESA Software (Gruppo TeamSystem)",
  "sito": "https://www.esasoftware.com",
  "settore": "software gestionali ERP",
  "descrizione": "Brand del Gruppo TeamSystem che sviluppa software gestionali, ERP e CRM per piccole e medie imprese italiane (B2B), oltre 30.000 clienti.",
  "sede": "Cesena (FC), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "serint": {
  "nome": "Serint Group Italia S.r.l.",
  "sito": "https://www.serint-group.com",
  "settore": "consulenza sicurezza e ambiente",
  "descrizione": "Società di consulenza (dal 1996) su sicurezza sul lavoro, medicina del lavoro, ambiente, privacy e certificazioni per aziende (B2B).",
  "sede": "Rimini, Italia",
  "fiducia": "media",
  "tipo": "azienda",
  "nota": "Da non confondere con 'Gruppo Serint' (grupposerint.it), altra realtà con nome simile"
 },
 "zte": {
  "nome": "ZTE Corporation / ZTE Italia",
  "sito": "https://www.zte.com.cn",
  "settore": "telecomunicazioni e tecnologia",
  "descrizione": "Multinazionale cinese di apparati e soluzioni per telecomunicazioni, con filiale italiana per operatori e clienti B2B.",
  "sede": "Shenzhen, Cina / Roma, Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "huawei": {
  "nome": "Huawei Technologies",
  "sito": "https://www.huawei.com",
  "settore": "telecomunicazioni e tecnologia",
  "descrizione": "Multinazionale cinese leader in infrastrutture di rete, dispositivi e soluzioni ICT, con operazioni in tutto il mondo, incluso B2B in Italia.",
  "sede": "Shenzhen, Cina",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "alcatel lucent": {
  "nome": "Alcatel-Lucent (oggi parte di Nokia)",
  "sito": "https://www.nokia.com",
  "settore": "telecomunicazioni",
  "descrizione": "Ex gruppo franco-americano di apparati per telecomunicazioni, acquisito da Nokia nel 2016, cliente B2B di operatori telefonici.",
  "sede": "Parigi, Francia (ex sede) / Espoo, Finlandia (Nokia)",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": "Alcatel-Lucent come società indipendente non esiste più, confluita in Nokia"
 },
 "rea reliable energy advisors": {
  "nome": "REA Srl - Reliable Energy Advisors",
  "sito": "https://readvisor.eu",
  "settore": "consulenza energie rinnovabili",
  "descrizione": "Advisor indipendente bolognese specializzato in consulenza tecnica ed economica su energie rinnovabili, efficienza energetica e asset management (B2B).",
  "sede": "Bologna, Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "riccardo raimondi": {
  "nome": "Studio di un commercialista",
  "sito": "",
  "settore": "consulenza fiscale",
  "descrizione": "Commercialista libero professionista presso cui la persona ha lavorato; non è il nome di un'azienda.",
  "sede": "",
  "fiducia": "media",
  "tipo": "libero_professionista",
  "nota": "Nome proprio del professionista, non ragione sociale"
 },
 "studio commerciale iannetta barbara": {
  "nome": "Studio Commerciale Iannetta Barbara",
  "sito": "",
  "settore": "consulenza contabile e fiscale",
  "descrizione": "Studio professionale di commercialista/ragioniere che offre servizi di contabilità e revisione legale a piccole imprese e privati.",
  "sede": "Bologna, Italia (probabile)",
  "fiducia": "bassa",
  "tipo": "libero_professionista",
  "nota": "Trovati solo elenchi generici; nessun sito ufficiale verificato, sede non certa"
 },
 "system logistics krones": {
  "nome": "System Logistics S.p.A. (Krones Group)",
  "sito": "https://www.systemlogistics.com",
  "settore": "automazione di magazzino",
  "descrizione": "Azienda modenese, dal 2018 parte del gruppo tedesco Krones, sviluppa soluzioni di intralogistica e magazzini automatici per Food & Beverage (B2B).",
  "sede": "Fiorano Modenese (MO), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "kelyan": {
  "nome": "Kelyan S.p.A.",
  "sito": "https://www.kelyan.it",
  "settore": "system integrator IT ed ERP",
  "descrizione": "System integrator carpigiano da oltre 30 anni: ERP, CRM, Business Intelligence e infrastrutture IT per aziende (B2B).",
  "sede": "Carpi (MO), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "jtgroup": {
  "nome": "JTGroup",
  "sito": "",
  "settore": "informatica / servizi IT",
  "descrizione": "Nome troppo generico per identificare con certezza l'azienda tra le varie omonime italiane nel settore IT/stampanti.",
  "sede": "",
  "fiducia": "bassa",
  "tipo": "azienda",
  "nota": "Non è stato possibile individuare con certezza quale 'JTGroup' (più aziende omonime in Italia)."
 },
 "florence": {
  "nome": "Gruppo Florence",
  "sito": "https://www.gruppoflorence.it",
  "settore": "manifattura moda di lusso",
  "descrizione": "Polo produttivo italiano che riunisce laboratori di abbigliamento, calzature e pelletteria per grandi brand del lusso (B2B).",
  "sede": "Milano, Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "universita di pisa": {
  "nome": "Università di Pisa",
  "sito": "https://www.unipi.it",
  "settore": "istruzione universitaria",
  "descrizione": "Ateneo pubblico italiano di ricerca e didattica, con docenti e ricercatori in molte discipline.",
  "sede": "Pisa, Italia",
  "fiducia": "alta",
  "tipo": "universita_ente",
  "nota": ""
 },
 "balenciaga": {
  "nome": "Balenciaga",
  "sito": "https://www.balenciaga.com",
  "settore": "moda di lusso",
  "descrizione": "Maison di alta moda francese-spagnola del gruppo Kering, abbigliamento e accessori di lusso per consumatori (B2C).",
  "sede": "Parigi, Francia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "automobili lamborghini": {
  "nome": "Automobili Lamborghini S.p.A.",
  "sito": "https://www.lamborghini.com",
  "settore": "automobili sportive di lusso",
  "descrizione": "Produttore italiano di supercar e SUV di lusso, controllato dal gruppo Volkswagen (Audi), rivolto a clientela B2C facoltosa.",
  "sede": "Sant'Agata Bolognese (BO), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "sergio rossi ppr luxury": {
  "nome": "Sergio Rossi",
  "sito": "https://www.sergiorossi.com",
  "settore": "calzature di lusso",
  "descrizione": "Maison italiana di calzature femminili di lusso, storicamente parte del gruppo PPR (oggi Kering) e poi di altri fondi.",
  "sede": "San Mauro Pascoli (FC), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": "'PPR Luxury Group' era il gruppo proprietario dell'epoca (oggi Kering)."
 },
 "burgo": {
  "nome": "Burgo Group",
  "sito": "https://www.burgo.com",
  "settore": "produzione carta",
  "descrizione": "Gruppo industriale italiano tra i maggiori produttori europei di carta per stampa ed editoria, cliente B2B.",
  "sede": "Altavilla Vicentina (VI), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "manutencoop": {
  "nome": "Manutencoop Facility Management",
  "sito": "https://www.manutencoop.it",
  "settore": "facility management",
  "descrizione": "Cooperativa/società italiana di servizi integrati di pulizia, manutenzione e gestione immobili per clienti pubblici e privati (B2B).",
  "sede": "Zola Predosa (BO), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "manpowergroup": {
  "nome": "ManpowerGroup",
  "sito": "https://www.manpowergroup.it",
  "settore": "lavoro e somministrazione personale",
  "descrizione": "Multinazionale statunitense di servizi per il lavoro, ricerca e selezione, somministrazione e formazione (B2B).",
  "sede": "Milano, Italia (sede italiana)",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "giampi": {
  "nome": "Giampi Srl",
  "sito": "https://www.giampi.com",
  "settore": "carpenteria metallica",
  "descrizione": "Azienda veneta di lavorazioni meccaniche di acciaio, inox e alluminio per strutture industriali (B2B).",
  "sede": "Fontanelle (TV), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "officine piccoli": {
  "nome": "Officine Piccoli S.p.A.",
  "sito": "https://www.officinepiccoli.it",
  "settore": "lavorazione lamiere",
  "descrizione": "Azienda veronese specializzata nel taglio e nella lavorazione a freddo della lamiera per clienti industriali (B2B).",
  "sede": "Castel d'Azzano (VR), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "alma officine meccaniche": {
  "nome": "ALMA Officine Meccaniche S.r.l.",
  "sito": "",
  "settore": "lavorazioni meccaniche di precisione",
  "descrizione": "Officina meccanica bresciana specializzata in lavorazioni di precisione a CNC per l'industria (B2B).",
  "sede": "Brescia, Italia",
  "fiducia": "media",
  "tipo": "azienda",
  "nota": "Esistenza confermata da fonti terze ma nessun sito ufficiale proprio individuato."
 },
 "irradia": {
  "nome": "Irradia S.r.l.",
  "sito": "",
  "settore": "stufe e caldaie a pellet",
  "descrizione": "Azienda italiana produttrice di stufe e caldaie a pellet, oggi non più attiva sotto questa gestione.",
  "sede": "Italia",
  "fiducia": "media",
  "tipo": "azienda",
  "nota": ""
 },
 "arsom": {
  "nome": "Arsom S.r.l.",
  "sito": "",
  "settore": "metalmeccanica",
  "descrizione": "Ex azienda metalmeccanica emiliana (San Martino in Rio, MO), chiusa/in liquidazione dal 2018.",
  "sede": "San Martino in Rio (MO), Italia",
  "fiducia": "media",
  "tipo": "azienda",
  "nota": "Azienda risultata in liquidazione dal 2018; nessun sito attivo."
 },
 "restart engineering": {
  "nome": "Restart Engineering S.r.l.",
  "sito": "https://restartengineering.it",
  "settore": "ingegneria illuminazione pubblica e smart city",
  "descrizione": "Società di ingegneria emiliana specializzata in progettazione di illuminazione pubblica ed efficientamento energetico per enti pubblici e utility (B2B/B2G).",
  "sede": "Novellara (RE), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "engineering": {
  "nome": "Engineering Ingegneria Informatica S.p.A.",
  "sito": "https://www.eng.it",
  "settore": "consulenza e sviluppo software",
  "descrizione": "Grande gruppo italiano di digital transformation e sviluppo software per grandi clienti pubblici e privati (B2B).",
  "sede": "Roma, Italia",
  "fiducia": "media",
  "tipo": "azienda",
  "nota": "Il nome sul CV è generico ('Engineering Srl'); identificazione probabile ma non certa con il gruppo Engineering."
 },
 "immergas": {
  "nome": "Immergas S.p.A.",
  "sito": "https://www.immergas.com",
  "settore": "caldaie e climatizzazione",
  "descrizione": "Produttore italiano di caldaie, pompe di calore e sistemi di climatizzazione per il mercato residenziale (B2C/B2B).",
  "sede": "Brescello (RE), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "de longhi": {
  "nome": "De' Longhi S.p.A.",
  "sito": "https://www.delonghi.com",
  "settore": "elettrodomestici",
  "descrizione": "Multinazionale italiana di piccoli elettrodomestici (macchine da caffè, climatizzatori) per il mercato consumer (B2C).",
  "sede": "Treviso, Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "coswell": {
  "nome": "Coswell S.p.A.",
  "sito": "https://www.coswell.it",
  "settore": "cosmesi e prodotti per la cura della persona",
  "descrizione": "Gruppo italiano familiare che produce e commercializza cosmetici, prodotti per l'igiene e la cura della persona (B2C, GDO e farmacia).",
  "sede": "Funo di Argelato (BO), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "granterre": {
  "nome": "GranTerre",
  "sito": "https://www.granterre.it",
  "settore": "lattiero-caseario e salumi",
  "descrizione": "Gruppo agroalimentare emiliano (marchio Parmareggio) leader nella produzione di Parmigiano Reggiano, burro e salumi (B2C/B2B).",
  "sede": "Modena, Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "nestle": {
  "nome": "Nestlé",
  "sito": "https://www.nestle.it",
  "settore": "industria alimentare",
  "descrizione": "Multinazionale svizzera dell'alimentare, leader mondiale in numerosi settori food & beverage per il consumatore finale (B2C).",
  "sede": "Vevey, Svizzera (sede italiana a Milano)",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "unigra": {
  "nome": "Unigrà S.r.l.",
  "sito": "https://www.unigra.com",
  "settore": "oli e grassi vegetali alimentari",
  "descrizione": "Azienda romagnola leader nella produzione di oli, grassi vegetali e semilavorati per pasticceria, gelateria e industria alimentare (B2B).",
  "sede": "Conselice (RA), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "elisabetta franchi": {
  "nome": "Elisabetta Franchi",
  "sito": "https://www.elisabettafranchi.com",
  "settore": "moda femminile",
  "descrizione": "Maison italiana di moda donna (abbigliamento e accessori) quotata in borsa, rivolta al mercato retail (B2C).",
  "sede": "Bologna, Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "planning continous improvement and s op automotive metal and": {
  "nome": "",
  "sito": "",
  "settore": "",
  "descrizione": "Frammento di testo (titolo/descrizione di ruolo) mal estratto dal PDF, non è il nome di un'azienda.",
  "sede": "",
  "fiducia": "bassa",
  "tipo": "non_azienda",
  "nota": "Rumore di parsing: sembra parte della descrizione di un ruolo, non una ragione sociale."
 },
 "skf": {
  "nome": "SKF Group",
  "sito": "https://www.skf.com",
  "settore": "cuscinetti e componenti industriali",
  "descrizione": "Multinazionale svedese leader mondiale nella produzione di cuscinetti e soluzioni per la trasmissione di potenza, cliente B2B (automotive, ferroviario, industria).",
  "sede": "Göteborg, Svezia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "ruffino": {
  "nome": "Ruffino",
  "sito": "",
  "settore": "vino (incerto)",
  "descrizione": "Nota casa vinicola toscana; nessun riscontro trovato che colleghi la persona citata a questa azienda.",
  "sede": "Pontassieve (FI), Italia",
  "fiducia": "bassa",
  "tipo": "azienda",
  "nota": "I ruoli associati (tirocinio H&S, collaborazione con Calciomercato.it) non risultano coerenti con l'azienda vinicola: probabile errore di abbinamento nel parsing del PDF."
 },
 "plastiblow": {
  "nome": "Plastiblow S.r.l.",
  "sito": "https://www.plastiblow.it",
  "settore": "macchine per estrusione-soffiaggio plastica",
  "descrizione": "Azienda italiana del gruppo Plastimac, costruttrice di macchinari per lo stampaggio soffiaggio di contenitori in plastica (B2B).",
  "sede": "Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "kraussmaffei": {
  "nome": "KraussMaffei",
  "sito": "https://www.kraussmaffei.com",
  "settore": "macchine per materie plastiche e gomma",
  "descrizione": "Gruppo tedesco leader mondiale nella costruzione di macchinari per lo stampaggio a iniezione e l'estrusione di materie plastiche (B2B).",
  "sede": "Monaco di Baviera, Germania",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "negri bossi": {
  "nome": "Negri Bossi",
  "sito": "https://www.negribossi.com",
  "settore": "presse per stampaggio a iniezione plastica",
  "descrizione": "Storica azienda italiana costruttrice di presse a iniezione per materie plastiche, fornitore B2B per l'industria manifatturiera.",
  "sede": "Cologno Monzese (MI), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "cibitex": {
  "nome": "Cibitex S.r.l.",
  "sito": "https://www.cibitex.it",
  "settore": "macchine per il tessile",
  "descrizione": "Azienda lombarda specializzata nella costruzione di macchinari per la finitura e il trattamento ausiliario tessile (B2B).",
  "sede": "Solbiate Olona (VA), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "new rail engineering": {
  "nome": "New Rail Engineering S.r.l.",
  "sito": "http://www.newrail-engineering.it",
  "settore": "ingegneria ferroviaria",
  "descrizione": "Piccola società di ingegneria lombarda specializzata in progettazione, manutenzione e consulenza per veicoli e materiale rotabile ferroviario (B2B).",
  "sede": "Capiago Intimiano (CO), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "responsabile operations idrico area emilia e amministratore unico": {
  "nome": "",
  "sito": "",
  "settore": "",
  "descrizione": "Titolo/ruolo professionale (settore idrico, area Emilia) estratto erroneamente come nome azienda dal PDF.",
  "sede": "",
  "fiducia": "bassa",
  "tipo": "non_azienda",
  "nota": "Rumore di parsing: è la descrizione di un incarico (probabilmente presso HeracquaModena/gruppo Hera), non una ragione sociale."
 },
 "aise engineering": {
  "nome": "AISE Engineering",
  "sito": "",
  "settore": "ingegneria impianti idroelettrici",
  "descrizione": "Piccolo studio tecnico di progettazione reggiano specializzato in impianti idroelettrici, servizi B2B/B2G.",
  "sede": "Reggio Emilia, Italia",
  "fiducia": "media",
  "tipo": "libero_professionista",
  "nota": "Risulta uno studio di progettazione tecnica, non una vera e propria società strutturata; nessun sito ufficiale trovato."
 },
 "husqvarna motorcycles bmw": {
  "nome": "Husqvarna Motorcycles",
  "sito": "https://www.husqvarna-motorcycles.com",
  "settore": "motocicli sportivi ed enduro",
  "descrizione": "Storico marchio di motociclette da fuoristrada e sportive, di proprietà del gruppo BMW/Pierer Mobility, per il mercato consumer (B2C).",
  "sede": "Mattighofen, Austria",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "permasteelisa": {
  "nome": "Permasteelisa S.p.A.",
  "sito": "https://www.permasteelisagroup.com",
  "settore": "facciate e involucri edilizi",
  "descrizione": "Gruppo italiano leader mondiale nella progettazione e costruzione di facciate continue e involucri per grandi edifici, cliente B2B.",
  "sede": "Vittorio Veneto (TV), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "ly company aqualy": {
  "nome": "Ly Company Italia (Aqualy)",
  "sito": "https://aqualy.com",
  "settore": "acqua imbottigliata in brick sostenibile",
  "descrizione": "Azienda italiana (parte del gruppo internazionale Ly Company) che produce acqua in packaging di cartone sostenibile per hotel, aerei e B2B.",
  "sede": "Marradi (FI), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "liverani": {
  "nome": "Liverani Group S.p.A.",
  "sito": "https://www.liveranigroup.com",
  "settore": "pulizia e lavaggio cisterne per trasporto alimentare",
  "descrizione": "Azienda emiliano-romagnola specializzata nel lavaggio e sanificazione di autocisterne per il trasporto di alimenti liquidi (B2B).",
  "sede": "Faenza (RA), Italia",
  "fiducia": "media",
  "tipo": "azienda",
  "nota": "Sito ufficiale non verificato con fetch diretto (errore di rete), ma dati coerenti da più fonti."
 },
 "teoresi": {
  "nome": "Teoresi Group",
  "sito": "https://www.teoresigroup.com/",
  "settore": "ingegneria e consulenza tecnologica",
  "descrizione": "Gruppo di ingegneria italiano (Torino) che offre consulenza e sviluppo tecnologico B2B per automotive, aerospazio, medicale e IT, oltre 1200 dipendenti.",
  "sede": "Torino, Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "meta system": {
  "nome": "Meta System SpA",
  "sito": "https://www.metasystem.it/",
  "settore": "elettronica per automotive",
  "descrizione": "Azienda di Reggio Emilia che progetta e produce sistemi elettronici di sicurezza e comfort per automotive, moto ed energia, fornitore B2B dei costruttori.",
  "sede": "Reggio Emilia, Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "cnh industrial": {
  "nome": "CNH Industrial",
  "sito": "https://www.cnhindustrial.com/it-it/",
  "settore": "veicoli industriali e macchine agricole",
  "descrizione": "Multinazionale italo-americana che progetta e produce macchine agricole, movimento terra, camion e veicoli industriali (Iveco, Case, New Holland).",
  "sede": "Torino, Italia / Paesi Bassi",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "cromology": {
  "nome": "Cromology Italia",
  "sito": "https://www.cromology.it/",
  "settore": "pitture e vernici per edilizia",
  "descrizione": "Produttore e distributore B2B/B2C di pitture e vernici per edilizia (brand MaxMeyer, Duco, Baldini), parte del gruppo Cromology/Nippon Paint.",
  "sede": "Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "carapelli firenze": {
  "nome": "Carapelli Firenze S.p.A.",
  "sito": "https://www.carapelli.it/",
  "settore": "produzione olio extravergine di oliva",
  "descrizione": "Storica azienda toscana (Tavarnelle Val di Pesa) produttrice di olio extravergine di oliva per il mercato B2C, di proprietà del gruppo spagnolo Deoleo.",
  "sede": "Tavarnelle Val di Pesa (FI), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "rinnai": {
  "nome": "Rinnai Italia S.r.l.",
  "sito": "https://rinnai.it/",
  "settore": "scaldabagni e caldaie a gas",
  "descrizione": "Filiale italiana del gruppo giapponese Rinnai, produce e distribuisce scaldabagni, caldaie a condensazione e asciugatrici a gas per il mercato B2C/B2B.",
  "sede": "Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "guess europe sagl": {
  "nome": "Guess Europe Sagl",
  "sito": "https://www.guess.eu/",
  "settore": "abbigliamento e moda",
  "descrizione": "Sede europea del marchio americano Guess, distribuisce abbigliamento, accessori e calzature di moda al consumatore (B2C) in Europa, sede in Svizzera.",
  "sede": "Bioggio, Svizzera",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "alten switzerland": {
  "nome": "ALTEN Switzerland",
  "sito": "https://www.alten.ch/",
  "settore": "ingegneria e consulenza IT",
  "descrizione": "Filiale svizzera del gruppo francese ALTEN, offre consulenza ingegneristica e IT B2B per life sciences, tecnologia e settore pubblico.",
  "sede": "Cham/Zurigo, Svizzera",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "wolters kluwer": {
  "nome": "Wolters Kluwer Italia",
  "sito": "https://www.wolterskluwer.com/it-it",
  "settore": "editoria professionale e software",
  "descrizione": "Filiale italiana del gruppo olandese Wolters Kluwer, fornisce software gestionale, editoria giuridico-fiscale e servizi B2B a professionisti e aziende.",
  "sede": "Milano, Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "lavoratore autonomo": {
  "nome": "Lavoratore autonomo",
  "sito": "",
  "settore": "",
  "descrizione": "Non è un'azienda ma la dicitura LinkedIn per attività da libero professionista (consulenza sviluppo software) di Sebastiano la persona.",
  "sede": "",
  "fiducia": "alta",
  "tipo": "libero_professionista",
  "nota": "Voce di parsing, non un'azienda: attività autonoma della persona stessa."
 },
 "symyx technologies": {
  "nome": "Symyx Technologies",
  "sito": "",
  "settore": "software scientifico per R&D",
  "descrizione": "Ex azienda statunitense di software per ricerca chimica e farmaceutica, acquisita nel 2010 da Accelrys/Dassault Systèmes; non esiste più come entità autonoma.",
  "sede": "Santa Clara, USA (storico)",
  "fiducia": "media",
  "tipo": "azienda",
  "nota": "Azienda cessata/assorbita da tempo; nessun sito ufficiale attivo da verificare."
 },
 "dompe farmaceutici": {
  "nome": "Dompé farmaceutici S.p.A.",
  "sito": "https://www.dompe.com/",
  "settore": "industria farmaceutica e biotecnologie",
  "descrizione": "Azienda biofarmaceutica italiana (Milano) che sviluppa e produce farmaci e terapie per malattie rare, mercato B2B/istituzionale e ricerca.",
  "sede": "Milano, Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "martec marine": {
  "nome": "Martec Marine S.p.A.",
  "sito": "https://martecmarine.it/",
  "settore": "sistemi di sicurezza navale",
  "descrizione": "Azienda italiana (Monza) che progetta sistemi integrati di monitoraggio e controllo per la sicurezza di navi da crociera, militari e mega yacht, mercato B2B.",
  "sede": "Monza, Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "spea": {
  "nome": "SPEA S.p.A.",
  "sito": "https://www.spea.com/",
  "settore": "apparecchiature automatiche di collaudo elettronico",
  "descrizione": "Azienda piemontese che progetta e produce sistemi automatici di test (ATE) per circuiti integrati, sensori e batterie EV, cliente B2B mondiale.",
  "sede": "San Maurizio Canavese (TO), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "longwave": {
  "nome": "Longwave S.p.A.",
  "sito": "https://www.longwave.it/",
  "settore": "cybersecurity e managed IT services",
  "descrizione": "Azienda italiana del gruppo Zucchetti che offre servizi B2B di cybersecurity, infrastruttura, cloud e networking a imprese e pubblica amministrazione.",
  "sede": "Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "matika": {
  "nome": "Matika S.p.A.",
  "sito": "https://www.matika.it/",
  "settore": "cybersecurity e IT managed services",
  "descrizione": "Managed Service Provider IT (Vicenza), parte del gruppo WIIT, offre consulenza, infrastrutture e servizi di cybersecurity B2B in outsourcing.",
  "sede": "Vicenza, Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "wiit": {
  "nome": "Gruppo WIIT",
  "sito": "https://www.wiit.cloud/",
  "settore": "cloud computing",
  "descrizione": "Gruppo italiano quotato in borsa, tra i principali fornitori europei di servizi cloud (private/hybrid) mission-critical B2B per oltre 2000 aziende.",
  "sede": "Milano, Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "lan wan solutions": {
  "nome": "Lan & Wan Solutions Srl",
  "sito": "https://www.lanewan.it/",
  "settore": "system integration IT",
  "descrizione": "System integrator italiano (Padova) specializzato in networking, infrastrutture, sicurezza e servizi gestiti B2B, dal 2022 nel gruppo Tinexta (Corvallis).",
  "sede": "Vigodarzere (PD), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "smit communications": {
  "nome": "SMIT Communications",
  "sito": "https://www.smitcom.it/",
  "settore": "informatica, reti e telefonia",
  "descrizione": "Piccola azienda italiana di servizi IT (informatica, reti, sicurezza, telefonia) B2B per aziende locali; da distinguere da altre società omonime SMIT.",
  "sede": "Italia",
  "fiducia": "media",
  "tipo": "azienda",
  "nota": "Esistono più aziende chiamate SMIT in Italia (segnaletica, informatica); scelta la più coerente col ruolo IT Operations Manager."
 },
 "marte sistemi informatici e telecomunicazioni": {
  "nome": "MARTE srl - Sistemi Informatici e Telecomunicazioni",
  "sito": "https://marte.it/",
  "settore": "consulenza IT e telecomunicazioni",
  "descrizione": "PMI italiana (San Bonifacio, VR) di consulenza IT: server, cloud, hosting, telefonia VOIP e software gestionale per aziende B2B.",
  "sede": "San Bonifacio (VR), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "t systems": {
  "nome": "T-Systems Italia S.p.A.",
  "sito": "https://www.t-systems.com/it/it",
  "settore": "servizi IT e telecomunicazioni",
  "descrizione": "Ex filiale italiana di Deutsche Telekom, offriva servizi IT, cloud e reti gestite B2B; le attività italiane sono state cedute a Engineering nel 2022.",
  "sede": "Assago (MI), Italia",
  "fiducia": "media",
  "tipo": "azienda",
  "nota": "Divisione italiana ceduta a Engineering nel 2022; sito italiano dedicato non più attivo, indicato il sito globale T-Systems."
 },
 "marzotto": {
  "nome": "Marzotto S.p.A.",
  "sito": "https://www.marzottotessuti.it/",
  "settore": "produzione tessile (lana e tessuti)",
  "descrizione": "Storica azienda tessile italiana (Valdagno, VI) che produce tessuti pregiati in lana, fornitore B2B dell'industria della moda, parte del Gruppo Marzotto.",
  "sede": "Valdagno (VI), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "crm informatica": {
  "nome": "C.R.M. Informatica",
  "sito": "https://crminf.com/",
  "settore": "consulenza informatica e software gestionale",
  "descrizione": "Piccola azienda IT del distretto della pelle di Arzignano (VI), fornisce soluzioni ERP e sicurezza informatica B2B a PMI del territorio.",
  "sede": "Arzignano (VI), Italia",
  "fiducia": "media",
  "tipo": "azienda",
  "nota": "In LinkedIn la sigla appare come Snc; oggi risulta registrata come C.R.M. Informatica S.r.l., stessa attività e sede."
 },
 "studio folloni ppi partners": {
  "nome": "Studio Folloni - PPI & Partners",
  "sito": "https://www.ppidottoricommercialisti.it/",
  "settore": "consulenza fiscale e societaria",
  "descrizione": "Studio di dottori commercialisti dell'Emilia Romagna (Reggio Emilia) nato dall'integrazione dello Studio Folloni di Novellara in PPI & Partners, servizi B2B alle imprese.",
  "sede": "Reggio Emilia / Novellara, Italia",
  "fiducia": "alta",
  "tipo": "libero_professionista",
  "nota": ""
 },
 "antress industry": {
  "nome": "Antress Industry S.p.A.",
  "sito": "https://www.antress.it/",
  "settore": "abbigliamento e moda",
  "descrizione": "Azienda modenese del settore abbigliamento, proprietaria/licenziataria del marchio Manila Grace, con rete di boutique in Italia e all'estero (B2C).",
  "sede": "Modena, Italia",
  "fiducia": "media",
  "tipo": "azienda",
  "nota": "Sito non riverificato direttamente via WebFetch; dato ricavato da fonti camerali coerenti col ruolo di Responsabile Amministrativa."
 },
 "pa professionisti associati dottori commercialisti advisor": {
  "nome": "PA Professionisti Associati - Dottori Commercialisti - Advisor",
  "sito": "https://www.studiopa.net/",
  "settore": "consulenza fiscale e societaria",
  "descrizione": "Società tra commercialisti dell'Emilia Romagna (Modena, Reggio Emilia, Parma) che offre consulenza fiscale, legale e del lavoro B2B a imprese.",
  "sede": "Modena, Italia",
  "fiducia": "media",
  "tipo": "libero_professionista",
  "nota": "Sito ricostruito da fonti secondarie (LinkedIn), non aperto direttamente per conferma piena."
 },
 "cm": {
  "nome": "CM",
  "sito": "",
  "settore": "",
  "descrizione": "",
  "sede": "",
  "fiducia": "bassa",
  "tipo": "non_azienda",
  "nota": "Sigla troppo generica e nessun profilo LinkedIn della persona trovato per disambiguare il nome dell'azienda; possibile rumore di parsing."
 },
 "ecommerce ideas": {
  "nome": "Ecommerce Ideas",
  "sito": "",
  "settore": "e-commerce / marketing digitale",
  "descrizione": "Nome generico riferito probabilmente a una piccola realtà o testata sull'e-commerce; non è stato possibile identificare con certezza l'azienda datrice di lavoro.",
  "sede": "Italia",
  "fiducia": "bassa",
  "tipo": "azienda",
  "nota": "Trovata solo una testata giornalistica omonima (ecommerceideas.it) e una persona con questo nome in LinkedIn come luogo di lavoro, non un sito aziendale verificabile."
 },
 "stefano gentilini": {
  "nome": "Stefano Gentilini S.r.l.",
  "sito": "https://www.stefanogentilini.it/",
  "settore": "agenzia di rappresentanza abbigliamento",
  "descrizione": "Azienda bolognese che opera come agente e rappresentante di marchi di abbigliamento e accessori moda, B2B verso il retail multimarca.",
  "sede": "Bologna, Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "steel": {
  "nome": "Steel srl",
  "sito": "",
  "settore": "",
  "descrizione": "",
  "sede": "",
  "fiducia": "bassa",
  "tipo": "non_azienda",
  "nota": "Nome troppo generico: esistono più società 'Steel srl' in Italia in settori diversi (metalmeccanico, elettrodomestici); nessuna riscontrata nel settore moda coerente col ruolo di Sales Manager."
 },
 "chloe": {
  "nome": "Chloé",
  "sito": "https://www.chloe.com/",
  "settore": "moda e pelletteria di lusso",
  "descrizione": "Maison di moda francese di lusso (gruppo Richemont) che produce e vende abbigliamento, borse e accessori B2C ad alta gamma nel mondo.",
  "sede": "Parigi, Francia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "nike": {
  "nome": "Nike Inc.",
  "sito": "https://www.nike.com/",
  "settore": "abbigliamento e calzature sportive",
  "descrizione": "Multinazionale statunitense leader mondiale nella produzione e vendita B2C di calzature, abbigliamento e articoli sportivi.",
  "sede": "Beaverton, Oregon, USA",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "mercedes benz": {
  "nome": "Mercedes-Benz Italia S.p.A.",
  "sito": "https://www.mercedes-benz.it/",
  "settore": "automobili di lusso",
  "descrizione": "Filiale italiana del gruppo tedesco Mercedes-Benz, importa e commercializza autovetture e veicoli commerciali di fascia alta B2C e B2B.",
  "sede": "Roma, Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "de angeli prodotti": {
  "nome": "De Angeli Prodotti S.r.l.",
  "sito": "https://www.deangeliprodotti.com/",
  "settore": "conduttori elettrici industriali",
  "descrizione": "Azienda italiana (Bagnoli di Sopra, PD) che produce conduttori elettrici in rame, alluminio e materiali compositi per il settore energia, mercato B2B.",
  "sede": "Bagnoli di Sopra (PD), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "compass": {
  "nome": "Compass Italia S.r.l.",
  "sito": "",
  "settore": "Consulenza e management sportivo",
  "descrizione": "Agenzia di Bologna che offre consulenza, promozione e gestione dell'immagine di atleti e personaggi dello sport e spettacolo, B2B.",
  "sede": "Bologna, Italia",
  "fiducia": "media",
  "tipo": "azienda",
  "nota": "Nessun sito ufficiale verificabile trovato online (solo pagina LinkedIn e dati camerali); da non confondere con Compass Group Italia (ristorazione) o Compass Banca."
 },
 "italian government tourist board": {
  "nome": "ENIT - Agenzia Nazionale del Turismo",
  "sito": "https://www.enit.it",
  "settore": "Ente pubblico per il turismo",
  "descrizione": "Ente pubblico italiano che promuove l'immagine turistica dell'Italia in Italia e all'estero, verso operatori e pubblico finale.",
  "sede": "Roma, Italia",
  "fiducia": "alta",
  "tipo": "universita_ente",
  "nota": "\"Italian Government Tourist Board\" è la denominazione storica in inglese di ENIT; sito verificato."
 },
 "closing": {
  "nome": "CLOSING",
  "sito": "",
  "settore": "",
  "descrizione": "Nome troppo generico per identificare con certezza un'azienda specifica tra i molti risultati trovati (packaging, engineering, ecc.).",
  "sede": "",
  "fiducia": "bassa",
  "tipo": "azienda",
  "nota": "Non è stato possibile individuare con certezza quale azienda \"CLOSING\" corrisponda alla voce; nessun sito verificato."
 },
 "datalogic": {
  "nome": "Datalogic S.p.A.",
  "sito": "https://www.datalogic.com",
  "settore": "Automazione industriale e lettura dati",
  "descrizione": "Multinazionale quotata in Borsa Italiana che produce lettori di codici a barre, sensori e sistemi di visione per la logistica e l'industria B2B.",
  "sede": "Lippo di Calderara di Reno (Bologna), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "luiss guido carli university": {
  "nome": "LUISS - Libera Università Internazionale degli Studi Sociali Guido Carli",
  "sito": "https://www.luiss.edu",
  "settore": "Università privata",
  "descrizione": "Università privata romana specializzata in economia, management, giurisprudenza e scienze politiche.",
  "sede": "Roma, Italia",
  "fiducia": "alta",
  "tipo": "universita_ente",
  "nota": ""
 },
 "milano international": {
  "nome": "Milano / International",
  "sito": "",
  "settore": "",
  "descrizione": "Voce di parsing che indica localizzazione/ambito geografico (Milano, ruolo internazionale), non un'azienda reale.",
  "sede": "",
  "fiducia": "alta",
  "tipo": "non_azienda",
  "nota": "Rumore di estrazione dal PDF LinkedIn: \"Milano / International\" è una località/ambito, non un datore di lavoro."
 },
 "rimini calcio fc e ac bellaria igea marina": {
  "nome": "Rimini Calcio FC e AC Bellaria Igea Marina",
  "sito": "",
  "settore": "Società calcistiche",
  "descrizione": "Due società calcistiche dilettantistiche/professionistiche della provincia di Rimini, accorpate in una sola voce dal parsing del PDF.",
  "sede": "Rimini / Bellaria Igea Marina, Italia",
  "fiducia": "media",
  "tipo": "azienda",
  "nota": "Voce unisce due club calcistici distinti; nessun sito ufficiale comune verificato, quindi lasciato vuoto."
 },
 "argos surface technologies": {
  "nome": "Argos Surface Technologies",
  "sito": "https://www.argos-st.com",
  "settore": "Trattamenti superficiali metallici",
  "descrizione": "Gruppo industriale del Nord Italia specializzato in trattamenti e rivestimenti superficiali dei metalli per clienti B2B (meccanica, automotive, edilizia).",
  "sede": "Cambiago (Milano), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "nextmediaweb": {
  "nome": "Nextmediaweb S.r.l.",
  "sito": "https://www.calciomercato.it",
  "settore": "Editoria digitale sportiva",
  "descrizione": "Editore digitale romano di testate online, tra cui Calciomercato.it, rivolto al pubblico di appassionati di calcio (B2C).",
  "sede": "Roma, Italia",
  "fiducia": "media",
  "tipo": "azienda",
  "nota": "Sito societario proprio non identificato con certezza; indicato il portale editoriale principale del gruppo, Calciomercato.it."
 },
 "lapi": {
  "nome": "Lapi Group S.p.A.",
  "sito": "https://www.lapigroup.com",
  "settore": "Holding chimico-industriale (gelatine e concia)",
  "descrizione": "Holding toscana attiva nella produzione di gelatine/collagene (Lapi Gelatine) e nella chimica per la concia, fornitore B2B internazionale.",
  "sede": "Santa Croce sull'Arno (Pisa), Italia",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 },
 "klever": {
  "nome": "Klever",
  "sito": "",
  "settore": "",
  "descrizione": "Nome comune a più aziende software distinte (Italia ed estero); non è stato possibile identificare con certezza quale corrisponda alla persona indicata.",
  "sede": "",
  "fiducia": "bassa",
  "tipo": "azienda",
  "nota": "Troppi omonimi (Klever document management poi acquisita da InfoCert, Klever blockchain, altre startup); nessuna corrispondenza verificata."
 },
 "axxam": {
  "nome": "Axxam S.p.A.",
  "sito": "https://axxam.com",
  "settore": "Contract research drug discovery",
  "descrizione": "Contract Research Organization milanese che offre servizi di drug discovery a industrie farmaceutiche e biotech, B2B.",
  "sede": "Milano, Italia (sede operativa a Bresso)",
  "fiducia": "alta",
  "tipo": "azienda",
  "nota": ""
 }
};
