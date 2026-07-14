# Dati utente locali

Questa cartella è la posizione convenzionale dei database personali usati quando Learning Path Planner viene servito via HTTP.

Tutto il contenuto, eccetto questo README, è escluso da Git. Aprendo direttamente `index.html` con `file://`, questa cartella non viene letta: il database operativo è la copia IndexedDB del browser.

## Database convenzionale

Per il caso più semplice:

1. chiamare il file `organizer-data.json`;
2. collocarlo in questa cartella;
3. omettere `db-configuration.json`;
4. avviare un server statico dalla root del progetto.

L'app carica automaticamente `data/user/organizer-data.json`. **Salva** scarica una nuova copia con lo stesso nome; il browser non può sostituire il file presente qui, quindi occorre copiarlo manualmente al posto della versione precedente.

## Database con nome personalizzato

Per usare, ad esempio, `data/user/corso-dotnet.json`, deve esistere anche `data/user/db-configuration.json`:

```json
{
  "kind": "learning-planner-db-configuration",
  "schemaVersion": 1,
  "defaultDatabase": "data/user/corso-dotnet.json"
}
```

Il percorso può essere impostato anche dalle **Impostazioni**. **Applica impostazioni** lo aggiorna soltanto nella pagina; **Salva** scarica sia il database sia `db-configuration.json`. Copiare poi entrambi nei percorsi previsti.

Il percorso deve essere relativo alla root del progetto servita via HTTP. Non sono accettati percorsi assoluti del computer o attraversamenti con `..`.

## Fallback

Via HTTP l'ordine è:

1. database indicato da `db-configuration.json`;
2. `organizer-data.json`;
3. `data/examples/organizer-example.json` in modalità DEMO.

Se la configurazione esiste e indica un file non caricabile, l'app mostra un avviso non bloccante e continua con il fallback. Una configurazione mancante o vuota non genera errori.

Non collocare dati personali in `data/examples/`, che contiene esclusivamente esempi fittizi e versionati. La guida completa è in [`docs/GESTIONE-DATABASE.md`](../../docs/GESTIONE-DATABASE.md).
