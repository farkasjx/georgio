/* ═══════════════════════════════════════════════
   python-map-data.js — a Python-réteg egyszerűsített mini-térképének
   adatai. Szándékosan sokkal kisebb, mint a fő content-graph-data.js:
   nincs klaszter-rendszer, csak 4, egymásra épülő node egy lineáris
   sorrendben (környezet → SDK-k → async → adatkezelés).
   ═══════════════════════════════════════════════ */

const pythonNodesBase = [
  { id: 'python-ai-environment', x: 30,  y: 210, color: '#eede4d' },
  { id: 'python-ai-sdks',        x: 420, y: 30,  color: '#4b8bbe' },
  { id: 'python-async-ai',       x: 420, y: 390, color: '#306998' },
  { id: 'python-data-handling',  x: 810, y: 210, color: '#ffd43b' },
];

const pythonEdges = [
  ['python-ai-environment', 'python-ai-sdks'],
  ['python-ai-environment', 'python-async-ai'],
  ['python-ai-sdks', 'python-async-ai'],
  ['python-ai-sdks', 'python-data-handling'],
  ['python-async-ai', 'python-data-handling'],
];

const pythonText = {
  hu: {
    'python-ai-environment': {
      title: 'Python-környezet',
      short: 'Virtuális környezet, függőségek, API-kulcsok biztonságos kezelése — az alap, ami előtt minden más épül.'
    },
    'python-ai-sdks': {
      title: 'A hivatalos SDK-k',
      short: 'OpenAI és Anthropic Pythonban — az első hívás, streaming, és a hibakezelés, ami nélkül egy rate limit hiba összeomlasztja az alkalmazást.'
    },
    'python-async-ai': {
      title: 'Async Python az AI-hoz',
      short: 'Sok AI-hívás párhuzamosan — miért gyorsabb ez, mint egyesével várakozni mindegyikre.'
    },
    'python-data-handling': {
      title: 'Adatkezelés AI-hoz',
      short: 'A modell válaszának feldolgozása, validálása, és nagy mennyiség kezelése anélkül, hogy kifogyna a memóriád.'
    }
  },
  en: {
    'python-ai-environment': {
      title: 'Python Environment',
      short: 'Virtual environments, dependencies, secure API key handling — the foundation everything else builds on.'
    },
    'python-ai-sdks': {
      title: 'The Official SDKs',
      short: 'OpenAI and Anthropic in Python — the first call, streaming, and the error handling that keeps a rate limit from crashing your app.'
    },
    'python-async-ai': {
      title: 'Async Python for AI',
      short: 'Many AI calls in parallel — why this beats waiting for each one sequentially.'
    },
    'python-data-handling': {
      title: 'Data Handling for AI',
      short: 'Processing and validating model responses, and handling large volumes without running out of memory.'
    }
  }
};

const __pyLocale = (typeof window !== 'undefined' && window.__LOCALE__ && pythonText[window.__LOCALE__]) ? window.__LOCALE__ : 'hu';
const __pyText = pythonText[__pyLocale];

const pythonNodes = pythonNodesBase.map(n => Object.assign({}, n, __pyText[n.id]));
