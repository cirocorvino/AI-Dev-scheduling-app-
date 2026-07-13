# Learning Path Planner

Applicazione web **local-first** per progettare un percorso di apprendimento, stimarne la durata e distribuirne gli argomenti negli slot disponibili della settimana.

Il piano viene mostrato su un diagramma di Gantt e, per ogni settimana, come agenda operativa con argomenti, tempi e indisponibilità. Non richiede backend, account o servizi cloud: database e programmi sono file JSON scelti esplicitamente dall'utente.

## Funzioni principali

- moduli sequenziali, argomenti tipizzati e settimane di recupero;
- stime in minuti e moltiplicatori configurabili per teoria, pratica, esercizi e progetti;
- categorie personalizzabili con ruoli `focus`, `busy` e `neutral`;
- template settimanale con più slot per giorno;
- target settimanale e date eccezionali che riducono la capacità reale;
- Gantt calcolato sulla disponibilità effettiva e dettaglio di ogni settimana;
- apertura e salvataggio locale, con fallback tramite download JSON;
- importazione di piani v2 e migrazione automatica dei precedenti file organizer v1;
- nessun caricamento automatico di file personali.

## Avvio locale

Il progetto usa moduli JavaScript nativi, quindi va servito via HTTP:

```bash
python -m http.server 3001
```

oppure:

```bash
php -S localhost:3001
```

Aprire `http://localhost:3001`. Non sono necessarie dipendenze runtime o una fase di build.

Per eseguire i test serve Node.js 20 o successivo:

```bash
npm test
```

## Uso

1. Aprire **Impostazioni** per definire categorie, disponibilità ricorrenti, target ed eccezioni.
2. Aprire **Moduli e argomenti** per comporre il percorso e ordinare le attività.
3. Consultare il Gantt; selezionare un modulo per vedere la distribuzione settimanale.
4. Usare **Salva** per scrivere il database nel file aperto o scaricarne una copia.
5. Usare **Importa piano** per sostituire soltanto il percorso, conservando disponibilità e categorie.

All'avvio viene caricato esclusivamente il database fittizio in `data/examples/`. I file personali vanno aperti manualmente.

## Struttura

```text
index.html                 interfaccia e dialog di modifica
Style/                     foglio di stile, manifest e icona
js/model.js                schema, validazione e migrazione v1
js/planner.js              capacità, Gantt e agenda settimanale
js/store.js                stato e I/O locale dei file JSON
js/app.js                  rendering e interazioni UI
data/examples/             database dimostrativo versionato
data/user/                 database locali ignorati da Git
data/private/              documenti privati ignorati da Git
test/                      test automatici del modello e del planner
docs/                      formato dati, architettura, privacy e roadmap
```

## Formati e privacy

Il formato v2 è documentato in [docs/JSON-DATABASE.md](docs/JSON-DATABASE.md). Un piano importabile è disponibile in [data/study-program-example.json](data/study-program-example.json).

`data/user/` e `data/private/` sono esclusi da Git salvo i rispettivi README. Prima di rendere pubblico un repository che in passato ha contenuto dati personali, cancellare i file dal ramo corrente **non basta**: occorre pubblicare da una cronologia nuova o riscrivere e sostituire l'intera cronologia. La procedura è in [docs/PRIVACY.md](docs/PRIVACY.md).

## Licenza

Codice distribuito con licenza MIT.
