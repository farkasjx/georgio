---
page: vectordb
title: Vektor-adatbázisok
sidebar_groups:
  - Elmélet
  - Működés
  - Adatbázisok
  - Gyakorlat
  - Éles használat
  - Referencia
hero:
  eyebrow: "Vektor-DB · Fejlesztői Tanulási Terv"
  title: "Vektor-<em>adatbázisok</em>"
  lead: "Mi az az embedding, hogyan lesz szövegből vektor, és hogyan keres egy vektor-DB milliárd elem között milliszekundumok alatt. Elmélet, indexelés (HNSW/IVFFlat), három adatbázis kézzel — Chroma, Qdrant, pgvector — feladatokkal és éles kóddal. <em>A RAG és a memory alatt mindig ez dolgozik.</em>"
  stats:
    - { val: "12", lbl: "Szakasz" }
    - { val: "7", lbl: "Feladat" }
    - { val: "3", lbl: "Adatbázis" }
    - { val: "HNSW", lbl: "Index" }
footer:
  left: "AI Hub · Vektor-adatbázisok"
  right: "Vektor-DB · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#vec-0"><div class="tc-num">0. rész</div><div class="tc-name">Miért kell?</div><div class="tc-desc">A hasonlóság-keresés problémája, mikor kell vektor-DB.</div></a>
  <a class="toc-card" href="#vec-1"><div class="tc-num">1. rész</div><div class="tc-name">Mi a vektor?</div><div class="tc-desc">Embedding, dimenziók, a jelentés mint irány.</div></a>
  <a class="toc-card" href="#vec-2"><div class="tc-num">2. rész</div><div class="tc-name">Embedding készítés</div><div class="tc-desc">Hogyan lesz szövegből vektor — kézzel.</div></a>
  <a class="toc-card" href="#vec-3"><div class="tc-num">3. rész</div><div class="tc-name">Távolság & hasonlóság</div><div class="tc-desc">Koszinusz, dot product, euklideszi — a számítás.</div></a>
  <a class="toc-card" href="#vec-4"><div class="tc-num">4. rész</div><div class="tc-name">Indexelés (ANN)</div><div class="tc-desc">HNSW vs. IVFFlat — hogyan gyors.</div></a>
  <a class="toc-card" href="#vec-5"><div class="tc-num">5. rész</div><div class="tc-name">Vektor vs. relációs vs. gráf</div><div class="tc-desc">Miben más, mint amit ismersz.</div></a>
  <a class="toc-card" href="#vec-6"><div class="tc-num">Adatbázisok</div><div class="tc-name">A landscape</div><div class="tc-desc">Chroma, Qdrant, pgvector, Milvus, Weaviate, Pinecone.</div></a>
  <a class="toc-card" href="#vec-7"><div class="tc-num">Feladat A</div><div class="tc-name">ChromaDB</div><div class="tc-desc">Prototípus, beágyazott, Python.</div></a>
  <a class="toc-card" href="#vec-8"><div class="tc-num">Feladat B</div><div class="tc-name">Qdrant</div><div class="tc-desc">Self-host Dockerrel, Python + Node.</div></a>
  <a class="toc-card" href="#vec-9"><div class="tc-num">Feladat C</div><div class="tc-name">pgvector</div><div class="tc-desc">Postgres + vektorok egy DB-ben.</div></a>
  <a class="toc-card" href="#vec-10"><div class="tc-num">10. rész</div><div class="tc-name">Éles használat</div><div class="tc-desc">Chunkolás, hybrid search, metaadat, tuning.</div></a>
  <a class="toc-card" href="#vec-11"><div class="tc-num">11. rész</div><div class="tc-name">Döntési keret</div><div class="tc-desc">Melyiket válaszd, és mikor.</div></a>
</div>
::::::

:::::: section id=vec-0 num="00" heading="0. rész — Miért kell vektor-adatbázis?" nav="Miért kell vektoradatbázis?" group="Elmélet"

<p class="topic-tagline">Cél: értsd, milyen problémát old meg, amit egy hagyományos DB nem.</p>

### A probléma: hasonlóság, nem egyezés

Egy hagyományos adatbázis **pontos egyezésre** épül: `WHERE nev = 'FJ'`, `WHERE ar < 1000`. De mi van, ha azt kérded: „add a *jelentésben* hasonló dokumentumokat"? Egy relációs DB nem tudja, hogy a „konténerizáció" és a „Docker" rokon fogalmak — számára ezek csak eltérő karakterláncok.

A vektor-adatbázis **szemantikus hasonlóságra** keres. Nem azt kérdezi, „melyik sor egyezik pontosan", hanem „melyik elem áll *legközelebb jelentésben* a lekérdezésemhez". Ezt úgy éri el, hogy mindent **vektorrá** (számsorrá) alakít, ami a jelentést kódolja, majd a vektorok közti *távolságot* méri.

### Mikor kell — és mikor nem

::::: stack-grid
:::: card label="Kell, ha…"
Szemantikus keresés · RAG (dokumentum-visszakeresés LLM-hez) · ajánlórendszer („hasonló termékek") · kép/hang/kód hasonlóság · deduplikáció · anomália-detektálás · LLM-memory.
::::
:::: card label="NEM kell, ha…"
Pontos lookup kulcs alapján · strukturált szűrés/aggregáció (`SUM`, `GROUP BY`) · tranzakciós adat (rendelés, számla) · kis adathalmaz, ahol egy lineáris végignézés is elég gyors (<10k elem).
::::
:::::

::::: callout warning label="Gyakori tévedés"
A vektor-DB **nem** helyettesíti a relációs adatbázist — kiegészíti. A rendeléseidet, felhasználóidat, tranzakcióidat továbbra is Postgresben tárolod. A vektor-DB csak a „mi hasonlít mire" kérdésre válaszol. Sok éles rendszer **mindkettőt** használja (vagy épp a pgvectorral egyben).
:::::
::::::

:::::: section id=vec-1 num="01" heading="1. rész — Mi az a vektor és az embedding?" nav="Vektor és embedding" group="Elmélet"

<p class="topic-tagline">Cél: értsd meg, hogy a „jelentés" egy irány egy sokdimenziós térben.</p>

### A vektor mint koordináta

Egy **vektor** egyszerűen egy számsor: `[0.12, -0.44, 0.98, ...]`. Geometriai értelemben ez egy **pont (vagy irány) egy sokdimenziós térben**. Ahogy egy 2D pontot két szám ír le `(x, y)`, egy embedding-vektort tipikusan **384–3072 szám** ír le — vagyis 384–3072 dimenziós térben él.

### Az embedding: jelentés → szám

<p class="topic-tagline" style="margin-top:0">Az <strong>embedding</strong> az a folyamat, amikor egy tartalmat (szöveg, kép, hang) egy neurális háló egy jelentés-hordozó vektorrá alakít.</p>

A kulcs-tulajdonság: **a jelentésben hasonló dolgok vektorai közel kerülnek egymáshoz** a térben, a különbözőek távol. Egy jó embedding-modellben:

```text
"macska"  → [0.21, 0.88, ...]  ┐ közel egymáshoz
"cica"    → [0.23, 0.85, ...]  ┘ (hasonló jelentés)
"traktor" → [-0.6, 0.10, ...]  → messze (más jelentés)
```

A híres példa, ami megmutatja, hogy a térben *irányoknak* jelentése van:

```text
vektor("király") - vektor("férfi") + vektor("nő") ≈ vektor("királynő")
```

Vagyis a „nem" mint fogalom egy konzisztens *irány* a térben. Az embedding-modell ezt a struktúrát tanulja meg hatalmas szövegkorpuszon.

### Dimenziók — mennyi kell?

| Modell | Dimenzió | Jellemző |
|---|---|---|
| `all-MiniLM-L6-v2` | 384 | Kicsi, gyors, jó prototípushoz |
| `nomic-embed-text` (Ollama) | 768 | Lokális, ingyenes, jó minőség |
| OpenAI `text-embedding-3-small` | 1536 | Erős, olcsó API |
| OpenAI `text-embedding-3-large` | 3072 | Legerősebb, drágább |

Több dimenzió = több árnyalat kódolható, de több tárhely és lassabb keresés. A **cél nem a maximum**, hanem a feladathoz elég.

::::: callout label="Gyakorlat"
Gondolj három szópárra a saját szakterületedről (pl. „QA / tesztelés", „Docker / konténer", „PostgreSQL / traktor"). Tippeld meg, melyik pár lesz közel a vektortérben és melyik távol. A 2. feladatban tényleg kiszámoljuk.
:::::
::::::

:::::: section id=vec-2 num="02" heading="2. rész — Hogyan lesz szövegből embedding? (kézzel)" nav="Szöveg → embedding" group="Működés"

<p class="topic-tagline">Cél: állítsd elő az első vektoraidat, és nézd meg őket.</p>

### Lokálisan, Ollamával (nomic-embed-text)

A te stackedhez a legkézenfekvőbb lokális út — nincs API-kulcs, nincs adat-kiszivárgás:

```python
import requests

def embed(text):
    r = requests.post(
        "http://localhost:11434/api/embeddings",
        json={"model": "nomic-embed-text", "prompt": text},
    )
    return r.json()["embedding"]

v = embed("QA mérnök vagyok, teszteléssel foglalkozom.")
print(len(v))   # → 768 (a vektor dimenziója)
print(v[:5])    # → [0.031, -0.44, 0.12, ...] az első 5 komponens
```

### Python-natívan (sentence-transformers)

Ha nem akarsz futó Ollamát, egy self-contained könyvtár:

```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")  # letölti, majd lokálisan fut
vecs = model.encode(["macska", "cica", "traktor"])
print(vecs.shape)   # → (3, 384): 3 vektor, egyenként 384-dimenziós
```

### Node — API-n keresztül (Anthropic-környezet nincs embeddinghez, más provider kell)

Node-ban tipikusan egy embedding-provider REST-jét hívod (pl. OpenAI, vagy a lokális Ollama):

```javascript
async function embed(text) {
  const r = await fetch("http://localhost:11434/api/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "nomic-embed-text", prompt: text }),
  });
  const data = await r.json();
  return data.embedding;   // number[]
}

const v = await embed("Konténerizáció Dockerrel");
console.log(v.length);     // → 768
```

::::: callout label="Gyakorlat"
Ágyazd be a 1. részben kitalált három szópáradat, és írasd ki mindegyik vektor hosszát (dimenzió) és első pár komponensét. Még nem tudod „elolvasni" a számokat — a 3. részben mérjük meg, mennyire hasonlók.
:::::
::::::

:::::: section id=vec-3 num="03" heading="3. rész — Távolság és hasonlóság: hogyan számolódik?" nav="Távolság és hasonlóság" group="Működés"

<p class="topic-tagline">Cél: értsd meg a matekot, ami eldönti, mi „hasonló".</p>

### A három fő metrika

Két vektor „hasonlóságát" a köztük lévő **geometriai viszony** adja. Három elterjedt mérőszám:

::::: stack-grid
:::: card label="Koszinusz-hasonlóság"
A két vektor közti **szög**. Csak az *irányt* nézi, a hosszt nem. `1` = azonos irány (nagyon hasonló), `0` = merőleges, `-1` = ellentétes. **A szöveges embeddingnél ez a leggyakoribb.**
::::
:::: card label="Dot product (skaláris szorzat)"
Irány + nagyság együtt. Ha a vektorok normalizáltak (egységhosszúak), matematikailag megegyezik a koszinusszal — ezért sok DB ezt használja gyorsításra.
::::
:::: card label="Euklideszi (L2) távolság"
A két pont közti „légvonalbeli" távolság. `0` = azonos pont. Akkor jó, ha a nagyság is számít (pl. kép-featureök).
::::
:::::

### A koszinusz-hasonlóság képlete és kódja

A koszinusz-hasonlóság: a két vektor skaláris szorzata, osztva a hosszaik szorzatával.

```text
cos(A, B) = (A · B) / (|A| × |B|)

ahol   A · B  = Σ (aᵢ × bᵢ)          (komponensenkénti szorzatok összege)
       |A|    = √(Σ aᵢ²)             (a vektor hossza / normája)
```

Python, függőség nélkül — hogy lásd, mi történik a motorháztető alatt:

```python
import math

def dot(a, b):
    return sum(x * y for x, y in zip(a, b))

def norm(a):
    return math.sqrt(sum(x * x for x in a))

def cosine_similarity(a, b):
    return dot(a, b) / (norm(a) * norm(b))

# a 2. részből:
cat    = embed("macska")
kitten = embed("cica")
tractor = embed("traktor")

print(cosine_similarity(cat, kitten))   # → ~0.82  (hasonló)
print(cosine_similarity(cat, tractor))  # → ~0.31  (nem hasonló)
```

Élesben ezt nem kézzel számolod — `numpy`-jal vektorizálva, vagy a DB végzi natívan. De ez a néhány sor **az egész vektor-keresés lelke**: minden „hasonló elem" lekérdezés a háttérben ilyen számításokból áll.

::::: callout label="Gyakorlat"
Számold ki a három szópárod koszinusz-hasonlóságát a fenti kóddal. Egyezik-e a tipped az 1. részből? Próbálj ki egy trükkös párt is: „bank (pénzintézet)" vs. „bank (folyópart)" — a kontextus nélküli szó gyakran félrevezető, ezért fontos a *mondat*-szintű embedding.
:::::
::::::

:::::: section id=vec-4 num="04" heading="4. rész — Indexelés: hogyan gyors milliárd elemnél is?" nav="Indexelés" group="Működés"

<p class="topic-tagline">Cél: értsd, miért nem néz végig a DB minden vektort — és hogyan csinálja ANN-nel.</p>

### A naiv megoldás és a baja

A legegyszerűbb keresés: számold ki a lekérdezés hasonlóságát **minden** tárolt vektorral, és vedd a legjobbat. Ez a **brute-force / exact kNN**. Pontos, de a költsége lineáris: 1 milliárd vektornál minden egyes kereséshez 1 milliárd összehasonlítás. Használhatatlan.

A megoldás: **ANN (Approximate Nearest Neighbor)** — feláldozol egy kevés pontosságot (recall) cserébe nagyságrendekkel nagyobb sebességért. A DB egy okos **indexet** épít, ami csak a vektorok kis, releváns részét nézi végig.

### A két meghatározó index

::::: stack-grid
:::: card label="HNSW — a de facto standard"
**Hierarchical Navigable Small World.** Egy többrétegű gráf: minden vektor egy csomópont, a szomszédaihoz élekkel kötve. A felső réteg ritka („autópályák" nagy ugrásokhoz), az alsó sűrű (finom keresés). A lekérdezés felül belép, és rétegről rétegre közelít a célhoz. **95%+ recall alap-beállítással, kezeli a folyamatos beszúrást újraépítés nélkül.** Cserébe 2–5× több memória.
::::
:::: card label="IVFFlat — klaszter-alapú"
**Inverted File.** K-means-szel klaszterekre (Voronoi-cellákra) osztja a vektorokat. Kereséskor csak a lekérdezéshez legközelebbi néhány klasztert nézi végig. Gyorsabban épül, kevesebb memória — de reprezentatív adat kell az index építésekor, és ahogy az adat „elsodródik", a recall romlik (időnkénti újraépítés kell).
::::
:::::

### HNSW paraméterek (amit tuningolni fogsz)

A HNSW két fő építési paramétere határozza meg a minőség/memória/sebesség egyensúlyt:

| Paraméter | Mit szabályoz | Tipikus érték |
|---|---|---|
| `m` | Élek száma csomópontonként. Több = jobb recall, több memória. | 16 (16–64 a gyakorlati sáv) |
| `ef_construction` | Keresési szélesség építéskor. Több = jobb gráf, lassabb build. | 200 (production) |
| `ef_search` | Keresési szélesség lekérdezéskor. Több = jobb recall, lassabb query. | 40 (futásidőben állítható) |

::::: callout warning label="A döntési szabály"
**HNSW-t válaszd** a legtöbb esetben ~10M vektor alatt, aktív írások mellett — „állítsd be egyszer, felejtsd el". **IVFFlat-ot** csak akkor, ha nagyon nagy, jórészt statikus az adat, és a memória vagy a build-idő a szűk keresztmetszet. A pgvectorban az IVFFlat kritikus buktatója: ha **üres** táblán építed az indexet, értelmetlen centroidokat kapsz és katasztrofális recall-t — figyelmeztetés nélkül. Mindig az adat betöltése *után* építsd.
:::::

### Benchmark-ízelítő (2026)

A számok magukért beszélnek arról, miért nem mindegy a méret és az index. Nagy léptékű (50M vektor) tesztekben a dedikált, vektorra optimalizált motorok és a jól hangolt Postgres-kiterjesztések között nagyságrendi különbség is lehet a másodpercenkénti lekérdezésszámban. A Rust-alapú Qdrant a nyílt forrású mezőnyben a késleltetés terén vezet: 10M vektornál a p99 késleltetése jellemzően 12 ms körül van, szemben a Weaviate ~16 ms-ával és a Milvus ~18 ms-ával. A lényeg: a HNSW gráf-alapú keresés komplexitása logaritmikusan nő, nem lineárisan, ezért kezel jól milliárdos nagyságrendet.
::::::

:::::: section id=vec-5 num="05" heading="5. rész — Vektor vs. relációs vs. gráf adatbázis" nav="Vektor vs. relációs vs. gráf" group="Elmélet"

<p class="topic-tagline">Cél: helyezd el a vektor-DB-t a már ismert adatbázis-világodban.</p>

### A három paradigma egy mondatban

::::: stack-grid
:::: card label="Relációs (PostgreSQL)"
**Struktúra + pontos egyezés.** Táblák, sorok, oszlopok, `JOIN`-ok. „Add a 2024-es, 1000 Ft alatti rendeléseket." Erőssége: tranzakciók, integritás, aggregáció.
::::
:::: card label="Gráf (Neo4j)"
**Kapcsolatok.** Csomópontok és élek. „Ki ismer valakit, aki ismeri X-et?" Erőssége: több lépcsős, explicit kapcsolat-bejárás (social graph, fraud-hálózat).
::::
:::: card label="Vektor (Chroma, Qdrant)"
**Jelentésbeli hasonlóság.** Pontok egy sokdimenziós térben. „Mi hasonlít *jelentésben* erre?" Erőssége: fuzzy, szemantikus keresés strukturálatlan adaton.
::::
:::::

### Összehasonlító tábla

| Szempont | Relációs | Gráf | Vektor |
|---|---|---|---|
| **Alapmodell** | Táblák/sorok | Csomópontok/élek | Sokdim. vektorok |
| **Fő lekérdezés** | Pontos egyezés, szűrés | Kapcsolat-bejárás | Közelség (kNN) |
| **Példa kérdés** | „Ki a user #42?" | „Kik a barátai barátai?" | „Mi hasonlít erre?" |
| **Kapcsolat kezelése** | `JOIN` (implicit) | Él (explicit, gyors) | Nincs natív fogalom |
| **Adat típusa** | Strukturált | Kapcsolat-gazdag | Strukturálatlan (szöveg, kép) |
| **Eredmény** | Determinisztikus | Determinisztikus | **Valószínűségi** (approximate) |

### A kulcskülönbség: a válasz jellege

A relációs és gráf DB **determinisztikus**: egy sor vagy megvan, vagy nincs. A vektor-keresés **rangsorolt és közelítő**: nem „egyezik/nem egyezik", hanem „ez a top 5 legvalószínűbb találat, hasonlósági pontszámmal". Ez másfajta gondolkodást igényel — nincs „helyes" válasz, csak „elég jó" a recall és a küszöb függvényében.

::::: callout label="A gyakorlatban gyakran együtt"
Egy modern rendszer rétegez: **Postgres** a tranzakciós adatnak, **vektor-index** (akár ugyanabban a Postgresben, pgvectorral) a szemantikus kereséshez, néha **gráf** a kapcsolatokhoz. A pgvector épp azért népszerű, mert a relációs és a vektor-világot **egy adatbázisban, egy tranzakcióban** egyesíti.
:::::
::::::

:::::: section id=vec-6 heading="Adatbázisok — a 2026-os landscape" nav="A landscape" group="Adatbázisok"

<p class="topic-tagline">Cél: lásd a mezőnyt, mielőtt hármat kézzel kipróbálsz.</p>

### A hat név, amivel újra és újra találkozol

A produkciós telepítések többségét ma hat név fedi le: pgvector, Pinecone, Qdrant, Weaviate, Milvus és Chroma. Röviden, mire való melyik:

| Adatbázis | Típus | Erőssége | Mikor |
|---|---|---|---|
| **Chroma** | Beágyazott / szerver, OSS | Fejlesztői élmény, egyszerűség | Prototípus, lokális fejlesztés, tanulás |
| **Qdrant** | Dedikált, OSS (Rust) | Sebesség, szűrés, self-host | Új app, ahol a vektor a központ és a latency számít |
| **pgvector** | Postgres-kiterjesztés | Egy rendszer relációs + vektor | Már van Postgres appod, <50M vektor |
| **Weaviate** | Dedikált, OSS | Natív hybrid search, beépített embedding | Ha kulcsszó + vektor + szűrő együtt kell |
| **Milvus** | Dedikált, OSS | Milliárdos skála, index-flexibilitás | Nagyon nagy adat, van ops-csapat |
| **Pinecone** | Menedzselt (SaaS) | Zero-ops, menedzselt skálázás | Ha fizetsz a nyugalomért, nem akarsz üzemeltetni |

### Az őszinte döntés — a szakirodalom szerint

A 2026-os gyakorlati útmutatók meglepően egybehangzók. Ha őszinte vagy azzal kapcsolatban, mire van szükséged, a válasz általában egyértelmű: meglévő Postgres app 50M vektor alatt → pgvector; új app, ahol a vektor a központ és a sebesség számít → Qdrant, ha a hybrid search számít → Weaviate; zero ops és fizetsz érte → Pinecone; Python-prototípus → Chroma; milliárdos nagyságrend valódi ops-csapattal → Milvus vagy Vespa.

::::: callout warning label="Fontos, amit a benchmarkok nem mérnek"
A retrieval pontosságát végső soron **az adat minősége** határozza meg, nem a p99 latency. Egy vektor-tár csak azt tudja visszaadni, amit betöltöttél bele — a rossz chunkok (boilerplate navigáció, duplikált fejlécek, tört markdown, háromszor indexelt ugyanaz a bekezdés) rossz találatokat adnak, bármilyen alacsony is a késleltetés. A chunkolásra és az ingestre legalább annyi figyelmet fordíts, mint a DB-választásra (lásd 10. rész).
:::::

### A választott három

A gyakorlati feladatokban ezt a hármat vesszük kézbe, mert lefedik a spektrumot és illenek a te stackedhez:

::::: stack-grid
:::: card label="A · Chroma"
A leggyorsabb út az első működő vektor-kereséshez. Beágyazott, Python-natív, nulla infra.
::::
:::: card label="B · Qdrant"
Self-hosted, Dockerrel a homelabodba. Éles-közeli, gyors, REST + gRPC, Python és Node kliens.
::::
:::: card label="C · pgvector"
A Postgresed, amit már ismersz és üzemeltetsz — most vektorokkal. Egy DB mindenre.
::::
:::::
::::::

:::::: section id=vec-7 heading="Feladat A — ChromaDB (prototípus)" nav="Feladat A" group="Gyakorlat"

<p class="topic-tagline">Cél: első működő szemantikus keresés, nulla infrastruktúrával.</p>

### Telepítés

```bash
pip install chromadb
```

### Alap: tárolás és keresés (beépített embedding)

A Chroma alapból tartalmaz egy embedding-modellt, így nyers szöveget adhatsz be — magától vektorizál:

```python
import chromadb

client = chromadb.PersistentClient(path="./chroma_db")   # lemezre perzisztál
col = client.get_or_create_collection("dokumentumok")

col.add(
    documents=[
        "A Docker konténerekbe csomagolja az alkalmazást.",
        "A PostgreSQL egy relációs adatbázis-kezelő.",
        "A Caddy egy modern reverse proxy automatikus HTTPS-sel.",
        "A macskák önálló, tisztaság-kedvelő háziállatok.",
    ],
    ids=["d1", "d2", "d3", "d4"],
    metadatas=[{"tema": "devops"}, {"tema": "db"}, {"tema": "devops"}, {"tema": "allat"}],
)

# szemantikus keresés — a "konténerizáció" szó nem szerepel sehol!
res = col.query(query_texts=["konténerizáció"], n_results=2)
for doc, dist in zip(res["documents"][0], res["distances"][0]):
    print(f"{dist:.3f}  {doc}")
# → a Docker-mondat lesz a legközelebb, pedig nincs benne a "konténerizáció" szó
```

### Metaadat-szűrés (hybrid: vektor + filter)

```python
# csak a "devops" témájú dokumentumok között keress
res = col.query(
    query_texts=["hálózati proxy"],
    n_results=2,
    where={"tema": "devops"},   # metaadat-szűrő a vektor-keresés mellé
)
print(res["documents"][0])
```

### Saját embedding-függvény (Ollama, lokális)

```python
from chromadb.utils.embedding_functions import OllamaEmbeddingFunction

ollama_ef = OllamaEmbeddingFunction(
    url="http://localhost:11434/api/embeddings",
    model_name="nomic-embed-text",
)
col = client.get_or_create_collection("docs_ollama", embedding_function=ollama_ef)
```

::::: callout label="Gyakorlat"
Tölts be 8-10 mondatot a saját munkádból (Nevogate, SimplePay, QA), vegyes metaadatokkal (`tema`, `nyelv`). Keress rá olyan fogalomra, ami *nincs* szó szerint egyik mondatban sem, de jelentésben rokon. Aztán szűkítsd metaadat-szűrővel. Ez a RAG magja kicsiben.
:::::
::::::

:::::: section id=vec-8 heading="Feladat B — Qdrant (self-hosted)" nav="Feladat B" group="Gyakorlat"

<p class="topic-tagline">Cél: éles-közeli, önállóan üzemeltetett vektor-DB a homelabodban.</p>

### Indítás Dockerrel

```bash
docker run -p 6333:6333 -p 6334:6334 \
  -v $(pwd)/qdrant_storage:/qdrant/storage \
  qdrant/qdrant
# REST: http://localhost:6333 · Web UI: http://localhost:6333/dashboard
```

### Python-kliens

```bash
pip install qdrant-client
```

```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

client = QdrantClient(url="http://localhost:6333")

# collection létrehozása — itt DÖNTÖD EL a dimenziót és a metrikát
client.recreate_collection(
    collection_name="dokumentumok",
    vectors_config=VectorParams(size=768, distance=Distance.COSINE),  # nomic = 768
)

# a 2. rész embed() függvényével vektorizálunk
docs = [
    "A Docker konténerekbe csomagolja az alkalmazást.",
    "A PostgreSQL egy relációs adatbázis.",
    "A macska önálló háziállat.",
]
points = [
    PointStruct(id=i, vector=embed(d), payload={"text": d, "tema": "vegyes"})
    for i, d in enumerate(docs)
]
client.upsert(collection_name="dokumentumok", points=points)

# keresés
hits = client.query_points(
    collection_name="dokumentumok",
    query=embed("konténerizáció"),
    limit=2,
).points
for h in hits:
    print(f"{h.score:.3f}  {h.payload['text']}")
```

### Node-kliens

```bash
npm install @qdrant/js-client-rest
```

```javascript
import { QdrantClient } from "@qdrant/js-client-rest";

const client = new QdrantClient({ url: "http://localhost:6333" });

await client.recreateCollection("dokumentumok", {
  vectors: { size: 768, distance: "Cosine" },
});

const docs = ["Docker konténer", "PostgreSQL adatbázis", "macska háziállat"];
await client.upsert("dokumentumok", {
  points: await Promise.all(
    docs.map(async (d, i) => ({
      id: i,
      vector: await embed(d),        // a Node embed() a 2. részből
      payload: { text: d },
    }))
  ),
});

const res = await client.query("dokumentumok", {
  query: await embed("konténerizáció"),
  limit: 2,
});
res.points.forEach(p => console.log(p.score.toFixed(3), p.payload.text));
```

::::: callout warning label="Fontos: te adod a vektort"
Chromával ellentétben a Qdrant **nem** vektorizál helyetted alapból — te számítod ki az embeddinget (Ollama/sentence-transformers) és úgy töltöd fel. Ez több kontroll, de több felelősség: a `size` a collectionben **pontosan** egyezzen az embedding-modelled dimenziójával, különben hibát kapsz.
:::::

::::: callout label="Gyakorlat"
Indítsd el a Qdrantot Dockerrel, nyisd meg a `/dashboard` web UI-t, és nézd meg vizuálisan a feltöltött pontokat. Adj a payloadhoz `tema` mezőt, és próbálj ki egy szűrt keresést (`query_filter`). Vesd össze a fejlesztői élményt a Chromáéval.
:::::
::::::

:::::: section id=vec-9 heading="Feladat C — pgvector (Postgres + vektorok)" nav="Feladat C" group="Gyakorlat"

<p class="topic-tagline">Cél: vektor-keresés a Postgresben, amit már üzemeltetsz — egy DB mindenre.</p>

### Kiterjesztés + tábla

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE dokumentumok (
    id     bigserial PRIMARY KEY,
    text   text,
    tema   text,
    embedding vector(768)          -- a nomic-embed-text dimenziója
);
```

### HNSW index (az adat betöltése után is építhető, üresen is működik)

```sql
CREATE INDEX ON dokumentumok
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 200);
```

### Beszúrás és keresés Pythonból

```bash
pip install "psycopg[binary]" pgvector
```

```python
import psycopg
from pgvector.psycopg import register_vector

conn = psycopg.connect("postgresql://user:pass@localhost/mydb")
register_vector(conn)

docs = [
    ("A Docker konténerekbe csomagol.", "devops"),
    ("A PostgreSQL relációs adatbázis.", "db"),
    ("A macska háziállat.", "allat"),
]
with conn.cursor() as cur:
    for text, tema in docs:
        cur.execute(
            "INSERT INTO dokumentumok (text, tema, embedding) VALUES (%s, %s, %s)",
            (text, tema, embed(text)),        # a 2. rész embed()-je
        )
    conn.commit()

# szemantikus keresés: a <=> a koszinusz-TÁVOLSÁG operátor
q = embed("konténerizáció")
with conn.cursor() as cur:
    cur.execute(
        "SELECT text, 1 - (embedding <=> %s) AS similarity "
        "FROM dokumentumok ORDER BY embedding <=> %s LIMIT 2",
        (q, q),
    )
    for text, sim in cur.fetchall():
        print(f"{sim:.3f}  {text}")
```

### A pgvector szuperképessége: SQL + vektor egy lekérdezésben

```sql
-- relációs szűrés ÉS szemantikus rangsorolás EGYÜTT, egy tranzakcióban
SELECT text, 1 - (embedding <=> :query_vec) AS similarity
FROM dokumentumok
WHERE tema = 'devops'                    -- relációs szűrő (indexelhető)
ORDER BY embedding <=> :query_vec        -- vektor-közelség
LIMIT 5;
```

Ezt egy külön vektor-DB-vel csak két rendszer összehangolásával érnéd el. Postgresben egy `SELECT`.

::::: callout warning label="Distance operátorok"
A pgvectorban az operátor a metrikát választja: `<=>` koszinusz-távolság, `<->` euklideszi (L2), `<#>` negatív dot product. A `vector_cosine_ops` indexnek a `<=>` operátorral kell párosulnia. A hasonlóság = `1 - távolság`.
:::::

::::: callout label="Gyakorlat"
Hozz létre egy `dokumentumok` táblát a saját Postgresedben, tölts fel 10 sort embeddinggel, építs HNSW indexet, és futtass egy kombinált (szűrő + vektor) lekérdezést. Nézd meg `EXPLAIN ANALYZE`-zal, használja-e az indexet — QA-mérnökként ez a fajta verifikáció otthonos lesz.
:::::
::::::

:::::: section id=vec-10 num="10" heading="10. rész — Éles használat: chunkolás, hybrid search, tuning" nav="Éles használat" group="Éles használat"

<p class="topic-tagline">Cél: a prototípustól a produkciós minőségig — ahol a valódi munka van.</p>

### Chunkolás — a leggyakoribb hibaforrás

Egy hosszú dokumentumot nem egyben ágyazol be, hanem **darabokra (chunk) vágod**. A retrieval minősége leginkább ezen múlik.

::::: stack-grid
:::: card label="Túl nagy chunk"
Hígul a jelentés — egy 2000 szavas chunk vektora „átlagol", és semmire sem lesz igazán közel. Rossz recall.
::::
:::: card label="Túl kicsi chunk"
Elvész a kontextus — egy fél mondat vektora önmagában értelmetlen. Töredezett találatok.
::::
:::: card label="Jó gyakorlat"
~200–500 token / chunk, **10–20% átfedéssel** (overlap), lehetőleg szemantikus határon (bekezdés, szekció), ne szó közepén.
::::
:::: card label="Metaadat"
Minden chunkhoz tedd el a forrást, oldalszámot, szekciócímet — így a találat visszavezethető és szűrhető.
::::
:::::

### Hybrid search — vektor + kulcsszó

A tiszta vektor-keresés gyenge a pontos tokeneknél: termékkód (`YARIS-2024`), hibakód, tulajdonnév. A **hybrid search** kombinálja a szemantikus (dense) és a kulcsszavas (sparse, pl. BM25) keresést, majd az eredményeket **re-rank**-eli. A Weaviate és a Qdrant ezt natívan tudja; pgvectorban a `tsvector` full-text kereséssel párosítható.

### Metrika, amit figyelj

| Fogalom | Mit jelent |
|---|---|
| **Recall** | A releváns találatok hány %-át találta meg a közelítő keresés (vs. brute-force). |
| **Latency (p95/p99)** | A lekérdezések 95/99%-a ennyi idő alatt lefut — a farok számít, nem az átlag. |
| **QPS** | Query per second — az áteresztőképesség. |

A `ef_search` (HNSW) növelése javítja a recall-t, de rontja a latency-t — ez a fő futásidejű tuning-kar.

::::: callout danger label="Éles buktatók"
**✗** Üres táblán épített IVFFlat index → katasztrofális recall, figyelmeztetés nélkül · **✗** Nem egyező dimenzió a collection és az embedding-modell között → hiba vagy szemét · **✗** Modellváltás újra-embedding nélkül → a régi és új vektorok nem összemérhetők, mindent újra kell ágyazni · **✗** PII a payloadban titkosítás/hozzáférés-kontroll nélkül · **✗** Chunkolás átfedés nélkül → a határon lévő infó elvész.
:::::
::::::

:::::: section id=vec-11 num="11" heading="11. rész — Döntési keret: melyiket, mikor?" nav="Döntési keret" group="Éles használat"

<p class="topic-tagline">Cél: egy gyakorlatias algoritmus a választáshoz — a te helyzetedre szabva.</p>

### A négy tengely

A választás négy tengelyen dől el: skála (hány vektor), hosting (menedzselt vs. self-hosted), költség (a valós forgalmadnál), és szűrés (hybrid search, metaadat, multi-tenancy) — nem a szalagcím-benchmarkokon.

### Gyors döntési fa

::::: stack-grid
:::: card label="Már van Postgresed?"
És <50M vektor? → **pgvector**. Egy rendszerrel kevesebb üzemeltetni. A te Nevogate/Pálya stackednél ez a kézenfekvő első lépés.
::::
:::: card label="Új app, vektor a központ?"
Sebesség számít → **Qdrant** (Rust, gyors, jó szűrés). Hybrid search kell → **Weaviate**.
::::
:::: card label="Csak prototípus / tanulás?"
→ **Chroma**. Nulla infra, Python-natív, pár perc alatt működik.
::::
:::: card label="Zero-ops, fizetsz érte?"
→ **Pinecone** (menedzselt). Milliárdos skála + ops-csapat → **Milvus**.
::::
:::::

::::: callout warning label="A migráció szabálya"
Amivel a RAG-projektet kezded, ritkán az, amivel élesben szállítod. Kezdd egyszerűen (Chroma vagy pgvector), mérj valós adaton és forgalmon, és csak akkor válts dedikált rendszerre, ha a mérés indokolja. A korai over-engineering ugyanolyan hiba, mint a késői skálázás.
:::::
::::::

:::::: section id=vec-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A tutorial végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0–1. rész"
Mikor kell vektor-DB · Mi az embedding · A jelentés mint irány a térben
::::
:::: card label="2–3. rész"
Embedding készítés (Ollama, sentence-transformers) · Koszinusz-hasonlóság kézzel
::::
:::: card label="4. rész"
ANN · HNSW vs. IVFFlat · m / ef_construction / ef_search tuning
::::
:::: card label="5. rész"
Vektor vs. relációs vs. gráf · Determinisztikus vs. valószínűségi keresés
::::
:::: card label="Feladat A–C"
Chroma (prototípus) · Qdrant (self-host) · pgvector (Postgres-integrált)
::::
:::: card label="10–11. rész"
Chunkolás · Hybrid search · Recall/latency · Döntési keret
::::
:::::

<p class="topic-tagline">Kapcsolódó: az <em>LLM & Agent Memory</em> tutorial — a memory és a RAG épp erre a vektor-keresési alapra épül.</p>
::::::
