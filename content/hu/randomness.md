---
page: randomness
title: "Miért mond a modell mindig 73-at? — Álvéletlenszerűség és mintavételezés"
sidebar_groups:
  - Elmélet
  - A mechanizmus
  - A meglepetés
  - Gyakorlat
hero:
  eyebrow: "Véletlenszerűség · Fejlesztői Tanulási Terv"
  title: "Miért mond a modell mindig <em>73-at?</em>"
  lead: "Kérj meg egy AI-t, hogy gondoljon egy számot 1 és 100 között — jó eséllyel 73-at, 37-et vagy 7-et fogsz kapni. Ez nem hiba, és nem is \"rossz véletlenszám-generátor\" — ez egy pontosan megérthető mechanizmus, ami a token-valószínűségekből és az emberi torzításokból áll össze. Épít az <em>Egy modell anatómiája</em> és a <em>Halucináció</em> tutorialokra."
  stats:
    - { val: "90%", lbl: "választja a \"7\"-et tartalmazó számot*" }
    - { val: "28%", lbl: "ugyanez emberi arány*" }
    - { val: "200 000", lbl: "résztvevős emberi kísérlet*" }
    - { val: "5", lbl: "Szakasz" }
footer:
  left: "AI Hub · Véletlenszerűség"
  right: "Véletlenszerűség · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#randomness-0"><div class="tc-num">0. rész</div><div class="tc-name">A jelenség, amit valószínűleg te is láttál</div><div class="tc-desc">73, 37, 7 — miért pont ezek a számok.</div></a>
  <a class="toc-card" href="#randomness-1"><div class="tc-num">1. rész</div><div class="tc-name">A mechanizmus: nincs "gondolj egy számra"</div><div class="tc-desc">A modell nem gondol — valószínűségi eloszlásból választ.</div></a>
  <a class="toc-card" href="#randomness-2"><div class="tc-num">2. rész</div><div class="tc-name">Temperature és top-p: a "csavarok"</div><div class="tc-desc">Mit állítanak ezek valójában — és mit NEM.</div></a>
  <a class="toc-card" href="#randomness-3"><div class="tc-num">3. rész</div><div class="tc-name">A meglepetés: emberek sem véletlenszerűek</div><div class="tc-desc">A modell nem torzít — felerősíti a mi torzításunkat.</div></a>
  <a class="toc-card" href="#randomness-4"><div class="tc-num">4. rész</div><div class="tc-name">Gyakorlat: hogyan kérj tényleg véletlent</div><div class="tc-desc">Amikor ez ténylegesen számít, mit tegyél.</div></a>
</div>
::::::

:::::: section id=randomness-0 num="00" heading="0. rész — A jelenség, amit valószínűleg te is láttál" nav="A jelenség, amit valószínűleg te is láttál" group="Elmélet"

<p class="topic-tagline">Cél: ismerd fel pontosan, miről szól ez a cikk — és lásd, hogy ez egy dokumentált, mérhető jelenség, nem anekdota.</p>

### Egy egyszerű kísérlet, amit bárki megismételhet

Kérj meg egy AI-asszisztenst: "Gondolj egy számra 1 és 100 között." Ismételd meg ezt sokszor, akár több különböző modellel — és feltűnően gyakran ugyanazokat a számokat fogod kapni: **73, 37, 77, 42, 7**.

::::: callout danger label="Ez nem egyetlen modell hibája"
Egy kutatás hat különböző, egymástól független AI-modellt tesztelt ugyanezzel a kérdéssel — mindegyik **ugyanabba a szűk számkészletbe** koncentrálódott, még akkor is, ha a köztük lévő pontos arányok kicsit eltértek. Ez a mintázat **2022 vége óta dokumentáltan** megfigyelhető, és a mai napig tartja magát.
:::::

::::: callout label="Egy mondatban"
Ha azt tapasztaltad, hogy egy AI mindig "ugyanazt" a véletlen számot mondja, nem képzelődtél — ez egy valós, sokszor megismételt kísérletekkel alátámasztott jelenség, aminek pontos, technikai oka van.
:::::
::::::

:::::: section id=randomness-1 num="01" heading="1. rész — A mechanizmus: nincs \"gondolj egy számra\"" nav="A mechanizmus: nincs gondolj egy számra" group="A mechanizmus"

<p class="topic-tagline">Cél: értsd meg, mi történik technikailag, amikor a modell egy "véletlen" számot ad — kapcsolódva az Egy modell anatómiája tutorialhoz.</p>

### Nincs belső kockadobás

Amikor azt kéred egy modelltől, "gondolj egy véletlen számra", a modell **nem** rendelkezik semmiféle belső, valódi véletlenszám-generáló mechanizmussal. Ehelyett pontosan ugyanazt csinálja, amit az <em>Egy modell anatómiája</em> tutorial 4. részében megismertél: a bemenet (a te kérdésed) alapján kiszámol egy **valószínűségi eloszlást** az összes lehetséges következő tokenre — és ez az eloszlás **nem egyenletes**.

::::: callout label="Amit ez konkrétan jelent"
Ha a tanítóadatban a "gondolj egy 1 és 100 közötti véletlen számra... 73" mintázat **sokszor** előfordult, a modell megtanulja, hogy a "73" token **magasabb valószínűséggel** következik egy ilyen kérdés után, mint mondjuk a "12" vagy a "88" — nem azért, mert a 73 "véletlenebb" lenne, hanem mert **gyakrabban szerepelt** ebben a kontextusban a tanítóadatban.
:::::

### Determinisztikus a felszín alatt

::::: callout warning label="Egy technikai finomság"
A mintavételezési folyamat (lásd a 2. részt) hoz létre változatosságot, de az alapul szolgáló számítás — a token-valószínűségek kiszámítása — **determinisztikus**: ugyanaz a modell, ugyanazok a súlyok, ugyanaz a prompt mindig **ugyanazt az eloszlást** adja. Az, hogy a végén melyik konkrét szám "jön ki", a mintavételezési lépés (és egy véletlen "seed") dolga — de ez egy **erősen torzított** eloszlásból választ, nem egyenletesből.
:::::

::::: callout label="Egy mondatban"
A modell nem "gondol" egy számra — kiszámol egy valószínűségi listát arról, milyen szó/szám illik statisztikailag egy ilyen mondat után, és ebből a (nagyon egyenetlen) listából választ egyet.
:::::
::::::

:::::: section id=randomness-2 num="02" heading="2. rész — Temperature és top-p: a \"csavarok\", amik alakítják a választást" nav="Temperature és top-p" group="A mechanizmus"

<p class="topic-tagline">Cél: értsd meg pontosan, mit állítanak ezek a paraméterek — és milyen tévhitet oszlatnak el.</p>

### A két leggyakoribb "csavar"

::::: stack-grid
:::: card label="Temperature"
Egy 0 és kb. 2 közötti szám, ami **"kilapítja" vagy "kihegyezi"** a valószínűségi eloszlást. Alacsony érték (közel 0) esetén a modell szinte mindig a legvalószínűbb tokent választja; magasabb érték esetén a ritkább, kevésbé valószínű tokenek is nagyobb eséllyel előkerülnek.
::::
:::: card label="Top-p (nucleus sampling)"
Ahelyett, hogy az egész eloszlásból választana, a modell csak azt a **legszűkebb tokenhalmazt** veszi figyelembe, aminek együttes valószínűsége eléri a megadott küszöböt (pl. 0,9) — a nagyon valószínűtlen tokenek eleve ki vannak zárva.
::::
:::::

### A kritikus félreértés, amit ez a rész eloszlat

::::: callout danger label="Amit a temperature NEM csinál"
A temperature és a top-p **nem** alakítja a torzított eloszlást **egyenletessé** — csak azt szabályozzák, mennyire "éles" vagy "lapos" legyen ugyanaz az alapvetően torzított eloszlás. Ha a "73" token eleve sokkal valószínűbb volt, mint a többi szám, a temperature növelése ezen **nem változtat alapvetően** — csak azt engedi meg, hogy néha egy másik, korábban is jelen lévő, de kevésbé preferált szám kerüljön elő.
:::::

::::: callout label="A szélsőséges eset: temperature = 0"
Ha a temperature pontosan nullára van állítva, a mintavételezés gyakorlatilag **eltűnik**: a modell mindig a **legvalószínűbb** tokent választja — ezt hívják **greedy decoding**-nak. Ilyenkor a modell teljesen determinisztikussá válik: ugyanarra a promptra mindig ugyanazt a választ adja.
:::::

::::: callout label="Egy mondatban"
A temperature és a top-p a **meglévő** torzított eloszlás "élességét" szabályozzák — nem egy külön, pártatlan véletlenszám-forrást vezetnek be, ezért a torzítás (73, 37, 7 felé) magasabb temperature mellett is jellemzően megmarad.
:::::
::::::

:::::: section id=randomness-3 num="03" heading="3. rész — A meglepetés: az emberek sem véletlenszerűek" nav="A meglepetés: emberek sem véletlenszerűek" group="A meglepetés"

<p class="topic-tagline">Cél: érd el a cikk legfontosabb, legmeglepőbb pontját — a modell nem a saját torzítását adja, hanem a miénket erősíti fel.</p>

### Egy 200 000 fős emberi kísérlet

A Veritasium tudományos YouTube-csatorna egy **200 000 résztvevős** kísérletet futtatott, amiben egyszerűen megkérték az embereket, gondoljanak egy véletlen számra. Az eredmény: az emberek is feltűnően gyakran választották a **37, 73, 77** és **7**-et tartalmazó számokat — **ugyanazt** a számkészletet, amit ma a modellek is preferálnak.

::::: callout label="Miért pont ezek a számok"
Amikor a résztvevőket arra kérték, találják ki, melyik számot választanák **a legkevesebben** "véletlenszerűnek", sokan pont a **73-at és 37-et** nevezték meg — miközben a valóságban a **kerek, tízes végződésű** számokat (30, 40, 50) választották a legritkábban, mert azok "túl rendezettnek" tűnnek ahhoz, hogy véletlennek érezzük őket. Az emberek egyszerre **kerülik a kerek számokat** és **túlreprezentálják a 7-es számjegyet** tartalmazó, "esetlegesnek ható" számokat.
:::::

### A modell nem torzít — felerősíti a torzításunkat

::::: callout danger label="A legfontosabb, dokumentált adatpont"
Egy kutatás szerint az emberek kb. **28%-ban** választanak 7-es számjegyet tartalmazó számot — a vizsgált LLM-ek ugyanezt **90%-ban** teszik. A modell tehát nem egyszerűen **átvette** az emberi torzítást, hanem **jelentősen felerősítette** azt — mert a tanítóadatban a "7-es" választások felülreprezentáltak lehettek a valós eloszláshoz képest, és a modell ezt a felülreprezentáltságot tanulta meg statisztikaként.
:::::

::::: callout label="Kapcsolat a Halucináció tutorialhoz"
Ez ugyanaz a alapjelenség, amit a <em>Halucináció</em> tutorial 1. részében a "statisztikai eredetről" olvashattál: a modell nem "tudja", mi a véletlen — a **leggyakoribb, tanult mintázatot** reprodukálja magabiztosan, akár tényekről, akár egy "véletlen" számról van szó.
:::::

::::: callout label="Egy mondatban"
Amikor egy modell 73-at mond, nem hibázik, és nem is "hazudik" — pontosan azt teszi, amire tanították: megismétli, mit **mondanának** emberek egy ilyen helyzetben, csak még **erősebb, tisztább formában**, mint ahogy azt maguk az emberek tennék.
:::::
::::::

:::::: section id=randomness-4 num="04" heading="4. rész — Gyakorlat: hogyan kérj tényleg véletlent" nav="Gyakorlat: hogyan kérj tényleg véletlent" group="Gyakorlat"

<p class="topic-tagline">Cél: adj konkrét, működő megoldást, ha ez a jelenség ténylegesen problémát okoz a munkádban.</p>

### A helyes eszköz nem a promptolás

::::: callout warning label="Az ökölszabály"
Ha **valódi**, egyenletes eloszlású véletlenre van szükséged (jelszógenerálás, sorsolás, statisztikai mintavétel, bármi, ahol a valódi véletlenszerűség számít), **soha ne kérdezd meg közvetlenül a modellt** — ehelyett használj **kifejezetten erre tervezett eszközt**.
:::::

::::: stack-grid
:::: card label="1 · Kód futtatása"
Kérd meg a modellt, hogy **írjon és futtasson** egy rövid kódrészletet (pl. Python `random` modul), ami tényleges, kriptográfiailag vagy statisztikailag megalapozott véletlenszám-generátort hív — ne magától a modelltől kérd a számot.
::::
:::: card label="2 · Beépített eszközök"
Egyes fejlettebb, agentic rendszerek (lásd az <em>Agentic kódolás</em> tutorialt) automatikusan ilyen eszközhöz nyúlnak, ha felismerik a kérés jellegét — de ez nem garantált minden felületen, ezért érdemes explicit kérni.
::::
:::: card label="3 · Sose bízz a \"csupasz\" válaszban"
Ha kritikus rendszerben (biztonsági, jogi, statisztikai kontextusban) van szükséged véletlenre, a modell közvetlen, promptra adott száma **sosem** megfelelő — függetlenül attól, mekkora a temperature.
::::
:::::

::::: callout label="Egy mondatban"
A modell kiváló eszköz arra, hogy **megírja neked** a véletlenszám-generáló kódot — de önmagában, "fejben" megkérdezve, **sosem** helyettesíti a valódi véletlenszám-generátort.
:::::
::::::

:::::: section id=randomness-summary num=SUMMARY nav="Összefoglalás" sub=true group="Gyakorlat"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0. rész"
A "73, 37, 7" jelenség dokumentált, sokszor megismételt kísérletekkel alátámasztott — nem egyetlen modell hibája
::::
:::: card label="1–2. rész"
A modell valószínűségi eloszlásból választ, nem "gondolkodik" · a temperature/top-p csak az eloszlás élességét szabályozza, nem teszi egyenletessé
::::
:::: card label="3. rész"
A legfontosabb fordulat: a Veritasium-kísérlet szerint az emberek is torzítottan választanak (37, 73, 77, 7) — a modell ezt a torzítást **felerősíti** (28% → 90%), nem magától találja ki
::::
:::: card label="4. rész"
Ha valódi véletlen kell, ne a modelltől kérdezd — kérd meg, hogy írjon és futtasson kódot egy tényleges véletlenszám-generátorral
::::
:::::

<p class="topic-tagline">Kapcsolódó: az <em>Egy modell anatómiája</em> (a token-valószínűség kiszámításának helye a teljes folyamatban), a <em>Halucináció</em> (ugyanaz a "statisztikailag valószínű, nem feltétlenül igaz" alapelv) és az <em>Agentic kódolás</em> (hogyan érd el, hogy a modell kódot futtasson helyetted) tutorialok.</p>

<p class="topic-tagline" style="margin-top:12px;font-size:0.85em;opacity:0.75">* A Veritasium-kísérlet 200 000 résztvevős, a 28%/90%-os emberi/modell összehasonlítás egy 2025-ös elemzésből származik — lásd a 3. részt a kontextusért.</p>
::::::
