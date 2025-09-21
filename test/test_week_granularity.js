/*
TEST GRANULARITÀ SETTIMANE
Verifica che gli aggiornamenti dei parametri rispettino la logica:
- Corsi futuri: aggiornamento completo
- Corsi in corso: solo settimane dalla prossima settimana in poi
- Corsi completati: nessun aggiornamento
*/

// Carichiamo le funzioni principali
const COURSE_DATA_URL = '../data/piano-studio-piano-predefinito-2025-09-20.json';
let courses = [];
let courseTopics = {};
let weeklySchedules = {};
let calculationParams = {
    effectiveTime: 1.0,
    studyRatio: 1.0,
    complexityFactor: 1.0,
    weeklyHours: 10
};

const Logger = {
    calc: msg => console.log(`📊 CALC: ${msg}`),
    cache: msg => console.log(`💾 CACHE: ${msg}`),
    schedule: msg => console.log(`📅 SCHEDULE: ${msg}`),
    ui: msg => console.log(`🖱️ UI: ${msg}`)
};

// Mock della data attuale per simulazione
let mockCurrentDate = '2025-01-15';

function setMockDate(dateString) {
    mockCurrentDate = dateString;
    console.log(`🗓️ Mock date impostata: ${mockCurrentDate}`);
}

function getCurrentDate() {
    return new Date(mockCurrentDate);
}

// Funzioni di analisi dei corsi
function isCourseCompleted(course) {
    const courseEndDate = new Date(course.endDate);
    const today = getCurrentDate();
    return courseEndDate < today;
}

function isCourseFuture(course) {
    const courseStartDate = new Date(course.startDate);
    const today = getCurrentDate();
    return courseStartDate > today;
}

function isCourseInProgress(course) {
    return !isCourseCompleted(course) && !isCourseFuture(course);
}

function isCourseActiveOrFuture(course) {
    return !isCourseCompleted(course);
}

function getFirstWeekToUpdate(course) {
    const courseStartDate = new Date(course.startDate);
    const today = getCurrentDate();
    
    if (isCourseFuture(course)) {
        return 0; // Corso futuro: aggiorna dall'inizio
    }
    
    if (isCourseCompleted(course)) {
        return -1; // Corso completato: non aggiornare
    }
    
    // Corso in corso: calcola la settimana successiva a oggi
    const startOfWeek = new Date(courseStartDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Inizio della settimana del corso
    
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay()); // Inizio settimana corrente
    
    const weeksDiff = Math.floor((currentWeekStart - startOfWeek) / (7 * 24 * 60 * 60 * 1000));
    return Math.max(0, weeksDiff + 1); // Settimana successiva (indice basato su 0)
}

// Simulazione dati di test
function setupTestData() {
    // Simula corsi con diverse situazioni temporali
    courses = [
        {
            id: 1,
            name: "Corso Completato",
            startDate: "2024-09-01", 
            endDate: "2024-12-15",
            weeks: 15
        },
        {
            id: 2,
            name: "Corso In Corso",
            startDate: "2024-11-01",
            endDate: "2025-03-01",
            weeks: 17
        },
        {
            id: 3,
            name: "Corso Futuro",
            startDate: "2025-02-01",
            endDate: "2025-06-01",
            weeks: 17
        }
    ];
    
    // Simula cache esistente
    courseTopics = {
        "1-0_customModules": "cache-settimana-0-corso-1",
        "1-5_customModules": "cache-settimana-5-corso-1",
        "2-0_customModules": "cache-settimana-0-corso-2",
        "2-5_customModules": "cache-settimana-5-corso-2",
        "2-10_customModules": "cache-settimana-10-corso-2",
        "2-15_customModules": "cache-settimana-15-corso-2",
        "3-0_customModules": "cache-settimana-0-corso-3",
        "3-5_customModules": "cache-settimana-5-corso-3"
    };
    
    weeklySchedules = {
        "1-0": "schedule-settimana-0-corso-1",
        "1-5": "schedule-settimana-5-corso-1",
        "2-0": "schedule-settimana-0-corso-2",
        "2-5": "schedule-settimana-5-corso-2",
        "2-10": "schedule-settimana-10-corso-2",
        "2-15": "schedule-settimana-15-corso-2",
        "3-0": "schedule-settimana-0-corso-3",
        "3-5": "schedule-settimana-5-corso-3"
    };
}

// Funzione di pulizia cache granulare
function clearWeekModulesCacheForActiveCourses() {
    Logger.calc('🧹 PULIZIA CACHE SELETTIVA - Solo corsi attivi/futuri');
    
    let deletedTopics = 0;
    let deletedSchedules = 0;
    let preservedTopics = 0;
    let preservedSchedules = 0;
    
    // Analizza ogni corso per determinare le settimane da aggiornare
    courses.forEach(course => {
        const courseId = course.id;
        
        if (isCourseCompleted(course)) {
            Logger.calc(`🔒 Corso completato - nessun aggiornamento: ${course.name}`);
            return;
        }
        
        if (isCourseFuture(course)) {
            Logger.calc(`🔮 Corso futuro - aggiornamento completo: ${course.name}`);
            // Cancella tutte le settimane per i corsi futuri
            clearAllWeeksForCourse(courseId);
        } else if (isCourseInProgress(course)) {
            const firstWeekToUpdate = getFirstWeekToUpdate(course);
            Logger.calc(`⏳ Corso in corso - aggiornamento dalla settimana ${firstWeekToUpdate + 1}: ${course.name}`);
            // Cancella solo le settimane future per i corsi in corso
            clearFutureWeeksForCourse(courseId, firstWeekToUpdate);
        }
    });
    
    // Funzione helper per cancellare tutte le settimane di un corso
    function clearAllWeeksForCourse(courseId) {
        Object.keys(courseTopics).forEach(key => {
            if (key.startsWith(courseId + '-') && 
                (key.includes('_customModules') || key.includes('_paramsVersion') || key.includes('_distributed'))) {
                delete courseTopics[key];
                deletedTopics++;
            }
        });
        
        Object.keys(weeklySchedules).forEach(key => {
            if (key.startsWith(courseId + '-')) {
                delete weeklySchedules[key];
                deletedSchedules++;
            }
        });
    }
    
    // Funzione helper per cancellare solo le settimane future di un corso
    function clearFutureWeeksForCourse(courseId, startWeek) {
        Object.keys(courseTopics).forEach(key => {
            if (key.includes('_customModules') || key.includes('_paramsVersion') || key.includes('_distributed')) {
                const keyParts = key.split('_')[0].split('-');
                if (keyParts[0] == courseId) {
                    const weekIndex = parseInt(keyParts[1]);
                    if (weekIndex >= startWeek) {
                        delete courseTopics[key];
                        deletedTopics++;
                    } else {
                        preservedTopics++;
                    }
                }
            }
        });
        
        Object.keys(weeklySchedules).forEach(key => {
            const keyParts = key.split('-');
            if (keyParts[0] == courseId) {
                const weekIndex = parseInt(keyParts[1]);
                if (weekIndex >= startWeek) {
                    delete weeklySchedules[key];
                    deletedSchedules++;
                } else {
                    preservedSchedules++;
                }
            }
        });
    }
    
    Logger.calc(`🧹 CACHE SELETTIVA - Topics: ${deletedTopics} eliminati, ${preservedTopics} preservati`);
    Logger.calc(`🧹 CACHE SELETTIVA - Schedules: ${deletedSchedules} eliminati, ${preservedSchedules} preservati`);
    Logger.calc('✅ Solo settimane future verranno rigenerati, settimane passate preservate');
}

// Test principale
function testWeekGranularity() {
    console.log('🧪 TEST GRANULARITÀ SETTIMANE');
    console.log('=====================================');
    
    // Setup iniziale
    setMockDate('2025-01-15'); // Metà gennaio
    setupTestData();
    
    console.log('\n📊 STATO INIZIALE:');
    console.log('Courses:', courses.map(c => `${c.id}: ${c.name} (${c.startDate} → ${c.endDate})`));
    console.log('Cache Topics:', Object.keys(courseTopics).length, 'entries');
    console.log('Cache Schedules:', Object.keys(weeklySchedules).length, 'entries');
    
    console.log('\n🔍 ANALISI CORSI:');
    courses.forEach(course => {
        const completed = isCourseCompleted(course);
        const future = isCourseFuture(course);
        const inProgress = isCourseInProgress(course);
        const firstWeek = getFirstWeekToUpdate(course);
        
        console.log(`Corso ${course.id} (${course.name}):`);
        console.log(`  - Completato: ${completed}`);
        console.log(`  - Futuro: ${future}`);
        console.log(`  - In corso: ${inProgress}`);
        console.log(`  - Prima settimana da aggiornare: ${firstWeek >= 0 ? firstWeek : 'N/A'}`);
    });
    
    console.log('\n🧹 APPLICAZIONE PULIZIA CACHE:');
    const beforeTopics = {...courseTopics};
    const beforeSchedules = {...weeklySchedules};
    
    clearWeekModulesCacheForActiveCourses();
    
    console.log('\n📈 RISULTATI:');
    console.log('Cache Topics prima:', Object.keys(beforeTopics).length);
    console.log('Cache Topics dopo:', Object.keys(courseTopics).length);
    console.log('Cache Schedules prima:', Object.keys(beforeSchedules).length);
    console.log('Cache Schedules dopo:', Object.keys(weeklySchedules).length);
    
    console.log('\n🔍 DETTAGLIO OPERAZIONI:');
    
    // Analisi dettagliata delle operazioni
    const deletedTopics = Object.keys(beforeTopics).filter(k => !courseTopics.hasOwnProperty(k));
    const preservedTopics = Object.keys(beforeTopics).filter(k => courseTopics.hasOwnProperty(k));
    const deletedSchedules = Object.keys(beforeSchedules).filter(k => !weeklySchedules.hasOwnProperty(k));
    const preservedSchedules = Object.keys(beforeSchedules).filter(k => weeklySchedules.hasOwnProperty(k));
    
    console.log('Topics eliminati:', deletedTopics);
    console.log('Topics preservati:', preservedTopics);
    console.log('Schedules eliminati:', deletedSchedules);
    console.log('Schedules preservati:', preservedSchedules);
    
    console.log('\n✅ Test completato');
    
    // Verifica aspettative
    console.log('\n🎯 VERIFICA ASPETTATIVE:');
    
    // Il corso 1 (completato) non dovrebbe essere toccato
    const curso1Preserved = Object.keys(courseTopics).filter(k => k.startsWith('1-')).length > 0;
    console.log(`Corso 1 (completato) preservato: ${curso1Preserved ? '✅' : '❌'}`);
    
    // Il corso 2 (in corso) dovrebbe preservare le settimane passate
    const curso2WeeksRemaining = Object.keys(courseTopics).filter(k => k.startsWith('2-')).length;
    console.log(`Corso 2 (in corso) settimane passate preservate: ${curso2WeeksRemaining > 0 ? '✅' : '❌'} (${curso2WeeksRemaining} settimane)`);
    
    // Il corso 3 (futuro) dovrebbe essere completamente cancellato
    const curso3Cleared = Object.keys(courseTopics).filter(k => k.startsWith('3-')).length === 0;
    console.log(`Corso 3 (futuro) completamente cancellato: ${curso3Cleared ? '✅' : '❌'}`);
}

// Esecuzione del test
testWeekGranularity();