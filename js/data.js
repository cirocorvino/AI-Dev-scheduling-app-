// data.js - Curriculum del corso .NET e stato applicativo

// Le ore sono stime effettive. I moduli sono distribuiti automaticamente
// nelle 11 ore settimanali disponibili, mantenendo due settimane di pausa
// estiva e due settimane di pausa natalizia.
const curriculum = {
    'Baseline e impostazione': {
        modules: [
            { name: 'Assessment tecnico e obiettivi - Teoria', time: 1 },
            { name: 'Requisiti funzionali di ProvisioningHub - Pratica', time: 1.5 },
            { name: 'Requisiti non funzionali e scenari di qualità - Teoria', time: 2 },
            { name: 'Setup .NET 10, solution e repository - Pratica', time: 2 },
            { name: 'Diagrammi C4 Context e Container - Pratica', time: 1.5 },
            { name: 'ADR-001 Modular Monolith - Esercitazione', time: 3 }
        ]
    },
    'Modern ASP.NET Core': {
        modules: [
            { name: 'Lock: Hosting model, Kestrel e ambienti - Teoria', time: 2 },
            { name: 'Lock: Request pipeline e middleware - Pratica', time: 3 },
            { name: 'Lock: Endpoint routing - Pratica', time: 2 },
            { name: 'Lock/Price: Controller e Minimal APIs - Pratica', time: 3 },
            { name: 'Lock/Marcotte: Dependency Injection e lifetime - Teoria e Pratica', time: 3 },
            { name: 'Lock: Configuration, Options e segreti - Pratica', time: 3 },
            { name: 'Lock: Logging strutturato - Pratica', time: 2 },
            { name: 'Marcotte: Error handling e Problem Details - Pratica', time: 2 },
            { name: 'Lock: Integration testing della pipeline - Pratica', time: 2 }
        ]
    },
    'Pausa estiva e recupero': {
        modules: []
    },
    'API production-grade': {
        modules: [
            { name: 'Marcotte: Contratti REST e versioning - Teoria', time: 3 },
            { name: 'Lock: DTO, model binding e validation - Pratica', time: 3 },
            { name: 'Price: OpenAPI e documentazione - Pratica', time: 2 },
            { name: 'Lock/Price: OAuth 2.0, OIDC e JWT - Teoria e Pratica', time: 4 },
            { name: 'Lock: Policy e autorizzazione resource-based - Pratica', time: 4 },
            { name: 'Lock: Sicurezza API, CORS e segreti - Pratica', time: 3 },
            { name: 'Price: Rate limiting - Pratica', time: 2 },
            { name: 'Price: Async, cancellation e concorrenza - Teoria e Pratica', time: 3 },
            { name: 'Price: Caching applicativo - Pratica', time: 3 },
            { name: 'Lock/Price: HttpClientFactory e resilienza - Pratica', time: 3 },
            { name: 'Price/Lock: Background worker - Pratica', time: 3 }
        ]
    },
    'Application Architecture': {
        modules: [
            { name: 'Software Architecture: Driver e trade-off - Teoria', time: 3 },
            { name: 'Marcotte: SOLID, coesione e accoppiamento - Teoria', time: 3 },
            { name: 'Marcotte: Layering applicativo - Pratica', time: 3 },
            { name: 'Marcotte: Clean Architecture - Pratica', time: 5 },
            { name: 'Marcotte: Dependency inversion e boundary - Pratica', time: 4 },
            { name: 'Marcotte: Application, Domain e Infrastructure - Pratica', time: 4 },
            { name: 'Marcotte: Operation Result ed errori - Pratica', time: 3 },
            { name: 'Marcotte: Mediator pattern e librerie - Teoria', time: 3 },
            { name: 'Marcotte: CQS e CQRS pragmatico - Pratica', time: 5 },
            { name: 'Marcotte: Vertical Slice Architecture - Pratica', time: 5 },
            { name: 'Marcotte: REPR ed endpoint-oriented design - Pratica', time: 3 },
            { name: 'Software Architecture: Entity, Value Object e Aggregate - Pratica', time: 5 },
            { name: 'Software Architecture: Domain service ed eventi - Pratica', time: 3 },
            { name: 'Confronto Clean Architecture e Vertical Slice - Esercitazione', time: 3 },
            { name: 'Revisione architetturale del capstone - Esercitazione', time: 3 }
        ]
    },
    'Modularità e sistemi distribuiti': {
        modules: [
            { name: 'Marcotte: Confini di modulo e bounded context - Teoria e Pratica', time: 4 },
            { name: 'Marcotte: Contratti interni ed encapsulation - Pratica', time: 4 },
            { name: 'Software Architecture: Confini transazionali - Teoria', time: 4 },
            { name: 'Domain event e integration event - Teoria', time: 3 },
            { name: 'Price: RabbitMQ e code - Pratica', time: 4 },
            { name: 'Contratti di messaggio e versioning - Pratica', time: 3 },
            { name: 'Transactional Outbox - Pratica', time: 5 },
            { name: 'Inbox, idempotenza e deduplicazione - Pratica', time: 4 },
            { name: 'Retry, dead-letter queue e poison message - Pratica', time: 3 },
            { name: 'Consistenza eventuale - Teoria', time: 3 },
            { name: 'Saga e process manager - Pratica', time: 4 },
            { name: 'Estrazione controllata di worker o servizio - Esercitazione', time: 3 }
        ]
    },
    'Comunicazione moderna': {
        modules: [
            { name: 'Semantica HTTP e maturità REST - Teoria', time: 3 },
            { name: 'Price: OpenAPI contract-first - Pratica', time: 3 },
            { name: 'Price: gRPC, Protobuf e chiamate unary - Pratica', time: 4 },
            { name: 'Price: Streaming, deadline e cancellation gRPC - Pratica', time: 3 },
            { name: 'Price: GraphQL e trade-off - Teoria', time: 3 },
            { name: 'Price: SignalR per stato real-time - Pratica', time: 3 },
            { name: 'Matrice di scelta dei protocolli - Esercitazione', time: 3 }
        ]
    },
    'Containers e delivery': {
        modules: [
            { name: 'Dockerfile e immagini multi-stage - Pratica', time: 4 },
            { name: 'Docker Compose e dipendenze locali - Pratica', time: 3 },
            { name: 'Configurazione, segreti e ambienti - Pratica', time: 3 },
            { name: 'Health check, readiness e startup - Pratica', time: 2 },
            { name: 'Pipeline CI: build, test e quality gate - Pratica', time: 4 },
            { name: 'GitHub Actions o GitLab CI/CD - Pratica', time: 3 },
            { name: 'Deployment, rollback e smoke test - Esercitazione', time: 3 }
        ]
    },
    'Cloud e operabilità I': {
        modules: [
            { name: 'Software Architecture: Cloud driver e scelta servizi Azure - Teoria', time: 4 },
            { name: 'Azure Well-Architected e requisiti non funzionali - Teoria', time: 3 },
            { name: 'ADR dell\'architettura target Azure - Pratica', time: 4 }
        ]
    },
    'Pausa natalizia e recupero': {
        modules: []
    },
    'Cloud e operabilità II': {
        modules: [
            { name: 'Azure App Service e Container Apps - Pratica', time: 4 },
            { name: 'Managed Identity e Key Vault - Pratica', time: 4 },
            { name: 'Azure SQL, Storage e Messaging - Teoria e Pratica', time: 3 },
            { name: 'OpenTelemetry: log, metriche e trace - Pratica', time: 4 },
            { name: 'Correlation e distributed tracing - Pratica', time: 2 },
            { name: '.NET Aspire per orchestrazione locale - Pratica', time: 2 },
            { name: 'SLI, SLO, alert e runbook - Esercitazione', time: 3 }
        ]
    },
    'Hardening e portfolio': {
        modules: [
            { name: 'Threat modeling e security review - Teoria e Pratica', time: 3 },
            { name: 'Profiling e benchmarking - Pratica', time: 3 },
            { name: 'Load testing e analisi colli di bottiglia - Pratica', time: 3 },
            { name: 'Strategia di test e hardening finale - Pratica', time: 3 },
            { name: 'ADR, C4 e documentazione finale - Pratica', time: 3 },
            { name: 'README, runbook e demo script - Pratica', time: 2 },
            { name: 'Presentazione tecnica in italiano e inglese - Pratica', time: 2 },
            { name: 'Mock interview architetturale - Esercitazione', time: 3 }
        ]
    }
};

// Moduli principali e pause visualizzati nel Gantt.
let courses = [
    { id: 1, name: 'Baseline e impostazione', hours: 0, color: '#5B8FF9' },
    { id: 2, name: 'Modern ASP.NET Core', hours: 0, color: '#61DDAA' },
    { id: 3, name: 'Pausa estiva e recupero', hours: 0, color: '#A0A7B4', fixedWeeks: 2, isBuffer: true },
    { id: 4, name: 'API production-grade', hours: 0, color: '#65789B' },
    { id: 5, name: 'Application Architecture', hours: 0, color: '#7262FD' },
    { id: 6, name: 'Modularità e sistemi distribuiti', hours: 0, color: '#F6BD16' },
    { id: 7, name: 'Comunicazione moderna', hours: 0, color: '#78D3F8' },
    { id: 8, name: 'Containers e delivery', hours: 0, color: '#9661BC' },
    { id: 9, name: 'Cloud e operabilità I', hours: 0, color: '#F6903D' },
    { id: 10, name: 'Pausa natalizia e recupero', hours: 0, color: '#A0A7B4', fixedWeeks: 2, isBuffer: true },
    { id: 11, name: 'Cloud e operabilità II', hours: 0, color: '#008685' },
    { id: 12, name: 'Hardening e portfolio', hours: 0, color: '#F08BB4' }
];

// Variabili globali di stato
let weeklySchedules = {};
let courseTopics = {};
let editMode = false;
let selectedCourse = null;
let selectedWeek = 0;
let weeklyHours = 11;
let globalStartDate = '2026-07-20';
let currentPlanId = null;
let currentPlanName = 'Corso .NET e Architettura Applicazioni Web';
let currentPlanDescription = '24 settimane attive, 4 settimane di buffer e 11 ore di studio settimanali';
let planToDeleteId = null;
