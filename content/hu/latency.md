---
page: latency
title: Latency
sidebar_groups:
  - Elmélet
  - Négy nézőpont
  - Mérés
  - Technikák
  - Referencia
hero:
  eyebrow: "Latency · Fejlesztői Tanulási Terv"
  title: "<em>Latency</em>"
  lead: "„Lassú a modell” valójában legalább három különböző dolgot jelenthet. A TTFT, az ITL és a total completion time közti különbség, hogyan méri ezt a fejlesztő, hogyan érzi a felhasználó, és mit jelent ez üzletileg. Épít a <em>hardver</em>, a <em>dense/MoE</em>, a <em>KV-cache</em> és a <em>model routing</em> tutorialokra."
  stats:
    - { val: "8", lbl: "Szakasz" }
    - { val: "4", lbl: "Nézőpont" }
    - { val: "2", lbl: "Feladat" }
    - { val: "P99", lbl: "Ne átlagot mérj" }
footer:
  left: "AI Hub · Latency"
  right: "Latency · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#lat-0"><div class="tc-num">0. rész</div><div class="tc-name">Miért nem egy szám?</div><div class="tc-desc">TTFT, ITL/TPOT, total — három eltérő dolog.</div></a>
  <a class="toc-card" href="#lat-1"><div class="tc-num">1. rész</div><div class="tc-name">A színfalak mögött</div><div class="tc-desc">Queue, prefill, decode — mi hol telik.</div></a>
  <a class="toc-card" href="#lat-2"><div class="tc-num">2. rész</div><div class="tc-name">Mit befolyásolja?</div><div class="tc-desc">Modell, kontextus, hálózat, routing.</div></a>
  <a class="toc-card" href="#lat-3"><div class="tc-num">Feladat 1</div><div class="tc-name">Mérd a sajátod</div><div class="tc-desc">TTFT/ITL mérés, percentilisekkel.</div></a>
  <a class="toc-card" href="#lat-4"><div class="tc-num">3. rész</div><div class="tc-name">Négy nézőpont</div><div class="tc-desc">Felhasználó, fejlesztő, UX, üzlet.</div></a>
  <a class="toc-card" href="#lat-5"><div class="tc-num">4. rész</div><div class="tc-name">Konkrét küszöbök</div><div class="tc-desc">Hang, kód, chat, batch — más-más elvárás.</div></a>
  <a class="toc-card" href="#lat-6"><div class="tc-num">5. rész</div><div class="tc-name">Helyes mérés</div><div class="tc-desc">Percentilis, ne átlag; SLO és error budget.</div></a>
  <a class="toc-card" href="#lat-7"><div class="tc-num">6. rész</div><div class="tc-name">Csökkentési technikák</div><div class="tc-desc">Streaming, speculative decoding, caching.</div></a>
</div>
::::::

:::::: section id=lat-0 heading="0. rész — Miért nem egy szám a latency?" nav="0. rész" group="Elmélet"

<p class="topic-tagline">Cél: lásd, hogy „lassú a modell" legalább három eltérő mérést takarhat.</p>

### Három eltérő dolog, amit összekeverünk

Amikor valaki azt mondja, „lassú ez a chatbot", legalább háromféle problémára gondolhat:

::::: stack-grid
:::: card label="TTFT — Time To First Token"
Mennyi idő telik el a kérés elküldésétől az **első** token megjelenéséig. Ez a „él ez a dolog?" érzés — ha ez lassú, a felhasználó azt hiszi, elakadt a rendszer.
::::
:::: card label="ITL / TPOT — token-köztes késleltetés"
Az egymást követő tokenek közti idő (Inter-Token Latency, más néven Time Per Output Token). Ez határozza meg, mennyire **folyamatosan** ömlik a szöveg, miután elindult.
::::
:::: card label="Total completion time"
A teljes válasz ideje az első kéréstől az utolsó tokenig. Ez az, amit egy batch-feldolgozásnál vagy egy API-integrációnál a végső határidő szempontjából mérsz.
::::
:::::

### Miért számít a megkülönböztetés?

Egy konkrét, meglepő tény: **egy 500 tokenes válasz 40 ms-os ITL-lel összesen 20 másodpercet vesz igénybe** — ami rémesen hangzik. De ha a TTFT ebből csak 300 ms, a felhasználó **már a fél másodperc után olvas**, és a teljes idő alatt aktívan konzumálja a szöveget. Ezzel szemben egy 2 másodperces TTFT, amit egy azonnali, egyben kiírt válasz követ, **rosszabbnak érződik**, még ha a teljes idő azonos is. A teljes latency-t optimalizálni a TTFT figyelmen kívül hagyásával **a rossz számot optimalizálod**.

![Egy kérés időzítése: queue, prefill, TTFT, majd decode-fázis token-köztes réssel](assets/lat-01-timeline.jpg)

::::: callout label="Egy mondatban"
**A TTFT az, amit a felhasználó ELŐSZÖR érez; az ITL az, amit a folyamat KÖZBEN érez.** A kettő más okból lassul, és más technika javítja — ezért kell külön mérned és külön optimalizálnod őket.
:::::
::::::

:::::: section id=lat-1 heading="1. rész — A színfalak mögött: queue, prefill, decode" nav="1. rész" group="Elmélet"

<p class="topic-tagline">Cél: értsd, technikailag mi történik a kérés elküldése és az első token között.</p>

### A TTFT három összetevője

A TTFT nem egyetlen lépés, hanem három egymást követő szakasz összege:

::::: stack-grid
:::: card label="1 · Hálózat + sorban állás (queue)"
A kérés eljut a szerverig, és ott várakozik, amíg egy GPU-slot felszabadul. Csúcsterhelésnél ez a szakasz **drasztikusan** megnyúlhat — egy frontier modell p95 sor-ideje csúcsidőben 200 ms-ról 2 másodpercre ugorhat, anélkül hogy a modell maga változna.
::::
:::: card label="2 · Prefill — a prompt feldolgozása"
A modell egyszerre dolgozza fel a **teljes bemenő promptot**, és felépíti a KV-cache-t. Ez az a fázis, amit a **KV-cache tutorial** 2. része „prefill"-ként tárgyal. Minél hosszabb a prompt, annál tovább tart — egy 4K-ról 12K tokenre nőtt prompt **duplázhatja-triplázhatja** a prefill-időt.
::::
:::: card label="3 · Az első decode-lépés"
A modell legenerálja az első kimeneti tokent. Ez az a pillanat, amit a TTFT mér — innentől a folyamat átvált **decode**-ra, és az ITL/TPOT lesz a releváns mérőszám.
::::
:::::

### A decode-fázis: miért más a fizikája

A **hardver tutorial** és a **KV-cache tutorial** már levezette: a decode memória-sávszélesség-kötött — minden lépésben a teljes modellsúlyt (vagy a MoE esetén az aktív expertekét) végig kell mozgatni a memóriából a számító egységekbe, **egyetlen új token kedvéért**. Ez az oka, hogy a decode sebessége (ITL) elsősorban a GPU memória-sávszélességétől függ, nem a nyers számítási teljesítménytől.

::::: callout warning label="A TTFT-t ritkán a modell rontja el"
Ha a mért TTFT több másodperc, a hiba **majdnem sosem** a modell választásában van — hanem a saját pipeline-odban: túl hosszú, kompressziót nem kapott prompt, rosszul konfigurált queue, vagy egy routing-döntés, ami egy túlterhelt, olcsóbb modellre küldte a kérést. A 2026-os leggyorsabb API-k (pl. Gemini Flash-szerű, Claude Haiku-szerű modellek) jellemzően 600 ms alatt tartják a TTFT-t közepes hosszú prompton — ez a te "padlód" egy interaktív funkciónál. Ha a sajátod ennél sokkal magasabb, ne a modellt hibáztasd, nézd a saját pipeline-od minden lépését.
:::::
::::::

:::::: section id=lat-2 heading="2. rész — Mit befolyásolja a latency-t?" nav="2. rész" group="Elmélet"

<p class="topic-tagline">Cél: kösd össze a korábbi tutorialjaid tudását — mindegyik hozzátesz egy tényezőt.</p>

### A tényezők, és hogy melyik korábbi tutorialhoz tartoznak

::::: stack-grid
:::: card label="Modell architektúra"
Egy MoE modell tokenenként kevesebb paramétert aktivál, mint egy hasonló *total* méretű dense modell — ez közvetlenül gyorsabb decode-ot (jobb ITL) ad. Lásd: **dense vs. MoE tutorial**.
::::
:::: card label="Kontextushossz és KV-cache"
Hosszabb kontextus → nagyobb KV-cache → minden decode-lépés több memóriát mozgat → romló ITL. 128K+ kontextusnál ez a hatás drámai. Lásd: **KV-cache tutorial**, 3. rész.
::::
:::: card label="GPU / hardver"
A memória-sávszélesség (GB/s) közvetlenül meghatározza az elérhető ITL-t; a VRAM-kapacitás azt, fut-e egyáltalán a modell helyben. Lásd: **hardver tutorial**.
::::
:::: card label="Routing-döntés"
Ha egy kérést egy olcsóbb, de éppen túlterhelt modellhez irányítasz, a TTFT megugrik — a megtakarítás árat kaphat latency-ben. Lásd: **model routing tutorial**.
::::
:::: card label="Hálózat / régió / provider queue"
A géptől a szerverig tartó út és a szerver oldali várakozás — ezt a saját modelledtől függetlenül a deployment régiója és a szolgáltató terhelése dönti el.
::::
:::: card label="Batch-méret / egyidejű kérések"
Több egyidejű kérés kiszolgálása (continuous batching) növeli az összesített áteresztőképességet (throughput), de egyetlen kérés latency-jét ronthatja — ez a throughput vs. latency alapvető feszültsége.
::::
:::::

::::: callout label="A throughput vs. latency feszültség"
Egy szolgáltatás **áteresztőképessége** (hány kérést szolgál ki másodpercenként összesen) és egyetlen kérés **latency-je** gyakran ellentétes irányba mutat: a nagyobb batch jobb GPU-kihasználtságot (jobb throughput) ad, de egy adott kérés tovább várhat a sorban. Ezt a feszültséget explicit tervezni kell — nem "véletlenül" oldódik meg.
:::::
::::::

:::::: section id=lat-3 heading="Feladat 1 — Mérd a saját latency-det" nav="Feladat 1" group="Mérés"

<p class="topic-tagline">Cél: mérd meg a TTFT-t és az ITL-t valós hívásokon, ne csak elméletben ismerd őket.</p>

### Python — TTFT és ITL mérése streaming API-hívással

```python
import time
import anthropic

client = anthropic.Anthropic()

def measure_streaming(prompt, model="claude-sonnet-5"):
    start = time.perf_counter()
    first_token_time = None
    token_times = []

    with client.messages.stream(
        model=model, max_tokens=300,
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        for event in stream.text_stream:
            now = time.perf_counter()
            if first_token_time is None:
                first_token_time = now
            token_times.append(now)

    ttft = first_token_time - start
    # ITL: az egymást követő token-érkezések közti átlagos rés
    gaps = [t2 - t1 for t1, t2 in zip(token_times, token_times[1:])]
    avg_itl = sum(gaps) / len(gaps) if gaps else 0

    return {"ttft_ms": ttft * 1000, "avg_itl_ms": avg_itl * 1000,
            "total_s": token_times[-1] - start, "n_chunks": len(token_times)}

result = measure_streaming("Magyarázd el röviden, mi az a transformer architektúra.")
print(f"TTFT: {result['ttft_ms']:.0f} ms")
print(f"Átlagos ITL: {result['avg_itl_ms']:.1f} ms/chunk")
print(f"Teljes idő: {result['total_s']:.2f} s")
```

::::: callout label="Gyakorlat"
Futtasd le a mérést **20-30 alkalommal**, különböző prompt-hosszakkal (rövid vs. hosszú kontextus), és gyűjtsd össze a TTFT-értékeket egy listába. A 6. részben ugyanezt a listát fogod percentilisek szerint kiértékelni — ne dobd el az adatot.
:::::
::::::

:::::: section id=lat-4 heading="3. rész — Négy nézőpont: kinek mit jelent a latency?" nav="3. rész" group="Négy nézőpont"

<p class="topic-tagline">Cél: lásd, hogy ugyanaz a szám mást jelent attól függően, ki néz rá — ahogy a költség-optimalizációnál is.</p>

### A négy szereplő

::::: stack-grid
:::: card label="Végfelhasználó — érzékelt sebesség"
A felhasználót **nem** az objektív milliszekundum-szám érdekli, hanem az **érzés**. A streaming trükkje pont ez: egy 300 ms-os TTFT után induló, folyamatosan érkező válasz gyorsabbnak *érződik*, mint egy 2 másodperc után egyben megjelenő, azonos hosszú válasz — a percepció, nem a matek dönt. A felhasználó a várakozás **alatt** olvas, nem utána.
::::
:::: card label="Fejlesztő — mérés és optimalizáció"
A fejlesztő dolga a **P50/P95/P99 TTFT és ITL** mérése (6. rész), a pipeline minden lépésének (prompt-méret, routing, cache-találat) hatásának izolálása, és a megfelelő technika (7. rész) kiválasztása. Az ő nézőpontjából a latency egy **optimalizálható metrika-halmaz**.
::::
:::: card label="Termék / UX-tervező — mikor kritikus"
A UX-tervező azt dönti el, **melyik interakció** mennyire latency-érzékeny. Egy chat-mező elviseli a fél másodperces TTFT-t; egy hangalapú asszisztens beszéd-közbeni szünete 300 ms felett már zavaró; egy kód-kiegészítő eszköz csak ~100 ms alatt érződik "beépültnek". A UX-döntés: hol éri meg latency-t "vásárolni" UI-trükkökkel (skeleton loading, streaming, optimista UI), és hol kell tényleg gyorsabb backend.
::::
:::: card label="Üzleti / enterprise — SLA és kockázat"
A vállalati nézőpont **SLA-vállalásban és error budget-ben** gondolkodik: "a kéréseink 99%-a fusson le X ms alatt". Ez határozza meg a régió-választást, a redundancia-tervezést, és azt, mennyi latency-büdzsét "költhet el" egy komplex, több lépéses agent-pipeline anélkül, hogy az SLA-t megszegné. Lásd a **model routing tutorial** vállalati nézőpontját — a latency és a költség itt is ugyanúgy összefonódik.
::::
:::::

::::: callout warning label="A négy nézőpont itt is ütközhet"
A fejlesztő a legalacsonyabb átlag-latency-t akarja; az üzlet a **kiszámítható** (alacsony szórású) latency-t, még ha az átlag magasabb is; a UX-tervező a *látszatot*, nem a valóságot optimalizálja; a felhasználó pedig egyszerűen türelmetlen. Egy jó rendszer mind a négyet kiszolgálja: stabil P99 (üzlet), mérhető és javítható pipeline (fejlesztő), streaming-alapú percepció-kezelés (UX), és tényleg gyors válasz ott, ahol számít (felhasználó).
:::::
::::::

:::::: section id=lat-5 heading="4. rész — Konkrét küszöbök: mikor mennyi a sok?" nav="4. rész" group="Négy nézőpont"

<p class="topic-tagline">Cél: konkrét, kézzelfogható számok — más-más felhasználási mód más-más elvárást szab.</p>

### A használati esetek és a rájuk jellemző TTFT-küszöb

| Használati eset | Jellemző TTFT-küszöb | Miért ilyen szigorú/lazsa |
|---|---|---|
| **Kód-kiegészítés** (pl. inline AI-javaslat) | ~100 ms alatt | A javaslatnak "beépültnek" kell érződnie a gépelésbe — felette a felhasználó már nem várja meg, tovább gépel. |
| **Hangalapú asszisztens** (turn-taking) | ~150-300 ms alatt | Ember-ember beszélgetésben ennél hosszabb szünet már zavaróan "gépi" — ez a **legszigorúbb** interaktív küszöb. |
| **Chat / interaktív szöveg** | ~300-800 ms alatt | A streaming miatt ez elviselhető: a felhasználó rögtön olvasni kezd, amint elindul a válasz. |
| **Keresés/RAG-válasz egy alkalmazásban** | ~1-2 másodperc alatt | Elfogadott egy rövid "gondolkodási" szünet, ha a végeredmény releváns. |
| **Batch / aszinkron feldolgozás** | Nincs valós idejű elvárás | Itt a **total completion time** és a költség (lásd **model routing tutorial**, Batch API) a releváns szempont, nem a TTFT. |

::::: callout label="A reasoning-mód kilóg"
Ha egy modell "gondolkodó" (extended thinking / reasoning) módban fut, a TTFT **5-30×-ára** is megnőhet a normál módhoz képest, mert a látható válasz előtt egy hosszabb, rejtett érvelési szakasz zajlik. Ez nem hiba — de a UX-nek **jeleznie kell** a felhasználó felé (pl. "gondolkodom..." indikátor), különben a hosszú csend elakadásnak tűnik.
:::::
::::::

:::::: section id=lat-6 heading="5. rész — Helyes mérés: percentilis, ne átlag" nav="5. rész" group="Mérés"

<p class="topic-tagline">Cél: tudd, miért hazudik az átlag, és mit mérj helyette.</p>

### Az átlag elrejti a rossz napokat

Ha 100 kérésből 95 gyors (200 ms) és 5 nagyon lassú (5000 ms), az **átlag** ~440 ms — ártalmatlannak tűnik. De az az 5 felhasználó, aki az 5 másodperces választ kapta, **rossz élményt** él át, és ez az átlagban elvész. A percentilis-alapú mérés pont ezt a "farkot" teszi láthatóvá:

| Metrika | Mit mutat |
|---|---|
| **P50 (medián)** | A "tipikus" kérés — a kérések fele ennél gyorsabb. |
| **P95** | A kérések 95%-a ennél gyorsabb — ez már a "rossz eseteket" is belengeti. |
| **P99** | A kérések 99%-a ennél gyorsabb — a valódi tail-latency, amit egy SLA-nál vállalsz. |

### SLO és error budget — az üzleti nézőpont eszköze

Egy jól definiált latency-cél nem "legyen gyors", hanem konkrét, mérhető SLO (Service Level Objective), pl.: **"TTFT P99 ≤ 200 ms és a teljes válasz (E2EL) P99 ≤ 3000 ms"**. Az SLO ad **hasznot** is: kapacitás-tervezéshez viszonyítási pontot, autoscaling-triggert, és egy "error budget"-et — ha a P99 sorozatosan sérti a küszöböt, az jelzés, hogy több kapacitás vagy más architektúra kell, nem csak "várjunk és lássuk".

```python
import numpy as np

# a Feladat 1-ben gyűjtött TTFT-értékek listája (ms-ban)
ttft_samples = [180, 210, 195, 640, 205, 190, 2100, 220, 200, 185]  # példa

p50 = np.percentile(ttft_samples, 50)
p95 = np.percentile(ttft_samples, 95)
p99 = np.percentile(ttft_samples, 99)

print(f"P50: {p50:.0f} ms   P95: {p95:.0f} ms   P99: {p99:.0f} ms")
print(f"Átlag: {np.mean(ttft_samples):.0f} ms  ← ez most hazudik, nézd a P99-et!")
```

::::: callout warning label="Gyakorlat"
Futtasd a fenti kódot a Feladat 1-ben gyűjtött saját TTFT-mintáidra. Hasonlítsd össze az átlagot a P95/P99-cel — minél nagyobb a rés köztük, annál "farkosabb" (kiugrásokkal terhelt) a te eloszlásod, és annál fontosabb lenne kideríteni, mi okozza a ritka, nagyon lassú kéréseket (queue? hosszú prompt? routing egy túlterhelt modellre?).
:::::
::::::

:::::: section id=lat-7 heading="6. rész — Csökkentési technikák" nav="6. rész" group="Technikák"

<p class="topic-tagline">Cél: ismerd a bevált eszközöket — melyik a TTFT-t, melyik az ITL-t javítja.</p>

### A technikák és melyik metrikára hatnak

::::: stack-grid
:::: card label="Streaming (percepciós trükk)"
Nem csökkenti a nyers időt, de **átalakítja az érzékelt** latency-t: a felhasználó a TTFT után rögtön olvashat, ahelyett hogy a teljes generálás végéig várna. Majdnem mindig érdemes bekapcsolni interaktív felületeken.
::::
:::: card label="Speculative decoding"
Egy kicsi, gyors "draft" modell előre jósol több tokent, amit a nagy modell egy lépésben ellenőriz/elfogad — ez az **ITL**-t javítja érdemben, extra minőségvesztés nélkül. 2026-ra a self-speculative variánsok (pl. SWIFT) külön draft-modell nélkül, réteg-kihagyással érik el ugyanezt.
::::
:::: card label="Prompt / prefix caching"
Az ismétlődő prompt-részek (rendszer-prompt, hosszú, változatlan kontextus-eleje) cache-elt KV-állapotát újrahasznosítja — ez a **prefill**-időt, tehát közvetve a **TTFT**-t rövidíti. Lásd: **KV-cache tutorial**, 6. rész.
::::
:::: card label="Kisebb modell / routing"
Egy kisebb vagy MoE-architektúrájú modellre irányítás javítja mind a TTFT-t, mind az ITL-t — ára a minőség-kompromisszum, amit a **model routing tutorial** cascade-mintája kezel.
::::
:::: card label="Continuous batching (PagedAttention)"
A szolgáltatás-oldali áteresztőképességet növeli anélkül, hogy egyetlen kérés latency-jét aránytalanul rontaná — ez a **hardver tutorial** PagedAttention részének közvetlen gyakorlati haszna.
::::
:::: card label="FP8 KV-cache kvantálás"
Felezi a KV-cache memória-lábnyomát, ami duplázhatja az egyidejűleg kiszolgálható kérések számát ugyanazon a hardveren érdemi pontosságvesztés nélkül — közvetve javítja a terhelés alatti P95/P99 TTFT-t.
::::
:::::

### Párhuzamosítás agent-workflow-knál

Ha egy agent **egymás után** hív 5 eszközt, az 5 latency **összeadódik**. Ha a hívások függetlenek egymástól, **párhuzamosítva** (aszinkron, egyszerre elindítva) a teljes idő a leglassabb hívás idejére csökken, nem az összegre. Ez egyike a legnagyobb, legegyszerűbben elérhető latency-javításnak agentic rendszereknél — gyakran több nyereséget ad, mint bármelyik modell-szintű optimalizáció.

::::: callout danger label="Amit ne csinálj"
**✗** Csak a total completion time-ot mérni, a TTFT-t figyelmen kívül hagyva · **✗** Átlaggal jellemezni a latency-t (5. rész) · **✗** Reasoning-módot bekapcsolni UX-jelzés nélkül, ahol a felhasználó azt hiheti, elakadt a rendszer · **✗** Szekvenciális tool-hívásokat párhuzamosítás nélkül hagyni egy agent-pipeline-ban · **✗** Egyetlen régióra/providerre támaszkodni ott, ahol a queue-idő kritikus.
:::::
::::::

:::::: section id=lat-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A tutorial végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0–1. rész"
TTFT vs. ITL/TPOT vs. total · queue, prefill, decode fázisok
::::
:::: card label="2. rész + Feladat 1"
Mi befolyásolja (modell, kontextus, hardver, routing) · saját mérés streaminggel
::::
:::: card label="3–4. rész"
Négy nézőpont: felhasználó, fejlesztő, UX, üzlet · konkrét küszöbök használati esetenként
::::
:::: card label="5. rész"
P50/P95/P99 · miért hazudik az átlag · SLO és error budget
::::
:::: card label="6. rész"
Streaming · speculative decoding · prefix caching · routing · párhuzamos tool-hívások
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>hardver</em> (sávszélesség = ITL), a <em>dense vs. MoE</em> (aktív paraméter = gyorsabb decode), a <em>KV-cache</em> (prefill és prefix caching) és a <em>model routing</em> (a latency/költség kompromisszum) tutorialok.</p>
::::::
