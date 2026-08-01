/* ═══════════════════════════════════════════════
   python-map-data.js — a Python-réteg egyszerűsített mini-térképének
   adatai. Szándékosan sokkal kisebb, mint a fő content-graph-data.js:
   nincs klaszter-rendszer, csak 12 node egy 4×3-as rácsban, ami
   nagyjából a tanulási sorrendet is tükrözi: alapozó cikkek (környezet,
   SDK-k, async, adatkezelés) felül, közepes/haladó Python-témák
   (osztályok, típusok, dekorátorok, generátorok, kontextuskezelők,
   kivételek, tesztelés, deployment) alattuk.
   ═══════════════════════════════════════════════ */

const pythonNodesBase = [
  { id: 'python-ai-environment',       x: 30,   y: 30,  color: '#eede4d' },
  { id: 'python-ai-sdks',              x: 370,  y: 30,  color: '#4b8bbe' },
  { id: 'python-async-ai',             x: 710,  y: 30,  color: '#306998' },
  { id: 'python-data-handling',        x: 1050, y: 30,  color: '#ffd43b' },
  { id: 'python-classes-ai',           x: 30,   y: 270, color: '#7c9885' },
  { id: 'python-typing-pydantic',      x: 370,  y: 270, color: '#e07a5f' },
  { id: 'python-decorators-ai',        x: 710,  y: 270, color: '#81b29a' },
  { id: 'python-generators-ai',        x: 1050, y: 270, color: '#f2cc8f' },
  { id: 'python-context-managers-ai',  x: 30,   y: 510, color: '#3d5a80' },
  { id: 'python-exceptions-ai',        x: 370,  y: 510, color: '#98c1d9' },
  { id: 'python-testing-ai',           x: 710,  y: 510, color: '#ee6c4d' },
  { id: 'python-packaging-deployment', x: 1050, y: 510, color: '#293241' },
];

const pythonEdges = [
  ['python-ai-environment', 'python-ai-sdks'],
  ['python-ai-environment', 'python-async-ai'],
  ['python-ai-sdks', 'python-async-ai'],
  ['python-ai-sdks', 'python-data-handling'],
  ['python-async-ai', 'python-data-handling'],
  ['python-ai-sdks', 'python-classes-ai'],
  ['python-data-handling', 'python-typing-pydantic'],
  ['python-ai-sdks', 'python-decorators-ai'],
  ['python-ai-sdks', 'python-generators-ai'],
  ['python-async-ai', 'python-context-managers-ai'],
  ['python-ai-sdks', 'python-exceptions-ai'],
  ['python-classes-ai', 'python-typing-pydantic'],
  ['python-typing-pydantic', 'python-decorators-ai'],
  ['python-decorators-ai', 'python-generators-ai'],
  ['python-generators-ai', 'python-context-managers-ai'],
  ['python-context-managers-ai', 'python-exceptions-ai'],
  ['python-exceptions-ai', 'python-testing-ai'],
  ['python-testing-ai', 'python-packaging-deployment'],
  ['python-classes-ai', 'python-packaging-deployment'],
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
    },
    'python-classes-ai': {
      title: 'Osztályok és AI-kliensek',
      short: 'Egy saját, több providert (Anthropic, OpenAI, Ollama) egységesen kezelő kliens-wrapper felépítése, öröklés és absztrakt interfész segítségével.'
    },
    'python-typing-pydantic': {
      title: 'Típusannotáció és Pydantic',
      short: 'Type hint alapok, és a Pydantic mint a strukturált AI-kimenetek gerince — futásidejű validálás, diszkriminált union-ok.'
    },
    'python-decorators-ai': {
      title: 'Dekorátorok a gyakorlatban',
      short: '@lru_cache, @retry, és saját dekorátor írása — hogyan csomagold be a naplózást, gyorsítótárazást egy AI-hívás köré.'
    },
    'python-generators-ai': {
      title: 'Generátorok és iterátorok',
      short: 'Miért ideális a yield streaming AI-válaszokhoz — memória-hatékony feldolgozás, anélkül hogy a teljes válaszra várnál.'
    },
    'python-context-managers-ai': {
      title: 'Kontextuskezelők a gyakorlatban',
      short: 'Mi történik a with client.messages.stream(...) mögött — saját kontextuskezelő írása, ami garantáltan lefut, hiba esetén is.'
    },
    'python-exceptions-ai': {
      title: 'Kivételkezelés és hibaosztályok',
      short: 'Egy jól strukturált hiba-hierarchia felépítése egy AI-alkalmazáshoz, a generikus ValueError helyett.'
    },
    'python-testing-ai': {
      title: 'Tesztelés AI-alkalmazásokhoz',
      short: 'A modell körüli logikát teszteld, ne magát a nem-determinisztikus modellt — mock-olt API-hívások pytest-tel.'
    },
    'python-packaging-deployment': {
      title: 'Csomagolás és deployment',
      short: 'pyproject.toml és Docker multi-stage build — hogyan csomagold és konténerezd az AI-alkalmazásod éles használatra.'
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
    },
    'python-classes-ai': {
      title: 'Classes and AI Clients',
      short: 'Building your own client wrapper that handles multiple providers (Anthropic, OpenAI, Ollama) uniformly, using inheritance and an abstract interface.'
    },
    'python-typing-pydantic': {
      title: 'Type Annotations and Pydantic',
      short: 'Type hint basics, and Pydantic as the backbone of structured AI output — runtime validation, discriminated unions.'
    },
    'python-decorators-ai': {
      title: 'Decorators in Practice',
      short: '@lru_cache, @retry, and writing your own decorator — wrapping logging and caching around an AI call.'
    },
    'python-generators-ai': {
      title: 'Generators and Iterators',
      short: 'Why yield is ideal for streaming AI responses — memory-efficient processing without waiting for the full response.'
    },
    'python-context-managers-ai': {
      title: 'Context Managers in Practice',
      short: 'What happens behind with client.messages.stream(...) — writing your own context manager that always runs, even on error.'
    },
    'python-exceptions-ai': {
      title: 'Exception Handling and Custom Error Classes',
      short: 'Building a well-structured error hierarchy for an AI application, instead of a generic ValueError everywhere.'
    },
    'python-testing-ai': {
      title: 'Testing AI Applications',
      short: 'Test the logic around the model, not the non-deterministic model itself — mocked API calls with pytest.'
    },
    'python-packaging-deployment': {
      title: 'Packaging and Deployment Basics',
      short: 'pyproject.toml and Docker multi-stage builds — packaging and containerizing your AI application for production.'
    }
  }
};

const __pyLocale = (typeof window !== 'undefined' && window.__LOCALE__ && pythonText[window.__LOCALE__]) ? window.__LOCALE__ : 'hu';
const __pyText = pythonText[__pyLocale];

const pythonNodes = pythonNodesBase.map(n => Object.assign({}, n, __pyText[n.id]));
