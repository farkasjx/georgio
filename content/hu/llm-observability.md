---
page: llm-observability
title: Observability és monitoring gyakorlatban
sidebar_groups:
  - A megkülönböztetés
  - Mit mérj
  - Az eszközök
  - Referencia
hero:
  eyebrow: "Observability · Fejlesztői Tanulási Terv"
  title: "Observability és <em>monitoring gyakorlatban</em>"
  lead: "Az LLMOps tutorial az eval-pipeline-ról szólt — ez a cikk arról, hogyan kövesd nyomon egy ÉLES AI-rendszer viselkedését valós időben: mit mérsz, mikor kapsz riasztást, és hogyan derítsd ki, miért drágult meg hirtelen a számlád. Konkrét eszközök, konkrét mérőszámok, és a legfontosabb fogalmi megkülönböztetés, amit sokan összekevernek."
  stats:
    - { val: "0-5%", lbl: "mérési overhead a legjobb eszközöknél*" }
    - { val: "sub-200ms", lbl: "teljes-forgalmú kiértékelés (Galileo Luna-2)*" }
    - { val: "5", lbl: "Szakasz" }
    - { val: "97%", lbl: "olcsóbb, mint a sima LLM-as-judge*" }
footer:
  left: "AI Hub · Observability"
  right: "Observability · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#llm-observability-0"><div class="tc-num">0. rész</div><div class="tc-name">LLM-monitoring vs. agent-observability</div><div class="tc-desc">A megkülönböztetés, amit sokan összekevernek.</div></a>
  <a class="toc-card" href="#llm-observability-1"><div class="tc-num">1. rész</div><div class="tc-name">Mit mérj: négy alapréteg</div><div class="tc-desc">Tracing, költség, minőség, prompt-verzió.</div></a>
  <a class="toc-card" href="#llm-observability-2"><div class="tc-num">2. rész</div><div class="tc-name">A mérési overhead ára</div><div class="tc-desc">Az observability maga is költséget és latenciát ad hozzá.</div></a>
  <a class="toc-card" href="#llm-observability-3"><div class="tc-num">3. rész</div><div class="tc-name">Az eszköztár: kit válassz mire</div><div class="tc-desc">Langfuse, LangSmith, Arize és a különbségek.</div></a>
  <a class="toc-card" href="#llm-observability-4"><div class="tc-num">4. rész</div><div class="tc-name">Riasztás és drift-detektálás</div><div class="tc-desc">Mikor szóljon a rendszer, mielőtt a felhasználó panaszkodna.</div></a>
</div>
::::::

:::::: section id=llm-observability-0 num="00" heading="0. rész — LLM-monitoring vs. agent-observability" nav="LLM-monitoring vs. agent-observability" group="A megkülönböztetés"

<p class="topic-tagline">Cél: tisztázd a két, gyakran összemosott fogalmat, mert a köztük lévő különbség dönti el, milyen eszköz illik a rendszeredhez.</p>

### Két, alapvetően más probléma

::::: callout label="A hagyományos LLM-monitoring"
Egyedi **prompt-válasz párokat** követ: latencia, költség, kimenet-minőség — ez pontosan az a szint, ahol egy egyszerű chat-integráció (lásd a <em>Hivatalos SDK-k</em> tutorial hasonló témáit) él.
:::::

::::: callout danger label="Az agent-observability egy más problémaosztály"
Egy AI-**ügynöknél** (lásd az <em>Agent architektúra</em> és a <em>Multi-agent rendszerek</em> tutorialokat) a hibák **multi-lépéses, oksági láncokban** jelennek meg, nem egyetlen hívás szintjén — egy eszközhívás, ami "örökre" hurokba kerül, egy retrieval-lépés, ami szemetet ad vissza és költség-kiugrást okoz — ezeket **csak teljes session-nyomkövetéssel** lehet észrevenni, nem egyetlen kérés-válasz pár vizsgálatával.
:::::

::::: callout warning label="Amit a hagyományos APM nem lát"
A hagyományos **application performance monitoring** (APM) latenciát és hibákat követ — az agent-observability ezen felül **kimenet-minőséget, hűséget (faithfulness), biztonságot és viselkedési driftet** is mér, mert egy AI-ügynöknél a "helyesen fut" és a "helyes eredményt ad" két külön kérdés.
:::::

::::: callout label="Egy mondatban"
Ha egyetlen, önálló LLM-hívásod van, a hagyományos monitoring elég — ha multi-turn, eszközhívásokkal teli ügynököd van, teljes **session-szintű** nyomkövetésre van szükséged, ami egy más eszközkategória.
:::::
::::::

:::::: section id=llm-observability-1 num="01" heading="1. rész — Mit mérj: négy alapréteg" nav="Mit mérj" group="Mit mérj"

<p class="topic-tagline">Cél: ismerd meg a négy réteget, amit minden komoly observability-stack lefed.</p>

### A négy réteg

::::: stack-grid
:::: card label="1 · Tracing"
Minden lépés (LLM-hívás, eszközhívás, retrieval, tervezési döntés) **vizuális gráfként** rögzítve — pontosan látod, hol romlott el egy folyamat, és milyen sorrendben történtek a lépések.
::::
:::: card label="2 · Költség-követés"
Token-felhasználás és dollár-költség **valós időben**, ahogy a <em>Költség-optimalizálás</em> tutorialban tárgyalt technikák hatását is mérni tudod — anélkül, hogy a hónap végén meglepődnél a számlán.
::::
:::: card label="3 · Kiértékelés (evaluation)"
A kimenet minősége szemben egy alapigazsággal vagy egy LLM-alapú ítélettel — ez fogja el a **minőségi regressziókat**, nem csak a latencia-problémákat.
::::
:::: card label="4 · Prompt-verziózás integrációja"
A <em>Prompt-verziózás</em> tutorialban tárgyalt verziók és az observability **összekapcsolva** — tudod, **melyik prompt-verzió** futott, amikor egy adott hiba történt.
::::
:::::

::::: callout warning label="Az agentnél extra dimenziók kellenek"
Egy agent-observability platformnak ezen felül mérnie kell a **hűséget** (a válasz mennyire hű a forráshoz), a **biztonságot**, az **eszközválasztás** helyességét és a **tervezés minőségét** — 50+ kutatás-alapú metrika létezik ezekre, amiket a hagyományos monitoring nem fed le.
:::::

::::: callout label="Egy mondatban"
A négy alapréteg (tracing, költség, minőség, verziózás) minden komoly rendszernek kell — agenteknél ehhez jön a hűség, a biztonság és a tervezési minőség mérése is.
:::::
::::::

:::::: section id=llm-observability-2 num="02" heading="2. rész — A mérési overhead ára" nav="A mérési overhead ára" group="Mit mérj"

<p class="topic-tagline">Cél: érts meg egy gyakran elfelejtett szempontot — az observability maga is teljesítmény-hatással jár.</p>

### Konkrét, mért adatok

::::: callout label="Nem minden eszköz egyforma"
Egy hands-on benchmark, ami 4 observability-eszközt tesztelt egy multi-agent útitervező rendszeren, **100 azonos lekérdezéssel**: a **LangSmith** mérhetetlenül alacsony overheadet mutatott, a **Laminar** kb. **5%**-ot adott hozzá — az **AgentOps és a Langfuse** magasabb latencia-hatást mutatott, ami a **lazábban csatolt** integrációs útjaikkal magyarázható.
:::::

::::: callout warning label="A szoros integráció ára és haszna"
Minél **szorosabban** integrálódik egy eszköz a keretrendszeredhez (pl. a LangSmith a LangChainhez), annál kevesebb fordítási/orkesztrálási réteg adódik hozzá — ez alacsonyabb overheadet ad, cserébe **kevésbé keretrendszer-független** megoldást.
:::::

::::: callout label="A teljes-forgalmú kiértékelés gazdasági problémája"
A Galileo **Luna-2** modelljei **sub-200ms** latenciával és a sima LLM-as-judge kiértékeléshez képest **97%-kal olcsóbban** teszik lehetővé a **100%-os production lefedettséget** — ez az egyetlen, dokumentáltan ismert platform, ami gazdaságilag megvalósíthatóvá teszi, hogy **minden** production-választ kiértékelj, ne csak egy mintát.
:::::

::::: callout label="Egy mondatban"
Az observability nem "ingyenes" — a bevezetése előtt mérd le a konkrét eszköz overhead-jét a saját rendszereden, mert a különbség eszközök között akár **tízszeres** is lehet.
:::::
::::::

:::::: section id=llm-observability-3 num="03" heading="3. rész — Az eszköztár: kit válassz mire" nav="Az eszköztár" group="Az eszközök"

<p class="topic-tagline">Cél: ismerd meg a fő szereplőket, és mindegyik konkrét, dokumentált erősségét.</p>

### Négy fő, gyakran ajánlott platform

::::: stack-grid
:::: card label="Langfuse"
**Nyílt forráskódú**, önhosztolható — ideális, ha az adat-tulajdonjog és a session-replay (a teljes beszélgetés-előzmény vizuális rekonstrukciója) a fő szempont; van hallucináció- és toxicitás-értékelő sablonja is.
::::
:::: card label="LangSmith"
A **LangChain/LangGraph** ökoszisztéma natív observability-eszköze — a legrészletesebb nyomkövetés, ha már ezt a keretrendszert használod; havi 5000 nyomkövetés ingyenes.
::::
:::: card label="Arize (Phoenix)"
Erős **enterprise ML-telemetriában**, kiterjesztve LLM-ekre — kifejezetten jó a **lassú, fokozatos drift** észlelésére (amikor a modell kimenete időben csendben romlik), teljesen ingyenes, önhosztolható.
::::
:::: card label="Helicone"
A **leggyorsabb beüzemelés** — proxy-alapú, azonnali, multi-provider költség-átláthatóság. A korlátja: a proxy csak a HTTP-forgalmat látja, a belső állapotot nem — összetettebb agent-nyomkövetéshez a Langfuse vagy a LangSmith jobban illik.
::::
:::::

::::: callout label="Egy gyakorlati ökölszabály a csapatméret alapján"
Egyéni fejlesztő vagy páros: kezdj egyszerűen — a **Helicone** perceken belül logolást ad, a **Langfuse** bőséges ingyenes csomaggal teljes observabilityt. Kis csapat (3-10 fő): egy **all-in-one** platform (LangSmith vagy Langfuse) csökkenti a karbantartási terhet.
:::::

::::: callout label="Egy mondatban"
Nincs egyetlen "legjobb" observability-eszköz — a keretrendszer-kötődésed (LangChain vagy nem), az adat-tulajdonjogi igényed, és a csapatod mérete dönti el, melyik illik hozzád.
:::::
::::::

:::::: section id=llm-observability-4 num="04" heading="4. rész — Riasztás és drift-detektálás" nav="Riasztás és drift-detektálás" group="Referencia"

<p class="topic-tagline">Cél: ismerd meg, hogyan derítsd ki a problémát azelőtt, hogy a felhasználó panaszkodna.</p>

### A drift jelensége

::::: callout label="Mi az a viselkedési drift"
Egy modell kimenete **csendben, fokozatosan** romolhat idővel — nem egy hirtelen hiba, hanem egy lassú eltolódás a válaszok minőségében vagy stílusában, amit egyetlen kérés vizsgálatával **nem** vennél észre, csak trend-elemzéssel.
:::::

### Konkrét riasztási minták

::::: callout warning label="Mire állíts riasztást"
Költség-kiugrás (egy hirtelen token-felhasználási csúcs, ami a <em>Költség-optimalizálás</em> tutorial mérési elveit sérti), **eszközhívási hiba-arány** emelkedése (lásd a <em>Multi-agent rendszerek</em> tutorial "80% alatti hűség" küszöbét), és **minőség-pontszám csökkenés** egy adott prompt-verziónál (ami a <em>Prompt-verziózás</em> tutorial A/B tesztelési logikájával köthető össze).
:::::

::::: callout label="A záró kapcsolat: az observability visszacsatolása a fejlesztésbe"
A legjobb rendszerek **zárt hurkot** alkotnak: a production-observability által talált hiba **automatikusan új eval-esetté** válik, amit a következő prompt-módosítás előtt lefuttatnak — ez köti össze ezt a cikket a <em>LLMOps</em> tutorial eval-pipeline-jával, mert a monitoring nem az utolsó lépés, hanem egy folyamatosan tápláló bemenet a minőség-biztosításba.
:::::

::::: callout label="Egy mondatban"
Az observability igazi értéke nem a "lássam, mi történt" — hanem a **zárt hurok**, ahol a production-ben talált probléma automatikusan visszakerül a fejlesztési és kiértékelési folyamatba, mielőtt megismétlődne.
:::::
::::::

:::::: section id=llm-observability-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0. rész"
LLM-monitoring (egyedi hívások) vs. agent-observability (multi-lépéses, oksági láncok) — a megkülönböztetés, ami eldönti, milyen eszköz kell
::::
:::: card label="1–2. rész"
Négy alapréteg (tracing, költség, minőség, verziózás) · a mérési overhead konkrét ára (0-5% a legjobbaknál, akár tízszeres különbség eszközök közt)
::::
:::: card label="3. rész"
Az eszköztár (Langfuse, LangSmith, Arize, Helicone) és konkrét ajánlás csapatméret szerint
::::
:::: card label="4. rész"
Drift-detektálás és riasztási minták — a záró hurok, ami visszaköti a production-hibát a fejlesztési folyamatba
::::
:::::

<p class="topic-tagline">Kapcsolódó: az <em>LLMOps</em> (az eval-pipeline, amivel az observability zárt hurkot alkot), a <em>Költség-optimalizálás</em> (a mérendő költség-metrikák), a <em>Multi-agent rendszerek</em> (az agent-specifikus hibamódok, amiket observability-vel észlelsz) és a <em>Prompt-verziózás</em> (a verzió-összekapcsolás a monitoringgal) tutorialok.</p>

<p class="topic-tagline" style="margin-top:12px;font-size:0.85em;opacity:0.75">* Az overhead-mérési adatok, a Galileo Luna-2 statisztikák és az eszköz-összehasonlítások 2026-os, publikus, hands-on tesztelt forrásokból származnak — lásd a 2. és 3. részt a kontextusért.</p>
::::::
