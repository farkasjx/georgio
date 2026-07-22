---
page: agentic-coding
title: Agentic kódolás — architektúra, csapatmunka, határok
sidebar_groups:
  - Elmélet
  - Skálázás
  - Csapatmunka
  - Mérés
  - Gyakorlat
  - Referencia
hero:
  eyebrow: "Agentic kódolás · Fejlesztői Tanulási Terv"
  title: "Agentic kódolás — <em>architektúra, csapatmunka, határok</em>"
  lead: "Nem \"jobb vibe coding\" — más architektúra. Itt a modell eszközökbe van bekötve, hurokban fut, és a kódot valaki a kész-definíció (definition of done) ellenében nézi át. Ez a cikk végigveszi, hogyan épül fel belülről egy kódoló ügynök, miért törik el egy 80%-os falnál nagy kódbázisokon, hogyan koordinálhatsz több ügynököt egyszerre, és mit mérnek (és vitatnak) ma a benchmarkok. Épít a <em>Vibe coding</em>, a <em>Reasoning</em> és az <em>MCP</em> tutorialokra."
  stats:
    - { val: "13", lbl: "Szakasz" }
    - { val: "5", lbl: "Orkesztrálási minta" }
    - { val: "80%", lbl: "a \"fal\", ahol törik" }
    - { val: "2026", lbl: "az év, amikor elterjedt" }
footer:
  left: "AI Hub · Agentic kódolás"
  right: "Agentic kódolás · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#agentic-coding-0"><div class="tc-num">0. rész</div><div class="tc-name">Mi ez, és mi nem</div><div class="tc-desc">Éles elhatárolás a vibe codingtól — nem tónus, hanem architektúra.</div></a>
  <a class="toc-card" href="#agentic-coding-1"><div class="tc-num">1. rész</div><div class="tc-name">Az agentic loop belülről</div><div class="tc-desc">Harness, tool use, terv → végrehajtás → ellenőrzés → iteráció.</div></a>
  <a class="toc-card" href="#agentic-coding-2"><div class="tc-num">2. rész</div><div class="tc-name">A 80%-os fal</div><div class="tc-desc">Miért törik el egy ügynök pont ott, ahol a legjobban kellene.</div></a>
  <a class="toc-card" href="#agentic-coding-3"><div class="tc-num">3. rész</div><div class="tc-name">Context engineering nagy kódra</div><div class="tc-desc">Subagentek, LSP, hookok — hét stratégia egy 300 000 soros repóhoz.</div></a>
  <a class="toc-card" href="#agentic-coding-4"><div class="tc-num">4. rész</div><div class="tc-name">Config fájlok újra, más tétben</div><div class="tc-desc">"Ne a mai modellre építs" — a Claude Code tervezési elve.</div></a>
  <a class="toc-card" href="#agentic-coding-5"><div class="tc-num">5. rész</div><div class="tc-name">Öt orkesztrálási minta</div><div class="tc-desc">Solo-tól a Swarmig — melyiket mikor válaszd.</div></a>
  <a class="toc-card" href="#agentic-coding-6"><div class="tc-num">6. rész</div><div class="tc-name">A git worktree trükk</div><div class="tc-desc">Hogyan dolgozhat 5 ügynök egy repón anélkül, hogy eltiporja egymást.</div></a>
  <a class="toc-card" href="#agentic-coding-7"><div class="tc-num">7. rész</div><div class="tc-name">Mérés: SWE-bench és a viták</div><div class="tc-desc">80%+ pontszám — de mit mér ez valójában, és miért deprecálták.</div></a>
  <a class="toc-card" href="#agentic-coding-8"><div class="tc-num">8. rész</div><div class="tc-name">A szerepváltás</div><div class="tc-desc">Alkotóból kurátor — mit jelent ez a napi munkában.</div></a>
  <a class="toc-card" href="#agentic-coding-9"><div class="tc-num">9. rész</div><div class="tc-name">Kritikák és kockázatok</div><div class="tc-desc">A 19%-kal lassabb mérés, és amit ez elárul.</div></a>
  <a class="toc-card" href="#agentic-coding-10"><div class="tc-num">10. rész</div><div class="tc-name">Hogyan kezdj neki</div><div class="tc-desc">Gyakorlati checklist egyetlen ügynöktől a csapatig.</div></a>
</div>
::::::

:::::: section id=agentic-coding-0 num="00" heading="0. rész — Mi ez, és mi nem: éles elhatárolás a vibe codingtól" nav="Mi ez, és mi nem" group="Elmélet"

<p class="topic-tagline">Cél: értsd a pontos, technikai különbséget — ne csak azt, hogy "ez a komolyabb verzió".</p>

### A definíció, ami mögé érdemes állni

::::: callout label="A legpontosabb megkülönböztetés, amit találni lehet"
A vibe coding egy **testtartás**: megbízol a modellben, nem olvasod el a diffet, addig promptolsz, amíg működik. Az agentic kódolás egy **architektúra**: a modell eszközökbe van bekötve, hurokban fut, és a kódot valaki egy **kész-definíció** (definition of done) ellenében nézi át. A különbség az, hogy **ki felel a helyességért**.
:::::

Ez a megkülönböztetés azért fontos, mert a két fogalmat a köznyelv gyakran összemossa — pedig ahogy a **Vibe coding tutorial 2. részében** is olvashattad, Karpathy maga is pontosan emiatt váltott terminológiát 2026 februárjában. Simon Willison megfogalmazásában az agentic engineering azt jelenti, hogy **professzionális mérnökök használnak kódoló ügynököket a meglévő szakértelmük felerősítésére** — nem azt, hogy az emberi ítélőképességet "vibe"-okkal helyettesítik.

### Mikor melyik éri meg

::::: compare
::: good label="✓ Vibe coding megéri"
Amikor a hiba ára alacsony: hétvégi prototípus, demó, egyszeri szkript. Itt a "nem olvasom el a diffet" tudatos, elfogadható kockázat — lásd a <em>Vibe coding</em> tutorial 7. részét.
:::
::: bad label="✗ Agentic kódolás kell helyette"
Amikor a kód éles rendszerbe kerül, csapat nyúl hozzá, vagy a hiba ára magas. Itt a hurok minden lépését — terv, végrehajtás, ellenőrzés — valakinek (embernek vagy egy másik, erre szakosodott ellenőrzési lépésnek) jóvá kell hagynia.
:::
:::::

::::: callout label="Egy mondatban"
Ha azt kérdezed, "vibe-oljak vagy agentic-módban dolgozzak", rossz kérdést teszel fel — a helyes kérdés az, hogy **mekkora a hiba ára**, és ez alapján dől el, mennyi felülvizsgálatot építesz be a hurokba.
:::::
::::::

:::::: section id=agentic-coding-1 num="01" heading="1. rész — Az agentic loop belülről: mi történik egy promptod után" nav="Az agentic loop belülről" group="Elmélet"

<p class="topic-tagline">Cél: lásd pontosan, milyen lépések futnak le, amikor egy kódoló ügynöknek adsz egy feladatot.</p>

### A harness és a modell szétválasztása

Egy kódoló ügynök két részből áll, amiket érdemes külön kezelni: a **modell** (az LLM, ami a reasoninget végzi — lásd a <em>Reasoning</em> tutorialt) és a **harness** (a köré épített keretrendszer, ami a kontextust, az eszközhívásokat, a jogosultságokat és az állapotot kezeli). A modell "gondolkodik", a harness biztosítja neki a kereteket, amiken belül ez a gondolkodás ténylegesen kódot ír és futtat.

::::: stack-grid
:::: card label="1 · Feladat beolvasása"
Az ügynök megkapja a feladatot természetes nyelven (pl. egy Jira-ticket vagy egy közvetlen prompt formájában).
::::
:::: card label="2 · Terv (plan)"
A modell — reasoning közben — feltérképezi, mely fájlokat kell megnéznie, milyen sorrendben, milyen kész-definíció mellett tekinthető késznek a munka.
::::
:::: card label="3 · Felderítés eszközökkel"
Az ügynök ténylegesen **eszközöket hív**: fájlokat olvas, grep-szerű keresést futtat, néha az MCP-n keresztül külső rendszereket kérdez le (lásd az <em>MCP</em> tutorialt).
::::
:::: card label="4 · Kódírás"
Megírja vagy módosítja a kódot — jellemzően kis, célzott diffekben, nem teljes fájlok újraírásával.
::::
:::: card label="5 · Végrehajtás és ellenőrzés"
Lefuttatja a teszteket, a lintereket, a build-et — ez a **valós** visszajelzés, nem a modell "érzése" a kód helyességéről.
::::
:::: card label="6 · Iteráció"
Hiba esetén újra reasoning-ol a hibaüzenet alapján, javít, újra futtat — amíg a kész-definíció nem teljesül, vagy amíg emberi döntés nem szükséges.
::::
:::::

::::: callout label="A kulcsfelismerés"
Ez **ugyanaz a hurok**, amit a <em>Reasoning</em> tutorial 3–4. részében az Excel-elemzésnél és a kódolásnál láttál — az agentic kódolás nem egy új mechanizmus, hanem ennek a huroknak a **professzionálisan megtervezett, ellenőrzött, gyakran több-ügynökös** változata.
:::::
::::::

:::::: section id=agentic-coding-2 num="02" heading="2. rész — A 80%-os fal: miért törik el, amikor a legjobban kellene" nav="A 80%-os fal" group="Skálázás"

<p class="topic-tagline">Cél: értsd meg, hogy ez nem "a modell hülye" probléma — hanem infrastruktúra-probléma.</p>

### A jelenség

Nagy, valós szervezeteknél visszatérő minta: az agentic kódolás kis, izolált feladatokon **kiválóan** működik, de amint a feladat **több szolgáltatást, repót vagy réteget** érint egy nagy monorepóban, az ügynökök megbízhatósága élesen leesik — ezt hívják a gyakorlatban **"80%-os falnak"**.

::::: callout danger label="Ez nem modell-limitáció"
A 80%-os fal **három konkrét okra** vezethető vissza: **keresztmetsző kódváltozások** (bármi, ami több szolgáltatást, repót vagy réteget érint egyszerre) · **rejtett technikai adósság** (finom felülírások, egyedi dekorátorok, testvér-mikroszolgáltatások, amiket az ügynök sosem nyit meg) · **monorepo vakfoltok** (ha a keresés csak az aktuális munkakönyvtárra korlátozódik, a fa többi része láthatatlan marad). Ha a csapatod ebbe fut bele, és a modellt hibáztatja érte, **rossz rétegben keresed a hibát**.
:::::

### A számok mögötte

Egy Microsoft FastContext-kutatás GPT-5.4-agent-trajektóriákat elemezve azt találta, hogy az **olvasási és keresési műveletek a tool-use fordulatok 56,2%-át** teszik ki, és a fő ügynök teljes tokenfogyasztásának **46,5%-át** emésztik fel — vagyis a tokenköltségvetés majdnem fele **navigációra** megy el, nem a tényleges munkára. Egy másik, konkrétabb szám: a naiv "dobj be minden releváns fájlt a promptba" módszer kb. **2500 fájl** fölött láthatóan romlik — a legtöbb komoly monorepo évekkel ezelőtt átlépte ezt a határt.

::::: callout label="Egy mondatban"
A 80%-os fal nem azt jelenti, hogy a modell "nem elég okos" — azt jelenti, hogy **a kontextus-infrastruktúra** (hogyan találja meg, mi releváns egy hatalmas kódbázisban) nincs felkészítve a feladatra; ez pontosan az, amit a következő rész old meg.
:::::
::::::

:::::: section id=agentic-coding-3 num="03" heading="3. rész — Context engineering nagy kódbázisokra: hét stratégia" nav="Context engineering nagy kódra" group="Skálázás"

<p class="topic-tagline">Cél: ismerd meg a konkrét technikákat, amikkel a 2. részben leírt falat át lehet törni.</p>

### A hét stratégia egy pillantásra

Anthropic egy strukturált keretrendszert publikált arra, hogyan navigáljanak megbízhatóan a Claude-alapú ügynökök nagy, komplex kódbázisokban — ez hét, együtt alkalmazott stratégiából áll:

::::: stack-grid
:::: card label="1 · Global rules"
A projekt-szintű szabályfájl (`CLAUDE.md`, `AGENTS.md`) — lásd a <em>Vibe coding</em> tutorial 8. részét és az <em>AI Config fájlok</em> tutorialt.
::::
:::: card label="2 · Hooks"
Automatikusan lefutó ellenőrzések bizonyos események után (pl. minden fájlmentés után lint fut).
::::
:::: card label="3 · Skills"
Igény szerint betöltődő, részletes tudás egy adott altémáról — nem terheli a kontextust, amíg nem releváns.
::::
:::: card label="4 · LSP-integráció"
A Language Server Protocol segítségével az ügynök **pontosan** tudja, hol van egy függvény definíciója vagy hívási helye — nem kell találgatnia szövegkeresésből.
::::
:::: card label="5 · MCP"
Szabványos hozzáférés külső rendszerekhez (issue tracker, dokumentáció) — lásd az <em>MCP</em> tutorialt.
::::
:::: card label="6 · Subagentek"
Egy elkülönített, kisebb kontextusú "kereső" ügynök, ami helyette végzi a felderítést — ez a következő alfejezet témája.
::::
:::: card label="7 · Plugins"
Bővíthető, újrafelhasználható modulok, amik konkrét, ismétlődő munkafolyamatokat kapszulázhatnak be.
::::
:::::

### A subagent-architektúra: hogyan spórolsz meg tokent kereséssel

A 2. részben látott "56,2%-a a tool-use-nak keresés" probléma megoldására egyre elterjedtebb minta, hogy a keresést **külön, saját kontextusablakkal rendelkező subagent** végzi — ez csak a releváns fájlrészleteket adja vissza a fő (megoldó) ügynöknek, ami így sosem látja azokat a fájlokat, amiket a kereső subagent elutasított.

::::: callout label="Konkrét, mért hatás"
Egy RL-tanított keresési subagent (a kutatásban "WarpGrep v2" néven szerepel), ami akár 8 párhuzamos eszközhívást is indíthat egy körben, és csak a releváns fájlrészleteket adja tovább: Opus 4.6-tal kombinálva **15,6%-kal csökkentette a költséget és 28%-kal az időt** — mert a drágább, megoldó modell kevesebb tokent költ keresésre, és többet a tényleges kódírásra.
:::::

::::: callout warning label="Amit egy kutatás cáfol — érdemes tudni"
Egy 2026-os elemzés (Addy Osmani) szerint egy **ember által kurált** `AGENTS.md` minden hosszúságban többet ér, mint egy gépi úton generált — a kutatás szerint az AI által írt szabályok **nem hoznak mérhető javulást**, sőt, enyhén ronthatják is a sikerességi arányt. A config fájl megírása tehát nem bízható rá magára az agentre.
:::::
::::::

:::::: section id=agentic-coding-4 num="04" heading="4. rész — Config fájlok újra, de más tétben: \"ne a mai modellre építs\"" nav="Config fájlok újra" group="Skálázás"

<p class="topic-tagline">Cél: lásd, hogyan válik a config fájl nem csak kényelmi, hanem architektúra-tervezési kérdéssé.</p>

### Egy tervezési elv, ami messzebb visz, mint gondolnád

A Claude Code egyik alkotója, Boris Cherny egy 2025-ös interjúban fogalmazta meg azt az elvet, ami az agentic kódoló eszközök tervezésének egyik vezérgondolatává vált:

::::: callout label="Cherny elve"
*"Ne a mai modellre építs. Építs a 6 hónap múlva várható modellre."* A termék legyen úgy megtervezve, hogy **a kódmódosítás nélkül** javuljon, amint a mögötte lévő modell okosabb lesz — ez pontosan az ellentéte a hagyományos szoftverfejlesztésnek, ahol a funkciókat a jelenlegi képességekhez kézzel igazítják.
:::::

Ez a gyakorlatban azt jelenti, hogy egy jól megtervezett agentic harness (lásd az 1. részt) nem a mai modell konkrét gyengeségeire van "foltozva", hanem olyan **általános kereteket** ad (eszközök, ellenőrzési pontok, szabályfájlok), amik egy erősebb modellel automatikusan jobb eredményt hoznak — kód-átírás nélkül.

### Miért pont ez teszi "architektúrává" és nem csak "trükkök gyűjteményévé"

::::: callout label="Egy mondatban"
A <em>Vibe coding</em> tutorial 8. részében látott config fájlok itt **magasabb tétet** kapnak: nem csak azt kell eldöntened, mit írj bele, hanem azt is, hogy a szabályfájl és a köré épített harness **túlélje-e a következő modellgenerációt** — ez a különbség egy hobbiprojekt és egy hosszú távra tervezett agentic workflow között.
:::::
::::::

:::::: section id=agentic-coding-5 num="05" heading="5. rész — Öt orkesztrálási minta: Solo-tól a Swarmig" nav="Öt orkesztrálási minta" group="Csapatmunka"

<p class="topic-tagline">Cél: ismerd meg a bevett mintákat, amikkel eldöntheted, mennyi ügynököt és hogyan koordinálj.</p>

### A minta-választás nem esztétikai kérdés

Egy 2026-os, iparági keretrendszer öt, egymásra épülő mintát különböztet meg — a választás a csapatméret, a kódbázis szerkezete és a cél függvénye:

| Minta | Mikor éri meg | Tipikus eszköz |
|---|---|---|
| **Solo Agent** | Egyetlen fejlesztő, egy feladat egyszerre — a legtöbb napi munka. | Claude Code / Cursor egyetlen munkamenetben |
| **Parallel Workers** (2–3 ügynök) | Néhány független, egymást nem érintő feladat egyszerre. | Claude Code subagentekkel, vagy könnyű orkesztráló |
| **Pipeline** | Egymásra épülő lépések (pl. terv → implementáció → teszt), ahol minden fázisnak van egy felelőse. | Deklaratív workflow-eszközök (YAML-alapú multi-agent leírás) |
| **Hub-and-Spoke** | Egy orkesztráló ügynök tervez és oszt szét, "specialisták" hajtják végre. | Egy Opus-szintű tervező + Sonnet-szintű specialisták |
| **Swarm** | Nagy, jól elkülöníthető munka, sok párhuzamos ág, automatizált merge. | Dedikált swarm-eszközök, git worktree-alapú izolációval |

::::: callout label="Egy konkrét Hub-and-Spoke példa"
Egy gyakorlatban dokumentált beállítás: az **orkesztráló** (jellemzően egy erősebb modell) nem ír kódot — csak tervez, kioszt és felülvizsgál, mint egy tech lead egy sprint-tervezésen. A **specialisták** (gyengébb, olcsóbb modellek) külön git worktree-ben dolgoznak — egy a frontenden, egy a backenden, egy a teszteken —, párhuzamosan, egymást nem zavarva.
:::::

::::: callout warning label="Fontos arányérzék"
A legtöbb fejlesztő 2026-ban **három szinten** dolgozik egyszerre, nem választ egyet: interaktív munka egyetlen ügynökkel napközben, párhuzamos "sprint"-szerű futtatás nagyobb tételekhez, és éjszakai, felügyelet nélküli futtatás a hátralék (backlog) leépítésére. Nem kell azonnal Swarm-szintre ugranod — a legtöbb feladat Solo vagy Parallel Workers szinten marad.
:::::
::::::

:::::: section id=agentic-coding-6 num="06" heading="6. rész — A git worktree trükk: hogyan ne tiporja el egymást 5 ügynök" nav="A git worktree trükk" group="Csapatmunka"

<p class="topic-tagline">Cél: értsd a technikai alapot, ami az 5. részben látott mintákat egyáltalán lehetővé teszi.</p>

### Az alapprobléma

Ha három ügynök **egyszerre** módosítja ugyanazt a munkakönyvtárat, az garantáltan merge-konfliktusokhoz, versenyhelyzetekhez és korrupt állapothoz vezet — pontosan úgy, ahogy három ember is összezavarodna, ha egyszerre írna ugyanabba a fájlba.

::::: callout label="A megoldás: git worktree"
Minden ügynök saját **git worktree**-t kap — ez egy különálló checkout ugyanabból a repóból, saját könyvtárral és branch-csel, de a git-történettel megosztva. Az ügynökök így **párhuzamosan, egymást nem zavarva** írhatnak kódot; az eredmények **normál git-műveletekkel** (merge) kerülnek vissza egyetlen ágba.
:::::

### Amire figyelj, mielőtt sok ügynökkel próbálkozol

::::: compare
::: bad label="✗ Amit sokan alábecsülnek: lemezhely"
Egy git worktree egy **teljes** munkamásolat. Nagy repóknál (10 GB+) 20 worktree könnyen 200 GB+ lemezhelyet emészthet fel — sekély klónozás vagy sparse checkout nélkül ez gyorsan probléma lesz.
:::
::: good label="✓ A merge-sor kezelése"
Minél több ügynök dolgozik párhuzamosan, annál hosszabb lesz a szekvenciális merge-fázis a végén. Nagyobb (20+) ügynökszámnál az automatizált merge-konfliktus-feloldás gyakorlatilag kötelezővé válik, nem luxus.
:::
:::::

::::: callout warning label="Amit a worktree ÖNMAGÁBAN nem old meg"
A git worktree **csak** munkaterület-izolációt ad — nem old meg feladat-dekompozíciót, függőség-követést, szemantikai konfliktusokat vagy azt, hogy melyik ügynök melyik módosítását tartsd meg integráció után. Előfordulhat, hogy két ügynök egymással **inkompatibilis feltételezések** mentén módosít összefüggő fájlokat — ez a hiba gyakran csak **integráció után** derül ki, nem korábban.
:::::

::::: callout label="Egy mondatban"
A git worktree a **mechanikai** alapot adja a párhuzamos munkához — de az 5. részben látott orkesztrálási minták (különösen a Hub-and-Spoke tervező-szerepe) azok, amik ténylegesen kezelik a feladatbontást és a szemantikai konfliktusokat, amiket a worktree önmagában nem lát.
:::::
::::::

:::::: section id=agentic-coding-7 num="07" heading="7. rész — Mérés: SWE-bench és a benchmark-viták" nav="SWE-bench és a viták" group="Mérés"

<p class="topic-tagline">Cél: tudd értelmezni a gyakran idézett számokat — és azt is, mikor nem szabad megbízni bennük.</p>

### Mit mér valójában a SWE-bench

A **SWE-bench** (és a belőle származó variánsok, mint a Verified alhalmaz) valós GitHub issue-kat és az azokhoz tartozó, emberi fejlesztő által írt javításokat gyűjt össze — az ügynöknek az issue leírásából és a teljes repó kódjából kell előállítania egy patch-et, amit a **projekt saját tesztkészlete** ellenőriz.

::::: stack-grid
:::: card label="A csúcs ma"
2026 áprilisában a vezető modellek **80% fölötti** pontszámot értek el a SWE-bench Verified alhalmazon — ami azt jelenti, hogy a valós GitHub issue-k kb. 4-ből 5-ét önállóan meg tudják oldani.
::::
:::: card label="De: kontaminációs aggály"
2026 februárjában az OpenAI publikált egy elemzést arról, hogy a SWE-bench Verified **már nem méri megbízhatóan** a frontier-szintű haladást, és leállította a pontszámok jelentését rá — a probléma az, hogy a modellek a nyilvános Python-repókból származó feladatokat **részben megjegyezhették** a tanítás során, nem tisztán következtetéssel oldják meg őket.
::::
:::: card label="Az utód: SWE-bench Pro"
Nehezebb, több fájlt érintő feladatokkal, kontaminációnak jobban ellenálló forrásokkal (copyleft és zárt repókból) — itt a vezető modellek **kb. 60–69%-ot** érnek el, alacsonyabbat, mint a Verified-en.
::::
:::::

### Ahol a legjobb modellek is elakadnak

::::: callout danger label="Konkrét, kijózanító adat"
Egy 100 000 sor fölötti kódbázisokat vizsgáló benchmark (RepoMod-Bench) szerint a legtöbb ilyen méretű projekten a legjobb ügynökök is **20% alatti** sikerességi arányt érnek el — egy 162 000 soros projekten az összes vizsgált ügynök **0%-ot**. A legjobb teljesítmény egy 211 000 soros projekten is csak **19,5%** volt. Ez összhangban van a 2. részben látott "80%-os fallal": a probléma nem a kontextusablakba való beférés, hanem a **koherens architekturális megértés** fenntartása több ezer, egymástól függő fájlon át.
:::::

::::: callout label="Egy mondatban"
A gyakran idézett "80%+ pontszám" igaz — de **csak** egy adott, viszonylag kis, jól körülhatárolt feladattípusra (egy Python-repó egyetlen issue-ja); amint a méret vagy a nyelvi/architekturális komplexitás nő, a valós sikerességi arány drámaian visszaesik, és pont ez az a rés, amit a 3–6. részben tárgyalt technikák próbálnak szűkíteni.
:::::
::::::

:::::: section id=agentic-coding-8 num="08" heading="8. rész — A szerepváltás: alkotóból kurátor" nav="A szerepváltás" group="Mérés"

<p class="topic-tagline">Cél: értsd meg, mit jelent ez a napi munkádra nézve, ne csak elvont trendként.</p>

### "Nem kódolsz többé, felügyelsz"

Egy visszatérő megfogalmazás a gyakorló fejlesztők közt: az agentic kódolásban a mérnök szerepe a **közvetlen, sorról sorra történő írásból** a **rendszertervezés, a célok pontos meghatározása és a végeredmény szigorú ellenőrzése** felé tolódik — a hangsúly az alkotásról a **kurátori** szerepre kerül át.

::::: callout label="Egy konkrét, dokumentált munkafolyamat"
David Heinemeier Hansson (a Ruby on Rails megalkotója) a 37signals-nál dokumentáltan **két modellt futtat párhuzamosan**: egy gyors modellt a gyors iterációkhoz, és egy erősebbet a komplex reasoninghoz, miközben a diffeket egy szerkesztőben nézi át, ahogy megérkeznek. Egy alkalommal, 250 függőben lévő pull request előtt egy kiadás előtt, **100-at dolgozott fel 90 perc alatt** úgy, hogy az ügynököt egyenként a PR-ekre irányította — ez a munka kézzel napokig tartott volna.
:::::

### Mit jelent ez konkrétan a napi munkafolyamatban

::::: stack-grid
:::: card label="Amit átadsz"
A mechanikus, ismétlődő munkát: dependency-frissítéseket, sérülékenység-patcheléseket, strukturális refaktorokat, amik a legtöbb csapatnál gyorsabban halmozódnak, mint ahogy egyetlen fejlesztő kezelni tudná.
::::
:::: card label="Amit megtartasz"
A célok pontos meghatározását (mi számít "késznek"), az architekturális döntéseket, és — kritikusan — **azt az ellenőrzést**, amit a 2. és 7. rész szerint egy ügynök önmagában nem tud garantálni nagy, komplex rendszereken.
::::
:::::

::::: callout label="Egy mondatban"
A "kurátor" szerep nem azt jelenti, hogy kevesebb szakértelem kell — épp ellenkezőleg: **több** kell ahhoz, hogy hatékonyan tudd megítélni, mikor jó egy ügynök kimenete, és mikor kell közbeavatkoznod — ez a különbség a köztes rész és a hurok, amit itt a nyolcadik alkalommal látunk, csak most emberi felügyelet felől nézve.
:::::
::::::

:::::: section id=agentic-coding-9 num="09" heading="9. rész — Kritikák és kockázatok: amit a lelkesedés eltakarhat" nav="Kritikák és kockázatok" group="Mérés"

<p class="topic-tagline">Cél: ne csak a sikertörténeteket lásd — az agentic kódolásnak is vannak dokumentált, kellemetlen adatai.</p>

### A METR-mérés, ami sokakat meglepett

::::: callout danger label="Amikor a szubjektív élmény és a mért valóság szétválik"
A METR kutatószervezet 2025 júliusában publikált mérése azt találta, hogy a tapasztalt fejlesztők **20%-kal gyorsabbnak hitték magukat** AI-eszközökkel — az objektív mérés szerint viszont valójában **19%-kal lassabbak** voltak. Az ok elsősorban az volt, hogy időt vesztettek a generált kód javításával és a kódbázis-elvárásokkal való összeegyeztetésével.
:::::

Ez a mérés jó ellensúly a cikk korábbi részeiben látott, lenyűgöző sikertörténetekhez (a DHH-sztori, a subagent-optimalizálás számai) képest: az agentic kódolás **nem automatikusan** gyorsít — csak akkor, ha a 3–6. részben tárgyalt kontextus-infrastruktúra és orkesztrálási fegyelem is a helyén van.

### A "termékdöntés-megfelelés" probléma

Egy kontrollált kutatás (Brief, 2026) azt mérte, mennyire tartja be egy kódoló ügynök a **csapat korábbi, nem a kódban látható** termék- és tervezési döntéseit. Az eredmény éles kontrasztot mutat:

::::: compare
::: bad label="✗ Csak kódbázis-hozzáférés"
Az alap beállítás (kódbázis-hozzáférés, extra kontextus nélkül) **100%-ban** betartotta azokat a döntéseket, amik a kódban láthatók voltak — de csak **0–33%-ban** azokat, amik kizárólag a csapat fejében vagy régi dokumentumokban éltek.
:::
::: good label="✓ Termék-kontextussal kiegészítve"
Egy termék-kontextus-visszakereső réteggel kiegészítve (specifikáció-generálás, build közbeni konzultáció, korábbi döntések visszakeresése) a megfelelés **95%-ra** nőtt — 49 százalékponttal jobb, ugyanazon a promptokon, ugyanazon a repón.
:::
:::::

::::: callout label="Egy mondatban"
Egy kódoló ügynök tökéletesen betartja, amit **lát** — de vakon van azokra a döntésekre, amik sosem kerültek be a kódba vagy egy szabályfájlba; ez pontosan azt a kockázatot erősíti meg, amit a 4. részben Cherny elve és a 3. rész "ember kurálja a szabályfájlt" figyelmeztetése is jelez.
:::::
::::::

:::::: section id=agentic-coding-10 num="10" heading="10. rész — Hogyan kezdj neki: gyakorlati checklist" nav="Hogyan kezdj neki" group="Gyakorlat"

<p class="topic-tagline">Cél: konkrét, sorban követhető lépéseket adj — egyetlen ügynöktől a csapat-szintű orkesztrálásig.</p>

### Fokozatosan haladj — ne ugorj Swarm-szintre elsőre

::::: stack-grid
:::: card label="1 · Kezdd Solo-val"
Egyetlen ügynök, egyetlen feladat, mindig átnézed a diffet. Ez az alap, amin minden más épül — ha itt nem bízol meg a folyamatban, ne bővíts tovább.
::::
:::: card label="2 · Írj kurált szabályfájlt"
Ember írja, nem az ügynök generálja (lásd 3. rész) — a legfontosabb build-parancsok, konvenciók, és a "amit egy új fejlesztőnek elmondanál" típusú tudás.
::::
:::: card label="3 · Vezess be kész-definíciót"
Minden feladathoz explicit, tesztelhető kritérium ("a teszt zöld", "a build hibamentes") — ez az, ami a 0. részben említett felelősség-kérdést kezelhetővé teszi.
::::
:::: card label="4 · Próbálj ki Parallel Workers-t"
Két-három, egymást nem érintő feladatot futtass egyszerre — ez a legalacsonyabb kockázatú lépés a csapat-szintű orkesztrálás felé.
::::
:::: card label="5 · Csak ezután Hub-and-Spoke vagy Swarm"
Amikor a csapatod már magabiztos a fentiekben, és a feladat mérete indokolja — ekkor térj rá a git worktree-alapú párhuzamosításra (6. rész), tudatosan kezelve a lemezhely- és merge-kockázatokat.
::::
:::::

::::: callout warning label="Mielőtt belevágnál: mérd is"
Ne csak a szubjektív élményre hagyatkozz ("gyorsabbnak érzem magam") — a 9. részben látott METR-mérés pont ezt cáfolta meg. Ha teheted, mérd az **objektív** átfutási időt és a hibaarányt is, nem csak a benyomást.
:::::
::::::

:::::: section id=agentic-coding-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0–1. rész"
Az agentic kódolás **architektúra**, nem testtartás — a kész-definíció ellenében ellenőrzött hurok: terv → felderítés → kódírás → végrehajtás → iteráció
::::
:::: card label="2–4. rész"
A 80%-os fal (kontextus-infrastruktúra probléma, nem modell-limitáció) · a hét stratégia nagy kódbázisokhoz (subagentek, LSP, hookok) · a "ne a mai modellre építs" tervezési elv
::::
:::: card label="5–6. rész"
Öt orkesztrálási minta (Solo, Parallel Workers, Pipeline, Hub-and-Spoke, Swarm) · a git worktree mint technikai alap, és amit önmagában nem old meg
::::
:::: card label="7. rész"
A SWE-bench 80%+-os pontszáma valós, de szűk feladattípusra vonatkozik — nagy kódbázisokon a legjobb ügynökök is 20% alá esnek
::::
:::: card label="8–9. rész"
A mérnöki szerep alkotóból kurátorrá válik · de a METR-mérés szerint ez nem automatikus gyorsulás — a termékdöntés-megfelelés kutatás pedig megmutatja, hol vak az ügynök
::::
:::: card label="10. rész"
Gyakorlati sorrend: Solo → kurált szabályfájl → kész-definíció → Parallel Workers → csak ezután Hub-and-Spoke vagy Swarm
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>Vibe coding</em> (honnan indult a fogalom, és mikor elég a könnyebb testtartás), a <em>Reasoning</em> (mi történik a hurok belsejében) és az <em>MCP</em> (hogyan fér hozzá egy ügynök külső eszközökhöz és adatokhoz) tutorialok.</p>
::::::
