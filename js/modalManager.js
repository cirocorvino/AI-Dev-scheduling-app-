// modalManager.js - Gestione di tutte le modali

// Modal Salvataggio Piano
function showSaveModal() {
    // Usa le variabili globali correnti invece di getCurrentPlanData()
    document.getElementById('planName').value = currentPlanName === 'Piano Predefinito' ? '' : currentPlanName;
    document.getElementById('planDescription').value = 
        currentPlanDescription === 'Percorso completo di certificazione professionale - Ore Effettive Ricalcolate' ? '' : currentPlanDescription;
    document.getElementById('savePlanModal').classList.add('active');
}

function closeSaveModal() {
    document.getElementById('savePlanModal').classList.remove('active');
}

// Modal Caricamento Piano
function showLoadModal() {
    renderSavedPlansList();
    document.getElementById('loadPlanModal').classList.add('active');
}

function closeLoadModal() {
    document.getElementById('loadPlanModal').classList.remove('active');
}

// Modal Eliminazione Piano
function showDeleteModal(planId, planName) {
    planToDeleteId = planId;
    document.getElementById('planToDelete').textContent = planName;
    document.getElementById('deletePlanModal').classList.add('active');
}

function closeDeleteModal() {
    document.getElementById('deletePlanModal').classList.remove('active');
    planToDeleteId = null;
}

// Modal Aggiungi Corso
function showAddCourseModal() {
    document.getElementById('addCourseModal').classList.add('active');
}

function closeAddCourseModal() {
    document.getElementById('addCourseModal').classList.remove('active');
}

// Renderizza lista piani salvati
function renderSavedPlansList() {
    const savedPlans = getSavedPlans();
    const container = document.getElementById('savedPlansList');
    
    if (Object.keys(savedPlans).length === 0) {
        container.innerHTML = '<div class="no-plans-message">Nessun piano salvato</div>';
        return;
    }
    
    const sortedPlans = Object.entries(savedPlans).sort((a, b) => 
        new Date(b[1].metadata.modifiedAt) - new Date(a[1].metadata.modifiedAt)
    );
    
    let html = '';
    sortedPlans.forEach(([planId, planData]) => {
        const isCurrentPlan = planId === currentPlanId;
        const createdDate = new Date(planData.metadata.createdAt).toLocaleDateString('it-IT');
        const modifiedDate = new Date(planData.metadata.modifiedAt).toLocaleDateString('it-IT');
        const totalHours = planData.courses.reduce((sum, course) => sum + course.hours, 0);
        const totalWeeks = Math.ceil(totalHours / (planData.weeklyHours || 15));
        
        html += `
            <div class="saved-plan-item">
                <div class="plan-item-header">
                    <div class="plan-name">${planData.metadata.name}</div>
                    <div class="plan-date">
                        ${isCurrentPlan ? '<span class="current-plan-indicator">Corrente</span>' : ''}
                        ${modifiedDate}
                    </div>
                </div>
                
                ${planData.metadata.description ? `
                    <div class="plan-description">${planData.metadata.description}</div>
                ` : ''}
                
                <div class="plan-stats">
                    <span>📚 ${planData.courses.length} corsi</span>
                    <span>⏱️ ${Math.round(totalHours)}h totali</span>
                    <span>📅 ${totalWeeks} settimane</span>
                    <span>💻 ${planData.weeklyHours}h/sett</span>
                </div>
                
                <div class="plan-actions">
                    ${!isCurrentPlan ? `<button class="btn btn-success btn-small" onclick="loadPlan('${planId}')">📂 Carica</button>` : ''}
                    <button class="btn btn-warning btn-small" onclick="duplicatePlan('${planId}')">📋 Duplica</button>
                    <button class="btn btn-info btn-small" onclick="exportSavedPlan('${planId}')">📤 Esporta</button>
                    <button class="btn btn-warning btn-small" onclick="showDeleteModal('${planId}', '${planData.metadata.name}')">🗑️ Elimina</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}