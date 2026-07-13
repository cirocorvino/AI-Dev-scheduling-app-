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

// Template settimanale base.
// Vincoli fissi: lavoro lun-ven 09:00-18:00; palestra lun-mer-ven 18:30-20:00.
// Le altre attività già presenti nel piano originale vengono mantenute.
const weekTemplate = {
    'Lunedì': [
        { time: '06:30-07:45', content: '', type: 'prayer' },
        { time: '09:00-18:00', content: '', type: 'work' },
        { time: '18:30-20:00', content: '', type: 'gym' },
        { time: '20:45-21:30', content: '', type: 'study' }
    ],
    'Martedì': [
        { time: '06:30-07:45', content: '', type: 'prayer' },
        { time: '09:00-18:00', content: '', type: 'work' },
        { time: '18:30-20:00', content: '', type: 'study' },
        { time: '21:00-23:00', content: '', type: 'community' }
    ],
    'Mercoledì': [
        { time: '06:30-07:45', content: '', type: 'prayer' },
        { time: '09:00-18:00', content: '', type: 'work' },
        { time: '18:30-20:00', content: '', type: 'gym' },
        { time: '20:45-21:30', content: '', type: 'study' }
    ],
    'Giovedì': [
        { time: '06:30-07:45', content: '', type: 'prayer' },
        { time: '09:00-18:00', content: '', type: 'work' },
        { time: '20:30-22:30', content: '', type: 'study' }
    ],
    'Venerdì': [
        { time: '06:30-07:45', content: '', type: 'prayer' },
        { time: '09:00-18:00', content: '', type: 'work' },
        { time: '18:30-20:00', content: '', type: 'gym' }
    ],
    'Sabato': [
        { time: '07:00-07:45', content: '', type: 'prayer' },
        { time: '09:00-12:00', content: '', type: 'study' },
        { time: '14:30-16:00', content: '', type: 'study' },
        { time: '21:00-23:00', content: '', type: 'community' }
    ],
    'Domenica': [
        { time: '07:30-08:45', content: '', type: 'prayer' },
        { time: '10:30-12:00', content: '', type: 'study' }
    ]
};

// 11 ore settimanali: due sessioni leggere dopo la palestra,
// due sessioni focalizzate infrasettimanali e tre blocchi nel weekend.
const studySchedule = {
    'Lunedì': { sessions: [{ time: '20:45-21:30', hours: 0.75 }] },
    'Martedì': { sessions: [{ time: '18:30-20:00', hours: 1.5 }] },
    'Mercoledì': { sessions: [{ time: '20:45-21:30', hours: 0.75 }] },
    'Giovedì': { sessions: [{ time: '20:30-22:30', hours: 2 }] },
    'Sabato': { sessions: [
        { time: '09:00-12:00', hours: 3 },
        { time: '14:30-16:00', hours: 1.5 }
    ]},
    'Domenica': { sessions: [{ time: '10:30-12:00', hours: 1.5 }] }
};

// Le ore dei moduli sono già stime effettive comprensive di studio,
// pratica, consolidamento e produzione dei deliverable.
let calculationParams = {
    theoryMultiplier: 1,
    practiceMultiplier: 1,
    exerciseHours: 3,
    projectHours: 8
};

// Nomi dei mesi
const monthNames = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
const monthNamesFull = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

// Giorni della settimana
const weekDays = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
