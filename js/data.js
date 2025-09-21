// data.js - Dati del curriculum e gestione corsi

// Curriculum dettagliato con ore effettive calcolate
const curriculum = {
    'AI Applicata': {
        modules: [
            { name: 'Introduzione ML - Teoria', time: 0.5 },
            { name: 'Dataset - Teoria', time: 0.5 },
            { name: 'Dataset CSV/JSON/XML - Pratica', time: 1 },
            { name: 'Data Preprocessing Encoding - Pratica', time: 1.5 },
            { name: 'Data Preprocessing Missing Data - Pratica', time: 1.5 },
            { name: 'Data Preprocessing Normalizzazione - Pratica', time: 1 },
            { name: 'Data Preprocessing - Esercitazione', time: 1.5 },
            { name: 'Regressione Lineare - Teoria', time: 1.5 },
            { name: 'Regressione Minimi Quadrati - Teoria', time: 1 },
            { name: 'Regressione scikit-learn - Pratica', time: 2 },
            { name: 'Regressione Multipla/Polinomiale - Pratica', time: 2 },
            { name: 'Regressione Abitazioni - Esercitazione', time: 2 },
            { name: 'Overfitting - Teoria', time: 1 },
            { name: 'Cross-validation - Pratica', time: 1.5 },
            { name: 'Regolarizzazione L1/L2 - Pratica', time: 2 },
            { name: 'Overfitting - Esercitazione', time: 1.5 },
            { name: 'Classificazione Logistica - Teoria', time: 1.5 },
            { name: 'Metriche Classificazione - Pratica', time: 2 },
            { name: 'ROC e Multiclasse - Pratica', time: 1.5 },
            { name: 'Classificazione Tumori - Esercitazione', time: 2 },
            { name: 'Clustering K-Means - Pratica', time: 1.5 },
            { name: 'Elbow Method - Pratica', time: 1 },
            { name: 'Clustering Clienti - Esercitazione', time: 2 },
            { name: 'Naive Bayes - Teoria', time: 1.5 },
            { name: 'Naive Bayes Gaussian/Bernoulli - Pratica', time: 3 },
            { name: 'Naive Bayes Multinomial - Pratica', time: 2 },
            { name: 'Spam Detection - Esercitazione', time: 1.5 },
            { name: 'SVM - Teoria', time: 2 },
            { name: 'SVM Kernel Trick - Teoria', time: 2 },
            { name: 'SVM - Pratica', time: 2 },
            { name: 'Neural Networks - Teoria', time: 2 },
            { name: 'MLP e Attivazioni - Teoria', time: 2 },
            { name: 'Neural Networks MNIST - Pratica', time: 3 },
            { name: 'K-NN - Teoria e Pratica', time: 2 },
            { name: 'Decision Trees - Pratica', time: 1.5 },
            { name: 'Random Forest - Pratica', time: 1.5 },
            { name: 'Ottimizzazione Iperparametri - Pratica', time: 3 },
            { name: 'AutoML FLAML - Pratica', time: 2 },
            { name: 'NLP Data Cleaning - Pratica', time: 2 },
            { name: 'NLP Stemming/Lemmatization - Pratica', time: 2 },
            { name: 'Bag of Words - Teoria', time: 2 },
            { name: 'Text Classification - Pratica', time: 2 },
            { name: 'Language Identification - Pratica', time: 2 },
            { name: 'Sentiment Analysis - Pratica', time: 2 },
            { name: 'Topic Modelling LDA - Pratica', time: 2 },
            { name: 'NER con SpaCy - Pratica', time: 2 },
            { name: 'Progetto: Identificazione lingua museo', time: 10 }
        ]
    },
    'REST API per ML': {
        modules: [
            { name: 'Introduzione REST - Teoria', time: 1 },
            { name: 'Flask Basics - Pratica', time: 2 },
            { name: 'FastAPI Setup - Pratica', time: 2 },
            { name: 'Serializzazione Modelli - Pratica', time: 2 },
            { name: 'Deploy con Docker - Pratica', time: 3 },
            { name: 'API Authentication - Teoria', time: 2 },
            { name: 'Testing e Monitoring - Pratica', time: 2 },
            { name: 'Cloud Deployment - Pratica', time: 3 },
            { name: 'Progetto: Deploy sistema museo', time: 4 }
        ]
    },
    'SQL Database': {
        modules: [
            { name: 'Fondamenti SQL - Teoria', time: 2 },
            { name: 'Query Avanzate - Pratica', time: 3 },
            { name: 'Join e Subquery - Pratica', time: 3 },
            { name: 'Stored Procedures - Teoria', time: 2 },
            { name: 'Ottimizzazione Query - Pratica', time: 2 },
            { name: 'Transazioni - Teoria', time: 2 },
            { name: 'SQL - Esercitazioni', time: 4 },
            { name: 'Progetto: Analisi e-commerce', time: 6 }
        ]
    },
    'NoSQL': {
        modules: [
            { name: 'Introduzione NoSQL - Teoria', time: 2 },
            { name: 'MongoDB Basics - Pratica', time: 3 },
            { name: 'MongoDB Aggregation - Pratica', time: 3 },
            { name: 'Redis - Pratica', time: 3 },
            { name: 'Cassandra - Pratica', time: 3 },
            { name: 'ElasticSearch - Pratica', time: 4 },
            { name: 'Neo4j Graph DB - Pratica', time: 3 },
            { name: 'NoSQL - Esercitazioni', time: 5 },
            { name: 'Progetto: Cartelle cliniche', time: 8 }
        ]
    },
    'Python Avanzato': {
        modules: [
            { name: 'Decorators - Teoria', time: 2 },
            { name: 'Generators/Iterators - Teoria', time: 2 },
            { name: 'Async/Await - Pratica', time: 3 },
            { name: 'Multiprocessing - Pratica', time: 3 },
            { name: 'Design Patterns - Teoria', time: 3 },
            { name: 'Testing Avanzato - Pratica', time: 2 },
            { name: 'Python - Esercitazioni', time: 3 },
            { name: 'Progetto: Sincronizzazione file', time: 5 }
        ]
    },
    'Large Language Models': {
        modules: [
            { name: 'Introduzione LLM - Teoria', time: 2 },
            { name: 'Architettura Transformer - Teoria', time: 3 },
            { name: 'GPT e BERT - Teoria', time: 3 },
            { name: 'Fine-tuning - Pratica', time: 3 },
            { name: 'Prompt Engineering - Pratica', time: 2 },
            { name: 'RAG Systems - Pratica', time: 3 },
            { name: 'LLM - Esercitazioni', time: 3 },
            { name: 'Progetto: Riassunto meeting', time: 4 }
        ]
    },
    'Agentic AI': {
        modules: [
            { name: 'Agenti Autonomi - Teoria', time: 3 },
            { name: 'Chain-of-Thought - Teoria', time: 3 },
            { name: 'Tool Use - Pratica', time: 3 },
            { name: 'Multi-Agent Systems - Pratica', time: 4 },
            { name: 'Memory Systems - Pratica', time: 3 },
            { name: 'Agentic AI - Esercitazioni', time: 4 },
            { name: 'Progetto: Assistente finanza', time: 7 }
        ]
    },
    'Architetture Transformer': {
        modules: [
            { name: 'Attention Mechanism - Teoria', time: 3 },
            { name: 'BERT Architecture - Teoria', time: 3 },
            { name: 'T5 e BART - Teoria', time: 3 },
            { name: 'Vision Transformer - Pratica', time: 3 },
            { name: 'Implementazione da Zero - Pratica', time: 4 },
            { name: 'Transformer - Esercitazioni', time: 4 },
            { name: 'Progetto: Sintesi cartelle cliniche', time: 8 }
        ]
    },
    'MERN Stack': {
        modules: [
            { name: 'MongoDB Setup - Pratica', time: 3 },
            { name: 'Express.js Basics - Pratica', time: 3 },
            { name: 'React Fundamentals - Teoria', time: 4 },
            { name: 'Node.js Advanced - Pratica', time: 3 },
            { name: 'State Management - Teoria', time: 3 },
            { name: 'Authentication JWT - Pratica', time: 3 },
            { name: 'REST API Design - Teoria', time: 3 },
            { name: 'GraphQL - Pratica', time: 4 },
            { name: 'Testing Full Stack - Pratica', time: 3 },
            { name: 'Deployment Vercel - Pratica', time: 3 },
            { name: 'MERN - Esercitazioni', time: 5 },
            { name: 'Progetto: Portfolio accademico', time: 10 }
        ]
    },
    'DevOps': {
        modules: [
            { name: 'Docker Fundamentals - Teoria', time: 3 },
            { name: 'Kubernetes - Pratica', time: 4 },
            { name: 'CI/CD Pipeline - Pratica', time: 3 },
            { name: 'GitHub Actions - Pratica', time: 2 },
            { name: 'Monitoring/Logging - Pratica', time: 3 },
            { name: 'Security Best Practices - Teoria', time: 2 },
            { name: 'DevOps - Esercitazioni', time: 3 },
            { name: 'Progetto: Deploy sentiment analysis', time: 5 }
        ]
    }
};

// Struttura dati dei corsi (le ore verranno calcolate dinamicamente)
let courses = [
    { id: 1, name: 'AI Applicata', hours: 0, color: '#FF6B6B' },
    { id: 2, name: 'REST API per ML', hours: 0, color: '#4ECDC4' },
    { id: 3, name: 'SQL Database', hours: 0, color: '#FFD93D' },
    { id: 4, name: 'NoSQL', hours: 0, color: '#6C5CE7' },
    { id: 5, name: 'Python Avanzato', hours: 0, color: '#FD79A8' },
    { id: 6, name: 'Large Language Models', hours: 0, color: '#00B894' },
    { id: 7, name: 'Agentic AI', hours: 0, color: '#E17055' },
    { id: 8, name: 'Architetture Transformer', hours: 0, color: '#74B9FF' },
    { id: 9, name: 'MERN Stack', hours: 0, color: '#A29BFE' },
    { id: 10, name: 'DevOps', hours: 0, color: '#FDCB6E' }
];

// Variabili globali di stato
let weeklySchedules = {};
let courseTopics = {};
let editMode = false;
let selectedCourse = null;
let selectedWeek = 0;
let weeklyHours = 15;
let globalStartDate = '2025-09-08';
let currentPlanId = null;
let currentPlanName = 'Piano Predefinito';
let currentPlanDescription = 'Percorso completo di certificazione professionale - Ore Effettive Ricalcolate';
let planToDeleteId = null;