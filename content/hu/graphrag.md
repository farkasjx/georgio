---
page: graphrag
title: GraphRAG — amikor a kapcsolatok számítanak, nem csak a hasonlóság
sidebar_groups:
  - Elmélet
  - A mechanizmus
  - Kritika
  - Gyakorlat
hero:
  eyebrow: "GraphRAG · Fejlesztői Tanulási Terv"
  title: "GraphRAG — <em>amikor a kapcsolatok számítanak, nem csak a hasonlóság</em>"
  lead: "A RAG tutorial 6. része már egy mondatban bemutatta a GraphRAG-ot — ez a cikk mélyebbre megy: hogyan épül fel egy tudásgráf a nyers szövegből, mikor old meg valamit, amit a vektor-alapú retrieval nem tud, és miért szkeptikus a RAG egyik feltalálója magával a megközelítéssel kapcsolatban."
  stats:
    - { val: "35%", lbl: "pontosság-javulás egy AWS-tesztben*" }
    - { val: "2024", lbl: "a Microsoft eredeti GraphRAG-cikke" }
    - { val: "4", lbl: "Szakasz" }
    - { val: "1", lbl: "kritikus hang, amit érdemes hallani" }
footer:
  left: "AI Hub · GraphRAG"
  right: "GraphRAG · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#graphrag-0"><div class="tc-num">0. rész</div><div class="tc-name">A hiányzó láncszem a sima RAG-ban</div><div class="tc-desc">Amikor a vektor-hasonlóság nem elég.</div></a>
  <a class="toc-card" href="#graphrag-1"><div class="tc-num">1. rész</div><div class="tc-name">Hogyan épül fel a gráf</div><div class="tc-desc">Entitás-kinyerés, kapcsolatok, közösség-összefoglalók.</div></a>
  <a class="toc-card" href="#graphrag-2"><div class="tc-num">2. rész</div><div class="tc-name">Egy kritikus hang: tényleg gráf ez?</div><div class="tc-desc">A RAG egyik feltalálójának szkepticizmusa.</div></a>
  <a class="toc-card" href="#graphrag-3"><div class="tc-num">3. rész</div><div class="tc-name">Mikor éri meg — döntési keret</div><div class="tc-desc">Nem minden probléma gráf-probléma.</div></a>
</div>
::::::

:::::: section id=graphrag-0 num="00" heading="0. rész — A hiányzó láncszem a sima RAG-ban" nav="A hiányzó láncszem a sima RAG-ban" group="Elmélet"

<p class="topic-tagline">Cél: érts meg egy konkrét korlátot, amivel a vektor-alapú RAG rendszeresen küzd.</p>

### Amit a vektor-hasonlóság nem lát

A <em>RAG</em> tutorialban megismert alap-pipeline (embedding, majd hasonlóság-alapú keresés) kiválóan működik **egyszerű, faktuális** kérdéseknél — de rendszeresen megbotlik ott, ahol a válaszhoz **több, egymáshoz kapcsolódó** információdarabon kell végigmenni.

::::: callout label="Egy illusztratív példa"
A kérdés: *"Mely beszállítóink függenek egy olyan alvállalkozótól, aki a versenytársunknak is dolgozik?"* Egy vektor-alapú keresés a "beszállító", "alvállalkozó" és "versenytárs" szavakhoz hasonló chunkokat találja meg — de **nem tudja végigkövetni a köztük lévő kapcsolatot**, mert a hasonlóság nem ugyanaz, mint az összekapcsoltság.
:::::

::::: callout warning label="A \"multi-hop\" probléma"
Az ilyen, több lépésben megválaszolható (**multi-hop**) kérdéseknél a hagyományos RAG **izolált szövegdarabokként** kezeli az információt — hiányzik belőle az entitások közötti, explicit kapcsolati struktúra, ami a válaszhoz kellene.
:::::

::::: callout label="Egy mondatban"
A GraphRAG erre a hiányzó láncszemre válaszol: nem csak azt tárolja, **mi hasonlít mire**, hanem azt is, **mi kapcsolódik mihez** — ez a különbség a vektor-hasonlóság és egy tudásgráf között.
:::::
::::::

:::::: section id=graphrag-1 num="01" heading="1. rész — Hogyan épül fel a gráf: entitások, kapcsolatok, közösségek" nav="Hogyan épül fel a gráf" group="A mechanizmus"

<p class="topic-tagline">Cél: kövesd végig a folyamatot, ahogy a nyers szövegből strukturált gráf lesz.</p>

### A négy lépés

::::: stack-grid
:::: card label="1 · Entitás-kinyerés"
Egy LLM végigmegy a dokumentumokon, és azonosítja a releváns **entitásokat** (személyek, cégek, termékek, fogalmak) — ez maga is egy LLM-hívás, nem hagyományos, szabály-alapú named entity recognition.
::::
:::: card label="2 · Kapcsolat-kinyerés"
Ugyanez a folyamat feltárja, **milyen kapcsolat** áll fenn a talált entitások között (pl. "X beszállítója Y-nak", "A vezetője B-nek") — ezek lesznek a gráf **élei**.
::::
:::: card label="3 · Közösség-detektálás"
A gráf-algoritmusok (pl. Leiden-algoritmus) **klasztereket** (közösségeket) azonosítanak a sűrűn összekapcsolódó entitások közt — ezek gyakran egy-egy témakört vagy szervezeti egységet reprezentálnak.
::::
:::: card label="4 · Közösség-összefoglalás"
Minden közösséghez egy LLM **magas szintű összefoglalót** generál — ez teszi lehetővé, hogy a rendszer **globális, átfogó** kérdésekre is tudjon válaszolni, nem csak lokális, konkrét tényekre.
::::
:::::

### A lekérdezés maga is más

::::: callout label="Nem egyetlen vektor-keresés"
Míg egy alap RAG egyetlen lekérdezést küld a vektor-indexnek, a GraphRAG egy **több lépéses** folyamatot követ: értelmezi a kérdést, kiválaszt egy releváns rész-gráfot, és — akár egy lekérdező nyelven (pl. Cypher) — bejárja a kapcsolatokat, mielőtt a talált, strukturált tényeket átadná a végső válaszgenerálásnak.
:::::

::::: callout label="Egy mondatban"
A GraphRAG lényege, hogy a retrieval nem szöveg-hasonlóságot, hanem **explicit, gráf-struktúrájú kapcsolatokat** jár be — ez teszi lehetővé a multi-hop és az átfogó, "globális" kérdések megválaszolását, amikkel a sima vektor-RAG küzd.
:::::
::::::

:::::: section id=graphrag-2 num="02" heading="2. rész — Egy kritikus hang: tényleg gráf ez?" nav="Egy kritikus hang" group="Kritika"

<p class="topic-tagline">Cél: hallj egy egyenes, szkeptikus véleményt is, ne csak a lelkes bemutatást.</p>

### A mért eredmény

::::: callout label="Konkrét, dokumentált javulás"
Egy AWS által publikált teszt szerint a gráf-struktúra hozzáadása a retrievalhoz akár **35%-kal** javította a válasz-pontosságot egy adott feladatkészleten — ez komoly, mérhető javulás, ha a te use case-ed multi-hop kérdésekre épül.
:::::

### De nem mindenki győződött meg

::::: callout danger label="Douwe Kiela szkepticizmusa"
Douwe Kiela — a Contextual AI társalapítója és a RAG egyik eredeti kutatója — egy nyilvános podcastban élesen fogalmazott: szerinte a legtöbb, GraphRAG néven futó megvalósítás valójában **nem igazi gráf-bejárás**, hanem csak "adat-augmentáció" — egyszerűen több, hierarchikus információt tartalmazó chunkot adnak a szokásos vektor-adatbázishoz, majd ugyanazt a hagyományos retrievalt futtatják. Szerinte **"az emberek többségének nincs is rendes tudásgráfja"**, amire ez a megközelítés ténylegesen épülhetne.
:::::

::::: callout warning label="Miért fontos ezt a kritikát komolyan venni"
Ez nem azt jelenti, hogy a GraphRAG haszontalan — hanem hogy a **megvalósítás minősége** dönt: ha a mögötted álló "tudásgráf" valójában csak egy kicsit strukturáltabb szöveg-chunk-gyűjtemény, a "gráf" előny jelentős része elveszhet. A valódi érték ott jelentkezik, ahol **tényleg megbízható, jó minőségű entitás- és kapcsolat-kinyerés** történt.
:::::

::::: callout label="Egy mondatban"
A GraphRAG nem varázsszó — a haszna közvetlenül attól függ, mennyire pontos és mennyire valóban "gráf-szerű" (nem csak strukturáltabb szöveg) a mögötte álló reprezentáció, és ezt minden konkrét megvalósításnál külön érdemes megkérdőjelezni.
:::::
::::::

:::::: section id=graphrag-3 num="03" heading="3. rész — Mikor éri meg: döntési keret" nav="Mikor éri meg — döntési keret" group="Gyakorlat"

<p class="topic-tagline">Cél: adj konkrét támpontot, mikor válaszd a GraphRAG-ot a sima vektor-RAG helyett.</p>

::::: compare
::: good label="GraphRAG felé húz, ha..."
A kérdéseid tipikusan **multi-hop** jellegűek ("ki függ kitől", "mi hat mire") · fontos az **explicit magyarázhatóság** (auditálhatóság — látni akarod, milyen kapcsolati láncon jutott el a válaszhoz a rendszer) · a domain-ed eleve **erős kapcsolati struktúrával** rendelkezik (szervezeti hierarchia, jogi hivatkozási lánc, orvosi ok-okozat).
:::
::: bad label="A sima RAG felé húz, ha..."
A kérdéseid túlnyomórészt **egyszerű, faktuális** kérdések ("mi ez a paraméter") · gyors bevezetés és **alacsony karbantartási teher** a prioritás · nincs erőforrásod egy megbízható, jó minőségű gráf felépítésére és karbantartására.
:::
:::::

::::: callout label="A növekedés szabálya, amit a RAG tutorial is javasol"
Ugyanaz az elv érvényes itt is, mint a <em>RAG</em> tutorial 6. részében: kezdd a legegyszerűbb megközelítéssel, ami működik (hybrid keresés + reranking), és csak akkor lépj GraphRAG-ra, ha a mért metrikáid (lásd a <em>RAG</em> tutorial RAGAS-részét) **bizonyítják**, hogy a multi-hop kérdések aránya és nehézsége ezt indokolja.
:::::

::::: callout label="Egy mondatban"
A GraphRAG egy erős eszköz egy szűk, de valós problémára — a kapcsolat-alapú, multi-hop kérdésekre —, de nem helyettesítője az alap RAG-nak, és a haszna közvetlenül a mögötte álló gráf minőségétől függ, amit Kiela kritikája is jogosan hangsúlyoz.
:::::
::::::

:::::: section id=graphrag-summary num=SUMMARY nav="Összefoglalás" sub=true group="Gyakorlat"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0. rész"
A vektor-alapú RAG korlátja: nem tudja végigkövetni az entitások közti kapcsolatokat, ez a multi-hop kérdéseknél probléma
::::
:::: card label="1. rész"
A gráf felépítésének négy lépése: entitás-kinyerés, kapcsolat-kinyerés, közösség-detektálás, közösség-összefoglalás
::::
:::: card label="2. rész"
Kritikus szempont: a RAG egyik feltalálója szerint sok GraphRAG-implementáció valójában csak "adat-augmentáció", nem valódi gráf-bejárás
::::
:::: card label="3. rész"
Döntési keret: multi-hop és auditálhatósági igény → GraphRAG felé; egyszerű, faktuális kérdések → marad a sima RAG
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>RAG</em> (az alap pipeline és a haladó minták teljes katalógusa, amiből ez a cikk a GraphRAG-ot mélyíti el) és a <em>Vektor adatbázisok</em> (a hasonlóság-alapú keresés, amihez a GraphRAG kiegészítést ad) tutorialok.</p>

<p class="topic-tagline" style="margin-top:12px;font-size:0.85em;opacity:0.75">* A 35%-os pontosság-javulási adat egy AWS által publikált, 2026-os elemzésből származik — lásd a 2. részt a kontextusért.</p>
::::::
