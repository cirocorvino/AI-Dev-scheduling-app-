# 📊 Piano di Studio AI Development - Sistema Completo

> **Applicazione web per la gestione e pianificazione di percorsi formativi in AI/Machine Learning con calcolo ore effettive e sistema di logging avanzato.**

![Version](https://img.shields.io/badge/version-2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![PWA](https://img.shields.io/badge/PWA-Ready-purple)

## 🚀 Caratteristiche Principali

- **📈 Gantt Chart Interattivo** - Visualizzazione temporale dei corsi
- **🧮 Calcolo Ore Effettive** - Algoritmi avanzati per stima realistica dei tempi
- **💾 Gestione Piani Multipli** - Salvataggio e caricamento di piani personalizzati  
- **📱 PWA Ready** - Installabile come app nativa
- **🔧 Sistema Logger Avanzato** - Controllo granulare dei log con persistenza
- **🎯 Dettagli Corsi** - Vista dettagliata per settimana con personalizzazione
- **📊 Statistiche Avanzate** - Monitoraggio completo del percorso formativo

## 📋 Indice

- [Installazione](#-installazione)
- [Utilizzo](#-utilizzo)  
- [Struttura del Progetto](#-struttura-del-progetto)
- [Sistema di Logging](#-sistema-di-logging)
- [API e Configurazione](#-api-e-configurazione)
- [Sviluppo](#-sviluppo)
- [Contributi](#-contributi)
- [Licenza](#-licenza)

## 🛠 Installazione

### Prerequisiti
- Browser moderno con supporto ES6+
- Server HTTP locale (opzionale per sviluppo)

### Setup Rapido

1. **Clona il repository:**
```bash
git clone https://github.com/cirocorvino/app.git
cd app
```

2. **Avvia server locale** (opzionale):
```bash
# Con Node.js
npx http-server . -p 3000

# Con Python 3
python -m http.server 3000

# Con PHP
php -S localhost:3000
```

3. **Apri l'app:**
- Server locale: `http://localhost:3000`
- File diretto: Apri `index.html` nel browser

## 📖 Utilizzo

### Gestione Piani di Studio

#### Creazione Nuovo Piano
1. Modifica titolo e descrizione nell'header (click per editare)
2. Ajusta parametri di calcolo nel pannello laterale
3. Imposta data inizio e ore settimanali
4. Salva con il pulsante **"Salva Piano"**

#### Caricamento Piano Esistente  
1. Click su **"Carica Piano"**
2. Seleziona dalla lista dei piani salvati
3. Conferma per caricare i dati

### Personalizzazione Corsi

#### Vista Dettaglio Corso
- Click su qualsiasi corso nel Gantt per aprire i dettagli
- Visualizza settimane e moduli specifici
- Personalizza contenuti per settimana

#### Parametri di Calcolo
- **Teoria**: Moltiplicatore per moduli teorici (default: 1.2x)
- **Pratica**: Moltiplicatore per moduli pratici (default: 1.5x)  
- **Esercitazioni**: Ore fisse per esercitazioni (default: 4h)
- **Progetti**: Ore fisse per progetti (default: 8h)

### Sistema di Logging

#### Controllo Base
```javascript
// Console del browser
disableLogs()    // Disabilita tutti i log
enableLogs()     // Abilita tutti i log
prodMode()       // Solo errori (produzione)
devMode()        // Tutti i log (sviluppo)
logStatus()      // Mostra stato attuale
resetLogs()      // Reset ai default
```

#### Controllo Granulare
```javascript
// Disabilita/abilita categorie specifiche
LogControl.disableCategory('debug')  // No debug
LogControl.enableCategory('save')    // Solo salvataggio
LogControl.productionMode()          // Solo errori
```

#### Categorie Disponibili
- **🔍 DEBUG** - Debug generale e inizializzazione
- **💾 SAVE** - Operazioni di salvataggio
- **📁 LOAD** - Operazioni di caricamento  
- **🖥️ UI** - Aggiornamenti interfaccia
- **📊 CALC** - Calcoli e statistiche
- **🧪 TEST** - Log di test
- **❌ ERROR** - Errori e avvisi

## 📁 Struttura del Progetto

```
app/
├── 📄 index.html              # Pagina principale
├── 📄 README.md              # Questo file
├── 📁 js/                    # JavaScript modules
│   ├── 🟨 main.js            # Inizializzazione app
│   ├── 🟨 logger.js          # Sistema logging avanzato
│   ├── 🟨 planManager.js     # Gestione piani
│   ├── 🟨 calculations.js    # Calcoli ore effettive
│   ├── 🟨 uiManager.js       # Gestione UI
│   ├── 🟨 ganttChart.js      # Grafico Gantt
│   ├── 🟨 courseDetail.js    # Dettagli corsi
│   ├── 🟨 modalManager.js    # Gestione modali
│   ├── 🟨 data.js            # Dati curriculum
│   └── 🟨 config.js          # Configurazione globale
├── 📁 Style/                 # Assets e stili
│   ├── 🎨 styles.css         # Stili principali
│   ├── 🖼️ favicon.svg        # Favicon SVG
│   ├── 🖼️ favicon.ico        # Favicon ICO
│   └── 📄 manifest.json      # PWA manifest
├── 📁 data/                  # Dati JSON
│   └── 📊 piano-studio-*.json # Piani predefiniti
├── 📁 doc/                   # Documentazione
│   ├── 📝 CONVERSIONE_LOGGER_COMPLETATA.md
│   ├── 📝 SISTEMA_SALVATAGGIO_COMPLETO.md  
│   ├── 📝 SPIEGAZIONE_SETTIMANE.md
│   ├── 📝 CORREZIONI_ORE.md
│   └── 📝 FAVICON_README.md
└── 📁 test/                  # Script di test
    ├── 🧪 test_conversione_logger.js
    ├── 🧪 test_persistenza_logger.js
    ├── 🧪 test_completo_salvataggio.js
    └── 🧪 ... altri test
```

## 🔧 Sistema di Logging

### Architettura
Il sistema di logging è stato completamente convertito da `console.log` sparsi a un sistema centralizzato e configurabile con **persistenza automatica**.

### Vantaggi
- ✅ **Controllo centralizzato** di tutti i log
- ✅ **Granularità per categoria** (DEBUG, SAVE, UI, etc.)
- ✅ **Persistenza** - Le impostazioni sopravvivono al refresh
- ✅ **Modalità produzione** - Solo errori critici
- ✅ **Performance** - Log disabilitati = zero overhead
- ✅ **Developer friendly** - Emoji e categorizzazione

### Esempi d'Uso

```javascript
// Nell'applicazione
Logger.save('Piano salvato con successo', planData);
Logger.calc('Ore calcolate:', totalHours);
Logger.ui('Interfaccia aggiornata');
Logger.error('Errore critico!', error);

// Controllo runtime
disableLogs();        // Spegne tutto
prodMode();           // Solo errori  
devMode();            // Debug completo
```

## ⚙️ API e Configurazione

### Variabili Globali Principali
```javascript
// Configurazione calcoli
calculationParams = {
    theoryMultiplier: 1.2,    // Moltiplicatore teoria
    practiceMultiplier: 1.5,  // Moltiplicatore pratica
    exerciseHours: 4,         // Ore fisse esercitazioni
    projectHours: 8           // Ore fisse progetti
}

// Piano corrente
currentPlanName          // Nome piano attivo
currentPlanDescription   // Descrizione piano
currentPlanId           // ID univoco piano
courses                 // Array corsi con ore calcolate
```

### Funzioni API Principali
```javascript
// Calcoli
calculateCourseEffectiveHours(courseName)  // Ore effettive corso
recalculateAllEffectiveHours()             // Ricalcola tutto
updateCalculationParam(param, value)       // Aggiorna parametro

// Gestione Piani  
savePlan()                                 // Salva piano corrente
loadPlan(planId)                          // Carica piano specifico
getSavedPlans()                           // Lista piani salvati
deletePlan(planId)                        // Elimina piano

// UI
renderGantt()                             // Ridisegna Gantt
updateStats()                             // Aggiorna statistiche
showCourseDetail(courseName)              // Mostra dettaglio corso
```

## 🛠 Sviluppo

### File Principali da Modificare

#### Aggiungere Nuovo Corso
1. **`js/data.js`** - Aggiungi corso nel `curriculum`
2. **`js/config.js`** - Aggiungi nella lista `courses`
3. **Ricarica app** - Il sistema ricalcolerà automaticamente

#### Modificare Algoritmo Calcolo Ore
1. **`js/calculations.js`** - Funzione `calculateModuleEffectiveTime()`
2. **Test** - Verifica con `test/test_calcoli_corretti.js`

#### Personalizzare UI
1. **`Style/styles.css`** - Stili principali
2. **`js/uiManager.js`** - Logica interfaccia
3. **`js/ganttChart.js`** - Grafico timeline

### Testing

#### Test Logger
```bash
# Nel browser console
testLogger()          # Test sistema logging
testPersistenza()     # Test persistenza configurazioni
```

#### Test Completo App
```bash
# Carica script test specifici da cartella test/
# Esempi disponibili:
# - test_completo_salvataggio.js
# - test_calcoli_corretti.js  
# - test_simulazione_utente.js
```

### Debug

#### Modalità Sviluppo
```javascript
devMode();                    // Abilita tutti i log
LogControl.enableCategory('debug'); // Solo debug
```

#### Controllo Prestazioni  
```javascript
prodMode();                   // Solo errori
performance.now();            // Timing operazioni
```

## 🎯 Funzionalità Avanzate

### PWA (Progressive Web App)
- **Installabile** su desktop e mobile
- **Offline ready** (cache automatica)
- **Icone native** per tutti i dispositivi
- **Manifest** configurato in `Style/manifest.json`

### Calcoli Intelligenti
- **Algoritmi adattivi** per stima ore realistiche
- **Differenziazione** teoria/pratica/progetti
- **Cache intelligente** per performance
- **Ricalcolo automatico** su modifiche parametri

### Gestione Dati Robusta
- **localStorage** per persistenza locale
- **JSON export/import** per backup
- **Metadata completi** (date, versioni, etc.)
- **Recovery automatico** da errori

## 📊 Metriche e Statistiche

L'app fornisce statistiche complete:
- **Ore totali** del percorso
- **Settimane necessarie** (calcolo reale)
- **Date inizio/fine** stimate  
- **Numero corsi** totali
- **Progresso** per categoria (teoria/pratica)

## 🤝 Contributi

### Come Contribuire
1. Fork del repository
2. Crea branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit delle modifiche (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

### Guidelines
- ✅ Usa il sistema Logger per tutti i log
- ✅ Testa le modifiche con gli script in `test/`
- ✅ Documenta nuove funzionalità
- ✅ Mantieni compatibilità browser moderni

## 📄 Licenza

Questo progetto è rilasciato sotto licenza **MIT**. Vedi il file `LICENSE` per dettagli.

---

## 🏆 Changelog Recente

### v2.0 - Sistema Logger Avanzato
- ✅ **Conversione completa** da console.log a Logger centralizzato
- ✅ **29 log convertiti** in 5 file principali  
- ✅ **Persistenza automatica** delle configurazioni
- ✅ **7 categorie** di log configurabili
- ✅ **Modalità produzione/sviluppo** con un comando
- ✅ **Zero console.log residui** nell'app

### v1.x - Funzionalità Base
- ✅ Gantt Chart interattivo
- ✅ Calcolo ore effettive
- ✅ Gestione piani multipli
- ✅ PWA support
- ✅ Sistema salvataggio completo

---

**Made with ❤️ for AI/ML Learning**

> 💡 **Tip**: Usa `devMode()` durante lo sviluppo e `prodMode()` per demo/produzione!

---

### 📞 Supporto

Per domande, bug reports o richieste di funzionalità:
- 📧 **Issues**: Usa le GitHub Issues
- 📚 **Docs**: Controlla la cartella `doc/`
- 🧪 **Test**: Esegui gli script in `test/`
- 🔧 **Debug**: Usa il sistema Logger integrato