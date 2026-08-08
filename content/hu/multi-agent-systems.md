---
page: multi-agent-systems
title: Multi-agent rendszerek — amikor egy ügynök nem elég
sidebar_groups:
  - Elmélet
  - A minták
  - Kommunikáció
  - Hibamódok
  - Gyakorlat
  - Referencia
hero:
  eyebrow: "Multi-agent rendszerek · Fejlesztői Tanulási Terv"
  title: "Multi-agent rendszerek — <em>amikor egy ügynök nem elég</em>"
  lead: "Az Agent architektúra tutorial egyetlen ügynök belső döntéshozatalát mutatta be — ez a cikk azt a kérdést válaszolja meg, hogyan koordinálsz TÖBB ügynököt egy közös cél érdekében. Nem elmélet a kedvéért: az Anthropic saját, publikált kutatási rendszerén, konkrét számokkal, és a valós, dokumentált hibamódokon keresztül nézzük végig, mikor éri meg egyáltalán, és mikor nem."
  stats:
    - { val: "90,2%", lbl: "jobb eredmény multi-agenttel*" }
    - { val: "15×", lbl: "token-költség egy chat-hívásokhoz képest*" }
    - { val: "66,4%", lbl: "a piac hub-and-spoke mintát használ*" }
    - { val: "41,77%", lbl: "hiba specifikáció-eltérésből ered*" }
footer:
  left: "AI Hub · Multi-agent rendszerek"
  right: "Multi-agent rendszerek · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#multi-agent-systems-0"><div class="tc-num">0. rész</div><div class="tc-name">Mikor lép be egyáltalán egy második ügynök</div><div class="tc-desc">A konkrét jelek, amik a szétbontást indokolják.</div></a>
  <a class="toc-card" href="#multi-agent-systems-1"><div class="tc-num">1. rész</div><div class="tc-name">A hub-and-spoke minta: az ipari alapértelmezett</div><div class="tc-desc">Egyetlen orchestrator, sok worker — a piac 66,4%-a ezt választja.</div></a>
  <a class="toc-card" href="#multi-agent-systems-2"><div class="tc-num">2. rész</div><div class="tc-name">Esettanulmány: az Anthropic kutatási rendszere</div><div class="tc-desc">Konkrét, publikált architektúra, valódi számokkal.</div></a>
  <a class="toc-card" href="#multi-agent-systems-3"><div class="tc-num">3. rész</div><div class="tc-name">Más minták: pipeline, peer-to-peer, hierarchikus</div><div class="tc-desc">Mikor nem a hub-and-spoke a jó választás.</div></a>
  <a class="toc-card" href="#multi-agent-systems-4"><div class="tc-num">4. rész</div><div class="tc-name">Kommunikáció: A2A, MCP és a köztük lévő különbség</div><div class="tc-desc">A2A az ügynökök közt, MCP az eszközökhöz.</div></a>
  <a class="toc-card" href="#multi-agent-systems-5"><div class="tc-num">5. rész</div><div class="tc-name">A leggyakoribb hibamódok</div><div class="tc-desc">Amit egy Berkeley-kutatás 1600+ végrehajtási nyomban mért.</div></a>
  <a class="toc-card" href="#multi-agent-systems-6"><div class="tc-num">6. rész</div><div class="tc-name">Konkrét védekező technikák</div><div class="tc-desc">Resource ownership, strukturált protokollok, verifier agent.</div></a>
  <a class="toc-card" href="#multi-agent-systems-7"><div class="tc-num">7. rész</div><div class="tc-name">Mai keretrendszerek és eszközök</div><div class="tc-desc">AutoGen, CrewAI, és mit válassz mikor.</div></a>
  <a class="toc-card" href="#multi-agent-systems-8"><div class="tc-num">8. rész</div><div class="tc-name">Döntési keret: neked kell-e ez egyáltalán</div><div class="tc-desc">A leggyakoribb, drága hiba: túl korán multi-agentre váltani.</div></a>
</div>
::::::

:::::: section id=multi-agent-systems-0 num="00" heading="0. rész — Mikor lép be egyáltalán egy második ügynök" nav="Mikor lép be egy második ügynök" group="Elmélet"

<p class="topic-tagline">Cél: ismerd meg a konkrét, gyakorlatban dokumentált jeleket, amik indokolják egy feladat több ügynökre bontását.</p>

### A definíció, amivel dolgozunk

::::: callout label="Mi is pontosan a multi-agent rendszer"
Egy **multi-agent rendszer** (MAS) specializált AI-ügynökök gyűjteménye, amik egy **közös környezetben koordinálódnak**, hogy olyan feladatokat végezzenek el, amikre **egyetlen** ügynök önmagában nem lenne képes — jellemzően egy orchestrator (irányító) ügynök vezet több, specializált worker (végrehajtó) ügynököt, standardizált protokollokon (lásd a 4. részt) keresztül.
:::::

### Három konkrét jel, amikor egyetlen ügynök már nem elég

::::: stack-grid
:::: card label="1 · Kontextus-túlcsordulás"
Egy hosszú-horizontú feladat (pl. 12 dokumentum feldolgozása, 30 eszközhívás egy folyamatban) **100 000+ tokent** halmozhat fel, mire befejeződik — ezen a ponton a modell "elfelejtheti" a korai eredményeket, még egy 200 000 tokenes kontextusablak mellett is, mert a **sustained**, hosszan tartó feladatok rendszeresen túllépik, amit egy ügynök reálisan meg tud tartani.
::::
:::: card label="2 · Szekvenciális szűk keresztmetszet"
Ha három **egymástól független** analízis (pénzügyi, technikai, piaci) **párhuzamosan** futhatna, de egy ügynök **egyesével** végzi el őket, a teljes latencia **háromszoros** lesz, minden pontossági nyereség nélkül — ez tisztán tervezési hiba, nem a modell képességének korlátja.
::::
:::: card label="3 · Szerepkonfliktus"
Egy modell, amit **egyszerre** kell terveznie, adatot lekérnie és végrehajtania **ugyanabban** a kontextusablakban, dokumentáltan **rosszabb döntéseket** hoz, mint amikor ezek a szerepek külön, specializált ügynökök közt oszlanak meg.
::::
:::::

::::: callout warning label="Amit ez NEM jelent"
Egy egyszerű e-mail megírása, egy jegy kategorizálása, egy dokumentum összefoglalása **nem** profitál orchestrálásból — egyetlen LLM-hívás gyorsabb, olcsóbb és könnyebben hibakereshető. A multi-agent architektúra minden meglévő problémát (hibakeresés, költség, latencia, állapotkezelés) **megsokszoroz** — csak akkor éri meg, ha a feladat ténylegesen **függetlenül párhuzamosítható részekre bomlik**.
:::::

::::: callout label="Egy mondatban"
A kérdés sosem "lehetne-e ezt multi-agentesen megoldani" — hanem "bomlik-e a feladat valóban **független, párhuzamos** szálakra", mert csak ez indokolja a jelentősen megnövekedett komplexitást.
:::::
::::::

:::::: section id=multi-agent-systems-1 num="01" heading="1. rész — A hub-and-spoke minta: az ipari alapértelmezett" nav="A hub-and-spoke minta" group="A minták"

<p class="topic-tagline">Cél: ismerd meg a domináns, production-ben leggyakrabban bevetett architektúrát.</p>

### Miért ez nyert, nem a bonyolultabb "swarm" minták

::::: callout label="A piaci valóság, dokumentált arányokkal"
A tudományos publikációk gyakran bonyolult "swarm" (méhkas-szerű, sok-ügynökös, decentralizált) architektúrákat vizsgálnak — a **valós, production-bevetéseknél** ez fordítva áll: a **hub-and-spoke** (orchestrator-worker) minta dominál, az agentic AI piac **66,4%-a** ezt a koordinált, de **centralizált** megközelítést használja.
:::::

### A minta lényege

::::: callout label="Egyetlen agy, sok kéz"
Egy **orchestrator** agent fogadja a felhasználói kérést, **lebontja** a feladatot, **specializált worker** ügynököket hoz létre (gyakran párhuzamosan), és a végén **szintetizálja** az eredményeket egy koherens válasszá. A worker-ek **nem** kommunikálnak egymással közvetlenül — minden koordináció az orchestrator-on keresztül megy, ami radikálisan egyszerűsíti a hibakeresést és az állapotkezelést a decentralizált mintákhoz képest.
:::::

::::: callout warning label="Miért ez a jó belépési pont, ha most kezded"
A hub-and-spoke minta **egyszerű koordinációs modellt** ad — nincs szükség komplex konszenzus-mechanizmusra vagy elosztott állapotkezelésre, mert az orchestrator az egyetlen "igazság-forrás". Ez az ok, amiért a gyakorlatban a legtöbb csapat **innen indul**, még ha később bonyolultabb mintára is vált.
:::::

::::: callout label="Egy mondatban"
A hub-and-spoke nem "kezdő szintű" kompromisszum — ez az architektúra, amit a piac gyakorlatban **kétharmada** választ, pontosan azért, mert a centralizált koordináció drámaian egyszerűsíti a hibakeresést és a megbízhatóságot.
:::::
::::::

:::::: section id=multi-agent-systems-2 num="02" heading="2. rész — Esettanulmány: az Anthropic kutatási rendszere" nav="Esettanulmány: Anthropic kutatási rendszer" group="A minták"

<p class="topic-tagline">Cél: nézd meg a hub-and-spoke minta egy konkrét, publikált, valódi számokkal alátámasztott megvalósítását.</p>

### Az architektúra, ahogy publikálva van

::::: callout label="A Claude Research rendszer felépítése"
Egy **LeadResearcher** (orchestrator) elemzi a felhasználó kérdését, kidolgoz egy kutatási stratégiát, és **3-5 specializált subagentet** hoz létre párhuzamosan — mindegyik **saját, önálló kontextusablakkal**, saját eszközkészlettel, és saját kereséssel dolgozik. Amikor a subagentek befejezik, egy **külön CitationAgent** dolgozza fel az eredményeket, és minden állítást a forrásokhoz köt, mielőtt a végső válasz visszakerülne a felhasználóhoz.
:::::

### A konkrét, mért eredmény

::::: callout danger label="A számok, amik indokolják a komplexitást"
Az Anthropic belső kiértékelése szerint ez a multi-agent architektúra **90,2%-kal jobb** eredményt adott, mint egyetlen Claude Opus 4 ügynök, azoknál a "breadth-first" (sok, egymástól független irányba egyszerre nyitó) kutatási kérdéseknél, ahol a válasz **egyetlen kontextusablaknál** nagyobb információ feltárását igényli. A komplex lekérdezéseknél a kutatási idő **90%-kal csökkent**.
:::::

::::: callout warning label="Az ára, amit tudatosan vállaltak"
Ez a teljesítmény-nyereség **kb. 15-szörös token-költséggel** jár egy sima chat-interakcióhoz képest — az Anthropic explicit dokumentálta, hogy ez egy **tudatos kompromisszum**, ami csak azoknál a feladatoknál éri meg, ahol az eredmény értéke meghaladja ezt a többletköltséget.
:::::

::::: callout label="A legfontosabb, mérési szempontból meglepő felismerés"
A BrowseComp kiértékelésen a **token-felhasználás önmagában megmagyarázta a teljesítmény-variancia 80%-át** — nem a prompt megfogalmazása, nem a modell választása volt a fő tényező, hanem hogy **mennyi aggregált kontextuson** tudott a rendszer gondolkodni. Ez azt jelenti: amikor egy egyetlen-ügynökös rendszer teljesítménye beragad, az első kérdés nem az, "jobb promptra van szükség", hanem hogy **kontextus-korlátozott-e** a probléma.
:::::

::::: callout warning label="Amit nem publikáltak — és amire fel kell készülnöd"
Az Anthropic megosztotta az **elveket** ("gondolkodj úgy, mint az ügynökeid", "skálázd az erőfeszítést a kérdés komplexitásához", "taníts meg az orchestratornak delegálni") — de **nem** a konkrét promptokat. A csapatok, akik ezt reprodukálni próbálták, **heteken keresztül** figyelték, hogyan hibáznak az ügynökök szimulációkban, mire a delegálási promptok stabilizálódtak. Várj **2-3 hónap** iterációt, mielőtt a rendszered abbahagyja, hogy 50 subagentet indítson egy egysoros kérdésre.
:::::

::::: callout label="Egy mondatban"
Ez az esettanulmány nem egy elméleti minta — egy **publikált, mért, valós költséggel és korláttal** rendelkező rendszer, ami pontosan azt bizonyítja, amit a 0. részben leírtunk: a multi-agent architektúra akkor nyer, amikor a feladat valóban több, párhuzamos szálra bomlik, és ára van, amit tudatosan kell vállalni.
:::::
::::::

:::::: section id=multi-agent-systems-3 num="03" heading="3. rész — Más minták: pipeline, peer-to-peer, hierarchikus" nav="Más minták" group="A minták"

<p class="topic-tagline">Cél: ismerd meg a hub-and-spoke alternatíváit, és mikor illik jobban egyik vagy másik.</p>

### Három további, gyakorlatban használt minta

::::: stack-grid
:::: card label="Pipeline (szekvenciális átadás)"
Az ügynökök **egymás után** dolgoznak, mindegyik átadja az eredményét a következőnek — jó, ha a lépések **valóban egymásra épülnek** (pl. adat-tisztítás → elemzés → jelentés-írás), rossz, ha a lépések függetlenek lennének, mert feleslegesen soros lesz a végrehajtás.
::::
:::: card label="Peer-to-peer (egyenrangú, közvetlen kommunikáció)"
Az ügynökök **közvetlenül** üzenetet küldenek egymásnak, konszenzus vagy tárgyalás (negotiation) útján döntenek — ez a legrugalmasabb, de a legnehezebben hibakereshető minta, mert nincs egyetlen, központi "igazság-forrás".
::::
:::: card label="Hierarchikus (több szintű felügyelet)"
Magasabb szintű ügynökök **alacsonyabb szintű** ügynököket felügyelnek, akik maguk is delegálhatnak tovább — ez a hub-and-spoke egy kiterjesztése, ahol **több** orchestrator-szint van egymás felett, nagy, komplex szervezeti struktúrákat modellezve.
::::
:::::

::::: callout warning label="A gyakorlati megfigyelés: a mintaválasztás nem a fő hibaforrás"
Egy fontos, gyakran alábecsült felismerés: a **kontextus-inkonzisztencia**, nem a mintaválasztás, az elsődleges oka, amiért a multi-agent orchestráció production-ben elbukik. Egy jól megválasztott, de rosszul implementált minta (hiányos állapot-szinkronizáció, inkonzisztens kontextus-átadás) ugyanúgy elbukik, mint egy rosszul megválasztott minta.
:::::

::::: callout label="Egy mondatban"
A minta-választás fontos, de nem az egyetlen döntő tényező — egy jó minta rossz implementációval (lásd az 5. részt) ugyanúgy elbukhat, mint egy kevésbé optimális minta, amit gondosan, konzisztens kontextus-kezeléssel építettek fel.
:::::
::::::

:::::: section id=multi-agent-systems-4 num="04" heading="4. rész — Kommunikáció: A2A, MCP és a köztük lévő különbség" nav="Kommunikáció: A2A és MCP" group="Kommunikáció"

<p class="topic-tagline">Cél: tisztázd a két, gyakran összekevert protokoll szerepét — az egyik ügynökök közt, a másik ügynök és eszköz közt kommunikál.</p>

### Két réteg, két probléma

::::: callout label="A kulcs-megkülönböztetés"
Az <em>MCP</em> tutorialban megismert protokoll az **agent-eszköz** kapcsolatot szabványosítja — hogyan ér el egy ügynök egy adatbázist, egy fájlrendszert, egy API-t. Az **A2A** (Agent-to-Agent) protokoll ehelyett az **agent-agent** kapcsolatot szabványosítja — hogyan delegál, koordinál és kommunikál egymással **két különböző csapat vagy platform** által épített ügynök.
:::::

### Az A2A konkrét mechanizmusa

::::: callout label="Agent Card és task lifecycle"
Az A2A-ban minden ügynök publikál egy **Agent Card**-ot, ami leírja a **képességeit** — így egy orchestrator felfedezheti, melyik ügynök alkalmas egy adott feladatra, anélkül hogy előre, kézzel be kellene kódolni ezt az információt. A protokoll **task lifecycle state**-eket (feladat-életciklus állapotokat) is definiál, amivel követhető, hol tart éppen egy delegált feladat.
:::::

::::: callout warning label="Ki áll a protokoll mögött, és mennyire elterjedt"
Az A2A protokollt a **Linux Foundation** felügyeli, és 2026 áprilisára **150+ szervezet** vette át, integrálva az **AWS**, **Azure** és **Google Cloud** platformokba — ez azt jelenti, hogy ha egy multi-vendor (több gyártótól származó) ügynök-ökoszisztémát tervezel, az A2A ma a de facto szabvány a köztük lévő koordinációhoz.
:::::

### A gyakorlatban: mindkettő együtt

::::: callout label="Egy valós rendszerben nem választasz — mindkettőt használod"
Egy tipikus, éles multi-agent rendszerben az **A2A kezeli a koordinációs réteget** (melyik ügynök csinálja mit, hogyan adják át egymásnak a feladatot), az **MCP kezeli az alatta lévő eszköz-hozzáférési réteget** (hogyan éri el az adott ügynök a konkrét adatbázist vagy API-t) — a kettő **egymást kiegészíti**, nem versenyzik egymással.
:::::

::::: callout label="Egy mondatban"
Az A2A az "agentek közti telefonvonal", az MCP az "eszközök felé nyíló, szabványosított csatlakozó" — egy komplex multi-agent rendszer mindkettőt igényli, más rétegen.
:::::
::::::

:::::: section id=multi-agent-systems-5 num="05" heading="5. rész — A leggyakoribb hibamódok" nav="A leggyakoribb hibamódok" group="Hibamódok"

<p class="topic-tagline">Cél: ismerd meg a konkrét, kutatás-alapú adatokat a leggyakoribb production-hibákról.</p>

### A MAST-taxonómia: 1600+ végrehajtási nyom elemzése

::::: callout danger label="A UC Berkeley kutatásának konkrét eredménye"
A **Multi-Agent System Failure Taxonomy** (MAST) kutatói **7 népszerű multi-agent keretrendszer** **1600+ végrehajtási nyomát** elemezték, és **14 specifikus hibamódot** azonosítottak, **3 fő kategóriába** rendezve. A specifikáció-eltérés (spec drift — amikor a rendszer viselkedése elszakad az eredeti követelménytől) a hibák **41,77%-át** okozza — ez messze a legnagyobb egyedi kategória.
:::::

### Konkrét, számszerűsített hibatípusok

::::: stack-grid
:::: card label="Premature termination (6,2%)"
Egy ügynök **"befejezettnek"** nyilvánít egy feladatot, mielőtt az összes al-feladat valóban elkészült volna — a rendszer nem hiba nélkül fut le, csak **hiányosan**.
::::
:::: card label="Hiányzó/hiányos verifikáció (8,2%)"
A rendszer **teljesen kihagyja** a minőség-ellenőrzést a végső kimeneten — nincs semmilyen ellenőrzés arra, hogy az eredmény tényleg helyes-e, mielőtt visszakerül a felhasználóhoz.
::::
:::: card label="Kézfogás (handoff) latencia"
Ha az egyik ügynök befejezése és a másik ügynök kontextus-feldolgozásának megkezdése közt **30 másodpercnél** hosszabb idő telik el, ez konkrét jele annak, hogy a köztük átadott kontextus **túl nagy vagy rosszul strukturált**.
::::
:::: card label="Eszközhívási hűség alatt 80%"
Ha egy ügynök **eszközhívásainak** (API, adatbázis, kódfuttatás) **sikeres, hibamentes eredményhez** vezető aránya 80% alá esik, ez konkrét jele annak, hogy az ügynök **belső modellje** az eszköz működéséről **elcsúszott** a valóságtól.
::::
:::::

::::: callout warning label="A \"csendes\" hiba, ami a legveszélyesebb"
Ha egy eszközhívás hibás választ ad, a modell **jellemzően nem áll meg** — egyszerűen **improvizál** a hibás válasz körül, és folytatja a munkafolyamatot **hibaüzenet vagy leállás nélkül**. Ez különösen veszélyes hosszan futó, MCP-alapú multi-agent munkafolyamatoknál, ahol egyetlen rossz eszköz-válasz **beszennyezi** az összes további, downstream lépést.
:::::

::::: callout label="Egy mondatban"
A production multi-agent hibák nem véletlenszerűek — konkrét, mérhető, kutatásilag katalogizált mintázatokat követnek, és a legnagyobb egyetlen kategória (a specifikáció-eltérés) pontosan az a probléma, amit a 6. részben tárgyalt strukturált kommunikáció old meg.
:::::
::::::

:::::: section id=multi-agent-systems-6 num="06" heading="6. rész — Konkrét védekező technikák" nav="Konkrét védekező technikák" group="Hibamódok"

<p class="topic-tagline">Cél: ismerd meg a gyakorlatban bevált, konkrét mitigáló technikákat az 5. részben látott hibamódokra.</p>

### Négy, egymást kiegészítő védekezési réteg

::::: stack-grid
:::: card label="1 · Explicit resource ownership"
Minden fájl, API-végpont vagy adatbázis-tábla **pontosan egy** ügynökhöz tartozzon — ha két ügynök azt hiszi, ő kontrollál egy erőforrást, az ebből eredő konfliktusok **majdnem lehetetlen** hibakeresni utólag.
::::
:::: card label="2 · Strukturált kommunikációs protokoll"
Minden üzenetnek legyen **explicit típusa** (kérés, informálás, elköteleződés, elutasítás), és minden payload menjen át **séma-validáláson** — az <em>MCP</em> tutorialban megismert JSON-RPC 2.0-alapú, séma-kikényszerített kommunikáció pontosan ezt old meg, szabad-formájú, kitalálásra hagyott üzenetküldés helyett.
::::
:::: card label="3 · Verifier agent a kézfogási pontokon"
Egy **külön, dedikált** ügynök, aminek egyetlen feladata **ellenőrizni** az átadott munkát a kézfogási pontokon (mielőtt a következő ügynök folytatná) — ez direktben megoldja az 5. részben látott "hiányos verifikáció" hibamódot (8,2%).
::::
:::: card label="4 · Élő, önfrissítő specifikáció"
Ahelyett hogy a specifikáció statikusan rögzülne a munka elején, egy **élő specifikáció** frissül, amint az ügynökök haladnak — ha a követelmények változnak, ez **minden aktív ügynökhöz** propagálódik, ami közvetlenül csökkenti a leggyakoribb hibakategóriát, a specifikáció-eltérést (41,77%).
::::
:::::

::::: callout warning label="Az observability nem opcionális"
Ha nincs **inter-agent logging** (az ügynökök közti kommunikáció naplózása), egy multi-agent rendszer **karbantarthatatlan** production-ben — ha a logolás, validálás és nyomkövetés hiányzik, a helyes tanács az, hogy **először egyetlen ügynökkel** indulj, és csak akkor bonts szét, ha ez az infrastruktúra már megvan.
:::::

::::: callout label="Egy mondatban"
Ezek a technikák nem elméleti "best practice" listák — mindegyik **közvetlenül** egy, az 5. részben számszerűsített, konkrét hibamódra válaszol, tehát a bevezetésük prioritását a saját rendszered leggyakoribb hibája alapján érdemes eldönteni.
:::::
::::::

:::::: section id=multi-agent-systems-7 num="07" heading="7. rész — Mai keretrendszerek és eszközök" nav="Mai keretrendszerek és eszközök" group="Gyakorlat"

<p class="topic-tagline">Cél: ismerd meg a legelterjedtebb, production-ben bevetett keretrendszereket, és mikor melyiket válaszd.</p>

### Három, jelenleg domináló framework

::::: stack-grid
:::: card label="Microsoft AutoGen (AG2)"
**Beszélgetés-központú** koordináció, dinamikus üzenetváltással — kiválóan teljesít **kutatási feladatoknál**, ahol az ügynökök közt tárgyalásra és adaptív szerepkiosztásra van szükség. A legmeredekebb tanulási görbe a három közül, de a legrugalmasabb kiszámíthatatlan munkafolyamatokhoz.
::::
:::: card label="CrewAI"
**Szerepkör-alapú** orchestráció, explicit csapat-struktúrákkal — jó, ha a feladatod jól illik egy "kinek mi a feladata" jellegű, viszonylag statikus szerepfelosztásba (pl. "kutató", "szerkesztő", "kritikus").
::::
:::: card label="Google Agent Development Kit (ADK)"
Az A2A protokollra épülő, Google által fejlesztett keretrendszer — természetes választás, ha már a Google-ökoszisztémában (Vertex AI, Agentspace) dolgozol, vagy ha az A2A-kompatibilitás kiemelt szempont.
::::
:::::

::::: callout label="Egy egyszerűbb alternatíva: agentek mint eszközök"
Néhány könnyebb súlyú framework (pl. Orchestral) egy elegánsabb megközelítést választ: az ügynökök **egymást tool call-ként hívják**, nem egy külön üzenetbróker-rendszeren keresztül — az egyik ügynök egyszerűen **eszközként invokálja** a másikat, ami megtartja a szinkron, egyszerű architektúra előnyeit, miközben lehetővé teszi a delegálást.
:::::

::::: callout label="Egy mondatban"
Ne a "legnépszerűbb" framework-öt válaszd automatikusan — a feladatod jellege (adaptív tárgyalás vs. statikus szerepfelosztás vs. egyszerű delegálás) dönti el, melyik ad a legkevesebb felesleges komplexitást.
:::::
::::::

:::::: section id=multi-agent-systems-8 num="08" heading="8. rész — Döntési keret: neked kell-e ez egyáltalán" nav="Döntési keret" group="Referencia"

<p class="topic-tagline">Cél: zárd le a cikket egy konkrét, gyakorlatban használható döntési kerettel.</p>

### A leggyakoribb, drága hiba

::::: callout danger label="A dokumentált tapasztalat, ami mindenkinek szól"
Az Anthropic saját csapatai is megfigyelték: **hónapokat** töltöttek elaborate multi-agent architektúrák építésével, csak hogy felfedezzék, egy **jobban megírt prompt egyetlen ügynökön** ugyanazt az eredményt adta. A multi-agent rendszerek gyakran **olyan helyzetekben** vannak bevetve, ahol egyetlen, jól megírt ügynök **jobban** teljesítene.
:::::

### A konkrét kérdéssor

::::: callout label="Kérdezd meg sorban"
**(1)** A feladat valóban **független, párhuzamos** szálakra bomlik, vagy csak úgy tűnik, hogy szétbontható? **(2)** Van-e **observability** infrastruktúrád (logolás, nyomkövetés) a rendszer indulása előtt, vagy ezt csak utólag pótolnád? **(3)** A várható **eredmény-érték** meghaladja a kb. 15x token-költséget, amit egy jól megvalósított multi-agent rendszer is felvet? **(4)** Hajlandó vagy **2-3 hónap** iterációra a delegálási logika finomítására, mielőtt ez stabilan működne?
:::::

::::: callout warning label="Ha bármelyik válasz \"nem\""
Ha bármelyik kérdésre "nem" a válasz, a helyes lépés **nem** a multi-agent architektúra bevezetése — inkább az egyetlen ügynök **eszközkészletének, promptjának vagy kontextus-kezelésének** javítása, ami az esetek jelentős részében ugyanazt az eredményt olcsóbban, gyorsabban és könnyebben hibakereshetően adja.
:::::

::::: callout label="Egy mondatban"
A multi-agent rendszer nem egy "fejlettebb" alapállás, amire minden komoly AI-projektnek végül szüksége lesz — egy **specifikus válasz** egy specifikus problémára (valóban párhuzamosítható, kontextus-korlátozott feladat), és a legtöbb projekt sosem éri el ezt a küszöböt.
:::::
::::::

:::::: section id=multi-agent-systems-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0–1. rész"
A konkrét jelek, amikor egy második ügynök indokolt (kontextus-túlcsordulás, szekvenciális szűk keresztmetszet, szerepkonfliktus) · a hub-and-spoke minta dominanciája a piacon (66,4%)
::::
:::: card label="2–3. rész"
Az Anthropic publikált kutatási rendszere, konkrét számokkal (90,2% javulás, 15x költség, 80% variancia magyarázva token-felhasználással) · alternatív minták (pipeline, peer-to-peer, hierarchikus)
::::
:::: card label="4–5. rész"
A2A (agent-agent) vs. MCP (agent-eszköz) protokollok szerepe · a MAST-taxonómia konkrét hibaadatai (41,77% specifikáció-eltérés, 8,2% hiányos verifikáció)
::::
:::: card label="6–8. rész"
Négy védekező technika (resource ownership, strukturált protokoll, verifier agent, élő specifikáció) · mai keretrendszerek (AutoGen, CrewAI, Google ADK) · a végső döntési keret, mikor NE válts multi-agentre
::::
:::::

<p class="topic-tagline">Kapcsolódó: az <em>Agent architektúra</em> (egyetlen ügynök belső döntéshozatala, amire ez a cikk épít), az <em>MCP</em> (az eszköz-hozzáférési réteg, ami az A2A-t kiegészíti), a <em>Harness engineering</em> (az observability és guardrails rétegek, amik multi-agent rendszerekben még kritikusabbak) és az <em>Agentic kódolás</em> tutorialok.</p>

<p class="topic-tagline" style="margin-top:12px;font-size:0.85em;opacity:0.75">* A 90,2%-os, 15×-ös és 80%-os adat az Anthropic saját, publikált kutatási rendszerének dokumentációjából származik; a 66,4%-os piaci arány és a 41,77%-os MAST-taxonómia adat 2026-os iparági és akadémiai elemzésekből — lásd a 1–2. és 5. részt a kontextusért.</p>
::::::
