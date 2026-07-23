---
page: ai-safety
title: Alignment és red teaming — amikor a modell viselkedését teszteljük
sidebar_groups:
  - Elmélet
  - A gyakorlat
  - A helyzet ma
  - Referencia
hero:
  eyebrow: "AI Safety · Fejlesztői Tanulási Terv"
  title: "Alignment és red teaming — <em>amikor a modell viselkedését teszteljük</em>"
  lead: "A Biztonság &amp; OWASP tutorial azt nézi, hogyan védd az ALKALMAZÁSODAT, ami egy LLM-re épül. Ez a cikk egy szinttel feljebb megy: mit jelent az \"alignment probléma\" fogalmilag, mi a különbség az alignment (építő) és a red teaming (romboló) megközelítés között, és mit mutat a mai kutatás arról, mennyire törhető fel egy modell."
  stats:
    - { val: "97%", lbl: "automatizált jailbreak sikeresség*" }
    - { val: "47% / 70%", lbl: "emberi / automatizált arány*" }
    - { val: "5", lbl: "Szakasz" }
    - { val: "0", lbl: "\"megoldott\" modell eddig" }
footer:
  left: "AI Hub · Alignment és red teaming"
  right: "Alignment · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#ai-safety-0"><div class="tc-num">0. rész</div><div class="tc-name">Az alignment probléma egy mondatban</div><div class="tc-desc">Nem "gonosz AI" — egy tervezési kihívás.</div></a>
  <a class="toc-card" href="#ai-safety-1"><div class="tc-num">1. rész</div><div class="tc-name">Alignment vs. red teaming</div><div class="tc-desc">Építő és romboló megközelítés — miért kell mindkettő.</div></a>
  <a class="toc-card" href="#ai-safety-2"><div class="tc-num">2. rész</div><div class="tc-name">Mit mutat a mai kutatás</div><div class="tc-desc">Konkrét, kijózanító számok a jailbreak-ekről.</div></a>
  <a class="toc-card" href="#ai-safety-3"><div class="tc-num">3. rész</div><div class="tc-name">A cél nem a nulla, hanem a szűkítés</div><div class="tc-desc">"Narrow blast radius" — egy realisztikusabb célkitűzés.</div></a>
  <a class="toc-card" href="#ai-safety-4"><div class="tc-num">4. rész</div><div class="tc-name">Hova illeszkedik ez a te munkádba</div><div class="tc-desc">Kapcsolat a Biztonság &amp; OWASP tutorialhoz.</div></a>
</div>
::::::

:::::: section id=ai-safety-0 num="00" heading="0. rész — Az alignment probléma egy mondatban" nav="Az alignment probléma egy mondatban" group="Elmélet"

<p class="topic-tagline">Cél: tisztázd, mit jelent ez a gyakran hallott, de ritkán pontosan definiált fogalom.</p>

### Nem "gonosz AI" — egy tervezési kihívás

Az **alignment** (magyarul néha "beigazítás") azt a problémát jelenti, hogy egy AI-rendszer viselkedése **megbízhatóan illeszkedjen** ahhoz, amit a tervezői és a felhasználói ténylegesen szeretnének — ne csak a szó szerinti utasításokhoz, hanem a **mögöttes szándékhoz** is.

::::: callout label="Amivel ez összefügg a te eddigi tudásodból"
A <em>Base vs. Instruct modell</em> tutorialban látott instruction tuning és RLHF **mind az alignment-probléma egy-egy megoldási kísérlete**: az instruction tuning megtanítja a modellt utasítást követni, az RLHF pedig emberi preferencia szerint finomítja, **melyik** válasz a "jobb" a formailag helyesek közül.
:::::

::::: callout warning label="Miért nehéz ez elvben is"
Az alignment nem egy egyszeri "bekapcsolható" funkció — minél **képesebb** és **önállóbb** egy rendszer (gondolj az <em>Agentic kódolás</em> tutorialban tárgyalt ügynökökre), annál nehezebb előre biztosítani, hogy minden lehetséges helyzetben a szándékolt módon viselkedjen.
:::::

::::: callout label="Egy mondatban"
Az alignment probléma nem sci-fi félelem — egy nagyon konkrét, mérnöki kihívás: hogyan biztosítsuk, hogy egy egyre képesebb rendszer viselkedése megbízhatóan kövesse a szándékolt korlátokat, ne csak a legtöbb, hanem **minden** helyzetben.
:::::
::::::

:::::: section id=ai-safety-1 num="01" heading="1. rész — Alignment vs. red teaming: építő és romboló megközelítés" nav="Alignment vs. red teaming" group="A gyakorlat"

<p class="topic-tagline">Cél: értsd meg a két, egymást kiegészítő, de módszertanilag ellentétes megközelítést.</p>

### Két oldal, ami együtt dolgozik

::::: compare
::: good label="Alignment kutatás — építő"
Megpróbál olyan rendszert **létrehozni**, ami eleve nem hibázik — tanítási módszerekkel, korlátokkal, érték-formálással. A cél: egy rendszer, ami **nem törik el**.
:::
::: bad label="Red teaming — romboló"
**Feltételezi**, hogy a fenti cél még nem teljesült, és aktívan keresi a réseket — adversarial promptokkal, jailbreak-kísérletekkel, szimulált támadásokkal. A cél: megtalálni a hibákat, **mielőtt** valaki más találja meg.
:::
:::::

### Miért kell mindkettő

::::: callout label="A gyakorlati munkamegosztás"
A **red team** támadóként gondolkodik: jailbreak-promptokat, prompt injection-t (lásd a <em>Biztonság &amp; OWASP</em> tutorial 2. részét), multimodális kizsákmányolást próbál — a **blue team** pedig védekezik: input-validációt, output-szűrést és guardrail-eket épít, majd újrateszteli a javításokat. A **purple team** a kettő köztes összekapcsolása, ahol a talált gyengeségek azonnal visszakerülnek a tanítási ciklusba.
:::::

::::: callout label="Egy mondatban"
Az alignment és a red teaming nem versengő, hanem **kiegészítő** tevékenység — az egyik épít, a másik teszteli, hogy amit építettek, tényleg kibírja-e a valós, ellenséges nyomást.
:::::
::::::

:::::: section id=ai-safety-2 num="02" heading="2. rész — Mit mutat a mai kutatás: konkrét, kijózanító számok" nav="Mit mutat a mai kutatás" group="A helyzet ma"

<p class="topic-tagline">Cél: lásd őszinte, mért adatokkal, hol tart ma a terep — marketingszöveg nélkül.</p>

### A jailbreak-ellenállóság jelenlegi állapota

::::: callout danger label="A 2026-os kutatási helyzetkép"
Kutatási környezetben **automatizált AI-rendszerek kb. 97%-os sikerességgel** tudnak feltörni más AI-rendszereket. Emberi red-teamerek a támadások kb. **47%-át** találják meg, míg az automatizált eszközök ezt **70%-ra** javítják. A klasszikus, "hagyományos" jailbreak-technikák (pl. a híres "DAN" prompt) egyre kevésbé hatékonyak — de helyükbe **agentic és architektúra-szintű** támadások lépnek, amik gyorsabban fejlődnek, mint ahogy a védekező tanítási ciklusok követni tudnák őket.
:::::

::::: callout warning label="Amit ez NEM jelent"
Ez **nem** azt jelenti, hogy a mai AI-rendszerek használhatatlanul bizonytalanok — a legtöbb hétköznapi, jóhiszemű használatban a beépített korlátok jól működnek. A fenti számok **kutatási, kifejezetten adversarial** környezetben mért eredmények, ahol a cél kifejezetten a rendszer feltörése volt, nem a normál használat szimulálása.
:::::

::::: callout label="Egy mondatban"
Egyetlen labor sem publikált olyan módszert, ami minden szűk jailbreak-kísérlet ellen **immunitást** adna — a jelenlegi kutatási konszenzus szerint ez egyelőre nem is reális célkitűzés (lásd a 3. részt).
:::::
::::::

:::::: section id=ai-safety-3 num="03" heading="3. rész — A cél nem a nulla, hanem a szűkítés" nav="A cél nem a nulla, hanem a szűkítés" group="A helyzet ma"

<p class="topic-tagline">Cél: érts meg egy realisztikusabb, ma elfogadott célkitűzést a "tökéletes biztonság helyett".</p>

### "Narrow blast radius" — szűk robbanási sugár

::::: callout label="A filozófia, amit a frontier-labek explicit megfogalmaznak"
A tervezési cél nem a **nulla jailbreak** — hanem hogy egy sikeres támadás is a lehető **legszűkebb, legdrágább és legfelismerhetőbb** maradjon. Egy szűk jailbreak, ami csak **egy**, korlátozott, konkrét károkozó információt hoz ki, lényegesen kevésbé katasztrofális, mint egy univerzális, mindenre alkalmazható feltörés.
:::::

### Három védekezési réteg, amit ez a szemlélet jelent

::::: stack-grid
:::: card label="1 · Szűkítés"
Még ha egy támadás sikerül is, csak **korlátozott, specifikus** kimenetet engedjen ki, ne teljes, tetszőleges képességet.
::::
:::: card label="2 · Drágítás"
A sikeres támadásnak **jelentős erőforrást** (idő, számítás, szakértelem) kelljen igényelnie — ne legyen egy egyszerű, sablonszerűen másolható prompt.
::::
:::: card label="3 · Detektálhatóság"
A sikeres vagy sikertelen kísérletek **észlelhetők** legyenek, hogy a következő tanítási ciklusban ezek az információk (lásd a "continuous red-teaming" gyakorlatot) beépíthetők legyenek a védekezésbe.
::::
:::::

::::: callout label="Egy mondatban"
A realisztikus cél nem az, hogy egy modell **feltörhetetlen** legyen — hanem hogy minden sikeres feltörés **szűk, drága és észlelhető** maradjon, ezzel folyamatosan csökkentve a valós kockázatot, nem egyetlen lépésben megszüntetve azt.
:::::
::::::

:::::: section id=ai-safety-4 num="04" heading="4. rész — Hova illeszkedik ez a te munkádba" nav="Hova illeszkedik ez a te munkádba" group="Referencia"

<p class="topic-tagline">Cél: kösd össze ezt a fogalmi tudást a gyakorlati, alkalmazás-szintű tutoriallal.</p>

### A kapcsolat a Biztonság & OWASP tutorialhoz

::::: callout label="A két cikk viszonya"
Ez a cikk azt magyarázta el, **mi** az alignment probléma, és **hogyan** teszteli a szakma egy modell megbízhatóságát (red teaming) — a <em>Biztonság &amp; OWASP</em> tutorial ehhez képest **gyakorlati, alkalmazás-fejlesztői** szintre megy: konkrét OWASP LLM Top 10 kategóriákkal, jailbreak-mintázatokkal és védekezési rétegekkel, amiket **neked**, mint egy LLM-re épülő alkalmazás fejlesztőjének kell beépítened.
:::::

::::: callout label="Egy mondatban"
Ha egy AI-modell **belső** megbízhatóságára vagy kíváncsi (mennyire ellenálló általánosságban), ez a cikk ad hozzá kontextust — ha egy **saját alkalmazásod** védelmét építed egy LLM köré, a <em>Biztonság &amp; OWASP</em> tutorial a következő állomás.
:::::
::::::

:::::: section id=ai-safety-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0. rész"
Az alignment probléma fogalmilag: hogyan biztosítsuk, hogy egy egyre képesebb rendszer megbízhatóan a szándékolt módon viselkedjen
::::
:::: card label="1. rész"
Az alignment (építő) és a red teaming (romboló) megközelítés, és miért dolgozik a kettő együtt (red/blue/purple team munkamegosztás)
::::
:::: card label="2. rész"
Konkrét, 2026-os kutatási számok a jailbreak-ellenállóságról (97% automatizált sikeresség kutatási környezetben) — őszinte helyzetkép, marketing nélkül
::::
:::: card label="3–4. rész"
A realisztikus cél: nem nulla jailbreak, hanem szűk, drága, detektálható sikeres támadás · kapcsolat a gyakorlati Biztonság &amp; OWASP tutorialhoz
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>Biztonság &amp; OWASP</em> (gyakorlati, alkalmazás-szintű védekezés), a <em>Base vs. Instruct modell</em> és az <em>RLHF</em> (az alignment egyik konkrét technikai megvalósítása) tutorialok.</p>

<p class="topic-tagline" style="margin-top:12px;font-size:0.85em;opacity:0.75">* A 97%-os és 47%/70%-os adatok 2026-os, kutatási környezetben végzett red-teaming elemzésekből származnak — lásd a 2. részt a kontextusért.</p>
::::::
