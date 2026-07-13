# Test

I test usano il runner integrato di Node.js 20+ e non richiedono dipendenze:

```bash
npm test
```

`model.test.js` copre validazione, aggiornamenti e migrazione dei formati precedenti. `planner.test.js` copre capacità, target, eccezioni, Gantt, allocazioni e agenda. `store.test.js` verifica il caricamento automatico del database utente e il fallback sull'esempio.
