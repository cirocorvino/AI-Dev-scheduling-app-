# Gestione del database

Learning Path Planner può essere usato direttamente dal disco oppure tramite un server statico. Le due modalità mostrano la stessa interfaccia, ma usano fonti e meccanismi di persistenza diversi.

L'app non ottiene mai un collegamento permanente e scrivibile a un file scelto dall'utente. **Apri database** importa una copia del JSON; **Salva** genera un nuovo download. Questa limitazione dipende dalle regole di sicurezza del browser.

## Scegliere la modalità

| Comportamento | Apertura diretta `file://` | Server HTTP o GitHub Pages |
|---|---|---|
| Fonte all'avvio | Copia IndexedDB del browser | File JSON del progetto |
| Primo avvio senza dati | Planner vuoto, senza DEMO | Fallback all'esempio DEMO |
| Persistenza delle modifiche | Automatica in IndexedDB | In memoria fino al download |
| Funzione di **Salva** | Esporta un backup JSON | Scarica i file da ricollocare nel progetto |
| `db-configuration.json` | Ignorato | Letto all'avvio e generato quando necessario |
| Scrittura diretta sul file originale | No | No |

La modalità `file://` è consigliata per l'uso personale senza configurazione. Il server HTTP è preferibile usare un database predefinito presente nel progetto.

## Uso diretto dal disco (`file://`)

Aprire `index.html` con il browser. Il bundle classico incluso nel progetto non richiede un server.

### Primo utilizzo

Se IndexedDB non contiene ancora una copia locale, l'app presenta un planner vuoto:

1. aprire **Impostazioni** per configurare nome, disponibilità, categorie ed eccezioni;
2. aprire **Moduli e argomenti** e aggiungere il primo modulo;
3. continuare a lavorare: ogni operazione applicata viene registrata automaticamente in IndexedDB;
4. premere periodicamente **Salva** per conservare anche un backup JSON portabile.

In questo stato **Nuovo** è disabilitato perché il database è già vuoto. Si abilita quando il piano contiene moduli.

### Partire da un JSON esistente

1. premere **Apri database**;
2. scegliere il file JSON;
3. lavorare normalmente sulla copia importata;
4. usare **Salva** quando si vuole esportare una nuova versione del file.

Il file scelto non resta collegato all'app e non viene modificato. Ai successivi avvii lo stesso browser e lo stesso profilo ripristinano la copia IndexedDB, anche se il JSON originale è stato spostato o eliminato.

### Cosa viene conservato

**Applica impostazioni**, **Aggiorna il piano**, **Importa programma**, **Apri database** e **Nuovo** aggiornano la copia IndexedDB. Il pallino `●` indica che la versione corrente non è ancora stata esportata con **Salva**; non significa che l'autosalvataggio nel browser sia fallito.

IndexedDB è locale al browser, al profilo e al contesto di apertura. Non viene condiviso automaticamente con altri browser, altri profili o la versione HTTP dell'app. La navigazione privata e la cancellazione dei dati del browser possono eliminarlo.

Per rimuovere intenzionalmente la copia, usare **Impostazioni → Rimuovi database locale**. L'operazione cancella IndexedDB ma non elimina i JSON già esportati.

## Uso tramite server HTTP

Avviare il server dalla root del progetto, per esempio:

```bash
python -m http.server 3001
```

e aprire `http://localhost:3001`.

All'avvio l'app cerca, in ordine:

1. il database indicato da `data/user/db-configuration.json`;
2. `data/user/organizer-data.json`;
3. `data/examples/organizer-example.json`, mostrato in modalità DEMO.

L'assenza della configurazione o dei normali fallback è gestita in modo trasparente. Se una configurazione esistente è invalida oppure indica esplicitamente un database non caricabile, compare un avviso non bloccante e viene aperto il fallback successivo.

Il browser carica soltanto risorse raggiungibili sotto la root del server. Il campo di configurazione accetta quindi un percorso relativo al progetto, non un percorso assoluto come `C:\Users\nome\Documenti\database.json`.

### Caso consigliato: nome convenzionale

È il flusso più semplice per mantenere un unico database:

1. collocare il file in `data/user/organizer-data.json`;
2. omettere `data/user/db-configuration.json`, oppure lasciarlo senza `defaultDatabase`;
3. avviare il server e aprire l'app;
4. apportare le modifiche;
5. premere **Salva**: il browser scarica `organizer-data.json`;
6. sostituire manualmente `data/user/organizer-data.json` con il file scaricato.

In questo caso non viene generato `db-configuration.json`, perché il nome convenzionale è già cablato nell'app.

### Caso avanzato: nome personalizzato

Usare questo flusso per un file come `data/user/corso-dotnet.json`:

1. aprire **Impostazioni**;
2. inserire nel campo **Percorso database** `data/user/corso-dotnet.json`;
3. premere **Applica impostazioni**: il percorso entra nello stato corrente, ma nessun file viene ancora creato sul disco;
4. premere **Salva**: vengono scaricati `corso-dotnet.json` e `db-configuration.json`;
5. copiare `corso-dotnet.json` nel percorso dichiarato e `db-configuration.json` in `data/user/`;
6. ricaricare la pagina per verificare il caricamento automatico.

Lo stesso risultato può essere preparato manualmente creando `data/user/db-configuration.json`:

```json
{
  "kind": "learning-planner-db-configuration",
  "schemaVersion": 1,
  "defaultDatabase": "data/user/corso-dotnet.json"
}
```

Svuotando **Percorso database** e salvando si torna al nome convenzionale `data/user/organizer-data.json`; viene scaricato soltanto il database.

### Modifiche e salvataggio via HTTP

Le modifiche applicate restano nella memoria della pagina. **Salva** scarica una fotografia JSON aggiornata, ma non può sovrascrivere automaticamente il file servito. Prima di chiudere o ricaricare la pagina:

1. premere **Salva**;
2. copiare i file scaricati nelle rispettive posizioni;
3. ricaricare e controllare che il database corretto venga aperto.

**Apri database** può essere usato anche via HTTP per importare una copia scelta manualmente. Se il file si chiama `organizer-data.json`, resta attivo il nome convenzionale; con qualsiasi altro nome, **Salva** scarica anche una configurazione che lo colloca convenzionalmente sotto `data/user/`.

## Passare da una modalità all'altra

Le copie `file://` e HTTP sono indipendenti.

- Da `file://` a HTTP: premere **Salva**, copiare il JSON in `data/user/organizer-data.json` oppure configurarne il percorso personalizzato, quindi avviare il server.
- Da HTTP a `file://`: premere **Salva**, aprire direttamente `index.html` e importare il JSON con **Apri database**.
- Tra browser o profili diversi: esportare il JSON nel browser di origine e importarlo in quello di destinazione.

## Strategia consigliata

- Usare IndexedDB come copia di lavoro comoda, non come unico backup.
- Esportare regolarmente il JSON con **Salva**.
- Conservare copie datate fuori dal repository se il database contiene informazioni personali.
- Non collocare dati personali in `data/examples/`.
- Non pubblicare un database personale su GitHub Pages: ogni file distribuito con il sito è accessibile ai visitatori.

Il formato dei file è descritto in [JSON-DATABASE.md](JSON-DATABASE.md); i dettagli dei comandi sono in [INTERFACCIA.md](INTERFACCIA.md).
