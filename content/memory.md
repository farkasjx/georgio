# LLM és Agent Memory — gyakorlati tutorial

> Hogyan adjunk emlékezetet stateless nyelvi modelleknek és agenteknek.
> Elmélet, architektúrák, feladatok, példakódok (Python + Node), ChromaDB-vel.

---

## 1. Miért kell memory? — az elméleti alap

### A stateless probléma

Egy LLM **állapotmentes (stateless)**. Minden API-hívás nulláról indul: a modell semmit nem tud arról, mi hangzott el az előző hívásban. Amit "beszélgetésnek" látsz egy chat felületen, az egy illúzió — a háttérben **minden fordulóban a teljes eddigi történetet újraküldik** a modellnek.

```
Hívás 1:  [user: "A nevem FJ"]                          → "Örvendek, FJ!"
Hívás 2:  [user: "A nevem FJ"]
          [assistant: "Örvendek, FJ!"]
          [user: "Mi a nevem?"]                          → "FJ"
```

A "memory" tehát nem a modell képessége, hanem **egy réteg, amit köréépítesz**: eldönti, mit tegyél vissza a kontextusba, mit dobj el, és honnan hívd elő a régi információt.

### Context window ≠ memory

| Fogalom | Mi ez | Korlát |
|---|---|---|
| **Context window** | A tokenek, amit egyetlen híváskor a modell "lát" | Fix méret (pl. 200k token), drága, felejtő |
| **Persistent memory** | Külső tár (DB, fájl, vektor-index), ami túléli a hívást | Gyakorlatilag korlátlan, de elő kell hívni |

A context window egy **munkaasztal** — véges. A persistent memory egy **iratszekrény** — nagy, de csak akkor hasznos, ha a megfelelő aktát kiveszed és az asztalra teszed.

### Memory-típusok (kognitív analógia)

- **Short-term / working memory** — az aktuális session üzenetei. Illékony.
- **Long-term memory** — session-ökön átívelő perzisztens tudás.
  - **Episodic** — *mi történt* ("tegnap a felhasználó a Yaris finanszírozásról kérdezett").
  - **Semantic** — *tények* ("a felhasználó neve FJ, macskája van, IQOS-t használ").
  - **Procedural** — *hogyan* ("ez a user tömör, lényegre törő válaszokat szeret").

### Mikor NE használj memory-t

Ne overengineer-elj. Kerüld, ha:
- egyszeri, kontextusmentes Q&A (fordítás, összegzés, egy kódrészlet magyarázata),
- a teljes beszélgetés simán belefér a context window-ba és olcsó,
- nincs több session — egyszer használatos hívás.

A memory komplexitást, latency-t és **biztonsági felületet** (lásd 8. szakasz) hoz be. Csak akkor vezesd be, ha a stateless viselkedés tényleg fáj.

---

## 2. Memory architektúrák

### 2.1 Buffer memory (teljes history)

Minden üzenetet eltárolsz és visszaküldesz. Egyszerű, pontos — de a token-költség és a latency **lineárisan nő**, és előbb-utóbb túlfut a context window-on.

**Jó:** rövid beszélgetések, prototípus.
**Rossz:** hosszú session, sok user, költségérzékeny éles rendszer.

### 2.2 Sliding window (utolsó N üzenet)

Csak az utolsó N fordulót tartod meg. Fix token-plafon.

**Jó:** chat, ahol csak a közelmúlt számít.
**Rossz:** ha a fontos infó "kicsúszik" az ablakból (pl. a user neve az 1. üzenetben volt).

### 2.3 Summary memory

Egy threshold felett a régi üzeneteket **összegzed** (magával az LLM-mel), és az összefoglalót tartod meg a nyers szöveg helyett. Token-takarékos, megőrzi a lényeget.

**Jó:** hosszú beszélgetések, ahol a "story" fontos, a szó szerinti szöveg nem.
**Rossz:** ha pontos részletek (számok, ID-k) elveszhetnek az összegzésben.

### 2.4 Vector / RAG-alapú memory

Az üzeneteket/tényeket **embeddingként** tárolod egy vektor-DB-ben (ChromaDB). Új kérdésnél a szemantikailag legrelevánsabb emlékeket **visszakeresed**, és csak azokat teszed a kontextusba.

**Jó:** nagy, hosszú távú tudás; "emlékezz mire kértelek 3 hete".
**Rossz:** felépítés-komplexitás; a retrieval minősége meghatározó (rossz találat = rossz válasz).

### 2.5 Hybrid (a való életben ez a nyerő)

- **Sliding window** az aktuális fordulókra (rövid táv),
- **Summary** a session lényegére (közép táv),
- **Vector store** a perzisztens tényekre (hosszú táv).

### Trade-off tábla

| Architektúra | Token-költség | Pontosság | Komplexitás | Skálázhatóság |
|---|---|---|---|---|
| Buffer | Magas ⬆ | Nagyon jó | Nagyon alacsony | Rossz |
| Sliding window | Alacsony | Közepes | Alacsony | Jó |
| Summary | Alacsony | Jó (lossy) | Közepes | Jó |
| Vector/RAG | Alacsony/közepes | Jó (retrieval-függő) | Magas | Nagyon jó |
| Hybrid | Optimalizált | Nagyon jó | Magas | Nagyon jó |

---

## 3. Előkészület

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

### Lokális embedding (opcionális, a te stackedhez — Ollama/Hermes)

A ChromaDB alapból saját (ONNX) embedding-függvénnyel jön, de a vektorozást lokális modellel is elvégeztetheted Ollamán keresztül:

```bash
ollama pull nomic-embed-text
# az embedding endpoint: http://localhost:11434/api/embeddings
```

---

## 4. Feladat 1 — Buffer memory kézzel

**Cél:** értsd meg, hogy a "beszélgetés" = a teljes history újraküldése.

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

> **Feladat:** kommentezd ki a `memory.add("assistant", reply)` sort. Figyeld meg, hogy a modell így "elfelejti" a saját válaszait — bizonyíték arra, hogy a memory a te felelősséged, nem a modellé.

---

## 5. Feladat 2 — Sliding window + token-számlálás

**Cél:** fix token-plafon, és lásd, mikor "csúszik ki" a fontos infó.

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

> **Feladat:** növeld a `max_turns` értékét, amíg a "Mi a nevem?" újra helyes választ ad. Ez a sliding window alapvető kompromisszuma: **memória vs. token-költség**.

### Node (a window-logika)

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

---

## 6. Feladat 3 — Summary memory (auto-összegzés)

**Cél:** ha a history túlnő egy küszöböt, összegezd a régi részt az LLM-mel, és az összefoglalót tartsd meg.

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

> **Feladat:** logold ki minden fordulónál a `memory.summary` értékét. Nézd meg, mi marad meg és mi vész el az összegzés során — ez a **lossy** természet, amit a QA-tesztjeidnél figyelembe kell venned.

---

## 7. Feladat 4 — Vector memory ChromaDB-vel

**Cél:** perzisztens, szemantikus hosszú távú memory. Nem a *közelmúltat* tartod meg, hanem a *releváns* emléket hívod elő — akárhány session-nel korábbról.

### 7.1 Alap (Python, beépített embedding)

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

### 7.2 Teljes ciklus: retrieve → prompt → store

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
    # (opcionális) mentsd el a fontos új tényt hosszú távú memóriába
    remember(f"User kérdezte: {user_input}")
    return reply

remember("A felhasználó neve FJ, macskája van.")
print(chat("Emlékszel a nevemre?"))
```

### 7.3 Lokális embedding Ollamával (nomic-embed-text)

Ha nem akarod a ChromaDB alap-embeddingjét, hanem lokális modellt (adatvédelem, offline homelab):

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

### 7.4 Node változat

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

> **Node megjegyzés:** a Chroma JS-kliens egy futó Chroma szerverhez csatlakozik (`chroma run --path ./memory_db`), nem embedded. Pythonban van beágyazott `PersistentClient` is.

> **Feladat:** tölts be 10-15 vegyes emléket, majd kérdezz rá olyanra, ami *szemantikailag* rokon, de nem szó szerinti egyezés (pl. tárolt: "Dockert használ", kérdés: "Konténerizációval dolgozik?"). Ez mutatja meg a vektor-keresés erejét a kulcsszó-kereséssel szemben.

---

## 8. Biztonság — memory mint támadási felület (OWASP LLM)

A memory nem csak feature, hanem **kockázat**. Amit tárolsz és visszateszel a kontextusba, az bizalmi határt lép át.

- **Memory poisoning / indirect prompt injection** — ha a userinput (vagy egy külső dokumentum) szövegét szó szerint eltárolod, egy támadó utasítást csempészhet a memóriába, ami egy **későbbi** session-ben aktiválódik. *Kapcsolódik: OWASP LLM01 (Prompt Injection).*
- **Szenzitív adat perzisztálása** — a vektor-DB könnyen válik PII-tárrá (nevek, e-mailek, kártyaadat). *OWASP LLM02 (Sensitive Information Disclosure).* Sose ments el titkot, tokent, jelszót, kártyaszámot.
- **Retrieval-alapú szivárgás** — multi-user rendszerben a rossz collection-particionálás miatt A user emléke B usernek visszaköszönhet.

**Védekezés:**
- Ne nyers üzenetet ments, hanem **strukturált, kivont tényt** ("user preferences: tömör válasz"), lehetőleg egy külön LLM-lépéssel szűrve.
- **User-onként külön collection** vagy szigorú `metadata`-filter minden query-nél.
- PII-detektálás/redaktálás a tárolás előtt.
- A visszahívott memóriát kezeld **adatként, ne utasításként** — a system promptban tedd egyértelművé, hogy az csak háttér-információ.

---

## 9. Framework-áttekintés

| Eszköz | Nyelv | Mit ad | Mikor |
|---|---|---|---|
| **LangGraph** (checkpointer + store) | Py/JS | Beépített state-perzisztencia agenteknek, thread-alapú | Ha már LangGraph-ot használsz agent-orchesztrációra |
| **Mem0** | Py/JS | Dedikált memory-réteg auto-extraction-nel, hosszú távú | Ha nem akarsz saját retrieve/store logikát írni |
| **Anthropic context management** | API | Prompt caching, hosszú kontextus kezelése natívan | Ha a Claude API-ra építesz és a context-cost a fő gond |
| **Saját (Chroma + kód)** | Py/JS | Teljes kontroll, nulla vendor-lock | Tanuláshoz, egyedi igényhez, homelabhez |

### LangGraph rövid példa (Python)

```python
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import StateGraph

# a checkpointer minden lépés után menti a gráf állapotát,
# thread_id alapján előhívja → session-memory ingyen
checkpointer = MemorySaver()
# graph = builder.compile(checkpointer=checkpointer)
# graph.invoke(input, config={"configurable": {"thread_id": "user-fj"}})
```

### Mem0 rövid példa (Python)

```python
from mem0 import Memory

m = Memory()
m.add("A felhasználó neve FJ, Yaris-t akar venni.", user_id="fj")
relevant = m.search("autó", user_id="fj")  # auto-extract + retrieve
```

---

## 10. Éles használat — best practices

- **Eviction (mit dobj el):** idő-alapú (régi emlék öregszik), fontosság-alapú (score), vagy méret-alapú (LRU). A vektor-memóriát időnként takarítsd (duplikátumok, elavult tények).
- **Perzisztencia:** prototípusban embedded Chroma; élesben **PostgreSQL + pgvector** (a te stackedhez illik — egy DB a relációs adatnak és a vektoroknak is).
- **Fact extraction:** ne nyers üzenetet ments. Egy köztes LLM-lépés vonja ki a tartós tényt ("Elköltöztem Budapestre" → `user.location = Budapest`).
- **Frissítés vs. hozzáadás:** ha "FJ Yaris-t akar" később "FJ megvette a Yaris-t" lesz, **frissítsd/érvénytelenítsd** a régit, ne halmozz ellentmondó emlékeket.
- **Tesztelés (QA-szemmel):**
  - *Recall-teszt:* tárolt tény → kérdés → visszajön-e?
  - *Negatív teszt:* nem tárolt tényre nem hallucinál-e emléket?
  - *Izolációs teszt:* A user emléke nem szivárog-e B userhez?
  - *Poisoning-teszt:* injektált utasítás a memóriában nem befolyásolja-e a viselkedést?
  - *Regresszió:* summary-összegzés után megmaradnak-e a kulcs-tények (nevek, ID-k, számok)?

---

## 11. Összefoglaló példa — hybrid CLI agent

Egy kis agent, ami mindent összeköt: **sliding window** (rövid táv) + **summary** (közép táv) + **Chroma vektor-memory** (hosszú táv).

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

> **Záró feladat:** bővítsd az agentet úgy, hogy minden forduló után egy külön LLM-hívás **eldönti, van-e a user üzenetében megjegyzendő tartós tény**, és ha igen, `remember()`-rel elmenti (fact extraction). Így az agent magától épít hosszú távú memóriát — de figyelj a 8. szakasz biztonsági pontjaira: a tényt kivont, strukturált formában tárold, ne nyers user-szöveget.

---

## Következő lépés

A vektor-memória csak megkapargatta a felszínt — a **vektor-adatbázisok** (indexelési stratégiák, HNSW, metaadat-szűrés, pgvector vs. dedikált store, chunkolás, hybrid search) külön tutorialt érdemelnek. Ez lesz a folytatás.
