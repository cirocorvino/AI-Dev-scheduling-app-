/*
TEST CORREZIONE: Settimane bloccate senza cache devono mostrare argomenti
*/

console.log('🧪 TEST CORREZIONE SETTIMANE BLOCCATE');
console.log('=====================================');

// Mock environment
const Logger = {
    debug: msg => console.log(`🔍 DEBUG: ${msg}`),
    calc: msg => console.log(`📊 CALC: ${msg}`)
};

// Simulazione stato
let selectedCourse = {
    id: 1,
    name: "Master AI",
    startDate: "2024-11-01",  // Iniziato nel passato
    endDate: "2025-03-01"     // Finisce nel futuro
};

let courseTopics = {}; // Cache VUOTA inizialmente
let weeklyHours = 10;

// Mock curriculum
const curriculum = {
    "Master AI": {
        modules: [
            { name: "Python Basics", time: 20 },
            { name: "Machine Learning", time: 30 },
            { name: "Deep Learning", time: 25 }
        ]
    }
};

// Mock date (data corrente: gennaio 2025)
const mockDate = '2025-01-15';
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

function getFirstWeekToUpdate(course) {
    const courseStartDate = new Date(course.startDate);
    const today = new Date();
    
    if (isCourseFuture(course)) return 0;
    if (isCourseCompleted(course)) return -1;
    
    const startOfWeek = new Date(courseStartDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
    
    const weeksDiff = Math.floor((currentWeekStart - startOfWeek) / (7 * 24 * 60 * 60 * 1000));
    return Math.max(0, weeksDiff + 1);
}

function canUpdateWeek(course, weekIndex) {
    if (isCourseCompleted(course)) return false;
    if (isCourseFuture(course)) return true;
    return weekIndex >= getFirstWeekToUpdate(course);
}

function getParamsVersion() {
    return "v1.0";
}

function calculateModuleEffectiveTime(module) {
    return module.time * 1.0; // Mock calculation
}

// Versione corretta della funzione
function getWeekModules(courseName, weekIndex) {
    const weekKey = `${selectedCourse?.id || 0}-${weekIndex}`;
    
    // Se ci sono moduli personalizzati, usali (cache esistente)
    if (courseTopics[weekKey + '_customModules']) {
        Logger.debug(`📦 Cache HIT per ${weekKey}: moduli personalizzati trovati`);
        return [...courseTopics[weekKey + '_customModules']];
    }
    
    // CONTROLLO TEMPORALE: verifica se questa settimana può essere aggiornata
    const canUpdate = selectedCourse ? canUpdateWeek(selectedCourse, weekIndex) : true;
    
    if (!canUpdate) {
        Logger.debug(`🔒 SETTIMANA BLOCCATA ${weekKey}: corso in corso, settimana già trascorsa`);
        Logger.debug(`🔄 Prima generazione per settimana bloccata ${weekKey}: calcolo dal curriculum`);
    } else {
        Logger.debug(`🔄 Cache MISS per ${weekKey}: calcolo dal curriculum (settimana aggiornabile)`);
    }
    
    // Calcola dal curriculum
    const courseData = curriculum[courseName];
    if (!courseData) return [];
    
    const modules = courseData.modules;
    const hoursPerWeek = weeklyHours;
    let currentHour = 0;
    let weekModules = [];
    let currentWeek = 0;
    
    for (const module of modules) {
        const effectiveTime = calculateModuleEffectiveTime(module);
        let remainingTime = effectiveTime;
        
        while (remainingTime > 0) {
            const spaceInCurrentWeek = hoursPerWeek - currentHour;
            const timeForThisWeek = Math.min(remainingTime, spaceInCurrentWeek);
            
            if (currentWeek === weekIndex && timeForThisWeek > 0) {
                weekModules.push({
                    name: module.name,
                    time: module.time,
                    effectiveTime: effectiveTime,
                    weeklyHours: timeForThisWeek
                });
            }
            
            currentHour += timeForThisWeek;
            remainingTime -= timeForThisWeek;
            
            if (currentHour >= hoursPerWeek) {
                currentWeek++;
                currentHour = 0;
            }
        }
    }
    
    // Salva la cache SEMPRE
    courseTopics[weekKey + '_customModules'] = weekModules;
    courseTopics[weekKey + '_paramsVersion'] = getParamsVersion();
    
    if (canUpdate) {
        Logger.debug(`💾 Cache salvata per ${weekKey} (aggiornabile): versione ${getParamsVersion()}`);
    } else {
        Logger.debug(`🔐 Cache congelata per ${weekKey} (bloccata): versione ${getParamsVersion()}`);
    }
    
    return weekModules;
}

// Test
console.log('\n📊 STATO INIZIALE:');
console.log(`Corso: ${selectedCourse.name} (${selectedCourse.startDate} → ${selectedCourse.endDate})`);
console.log(`Data corrente simulata: ${mockDate}`);
console.log(`Corso in corso: ${isCourseInProgress(selectedCourse)}`);
console.log(`Prima settimana aggiornabile: ${getFirstWeekToUpdate(selectedCourse)}`);
console.log(`Cache vuota: ${Object.keys(courseTopics).length === 0}`);

console.log('\n🧪 TEST SETTIMANA BLOCCATA SENZA CACHE:');
const weekIndex = 5; // Settimana nel passato (bloccata)
console.log(`Settimana ${weekIndex} aggiornabile: ${canUpdateWeek(selectedCourse, weekIndex)}`);

const modules = getWeekModules(selectedCourse.name, weekIndex);
console.log(`\n📋 Risultato:`);
console.log(`Moduli trovati: ${modules.length}`);
modules.forEach(m => console.log(`  - ${m.name}: ${m.weeklyHours}h`));

console.log(`\n💾 Cache dopo esecuzione:`);
console.log(`Entries in cache: ${Object.keys(courseTopics).length}`);
Object.keys(courseTopics).forEach(k => console.log(`  - ${k}: ${Array.isArray(courseTopics[k]) ? courseTopics[k].length + ' moduli' : courseTopics[k]}`));

console.log('\n🧪 TEST SECONDA CHIAMATA (dovrebbe usare cache):');
const modules2 = getWeekModules(selectedCourse.name, weekIndex);
console.log(`Moduli alla seconda chiamata: ${modules2.length}`);

console.log('\n✅ Test completato - settimane bloccate ora mostrano argomenti!');