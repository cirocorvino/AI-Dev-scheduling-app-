/*
TEST QUICK: Verifica funzioni di date filtering in courseDetail.js
*/

// Test rapido delle funzioni temporali
const testCourse1 = {
    id: 1,
    name: "Corso Completato",
    startDate: "2024-09-01", 
    endDate: "2024-12-15",
    weeks: 15
};

const testCourse2 = {
    id: 2,
    name: "Corso In Corso",
    startDate: "2024-11-01",
    endDate: "2025-03-01",
    weeks: 17
};

const testCourse3 = {
    id: 3,
    name: "Corso Futuro",
    startDate: "2025-02-01",
    endDate: "2025-06-01",
    weeks: 17
};

console.log('🧪 TEST FUNZIONI DATE FILTERING');

// Mock data 2025-01-15 (medio gennaio)
const originalDate = Date;
global.Date = class extends originalDate {
    constructor(...args) {
        if (args.length === 0) {
            return new originalDate('2025-01-15T10:00:00Z');
        }
        return new originalDate(...args);
    }
    static now() {
        return new originalDate('2025-01-15T10:00:00Z').getTime();
    }
};

// Test functions (simple versions without complex dependencies)
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

function canUpdateWeek(course, weekIndex) {
    if (isCourseCompleted(course)) {
        return false; // Corsi completati non si aggiornano mai
    }
    
    if (isCourseFuture(course)) {
        return true; // Corsi futuri si aggiornano sempre
    }
    
    // Corso in corso: solo settimane future
    const firstWeekToUpdate = getFirstWeekToUpdate(course);
    return weekIndex >= firstWeekToUpdate;
}

console.log('📅 Data corrente simulata:', new Date().toISOString().split('T')[0]);

const courses = [testCourse1, testCourse2, testCourse3];

courses.forEach(course => {
    console.log(`\n🎯 Corso: ${course.name} (${course.startDate} → ${course.endDate})`);
    console.log(`  - Completato: ${isCourseCompleted(course)}`);
    console.log(`  - Futuro: ${isCourseFuture(course)}`);
    console.log(`  - In corso: ${isCourseInProgress(course)}`);
    console.log(`  - Prima settimana aggiornabile: ${getFirstWeekToUpdate(course)}`);
    
    // Test settimane
    [0, 5, 10, 15].forEach(week => {
        const canUpdate = canUpdateWeek(course, week);
        console.log(`  - Settimana ${week}: ${canUpdate ? '✅ aggiornabile' : '🔒 bloccata'}`);
    });
});

console.log('\n✅ Test completato');