// main.js - File principale di inizializzazione e coordinamento

// Funzione di inizializzazione principale
function init() {
    // IMPORTANTE: Prima inizializza i parametri, POI calcola le ore
    
    // Carica l'ultimo piano utilizzato (che potrebbe contenere parametri salvati)
    loadLastPlan();
    
    // Solo DOPO aver caricato eventuali dati salvati, calcola le ore
    initializeCourseHours();
    
    // Aggiorna display del piano corrente
    updateCurrentPlanDisplay();
    
    // Aggiorna visualizzazione parametri di calcolo
    updateCalculationDisplay();
    
    // Imposta stato iniziale readonly per i campi
    const weeklyHoursInput = document.getElementById('weeklyHours');
    const startDateInput = document.getElementById('startDate');
    weeklyHoursInput.style.background = '#f0f0f0';
    startDateInput.style.background = '#f0f0f0';
    
    // Forza un ricalcolo delle date per essere sicuri
    recalculateDates();
}

// Inizializza l'applicazione al caricamento della pagina
window.onload = function() {
    init();
};