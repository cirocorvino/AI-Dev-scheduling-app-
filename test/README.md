# Test

I test usano il runner integrato di Node.js 20+ e non richiedono dipendenze:

```bash
npm test
```

Prima dei test, lo script verifica anche che `js/app.bundle.js` sia sincronizzato con i moduli sorgente e con l'esempio incorporato. `db-configuration.test.js` copre schema, percorsi relativi e nomi riservati. `model.test.js` copre validazione, aggiornamenti e migrazione dei formati precedenti. `planner.test.js` copre capacità, target, eccezioni, Gantt, allocazioni e agenda. `store.test.js` verifica priorità, fallback, avvisi e download condizionale della configurazione.
