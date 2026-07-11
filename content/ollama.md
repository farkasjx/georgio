---
page: ollama
title: Lokális LLM
sidebar:
  - label: "Szintek"
    links:
      - { href: "#ollama-overview", text: "Áttekintés" }
      - { href: "#ol-0", text: "Alap setup", num: "00" }
      - { href: "#ol-1", text: "Model management", num: "01" }
      - { href: "#ol-2", text: "API & paraméterek", num: "02" }
      - { href: "#ol-3", text: "Streaming & UX", num: "03" }
      - { href: "#ol-4", text: "Tool & agent", num: "04" }
      - { href: "#ol-5", text: "Docker & deploy", num: "05" }
      - { href: "#ol-6", text: "Security", num: "06" }
      - { href: "#ol-7", text: "Performance", num: "07" }
      - { href: "#ol-8", text: "Debugging", num: "08" }
      - { href: "#ol-9", text: "Full dev projekt", num: "09" }
  - label: "Referencia"
    links:
      - { href: "#ol-summary", text: "Összefoglalás", sub: true }
---

<!-- MIGRÁLÁSI ÁLLAPOT: raw (az eredeti HTML 1:1).
     Fokozatosan bontsd ::: blokkokra a prompting.md mintájára. -->

::: raw

      <div class="page-hero" id="ollama-overview">
        <div class="hero-eyebrow">Lokális LLM · Fejlesztői Tanulási Terv</div>
        <h1>Ollama + <em>Dev Workflow</em></h1>
        <p class="lead">
          10 szint, nulláról production-kész lokális AI fejlesztésig. Minden szintnek van konkrét
          célja, fogalomkészlete és mérhető gyakorlata — ne csak futtass modelleket, hanem <em>értsd, mi történik a háttérben.</em>
        </p>
        <div class="hero-stats">
          <div class="hero-stat"><span class="val">10</span><span class="lbl">Szint</span></div>
          <div class="hero-stat"><span class="val">9</span><span class="lbl">Mini projekt</span></div>
          <div class="hero-stat"><span class="val">Ollama</span><span class="lbl">Fő eszköz</span></div>
          <div class="hero-stat"><span class="val">0→prod</span><span class="lbl">Útvonal</span></div>
        </div>

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
      </div>

      <!-- ── 0. SZINT ── -->
      <section id="ol-0">
        <div class="section-heading">0. szint — Alap setup és mental model</div>
        <p class="topic-tagline">Cél: értsd, mi történik a háttérben — ne csak gépeld be a parancsokat.</p>

        <h3>Telepítés és alap futtatás</h3>
        <p>Az Ollama egy parancssori eszköz, ami letölti és futtatja a modelleket lokálisan. Nincs szükség Python-ra, CUDA-beállításra vagy API-kulcsra az első lépéshez.</p>
<pre data-lang="bash"><code><span class="c"># Telepítés (Linux/Mac)</span>
curl -fsSL https://ollama.ai/install.sh | sh

<span class="c"># Első modell futtatása – interaktív chat indul</span>
ollama run llama3</code></pre>

        <h3>Alap fogalmak</h3>
        <div class="stack-grid">
          <div class="stack-card">
            <div class="sc-label">Modell</div>
            <div class="sc-items"><strong style="color:var(--text)">Súlyok + architektúra.</strong> A <code>.gguf</code> fájl tartalmazza a milliárd számot, amit az inference futtat. Nem „program", hanem paraméterkészlet.</div>
          </div>
          <div class="stack-card">
            <div class="sc-label">Inference</div>
            <div class="sc-items"><strong style="color:var(--text)">A futtatás folyamata.</strong> A modell az input tokenek alapján kiszámolja a valószínű következő tokent — ezt ismétli addig, amíg a válasz kész.</div>
          </div>
          <div class="stack-card">
            <div class="sc-label">Context window</div>
            <div class="sc-items"><strong style="color:var(--text)">A modell „munkamemóriája".</strong> Az összes korábbi szöveg, ami egyszerre belefér. Ha túllépi, a régi részek kiesnek.</div>
          </div>
          <div class="stack-card">
            <div class="sc-label">Token</div>
            <div class="sc-items"><strong style="color:var(--text)">A feldolgozás egysége.</strong> Kb. ¾ szó angolul, magyarban több is lehet. A modell tokenekben „lát" és tokenekben „gondolkodik".</div>
          </div>
        </div>

        <div class="callout">
          <div class="callout-label">Gyakorlat</div>
          <p>Futtass 2 különböző modellt (<code>ollama run llama3</code> és <code>ollama run mistral</code>), tedd fel ugyanazt a kérdést, és hasonlítsd össze a válasz stílusát, hosszát, bizonytalanságát.</p>
        </div>
      </section>

      <!-- ── 1. SZINT ── -->
      <section id="ol-1">
        <div class="section-heading">1. szint — Model management &amp; kísérletezés</div>
        <p class="topic-tagline">Cél: tudd kezelni a modelleket, ne csak használni őket.</p>

        <h3>Model lifecycle parancsok</h3>
<pre data-lang="bash"><code>ollama list              <span class="c"># letöltött modellek listája</span>
ollama pull llama3       <span class="c"># modell letöltése futtatás nélkül</span>
ollama rm llama3         <span class="c"># modell törlése</span>
ollama show llama3       <span class="c"># modell metaadatai (paraméterszám, context, stb.)</span>
ollama ps                <span class="c"># épp futó modellek</span></code></pre>

        <h3>Small vs large modell</h3>
        <p>Az Ollama modellnevekben a szám a paraméterszámot jelzi — ez közvetlenül befolyásolja a sebességet és a minőséget:</p>
        <table>
          <thead><tr><th>Modell</th><th>Méret</th><th>Mire jó</th><th>VRAM igény</th></tr></thead>
          <tbody>
            <tr><td><code>llama3.2:1b</code></td><td>~0.8 GB</td><td>gyors kísérletezés, edge</td><td>~1.5 GB</td></tr>
            <tr><td><code>llama3.2:3b</code></td><td>~2 GB</td><td>általános feladatok</td><td>~3.5 GB</td></tr>
            <tr><td><code>llama3.1:8b</code></td><td>~5 GB</td><td>erős általános modell</td><td>~6 GB</td></tr>
            <tr><td><code>llama3.1:70b</code></td><td>~40 GB</td><td>top minőség, lassabb</td><td>~48 GB</td></tr>
          </tbody>
        </table>

        <div class="callout">
          <div class="callout-label">Mini projekt — modell összehasonlító napló</div>
          <p>Tölts le egy small és egy large modellt. Ugyanazt a 3 kérdést tedd fel mindkettőnek (pl. faktakérdés, kódírás, kreatív szöveg). Jegyezd fel: válasz minősége, sebesség érzete, bizonytalanság jelei.</p>
        </div>
      </section>

      <!-- ── 2. SZINT ── -->
      <section id="ol-2">
        <div class="section-heading">2. szint — API használat és paraméterezés</div>
        <p class="topic-tagline">Cél: ne black box legyen, hanem kontrollált rendszer.</p>

        <h3>Az Ollama REST API</h3>
        <p>Az Ollama alapból egy HTTP szervert indít a <code>localhost:11434</code> porton. Bármilyen HTTP klienssel hívható — curl, Python requests, fetch.</p>
<pre data-lang="bash"><code>curl http://localhost:11434/api/generate -d '{
  "model": "llama3.1:8b",
  "prompt": "Írj egy rövid történetet egy programozóról.",
  "temperature": 0.7,
  "top_p": 0.9,
  "stream": false
}'</code></pre>

        <h3>Fontos paraméterek</h3>
        <table>
          <thead><tr><th>Paraméter</th><th>Hatás</th><th>Tipikus értékek</th></tr></thead>
          <tbody>
            <tr><td><code>temperature</code></td><td>Kreativitás / véletlenszerűség. Magasabb = változatosabb, de kevésbé pontos.</td><td>0.0–0.3 (precíz) · 0.7 (általános) · 1.0+ (kreatív)</td></tr>
            <tr><td><code>top_p</code></td><td>Núkleus mintavételezés — csak az első P valószínűségű tokenek közül választ.</td><td>0.9 (általános) · 0.5 (konzervatív)</td></tr>
            <tr><td><code>top_k</code></td><td>Maximum K darab token közül választ. Korlátozza a szókincs-szélességet.</td><td>20–40 általános használatra</td></tr>
            <tr><td><code>stream</code></td><td>Tokenenként küldje-e a választ, vagy egyszerre.</td><td><code>true</code> (UX) · <code>false</code> (batch)</td></tr>
            <tr><td><code>num_ctx</code></td><td>Context window mérete tokenekben. Nagyobb = több memória.</td><td>2048–8192 (Ollama default: 2048)</td></tr>
          </tbody>
        </table>

        <div class="compare">
          <div class="compare-card bad">
            <div class="label">temperature: 0.1 — precíz</div>
<pre><code>Prompt: "Mi a főváros?"
→ "Magyarország fővárosa Budapest."
(rövid, faktikus, variáció nélkül)</code></pre>
          </div>
          <div class="compare-card good">
            <div class="label">temperature: 0.9 — kreatív</div>
<pre><code>Prompt: "Mi a főváros?"
→ "Nos, ha Magyarországra gondolsz,
akkor Budapest az a csodás város..."
(hosszabb, stílusosabb, változatosabb)</code></pre>
          </div>
        </div>

        <div class="callout">
          <div class="callout-label">Gyakorlat</div>
          <p>Ugyanarra a promptra hívd meg az API-t <code>temperature: 0.1</code>-gyel és <code>temperature: 0.9</code>-cel 3-3-szor. Figyeld meg: az alacsony hőmérsékletű válaszok mennyire azonosak, a magasak mennyire különböznek.</p>
        </div>
      </section>

      <!-- ── 3. SZINT ── -->
      <section id="ol-3">
        <div class="section-heading">3. szint — Streaming és real-time UX</div>
        <p class="topic-tagline">Cél: modern LLM élmény építése — a felhasználó ne nézzen üres képernyőt.</p>

        <h3>Miért fontos a streaming?</h3>
        <p>Egy 200 tokenes válasz generálása 3–8 másodpercig tarthat. Streaming nélkül a felhasználó üres képernyőt lát, majd egyszerre megjelenik az egész szöveg. Streaminggel az első token ~0.5s után jelenik meg — ugyanolyan érzet, mint a ChatGPT.</p>

        <h3>Python streaming kliens</h3>
<pre data-lang="python"><code><span class="k">import</span> requests, json

<span class="k">def</span> chat_stream(prompt, model=<span class="s">"llama3.1:8b"</span>):
    response = requests.post(
        <span class="s">"http://localhost:11434/api/generate"</span>,
        json={<span class="s">"model"</span>: model, <span class="s">"prompt"</span>: prompt, <span class="s">"stream"</span>: <span class="k">True</span>},
        stream=<span class="k">True</span>
    )
    <span class="k">for</span> line <span class="k">in</span> response.iter_lines():
        <span class="k">if</span> line:
            chunk = json.loads(line)
            print(chunk[<span class="s">"response"</span>], end=<span class="s">""</span>, flush=<span class="k">True</span>)
            <span class="k">if</span> chunk.get(<span class="s">"done"</span>):
                print()  <span class="c"># newline a végén</span>
                break

chat_stream(<span class="s">"Magyarázd el a kontextusablakot egyszerűen."</span>)</code></pre>

        <div class="callout">
          <div class="callout-label">Gyakorlat</div>
          <p>Bővítsd ki a fenti kódot interaktív CLI chat kliensbe: <code>while True</code> loop, felhasználói input, <code>exit</code> kilépés. Opcióként add hozzá a chat history küldését is (messages tömb a <code>/api/chat</code> endpointhoz).</p>
        </div>
      </section>

      <!-- ── 4. SZINT ── -->
      <section id="ol-4">
        <div class="section-heading">4. szint — Tool használat és agent workflow</div>
        <p class="topic-tagline">Cél: az LLM ne csak válaszoljon, hanem „dolgozzon" — döntést hozzon, eszközt hívjon.</p>

        <h3>Az alap minta</h3>
        <p>Az agent loop lényege: a modell <em>nem közvetlenül válaszol</em>, hanem dönt arról, mit tegyen, és az app végrehajtja azt. A ReAct minta (Thought → Action → Observation) lokálisan is ugyanígy működik.</p>

<pre data-lang="text"><code>LLM kap kérdést
   ↓
LLM eldönti: szükséges-e külső adat?
   ↓ igen
Python hív API-t / keres / számol
   ↓
Eredmény visszakerül a kontextusba
   ↓
LLM válaszol a valódi adatok alapján</code></pre>

        <h3>Mini research agent — Python példa</h3>
<pre data-lang="python"><code><span class="k">import</span> requests, json

<span class="k">def</span> get_weather(city: str) -> str:
    <span class="c"># Valódi projektben: pl. wttr.in API</span>
    <span class="k">return</span> <span class="s">f"</span>{city}<span class="s">: 22°C, partly cloudy"</span>

TOOLS = {<span class="s">"get_weather"</span>: get_weather}

SYSTEM = <span class="s">"""Ha időjárást kérdeznek, válaszd az eszközt:
TOOL: get_weather(city)
Egyébként válaszolj közvetlenül."""</span>

<span class="k">def</span> agent(user_input: str):
    prompt = <span class="s">f"</span>{SYSTEM}<span class="s">\n\nUser: </span>{user_input}<span class="s">\nAssistant:"</span>
    res = requests.post(<span class="s">"http://localhost:11434/api/generate"</span>,
                        json={<span class="s">"model"</span>: <span class="s">"llama3.1:8b"</span>, <span class="s">"prompt"</span>: prompt,
                              <span class="s">"stream"</span>: <span class="k">False</span>}).json()
    reply = res[<span class="s">"response"</span>]

    <span class="k">if</span> <span class="s">"TOOL:"</span> <span class="k">in</span> reply:
        <span class="c"># Parse tool call és végrehajtás</span>
        tool_line = [l <span class="k">for</span> l <span class="k">in</span> reply.splitlines() <span class="k">if</span> <span class="s">"TOOL:"</span> <span class="k">in</span> l][0]
        city = tool_line.split(<span class="s">"("</span>)[1].split(<span class="s">")"</span>)[0]
        observation = TOOLS[<span class="s">"get_weather"</span>](city)

        <span class="c"># Második hívás az eredménnyel</span>
        prompt2 = prompt + reply + <span class="s">f"\nObservation: </span>{observation}<span class="s">\nFinal answer:"</span>
        res2 = requests.post(<span class="s">"http://localhost:11434/api/generate"</span>,
                             json={<span class="s">"model"</span>: <span class="s">"llama3.1:8b"</span>, <span class="s">"prompt"</span>: prompt2,
                                   <span class="s">"stream"</span>: <span class="k">False</span>}).json()
        print(res2[<span class="s">"response"</span>])
    <span class="k">else</span>:
        print(reply)

agent(<span class="s">"Milyen az idő Budapesten?"</span>)</code></pre>

        <div class="callout">
          <div class="callout-label">Mini projekt — mini research agent</div>
          <p>Bővítsd az agentet: adj hozzá egy <code>calculate(expr)</code> tool-t (<code>eval()</code>-lal vagy <code>numexpr</code>-rel), és egy <code>search(query)</code> tool-t (pl. DuckDuckGo API). A modell döntse el, melyiket kell használni.</p>
        </div>
      </section>

      <!-- ── 5. SZINT ── -->
      <section id="ol-5">
        <div class="section-heading">5. szint — Docker és deployment</div>
        <p class="topic-tagline">Cél: ne csak lokális legyen — reprodukálható, hordozható szerver.</p>

        <h3>Ollama Dockerben</h3>
<pre data-lang="bash"><code><span class="c"># CPU-only futtatás</span>
docker run -d \
  -v ollama:/root/.ollama \
  -p 11434:11434 \
  --name ollama \
  ollama/ollama

<span class="c"># NVIDIA GPU támogatással</span>
docker run -d --gpus=all \
  -v ollama:/root/.ollama \
  -p 11434:11434 \
  --name ollama \
  ollama/ollama

<span class="c"># Modell letöltése a konténerbe</span>
docker exec -it ollama ollama pull llama3.1:8b</code></pre>

        <h3>Kulcsfogalmak</h3>
        <div class="stack-grid">
          <div class="stack-card">
            <div class="sc-label">Containerization</div>
            <div class="sc-items">Az alkalmazás + függőségei egyetlen képbe csomagolva. Bárhol fut, ami Dockert tud.</div>
          </div>
          <div class="stack-card">
            <div class="sc-label">Port mapping</div>
            <div class="sc-items"><code>-p 11434:11434</code> — a host 11434-es portja a konténer 11434-esére mutat. Nélküle nem érhető el kívülről.</div>
          </div>
          <div class="stack-card">
            <div class="sc-label">Persistent storage</div>
            <div class="sc-items"><code>-v ollama:/root/.ollama</code> — a letöltött modellek megmaradnak, ha a konténert leállítod.</div>
          </div>
        </div>

        <div class="callout">
          <div class="callout-label">Gyakorlat</div>
          <p>Indítsd el az Ollama konténert, tölts le egy modellt, és hívd meg a Python kliensedből. Ellenőrizd, hogy a modell fájl megmarad-e konténer restart után (<code>docker restart ollama</code>).</p>
        </div>
      </section>

      <!-- ── 6. SZINT ── -->
      <section id="ol-6">
        <div class="section-heading">6. szint — Security és production gondolkodás</div>
        <p class="topic-tagline">Cél: ne legyen véletlenül nyitott AI szervered az interneten.</p>

        <h3>A veszély</h3>
        <p>Az Ollama alapból <code>127.0.0.1:11434</code>-en hallgat — ez <strong>csak lokálisan elérhető</strong>, biztonságos. Ha viszont <code>0.0.0.0</code>-ra nyitod (pl. Docker default), bárki az interneten hívhatja a modelleidet — autentikáció nélkül, számlád terhére.</p>

<pre data-lang="bash"><code><span class="c"># Veszélyes — mindenki eléri a hálózatról</span>
docker run -p 0.0.0.0:11434:11434 ollama/ollama

<span class="c"># Biztonságos — csak localhost éri el</span>
docker run -p 127.0.0.1:11434:11434 ollama/ollama</code></pre>

        <h3>Nginx reverse proxy (autentikációval)</h3>
<pre data-lang="nginx"><code>server {
    listen 443 ssl;
    server_name ai.sajatdomain.hu;

    <span class="c"># Basic Auth — egyszerű védelem</span>
    auth_basic "AI Server";
    auth_basic_user_file /etc/nginx/.htpasswd;

    location / {
        proxy_pass http://127.0.0.1:11434;
        proxy_set_header Host $host;
    }
}</code></pre>

        <div class="callout danger">
          <div class="callout-label">Production checklist</div>
          <p>
            <strong>✓</strong> Ollama csak 127.0.0.1-en hallgat ·
            <strong>✓</strong> Nginx/Caddy reverse proxy HTTPS-sel ·
            <strong>✓</strong> API key vagy Basic Auth ·
            <strong>✓</strong> Rate limiting (pl. <code>limit_req_zone</code>) ·
            <strong>✓</strong> Logok figyelése (kik hívják, milyen promptokkal)
          </p>
        </div>
      </section>

      <!-- ── 7. SZINT ── -->
      <section id="ol-7">
        <div class="section-heading">7. szint — Performance és optimalizáció</div>
        <p class="topic-tagline">Cél: értsd, miért lassú vagy gyors — és mit tudsz rajta változtatni.</p>

        <h3>A négy kulcstényező</h3>
        <div class="stack-grid">
          <div class="stack-card">
            <div class="sc-label">Modell méret</div>
            <div class="sc-items">3B → ~30 tok/s · 8B → ~15 tok/s · 70B → ~3 tok/s (CPU-n). Minőség vs sebesség trade-off.</div>
          </div>
          <div class="stack-card">
            <div class="sc-label">GPU vs CPU</div>
            <div class="sc-items">GPU: 10–50× gyorsabb az inference. CPU-n az 8B modell is 5–15 tok/s alatt marad.</div>
          </div>
          <div class="stack-card">
            <div class="sc-label">VRAM limit</div>
            <div class="sc-items">Ha a modell nem fér GPU-ra, CPU offloadra vált — drámaian lassabb. Cél: modell + KV cache beleférjen.</div>
          </div>
          <div class="stack-card">
            <div class="sc-label">Context window</div>
            <div class="sc-items">Nagyobb <code>num_ctx</code> → több VRAM a KV cache-nek. 8192 token ~2× annyi memória, mint 4096.</div>
          </div>
        </div>

        <h3>Latency mérés Pythonban</h3>
<pre data-lang="python"><code><span class="k">import</span> requests, time, json

<span class="k">def</span> benchmark(model: str, prompt: str) -> dict:
    start = time.perf_counter()
    res = requests.post(<span class="s">"http://localhost:11434/api/generate"</span>,
                        json={<span class="s">"model"</span>: model, <span class="s">"prompt"</span>: prompt,
                              <span class="s">"stream"</span>: <span class="k">False</span>}).json()
    elapsed = time.perf_counter() - start
    tokens = res.get(<span class="s">"eval_count"</span>, 0)
    <span class="k">return</span> {
        <span class="s">"model"</span>: model,
        <span class="s">"tokens"</span>: tokens,
        <span class="s">"seconds"</span>: round(elapsed, 2),
        <span class="s">"tok_per_sec"</span>: round(tokens / elapsed, 1)
    }

<span class="k">for</span> m <span class="k">in</span> [<span class="s">"llama3.2:3b"</span>, <span class="s">"llama3.1:8b"</span>]:
    print(benchmark(m, <span class="s">"Explain transformers in 3 sentences."</span>))</code></pre>

        <div class="callout">
          <div class="callout-label">Gyakorlat</div>
          <p>Mérd meg a small és large modell latency-jét ugyanarra a promptra. Próbáld ki ugyanezt <code>num_ctx: 512</code> és <code>num_ctx: 4096</code> beállítással — látod-e a különbséget az első token megjelenési idejében?</p>
        </div>
      </section>

      <!-- ── 8. SZINT ── -->
      <section id="ol-8">
        <div class="section-heading">8. szint — Debugging és hibakezelés</div>
        <p class="topic-tagline">Cél: ne akadj el — ismerd fel és javítsd a leggyakoribb hibákat.</p>

        <h3>Tipikus hibák és megoldásuk</h3>
        <table>
          <thead><tr><th>Hiba</th><th>Ok</th><th>Megoldás</th></tr></thead>
          <tbody>
            <tr>
              <td><code>model not found</code></td>
              <td>A modell nincs letöltve, vagy elírás a névben.</td>
              <td><code>ollama pull &lt;model&gt;</code> először. <code>ollama list</code>-tel ellenőrizd a pontos nevet.</td>
            </tr>
            <tr>
              <td><code>connection refused</code></td>
              <td>Az Ollama szerver nem fut.</td>
              <td><code>ollama serve</code> kézzel, vagy <code>systemctl start ollama</code>. Ellenőrizd: <code>curl localhost:11434</code>.</td>
            </tr>
            <tr>
              <td>Port conflict</td>
              <td>A 11434-es port már foglalt.</td>
              <td><code>lsof -i :11434</code> — melyik folyamat foglalja. <code>OLLAMA_HOST=0.0.0.0:11435</code> env változóval más port.</td>
            </tr>
            <tr>
              <td>Lassú inference</td>
              <td>CPU offload, nagy context, kvantálás hiánya.</td>
              <td>Kisebb modell (<code>:3b</code>), kisebb <code>num_ctx</code>, GPU-s gépen <code>ollama ps</code>-sel nézd, mennyi réteg van GPU-n.</td>
            </tr>
            <tr>
              <td>Memory overflow / OOM</td>
              <td>A modell + KV cache nem fér VRAM-ba.</td>
              <td>Kisebb kvantálás (<code>:q4_0</code>), kisebb context, vagy CPU offload (<code>OLLAMA_NUM_GPU=0</code>).</td>
            </tr>
          </tbody>
        </table>

        <h3>Debug tippek</h3>
<pre data-lang="bash"><code><span class="c"># Ollama szerver logjai (Linux)</span>
journalctl -u ollama -f

<span class="c"># Futó modell és GPU kihasználtság</span>
ollama ps
nvidia-smi  <span class="c"># NVIDIA GPU</span>

<span class="c"># API közvetlen tesztelés</span>
curl http://localhost:11434/api/tags  <span class="c"># elérhető modellek</span>
curl http://localhost:11434/         <span class="c"># szerver él-e</span></code></pre>

        <div class="callout warning">
          <div class="callout-label">Gyakorlat</div>
          <p>Szándékosan hibás setupot csinálj: hívj egy nem létező modellt, állítsd le az Ollama szervert és hívd az API-t, adj meg hatalmas <code>num_ctx</code> értéket. Nézd meg a hibaüzeneteket és gyakorold a diagnosztikát.</p>
        </div>
      </section>

      <!-- ── 9. SZINT ── -->
      <section id="ol-9">
        <div class="section-heading">9. szint — Full developer workflow projekt</div>
        <p class="topic-tagline">Cél: mindent összekötni — egy production-közelű lokális AI asszisztens.</p>

        <h3>Local AI Dev Assistant — architektúra</h3>
<pre data-lang="text"><code>CLI / Web UI  (Rich / Gradio / egyszerű HTML)
   ↓
FastAPI réteg  (streaming, model switch, tool routing)
   ↓
Ollama server  (localhost:11434)
   ↓
Tools  (web search, fájlok, scriptek, calc)</code></pre>

        <h3>Funkciók és implementáció</h3>
        <div class="stack-grid">
          <div class="stack-card">
            <div class="sc-label">Streaming chat</div>
            <div class="sc-items">FastAPI <code>StreamingResponse</code> + Ollama <code>stream: true</code>. Frontend Server-Sent Events (SSE)-sel olvassa.</div>
          </div>
          <div class="stack-card">
            <div class="sc-label">Model switch</div>
            <div class="sc-items">API paraméterként átadható a modell neve. Egy dropdown a UI-ban, ami azonnal vált.</div>
          </div>
          <div class="stack-card">
            <div class="sc-label">Tool integráció</div>
            <div class="sc-items">ReAct loop Pythonban: LLM válasza parse-olva, tool meghívva, observation visszaadva.</div>
          </div>
          <div class="stack-card">
            <div class="sc-label">Docker deploy</div>
            <div class="sc-items"><code>docker-compose.yml</code>: Ollama + FastAPI két service-ként, shared network.</div>
          </div>
          <div class="stack-card">
            <div class="sc-label">Logging</div>
            <div class="sc-items">Minden kérés logolva: timestamp, model, prompt hash, token count, latency.</div>
          </div>
          <div class="stack-card">
            <div class="sc-label">Chat history</div>
            <div class="sc-items">Messages tömb session-önként — <code>/api/chat</code> endpoint a multi-turn párbeszédhez.</div>
          </div>
        </div>

        <h3>Docker Compose példa</h3>
<pre data-lang="yaml"><code>services:
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
  ollama_data:</code></pre>
      </section>

      <!-- VÉGSŐ CÉLKÉP -->
      <section class="topic" style="margin-bottom:40px" id="ol-summary">
        <span class="topic-marker">&lt;SUMMARY&gt;</span>
        <h2>A tanulási út végére <em>ezt tudod</em></h2>
        <div class="stack-grid">
          <div class="stack-card"><div class="sc-label">0–1. szint</div><div class="sc-items">Lokális LLM futtatás · Modellek kezelése · Mental model</div></div>
          <div class="stack-card"><div class="sc-label">2–3. szint</div><div class="sc-items">API kontroll · Paraméterezés · Streaming UX</div></div>
          <div class="stack-card"><div class="sc-label">4. szint</div><div class="sc-label" style="margin-top:4px">Agent workflow</div><div class="sc-items">Tool calling · ReAct loop · Mini research agent</div></div>
          <div class="stack-card"><div class="sc-label">5–6. szint</div><div class="sc-items">Docker deployment · Production security · Nginx proxy</div></div>
          <div class="stack-card"><div class="sc-label">7–8. szint</div><div class="sc-items">Performance tuning · Debug & observability</div></div>
          <div class="stack-card"><div class="sc-label">9. szint</div><div class="sc-items">Full stack Local AI Dev Assistant · Minden összekötve</div></div>
        </div>
      </section>

      <div class="page-footer">
        <span>AI Hub · Lokális LLM</span>
        <span>Ollama · Összeállítva 2026 júniusában</span>
      </div>

:::
