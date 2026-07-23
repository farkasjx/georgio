/* ═══════════════════════════════════════════════
   content-graph-data.js — a kezdőoldali kapcsolati térkép adatai
   Ez a gráf a site tartalmi oldalait jeleníti meg, és azt mutatja meg,
   hogy az egyes témák hogyan kapcsolódnak egymáshoz. Kattintásra a
   csomópont panelt nyit, onnan lehet átugrani a teljes tartalomhoz.
   A csomópontok egérrel szabadon átrendezhetők (lásd app.js initMap).

   NYELVESÍTÉS: a pozíció/szín/kapcsolat (graphNodesBase, graphEdges)
   nyelvfüggetlen — csak egyszer kell karbantartani. A szövegek
   (cím, rövid leírás, panel-szöveg, klaszter-feliratok) a graphText
   objektumban élnek nyelvenként. A window.__LOCALE__-t a site/build.js
   írja be inline (lásd index.html), ez alapján áll össze lent a végső,
   már nyelvesített `graphNodes` és `graphClusterLabels`, amit az
   app.js használ.
   ═══════════════════════════════════════════════ */

/* nyelvfüggetlen: pozíció, szín, klaszter-hovatartozás
   4 klaszter, mindegyik egy külön, egymást nem átfedő fizikai régióban
   (2×2 elrendezés a canvasen — lásd app.js drawClusterRegions):
     bal-fent:  practice   (Gyakorlat & eszközök)
     jobb-fent: workflow   (Modell-belső működés)
     bal-lent:  model      (Modell & hardver)
     jobb-lent: knowledge  (Tudás & kontextus)             */
const graphNodesBase = [
  /* ── Gyakorlat & eszközök (bal-fent) ── */
  { id: 'tools',                   cluster: 'practice', color: '#4ecb8d', x: 100,  y: 100 },
  { id: 'prompting',               cluster: 'practice', color: '#e8a84a', x: 440,  y: 100 },
  { id: 'aiconfig',                cluster: 'practice', color: '#f472b6', x: 780,  y: 100 },
  { id: 'vibecoding',              cluster: 'practice', color: '#60a5fa', x: 100,  y: 340 },
  { id: 'agentic-coding',          cluster: 'practice', color: '#34d399', x: 440,  y: 340 },
  { id: 'ai-safety',               cluster: 'practice', color: '#ef4444', x: 780,  y: 340 },
  { id: 'agent-architecture',      cluster: 'practice', color: '#22d3ee', x: 100,  y: 580 },
  { id: 'glossary',                cluster: 'practice', color: '#eab308', x: 440,  y: 580 },

  /* ── Modell-belső működés (jobb-fent) ── */
  { id: 'reasoning',               cluster: 'workflow', color: '#fb923c', x: 1650,  y: 100 },
  { id: 'mcp',                     cluster: 'workflow', color: '#359a9c', x: 1990,  y: 100 },
  { id: 'security',                cluster: 'workflow', color: '#e06c75', x: 2330,  y: 100 },
  { id: 'multimodal',              cluster: 'workflow', color: '#c084fc', x: 1650,  y: 340 },
  { id: 'diffusion',               cluster: 'workflow', color: '#facc15', x: 1990,  y: 340 },
  { id: 'base-vs-instruct',        cluster: 'workflow', color: '#f87171', x: 2330,  y: 340 },
  { id: 'architecture',            cluster: 'workflow', color: '#818cf8', x: 1650,  y: 580 },
  { id: 'tokenization',            cluster: 'workflow', color: '#2dd4bf', x: 1990,  y: 580 },
  { id: 'randomness',              cluster: 'workflow', color: '#fb7185', x: 2330,  y: 580 },

  /* ── Modell & hardver (bal-lent) ── */
  { id: 'kv-cache',                cluster: 'model', color: '#8a5a2a', x: 100,  y: 1250 },
  { id: 'ollama',                  cluster: 'model', color: '#4ec9c9', x: 440,  y: 1250 },
  { id: 'hardware',                cluster: 'model', color: '#f0edeb', x: 780,  y: 1250 },
  { id: 'quantization-quality',    cluster: 'model', color: '#00ff55', x: 1120,  y: 1250 },
  { id: 'model-size',              cluster: 'model', color: '#98d016', x: 100,  y: 1490 },
  { id: 'dense-moe',               cluster: 'model', color: '#6160a3', x: 440,  y: 1490 },
  { id: 'model-routing',           cluster: 'model', color: '#496b8f', x: 780,  y: 1490 },
  { id: 'latency',                 cluster: 'model', color: '#523986', x: 1120,  y: 1490 },
  { id: 'model-training',          cluster: 'model', color: '#d97706', x: 100,  y: 1730 },
  { id: 'fine-tuning',             cluster: 'model', color: '#0ea5e9', x: 440,  y: 1730 },
  { id: 'evaluation',              cluster: 'model', color: '#84cc16', x: 780,  y: 1730 },

  /* ── Tudás & kontextus (jobb-lent) ── */
  { id: 'rag',                     cluster: 'knowledge', color: '#1613d4', x: 1650,  y: 1250 },
  { id: 'vectordb',                cluster: 'knowledge', color: '#17cb11', x: 1990,  y: 1250 },
  { id: 'memory',                  cluster: 'knowledge', color: '#e1c9cb', x: 2330,  y: 1250 },
  { id: 'okf',                     cluster: 'knowledge', color: '#a78bfa', x: 1650,  y: 1490 },
  { id: 'hallucination',           cluster: 'knowledge', color: '#a3ce40', x: 1990,  y: 1490 },
  { id: 'knowledge-cutoff',        cluster: 'knowledge', color: '#896671', x: 2330,  y: 1490 },
  { id: 'rlhf',                    cluster: 'knowledge', color: '#c9a9ac', x: 1650,  y: 1730 },
  { id: 'embedding-models',        cluster: 'knowledge', color: '#f59e0b', x: 1990,  y: 1730 },
];

const graphEdges = [
  ['tools','mcp'], ['tools','model-routing'],
  ['prompting','aiconfig'], ['prompting','hallucination'], ['prompting','mcp'], ['prompting','rlhf'],
  ['aiconfig','security'],
  ['security','mcp'],
  ['reasoning','prompting'], ['reasoning','tools'], ['reasoning','mcp'], ['reasoning','hallucination'], ['reasoning','rag'],
  ['vibecoding','prompting'], ['vibecoding','reasoning'], ['vibecoding','tools'], ['vibecoding','security'], ['vibecoding','aiconfig'],
  ['agentic-coding','vibecoding'], ['agentic-coding','reasoning'], ['agentic-coding','mcp'], ['agentic-coding','aiconfig'], ['agentic-coding','tools'],
  ['multimodal','reasoning'], ['multimodal','hallucination'], ['multimodal','rag'], ['multimodal','vectordb'], ['multimodal','mcp'],
  ['diffusion','multimodal'], ['diffusion','reasoning'],
  ['base-vs-instruct','rlhf'], ['base-vs-instruct','reasoning'], ['base-vs-instruct','model-size'], ['base-vs-instruct','ollama'],
  ['rag','vectordb'], ['rag','memory'], ['rag','hallucination'], ['rag','latency'], ['rag','knowledge-cutoff'],
  ['vectordb','memory'],
  ['okf','rag'], ['okf','memory'], ['okf','vectordb'], ['okf','aiconfig'], ['okf','mcp'],
  ['memory','kv-cache'],
  ['hallucination','knowledge-cutoff'], ['hallucination','rlhf'],
  ['kv-cache','hardware'], ['kv-cache','latency'], ['kv-cache','model-size'],
  ['hardware','model-size'], ['hardware','quantization-quality'], ['hardware','ollama'],
  ['ollama','quantization-quality'], ['ollama','model-size'], ['ollama','model-routing'],
  ['quantization-quality','model-size'], ['quantization-quality','dense-moe'],
  ['dense-moe','model-size'], ['dense-moe','model-routing'],
  ['model-routing','latency'],
  ['model-training','model-size'], ['model-training','dense-moe'], ['model-training','diffusion'], ['model-training','base-vs-instruct'],
  ['fine-tuning','model-training'], ['fine-tuning','quantization-quality'], ['fine-tuning','ollama'], ['fine-tuning','knowledge-cutoff'], ['fine-tuning','base-vs-instruct'],
  ['architecture','reasoning'], ['architecture','tokenization'], ['architecture','model-training'], ['architecture','dense-moe'], ['architecture','model-size'],
  ['tokenization','architecture'], ['tokenization','knowledge-cutoff'], ['tokenization','model-training'],
  ['randomness','reasoning'], ['randomness','hallucination'], ['randomness','agentic-coding'],
  ['evaluation','agentic-coding'], ['evaluation','model-size'], ['evaluation','randomness'],
  ['embedding-models','vectordb'], ['embedding-models','model-training'], ['embedding-models','fine-tuning'], ['embedding-models','dense-moe'], ['embedding-models','evaluation'],
  ['ai-safety','security'], ['ai-safety','base-vs-instruct'], ['ai-safety','rlhf'],
  ['agent-architecture','reasoning'], ['agent-architecture','mcp'], ['agent-architecture','agentic-coding'], ['agent-architecture','security'],
  ['glossary','tools'], ['glossary','architecture'], ['glossary','reasoning'], ['glossary','rag'],
];

/* nyelvfüggő szövegek */
const graphText = {
  hu: {
    clusterLabels: {
      practice:  'Gyakorlat & eszközök',
      workflow:  'Modell-belső működés',
      knowledge: 'Tudás & kontextus',
      model:     'Modell & hardver'
    },
    nodes: {
      tools: {
        title: 'AI Eszközök',
        short: 'API-k, keretrendszerek és fejlesztői eszközök áttekintése a napi munkához.',
        desc: ['Az AI eszköztár gyorsan bővül — ez az oldal rendszerezi, mikor melyik API-t, könyvtárat vagy platformot érdemes választani.', 'Sok itt bemutatott eszköz később a model routing és MCP témáknál is előkerül.']
      },
      prompting: {
        title: 'Prompt Engineering',
        short: 'Few-shot, ReAct és strukturált promptolási technikák a megbízhatóbb válaszokért.',
        desc: ['A jó prompt csökkenti a halucinációt és javítja a structured output minőségét — ezért kapcsolódik szorosan mindkét témához.', 'Az itt tanult minták (pl. ReAct) az agent- és tool-use jellegű megoldások alapját adják.']
      },
      mcp: {
        title: 'MCP',
        short: 'A Model Context Protocol felépítése és tipikus integrációs mintái (pl. Jira).',
        desc: ['Az MCP azt oldja meg, hogyan kapcsolódik a modell külső eszközökhöz és adatforrásokhoz szabványos módon.', 'Emiatt szorosan kapcsolódik a biztonsághoz (mit engedünk meg egy toolnak) és a promptoláshoz (hogyan írjuk le a tool-t a modellnek).']
      },
      security: {
        title: 'Biztonság & OWASP',
        short: 'OWASP LLM Top 10, prompt injection és egyéb biztonsági kockázatok kezelése.',
        desc: ['A biztonság mindenhol megjelenik, ahol a modell külső adatot vagy toolt használ — ezért köti össze az MCP és a config témákat.', 'Kiemelten fontos, amikor a rendszer autonóm módon (agentként) tud cselekvéseket végrehajtani.']
      },
      aiconfig: {
        title: 'AI Config fájlok',
        short: 'CLAUDE.md, .cursorrules és hasonló konfigurációs fájlok szerepe és felépítése.',
        desc: ['Ezek a fájlok gyakorlatilag "állandó promptok" egy projekthez — ezért él szoros kapcsolatban a prompt engineering résszel.', 'Biztonsági szempontból is releváns, hiszen ide kerülhetnek hozzáférési és viselkedési szabályok is.']
      },
      reasoning: {
        title: 'Reasoning',
        short: 'Attention, gondolkodó tokenek és eszközhasználat — hogyan old meg egy AI egy összetett feladatot.',
        desc: ['A reasoning (chain-of-thought) és a tool use együtt adja azt a hurkot, amivel a modell egy Excel-elemzést vagy egy kódolási feladatot lépésről lépésre végigvisz.', 'Szorosan kapcsolódik a prompthoz (hogyan írd le a feladatot) és az MCP-hez (milyen eszközökhöz fér hozzá a modell).']
      },
      vibecoding: {
        title: 'Vibe coding',
        short: 'Karpathy 2025-ös tweetjétől az "agentic engineering" fordulatig — hatások, kockázatok, és gyakorlati technikák.',
        desc: ['A szűk értelemben vett vibe coding — felügyelet nélküli, "Accept All" munkamód — hasznos alacsony tétű prototípusoknál, de dokumentált biztonsági incidensek sora köthető a felügyelet nélküli productionba engedéséhez.', 'Konkrét gyakorlati eszközöket is ad: config fájlokkal (AGENTS.md, CLAUDE.md), eszközválasztási döntési táblával és bemásolható biztonsági promptokkal.']
      },
      'agentic-coding': {
        title: 'Agentic kódolás',
        short: 'Architektúra, nem testtartás: a kész-definíció ellenében ellenőrzött hurok, subagentek és multi-agent orkesztrálás.',
        desc: ['A vibe codingtól élesen elhatárolva: itt a modell eszközökbe van bekötve, hurokban fut, és valaki a kész-definíció ellenében nézi át — nem az számít, mennyire "vibe" a munkamód, hanem ki felel a helyességért.', 'Tárgyalja a nagy kódbázisokon jelentkező "80%-os falat", a git worktree-alapú multi-agent orkesztrálást és a SWE-bench körüli méréstani vitákat is.']
      },
      multimodal: {
        title: 'Multimodális modellek',
        short: 'Hogyan lát, hall és ért egy AI — natív vs. kaszkád architektúra, és miért hisz a modell inkább a szövegnek.',
        desc: ['A vision encoder, a projection layer és az LLM hármasa alakítja számmá a képet — ugyanaz az attention dolgozza fel, mint a szöveges tokent, ezért öröklődnek bele a Reasoning tutorialban látott mechanizmusok és korlátok is.', 'Konkrét hibamódokat is tárgyal (számlálás, térbeli reláció, vizuális hallucináció) és egy döntési keretet OCR vs. vision LLM választáshoz dokumentum-feldolgozásnál.']
      },
      diffusion: {
        title: 'Diffúziós modellek',
        short: 'Rövid kitekintés: egy másik generálási elv — zajból bontás, nem szóról szóra jóslás — kép, videó és (meglepő módon) szöveg mögött.',
        desc: ['A kép- és videógenerálás (Midjourney, Stable Diffusion, Sora) szinte mind ezt az elvet használja: a teljes kimenet egyszerre, zajból bontakozik ki, globálisan finomítva — nem szóról szóra, mint egy LLM.', '2025 óta léteznek diffúziós szöveggeneráló modellek (Mercury, Gemini Diffusion) is, 5–10× gyorsabbak rövid, strukturált kimeneteknél, de elmaradnak összetett következtetésben.']
      },
      'base-vs-instruct': {
        title: 'Base vs. Instruct modell',
        short: 'Hogyan lesz a nyers, "csak folytató" szövegjósolóból segítőkész asszisztens — pretraining, instruction tuning, és ami utána jön.',
        desc: ['A base modell csak statisztikailag folytatja a szöveget; az instruction tuning speciális jelölő-tokenekkel tanítja meg, hogy egy kérdésre válaszoljon, ne folytassa azt — ez a lépés, ami sokszor nagyobb gyakorlati különbséget jelent, mint a nyers modellméret.', 'Összeköti a RLHF (a harmadik, finomító lépés) és a Reasoning (a negyedik, "gondolkodó" réteg) tutorialokat egyetlen, áttekinthető képbe.']
      },
      rag: {
        title: 'RAG',
        short: 'Dokumentumfeldolgozás, chunking, vektortár és hybrid search egy RAG pipeline-ban.',
        desc: ['A RAG a legnépszerűbb módja annak, hogy friss, cégspecifikus tudást adjunk a modell kontextusához a tudás-limit (knowledge cutoff) áthidalására.', 'A minőségét a vektoradatbázis, a memória-kezelés és a halucináció elleni védekezés együtt határozza meg.']
      },
      vectordb: {
        title: 'Vector adatbázisok',
        short: 'pgvector, Qdrant, Pinecone — hogyan tárolják és keresik az embeddingeket.',
        desc: ['A vektoradatbázis a RAG retrieval rétegének motorja: itt dől el, mennyire gyors és pontos a dokumentum-visszakeresés.', 'Szorosan összefügg a memóriakezeléssel is, hiszen sok agent-memória megoldás ugyanezt az infrastruktúrát használja.']
      },
      memory: {
        title: 'Memory',
        short: 'Hosszú távú memória agenteknek: mit, hogyan és meddig érdemes megjegyezni.',
        desc: ['A memória-rendszerek gyakran vektoradatbázisra épülnek, de a KV cache-hez hasonlóan a "mit tartsunk meg" kérdése is központi.', 'Rossz memóriakezelés egyenesen vezet halucinációhoz vagy elavult válaszokhoz.']
      },
      okf: {
        title: 'Open Knowledge Format',
        short: 'A Google 2026-os nyílt szabványa: markdown + frontmatter tudásformátum AI-ügynököknek.',
        desc: ['Nem RAG-helyettesítő, hanem kurált, verzió-kontrollált tudásreprezentáció — a RAG és a vektor-DB gyakran erre épülhet rá lekérdezéskor.', 'Az AGENTS.md/CLAUDE.md konvenciót (AI Config fájlok) és az MCP-vel elérhető tudást is közös keretbe helyezi.']
      },
      hallucination: {
        title: 'Halucináció',
        short: 'Miért generál a modell téves állításokat, és hogyan mérhető, csökkenthető.',
        desc: ['A halucináció gyökere gyakran a tudás-limitben vagy a hiányos kontextusban keresendő — ezért kapcsolódik szorosan a RAG-hoz és a knowledge cutoff témához.', 'A csökkentésében a jó promptolás és az RLHF finomhangolás is szerepet játszik.']
      },
      'knowledge-cutoff': {
        title: 'Tudás limit',
        short: 'Mit jelent a tréning-adat "vágási dátuma", és hogyan kezeljük a hiányzó tudást.',
        desc: ['A modell csak a tréningig terjedő tudással rendelkezik — az ez utáni eseményekhez RAG vagy friss kontextus kell.', 'A cutoffon túli kérdésekre adott magabiztos, de téves válasz az egyik leggyakoribb halucináció-forrás.']
      },
      rlhf: {
        title: 'RLHF',
        short: 'Hogyan alakítja emberi visszajelzés a modell viselkedését és "személyiségét".',
        desc: ['Az RLHF (és rokon technikák) döntik el, mennyire lesz a modell segítőkész, óvatos vagy éppen halucináció-hajlamos.', 'Ez a láthatatlan réteg épp úgy befolyásolja a promptra adott választ, mint maga a prompt szövege.']
      },
      'kv-cache': {
        title: 'KV cache',
        short: 'A key-value cache mechanizmusa és memóriaigénye hosszú kontextusoknál.',
        desc: ['A KV cache teszi gyorssá a token-generálást, cserébe egyenesen arányos memóriát fogyaszt a kontextus hosszával.', 'Ez az egyik fő oka annak, hogy a hosszú kontextus a látenciát és a hardverigényt is megnöveli.']
      },
      ollama: {
        title: 'Lokális LLM',
        short: 'Ollama-alapú fejlesztői terv 10 szinten, saját gépen futó modellekkel.',
        desc: ['A lokális futtatás megérteti a hardverigényt, a kvantálást és a modellméret hatásait — gyakorlatban, saját gépen.', 'Ez a legjobb belépési pont a modell-és-hardver klaszter többi témájához.']
      },
      hardware: {
        title: 'Hardware',
        short: 'VRAM-igény, GPU-választás és erőforrás-tervezés lokális modellekhez.',
        desc: ['A hardver szabja meg, mekkora és milyen kvantálású modell futtatható egyáltalán — ezért köti össze a kvantálást és a modellméretet.', 'A KV cache mérete is közvetlenül a rendelkezésre álló VRAM-ból von el helyet.']
      },
      'quantization-quality': {
        title: 'Kvantálás és minőség',
        short: 'Hogyan hat a 4/8-bites kvantálás a válaszminőségre és a memóriaigényre.',
        desc: ['A kvantálás kompromisszum a hardverigény és a válaszminőség között — minél agresszívebb, annál nagyobb a minőségromlás kockázata.', 'Dense és MoE modelleknél eltérően viselkedik, ezért érdemes együtt nézni azzal a témával.']
      },
      'model-size': {
        title: 'Model paraméterek',
        short: 'Mit jelentenek a paraméterszámok a gyakorlatban, és hogyan skálázódik velük a minőség.',
        desc: ['A paraméterszám önmagában nem mindent eldöntő — a kvantálással és az architektúrával (dense vs. MoE) együtt kell értelmezni.', 'A hardverigény becslésének is ez az egyik kiindulópontja.']
      },
      'dense-moe': {
        title: 'Dense vs MoE modellek',
        short: 'Sűrű és Mixture-of-Experts architektúrák összehasonlítása compute és memória szempontból.',
        desc: ['A MoE modellek több paramétert tárolnak, de kevesebbet aktiválnak lekérdezésenként — ez másképp terheli a hardvert, mint egy dense modell.', 'A model routing gyakran épp erre az architekturális különbségre épít.']
      },
      'model-routing': {
        title: 'Model routing',
        short: 'Mikor érdemes kisebb, olcsóbb modellre terelni egy kérést a nagy helyett.',
        desc: ['A routing költség és látencia optimalizálás: egyszerű kéréseket olcsóbb modell, komplexeket erősebb modell szolgál ki.', 'Az eszközök (tools) és az architektúra-választás (dense/MoE) egyaránt befolyásolja, hogyan érdemes routolni.']
      },
      latency: {
        title: 'Latency',
        short: 'Miből áll össze a válaszidő, és hol lehet ténylegesen gyorsítani.',
        desc: ['A látencia nagy részét a KV cache mérete, a hardver és a modellméret adja — ezek együtt szabják meg a felhasználói élményt.', 'RAG rendszereknél a retrieval lépés is jelentősen hozzáadhat a teljes válaszidőhöz.']
      },
      'model-training': {
        title: 'Modelltanítás',
        short: 'Hogyan tanul egy modell a nulláról: a "jósolj, mérd a hibát, korrigálj" hurok, ami a súlyokból vektorteret épít.',
        desc: ['Ugyanaz a gradiens-alapú hurok — forward pass, loss, backward pass, súlyfrissítés — áll egy LLM és egy diffúziós modell tanítása mögött is, csak más a jóslási cél.', 'Konkrét adat- és költségnagyságrendekkel, kis vs. nagy modell tanítási filozófiájával és a distillation/szintetikus adat technikákkal.']
      },
      'fine-tuning': {
        title: 'Fine-tuning technikák',
        short: 'LoRA, QLoRA és a specializáció: hogyan hangolj egy már betanított modellt a pretraining költségének töredékéért.',
        desc: ['A LoRA "kis mátrix" trükkje fagyva hagyja a bázis-súlyokat, és csak egy apró, tanítható javítást ad hozzá — ez teszi lehetővé, hogy nagy modelleket is fogyasztói GPU-n finomhangolj.', 'A QLoRA ezt kvantálással kombinálja, ami akár 65 milliárd paraméteres modellek finomhangolását is lehetővé teszi egyetlen GPU-n.']
      },
      architecture: {
        title: 'Egy modell anatómiája',
        short: 'Rétegről rétegre: embedding, attention, feed-forward — a teljes út bemenettől kimenetig, matek nélkül.',
        desc: ['Egy térkép, ami összeköti a Reasoning (attention), a Hogyan tanul egy modell (súlyok) és a Dense vs. MoE (feed-forward) tutorialokat egyetlen, koherens áttekintésbe.', 'Konkrét réteg- és dimenziószámokkal valós modelleknél (GPT-3: 96 réteg, Llama 3 405B: 126 réteg).']
      },
      tokenization: {
        title: 'Tokenizáció',
        short: 'Hogyan vágja szét a modell a szöveget — és miért kerül ez többe magyarul, mint angolul.',
        desc: ['A BPE-algoritmus lépésről lépésre, konkrét szótárméret-adatokkal és a modern modellek trendjeivel (30K → 200K).', 'A magyar és hasonló, toldalékoló nyelvek dokumentált "nyelvi adója" — konkrét szorzókkal és a valós költség-/kontextusablak-következményekkel.']
      },
      randomness: {
        title: 'Véletlenszerűség és mintavételezés',
        short: 'Miért mond a modell mindig 73-at — a token-valószínűség, a temperature és az emberi torzítás felerősítése.',
        desc: ['A modell nem "gondol" egy számra — egy erősen torzított valószínűségi eloszlásból választ, amit a tanítóadatban látott emberi mintázatok alakítottak ki.', 'A meglepő fordulat: az emberek is torzítottan választanak (Veritasium-kísérlet), a modell ezt a torzítást felerősíti, nem magától találja ki.']
      },
      evaluation: {
        title: 'Hogyan mérjük egy modell tudását',
        short: 'Benchmarkok és korlátaik: MMLU, GPQA, SWE-bench — mit mérnek valójában, és miért nem szabad túl komolyan venni egy leaderboard-helyezést.',
        desc: ['A szaturáció (MMLU 88%+ a csúcson) és a kontamináció problémája — amikor egy teszt már nem különböztet meg semmit, vagy a modell "megjegyezte" a vizsgát.', 'Gyakorlati eljárás modellválasztáshoz: durva szűrés benchmarkkal, majd saját, releváns tesztkészlettel való megerősítés.']
      },
      'embedding-models': {
        title: 'Embedding modellek',
        short: 'Hogyan készül a vektortér, amit a RAG és a keresés használ — kontrasztív tanulás, pozitív/negatív párok.',
        desc: ['Egy külön tanítási cél (hasonlóság szerinti rendezés), ami nem következik automatikusan a szöveggenerálásra optimalizált pretrainingből.', 'Két fejlesztési út: dedikált, kisebb encoder vs. egy nagy LLM átalakítása embedding-generátorrá, plusz az MTEB benchmark mint mérőeszköz.']
      },
      'ai-safety': {
        title: 'Alignment és red teaming',
        short: 'Mi az alignment probléma fogalmilag, és hogyan teszteli a szakma egy modell megbízhatóságát red teaminggel.',
        desc: ['Az alignment (építő) és a red teaming (romboló) megközelítés — miért dolgozik a kettő együtt, és mit mutatnak a 2026-os kutatási számok a jailbreak-ellenállóságról.', 'A realisztikus cél nem a nulla jailbreak, hanem a szűk, drága, detektálható sikeres támadás — kapcsolódva a gyakorlati Biztonság & OWASP tutorialhoz.']
      },
      'agent-architecture': {
        title: 'Hogyan dönt egy AI agent',
        short: 'A ReAct hurok: gondolkodj, cselekedj, figyeld meg, ismételd — és a "mikor van vége" probléma.',
        desc: ['Hogyan dönti el a modell, melyik eszközt hívja (tool-definíció alapú választás), és miért nincs beépített "kész" fogalma egy agentnek.', 'Három eszköz-kategória (data, action, orchestration) mint gyakorlati tervezési szempont a kockázat-kezeléshez.']
      },
      glossary: {
        title: 'Fogalomtár',
        short: 'Több mint 80 fogalom egy helyen, rövid magyarázattal és linkkel a részletes tárgyaláshoz — nem száraz lista.',
        desc: ['Ha egy cikkben ismeretlen kifejezésbe futsz, itt egy-két mondat elég a gyors megértéshez — a link pedig elvisz a teljes mechanizmushoz, ha mélyebbre mennél.', 'Ugyanaz az adatforrás táplálja az automatikus linkelést is a cikkek szövegében, szóval a fogalmak a saját olvasás közben is felbukkannak, összekapcsolva.']
      }
    }
  },

  en: {
    clusterLabels: {
      practice:  'Practice & Tools',
      workflow:  'How the Model Works',
      knowledge: 'Knowledge & Context',
      model:     'Model & Hardware'
    },
    nodes: {
      tools: {
        title: 'AI Tools',
        short: 'Overview of APIs, frameworks, and developer tools for day-to-day work.',
        desc: ['The AI toolkit keeps growing fast — this page helps you decide when to reach for which API, library, or platform.', 'Many of the tools covered here come up again in the model routing and MCP topics.']
      },
      prompting: {
        title: 'Prompt Engineering',
        short: 'Few-shot, ReAct, and structured prompting techniques for more reliable answers.',
        desc: ['A good prompt reduces hallucination and improves the quality of structured output — that\u2019s why it connects closely to both topics.', 'The patterns learned here (like ReAct) form the basis for agent- and tool-use-style solutions.']
      },
      mcp: {
        title: 'MCP',
        short: 'The structure of the Model Context Protocol and typical integration patterns (e.g. Jira).',
        desc: ['MCP solves how a model connects to external tools and data sources in a standardized way.', 'That\u2019s why it\u2019s closely tied to security (what you allow a tool to do) and prompting (how you describe the tool to the model).']
      },
      security: {
        title: 'Security & OWASP',
        short: 'OWASP LLM Top 10, prompt injection, and other security risks — and how to handle them.',
        desc: ['Security shows up wherever the model uses external data or tools — which is why it connects MCP and the config topics.', 'It\u2019s especially critical once the system can take actions autonomously, as an agent.']
      },
      aiconfig: {
        title: 'AI Config Files',
        short: 'The role and structure of files like CLAUDE.md, .cursorrules, and similar config files.',
        desc: ['These files are essentially "persistent prompts" for a project — which is why they\u2019re closely tied to prompt engineering.', 'They\u2019re also security-relevant, since access and behavior rules can live here too.']
      },
      reasoning: {
        title: 'Reasoning',
        short: 'Attention, reasoning tokens, and tool use — how an AI works through a complex task.',
        desc: ['Reasoning (chain-of-thought) and tool use together form the loop a model uses to carry out something like an Excel analysis or a coding task, step by step.', 'It ties closely to prompting (how you describe the task) and to MCP (what tools the model can access).']
      },
      vibecoding: {
        title: 'Vibe Coding',
        short: 'From Karpathy\u2019s 2025 tweet to the \u201cagentic engineering\u201d turn — impact, risks, and practical techniques.',
        desc: ['Vibe coding in the narrow sense \u2014 unreviewed, \u201cAccept All\u201d development \u2014 is useful for low-stakes prototypes, but a string of documented security incidents traces back to letting it into production unsupervised.', 'Also covers practical tools: rule files (AGENTS.md, CLAUDE.md), a tool-choice decision table, and copy-pasteable security prompts.']
      },
      'agentic-coding': {
        title: 'Agentic Coding',
        short: 'Architecture, not posture: a loop checked against a definition of done, subagents, and multi-agent orchestration.',
        desc: ['Sharply distinguished from vibe coding: here the model is wired into tools, runs in a loop, and someone reviews it against a definition of done \u2014 what matters is who owns correctness, not how \u201cvibe\u201d the workflow feels.', 'Covers the \u201c80% wall\u201d on large codebases, git-worktree-based multi-agent orchestration, and the measurement debates around SWE-bench.']
      },
      multimodal: {
        title: 'Multimodal Models',
        short: 'How an AI sees, hears, and understands \u2014 native vs. cascaded architecture, and why the model trusts text over pixels.',
        desc: ['The vision encoder, projection layer, and LLM trio turn an image into numbers \u2014 the same attention mechanism processes it as text tokens, so it inherits the mechanisms and limits covered in the Reasoning tutorial.', 'Also covers concrete failure modes (counting, spatial relations, visual hallucination) and a decision framework for OCR vs. vision LLM in document processing.']
      },
      diffusion: {
        title: 'Diffusion Models',
        short: 'A short detour: a different generation principle \u2014 unfolding from noise, not predicting word by word \u2014 behind image, video, and (surprisingly) text.',
        desc: ['Image and video generation (Midjourney, Stable Diffusion, Sora) almost all use this principle: the entire output emerges from noise at once, refined globally \u2014 not word by word like an LLM.', 'Since 2025, diffusion-based text generation models exist too (Mercury, Gemini Diffusion), 5\u201310\u00d7 faster on short, structured outputs, though still behind on complex reasoning.']
      },
      'base-vs-instruct': {
        title: 'Base vs. Instruct Models',
        short: 'How a raw, \u201cjust keeps completing\u201d text predictor becomes a helpful assistant \u2014 pretraining, instruction tuning, and what comes after.',
        desc: ['A base model just statistically continues text; instruction tuning uses special marker tokens to teach it to answer a question instead of continuing it \u2014 a step that often matters more in practice than raw model size.', 'Ties together the RLHF (the third, refining step) and Reasoning (the fourth, \u201cthinking\u201d layer) tutorials into one coherent picture.']
      },
      rag: {
        title: 'RAG',
        short: 'Document processing, chunking, vector stores, and hybrid search in a RAG pipeline.',
        desc: ['RAG is the most popular way to give a model fresh, company-specific knowledge to bridge its knowledge cutoff.', 'Its quality is shaped jointly by the vector database, memory handling, and defenses against hallucination.']
      },
      vectordb: {
        title: 'Vector Databases',
        short: 'pgvector, Qdrant, Pinecone — how embeddings get stored and searched.',
        desc: ['The vector database is the engine of the RAG retrieval layer: it determines how fast and accurate document retrieval is.', 'It\u2019s closely tied to memory handling too, since many agent-memory solutions rely on the same infrastructure.']
      },
      memory: {
        title: 'Memory',
        short: 'Long-term memory for agents: what to remember, how, and for how long.',
        desc: ['Memory systems often build on a vector database, but — much like KV cache — the core question is "what\u2019s worth keeping."', 'Poor memory handling leads directly to hallucination or stale answers.']
      },
      okf: {
        title: 'Open Knowledge Format',
        short: 'Google\u2019s 2026 open standard: a markdown + frontmatter knowledge format for AI agents.',
        desc: ['Not a RAG replacement but a curated, version-controlled knowledge representation — RAG and vector databases can build on top of it at query time.', 'It brings the AGENTS.md/CLAUDE.md convention (AI Config Files) and MCP-exposed knowledge into a shared frame.']
      },
      hallucination: {
        title: 'Hallucination',
        short: 'Why models generate false statements, and how it can be measured and reduced.',
        desc: ['The roots of hallucination often lie in the knowledge cutoff or missing context — which is why it\u2019s closely tied to RAG and knowledge cutoff.', 'Good prompting and RLHF fine-tuning both play a role in reducing it.']
      },
      'knowledge-cutoff': {
        title: 'Knowledge Cutoff',
        short: 'What the training data\u2019s "cutoff date" means, and how to handle missing knowledge.',
        desc: ['A model only has knowledge up to its training cutoff — anything after that needs RAG or fresh context.', 'A confident but wrong answer to a post-cutoff question is one of the most common sources of hallucination.']
      },
      rlhf: {
        title: 'RLHF',
        short: 'How human feedback shapes a model\u2019s behavior and "personality."',
        desc: ['RLHF (and related techniques) determine how helpful, cautious, or hallucination-prone a model ends up being.', 'This invisible layer shapes the response to a prompt just as much as the prompt text itself.']
      },
      'kv-cache': {
        title: 'KV Cache',
        short: 'The mechanics of the key-value cache and its memory footprint for long contexts.',
        desc: ['KV cache is what makes token generation fast, at the cost of memory that scales directly with context length.', 'That\u2019s a major reason long context increases both latency and hardware requirements.']
      },
      ollama: {
        title: 'Local LLM',
        short: 'An Ollama-based learning plan across 10 levels, running models on your own machine.',
        desc: ['Running locally builds real intuition for hardware requirements, quantization, and the effects of model size — hands-on, on your own machine.', 'It\u2019s the best entry point into the rest of the model-and-hardware cluster.']
      },
      hardware: {
        title: 'Hardware',
        short: 'VRAM requirements, GPU choice, and resource planning for local models.',
        desc: ['Hardware determines what size and quantization of model can even run — which is why it ties together quantization and model size.', 'KV cache size also eats directly into available VRAM.']
      },
      'quantization-quality': {
        title: 'Quantization & Quality',
        short: 'How 4-bit/8-bit quantization affects answer quality and memory footprint.',
        desc: ['Quantization is a trade-off between hardware requirements and answer quality — the more aggressive it is, the greater the risk of quality loss.', 'It behaves differently for dense vs. MoE models, so it\u2019s worth considering alongside that topic.']
      },
      'model-size': {
        title: 'Model Parameters',
        short: 'What parameter counts actually mean in practice, and how quality scales with them.',
        desc: ['Parameter count alone doesn\u2019t decide everything — it needs to be read together with quantization and architecture (dense vs. MoE).', 'It\u2019s also one of the starting points for estimating hardware requirements.']
      },
      'dense-moe': {
        title: 'Dense vs. MoE Models',
        short: 'Comparing dense and Mixture-of-Experts architectures in terms of compute and memory.',
        desc: ['MoE models store more parameters but activate fewer of them per query — which loads hardware differently than a dense model.', 'Model routing often builds directly on this architectural difference.']
      },
      'model-routing': {
        title: 'Model Routing',
        short: 'When it\u2019s worth routing a request to a smaller, cheaper model instead of a large one.',
        desc: ['Routing is about cost and latency optimization: simple requests get served by a cheaper model, complex ones by a stronger one.', 'Both the available tools and the architecture choice (dense/MoE) affect how routing should work.']
      },
      latency: {
        title: 'Latency',
        short: 'What makes up response time, and where you can actually speed things up.',
        desc: ['Most of latency comes from KV cache size, hardware, and model size together — these shape the user experience.', 'In RAG systems, the retrieval step can add significantly to total response time.']
      },
      'model-training': {
        title: 'Model Training',
        short: 'How a model learns from scratch: the \u201cpredict, measure the error, correct\u201d loop that builds a vector space out of raw weights.',
        desc: ['The same gradient-based loop \u2014 forward pass, loss, backward pass, weight update \u2014 sits behind training both an LLM and a diffusion model; only the prediction target differs.', 'Covers concrete data and cost figures, the training philosophy for small vs. large models, and distillation/synthetic data techniques.']
      },
      'fine-tuning': {
        title: 'Fine-Tuning Techniques',
        short: 'LoRA, QLoRA, and specialization: how to adapt an already-trained model for a fraction of the pretraining cost.',
        desc: ['LoRA\u2019s \u201csmall matrix\u201d trick freezes the base weights and adds only a tiny, trainable correction \u2014 this is what makes fine-tuning large models on consumer GPUs possible.', 'QLoRA combines this with quantization, enabling fine-tuning of models with up to 65 billion parameters on a single GPU.']
      },
      architecture: {
        title: 'Anatomy of a Model',
        short: 'Layer by layer: embedding, attention, feed-forward \u2014 the full path from input to output, no math required.',
        desc: ['A map that ties together Reasoning (attention), How a Model Learns (weights), and Dense vs. MoE (feed-forward) into one coherent overview.', 'Concrete layer and dimension counts for real models (GPT-3: 96 layers, Llama 3 405B: 126 layers).']
      },
      tokenization: {
        title: 'Tokenization',
        short: 'How a model cuts up text \u2014 and why that costs more in Hungarian than in English.',
        desc: ['The BPE algorithm step by step, with concrete vocabulary-size figures and the trend across model generations (30K \u2192 200K).', 'The documented \u201clanguage tax\u201d for Hungarian and similar agglutinative languages \u2014 concrete multipliers and the real cost/context-window consequences.']
      },
      randomness: {
        title: 'Randomness and Sampling',
        short: 'Why the model always says 73 \u2014 token probability, temperature, and the amplification of human bias.',
        desc: ['The model doesn\u2019t \u201cthink of\u201d a number \u2014 it samples from a heavily skewed probability distribution shaped by human patterns seen in training data.', 'The twist: humans are biased too (the Veritasium experiment) \u2014 the model amplifies that bias rather than inventing it.']
      },
      evaluation: {
        title: 'How We Measure a Model\u2019s Knowledge',
        short: 'Benchmarks and their limits: MMLU, GPQA, SWE-bench \u2014 what they actually measure, and why a leaderboard rank shouldn\u2019t be taken too seriously.',
        desc: ['The saturation problem (MMLU 88%+ at the top) and contamination \u2014 when a test stops discriminating, or the model has \u201cmemorized\u201d the exam.', 'A practical model-selection method: coarse filtering with benchmarks, then confirmation with your own relevant test set.']
      },
      'embedding-models': {
        title: 'Embedding Models',
        short: 'How the vector space behind RAG and search gets built \u2014 contrastive learning, positive/negative pairs.',
        desc: ['A separate training objective (similarity-based ordering) that doesn\u2019t follow automatically from a generation-focused pretraining run.', 'Two development paths: a dedicated, smaller encoder vs. turning a large LLM into an embedding generator, plus MTEB as the measuring stick.']
      },
      'ai-safety': {
        title: 'Alignment and Red Teaming',
        short: 'What the alignment problem means conceptually, and how the field tests a model\u2019s reliability through red teaming.',
        desc: ['Alignment (constructive) vs. red teaming (adversarial) \u2014 why both are needed, and what 2026 research shows about jailbreak resistance.', 'The realistic goal isn\u2019t zero jailbreaks \u2014 it\u2019s narrow, expensive, detectable ones \u2014 tying into the practical Security & OWASP tutorial.']
      },
      'agent-architecture': {
        title: 'How an AI Agent Decides',
        short: 'The ReAct loop: reason, act, observe, repeat \u2014 and the \u201cwhen is it done\u201d problem.',
        desc: ['How the model decides which tool to call (tool-definition-based selection), and why an agent has no built-in sense of \u201cdone.\u201d', 'Three tool categories (data, action, orchestration) as a practical design lens for risk management.']
      },
      glossary: {
        title: 'Glossary',
        short: 'Over 80 terms in one place, each with a short explanation and a link to the full discussion \u2014 not a dry list.',
        desc: ['If you run into an unfamiliar term in an article, a sentence or two here is enough to get you back on track \u2014 the link takes you to the full mechanism if you want to go deeper.', 'The same data source powers the automatic linking inside the articles themselves, so terms surface naturally as you read, already connected.']
      }
    }
  }
};

/* a végső, nyelvesített adat, amit az app.js használ */
const __graphLocale = (typeof window !== 'undefined' && window.__LOCALE__ && graphText[window.__LOCALE__]) ? window.__LOCALE__ : 'hu';
const __graphText = graphText[__graphLocale];

const graphNodes = graphNodesBase.map(n => Object.assign({}, n, __graphText.nodes[n.id]));
const graphClusterLabels = __graphText.clusterLabels;
