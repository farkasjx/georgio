---
page: evaluation
title: Hogyan mérjük egy modell tudását — benchmarkok és korlátaik
sidebar_groups:
  - Elmélet
  - A benchmarkok
  - Kritika
  - Gyakorlat
hero:
  eyebrow: "Evaluation · Fejlesztői Tanulási Terv"
  title: "Hogyan mérjük egy modell tudását — <em>benchmarkok és korlátaik</em>"
  lead: "Hét másik tutorial már említette a benchmarkokat (MMLU, SWE-bench, GPQA) — de sosem magyarázta el, mit mérnek valójában, és miért nem szabad egy leaderboard-helyezést túl komolyan venni. Ez a cikk pótolja ezt: hogyan épül fel egy benchmark-szám, hol torzul el, és hogyan érdemes ténylegesen modellt választani."
  stats:
    - { val: "88%+", lbl: "MMLU szaturáció a csúcson*" }
    - { val: "97%", lbl: "automatizált jailbreak sikeresség*" }
    - { val: "6", lbl: "Szakasz" }
    - { val: "5\u201330", lbl: "pontos eltérés forrásonként*" }
footer:
  left: "AI Hub · Evaluation"
  right: "Evaluation · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#evaluation-0"><div class="tc-num">0. rész</div><div class="tc-name">Mi az a benchmark valójában</div><div class="tc-desc">Egy szabványosított teszt — semmi több, semmi kevesebb.</div></a>
  <a class="toc-card" href="#evaluation-1"><div class="tc-num">1. rész</div><div class="tc-name">A leggyakoribb benchmark-családok</div><div class="tc-desc">MMLU, GPQA, SWE-bench, HumanEval — mit mér melyik.</div></a>
  <a class="toc-card" href="#evaluation-2"><div class="tc-num">2. rész</div><div class="tc-name">A szaturáció problémája</div><div class="tc-desc">Amikor egy teszt már nem különböztet meg semmit.</div></a>
  <a class="toc-card" href="#evaluation-3"><div class="tc-num">3. rész</div><div class="tc-name">Kontamináció és Goodhart törvénye</div><div class="tc-desc">Amikor a modell "megjegyzi" a vizsgát.</div></a>
  <a class="toc-card" href="#evaluation-4"><div class="tc-num">4. rész</div><div class="tc-name">Miért mér két forrás mást</div><div class="tc-desc">Ugyanaz a modell, más pontszám — miért?</div></a>
  <a class="toc-card" href="#evaluation-5"><div class="tc-num">5. rész</div><div class="tc-name">Hogyan válassz mégis modellt</div><div class="tc-desc">Gyakorlati, benchmark-független módszer.</div></a>
</div>
::::::

:::::: section id=evaluation-0 num="00" heading="0. rész — Mi az a benchmark valójában" nav="Mi az a benchmark valójában" group="Elmélet"

<p class="topic-tagline">Cél: tisztázd az alapfogalmat, mielőtt a konkrét benchmarkokba mennénk.</p>

### Egy szabványosított teszt, semmi több

Egy **benchmark** egyszerűen egy rögzített kérdés- vagy feladatgyűjtemény, amin **minden** modellt ugyanúgy tesztelnek — a cél, hogy a különböző modellek eredményei **összehasonlíthatók** legyenek, ahelyett hogy mindenki a saját, kényelmes tesztjeit mutogatná.

::::: callout label="A folyamat, ahogy egy pontszám létrejön"
Kurált tesztkérdések (pl. 16 000+ feleletválasztós kérdés az MMLU-nál) → a modell mindegyikre választ ad → egy automatikus (vagy néha emberi) kiértékelő eldönti, helyes volt-e → az összesített helyes válaszarány lesz a **végső, publikált szám**.
:::::

::::: callout warning label="Amit ez a folyamat NEM garantál"
Egy magas benchmark-pontszám **nem** garantálja, hogy a modell a te konkrét feladatodon is jól teljesít — a benchmark egy **szűk, specifikus** feladattípust mér, nem az "általános intelligenciát". Ez a cikk további részei pontosan azt mutatják be, hol és miért törik meg ez az összefüggés.
:::::

::::: callout label="Egy mondatban"
A benchmark egy hasznos, de **korlátozott** eszköz — jó a durva szűrésre ("melyik modell van egyáltalán ugyanabban a ligában"), de rossz az egyetlen, végső döntési szempontnak.
:::::
::::::

:::::: section id=evaluation-1 num="01" heading="1. rész — A leggyakoribb benchmark-családok: mit mér melyik" nav="A leggyakoribb benchmark-családok" group="A benchmarkok"

<p class="topic-tagline">Cél: ismerd meg a leggyakrabban idézett benchmarkokat, és mit mérnek ténylegesen.</p>

::::: stack-grid
:::: card label="MMLU / MMLU-Pro"
57 akadémiai témakör (matek, jog, orvostudomány stb.), feleletválasztós kérdésekkel — **általános tudás-lefedettséget** mér. A Pro-verzió nehezebb, kevésbé "kitalálható" változatokkal.
::::
:::: card label="GPQA Diamond"
PhD-szintű, szakértői kérdések biológiából, kémiából, fizikából — úgy tervezve, hogy **nem-szakértő** PhD-fokozattal rendelkezők is csak kb. 34%-ot érjenek el, ezzel értelmes "padlót" adva.
::::
:::: card label="SWE-bench (Verified / Pro)"
Valós GitHub issue-k és hozzájuk tartozó javítások — lásd az <em>Agentic kódolás</em> tutorial 7. részét a részletes tárgyalásért és a kontaminációs vitáért.
::::
:::: card label="HumanEval / MBPP"
Önálló, elszigetelt programozási feladatok — **kód-helyesség**et mér, kis, jól körülhatárolt problémákon, nem valós, komplex kódbázisokon.
::::
:::::

::::: callout label="Egy mondatban"
Nincs egyetlen "AI-IQ-teszt" — minden benchmark egy **szűk, specifikus** képességet mér, és a "melyik modell a legjobb" kérdésre a válasz mindig attól függ, **melyik** benchmarkot nézed, és mennyire hasonlít a te feladatodhoz.
:::::
::::::

:::::: section id=evaluation-2 num="02" heading="2. rész — A szaturáció problémája: amikor a teszt már nem különböztet meg semmit" nav="A szaturáció problémája" group="Kritika"

<p class="topic-tagline">Cél: értsd meg, miért veszítik el a régi benchmarkok a hasznosságukat, ahogy a modellek javulnak.</p>

### Amikor mindenki majdnem tökéletes pontszámot ér el

::::: callout danger label="Konkrét adat: az MMLU szaturációja"
2026-ra a vezető frontier-modellek **88% fölé**, egyes mérések szerint akár **93%-ra** is feljutottak az eredeti MMLU-n — ez azt jelenti, hogy a benchmark **már nem különbözteti meg** érdemben a legjobb modelleket egymástól, mert szinte mindegyik majdnem tökéletesen teljesít rajta. Hasonló a helyzet a HellaSwag-gal, ami 95%+ fölött szaturálódott.
:::::

### A válasz: nehezebb utódok

::::: callout label="Az MMLU-Pro példája"
Amikor egy benchmark szaturálódik, a kutatók jellemzően egy **nehezebb utódot** hoznak létre — az MMLU-Pro például csökkentette a "kitalálhatóságot" (kevesebb, de nehezebb válaszlehetőség), és jobban a **következtetésre**, nem a puszta memorizálásra fókuszál.
:::::

::::: callout warning label="A gyakorlati tanulság"
Ha egy benchmarkon a modellek "mind 90% fölött" vannak, az a szám **gyakorlatilag használhatatlan** a döntéshez — ilyenkor vagy egy nehezebb utód-benchmarkot érdemes nézni (lásd a fenti példát), vagy a <em>Modellméret és tudás</em> tutorialban is látott elvet alkalmazni: kisebb, olcsóbb modellek felé nézni, ahol a benchmark még **ténylegesen szór**.
:::::
::::::

:::::: section id=evaluation-3 num="03" heading="3. rész — Kontamináció és Goodhart törvénye" nav="Kontamináció és Goodhart törvénye" group="Kritika"

<p class="topic-tagline">Cél: érts meg egy még alattomosabb problémát, mint a szaturáció — amikor a mérés maga torzul el.</p>

### Amikor a modell "megjegyzi" a vizsgát

::::: callout danger label="A kontamináció konkrét jelensége"
Kutatók dokumentáltan találtak **MMLU-kérdéseket** több modell **tanítóadatában** — ez azt jelenti, hogy egyes modellek nem *következtetve* válaszolnak helyesen, hanem mert **szó szerint látták már** a kérdést (vagy egy hozzá nagyon hasonlót) a tanítás során. Ez pontosan az a probléma, ami miatt — ahogy az <em>Agentic kódolás</em> tutorial 7. részében is olvashattad — az OpenAI 2026-ban leállította a SWE-bench Verified pontszámok jelentését.
:::::

### Goodhart törvénye: amikor a mérce célponttá válik

::::: callout label="A tágabb elv"
Goodhart törvényének közismert megfogalmazása: *"amikor egy mérték céllá válik, megszűnik jó mértéknek lenni."* Ha a modellfejlesztők tudatosan **egy adott benchmarkra** optimalizálnak (akár a tanítóadat összeállításával, akár egyéb módon), a benchmark-pontszám elszakadhat attól, amit **valójában** mérni akart — általános képességtől.
:::::

::::: callout label="Egy mondatban"
Egy publikált benchmark-szám sosem "tiszta" mérték — mindig érdemes megkérdezni, vajon a modell **azért** jó-e ezen a teszten, mert általánosan képes, vagy azért, mert a teszt (vagy ahhoz nagyon hasonló anyag) **bekerült** a tanítóadatba.
:::::
::::::

:::::: section id=evaluation-4 num="04" heading="4. rész — Miért mér két forrás mást ugyanarra a modellre" nav="Miért mér két forrás mást" group="Kritika"

<p class="topic-tagline">Cél: érts meg egy gyakorlati, gyakran figyelmen kívül hagyott zavart forrást.</p>

### Ugyanaz a modell, más szám

::::: callout warning label="A gyakori, dokumentált eltérés"
Két különböző forrás (pl. a modellt gyártó cég saját mérése vs. egy független labor mérése) **eltérő pontszámot** publikálhat **ugyanarra** a modellre, ugyanazon a benchmarkon — a különbség forrása jellemzően az **inferencia-beállítások**: hány few-shot példát adtak a promptba, milyen volt a temperature (lásd a <em>Véletlenszerűség és mintavételezés</em> tutorialt), engedélyezték-e a chain-of-thought-ot, és hogyan értelmezték (parse-olták) a modell nyers válaszát helyes/helytelen kategóriába.
:::::

::::: callout label="Konkrét nagyságrend"
Az önjelentett (gyártói) és a független mérés közti eltérés a gyakorlatban **5 pont** körüli is lehet ugyanazon a benchmarkon — ez azt jelenti, hogy egy "mi vagyunk a legjobbak ezen a teszten" típusú marketing-állítást mindig érdemes **független forrásból** is ellenőrizni.
:::::

::::: callout label="Egy mondatban"
Ha két forrás eltérő pontszámot ad ugyanarra a modellre, ne feltételezd, hogy valamelyik "hazudik" — valószínűbb, hogy **más módszertannal** mérték, és ez a módszertani különbség önmagában is több pontos eltérést okozhat.
:::::
::::::

:::::: section id=evaluation-5 num="05" heading="5. rész — Hogyan válassz mégis modellt: gyakorlati módszer" nav="Hogyan válassz mégis modellt" group="Gyakorlat"

<p class="topic-tagline">Cél: adj egy konkrét, alkalmazható eljárást, ne csak kritikát a benchmarkok felé.</p>

::::: stack-grid
:::: card label="1 · Használd a benchmarkot durva szűrésre"
Ha két modell **5%-on belül** pontszámoz egy releváns benchmarkon, mindkettő "ugyanabban a ligában" van — érdemes mindkettőt kipróbálni. Ha az egyik **30 ponttal** lemarad, valószínűleg nem versenyképes a te feladatodra.
::::
:::: card label="2 · Válaszd a hozzád legközelebbi benchmarkot"
Kódoláshoz nézz SWE-bench-et, nem MMLU-t; összetett következtetéshez GPQA-t; általános tudás-lefedettséghez MMLU-Pro-t — a "melyik a legjobb modell" kérdés értelmetlen benchmark nélkül, ami a **te** feladatodhoz illik.
::::
:::: card label="3 · Építs saját, kis teszthalmazt"
A legmegbízhatóbb módszer: gyűjts össze 20-50, **a te valós munkádból** származó, reprezentatív feladatot, és ezen teszteld a jelölt modelleket — ez nem szaturálódhat, nem kontaminálódhat, és pontosan a te esetedet méri.
::::
:::::

::::: callout label="Egy mondatban"
A publikus benchmarkok jó **kiindulópontot** (rövidlistát) adnak, de a végső döntést mindig egy **saját, kis, releváns tesztkészleten** érdemes megerősíteni — pontosan azért, mert minden, a cikkben tárgyalt torzítás (szaturáció, kontamináció, módszertani eltérés) csak a publikus benchmarkokra érvényes, a te saját tesztedre nem.
:::::
::::::

:::::: section id=evaluation-summary num=SUMMARY nav="Összefoglalás" sub=true group="Gyakorlat"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0–1. rész"
A benchmark egy szabványosított, de szűk feladattípust mérő teszt · a leggyakoribb családok (MMLU, GPQA, SWE-bench, HumanEval) és mit mérnek ténylegesen
::::
:::: card label="2–3. rész"
A szaturáció problémája (MMLU 88%+ a csúcson — már nem különböztet meg semmit) · a kontamináció és Goodhart törvénye, amikor a mérce maga torzul el
::::
:::: card label="4. rész"
Miért mér két forrás eltérő pontszámot ugyanarra a modellre — az inferencia-beállítások (few-shot, temperature, parse-olás) rejtett hatása
::::
:::: card label="5. rész"
Gyakorlati eljárás: durva szűrés benchmarkkal, releváns benchmark választása, majd saját tesztkészlettel való megerősítés
::::
:::::

<p class="topic-tagline">Kapcsolódó: az <em>Agentic kódolás</em> (a SWE-bench részletes tárgyalása és a kontaminációs vita), a <em>Modellméret és tudás</em> (mit jelent, hogy egy modell "tud" valamit) és a <em>Véletlenszerűség és mintavételezés</em> (a temperature hatása a mérési eltérésekre) tutorialok.</p>

<p class="topic-tagline" style="margin-top:12px;font-size:0.85em;opacity:0.75">* Az MMLU szaturációs adat és a mérési eltérések 2026-os iparági elemzésekből származnak — lásd a 2. és 4. részt a kontextusért.</p>
::::::
