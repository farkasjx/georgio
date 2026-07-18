/* ═══════════════════════════════════════════════
   content-graph-data.js — a kezdőoldali kapcsolati térkép adatai
   Ez a gráf a site ÖSSZES tartalmi oldalát (nem csak a roadmap
   fázisait) jeleníti meg, és azt mutatja meg, hogy az egyes
   témák hogyan kapcsolódnak egymáshoz. Kattintásra a csomópont
   panelt nyit, onnan lehet átugrani a teljes tartalomhoz.
   ═══════════════════════════════════════════════ */

/* cluster = tematikus csoport, a szűrő chipek ez alapján dolgoznak */
const graphClusters = [
  { id: 'all',       label: 'Mind' },
  { id: 'workflow',  label: 'Alapok & munkafolyamat' },
  { id: 'knowledge', label: 'Tudás & kontextus' },
  { id: 'model',     label: 'Modell & hardver' }
];

const graphNodes = [
  /* ── Alapok & munkafolyamat ── */
  {
    id: 'roadmap', title: 'Roadmap', cluster: 'workflow', color: '#7c3aed',
    x: 240, y: 140,
    short: 'A teljes AI engineer tanulási út 10 fázisban, a szoftveralapoktól a portfólióig.',
    desc: ['A roadmap adja a vázat: milyen sorrendben érdemes haladni a szoftveralapoktól az LLM engineering-en és RAG-on át egészen a portfólióig.', 'Innen indul minden más téma — a gráf többi csomópontja valahol ezen az úton helyezkedik el.']
  },
  {
    id: 'tools', title: 'AI Eszközök', cluster: 'workflow', color: '#4ecb8d',
    x: 610, y: 90,
    short: 'API-k, keretrendszerek és fejlesztői eszközök áttekintése a napi munkához.',
    desc: ['Az AI eszköztár gyorsan bővül — ez az oldal rendszerezi, mikor melyik API-t, könyvtárat vagy platformot érdemes választani.', 'Sok itt bemutatott eszköz később a model routing és MCP témáknál is előkerül.']
  },
  {
    id: 'prompting', title: 'Prompt Engineering', cluster: 'workflow', color: '#e8a84a',
    x: 980, y: 150,
    short: 'Few-shot, ReAct és strukturált promptolási technikák a megbízhatóbb válaszokért.',
    desc: ['A jó prompt csökkenti a halucinációt és javítja a structured output minőségét — ezért kapcsolódik szorosan mindkét témához.', 'Az itt tanult minták (pl. ReAct) az agent- és tool-use jellegű megoldások alapját adják.']
  },
  {
    id: 'aiconfig', title: 'AI Config fájlok', cluster: 'workflow', color: '#f472b6',
    x: 610, y: 340,
    short: 'CLAUDE.md, .cursorrules és hasonló konfigurációs fájlok szerepe és felépítése.',
    desc: ['Ezek a fájlok gyakorlatilag "állandó promptok" egy projekthez — ezért él szoros kapcsolatban a prompt engineering résszel.', 'Biztonsági szempontból is releváns, hiszen ide kerülhetnek hozzáférési és viselkedési szabályok is.']
  },
  {
    id: 'security', title: 'Biztonság & OWASP', cluster: 'workflow', color: '#e06c75',
    x: 980, y: 400,
    short: 'OWASP LLM Top 10, prompt injection és egyéb biztonsági kockázatok kezelése.',
    desc: ['A biztonság mindenhol megjelenik, ahol a modell külső adatot vagy toolt használ — ezért köti össze az MCP és a config témákat.', 'Kiemelten fontos, amikor a rendszer autonóm módon (agentként) tud cselekvéseket végrehajtani.']
  },
  {
    id: 'mcp', title: 'MCP', cluster: 'workflow', color: '#359a9c',
    x: 1330, y: 300,
    short: 'A Model Context Protocol felépítése és tipikus integrációs mintái (pl. Jira).',
    desc: ['Az MCP azt oldja meg, hogyan kapcsolódik a modell külső eszközökhöz és adatforrásokhoz szabványos módon.', 'Emiatt szorosan kapcsolódik a biztonsághoz (mit engedünk meg egy toolnak) és a promptoláshoz (hogyan írjuk le a tool-t a modellnek).']
  },

  /* ── Tudás & kontextus ── */
  {
    id: 'rag', title: 'RAG', cluster: 'knowledge', color: '#1613d4',
    x: 1400, y: 660,
    short: 'Dokumentumfeldolgozás, chunking, vektortár és hybrid search egy RAG pipeline-ban.',
    desc: ['A RAG a legnépszerűbb módja annak, hogy friss, cégspecifikus tudást adjunk a modell kontextusához a tudás-limit (knowledge cutoff) áthidalására.', 'A minőségét a vektoradatbázis, a memória-kezelés és a halucináció elleni védekezés együtt határozza meg.']
  },
  {
    id: 'vectordb', title: 'Vector adatbázisok', cluster: 'knowledge', color: '#17cb11',
    x: 1080, y: 700,
    short: 'pgvector, Qdrant, Pinecone — hogyan tárolják és keresik az embeddingeket.',
    desc: ['A vektoradatbázis a RAG retrieval rétegének motorja: itt dől el, mennyire gyors és pontos a dokumentum-visszakeresés.', 'Szorosan összefügg a memóriakezeléssel is, hiszen sok agent-memória megoldás ugyanezt az infrastruktúrát használja.']
  },
  {
    id: 'memory', title: 'Memory', cluster: 'knowledge', color: '#e1c9cb',
    x: 1690, y: 700,
    short: 'Hosszú távú memória agenteknek: mit, hogyan és meddig érdemes megjegyezni.',
    desc: ['A memória-rendszerek gyakran vektoradatbázisra épülnek, de a KV cache-hez hasonlóan a "mit tartsunk meg" kérdése is központi.', 'Rossz memóriakezelés egyenesen vezet halucinációhoz vagy elavult válaszokhoz.']
  },
  {
    id: 'hallucination', title: 'Halucináció', cluster: 'knowledge', color: '#a3ce40',
    x: 1400, y: 970,
    short: 'Miért generál a modell téves állításokat, és hogyan mérhető, csökkenthető.',
    desc: ['A halucináció gyökere gyakran a tudás-limitben vagy a hiányos kontextusban keresendő — ezért kapcsolódik szorosan a RAG-hoz és a knowledge cutoff témához.', 'A csökkentésében a jó promptolás és az RLHF finomhangolás is szerepet játszik.']
  },
  {
    id: 'knowledge-cutoff', title: 'Tudás limit', cluster: 'knowledge', color: '#896671',
    x: 1690, y: 1010,
    short: 'Mit jelent a tréning-adat "vágási dátuma", és hogyan kezeljük a hiányzó tudást.',
    desc: ['A modell csak a tréningig terjedő tudással rendelkezik — az ez utáni eseményekhez RAG vagy friss kontextus kell.', 'A cutoffon túli kérdésekre adott magabiztos, de téves válasz az egyik leggyakoribb halucináció-forrás.']
  },
  {
    id: 'rlhf', title: 'RLHF', cluster: 'knowledge', color: '#c9a9ac',
    x: 1080, y: 1010,
    short: 'Hogyan alakítja emberi visszajelzés a modell viselkedését és "személyiségét".',
    desc: ['Az RLHF (és rokon technikák) döntik el, mennyire lesz a modell segítőkész, óvatos vagy éppen halucináció-hajlamos.', 'Ez a láthatatlan réteg épp úgy befolyásolja a promptra adott választ, mint maga a prompt szövege.']
  },

  /* ── Modell & hardver ── */
  {
    id: 'ollama', title: 'Lokális LLM', cluster: 'model', color: '#4ec9c9',
    x: 420, y: 800,
    short: 'Ollama-alapú fejlesztői terv 10 szinten, saját gépen futó modellekkel.',
    desc: ['A lokális futtatás megérteti a hardverigényt, a kvantálást és a modellméret hatásait — gyakorlatban, saját gépen.', 'Ez a legjobb belépési pont a modell-és-hardver klaszter többi témájához.']
  },
  {
    id: 'hardware', title: 'Hardware', cluster: 'model', color: '#f0edeb',
    x: 160, y: 1040,
    short: 'VRAM-igény, GPU-választás és erőforrás-tervezés lokális modellekhez.',
    desc: ['A hardver szabja meg, mekkora és milyen kvantálású modell futtatható egyáltalán — ezért köti össze a kvantálást és a modellméretet.', 'A KV cache mérete is közvetlenül a rendelkezésre álló VRAM-ból von el helyet.']
  },
  {
    id: 'quantization-quality', title: 'Kvantálás és minőség', cluster: 'model', color: '#00ff55',
    x: 420, y: 1260,
    short: 'Hogyan hat a 4/8-bites kvantálás a válaszminőségre és a memóriaigényre.',
    desc: ['A kvantálás kompromisszum a hardverigény és a válaszminőség között — minél agresszívebb, annál nagyobb a minőségromlás kockázata.', 'Dense és MoE modelleknél eltérően viselkedik, ezért érdemes együtt nézni azzal a témával.']
  },
  {
    id: 'model-size', title: 'Model paraméterek', cluster: 'model', color: '#98d016',
    x: 730, y: 1050,
    short: 'Mit jelentenek a paraméterszámok a gyakorlatban, és hogyan skálázódik velük a minőség.',
    desc: ['A paraméterszám önmagában nem mindent eldöntő — a kvantálással és az architektúrával (dense vs. MoE) együtt kell értelmezni.', 'A hardverigény becslésének is ez az egyik kiindulópontja.']
  },
  {
    id: 'dense-moe', title: 'Dense vs MoE modellek', cluster: 'model', color: '#6160a3',
    x: 730, y: 1300,
    short: 'Sűrű és Mixture-of-Experts architektúrák összehasonlítása compute és memória szempontból.',
    desc: ['A MoE modellek több paramétert tárolnak, de kevesebbet aktiválnak lekérdezésenként — ez másképp terheli a hardvert, mint egy dense modell.', 'A model routing gyakran épp erre az architekturális különbségre épít.']
  },
  {
    id: 'kv-cache', title: 'KV cache', cluster: 'model', color: '#8a5a2a',
    x: 160, y: 760,
    short: 'A key-value cache mechanizmusa és memóriaigénye hosszú kontextusoknál.',
    desc: ['A KV cache teszi gyorssá a token-generálást, cserébe egyenesen arányos memóriát fogyaszt a kontextus hosszával.', 'Ez az egyik fő oka annak, hogy a hosszú kontextus a látenciát és a hardverigényt is megnöveli.']
  },
  {
    id: 'model-routing', title: 'Model routing', cluster: 'model', color: '#496b8f',
    x: 960, y: 1060,
    short: 'Mikor érdemes kisebb, olcsóbb modellre terelni egy kérést a nagy helyett.',
    desc: ['A routing költség és látencia optimalizálás: egyszerű kéréseket olcsóbb modell, komplexeket erősebb modell szolgál ki.', 'Az eszközök (tools) és az architektúra-választás (dense/MoE) egyaránt befolyásolja, hogyan érdemes routolni.']
  },
  {
    id: 'latency', title: 'Latency', cluster: 'model', color: '#523986',
    x: 960, y: 1300,
    short: 'Miből áll össze a válaszidő, és hol lehet ténylegesen gyorsítani.',
    desc: ['A látencia nagy részét a KV cache mérete, a hardver és a modellméret adja — ezek együtt szabják meg a felhasználói élményt.', 'RAG rendszereknél a retrieval lépés is jelentősen hozzáadhat a teljes válaszidőhöz.']
  }
];

const graphEdges = [
  ['roadmap','tools'], ['roadmap','prompting'], ['roadmap','rag'], ['roadmap','security'], ['roadmap','ollama'],
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
