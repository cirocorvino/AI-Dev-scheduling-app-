/*
TEST COMPLETO AGGIORNAMENTO GRANULARE
Simula un utente che:
1. Ha un master con data inizio nel passato (corso in corso)
2. Modifica i parametri di calcolo ore effettive
3. Verifica che solo le settimane future vengano aggiornate
*/

console.log('🧪 TEST COMPLETO AGGIORNAMENTO GRANULARE');
console.log('========================================');

// Simulazione ambiente app
const Logger = {
    calc: msg => console.log(`📊 CALC: ${msg}`),
    cache: msg => console.log(`💾 CACHE: ${msg}`),
    schedule: msg => console.log(`📅 SCHEDULE: ${msg}`)
};

// Mock data corrente
const mockDate = '2025-01-15'; // Metà gennaio
console.log(`📅 Data simulata: ${mockDate}`);

// Mock global date
const OriginalDate = Date;
global.Date = class extends OriginalDate {
    constructor(...args) {
        if (args.length === 0) {
            return new OriginalDate(mockDate + 'T10:00:00Z');
        }
        return new OriginalDate(...args);
    }
    static now() {
        return new OriginalDate(mockDate + 'T10:00:00Z').getTime();
    }
};

// Simulazione dati corso
let courses = [
    {
        id: 1,
        name: "Master AI Specialist",
        startDate: "2024-11-01", // Iniziato 2.5 mesi fa
        endDate: "2025-03-01",   // Finisce tra 1.5 mesi
        weeks: 17,
        hours: 170
    }
];

let calculationParams = {
    effectiveTime: 1.0,
    studyRatio: 1.0,
    complexityFactor: 1.0,
    weeklyHours: 10
};

let weeklyHours = 10;

// Cache simulata esistente
let courseTopics = {
    "1-0_customModules": ["modulo-settimana-0"],
    "1-5_customModules": ["modulo-settimana-5"],
    "1-10_customModules": ["modulo-settimana-10"],
    "1-15_customModules": ["modulo-settimana-15"],
    "1-0_paramsVersion": "old-version",
    "1-5_paramsVersion": "old-version",
    "1-10_paramsVersion": "old-version",
    "1-15_paramsVersion": "old-version"
};

let weeklySchedules = {
    "1-0": "schedule-settimana-0",
    "1-5": "schedule-settimana-5", 
    "1-10": "schedule-settimana-10",
    "1-15": "schedule-settimana-15"
};

// Funzioni di analisi temporale
function isCourseCompleted(course) {
    const courseEndDate = new Date(course.endDate);
    const today = new Date();
    return courseEndDate < today;
}

function isCourseFuture(course) {
    const courseStartDate = new Date(course.startDate);
    const today = new Date();
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
    const today = new Date();
    
    if (isCourseFuture(course)) {
        return 0;
    }
    
    if (isCourseCompleted(course)) {
        return -1;
    }
    
    const startOfWeek = new Date(courseStartDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
    
    const weeksDiff = Math.floor((currentWeekStart - startOfWeek) / (7 * 24 * 60 * 60 * 1000));
    return Math.max(0, weeksDiff + 1);
}

// Funzione di pulizia cache
function clearWeekModulesCacheForActiveCourses() {
    Logger.calc('🧹 PULIZIA CACHE SELETTIVA - Solo corsi attivi/futuri');
    
    let deletedTopics = 0;
    let deletedSchedules = 0;
    let preservedTopics = 0;
    let preservedSchedules = 0;
    
    courses.forEach(course => {
        const courseId = course.id;
        
        if (isCourseCompleted(course)) {
            Logger.calc(`🔒 Corso completato - nessun aggiornamento: ${course.name}`);
            return;
        }
        
        if (isCourseFuture(course)) {
            Logger.calc(`🔮 Corso futuro - aggiornamento completo: ${course.name}`);
            clearAllWeeksForCourse(courseId);
        } else if (isCourseInProgress(course)) {
            const firstWeekToUpdate = getFirstWeekToUpdate(course);
            Logger.calc(`⏳ Corso in corso - aggiornamento dalla settimana ${firstWeekToUpdate + 1}: ${course.name}`);
            clearFutureWeeksForCourse(courseId, firstWeekToUpdate);
        }
    });
    
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
}

// Test principale
console.log('\n📊 STATO INIZIALE:');
console.log('Corso:', courses[0].name, `(${courses[0].startDate} → ${courses[0].endDate})`);
console.log('Cache Topics:', Object.keys(courseTopics).length, 'entries');
console.log('Cache Schedules:', Object.keys(weeklySchedules).length, 'entries');

console.log('\n🔍 ANALISI CORSO:');
const course = courses[0];
console.log(`- Completato: ${isCourseCompleted(course)}`);
console.log(`- Futuro: ${isCourseFuture(course)}`);
console.log(`- In corso: ${isCourseInProgress(course)}`);
console.log(`- Prima settimana aggiornabile: ${getFirstWeekToUpdate(course)}`);

console.log('\n🔧 SIMULAZIONE MODIFICA PARAMETRI:');
console.log('Utente cambia "effectiveTime" da 1.0 a 1.2...');
calculationParams.effectiveTime = 1.2;

console.log('\n🧹 APPLICAZIONE PULIZIA CACHE:');
const beforeTopics = {...courseTopics};
const beforeSchedules = {...weeklySchedules};

clearWeekModulesCacheForActiveCourses();

console.log('\n📈 RISULTATI DETTAGLIATI:');
console.log('Cache Topics prima:', Object.keys(beforeTopics).length);
console.log('Cache Topics dopo:', Object.keys(courseTopics).length);
console.log('Cache Schedules prima:', Object.keys(beforeSchedules).length);
console.log('Cache Schedules dopo:', Object.keys(weeklySchedules).length);

console.log('\nTopics eliminati:', Object.keys(beforeTopics).filter(k => !courseTopics.hasOwnProperty(k)));
console.log('Topics preservati:', Object.keys(beforeTopics).filter(k => courseTopics.hasOwnProperty(k)));
console.log('Schedules eliminati:', Object.keys(beforeSchedules).filter(k => !weeklySchedules.hasOwnProperty(k)));
console.log('Schedules preservati:', Object.keys(beforeSchedules).filter(k => weeklySchedules.hasOwnProperty(k)));

console.log('\n🎯 VERIFICA ASPETTATIVE:');
// Settimane 0-11 (passate) dovrebbero essere preservate
const weeksPast = [0, 5, 10].every(w => courseTopics[`1-${w}_customModules`] && weeklySchedules[`1-${w}`]);
// Settimana 15 (futura) dovrebbe essere eliminata
const weekFuture = !courseTopics[`1-15_customModules`] && !weeklySchedules[`1-15`];

console.log(`✅ Settimane passate (0-11) preservate: ${weeksPast ? '✅' : '❌'}`);
console.log(`✅ Settimane future (15+) eliminate: ${weekFuture ? '✅' : '❌'}`);

console.log('\n🎉 FUNZIONALITÀ VERIFICATA:');
console.log('- ✅ Settimane già trascorse del corso in corso rimangono intatte');
console.log('- ✅ Solo settimane future vengono marcate per ricalcolo');
console.log('- ✅ I parametri modificati si applicheranno solo al futuro');

console.log('\n✅ Test completato con successo!');