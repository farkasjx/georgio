---
page: ollama
title: Lokális LLM
sidebar_groups:
  - Szintek
  - Referencia
hero:
  eyebrow: "Lokális LLM · Fejlesztői Tanulási Terv"
  title: "Ollama + <em>Dev Workflow</em>"
  lead: "10 szint, nulláról production-kész lokális AI fejlesztésig. Minden szintnek van konkrét célja, fogalomkészlete és mérhető gyakorlata — ne csak futtass modelleket, hanem <em>értsd, mi történik a háttérben.</em>"
  stats:
    - { val: "10", lbl: "Szint" }
    - { val: "9", lbl: "Mini projekt" }
    - { val: "Ollama", lbl: "Fő eszköz" }
    - { val: "0→prod", lbl: "Útvonal" }
footer:
  left: "AI Hub · Lokális LLM"
  right: "Ollama · Összeállítva 2026 júniusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#ol-0"><div class="tc-num">0. szint</div><div class="tc-name">Alap setup</div><div class="tc-desc">Telepítés, mental model, első futtatás.</div></a>
  <a class="toc-card" href="#ol-1"><div class="tc-num">1. szint</div><div class="tc-name">Model management</div><div class="tc-desc">Modellek kezelése, összehasonlítás.</div></a>
  <a class="toc-card" href="#ol-2"><div class="tc-num">2. szint</div><div class="tc-name">API & paraméterek</div><div class="tc-desc">Kontrollált hívás, temperature, top_p.</div></a>
  <a class="toc-card" href="#ol-3"><div class="tc-num">3. szint</div><div class="tc-name">Streaming & UX</div><div class="tc-desc">Real-time output, CLI chat kliens.</div></a>
  <a class="toc-card" href="#ol-4"><div class="tc-num">4. szint</div><div class="tc-name">Tool & agent</div><div class="tc-desc">LLM → döntés → tool → eredmény.</div></a>
  <a class="toc-card" href="#ol-5"><div class="tc-num">5. szint</div><div class="tc-name">Docker & deploy</div><div class="tc-desc">Konténerizált LLM szerver.</div></a>
  <a class="toc-card" href="#ol-6"><div class="tc-num">6. szint</div><div class="tc-name">Security</div><div class="tc-desc">Localhost vs. nyitott port, Nginx proxy.</div></a>
  <a class="toc-card" href="#ol-7"><div class="tc-num">7. szint</div><div class="tc-name">Performance</div><div class="tc-desc">GPU vs CPU, VRAM, latency mérés.</div></a>
  <a class="toc-card" href="#ol-8"><div class="tc-num">8. szint</div><div class="tc-name">Debugging</div><div class="tc-desc">Tipikus hibák és javításuk.</div></a>
  <a class="toc-card" href="#ol-9"><div class="tc-num">9. szint</div><div class="tc-name">Full dev projekt</div><div class="tc-desc">Mindent összekötő Local AI Assistant.</div></a>
</div>
::::::

:::::: section id=ol-0 num="00" heading="0. szint — Alap setup és mental model" nav="Alap setup"

<p class="topic-tagline">Cél: értsd, mi történik a háttérben — ne csak gépeld be a parancsokat.</p>

### Telepítés és alap futtatás

Az Ollama egy parancssori eszköz, ami letölti és futtatja a modelleket lokálisan. Nincs szükség Python-ra, CUDA-beállításra vagy API-kulcsra az első lépéshez.

```bash
# Telepítés (Linux/Mac)
curl -fsSL https://ollama.ai/install.sh | sh

# Első modell futtatása – interaktív chat indul
ollama run llama3
```

### Alap fogalmak

::::: stack-grid
:::: card label="Modell"
**Súlyok + architektúra.** A `.gguf` fájl tartalmazza a milliárd számot, amit az inference futtat. Nem „program", hanem paraméterkészlet.
::::
:::: card label="Inference"
**A futtatás folyamata.** A modell az input tokenek alapján kiszámolja a valószínű következő tokent — ezt ismétli addig, amíg a válasz kész.
::::
:::: card label="Context window"
**A modell „munkamemóriája".** Az összes korábbi szöveg, ami egyszerre belefér. Ha túllépi, a régi részek kiesnek.
::::
:::: card label="Token"
**A feldolgozás egysége.** Kb. ¾ szó angolul, magyarban több is lehet. A modell tokenekben „lát" és tokenekben „gondolkodik".
::::
:::::

::::: callout label="Gyakorlat"
Futtass 2 különböző modellt (`ollama run llama3` és `ollama run mistral`), tedd fel ugyanazt a kérdést, és hasonlítsd össze a válasz stílusát, hosszát, bizonytalanságát.
:::::
::::::

:::::: section id=ol-1 num="01" heading="1. szint — Model management &amp; kísérletezés" nav="Model management"

<p class="topic-tagline">Cél: tudd kezelni a modelleket, ne csak használni őket.</p>

### Model lifecycle parancsok

```bash
ollama list              # letöltött modellek listája
ollama pull llama3       # modell letöltése futtatás nélkül
ollama rm llama3         # modell törlése
ollama show llama3       # modell metaadatai (paraméterszám, context, stb.)
ollama ps                # épp futó modellek
```

### Small vs large modell

Az Ollama modellnevekben a szám a paraméterszámot jelzi — ez közvetlenül befolyásolja a sebességet és a minőséget:

| Modell | Méret | Mire jó | VRAM igény |
|---|---|---|---|
| `llama3.2:1b` | ~0.8 GB | gyors kísérletezés, edge | ~1.5 GB |
| `llama3.2:3b` | ~2 GB | általános feladatok | ~3.5 GB |
| `llama3.1:8b` | ~5 GB | erős általános modell | ~6 GB |
| `llama3.1:70b` | ~40 GB | top minőség, lassabb | ~48 GB |

::::: callout label="Mini projekt — modell összehasonlító napló"
Tölts le egy small és egy large modellt. Ugyanazt a 3 kérdést tedd fel mindkettőnek (pl. faktakérdés, kódírás, kreatív szöveg). Jegyezd fel: válasz minősége, sebesség érzete, bizonytalanság jelei.
:::::
::::::

:::::: section id=ol-2 num="02" heading="2. szint — API használat és paraméterezés" nav="API használat"

<p class="topic-tagline">Cél: ne black box legyen, hanem kontrollált rendszer.</p>

### Az Ollama REST API

Az Ollama alapból egy HTTP szervert indít a `localhost:11434` porton. Bármilyen HTTP klienssel hívható — curl, Python requests, fetch.

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.1:8b",
  "prompt": "Írj egy rövid történetet egy programozóról.",
  "temperature": 0.7,
  "top_p": 0.9,
  "stream": false
}'
```

### Fontos paraméterek

| Paraméter | Hatás | Tipikus értékek |
|---|---|---|
| `temperature` | Kreativitás / véletlenszerűség. Magasabb = változatosabb, de kevésbé pontos. | 0.0–0.3 (precíz) · 0.7 (általános) · 1.0+ (kreatív) |
| `top_p` | Núkleus mintavételezés — csak az első P valószínűségű tokenek közül választ. | 0.9 (általános) · 0.5 (konzervatív) |
| `top_k` | Maximum K darab token közül választ. Korlátozza a szókincs-szélességet. | 20–40 általános használatra |
| `stream` | Tokenenként küldje-e a választ, vagy egyszerre. | `true` (UX) · `false` (batch) |
| `num_ctx` | Context window mérete tokenekben. Nagyobb = több memória. | 2048–8192 (Ollama default: 2048) |

```
Prompt: "Mi a főváros?"
→ "Magyarország fővárosa Budapest."
(rövid, faktikus, variáció nélkül)
```

```
Prompt: "Mi a főváros?"
→ "Nos, ha Magyarországra gondolsz,
akkor Budapest az a csodás város..."
(hosszabb, stílusosabb, változatosabb)
```

::::: callout label="Gyakorlat"
Ugyanarra a promptra hívd meg az API-t `temperature: 0.1`-gyel és `temperature: 0.9`-cel 3-3-szor. Figyeld meg: az alacsony hőmérsékletű válaszok mennyire azonosak, a magasak mennyire különböznek.
:::::
::::::

:::::: section id=ol-3 num="03" heading="3. szint — Streaming és real-time UX" nav="Streaming & UX"

<p class="topic-tagline">Cél: modern LLM élmény építése — a felhasználó ne nézzen üres képernyőt.</p>

### Miért fontos a streaming?

Egy 200 tokenes válasz generálása 3–8 másodpercig tarthat. Streaming nélkül a felhasználó üres képernyőt lát, majd egyszerre megjelenik az egész szöveg. Streaminggel az első token ~0.5s után jelenik meg — ugyanolyan érzet, mint a ChatGPT.

### Python streaming kliens

```python
import requests, json

def chat_stream(prompt, model="llama3.1:8b"):
    response = requests.post(
        "http://localhost:11434/api/generate",
        json={"model": model, "prompt": prompt, "stream": True},
        stream=True
    )
    for line in response.iter_lines():
        if line:
            chunk = json.loads(line)
            print(chunk["response"], end="", flush=True)
            if chunk.get("done"):
                print()  # newline a végén
                break

chat_stream("Magyarázd el a kontextusablakot egyszerűen.")
```

::::: callout label="Gyakorlat"
Bővítsd ki a fenti kódot interaktív CLI chat kliensbe: `while True` loop, felhasználói input, `exit` kilépés. Opcióként add hozzá a chat history küldését is (messages tömb a `/api/chat` endpointhoz).
:::::
::::::

:::::: section id=ol-4 num="04" heading="4. szint — Tool használat és agent workflow" nav="Tool & agent workflow"

<p class="topic-tagline">Cél: az LLM ne csak válaszoljon, hanem „dolgozzon" — döntést hozzon, eszközt hívjon.</p>

### Az alap minta

Az agent loop lényege: a modell _nem közvetlenül válaszol_, hanem dönt arról, mit tegyen, és az app végrehajtja azt. A ReAct minta (Thought → Action → Observation) lokálisan is ugyanígy működik.

```text
LLM kap kérdést
   ↓
LLM eldönti: szükséges-e külső adat?
   ↓ igen
Python hív API-t / keres / számol
   ↓
Eredmény visszakerül a kontextusba
   ↓
LLM válaszol a valódi adatok alapján
```

### Mini research agent — Python példa

```python
import requests, json

def get_weather(city: str) -> str:
    # Valódi projektben: pl. wttr.in API
    return f"{city}: 22°C, partly cloudy"

TOOLS = {"get_weather": get_weather}

SYSTEM = """Ha időjárást kérdeznek, válaszd az eszközt:
TOOL: get_weather(city)
Egyébként válaszolj közvetlenül."""

def agent(user_input: str):
    prompt = f"{SYSTEM}\n\nUser: {user_input}\nAssistant:"
    res = requests.post("http://localhost:11434/api/generate",
                        json={"model": "llama3.1:8b", "prompt": prompt,
                              "stream": False}).json()
    reply = res["response"]

    if "TOOL:" in reply:
        # Parse tool call és végrehajtás
        tool_line = [l for l in reply.splitlines() if "TOOL:" in l][0]
        city = tool_line.split("(")[1].split(")")[0]
        observation = TOOLS["get_weather"](city)

        # Második hívás az eredménnyel
        prompt2 = prompt + reply + f"\nObservation: {observation}\nFinal answer:"
        res2 = requests.post("http://localhost:11434/api/generate",
                             json={"model": "llama3.1:8b", "prompt": prompt2,
                                   "stream": False}).json()
        print(res2["response"])
    else:
        print(reply)

agent("Milyen az idő Budapesten?")
```

::::: callout label="Mini projekt — mini research agent"
Bővítsd az agentet: adj hozzá egy `calculate(expr)` tool-t (`eval()`-lal vagy `numexpr`-rel), és egy `search(query)` tool-t (pl. DuckDuckGo API). A modell döntse el, melyiket kell használni.
:::::
::::::

:::::: section id=ol-5 num="05" heading="5. szint — Docker és deployment" nav="Docker & deployment"

<p class="topic-tagline">Cél: ne csak lokális legyen — reprodukálható, hordozható szerver.</p>

### Ollama Dockerben

```bash
# CPU-only futtatás
docker run -d \
  -v ollama:/root/.ollama \
  -p 11434:11434 \
  --name ollama \
  ollama/ollama

# NVIDIA GPU támogatással
docker run -d --gpus=all \
  -v ollama:/root/.ollama \
  -p 11434:11434 \
  --name ollama \
  ollama/ollama

# Modell letöltése a konténerbe
docker exec -it ollama ollama pull llama3.1:8b
```

### Kulcsfogalmak

::::: stack-grid
:::: card label="Containerization"
Az alkalmazás + függőségei egyetlen képbe csomagolva. Bárhol fut, ami Dockert tud.
::::
:::: card label="Port mapping"
`-p 11434:11434` — a host 11434-es portja a konténer 11434-esére mutat. Nélküle nem érhető el kívülről.
::::
:::: card label="Persistent storage"
`-v ollama:/root/.ollama` — a letöltött modellek megmaradnak, ha a konténert leállítod.
::::
:::::

::::: callout label="Gyakorlat"
Indítsd el az Ollama konténert, tölts le egy modellt, és hívd meg a Python kliensedből. Ellenőrizd, hogy a modell fájl megmarad-e konténer restart után (`docker restart ollama`).
:::::
::::::

:::::: section id=ol-6 num="06" heading="6. szint — Security és production gondolkodás" nav="Security & production"

<p class="topic-tagline">Cél: ne legyen véletlenül nyitott AI szervered az interneten.</p>

### A veszély

Az Ollama alapból `127.0.0.1:11434`-en hallgat — ez **csak lokálisan elérhető**, biztonságos. Ha viszont `0.0.0.0`-ra nyitod (pl. Docker default), bárki az interneten hívhatja a modelleidet — autentikáció nélkül, számlád terhére.

```bash
# Veszélyes — mindenki eléri a hálózatról
docker run -p 0.0.0.0:11434:11434 ollama/ollama

# Biztonságos — csak localhost éri el
docker run -p 127.0.0.1:11434:11434 ollama/ollama
```

### Nginx reverse proxy (autentikációval)

```nginx
server {
    listen 443 ssl;
    server_name ai.sajatdomain.hu;

    # Basic Auth — egyszerű védelem
    auth_basic "AI Server";
    auth_basic_user_file /etc/nginx/.htpasswd;

    location / {
        proxy_pass http://127.0.0.1:11434;
        proxy_set_header Host $host;
    }
}
```

::::: callout danger label="Production checklist"
**✓** Ollama csak 127.0.0.1-en hallgat · **✓** Nginx/Caddy reverse proxy HTTPS-sel · **✓** API key vagy Basic Auth · **✓** Rate limiting (pl. `limit_req_zone`) · **✓** Logok figyelése (kik hívják, milyen promptokkal)
:::::
::::::

:::::: section id=ol-7 num="07" heading="7. szint — Performance és optimalizáció" nav="Performance"

<p class="topic-tagline">Cél: értsd, miért lassú vagy gyors — és mit tudsz rajta változtatni.</p>

### A négy kulcstényező

::::: stack-grid
:::: card label="Modell méret"
3B → ~30 tok/s · 8B → ~15 tok/s · 70B → ~3 tok/s (CPU-n). Minőség vs sebesség trade-off.
::::
:::: card label="GPU vs CPU"
GPU: 10–50× gyorsabb az inference. CPU-n az 8B modell is 5–15 tok/s alatt marad.
::::
:::: card label="VRAM limit"
Ha a modell nem fér GPU-ra, CPU offloadra vált — drámaian lassabb. Cél: modell + KV cache beleférjen.
::::
:::: card label="Context window"
Nagyobb `num_ctx` → több VRAM a KV cache-nek. 8192 token ~2× annyi memória, mint 4096.
::::
:::::

### Latency mérés Pythonban

```python
import requests, time, json

def benchmark(model: str, prompt: str) -> dict:
    start = time.perf_counter()
    res = requests.post("http://localhost:11434/api/generate",
                        json={"model": model, "prompt": prompt,
                              "stream": False}).json()
    elapsed = time.perf_counter() - start
    tokens = res.get("eval_count", 0)
    return {
        "model": model,
        "tokens": tokens,
        "seconds": round(elapsed, 2),
        "tok_per_sec": round(tokens / elapsed, 1)
    }

for m in ["llama3.2:3b", "llama3.1:8b"]:
    print(benchmark(m, "Explain transformers in 3 sentences."))
```

::::: callout label="Gyakorlat"
Mérd meg a small és large modell latency-jét ugyanarra a promptra. Próbáld ki ugyanezt `num_ctx: 512` és `num_ctx: 4096` beállítással — látod-e a különbséget az első token megjelenési idejében?
:::::
::::::

:::::: section id=ol-8 num="08" heading="8. szint — Debugging és hibakezelés" nav="Debugging"

<p class="topic-tagline">Cél: ne akadj el — ismerd fel és javítsd a leggyakoribb hibákat.</p>

### Tipikus hibák és megoldásuk

| Hiba | Ok | Megoldás |
|---|---|---|
| `model not found` | A modell nincs letöltve, vagy elírás a névben. | `ollama pull &lt;model&gt;` először. `ollama list`-tel ellenőrizd a pontos nevet. |
| `connection refused` | Az Ollama szerver nem fut. | `ollama serve` kézzel, vagy `systemctl start ollama`. Ellenőrizd: `curl localhost:11434`. |
| Port conflict | A 11434-es port már foglalt. | `lsof -i :11434` — melyik folyamat foglalja. `OLLAMA_HOST=0.0.0.0:11435` env változóval más port. |
| Lassú inference | CPU offload, nagy context, kvantálás hiánya. | Kisebb modell (`:3b`), kisebb `num_ctx`, GPU-s gépen `ollama ps`-sel nézd, mennyi réteg van GPU-n. |
| Memory overflow / OOM | A modell + KV cache nem fér VRAM-ba. | Kisebb kvantálás (`:q4_0`), kisebb context, vagy CPU offload (`OLLAMA_NUM_GPU=0`). |

### Debug tippek

```bash
# Ollama szerver logjai (Linux)
journalctl -u ollama -f

# Futó modell és GPU kihasználtság
ollama ps
nvidia-smi  # NVIDIA GPU

# API közvetlen tesztelés
curl http://localhost:11434/api/tags  # elérhető modellek
curl http://localhost:11434/         # szerver él-e
```

::::: callout warning label="Gyakorlat"
Szándékosan hibás setupot csinálj: hívj egy nem létező modellt, állítsd le az Ollama szervert és hívd az API-t, adj meg hatalmas `num_ctx` értéket. Nézd meg a hibaüzeneteket és gyakorold a diagnosztikát.
:::::
::::::

:::::: section id=ol-9 num="09" heading="9. szint — Full developer workflow projekt" nav="Fejlesztői workflow projekt"

<p class="topic-tagline">Cél: mindent összekötni — egy production-közelű lokális AI asszisztens.</p>

### Local AI Dev Assistant — architektúra

```text
CLI / Web UI  (Rich / Gradio / egyszerű HTML)
   ↓
FastAPI réteg  (streaming, model switch, tool routing)
   ↓
Ollama server  (localhost:11434)
   ↓
Tools  (web search, fájlok, scriptek, calc)
```

### Funkciók és implementáció

::::: stack-grid
:::: card label="Streaming chat"
FastAPI `StreamingResponse` + Ollama `stream: true`. Frontend Server-Sent Events (SSE)-sel olvassa.
::::
:::: card label="Model switch"
API paraméterként átadható a modell neve. Egy dropdown a UI-ban, ami azonnal vált.
::::
:::: card label="Tool integráció"
ReAct loop Pythonban: LLM válasza parse-olva, tool meghívva, observation visszaadva.
::::
:::: card label="Docker deploy"
`docker-compose.yml`: Ollama + FastAPI két service-ként, shared network.
::::
:::: card label="Logging"
Minden kérés logolva: timestamp, model, prompt hash, token count, latency.
::::
:::: card label="Chat history"
Messages tömb session-önként — `/api/chat` endpoint a multi-turn párbeszédhez.
::::
:::::

### Docker Compose példa

```yaml
services:
  ollama:
    image: ollama/ollama
    ports:
      - "127.0.0.1:11434:11434"
    volumes:
      - ollama_data:/root/.ollama

  api:
    build: ./api
    ports:
      - "127.0.0.1:8000:8000"
    environment:
      - OLLAMA_URL=http://ollama:11434
    depends_on:
      - ollama

volumes:
  ollama_data:
```
::::::

:::::: section id=ol-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A tanulási út végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0–1. szint"
Lokális LLM futtatás · Modellek kezelése · Mental model
::::
:::: card label="2–3. szint"
API kontroll · Paraméterezés · Streaming UX
::::
:::: card label="4. szint"
Tool calling · ReAct loop · Mini research agent
::::
:::: card label="5–6. szint"
Docker deployment · Production security · Nginx proxy
::::
:::: card label="7–8. szint"
Performance tuning · Debug & observability
::::
:::: card label="9. szint"
Full stack Local AI Dev Assistant · Minden összekötve
::::
:::::
::::::
