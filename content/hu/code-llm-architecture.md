---
page: code-llm-architecture
title: Kódoló modellek — hogyan tanulnak és épülnek fel
sidebar_groups:
  - Elmélet
  - A FIM-mechanizmus
  - A tanítóadat
  - Referencia
hero:
  eyebrow: "Kódoló modellek · Fejlesztői Tanulási Terv"
  title: "Kódoló modellek — <em>hogyan tanulnak és épülnek fel</em>"
  lead: "Egy kódoló modell (Codestral, DeepSeek-Coder, Qwen-Coder) nem csak \"egy LLM, amit kódon tanítottak\" — van egy konkrét, a sima szöveg-generálásból hiányzó tanítási trükk (Fill-in-the-Middle), ami nélkül egy modell nem tudna érdemben kódot szerkeszteni, csak folytatni. Ez a cikk megmutatja, mi ez a trükk, milyen adaton tanulnak, és milyen architektúrát választanak ehhez."
  stats:
    - { val: "60/10/30%", lbl: "kód/matek/nyelv arány (DeepSeek-Coder-V2)*" }
    - { val: "0,5", lbl: "tipikus FIM-arány tanításnál*" }
    - { val: "5", lbl: "Szakasz" }
    - { val: "91,6%", lbl: "HumanEval-FIM, egy élvonalbeli modellnél*" }
footer:
  left: "AI Hub · Kódoló modellek"
  right: "Kódoló modellek · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#code-llm-architecture-0"><div class="tc-num">0. rész</div><div class="tc-name">Miért nem elég a sima, balról-jobbra generálás</div><div class="tc-desc">A hiányzó képesség, ami a kódszerkesztéshez kell.</div></a>
  <a class="toc-card" href="#code-llm-architecture-1"><div class="tc-num">1. rész</div><div class="tc-name">A Fill-in-the-Middle (FIM) tanítás</div><div class="tc-desc">Hogyan tanítod meg a modellt "középre" írni.</div></a>
  <a class="toc-card" href="#code-llm-architecture-2"><div class="tc-num">2. rész</div><div class="tc-name">Az arány-kompromisszum</div><div class="tc-desc">Miért nem 100%-os a FIM-arány.</div></a>
  <a class="toc-card" href="#code-llm-architecture-3"><div class="tc-num">3. rész</div><div class="tc-name">A tanítóadat: nem csak kód</div><div class="tc-desc">Miért kell matek és természetes nyelv is a mixbe.</div></a>
  <a class="toc-card" href="#code-llm-architecture-4"><div class="tc-num">4. rész</div><div class="tc-name">Adattisztítás: deduplikáció GitHub-szinten</div><div class="tc-desc">Miért kritikus ez kódnál még jobban, mint szövegnél.</div></a>
</div>
::::::

:::::: section id=code-llm-architecture-0 num="00" heading="0. rész — Miért nem elég a sima, balról-jobbra generálás" nav="Miért nem elég a sima generálás" group="Elmélet"

<p class="topic-tagline">Cél: érts meg egy konkrét hiányosságot, amit a hagyományos, csak-folytatásra tanított modell mutat kódnál.</p>

### A probléma: a kód nem lineárisan íródik

::::: callout label="Amit a sima balról-jobbra tanítás nem tud"
Egy hagyományos, a <em>Hogyan tanul egy modell</em> tutorialban megismert "jósold a következő tokent" célfüggvénnyel tanított modell csak **folytatni** tud egy kódrészletet — ha egy már meglévő függvény **közepébe** kellene beszúrni valamit (a leggyakoribb valós szerkesztési feladat), a modellnek nincs mechanizmusa arra, hogy figyelembe vegye, mi jön **utána** a beszúrási pont után.
:::::

::::: callout warning label="Miért ez a leggyakoribb valós eset"
Kutatások szerint az **infilling** (a kód közepébe illesztés) forgatókönyvek alkotják a valós, gyakorlati kódkiegészítési feladatok **többségét** — nem a "folytasd a fájl végét" a jellemző eset, hanem "illeszd be a hiányzó darabot ide, a már meglévő kód közé".
:::::

::::: callout label="Egy mondatban"
Egy kódoló modellnek nem elég "jó kódot generálni" — képesnek kell lennie **kétirányú kontextust** kezelni, ami a hagyományos, csak-előre-néző tanítási célból nem következik automatikusan.
:::::
::::::

:::::: section id=code-llm-architecture-1 num="01" heading="1. rész — A Fill-in-the-Middle (FIM) tanítás" nav="A Fill-in-the-Middle (FIM) tanítás" group="A FIM-mechanizmus"

<p class="topic-tagline">Cél: ismerd meg a konkrét tanítási trükköt, ami megoldja a 0. részben látott problémát.</p>

### Az alapötlet: átrendezed a sorrendet tanítás közben

::::: callout label="A FIM-transzformáció"
A **Fill-in-the-Middle** (Bavarian és szerzőtársai, 2022) egy egyszerű, de hatásos ötlet: a tanítóadat egy kódrészletét **három darabra vágod** (prefix, middle, suffix), majd **átrendezed** a sorrendet: `prefix + suffix + middle` — ezután a modellt **továbbra is** a szokásos, balról-jobbra "jósold a következő tokent" céllal tanítod, csak az input-sorrend más.
:::::

::::: callout label="Miért működik ez decoder-only architektúrán is"
Az <em>Egy modell anatómiája</em> tutorialban megismert **decoder-only** transformerek (amik túlnyomó többségben vannak ma) alapvetően **nem** kezelnek kétirányú kontextust — a FIM trükkje éppen az, hogy **nem kell** módosítani az architektúrát, elég az adatot átrendezni úgy, hogy a modell **megtanulja**, "amikor egy speciális jelölést lát, az azt jelenti: a hiányzó rész a végén jön".
:::::

```
Eredeti kód:       def add(a, b):\n    return a + b
FIM-átrendezve:     <PRE> def add(a, b):\n    <SUF>    return a + b <MID>
```

::::: callout label="Egy mondatban"
A FIM nem egy új architektúra, hanem egy **adat-átrendezési trükk**, ami a meglévő, egyirányú decoder-only modellt megtanítja arra, hogy a kód közepébe illesszen be tartalmat — pontosan ezt a képességet hívja "infillingnek" a szakirodalom.
:::::
::::::

:::::: section id=code-llm-architecture-2 num="02" heading="2. rész — Az arány-kompromisszum: miért nem 100%-os a FIM-arány" nav="Az arány-kompromisszum" group="A FIM-mechanizmus"

<p class="topic-tagline">Cél: érts meg egy finomítást, amit a korai FIM-kutatás után a gyakorlat felülírt.</p>

### Az eredeti ígéret és a valóság

::::: callout label="A \"FIM ingyen van\" eredeti állítás"
Az eredeti Bavarian-cikk azt állította, hogy akár **90%-os** FIM-aránnyal (a tanítóadat 90%-a FIM-formátumban) tanítva sem sérül a modell hagyományos, balról-jobbra generálási képessége — ezt hívták "FIM-for-free" tulajdonságnak.
:::::

::::: callout danger label="Amit a későbbi modellek megfigyeltek"
A StarCoder és a DeepSeek-Coder fejlesztői **nem erősítették meg** ezt teljesen — dokumentáltan **0,7-es** FIM-arány már **érezhetően rontja** a hagyományos generálási teljesítményt, ezért a gyakorlatban a modern kódoló modellek **0,5** körüli FIM-arányra korlátozzák magukat, a két képesség (folytatás és infilling) közötti egyensúly megtartásáért.
:::::

::::: callout label="Egy mondatban"
A FIM-arány egy tudatos kompromisszum — minél magasabb, annál jobb az infilling-képesség, de egy ponton túl **rontja** a hagyományos, "folytasd a kódot" képességet, és a modern modellek kb. fele-fele arányt választanak.
:::::
::::::

:::::: section id=code-llm-architecture-3 num="03" heading="3. rész — A tanítóadat: nem csak kód" nav="A tanítóadat: nem csak kód" group="A tanítóadat"

<p class="topic-tagline">Cél: érts meg egy meglepő, de dokumentált tényt a kódoló modellek tanítóadat-összetételéről.</p>

### Egy konkrét, publikált arány

::::: callout danger label="A DeepSeek-Coder-V2 tanítóadat-mixe"
A DeepSeek-Coder-V2 pretraining adata **60% forráskód**, **10% matematikai korpusz** és **30% természetes nyelvi szöveg** — ez a keverék **nem véletlen**: a matematikai adat a **logikai/algoritmikus gondolkodást**, a természetes nyelvi adat a **kódhoz tartozó kommentek, dokumentáció és a felhasználói kérések megértését** erősíti.
:::::

::::: callout warning label="Miért nem elég \"csak kódon\" tanítani"
Ha egy modell **csak** forráskódon tanulna, elveszítené a képességét, hogy **természetes nyelvi kéréseket** (pl. "írj egy függvényt, ami...") értelmesen összekössön a generálandó kóddal — a <em>Hogyan tanul egy modell</em> tutorialban tárgyalt pretraining-elv itt is érvényes: a modellnek **mindkét "nyelvet"** (természetes és programozási) látnia kell, hogy köztük tudjon fordítani.
:::::

::::: callout label="Egy mondatban"
Egy jó kódoló modell tanítóadata tudatosan **kevert** — a matek erősíti a logikát, a természetes nyelv a kérés-megértést, és csak a fennmaradó, döntő többség a tényleges forráskód.
:::::
::::::

:::::: section id=code-llm-architecture-4 num="04" heading="4. rész — Adattisztítás: deduplikáció GitHub-szinten" nav="Adattisztítás" group="Referencia"

<p class="topic-tagline">Cél: érts meg egy kódra jellemző adattisztítási kihívást, ami szöveges adatnál kevésbé súlyos.</p>

### Miért kritikusabb a duplikáció-probléma kódnál

::::: callout label="A repository- és fájl-szintű deduplikáció"
A kódoló modellek tanítóadat-előkészítésénél két szinten végeznek deduplikációt: **egyezéses** (SHA256 hash-alapú, pontos egyezés) és **közelítő** (MinHash-algoritmus, hasonló, de nem azonos kód-blokkok) — mindkettőt **repository- és fájl-szinten** is elvégzik, mert a GitHub-on rengeteg **forkolt, kopírozott vagy boilerplate** kód kering, ami feleslegesen ismételné a tanítóadatot.
:::::

::::: callout warning label="Konkrét szűrési szabályok"
A DeepSeek-Coder-V2 dokumentált szűrési szabályai közt szerepel: kizárják azokat a fájlokat, amiknek az **átlagos sorhossza 100 karakternél** hosszabb, vagy a **maximális sorhossz 1000 karaktert** meghaladja (ez gyakran minifikált vagy automatikusan generált kódra utal), és kizárják azokat, amikben az **alfabetikus karakterek aránya 25% alatt** van (ez gyakran adatfájlokra, nem valódi kódra jellemző).
:::::

::::: callout label="Egy mondatban"
A kódnál a duplikáció és a "álkód" (minifikált, generált, boilerplate) kiszűrése ugyanolyan fontos, mint a <em>Hogyan tanul egy modell</em> tutorialban tárgyalt általános adattisztítás — csak itt kód-specifikus heurisztikákkal (sorhossz, alfabetikus arány, repository-szintű egyezés) történik.
:::::
::::::

:::::: section id=code-llm-architecture-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0–1. rész"
Miért nem elég a sima, balról-jobbra generálás kódszerkesztéshez · a Fill-in-the-Middle (FIM) tanítási trükk, ami átrendezi a tanítóadatot, nem az architektúrát
::::
:::: card label="2. rész"
Az arány-kompromisszum: a "FIM ingyen van" eredeti állítás vs. a gyakorlatban tapasztalt, 0,5 körüli optimális FIM-arány
::::
:::: card label="3. rész"
A tanítóadat tudatosan kevert (60% kód, 10% matek, 30% nyelv a DeepSeek-Coder-V2-nél) — a kód-only tanítás elveszítené a kérés-megértési képességet
::::
:::: card label="4. rész"
Kód-specifikus adattisztítás: repository- és fájl-szintű deduplikáció, konkrét sorhossz- és alfabetikus-arány szűrők
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>Hogyan tanul egy modell</em> (az alap pretraining-elv, amire a FIM épül), az <em>Egy modell anatómiája</em> (a decoder-only architektúra, ami a FIM-hez nem igényel módosítást) és a <em>Speciális területre tanított modellek</em> (a domain-adaptáció szélesebb elve, amibe a kódoló modellek is beletartoznak) tutorialok.</p>

<p class="topic-tagline" style="margin-top:12px;font-size:0.85em;opacity:0.75">* A tanítóadat-arányok, a FIM-arány és a HumanEval-FIM eredmény 2026-os kutatási publikációkból (DeepSeek-Coder-V2, Codestral) és iparági elemzésekből származnak — lásd a 2–3. részt a kontextusért.</p>
::::::
