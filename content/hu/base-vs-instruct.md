---
page: base-vs-instruct
title: Base vs. Instruct modell — hogyan lesz a nyers szövegjósolóból asszisztens
sidebar_groups:
  - Elmélet
  - A folyamat
  - Gyakorlat
  - Referencia
hero:
  eyebrow: "Base vs. Instruct · Fejlesztői Tanulási Terv"
  title: "Base vs. Instruct modell — <em>hogyan lesz a nyers szövegjósolóból asszisztens</em>"
  lead: "Ha valaha láttál már egy modellnevet, aminek a végén ott áll, hogy \"-instruct\" (pl. llama3.1:8b-instruct), és nem tudtad pontosan, mihez képest instruct — ez a cikk erről szól. A base modell és az instruct modell nem két különböző termék, hanem ugyanannak a modellnek két állapota egy tanítási folyamat előtt és után. Épít a <em>RLHF</em> és a <em>Knowledge cutoff</em> tutorialokra — azoknak a matekját itt nem ismételjük, csak a nagy képet rakjuk össze."
  stats:
    - { val: "2", lbl: "Fő fázis" }
    - { val: "340×", lbl: "megbízhatóbb formátum*" }
    - { val: "6", lbl: "Szakasz" }
    - { val: "0", lbl: "PPO-matek (lásd RLHF)" }
footer:
  left: "AI Hub · Base vs. Instruct modell"
  right: "Base vs. Instruct · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#base-instruct-0"><div class="tc-num">0. rész</div><div class="tc-name">A meglepő kísérlet</div><div class="tc-desc">Mi történik, ha egy base modellt megkérdezel valamiről.</div></a>
  <a class="toc-card" href="#base-instruct-1"><div class="tc-num">1. rész</div><div class="tc-name">Pretraining: mit tanul, mit nem</div><div class="tc-desc">A base modell csak "folytat" — sosem tanult beszélgetni.</div></a>
  <a class="toc-card" href="#base-instruct-2"><div class="tc-num">2. rész</div><div class="tc-name">A hiányzó láncszem: instruction tuning</div><div class="tc-desc">Speciális tokenek és a chat template trükkje.</div></a>
  <a class="toc-card" href="#base-instruct-3"><div class="tc-num">3. rész</div><div class="tc-name">Hol jön be az RLHF</div><div class="tc-desc">Rövid kapocs — a részletek külön tutorialban.</div></a>
  <a class="toc-card" href="#base-instruct-4"><div class="tc-num">4. rész</div><div class="tc-name">A harmadik réteg: reasoning modellek</div><div class="tc-desc">Nem csak instruct — van egy további specializáció is.</div></a>
  <a class="toc-card" href="#base-instruct-5"><div class="tc-num">5. rész</div><div class="tc-name">Hogyan ismerd fel — és mikor kell base</div><div class="tc-desc">Modellnév-konvenciók, és a ritka esetek, amikor base kell.</div></a>
</div>
::::::

:::::: section id=base-instruct-0 num="00" heading="0. rész — A meglepő kísérlet: mi történik, ha egy base modellt megkérdezel" nav="A meglepő kísérlet" group="Elmélet"

<p class="topic-tagline">Cél: lásd konkrétan, mennyire más egy base modell viselkedése, mint amit chatbotoktól megszoktál.</p>

### Ugyanaz a kérdés, két teljesen más válasz

Képzeld el, hogy beírod egy modellnek: **"Mi Franciaország fővárosa?"**

::::: compare
::: bad label="Base modell válasza"
A modell nem feltétlenül válaszol — hajlamos **folytatni** a szöveget, mintha egy dokumentumban találta volna ezt a mondatot: *"Mi Franciaország fővárosa? Mi Németország fővárosa? Mi Olaszország fővárosa?..."* — mert statisztikailag pontosan ilyen mintázatok (kvízkérdés-listák) is előfordulnak a tanítóadatban, és a modell egyszerűen **a legvalószínűbb következő szöveget** jósolja, nem azt, amit *te* szeretnél hallani.
:::
::: good label="Instruct modell válasza"
*"Franciaország fővárosa Párizs."* — röviden, közvetlenül, mert ez a modell **megtanulta**, hogy egy kérdésre válasz jár, nem a kérdés folytatása.
:::
:::::

::::: callout label="Ez nem hiba — ez a tervezett viselkedés"
A base modell **semmit nem csinál rosszul** ebben a példában — pontosan azt teszi, amire tanították: a **statisztikailag legvalószínűbb folytatást** adja. Csak épp senki nem tanította meg neki, hogy egy kérdés esetén *válaszolnia* kellene, nem *folytatnia*.
:::::

::::: callout label="Egy mondatban"
A base és az instruct modell közötti különbség nem tudásbeli, hanem **viselkedésbeli** — mindkettő ugyanazt "tudja", de csak az egyik tanulta meg, hogyan viselkedjen egy beszélgetésben.
:::::
::::::

:::::: section id=base-instruct-1 num="01" heading="1. rész — Pretraining: mit tanul meg egy base modell, és mit nem" nav="Pretraining: mit tanul, mit nem" group="Elmélet"

<p class="topic-tagline">Cél: értsd meg pontosan, milyen "tudás" épül be a modellbe az első tanítási fázisban.</p>

### A pretraining lényege

A **pretraining** (előretanítás) során a modell egyetlen, egyszerű feladatot gyakorol milliárdnyi alkalommal: **megkapja egy szöveg elejét, és megjósolja a következő szót**. A tanítóadat az internet, könyvek, kód és egyéb szöveges források hatalmas tömege — nincs benne "kérdés-válasz" struktúra kijelölve, csak nyers, folyamatos szöveg.

::::: callout label="Amit ez a modellbe épít"
A pretraining során a modell megtanulja a **nyelv statisztikai szerkezetét**, hatalmas mennyiségű **tényszerű tudást** (ez lesz a <em>Modellméret és tudás</em> tutorialban tárgyalt "parametrikus tudás"), és a szövegek tipikus **mintázatait** — de **nem** tanul meg semmit arról, hogyan viselkedjen egy párbeszédben, mert a tanítóadatban nincs kitüntetve, mikor van vége egy "kérdésnek" és hol kezdődik a "válasz".
:::::

### Miért nevezik "nyers pattern-matchernek"

::::: callout warning label="Egy találó hasonlat"
Egy base modellt sokan egy **könyvtárhoz** hasonlítanak: hatalmas, nyers tudásanyag, amit bárki felhasználhat, de önmagában nem "asszisztens" — nem tudja, mit *akarsz* csinálni vele. Az instruct modell ehhez képest inkább egy **kész alkalmazás**: ugyanarra az alaptudásra épül, de már úgy van "becsomagolva", hogy egy konkrét célra (segítőkész párbeszéd) azonnal használható legyen.
:::::

::::: callout label="Egy mondatban"
A base modell a nyers, feldolgozatlan tudás — hatalmas érték, de a "hogyan válaszoljak egy kérdésre" viselkedést **külön, tudatosan hozzá kell adni** egy második tanítási szakaszban, ami a következő rész témája.
:::::
::::::

:::::: section id=base-instruct-2 num="02" heading="2. rész — A hiányzó láncszem: instruction tuning" nav="A hiányzó láncszem" group="A folyamat"

<p class="topic-tagline">Cél: lásd konkrétan, technikailag mi történik ebben a második tanítási fázisban.</p>

### Ugyanaz a mechanizmus, más adat

Az **instruction tuning** (más néven **SFT — Supervised Fine-Tuning**, ahogy a <em>RLHF tutorial</em> 1. részében is szerepel) technikailag **ugyanazt** a "jósold meg a következő szót" feladatot gyakoroltatja tovább — de most a tanítóadat már nem nyers internetes szöveg, hanem gondosan összeállított **beszélgetés-párok**: instrukció és a hozzá tartozó, elvárt válasz.

::::: callout label="A kulcs-trükk: speciális tokenek"
A modell ebben a fázisban tanulja meg a **speciális jelölő-tokeneket**, amik megmutatják neki, hol kezdődik és végződik egy adott szereplő megszólalása. Egy tipikus, egyszerűsített formátum így néz ki:
:::::

```
<|user_start|>Mi Franciaország fővárosa?<|user_end|>
<|assistant_start|>Franciaország fővárosa Párizs.<|assistant_end|>
```

::::: callout warning label="Fontos: ezek a tokenek a pretraining alatt gyakorlatilag nem léteztek"
A base modell tanítása alatt ilyen jelölők **nem** vagy alig fordultak elő — az instruction tuning fázis feladata pont az, hogy a modell **megtanulja használni és tiszteletben tartani** ezeket a határokat: amikor `<|assistant_start|>` után kell folytatnia, azt tanulja meg, hogy ott **válaszolnia** kell, nem a felhasználó kérdését kell folytatnia.
:::::

### Miért nem "csak egy kis hangolás" ez valójában

Egy dokumentált kísérlet szerint egy tisztán pretraining-eken átesett base modell a **strukturált kimenet** (pl. egy előírt formátum betartása) esetében **68,3%-ban** hibázott, míg egy instruction-tuned modell ugyanezen a feladaton **0,2%-ban** — vagyis a formátum-követésben közel **340-szeres** volt a megbízhatósági különbség.

::::: callout label="Egy mondatban"
Az instruction tuning nem "kozmetikai" változtatás — ez az a lépés, ami megtanítja a modellnek, hogy egy adott jelölés után **válaszolnia**, nem **folytatnia** kell a szöveget, és ez a különbség dönti el, hogy a modell használható-e chatbotként.
:::::
::::::

:::::: section id=base-instruct-3 num="03" heading="3. rész — Hol jön be az RLHF: a harmadik simítás" nav="Hol jön be az RLHF" group="A folyamat"

<p class="topic-tagline">Cél: illeszd be ezt a fogalmat a teljes pipeline-ba — a részletekért irány a saját tutorial.</p>

### Az instruction tuning még nem elég

Egy csak instruction tuning-on átesett modell már **követi** az utasításokat, de gyakran még **döcögős, esetlen vagy nem eléggé segítőkész** — nem tudja, melyik a *jobb* a több, formailag helyes válasz közül. Itt lép be a harmadik fázis:

::::: callout label="A teljes lánc három állomása"
**Pretraining** (mit "tud" a modell — nyers nyelvi és tényszerű tudás) → **Instruction tuning / SFT** (hogyan formázza a válaszait — a 2. részben látott jelölő-tokenek) → **RLHF / alignment** (melyik a *jobb* a több, formailag helyes válasz közül — emberi preferencia alapján finomítva).
:::::

::::: callout label="Bővebben"
A harmadik lépés teljes technikai részletezését — a reward modellt, a Bradley-Terry preferencia-modellt, a PPO vs. DPO kérdést, és azt, hogyan próbálhatod ki mindezt saját gépen — a <em>RLHF</em> tutorial tárgyalja tőről hegyire. Ez a cikk itt csak azt a helyet mutatja meg, ahol ez a lépés **beilleszkedik** a nagyobb képbe.
:::::

::::: callout label="Egy mondatban"
Amikor azt mondod, "instruct modell", technikailag valójában egy olyan modellre gondolsz, ami **legalább** az instruction tuning fázison átesett — a legtöbb, ma használt asszisztens (Claude, ChatGPT) azonban **mindhárom** fázison átment, az RLHF-fel bezárólag.
:::::
::::::

:::::: section id=base-instruct-4 num="04" heading="4. rész — A harmadik réteg: reasoning modellek" nav="A harmadik réteg: reasoning modellek" group="A folyamat"

<p class="topic-tagline">Cél: lásd, hogy az instruct modell nem a lánc vége — van egy további, specializált réteg is.</p>

### Nem csak "base" és "instruct" létezik

A 2025–2026-os modell-generációkban egyre gyakrabban találkozol egy **harmadik** kategóriával is: a **reasoning modellekkel** (pl. amik "gondolkodó tokeneket" — chain-of-thought-ot — generálnak a végső válasz előtt, lásd a <em>Reasoning</em> tutorialt). Ezek tipikusan egy instruct modellből indulnak, majd egy **további, célzott tanítási szakaszon** mennek át, ami arra ösztönzi őket, hogy **több tokent, több "gondolkodást"** fordítsanak összetett feladatokra.

::::: stack-grid
:::: card label="Base modell"
Nyers mintázat-illesztő. Jó autocomplete-hez és további finomhangoláshoz. Olyan, mint egy könyvtár.
::::
:::: card label="Instruct modell"
Kérdés-válaszra hangolva. Jó általános chatre és egyszerű feladatokra. Olyan, mint egy kész alkalmazás.
::::
:::: card label="Reasoning modell"
Több lépéses logikára és tervezésre hangolva, extra token- és időköltséggel. Jó összetett, több lépéses feladatokra. Olyan, mint egy "gondolkodó" munkatárs.
::::
:::::

::::: callout warning label="Ez nem három külön termékcsalád"
A gyakorlatban ez a három **viselkedési réteg** gyakran ugyanabból a betanított "gerincből" (backbone) származik, csak más-más post-training lépéseken keresztül — pontosan ahogy egy fájlrendszerben egy alap-sablonból több, egyre specializáltabb változat készülhet.
:::::

::::: callout label="Egy mondatban"
A "base vs. instruct" megkülönböztetés az első, legalapvetőbb elágazás — de ha ma egy modellcsaládot nézel, gyakran egy harmadik, "reasoning" változatot is találsz, ami az instruct rétegre épül rá egy plusz specializációval.
:::::
::::::

:::::: section id=base-instruct-5 num="05" heading="5. rész — Hogyan ismerd fel — és mikor van egyáltalán szükséged base modellre" nav="Hogyan ismerd fel — és mikor kell base" group="Gyakorlat"

<p class="topic-tagline">Cél: konkrét, gyakorlati támpontokat adj — ne csak elméletet.</p>

### A modellnév általában elárulja

Ha nyílt súlyú modelleket használsz (lásd a <em>Lokális LLM</em> tutorialt), a névben szinte mindig ott a jelölés:

```
ollama pull llama3.1:8b-instruct-q4_K_M     # instruct modell
ollama pull llama3.1:8b-base                # (ha elérhető) a base változat
```

::::: callout label="Amit érdemes tudni"
A legtöbb nyílt súlyú modellcsalád **mindkét** verziót publikálja — a `-instruct` (vagy `-chat`) toldat nélküli verzió jellemzően a base modell. A nagy, zárt, kereskedelmi asszisztensek (Claude, ChatGPT, Gemini), amikkel a végfelhasználók chatelnek, **szinte kizárólag instruct (és gyakran reasoning-hangolt) verziók** — a hozzájuk tartozó base modellhez a legtöbb felhasználó sosem fér hozzá közvetlenül.
:::::

### A ritka esetek, amikor mégis base modell kell

::::: compare
::: good label="Amikor az instruct modell a jó választás (a legtöbb eset — kb. 95%)"
Általános chat, kérdés-válasz, kódolási segítség, összefoglalás, bármilyen feladat, ahol **azt szeretnéd, hogy a modell kövessen egy utasítást**.
:::
::: bad label="Amikor a base modell lehet a jobb választás (ritka, speciális eset)"
Ha egy **teljesen egyedi, nem-természetesnyelvi** szintaxist (pl. egy saját, belső lekérdező nyelvet) szeretnél megtanítani a modellnek — itt az instruct modell "segítőkész asszisztens" hangolása **akadályozhat**, mert a modell hajlamos "asszisztens módban" válaszolni ahelyett, hogy tisztán a te szintaxisodat folytatná. Ilyenkor egy **base modellből kiinduló, saját finomhangolás** tisztább eredményt adhat.
:::
:::::

::::: callout label="Egy mondatban"
A gyakorlatban szinte mindig instruct (vagy reasoning) modellre van szükséged — base modellt csak akkor érdemes választanod, ha egy nagyon specifikus, nem-konverzációs feladatra magad akarod finomhangolni a modellt, és az instruct-viselkedés inkább zavarna, mint segítene.
:::::
::::::

:::::: section id=base-instruct-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0–1. rész"
Konkrét példa a base modell "folytatós" viselkedésére · a pretraining csak nyelvi/tényszerű tudást épít be, viselkedést nem
::::
:::: card label="2. rész"
Az instruction tuning (SFT) speciális jelölő-tokenekkel tanítja meg a modellnek a "válaszolj, ne folytass" viselkedést — mért, konkrét megbízhatósági ugrással
::::
:::: card label="3–4. rész"
Hol illeszkedik az RLHF a teljes láncba (pretraining → SFT → RLHF) · a reasoning modell mint egy további, harmadik specializációs réteg
::::
:::: card label="5. rész"
Hogyan ismerd fel a modellnévből (pl. `-instruct` toldalék) · a ritka esetek, amikor mégis base modellre van szükséged
::::
:::::

<p class="topic-tagline">Kapcsolódó: az <em>RLHF</em> (a teljes post-training pipeline technikai részletei), a <em>Reasoning</em> (a gondolkodó tokenek és a chain-of-thought), a <em>Knowledge cutoff</em> (a pretraining/post-training felosztás eredeti forrása) és a <em>Modellméret és tudás</em> (mit jelent, hogy egy modell "tud" valamit) tutorialok.</p>

<p class="topic-tagline" style="margin-top:12px;font-size:0.85em;opacity:0.75">* A 340×-es formátum-megbízhatósági adat egy konkrét kutatási kísérletből származik (68,3% vs. 0,2% hibaarány) — lásd a 2. részt a kontextusért.</p>
::::::
