// config.js - Configurazione generale dell'applicazione

// Icone per i tipi di attività
const activityIcons = {
    study: '📚',
    work: '💼',
    gym: '🏋️',
    community: '👥',
    prayer: '🙏',
    fraternita: '🤝',
    centro: '🏛️',
    uepe: '⚖️',
    altro: '📌'
};

// Etichette per i tipi di attività
const activityLabels = {
    study: 'Studio',
    work: 'Lavoro',
    gym: 'Palestra',
    community: 'Comunità',
    prayer: 'Preghiera',
    fraternita: 'Fraternità',
    centro: 'Centro Domenico',
    uepe: 'UEPE',
    altro: 'Altro'
};

// Template settimanale base
const weekTemplate = {
    'Lunedì': [
        { time: '06:30-07:45', content: '', type: 'prayer' },
        { time: '09:00-18:00', content: '', type: 'work' },
        { time: '21:00-23:00', content: '', type: 'study' }
    ],
    'Martedì': [
        { time: '06:30-07:45', content: '', type: 'prayer' },
        { time: '09:00-18:00', content: '', type: 'work' },
        { time: '21:00-23:00', content: '', type: 'community' }
    ],
    'Mercoledì': [
        { time: '06:30-07:45', content: '', type: 'prayer' },
        { time: '09:00-18:00', content: '', type: 'work' },
        { time: '18:15-19:30', content: '', type: 'gym' },
        { time: '21:00-23:00', content: '', type: 'study' }
    ],
    'Giovedì': [
        { time: '06:30-07:45', content: '', type: 'prayer' },
        { time: '09:00-18:00', content: '', type: 'work' },
        { time: '18:15-19:00', content: '', type: 'gym' },
        { time: '21:00-23:00', content: '', type: 'study' }
    ],
    'Venerdì': [
        { time: '06:30-07:45', content: '', type: 'prayer' },
        { time: '09:00-18:00', content: '', type: 'work' },
        { time: '18:15-19:30', content: '', type: 'gym' },
        { time: '21:00-22:30', content: '', type: 'study' }
    ],
    'Sabato': [
        { time: '07:00-07:45', content: '', type: 'prayer' },
        { time: '09:00-12:00', content: '', type: 'study' },
        { time: '14:00-16:00', content: '', type: 'study' },
        { time: '17:00-18:15', content: '', type: 'gym' },
        { time: '21:00-23:00', content: '', type: 'community' }
    ],
    'Domenica': [
        { time: '07:30-08:45', content: '', type: 'prayer' },
        { time: '11:00-13:00', content: '', type: 'study' },
        { time: '21:00-22:30', content: '', type: 'study' }
    ]
};

// Mappa delle sessioni di studio con le loro durate
const studySchedule = {
    'Lunedì': { sessions: [{ time: '21:00-23:00', hours: 2 }] },
    'Mercoledì': { sessions: [{ time: '21:00-23:00', hours: 2 }] },
    'Giovedì': { sessions: [{ time: '21:00-23:00', hours: 2 }] },
    'Venerdì': { sessions: [{ time: '21:00-22:30', hours: 1.5 }] },
    'Sabato': { sessions: [
        { time: '09:00-12:00', hours: 3 },
        { time: '14:00-16:00', hours: 2 }
    ]},
    'Domenica': { sessions: [
        { time: '11:00-13:00', hours: 2 },
        { time: '21:00-22:30', hours: 1.5 }
    ]}
};

// Parametri modificabili per il calcolo ore effettive
let calculationParams = {
    theoryMultiplier: 1.5,
    practiceMultiplier: 1.2,
    exerciseHours: 3,      // Ore fisse per esercitazioni
    projectHours: 5        // Ore fisse per progetti
};

// Nomi dei mesi
const monthNames = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
const monthNamesFull = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

// Giorni della settimana
const weekDays = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];