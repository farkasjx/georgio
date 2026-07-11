---
page: dense-moe
title: Dense vs. MoE architektúra
sidebar_groups:
  - Elmélet
  - Működés
  - Összehasonlítás
  - Gyakorlat
  - Referencia
hero:
  eyebrow: "Modell-architektúra · Fejlesztői Tanulási Terv"
  title: "Dense vs. <em>MoE</em> architektúra"
  lead: "Miért aktivál egy 671 milliárd paraméteres modell csak 37 milliárdot tokenenként? A sűrű (dense) és a Mixture-of-Experts (MoE) transformerek működése, különbségei, sebesség/méret/hatékonyság kompromisszumai — ábrákkal, kóddal és feladatokkal. <em>2026-ban a frontier modellek szinte mind MoE-k.</em>"
  stats:
    - { val: "10", lbl: "Szakasz" }
    - { val: "5", lbl: "Feladat" }
    - { val: "4", lbl: "Ábra" }
    - { val: "3.1%", lbl: "Sparsity (V4-Pro)" }
footer:
  left: "AI Hub · Dense vs. MoE architektúra"
  right: "Modell-architektúra · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#dm-0"><div class="tc-num">0. rész</div><div class="tc-name">Miért van két tábor?</div><div class="tc-desc">A scaling-fal, és a sparsity mint válasz.</div></a>
  <a class="toc-card" href="#dm-1"><div class="tc-num">1. rész</div><div class="tc-name">A dense transformer</div><div class="tc-desc">Minden paraméter aktív minden tokennél.</div></a>
  <a class="toc-card" href="#dm-2"><div class="tc-num">2. rész</div><div class="tc-name">A MoE alapötlet</div><div class="tc-desc">Sok expert, egy router, kevés aktív.</div></a>
  <a class="toc-card" href="#dm-3"><div class="tc-num">3. rész</div><div class="tc-name">A router működése</div><div class="tc-desc">Top-k gating, softmax, kód.</div></a>
  <a class="toc-card" href="#dm-4"><div class="tc-num">4. rész</div><div class="tc-name">Total vs. Active</div><div class="tc-desc">A sparsity, és amit félreértenek.</div></a>
  <a class="toc-card" href="#dm-5"><div class="tc-num">5. rész</div><div class="tc-name">Load balancing</div><div class="tc-desc">Miért omlik össze router nélkül.</div></a>
  <a class="toc-card" href="#dm-6"><div class="tc-num">6. rész</div><div class="tc-name">Sebesség/méret/hatékonyság</div><div class="tc-desc">A compute vs. memória csapda.</div></a>
  <a class="toc-card" href="#dm-7"><div class="tc-num">7. rész</div><div class="tc-name">Előny / hátrány</div><div class="tc-desc">Mérlegen a két architektúra.</div></a>
  <a class="toc-card" href="#dm-8"><div class="tc-num">Feladat</div><div class="tc-name">MoE-réteg kézzel</div><div class="tc-desc">Router + expertek Pythonban.</div></a>
  <a class="toc-card" href="#dm-9"><div class="tc-num">9. rész</div><div class="tc-name">Mikor melyiket?</div><div class="tc-desc">Döntési keret, lokális futtatás.</div></a>
</div>
::::::

:::::: section id=dm-0 heading="0. rész — Miért van két tábor?" nav="0. rész" group="Elmélet"

<p class="topic-tagline">Cél: értsd, milyen problémára válasz a MoE, és miért lett 2026-ra domináns.</p>

### A scaling-fal

A nyelvi modellek minőségét sokáig egyszerűen a **méret** növelésével javították: több paraméter → több tudás → jobb modell. De egy **dense** (sűrű) transformerben *minden* paraméter aktiválódik *minden* egyes token feldolgozásakor. Ez azt jelenti, hogy a számítási költség (és a tanítás ára) egyenesen arányos a mérettel. Egy bizonyos ponton ez fizikailag és pénzügyileg is fenntarthatatlanná válik.

A **Mixture-of-Experts (MoE)** a válasz erre: úgy növeli a modell tudás-kapacitását (total paraméterszám), hogy közben a tokenenkénti számítást (active paraméterszám) alacsonyan tartja. A trükk: a paraméterek nagy részét *nem használja* minden tokennél — csak a relevánsakat.

### 2026: a sparse lett a norma

A váltás gyors volt. 2024-ben a Mixtral 8x22B volt a nyílt súlyú standard 28% körüli sparsityvel; 2025-re a DeepSeek V3 ezt 5,4%-ra vitte le; 2026 második negyedévére a DeepSeek V4-Pro már 3,1%-ig ment (1,6 billió total paraméterből 49 milliárd aktív). 2026-ra a MoE gyakorlatilag alapértelmezés bármely komoly frontier modellnél — az egyik nevezetes kivétel a Claude család, ahol a nyilvános jelek szerint még dense (vagy csak nagyon enyhén MoE) architektúra dolgozik.

::::: callout label="Egy mondatban"
**Dense** = minden paraméter dolgozik minden tokennél (egyszerű, kiszámítható, de drágán skálázódik). **MoE** = sok „expert" közül tokenenként csak néhány aktív (hatalmas tudás-kapacitás, de a compute-költség alacsony marad).
:::::
::::::

:::::: section id=dm-1 heading="1. rész — A dense transformer" nav="1. rész" group="Elmélet"

<p class="topic-tagline">Cél: értsd, mi az a „sűrű", amihez a MoE-t viszonyítjuk.</p>

### Minden paraméter, minden token

Egy standard (dense) transformer minden blokkja két fő részből áll: egy **figyelem (attention)** rétegből és egy **feed-forward hálóból (FFN)**. A dense modellben az FFN egyetlen nagy háló, és **minden token áthalad rajta a teljes súlykészletével**. Ha a modell 70 milliárd paraméteres, akkor minden egyes token feldolgozásához mind a 70 milliárd „bekapcsol".

Ez a Llama 3.1 70B, a Qwen 2.5 72B, vagy a Gemma-vonal működése: kiszámítható, egyszerűen implementálható, és a viselkedése stabil. A hátránya, hogy a méret és a költség összekötve marad — nagyobb modell = arányosan drágább minden token.

### A bal oldal a képen

Az alábbi ábra bal fele mutatja ezt: egy token belép, végigmegy az *egyetlen, teljes* FFN-en (100% aktivált), és kilép. Nincs választás, nincs útválasztás — minden mindig fut.

![Dense és MoE feed-forward blokk összehasonlítása](assets/moe-01-dense-vs-moe.jpg)

A jobb oldal már a MoE — erről szól a következő szakasz.
::::::

:::::: section id=dm-2 heading="2. rész — A MoE alapötlet" nav="2. rész" group="Elmélet"

<p class="topic-tagline">Cél: értsd, hogyan cseréli le a MoE az egyetlen FFN-t sok expertre és egy routerre.</p>

### Egy FFN helyett sok „expert"

A MoE egyetlen dolgot változtat a transformer-blokkon: az egyetlen nagy FFN-t lecseréli **több párhuzamos FFN-re** (ezek az „expertek"), és mellé tesz egy könnyű **routert** (gating hálót), ami eldönti, melyik expert(ek) aktiválódjanak az adott tokenre.

A fenti ábra jobb fele ezt mutatja: a token a routerhez ér, az kiválaszt néhány expertet (a példában 4-ből 2-t), csak azok futnak le, és a kimenet a kiválasztottak súlyozott összege. A többi expert erre a tokenre **kikapcsolva** marad — nem számol, nem költ.

### Konkrét példa: Mixtral 8x7B

A Mixtral 8x7B rétegenként **8 expertet** tartalmaz, de tokenenként csak **2-t** aktivál. Emiatt a modellnek 46,7 milliárd total paramétere van (ez adja a tudás-kapacitást és a minőségi plafont), de tokenenként csak ~13 milliárd aktív (ez adja a compute-költséget és a késleltetést). Az eredmény: a Mixtral a sokkal kisebb aktív paraméterszáma ellenére a jóval nagyobb LLaMA-2-70B teljesítményét hozta, miközben hatszor gyorsabb volt.

::::: callout label="A név dekódolása"
A „8x7B" **nem** 56B-t jelent. A 8 expert *osztozik* az attention rétegeken és más komponenseken, ezért a total ~46,7B, nem 8×7. Ez a névkonvenció félrevezető — mindig a *total* és az *active* paraméterszámot nézd, ne a nevet.
:::::

### Fine-grained expertek — a modern irány

A DeepSeek V3 tovább vitte: 8 nagy expert helyett **256 apró** expertet használ, tokenenként 8 aktívval. Miért? A kombinatorika robban: 256-ból 8 kiválasztása ~4,3 milliárd lehetséges kombinációt ad (szemben a Mixtral 8-ból 2 = 28 kombinációjával). Ez sokkal specifikusabb tudás-célzást enged a routernek tokenenként. Emellett egy **megosztott (shared) expert** mindig aktív, ami a közös tudást (nyelvtan, szintaxis, alapténykek) szívja fel, felszabadítva a többit a specializációra.
::::::

:::::: section id=dm-3 heading="3. rész — A router működése (top-k gating)" nav="3. rész" group="Működés"

<p class="topic-tagline">Cél: értsd meg pontosan, hogyan dönti el a router, melyik expert fut.</p>

### A gating mechanizmus

A router szíve egy egyszerű **lineáris réteg**. A bemenő token vektorát (`x`) beszorozza egy súlymátrixszal, így minden experthez kap egy **logit**-ot (pontszámot), ami azt fejezi ki, mennyire „illik" az adott expert ehhez a tokenhez. Ezekre softmaxot alkalmaz, majd a **top-k** függvény kiválasztja a `k` legmagasabb pontszámú expertet — a többit nullázza. A kimenet a kiválasztott expertek kimeneteinek **súlyozott összege**, ahol a súlyok a (kiválasztottakra újranormált) softmax-értékek.

![A router működése — top-k gating](assets/moe-02-router.jpg)

### A képlet

Formálisan, egy `N` expertes réteg kimenete a `t` tokenre:

```text
h_t = u_t + Σᵢ  g_{i,t} · FFNᵢ(u_t)

ahol   g_{i,t} = s_{i,t}   ha i benne van a top-k-ban, különben 0
       s_{i,t} = softmax( gating_logit(u_t) )ᵢ
```

Vagyis: a router pontszámoz (`s`), kiválasztja a top-k-t (`g`), és csak azokat az experteket futtatja. A `u_t` (a reziduális kapcsolat) mindig hozzáadódik — ez az „autópálya", ami az információt akkor is átviszi, ha egy expertet nem választott a router.

### Miért „csak" top-k?

A `k` tipikusan 1 vagy 2 (a DeepSeek 8-at használ a 256 apró expertjéből). A kis `k` a lényeg: **ez adja a sparsityt**. Ha minden expertet aktiválnál, visszakapnád a dense modellt, csak bonyolultabban.
::::::

:::::: section id=dm-4 heading="4. rész — Total vs. Active: a sparsity és a félreértés" nav="4. rész" group="Működés"

<p class="topic-tagline">Cél: értsd meg a MoE két számát, és amit szinte mindenki félreért velük.</p>

### A két szám

Minden MoE modellnek két paraméterszáma van, és **mind a kettő fontos, de mást jelent**:

::::: stack-grid
:::: card label="Total paraméter"
A modell összes súlya. Ez határozza meg a **tudás-kapacitást** és a **VRAM-igényt** — mert az összes expertet be kell tölteni a memóriába.
::::
:::: card label="Active paraméter / token"
Amennyi ténylegesen fut egy token feldolgozásakor. Ez határozza meg a **compute-költséget**, a **sebességet** és a **latency-t**.
::::
:::::

A **sparsity** = active / total. Minél kisebb, annál agresszívebb a MoE.

![Total vs. Active paraméterek különböző modelleknél](assets/moe-03-params.jpg)

### Amit szinte mindenki félreért

Két gyakori hibás állítás a Mixtral 8x7B-ről (13B aktív, 46,7B total):

- „13B aktív, tehát úgy *fut*, mint egy 13B modell." — **Nem.** A memóriaigénye, a betöltési ideje és a KV-cache-kezelése a 46,7B-hez tartozik.
- „46,7B paraméter, tehát úgy *költ*, mint egy 46,7B modell." — **Az sem.** A tokenenkénti számítás a 13B-hez közeli.

Az igazság **regime-függő**. Egy hasznos heurisztika (Epoch AI) a „dense-ekvivalens" költség becslésére: `Total / (Expertek^0.44 / Aktív_expertek^0.63)` — vagyis a MoE tényleges „ereje" valahol a két szám között van, nem pontosan egyik sem.

::::: callout label="Gyakorlati fogódzó"
Egy 744B-os MoE (pl. GLM-5.2) ~40B-t aktivál tokenenként: a *számlád* egy 40B modell árazása szerint alakul, de a *tudásbázisod* egy 744B modell mélységével bír. Ez a MoE fő ígérete.
:::::
::::::

:::::: section id=dm-5 heading="5. rész — Load balancing: miért omlik össze router nélkül?" nav="5. rész" group="Működés"

<p class="topic-tagline">Cél: értsd, miért a router betanítása a MoE legkényesebb pontja.</p>

### A „routing collapse" probléma

Ha hagynád a routert szabadon tanulni, egy csúf dolog történne: **néhány expertet választana szinte mindig, a többit szinte sosem**. A népszerű expertek túlterhelődnek, a többi „elsorvad" (nem kap gradienst, nem tanul). Ezt hívják *routing collapse*-nek, és tönkreteszi a modellt — a total paraméterek nagy része haszontalanná válik.

### Három egyensúlyozó mechanizmus

::::: stack-grid
:::: card label="Auxiliary loss"
**Tanításkor.** Egy plusz veszteségtag bünteti az egyenetlen elosztást, a routert az egyenletes tokenszám felé nyomva. A Switch Transformer és a GShard klasszikus megoldása.
::::
:::: card label="Auxiliary-loss-free bias"
**A DeepSeek újítása.** Egy dinamikus, expertenkénti eltolás-tag (`bias`) tereli a routert az alulterhelt expertek felé — a task-gradienst nem zavarva. Emiatt tanul stabilan extrém skálán.
::::
:::: card label="Capacity factor + drop"
**Futásidőben.** Minden expertnek van kapacitás-plafonja; ha túlcsordul, a felesleges tokenek „ledobódnak" (a reziduális kapcsolaton mennek tovább, expert nélkül). Kompromisszum a memória és az információvesztés között.
::::
:::::

### Az auxiliary loss dióhéjban

A klasszikus load-balancing loss:

```text
L_balance = α · N · Σₑ ( fₑ · pₑ )

ahol   fₑ = az e expertre irányított tokenek aránya (tényleges terhelés)
       pₑ = az e expert átlagos router-valószínűsége (softmax előtt)
       α  = súlyozó együttható (hangolandó)
```

Ez akkor minimális, ha a terhelés egyenletes. Az `α` túl nagyra állítása viszont *alul-specializálttá* teszi az experteket (mindegyik ugyanazt tanulja) — ezért kényes egyensúly.

::::: callout warning label="Miért érdekes ez neked?"
Ha valaha finomhangolsz vagy futtatsz MoE modellt, a load balancing az, ami „elromlik" először. A tünet: néhány expert dominál, a modell minősége bizonyos feladatokon váratlanul beszakad. A megoldás majdnem mindig a routing / balancing beállításában van, nem a tudásban.
:::::
::::::

:::::: section id=dm-6 heading="6. rész — Sebesség, méret, hatékonyság: a csapda" nav="6. rész" group="Összehasonlítás"

<p class="topic-tagline">Cél: értsd meg a MoE legfontosabb, leggyakrabban elhallgatott kompromisszumát.</p>

### A MoE compute-ot spórol — memóriát NEM

Ez a legfontosabb mondat az egész témában. A MoE azért gyors, mert tokenenként kevés paramétert aktivál (kevés **compute**). De a router futásidőben *bármelyik* expertet választhatja, ezért **az összes expertet a GPU-memóriában kell tartani** — akkor is, ha csak töredékük fut. Vagyis a MoE a **compute**-on spórol, nem a **memórián**.

![A compute vs. memória kompromisszum](assets/moe-04-compute-vs-memory.jpg)

### Mit jelent ez a gyakorlatban?

- **Tanítás:** a MoE lényegesen olcsóbb azonos minőséghez — a Google MoE vs. dense összehasonlításában 6,4B skálán a MoE 2,06× gyorsabb volt lépésenként, jobb benchmark-eredmény mellett. A MoE akár 70%-kal alacsonyabb számítási költséget adhat hasonló méretű dense modellhez képest.
- **Inferencia sebesség:** gyors, mert kevés az aktív paraméter (Mixtral ~6× gyorsabb, mint a hasonló minőségű dense).
- **VRAM:** viszont *nagy*, mert minden expert bent van. Egy 30B-A3B MoE (30B total, 3B aktív) VRAM-igénye a 30B-hez tartozik, nem a 3B-hez.

### A számok (2026)

| Modell | Total | Active | Sparsity | Jelleg |
|---|---|---|---|---|
| Llama 3.1 70B | 70B | 70B | 100% | Dense |
| Mixtral 8x7B | 46,7B | 13B | ~28% | MoE, 8 expert / top-2 |
| Qwen3-Coder 30B-A3B | 30B | ~3B | ~10% | MoE, lokálisan futtatható |
| DeepSeek V3 | 671B | 37B | ~5,5% | MoE, 256 fine-grained + shared |
| DeepSeek V4-Pro | 1600B | 49B | ~3,1% | MoE, agresszív sparsity |

::::: callout label="A KV-cache bónusz"
Mivel a MoE expert-súlyai „szétosztódnak", GPU-nként kevesebb súly kell, ami helyet hagy a **KV-cache-nek** (a modell rövidtávú memóriája). Így egy MoE gyakran hosszabb kontextust (128k+ token) bír el ugyanazon a hardveren, mint egy azonos aktív-méretű dense.
:::::
::::::

:::::: section id=dm-7 heading="7. rész — Előny / hátrány mérlegen" nav="7. rész" group="Összehasonlítás"

<p class="topic-tagline">Cél: lásd egyben, mit nyersz és mit veszítesz mindkét irányban.</p>

### Dense

::::: stack-grid
:::: card label="Előny"
Egyszerű implementáció · kiszámítható viselkedés · nincs routing-instabilitás · a VRAM = a modell mérete (nincs meglepetés) · könnyebb finomhangolni és kvantálni.
::::
:::: card label="Hátrány"
A méret és a compute összekötve — drágán skálázódik · adott VRAM-nál alacsonyabb tudás-plafon · a tanítás költsége gyorsan nő.
::::
:::::

### MoE

::::: stack-grid
:::: card label="Előny"
Hatalmas tudás-kapacitás alacsony tokenenkénti compute mellett · gyorsabb tanítás és inferencia azonos minőséghez · jobb adat-kihasználtság (~16%-kal a hasonló budget-ű dense felett) · hosszabb kontextus ugyanazon a hardveren.
::::
:::: card label="Hátrány"
Nagy VRAM-igény (minden expert bent) · összetett tanítás (load balancing, routing collapse) · nehezebb kvantálni és finomhangolni · a viselkedés kevésbé kiszámítható · a routing overhead és az all-to-all kommunikáció elosztott futtatásnál költséges.
::::
:::::

### A lényegi kompromisszum egy táblában

| Szempont | Dense | MoE |
|---|---|---|
| **Compute / token** | Magas (minden paraméter) | Alacsony (csak aktív) |
| **VRAM** | = modell mérete | Nagy (= total, minden expert) |
| **Tudás-kapacitás adott compute-nál** | Alacsonyabb | Magasabb |
| **Tanítási költség azonos minőséghez** | Magasabb | Alacsonyabb |
| **Implementáció / stabilitás** | Egyszerű, kiszámítható | Összetett, routing-érzékeny |
| **Finomhangolás / kvantálás** | Könnyebb | Nehezebb |
| **Tipikus 2026 példa** | Gemma-vonal, Claude (jelek szerint) | DeepSeek, Qwen3-MoE, Mixtral, GPT-vonal (pletyka) |
::::::

:::::: section id=dm-8 heading="Feladat — Egy MoE-réteg kézzel (Python)" nav="Feladat" group="Gyakorlat"

<p class="topic-tagline">Cél: építsd meg a router + expert logikát nulláról, hogy tényleg megértsd.</p>

### Minimális MoE-réteg, numpy-jal

Ez nem produkciós kód — didaktikai célú, hogy lásd a top-k gating és a súlyozott összegzés mechanikáját:

```python
import numpy as np

np.random.seed(0)

D = 8        # rejtett dimenzió (token-vektor mérete)
N_EXPERTS = 4
TOP_K = 2

# 4 "expert" — mindegyik egy pici lineáris réteg (a valóságban FFN)
experts = [np.random.randn(D, D) * 0.3 for _ in range(N_EXPERTS)]

# router: egy lineáris réteg, ami expertenként ad egy logitot
W_router = np.random.randn(D, N_EXPERTS) * 0.3

def softmax(z):
    z = z - z.max()
    e = np.exp(z)
    return e / e.sum()

def moe_layer(x):
    # 1) a router pontszámoz minden expertet
    logits = x @ W_router                 # (N_EXPERTS,)
    probs = softmax(logits)

    # 2) top-k kiválasztás
    topk_idx = np.argsort(probs)[-TOP_K:]        # a 2 legjobb expert indexe
    # a súlyokat a kiválasztottakra újranormáljuk
    topk_w = probs[topk_idx] / probs[topk_idx].sum()

    # 3) csak a kiválasztott experteket futtatjuk, súlyozva összegzünk
    out = np.zeros(D)
    for idx, w in zip(topk_idx, topk_w):
        out += w * (x @ experts[idx])     # csak ez a 2 expert "aktív"

    # 4) reziduális kapcsolat (az "autópálya")
    return x + out, topk_idx, probs

x = np.random.randn(D)
out, chosen, probs = moe_layer(x)

print("Router valószínűségek:", np.round(probs, 3))
print("Kiválasztott expertek :", sorted(chosen.tolist()))
print("Aktív expertek        :", TOP_K, "/", N_EXPERTS,
      f"({TOP_K/N_EXPERTS:.0%} compute ezen a rétegen)")
```

::::: callout label="Gyakorlat"
Futtasd le többször, különböző `x` bemenetekkel — figyeld, hogy más-más tokenre más experteket választ a router (ez a „specializáció"). Aztán állítsd `TOP_K = 4`-re: ekkor minden expert aktív, és visszakaptad a **dense** viselkedést, csak drágábban. Ez a demonstrációja annak, hogy a sparsity a `k < N` választásból ered.
:::::

### Extra feladat — load balancing megfigyelése

Bővítsd a kódot: futtass 1000 véletlen tokent a rétegen, és számold meg, hányszor választotta a router az egyes experteket. Rajzold ki (vagy csak írasd ki) az eloszlást. Nagy eséllyel **egyenetlen** lesz — ez élőben mutatja a routing collapse-hajlamot, és azt, miért kell a load-balancing loss az 5. részből.
::::::

:::::: section id=dm-9 heading="9. rész — Mikor melyiket? Döntés és lokális futtatás" nav="9. rész" group="Gyakorlat"

<p class="topic-tagline">Cél: gyakorlati fogódzó — mint felhasználó/fejlesztő mikor melyik jobb neked.</p>

### Mint modell-választó (nem tréner)

A legtöbben nem tanítanak MoE-t, hanem *használnak* egy kész modellt. Neked a döntés így egyszerűsödik:

::::: stack-grid
:::: card label="Válassz MoE-t, ha…"
Erős minőség kell, van elég **VRAM** a total paraméterekhez (vagy felhőben futtatod), és fontos a **tokenenkénti sebesség/költség**. Pl. agentic kódolás lokálisan: Qwen3-Coder 30B-A3B.
::::
:::: card label="Válassz dense-t, ha…"
Korlátozott a VRAM-od az adott minőséghez, **kvantálni** vagy **finomhangolni** akarsz (egyszerűbb dense-en), vagy kiszámítható, stabil viselkedés kell kevés meglepetéssel.
::::
:::::

### Lokális futtatás — a te setupodban (Ollama)

A 30B-A3B MoE a te 2026-os homelabodban is elérhető. Példa a Qwen3-Coder MoE lokális futtatására:

```bash
# a MoE modell letöltése és futtatása Ollamával
ollama pull qwen3-coder:30b
ollama run qwen3-coder:30b
```

```python
# programozott hívás a lokális MoE-hez (OpenAI-kompatibilis Ollama endpoint)
import requests

r = requests.post("http://localhost:11434/api/generate", json={
    "model": "qwen3-coder:30b",
    "prompt": "Írj egy Python függvényt, ami QR-kódból kiolvassa a deeplinket.",
    "stream": False,
})
print(r.json()["response"])
```

::::: callout warning label="A KV-cache csapda lokálisan"
Egy 30B-A3B MoE Q4-en elfér egy 24 GB-os GPU-n — de figyelj a **kontextus-méretre**. Ha az alapértelmezett nagy kontextust (pl. 256k) hagyod, a KV-cache kiszorulhat a rendszer-RAM-ba, és a sebesség egy számjegyű token/mp-re esik. Állíts reális kontextust (pl. 8k–32k) a hardveredhez, hogy a modell a GPU-n maradjon.
:::::

### Az iparági kép egy mondatban

2026-ban a nyílt súlyú frontier gyakorlatilag teljesen MoE (GLM-5.2, DeepSeek V4-Pro, Kimi K2.6, Qwen3-vonal, Llama 4). A dense nem halott — a Claude-vonal jelek szerint dense/enyhén-MoE, és lokális, VRAM-korlátos vagy finomhangolós használatnál továbbra is versenyképes. A választás nem „melyik jobb", hanem „melyik illik a hardveredhez és a feladatodhoz".
::::::

:::::: section id=dm-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A tutorial végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0–2. rész"
A scaling-fal · Dense = minden paraméter aktív · MoE = sok expert, kevés aktív
::::
:::: card label="3–4. rész"
Top-k gating router · Total vs. Active · Sparsity · A gyakori félreértés
::::
:::: card label="5. rész"
Routing collapse · Auxiliary loss · Auxiliary-loss-free bias · Capacity factor
::::
:::: card label="6–7. rész"
Compute vs. memória csapda · Sebesség/méret/hatékonyság · Előny/hátrány mérleg
::::
:::: card label="Feladat"
MoE-réteg kézzel numpy-jal · Router + top-k · Load balancing megfigyelése
::::
:::: card label="9. rész"
Modell-választás · Lokális MoE Ollamával · KV-cache csapda
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>Local LLM</em> és a <em>vektor-adatbázisok</em> tutorialok — a MoE modellek lokális futtatása és a köréjük épülő RAG-infrastruktúra.</p>
::::::
