/* ═══════════════════════════════════════════════
   roadmap-data.js — az interaktív térkép adatai
   Ez STRUKTURÁLT ADAT (koordináták, élek, skill-listák),
   ezért nem markdown, hanem külön adatfájl. Szerkeszthető,
   de a build nem nyúl hozzá — az app.js olvassa futásidőben.
   ═══════════════════════════════════════════════ */

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
