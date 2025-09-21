// Test per verificare il problema di duplicazione progetti quando si aggiornano i parametri

console.log('🧪 TEST: Aggiornamento parametri progetto');
console.log('='.repeat(50));

// Simula stato iniziale
const testState = {
    selectedCourse: { id: 1, name: 'AI Applicata' },
    selectedWeek: 0,
    calculationParams: { projectHours: 5 },
    weeklySchedules: {},
    courseTopics: {}
};

// Funzione di test principale
function testProjectParameterUpdate() {
    console.log('📋 Stato iniziale:');
    console.log('- Corso selezionato:', testState.selectedCourse.name);
    console.log('- Ore progetto:', testState.calculationParams.projectHours);
    console.log('- Schedule esistenti:', Object.keys(testState.weeklySchedules).length);
    console.log('- Topics cache:', Object.keys(testState.courseTopics).length);

    console.log('\n🔄 STEP 1: Creazione schedule iniziale...');
    // Simula creazione schedule con 5 ore progetto
    const weekKey = `${testState.selectedCourse.id}-${testState.selectedWeek}`;
    testState.weeklySchedules[weekKey] = { mockSchedule: true, projectHours: 5 };
    testState.courseTopics[weekKey + '_paramsVersion'] = '1.5-1.2-3-5';
    
    console.log('- Schedule creato per:', weekKey);
    console.log('- Versione parametri:', testState.courseTopics[weekKey + '_paramsVersion']);

    console.log('\n🔧 STEP 2: Aggiornamento parametro ore progetto (5 → 25)...');
    testState.calculationParams.projectHours = 25;
    
    // Simula updateCalculationParam
    console.log('- Parametro aggiornato:', testState.calculationParams.projectHours);
    console.log('- Nuova versione parametri: 1.5-1.2-3-25');
    
    console.log('\n🧹 STEP 3: Simulazione clearWeekModulesCache...');
    const keysToDelete = [];
    Object.keys(testState.courseTopics).forEach(key => {
        if (key.includes('_customModules') || key.includes('_paramsVersion') || key.includes('_distributed')) {
            keysToDelete.push(key);
        }
    });
    
    const scheduleKeysToDelete = Object.keys(testState.weeklySchedules);
    
    console.log('- Topics da cancellare:', keysToDelete);
    console.log('- Schedule da cancellare:', scheduleKeysToDelete);
    
    // Cancella effettivamente
    keysToDelete.forEach(key => delete testState.courseTopics[key]);
    scheduleKeysToDelete.forEach(key => delete testState.weeklySchedules[key]);

    console.log('\n✅ STEP 4: Verifica post-cancellazione...');
    console.log('- Schedule rimasti:', Object.keys(testState.weeklySchedules).length);
    console.log('- Topics rimasti:', Object.keys(testState.courseTopics).length);
    
    console.log('\n🔄 STEP 5: Simulazione renderCourseDetail...');
    // Simula shouldRegenerateSchedule
    const currentParamsVersion = '1.5-1.2-3-25';
    const hasCustomModules = !!testState.courseTopics[weekKey + '_customModules'];
    const cachedParamsVersion = testState.courseTopics[weekKey + '_paramsVersion'];
    const shouldRegenerate = !hasCustomModules && cachedParamsVersion !== currentParamsVersion;
    
    console.log('- Moduli personalizzati esistenti:', hasCustomModules);
    console.log('- Versione parametri cached:', cachedParamsVersion);
    console.log('- Versione parametri corrente:', currentParamsVersion);
    console.log('- Deve rigenerare:', shouldRegenerate);
    
    if (!testState.weeklySchedules[weekKey] || shouldRegenerate) {
        console.log('- ✅ RIGENERAZIONE: Nuovo schedule con 25 ore progetto');
        testState.weeklySchedules[weekKey] = { mockSchedule: true, projectHours: 25 };
        testState.courseTopics[weekKey + '_paramsVersion'] = currentParamsVersion;
    } else {
        console.log('- ❌ PROBLEMA: Schedule non rigenerato!');
    }

    console.log('\n🎯 RISULTATO FINALE:');
    console.log('- Schedule finale:', testState.weeklySchedules[weekKey]);
    console.log('- Ore progetto nel schedule:', testState.weeklySchedules[weekKey]?.projectHours);
    console.log('- Parametro attuale:', testState.calculationParams.projectHours);
    console.log('- Match corretto:', testState.weeklySchedules[weekKey]?.projectHours === testState.calculationParams.projectHours);
}

// Esegui test
testProjectParameterUpdate();

console.log('\n' + '='.repeat(50));
console.log('🧪 Test completato');