---
page: quantization-quality
title: Kvantálás és minőség
sidebar_groups:
  - Elmélet
  - Vektor-szinten
  - Számok
  - Gyakorlat
  - Referencia
hero:
  eyebrow: "Kvantálás · Fejlesztői Tanulási Terv"
  title: "Kvantálás és <em>minőség</em>"
  lead: "Mi történik ténylegesen egy súly-vektorral, amikor kvantálsz — és mennyit veszítesz belőle a gyakorlatban. Konkrét százalékok bit-szélesség szerint, és egy gyakori félreértés tisztázása: a tokenizáció nem változik, a token-választás igen. Épít a <em>hardver</em> és a <em>vektor-adatbázis</em> tutorialokra."
  stats:
    - { val: "7", lbl: "Szakasz" }
    - { val: "2", lbl: "Feladat" }
    - { val: "1-3%", lbl: "Q4 veszteség" }
    - { val: "3×", lbl: "Reasoning gyorsabban romlik" }
footer:
  left: "AI Hub · Kvantálás és minőség"
  right: "Kvantálás · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#q-0"><div class="tc-num">0. rész</div><div class="tc-name">Gyors felidézés</div><div class="tc-desc">Mi a kvantálás — a hardver tutorialból.</div></a>
  <a class="toc-card" href="#q-1"><div class="tc-num">1. rész</div><div class="tc-name">Vektor-szinten</div><div class="tc-desc">Mi történik egy súllyal kerekítéskor.</div></a>
  <a class="toc-card" href="#q-2"><div class="tc-num">2. rész</div><div class="tc-name">Hogyan terjed a hiba</div><div class="tc-desc">Mátrixszorzat, kiátlagolódás vs. felhalmozódás.</div></a>
  <a class="toc-card" href="#q-3"><div class="tc-num">3. rész</div><div class="tc-name">Hogyan mérjük</div><div class="tc-desc">Perplexity — és amit nem lát.</div></a>
  <a class="toc-card" href="#q-4"><div class="tc-num">4. rész</div><div class="tc-name">Konkrét számok</div><div class="tc-desc">Százalékok bit-szélesség szerint.</div></a>
  <a class="toc-card" href="#q-5"><div class="tc-num">5. rész</div><div class="tc-name">Mi romlik ténylegesen?</div><div class="tc-desc">Tokenizáció vs. token-választás.</div></a>
  <a class="toc-card" href="#q-6"><div class="tc-num">Feladat</div><div class="tc-name">Lásd élőben</div><div class="tc-desc">Kerekítési hiba + kvantálás-teszt.</div></a>
</div>
::::::

:::::: section id=q-0 heading="0. rész — Gyors felidézés: mi a kvantálás?" nav="0. rész" group="Elmélet"

<p class="topic-tagline">Cél: egy mondatban felidézni, amit a hardver tutorial már bevezetett — innen indulunk tovább, a minőség felé.</p>

A **hardver tutorial** 2. részében már volt szó róla: a kvantálás a modellsúlyok **tárolási precizitásának** csökkentése — kevesebb bit paraméterenként (FP16 → INT8 → Q4 → Q2), cserébe kisebb memória-lábnyomért. A paraméterszám és az architektúra **nem** változik, csak az, hány bit ír le egy-egy számot.

Ez a tutorial azzal folytatja, amit ott csak érintettünk: **pontosan mit veszítesz** ezért cserébe, hol jelentkezik ez a veszteség a modell működésében, és mikor számít ez ténylegesen.

::::: callout label="Egy mondatban"
**A kvantálás nem ingyen ebéd** — kevesebb bit kevesebb pontosságot jelent egy súlynál, ez a pontatlanság végigfolyik a számításon, és a végén a kimeneti szöveg minőségében jelenik meg. A kérdés nem az, hogy *van-e* veszteség, hanem hogy *mennyi*, és *hol* számít igazán.
:::::
::::::

:::::: section id=q-1 heading="1. rész — Vektor-szinten: mi történik egy súllyal?" nav="1. rész" group="Vektor-szinten"

<p class="topic-tagline">Cél: lásd meg konkrétan, mit jelent a "kerekítés" egyetlen szám szintjén.</p>

### A kerekítés, amit a kvantálás valójában csinál

Egy modellsúly FP16-on egy elég finom számot tárol, pl. `0.0374512`. Amikor 4 bitre kvantálod, csak **16 diszkrét szint** közül választhatsz egy adott tartományban — a súly a legközelebbi elérhető szintre **kerekedik**, pl. `0.04`-re. A különbség (`0.0374512 - 0.04 = -0.0025488`) a **kvantálási hiba** — ez minden egyes súlynál külön-külön keletkezik.

```python
import numpy as np

def quantize_4bit(value, min_val=-0.5, max_val=0.5, levels=16):
    step = (max_val - min_val) / (levels - 1)
    quantized_level = round((value - min_val) / step)
    return min_val + quantized_level * step

original = 0.0374512
quantized = quantize_4bit(original)
error = original - quantized

print(f"Eredeti:    {original:.6f}")
print(f"Kvantált:   {quantized:.6f}")
print(f"Hiba:       {error:.6f}  ({abs(error/original)*100:.1f}% relatív eltérés)")
```

### Ez egy vektor minden komponensével megtörténik

A **vektor-adatbázis tutorial** már bevezette: egy súly-mátrix sorai/oszlopai vektorok, amiknek minden komponense egy szám. Kvantáláskor **nem egy** számot kerekítesz, hanem egy teljes vektor **minden egyes komponensét** — egy 4096-dimenziós súlyvektornál ez 4096 apró, egymástól független kerekítési hiba.

::::: callout label="Miért nem egyenletes a hiba?"
A kvantálás nem "vakon" kerekít mindent egyformán — a jó módszerek (pl. a hardver tutorialban említett **K-quant**) a modell saját súly-fontossági mintázata alapján allokálják a biteket: a nagyobb hatású súlyoknak több precizitást hagynak, a kevésbé fontosaknak kevesebbet. Ez az oka, hogy egy Q4_K_M minősége sokkal közelebb van az FP16-hoz, mint amit a "4 bit" szám önmagában sugallna.
:::::
::::::

:::::: section id=q-2 heading="2. rész — Hogyan terjed a hiba: mátrixszorzat" nav="2. rész" group="Vektor-szinten"

<p class="topic-tagline">Cél: értsd, miért nem omlik össze azonnal minden a sok apró hibától.</p>

### Kiátlagolódás vs. felhalmozódás

Egy transformer-réteg működése lényegében **mátrixszorzatok** sorozata — egy bemeneti vektor és egy súlymátrix szorzata, ami sok apró szorzás-összeadás összegzése. Ha minden egyes súlyban van egy kis, **véletlenszerű irányú** hiba, ezek a hibák a összegzés során **részben kiátlagolódnak** — némelyik pozitív, némelyik negatív irányba téved, és a nagy számok törvénye miatt a végeredmény nem annyira zajos, mint amennyire az egyedi hibák alapján várnád.

```text
Egyetlen szorzás hibája: kicsi, de akár nagy relatív eltérés is lehet
Több ezer szorzás ÖSSZEGE: a hibák jó része kiegyenlítődik,
                            de marad egy maradék zaj, ami TOVÁBBFOLYIK
                            a következő rétegbe
```

### De nem minden hiba egyenlő — az outlierek problémája

A kutatás egy fontos kivételt is dokumentál: ha a kvantálás **túl agresszív** vagy **rosszul csoportosított** (pl. naiv, oszloponkénti INT4 finomítás nélkül), néhány **kiugró (outlier) súly** aránytalanul nagy hibát kaphat, és ez **nem** átlagolódik ki — hanem a modell egy rétegének kimenetét drasztikusan eltorzíthatja. A dokumentált szélsőséges eset: egy 66 milliárd paraméteres modellnél a naiv, oszloponkénti INT4-kvantálás **katasztrofális összeomlást** okozott (a perplexity 10-ről 143-ra ugrott!) — miközben ugyanaz a modell **blokkos** kvantálással (a súlyokat kisebb csoportokban, csoportonként külön skálázva kvantálva) simán, alig észrevehető veszteséggel futott.

::::: callout warning label="A tanulság"
Nem csak az számít, **hány bit**, hanem **hogyan** csoportosítod és skálázod a kvantálást. Ez az oka, hogy a modern formátumok (GGUF K-quant, AWQ, GPTQ) mind kifinomult csoportosítási/kalibrálási stratégiákat használnak — a "csak vágd le a biteket" naiv megközelítés helyett.
:::::
::::::

:::::: section id=q-3 heading="3. rész — Hogyan mérjük: a perplexity és a vakfoltja" nav="3. rész" group="Számok"

<p class="topic-tagline">Cél: ismerd a standard mérőszámot — és azt is, mikor félrevezető.</p>

### Mi az a perplexity?

A **perplexity** azt méri, mennyire "meglepődik" a modell a valós szövegen — leegyszerűsítve: minél alacsonyabb, annál jobban illeszkedik a modell valószínűség-becslése a tényleges szöveghez. Ez a **de facto standard** mérőszám kvantálási veszteség jellemzésére: összehasonlítod az FP16 (alap) és a kvantált modell perplexityjét ugyanazon a teszt-szövegen.

### De a perplexity nem lát mindent

Egy friss kutatás rámutatott egy fontos vakfoltra: **a perplexity javulhat vagy alig változhat, miközben a modell belső "jellemzői" (features) jelentősen károsodnak**. Egy konkrét mérésben az INT7-kvantálás **javította** a perplexityt (-5,65%), miközben a modell belső, értelmezhető jellemzőinek csak **81,3%-a** maradt épen — vagyis a látszólag jó felszíni szám alatt valódi belső sérülés történt, ami más feladatokon később felszínre kerülhet.

::::: callout label="Mit jelent ez neked gyakorlatilag?"
Ha csak a perplexityre hagyatkozol, **hamis biztonságérzetet** kaphatsz. Ezért a komolyabb kvantálási összehasonlítások (4. rész) mindig **konkrét feladat-benchmarkokat** is mérnek (matek, kódolás, hosszú kontextus) — nem csak a perplexity-számot.
:::::
::::::

:::::: section id=q-4 heading="4. rész — Konkrét számok: mennyit veszítesz valójában?" nav="4. rész" group="Számok"

<p class="topic-tagline">Cél: konkrét, kutatásból származó tájékozódási pontok — nem csak "kisebb = rosszabb".</p>

![Minőségromlás kvantálási szintenként](assets/quant-01-degradation.jpg)

### A táblázat, amit érdemes fejben tartani

| Szint | Tipikus perplexity-romlás | Jelleg |
|---|---|---|
| **FP16** | <1% (az FP32-höz képest) | Gyakorlatilag veszteségmentes |
| **INT8 / FP8** | 0,2–2% | Alig érzékelhető, produkciós szempontból biztonságos |
| **Q4_K_M / INT4 (jó módszerrel)** | 1–3% | A gyakorlati "édespont" — ezért Ollama-alapértelmezés |
| **W4A4 (súly ÉS aktiváció is 4 bit)** | 3–13% | Már "kockázatos zónának" számít |
| **Q3** | Perplexityben mérsékelt, de matekban/reasoningben **~3×** nagyobb romlás | Érezhető, feladat-függő |
| **Q2** | Súlyos, néha összeomlás-szerű | Csak végszükségben |

### Két nüánsz, ami nem fér bele egy táblázatba

::::: stack-grid
:::: card label="A kisebb modell jobban szenved"
Ugyanazon a kvantálási szinten egy **kisebb** modell arányosan **többet** veszít, mint egy nagyobb. Példa: a Llama-3.1 8B kvantálva átlagosan ~10%-ot veszített egy hosszú-kontextus benchmarkon, míg a Llama-3.1 70B ugyanazon a szinten csak ~4,5%-ot. A nagyobb modell "tartalék kapacitása" jobban elnyeli a kvantálási zajt.
::::
:::: card label="A reasoning gyorsabban romlik, mint a nyelvi folyékonyság"
A perplexity főleg a "hangzik-e természetesen" jelleget méri — a **matematikai és logikai feladatok** sokkal érzékenyebbek: Q3-nál a matek-pontosság romlása kb. **háromszorosa** a perplexity-romlásnak. Ha a modelledet reasoning-re vagy tool-use-ra szánod, ne menj Q4 alá.
::::
:::::
::::::

:::::: section id=q-5 heading="5. rész — Mi romlik ténylegesen: tokenizáció vagy token-választás?" nav="5. rész" group="Vektor-szinten"

<p class="topic-tagline">Cél: tisztázzunk egy gyakori félreértést — ez a kettő nem ugyanaz.</p>

### A tokenizáció NEM változik

A **tokenizáció** — a szöveg feldarabolása token-egységekre (pl. BPE-algoritmussal) — egy **rögzített, determinisztikus** előfeldolgozási lépés, ami a modell betöltött súlyaitól **teljesen független**. Akár FP16-on, akár Q2-n futtatod ugyanazt a modellt, a "macska" szó **pontosan ugyanazokra** a token-ID-kra bomlik mindkét esetben. A kvantálás a **súlyokat** érinti, nem a szótárt vagy a szó-darabolási szabályokat.

### Ami ténylegesen változik: a token-VÁLASZTÁS

Amit a kvantálás valójában befolyásol, az a **generálás** — vagyis hogy a modell a szótár melyik tagját választja **következő tokenként**. Ahogy a **hallucináció tutorial** 4. részében volt szó: a modell minden lépésben egy valószínűség-eloszlást számol a lehetséges következő tokenekre. A kvantálási zaj (1-2. rész) ezt az eloszlást **kicsit elmossa** — egy éles, magabiztos csúcs helyett egy kicsit laposabb, bizonytalanabb eloszlást kapsz.

::::: callout warning label="Miért számít ez a gyakorlatban?"
Ha két token valószínűsége **közel egyenlő** (a modell "bizonytalan" közöttük), egy apró kvantálási zaj **átbillentheti** a döntést a másik irányba — ez adja a "kicsit más megfogalmazás" jelenséget, amit alacsony szintű kvantálásnál (Q4) tapasztalsz. Magasabb tétnél (pl. amikor egy ritka tényre kellene pontosan emlékeznie — lásd a **hallucináció tutorial** 1. részét) ugyanez a "billenés" egy **helyes válaszból hibásat** csinálhat, mert a ritka tények eleve "gyéren" reprezentált régiókban élnek, ahol a kvantálási zaj arányosan nagyobb kárt tehet.
:::::
::::::

:::::: section id=q-6 heading="Feladat — Lásd élőben a kerekítési hibát és a kvantálás hatását" nav="Feladat" group="Gyakorlat"

<p class="topic-tagline">Cél: fuss le egy kis szimulációt, és — ha van Ollamád — egy valós összehasonlítást.</p>

### 1. rész — Kerekítési hiba szimulálása egy teljes súlyvektoron

```python
import numpy as np

np.random.seed(0)

def quantize_vector(vec, bits=4, vmin=-0.5, vmax=0.5):
    levels = 2 ** bits
    step = (vmax - vmin) / (levels - 1)
    quantized = np.round((vec - vmin) / step) * step + vmin
    return np.clip(quantized, vmin, vmax)

weight_vector = np.random.uniform(-0.3, 0.3, size=1000)

for bits in [8, 4, 3, 2]:
    q = quantize_vector(weight_vector, bits=bits)
    mse = np.mean((weight_vector - q) ** 2)
    max_err = np.max(np.abs(weight_vector - q))
    print(f"{bits} bit → átlagos négyzetes hiba: {mse:.6f}, "
          f"legnagyobb egyedi hiba: {max_err:.4f}")
```

::::: callout label="Gyakorlat"
Futtasd le, és figyeld meg: a bit-szám csökkenésével a hiba **nem lineárisan**, hanem **gyorsulva** nő (minden elvesztett bit megduplázza a kvantálási lépésközt). Ez a matematikai alapja annak, hogy Q4-ről Q2-re lépve a minőségromlás sokkal nagyobb ugrás, mint FP16-ról Q4-re.
:::::

### 2. rész — Valós összehasonlítás Ollamával (ha van hozzáférésed)

```bash
ollama pull llama3.1:8b-instruct-q4_K_M
ollama pull llama3.1:8b-instruct-q8_0

# ugyanaz a prompt mindkét kvantáláson — egy reasoning-igényes kérdés
ollama run llama3.1:8b-instruct-q4_K_M "Egy vonat 120 km/h-val indul, 45 perccel később egy másik 150 km/h-val ugyanazon a pályán. Mikor éri utol a második az elsőt?"
ollama run llama3.1:8b-instruct-q8_0 "Egy vonat 120 km/h-val indul, 45 perccel később egy másik 150 km/h-val ugyanazon a pályán. Mikor éri utol a második az elsőt?"
```

::::: callout label="Gyakorlat"
Fuss le 5-10 hasonló, **számolást igénylő** kérdést mindkét kvantáláson, és jegyezd fel, hányszor tér el a végeredmény. Ez a **4. részben** tárgyalt "reasoning gyorsabban romlik" jelenség saját gépeden mérve — jó eséllyel a Q8 konzisztensebben ad helyes numerikus választ, mint a Q4, még ha a szöveg megfogalmazása mindkettőnél természetesnek hangzik is.
:::::
::::::

:::::: section id=q-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A tutorial végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0–2. rész"
Mi a kerekítés súly-szinten · hogyan terjed a hiba mátrixszorzatban · kiátlagolódás vs. outlier-összeomlás
::::
:::: card label="3–4. rész"
Perplexity és a vakfoltja · konkrét százalékok (FP16→Q2) · modellméret és reasoning hatása
::::
:::: card label="5. rész + Feladat"
Tokenizáció NEM változik, a token-választás igen · kerekítési szimuláció · valós Ollama-teszt
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>hardver</em> (VRAM-számítás, bájt/paraméter táblázat), a <em>vektor-adatbázis</em> (mi a vektor) és a <em>hallucináció</em> (ritka tények, token-választási bizonytalanság) tutorialok.</p>
::::::
