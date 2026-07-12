---
page: rag
title: RAG — Retrieval-Augmented Generation
sidebar_groups:
  - Elmélet
  - Alap pipeline
  - Technikák
  - Gyakorlat
  - Éles használat
  - Referencia
hero:
  eyebrow: "RAG · Fejlesztői Tanulási Terv"
  title: "RAG — <em>Retrieval-Augmented Generation</em>"
  lead: "Hogyan alapozd meg egy LLM válaszait a saját dokumentumaidon, hallucináció helyett. Mikor éri meg és mikor nem, hogyan épül fel a pipeline, és milyen haladó technikák (reranking, hybrid, agentic, GraphRAG) emelik a pontosságot. Épít a <em>vektor-adatbázis</em> és a <em>memory</em> tutorialokra."
  stats:
    - { val: "11", lbl: "Szakasz" }
    - { val: "5", lbl: "Feladat" }
    - { val: "44→63%", lbl: "Naiv → haladó" }
    - { val: "RAGAS", lbl: "Kiértékelés" }
footer:
  left: "AI Hub · RAG"
  right: "RAG · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#rag-0"><div class="tc-num">0. rész</div><div class="tc-name">Mi az és miért?</div><div class="tc-desc">A hallucináció-probléma, Karpathy keretezése.</div></a>
  <a class="toc-card" href="#rag-1"><div class="tc-num">1. rész</div><div class="tc-name">Mikor kell, mikor nem</div><div class="tc-desc">RAG vs. finetuning vs. long context.</div></a>
  <a class="toc-card" href="#rag-2"><div class="tc-num">2. rész</div><div class="tc-name">Az alap pipeline</div><div class="tc-desc">Indexelés + lekérdezés, végponttól végpontig.</div></a>
  <a class="toc-card" href="#rag-3"><div class="tc-num">Feladat 1</div><div class="tc-name">Naiv RAG</div><div class="tc-desc">Minimál működő pipeline, ~40 sor.</div></a>
  <a class="toc-card" href="#rag-4"><div class="tc-num">3. rész</div><div class="tc-name">Chunkolás</div><div class="tc-desc">A legnagyobb minőségi kar.</div></a>
  <a class="toc-card" href="#rag-5"><div class="tc-num">4. rész</div><div class="tc-name">Hybrid search</div><div class="tc-desc">Dense + sparse (BM25) + RRF.</div></a>
  <a class="toc-card" href="#rag-6"><div class="tc-num">5. rész</div><div class="tc-name">Reranking</div><div class="tc-desc">Cross-encoder a pontosságért.</div></a>
  <a class="toc-card" href="#rag-7"><div class="tc-num">6. rész</div><div class="tc-name">Haladó minták</div><div class="tc-desc">Agentic, GraphRAG, RAPTOR, adaptive.</div></a>
  <a class="toc-card" href="#rag-8"><div class="tc-num">7. rész</div><div class="tc-name">Kiértékelés</div><div class="tc-desc">RAGAS, Recall@K, MRR, nDCG.</div></a>
  <a class="toc-card" href="#rag-9"><div class="tc-num">8. rész</div><div class="tc-name">Éles buktatók</div><div class="tc-desc">Lost in the middle, context rot.</div></a>
  <a class="toc-card" href="#rag-10"><div class="tc-num">9. rész</div><div class="tc-name">Döntési keret</div><div class="tc-desc">Melyik mintát, mikor.</div></a>
</div>
::::::

:::::: section id=rag-0 heading="0. rész — Mi az a RAG és miért kell?" nav="0. rész" group="Elmélet"

<p class="topic-tagline">Cél: értsd, milyen problémát old meg, és hol a helye a context engineeringben.</p>

### A probléma: az LLM nem ismeri a te adatodat

Egy nyelvi modell csak azt „tudja", amit a tanításkor látott. A céged dokumentációja, a terméktörzsed, a support-ticket előzményeid, a saját kódbázisod — ezekből semmi nem látható automatikusan a modell számára. Ha ilyesmiről kérdezed, két rossz kimenet lehet: vagy azt mondja, „nem tudom", vagy — sokkal rosszabb — **magabiztosan hallucinál** egy jól hangzó, de hamis választ.

A **RAG (Retrieval-Augmented Generation)** megoldása egyszerű: mielőtt a modell válaszol, **visszakeresünk** néhány releváns dokumentum-részletet egy külső tárból, és **beillesztjük a promptba**. A modell így a *visszakeresett tényekben megalapozva* (grounded) válaszol, nem a homályos, tanításkori emlékezetéből.

### Karpathy keretezése: az LLM mint CPU, a context mint RAM

Andrej Karpathy 2025 júniusában népszerűsítette a *context engineering* fogalmát, amit így írt le: a context window „just the right information"-nal való megtöltésének kényes művészete és tudománya a következő lépéshez. A hozzá tartozó analógia a legvilágosabb belépő: az LLM olyan, mint a CPU, a context window pedig mint a RAM — a modell munkamemóriája. Minden, amiről a modell egyetlen válasz alatt gondolkodni tud, ebbe a véges pufferbe kell, hogy beférjen, mielőtt az első szó megszületik.

A RAG ebben a képben az a mechanizmus, ami **eldönti, mi kerüljön a RAM-ba**. Nem az egész tudásbázist tömöd a promptba (az nem is férne be, és „elhígítaná" a jelet), hanem külső, kereshető tárban tartod, és lekérdezéskor csak a *pillanatnyi kérdéshez* legrelevánsabb részeket injektálod. A RAG tehát a context engineering központi eszköze.

::::: callout label="Egy mondatban"
**RAG = a modell tudjon többet a *te* világodról anélkül, hogy újratanítanád.** Külső tudás, lekérdezéskor beinjektálva, a válasz abban megalapozva.
:::::

### Kapcsolat a másik két tutorialoddal

A RAG nem légüres térben él: a **vektor-adatbázis** tutorial adja az alatta dolgozó retrieval-motort (embedding, hasonlóság, index), a **memory** tutorial pedig a testvér-fogalom — ugyanaz a gépezet, más cél (RAG = tudás a világról, memory = a felhasználó/beszélgetés állapota).
::::::

:::::: section id=rag-1 heading="1. rész — Mikor éri meg RAG, és mikor nem?" nav="1. rész" group="Elmélet"

<p class="topic-tagline">Cél: tudd eldönteni, hogy a te problémádra tényleg RAG a válasz.</p>

### RAG vs. finetuning vs. long context

Három út van arra, hogy egy modell „többet tudjon" — és gyakran összekeverik őket:

::::: stack-grid
:::: card label="RAG — tudás injektálás"
Külső, **változó/friss** tényeket ad hozzá lekérdezéskor. Nincs újratanítás, a forrás frissíthető, a válasz **visszavezethető** a forrásra. Ez a válasz a legtöbb „kérdezz a dokumentumaimból" feladatra.
::::
:::: card label="Finetuning — viselkedés"
A modell **stílusát, formátumát, készségét** hangolja (pl. „mindig JSON-t adj", „beszélj a cég hangján"). Nem friss tények tárolására való — a betanult tudás statikus és nehezen frissül.
::::
:::: card label="Long context — minden bepakolása"
Ha az egész forrás befér a context windowba, elvileg beilleszthetnéd. De ez drága, lassú, és a minőség romlik (lásd context rot, 8. rész). Kiegészíti a RAG-ot, nem helyettesíti.
::::
:::::

### Mikor KELL RAG

Friss, gyakran változó tudás (dokumentáció, árlisták, szabályzatok) · nagy tudásbázis, ami nem fér a promptba · a válasznak **forrásra hivatkozhatónak** kell lennie (compliance, jog, orvosi) · a hallucináció költséges · több felhasználó, eltérő jogosultságú adaton.

### Mikor NEM éri meg

::::: callout warning label="Ne RAG-elj, ha…"
A tudás **belefér** a promptba és ritkán változik (csak tedd be) · a feladat nem tudás-, hanem **készség-**alapú (formázás, stílus → finetuning vagy prompt) · nincs jó minőségű, kereshető forrásod (a RAG a rossz adatot csak felerősíti) · a kérdések **nem** a saját adatodról szólnak (általános tudás → sima LLM) · a késleltetés kritikus és minden extra retrieval-kör drága.
:::::

A naiv RAG a produkciós rendszerekben durván az **esetek 40%-ában elhibázza a visszakeresést** — magabiztos, jól strukturált választ ad, csak épp rossz dokumentumokból. 2026-ban a szűk keresztmetszet nem a generálás, hanem a **retrieval**. Ezért szól a tutorial nagy része arról, hogyan tedd jóvá a visszakeresést.
::::::

:::::: section id=rag-2 heading="2. rész — Az alap pipeline: indexelés + lekérdezés" nav="2. rész" group="Alap pipeline"

<p class="topic-tagline">Cél: lásd a teljes folyamatot végponttól végpontig, két fázisban.</p>

### A két fázis

A RAG két, időben elkülönülő fázisból áll: az **indexelés** (offline, egyszer megcsinálod) előkészíti a tudásbázist; a **lekérdezés** (online, minden kérdésnél lefut) használja azt.

![A RAG pipeline: indexelés és lekérdezés](assets/rag-01-pipeline.jpg)

### 1. fázis — Indexelés (offline)

1. **Dokumentumok** begyűjtése (PDF, wiki, kód, ticketek).
2. **Chunkolás** — a dokumentumokat kereshető méretű darabokra vágod (3. rész).
3. **Embedding** — minden chunkot vektorrá alakítasz (lásd a vektor-DB tutorialt).
4. **Tárolás** a vektor-adatbázisban (Chroma / Qdrant / pgvector).

### 2. fázis — Lekérdezés (online, minden kérdésnél)

1. A **felhasználói kérdést** ugyanazzal az embedding-modellel vektorizálod.
2. **Retrieval** — a vektor-DB visszaadja a top-k legrelevánsabb chunkot.
3. *(opcionális)* **Rerank** — egy erősebb modell újrarangsorolja a jelölteket (5. rész).
4. **Prompt-összeállítás** — a kiválasztott chunkokat + a kérdést egy promptba fűzöd.
5. Az **LLM** a beillesztett kontextusban megalapozva válaszol.

::::: callout label="A kulcs-mondat"
A válasz a **visszakeresett dokumentumokban** van megalapozva, nem a modell emlékezetében. Ezért tudod (jó pipeline-nal) forráshoz kötni és ellenőrizni — és ezért csökkenti a hallucinációt 70–90%-kal egy helyesen implementált RAG.
:::::
::::::

:::::: section id=rag-3 heading="Feladat 1 — Naiv RAG kézzel (minimál pipeline)" nav="Feladat 1" group="Gyakorlat"

<p class="topic-tagline">Cél: egy működő, végponttól végpontig RAG ~40 sorban, hogy lásd a csontvázat.</p>

### Python — Chroma + Claude

```python
import chromadb, anthropic

llm = anthropic.Anthropic()
db = chromadb.PersistentClient(path="./rag_db")
col = db.get_or_create_collection("tudasbazis")

# --- 1. INDEXELÉS (egyszer) ---
docs = [
    "A Nevogate SimplePay integráció QR-kódos és deeplink fizetést támogat.",
    "A Cancel API csak PENDING állapotú tranzakciót tud érvényteleníteni.",
    "A Caddy automatikus HTTPS-t ad Let's Encrypt tanúsítvánnyal.",
    "A macskák napi 12-16 órát alszanak.",
]
col.add(documents=docs, ids=[f"d{i}" for i in range(len(docs))])

# --- 2. LEKÉRDEZÉS (minden kérdésnél) ---
def rag(question, k=2):
    # retrieval: a top-k releváns chunk
    hits = col.query(query_texts=[question], n_results=k)["documents"][0]
    context = "\n".join(f"- {c}" for c in hits)

    # prompt-összeállítás: a kontextus + a kérdés
    prompt = (
        f"A következő forrásrészletek alapján válaszolj. Ha a válasz nincs bennük, "
        f"mondd, hogy nem tudod.\n\nForrás:\n{context}\n\nKérdés: {question}"
    )
    resp = llm.messages.create(
        model="claude-sonnet-4-5", max_tokens=400,
        messages=[{"role": "user", "content": prompt}],
    )
    return resp.content[0].text, hits

answer, sources = rag("Milyen tranzakciót tud a Cancel API érvényteleníteni?")
print("VÁLASZ:", answer)
print("FORRÁS:", sources)
```

::::: callout label="Gyakorlat"
Tedd fel a „Meddig alszanak a macskák?" kérdést — figyeld, hogy a helyes chunkot hozza vissza, pedig a tudásbázisban vegyesen vannak témák. Aztán kérdezz olyat, ami **nincs** a forrásban (pl. „Mennyi a SimplePay tranzakciós díja?") — a jó prompt hatására a modellnek „nem tudom"-ot kell mondania, nem hallucinálnia. Ez a *grounding* teszt.
:::::

Ez a naiv RAG — működik demóban, de a produkciós minőséghez a következő szakaszok technikái kellenek.
::::::

:::::: section id=rag-4 heading="3. rész — Chunkolás: a legnagyobb minőségi kar" nav="3. rész" group="Technikák"

<p class="topic-tagline">Cél: a retrieval minősége leginkább ezen múlik — csináld jól.</p>

### Miért kritikus

A chunkolás dönti el, mit lát egyáltalán a retrieval. Rossz chunkokból a legjobb vektor-DB és a legdrágább modell sem tud jó választ adni — „garbage in, garbage out". A cél: **minden chunk legyen önmagában értelmes**, egy kérdésre önállóan válaszolható egység.

### Stratégiák

::::: stack-grid
:::: card label="Fixed-size (naiv)"
1000 karakter / chunk, ~100 átfedéssel. Gyors indulás, de gyorsan plafonozódik — szó vagy mondat közepén vág.
::::
:::: card label="Sentence window"
Mondat-alapú darabolás, a találat köré ±néhány mondat ablakot ad kontextusnak. Magas ROI, egyszerű.
::::
:::: card label="Semantic chunking"
Mondatonként embeddel, és ott vág új chunkot, ahol a szomszédos mondatok közti koszinusz-hasonlóság egy küszöb alá esik (jelentés-váltás). Egy publikált összevetésben ~71%-ra emelte a pontosságot a fixed-size baseline-hoz képest.
::::
:::: card label="Structure-aware"
Dokumentációnál a `##` fejlécek mentén, kódnál függvényenként/osztályonként (AST alapján). Külön chunkolási politika kódra és prózára.
::::
:::::

### Gyakorlati alapértékek

~200–500 token / chunk, **10–20% átfedéssel** (overlap), lehetőleg szemantikus határon. Minden chunkhoz tedd el **metaadatként** a forrást, szekciócímet, oldalszámot — így a találat visszavezethető és szűrhető.

::::: callout warning label="Gyakorlat"
Vedd egy valódi dokumentumodat (pl. a Nevogate teszt-tervedet), és chunkold háromféleképp: fixed-size, mondat-alapú, és fejléc-alapú. Ugyanarra a kérdésre nézd meg, melyik ad relevánsabb top-k találatot. A különbség meg fog lepni — a chunkolás nem mellékes beállítás.
:::::
::::::

:::::: section id=rag-5 heading="4. rész — Hybrid search: dense + sparse" nav="4. rész" group="Technikák"

<p class="topic-tagline">Cél: kombináld a szemantikus és a kulcsszavas keresést a vakfoltok ellen.</p>

### Miért nem elég a tiszta vektor-keresés

A dense (embedding) keresés remek a *jelentésre*, de gyenge a **pontos tokeneknél**: termékkód (`YARIS-2024`), hibakód, tulajdonnév, ritka szakszó. Ezeknél a klasszikus **kulcsszavas (sparse, pl. BM25)** keresés jobb. A **hybrid search** a kettőt kombinálja, így lefedi mindkét vakfoltot.

### Hogyan kombináld: RRF

A két találati listát tipikusan **Reciprocal Rank Fusion (RRF)** olvasztja össze — minden dokumentum pontszáma a rangjainak reciprokából adódik mindkét listában, függetlenül a nyers pontszámok skálájától:

```python
def reciprocal_rank_fusion(dense_ids, sparse_ids, k=60):
    scores = {}
    for rank, doc_id in enumerate(dense_ids):
        scores[doc_id] = scores.get(doc_id, 0) + 1 / (k + rank)
    for rank, doc_id in enumerate(sparse_ids):
        scores[doc_id] = scores.get(doc_id, 0) + 1 / (k + rank)
    # a kombinált pontszám szerint csökkenő sorrend
    return sorted(scores, key=scores.get, reverse=True)

# dense = vektor-keresés top-N id-jei, sparse = BM25 top-N id-jei
fused = reciprocal_rank_fusion(dense_hits, bm25_hits)[:10]
```

A Weaviate és a Qdrant natívan tud hybrid search-öt; pgvectorban a `tsvector` full-text keresést párosítod a vektor-lekérdezéssel.

::::: callout label="A magas ROI kombó"
A hybrid retrieval (dense + BM25) + egy reranker a legjobb kiindulópont a legtöbb produkciós rendszerhez — ezzel a két lépéssel a telepítések 80%-a előtt jársz. A bonyolultabb technikákat (query transform, agentic, gráf) csak akkor add hozzá, ha a **mérés** (7. rész) bizonyítja, hogy az egyszerűbb nem elég.
:::::
::::::

:::::: section id=rag-6 heading="5. rész — Reranking: cross-encoder a pontosságért" nav="5. rész" group="Technikák"

<p class="topic-tagline">Cél: emeld a top találatok pontosságát egy második, erősebb szűréssel.</p>

### A két lépcső logikája

A vektor-keresés gyors, de „durva": a kérdést és a chunkot **külön** embeddeli, és utólag méri a távolságot (ez a *bi-encoder*). A **reranker** ezzel szemben egy **cross-encoder**: a kérdést és a chunkot **együtt** adja egy modellnek, ami sokkal pontosabban ítéli meg a relevanciát — cserébe páronként lassabb.

A bevált minta ezért **kétlépcsős**:

1. **Retrieval (olcsó, tág):** a vektor/hybrid keresés visszaad top 20–50 jelöltet — a cél a magas *recall* (a jó találat legyen benne).
2. **Rerank (drága, szűk):** a cross-encoder újrapontozza ezt a kis halmazt, és a legjobb 5–20-at adja tovább az LLM-nek — a cél a magas *precision*.

```python
from sentence_transformers import CrossEncoder

reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")

def rerank(query, candidates, top_n=5):
    pairs = [(query, c) for c in candidates]          # kérdés + chunk párok
    scores = reranker.predict(pairs)                  # együtt pontozza
    ranked = sorted(zip(candidates, scores), key=lambda x: x[1], reverse=True)
    return [c for c, _ in ranked[:top_n]]

# a retrieval 30 jelöltjéből a legjobb 5 megy az LLM-hez
best = rerank(question, retrieved_30)
```

::::: callout warning label="Mérj a saját korpuszodon"
A reranking gyakran sokat javít — de nem mindig. Egy benchmark (ARAGOG) szerint a Cohere Rerank bizonyos korpuszokon nem mutatott érdemi előnyt a naiv RAG-hoz képest. A tanulság: **soha ne feltételezz, mérj** a saját adatodon (7. rész). Menedzselt rerankerek: Cohere Rerank, Voyage rerank; lokálisan: a fenti cross-encoder.
:::::
::::::

:::::: section id=rag-7 heading="6. rész — Haladó minták: agentic, GraphRAG, RAPTOR, adaptive" nav="6. rész" group="Technikák"

<p class="topic-tagline">Cél: ismerd a naiv pipeline-on túli architektúrákat, és hogy mikor kellenek.</p>

### A RAG egy spektrum

2026-ra a RAG nem egyetlen technika, hanem egy skála — az egyszerű faktuális kérdéstől a több dokumentumon átívelő, több lépéses következtetésig. A legjobb rendszerek **adaptívan** illesztik a pipeline összetettségét a kérdés összetettségéhez.

::::: stack-grid
:::: card label="Agentic RAG"
A lineáris pipeline helyett egy **ügynök** tervez, keres, **értékeli a talált kontextus elégségességét**, és ha kell, újrafogalmazza a lekérdezést és újra keres — akár többször. Több lépéses (multi-hop) kérdésekhez és ott, ahol a pontosság nem alku tárgya (jog, orvosi, pénzügy).
::::
:::: card label="GraphRAG (Microsoft)"
A vektor-retrievalt egy **tudásgráffal** egészíti ki, ami az entitások kapcsolatait rögzíti. Akkor erős, ha a válaszhoz **kapcsolatokon** kell végigmenni („ki függ kitől", „mi hat mire").
::::
:::: card label="RAPTOR"
A dokumentumokból **hierarchikus összefoglaló-fát** épít: a chunkokat klaszterezi és rekurzívan összegzi. Így egyszerre elérhető a részlet és a nagy kép — jó hosszú, strukturált korpuszhoz.
::::
:::: card label="Adaptive / CRAG"
Egy **osztályozó** dönti el, melyik kérdés melyik pipeline-t kapja: egyszerű → gyors naiv retrieval; összetett → agentic/gráf. Optimális költség/minőség — nem fizetsz nehéz számításért könnyű kérdésre. A CRAG a talált kontextust *önértékeli*, és rossz találatnál korrigál.
::::
:::::

### Contextual Retrieval (Anthropic)

Egy egyszerű, nagy hatású trükk: minden chunk elé **egy rövid, LLM-generált kontextus-mondatot** teszel, ami elhelyezi a chunkot a teljes dokumentumban (pl. „Ez a részlet a Nevogate Cancel API hibakezeléséről szól, a 4. fejezetből"). Ettől a chunk embeddingje sokkal beszédesebb lesz, és a retrieval pontosabb — különösen ott, ahol a chunk önmagában kétértelmű.

::::: callout label="A növekedés szabálya"
Kezdd a legegyszerűbbel, ami működik: hybrid + rerank + jó chunkolás. Mérj RAGAS-szal. Csak akkor adj hozzá agentic hurkot vagy gráfot, amikor a metrikáid bizonyítják, hogy az egyszerűbb megközelítés nem elég. A korai over-engineering ugyanolyan hiba, mint a hiányzó reranker.
:::::
::::::

:::::: section id=rag-8 heading="7. rész — Kiértékelés: RAGAS és a retrieval-metrikák" nav="7. rész" group="Éles használat"

<p class="topic-tagline">Cél: ne „érzésre" hangolj — mérd a RAG minőségét számokkal.</p>

### Miért nélkülözhetetlen

RAG-nál nincs „helyes/helytelen" bináris — van visszakeresési minőség és van válasz-minőség, és **mérni kell mindkettőt**, különben minden módosításod találgatás. A kiértékelés két szintre bomlik.

### Retrieval-metrikák (a keresés jósága)

| Metrika | Mit mér |
|---|---|
| **Recall@K** | A releváns dokumentumok hány %-a benne van a top-K találatban. |
| **MRR** (Mean Reciprocal Rank) | Milyen magasan van az *első* helyes találat átlagosan. |
| **nDCG** | A találati sorrend minősége, a relevancia fokozatait is figyelembe véve. |

### Generálás-metrikák (RAGAS)

A **RAGAS** keretrendszer a válasz minőségét méri a visszakeresett kontextushoz képest, jellemzően négy tengelyen: **faithfulness** (a válasz tényleg a kontextusból következik-e, nem hallucinál), **answer relevancy** (a válasz a kérdésre válaszol-e), **context precision** és **context recall** (a visszakeresett kontextus mennyire pontos/teljes).

::::: callout label="Tedd release-kapuvá"
QA-mérnökként ez otthonos lesz: állíts össze egy kis, reprezentatív **kérdés–válasz kiértékelő halmazt**, és tedd a RAGAS-t + Recall@K-t **regressziós kapuvá** a pipeline-változtatások előtt. Így minden chunkolás- vagy reranker-módosításnál látod, javított vagy rontott — nem érzésre döntesz.
:::::
::::::

:::::: section id=rag-9 heading="8. rész — Éles buktatók: lost in the middle, context rot" nav="8. rész" group="Éles használat"

<p class="topic-tagline">Cél: ismerd a leggyakoribb, nem nyilvánvaló hibaforrásokat.</p>

### A nagy context window nem old meg mindent

Csábító azt gondolni: „minek RAG, ha van 1-2 millió tokenes ablak? Bepakolok mindent." Ez lusta mérnökség, és a kutatás cáfolja. A Stanford „lost in the middle" vizsgálata megmutatta, hogy a modell teljesítménye jelentősen romlik, ha a releváns információ a hosszú kontextus **közepén** van — a modellek a bemenet **elején és végén** lévő infót használják a legjobban. Nem csak a hossz számít, hanem a **pozíció**.

Ehhez társul a **context rot**: ahogy a kontextus nő, a precizitás csökken, a következtetés gyengül, a modell dolgokat kezd elmulasztani — az attention „budget" véges, minden token verseng érte. A tanulság: a több kontextus nem jobb kontextus. A RAG épp azért érték, mert **kevés, releváns** jelet ad sok zaj helyett.

### A buktató-lista

::::: callout danger label="Éles hibaforrások"
**✗** Túl sok chunk a promptban → lost in the middle, a lényeg elvész középen · **✗** Chunkolás átfedés nélkül → a határon lévő infó elveszik · **✗** Nem egyező embedding-modell index és lekérdezés között → értelmetlen találatok · **✗** Modellváltás újra-embedding nélkül → a régi és új vektorok nem összemérhetők · **✗** Rossz/duplikált forrásadat → a RAG felerősíti, nem javítja · **✗** Nincs „nem tudom" fallback → a modell üres retrievalnél is hallucinál · **✗** PII a chunkokban hozzáférés-kontroll nélkül · **✗** Nincs kiértékelés → minden hangolás vakrepülés.
:::::

### A prompt-összeállítás jó gyakorlata

Adj a modellnek 5–20 rerankelt chunkot egy 16–64K tokenes promptban, világos rendszer-utasítással (és példákkal, ha kell). A teljes context windowt csak akkor használd ki, ha a szintézis tényleg megköveteli (hosszú riport, kódbázis) — ne a retrieval helyettesítőjeként. A legfontosabb chunkokat tedd a prompt **elejére vagy végére**, ne a közepére.
::::::

:::::: section id=rag-10 heading="9. rész — Döntési keret: melyik mintát, mikor?" nav="9. rész" group="Éles használat"

<p class="topic-tagline">Cél: egy gyakorlatias döntési fa a te helyzetedhez.</p>

### Illeszd a pipeline-t a kérdés összetettségéhez

::::: stack-grid
:::: card label="Egy chunkban a válasz?"
→ **Naiv RAG** + reranker a pontosságért. A legtöbb faktuális kérdés ide tartozik.
::::
:::: card label="2-3 dokumentumból?"
→ **Advanced RAG**: hybrid retrieval + rerank + esetleg query-transform. Ez a produkciós alapértelmezés a legtöbb appra — a költség/minőség édespontja.
::::
:::: card label="Sok dokumentumon átível?"
Kapcsolatok mentén → **GraphRAG**. Több lépéses következtetés → **Agentic RAG**.
::::
:::: card label="Vegyes terhelés?"
→ **Adaptive RAG**: egy osztályozó route-olja a kérdést a megfelelő (olcsó vagy drága) pipeline-ra.
::::
:::::

### A gyakorlati sorrend (a te AI Hubodhoz)

1. **Naiv RAG** működésre (Feladat 1) — Chroma vagy pgvector a meglévő stackeden.
2. **Jó chunkolás** (3. rész) — a legnagyobb egyszeri nyereség.
3. **Hybrid + rerank** (4–5. rész) — a magas ROI kombó.
4. **RAGAS kiértékelés** (7. rész) — mielőtt bármi továbbit hozzáadsz.
5. Csak ezután, **mérés alapján**: agentic / gráf / adaptive minták.

::::: callout warning label="A migráció szabálya"
Amivel a RAG-projektet kezded, ritkán az, amivel élesben szállítod. Kezdj egyszerűen, mérj valós adaton és forgalmon, és csak a mérés indokolta bonyolultságot vezesd be. A retrieval a bottleneck 2026-ban — oda tedd a figyelmedet, ne az egyre nagyobb modellbe.
:::::
::::::

:::::: section id=rag-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A tutorial végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0–1. rész"
Mi a RAG és miért · Karpathy CPU/RAM keret · RAG vs. finetuning vs. long context · mikor NE
::::
:::: card label="2. rész + Feladat 1"
Az indexelés + lekérdezés pipeline · működő naiv RAG ~40 sorban · grounding teszt
::::
:::: card label="3–5. rész"
Chunkolás (semantic, structure-aware) · Hybrid search + RRF · Cross-encoder reranking
::::
:::: card label="6. rész"
Agentic · GraphRAG · RAPTOR · Adaptive/CRAG · Contextual Retrieval
::::
:::: card label="7–8. rész"
RAGAS · Recall@K / MRR / nDCG · Lost in the middle · Context rot
::::
:::: card label="9. rész"
Döntési fa · A gyakorlati sorrend · A migráció szabálya
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>vektor-adatbázisok</em> (a retrieval-motor) és a <em>memory</em> (a testvér-fogalom) tutorialok. Együtt lefedik a teljes context engineering alapot.</p>
::::::
