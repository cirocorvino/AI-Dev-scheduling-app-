# Architettura

Learning Path Planner è una single-page application statica, senza framework e senza backend. Il browser è l'unico runtime; la fonte primaria è il database indicato da `data/user/db-configuration.json`, seguito dai fallback locali e dall'esempio.

## Componenti

- `model.js` definisce invarianti, normalizza ogni input e migra il formato organizer v1 al formato v2.
- `db-configuration.js` valida la configurazione, limita i percorsi alla root del progetto e costruisce l'URL del database predefinito.
- `planner.js` è un motore puro: calcola capacità, date del Gantt, allocazioni degli argomenti e agenda della settimana.
- `store.js` gestisce lo stato in memoria, il caricamento HTTP e il download dei file JSON.
- `app.js` costruisce la UI con API DOM e `textContent`, senza eseguire HTML proveniente dai file importati.

## Flusso dei dati

```text
db-configuration.json ──► database predefinito ──┐
          │ assente/vuoto/non valido             │
          ▼                                      │
 organizer-data.json ────────────────────────────┤
          │ assente/errore                       │
          ▼                                      │
   esempio fittizio ─────────────────────────────┘
                                                 │
                                                 ▼
 validazione + migrazione ──► stato normalizzato v2
          │                          │
          │                          ├──► calcolo Gantt e settimane
          │                          └──► rendering interfaccia
          │
          └─────────────────────────────► download database JSON v2 + configurazione opzionale
```

Ogni modifica attraversa nuovamente la normalizzazione. Il planner non muta il database e può quindi essere testato separatamente dalla UI.

## Scelte intenzionali

- **Local-first:** nessuna chiamata remota, nessun accesso diretto al filesystem e nessun dato persistito in `localStorage` o IndexedDB.
- **Modello esplicito:** i tipi degli argomenti e i ruoli delle categorie sostituiscono inferenze basate sui nomi.
- **Piano sequenziale:** un modulo inizia dopo la fine del precedente; le eccezioni possono estendere la durata.
- **Date senza orario:** i calcoli usano date ISO in UTC per evitare scarti dovuti all'ora legale.
- **Zero build:** i moduli ES nativi rendono il progetto distribuibile come sito statico.

## Confini attuali

Il motore supporta un solo piano attivo per database, moduli sequenziali e indisponibilità giornaliere per gli slot focus. Lo stato contiene il progresso per argomento, ma l'interfaccia di avanzamento non è ancora esposta.
