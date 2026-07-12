---
page: hardware
title: Hardveres alapok — GPU, VRAM, CUDA
sidebar_groups:
  - Elmélet
  - VRAM-matek
  - Szoftverréteg
  - Gyakorlat
  - Referencia
hero:
  eyebrow: "Hardver · Fejlesztői Tanulási Terv"
  title: "Hardveres alapok — <em>GPU, VRAM, CUDA</em>"
  lead: "Miért a GPU futtat egy LLM-et, mit tárol pontosan a VRAM, és hogyan számold ki előre, befér-e egy modell a kártyádba. NVIDIA vs. AMD, CUDA vs. ROCm, és a modellméret → VRAM képlet, ami a <em>dense/MoE</em> és a <em>KV-cache</em> tutorialok alapja."
  stats:
    - { val: "10", lbl: "Szakasz" }
    - { val: "4", lbl: "Feladat" }
    - { val: "1", lbl: "Ábra" }
    - { val: "GB/param", lbl: "A flagship képlet" }
footer:
  left: "AI Hub · Hardveres alapok"
  right: "Hardver · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#hw-0"><div class="tc-num">0. rész</div><div class="tc-name">Miért a GPU?</div><div class="tc-desc">Párhuzamosítás vs. CPU, a szűk keresztmetszet.</div></a>
  <a class="toc-card" href="#hw-1"><div class="tc-num">1. rész</div><div class="tc-name">Mi van a VRAM-ban?</div><div class="tc-desc">Súlyok, KV-cache, aktivációk, overhead.</div></a>
  <a class="toc-card" href="#hw-2"><div class="tc-num">Feladat 1</div><div class="tc-name">A saját GPU-d</div><div class="tc-desc">nvidia-smi / rocm-smi / Aktivitásfigyelő.</div></a>
  <a class="toc-card" href="#hw-3"><div class="tc-num">2. rész</div><div class="tc-name">Kvantálás</div><div class="tc-desc">Bájt/paraméter minden precizitásnál.</div></a>
  <a class="toc-card" href="#hw-4"><div class="tc-num">3. rész</div><div class="tc-name">A VRAM-képlet</div><div class="tc-desc">A flagship számítás, worked example.</div></a>
  <a class="toc-card" href="#hw-5"><div class="tc-num">Feladat 2</div><div class="tc-name">Számold ki</div><div class="tc-desc">3 modell, 3 kvantálás, a te GPU-dhoz.</div></a>
  <a class="toc-card" href="#hw-6"><div class="tc-num">4. rész</div><div class="tc-name">A MoE csapda</div><div class="tc-desc">Total, nem active paraméter a VRAM-nál.</div></a>
  <a class="toc-card" href="#hw-7"><div class="tc-num">5. rész</div><div class="tc-name">CUDA, ROCm, Metal</div><div class="tc-desc">A szoftverréteg — NVIDIA vs. AMD vs. Apple.</div></a>
  <a class="toc-card" href="#hw-8"><div class="tc-num">6. rész</div><div class="tc-name">GPU-választás 2026</div><div class="tc-desc">Konkrét kártyák, VRAM-tier táblázat.</div></a>
  <a class="toc-card" href="#hw-9"><div class="tc-num">7. rész</div><div class="tc-name">Multi-GPU & offloading</div><div class="tc-desc">Ha nem fér egy kártyára.</div></a>
</div>
::::::

:::::: section id=hw-0 heading="0. rész — Miért a GPU futtat egy LLM-et?" nav="0. rész" group="Elmélet"

<p class="topic-tagline">Cél: értsd, milyen probléma miatt lett a GPU (és nem a CPU) az AI munkalova.</p>

### A CPU jó egyet-egyet, a GPU jó sok-egyszerre

Egy neurális háló futtatása lényegében **milliárdnyi apró szorzás és összeadás** — mátrixszorzatok tömkelege. Egy CPU néhány, nagyon gyors, összetett utasításokra optimalizált magból áll: kiváló szekvenciális, elágazás-gazdag logikára. Egy GPU ezzel szemben **több ezer egyszerűbb magot** tartalmaz, amik **egyszerre, párhuzamosan** végzik ugyanazt a műveletet más-más adaton. A mátrixszorzás pont ilyen: ugyanaz a művelet (szorzás-összeadás), rengeteg adatponton. Ez a **SIMD**-szerű (single instruction, multiple data) párhuzamosítás teszi a GPU-t nagyságrendekkel gyorsabbá ebben a feladatban.

### A két szám, ami mindent eldönt

Egy LLM-munkánál gyakorlatilag minden más GPU-specifikáció (TFLOPS, magszám, órajel) másodlagos e kettőhöz képest:

::::: stack-grid
:::: card label="VRAM (memória-kapacitás)"
Eldönti, hogy a modell **egyáltalán elfér-e** a kártyán. Ha nem fér, a modell nem tölthető be — nincs "majdnem működik".
::::
:::: card label="Memória-sávszélesség (GB/s)"
Eldönti, **milyen gyorsan** generálódnak a tokenek. Az inferencia zöme nem számolás, hanem **adatmozgatás**: a súlyokat a memóriából a számító egységekbe kell tolni minden lépésnél.
::::
:::::

::::: callout label="Egy mondatban"
**A VRAM dönti el, hogy fut-e a modell; a sávszélesség dönti el, hogy milyen gyorsan.** A nyers számítási teljesítmény (TFLOPS) a harmadik, kevésbé kritikus tényező inferenciánál.
:::::
::::::

:::::: section id=hw-1 heading="1. rész — Mi van pontosan a VRAM-ban?" nav="1. rész" group="Elmélet"

<p class="topic-tagline">Cél: bontsd négy komponensre, hogy értsd, mi mennyit eszik.</p>

### A négy fogyasztó

::::: stack-grid
:::: card label="Modellsúlyok"
A tanult paraméterek — a modell "tudása". **Fix méret**, csak a paraméterszám és a precizitás (kvantálás) határozza meg. Ez a legnagyobb, legkiszámíthatóbb tétel.
::::
:::: card label="KV-cache"
A korábbi tokenek Key/Value tenzorai, eltárolva, hogy ne kelljen újraszámolni őket. **A kontextus hosszával és a batch-mérettel nő** — ez a legváltozékonyabb tétel. A teljes mechanizmust a **KV-cache tutorial** dolgozza fel részletesen.
::::
:::: card label="Aktivációk"
A számítás közbeni átmeneti eredmények (a rétegek közti köztes kimenetek). Inferenciánál viszonylag kicsi (~5-10%), tanításnál sokkal nagyobb.
::::
:::: card label="Framework overhead"
A CUDA-kontextus, a driver, a szolgáltató keretrendszer (Ollama, vLLM) saját foglalása. Tipikusan 0,5-2 GB, függetlenül a modell méretétől.
::::
:::::

![VRAM összetétele egy 8B modellnél, különböző kontextushosszaknál](assets/hw-01-vram-breakdown.jpg)

Az ábra jól mutatja a lényeget: rövid kontextusnál (4K) a **súlyok** dominálnak, de ahogy a kontextus nő (32K, 128K), a **KV-cache** fokozatosan átveszi a fő helyet — 128K-nál már nagyobb, mint maguk a súlyok.

::::: callout warning label="A gyakori tévedés"
„Van 24 GB VRAM-om, a 13B modell 13×2=26 GB-nak tűnik FP16-on, épp csak nem fér el" — és utána valaki csodálkozik, hogy 8K kontextusnál már OOM-ol (out of memory), pedig „elfért volna". A KV-cache és az overhead **hozzáadódik** a súlyokhoz — sosem csak a nyers paraméterméretet nézd.
:::::
::::::

:::::: section id=hw-2 heading="Feladat 1 — Nézd meg a saját GPU-dat" nav="Feladat 1" group="Gyakorlat"

<p class="topic-tagline">Cél: tudd lekérdezni, mennyi VRAM-od van és mennyi van éppen használatban.</p>

### NVIDIA (CUDA)

```bash
nvidia-smi
# a kimenet mutatja: GPU típus, összes VRAM, jelenleg használt VRAM, driver/CUDA verzió
```

### AMD (ROCm)

```bash
rocm-smi --showmeminfo vram
```

### Apple Silicon (unified memory)

Az Apple Silicon-nál nincs külön VRAM — a CPU és GPU **osztozik** a teljes rendszermemórián (unified memory). A te M4 Pro Mac-eden ez azt jelenti, hogy a "VRAM" gyakorlatilag a teljes RAM-od, amennyit az OS enged a GPU-nak foglalni:

```bash
# macOS: a GPU-memória használat megtekintése
sudo powermetrics --samplers gpu_power -i1000 -n1
# vagy egyszerűbben, az Aktivitásfigyelő "Memory" fülén
```

### Futó modell VRAM-terhelése Ollamában

```bash
ollama ps
# a kimenet mutatja, a modell hány %-a fut GPU-n vs. CPU-n (pl. "48% CPU / 52% GPU")
```

::::: callout label="Gyakorlat"
Indíts el egy modellt Ollamával (pl. `ollama run llama3.1:8b`), és közben másik terminálban futtasd a fenti parancsot a platformodnak megfelelően. Nézd meg, mennyi VRAM-ot foglal — és vesd össze azzal, amit a 3. rész képlete alapján saját kezűleg kiszámolsz.
:::::
::::::

:::::: section id=hw-3 heading="2. rész — Kvantálás: bájt paraméterenként" nav="2. rész" group="VRAM-matek"

<p class="topic-tagline">Cél: tudd, pontosan mennyi helyet foglal egyetlen paraméter az egyes precizitásokon.</p>

### Mi az a kvantálás?

A **kvantálás** a modellsúlyok tárolási precizitásának csökkentése — kevesebb bit paraméterenként, cserébe kisebb méretért és kis pontosságvesztésért. A paraméterszám és az architektúra **nem** változik, csak az, hány bit ír le egy-egy számot.

### A táblázat, amit meg kell jegyezned

| Precizitás | Bájt/paraméter | Jelleg |
|---|---|---|
| FP32 | 4,0 | Tanítási precizitás, inferenciánál ritkán kell |
| FP16 / BF16 | 2,0 | Standard inferencia-precizitás, jó minőségi alapvonal |
| INT8 / Q8_0 | 1,0 | Minimális minőségromlás, jó produkciós választás |
| Q6_K | 0,78 | Közel FP16 minőség, kisebb helyen |
| Q5_K_M | 0,68 | Jó minőség/méret arány |
| **Q4_K_M** | **0,57** | **A leggyakoribb lokális választás** — jó egyensúly |
| INT4 (nyers) | 0,5 | Agresszív tömörítés, 1-3% perplexity-romlás |
| Q2 | ~0,3 | Csak végszükségben — érezhető minőségromlás |

::::: callout label="Miért pont Q4_K_M a defaultod Ollamában?"
A Q4_K_M nem naiv 4-bites kerekítés — **K-quant**: a modell saját súly-fontossági pontszámai alapján allokálja a biteket, több precizitást adva ott, ahol számít. Ez az, amiért egy Q4_K_M modell minősége sokkal közelebb van az FP16-hoz, mint amit a "4 bit" szám sugallna — jellemzően csak 3-5%-os romlás a benchmarkokon.
:::::

### FP16 vs. BF16 — mindegy inferenciánál

Mindkettő 2 bájt/paraméter. A BF16-nak nagyobb az exponens-tartománya (kevésbé hajlamos túlcsordulásra), az FP16-nak nagyobb a pontossága kis értékeknél. Tanításnál a BF16-ot preferálják (stabilabb), de inferenciánál a memória-lábnyom és a gyakorlati minőség szinte azonos.
::::::

:::::: section id=hw-4 heading="3. rész — A VRAM-képlet: a flagship számítás" nav="3. rész" group="VRAM-matek"

<p class="topic-tagline">Cél: tudd kiszámolni előre, befér-e egy modell — mielőtt letöltöd vagy megveszed a kártyát.</p>

### Az alapképlet

```text
VRAM (GB) ≈ (Paraméterek [milliárd] × Bájt/paraméter × 1,2) + KV-cache + overhead

  1,2  →  ~20%-os ráhagyás aktivációkra és futásidejű allokációra
```

Rövid kontextusnál (néhány ezer token) a KV-cache elhanyagolható, és az egyszerűsített ökölszabály elég pontos:

```text
VRAM (GB) ≈ Paraméterek [milliárd] × Bájt/paraméter × 1,2
```

### Worked example — Llama 3.1 8B, három precizitáson

| Precizitás | Számítás | Súlyok | + 20% overhead |
|---|---|---|---|
| FP16 | 8 × 2 | 16 GB | **~19 GB** |
| Q8_0 | 8 × 1 | 8 GB | **~9,6 GB** |
| Q4_K_M | 8 × 0,57 | 4,56 GB | **~5,5 GB** |

Ez az oka, hogy egy 8B modell Q4-en simán fut egy 8-12 GB-os fogyasztói kártyán, de FP16-on már 24 GB-ot kíván.

### Worked example — 70B modell, ahol a döntés éles

| Precizitás | Súlyok | + 20% overhead | Fér-e egy 24 GB-os kártyára? |
|---|---|---|---|
| FP16 | 140 GB | ~168 GB | Nem — több kártya vagy adatközponti GPU kell |
| INT8 | 70 GB | ~84 GB | Nem — legalább egy 80-96 GB-os kártya |
| Q4_K_M | 39,9 GB | ~48 GB | Nem — de **közel**; egy 48 GB-os kártyán (pl. RTX 6000 Ada) igen |

::::: callout label="Hosszú kontextusnál a KV-cache-et is hozzá kell adnod"
A fenti képlet csak a **súlyokat** és az általános overheadet fedi. Ha 32K+ kontextussal dolgozol, a KV-cache-t **külön** kell számolnod — ez pontosan az, amit a **KV-cache tutorial** 3. része vezet le képlettel (`2 × rétegek × kv_fejek × fej_dim × szekvencia_hossz × bájt`). A két tutorial együtt adja a teljes képet: itt a súlyok, ott a dinamikusan növekvő rész.
:::::
::::::

:::::: section id=hw-5 heading="Feladat 2 — Számold ki magad" nav="Feladat 2" group="Gyakorlat"

<p class="topic-tagline">Cél: alkalmazd a képletet valós modellekre, és vesd össze a saját hardvereddel.</p>

### Python — kis segédfüggvény

```python
BYTES_PER_PARAM = {
    "fp32": 4.0, "fp16": 2.0, "int8": 1.0,
    "q6_k": 0.78, "q5_k_m": 0.68, "q4_k_m": 0.57, "int4": 0.5, "q2": 0.3,
}

def estimate_vram_gb(params_billion, precision, overhead_factor=1.2, kv_cache_gb=0):
    weights_gb = params_billion * BYTES_PER_PARAM[precision]
    return weights_gb * overhead_factor + kv_cache_gb

# néhány valós modell
models = [
    ("Llama 3.1 8B",  8,   "q4_k_m"),
    ("Qwen 2.5 32B",  32,  "q4_k_m"),
    ("Llama 3.1 70B", 70,  "q4_k_m"),
    ("Llama 3.1 70B", 70,  "fp16"),
]
for name, params, prec in models:
    vram = estimate_vram_gb(params, prec)
    print(f"{name:<18} @ {prec:<8} → ~{vram:.1f} GB VRAM")
```

::::: callout label="Gyakorlat"
Futtasd le a fenti kódot, majd egészítsd ki egy negyedik argumentummal: a te GPU-d (vagy Mac-ed unified memóriája) VRAM-mérete. Írasd ki minden sornál, hogy **BEFÉR-e** ("✓ fut" / "✗ nem fér, próbálj alacsonyabb kvantálást"). Ha van saját letöltött Ollama-modelled, vesd össze a becslésedet a `ollama ps` tényleges kiírásával (Feladat 1) — jellemzően 10-15%-on belül kell legyen.
:::::
::::::

:::::: section id=hw-6 heading="4. rész — A MoE csapda: total, nem active paraméter" nav="4. rész" group="VRAM-matek"

<p class="topic-tagline">Cél: ne ess bele abba a hibába, hogy az aktivált paraméterszám alapján tervezel VRAM-ot.</p>

### A leggyakoribb tervezési hiba

A **dense vs. MoE architektúra tutorial** részletesen tárgyalja, hogy egy MoE modellnek két száma van: *total* és *active* paraméter. VRAM-tervezésnél ez a különbség **kritikus**, és sokan itt hibáznak:

::::: callout danger label="Rossz gondolkodás"
„A Mixtral 8x7B csak 13B paramétert aktivál tokenenként, tehát úgy fér el, mint egy 13B modell." **Ez hamis.** A router futásidőben *bármelyik* expertet kiválaszthatja, ezért **mind a 46,7B total paramétert** be kell tölteni a VRAM-ba — csak a *számítás* korlátozódik az aktívakra, a *memória* nem.
:::::

### A helyes számítás MoE-nál

```text
MoE VRAM ≈ TOTAL paraméterek × bájt/paraméter × 1,2 + KV-cache + overhead
                (nem az active paraméterek!)
```

### Konkrét példa

| Modell | Total | Active | VRAM Q4_K_M-en (total alapján!) |
|---|---|---|---|
| Mixtral 8x7B | 46,7B | 13B | 46,7 × 0,57 × 1,2 ≈ **32 GB** |
| Qwen3-Coder 30B-A3B | 30B | ~3B | 30 × 0,57 × 1,2 ≈ **20,5 GB** |
| DeepSeek V3 | 671B | 37B | 671 × 0,57 × 1,2 ≈ **459 GB** |

A Qwen3-Coder 30B-A3B pont azért fér el egy 24 GB-os fogyasztói kártyán Q4-en, mert a *total* 30B — a "3B aktív" szám a sebességre vonatkozik, nem a memóriára.

::::: callout label="A bónusz, amit a MoE ad cserébe"
A dense/MoE tutorial KV-cache bónusza itt is érvényes: mivel a MoE-nál a *számítás* kevesebb, a GPU-n több hely marad a KV-cache-nek ugyanannyi VRAM mellett — ezért bírnak a MoE modellek gyakran hosszabb kontextust ugyanazon a kártyán, mint egy hasonló VRAM-igényű dense modell.
:::::
::::::

:::::: section id=hw-7 heading="5. rész — CUDA, ROCm, Metal: a szoftverréteg" nav="5. rész" group="Szoftverréteg"

<p class="topic-tagline">Cél: értsd, hogy a hardver önmagában semmit sem ér a megfelelő szoftverstack nélkül.</p>

### Három ökoszisztéma, ami 2026-ban számít

::::: stack-grid
:::: card label="CUDA (NVIDIA)"
NVIDIA saját, 15+ éves compute-platformja. Minden nagyobb LLM-eszköz (vLLM, TensorRT-LLM, Unsloth, a legtöbb kvantálási formátum: GPTQ, AWQ, EXL2) **elsőként** CUDA-ra optimalizál. A leginkább "plug-and-play" tapasztalat.
::::
:::: card label="ROCm (AMD)"
AMD nyílt compute-platformja. 2026-ra érdemben beérett: a PyTorch, a vLLM és az SGLang hivatalosan támogatja, az Ollama natívan működik RDNA3/RDNA4 kártyákon. A hátrány: a legújabb, CUDA-specifikus optimalizációk (pl. FlashAttention 3, TensorRT-LLM) gyakran késve vagy egyáltalán nem érkeznek meg ROCm-ra.
::::
:::: card label="Metal / MLX (Apple)"
Az Apple Silicon saját GPU-computing rétege. A **unified memory** miatt más a játék: nincs külön VRAM-korlát, a teljes rendszermemória elérhető. Az Ollama MLX motorja (2026 eleji preview, azóta érett) kifejezetten jó eredményt ad Apple Silicon-on — ez közvetlenül releváns a te M4 Pro Mac-ednek.
::::
:::::

### A gyakorlati döntés

A hardver-specifikáció önmagában félrevezető, ha a szoftver nem támogatja jól. Egy azonos sávszélességű és VRAM-mal rendelkező AMD kártya a gyakorlatban **20-40%-kal lassabban** futtat LLM-inferenciát, mint az NVIDIA megfelelője — nem a hardver hibája, hanem az, hogy a kvantálási kernelek, az attention-implementációk és a debug-eszközök túlnyomó része CUDA-first fejlesztésű.

::::: callout warning label="Mikor éri meg mégis az AMD-t választani?"
Ha kimondottan **Linuxon**, **Ollamával/llama.cpp-vel** futtatsz (nem vLLM-mel vagy egyedi CUDA-kernelekkel), és a **VRAM/dollár** a fő szempont — egy AMD kártya (pl. RX 7900 XTX, 24 GB) jelentősen olcsóbb lehet ugyanannyi memóriáért. Ha bármi egyedi tooling vagy finomhangolás is szóba jön, az NVIDIA marad az alacsonyabb súrlódású út.
:::::

### Verzió-egyeztetés — a néma hibaforrás

A driver, a CUDA-toolkit verziója és a keretrendszer (PyTorch, vLLM) build-je **egymáshoz kell illeszkedjen** — az újabb driver visszafelé kompatibilis a régebbi toolkittal, de fordítva nem. Eltérésnél nem feltétlen kapsz hibaüzenetet — inkább lassulást vagy hiányzó funkciót (pl. FP8 nem érhető el).
::::::

:::::: section id=hw-8 heading="6. rész — GPU-választás 2026-ban: konkrét kártyák" nav="6. rész" group="Gyakorlat"

<p class="topic-tagline">Cél: fordítsd le a matekot valódi vásárlási/bérlési döntésre.</p>

### VRAM-tier gyorsreferencia

| VRAM | Mit futtat kényelmesen (Q4_K_M-en) | Jellemző kártya |
|---|---|---|
| 8-12 GB | 7-8B modellek | RTX 4060 Ti, belépő szint |
| 16 GB | 13-14B modellek | RTX 4070 Ti Super, RTX 5070 Ti |
| 24 GB | 30-32B modellek | RTX 3090 (használt), RTX 4090, RX 7900 XTX |
| 32 GB | 32B+ nagyobb kontextussal | RTX 5090 |
| 48-96 GB | 70B modellek FP8/Q4-en, nagy kontextussal | RTX 6000 Ada, RTX PRO 6000 Blackwell |
| 128-512 GB (unified) | 70B-405B+ modellek | Mac Studio M4 Max/Ultra |

### A négy gyakorlati megfontolás

::::: stack-grid
:::: card label="VRAM/dollár"
Egy használt **RTX 3090** (24 GB) máig a legjobb belépő ár/VRAM arány — Q4-en gyakorlatilag minden 32B alatti modellt fut.
::::
:::: card label="Sávszélesség = sebesség"
Azonos VRAM mellett a magasabb GB/s gyorsabb token-generálást ad. Az adatközponti kártyák (HBM) ezért versenyeznek jól a fogyasztói (GDDR) kártyákkal még alacsonyabb nyers TFLOPS mellett is.
::::
:::: card label="Apple unified memory"
Ha **nagy modellt** (70B+) akarsz egyetlen gépen futtatni, alacsony zajjal és fogyasztással, egy nagy RAM-mal szerelt Mac Studio/Max gyakran olcsóbb és egyszerűbb, mint egy több GPU-s PC — cserébe lassabb nyers sebességért.
::::
:::: card label="Ne fizess feleslegért"
A PCIe-sávszélesség szinte sosem szűk keresztmetszet inferenciánál (a modell egyszer töltődik be, utána a GPU belső memóriáján dolgozik) — ne emiatt válassz drágább alaplapot.
::::
:::::

::::: callout label="A te helyzeted"
Az M4 Pro Mac-ed unified memóriájával gyakorlatilag "VRAM-korlát nélkül" dolgozol a rendszer-RAM méretéig — ez pont azért kényelmes helyi fejlesztéshez és kísérletezéshez (Ollama, a saját tutorialjaid tesztelése), mert nem kell a klasszikus "fér-e a kártyára" korlátozással bajlódnod, amíg a modell a RAM-odba fér.
:::::
::::::

:::::: section id=hw-9 heading="7. rész — Ha nem fér egy kártyára: multi-GPU és offloading" nav="7. rész" group="Gyakorlat"

<p class="topic-tagline">Cél: tudd, mi történik, ha a modell nagyobb, mint egyetlen GPU VRAM-ja.</p>

### Multi-GPU: a modell szétosztása

Ha egy modell nem fér egyetlen kártyára, több GPU közt **rétegenként** osztható szét (tensor/pipeline parallelism). Az Ollama pl. automatikusan felosztja a modellt elérhető kártyák közt (`CUDA_VISIBLE_DEVICES`). A hátrány: a kártyák közti kommunikáció (interconnect) **extra késleltetést** ad — ezért egyetlen, elég nagy kártya szinte mindig jobb, mint két kisebb ugyanannyi összesített VRAM-mal.

### CPU-offloading: ha a GPU-ra sem fér minden

Ha a modell a GPU-VRAM-ra sem fér teljesen, az inferencia-motorok (Ollama, llama.cpp) **rétegeket tolnak át** a rendszer-RAM-ba, és CPU-n számolják azokat. Ez működik, de a sebesség-csökkenés drámai:

| Terhelés | Jellemző sebesség |
|---|---|
| 100% GPU | 30-60 token/mp |
| Vegyes (pl. 50% CPU / 50% GPU) | Jelentősen lassabb, a CPU-arány szerint |
| 100% CPU | 2-5 token/mp |

::::: callout danger label="A leggyakoribb csalódás oka"
A helyi LLM-teljesítmény legnagyobb "szakadéka" pontosan az a pillanat, amikor a modell **kicsúszik** a GPU-ból a rendszer-RAM-ba. Ez nem fokozatos lassulás — hanem hirtelen, nagyságrendi visszaesés. Mindig úgy válassz kvantálást és kontextushosszt, hogy a teljes modell **elférjen** a VRAM-ban — inkább válts kisebb/agresszívabb kvantálású modellre, mint hogy CPU-ra csússzon bármi.
:::::
::::::

:::::: section id=hw-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A tutorial végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0–1. rész"
Miért a GPU · VRAM vs. sávszélesség · a négy VRAM-fogyasztó
::::
:::: card label="Feladat 1"
GPU/VRAM lekérdezése (nvidia-smi, rocm-smi, Ollama ps, Apple unified memory)
::::
:::: card label="2–3. rész"
Bájt/paraméter táblázat · a VRAM-képlet · worked example-ök 8B és 70B modellre
::::
:::: card label="Feladat 2"
Saját VRAM-becslő script, összevetve a valós GPU méretével
::::
:::: card label="4. rész"
A MoE csapda: total, nem active paraméter számít a memóriánál
::::
:::: card label="5–7. rész"
CUDA vs. ROCm vs. Metal · GPU-választás 2026 · multi-GPU és CPU-offloading
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>dense vs. MoE</em> (total/active paraméterek) és a <em>KV-cache</em> (a dinamikusan növekvő memória-komponens) tutorialok — ez a hardver-alap adja meg, mibe kell beleférniük.</p>
::::::
