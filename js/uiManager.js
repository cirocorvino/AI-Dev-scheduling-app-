// uiManager.js - Gestione interfaccia utente ed eventi

// Toggle modalità modifica
function toggleEditMode() {
    editMode = !editMode;
    document.getElementById('editBtnText').textContent = editMode ? 'Visualizza' : 'Modifica';
    
    // Gestisci i campi ore settimanali e data inizio
    const weeklyHoursInput = document.getElementById('weeklyHours');
    const startDateInput = document.getElementById('startDate');
    
    if (editMode) {
        weeklyHoursInput.removeAttribute('readonly');
        startDateInput.removeAttribute('readonly');
        weeklyHoursInput.style.background = 'white';
        startDateInput.style.background = 'white';
        makeHeaderEditable();
        makeCalculationParamsEditable();
    } else {
        weeklyHoursInput.setAttribute('readonly', 'readonly');
        startDateInput.setAttribute('readonly', 'readonly');
        weeklyHoursInput.style.background = '#f0f0f0';
        startDateInput.style.background = '#f0f0f0';
        makeHeaderReadonly();
        makeCalculationParamsReadonly();
    }
    
    renderGantt();
    if (selectedCourse) {
        renderCourseDetail();
    }
}

// Rendi header modificabile
function makeHeaderEditable() {
    const title = document.getElementById('appTitle');
    const description = document.getElementById('appDescription');
    
    if (title) {
        title.innerHTML = `<input type="text" value="${title.textContent}" style="background: transparent; border: 2px solid white; color: white; font-size: 2.5em; font-weight: bold; text-align: center; width: 100%;" onchange="updateAppTitle(this.value)">`;
    }
    if (description) {
        description.innerHTML = `<input type="text" value="${description.textContent}" style="background: transparent; border: 2px solid white; color: white; font-size: 1.2em; text-align: center; width: 100%;" onchange="updateAppDescription(this.value)">`;
    }
}

// Rendi header readonly
function makeHeaderReadonly() {
    const title = document.getElementById('appTitle');
    const description = document.getElementById('appDescription');
    
    if (title) {
        const titleInput = title.querySelector('input');
        title.innerHTML = titleInput ? titleInput.value : title.textContent;
    }
    if (description) {
        const descInput = description.querySelector('input');
        description.innerHTML = descInput ? descInput.value : description.textContent;
    }
}

// Rendi modificabili parametri calcolo
function makeCalculationParamsEditable() {
    const elements = {
        'theoryMultiplier': calculationParams.theoryMultiplier,
        'practiceMultiplier': calculationParams.practiceMultiplier,
        'exerciseHours': calculationParams.exerciseHours,
        'projectHours': calculationParams.projectHours
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const elem = document.getElementById(id);
        if (elem) {
            elem.innerHTML = `<input type="number" step="0.1" value="${value}" style="width: 50px;" onchange="updateCalculationParam('${id}', this.value)">`;
        }
    });
}

// Rendi readonly parametri calcolo
function makeCalculationParamsReadonly() {
    updateCalculationDisplay();
}

// Update functions
function updateAppTitle(value) {
    autoSaveCurrentPlan();
}

function updateAppDescription(value) {
    autoSaveCurrentPlan();
}

// Cancella tutte le personalizzazioni delle settimane
function clearAllWeekCustomizations() {
    // Rimuovi tutti i moduli personalizzati
    Object.keys(courseTopics).forEach(key => {
        if (key.includes('_customModules')) {
            delete courseTopics[key];
        }
    });
    
    // Rimuovi tutti gli schedule personalizzati che dipendono dai moduli
    Object.keys(weeklySchedules).forEach(weekKey => {
        // Rigenera solo le sessioni di studio, mantieni altre attività
        regenerateStudySessionsForWeek(weekKey);
    });
}

// Rigenera solo le sessioni di studio per una settimana specifica
function regenerateStudySessionsForWeek(weekKey) {
    const schedule = weeklySchedules[weekKey];
    if (!schedule) return;
    
    // Per ogni giorno, rigenera solo le sessioni di tipo 'study'
    Object.keys(schedule).forEach(day => {
        schedule[day].forEach((session, index) => {
            if (session.type === 'study') {
                // Resetta a contenuto generico, verrà riempito da generateWeekSchedule
                schedule[day][index].content = `📚 Studio AI`;
            }
        });
    });
}

// Forza la rigenerazione completa del dettaglio settimana
function forceRegenerateWeekDetail() {
    const weekKey = `${selectedCourse.id}-${selectedWeek}`;
    
    // Rimuovi moduli personalizzati per questa settimana
    if (courseTopics[weekKey + '_customModules']) {
        delete courseTopics[weekKey + '_customModules'];
    }
    
    // Rigenera lo schedule da zero
    weeklySchedules[weekKey] = generateWeekSchedule(selectedCourse.name, selectedWeek);
    
    // Aggiorna la visualizzazione
    renderCourseDetail();
}