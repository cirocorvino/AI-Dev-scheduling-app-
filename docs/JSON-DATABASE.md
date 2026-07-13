# Formato JSON v2

Ogni file viene validato integralmente prima di entrare nello stato dell'app. Date e orari usano rispettivamente `YYYY-MM-DD` e `HH:MM`; durate e stime sono minuti interi positivi.

## Database completo

```json
{
  "kind": "learning-planner-database",
  "schemaVersion": 2,
  "metadata": {
    "id": "my-database",
    "name": "Il mio planner",
    "description": "",
    "locale": "it-IT",
    "timeZone": "Europe/Rome",
    "createdAt": "2026-07-13T00:00:00.000Z",
    "updatedAt": "2026-07-13T00:00:00.000Z"
  },
  "settings": {
    "weekStartsOn": 1,
    "planningMode": "sequential",
    "estimationMultipliers": {
      "theory": 1,
      "practice": 1,
      "exercise": 1,
      "project": 1,
      "other": 1
    },
    "calendarExceptions": [
      {
        "id": "holiday-1",
        "date": "2026-08-11",
        "label": "Indisponibile",
        "focusAvailable": false
      }
    ]
  },
  "categories": [
    {
      "id": "focus",
      "label": "Apprendimento",
      "icon": "📚",
      "color": "#2563eb",
      "role": "focus"
    }
  ],
  "weekTemplate": {
    "monday": [],
    "tuesday": [
      {
        "id": "tue-focus",
        "start": "18:30",
        "end": "20:00",
        "label": "",
        "categoryId": "focus"
      }
    ],
    "wednesday": [],
    "thursday": [],
    "friday": [],
    "saturday": [],
    "sunday": []
  },
  "plan": {
    "kind": "learning-plan",
    "schemaVersion": 2,
    "id": "my-plan",
    "title": "Il mio percorso",
    "description": "",
    "startDate": "2026-08-03",
    "weeklyTargetMinutes": 300,
    "modules": []
  },
  "state": {
    "progress": {}
  }
}
```

Deve esistere almeno una categoria con ruolo `focus`. Solo gli slot collegati a queste categorie costituiscono capacità pianificabile. Gli slot `busy` e `neutral` appaiono nell'agenda ma non ricevono argomenti.

Le chiavi ammesse per `weekTemplate` sono `monday` … `sunday`. Un'eccezione con `focusAvailable: false` blocca tutti gli slot focus di quella data; il Gantt si estende se la capacità residua non basta.

## Piano importabile

**Importa piano** accetta un database completo oppure il solo oggetto `learning-plan`:

```json
{
  "kind": "learning-plan",
  "schemaVersion": 2,
  "id": "frontend-path",
  "title": "Percorso frontend",
  "description": "",
  "startDate": "2026-08-03",
  "weeklyTargetMinutes": 300,
  "modules": [
    {
      "id": "foundations",
      "title": "Fondamenti",
      "color": "#2563eb",
      "mode": "work",
      "topics": [
        {
          "id": "html-basics",
          "title": "Struttura semantica",
          "kind": "theory",
          "estimatedMinutes": 90
        }
      ]
    },
    {
      "id": "buffer",
      "title": "Recupero",
      "color": "#94a3b8",
      "mode": "buffer",
      "fixedWeeks": 1,
      "topics": []
    }
  ]
}
```

`mode` può essere `work` o `buffer`. I tipi di argomento sono `theory`, `practice`, `exercise`, `project` e `other`. Gli ID devono essere univoci e usare lettere, numeri, punto, trattino, underscore o due punti.

## Compatibilità v1

Sono riconosciuti i database `organizer-database` e i programmi `study-program` con `courses` o `units`. La migrazione converte giorni italiani, ore in minuti, corsi in moduli e attività in argomenti. Le vecchie cache `weeklySchedules` e `courseTopics` non vengono mantenute: il planner rigenera la schedulazione e segnala l'operazione. Il file originale non viene sovrascritto finché l'utente non sceglie **Salva**.

Gli esempi canonici sono `data/examples/organizer-example.json` e `data/study-program-example.json`.
