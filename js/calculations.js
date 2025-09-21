// calculations.js - Funzioni di calcolo ore effettive e date

// Calcola le ore effettive per un singolo modulo
function calculateModuleEffectiveTime(module) {
    const originalTime = module.time;
    
    if (module.name.startsWith('Progetto:')) {
        // Usa il maggiore tra ore originali e parametro configurato
        return Math.max(originalTime, calculationParams.projectHours);
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
    Logger.calc("Calcolando ore per:", courseName);
    const course = curriculum[courseName];
    if (!course) {
        Logger.error(`ATTENZIONE: Corso "${courseName}" non trovato nel curriculum!`);
        return 0;
    }
    
    const total = course.modules.reduce((total, module) => {
        const effectiveTime = calculateModuleEffectiveTime(module);
        Logger.calc(`${module.name}: ${module.time} → ${effectiveTime}`);
        return total + effectiveTime;
    }, 0);
    
    Logger.calc(`Totale ore calcolate per ${courseName}:`, total);
    return total;
}

// Ricalcola tutte le ore effettive quando cambiano i parametri
function recalculateAllEffectiveHours() {
    courses.forEach(course => {
        course.hours = Math.round(calculateCourseEffectiveHours(course.name) * 100) / 100;
    });
}

// Ricalcola le ore effettive solo per i corsi attivi o futuri
function recalculateEffectiveHoursForActiveCourses() {
    const today = new Date();
    let updatedCount = 0;
    let skippedCount = 0;
    
    courses.forEach(course => {
        if (isCourseActiveOrFuture(course)) {
            const oldHours = course.hours;
            course.hours = Math.round(calculateCourseEffectiveHours(course.name) * 100) / 100;
            Logger.calc(`✅ Aggiornato: ${course.name} (${oldHours}h → ${course.hours}h)`);
            updatedCount++;
        } else {
            Logger.calc(`🔒 Saltato (completato): ${course.name} (${course.hours}h)`);
            skippedCount++;
        }
    });
    
    Logger.calc(`📊 Riepilogo: ${updatedCount} corsi aggiornati, ${skippedCount} corsi saltati`);
}

// Calcola le ore iniziali per tutti i corsi
function initializeCourseHours() {
    Logger.calc("=== INIZIALIZZAZIONE ORE CORSI ===");
    courses.forEach(course => {
        const oldHours = course.hours;
        course.hours = calculateCourseEffectiveHours(course.name);
        Logger.calc(`${course.name}: ${oldHours}h → ${course.hours}h`);
    });
    Logger.calc("=== FINE INIZIALIZZAZIONE ===");
}

// Ricalcola tutte le date
function recalculateDates() {
    globalStartDate = document.getElementById('startDate').value;
    let currentDate = new Date(globalStartDate);
    
    Logger.calc('🗓️ RICALCOLO DATE - Analisi corsi per aggiornamento selettivo...');
    
    courses.forEach(course => {
        // CONTROLLO TEMPORALE: aggiorna date solo per corsi non completati
        if (isCourseCompleted(course)) {
            Logger.calc(`🔒 Corso completato - date preservate: ${course.name} (${course.startDate} → ${course.endDate})`);
            // Aggiorna currentDate basandoti sulle date esistenti del corso completato
            const existingEndDate = new Date(course.endDate);
            // Vai al lunedì della settimana successiva
            currentDate = new Date(existingEndDate);
            currentDate.setDate(currentDate.getDate() + (8 - currentDate.getDay()) % 7 || 7);
            return;
        }
        
        Logger.calc(`✅ Corso aggiornabile - ricalcolo date: ${course.name}`);
        course.startDate = new Date(currentDate).toISOString().split('T')[0];
        const weeksNeeded = Math.ceil(course.hours / weeklyHours);
        course.weeks = weeksNeeded;
        
        // Calcola correttamente la data di fine: ultimo giorno della settimana finale
        const courseEndDate = new Date(currentDate);
        courseEndDate.setDate(courseEndDate.getDate() + (weeksNeeded * 7) - 1);
        course.endDate = courseEndDate.toISOString().split('T')[0];
        
        Logger.calc(`📅 Nuove date per ${course.name}: ${course.startDate} → ${course.endDate} (${weeksNeeded} settimane)`);
        
        // Aggiorna currentDate per il prossimo corso (inizio settimana successiva)
        currentDate.setDate(currentDate.getDate() + (weeksNeeded * 7));
    });
    
    updateStats();
    renderGantt();
}

// Aggiorna ore settimanali
function updateWeeklyHours() {
    weeklyHours = parseInt(document.getElementById('weeklyHours').value) || 15;
    document.getElementById('weeklyHoursDisplay').textContent = weeklyHours;
    recalculateDates();
}

// Aggiorna statistiche
function updateStats() {
    const totalHours = courses.reduce((sum, course) => sum + course.hours, 0);
    
    // CORREZIONE: Usa il calcolo reale delle settimane (somma delle settimane individuali)
    // invece del calcolo semplificato, per maggiore accuratezza
    const totalWeeks = courses.reduce((sum, course) => sum + (course.weeks || 0), 0);
    
    const endDate = courses.length > 0 ? new Date(courses[courses.length - 1].endDate) : new Date();
    
    Logger.calc(`=== AGGIORNAMENTO STATISTICHE ===`);
    Logger.calc(`Ore totali calcolate: ${totalHours}`);
    Logger.calc(`Settimane totali (somma reale): ${totalWeeks}`);
    Logger.calc(`Settimane totali (calcolo semplice): ${Math.ceil(totalHours / weeklyHours)}`);
    Logger.calc(`Corsi totali: ${courses.length}`);
    
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

// Verifica se un corso è già trascorso (concluso prima della data odierna)
function isCourseCompleted(course) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset ore per confronto solo date
    
    const courseEndDate = new Date(course.endDate);
    courseEndDate.setHours(0, 0, 0, 0);
    
    return courseEndDate < today;
}

// Verifica se un corso è futuro (inizia dopo oggi)
function isCourseFuture(course) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const courseStartDate = new Date(course.startDate);
    courseStartDate.setHours(0, 0, 0, 0);
    
    return courseStartDate > today;
}

// Verifica se un corso è in corso (iniziato ma non finito)
function isCourseInProgress(course) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const courseStartDate = new Date(course.startDate);
    courseStartDate.setHours(0, 0, 0, 0);
    
    const courseEndDate = new Date(course.endDate);
    courseEndDate.setHours(0, 0, 0, 0);
    
    return courseStartDate <= today && courseEndDate >= today;
}

// Verifica se un corso è futuro o in corso
function isCourseActiveOrFuture(course) {
    return !isCourseCompleted(course);
}

// Calcola la prima settimana da aggiornare per un corso in corso
function getFirstWeekToUpdate(course) {
    if (!isCourseInProgress(course)) {
        return 0; // Se non è in corso, aggiorna tutte le settimane
    }
    
    const today = new Date();
    const courseStartDate = new Date(course.startDate);
    
    // Calcola quante settimane sono passate dall'inizio del corso
    const daysDiff = Math.floor((today - courseStartDate) / (1000 * 60 * 60 * 24));
    const weeksElapsed = Math.floor(daysDiff / 7);
    
    // La prossima settimana da aggiornare è quella successiva alla settimana corrente
    return weeksElapsed + 1;
}

// Aggiorna parametro di calcolo
function updateCalculationParam(param, value) {
    Logger.calc(`🔧 AGGIORNAMENTO PARAMETRO: ${param} = ${value}`);
    const oldValue = calculationParams[param];
    calculationParams[param] = parseFloat(value) || calculationParams[param];
    Logger.calc(`🔄 Valore cambiato da ${oldValue} a ${calculationParams[param]}`);
    
    // Identifica corsi da aggiornare (solo futuri o in corso)
    const coursesToUpdate = courses.filter(isCourseActiveOrFuture);
    const completedCourses = courses.filter(isCourseCompleted);
    
    Logger.calc(`📊 Corsi da aggiornare: ${coursesToUpdate.length}/${courses.length}`);
    Logger.calc(`🔒 Corsi completati (non modificati): ${completedCourses.map(c => c.name).join(', ')}`);
    
    // 1. Ricalcola le ore effettive solo per i corsi non completati
    Logger.calc('📊 Step 1: Ricalcolazione ore effettive corsi attivi...');
    recalculateEffectiveHoursForActiveCourses();
    
    // 2. PULISCI la cache delle settimane solo per i corsi non completati
    Logger.calc('🧹 Step 2: Pulizia cache corsi attivi...');
    clearWeekModulesCacheForActiveCourses();
    
    // 3. Ricalcola le date del Gantt
    Logger.calc('📅 Step 3: Ricalcolazione date Gantt...');
    recalculateDates();
    
    // 4. Se c'è un dettaglio aperto per un corso attivo, rigeneralo
    if (selectedCourse && isCourseActiveOrFuture(selectedCourse)) {
        Logger.calc(`🔄 Step 4: Rigenerazione dettaglio per corso attivo ${selectedCourse.name}`);
        renderCourseDetail();
    } else if (selectedCourse && isCourseCompleted(selectedCourse)) {
        Logger.calc(`🔒 Corso selezionato completato - dettaglio non modificato: ${selectedCourse.name}`);
    }
    
    Logger.calc('✅ Aggiornamento parametro completato');
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
    Logger.calc('🧹 PULIZIA CACHE - Inizio cancellazione per ricalcolo parametri');
    
    let deletedTopics = 0;
    let deletedSchedules = 0;
    
    // Rimuovi tutti i moduli personalizzati e schedule
    Object.keys(courseTopics).forEach(key => {
        if (key.includes('_customModules') || key.includes('_paramsVersion') || key.includes('_distributed')) {
            delete courseTopics[key];
            deletedTopics++;
        }
    });
    
    // Cancella anche gli schedule settimanali per forzare rigenerazione completa
    Object.keys(weeklySchedules).forEach(key => {
        delete weeklySchedules[key];
        deletedSchedules++;
    });
    
    Logger.calc(`🧹 CACHE CANCELLATA - Topics: ${deletedTopics}, Schedules: ${deletedSchedules}`);
    Logger.calc('✅ Tutti gli schedule verranno rigenerati con i nuovi parametri');
}

// Pulisce la cache solo per i corsi attivi o futuri
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
    Logger.calc('✅ Solo settimane future/future verranno rigenerati, settimane passate preservate');
}