// calculations.js - Funzioni di calcolo ore effettive e date

// Calcola le ore effettive per un singolo modulo
function calculateModuleEffectiveTime(module) {
    const originalTime = module.time;
    
    if (module.name.startsWith('Progetto:')) {
        return calculationParams.projectHours;
    } else if (module.name.includes('Esercitazione') || module.name.includes('Esercitazioni')) {
        return calculationParams.exerciseHours;
    } else if (module.name.includes('Teoria')) {
        return originalTime * calculationParams.theoryMultiplier;
    } else if (module.name.includes('Pratica')) {
        return originalTime * calculationParams.practiceMultiplier;
    } else {
        return originalTime * calculationParams.practiceMultiplier;
    }
}

// Calcola le ore totali effettive per ogni corso
function calculateCourseEffectiveHours(courseName) {
    console.log("Calcolando ore per:", courseName);
    const course = curriculum[courseName];
    if (!course) {
        console.log("Corso non trovato nel curriculum");
        return 0;
    }
    
    const total = course.modules.reduce((total, module) => {
        const effectiveTime = calculateModuleEffectiveTime(module);
        console.log(`${module.name}: ${module.time} → ${effectiveTime}`);
        return total + effectiveTime;
    }, 0);
    
    console.log("Totale ore calcolate:", total);
    return total;
}

// Ricalcola tutte le ore effettive quando cambiano i parametri
function recalculateAllEffectiveHours() {
    courses.forEach(course => {
        course.hours = Math.round(calculateCourseEffectiveHours(course.name) * 100) / 100;
    });
}

// Calcola le ore iniziali per tutti i corsi
function initializeCourseHours() {
    courses.forEach(course => {
        course.hours = calculateCourseEffectiveHours(course.name);
    });
}

// Ricalcola tutte le date
function recalculateDates() {
    globalStartDate = document.getElementById('startDate').value;
    let currentDate = new Date(globalStartDate);
    
    courses.forEach(course => {
        course.startDate = new Date(currentDate).toISOString().split('T')[0];
        const weeksNeeded = Math.ceil(course.hours / weeklyHours);
        course.weeks = weeksNeeded;
        currentDate.setDate(currentDate.getDate() + (weeksNeeded * 7));
        course.endDate = new Date(currentDate).toISOString().split('T')[0];
    });
    
    updateStats();
    renderGantt();
    autoSaveCurrentPlan();
}

// Aggiorna ore settimanali
function updateWeeklyHours() {
    weeklyHours = parseInt(document.getElementById('weeklyHours').value) || 15;
    document.getElementById('weeklyHoursDisplay').textContent = weeklyHours;
    recalculateDates();
    autoSaveCurrentPlan();
}

// Aggiorna statistiche
function updateStats() {
    const totalHours = courses.reduce((sum, course) => sum + course.hours, 0);
    const totalWeeks = Math.ceil(totalHours / weeklyHours);
    const endDate = courses.length > 0 ? new Date(courses[courses.length - 1].endDate) : new Date();
    
    document.getElementById('totalHours').textContent = Math.round(totalHours);
    document.getElementById('totalWeeks').textContent = totalWeeks;
    document.getElementById('totalCourses').textContent = courses.length;
    document.getElementById('startDateDisplay').textContent = formatDate(globalStartDate);
    document.getElementById('endDateDisplay').textContent = formatDate(endDate.toISOString().split('T')[0]);
}

// Formatta data
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return `${date.getDate()} ${monthNames[date.getMonth()]}`;
}

// Aggiorna parametro di calcolo
function updateCalculationParam(param, value) {
    calculationParams[param] = parseFloat(value) || calculationParams[param];
    
    // 1. Ricalcola le ore effettive di tutti i corsi
    recalculateAllEffectiveHours();
    
    // 2. PULISCI la cache delle settimane
    clearWeekModulesCache();
    
    // 3. Ricalcola le date del Gantt
    recalculateDates();
    
    // 4. Se c'è un dettaglio aperto, rigeneralo
    if (selectedCourse) {
        renderCourseDetail();
    }
    
    // 5. Auto-salva
    autoSaveCurrentPlan();
}

// Aggiorna la visualizzazione dei parametri di calcolo
function updateCalculationDisplay() {
    document.getElementById('theoryMultiplier').textContent = calculationParams.theoryMultiplier;
    document.getElementById('practiceMultiplier').textContent = calculationParams.practiceMultiplier;
    document.getElementById('exerciseHours').textContent = calculationParams.exerciseHours;
    document.getElementById('projectHours').textContent = calculationParams.projectHours;
}

// Pulisce la cache delle settimane quando cambiano i parametri
function clearWeekModulesCache() {
    // Rimuovi tutti i moduli personalizzati
    Object.keys(courseTopics).forEach(key => {
        if (key.includes('_customModules')) {
            delete courseTopics[key];
        }
    });
}