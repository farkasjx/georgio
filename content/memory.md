---
page: memory
title: LLM & Agent Memory
sidebar_groups:
  - Elmélet
  - Architektúra
  - Gyakorlat
  - Éles használat
  - Referencia
hero:
  eyebrow: "Memory · Fejlesztői Tanulási Terv"
  title: "LLM & Agent <em>Memory</em>"
  lead: "Hogyan adjunk emlékezetet stateless nyelvi modelleknek és agenteknek. Elmélet, architektúrák, feladatok és példakódok — Python és Node, ChromaDB-vel. Ne csak „beszélgess” a modellel, hanem <em>értsd, mi tartja fenn a kontextust.</em>"
  stats:
    - { val: "11", lbl: "Szakasz" }
    - { val: "6", lbl: "Feladat" }
    - { val: "Chroma", lbl: "Vektor-DB" }
    - { val: "Py+Node", lbl: "Stack" }
footer:
  left: "AI Hub · LLM & Agent Memory"
  right: "Memory · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#mem-0"><div class="tc-num">0. rész</div><div class="tc-name">Miért kell memory?</div><div class="tc-desc">A stateless probléma, context vs. persistent, memory-típusok.</div></a>
  <a class="toc-card" href="#mem-1"><div class="tc-num">1. rész</div><div class="tc-name">Architektúrák</div><div class="tc-desc">Buffer, sliding window, summary, vektor, hybrid.</div></a>
  <a class="toc-card" href="#mem-2"><div class="tc-num">2. rész</div><div class="tc-name">Előkészület</div><div class="tc-desc">Python + Node setup, lokális embedding.</div></a>
  <a class="toc-card" href="#mem-3"><div class="tc-num">Feladat 1</div><div class="tc-name">Buffer memory</div><div class="tc-desc">A history újraküldése — kézzel.</div></a>
  <a class="toc-card" href="#mem-4"><div class="tc-num">Feladat 2</div><div class="tc-name">Sliding window</div><div class="tc-desc">Fix token-plafon, token-számlálás.</div></a>
  <a class="toc-card" href="#mem-5"><div class="tc-num">Feladat 3</div><div class="tc-name">Summary memory</div><div class="tc-desc">Auto-összegzés threshold felett.</div></a>
  <a class="toc-card" href="#mem-6"><div class="tc-num">Feladat 4</div><div class="tc-name">Vektor memory</div><div class="tc-desc">ChromaDB, szemantikus long-term.</div></a>
  <a class="toc-card" href="#mem-7"><div class="tc-num">7. rész</div><div class="tc-name">Security</div><div class="tc-desc">Memory poisoning, PII, OWASP LLM.</div></a>
  <a class="toc-card" href="#mem-8"><div class="tc-num">8. rész</div><div class="tc-name">Frameworkök</div><div class="tc-desc">LangGraph, Mem0, Anthropic, saját.</div></a>
  <a class="toc-card" href="#mem-9"><div class="tc-num">9. rész</div><div class="tc-name">Best practices</div><div class="tc-desc">Eviction, pgvector, tesztelés.</div></a>
  <a class="toc-card" href="#mem-10"><div class="tc-num">10. rész</div><div class="tc-name">Hybrid agent</div><div class="tc-desc">Mindent összekötő CLI agent.</div></a>
</div>
::::::

:::::: section id=mem-0 heading="0. rész — Miért kell memory? Az elméleti alap" nav="0. rész" group="Elmélet"

<p class="topic-tagline">Cél: értsd, hogy a memory nem a modell képessége, hanem egy réteg, amit köréépítesz.</p>

### A stateless probléma

Egy LLM **állapotmentes (stateless)**. Minden API-hívás nulláról indul: a modell semmit nem tud arról, mi hangzott el az előző hívásban. Amit „beszélgetésnek" látsz egy chat felületen, az egy illúzió — a háttérben **minden fordulóban a teljes eddigi történetet újraküldik** a modellnek.

```text
Hívás 1:  [user: "A nevem FJ"]                  → "Örvendek, FJ!"
Hívás 2:  [user: "A nevem FJ"]
          [assistant: "Örvendek, FJ!"]
          [user: "Mi a nevem?"]                 → "FJ"
```

A memory tehát nem a modell képessége, hanem **egy réteg, amit köréépítesz**: eldönti, mit tegyél vissza a kontextusba, mit dobj el, és honnan hívd elő a régi információt.

### Context window ≠ memory

A context window egy **munkaasztal** — véges. A persistent memory egy **iratszekrény** — nagy, de csak akkor hasznos, ha a megfelelő aktát kiveszed és az asztalra teszed.

| Fogalom | Mi ez | Korlát |
|---|---|---|
| **Context window** | A tokenek, amit egyetlen híváskor a modell „lát" | Fix méret (pl. 200k token), drága, felejtő |
| **Persistent memory** | Külső tár (DB, fájl, vektor-index), ami túléli a hívást | Gyakorlatilag korlátlan, de elő kell hívni |

### Memory-típusok

::::: stack-grid
:::: card label="Short-term / working"
**Az aktuális session üzenetei.** Illékony — a beszélgetés végén elveszik, ha nem perzisztálod.
::::
:::: card label="Long-term"
**Session-ökön átívelő tudás.** Perzisztens tárban él, és a releváns részét hívod elő.
::::
:::: card label="Episodic"
**Mi történt.** „Tegnap a felhasználó a Yaris finanszírozásról kérdezett." Eseményszerű emlék.
::::
:::: card label="Semantic"
**Tények.** „A felhasználó neve FJ, macskája van, IQOS-t használ." Kontextus-független állítások.
::::
:::: card label="Procedural"
**Hogyan.** „Ez a user tömör, lényegre törő válaszokat szeret." Viselkedési preferenciák.
::::
:::::

::::: callout warning label="Mikor NE használj memory-t"
Ne overengineer-elj. Kerüld, ha: egyszeri, kontextusmentes Q&A (fordítás, összegzés) · a teljes beszélgetés simán belefér a context window-ba és olcsó · nincs több session. A memory komplexitást, latency-t és **biztonsági felületet** hoz be — csak akkor vezesd be, ha a stateless viselkedés tényleg fáj.
:::::
::::::

:::::: section id=mem-1 heading="1. rész — Memory architektúrák" nav="1. rész" group="Architektúra"

<p class="topic-tagline">Cél: ismerd a lehetőségeket és a köztük lévő kompromisszumokat.</p>

### Az öt alapminta

::::: stack-grid
:::: card label="Buffer"
**Teljes history.** Minden üzenetet visszaküldesz. Egyszerű, pontos — de a token-költség lineárisan nő, és túlfut a context window-on.
::::
:::: card label="Sliding window"
**Utolsó N üzenet.** Fix token-plafon. Kockázat: a fontos infó „kicsúszik", ha az elején hangzott el.
::::
:::: card label="Summary"
**Összegzés.** Threshold felett a régit összegzed az LLM-mel, és az összefoglalót tartod meg. Token-takarékos, de lossy.
::::
:::: card label="Vektor / RAG"
**Embedding + retrieval.** A tényeket vektor-DB-ben tárolod, és a szemantikailag legrelevánsabbat hívod elő. Skálázható, de retrieval-függő.
::::
:::: card label="Hybrid"
**A kombináció.** Window a közelmúltra + summary a session lényegére + vektor a perzisztens tényekre. A való életben ez a nyerő.
::::
:::::

### Trade-off tábla

| Architektúra | Token-költség | Pontosság | Komplexitás | Skálázhatóság |
|---|---|---|---|---|
| Buffer | Magas ⬆ | Nagyon jó | Nagyon alacsony | Rossz |
| Sliding window | Alacsony | Közepes | Alacsony | Jó |
| Summary | Alacsony | Jó (lossy) | Közepes | Jó |
| Vektor / RAG | Alacsony–közepes | Jó (retrieval-függő) | Magas | Nagyon jó |
| Hybrid | Optimalizált | Nagyon jó | Magas | Nagyon jó |
::::::

:::::: section id=mem-2 heading="2. rész — Előkészület" nav="2. rész" group="Gyakorlat"

<p class="topic-tagline">Cél: legyen működő Python és Node környezeted a feladatokhoz.</p>

### Python

```bash
python -m venv .venv && source .venv/bin/activate
pip install anthropic chromadb tiktoken
export ANTHROPIC_API_KEY="sk-ant-..."
```

### Node

```bash
npm init -y
npm install @anthropic-ai/sdk chromadb
# package.json: { "type": "module" }
export ANTHROPIC_API_KEY="sk-ant-..."
```

### Lokális embedding (opcionális — Ollama/Hermes)

A ChromaDB alapból saját (ONNX) embedding-függvénnyel jön, de a vektorozást lokális modellel is elvégeztetheted Ollamán keresztül:

```bash
ollama pull nomic-embed-text
# az embedding endpoint: http://localhost:11434/api/embeddings
```
::::::

:::::: section id=mem-3 heading="Feladat 1 — Buffer memory kézzel" nav="Feladat 1" group="Gyakorlat"

<p class="topic-tagline">Cél: értsd meg, hogy a „beszélgetés" = a teljes history újraküldése.</p>

### Python

```python
import anthropic

client = anthropic.Anthropic()

class BufferMemory:
    def __init__(self):
        self.messages = []

    def add(self, role, content):
        self.messages.append({"role": role, "content": content})

    def get(self):
        return self.messages

memory = BufferMemory()

def chat(user_input):
    memory.add("user", user_input)
    resp = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=1024,
        messages=memory.get(),
    )
    reply = resp.content[0].text
    memory.add("assistant", reply)
    return reply

print(chat("A nevem FJ, és van egy cicám."))
print(chat("Mi a nevem és mi az állatom?"))  # emlékszik, mert visszaküldjük a historyt
```

### Node

```javascript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

class BufferMemory {
  constructor() { this.messages = []; }
  add(role, content) { this.messages.push({ role, content }); }
  get() { return this.messages; }
}

const memory = new BufferMemory();

async function chat(userInput) {
  memory.add("user", userInput);
  const resp = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    messages: memory.get(),
  });
  const reply = resp.content[0].text;
  memory.add("assistant", reply);
  return reply;
}

console.log(await chat("A nevem FJ, és van egy cicám."));
console.log(await chat("Mi a nevem és mi az állatom?"));
```

::::: callout label="Gyakorlat"
Kommentezd ki a `memory.add("assistant", reply)` sort. Figyeld meg, hogy a modell így „elfelejti" a saját válaszait — bizonyíték arra, hogy a memory a te felelősséged, nem a modellé.
:::::
::::::

:::::: section id=mem-4 heading="Feladat 2 — Sliding window és token-számlálás" nav="Feladat 2" group="Gyakorlat"

<p class="topic-tagline">Cél: fix token-plafon, és lásd, mikor „csúszik ki" a fontos infó.</p>

### Python

```python
import anthropic, tiktoken

client = anthropic.Anthropic()
enc = tiktoken.get_encoding("cl100k_base")  # közelítő token-számlálás

def count_tokens(messages):
    return sum(len(enc.encode(m["content"])) for m in messages)

class SlidingWindowMemory:
    def __init__(self, max_turns=4):
        self.messages = []
        self.max_turns = max_turns

    def add(self, role, content):
        self.messages.append({"role": role, "content": content})
        # tartsuk meg csak az utolsó N*2 üzenetet (user+assistant páronként)
        excess = len(self.messages) - self.max_turns * 2
        if excess > 0:
            self.messages = self.messages[excess:]

    def get(self):
        return self.messages

memory = SlidingWindowMemory(max_turns=2)

def chat(user_input):
    memory.add("user", user_input)
    resp = client.messages.create(
        model="claude-sonnet-4-5", max_tokens=512, messages=memory.get()
    )
    reply = resp.content[0].text
    memory.add("assistant", reply)
    print(f"[ablak: {len(memory.messages)} üzenet, ~{count_tokens(memory.messages)} token]")
    return reply

chat("A nevem FJ.")          # ez az infó...
chat("Szeretem a kávét.")
chat("Dockert használok.")
print(chat("Mi a nevem?"))   # ...már kicsúszott az ablakból → nem tudja
```

### Node — a window-logika

```javascript
class SlidingWindowMemory {
  constructor(maxTurns = 4) { this.messages = []; this.maxTurns = maxTurns; }
  add(role, content) {
    this.messages.push({ role, content });
    const excess = this.messages.length - this.maxTurns * 2;
    if (excess > 0) this.messages = this.messages.slice(excess);
  }
  get() { return this.messages; }
}
```

::::: callout label="Gyakorlat"
Növeld a `max_turns` értékét, amíg a „Mi a nevem?" újra helyes választ ad. Ez a sliding window alapvető kompromisszuma: **memória vs. token-költség**.
:::::
::::::

:::::: section id=mem-5 heading="Feladat 3 — Summary memory (auto-összegzés)" nav="Feladat 3" group="Gyakorlat"

<p class="topic-tagline">Cél: ha a history túlnő egy küszöböt, összegezd a régi részt az LLM-mel.</p>

### Python

```python
import anthropic

client = anthropic.Anthropic()

class SummaryMemory:
    def __init__(self, threshold=6):
        self.messages = []
        self.summary = ""
        self.threshold = threshold  # ennyi üzenet felett összegzünk

    def add(self, role, content):
        self.messages.append({"role": role, "content": content})
        if len(self.messages) > self.threshold:
            self._compress()

    def _compress(self):
        # a legrégebbi felét összegezzük
        half = len(self.messages) // 2
        old, keep = self.messages[:half], self.messages[half:]
        convo = "\n".join(f"{m['role']}: {m['content']}" for m in old)
        prompt = (
            f"Eddigi összefoglaló: {self.summary or '(nincs)'}\n\n"
            f"Új rész:\n{convo}\n\n"
            "Frissítsd az összefoglalót 3-4 tömör mondatban. "
            "Őrizd meg a konkrét tényeket (nevek, számok, döntések)."
        )
        resp = client.messages.create(
            model="claude-sonnet-4-5", max_tokens=300,
            messages=[{"role": "user", "content": prompt}],
        )
        self.summary = resp.content[0].text
        self.messages = keep

    def get(self):
        msgs = []
        if self.summary:
            msgs.append({"role": "user",
                         "content": f"[Korábbi beszélgetés összefoglalója]: {self.summary}"})
        return msgs + self.messages

memory = SummaryMemory(threshold=6)

def chat(user_input):
    memory.add("user", user_input)
    resp = client.messages.create(
        model="claude-sonnet-4-5", max_tokens=512, messages=memory.get()
    )
    reply = resp.content[0].text
    memory.add("assistant", reply)
    return reply
```

::::: callout label="Gyakorlat"
Logold ki minden fordulónál a `memory.summary` értékét. Nézd meg, mi marad meg és mi vész el az összegzés során — ez a **lossy** természet, amit a QA-tesztjeidnél figyelembe kell venned.
:::::
::::::

:::::: section id=mem-6 heading="Feladat 4 — Vektor memory ChromaDB-vel" nav="Feladat 4" group="Gyakorlat"

<p class="topic-tagline">Cél: perzisztens, szemantikus long-term memory — nem a közelmúltat tartod meg, hanem a releváns emléket hívod elő.</p>

### Alap (Python, beépített embedding)

```python
import chromadb

client = chromadb.PersistentClient(path="./memory_db")  # lemezre perzisztál
collection = client.get_or_create_collection("user_memories")

# emlékek eltárolása
collection.add(
    documents=[
        "A felhasználó neve FJ, QA mérnök.",
        "FJ Toyota Yaris vásárlását tervezi.",
        "FJ a Nevogate projekten dolgozik, SimplePay integrációval.",
        "FJ tömör, lényegre törő válaszokat szeret.",
    ],
    ids=["m1", "m2", "m3", "m4"],
)

# releváns emlék visszakeresése egy új kérdéshez
results = collection.query(
    query_texts=["Milyen autót akar venni?"],
    n_results=2,
)
print(results["documents"])
# → [['FJ Toyota Yaris vásárlását tervezi.', ...]]
```

### Teljes ciklus: retrieve → prompt → store

```python
import anthropic, chromadb, uuid

llm = anthropic.Anthropic()
db = chromadb.PersistentClient(path="./memory_db")
mem = db.get_or_create_collection("user_memories")

def remember(text):
    mem.add(documents=[text], ids=[str(uuid.uuid4())])

def recall(query, k=3):
    if mem.count() == 0:
        return []
    res = mem.query(query_texts=[query], n_results=min(k, mem.count()))
    return res["documents"][0]

def chat(user_input):
    memories = recall(user_input)
    context = "\n".join(f"- {m}" for m in memories)
    system = f"Amit a felhasználóról tudsz:\n{context}" if memories else ""
    resp = llm.messages.create(
        model="claude-sonnet-4-5", max_tokens=512,
        system=system,
        messages=[{"role": "user", "content": user_input}],
    )
    reply = resp.content[0].text
    remember(f"User kérdezte: {user_input}")  # opcionális: új tény mentése
    return reply

remember("A felhasználó neve FJ, macskája van.")
print(chat("Emlékszel a nevemre?"))
```

### Lokális embedding Ollamával (nomic-embed-text)

Ha nem a ChromaDB alap-embeddingjét akarod, hanem lokális modellt (adatvédelem, offline homelab):

```python
import chromadb
from chromadb.utils.embedding_functions import OllamaEmbeddingFunction

ollama_ef = OllamaEmbeddingFunction(
    url="http://localhost:11434/api/embeddings",
    model_name="nomic-embed-text",
)

db = chromadb.PersistentClient(path="./memory_db")
mem = db.get_or_create_collection("user_memories", embedding_function=ollama_ef)
# innentől ugyanúgy: mem.add(...) / mem.query(...)
```

### Node változat

```javascript
import { ChromaClient } from "chromadb";
import Anthropic from "@anthropic-ai/sdk";

const db = new ChromaClient({ path: "http://localhost:8000" }); // futó Chroma szerver
const llm = new Anthropic();

const mem = await db.getOrCreateCollection({ name: "user_memories" });

async function remember(text) {
  await mem.add({ ids: [crypto.randomUUID()], documents: [text] });
}

async function recall(query, k = 3) {
  const count = await mem.count();
  if (count === 0) return [];
  const res = await mem.query({ queryTexts: [query], nResults: Math.min(k, count) });
  return res.documents[0];
}

async function chat(userInput) {
  const memories = await recall(userInput);
  const system = memories.length
    ? "Amit a felhasználóról tudsz:\n" + memories.map(m => `- ${m}`).join("\n")
    : "";
  const resp = await llm.messages.create({
    model: "claude-sonnet-4-5", max_tokens: 512, system,
    messages: [{ role: "user", content: userInput }],
  });
  await remember(`User kérdezte: ${userInput}`);
  return resp.content[0].text;
}
```

::::: callout warning label="Node megjegyzés"
A Chroma JS-kliens egy **futó Chroma szerverhez** csatlakozik (`chroma run --path ./memory_db`), nem embedded. Pythonban van beágyazott `PersistentClient` is — ez a leggyorsabb út a prototípushoz.
:::::

::::: callout label="Gyakorlat"
Tölts be 10-15 vegyes emléket, majd kérdezz rá olyanra, ami *szemantikailag* rokon, de nem szó szerinti egyezés (tárolt: „Dockert használ", kérdés: „Konténerizációval dolgozik?"). Ez mutatja meg a vektor-keresés erejét a kulcsszó-kereséssel szemben.
:::::
::::::

:::::: section id=mem-7 heading="7. rész — Security: a memory mint támadási felület" nav="7. rész" group="Éles használat"

<p class="topic-tagline">Cél: a memory nem csak feature, hanem kockázat — amit tárolsz és visszateszel, az bizalmi határt lép át.</p>

### A három fő kockázat

::::: stack-grid
:::: card label="Memory poisoning"
**Indirect prompt injection.** Ha a user-inputot szó szerint tárolod, egy támadó utasítást csempészhet a memóriába, ami egy *későbbi* session-ben aktiválódik. → OWASP LLM01.
::::
:::: card label="Sensitive data"
**PII-tár.** A vektor-DB könnyen válik nevek, e-mailek, kártyaadat tárolójává. → OWASP LLM02. Sose ments titkot, tokent, jelszót, kártyaszámot.
::::
:::: card label="Retrieval-szivárgás"
**Multi-user keveredés.** Rossz collection-particionálás miatt A user emléke B usernek visszaköszönhet.
::::
:::::

### Védekezés

::::: callout danger label="Security checklist"
**✓** Ne nyers üzenetet ments, hanem **strukturált, kivont tényt** (külön LLM-lépéssel szűrve) · **✓** User-önként külön collection vagy szigorú `metadata`-filter minden query-nél · **✓** PII-detektálás/redaktálás a tárolás előtt · **✓** A visszahívott memóriát kezeld **adatként, ne utasításként** — a system promptban tedd egyértelművé, hogy az csak háttér-információ.
:::::
::::::

:::::: section id=mem-8 heading="8. rész — Framework-áttekintés" nav="8. rész" group="Éles használat"

<p class="topic-tagline">Cél: tudd, mikor írj saját memory-logikát, és mikor nyúlj kész eszközhöz.</p>

### Mikor melyik

| Eszköz | Nyelv | Mit ad | Mikor |
|---|---|---|---|
| **LangGraph** (checkpointer + store) | Py/JS | Beépített state-perzisztencia agenteknek, thread-alapú | Ha már LangGraph-ot használsz orchesztrációra |
| **Mem0** | Py/JS | Dedikált memory-réteg auto-extraction-nel | Ha nem akarsz saját retrieve/store logikát írni |
| **Anthropic context management** | API | Prompt caching, hosszú kontextus natívan | Ha a Claude API-ra építesz, és a context-cost a fő gond |
| **Saját (Chroma + kód)** | Py/JS | Teljes kontroll, nulla vendor-lock | Tanuláshoz, egyedi igényhez, homelabhez |

### LangGraph — rövid példa

```python
from langgraph.checkpoint.memory import MemorySaver

# a checkpointer minden lépés után menti a gráf állapotát,
# thread_id alapján előhívja → session-memory ingyen
checkpointer = MemorySaver()
# graph = builder.compile(checkpointer=checkpointer)
# graph.invoke(input, config={"configurable": {"thread_id": "user-fj"}})
```

### Mem0 — rövid példa

```python
from mem0 import Memory

m = Memory()
m.add("A felhasználó neve FJ, Yaris-t akar venni.", user_id="fj")
relevant = m.search("autó", user_id="fj")  # auto-extract + retrieve
```
::::::

:::::: section id=mem-9 heading="9. rész — Éles használat és best practices" nav="9. rész" group="Éles használat"

<p class="topic-tagline">Cél: production-közeli memory — takarítás, perzisztencia, tesztelés.</p>

### Kulcsdöntések

::::: stack-grid
:::: card label="Eviction"
**Mit dobj el?** Idő-alapú (öregszik), fontosság-alapú (score), vagy méret-alapú (LRU). A vektor-memóriát időnként takarítsd: duplikátumok, elavult tények.
::::
:::: card label="Perzisztencia"
Prototípusban embedded Chroma; élesben **PostgreSQL + pgvector** — egy DB a relációs adatnak és a vektoroknak is.
::::
:::: card label="Fact extraction"
Ne nyers üzenetet ments. Egy köztes LLM-lépés vonja ki a tartós tényt: „Elköltöztem Budapestre" → `user.location = Budapest`.
::::
:::: card label="Update vs. add"
Ha „FJ Yaris-t akar" később „FJ megvette a Yaris-t" lesz, **frissítsd/érvénytelenítsd** a régit — ne halmozz ellentmondó emlékeket.
::::
:::::

### Tesztelés — QA-szemmel

| Teszt | Mit ellenőriz |
|---|---|
| **Recall** | Tárolt tény → kérdés → visszajön-e? |
| **Negatív** | Nem tárolt tényre nem hallucinál-e emléket? |
| **Izoláció** | A user emléke nem szivárog-e B userhez? |
| **Poisoning** | Injektált utasítás a memóriában nem befolyásolja-e a viselkedést? |
| **Regresszió** | Summary-összegzés után megmaradnak-e a kulcs-tények (nevek, ID-k, számok)? |
::::::

:::::: section id=mem-10 heading="10. rész — Összefoglaló projekt: hybrid CLI agent" nav="10. rész" group="Gyakorlat"

<p class="topic-tagline">Cél: mindent összekötni — sliding window (rövid táv) + summary (közép táv) + Chroma vektor (hosszú táv).</p>

### Teljes implementáció

```python
import anthropic, chromadb, uuid

llm = anthropic.Anthropic()
db = chromadb.PersistentClient(path="./agent_memory")
ltm = db.get_or_create_collection("long_term")

class HybridAgent:
    def __init__(self, window=4, summary_threshold=8):
        self.window = window
        self.threshold = summary_threshold
        self.recent = []      # sliding window
        self.summary = ""     # közép távú összefoglaló

    # --- hosszú távú (vektor) ---
    def remember(self, fact):
        ltm.add(documents=[fact], ids=[str(uuid.uuid4())])

    def recall(self, query, k=3):
        if ltm.count() == 0:
            return []
        res = ltm.query(query_texts=[query], n_results=min(k, ltm.count()))
        return res["documents"][0]

    # --- közép távú (summary) ---
    def _maybe_summarize(self):
        if len(self.recent) <= self.threshold:
            return
        half = len(self.recent) // 2
        old, self.recent = self.recent[:half], self.recent[half:]
        convo = "\n".join(f"{m['role']}: {m['content']}" for m in old)
        r = llm.messages.create(
            model="claude-sonnet-4-5", max_tokens=250,
            messages=[{"role": "user", "content":
                f"Eddigi összefoglaló: {self.summary or '(nincs)'}\n"
                f"Új rész:\n{convo}\nFrissítsd 3 tömör mondatban, tényekkel."}],
        )
        self.summary = r.content[0].text

    def chat(self, user_input):
        long_term = self.recall(user_input)
        system_parts = []
        if long_term:
            system_parts.append("Tudott tények:\n" + "\n".join(f"- {m}" for m in long_term))
        if self.summary:
            system_parts.append(f"Beszélgetés összefoglalója: {self.summary}")
        system = "\n\n".join(system_parts)

        self.recent.append({"role": "user", "content": user_input})
        messages = self.recent[-self.window * 2:]

        resp = llm.messages.create(
            model="claude-sonnet-4-5", max_tokens=512,
            system=system, messages=messages,
        )
        reply = resp.content[0].text
        self.recent.append({"role": "assistant", "content": reply})
        self._maybe_summarize()
        return reply

# használat
agent = HybridAgent()
agent.remember("A felhasználó neve FJ, QA mérnök, macskája van.")
print(agent.chat("Szia! Emlékszel, mivel foglalkozom?"))
print(agent.chat("Segíts egy teszt-tervben a fizetési integrációhoz."))
```

::::: callout label="Záró feladat"
Bővítsd az agentet úgy, hogy minden forduló után egy külön LLM-hívás **eldönti, van-e a user üzenetében megjegyzendő tartós tény**, és ha igen, `remember()`-rel elmenti (fact extraction). Így az agent magától épít hosszú távú memóriát — de figyelj a 7. rész biztonsági pontjaira: a tényt kivont, strukturált formában tárold, ne nyers user-szöveget.
:::::
::::::

:::::: section id=mem-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A tutorial végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0–1. rész"
Stateless mental model · Memory-típusok · Architektúrák és trade-offok
::::
:::: card label="Feladat 1–2"
Buffer memory · Sliding window · Token-számlálás
::::
:::: card label="Feladat 3–4"
Summary auto-összegzés · ChromaDB vektor-memory · Lokális embedding
::::
:::: card label="7. rész"
Memory poisoning · PII · OWASP LLM védekezés
::::
:::: card label="8–9. rész"
LangGraph · Mem0 · pgvector · QA-tesztelés
::::
:::: card label="10. rész"
Hybrid CLI agent · Mindhárom réteg összekötve
::::
:::::

<p class="topic-tagline">Következő: a <em>vektor-adatbázisok</em> külön tutorial — indexelés (HNSW), metaadat-szűrés, chunkolás, hybrid search, pgvector vs. dedikált store.</p>
::::::
