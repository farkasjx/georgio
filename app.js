/* ═══════════════════════════════════════════════
   AI HUB — app.js
   ═══════════════════════════════════════════════ */

/* ── PAGE NAVIGATION ── */
const pages = ['map', 'roadmap', 'tools', 'prompting'];

function showPage(id) {
  // update topbar
  document.querySelectorAll('.tnav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === id);
  });

  // map page is fullscreen fixed; other pages live in shell
  const mapPage = document.getElementById('page-map');
  const shell   = document.getElementById('shell');
  const sidebar = document.getElementById('sidebar-nav');

  if (id === 'map') {
    mapPage.classList.add('active');
    shell.style.display = 'none';
    initMap();
  } else {
    mapPage.classList.remove('active');
    shell.style.display = 'flex';

    document.querySelectorAll('.page').forEach(p => {
      p.classList.toggle('active', p.id === `page-${id}`);
    });

    // update sidebar
    sidebar.innerHTML = buildSidebar(id);
    attachSidebarLinks();
  }

  window.location.hash = id;
}

function buildSidebar(id) {
  const maps = {
    roadmap: [
      { label: 'Tartalom', links: [
        { href: '#roadmap-overview', text: 'Áttekintés' },
        { href: '#roadmap-tracks', text: 'Tanulási trackek' },
        { href: '#roadmap-timeline', text: 'Timeline · 90 nap' },
        { href: '#roadmap-phases', text: 'A három fázis' },
        { href: '#roadmap-papers', text: '5 kötelező paper' },
        { href: '#roadmap-layers', text: 'AI rétegek' },
        { href: '#roadmap-stack', text: 'Tech stack' },
      ]}
    ],
    tools: [
      { label: 'Kategóriák', links: [
        { href: '#tools-mainstream', text: 'Mainstream eszközök', num: '01' },
        { href: '#tools-emerging', text: 'Felkapott projektek', num: '02' },
      ]}
    ],
    prompting: [
      { label: 'Témák', links: [
        { href: '#p-context', text: 'Context window', num: '01' },
        { href: '#p-basics', text: 'Prompt alapok', num: '02' },
        { href: '#p-techniques', text: 'Technikák', num: '03' },
        { href: '#p-injection', text: 'Prompt injection', num: '04' },
        { href: '#p-extras', text: 'Kiegészítések', num: '05' },
      ]},
      { label: 'Technikák', links: [
        { href: '#p-zero-shot', text: 'Zero-shot', sub: true },
        { href: '#p-few-shot', text: 'Few-shot', sub: true },
        { href: '#p-cot', text: 'Chain-of-thought', sub: true },
        { href: '#p-self', text: 'Self-consistency', sub: true },
        { href: '#p-tot', text: 'Tree of Thoughts', sub: true },
        { href: '#p-react', text: 'ReAct', sub: true },
        { href: '#p-caveman', text: 'Caveman', sub: true },
        { href: '#p-role', text: 'Role / Persona', sub: true },
        { href: '#p-stepback', text: 'Step-back', sub: true },
        { href: '#p-generated', text: 'Generated knowledge', sub: true },
        { href: '#p-l2m', text: 'Least-to-most', sub: true },
        { href: '#p-meta', text: 'Meta-prompting', sub: true },
      ]},
      { label: 'Kiegészítők', links: [
        { href: '#p-structured', text: 'Strukturált kimenet', sub: true },
        { href: '#p-tools', text: 'Tool / function calling', sub: true },
        { href: '#p-rag', text: 'RAG prompting', sub: true },
        { href: '#p-eval', text: 'Értékelés & iteráció', sub: true },
        { href: '#p-cost', text: 'Költség & latency', sub: true },
      ]},
    ],
  };

  const sections = maps[id] || [];
  return sections.map(sec => `
    <div class="sidebar-section-label">${sec.label}</div>
    ${sec.links.map(l => `
      <a href="${l.href}" class="${l.sub ? 'sub' : ''}">
        ${l.num ? `<span class="sn">${l.num}</span>` : ''}
        ${l.text}
      </a>`).join('')}
  `).join('');
}

function attachSidebarLinks() {
  document.querySelectorAll('#sidebar-nav a').forEach(a => {
    a.addEventListener('click', () => {
      setTimeout(() => {
        document.querySelectorAll('#sidebar-nav a').forEach(x => x.classList.remove('active'));
        a.classList.add('active');
      }, 80);
    });
  });

  // scroll spy
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        document.querySelectorAll('#sidebar-nav a').forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  document.querySelectorAll('section[id], .tech[id], div[id]').forEach(el => observer.observe(el));
}

/* ─────────────────────────────────────────────
   ROADMAP MAP
───────────────────────────────────────────── */
const roadmap = [
  {
    id: "software", phase: "1. fázis",
    title: "Python + Backend alapok",
    short: "Modern Python, FastAPI, PostgreSQL, Docker és GitHub workflow.",
    tag: "3–5 hét", color: "#7dd3fc", x: 150, y: 450,
    description: ["Az AI mérnök nem csak notebookban dolgozik. Ezen a szinten stabil, tesztelhető, konténerizált backend alapokat építesz.", "Meg kell tanulnod tiszta Python projektstruktúrát kialakítani, konfigurációt és titkokat kezelni, hibákat logolni, teszteket írni és Dockerrel reprodukálható környezetet készíteni.", "A modul végére képesnek kell lenned egy olyan FastAPI szolgáltatást építeni, amely adatot fogad, validál, adatbázisba ment és konténerből futtatható."],
    skills: ["Python typing, pydantic, async alapok", "FastAPI REST API-k", "PostgreSQL, Redis, SQLAlchemy/SQLModel", "Docker, Docker Compose", "Git, GitHub Actions, alap tesztek"],
    tools: ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker"],
    project: "Dockerizált FastAPI backend dokumentumfeltöltéssel és PostgreSQL adatbázissal."
  },
  {
    id: "ml", phase: "2. fázis",
    title: "ML és matek minimum",
    short: "Statisztika, metrikák, klasszikus ML és modellezési gondolkodás.",
    tag: "4–6 hét", color: "#34d399", x: 820, y: 280,
    description: ["Az AI engineering gyakran előre tanított modellek alkalmazásáról szól, de értened kell a modellezés alaplogikáját.", "A matekban nem az akadémiai mélység a cél, hanem a használható intuíció: vektorok, mátrixok, koszinusz hasonlóság, eloszlások, veszteségfüggvények.", "A klasszikus ML azért fontos, mert sok üzleti problémára még mindig gyorsabb és olcsóbb egy jól mérhető scikit-learn modell, mint egy LLM."],
    skills: ["Lineáris algebra, koszinusz hasonlóság", "Precision/recall/F1", "Train/test split, cross-validation", "Logistic regression, random forest", "Feature engineering"],
    tools: ["NumPy", "pandas", "scikit-learn", "matplotlib", "MLflow"],
    project: "Support ticket classifier API metrikákkal, confusion matrixszal és Docker deployjal."
  },
  {
    id: "deep-nlp", phase: "3. fázis",
    title: "Deep Learning + NLP",
    short: "PyTorch, embeddings, attention és transformer intuíció.",
    tag: "3–5 hét", color: "#34d399", x: 970, y: 760,
    description: ["Nem kutatói mélység a cél, hanem az, hogy értsd a modern LLM-rendszerek alapfogalmait és tudj egyszerű neural pipeline-t építeni.", "Az NLP alapjai különösen fontosak: tokenizáció, embedding, szemantikus hasonlóság és attention nélkül nehéz jól megtervezni egy RAG rendszert.", "A gyakorlati cél egy embedding-alapú kereső megépítése."],
    skills: ["Tensor, Dataset, DataLoader, training loop", "Backpropagation és optimizer intuíció", "Tokenization, embeddings, semantic similarity", "Attention és transformer architektúra"],
    tools: ["PyTorch", "Hugging Face", "sentence-transformers", "Jupyter"],
    project: "Semantic search engine dokumentumokra embedding alapú top-k kereséssel."
  },
  {
    id: "llm", phase: "4. fázis",
    title: "LLM Engineering",
    short: "Promptok, structured output, tool calling, streaming és hibakezelés.",
    tag: "5–7 hét", color: "#c084fc", x: 1350, y: 280,
    description: ["Az LLM engineering lényege, hogy előre tanított modelleket használsz valós termékfunkciókhoz. Ide tartozik a prompt engineering, strukturált válaszok, tool calling, streaming, rate limit kezelés.", "A válaszokat nem szabad egyszerű szövegként kezelni ha downstream rendszer használja őket; JSON schema vagy Pydantic validáció kell.", "Tudj olyan LLM szolgáltatást építeni, amely képes adatbázisból információt kérni, külső toolt hívni és strukturált választ adni."],
    skills: ["System/developer/user üzenetek", "JSON schema és Pydantic structured output", "Function calling / tool calling", "Streaming, rate limit, retry logic", "Token, latency és költségmérés"],
    tools: ["OpenAI API", "Anthropic", "Gemini", "Pydantic", "httpx"],
    project: "AI Operations Assistant adatbázis-lekérdezéssel, ticket létrehozással és strukturált válaszokkal."
  },
  {
    id: "rag", phase: "5. fázis",
    title: "RAG rendszerek",
    short: "Dokumentumfeldolgozás, chunking, vector DB, hybrid search és citation.",
    tag: "5–7 hét", color: "#34d399", x: 1530, y: 650,
    description: ["A RAG a legnépszerűbb LLM-integráció vállalati kontextusban. Az alapötlet egyszerű: ahelyett, hogy a modell saját tudásából válaszol, releváns dokumentumokat keresel elő és azokat adod kontextusként.", "A minőség kritikus pontjai: a chunking stratégia, az embedding modell minősége, a retrieval precizitása, és végül az, hogyan szerkeszted a kontextust a promptba.", "Produkciós RAG-hoz kell: hybrid search, reranker, citation visszakövethetőség, hallucináció-szűrés és rendszeres eval."],
    skills: ["PDF/Word/HTML feldolgozás", "Recursive chunking stratégiák", "Vektortár (pgvector, Qdrant, Pinecone)", "Hybrid search és reranking", "Citation és hallucination guard"],
    tools: ["LangChain", "LlamaIndex", "Qdrant", "pgvector", "Unstructured"],
    project: "Production-ready RAG rendszer 100+ dokumentumon hybrid search-sel, citation-nel és eval riporttal."
  },
  {
    id: "agents", phase: "6. fázis",
    title: "AI Ágensek",
    short: "ReAct, tool orchestration, multi-agent, memory és biztonság.",
    tag: "5–7 hét", color: "#f59e0b", x: 1680, y: 280,
    description: ["Az agent alapgondolata: a modell nem csak szöveget generál, hanem döntést hoz arról, mit tegyen következőnek — kérdést tesz fel, eszközt hív meg, majd az eredmény alapján folytatja.", "A legnehezebb részek: a megbízhatóság és a biztonság. Az agent hibázhat, végtelen loop-ba kerülhet, ártó promptokat kaphat az eszközökből, vagy indokolatlan jogokat kérhet.", "A multi-agent rendszereknél szerepek, felelősségek és kommunikáció is tervezési döntés."],
    skills: ["ReAct loop és tool planning", "Custom tool implementáció", "Agent memory és state kezelés", "Multi-agent koordináció", "Guardrails és biztonság"],
    tools: ["LangGraph", "CrewAI", "AutoGen", "Mem0", "Langfuse"],
    project: "Kutatási asszisztens agent: webes kereséssel, összefoglalóval, fájlmentéssel és email küldéssel."
  },
  {
    id: "llmops", phase: "7. fázis",
    title: "LLMOps",
    short: "Eval, tracing, monitoring, guardrails és production deploy.",
    tag: "4–6 hét", color: "#fb7185", x: 1800, y: 600,
    description: ["Az LLMOps az AI engineering production-érettségének mérőszáma. Nem elég, hogy az alkalmazás lokálisan működik — megbízhatóan, mérhetően és biztonságosan kell futnia.", "A minimum: egy golden dataset kérdéssel és elvárt válaszokkal, eval runner, tracing és cost monitoring.", "A guardrail réteg véd a prompt injection, PII szivárgás és modell által generált káros tartalom ellen."],
    skills: ["Golden dataset és eval runner", "Tracing, token usage, latency monitoring", "Prompt regression testing", "Prompt injection és PII védelem", "Model routing, caching, fallback"],
    tools: ["LangSmith", "Arize Phoenix", "Helicone", "OpenTelemetry", "DeepEval"],
    project: "LLMOps mini platform prompt registryvel, eval dashboarddal és trace viewerrel."
  },
  {
    id: "multimodal", phase: "8. fázis",
    title: "Multimodal AI",
    short: "PDF, kép, OCR, audio és dokumentumintelligencia.",
    tag: "3–5 hét", color: "#7dd3fc", x: 1040, y: 1080,
    description: ["Sok üzleti AI feladat nem tiszta szöveggel indul, hanem PDF-fel, screenshotokkal, számlákkal, képekkel vagy hanggal.", "A multimodalitásnál különösen fontos a validáció. Egy számla vagy szerződés feldolgozásánál mezőszintű ellenőrzés, confidence, emberi jóváhagyás és auditálható változtatás kell.", "Olyan rendszert érdemes építeni, amely dokumentumot fogad, adatokat nyer ki, JSON-ba rendezi és hibás mezőknél review folyamatot indít."],
    skills: ["Vision model inputok", "OCR és document parsing", "Structured extraction JSON-ba", "Human review hibás mezőknél"],
    tools: ["Vision LLM-ek", "Tesseract/PaddleOCR", "Unstructured", "Whisper"],
    project: "Invoice & Document Intelligence rendszer számlamezők kinyerésével és validációs dashboarddal."
  },
  {
    id: "finetune", phase: "9. fázis",
    title: "Fine-tuning + OSS",
    short: "LoRA, QLoRA, vLLM, Ollama és inference optimalizálás.",
    tag: "3–5 hét", color: "#34d399", x: 1510, y: 1080,
    description: ["Fine-tuningra nincs mindig szükség, de értened kell, mikor indokolt. Ha friss vagy változó tudást akarsz hozzáadni, általában RAG kell. Ha viselkedést, stílust kell stabilizálni, akkor fine-tuning.", "Az open-source modellek ismerete fontos, mert nem minden cég akar külső API-ra támaszkodni. Tudnod kell lokálisan vagy saját szerveren futtatni modelleket.", "Összehasonlítás a cél: baseline ML, prompt-only LLM, RAG és fine-tuned kisebb modell — minőség, költség, latency alapján."],
    skills: ["Instruction tuning és dataset formátumok", "LoRA/QLoRA és PEFT", "Open-source modellek futtatása", "Quantization és GPU memória"],
    tools: ["Hugging Face", "PEFT", "TRL", "Ollama", "vLLM", "llama.cpp"],
    project: "Domain-specific classifier összehasonlítással: klasszikus ML, prompt-only, RAG és fine-tuned."
  },
  {
    id: "portfolio", phase: "10. fázis",
    title: "Portfólió + Interjú",
    short: "GitHub projektek, demo videók, architektúra és állásfelkészülés.",
    tag: "3–4 hét", color: "#fb7185", x: 1900, y: 900,
    description: ["A portfólió akkor erős, ha nem csak működő demókat mutat, hanem döntéseket, trade-offokat és mérési eredményeket is.", "Minden projektedhez legyen tiszta README, architektúraábra, lokális indítási útmutató és demo videó.", "Interjúra készülj rendszertervezési szempontból is: RAG vs fine-tuning, agent biztonság, hallucination mérés és skálázás."],
    skills: ["4–6 erős GitHub projekt", "README architektúraábrával", "Demo videó és live deploy", "Metrikák, eval eredmények, cost becslés"],
    tools: ["GitHub", "Docker", "Loom", "Vercel", "Mermaid"],
    project: "Komplett AI engineer portfólió: RAG, agent, LLMOps, multimodal és ML projekt."
  }
];

const edges = [
  ["software","ml"],["ml","deep-nlp"],["deep-nlp","llm"],
  ["llm","rag"],["rag","agents"],["agents","llmops"],
  ["llm","multimodal"],["rag","finetune"],["llmops","portfolio"],
  ["finetune","portfolio"],["multimodal","portfolio"]
];

let mapInitialized = false;
let activeFilter = 'all';

function initMap() {
  if (mapInitialized) return;
  mapInitialized = true;

  const shell  = document.getElementById('map-shell');
  const canvas = document.getElementById('map-canvas');
  const svgEl  = document.getElementById('map-svg');
  const panel  = document.getElementById('map-panel');

  const W = 2200, H = 1400;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';
  svgEl.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svgEl.style.width  = W + 'px';
  svgEl.style.height = H + 'px';

  // draw edges
  const defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
  svgEl.appendChild(defs);
  edges.forEach(([a,b]) => {
    const na = roadmap.find(n=>n.id===a), nb = roadmap.find(n=>n.id===b);
    if (!na || !nb) return;
    const ax = na.x+115, ay = na.y+70, bx = nb.x+115, by = nb.y+70;
    const mx = (ax+bx)/2, my = (ay+by)/2;
    const path = document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d', `M${ax},${ay} C${mx},${ay} ${mx},${by} ${bx},${by}`);
    path.setAttribute('class','path');
    svgEl.appendChild(path);
  });

  // create nodes
  roadmap.forEach((node, i) => {
    const el = document.createElement('div');
    el.className = 'map-node';
    el.id = `node-${node.id}`;
    el.style.cssText = `left:${node.x}px;top:${node.y}px;--node-color:${node.color}`;

    el.innerHTML = `
      <span class="node-time">${node.tag}</span>
      <div class="node-label">${node.title}</div>
      <div class="node-desc">${node.short}</div>
      <div class="node-pills">
        ${node.tools.slice(0,3).map(t=>`<span class="pill">${t}</span>`).join('')}
      </div>`;

    el.addEventListener('click', () => openPanel(node));
    canvas.appendChild(el);
  });

  // pan & zoom
  let tx = -200, ty = -180, scale = 0.55;
  let dragging = false, startX, startY, startTx, startTy;

  function applyTransform(animate) {
    canvas.style.transition = animate ? 'transform 0.4s cubic-bezier(.18,.89,.32,1.08)' : 'none';
    canvas.style.transform  = `translate(${tx}px,${ty}px) scale(${scale})`;
  }
  applyTransform(false);

  shell.addEventListener('mousedown', e => {
    if (e.target.closest('.map-node')) return;
    dragging = true; shell.classList.add('dragging');
    startX = e.clientX; startY = e.clientY;
    startTx = tx; startTy = ty;
  });

  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    tx = startTx + (e.clientX - startX);
    ty = startTy + (e.clientY - startY);
    applyTransform(false);
  });

  window.addEventListener('mouseup', () => { dragging = false; shell.classList.remove('dragging'); });

  shell.addEventListener('wheel', e => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.91;
    scale = Math.max(0.25, Math.min(2, scale * factor));
    applyTransform(false);
  }, { passive: false });

  // zoom buttons
  document.getElementById('btn-zoom-in').addEventListener('click',  () => { scale = Math.min(2, scale*1.2); applyTransform(true); });
  document.getElementById('btn-zoom-out').addEventListener('click', () => { scale = Math.max(0.25, scale*0.83); applyTransform(true); });
  document.getElementById('btn-reset').addEventListener('click',    () => { tx=-200; ty=-180; scale=0.55; applyTransform(true); });

  // filter chips
  document.querySelectorAll('.map-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const f = chip.dataset.filter;
      activeFilter = f;
      document.querySelectorAll('.map-chip').forEach(c => c.classList.toggle('chip-active', c.dataset.filter === f));
      filterNodes(f);
    });
  });

  document.getElementById('panel-close').addEventListener('click', () => {
    panel.classList.remove('open');
  });
}

function filterNodes(filter) {
  roadmap.forEach(n => {
    const el = document.getElementById(`node-${n.id}`);
    if (!el) return;
    const show = filter === 'all' ||
      (filter === '1-3' && n.progress <= 3) ||
      (filter === '4-6' && n.progress >= 4 && n.progress <= 6) ||
      (filter === '7-10' && n.progress >= 7);
    el.style.opacity = show ? '1' : '0.2';
    el.style.pointerEvents = show ? 'auto' : 'none';
  });
}

function openPanel(node) {
  const panel = document.getElementById('map-panel');
  document.getElementById('panel-title').textContent = node.title;
  document.getElementById('panel-phase').textContent = node.phase + ' · ' + node.tag;
  document.getElementById('panel-desc').innerHTML = node.description.map(p => `<p>${p}</p>`).join('');
  document.getElementById('panel-skills').innerHTML = node.skills.map(s => `<li>${s}</li>`).join('');
  document.getElementById('panel-tools').innerHTML = node.tools.map(t => `<li>${t}</li>`).join('');
  document.getElementById('panel-project').textContent = node.project;
  panel.classList.add('open');
}

/* ─────────────────────────────────────────────
   INIT
───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const hash = (window.location.hash || '#roadmap').replace('#', '');
  const startPage = pages.includes(hash) ? hash : 'roadmap';
  showPage(startPage);

  document.querySelectorAll('.tnav-item').forEach(item => {
    item.addEventListener('click', () => showPage(item.dataset.page));
  });
});
