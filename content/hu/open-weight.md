---
page: open-weight
title: Nyílt súlyú modellek — az "open weight" ökoszisztéma
sidebar_groups:
  - Elmélet
  - Licencek
  - Az ökoszisztéma
  - Referencia
hero:
  eyebrow: "Open weight · Fejlesztői Tanulási Terv"
  title: "Nyílt súlyú modellek — <em>az \"open weight\" ökoszisztéma</em>"
  lead: "Ha valaha hallottad, hogy a Llama vagy a Qwen \"open source\" — ez pontatlan, és a pontatlanság üzletileg is számít. A legtöbb ma \"nyílt\" modellként emlegetett rendszer valójában nyílt SÚLYÚ, nem nyílt forráskódú — a különbség eldöntheti, hogy jogilag kockázatmentesen építhetsz-e rá egy terméket."
  stats:
    - { val: "6", lbl: "nagy labor versenyez 2026-ban*" }
    - { val: "700M", lbl: "felhasználós korlát (Llama)*" }
    - { val: "5", lbl: "Szakasz" }
    - { val: "0", lbl: "\"open source\" a legtöbb esetben" }
footer:
  left: "AI Hub · Nyílt súlyú modellek"
  right: "Open weight · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#open-weight-0"><div class="tc-num">0. rész</div><div class="tc-name">Open weight ≠ open source</div><div class="tc-desc">A leggyakoribb, üzletileg is fontos félreértés.</div></a>
  <a class="toc-card" href="#open-weight-1"><div class="tc-num">1. rész</div><div class="tc-name">A licencek, amik ténylegesen számítanak</div><div class="tc-desc">Apache 2.0 vs. egyedi közösségi licencek.</div></a>
  <a class="toc-card" href="#open-weight-2"><div class="tc-num">2. rész</div><div class="tc-name">A 2026-os szereplők térképe</div><div class="tc-desc">Hat labor, hat ökoszisztéma, más erősségek.</div></a>
  <a class="toc-card" href="#open-weight-3"><div class="tc-num">3. rész</div><div class="tc-name">Miért nyílt súlyú modellt választani</div><div class="tc-desc">Adatszuverenitás, szabályozott iparágak, költség.</div></a>
  <a class="toc-card" href="#open-weight-4"><div class="tc-num">4. rész</div><div class="tc-name">Gyakorlati döntési szempontok</div><div class="tc-desc">Hogyan válassz, ha most kezded.</div></a>
</div>
::::::

:::::: section id=open-weight-0 num="00" heading="0. rész — Open weight ≠ open source: a leggyakoribb félreértés" nav="Open weight ≠ open source" group="Elmélet"

<p class="topic-tagline">Cél: tisztázd a legfontosabb, üzletileg is releváns fogalmi különbséget.</p>

### Mit jelent valójában a "nyitottság" egy AI-modellnél

::::: callout danger label="A pontos definíció"
A **nyílt súlyú (open weight)** modellek olyan modellek, amiknek a betanított paraméterei (súlyai) bárki számára letölthetők, futtathatók és finomhangolhatók — **még akkor is**, ha a tanítóadat és a tanítási kód **nem** nyilvános. A "nyílt forráskódú" (open source) kifejezés ezzel szemben az Open Source Initiative szerint megkövetelné a tanítóadathoz, a kódhoz **és** az értékelési módszerekhez való hozzáférést is.
:::::

### Miért nem csak szőrszálhasogatás ez

::::: callout warning label="A gyakorlati következmény"
Mivel a legtöbb "nyílt" modellként reklámozott rendszer (Llama, Qwen, Mistral, Gemma, DeepSeek) **csak** a súlyokat publikálja, nem a tanítóadatot vagy a teljes pipeline-t, a szakma egyre inkább a pontosabb **"open weight"** vagy **"source-available"** kifejezést használja az "open source" helyett. Ez nem csak terminológiai pontosság — a **licenc**, ami a súlyokhoz tartozik, gyakran korlátozásokkal jár, amikről a következő rész szól.
:::::

::::: callout label="Egy mondatban"
Ha egy modellt "nyílt forráskódúnak" hallasz nevezni, első lépésként érdemes megkérdezni: "a súlyokat, a kódot, vagy a teljes tanítóadatot is publikálták?" — a válasz gyakran csak az első.
:::::
::::::

:::::: section id=open-weight-1 num="01" heading="1. rész — A licencek, amik ténylegesen számítanak" nav="A licencek, amik ténylegesen számítanak" group="Licencek"

<p class="topic-tagline">Cél: ismerd meg a két fő licenc-kategóriát, és mit jelentenek gyakorlatilag egy termékfejlesztő számára.</p>

### Két tábor: megengedő és korlátozott

::::: compare
::: good label="Megengedő licencek (Apache 2.0, MIT)"
Korlátlan kereskedelmi felhasználást, módosítást és terjesztést enged, **felhasználó-szám korlát és jogi felülvizsgálat nélkül**. A Qwen, Mistral, Gemma 4, DeepSeek és a gpt-oss (OpenAI nyílt súlyú modellje) mind ezt a kategóriát választotta.
:::
::: bad label="Egyedi, korlátozott licencek"
A **Llama Community License** például egy **700 millió havi aktív felhasználós korlátot** ír elő — eddig a küszöbig a legtöbb vállalkozás számára irreleváns, de jogilag **nem** minősül OSI-jóváhagyott nyílt forráskódnak, és tartalmaz elfogadható-használati szabályzatot, származékos modellek elnevezési kötelezettségét, és egyes verzióknál EU-s egyéni felhasználói korlátozást is.
:::
:::::

::::: callout label="Amit egy jogi csapatnak érdemes ellenőriznie"
Konkrétan négy dolgot érdemes megnézni egy licencben: **felhasználó-szám korlát**, **földrajzi korlátozás**, **bevétel-alapú küszöb**, és **modell-kimenetre vonatkozó szabályok** (pl. tilos-e a kimenetet másik modell tanítására használni). A megengedő licencek (Apache 2.0, MIT) ezek egyikét sem tartalmazzák.
:::::

::::: callout label="Egy mondatban"
A licenc a gyakorlatban fontosabb, mint a benchmark-pontszám — egy kiváló, de bizonytalan jogi státuszú modell nagyobb kockázatot jelenthet egy terméknél, mint egy valamivel gyengébb, de tisztán Apache 2.0-s alternatíva.
:::::
::::::

:::::: section id=open-weight-2 num="02" heading="2. rész — A 2026-os szereplők térképe" nav="A 2026-os szereplők térképe" group="Az ökoszisztéma"

<p class="topic-tagline">Cél: lásd, kik a fő szereplők ma, és miben erős mindegyik — anélkül, hogy elveszítenénk magunkat a gyorsan változó részletekben.</p>

### Hat labor, hat különböző erősség

::::: stack-grid
:::: card label="Meta — Llama"
A legrégebbi, legszélesebb közösségi ökoszisztéma — a legtöbb finomhangolási recept, kvantált build és harmadik féltől származó útmutató ehhez a családhoz készült. Egyedi közösségi licenc.
::::
:::: card label="Alibaba — Qwen"
Erős kódolásban és többnyelvűségben, széles méret-skálával (kb. 1B-tól 400B+ paraméterig) — Apache 2.0 licenc, ami sok vállalati döntéshozónál a "biztonságos alapértelmezés".
::::
:::: card label="Mistral"
A licenc-tisztaság szempontjából kiemelkedő választás — jellemzően Apache 2.0, ami különösen vonzó szabályozott iparágaknak és európai adatszuverenitási igényeknek.
::::
:::: card label="Google — Gemma"
Erős, egyetlen GPU-n futtatható multimodális modellek, megengedő licenccel.
::::
:::: card label="DeepSeek"
Dokumentáltan csak néhány hónappal marad le a zárt frontier-modellek mögött sok benchmarkon — MIT licenccel, ami a leginkább megengedő kategória.
::::
:::: card label="OpenAI — gpt-oss"
Az OpenAI első, kifejezetten nyílt súlyú, Apache 2.0 licencű reasoning-modell családja — jelezve, hogy még a zárt modelleket preferáló labor is belépett ebbe a szegmensbe.
::::
:::::

::::: callout label="Egy mondatban"
2026-ra a nyílt súlyú modellek mezőnye **hat, egymással genuinely versengő** laborra bővült — 2024-ben ez még gyakorlatilag a Llama dominanciájáról és néhány kínai alternatíváról szólt.
:::::
::::::

:::::: section id=open-weight-3 num="03" heading="3. rész — Miért választanál nyílt súlyú modellt egyáltalán" nav="Miért nyílt súlyú modellt választani" group="Az ökoszisztéma"

<p class="topic-tagline">Cél: értsd meg a konkrét üzleti indokokat, ne csak azt, hogy "ingyenes".</p>

### Négy fő érv

::::: stack-grid
:::: card label="Adatszuverenitás"
A modell **saját infrastruktúrádon** fut — az adat sosem hagyja el a szervezetedet, ami kritikus lehet szabályozott iparágakban (egészségügy, pénzügy).
::::
:::: card label="Testreszabhatóság"
Teljes hozzáférésed van a súlyokhoz — finomhangolhatod (lásd a <em>Fine-tuning technikák</em> tutorialt) a saját, szűk területedre.
::::
:::: card label="Költség-kontroll"
Nagy volumen mellett a saját infrastruktúrán futtatott, kvantált (lásd a <em>Kvantálás és minőség</em> tutorialt) modell hosszabb távon olcsóbb lehet, mint az API-hívásonkénti díjazás.
::::
:::: card label="Auditálhatóság"
Egy szabályozó számára könnyebben bizonyítható, mit csinál pontosan a rendszered, ha a teljes modell a te ellenőrzésed alatt fut, nem egy külső, zárt API mögött.
::::
:::::

::::: callout label="Miért lett ez a szabályozott iparágak alapértelmezése"
A nyílt súlyú modellek és a helyben futtatás kombinációja egyre inkább **nem trend, hanem gyakorlati szükségszerűség** azoknál a szervezeteknél, ahol az átláthatóság, az auditálhatóság és az adatszuverenitás nem opcionális elvárás, hanem szabályozói követelmény.
:::::
::::::

:::::: section id=open-weight-4 num="04" heading="4. rész — Gyakorlati döntési szempontok" nav="Gyakorlati döntési szempontok" group="Referencia"

<p class="topic-tagline">Cél: adj egy konkrét, azonnal használható kiindulási pontot.</p>

::::: callout label="Egy gyakorlati ökölszabály"
Ne a legnagyobb modellel kezdj — kezdd azzal, amit a **hardvered kényelmesen elbír** (lásd a <em>Hardware</em> tutorialt), és csak akkor lépj feljebb, ha ez ténylegesen korlátoz.
:::::

::::: stack-grid
:::: card label="Ha a licenc-tisztaság a legfontosabb"
Válassz Apache 2.0 vagy MIT licencű családot (Qwen, Mistral, Gemma, DeepSeek, gpt-oss) — nincs felhasználó-szám korlát, nincs jogi bizonytalanság.
::::
:::: card label="Ha kódoláshoz és agentic munkafolyamathoz kell"
A kódolásra és hosszú-horizontú agent-munkafolyamatokra optimalizált modellcsaládok jellemzően a legerősebbek ezen a téren — érdemes friss, kódolás-specifikus benchmarkokat (lásd az <em>Evaluation</em> tutorialt) megnézni választás előtt.
::::
:::: card label="Ha gyenge a hardvered"
Kis, hatékony modellváltozatok (lásd a <em>Modelltípusok térképe</em> tutorial SLM részét) CPU-n is futtathatók, ha a GPU nem opció.
::::
:::: card label="Ha hosszú kontextusablak a fő szempont"
Egyes modellcsaládok kifejezetten nagyon hosszú kontextusablakra (akár milliós tokenszámra) optimalizáltak — ez különösen releváns nagy dokumentum-feldolgozásnál.
::::
:::::

::::: callout warning label="Amit sose hagyj ki"
Bármelyik modellt is választod, **olvasd el a licenc elfogadható-használati szabályzatát**, mielőtt terméket építesz rá — ez különösen igaz, ha a terméked skálázódhat a felhasználó-szám korlátok közelébe, vagy ha EU-s egyéni felhasználókat érint valamelyik újabb licenc-verzió korlátozása.
:::::

::::: callout label="Egy mondatban"
A nyílt súlyú modellek ökoszisztémája 2026-ra genuinely versengővé vált — a döntés ma inkább **licenc-tisztaság, méret-illeszkedés és feladat-specifikus erősség** kérdése, nem az, hogy "van-e egyáltalán jó nyílt alternatíva" (van).
:::::
::::::

:::::: section id=open-weight-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0. rész"
Open weight ≠ open source — a legtöbb "nyílt" modell csak a súlyokat publikálja, nem a tanítóadatot vagy a kódot
::::
:::: card label="1. rész"
Két licenc-tábor: megengedő (Apache 2.0, MIT) vs. egyedi, korlátozásokkal (pl. Llama 700M felhasználós korlátja) — a licenc gyakran fontosabb, mint a benchmark
::::
:::: card label="2. rész"
Hat nagy labor versenyez 2026-ban (Meta, Alibaba, Mistral, Google, DeepSeek, OpenAI), mindegyik más erősséggel
::::
:::: card label="3–4. rész"
Négy üzleti érv a nyílt súlyú modellek mellett (adatszuverenitás, testreszabhatóság, költség, auditálhatóság) · gyakorlati döntési szempontok, mivel érdemes kezdeni
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>Fine-tuning technikák</em> (hogyan specializálj egy nyílt súlyú modellt), a <em>Kvantálás és minőség</em> (hogyan futtass nagyobb modellt kisebb hardveren), a <em>Hardware</em> (mit bír el a géped) és a <em>Modelltípusok térképe</em> (SLM-ek és a méret-illeszkedés) tutorialok.</p>

<p class="topic-tagline" style="margin-top:12px;font-size:0.85em;opacity:0.75">* A modellcsaládok és licencek folyamatosan változnak — lásd a 2. részt a kontextusért, és mindig ellenőrizd a mindenkori, hivatalos licenc-szöveget döntés előtt.</p>
::::::
