---
page: kv-cache
title: KV-cache
sidebar_groups:
  - Elmélet
  - Működés
  - Optimalizáció
  - Gyakorlat
  - Referencia
hero:
  eyebrow: "KV-cache · Fejlesztői Tanulási Terv"
  title: "A <em>KV-cache</em>"
  lead: "Miért nem számolja újra egy LLM az egész beszélgetést minden egyes szónál? A kulcs-érték gyorsítótár működése, a memória-matek, és a 2026-os optimalizációk (PagedAttention, GQA, MLA, kvantálás), amik a hosszú kontextust egyáltalán megfizethetővé teszik. Visszakötve a <em>MoE</em>, a <em>vektorok</em> és a <em>context window</em> témákhoz."
  stats:
    - { val: "9", lbl: "Szakasz" }
    - { val: "4", lbl: "Feladat" }
    - { val: "2", lbl: "Ábra" }
    - { val: "4-40×", lbl: "Költség-csökkenés" }
footer:
  left: "AI Hub · KV-cache"
  right: "KV-cache · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#kv-0"><div class="tc-num">0. rész</div><div class="tc-name">Miért kell?</div><div class="tc-desc">A négyzetes újraszámolás problémája.</div></a>
  <a class="toc-card" href="#kv-1"><div class="tc-num">1. rész</div><div class="tc-name">Q, K, V — az attention</div><div class="tc-desc">Honnan jön a Key és a Value.</div></a>
  <a class="toc-card" href="#kv-2"><div class="tc-num">2. rész</div><div class="tc-name">Hogyan működik</div><div class="tc-desc">Prefill és decode, tárolás és újrafelhasználás.</div></a>
  <a class="toc-card" href="#kv-3"><div class="tc-num">Feladat 1</div><div class="tc-name">Cache kézzel</div><div class="tc-desc">A mechanika ~30 sorban.</div></a>
  <a class="toc-card" href="#kv-4"><div class="tc-num">3. rész</div><div class="tc-name">A memória-matek</div><div class="tc-desc">Mitől és mennyire nő a cache.</div></a>
  <a class="toc-card" href="#kv-5"><div class="tc-num">4. rész</div><div class="tc-name">PagedAttention</div><div class="tc-desc">OS-lapozás a KV-cache-nek.</div></a>
  <a class="toc-card" href="#kv-6"><div class="tc-num">5. rész</div><div class="tc-name">GQA, MQA, MLA</div><div class="tc-desc">Architektúra-szintű tömörítés.</div></a>
  <a class="toc-card" href="#kv-7"><div class="tc-num">6. rész</div><div class="tc-name">Kvantálás & prefix cache</div><div class="tc-desc">FP8/INT4 és az újrafelhasználás.</div></a>
  <a class="toc-card" href="#kv-8"><div class="tc-num">7. rész</div><div class="tc-name">Lokális gyakorlat</div><div class="tc-desc">A KV-cache csapda a homelabodban.</div></a>
</div>
::::::

:::::: section id=kv-0 heading="0. rész — Miért kell KV-cache?" nav="0. rész" group="Elmélet"

<p class="topic-tagline">Cél: értsd meg, milyen pazarlást szüntet meg — és miért nélküle nem létezne valós idejű szöveggenerálás.</p>

### A probléma: a modell minden lépésnél visszanéz

Egy transformer **egyszerre egy tokent** generál. Hogy eldöntse, mi a következő szó, minden új token „visszanéz" az összes korábbira egy **attention** számításban. A baj: naivan ez azt jelenti, hogy minden egyes új tokennél **az egész eddigi szekvenciát újra feldolgozná**. Egy 70B-os modellnél 128K kontextuson ez lépésenként milliárdnyi lebegőpontos műveletet jelentene — újra és újra, ugyanazokra a régi tokenekre.

A költség így **négyzetesen** nő a szöveg hosszával: minél többet írt már a modell, annál drágább minden további szó. Valós idejű streaming ezzel elképzelhetetlen lenne.

### A megoldás: tárold el, amit már kiszámoltál

A **KV-cache (kulcs-érték gyorsítótár)** egyszerű ötlet: a korábbi tokenek attention-számításához tartozó **Key (K)** és **Value (V)** tenzorokat **egyszer** számold ki, tárold el, és **használd újra** minden további lépésben. Így minden új tokennél már csak *egyetlen* token K,V-jét kell kiszámolni — a négyzetes probléma **lineárissá** válik.

![KV-cache mechanika: minden újraszámolása vs. tárolt K,V újrafelhasználása](assets/kv-01-mechanism.jpg)

A bal oldal a naiv eset (minden lépésnél mindent újraszámol — piros a felesleg), a jobb a KV-cache (a régi K,V tárolva — zöld, csak az új token narancs).

::::: callout label="Egy mondatban"
**A KV-cache a régi tokenek Key és Value tenzorait tárolja, hogy ne kelljen újraszámolni őket.** Ez teszi a token-generálást négyzetesből lineárissá — a modern LLM-inferencia egyik legfontosabb optimalizációja.
:::::
::::::

:::::: section id=kv-1 heading="1. rész — Q, K, V: honnan jön a Key és a Value?" nav="1. rész" group="Elmélet"

<p class="topic-tagline">Cél: értsd, mit is tárolunk valójában — és miért pont K-t és V-t.</p>

### Az attention három mátrixa

Minden token feldolgozásakor az attention-mechanizmus **három vektort** állít elő a token beágyazásából (ha az embedding fogalma nem tiszta, a vektor-adatbázis tutorial 1-2. része adja meg az alapot):

::::: stack-grid
:::: card label="Query (Q)"
„Mit keresek?" — az **aktuális** token kérdése a többiek felé. Ez minden lépésben új, **nem** cache-elhető.
::::
:::: card label="Key (K)"
„Mit kínálok?" — minden token „címkéje", amivel a Query-k megtalálhatják. A **korábbi** tokeneké fix — **cache-elhető**.
::::
:::: card label="Value (V)"
„Mi a tartalmam?" — a token tényleges információja, amit átad, ha egy Query rátalál. Szintén fix a régiekre — **cache-elhető**.
::::
:::::

### Miért csak K és V?

A számítás lényege: az új token **Query**-je az összes korábbi token **Key**-ével összemérődik (ez adja a figyelmi súlyokat), majd ezek a súlyok a **Value**-kat kombinálják. A korábbi tokenek K-ja és V-je **nem változik** attól, hogy új token jött — ezért érdemes eltárolni. A Query mindig az aktuális tokené, így azt nincs értelme cache-elni.

::::: callout label="Kapcsolat a vektorokhoz"
Ez a Q·K összevetés fogalmilag rokon a vektor-adatbázis tutorial **hasonlóság-számításával** (dot product): ott egy kérdés-vektort mérsz össze tárolt dokumentum-vektorokkal, itt egy Query-t tárolt Key-ekkel. Mindkettő „mennyire illik ez ehhez" — más léptékben.
:::::
::::::

:::::: section id=kv-2 heading="2. rész — Hogyan működik: prefill és decode" nav="2. rész" group="Működés"

<p class="topic-tagline">Cél: értsd a két fázist, amiben a cache felépül és használódik.</p>

### A két fázis

::::: stack-grid
:::: card label="Prefill (a prompt feldolgozása)"
A modell a **teljes bemenő promptot** egyszerre dolgozza fel, és **feltölti a cache-t** minden prompt-token K,V-jével. Ez párhuzamosítható, ezért gyors — de nagy prompt esetén ez az egyszeri „belépő" költség.
::::
:::: card label="Decode (a válasz generálása)"
A modell tokenenként generál. Minden lépésben **egyetlen** új token K,V-jét számolja ki, hozzáfűzi a cache-hez, és a Query-jét a **teljes cache-elt** K,V ellen futtatja. Innen jön a sebesség.
::::
:::::

### Amit fontos érteni: a cache pontos, nem közelítés

A standard KV-cache **matematikailag azonos** azzal, mintha mindent újraszámolnál — nulla pontosságvesztés. Csak a felesleges ismétlést kerüli el. (Ez fontos különbség a később tárgyalt *kvantált* cache-hez képest, ami már cserél némi pontosságot memóriáért.)

### A modell mint állapotgép

A cache miatt a generálás **állapotot** tart: a beszélgetés „emlékezete" ebben a fázisban a KV-cache-ben él.

::::: callout warning label="Fogalmi elhatárolás — ne keverd a memory-val"
A KV-cache **nem** ugyanaz, mint a memory tutorial „memóriája". A KV-cache egy **futásidejű, egyetlen inferencia-menetre** szóló gyorsítótár a GPU-ban, ami a válasz végén eldobható. A memory tutorial perzisztens, session-ökön átívelő tárról szólt (vektor-DB-ben). A közös csak a szó: itt hardver-szintű cache, ott alkalmazás-szintű tudástár.
:::::
::::::

:::::: section id=kv-3 heading="Feladat 1 — KV-cache kézzel (a mechanika)" nav="Feladat 1" group="Gyakorlat"

<p class="topic-tagline">Cél: építsd meg a tárol-és-újrafelhasznál logikát, hogy lásd, miért lesz lineáris.</p>

### Minimál demó numpy-jal

Ez nem valódi attention — leegyszerűsített modell, ami a **cache-elés mechanikáját** mutatja: a régi K,V-t nem számoljuk újra, csak az újat fűzzük hozzá.

```python
import numpy as np

np.random.seed(0)
D = 4  # rejtett dimenzió

# egy token "beágyazása" -> K és V vetítése (a valóságban tanult mátrixok)
Wk, Wv = np.random.randn(D, D), np.random.randn(D, D)

class KVCache:
    def __init__(self):
        self.K, self.V = [], []   # a tárolt kulcsok és értékek

    def add_token(self, token_emb):
        # CSAK az új token K,V-jét számoljuk ki — a régit nem bántjuk
        k = token_emb @ Wk
        v = token_emb @ Wv
        self.K.append(k)
        self.V.append(v)
        return k, v

    def attention(self, query):
        # a query az ÖSSZES tárolt kulcs ellen fut (dot product — mint a vektor-hasonlóság)
        K = np.array(self.K)                     # (n_tokens, D)
        scores = K @ query                       # (n_tokens,)
        weights = np.exp(scores) / np.exp(scores).sum()  # softmax
        return weights @ np.array(self.V)        # súlyozott Value-összeg

cache = KVCache()
prompt = [np.random.randn(D) for _ in range(4)]   # 4 prompt-token

# --- PREFILL: a teljes prompt betöltése a cache-be ---
for tok in prompt:
    cache.add_token(tok)
print(f"Prefill után a cache mérete: {len(cache.K)} token")

# --- DECODE: minden lépésnél CSAK 1 új token K,V-je számolódik ---
for step in range(3):
    new_tok = np.random.randn(D)
    q = new_tok @ np.random.randn(D, D)   # az új token Query-je
    out = cache.attention(q)              # a teljes cache ellen fut
    cache.add_token(new_tok)              # az új token bekerül a cache-be
    print(f"{step+1}. decode lépés → cache mérete most: {len(cache.K)} token "
          f"(csak 1 új K,V számolódott)")
```

::::: callout label="Gyakorlat"
Adj a `add_token`-hez egy számlálót, ami összeadja, hány K,V-számítás történt összesen. Futtasd 100 token generálásáig **cache-sel** (ahogy most van) és **cache nélkül** (ahol minden lépésben újraszámolod az összes korábbi K,V-t). Vesd össze a két számot — a cache-sel ~100 számítás, nélküle ~5000. Ez a lineáris vs. négyzetes különbség élőben.
:::::
::::::

:::::: section id=kv-4 heading="3. rész — A memória-matek: mitől nő a cache?" nav="3. rész" group="Működés"

<p class="topic-tagline">Cél: tudd kiszámolni, mekkora VRAM-ot eszik a KV-cache — mert ez lesz a szűk keresztmetszet.</p>

### A képlet

A KV-cache mérete néhány tényező **szorzata**:

```text
KV_cache_méret ≈ 2 × rétegek × kv_fejek × fej_dim × szekvencia_hossz × batch × bájt/érték

  2          → külön Key ÉS Value
  bájt/érték → a precizitás (FP16 = 2 bájt, FP8 = 1, INT4 = 0.5)
```

A lényeg, amit érdemes megjegyezni: a cache **lineárisan nő a kontextus-hosszal és a batch-mérettel**. A kontextus duplázása (8K → 16K) **duplázza** a maximális KV-cache-t kérésenként.

### A meglepő fordulat: a cache nagyobb lehet, mint a modell

![KV-cache memória a kontextussal, és az optimalizációs karok](assets/kv-02-memory.jpg)

Konkrét szám: egy Llama 3 8B GQA-val, FP16-on, tokenenként ~0,1 MB cache-t használ. Egy 70B modell 32 kérést kiszolgálva 8K kontextuson ~83 GB cache-t igényel — ez gyakran **túllépi magának a modell súlyainak méretét**. 128K kontextus fölött a KV-cache memóriája nagyobb, mint a paraméter-memória; egy Llama 70B 1M kontextuson ~135 GB-ot eszik FP16-on — több, mint a 140 GB-os modellsúly.

::::: callout warning label="A hot path átfordul"
Rövid kontextuson az inferencia **compute-kötött** (a számítás a szűk keresztmetszet). Ahogy a kontextus nő, a KV-cache miatt **memória-kötötté** válik — a szűk keresztmetszet a memória-sávszélesség lesz, nem a FLOP-ok. Ekkor az optimalizációs prioritások megfordulnak: nem gyorsabb GPU kell, hanem kisebb/okosabb cache.
:::::

### Kapcsolat a MoE-hez

A **dense vs. MoE** tutorialban láttad: a MoE azért fér el hosszú kontextussal ugyanazon a hardveren, mert az expert-súlyok „szétosztódnak", és így **több VRAM marad a KV-cache-nek**. Most már látod, miért számít ez annyira — a KV-cache a hosszú kontextus valódi ára.
::::::

:::::: section id=kv-5 heading="4. rész — PagedAttention: OS-lapozás a cache-nek" nav="4. rész" group="Optimalizáció"

<p class="topic-tagline">Cél: értsd, hogyan szünteti meg a memória-pazarlást a vLLM alapmegoldása.</p>

### A pazarlás-probléma

Naivan a rendszer a **maximális** szekvenciahosszra foglal összefüggő memóriát minden kéréshez — akkor is, ha a válasz rövid lesz. Ez hatalmas pazarlás: a mért fragmentáció **60-80%** volt, mielőtt megoldották.

### A megoldás: lapozás, mint az operációs rendszerben

A **PagedAttention** (a vLLM újítása) az operációs rendszerek **virtuális memória** koncepcióját hozza a KV-cache-be: a cache-t **fix méretű blokkokra** osztja (tipikusan 16 token/blokk), és **igény szerint** foglalja őket, ahogy a szekvencia nő. Egy *block table* képezi le a logikai pozíciókat a fizikai GPU-memóriára — pont, ahogy az OS a lapokat kezeli.

Az eredmény: a memória-pazarlás **60-80%-ról 4% alá** esett, ami **2-4× nagyobb áteresztőképességet** (throughput) tesz lehetővé, mert több kérés fér egyszerre a GPU-ba. 2026-ra ez alap-infrastruktúra: a vLLM, a HuggingFace TGI, a TensorRT-LLM és az LMDeploy mind támogatja.

::::: callout label="Miért érdekes ez neked?"
Ha valaha modellt szolgálsz ki a homelabodban (nem csak Ollamával futtatod, hanem vLLM-mel több kérést szolgálsz), a PagedAttention az, ami eldönti, hány párhuzamos kérést bírsz el ugyanazon a GPU-n. Ez a fajta „batch több felhasználót egy kártyára" a self-hosted setup gazdaságosságának kulcsa.
:::::
::::::

:::::: section id=kv-6 heading="5. rész — GQA, MQA, MLA: architektúra-szintű tömörítés" nav="5. rész" group="Optimalizáció"

<p class="topic-tagline">Cél: értsd, hogyan csökkentik a modell felépítésébe építve a cache méretét.</p>

### A KV-fejek megosztása

A standard (multi-head) attention minden Query-fejhez külön Key- és Value-fejet tart — sok fej = nagy cache. A megoldás: **osszák meg** a KV-fejeket.

::::: stack-grid
:::: card label="MHA (alap)"
Multi-Head Attention: minden Query-fejnek saját K,V feje. Legnagyobb cache, referencia-pont.
::::
:::: card label="MQA"
Multi-Query Attention: **egyetlen** K,V fej, amin az összes Query-fej osztozik. Legkisebb cache, de minőség-kompromisszum.
::::
:::: card label="GQA — a de facto standard"
Grouped-Query Attention: köztes út — pl. 64 Query-fej osztozik 8 K,V fejen. **4-8× kisebb** cache, minimális pontosságvesztéssel. A Llama-vonal ezt használja.
::::
:::: card label="MLA — a DeepSeek megoldása"
Multi-Head Latent Attention: nem a fejeket osztja meg, hanem a **reprezentációt tömöríti** — a K,V-t egy alacsony dimenziós latens térbe vetíti tárolás előtt, és számításkor visszafejti.
::::
:::::

### Az MLA jelentősége

Az MLA a K,V-t egy **latens vektorrá** sűríti (ez a low-rank projekció rokon azzal, ahogy a vektor-DB tutorialban a dimenzió-csökkentésről volt szó). Az eredmény drámai: **93,3% KV-cache csökkenés** a standard MHA-hoz képest, a DeepSeek-V2 pedig **5,76× nagyobb** maximális generálási áteresztőképességet ért el az elődjéhez képest — a pontosság megtartása vagy javítása mellett.

::::: callout label="Miért olcsóbb a DeepSeek hosszú kontextuson?"
Az MLA az architekturális oka annak, hogy a DeepSeek V2/V3/V4 gazdaságosan kínál 1M kontextust. A tömörítési arány (7-14×) **összeszorzódik** az FP8 kvantálással (2×) és a prefix cache-sel — így a millió-tokenes kontextus KV-memóriája produkciósan is elviselhető szintre kerül. A GQA-s versenytársak papíron ugyanezt a kontextushosszt hozzák, de 2-4× GPU-költséggel szolgálják ki.
:::::
::::::

:::::: section id=kv-7 heading="6. rész — Kvantálás és prefix caching" nav="6. rész" group="Optimalizáció"

<p class="topic-tagline">Cél: két további kar — az egyik memóriát, a másik ismétlődő számítást spórol.</p>

### KV-cache kvantálás

A cache-elt K,V tenzorokat **alacsonyabb precizitáson** tárolhatod, mint a modell számítási precizitása — tipikusan FP8 vagy INT4 az FP16 helyett:

| Precizitás | Bájt/érték | Megtakarítás | Minőség |
|---|---|---|---|
| FP16 (alap) | 2 | — | referencia |
| FP8 / INT8 | 1 | **50%** | gyakran mérési zajon belüli |
| INT4 | 0,5 | **75%** | kis, de észlelhető romlás |

Miért működik jól? Az attention-számítás **toleráns a precizitás-csökkentésre**, mert a softmax-normalizálás kiátlagolja a kis kerekítési hibákat. Az FP8 KV-cache-t a vLLM natívan támogatja NVIDIA Hopper és Blackwell GPU-kon.

::::: callout warning label="Két külön kvantálás — ne keverd"
A KV-cache kvantálás **más**, mint a modellsúlyok kvantálása (pl. a 4-bit AWQ, amit Ollamában látsz a `Q4` jelölésnél). Az egyik a *cache-t* tömöríti futásidőben, a másik magát a *modellt* a lemezen/VRAM-ban. Kombinálhatók.
:::::

### Prefix caching

Ha sok kérés **ugyanazzal a prefixszel** kezdődik (pl. egy hosszú, közös rendszer-prompt, vagy egy dokumentum, amiről többen kérdeznek), akkor annak a prefixnek a KV-cache-ét **egyszer** kiszámolod és **újrahasznosítod** minden kérésnél. A vLLM és az SGLang (RadixAttention) ezt automatikusan kezeli — találat esetén 5-12× gyorsulás a prefill fázisban.

::::: callout label="Kapcsolat a RAG-hoz és a context engineeringhez"
A prefix caching közvetlenül jutalmazza a **stabil prompt-szerkezetet**: ha a rendszer-prompt és a ritkán változó kontextus a prompt **elején** van (fix prefix), és csak a kérdés változik a végén, a prefix cache sokkal többször „talál". Ez egy újabb ok — a RAG tutorial „lost in the middle" szempontja mellett —, amiért a prompt szerkezete, nem csak a tartalma számít.
:::::
::::::

:::::: section id=kv-8 heading="7. rész — Lokális gyakorlat: a KV-cache csapda" nav="7. rész" group="Gyakorlat"

<p class="topic-tagline">Cél: kösd össze az elméletet a te homelab-tapasztalatoddal.</p>

### A csapda, amit a MoE tutorialban már láttál

A dense vs. MoE tutorial 9. részében felmerült a „KV-cache csapda": egy modell elfér a GPU-don a súlyai alapján, de ha nagy kontextust állítasz be, a **KV-cache kiszorul a rendszer-RAM-ba**, és a sebesség egy számjegyű token/mp-re esik. Most már érted a mechanizmust mögötte: a cache lineárisan nő a kontextussal (3. rész), és egy ponton nem fér a VRAM-ba a súlyok mellé.

### Amit tehetsz Ollamában / lokálisan

```bash
# a kontextus-ablak explicit korlátozása, hogy a KV-cache a GPU-n maradjon
# (Ollama: a num_ctx paraméter)
ollama run qwen3-coder:30b --num-ctx 8192
```

```python
# programozottan (Ollama API) — reális kontextus a hardveredhez
import requests
requests.post("http://localhost:11434/api/generate", json={
    "model": "qwen3-coder:30b",
    "prompt": "...",
    "options": {"num_ctx": 8192},   # ne hagyd a 256k alapértelmezést, ha nem fér el
    "stream": False,
})
```

### A döntési logika

::::: stack-grid
:::: card label="Ha spill-el a RAM-ba"
Csökkentsd a `num_ctx`-et · válassz GQA/MLA-alapú modellt (kisebb cache) · használj kvantált modellt (`Q4`), hogy több VRAM maradjon a cache-nek · vagy fogadd el a rövidebb kontextust.
::::
:::: card label="Ha több kérést szolgálsz ki"
Válts Ollamáról vLLM-re (PagedAttention + prefix caching) · kapcsold be az FP8 KV-cache-t, ha Hopper/Blackwell GPU-d van · struktúráld a promptot fix prefixszel a prefix-cache találatokért.
::::
:::::

::::: callout label="Gyakorlat"
Futtass egy lokális modellt kétféle `num_ctx`-szel (pl. 4096 és 65536), és mérd a token/mp sebességet ugyanarra a promptra. Figyeld a GPU vs. rendszer-RAM használatot (pl. `nvidia-smi`). A nagy kontextusnál a sebesség beszakadása pontosan az a pillanat, amikor a KV-cache kiszorul a VRAM-ból — a saját szemeddel látod a 3. rész matekját.
:::::
::::::

:::::: section id=kv-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A tutorial végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0–1. rész"
Négyzetes → lineáris · Q, K, V szerepe · miért csak K-t és V-t cache-elünk
::::
:::: card label="2. rész + Feladat 1"
Prefill vs. decode · a cache pontos, nem közelítés · a mechanika kézzel
::::
:::: card label="3. rész"
A memória-képlet · lineáris növekedés · a cache nagyobb lehet a modellnél
::::
:::: card label="4–5. rész"
PagedAttention (OS-lapozás) · GQA/MQA · MLA (93% csökkenés)
::::
:::: card label="6. rész"
FP8/INT4 kvantálás · prefix caching · stabil prompt-prefix
::::
:::: card label="7. rész"
A KV-cache csapda lokálisan · num_ctx · mikor válts vLLM-re
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>dense vs. MoE</em> (a KV-cache csapda eredete), a <em>vektor-adatbázisok</em> (Q·K mint hasonlóság, low-rank projekció) és a <em>RAG</em> (prefix caching és prompt-szerkezet) tutorialok.</p>
::::::
