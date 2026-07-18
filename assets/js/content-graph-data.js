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

/* nyelvfüggetlen: pozíció, szín, klaszter-hovatartozás */
const graphNodesBase = [
  /* ── Alapok & munkafolyamat ── */
  { id: 'tools',        cluster: 'workflow', color: '#4ecb8d', x: 260,  y: 160 },
  { id: 'prompting',    cluster: 'workflow', color: '#e8a84a', x: 760,  y: 100 },
  { id: 'mcp',          cluster: 'workflow', color: '#359a9c', x: 1260, y: 220 },
  { id: 'security',     cluster: 'workflow', color: '#e06c75', x: 1060, y: 540 },
  { id: 'aiconfig',     cluster: 'workflow', color: '#f472b6', x: 560,  y: 540 },

  /* ── Tudás & kontextus ── */
  { id: 'rag',              cluster: 'knowledge', color: '#1613d4', x: 1780, y: 420 },
  { id: 'vectordb',         cluster: 'knowledge', color: '#17cb11', x: 1420, y: 580 },
  { id: 'memory',           cluster: 'knowledge', color: '#e1c9cb', x: 2160, y: 580 },
  { id: 'hallucination',    cluster: 'knowledge', color: '#a3ce40', x: 1780, y: 760 },
  { id: 'knowledge-cutoff', cluster: 'knowledge', color: '#896671', x: 2160, y: 920 },
  { id: 'rlhf',             cluster: 'knowledge', color: '#c9a9ac', x: 1420, y: 940 },

  /* ── Modell & hardver ── */
  { id: 'kv-cache',              cluster: 'model', color: '#8a5a2a', x: 120,  y: 880  },
  { id: 'ollama',                cluster: 'model', color: '#4ec9c9', x: 520,  y: 940  },
  { id: 'hardware',              cluster: 'model', color: '#f0edeb', x: 120,  y: 1220 },
  { id: 'quantization-quality',  cluster: 'model', color: '#00ff55', x: 520,  y: 1280 },
  { id: 'model-size',            cluster: 'model', color: '#98d016', x: 950,  y: 1180 },
  { id: 'dense-moe',             cluster: 'model', color: '#6160a3', x: 950,  y: 1500 },
  { id: 'model-routing',         cluster: 'model', color: '#496b8f', x: 1380, y: 1280 },
  { id: 'latency',               cluster: 'model', color: '#523986', x: 1380, y: 1560 },
];

const graphEdges = [
  ['tools','mcp'], ['tools','model-routing'],
  ['prompting','aiconfig'], ['prompting','hallucination'], ['prompting','mcp'], ['prompting','rlhf'],
  ['aiconfig','security'],
  ['security','mcp'],
  ['rag','vectordb'], ['rag','memory'], ['rag','hallucination'], ['rag','latency'], ['rag','knowledge-cutoff'],
  ['vectordb','memory'],
  ['memory','kv-cache'],
  ['hallucination','knowledge-cutoff'], ['hallucination','rlhf'],
  ['kv-cache','hardware'], ['kv-cache','latency'], ['kv-cache','model-size'],
  ['hardware','model-size'], ['hardware','quantization-quality'], ['hardware','ollama'],
  ['ollama','quantization-quality'], ['ollama','model-size'], ['ollama','model-routing'],
  ['quantization-quality','model-size'], ['quantization-quality','dense-moe'],
  ['dense-moe','model-size'], ['dense-moe','model-routing'],
  ['model-routing','latency']
];

/* nyelvfüggő szövegek */
const graphText = {
  hu: {
    clusterLabels: {
      workflow:  'Alapok & munkafolyamat',
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
      }
    }
  },

  en: {
    clusterLabels: {
      workflow:  'Foundations & Workflow',
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
      }
    }
  }
};

/* a végső, nyelvesített adat, amit az app.js használ */
const __graphLocale = (typeof window !== 'undefined' && window.__LOCALE__ && graphText[window.__LOCALE__]) ? window.__LOCALE__ : 'hu';
const __graphText = graphText[__graphLocale];

const graphNodes = graphNodesBase.map(n => Object.assign({}, n, __graphText.nodes[n.id]));
const graphClusterLabels = __graphText.clusterLabels;
