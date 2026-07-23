---
page: llmops
title: LLMOps — a DevOps, amit a promptok igényelnek
sidebar_groups:
  - Elmélet
  - A különbség
  - A gyakorlat
  - Referencia
hero:
  eyebrow: "LLMOps · Fejlesztői Tanulási Terv"
  title: "LLMOps — <em>a DevOps, amit a promptok igényelnek</em>"
  lead: "A hagyományos DevOps/MLOps CI/CD-je gyors, mert a unit tesztek nem hívnak külső API-t. Az LLMOps ezt a feltevést borítja fel: minden prompt-változtatás teszteléséhez ténylegesen meg kell hívni a modellt. Ez a cikk megmutatja, miért nem elég a meglévő MLOps-stack, és mi az a három-kapus rendszer, ami a gyakorlatban működik."
  stats:
    - { val: "85%", lbl: "ML modell sosem éri el a productiont*" }
    - { val: "39,8%", lbl: "MLOps-piac éves növekedése*" }
    - { val: "4", lbl: "Szakasz" }
    - { val: "3", lbl: "kapu egy jó eval-pipeline-ban" }
footer:
  left: "AI Hub · LLMOps"
  right: "LLMOps · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#llmops-0"><div class="tc-num">0. rész</div><div class="tc-name">Miért nem elég a meglévő MLOps-stack</div><div class="tc-desc">85% modell sosem éri el a productiont — és ez csak a kezdet.</div></a>
  <a class="toc-card" href="#llmops-1"><div class="tc-num">1. rész</div><div class="tc-name">A promptok a kód</div><div class="tc-desc">A legfontosabb, szemléletváltó felismerés.</div></a>
  <a class="toc-card" href="#llmops-2"><div class="tc-num">2. rész</div><div class="tc-name">A három-kapus eval-pipeline</div><div class="tc-desc">Séma, Ragas, LLM-as-Judge — mikor melyiket.</div></a>
  <a class="toc-card" href="#llmops-3"><div class="tc-num">3. rész</div><div class="tc-name">Mikor kell egyáltalán LLMOps</div><div class="tc-desc">Nem minden AI-rendszernek kell ez a teljes apparátus.</div></a>
</div>
::::::

:::::: section id=llmops-0 num="00" heading="0. rész — Miért nem elég a meglévő MLOps-stack" nav="Miért nem elég a meglévő MLOps-stack" group="Elmélet"

<p class="topic-tagline">Cél: érts meg egy kijózanító statisztikát, ami az egész diszciplína létjogosultságát megalapozza.</p>

### A statisztika, ami mindent megmagyaráz

::::: callout danger label="A production-szakadék"
Dokumentáltan a hagyományos ML-modellek **85%-a sosem jut el productionba** — a modell megépítése rég nem a nehéz rész, a **megbízható, éles üzemeltetés** az. Az MLOps-piac eközben évi **39,8%-os** ütemben nő, 4,38 milliárd dolláros méretet érve el 2026-ra — ez a szakadék hajtja a befektetést.
:::::

### Az érettségi szintek

::::: callout label="Négy szint, ahol a legtöbb szervezet 1-2. szinten áll"
Az érettségi szintek a következők: a "0. szint" a manuális, ad hoc folyamatot jelenti; az "1. szint" az automatizált tréninget, manuális deploy-jal; a "2. szint" a **teljes CI/CD**-t — kód-commit-tól a production-deployig automatizált, adatvalidációval és modell-kiértékeléssel; a "3. szint" az automatizált monitorozást és újratanítást drift-detektálással; a "4. szint" pedig a teljes MLOps-ot, ami már LLMOps-kész — multi-modell orkesztrálás, prompt-verziózás, megfelelőség a pipeline-ba építve. A kutatás szerint a **0→2. szintre** jutás adja a legmagasabb megtérülést.
:::::

::::: callout label="Egy mondatban"
Az LLMOps nem egy divatszó a meglévő MLOps-gyakorlat fölé — egy válasz arra a konkrét tényre, hogy a hagyományos ML-pipeline-ok nem készültek fel a nyelvi modellek egyedi, prompt-központú működésére.
:::::
::::::

:::::: section id=llmops-1 num="01" heading="1. rész — A promptok a kód: a legfontosabb szemléletváltás" nav="A promptok a kód" group="A különbség"

<p class="topic-tagline">Cél: értsd meg a legfontosabb, gyakran alábecsült különbséget MLOps és LLMOps között.</p>

### Más artefaktum, más kockázat

::::: callout label="A kulcs-megkülönböztetés"
Hagyományos MLOps-ban az artefaktum egy **betanított modell-fájl** — a tréning egyszeri, ritkán ismétlődő esemény. LLMOps-ban az elsődleges artefaktum egy **prompt-sablon**: egy szövegdarab, ami a viselkedést irányítja, és amit **gyakrabban** módosítasz, mint egy modellt újratanítanál.
:::::

::::: callout danger label="Egy meglepő, de dokumentált tény"
Egyetlen szó megváltoztatása a rendszer-promptban (lásd a <em>Biztonság &amp; OWASP</em> tutorial system prompt sablonját) **nagyobb** minőség-elmozdulást okozhat, mint egy teljes modell-újratanítás egy hagyományos ML-rendszerben. Ez azt jelenti, hogy a prompt **ugyanolyan komolyan veendő**, mint bármilyen más kód — verzió-kontrollal, teszteléssel, code review-val.
:::::

### Miért lassabb és drágább egy LLMOps CI/CD

::::: callout warning label="A gyakorlati következmény"
Egy hagyományos MLOps CI/CD **gyors**, mert a unit tesztek nem hívnak külső API-t. Egy LLMOps CI/CD-nek viszont **ténylegesen meg kell hívnia** az LLM API-t minden egyes prompt-változtatás teszteléséhez — ez lassabbá és drágábbá teszi a pipeline-t, de nincs rá alternatíva, ha valóban tesztelni akarod a viselkedés-változást.
:::::

::::: callout label="Egy mondatban"
Ha a prompt kód, akkor minden, amit a normál szoftverfejlesztésben kódra alkalmazol — verziózás, code review, automatizált tesztelés — a promptra is vonatkozik, csak a "tesztfuttatás" itt egy valódi, költséges API-hívást jelent.
:::::
::::::

:::::: section id=llmops-2 num="02" heading="2. rész — A három-kapus eval-pipeline" nav="A három-kapus eval-pipeline" group="A gyakorlat"

<p class="topic-tagline">Cél: ismerd meg a konkrét, gyakorlatban bevált struktúrát, ami egyensúlyt teremt a sebesség és a minőség közt.</p>

### Miért nincs egyetlen jó metrika

::::: callout label="A hagyományos NLP-metrikák nem működnek"
A BLEU és ROUGE (klasszikus NLP-kutatási metrikák) gyakorlatilag **használhatatlanok** beszélgetés- vagy reasoning-alapú feladatoknál — a kimenet minősége valószínűségi és feladat-függő, nem egyetlen számmal megragadható.
:::::

### A három kapu

::::: stack-grid
:::: card label="1 · Séma-teszt (gyors, ingyenes)"
Ellenőrzi, hogy a kimenet **formailag** megfelel-e az elvárt struktúrának — ez nem hív modellt, tehát azonnali és költségmentes.
::::
:::: card label="2 · Ragas / faithfulness-teszt"
Egy középső réteg, ami azt méri, mennyire **hűséges** a válasz a megadott kontextushoz (lásd a <em>RAG</em> tutorial kiértékelési részét) — ez már valódi számítást igényel, de még nem szükségszerűen egy másik LLM-hívást.
::::
:::: card label="3 · LLM-as-Judge, csak jelentős változásnál"
A legdrágább lépés — egy másik LLM ítéli meg a válasz minőségét —, amit **csak nagyobb prompt-verzió-változásoknál** futtatnak, nem minden apró módosításnál, a költség és a sebesség miatt.
:::::

::::: callout label="Az emberi kiértékelés helye"
Az emberi review a leggyakoribb, iparágilag bevált gyakorlat szerint a **végső jóváhagyás** helye production-indítás előtt — nem minden egyes változtatásnál, hanem a legfontosabb döntési pontokon.
:::::

::::: callout label="Egy mondatban"
A jó eval-pipeline nem egyetlen, mindenre használt teszt — egy **rétegzett rendszer**, ahol az olcsó, gyors ellenőrzések szűrik ki a nyilvánvaló hibákat, és csak a valóban bizonytalan esetek jutnak el a drágább, emberi vagy LLM-alapú ítéletig.
:::::
::::::

:::::: section id=llmops-3 num="03" heading="3. rész — Mikor kell egyáltalán LLMOps" nav="Mikor kell egyáltalán LLMOps" group="Referencia"

<p class="topic-tagline">Cél: adj egy gyakorlati döntési keretet — ne minden projekt igényli a teljes apparátust.</p>

::::: callout label="A döntési szempontok"
Az LLMOps teljes bevezetése különösen indokolt, ha: **szabályozott** iparágban dolgozol (egészségügy, jog, pénzügy), ahol a halucinációnak (lásd a <em>Halucináció</em> tutorialt) valós következménye van; **nyílt súlyú modellt finomhangolsz** (lásd a <em>Fine-tuning technikák</em> tutorialt) — a tréning MLOps-kérdés, de a kiszolgálás és monitorozás már LLMOps; vagy hagyományos ML-t **és** LLM-generálást is kombinálsz ugyanabban a pipeline-ban.
:::::

::::: callout warning label="A gyakorlati kiindulópont"
Ha van már meglévő MLOps-infrastruktúrád, **ne cseréld le** — bővítsd ki: adj hozzá nyomkövetést (tracing), egy Ragas-alapú kiértékelést, és egy prompt-registryt (ideálisan a kóddal együtt verziózva, YAML-formátumban).
:::::

::::: callout label="Egy mondatban"
Nem minden AI-rendszernek kell teljes LLMOps-apparátus — de amint a rendszer **production-be** kerül, valós felhasználókkal, a prompt-verziózás és az eval-kapuk hiánya ugyanolyan kockázatot jelent, mint tesztelés nélkül kiadott hagyományos szoftver.
:::::
::::::

:::::: section id=llmops-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0. rész"
A production-szakadék (85% ML-modell sosem jut el productionba), és az érettségi szintek, ahol a 0→2. szintre jutás adja a legjobb megtérülést
::::
:::: card label="1. rész"
A legfontosabb szemléletváltás: a prompt a kód — egyetlen szó változtatása nagyobb hatású lehet, mint egy teljes modell-újratanítás
::::
:::: card label="2. rész"
A három-kapus eval-pipeline: séma-teszt (gyors) → Ragas/faithfulness → LLM-as-Judge (csak jelentős változásnál), plusz az emberi végső jóváhagyás
::::
:::: card label="3. rész"
Döntési keret: mikor indokolt a teljes LLMOps-apparátus, és hogyan bővítsd ki (ne cseréld le) a meglévő MLOps-infrastruktúrát
::::
:::::

<p class="topic-tagline">Kapcsolódó: az <em>Evaluation</em> (a benchmark-alapú mérés korlátai, ami itt is releváns), a <em>RAG</em> (a Ragas és a retrieval-metrikák részletei), a <em>Harness engineering</em> (az observability réteg, ami az LLMOps monitorozásához kapcsolódik) és a <em>Model routing</em> (a költség-optimalizálás inferencia-végpontok között) tutorialok.</p>

<p class="topic-tagline" style="margin-top:12px;font-size:0.85em;opacity:0.75">* A 85%-os és 39,8%-os adatok 2026-os iparági elemzésekből (MLOps-piac kutatás, ScienceDirect szisztematikus review) származnak — lásd a 0. részt a kontextusért.</p>
::::::
