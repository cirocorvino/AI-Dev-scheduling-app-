// courseDetail.js - Gestione dettagli corso con sincronizzazione argomenti

// Funzioni di analisi temporale corsi (duplicate da calculations.js per compatibilità)
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

// Verifica se una settimana specifica può essere aggiornata
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

// Genera schedule per una settimana rispettando le restrizioni temporali
function safeGenerateWeekSchedule(courseName, weekIndex) {
    if (selectedCourse && !canUpdateWeek(selectedCourse, weekIndex)) {
        Logger.debug(`🔒 GENERAZIONE BLOCCATA per settimana ${weekIndex + 1}: corso in corso, settimana già trascorsa`);
        // Restituisci uno schedule di default se non esiste
        return JSON.parse(JSON.stringify(weekTemplate));
    }
    
    Logger.debug(`✅ Generazione schedule settimana ${weekIndex + 1}: corso aggiornabile`);
    return generateWeekSchedule(courseName, weekIndex);
}

// Mostra dettagli del corso
function showCourseDetail(courseId) {
    selectedCourse = courses.find(c => c.id === courseId);
    selectedWeek = 0;
    renderCourseDetail();
}

// Render dettagli del corso
function renderCourseDetail() {
    const detailSection = document.getElementById('scheduleDetail');
    detailSection.classList.add('active');
    
    const weeks = getWeeksForCourse(selectedCourse);
    const weekKey = `${selectedCourse.id}-${selectedWeek}`;
    
    Logger.ui(`Renderizzando dettaglio corso: ${selectedCourse.name}, Settimana ${selectedWeek + 1}`);
    Logger.calc(`WeekKey: ${weekKey}, Schedule esistente: ${!!weeklySchedules[weekKey]}`);
    
    let weekTabsHtml = '';
    weeks.forEach((week, index) => {
        weekTabsHtml += `
            <button class="week-tab ${index === selectedWeek ? 'active' : ''}" 
                    onclick="selectWeek(${index})">
                ${formatWeekRange(week.start, week.end)}
            </button>
        `;
    });
    
    // Verifica se deve rigenerare lo schedule
    const shouldRegenerate = shouldRegenerateSchedule(weekKey);
    Logger.calc(`Deve rigenerare schedule: ${shouldRegenerate}`);
    
    // CONTROLLO TEMPORALE: verifica se la settimana può essere aggiornata
    const canUpdate = canUpdateWeek(selectedCourse, selectedWeek);
    Logger.calc(`Settimana ${selectedWeek + 1} aggiornabile: ${canUpdate}`);
    
    // IMPORTANTE: Genera schedule solo se non esiste O se deve rigenerare E la settimana è aggiornabile
    if (!weeklySchedules[weekKey] || (shouldRegenerate && canUpdate)) {
        if (!canUpdate && !weeklySchedules[weekKey]) {
            Logger.calc(`⚠️ Settimana ${selectedWeek + 1} bloccata ma senza cache: creazione schedule di default vuoto`);
            weeklySchedules[weekKey] = JSON.parse(JSON.stringify(weekTemplate));
        } else if (canUpdate) {
            Logger.calc('Generazione nuovo schedule settimanale...');
            weeklySchedules[weekKey] = safeGenerateWeekSchedule(selectedCourse.name, selectedWeek);
        } else {
            Logger.calc(`🔒 Schedule esistente preservato per settimana ${selectedWeek + 1} (bloccata)`);
        }
    }
    
    const modules = getWeekModules(selectedCourse.name, selectedWeek);
    Logger.calc(`Moduli trovati per settimana ${selectedWeek + 1}:`, modules.map(m => `${m.name} (${calculateModuleEffectiveTime(m)}h)`));
    
    detailSection.innerHTML = `
        <div class="week-header">
            <span class="week-title">${selectedCourse.name} - Settimana ${selectedWeek + 1}</span>
            <button class="close-btn" onclick="closeDetail()">✕</button>
        </div>
        
        <div class="week-tabs">
            ${weekTabsHtml}
        </div>
        
        ${modules.length > 0 ? `
            <div class="topics-box">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h3>Argomenti della settimana (ore effettive):</h3>
                    ${editMode ? `<button class="btn btn-success" style="padding: 5px 12px; font-size: 0.85em;" onclick="addWeekTopic()">+ Aggiungi</button>` : ''}
                </div>
                <div id="weekTopicsList">
                    ${renderWeekTopics(modules)}
                </div>
                ${renderWeekHoursSummary(modules)}
            </div>
        ` : ''}
        
        <div id="weekContent">
            ${renderWeekSchedule()}
        </div>
    `;
}

// Verifica se lo schedule deve essere rigenerato
function shouldRegenerateSchedule(weekKey) {
    // Rigenera se non ci sono moduli personalizzati e i parametri sono cambiati
    return !courseTopics[weekKey + '_customModules'] && courseTopics[weekKey + '_paramsVersion'] !== getParamsVersion();
}

// Ottieni versione parametri per tracking modifiche
function getParamsVersion() {
    return `${calculationParams.theoryMultiplier}-${calculationParams.practiceMultiplier}-${calculationParams.exerciseHours}-${calculationParams.projectHours}`;
}

// Ottieni settimane per un corso
function getWeeksForCourse(course) {
    const weeks = [];
    const startDate = new Date(course.startDate);
    const endDate = new Date(course.endDate);
    
    let currentWeekStart = new Date(startDate);
    const day = currentWeekStart.getDay();
    const diff = currentWeekStart.getDate() - day + (day === 0 ? -6 : 1);
    currentWeekStart.setDate(diff);
    
    while (currentWeekStart <= endDate) {
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        weeks.push({
            start: new Date(currentWeekStart),
            end: new Date(weekEnd)
        });
        
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }
    
    return weeks;
}

// Formatta range settimana
function formatWeekRange(start, end) {
    const startDay = start.getDate();
    const endDay = end.getDate();
    const startMonth = monthNames[start.getMonth()];
    const endMonth = monthNames[end.getMonth()];
    
    if (startMonth === endMonth) {
        return `${startDay}-${endDay} ${startMonth}`;
    } else {
        return `${startDay} ${startMonth}-${endDay} ${endMonth}`;
    }
}

// Rendering del riepilogo ore con feedback visivo
function renderWeekHoursSummary(modules) {
    const weekKey = `${selectedCourse.id}-${selectedWeek}`;
    // Calcola le ore effettive svolte in questa settimana
    const totalHours = modules.reduce((sum, m) => sum + calculateModuleWeeklyHours(m.name, weekKey), 0);
    const percentage = (totalHours / weeklyHours) * 100;
    
    let bgColor, textColor, status, icon;
    
    if (totalHours <= weeklyHours * 0.85) {
        // Verde: < 85% (sicuro)
        bgColor = '#d4edda';
        textColor = '#155724';
        status = 'Ottimale';
        icon = '🟢';
    } else if (totalHours <= weeklyHours) {
        // Giallo: 85-100% (attenzione)
        bgColor = '#fff3cd';
        textColor = '#856404';
        status = 'Al limite';
        icon = '🟡';
    } else {
        // Rosso: > 100% (sovraccarico)
        bgColor = '#f8d7da';
        textColor = '#721c24';
        status = 'Sovraccarico';
        icon = '🔴';
    }
    
    return `
        <div style="margin-top: 10px; padding: 10px; background: ${bgColor}; border-radius: 5px; font-size: 0.9em; color: ${textColor}; border: 1px solid ${textColor}20;">
            <strong>${icon} Totale ore settimana:</strong> ${totalHours.toFixed(1)}h / ${weeklyHours}h disponibili (${percentage.toFixed(0)}%)
            <div style="font-size: 0.8em; margin-top: 5px;">Status: <strong>${status}</strong></div>
        </div>
    `;
}

// Ottieni moduli per settimana con gestione cache migliorata e restrizioni temporali
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
        // IMPORTANTE: se la settimana è bloccata ma non ha cache, calcoliamo dal curriculum
        // UNA VOLTA SOLA e poi congeliamo quella cache per il futuro
        Logger.debug(`🔄 Prima generazione per settimana bloccata ${weekKey}: calcolo dal curriculum`);
    } else {
        Logger.debug(`🔄 Cache MISS per ${weekKey}: calcolo dal curriculum (settimana aggiornabile)`);
    }
    
    // Calcola dal curriculum (sia per settimane aggiornabili che per prime generazioni di settimane bloccate)
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
                    effectiveTime: effectiveTime,  // Ore totali del modulo (per calcoli)
                    weeklyHours: timeForThisWeek   // Ore svolte in questa settimana (per visualizzazione)
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
    
    // Salva la cache SEMPRE (per settimane aggiornabili o per prima generazione di settimane bloccate)
    courseTopics[weekKey + '_customModules'] = weekModules;
    courseTopics[weekKey + '_paramsVersion'] = getParamsVersion();
    
    if (canUpdate) {
        Logger.debug(`💾 Cache salvata per ${weekKey} (aggiornabile): versione ${getParamsVersion()}`);
    } else {
        Logger.debug(`🔐 Cache congelata per ${weekKey} (bloccata): versione ${getParamsVersion()}`);
    }
    
    return weekModules;
}

// Genera schedule settimanale con tracking degli argomenti distribuiti
function generateWeekSchedule(courseName, weekIndex) {
    const modules = getWeekModules(courseName, weekIndex);
    const schedule = JSON.parse(JSON.stringify(weekTemplate));
    const weekKey = `${selectedCourse?.id || 0}-${weekIndex}`;
    
    // Tracking degli argomenti effettivamente distribuiti nelle sessioni
    const distributedModules = [];
    
    // Prima aggiungi le icone e contenuti base per TUTTE le attività non-studio
    Object.keys(schedule).forEach(day => {
        schedule[day].forEach((session, i) => {
            if (session.type === 'prayer') {
                session.content = `${activityIcons.prayer} Lodi + Letture`;
            } else if (session.type === 'work') {
                session.content = `${activityIcons.work} Lavoro`;
            } else if (session.type === 'community') {
                session.content = `${activityIcons.community} Comunità Neocatecumenale`;
            } else if (session.type === 'gym') {
                if (day === 'Giovedì' && session.time.includes('18:15')) {
                    session.content = `${activityIcons.gym} Cardio`;
                } else {
                    session.content = `${activityIcons.gym} Pesi`;
                }
            } else if (session.type === 'study') {
                session.content = `${activityIcons.study} Studio AI`;
            }
        });
    });
    
    // Distribuisci i moduli nelle sessioni di studio
    let moduleQueue = [...modules];
    let currentModule = moduleQueue.shift();
    let currentModuleRemaining = currentModule ? calculateModuleEffectiveTime(currentModule) : 0;

    for (const day of Object.keys(studySchedule)) {
        const dayStudy = studySchedule[day];
        if (!dayStudy) continue;
        
        dayStudy.sessions.forEach(sessionInfo => {
            let sessionHours = sessionInfo.hours;
            let sessionModules = [];
            
            // Solo se ci sono ancora moduli da studiare
            while (sessionHours > 0 && currentModule) {
                const timeToUse = Math.min(currentModuleRemaining, sessionHours);
                
                if (!sessionModules.find(m => m.name === currentModule.name)) {
                    sessionModules.push({...currentModule});
                    if (!distributedModules.find(m => m.name === currentModule.name)) {
                        distributedModules.push({...currentModule});
                    }
                }
                
                sessionHours -= timeToUse;
                currentModuleRemaining -= timeToUse;
                
                if (currentModuleRemaining <= 0) {
                    currentModule = moduleQueue.shift();
                    currentModuleRemaining = currentModule ? calculateModuleEffectiveTime(currentModule) : 0;
                }
            }
            
            const sessionIndex = schedule[day].findIndex(s => 
                s.type === 'study' && s.time === sessionInfo.time
            );
            
            if (sessionIndex !== -1) {
                if (sessionModules.length > 0) {
                    // Salva i moduli nella sessione per riferimento
                    schedule[day][sessionIndex].modules = sessionModules;
                    
                    // Genera il contenuto visibile
                    if (sessionModules.length === 1) {
                        const mod = sessionModules[0];
                        if (mod.name.startsWith('Progetto:')) {
                            schedule[day][sessionIndex].content = `${activityIcons.study} ${mod.name}`;
                        } else {
                            schedule[day][sessionIndex].content = `${activityIcons.study} Studio AI - ${mod.name}`;
                        }
                    } else {
                        const moduleList = sessionModules.map(mod => {
                            if (mod.name.startsWith('Progetto:')) {
                                return mod.name;
                            }
                            return mod.name;
                        }).join('\n• ');
                        schedule[day][sessionIndex].content = `${activityIcons.study} Studio AI:\n• ${moduleList}`;
                    }
                } else {
                    schedule[day][sessionIndex].content = `${activityIcons.study} Studio libero`;
                }
            }
        });
    }
    
    // Salva i moduli effettivamente distribuiti per riferimento SOLO se aggiornabile
    if (selectedCourse && canUpdateWeek(selectedCourse, weekIndex)) {
        courseTopics[weekKey + '_distributed'] = distributedModules;
        Logger.debug(`💾 Distribuzione salvata per ${weekKey}: ${distributedModules.length} moduli`);
    } else {
        Logger.debug(`🔒 Distribuzione NON salvata per ${weekKey}: settimana bloccata`);
    }
    
    return schedule;
}

// Calcola le ore effettive svolte per modulo in questa settimana
function calculateModuleWeeklyHours(moduleName, weekKey) {
    // Uso diretto del campo weeklyHours se disponibile
    const modules = getWeekModules(selectedCourse.name, selectedWeek);
    const module = modules.find(m => m.name === moduleName);
    
    if (module && module.weeklyHours !== undefined) {
        return module.weeklyHours;
    }
    
    // Fallback alla logica precedente se weeklyHours non è disponibile
    const schedule = weeklySchedules[weekKey];
    if (!schedule) return 0;
    
    // Ricostruisci la logica di distribuzione per calcolare le ore precise
    const moduleHoursMap = new Map();
    
    // Inizializza mappa ore per modulo
    modules.forEach(m => {
        moduleHoursMap.set(m.name, 0);
    });
    
    // Simulazione della distribuzione originale
    let moduleQueue = [...modules];
    let currentModule = moduleQueue.shift();
    let currentModuleRemaining = currentModule ? calculateModuleEffectiveTime(currentModule) : 0;

    for (const day of Object.keys(studySchedule)) {
        const dayStudy = studySchedule[day];
        if (!dayStudy) continue;
        
        dayStudy.sessions.forEach(sessionInfo => {
            let sessionHours = sessionInfo.hours;
            
            // Solo se ci sono ancora moduli da studiare
            while (sessionHours > 0 && currentModule) {
                const timeToUse = Math.min(currentModuleRemaining, sessionHours);
                
                // Aggiungi le ore a questo modulo
                const currentHours = moduleHoursMap.get(currentModule.name) || 0;
                moduleHoursMap.set(currentModule.name, currentHours + timeToUse);
                
                sessionHours -= timeToUse;
                currentModuleRemaining -= timeToUse;
                
                if (currentModuleRemaining <= 0) {
                    currentModule = moduleQueue.shift();
                    currentModuleRemaining = currentModule ? calculateModuleEffectiveTime(currentModule) : 0;
                }
            }
        });
    }
    
    return moduleHoursMap.get(moduleName) || 0;
}

// Renderizza lista argomenti modificabili con sync
function renderWeekTopics(modules) {
    let html = '';
    const weekKey = `${selectedCourse.id}-${selectedWeek}`;
    
    modules.forEach((module, index) => {
        // Calcola le ore effettive svolte in questa settimana specifica
        const weeklyHours = calculateModuleWeeklyHours(module.name, weekKey);
        
        if (editMode) {
            html += `
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px; padding: 8px; background: white; border-radius: 5px; border: 1px solid #e0e0e0;">
                    <input type="text" value="${module.name}" 
                           style="flex: 1; padding: 5px; border: 1px solid #ddd; border-radius: 3px;" 
                           onchange="updateModuleName(${index}, this.value)">
                    <input type="number" value="${weeklyHours}" 
                           style="width: 70px; padding: 5px; border: 1px solid #ddd; border-radius: 3px;" 
                           step="0.1" min="0"
                           onchange="updateModuleWeeklyHours(${index}, this.value, this)"
                           title="Ore settimanali per questo argomento">
                    <span style="font-size: 0.9em; color: #666; min-width: 15px;">h</span>
                    <button class="delete-btn" onclick="removeWeekTopic(${index})" style="padding: 3px 8px;">🗑️</button>
                </div>
            `;
        } else {
            // Verifica se il modulo è effettivamente distribuito nelle sessioni
            const distributed = courseTopics[weekKey + '_distributed'] || [];
            const isDistributed = distributed.some(d => d.name === module.name);
            const textColor = isDistributed ? '#000' : '#999';
            const suffix = isDistributed ? '' : ' (non programmato)';
            
            // In modalità readonly, mostra solo le ore senza possibilità di modifica
            html += `<div style="line-height: 1.8; padding: 2px 0; color: ${textColor};">• ${module.name} (${weeklyHours.toFixed(1)}h settimanali)${suffix}</div>`;
        }
    });
    
    return html;
}

// Render schedule settimanale
function renderWeekSchedule() {
    const weekKey = `${selectedCourse.id}-${selectedWeek}`;
    const schedule = weeklySchedules[weekKey] || generateWeekSchedule(selectedCourse.name, selectedWeek);
    
    const weeks = getWeeksForCourse(selectedCourse);
    const currentWeek = weeks[selectedWeek];
    const weekStart = currentWeek ? currentWeek.start : new Date();
    
    let html = '';
    
    weekDays.forEach((day, index) => {
        const dayDate = new Date(weekStart);
        dayDate.setDate(dayDate.getDate() + index);
        const dateStr = `${dayDate.getDate()} ${monthNames[dayDate.getMonth()]}`;
        
        const sessions = schedule[day] || [];
        html += `
            <div class="day-schedule">
                <div class="day-header">
                    <span class="day-name">${day} - ${dateStr}</span>
                </div>
                <div id="sessions-${day}">
        `;
        
        sessions.forEach((session, sessionIndex) => {
            if (editMode) {
                html += `
                    <div class="session ${session.type}">
                        <input class="session-input" value="${session.time}" 
                               onchange="updateSession('${day}', ${sessionIndex}, 'time', this.value)">
                        <input class="session-input" style="flex: 1;" value="${session.content}" 
                               onchange="updateSession('${day}', ${sessionIndex}, 'content', this.value)">
                        <select class="session-select" 
                                onchange="updateSession('${day}', ${sessionIndex}, 'type', this.value)">
                            ${Object.keys(activityLabels).map(type => 
                                `<option value="${type}" ${session.type === type ? 'selected' : ''}>${activityLabels[type]}</option>`
                            ).join('')}
                        </select>
                        <button class="delete-btn" onclick="removeSession('${day}', ${sessionIndex})">🗑️</button>
                    </div>
                `;
            } else {
                html += `
                    <div class="session ${session.type}">
                        <span class="session-time">${session.time}</span>
                        <span class="session-content">${session.content}</span>
                    </div>
                `;
            }
        });
        
        html += `
                </div>
                ${editMode ? `<button class="btn btn-success" style="padding: 5px 10px; font-size: 0.8em; margin-top: 5px;" onclick="addSession('${day}')">+ Aggiungi attività</button>` : ''}
            </div>
        `;
    });
    
    return html;
}

// Gestione argomenti settimana con sincronizzazione
function addWeekTopic() {
    const weekKey = `${selectedCourse.id}-${selectedWeek}`;
    let currentModules = getWeekModules(selectedCourse.name, selectedWeek);
    
    const currentTotal = currentModules.reduce((sum, m) => sum + m.effectiveTime, 0);
    const newTotal = currentTotal + 1; // 1h di default per nuovo argomento
    
    if (newTotal > weeklyHours) {
        showOverflowDialog(currentTotal, newTotal);
        return;
    }
    
    // Procedi con l'aggiunta normale
    addModuleDirectly(currentModules, weekKey);
}

function addModuleDirectly(currentModules, weekKey) {
    const newModule = {
        name: 'Nuovo argomento',
        time: 1,
        effectiveTime: 1
    };
    
    currentModules.push(newModule);
    
    // Salva i moduli personalizzati
    courseTopics[weekKey + '_customModules'] = currentModules;
    
    // Rigenera lo schedule per includere il nuovo modulo
    weeklySchedules[weekKey] = generateWeekSchedule(selectedCourse.name, selectedWeek);
    
    renderCourseDetail();
}

function showOverflowDialog(currentTotal, newTotal) {
    const overflow = newTotal - weeklyHours;
    const message = `
        ⚠️ ATTENZIONE: Superamento ore settimanali
        
        Ore attuali: ${currentTotal}h
        Con nuovo argomento: ${newTotal}h
        Limite settimanale: ${weeklyHours}h
        Eccedenza: +${overflow}h
        
        Cosa vuoi fare?
    `;
    
    if (confirm(`${message}\n\n✅ OK = Continua comunque (sovraccarico)\n❌ Annulla = Non aggiungere`)) {
        // L'utente sceglie di continuare nonostante il sovraccarico
        const weekKey = `${selectedCourse.id}-${selectedWeek}`;
        let currentModules = getWeekModules(selectedCourse.name, selectedWeek);
        addModuleDirectly(currentModules, weekKey);
    }
}

function removeWeekTopic(index) {
    if (confirm('Sei sicuro di voler eliminare questo argomento?')) {
        const weekKey = `${selectedCourse.id}-${selectedWeek}`;
        let currentModules = getWeekModules(selectedCourse.name, selectedWeek);
        
        currentModules.splice(index, 1);
        courseTopics[weekKey + '_customModules'] = currentModules;
        
        // Rigenera lo schedule senza il modulo rimosso
        weeklySchedules[weekKey] = generateWeekSchedule(selectedCourse.name, selectedWeek);
        
        
        renderCourseDetail();
    }
}

function updateModuleName(index, newName) {
    const weekKey = `${selectedCourse.id}-${selectedWeek}`;
    let currentModules = getWeekModules(selectedCourse.name, selectedWeek);
    
    if (currentModules[index]) {
        currentModules[index].name = newName;
        courseTopics[weekKey + '_customModules'] = currentModules;
        
        // Rigenera lo schedule per aggiornare i nomi nelle sessioni
        weeklySchedules[weekKey] = generateWeekSchedule(selectedCourse.name, selectedWeek);
        
        
        renderCourseDetail();
    }
}

function updateModuleHours(index, newHours) {
    const weekKey = `${selectedCourse.id}-${selectedWeek}`;
    let currentModules = getWeekModules(selectedCourse.name, selectedWeek);
    
    if (currentModules[index]) {
        const hours = parseFloat(newHours) || 0;
        const oldHours = currentModules[index].effectiveTime;
        
        // Calcola il nuovo totale
        const currentTotal = currentModules.reduce((sum, m) => sum + m.effectiveTime, 0);
        const newTotal = currentTotal - oldHours + hours;
        
        if (newTotal > weeklyHours && hours > oldHours) {
            // Solo se si sta aumentando e si supera il limite
            const overflow = newTotal - weeklyHours;
            const message = `
                ⚠️ ATTENZIONE: Superamento ore settimanali
                
                Ore attuali totali: ${currentTotal.toFixed(1)}h
                Con nuove ore: ${newTotal.toFixed(1)}h
                Limite: ${weeklyHours}h
                Eccedenza: +${overflow.toFixed(1)}h
                
                Continuare comunque?
            `;
            
            if (!confirm(message)) {
                return; // L'utente annulla la modifica
            }
        }
        
        // Procedi con l'aggiornamento
        currentModules[index].effectiveTime = hours;
        currentModules[index].time = hours;
        courseTopics[weekKey + '_customModules'] = currentModules;
        
        // Rigenera lo schedule per ridistribuire le ore
        weeklySchedules[weekKey] = generateWeekSchedule(selectedCourse.name, selectedWeek);
        
        renderCourseDetail();
    }
}

// Aggiorna le ore settimanali specifiche di un modulo
function updateModuleWeeklyHours(index, newWeeklyHours, inputElement) {
    const weekKey = `${selectedCourse.id}-${selectedWeek}`;
    let currentModules = getWeekModules(selectedCourse.name, selectedWeek);
    
    if (currentModules[index]) {
        const weeklyHours = parseFloat(newWeeklyHours) || 0;
        const moduleName = currentModules[index].name;
        
        Logger.ui(`📝 Aggiornamento ore settimanali: ${moduleName} → ${weeklyHours}h`);
        
        // Calcola il totale corrente delle ore settimanali
        const currentTotal = currentModules.reduce((sum, m) => 
            sum + calculateModuleWeeklyHours(m.name, weekKey), 0
        );
        const oldWeeklyHours = calculateModuleWeeklyHours(moduleName, weekKey);
        const newTotal = currentTotal - oldWeeklyHours + weeklyHours;
        
        if (newTotal > weeklyHours && weeklyHours > oldWeeklyHours) {
            const overflow = newTotal - weeklyHours;
            const message = `⚠️ ATTENZIONE: Superamento ore settimanali
            
Ore settimanali attuali: ${currentTotal.toFixed(1)}h
Con nuove ore: ${newTotal.toFixed(1)}h
Limite: ${weeklyHours}h
Eccedenza: +${overflow.toFixed(1)}h

Continuare comunque?`;
            
            if (!confirm(message)) {
                // L'utente annulla: ripristina il valore precedente nell'input
                if (inputElement) {
                    inputElement.value = oldWeeklyHours.toFixed(1);
                }
                Logger.ui(`❌ Modifica annullata per ${moduleName}`);
                return;
            }
        }
        
        // Aggiorna il campo weeklyHours del modulo
        currentModules[index].weeklyHours = weeklyHours;
        
        // Se non esistevano moduli personalizzati, creali ora
        courseTopics[weekKey + '_customModules'] = currentModules;
        
        // Rigenera lo schedule per ridistribuire le ore
        weeklySchedules[weekKey] = generateWeekSchedule(selectedCourse.name, selectedWeek);
        
        Logger.ui(`✅ Ore settimanali aggiornate per ${moduleName}: ${weeklyHours}h`);
        renderCourseDetail();
    }
}

// Gestione sessioni
function updateSession(day, index, field, value) {
    const weekKey = `${selectedCourse.id}-${selectedWeek}`;
    if (!weeklySchedules[weekKey]) {
        weeklySchedules[weekKey] = generateWeekSchedule(selectedCourse.name, selectedWeek);
    }
    
    if (field === 'type') {
        const oldContent = weeklySchedules[weekKey][day][index].content;
        const hasCustomContent = oldContent && !Object.values(activityLabels).some(label => oldContent.includes(label));
        
        if (!hasCustomContent || oldContent === '' || oldContent.includes(activityIcons[weeklySchedules[weekKey][day][index].type])) {
            weeklySchedules[weekKey][day][index].content = `${activityIcons[value]} ${activityLabels[value]}`;
        }
    } else if (field === 'content') {
        const currentType = weeklySchedules[weekKey][day][index].type;
        if (value === '') {
            value = `${activityIcons[currentType]} ${activityLabels[currentType]}`;
        } else if (!value.includes(activityIcons[currentType])) {
            value = `${activityIcons[currentType]} ${value}`;
        }
    }
    
    weeklySchedules[weekKey][day][index][field] = value;
    
    if (field === 'time') {
        sortSessionsByTime(weekKey, day);
    }
    
    
    
    if (editMode) {
        renderCourseDetail();
    }
}

function addSession(day) {
    const weekKey = `${selectedCourse.id}-${selectedWeek}`;
    
    // Assicurati che esista lo schedule per questa settimana
    if (!weeklySchedules[weekKey]) {
        weeklySchedules[weekKey] = generateWeekSchedule(selectedCourse.name, selectedWeek);
    }
    
    // Crea una nuova sessione
    const newSession = {
        time: '09:00-10:00',
        content: 'Nuova attività',
        type: 'study'
    };
    
    // Aggiungi la sessione al giorno
    if (!weeklySchedules[weekKey][day]) {
        weeklySchedules[weekKey][day] = [];
    }
    
    weeklySchedules[weekKey][day].push(newSession);
    
    // Ordina le sessioni per orario
    weeklySchedules[weekKey][day].sort((a, b) => {
        const timeA = a.time.split('-')[0].replace(':', '');
        const timeB = b.time.split('-')[0].replace(':', '');
        return timeA.localeCompare(timeB);
    });
    
    renderCourseDetail();
}

function removeSession(day, index) {
    const weekKey = `${selectedCourse.id}-${selectedWeek}`;
    const schedule = weeklySchedules[weekKey];
    
    if (!schedule || !schedule[day] || !schedule[day][index]) return;
    
    const sessionToRemove = schedule[day][index];
    Logger.ui(`🗑️ Rimozione sessione: ${day} - ${sessionToRemove.content || 'Sessione vuota'}`);
    
    // Se la sessione contiene moduli di studio, aggiorna le ore settimanali
    if (sessionToRemove.type === 'study' && sessionToRemove.modules) {
        Logger.calc('📊 Aggiornamento ore settimanali dopo rimozione sessione...');
        
        // Trova la durata della sessione
        const sessionInfo = studySchedule[day]?.sessions.find(s => s.time === sessionToRemove.time);
        const sessionDuration = sessionInfo ? sessionInfo.hours : 0;
        
        // Calcola la riduzione di ore per ogni modulo nella sessione
        const modulesInSession = sessionToRemove.modules.length;
        const hoursReductionPerModule = modulesInSession > 0 ? sessionDuration / modulesInSession : 0;
        
        if (hoursReductionPerModule > 0) {
            // Aggiorna i moduli personalizzati
            let currentModules = getWeekModules(selectedCourse.name, selectedWeek);
            let hasChanges = false;
            
            sessionToRemove.modules.forEach(moduleInSession => {
                const moduleIndex = currentModules.findIndex(m => m.name === moduleInSession.name);
                if (moduleIndex !== -1) {
                    const currentWeeklyHours = currentModules[moduleIndex].weeklyHours || 
                                             calculateModuleWeeklyHours(moduleInSession.name, weekKey);
                    const newWeeklyHours = Math.max(0, currentWeeklyHours - hoursReductionPerModule);
                    
                    currentModules[moduleIndex].weeklyHours = newWeeklyHours;
                    hasChanges = true;
                    
                    Logger.calc(`📉 ${moduleInSession.name}: ${currentWeeklyHours.toFixed(1)}h → ${newWeeklyHours.toFixed(1)}h`);
                }
            });
            
            if (hasChanges) {
                // Salva i moduli personalizzati
                courseTopics[weekKey + '_customModules'] = currentModules;
                Logger.calc('✅ Ore settimanali aggiornate dopo rimozione sessione');
            }
        }
    }
    
    // Rimuovi la sessione
    schedule[day].splice(index, 1);
    
    renderCourseDetail();
}

function sortSessionsByTime(weekKey, day) {
    if (!weeklySchedules[weekKey] || !weeklySchedules[weekKey][day]) return;
    
    weeklySchedules[weekKey][day].sort((a, b) => {
        const timeA = a.time.split('-')[0];
        const timeB = b.time.split('-')[0];
        return timeA.localeCompare(timeB);
    });
}

// Seleziona settimana
function selectWeek(weekIndex) {
    selectedWeek = weekIndex;
    renderCourseDetail();
}

// Chiudi dettaglio
function closeDetail() {
    document.getElementById('scheduleDetail').classList.remove('active');
    selectedCourse = null;
}

// Forza rigenerazione schedule quando cambiano i parametri
function regenerateAllSchedulesForCourse() {
    if (!selectedCourse) return;
    
    const weeks = getWeeksForCourse(selectedCourse);
    weeks.forEach((week, index) => {
        const weekKey = `${selectedCourse.id}-${index}`;
        
        // Rigenera solo se non ci sono moduli personalizzati
        if (!courseTopics[weekKey + '_customModules']) {
            delete weeklySchedules[weekKey];
            delete courseTopics[weekKey + '_distributed'];
            delete courseTopics[weekKey + '_paramsVersion'];
        }
    });
    
    renderCourseDetail();
}