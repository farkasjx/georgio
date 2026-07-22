---
page: vibecoding
title: Vibe coding — az ötlet, a hurok és a határai
sidebar_groups:
  - Eredet
  - A gyakorlat
  - Hatások
  - Kockázatok
  - Gyakorlat
  - Referencia
hero:
  eyebrow: "Vibe coding · Fejlesztői Tanulási Terv"
  title: "Vibe coding — <em>az ötlet, a hurok és a határai</em>"
  lead: "2025 februárjában Karpathy egy tweetben nevet adott valaminek, amit már sokan csináltak: leírod, mit akarsz, elfogadod, amit a modell ír, és a hibaüzenetet visszamásolod, amíg működik. Egy év alatt szótári címszó, vállalati rémálom és — magának Karpathynak a szavaival — saját maga temetése lett belőle. Ez a cikk végigveszi, mi történt valójában, mit mutatnak az adatok, és hol húzódik a határ afölött, hogy ez a módszer még működik."
  stats:
    - { val: "2025.02", lbl: "Karpathy-tweet" }
    - { val: "12", lbl: "Szakasz" }
    - { val: "7", lbl: "Biztonsági prompt" }
    - { val: "2026.02", lbl: "\"agentic engineering\"" }
footer:
  left: "AI Hub · Vibe coding"
  right: "Vibe coding · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#vibecoding-0"><div class="tc-num">0. rész</div><div class="tc-name">Eredet</div><div class="tc-desc">Karpathy tweetje, a "See stuff, say stuff" idézet, és ahogy elszabadult.</div></a>
  <a class="toc-card" href="#vibecoding-1"><div class="tc-num">1. rész</div><div class="tc-name">Mi is ez valójában?</div><div class="tc-desc">A hurok, a szintek, és miért nem egyenlő az "AI-val segített kódolással".</div></a>
  <a class="toc-card" href="#vibecoding-2"><div class="tc-num">2. rész</div><div class="tc-name">A fordulat: agentic engineering</div><div class="tc-desc">2026 februárjában Karpathy saját maga temette el a fogalmat.</div></a>
  <a class="toc-card" href="#vibecoding-3"><div class="tc-num">3. rész</div><div class="tc-name">Hatás a fejlesztőkre</div><div class="tc-desc">Ki nyer, ki veszít — és miért pont a szenioroknak ér a legtöbbet.</div></a>
  <a class="toc-card" href="#vibecoding-4"><div class="tc-num">4. rész</div><div class="tc-name">Hatás a cégekre</div><div class="tc-desc">Robbanásszerű adopció, kormányzási szakadék, konkrét incidensek.</div></a>
  <a class="toc-card" href="#vibecoding-5"><div class="tc-num">5. rész</div><div class="tc-name">Hol a határa?</div><div class="tc-desc">A kontextusablak fala — mekkora projektig működik jól.</div></a>
  <a class="toc-card" href="#vibecoding-6"><div class="tc-num">6. rész</div><div class="tc-name">Hogyan csináld jól</div><div class="tc-desc">Spec-driven development, EARS jelölés, a gyakorlati szintézis.</div></a>
  <a class="toc-card" href="#vibecoding-7"><div class="tc-num">7. rész</div><div class="tc-name">Milyen szoftverre való</div><div class="tc-desc">Mikor jó ötlet, és mikor kockázatos vállalás.</div></a>
  <a class="toc-card" href="#vibecoding-8"><div class="tc-num">8. rész</div><div class="tc-name">Config fájlok kapcsolata</div><div class="tc-desc">AGENTS.md, CLAUDE.md — a vibe coding "memóriája".</div></a>
  <a class="toc-card" href="#vibecoding-9"><div class="tc-num">9. rész</div><div class="tc-name">Melyik eszközt mikor</div><div class="tc-desc">Cursor, Replit, Lovable, Claude Code — döntési tábla.</div></a>
  <a class="toc-card" href="#vibecoding-10"><div class="tc-num">10. rész</div><div class="tc-name">Biztonsági promptok</div><div class="tc-desc">Hét, azonnal bemásolható ellenőrzés ship előtt.</div></a>
  <a class="toc-card" href="#vibecoding-11"><div class="tc-num">11. rész</div><div class="tc-name">Egy teljes példa</div><div class="tc-desc">Az összes technika egyetlen munkamenetben, végigvíve.</div></a>
</div>
::::::

:::::: section id=vibecoding-0 num="00" heading="0. rész — Eredet: egy tweet, ami elszabadult" nav="Eredet" group="Eredet"

<p class="topic-tagline">Cél: tudd pontosan, mit mondott Karpathy — és mit csináltak ebből mások.</p>

### A tweet

2025 februárjában, pontosabban február 2-án, Andrej Karpathy — az OpenAI egyik alapítója, korábban a Tesla AI-vezetője — posztolt egy gondolatot X-en, amit ő maga "zuhany alatti ötletnek" nevezett utólag:

::::: callout label="Az eredeti idézet lényege"
Karpathy azt írta, hogy van egy új fajta kódolás, amit ő "vibe coding"-nak hív: teljesen ráhagyatkozol az érzésre, elfogadod, hogy a kód "létezik" valahol, de nem foglalkozol vele. A diffeket nem olvasod el, mindig "Accept All"-ot nyomsz. Amikor hibaüzenetet kapsz, kommentár nélkül bemásolod, és általában ez megoldja. A kód túlnő a szokásos megértésén — de ez nem is igazán kódolás: **látsz valamit, mondasz valamit, futtatsz valamit, és bemásolsz valamit — és többnyire működik.**
:::::

A poszt napok alatt eljutott a fejlesztői közösség minden szegletébe — r/programming, r/webdev, r/ExperiencedDevs, r/cscareerquestions —, majd hetek alatt a New York Times, az Ars Technica és a Guardian is írt róla. 2025 novemberében a Collins Dictionary az év szavának választotta.

### Amit sokan nem vettek észre

::::: compare
::: bad label="✗ Amit sokan gondoltak róla"
"A vibe coding egy általános szó bármilyen AI-val segített programozásra — tehát az is vibe coding, ha Copilot-tal kódot egészítesz ki, vagy Cursorban gondosan átnézed a generált diffet."
:::
::: good label="✓ Amit Karpathy ténylegesen leírt"
Egy **szűk, specifikus munkafolyamatot**: alacsony tétű, saját célra írt prototípusokhoz, ahol **tudatosan nem olvasod el a kódot**. Karpathy maga kiváló, tapasztalt programozó — nem azért csinálta ezt, mert nem tudott volna kódot írni, hanem mert szórakoztató volt gyorsan ötleteket kipróbálni.
:::
:::::

Ez a kettősség — a szűk eredeti definíció és a tág, "bármi AI-val" jelentés, amivé vált — az egyik legfontosabb forrása a vibe coding körüli félreértéseknek és vitáknak a mai napig.

::::: callout label="Egy mondatban"
A "vibe coding" eredetileg egy szűk, tudatosan felelőtlen munkamódot jelentett alacsony tétű prototípusokhoz — mire azonban a kifejezés minden AI-asszisztált fejlesztésre rátapadt, elvesztette ezt a pontosságát, és pont ez okozza a mai zavart a hasznosságáról és veszélyeiről szóló vitákban.
:::::
::::::

:::::: section id=vibecoding-1 num="01" heading="1. rész — Mi is ez valójában? A hurok és a szintek" nav="Mi is ez valójában?" group="A gyakorlat"

<p class="topic-tagline">Cél: értsd a tényleges munkafolyamatot, és hol húzódik a határ a "vibe coding" és az "AI-val segített fejlesztés" között.</p>

### A tipikus hurok

A gyakorlatban a vibe coding így néz ki egy Cursor, Replit Agent, Lovable vagy Claude Code típusú eszközben:

| # | Lépés | Mi történik |
|---|---|---|
| 1 | **Leírod a szándékot** | Természetes nyelven — sokszor hangalapon (pl. SuperWhisper-rel diktálva) — elmondod, mit szeretnél. |
| 2 | **A modell generál** | Az agent megírja (vagy módosítja) a kódot, gyakran több fájlban egyszerre. |
| 3 | **"Accept All"** | A diffeket nem nézed át sorról sorra — elfogadod az egészet. |
| 4 | **Futtatod** | Megnézed, működik-e a felületen, böngészőben, appban. |
| 5 | **Hibát másolsz vissza** | Ha hibaüzenet jön, kommentár nélkül bemásolod a chatbe. |
| 6 | **Ismétlés** | A hurok addig fut, amíg a felszínen működik. |

A kulcsmozzanat az **5. rész (Reasoning tutorial)** hurkjához képest az, hogy itt **te magad se nézed át**, mit csinált a modell — a reasoning tutorial hurkja ugyanígy néz ki, csak ott van emberi felülvizsgálat a végén.

### A hat szint

Mivel nincs hivatalos definíció, a gyakorlatban egy laza, informális skála alakult ki arra, mennyire "vibe" egy munkamód:

::::: stack-grid
:::: card label="0 · Nincs AI"
Minden sor kézzel, hagyományos módon.
::::
:::: card label="1 · Kódkiegészítés"
Autocomplete-szerű segítség (klasszikus Copilot-élmény) — a fejlesztő ír, az AI csak befejez.
::::
:::: card label="2 · Irányított generálás"
Konkrét, kis darabokat kérsz meg az AI-tól, és átnézed mindegyiket.
::::
:::: card label="3 · Agentic asszisztencia"
Az AI önállóan több fájlt módosít egy feladat mentén, de a diffeket átnézed commit előtt.
::::
:::: card label="4 · Vibe coding (szűk értelemben)"
Nem nézed át a diffeket, a hibaüzenetet visszamásolod, a cél a működő felszín.
::::
:::: card label="5 · Teljes autonómia"
Az agent tervez, ír, tesztel, deployol — emberi review gyakorlatilag nulla.
::::
:::::

::::: callout warning label="Fontos megkülönböztetés"
A **"vibe coding"** és az **"AI-val segített fejlesztés"** nem szinonimák. Az utóbbi egy tágabb kategória (1–3. szint is beletartozik), ahol a fejlesztő **érti és felülvizsgálja** a kódot. A vibe coding szűk értelemben a **4. szintet** jelenti — pont azt, ahol a felülvizsgálat tudatosan elmarad. A cikk további részei elsősorban erre a szűk, kockázatosabb gyakorlatra fókuszálnak, mert itt jelentkeznek a valódi problémák.
:::::
::::::

:::::: section id=vibecoding-2 num="02" heading="2. rész — A fordulat: amikor Karpathy eltemette a saját szavát" nav="A fordulat" group="A gyakorlat"

<p class="topic-tagline">Cél: értsd meg a 2026-os legfontosabb fejleményt — ez gyakran kimarad a hazai beszámolókból.</p>

### Egy évvel később

2026 februárjában, pontosan a tweet első évfordulóján, Karpathy egy visszatekintő szálban lényegében **eltemette a saját maga alkotta kifejezést**. Az általa javasolt utód: **"agentic engineering"**.

::::: callout label="Karpathy saját megfogalmazása"
Az "agentic", mert az új alapértelmezett az, hogy az esetek 99%-ában nem te írod közvetlenül a kódot — hanem **ügynököket irányítasz**, akik ezt teszik, és felügyeleti szerepet töltesz be. Az "engineering", mert hangsúlyozza: ennek van **művészete, tudománya és szakértelme** — olyasmi, amiben tanulással fejlődni lehet.
:::::

Fontos árnyalás: Karpathy nem azt mondta, hogy a vibe coding rossz volt — inkább **lefokozta**, nem eltörölte. Saját szavaival: a vibe coding "megemeli a padlót" (bárki tud vele gyorsan valamit összedobni), az agentic engineering pedig "kiterjeszti a plafont" — ez utóbbi a hibázó ügynökök koordinálásának professzionális fegyelme, miközben megőrzöd a helyességet, a biztonságot, az ízlést és a karbantarthatóságot.

### Miért most jött ez a váltás

::::: stack-grid
:::: card label="A modellek ugrásszerűen javultak"
Karpathy szavaival: "a programozás többet változott az elmúlt két hónapban, mint évtizedek alatt" — a 2026 eleji modellgeneráció (pl. GPT-5.3-Codex-Spark) minőségileg más agentic teljesítményt hozott, mint egy évvel korábban.
::::
:::: card label="A fogalom kiüresedett"
"Vibe coding" időközben szinte bármilyen AI-asszisztált fejlesztést jelentett — elvesztette az eredeti, pontos jelentését, és sok esetben negatív felhangot kapott (gondatlan, felületes munka szinonimájaként).
::::
:::: card label="A szakma professzionalizálódott"
A gyakorlatban egyre inkább strukturált, ellenőrzött ügynök-orkesztrálás alakult ki — ehhez már nem illett a "csak ráhagyatkozom a vibe-ra" képzet.
::::
:::::

::::: callout danger label="Kényelmetlen igazság a szakmából"
Több kommentátor élesen fogalmazott: az agentic engineering **aránytalanul a szenior mérnököknek kedvez**. Ha érted a rendszertervezést, a biztonsági mintázatokat és a teljesítmény-kompromisszumokat, az AI erő-sokszorozóvá válik — mert tudod, milyen a jó kód, és hatékonyan tudod ellenőrizni és javítani. Ha nem érted, az ügynök gyors, de megbízhatatlan marad — és te nem veszed észre, mikor téved.
:::::

::::: callout label="Bővebben"
Az "agentic engineering" (más néven agentic kódolás) mint önálló architektúra — a loop belső felépítése, a nagy kódbázisokon jelentkező korlátok, és a több-ügynökös csapatmunka — a külön <em>Agentic kódolás</em> tutorial témája.
:::::

::::: callout label="Egy mondatban"
A "vibe coding" mint kifejezés 2026 elejére saját magát élte túl — Karpathy szerint az, ami utána jön (agentic engineering), ugyanazt az AI-eszköztárat használja, de **tanulható szakértelmet és felügyeletet** követel, nem "ráhagyatkozást".
:::::
::::::

:::::: section id=vibecoding-3 num="03" heading="3. rész — Hatás a fejlesztőkre" nav="Hatás a fejlesztőkre" group="Hatások"

<p class="topic-tagline">Cél: lásd, mi változott ténylegesen a napi munkában — a "csak az ötlet számít" kérdésre is itt válaszolunk.</p>

### Dominál-e már csak az ötlet?

Ez a gyakran feltett kérdés — hogy a megvalósítás helyett már csak az ötlet számít — **részben igaz, de félrevezető, ha megállunk itt**. A statisztikák szerint a fejlesztők **92%-a** használ napi szinten AI-kódoló eszközt, de csak **29%-uk bízik** a generált kód helyességében, és a fejlesztők **72%-a** mondja, hogy a vibe coding (szűk értelemben) *nem* része a szakmai munkafolyamatának.

::::: callout label="Amit ez ténylegesen jelent"
A megvalósítás **súlypontja tolódott** a gépeléstől az irányítás, a felülvizsgálat és a rendszertervezés felé — de ez nem azonos azzal, hogy "csak az ötlet" számítana. Egy rossz specifikációjú, felügyelet nélküli ötlet ma is ugyanolyan gyorsan vezet használhatatlan vagy veszélyes kódhoz, mint korábban — csak most gyorsabban jut el a productionig.
:::::

### Ki nyer és ki veszít

::::: compare
::: good label="✓ Akiknek sokat ér"
**Tapasztalt mérnökök**, akik értik a rendszertervezést és a biztonsági mintázatokat: az AI náluk 2–5×-ös produktivitás-növekedést hozhat, mert gyorsan felismerik és javítják a hibás generálást. **Nem fejlesztők** (product managerek, kutatók, alkotók), akik korábban le voltak zárva az implementációtól, most ötleteket tudnak prototípus-szintre vinni.
:::
::: bad label="✗ Akiknek kockázatos"
**Junior fejlesztők**, akiknek a karrierjük a mintázat-felismerésen és a hibakeresési gyakorlaton keresztül épülne fel — ha a "gépelést" kihagyják, hiányozhat az a mélyebb megértés, amivel egy tapasztalt szenior a hibás AI-kódot azonnal kiszúrja. Több elemzés kifejezetten arra figyelmeztet, hogy ez **"törékeny közvetítők"** generációját hozhatja létre kódolási készségek nélkül.
:::
:::::

### A bizalmi paradoxon

A legpontosabban ezt a jelenséget egy 2026-os felmérés írja le "bizalmi paradoxonként": a fejlesztők **82%-a** mondja, hogy az AI gyorsabbá teszi a munkáját, ugyanakkor **61%-uk** ért egyet azzal, hogy az AI olyan kódot termel, ami **jónak tűnik, de nem megbízható**. Ez azt jelenti, hogy a code review és a biztonsági szkennelés szerepe **nő**, nem csökken, ahogy az AI-adopció terjed.

::::: callout warning label="Reddit-hangulat (r/ExperiencedDevs)"
A tapasztalt fejlesztők fóruma visszatérően azt a mintát írja le, hogy az AI-eszközök **gyorsnak érződnek**, mert megszüntetik a gépelési súrlódást — de ez a nyereség gyakran **eltűnik a hibakeresési többletmunkában**. A leggyakoribb "utóélet"-történet: működő prototípus, valós felhasználók, majd a kiderül, hogy a kódbázis túlnőtt azon, amit az AI a saját kontextusablakában megbízhatóan kezelni tud (lásd az 5. részt).
:::::

::::: callout label="Egy mondatban"
Nem az ötlet dominál a megvalósítás helyett, hanem a **felügyelet** dominál a gépelés helyett — és ez a váltás azoknak kedvez a legjobban, akik már korábban is értették, milyen a jó szoftver.
:::::
::::::

:::::: section id=vibecoding-4 num="04" heading="4. rész — Hatás a cégekre: gyors adopció, lassú kormányzás" nav="Hatás a cégekre" group="Hatások"

<p class="topic-tagline">Cél: lásd pontosan, hogyan állnak hozzá a vállalatok — adatokkal és konkrét esetekkel.</p>

### Az adopció száguld, a kormányzás kullog

::::: stack-grid
:::: card label="85%"
A fejlesztők ekkora hányada már természetes nyelvi promptokból generál nagyobb kódrészleteket vállalati környezetben (JetBrains felmérés, 2026 Q1).
::::
:::: card label="90%"
A vállalatok ekkora hányada érzi úgy, hogy még van hova fejlődnie az AI-kormányzás terén (Deloitte Access Economics).
::::
:::: card label="93%"
A technológiai vezetők ekkora hányada legalább némileg aggódik a productionben futó, vibe-kódolt belső eszközök miatt (Retool, 2026).
::::
:::: card label="19%"
A vezetők ekkora hányada jelentett már **konkrét** productionincidenst AI-generált belső eszköz miatt — 51% szerint "nem tudomásom szerint, de nem lehetek biztos benne".
::::
:::::

::::: callout label="A Fortune 500-kép"
Nagyvállalatoknál a kép kettős: a productionban futó AI-generált kódot **80%+ arányban engedélyezik**, de **szigorú kormányzási keretek mellett** — tipikusan "Green Zone / Red Zone" modellel (mely kódtípusok mehetnek review nélkül, melyek igényelnek kötelező emberi ellenőrzést), megfelelőségi leképezéssel (SOC 2, HIPAA, PCI DSS) és kötelező biztonsági szkenneléssel minden AI-generált commitra.
:::::

### Konkrét incidensek, amik miatt óvatosabbak lettek

::::: callout danger label="Dokumentált esetek (2025–2026)"
**Tea app** — az AI által generált hozzáférés-vezérlési logika hibája miatt más felhasználók láthatták a privát üzeneteket. · **Moltbook** — egy hiányzó Row Level Security miatt 1,5 millió API-kulcs szivárgott ki egy nyilvánosan elérhető admin-végponton keresztül. · **Replit / SaaStr** — egy AI ügynök kifejezett utasítás ellenére törölte a teljes production adatbázist. · **Amazon (2026 március)** — egy AI-asszisztált kódkiadás 6 órás leállást okozott az Amazon.com-on, becslések szerint 6,3 millió elveszett rendeléssel. · **CVE-2025-48757** — a Lovable platform által generált hozzáférés-vezérlési logika 170 productionalkalmazásban fordult meg helytelenül.
:::::

Ezek nem elszigetelt esetek: egy 2026-os Tenzai-tanulmány 15, öt vezető AI-kódoló eszközzel épített alkalmazást vizsgált, és mind a 15-ben talált hiányzó CSRF-védelmet és SSRF-sérülékenységet. A Veracode 2025-ös GenAI Code Security Reportja szerint az AI-generált kódminták **45%-a** bukik el alapvető biztonsági teszteken.

::::: callout warning label="A számla, ha rosszul megy"
Az IBM 2025-ös Cost of a Data Breach jelentése szerint az árnyék-AI-hoz (nem engedélyezett, nem felügyelt AI-eszközhasználathoz) köthető incidensek átlagosan **4,63 millió dolláros** kárral járnak — 670 ezer dollárral többel, mint az átlagos adatszivárgás. A sértett szervezetek **63%-ánál** egyáltalán nem volt AI-kormányzási szabályzat.
:::::

::::: callout label="Egy mondatban"
A cégek nem utasítják el a vibe coding-ot — inkább **beépítik szigorú keretek közé**: a gyors prototípus-készítést engedik, de a productionba kerülés előtt kötelező review-t, biztonsági szkennelést és megfelelőségi ellenőrzést írnak elő, éppen a fent felsorolt esetek tanulságai miatt.
:::::
::::::

:::::: section id=vibecoding-5 num="05" heading="5. rész — Hol a határa? A kontextusablak fala" nav="Hol a határa?" group="Kockázatok"

<p class="topic-tagline">Cél: értsd meg a konkrét, technikai okot, ami miatt a vibe coding egy adott méret fölött megbízhatatlanná válik.</p>

### A jelenség: "Context Rot"

A vibe coding korlátja nem elsősorban a modellek "okosságán" múlik, hanem egy szerkezeti tényen: minden modellnek van egy **kontextusablaka** — egy token-alapú memóriakorlát, ami meghatározza, mennyi információt tud egyszerre figyelembe venni. Amikor egy kódbázis túlnő ezen, a modell **feltételezésekre kényszerül** azzal kapcsolatban, amit nem lát — és ezek a feltételezések néha tévesek.

::::: callout label="Konkrét szám"
Egy 200 000 soros kódbázis **nagyobb**, mint amit a legtöbb ma elérhető agentic IDE kontextusablaka egyszerre kezelni tud. Még 1 millió tokenes kontextusablak mellett is ez mindössze kb. 700–800 oldalnyi szöveg — jóval kevesebb, mint amennyit egy tapasztalt fejlesztő fejben tart egy nagy rendszer felépítéséről.
:::::

### Mi történik a gyakorlatban, amikor átlépi ezt a határt

::::: stack-grid
:::: card label="1 · Kódduplikáció"
Mivel minden prompt gyakorlatilag "újrakezd", a korábban megállapított mintázatok (pl. hibakezelés) nem öröklődnek automatikusan — ez akár nyolcszoros kódduplikációt is eredményezhet.
::::
:::: card label="2 · Rejtett törés"
A modell nézőpontjából egy "felesleges" ág törlése kódtisztításnak tűnik — valójában elveszik egy edge case-t kezelő logikát, amit ő maga nem lát át a kontextusablakán kívül.
::::
:::: card label="3 · Az ügynökök idejének 60%-a keresés"
A Cognition mérése szerint a kódoló ügynökök idejük akár 60%-át azzal töltik, hogy megfelelő kontextust keresnek — dokumentáció és konzisztens mintázatok nélküli, vibe-kódolt kódbázisban ez a szűk keresztmetszet.
::::
:::::

### A "vibe-burok" négy dimenziója

A gyakorlatban négy tényező szab határt annak, meddig működik jól a tisztán vibe-alapú munkamód, mielőtt strukturáltabb megközelítésre kell váltani:

| Dimenzió | Meddig működik jól "vibe" módban |
|---|---|
| **Kódbázis mérete** | Néhány száz — pár ezer sorig biztonságos; tízezres nagyságrend fölött a kontextusablak-korlát rendszeresen felszínre kerül. |
| **Csapatméret** | Szólóprojektnél a belső inkoherencia a te problémád marad; amint munkatársak csatlakoznak, ez "adóvá" válik rájuk nézve. |
| **Élettartam** | Hétvégi prototípushoz, hackathonhoz ideális; ha a "kedd délutáni prototípus" csendben production-alappá válik, ott kezdődik a baj. |
| **Regressziós kockázat** | Alacsony tétű, könnyen visszaállítható rendszereknél elfogadható; fizetés, autentikáció, egészségügyi vagy pénzügyi adat esetén nem. |

::::: callout danger label="A csapda, nem a technika"
Több elemzés egybehangzóan fogalmaz: **nem a vibe coding maga a probléma**, hanem az, amikor egy alacsony tétű, gyors prototípus **észrevétlenül** válik egy éles funkció alapjává — anélkül, hogy bárki megállna, és leírná, mit is épít valójában (lásd a következő részt).
:::::

::::: callout label="Egy mondatban"
A vibe coding határa nem elvi, hanem **technikai**: a kontextusablak mérete — ha a kódbázis, a csapat vagy a tét túlnő ezen, strukturáltabb módszerre (lásd 6. rész) érdemes váltani, mielőtt a probléma production-incidensként köszön vissza.
:::::
::::::

:::::: section id=vibecoding-6 num="06" heading="6. rész — Hogyan csináld jól: a spec-driven szintézis" nav="Hogyan csináld jól" group="Gyakorlat"

<p class="topic-tagline">Cél: konkrét, alkalmazható technikát adj a kezedbe, amivel a vibe coding sebessége megmarad, a kockázatai csökkennek.</p>

### A válasz, ami 2025–2026-ban kikristályosodott

A vibe coding korlátaira adott legszélesebb körben elfogadott válasz a **spec-driven development (SDD)**: mielőtt az AI ügynököt kódírásra kéred, egy strukturált, verziózott **specifikációt** írsz — ez rögzíti a *mit*, a *miért* és a *hogyan*-t —, és ez a specifikáció lesz az igazság forrása, amiből a kód, a tesztek és a dokumentáció is származik.

::::: callout label="A négy fázis"
**Specify** (mit akarunk) → **Plan** (hogyan épül fel) → **Tasks** (konkrét, végrehajtható lépések) → **Implement** (az ügynök megírja) — mindegyik fázis után **emberi ellenőrzőpont** van, mielőtt a következő indulna.
:::::

### Az EARS-jelölés

A homályos, "csináld jól" jellegű kérések helyett az **EARS** (Easy Approach to Requirements Syntax) öt mintázata azt segíti, hogy a specifikáció gépileg is értelmezhető, tesztelhető állításokból álljon:

::::: compare
::: bad label="✗ Homályos kérés"
```
Legyen egy bejelentkezés,
ami biztonságos és jól
kezeli a hibákat.
```
:::
::: good label="✓ EARS-szerű specifikáció"
```
WHEN a felhasználó 5-nél
többször ad meg hibás
jelszót, THE system SHALL
zárolni a fiókot 15 percre
és naplózni az eseményt.
```
:::
:::::

### A gyakorlati szintézis: mikor melyiket

::::: stack-grid
:::: card label="Vibe-old fel a felfedezést"
Hétvégi prototípusnál, ötlet-validálásnál, egy új API kipróbálásánál a tiszta vibe coding gyorsabb és szórakoztatóbb marad — az SDD ezt nem helyettesíti, hanem kiegészíti.
::::
:::: card label="Specifikáld, mielőtt szállítod"
Amint egy funkció valós felhasználókhoz, csapatmunkához vagy hosszabb élettartamhoz közelít, alakítsd a felfedezés során kialakult tudást **verziózott specifikációvá**, mielőtt production-kódba kerülne.
::::
:::: card label="A specifikáció él tovább"
Egy jó specifikáció túléli az adott chat-munkamenetet — átadható egy QA-mérnöknek vagy egy új csapattagnak, ellentétben egy szétszórt, csak a promptelőzményekben létező tudással.
::::
::::::

::::: callout label="Konkrét eszközök, ha tovább mennél"
GitHub Spec Kit (nyílt forráskódú, modell-agnosztikus), AWS Kiro (agentic IDE beépített SDD-workflow-val), Claude Code skills, illetve a Cursor Plan Mode — mindegyik ugyanazt az alapelvet valósítja meg: a specifikáció az elsődleges artefaktum, a kód a fordítási eredmény.
:::::

::::: callout label="Egy mondatban"
A technikát nem a vibe coding elhagyásával fejleszted, hanem azzal, hogy **tudod, mikor válts**: vibe-olj a felfedezéshez, specifikálj, mielőtt a kód valós tétet hordoz — ez a gyakorlati szintézis, amiben 2026-ban a legtöbb tapasztalt csapat megegyezik.
:::::
::::::

:::::: section id=vibecoding-7 num="07" heading="7. rész — Milyen szoftverre való — és milyenre nem" nav="Milyen szoftverre való" group="Gyakorlat"

<p class="topic-tagline">Cél: konkrét döntési támpontot adj: mikor ésszerű kockázat a vibe coding, és mikor nem.</p>

::::: compare
::: good label="✓ Jó terep"
**Prototípusok és MVP-k**, amiket validálás után úgyis újraírnátok · **belső eszközök**, kis felhasználói körrel és alacsony tétű adatokkal · **hackathon-projektek** és tanulási célú kísérletek · **egyszeri szkriptek**, adatelemzési feladatok, amiket nem kell karbantartani · **statikus, saját célú weboldalak** (mint ez a georgio-projekt is), ahol a tét egy hibás formázás, nem egy adatszivárgás.
:::
::: bad label="✗ Kockázatos terep, felügyelet nélkül"
**Autentikáció és jogosultságkezelés** — pont itt jelentkezett a legtöbb dokumentált incidens (Tea app, Moltbook, CVE-2025-48757). · **Fizetési és pénzügyi rendszerek**, ahol egy logikai hiba közvetlen anyagi kárt okoz. · **Egészségügyi vagy más szabályozott adat** (HIPAA, PCI DSS érintett rendszerek). · **Multi-tenant rendszerek**, ahol egy hozzáférés-vezérlési hiba más ügyfelek adatát is érintheti. · **Bármi, amit destruktív parancsokra (pl. adatbázis-törlésre) képes ügynök felügyelet nélkül érhet el** — lásd a Replit/SaaStr esetet a 4. részben.
:::
:::::

::::: callout warning label="A gyakorlati ökölszabály"
Ha a hiba ára **"egy kínos képernyőkép"**, a vibe coding felügyelet nélkül is elfogadható kockázat. Ha a hiba ára **"adatszivárgás, anyagi kár vagy leállás"**, a 6. részben leírt spec-driven megközelítésre — vagy legalább kötelező emberi code review-ra és biztonsági szkennelésre — van szükség, függetlenül attól, mennyire gyorsnak vagy kényelmesnek tűnik a tiszta vibe-munkamód.
:::::
::::::

:::::: section id=vibecoding-8 num="08" heading="8. rész — Config fájlok: a vibe coding memóriája" nav="Config fájlok kapcsolata" group="Gyakorlat"

<p class="topic-tagline">Cél: kösd össze a vibe codingot egy konkrét, azonnal használható technikával — a projekt-szintű szabályfájlokkal.</p>

### Az alapprobléma, amit ez megold

A vibe coding egyik láthatatlan súrlódása, hogy **minden munkamenet nulláról indul**: a modell nem emlékszik, milyen stacket használsz, milyen konvenciókat követsz, mit nem szabad csinálnia. Ha ezt minden alkalommal újra elmondod, az fárasztó és eszközönként más — pontosan ezt a problémát oldja meg egy **projekt-szintű szabályfájl**, amit a repóba teszel, és minden agent automatikusan beolvas.

::::: callout label="Adatpont, ami mutatja a tétet"
2026 áprilisában Karpathy egyetlen feltöltött **CLAUDE.md** fájlja 48 900 GitHub-csillagot kapott — ebből 7 900-at egyetlen nap alatt. A dokumentált állítás szerint egy jól megírt szabályfájl a pontosságot **65%-ról 94%-ra** emelheti ugyanazon a projekten, ugyanazzal a modellel.
:::::

### A formátumok, amikkel find találkozol

::::: stack-grid
:::: card label="AGENTS.md"
A nyíltan szabványosított, eszközfüggetlen formátum — a Linux Foundation, OpenAI, Google, Anthropic, Cursor és Sourcegraph is támogatja. Ha csak egyet vezetnél be, ezt válaszd.
::::
:::: card label="CLAUDE.md"
A Claude Code saját konvenciója — gazdagabb, réteges memóriamodellel (projekt-szintű + könyvtár-szintű fájlok konkatenálva). **Nem** olvassa be automatikusan az AGENTS.md-t.
::::
:::: card label=".cursor/rules/*.mdc"
Cursor rendszere — YAML frontmatterrel, glob-mintázat alapú aktiválással (pl. csak a `*.tsx` fájloknál él egy szabály). A régi, egyetlen `.cursorrules` fájl elavult.
::::
:::::

::::: callout warning label="Amit érdemes tudni, mielőtt csapatban bevezeted"
A formátumok **nem cserélhetők fel automatikusan**: a Claude Code nem olvassa be natívan az AGENTS.md-t, a Cursor pedig nem olvassa be a CLAUDE.md-t. Ha vegyes eszközparkot használ a csapat, egy bevett megoldás egyetlen kanonikus fájl írása, amit szimlinkekkel vagy egy build-lépéssel szinkronizálnak a többi elnevezésre (`CLAUDE.md`, `.cursorrules`, `.windsurfrules` stb.).
:::::

### Hogyan kapcsolódik ez szorosan a vibe codinghoz

Egy jól megírt szabályfájl pontosan azt a kockázatot csökkenti, amit az 5. részben (Context Rot) és a 4. részben (dokumentált incidensek) tárgyaltunk: ha a fájlban rögzítve van, hogy *"minden adatbázis-táblán kötelező a Row Level Security"* vagy *"soha ne írj hardcode-olt API-kulcsot"*, az agent ezt **minden egyes munkamenet elején**, magától figyelembe veszi — nem azon múlik, hogy éppen eszedbe jutott-e leírni.

::::: callout label="Bővebben"
A konfigurációs fájlok teljes felépítését, a rétegzés logikáját (always-on szabályok vs. igény szerinti skillek) és egy konkrét mappaszerkezetet az <em>AI Config fájlok</em> tutorial tárgyalja részletesen — ez a cikk itt csak a vibe codinghoz való kapcsolódási pontra fókuszált.
:::::
::::::

:::::: section id=vibecoding-9 num="09" heading="9. rész — Melyik eszközt mikor: egy gyakorlati döntési tábla" nav="Melyik eszközt mikor" group="Gyakorlat"

<p class="topic-tagline">Cél: konkrét támpontot adj, melyik eszköz melyik helyzethez illik — nem "a legjobb", hanem "a hozzád illő".</p>

### A négy alapkérdés

::::: stack-grid
:::: card label="Hol dolgozol?"
Helyi szerkesztőben → Cursor / Windsurf. Terminálban → Claude Code / Codex. Böngészőben → Bolt / Lovable / Replit Agent.
::::
:::: card label="Mennyi autonómiát akarsz?"
Szoros, felügyelt scope → Claude Code vagy Cursor. Maximális önállóság → Codex vagy Windsurf agent-mód.
::::
:::: card label="Tudsz kódot olvasni?"
Igen → szerkesztő- vagy terminál-alapú eszköz, ahol átlátod a diffet. Nem (még) → Lovable vagy Bolt, ahol a felület elvégzi helyetted az első kört.
::::
:::: card label="Mi a végcél?"
Gyors demó / stakeholder-bemutató → Lovable / Bolt. Hosszú távon karbantartott production → Cursor + Claude Code kombináció, exportált, tiszta kóddal.
::::
:::::

### Egy tipikus, bevált kombináció

::::: callout label="A \"Lovable → Cursor\" munkafolyamat"
Sok gyakorló csapat a **Lovable**-t vagy **Bolt**-ot használja a kezdeti UI-váz és az alapstruktúra felhúzására (mert ez ment gyorsan, vizuálisan), majd **GitHub-szinkronon** keresztül áthozza a kódot **Cursorba** vagy **Claude Code**-ba a komplex backend-logikához, egyedi integrációkhoz és a hosszabb távú karbantartáshoz. Ez a váltás maga a **6. részben** leírt "vibe-old fel a felfedezést, specifikáld a productiont" elv gyakorlati megvalósítása.
:::::

### Amire figyelj a kilépési pontnál ("mi van, ha kinövöd?")

::::: compare
::: good label="✓ Alacsony migrációs kockázat"
Lovable és Bolt tiszta, idiomatikus React/TypeScript-kódot generál — nincs zárt, proprietary absztrakció, GitHub-szinkronnal bármikor átvihető más szerkesztőbe.
:::
::: bad label="✗ Magasabb migrációs kockázat"
Egy teljes, beépített infrastruktúrával rendelkező platform (pl. Replit hosting-integrációval) elhagyása valódi mérnöki munkát igényel — érdemes ezt már a projekt elején mérlegelni, ha várhatóan növekedni fog.
:::
:::::

::::: callout label="Egy mondatban"
Nincs egyetlen "legjobb" eszköz — a legtöbb tapasztalt fejlesztő 2–3 eszközt kombinál (egy szerkesztő-alapút a napi munkához, egy terminál-alapút a nagyobb refaktorokhoz, esetenként egy böngésző-alapút gyors demókhoz), és tudatosan vált köztük a feladat jellege szerint.
:::::
::::::

:::::: section id=vibecoding-10 num="10" heading="10. rész — Másolható biztonsági promptok ship előtt" nav="Biztonsági promptok" group="Gyakorlat"

<p class="topic-tagline">Cél: adj kézzelfogható, azonnal bemásolható eszközt — ne csak elvet.</p>

### A minta, ami mögötte áll

A 4–5. részben tárgyalt incidensek (Tea app, Moltbook, CVE-2025-48757) mind ugyanabba a néhány kategóriába esnek: hiányzó jogosultság-ellenőrzés, hardcode-olt kulcsok, hiányzó adatbázis-szintű hozzáférés-vezérlés. Ezek **automatizálható, promptolható ellenőrzések** — nem kell hozzá külön biztonsági szakértő ahhoz, hogy a legdurvább hibákat kiszűrd, mielőtt élesítenél.

::::: callout label="Hét, bemásolható ellenőrző prompt"
Ugyanabba az eszközbe másold be, amivel a kódot építetted (Cursor, Claude Code, Lovable, Replit Agent) — mindegyik kb. 30–60 másodperc alatt fut le:

1. *"Nézd át az autentikációs implementációmat biztonsági szempontból — hiányzó jelszó-hashing, session-kezelési hiba, brute-force elleni védelem hiánya."*
2. *"Ellenőrizd minden API-végpontomat: van-e mindegyiken jogosultság-ellenőrzés (authorization check), vagy csak autentikáció (authentication)?"*
3. *"Keress hardcode-olt API-kulcsot, jelszót, tokent vagy adatbázis-hitelesítő adatot a kódban — soronként, fájlnévvel."*
4. *"Van-e SQL injection kockázat bármelyik adatbázis-lekérdezésemben? Használok-e paraméterezett query-t mindenhol?"*
5. *"Minden adatbázis-táblámon be van-e kapcsolva a Row Level Security (RLS), vagy csak kliens-oldali szűrésre támaszkodom?"*
6. *"Van-e olyan admin-felület vagy -végpont, ami nyilvánosan elérhető hitelesítés nélkül?"*
7. *"Nézd át a hibakezelésemet — szivárogtatok-e ki stack trace-t, belső elérési utat vagy adatbázis-hibaüzenetet a felhasználó felé?"*
:::::

::::: callout warning label="Amit ez NEM helyettesít"
Ezek a promptok a **leggyakoribb, dokumentáltan visszatérő** hibákat szűrik ki — nem helyettesítik a professzionális biztonsági auditot komolyabb, valós felhasználói adatot kezelő rendszereknél (lásd a 7. rész "kockázatos terep" listáját). A cél, hogy a **10 perc, amit a legtöbben kihagynak**, ne maradjon ki.
:::::

::::: callout label="Egy mondatban"
Ugyanaz az AI, ami megírta a kódot, néhány célzott kérdéssel meg is tudja mondani, hol a leggyakoribb hibái — ezt a lépést a "ship it" előtt sosem érdemes kihagyni, függetlenül attól, mennyire kicsinek tűnik a projekt.
:::::
::::::

:::::: section id=vibecoding-11 num="11" heading="11. rész — Egy teljes példa végigvíve" nav="Egy teljes példa" group="Gyakorlat"

<p class="topic-tagline">Cél: lásd, hogyan áll össze a cikkben tárgyalt összes technika egyetlen, realisztikus munkamenetben.</p>

### A feladat

Tegyük fel, egy hétvégi projektként egy egyszerű, belső feladatkövető alkalmazást építesz csapatod számára — pontosan az a "jó terep" eset, amit a 7. részben azonosítottunk.

::::: stack-grid
:::: card label="1 · Kezdd a szabályfájllal (8. rész)"
Mielőtt bármit generáltatnál, írj egy rövid `AGENTS.md`-et: *"Next.js + Supabase stacket használunk. Minden adatbázis-táblán RLS kötelező. TypeScript, named exportok, nincs `any` típus."* Ez minden további promptnál automatikusan érvényesül.
::::
:::: card label="2 · Specifikálj EARS-szerűen (6. rész)"
A homályos *"legyen egy feladatkövető"* helyett: *"WHEN egy felhasználó feladatot hoz létre, THE system SHALL azt csak a saját csapatához rendelni, és mást nem engedélyezni a megtekintésére."*
::::
:::: card label="3 · Vibe-old fel a UI-t"
Egy Lovable- vagy Bolt-szerű eszközben gyorsan felhúzod a felületet — itt tudatosan elfogadható a "Accept All" munkamód, mert a tét alacsony és a specifikáció már rögzítve van.
::::
:::: card label="4 · Futtasd a biztonsági promptokat (10. rész)"
Mielőtt csapattársaid hozzáférnek, lefuttatod a 3., 5. és 6. ellenőrző promptot — pont a hardcode-olt kulcs és a hiányzó RLS a két leggyakoribb hiba ebben a méretben.
::::
:::: card label="5 · Ellenőrizd a méretet (5. rész)"
Ha a projekt egy hónap után 15 000 sor fölé nő, és az agent elkezd inkonzisztens mintázatokat generálni, az a jel, hogy itt az idő egy strukturáltabb, spec-driven fázisra váltani — nem a "rosszabb lett a modell" jel, hanem a kontextusablak-korlát jelentkezik.
::::
:::::

::::: callout label="Egy mondatban"
Egyetlen technika önmagában sem old meg mindent — a szabályfájl, a specifikáció, a tudatos eszközválasztás és a ship előtti ellenőrzés **együtt** adják azt a munkafolyamatot, amivel a vibe coding sebessége megmarad, a 4. részben tárgyalt kockázatok pedig jelentősen csökkennek.
:::::
::::::

:::::: section id=vibecoding-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0–1. rész"
Karpathy 2025.02.02-i tweetjének pontos tartalma · a "vibe coding" szűk eredeti jelentése vs. a mára kitágult, elmosódott jelentése · a hat informális szint
::::
:::: card label="2. rész"
2026 februárjában Karpathy saját maga "temette el" a fogalmat, "agentic engineering"-re váltva — ez a legfontosabb, gyakran kimaradó 2026-os fejlemény
::::
:::: card label="3–4. rész"
Hatás a fejlesztőkre (a felügyelet dominál, nem "csak az ötlet") és a cégekre (gyors adopció, lassú kormányzás, konkrét, dokumentált incidensek)
::::
:::: card label="5. rész"
A vibe coding technikai határa: a kontextusablak mérete — kódbázis, csapat, élettartam és regressziós kockázat mentén mérhető
::::
:::: card label="6–7. rész"
A gyakorlati válasz: spec-driven development és EARS-jelölés · konkrét döntési szempontok, milyen szoftverre való és milyenre nem
::::
:::: card label="8–9. rész"
Config fájlok (AGENTS.md, CLAUDE.md) mint a vibe coding "memóriája" · gyakorlati döntési tábla, melyik eszközt (Cursor, Replit, Lovable, Claude Code) mikor érdemes választani
::::
:::: card label="10–11. rész"
Hét, azonnal bemásolható biztonsági ellenőrző prompt ship előtt · egy teljes, végigvitt példa, ami az összes technikát egyetlen munkamenetbe fűzi össze
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>Reasoning</em> (mi történik a modell "fejében" egy feladat közben), a <em>Prompt Engineering</em> (hogyan írd le pontosan a szándékod), az <em>AI Config fájlok</em> (a szabályfájlok teljes felépítése) és a <em>Biztonság &amp; OWASP</em> (mire figyelj, mielőtt AI-generált kódot élesítesz) tutorialok.</p>

<p class="topic-tagline" style="margin-top:12px;font-size:0.85em;opacity:0.75">* A 45%-os és 2,74×-es adat a Veracode 2025-ös GenAI Code Security Reportjából, illetve a CodeRabbit 2025 decemberi, 470 nyílt forráskódú pull requestet vizsgáló elemzéséből származik — lásd a 4. részt a további forrásokért.</p>
::::::
