---
page: harness-engineering
title: Harness engineering — a rendszer, ami az agentet megbízhatóvá teszi
sidebar_groups:
  - Elmélet
  - Az öt réteg
  - Kudarcok
  - Referencia
hero:
  eyebrow: "Harness engineering · Fejlesztői Tanulási Terv"
  title: "Harness engineering — <em>a rendszer, ami az agentet megbízhatóvá teszi</em>"
  lead: "Az Agentic kódolás tutorial már bevezette a fogalmat: \"a modell köré épített keretrendszer.\" Ez a cikk azt mutatja meg, miből áll ez ténylegesen — öt konkrét réteg —, és miért nem a modell cseréje, hanem a HARNESS javítása hozza a legtöbb, mérhető megbízhatóság-javulást 2026-ban."
  stats:
    - { val: "65%", lbl: "vállalati AI-kudarc harness-hiba miatt*" }
    - { val: "40,5 óra → 3 perc", lbl: "Azure SRE Agent javulása*" }
    - { val: "5", lbl: "Szakasz" }
    - { val: "20+", lbl: "ranghely javulás modellváltás nélkül*" }
footer:
  left: "AI Hub · Harness engineering"
  right: "Harness engineering · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#harness-engineering-0"><div class="tc-num">0. rész</div><div class="tc-name">Agent = Model + Harness</div><div class="tc-desc">A tiszta definíció, és miért nem elég a modell.</div></a>
  <a class="toc-card" href="#harness-engineering-1"><div class="tc-num">1. rész</div><div class="tc-name">A három fázis evolúciója</div><div class="tc-desc">Prompt → kontextus → harness engineering.</div></a>
  <a class="toc-card" href="#harness-engineering-2"><div class="tc-num">2. rész</div><div class="tc-name">Az öt réteg, ami a harnesst adja</div><div class="tc-desc">Tool orchestration, verification, context, guardrails, observability.</div></a>
  <a class="toc-card" href="#harness-engineering-3"><div class="tc-num">3. rész</div><div class="tc-name">A kudarc-taxonómia</div><div class="tc-desc">Miért a harness, nem a reasoning hibázik legtöbbször.</div></a>
  <a class="toc-card" href="#harness-engineering-4"><div class="tc-num">4. rész</div><div class="tc-name">Egy konkrét, mért production eset</div><div class="tc-desc">Az Azure SRE Agent sztorija.</div></a>
</div>
::::::

:::::: section id=harness-engineering-0 num="00" heading="0. rész — Agent = Model + Harness" nav="Agent = Model + Harness" group="Elmélet"

<p class="topic-tagline">Cél: tisztázd a tiszta definíciót, amire az egész cikk épül.</p>

### A képlet, ami mindent összefog

::::: callout label="A legfontosabb egyenlet"
**Agent = Model + Harness.** A modell a nyers, sztochasztikus (valószínűségi) gondolkodást adja — de önmagában nem "ágens": nincs állapota, nem hajt végre eszközöket, nincs visszacsatolási hurka. A **harness** az a futtató szoftver-infrastruktúra, ami mindent kezel, ami nem maga a modell reasoninge — eszközök végrehajtása, memória, állapot-megőrzés, ellenőrzés.
:::::

::::: callout label="Egy szemléletes megfogalmazás"
*"Ha nem te vagy a modell, te vagy a harness"* — minden kód, konfiguráció és végrehajtási logika, ami nem maga a modell, a harness része. A <em>Agentic kódolás</em> tutorial 1. részében látott meghatározás ("a modell köré épített keretrendszer") pontosan erre utal — ez a cikk azt bontja szét, **miből** áll ez a keretrendszer valójában.
:::::

::::: callout label="Egy mondatban"
A harness az a réteg, ami a modell **valószínűségi** gondolkodását **megbízható, determinisztikus** cselekvéssé alakítja — enélkül a legokosabb modell is megbízhatatlan marad éles használatban.
:::::
::::::

:::::: section id=harness-engineering-1 num="01" heading="1. rész — A három fázis evolúciója" nav="A három fázis evolúciója" group="Elmélet"

<p class="topic-tagline">Cél: helyezd el a harness engineeringet egy tágabb, történeti ívben.</p>

### Prompt → kontextus → harness

::::: stack-grid
:::: card label="1. fázis (2022–2023): Prompt engineering"
A fókusz a **megfogalmazáson** volt — hogyan kérdezz úgy, hogy jobb választ kapj. Az AI-eszközök gyakorlatilag "okos autocomplete"-ként működtek, folyamatos emberi irányítást igényelve.
::::
:::: card label="2. fázis (2024–2025): Context engineering"
Ahogy a modellek képesebbé váltak, a szűk keresztmetszet a **megfogalmazásból** az **információ-válogatásba** tolódott — mit tegyél a kontextusablakba (releváns fájlok, projekt-szabályok). Az <em>MCP</em> és a <em>RAG</em> tutorialokban tárgyalt eszközök tették ezt rendszerezetté.
::::
:::: card label="3. fázis (2026): Harness engineering"
Most a kihívás **a rendszer**, ami körülveszi a modellt: hogyan biztosíts megbízható eszköz-végrehajtást, ellenőrzési hurkokat és korlátokat több munkamenetnyi, komplex feladatnál.
::::
:::::

::::: callout label="Egy mondatban"
Minden fázis a szűk keresztmetszet elmozdulását követi: a szó megválasztásától az információ-válogatáson át a **rendszertervezésig** — 2026-ban a mérnöki befektetés fókusza egyértelműen ez utóbbi.
:::::
::::::

:::::: section id=harness-engineering-2 num="02" heading="2. rész — Az öt réteg, ami a harnesst adja" nav="Az öt réteg, ami a harnesst adja" group="Az öt réteg"

<p class="topic-tagline">Cél: ismerd meg a konkrét komponenseket, amikbe egy production-szintű harness felépítése bontható.</p>

::::: stack-grid
:::: card label="1 · Tool orchestration"
Az eszközhívások **diszpécselése** — melyik eszközt, mikor, milyen sorrendben (lásd az <em>Agent architektúra</em> tutorial ReAct-hurkát).
::::
:::: card label="2 · Verification loops"
Ellenőrzési hurkok, amik **igazolják**, hogy egy lépés valóban megtette, amit kellett — nem elég, hogy az ügynök "azt mondja", kész van.
::::
:::: card label="3 · Context és memory"
Hogyan kezeli a rendszer az információt **több munkamenetnyi** feladat közben — beleértve a kontextus-visszaállítást és a strukturált átadási (handoff) formátumokat.
::::
:::: card label="4 · Guardrails"
Explicit **korlátok**, amik megakadályozzák a nem kívánt vagy veszélyes cselekvéseket — lásd a <em>Biztonság &amp; OWASP</em> tutorial "excessive agency" részét.
::::
:::: card label="5 · Observability"
**Megfigyelhetőség**: naplózás, nyomkövetés, költség-monitorozás — hogy az emberi felügyelő lássa, mit csinált ténylegesen az ügynök.
::::
:::::

### A "rules files" konkrét mechanizmusa

::::: callout label="Mechanikai különbség a sima prompttól"
A <em>Vibe coding</em> és <em>AI Config fájlok</em> tutorialokban megismert `AGENTS.md`/`CLAUDE.md` szabályfájlok itt kapnak pontosabb definíciót: **perzisztensek** (túlélik a munkameneteket), a futtató rendszer **automatikusan beszúrja** őket a munkamenet elején, **könyvtárfához illesztve** hierarchikusan öröklődnek, és — a legfontosabb tervezési döntés — a szabályokat **"error"**, nem "warning" szintre állítják, hogy **kemény korlátként**, ne csak tanácsként működjenek.
:::::

::::: callout label="Egy mondatban"
Egy production-szintű harness nem egyetlen trükk, hanem öt, egymást kiegészítő réteg — ha csak egyet erősítesz (pl. jobb promptot írsz), a másik négy hiánya továbbra is megbízhatatlanná teheti a rendszert.
:::::
::::::

:::::: section id=harness-engineering-3 num="03" heading="3. rész — A kudarc-taxonómia: miért a harness hibázik, nem a reasoning" nav="A kudarc-taxonómia" group="Kudarcok"

<p class="topic-tagline">Cél: érts meg egy meglepő, dokumentált felismerést a valós agent-kudarcok forrásáról.</p>

### A kijózanító statisztika

::::: callout danger label="A dokumentált arány"
Több elemzés szerint a **vállalati AI-kudarcok 65%-a** vezethető vissza **harness-defektekre** — konkrétan kontextus-eltolódásra (context drift), séma-illesztési hibákra és állapot-degradációra —, **nem** a modell nyers gondolkodási képességének hiányára. A modell önmagi optimalizálása **csökkenő hozamot** ad, ha a harness instabil marad.
:::::

### Négy kudarc-típus

::::: stack-grid
:::: card label="Context failures"
Az ügynök elveszíti vagy félreérti a releváns kontextust — gyakran a 2. részben látott context/memory réteg hiánya vagy hibája miatt.
::::
:::: card label="Constraint failures"
A korlátok (guardrails) nem érvényesülnek megfelelően — az ügynök olyat tesz, amit nem kellett volna.
::::
:::: card label="Verification failures"
Az ellenőrzési hurok hiányzik vagy hibás — az ügynök azt hiszi, kész van, valójában nem.
::::
:::: card label="Planning failures"
A tervezési lépés maga hibás — ez az egyetlen kategória, ami ténylegesen a modell reasoning-képességéhez kötődik közvetlenül.
::::
:::::

::::: callout label="A gyakorlati következmény"
Egy dokumentált kísérlet szerint **kizárólag a harness módosításával** (a modell cseréje nélkül) egy ügynök **20+ ranghelyet** javított egy teljesítmény-listán — ez konkrét bizonyíték arra, hogy a megbízhatóság elsődlegesen **rendszertervezési**, nem modell-kiválasztási kérdés.
:::::

::::: callout label="Egy mondatban"
Mielőtt egy jobb (nagyobb, drágább) modellre váltanál egy megbízhatatlan agent-rendszernél, érdemes megkérdezni: vajon a probléma tényleg a modell reasoning-jében van, vagy a **harness** valamelyik rétege hibás — a statisztikák szerint az utóbbi a gyakoribb.
:::::
::::::

:::::: section id=harness-engineering-4 num="04" heading="4. rész — Egy konkrét, mért production eset: az Azure SRE Agent" nav="Egy konkrét, mért production eset" group="Referencia"

<p class="topic-tagline">Cél: lásd, mit jelent mindez a gyakorlatban, egy valós, dokumentált, nagy léptékű rendszeren.</p>

### A számok, amik igazolják az elvet

::::: callout label="A Microsoft dokumentált eredménye"
A Microsoft Azure SRE Agent-je — ami több mint **35 000 production incidenst** kezelt önállóan — a hibaelhárítási időt (time-to-mitigation) **40,5 óráról 3 percre** csökkentette az Azure App Service-nél. Ez a harness öt rétege (MCP-eszközök, telemetria, kód-repók, incidens-kezelő platformok integrálása, emberi jóváhagyási pontokkal) együttesen elért eredménye — nem egyetlen, "okosabb" modellváltás.
:::::

### Egy fontos architekturális váltás útközben

::::: callout label="100+ eszköz helyett fájlrendszer-alapú kontextus"
A Microsoft dokumentáltan **100+ egyedi eszközről és egy előíró promptról** váltott egy **fájlrendszer-alapú context engineering rendszerre** — ez jól mutatja, hogy a harness tervezése iteratív folyamat, ahol a kezdeti, "minél több eszköz" megközelítés gyakran túlbonyolítottnak bizonyul a gyakorlatban.
:::::

::::: callout label="Egy mondatban"
Az Azure SRE Agent sztorija a legjobb, adatokkal alátámasztott bizonyíték arra, hogy a harness engineering nem elméleti divatszó — hanem egy konkrét, mérhető, óriási gyakorlati hatással bíró mérnöki diszciplína.
:::::
::::::

:::::: section id=harness-engineering-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0–1. rész"
Agent = Model + Harness — a modell gondolkodik, a harness cselekvéssé alakítja ezt · a prompt→kontextus→harness evolúciós ív
::::
:::: card label="2. rész"
Az öt réteg (tool orchestration, verification, context/memory, guardrails, observability), és a perzisztens szabályfájlok mechanikája
::::
:::: card label="3. rész"
A vállalati AI-kudarcok 65%-a harness-defekt, nem reasoning-hiány — négy kudarc-típus, és a 20+ ranghelyes javulás puszta harness-módosítással
::::
:::: card label="4. rész"
Az Azure SRE Agent konkrét, mért eredménye (40,5 óra → 3 perc) mint a harness engineering gyakorlati bizonyítéka
::::
:::::

<p class="topic-tagline">Kapcsolódó: az <em>Agentic kódolás</em> (a harness fogalmának bevezetése és a multi-agent minták), az <em>Agent architektúra</em> (a ReAct hurok, amit a tool orchestration réteg megvalósít), az <em>AI Config fájlok</em> (a szabályfájlok teljes felépítése) és a <em>Biztonság &amp; OWASP</em> (a guardrails réteg technikai részletei) tutorialok.</p>

<p class="topic-tagline" style="margin-top:12px;font-size:0.85em;opacity:0.75">* A 65%-os, 40,5 óra → 3 perc és 20+ ranghelyes adatok 2026-os iparági elemzésekből (Cloud Security Alliance, Microsoft, deepset) származnak — lásd a 3–4. részt a kontextusért.</p>
::::::
