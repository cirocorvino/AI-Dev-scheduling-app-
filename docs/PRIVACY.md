# Privacy e pubblicazione

Un database può rivelare nomi, impegni, orari, assenze e programmi personali. Via HTTP l'app carica file distribuiti dal server; via `file://` conserva invece la copia di lavoro nel profilo del browser tramite IndexedDB. In nessuna modalità il codice invia il database a servizi esterni.

## Regole del repository

- `data/examples/` contiene solo dati inventati e revisionabili.
- `data/user/` contiene database locali ed è ignorata da Git.
- `db-configuration.json` è ignorato insieme agli altri dati utente e può rivelare il nome del database personale.
- `data/private/` contiene note o materiale di supporto locale ed è ignorata da Git.
- esportazioni, backup, file `.env` e varianti `*.personal.json`, `*.private.json`, `*.local.json` e `*.secret.json` sono ignorati.
- nessun dato importato viene inviato in rete dal codice dell'app.
- la copia IndexedDB resta associata al browser, al profilo e all'origine locale; può essere rimossa dalle Impostazioni dell'app o cancellando i dati del browser.
- il JSON esportato con **Salva** resta il backup portabile consigliato: IndexedDB non sostituisce una strategia di backup.

## Scelta della modalità e backup

- In `file://`, i dati non vengono pubblicati, ma possono andare persi cancellando IndexedDB, usando un altro profilo o disinstallando il browser. Esportare periodicamente un JSON.
- Via HTTP locale, ogni file collocato sotto la root del server può essere richiesto da chi riesce a raggiungere quel server.
- Su GitHub Pages, Netlify o servizi equivalenti, tutti i database inclusi nell'artefatto pubblicato devono essere considerati pubblici, anche se non sono collegati visivamente nell'interfaccia.
- `data/user/` è ignorata da Git per impostazione predefinita. Non forzare l'aggiunta di un database personale per farlo funzionare su GitHub Pages; usare esclusivamente dati fittizi per una DEMO pubblica.
- `db-configuration.json` può rivelare nomi e organizzazione dei file anche quando non contiene direttamente il database.

Le differenze operative tra IndexedDB, file serviti e download sono descritte in [GESTIONE-DATABASE.md](GESTIONE-DATABASE.md).

## Prima di rendere pubblico un repository esistente

Rimuovere un file con un nuovo commit non lo elimina dai commit precedenti, dai branch remoti, dai tag, dalle pull request o dai fork. Prima della pubblicazione:

1. revocare eventuali segreti presenti nei file storici;
2. cercare nomi, contatti, percorsi locali, orari e documenti personali in tutti i file destinati alla pubblicazione;
3. creare preferibilmente un repository nuovo dalla sola working tree ripulita;
4. in alternativa riscrivere tutta la cronologia, eliminare branch e tag non bonificati e forzare l'aggiornamento remoto;
5. controllare separatamente descrizione, issue, pull request, commenti, release, artifact e cache CI;
6. clonare il risultato in una directory vuota e ripetere la scansione prima di cambiare la visibilità.

La strategia con repository nuovo è in genere più facile da verificare. Questo progetto non automatizza la cancellazione o la riscrittura remota: sono operazioni irreversibili che vanno eseguite solo dopo aver scelto esplicitamente nome, visibilità e destinazione.
