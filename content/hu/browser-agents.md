---
page: browser-agents
title: AI böngésző-ügynökök — amikor az AI a te böngésződben cselekszik
sidebar_groups:
  - Elmélet
  - A mezőny
  - Kockázatok
  - Referencia
hero:
  eyebrow: "Böngésző-ügynökök · Fejlesztői Tanulási Terv"
  title: "AI böngésző-ügynökök — <em>amikor az AI a te böngésződben cselekszik</em>"
  lead: "A Claude in Chrome, az OpenAI Operator és hasonló eszközök nem csak válaszolnak — kattintanak, kitöltenek, navigálnak, a te bejelentkezett sessionödben. Ez a cikk megmutatja a két alapvetően különböző módot, ahogy ezek működnek, mennyire jók valójában (a marketinges számok mögött), és a legfontosabb, egyedi biztonsági kockázatot, amit ez a képesség hordoz."
  stats:
    - { val: "20,6%", lbl: "teljes feladat-megoldási arány a legjobbnál*" }
    - { val: "72,5%", lbl: "OSWorld pontszám (Claude Sonnet)*" }
    - { val: "5", lbl: "Szakasz" }
    - { val: "0", lbl: "API-integráció szükséges a céloldalon*" }
footer:
  left: "AI Hub · Böngésző-ügynökök"
  right: "Böngésző-ügynökök · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#browser-agents-0"><div class="tc-num">0. rész</div><div class="tc-name">Két alapvetően más architektúra</div><div class="tc-desc">Screenshot-alapú "látás" vs. protokoll-alapú tool-hívás.</div></a>
  <a class="toc-card" href="#browser-agents-1"><div class="tc-num">1. rész</div><div class="tc-name">A mezőny: ki csinál mit</div><div class="tc-desc">Claude in Chrome, Operator, Comet — más célközönség, más megközelítés.</div></a>
  <a class="toc-card" href="#browser-agents-2"><div class="tc-num">2. rész</div><div class="tc-name">Mennyire jók valójában</div><div class="tc-desc">A marketinges számok és a realisztikus, hosszú-horizontú eredmény.</div></a>
  <a class="toc-card" href="#browser-agents-3"><div class="tc-num">3. rész</div><div class="tc-name">A legfontosabb kockázat: prompt injection a saját sessionödben</div><div class="tc-desc">Miért más ez, mint egy sima jailbreak-kísérlet.</div></a>
  <a class="toc-card" href="#browser-agents-4"><div class="tc-num">4. rész</div><div class="tc-name">Mikor válaszd böngésző-ügynököt, mikor API-t</div><div class="tc-desc">Két különböző megbízhatósági profil.</div></a>
</div>
::::::

:::::: section id=browser-agents-0 num="00" heading="0. rész — Két alapvetően más architektúra" nav="Két alapvetően más architektúra" group="Elmélet"

<p class="topic-tagline">Cél: érts meg egy kritikus technikai megkülönböztetést, ami eldönti, mennyire megbízható és mennyire átlátható egy böngésző-ügynök.</p>

### Screenshot-alapú "látás"

::::: callout label="Hogyan működik a Claude Computer Use és az Operator"
A **Computer-Using Agent (CUA)** modellek — mint az OpenAI Operator vagy a Claude Computer Use — a weboldalt **screenshot-ként "látják"**, és egérmozgással/billentyű-eseményekkel interakciónak, pontosan úgy, ahogy egy ember tenné. Ez **nem igényel semmilyen API-integrációt** a céloldalon — bármilyen weboldalon működik, amit egy ember is használna.
:::::

### Protokoll-alapú tool-hívás

::::: callout label="A WebMCP alternatívája"
A Google **WebMCP**-je (Chrome Canary, 2026 februárja) egy másik utat választ: ahelyett hogy pixelre kattintana, az ügynök **közvetlenül regisztrált JavaScript tool-okat hív** — a weboldal maga **explicit közli**, mi lehetséges rajta. Ez a legátláthatóbb, leggyorsabb és legjobban megfigyelhető interakciós modell, de csak azokon az oldalakon működik, amik **kifejezetten támogatják**.
:::::

::::: callout warning label="A kompromisszum, amit ez jelent"
A screenshot-alapú megközelítés **univerzális** (mindenhol működik), de **lassabb és törékenyebb** (egy váratlan felugró ablak vagy egy átrendezett gomb megzavarhatja) — a protokoll-alapú megközelítés **gyors és megbízható**, de csak azon a szűk halmazon működik, ami már felkészült rá.
:::::

::::: callout label="Egy mondatban"
Ha egy böngésző-ügynökről hallasz, az első kérdés: "screenshotot néz és kattint, vagy közvetlenül, protokollon keresztül hív eszközöket" — ez a különbség dönti el, mennyire univerzális, és mennyire megbízható a viselkedése.
:::::
::::::

:::::: section id=browser-agents-1 num="01" heading="1. rész — A mezőny: ki csinál mit" nav="A mezőny" group="A mezőny"

<p class="topic-tagline">Cél: ismerd meg a fő szereplőket, és mindegyik konkrét célközönségét.</p>

### Négy fő megközelítés

::::: stack-grid
:::: card label="Claude in Chrome / Claude Cowork"
Böngésző-kiterjesztés (Chrome) és OS-szintű asztali vezérlés (Cowork) — a 2026 februári **Vercept-felvásárlás** (vizuális számítógép-észlelésre specializálódott csapat) drámaian javította a képességet: a Claude Sonnet OSWorld-pontszáma **15% alól 72,5%-ra** ugrott.
::::
:::: card label="OpenAI Operator / ChatGPT Work"
A **Computer-Using Agent (CUA)** modellre épül, ami a GPT-4o egy, GUI-interakcióra megerősítő tanulással finomhangolt változata. 2026 júliusában az OpenAI bejelentette a **ChatGPT Work**-öt (hosszabb, több lépéses projektekre), és **leállítja** az Atlas böngészőt — a képességek a ChatGPT-be, illetve egy Chrome-kiterjesztésbe olvadnak.
::::
:::: card label="Perplexity Comet / Google Gemini Auto Browse"
Comet **fogyasztói**, keresés-központú célközönséget szolgál, teljes cross-platform (iOS, Android) elérhetőséggel. A Google Auto Browse-a lassabban terjed — 2026 közepén még csak asztali előnézetben, majd fokozatosan androidos telefonokon.
::::
:::: card label="Nyílt forráskódú alternatívák (Browser Use)"
A **Browser Use** keretrendszer 81 200+ GitHub-csillagot gyűjtött — Playwright-alapú, ami saját, önhosztolt böngésző-automatizálást tesz lehetővé, ha nem akarsz egy zárt, felhő-alapú megoldásra hagyatkozni.
::::
:::::

::::: callout label="Egy mondatban"
Nincs egyetlen "legjobb" böngésző-ügynök — a választás attól függ, ki a célközönséged (fogyasztó, fejlesztő, tudásmunkás, vállalat) és mennyire fontos neked a nyílt forráskódú, önhosztolt kontroll.
:::::
::::::

:::::: section id=browser-agents-2 num="02" heading="2. rész — Mennyire jók valójában" nav="Mennyire jók valójában" group="A mezőny"

<p class="topic-tagline">Cél: érts meg egy fontos, kiegyensúlyozó adatot a marketinges pontszámok mögött.</p>

### A kellemetlen valóság: a hosszú-horizontú feladatok

::::: callout danger label="Az OSWorld 2.0 eredménye"
Egy friss, akadémiai benchmark (**OSWorld 2.0**) hét modell-családot tesztelt **108, realisztikus, hosszú-horizontú** számítógép-használati feladaton — a **legjobb teljesítő** (Claude Opus 4.8, maximális gondolkodással) a feladatok csak **20,6%-át** oldotta meg **teljesen**.
:::::

::::: callout warning label="Nem a kattintás a probléma"
A benchmark hibaanalízise szerint az ügynökök **nem** a gombra kattintásnál vagy a kód írásánál hibáznak — a nehézség a **hosszú-horizontú tervezésben és a köztes állapotok követésében** van, ami direktben kapcsolódik a <em>Multi-agent rendszerek</em> tutorialban tárgyalt "kontextus-túlcsordulás" problémához.
:::::

::::: callout danger label="Egy fontos figyelmeztetés a benchmark-számokra"
Egy UC Berkeley 2026 áprilisi tanulmánya kimutatta, hogy **mind a WebArena, mind az OSWorld** kihasználható **anélkül, hogy a feladat valóban megvalósulna** — ez azt jelenti, egy magas benchmark-pontszám **önmagában** nem garantálja a valós, megbízható teljesítményt. A tanulmány szerint minden **70% fölötti** pontszámot óvatosan kell kezelni, és a saját, konkrét használati esetedben végzett próba az egyetlen szám, ami tényleg megbízható.
:::::

::::: callout label="Egy mondatban"
A marketinges OSWorld-pontszámok (72,5%) és a valós, hosszú-horizontú feladat-megoldási arány (20,6%) **drámaian eltérnek** — mindig a saját, konkrét feladatodon próbáld ki, mielőtt megbíznál egy böngésző-ügynökben egy fontos munkafolyamathoz.
:::::
::::::

:::::: section id=browser-agents-3 num="03" heading="3. rész — A legfontosabb kockázat: prompt injection a saját sessionödben" nav="A legfontosabb kockázat" group="Kockázatok"

<p class="topic-tagline">Cél: érts meg egy egyedi, súlyos biztonsági kockázatot, amit a böngésző-ügynökök konkrétan hordoznak.</p>

### Miért más ez, mint egy sima jailbreak-kísérlet

::::: callout danger label="A mechanizmus, ami ezt különösen veszélyessé teszi"
A <em>Biztonság &amp; OWASP</em> tutorialban megismert prompt injection itt egy extra dimenziót kap: egy weboldalba, e-mailbe vagy dokumentumba **rejtett, rosszindulatú utasítás** becsaphatja az ügynököt, hogy olyat tegyen, amit sosem kértél — és mivel az ügynök **a te bejelentkezett sessionödben** cselekszik, egy sikeres injekció **úgy tud viselkedni, mintha te lennél**.
:::::

::::: callout warning label="Ez nem elméleti kockázat"
Az Anthropic **kifejezetten, nyíltan** dokumentálta ezt a kockázatot a Claude in Chrome-nál, biztonsági klasszifikátorokkal védve a funkciót, de **elismerve** az inherens kockázatot — és független biztonsági kutatók **ismételten demonstráltak** sikeres injekciós láncokat a kiterjesztés ellen 2026 folyamán.
:::::

### A konkrét védekezési réteg

::::: callout label="Amit egy jól megvalósított böngésző-ügynöknek biztosítania kell"
Három konkrét mechanizmus: **magas-kockázatú oldal-blokkolás** (pl. banki és befektetési oldalakon az ügynök egyszerűen nem cselekedhet), **oldal-szintű engedélyezés** (minden oldalt jóváhagysz, mielőtt az ügynök ott működhetne, plusz megerősítés a következményes lépések előtt), és **admin-szintű engedélyezési/tiltási listák** vállalati környezetben.
:::::

::::: callout label="Egy mondatban"
Egy böngésző-ügynök nem csak egy "okosabb automatizálás" — egy olyan képesség, ami a **te azonosságoddal** cselekszik, ezért a prompt injection itt nem egy kellemetlen kimenet-hiba, hanem egy **valós, dokumentált, azonosság-átvételi** kockázat.
:::::
::::::

:::::: section id=browser-agents-4 num="04" heading="4. rész — Mikor válaszd böngésző-ügynököt, mikor API-t" nav="Mikor válaszd böngésző-ügynököt, mikor API-t" group="Referencia"

<p class="topic-tagline">Cél: adj egy konkrét döntési keretet, ami a megbízhatósági profilra épül.</p>

### Két különböző mechanizmus, két különböző megbízhatóság

::::: compare
::: bad label="Böngésző-ügynök: interaktív, felügyelt feladatokhoz"
Jó, ha **te vagy jelen**, és egy konkrét, egyszeri feladatot szeretnél elvégezni (jegy foglalása, kutatás, egy űrlap kitöltése) — de kevésbé megbízható **automatikus, felügyelet nélküli, ismétlődő** feladatoknál, mert egy váratlan felugró ablak vagy oldal-változás megzavarhatja.
:::
::: good label="API-alapú integráció: automatikus, esemény-vezérelt feladatokhoz"
Az <em>MCP</em> és <em>ai-workflow-automation</em> tutorialokban megismert, API-kapcsolatokra épülő megoldások (pl. egy bejövő e-mailre automatikusan reagáló ügynök) **stabilabbak** olyan feladatoknál, amiknek **saját maguktól** kell elindulniuk, esemény-alapon, felügyelet nélkül.
:::
:::::

::::: callout label="Egy mondatban"
A kérdés nem "melyik jobb általánosságban" — hanem hogy a feladatod **interaktív, felügyelt** jellegű (böngésző-ügynök), vagy **automatikus, esemény-vezérelt** (API-integráció), és ez a különbség dönti el, melyik mechanizmus ad megbízhatóbb eredményt.
:::::
::::::

:::::: section id=browser-agents-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0. rész"
Két alapvetően más architektúra: screenshot-alapú "látás" (univerzális, törékenyebb) vs. protokoll-alapú tool-hívás (gyors, de szűkebb körű)
::::
:::: card label="1. rész"
A fő szereplők (Claude in Chrome/Cowork, Operator/ChatGPT Work, Comet, Browser Use) és mindegyik konkrét célközönsége
::::
:::: card label="2. rész"
A marketinges OSWorld-pontszám (72,5%) és a valós, hosszú-horizontú feladat-megoldási arány (20,6%) közti szakadék — és a benchmark-manipulálhatóság kockázata
::::
:::: card label="3–4. rész"
A prompt injection egyedi, azonosság-átvételi kockázata böngésző-ügynököknél · döntési keret: interaktív, felügyelt (böngésző) vs. automatikus, esemény-vezérelt (API) feladatokhoz
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>Biztonság &amp; OWASP</em> (a prompt injection technikai háttere), az <em>Agent architektúra</em> (az általános ügynöki döntéshozatal), az <em>MCP</em> és <em>AI workflow automatizáció</em> (az API-alapú alternatíva) tutorialok.</p>

<p class="topic-tagline" style="margin-top:12px;font-size:0.85em;opacity:0.75">* A 20,6%-os OSWorld 2.0 eredmény, a 72,5%-os Claude OSWorld-pontszám és a benchmark-manipulálhatósági kockázat 2026-os, publikus kutatási és iparági forrásokból származnak — lásd a 1–2. részt a kontextusért.</p>
::::::
