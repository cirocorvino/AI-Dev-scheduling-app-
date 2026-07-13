# Guida dell'interfaccia

L'interfaccia di Learning Path Planner è divisa in quattro aree principali: intestazione, azioni sul database, riepilogo con Gantt e dettaglio settimanale. Due finestre di modifica permettono di configurare disponibilità e contenuti senza intervenire direttamente sul JSON.

## Intestazione e stato

L'intestazione mostra il titolo e la descrizione del percorso attivo. Sulla destra compare lo stato del database:

- `✓` indica che il database è stato aperto o salvato e non contiene modifiche pendenti;
- `●` indica che esistono modifiche non ancora salvate;
- eventuali errori di apertura, validazione o salvataggio vengono mostrati nello stesso spazio.

Chiudendo o ricaricando la pagina con modifiche pendenti, il browser chiede conferma.

## Barra delle azioni

### Nuovo

Crea un database vuoto con categorie generiche e nessun modulo. Se esistono modifiche non salvate, viene chiesta conferma prima di sostituire il lavoro corrente.

### Apri database

Apre un database completo e sostituisce l'intero stato corrente:

- nome e metadati;
- categorie e relativi ruoli;
- settimana tipo ed eccezioni;
- impostazioni di stima;
- programma, moduli, argomenti e progresso.

I database organizer v1 vengono migrati in memoria al formato v2. Il file originale non viene modificato finché non si preme **Salva**.

### Salva

Scrive l'intero database corrente in formato JSON v2. Se il database è stato aperto con un browser che supporta l'accesso diretto ai file, viene aggiornato quel file. Negli altri casi viene chiesto dove creare il file oppure ne viene scaricata una copia.

Dopo **Importa programma**, il salvataggio registra il programma importato all'interno del database corrente.

### Importa programma

Sostituisce soltanto il percorso di apprendimento:

- titolo e descrizione;
- data iniziale e target settimanale;
- moduli e argomenti.

Categorie, settimana tipo, eccezioni e moltiplicatori restano quelli del database aperto. Il progresso precedente viene azzerato. L'operazione resta pendente fino al successivo salvataggio.

### Impostazioni

Apre l'editor del database e della disponibilità. Da qui si modificano:

- nome del database, titolo e descrizione del percorso;
- data iniziale, target settimanale, lingua e fuso orario;
- coefficienti applicati alle stime dei diversi tipi di argomento;
- categorie, icone, colori e ruoli;
- attività ricorrenti e slot disponibili per ogni giorno;
- eccezioni del calendario.

Le eccezioni usano una riga per data nel formato:

```text
2026-12-25 | Festività
```

Gli slot `focus` di quella giornata vengono esclusi dal calcolo e il Gantt può allungarsi.

### Moduli e argomenti

Apre l'editor del contenuto del percorso. I moduli possono essere riordinati, eliminati o trasformati in settimane di pausa. Ogni modulo attivo contiene argomenti con titolo, tipo e stima in minuti.

L'ordine dei moduli determina l'ordine del Gantt. Un modulo `buffer` occupa un numero fisso di settimane e non contiene argomenti.

## Riepilogo

Le schede sotto la barra delle azioni mostrano:

- **Impegno totale:** somma delle stime degli argomenti dopo l'applicazione dei coefficienti;
- **Durata:** settimane necessarie includendo pause ed eventuali riduzioni di capacità;
- **Moduli:** numero di moduli attivi e buffer;
- **Capacità settimanale:** durata complessiva degli slot appartenenti a categorie `focus` nella settimana tipo;
- **Conclusione stimata:** ultimo giorno previsto dal piano.

Un avviso compare quando mancano slot focus, il target supera la capacità o una migrazione richiede attenzione.

## Diagramma di Gantt

Il Gantt rappresenta i moduli in sequenza. Ogni riga riporta nome, impegno, numero di settimane, periodo e barra temporale colorata.

Selezionando la barra di un modulo si apre il relativo dettaglio settimanale. Le date vengono ricalcolate quando cambiano stime, target, disponibilità o eccezioni.

## Dettaglio settimanale

Il dettaglio mostra una scheda per ciascuna settimana del modulo. In alto sono riepilogati gli argomenti e i minuti assegnati; sotto appare l'agenda dei sette giorni.

Ogni attività mostra:

- orario di inizio e fine;
- icona e **Nome** della categoria, per esempio `📚 Studio`;
- eventuale descrizione specifica dello slot;
- argomenti pianificati e minuti assegnati;
- eventuale **Spazio focus libero**, indicato solo per i minuti rimasti non assegnati.

Le attività con ruolo `busy` o `neutral` sono informative e non ricevono argomenti. Una giornata bloccata da un'eccezione mostra l'indisponibilità al posto delle assegnazioni.

## Ruoli delle categorie

- `focus`: fornisce tempo utilizzabile dal motore per distribuire gli argomenti;
- `busy`: rappresenta un impegno che appare nell'agenda ma non offre capacità;
- `neutral`: rappresenta un'informazione o attività non pianificabile.

Il **Nome** è l'etichetta mostrata nell'agenda; l'ID è il riferimento stabile usato dal file JSON.
