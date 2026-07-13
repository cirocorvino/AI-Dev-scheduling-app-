# Roadmap

La versione 2 rende il nucleo general-purpose e separa modello, calcolo, persistenza e UI. Gli sviluppi successivi possono restare compatibili con il formato corrente.

## Priorità consigliate

1. Esporre nell'interfaccia il progresso per argomento già previsto in `state.progress`.
2. Aggiungere override di singoli slot, non solo indisponibilità dell'intera giornata focus.
3. Supportare più piani nello stesso database e scenari alternativi senza duplicare il file.
4. Aggiungere dipendenze e parallelismo opzionale tra moduli, mantenendo il piano sequenziale come default.
5. Migliorare accessibilità del Gantt con vista tabellare completa e navigazione da tastiera.
6. Aggiungere test end-to-end automatizzati sui principali browser.
7. Internazionalizzare tutte le etichette dell'interfaccia, oggi in italiano pur rispettando il locale per le date.

## Criteri per nuove funzioni

Le nuove opzioni devono essere esplicite nel JSON, non dedotte dal testo libero; devono funzionare offline; devono attraversare la normalizzazione del modello; e devono avere almeno un test del caso nominale e uno di errore.
