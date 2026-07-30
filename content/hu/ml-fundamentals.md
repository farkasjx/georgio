---
page: ml-fundamentals
title: Gépi tanulás alapjai — a fogalmak, amikre minden más épül
sidebar_groups:
  - Alapfogalmak
  - A két nagy típus
  - A legfontosabb csapda
  - Referencia
hero:
  eyebrow: "Gépi tanulás alapjai · Fejlesztői Tanulási Terv"
  title: "Gépi tanulás alapjai — <em>a fogalmak, amikre minden más épül</em>"
  lead: "A Hogyan tanul egy modell tutorial már bemutatta, hogyan tanul egy LLM — de olyan alapfogalmakat használt (tanítóadat, hiba mérése), amiket sosem definiált explicit. Ez a cikk egy lépéssel hátrébb lép: mi az a felügyelt tanulás, mi a különbség regresszió és klasszifikáció között, és mi az az egyetlen csapda (overfitting), amibe a legtöbb kezdő modell besétál."
  stats:
    - { val: "2", lbl: "fő feladattípus" }
    - { val: "3", lbl: "adathalmaz (train/val/test)" }
    - { val: "6", lbl: "Szakasz" }
    - { val: "1", lbl: "csapda, ami mindent eldönt" }
footer:
  left: "AI Hub · Gépi tanulás alapjai"
  right: "Gépi tanulás alapjai · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#ml-fundamentals-0"><div class="tc-num">0. rész</div><div class="tc-name">Mi az a felügyelt tanulás</div><div class="tc-desc">A közös alap minden más fogalom mögött.</div></a>
  <a class="toc-card" href="#ml-fundamentals-1"><div class="tc-num">1. rész</div><div class="tc-name">Regresszió vs. klasszifikáció</div><div class="tc-desc">Számot jósolsz, vagy kategóriát?</div></a>
  <a class="toc-card" href="#ml-fundamentals-2"><div class="tc-num">2. rész</div><div class="tc-name">Három adathalmaz: train, validation, test</div><div class="tc-desc">Miért nem elég egyetlen adatkészlet.</div></a>
  <a class="toc-card" href="#ml-fundamentals-3"><div class="tc-num">3. rész</div><div class="tc-name">Overfitting és underfitting</div><div class="tc-desc">A csapda, ami minden modellnél leselkedik.</div></a>
  <a class="toc-card" href="#ml-fundamentals-4"><div class="tc-num">4. rész</div><div class="tc-name">A bias-variance kompromisszum</div><div class="tc-desc">Miért nem old meg mindent az "egyszerűbb" vagy a "bonyolultabb".</div></a>
  <a class="toc-card" href="#ml-fundamentals-5"><div class="tc-num">5. rész</div><div class="tc-name">Hova illeszkedik ez az LLM-ekhez</div><div class="tc-desc">A híd a klasszikus ML és a Hogyan tanul egy modell tutorial közt.</div></a>
</div>
::::::

:::::: section id=ml-fundamentals-0 num="00" heading="0. rész — Mi az a felügyelt tanulás" nav="Mi az a felügyelt tanulás" group="Alapfogalmak"

<p class="topic-tagline">Cél: értsd meg a legalapvetőbb mintát, ami a legtöbb gépi tanulási rendszer mögött áll.</p>

### A diák-analógia

::::: callout label="A felügyelt tanulás lényege"
A **felügyelt tanulás** (supervised learning) azt jelenti, hogy a modell **címkézett** adaton tanul — minden bemenethez (input) tartozik egy ismert, helyes kimenet (output/label). Ez olyan, mint amikor egy diák gyakorlófeladatokat old meg, amikhez **mellékelve vannak a megoldások** — a diák (modell) addig gyakorol, amíg a saját válaszai egyre közelebb kerülnek a helyes megoldásokhoz.
:::::

### A tipikus munkafolyamat

::::: stack-grid
:::: card label="1 · Adatgyűjtés"
Bemenet-kimenet párok összegyűjtése — pl. házak jellemzői (bemenet) és eladási áruk (kimenet).
::::
:::: card label="2 · Tanítás"
A modell megtanulja a mintázatot a bemenet és a kimenet között — ugyanaz a "jósolj → mérd a hibát → korrigálj" hurok, amit a <em>Hogyan tanul egy modell</em> tutorial 0. részében megismertél.
::::
:::: card label="3 · Predikció"
A betanított modell **új, még nem látott** bemeneteken is tud jósolni — ez a valódi cél, nem a tanítóadat "bemagolása".
::::
:::::

::::: callout label="Egy mondatban"
A felügyelt tanulás nem más, mint mintázat-felismerés címkézett példákból — és ugyanez az alapelv áll az LLM-ek pretraining-je mögött is, csak ott a "címke" maga a következő szó a szövegben.
:::::
::::::

:::::: section id=ml-fundamentals-1 num="01" heading="1. rész — Regresszió vs. klasszifikáció: számot jósolsz, vagy kategóriát?" nav="Regresszió vs. klasszifikáció" group="A két nagy típus"

<p class="topic-tagline">Cél: ismerd meg a felügyelt tanulás két fő ágát — ez a megkülönböztetés szinte minden más ML-fogalom alapja.</p>

### Egyetlen kérdés dönti el, melyikről van szó

::::: compare
::: good label="Regresszió: folytonos szám a kimenet"
A cél egy **folytonos, numerikus érték** megjóslása — pl. házár, hőmérséklet, várható élettartam. Tipikus algoritmusok: lineáris regresszió, gradient boosting.
:::
::: bad label="Klasszifikáció: kategória a kimenet"
A cél egy **diszkrét kategória** közül választani — pl. "spam vagy nem spam", "kutya, macska vagy madár". Tipikus algoritmusok: logisztikus regresszió (a neve ellenére ez is klasszifikáció!), döntési fák, support vector machine.
:::
:::::

::::: callout warning label="Egy gyakori névbeli csapda"
A **logisztikus regresszió** a nevében "regresszió", de valójában **klasszifikációs** algoritmus — egy valószínűséget számol (0 és 1 között), amit aztán egy küszöbérték alapján kategóriává alakít. Ha ezzel a névvel találkozol, ne hagyd magad megzavarni.
:::::

### Konkrét, hétköznapi példák

::::: stack-grid
:::: card label="Regresszió a gyakorlatban"
Lakásár-becslés négyzetméter és elhelyezkedés alapján · készletigény-előrejelzés · várható szállítási idő.
::::
:::: card label="Klasszifikáció a gyakorlatban"
E-mail spam-szűrés · orvosi diagnózis (beteg/egészséges) · képfelismerés (mi van a képen).
::::
:::::

::::: callout label="Egy mondatban"
Amikor egy ML-problémával találkozol, az első kérdés mindig: "számot vagy kategóriát akarok jósolni?" — ez a válasz dönti el, melyik algoritmus-családot és melyik kiértékelési módszert érdemes használnod.
:::::
::::::

:::::: section id=ml-fundamentals-2 num="02" heading="2. rész — Három adathalmaz: train, validation, test" nav="Három adathalmaz" group="Alapfogalmak"

<p class="topic-tagline">Cél: értsd meg, miért nem elég egyetlen adatkészleten tanítani és mérni egy modellt.</p>

### Miért kell szétválasztani az adatot

::::: callout label="A három szerep"
A **tanító (train) halmazon** a modell ténylegesen tanul — ezen fut a "jósolj → mérd a hibát → korrigálj" hurok. A **validációs (validation) halmazt** a tanítás **közben** használod, hogy figyeld, a modell valóban általánosít-e, vagy csak a tanítóadatot magolja be. A **teszt (test) halmazt** csak a **legvégén, egyszer** használod — ez adja a végső, elfogulatlan teljesítmény-becslést.
:::::

::::: callout warning label="A leggyakoribb kezdő hiba"
Ha a teszt-halmazt a fejlesztés **közben**, ismételten használod (pl. minden módosítás után újra megnézed rajta a pontosságot), a modell **közvetve** "megtanulja" a teszt-halmazt is — ekkor a végső szám már nem megbízható, elfogulatlan becslés, hanem hamisan optimista.
:::::

::::: callout label="Tipikus arányok"
Egy gyakori felosztás **70-80% tanító**, **10-15% validációs** és **10-15% teszt** adat — de a pontos arány a rendelkezésre álló adat mennyiségétől függ; nagyon nagy adathalmazoknál a validációs/teszt rész abszolút mérete is elég lehet kisebb százalékkal.
:::::

::::: callout label="Egy mondatban"
A három adathalmaz különválasztása az egyetlen módja annak, hogy őszintén megtudd, a modelled tényleg **általánosít**-e új, még nem látott adatra, nem csak a már ismert példákat magolta be.
:::::
::::::

:::::: section id=ml-fundamentals-3 num="03" heading="3. rész — Overfitting és underfitting: a csapda, ami minden modellnél leselkedik" nav="Overfitting és underfitting" group="A legfontosabb csapda"

<p class="topic-tagline">Cél: ismerd meg a legfontosabb, leggyakrabban idézett hibamódot a teljes gépi tanulásban.</p>

### Két szélsőség, egy közös gyökér

::::: compare
::: bad label="Underfitting (túl egyszerű a modell)"
A modell **nem is a tanítóadaton** teljesít jól — se a tanító, se a teszt hibája nem alacsony. Ez azt jelenti, a modell túl egyszerű ahhoz, hogy megragadja a valós mintázatot (pl. egyenes vonalat illesztesz egy nyilvánvalóan görbe adatra).
:::
::: good label="Overfitting (túl komplex a modell)"
A modell a **tanítóadaton majdnem tökéletes**, de a teszt-adaton **sokkal rosszabb**. Ez azt jelenti, a modell megjegyezte a tanítóadat zaját és egyedi sajátosságait is, nem csak az általános mintázatot.
:::
:::::

### Egy konkrét, számokkal illusztrált eset

::::: callout danger label="A klasszikus házár-becslés példa"
Egy korlátlan mélységű döntési fa **1200 dolláros hibával** (majdnem tökéletesen) illeszkedik a tanítóadatra, de a teszt-adaton **68 000 dolláros** hibát produkál — ez a klasszikus overfitting jele: a modell megtanulta a zajt, nem az általános mintázatot. Egy jól belőtt, korlátozott mélységű fa ezzel szemben **41 000 dolláros** tanító- és **47 000 dolláros** teszthibát ad — a két szám közötti kisebb rés azt mutatja, hogy ez a modell jobban **általánosít**.
:::::

::::: callout label="Egy gyors diagnosztikai szabály"
Ha a **tanító hiba is magas**: valószínűleg underfitting (túl egyszerű a modell). Ha a **tanító hiba alacsony, de a teszt hiba sokkal magasabb**: valószínűleg overfitting (túl komplex, vagy túl kevés az adat).
:::::

::::: callout label="Egy mondatban"
Az overfitting és az underfitting nem elméleti fogalom — ez a **legpraktikusabb diagnosztikai eszköz**, amivel egy pillantás alatt megállapíthatod, milyen irányba kell módosítanod egy modellt: egyszerűsíteni vagy komplexebbé tenni.
:::::
::::::

:::::: section id=ml-fundamentals-4 num="04" heading="4. rész — A bias-variance kompromisszum" nav="A bias-variance kompromisszum" group="A legfontosabb csapda"

<p class="topic-tagline">Cél: értsd meg az elméleti keretet, ami az overfitting/underfitting jelenség mögött áll.</p>

### Két hibaforrás, ami ellentétes irányba húz

::::: callout label="A két fogalom"
A **bias** (torzítás) az a hiba, ami abból ered, hogy a modell **túl egyszerű** feltételezésekkel közelíti a valóságot — magas bias esetén a modell **alulteljesít mind a tanító, mind a teszt adaton** (ez az underfitting). A **variancia** az a hiba, ami abból ered, hogy a modell **túlságosan érzékeny** a tanítóadat apró, véletlen ingadozásaira — magas variancia esetén a modell **jól teljesít a tanítóadaton, de rosszul az újon** (ez az overfitting).
:::::

::::: callout warning label="Miért \"tradeoff\" (kompromisszum) ez"
A bias csökkentése (komplexebb modell, több jellemző) tipikusan **növeli** a varianciát, és fordítva — a cél nem az egyik nullára csökkentése, hanem az a **édes pont**, ahol a kettő összege (plusz az elkerülhetetlen zaj) a legkisebb.
:::::

::::: callout label="A mélytanulás különleges esete"
Elégséges adat és megfelelő **regularizáció** (a modell komplexitásának tudatos korlátozása) mellett a mélytanulási modellek — mint amiket a <em>Hogyan tanul egy modell</em> tutorialban megismertél — képesek **egyszerre alacsony biast és alacsony varianciát** elérni, ami a klasszikus, kis adathalmazos statisztikai tanulásban ritkábban volt elérhető.
:::::

::::: callout label="Egy mondatban"
A bias-variance kompromisszum az elméleti magyarázat arra, **miért** létezik egyáltalán az overfitting/underfitting jelenség — a kettő nem véletlen hiba, hanem egy alapvető, matematikai feszültség a modell egyszerűsége és rugalmassága között.
:::::
::::::

:::::: section id=ml-fundamentals-5 num="05" heading="5. rész — Hova illeszkedik ez az LLM-ekhez" nav="Hova illeszkedik ez az LLM-ekhez" group="Referencia"

<p class="topic-tagline">Cél: kösd össze ezt a cikket a Hogyan tanul egy modell tutoriallal — lásd, mi az, ami megegyezik, és mi változik léptékben.</p>

### Ugyanaz az alap, más lépték

::::: callout label="Amiben megegyezik"
A <em>Hogyan tanul egy modell</em> tutorialban látott "jósolj → mérd a hibát → korrigálj" hurok **technikailag ugyanaz** a felügyelt tanulási minta, amit ez a cikk bemutatott — csak a "címke" itt nem egy külön megadott érték, hanem **maga a következő szó** a szövegben (ezt hívják **önfelügyelt tanulásnak**, self-supervised learning, a felügyelt tanulás egy speciális esete).
:::::

::::: callout label="Amiben más a lépték"
Az LLM-eknél az overfitting kockázata **más módon** jelentkezik, mint egy kis, klasszikus ML-modellnél — egy több milliárd paraméteres modell, ami billiónyi tokenen tanul, ritkábban "magolja be" szó szerint az egyes mondatokat, de a <em>Knowledge cutoff</em> tutorialban tárgyalt **catastrophic forgetting** ugyanabból a rugalmasság/merevség feszültségből ered, mint a bias-variance kompromisszum.
:::::

::::: callout label="Egy mondatban"
Ha ezt a cikket megértetted, a <em>Hogyan tanul egy modell</em>, a <em>Fine-tuning technikák</em> és az <em>Evaluation</em> tutorialok mögötti alapfeltevések (miért kell validációs adat, miért veszélyes a túltanítás) most már nem "adottságok", hanem **levezethető, megértett elvek**.
:::::
::::::

:::::: section id=ml-fundamentals-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0–1. rész"
A felügyelt tanulás alapmintája (címkézett adat, bemenet-kimenet párok) · regresszió (szám) vs. klasszifikáció (kategória) — a két fő feladattípus
::::
:::: card label="2. rész"
Miért kell három külön adathalmaz (train/validation/test), és miért hamisítja meg az eredményt a teszt-halmaz ismételt használata
::::
:::: card label="3–4. rész"
Overfitting és underfitting konkrét, számokkal illusztrált példával · a bias-variance kompromisszum mint elméleti magyarázat a jelenség mögött
::::
:::: card label="5. rész"
A híd a klasszikus ML és az LLM-ek pretraining-je között — ugyanaz az alapminta, más lépték és más overfitting-kockázat
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>Hogyan tanul egy modell</em> (az LLM-specifikus tanítási hurok, amire ez a cikk az előfeltételeket adja), az <em>Evaluation</em> (a validációs elv kiterjesztése benchmarkokra) és a <em>Knowledge cutoff</em> (a catastrophic forgetting, ami rokon jelenség a bias-variance kompromisszummal) tutorialok.</p>

<p class="topic-tagline" style="margin-top:12px;font-size:0.85em;opacity:0.75">* A házár-becslési RMSE-adatok egy 2026-os, statisztikai oktatóanyagból származó illusztratív példából származnak — lásd a 3. részt a kontextusért.</p>
::::::
