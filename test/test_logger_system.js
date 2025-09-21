// Test veloce per verificare Logger system
console.log('🧪 TEST LOGGER SYSTEM');

// Carica il logger
const fs = require('fs');
const path = require('path');

const loggerCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'logger.js'), 'utf8');

// Valuta il codice del logger 
eval(loggerCode);

console.log('\n📋 Test delle categorie Logger:');

Logger.debug('Test debug message');
Logger.save('Test save message'); 
Logger.load('Test load message');
Logger.ui('Test UI message');
Logger.calc('Test calc message');
Logger.test('Test test message');
Logger.error('Test error message');

console.log('\n✅ Tutte le categorie Logger funzionano correttamente!');

// Test configurazione
console.log('\n⚙️ Configurazione Logger:');
console.log('Enabled:', LOG_CONFIG.ENABLED);
console.log('Categories:', Object.keys(LOG_CONFIG.CATEGORIES));
console.log('Prefixes:', Object.keys(LOG_CONFIG.PREFIXES));

console.log('\n🎉 Logger system verificato!');