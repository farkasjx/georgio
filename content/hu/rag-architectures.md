---
page: rag-architectures
title: RAG architektúrák — a naivtól az agentic RAG-ig
sidebar_groups:
  - A négy generáció
  - Számokkal
  - Gyakorlat
  - Referencia
hero:
  eyebrow: "RAG architektúrák · Fejlesztői Tanulási Terv"
  title: "RAG architektúrák — <em>a naivtól az agentic RAG-ig</em>"
  lead: "A RAG tutorial megmutatta az alap pipeline-t és egy katalógust a technikákról — ez a cikk a nagy képet adja: hogyan fejlődött a RAG négy, egymásra épülő architektúra-generáción át, mennyibe kerül és mennyi ideig tart mindegyik, és melyiket mikor éri meg választani."
  stats:
    - { val: "4", lbl: "architektúra-generáció" }
    - { val: "200ms → 10s", lbl: "latencia-tartomány*" }
    - { val: "10×", lbl: "költségkülönbség naiv vs. agentic*" }
    - { val: "62%", lbl: "hallucináció-csökkenés agentic+graph*" }
footer:
  left: "AI Hub · RAG architektúrák"
  right: "RAG architektúrák · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#rag-architectures-0"><div class="tc-num">0. rész</div><div class="tc-name">Négy generáció, egy tengely</div><div class="tc-desc">Miért nem "melyik a legjobb", hanem "melyik illik ide".</div></a>
  <a class="toc-card" href="#rag-architectures-1"><div class="tc-num">1. rész</div><div class="tc-name">Naiv RAG</div><div class="tc-desc">A lineáris cső — ahol a legtöbb rendszer csendben megreked.</div></a>
  <a class="toc-card" href="#rag-architectures-2"><div class="tc-num">2. rész</div><div class="tc-name">Advanced RAG</div><div class="tc-desc">Retrieval mint többlépéses folyamat, nem egyetlen keresés.</div></a>
  <a class="toc-card" href="#rag-architectures-3"><div class="tc-num">3. rész</div><div class="tc-name">Modular RAG</div><div class="tc-desc">Nem egy technika — egy tervezési elv: cserélhető komponensek.</div></a>
  <a class="toc-card" href="#rag-architectures-4"><div class="tc-num">4. rész</div><div class="tc-name">Agentic RAG</div><div class="tc-desc">A pipeline-ból vezérlési hurok lesz.</div></a>
  <a class="toc-card" href="#rag-architectures-5"><div class="tc-num">5. rész</div><div class="tc-name">Adaptive routing: a négy közti választás</div><div class="tc-desc">Egy osztályozó dönti el, melyik architektúra fusson.</div></a>
</div>
::::::

:::::: section id=rag-architectures-0 num="00" heading="0. rész — Négy generáció, egy tengely" nav="Négy generáció, egy tengely" group="A négy generáció"

<p class="topic-tagline">Cél: lásd, hogy a RAG-architektúrák nem versengő alternatívák, hanem egy komplexitási létra fokai.</p>

### A közös tengely: mennyi "gondolkodás" történik a keresés körül

::::: callout label="A négy generáció, dióhéjban"
**Naiv RAG** (2023): egyenes vonalú cső — kérdés be, chunk ki. **Advanced RAG** (2024): a retrieval többlépéses folyamattá válik — újraírás, rerank, szűrés. **Modular RAG**: nem egy technika, hanem egy tervezési elv — minden komponens (retrieval, rerank, generálás) önállóan cserélhető. **Agentic RAG** (2025–2026): a pipeline egy vezérlési hurokká válik — az ügynök eldönti, mit keressen, és értékeli, elég jó-e az eredmény.
:::::

::::: callout warning label="Amit ez a cikk NEM ismétel meg"
A <em>RAG</em> tutorial már részletesen tárgyalja a **konkrét technikákat** (chunkolás, hybrid search, reranking) és a **GraphRAG**-ot külön cikk mélyíti el. Ez a cikk a **generációk közti fejlődési ívre** fókuszál — miért és mikor lépsz át egyikről a másikra.
:::::

::::: callout label="Egy mondatban"
A négy architektúra nem "melyik a legjobb" kérdés — egy komplexitási létra, ahol minden fok magasabb pontosságot ígér, cserébe magasabb költségért és latenciáért; a jó döntés az, hogy **csak annyira mászol fel**, amennyit a feladat ténylegesen megkövetel.
:::::
::::::

:::::: section id=rag-architectures-1 num="01" heading="1. rész — Naiv RAG: a lineáris cső" nav="Naiv RAG" group="A négy generáció"

<p class="topic-tagline">Cél: értsd meg, hogy a "naiv" nem lekicsinylő szó — sok production rendszer tudatosan itt marad.</p>

### A legegyszerűbb működő verzió

::::: callout label="A folyamat"
Kérdés → embedding → vektor-keresés a top-k chunkra → a chunkok és a kérdés összefűzve a promptba → LLM válaszol. Nincs újraírás, nincs rerank, nincs visszacsatolási hurok — pontosan az, amit a <em>RAG</em> tutorial 2. részében az alap pipeline-ként megismertél.
:::::

::::: callout label="Miért marad itt \"meglepően sok\" production rendszer"
Jól strukturált tudásbázisokon, tiszta dokumentumokkal és kiszámítható kérdés-mintázatokkal a naiv RAG **erős eredményt ad**, a sokkal komplexebb architektúrák mérnöki költségének **töredékéért**. Ha a kérdéseid túlnyomórészt egyszerű, faktuális jellegűek, ez nem egy "kezdő szint, amit el kell hagyni" — hanem egy legitim végállapot.
:::::

::::: callout label="Egy mondatban"
A naiv RAG nem prototípus-gyakorlat — egy teljesen életképes production-architektúra, ha a feladatod illik hozzá, és ezt sosem szabad szégyellni "csak azért, mert egyszerű".
:::::
::::::

:::::: section id=rag-architectures-2 num="02" heading="2. rész — Advanced RAG: a retrieval többlépéses folyamattá válik" nav="Advanced RAG" group="A négy generáció"

<p class="topic-tagline">Cél: lásd, mi változik konkrétan, amikor egy csapat "felfelé lép" a naiv RAG-ból.</p>

### Két új szakasz: előtte és utána

::::: stack-grid
:::: card label="Retrieval előtt: query transzformáció"
A nyers felhasználói kérdést **átírják, lebontják vagy más indexekhez irányítják**, mielőtt a vektor-keresés elindulna — ez javítja a találati arányt olyan kérdéseknél, amik rosszul fogalmazottak vagy több részkérdésre bomlanak.
::::
:::: card label="Retrieval után: rerank és szűrés"
A találatokat egy **erősebb, cross-encoder modell újrarangsorolja** (lásd a <em>RAG</em> tutorial 5. részét), metaadat szerint szűri, és néha egy második, finomított keresési kört is futtat.
::::
:::::

::::: callout label="A hibrid keresés, mint a legjobb megtérülésű első lépés"
A **hibrid retrieval** (dense vektor-keresés + sparse kulcsszó-keresés, pl. BM25) 2025–2026-ra a de facto production-alapértelmezéssé vált — a dense rész kezeli a szinonimákat és átfogalmazásokat, a sparse rész a pontos egyezéseket (termékkódok, ritka nevek), amiket az embeddingek gyakran elvétenek.
:::::

::::: callout warning label="A latencia-ára"
Az advanced RAG jellemzően **500ms–1,5 másodperc** közötti válaszidőt jelent — a rerank lépés önmagában **200-800ms**-ot tehet hozzá, a reranker modell méretétől függően.
:::::

::::: callout label="Egy mondatban"
Az advanced RAG a "legjobb ár-érték arányú" upgrade a naiv RAG-hoz képest — a hibrid keresés és egy rerank lépés hozzáadása a legtöbb retrieval-hiba **többségét** kijavítja, mielőtt bármi egzotikusabbhoz nyúlnál.
:::::
::::::

:::::: section id=rag-architectures-3 num="03" heading="3. rész — Modular RAG: nem technika, hanem tervezési elv" nav="Modular RAG" group="A négy generáció"

<p class="topic-tagline">Cél: érts meg egy gyakran félreértett fogalmat — ez nem egy konkrét módszer, hanem egy architekturális döntés.</p>

### Cserélhető komponensek, nem egy fix cső

::::: callout label="A kulcsfelismerés"
A modular RAG a teljes retrieval-pipeline-t **független, egyenként cserélhető modulokra** bontja — retrieval, rerank, query-transzformáció, memória, generálás — amiket külön-külön lehet konfigurálni vagy lecserélni. Ez **nem** egy saját, mérhető pontossági benchmarkkal rendelkező technika, hanem egy **tervezési elv**.
:::::

::::: callout label="Miért fontos ez korán eldönteni"
Egy csapat, ami **kezdettől** modulárisan tervez, később **egyetlen komponens** cseréjével (pl. egy bi-encoder retriever lecserélése cross-encoderre, vagy egy rerank-lépés hozzáadása) tud fejleszteni — a teljes pipeline újraépítése nélkül. A ma elterjedt keretrendszerek (LangChain, LlamaIndex, Haystack, RAGFlow) mind alapvetően moduláris RAG-implementációk.
:::::

::::: callout label="Egy mondatban"
A modular RAG-ot nem "választod" egy adott ponton — ez egy **tervezési döntés a kezdetektől**: ha a rendszered moduláris felépítésű, a naiv→advanced→agentic út bármely lépését **be tudod illeszteni** anélkül, hogy mindent újraírnál.
:::::
::::::

:::::: section id=rag-architectures-4 num="04" heading="4. rész — Agentic RAG: a pipeline vezérlési hurokká válik" nav="Agentic RAG" group="A négy generáció"

<p class="topic-tagline">Cél: értsd meg a legfontosabb architekturális ugrást — innentől a modell maga dönt, nem csak végrehajt.</p>

### A cső hurokká alakul

::::: callout label="A döntő különbség"
Az agentic RAG-ban az LLM **ügynökké válik** (lásd az <em>Agent architektúra</em> tutorialt): maga dönti el, **mit** keressen, **értékeli**, elég jó-e a találat, és ha nem, **korrekciós lépést** tesz — újrafogalmazza a lekérdezést, más forrást próbál, vagy több lépésben gyűjt össze információt.
:::::

::::: callout danger label="Konkrét, mért hatás"
Egy 2026 májusi, 47 production-bevetést vizsgáló MLOps Community benchmark szerint az agentic RAG tudásgráffal kombinálva **kb. 62%-kal csökkentette a hallucinációt** a naiv megközelítéshez képest — ára a jelentősen megnövekedett latencia és orkesztrálási komplexitás.
:::::

::::: callout warning label="A latencia-ára, amit sose felejts el"
Az agentic RAG jellemzően **2-10 másodperc** közötti válaszidőt jelent, néha többet is — ha a terméked szubszekundum válaszidőt igényel az elsődleges interakciós útvonalon, az agentic RAG **nem opció** ott; érdemesebb aszinkron, utólagos gazdagításra korlátozni.
:::::

::::: callout label="Egy mondatban"
Az agentic RAG a legmagasabb pontosságot ígéri, de a legmagasabb áron — 5-10-szer drágább és lassabb, mint a naiv RAG ugyanarra a feladatra, ezért csak ott éri meg, ahol a hiba ára ezt ténylegesen indokolja.
:::::
::::::

:::::: section id=rag-architectures-5 num="05" heading="5. rész — Adaptive routing: hogyan dönts a négy közt" nav="Adaptive routing" group="Gyakorlat"

<p class="topic-tagline">Cél: adj egy konkrét, 2026-ban bevált mintát, ami nem egyetlen architektúrát választ, hanem közöttük irányít.</p>

### Egy osztályozó dönt kérdésenként

::::: callout label="A minta, ami a legjobb ár-érték arányt adja"
Egy **komplexitás-osztályozó** minden bejövő kérdést a hozzá illő pipeline-hoz irányít: egyszerű kérdés → naiv/advanced RAG (gyors, olcsó); összetett, több lépéses kérdés → agentic RAG (lassú, pontos); kapcsolat-alapú kérdés → GraphRAG (gráf-bejárás, lásd a <em>GraphRAG</em> tutorialt). Ez adja az **optimális költség-minőség kompromisszumot**, mert a kérdések többsége (a valós, egyszerű esetek) gyors, olcsó választ kap, míg a ténylegesen komplex kérdések megkapják a teljes, agentic kezelést.
:::::

::::: callout label="Az osztályozó maga nem kell legyen bonyolult"
A komplexitás-osztályozó lehet egy **few-shot LLM-prompt**, vagy egy kifinomultabb, betanított osztályozó — de már egy **egyszerű heurisztika** is (kérdéshossz + kulcsszó-detektálás) az út **80%-át** megadja.
:::::

::::: callout label="Kombinálhatók is: egy tipikus, csúcsteljesítményű minta"
A gyakorlatban sok fejlett rendszer egyszerre kombinálja: **adaptive routing** a belépési pontnál, **hierarchikus retrieval** nagy dokumentum-gyűjteményekhez, **advanced reranking** a végső pontosságért, és **modular** komponens-interfészek mindenhol, hogy a jövőbeli fejlesztés kezelhető maradjon.
:::::

::::: callout warning label="Az alapelv, ami mindig érvényes"
Rétegeket **egyenként, mért hibamódok alapján** adj hozzá — ne elővigyázatosságból pakold egymásra az összes elérhető mintát egyszerre. Ugyanez az elv, amit a <em>RAG</em> tutorial 6. részében is olvashattál: kezdd a legegyszerűbbel, ami működik, és csak bizonyított szükség esetén lépj feljebb.
:::::

::::: callout label="Egy mondatban"
A helyes kérdés sosem az, "melyik RAG-architektúrát építsem meg" — hanem hogy **hogyan irányítsd** a különböző nehézségű kérdéseket a hozzájuk illő architektúrához, ami a naiv, advanced és agentic RAG-ot egyetlen, adaptív rendszerré fűzi össze.
:::::
::::::

:::::: section id=rag-architectures-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0. rész"
A négy RAG-architektúra (naiv, advanced, modular, agentic) egy komplexitási létra fokai, nem versengő alternatívák
::::
:::: card label="1–2. rész"
A naiv RAG legitim production-végállapot egyszerű esetekhez · az advanced RAG (hibrid keresés + rerank) a legjobb ár-érték arányú upgrade
::::
:::: card label="3–4. rész"
A modular RAG tervezési elv, nem technika — korán eldöntendő · az agentic RAG vezérlési hurokká alakítja a pipeline-t, 62%-os hallucináció-csökkenéssel, de 10x költséggel
::::
:::: card label="5. rész"
Az adaptive routing minta: egy osztályozó irányítja a kérdéseket a hozzájuk illő architektúrához — ez adja az optimális költség-minőség egyensúlyt
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>RAG</em> (az alap pipeline és a konkrét technikák: chunkolás, hybrid search, reranking), a <em>GraphRAG</em> (a kapcsolat-alapú retrieval mélyebb tárgyalása) és az <em>Agent architektúra</em> (az agentic RAG mögötti döntéshozatali hurok) tutorialok.</p>

<p class="topic-tagline" style="margin-top:12px;font-size:0.85em;opacity:0.75">* A latencia- és költségadatok, valamint a 62%-os hallucináció-csökkenési adat 2026-os iparági elemzésekből és benchmarkokból származnak — lásd a 2. és 4. részt a kontextusért.</p>
::::::
