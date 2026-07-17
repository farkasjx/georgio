---
page: hallucination
title: Hallucináció — miért és hogyan kerülhető el
sidebar_groups:
  - Elmélet
  - Felismerés
  - Védekezés
  - Gyakorlat
  - Referencia
hero:
  eyebrow: "Hallucináció · Fejlesztői Tanulási Terv"
  title: "Hallucináció — <em>miért és hogyan kerülhető el</em>"
  lead: "Miért mond a modell magabiztosan hamis dolgokat, és miért nem „hiba” ez a hagyományos értelemben. A statisztikai eredet, a típusok, a felismerés technikái, és a védekezés három rétege: promptolás, RAG, memory. Épít a <em>prompt engineering</em>, a <em>RAG</em> és a <em>memory</em> tutorialokra."
  stats:
    - { val: "9", lbl: "Szakasz" }
    - { val: "2", lbl: "Feladat" }
    - { val: "5", lbl: "Védelmi réteg" }
    - { val: "53→23%", lbl: "Promptolással csökkenthető" }
footer:
  left: "AI Hub · Hallucináció"
  right: "Hallucináció · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#hal-0"><div class="tc-num">0. rész</div><div class="tc-name">Mi az a hallucináció?</div><div class="tc-desc">Nem hiba — a generálás egy velejárója.</div></a>
  <a class="toc-card" href="#hal-1"><div class="tc-num">1. rész</div><div class="tc-name">A statisztikai eredet</div><div class="tc-desc">Miért elkerülhetetlen egy alap-szinten.</div></a>
  <a class="toc-card" href="#hal-2"><div class="tc-num">2. rész</div><div class="tc-name">Az incentive-probléma</div><div class="tc-desc">Miért hazudik a "nem tudom" helyett.</div></a>
  <a class="toc-card" href="#hal-3"><div class="tc-num">3. rész</div><div class="tc-name">A típusok</div><div class="tc-desc">Faktuális, faithfulness, logikai — és további felosztások.</div></a>
  <a class="toc-card" href="#hal-4"><div class="tc-num">Feladat 1</div><div class="tc-name">Idézd elő</div><div class="tc-desc">Figyeld meg élőben, hogyan történik.</div></a>
  <a class="toc-card" href="#hal-5"><div class="tc-num">4. rész</div><div class="tc-name">Felismerés</div><div class="tc-desc">Self-consistency, chain-of-verification.</div></a>
  <a class="toc-card" href="#hal-6"><div class="tc-num">5. rész</div><div class="tc-name">Védekezés: promptolás</div><div class="tc-desc">A legolcsóbb, leggyorsabb réteg.</div></a>
  <a class="toc-card" href="#hal-7"><div class="tc-num">6. rész</div><div class="tc-name">Védekezés: RAG</div><div class="tc-desc">Grounding — a válasz forráshoz kötése.</div></a>
  <a class="toc-card" href="#hal-8"><div class="tc-num">7. rész</div><div class="tc-name">Védekezés: memory</div><div class="tc-desc">Konzisztencia session-ökön át.</div></a>
  <a class="toc-card" href="#hal-9"><div class="tc-num">Feladat 2</div><div class="tc-name">Hasonlítsd össze</div><div class="tc-desc">Réteg nélkül vs. réteggel.</div></a>
  <a class="toc-card" href="#hal-10"><div class="tc-num">8. rész</div><div class="tc-name">Döntési keret</div><div class="tc-desc">Melyik réteg mikor, checklist.</div></a>
</div>
::::::

:::::: section id=hal-0 heading="0. rész — Mi az a hallucináció?" nav="0. rész" group="Elmélet"

<p class="topic-tagline">Cél: értsd, hogy ez nem egy javítható "bug", hanem a generálás egyik alapvető velejárója.</p>

### A definíció

A **hallucináció** az, amikor egy nyelvi modell **folyékony, magabiztos, nyelvtanilag hibátlan** szöveget generál, ami **ténybelileg hamis vagy a forrásához nem hű**. A kulcs-szó a "magabiztos": a modell nem jelez bizonytalanságot, nem mondja, hogy "nem vagyok biztos benne" — pontosan úgy fogalmaz, mint amikor helyes tényt közöl.

### Miért nem egyszerűen "hiba"?

Egy hagyományos szoftverhibát ki lehet javítani — megtalálod a sort, ahol elromlik, és kijavítod. A hallucináció más természetű: a **2025-ös OpenAI kutatás** ("Why Language Models Hallucinate", Kalai és szerzőtársai) megmutatta, hogy a hallucináció **statisztikailag elkerülhetetlen alapszinten** — még tökéletes tanítási adat mellett is, a előretanítás matematikájából egy alap hibaarány következik. Ez nem azt jelenti, hogy tehetetlen vagy vele szemben — de azt igen, hogy a cél nem a "kiküszöbölés", hanem a **kockázat rétegzett csökkentése**.

::::: callout label="Egy mondatban"
**A hallucináció a nyelvi modell generálási folyamatának egy velejárója, nem egy izolált hiba** — ezért a védekezés is több, egymásra épülő rétegből áll (promptolás, RAG, memory, kimeneti ellenőrzés), nem egyetlen "javításból".
:::::
::::::

:::::: section id=hal-1 heading="1. rész — A statisztikai eredet: miért elkerülhetetlen egy alapszinten" nav="1. rész" group="Elmélet"

<p class="topic-tagline">Cél: értsd a matematikai/statisztikai gyökeret, nem csak a tünetet.</p>

### A tanítás matematikája garantál egy hibaarányt

A nyelvi modell a **következő token valószínűségét** tanulja meg becsülni egy hatalmas szövegkorpuszon. Az OpenAI 2025-ös elemzése szerint ez a folyamat — még **tökéletes** tanítási adat mellett is — egy nem-nulla alap hibaarányt eredményez, mert a modell paraméterszáma véges, a valós világ tényei viszont gyakorlatilag végtelenek és sokszor ritkán fordulnak elő a tanítási adatban. Amikor egy ritka, kevésszer látott tényről kérdezed, a modell a **legvalószínűbb mintázatot** folytatja — ami gyakran plauzibilis, de helytelen.

### Konkrét, dokumentált eset

A kutatás egy szemléletes anekdotát is hoz: több népszerű modellt megkérdeztek egy kutató (Kalai) doktori disszertációjának pontos címéről — és a modellek magabiztosan, de **tévesen** válaszoltak, mindegyik más hibás címet adva. Ez pontosan azt mutatja, amit "ritka tény" problémának hívunk: kevés tanítási adat egy specifikus tényről → a modell a mintázat-illesztésre hagyatkozik → plauzibilis, de hamis kimenet.

::::: callout warning label="Ez miért fontos neked gyakorlatilag?"
Ha tudod, hogy a hallucináció **strukturálisan valószínűbb** ritka, specifikus, kevésszer előforduló tényeknél (pontos dátumok, idézetek, jogi hivatkozások, kevéssé ismert nevek) — akkor tudod, **mikor legyél különösen gyanakvó**, és mikor éri meg extra védekezési réteget (RAG, citálás-kényszer) bevetni.
:::::
::::::

:::::: section id=hal-2 heading="2. rész — Az incentive-probléma: miért hazudik a \"nem tudom\" helyett" nav="2. rész" group="Elmélet"

<p class="topic-tagline">Cél: értsd meg a második, legalább ilyen fontos okot — ez már nem statisztika, hanem ösztönző-rendszer kérdése.</p>

### A vizsga-analógia

Az OpenAI kutatás egyik legfontosabb felismerése: a modellek tanítása és kiértékelése ma **rosszul jutalmazza** a bizonytalanság beismerését. A legtöbb benchmark és kiértékelési módszer **bináris**: helyes vagy helytelen. Ha a "nem tudom" válasz **mindig** nullát ér, míg egy találgatás **néha** eltalálja a helyes választ — a modell, akárcsak egy diák egy feleletválasztós vizsgán, matematikailag jobban jár, ha **mindig találgat**, sosem vall bizonytalanságot.

```text
Ha "nem tudom" = 0 pont MINDIG
és egy találgatás = 0 pont VAGY 1 pont (néha eltalálja)

akkor az optimális stratégia: SOSE mondd, hogy nem tudod — mindig találgass
```

### Ez tanítási/kiértékelési probléma, nem "rossz szándék"

Fontos leszögezni: a modell nem "hazudik" abban az értelemben, hogy szándékosan félrevezet — egyszerűen **úgy lett kiértékelve és jutalmazva**, hogy a magabiztos találgatás optimálisabb stratégia, mint a bizonytalanság beismerése. Ez egy **rendszerszintű, javítható** probléma: a kutatás említ olyan új tanítási megközelítéseket (pl. bizonytalanság-tudatos RLHF-variánsok), amik explicit **büntetik mind a túlzott, mind az indokolatlanul alacsony magabiztosságot** — ez a hosszú távú, tanítás-szintű megoldás iránya, ami már túlmutat azon, amit te promptolással vagy alkalmazás-architektúrával elérhetsz (8. rész).

::::: callout label="Amit te tehetsz emiatt"
Mivel a modell alapból a magabiztos válaszra van "hangolva", a te feladatod (5-7. rész) az, hogy **explicit engedélyt és keretet adj** a bizonytalanság kifejezésére — a system promptban, a RAG-grounding-gal, vagy egy kimeneti ellenőrző réteggel. A modell nem fogja magától felajánlani a "nem tudom"-ot, ha nem kéred rá kifejezetten.
:::::
::::::

:::::: section id=hal-3 heading="3. rész — A hallucináció típusai" nav="3. rész" group="Elmélet"

<p class="topic-tagline">Cél: ismerd fel, melyik típussal állsz szemben — mert mindegyiket más réteg kezeli.</p>

### A három gyakorlati alaptípus

::::: stack-grid
:::: card label="Faktuális hallucináció"
A modell egy **valótlan tényt** állít magabiztosan (hibás dátum, nem létező idézet, kitalált forrás). Ez a "klasszikus" eset — jellemzően ritka, specifikus tényeknél jelentkezik (1. rész). **Ez ellen a RAG a leghatékonyabb** (6. rész), mert külső, ellenőrizhető forrást ad.
::::
:::: card label="Kontextus-hűségi (faithfulness) hallucináció"
A modell **ellentmond vagy eltér** a neki megadott forrásanyagtól — pl. egy RAG-rendszernél a visszakeresett dokumentum mást mond, mint amit a modell végül állít. Ez pontosan az, amit a **RAG tutorial** RAGAS "faithfulness" metrikája mér.
::::
:::: card label="Logikai / következtetési hallucináció"
A modell egy **hibás érvelési láncot** követ, és a végkövetkeztetés nem következik logikusan az előzményekből — még ha minden egyes állítás önmagában igaz is. Ez többlépéses érveléshez kötődik, és promptolási technikákkal (lépésenkénti gondolkodásra ösztönzés) mérsékelhető leginkább.
::::
:::::

::::: callout warning label="Miért számít a megkülönböztetés?"
Egy faktuális hallucinációt RAG-gal orvosolsz (külső, friss tényforrás). Egy faithfulness-hallucinációt szigorúbb promptolással és kimeneti ellenőrzéssel ("csak azt állítsd, ami szó szerint szerepel a forrásban"). Egy logikai hallucinációt lépésenkénti érveléssel és önellenőrzéssel. **A rossz diagnózisra a rossz gyógymódot alkalmazod** — ha egy faktuális hiányosságra csak jobb promptot írsz RAG nélkül, a probléma megmarad.
:::::

### További felosztások, amikkel találkozhatsz

A fenti három a gyakorlati védekezéshez legfontosabb csoportosítás, de a szakirodalom **több, egymást részben átfedő taxonómiát** is használ. Érdemes ismerni őket, mert más-más forrásban ezekkel a nevekkel futhatsz össze:

::::: stack-grid
:::: card label="Intrinsic vs. extrinsic"
**Intrinsic (belső):** a kimenet **ellentmond** a forrásnak (pl. a forrás 2023-at mond, a modell 2021-et ír). **Extrinsic (külső):** a kimenet olyat **told hozzá**, ami nincs a forrásban, és nem is ellenőrizhető belőle — nem feltétlenül hamis, csak igazolhatatlan toldás. Ez a megkülönböztetés főleg összegzési és RAG-kutatásokban gyakori.
::::
:::: card label="Fabrikáció (fabrication)"
Egy külön kiemelt altípus: **teljesen kitalált forrás, idézet vagy hivatkozás** (nem létező cikk, jogszabály-paragrafus, bírósági eset). Ez a tutorialban említett jogi esetek tipikus formája — technikailag a faktuális hallucináció egy szélsőséges, különösen kockázatos esete.
::::
:::: card label="Adat-vezérelt torzítás (data-driven bias)"
Amikor a tanítási adat egyenetlenségei miatt a modell egy **irányba húz** — egy gyakoribb, de az adott kérdésre nem releváns mintázatot ismétel, ahelyett hogy a valódi választ adná. Nem "kitalálás" a szó klasszikus értelmében, inkább a tanítási adat torzításának tükröződése.
::::
:::: card label="Multimodális hallucináció"
Kép- vagy hangbemenetnél a modell olyan részletet "lát" vagy "hall", ami nincs is az inputban. Ugyanaz a mögöttes mechanizmus (magabiztos, de megalapozatlan kitöltés), csak nem szöveges, hanem vizuális/auditív modalitásban jelentkezik — ez a 2026-os kutatás egyik növekvő fókuszterülete.
::::
:::::

::::: callout label="Nem kell mindet fejben tartanod"
Ezek a felosztások **átfedik** egymást — egy fabrikált jogszabály-hivatkozás egyszerre faktuális hallucináció, extrinsic és fabrikáció is. A cél nem az, hogy pontosan kategorizálj minden esetet, hanem hogy felismerd: a hallucinációnak **több arca** van, és a védekezésed (5-7. rész) ennek megfelelően legyen rétegzett, ne egyetlen típusra optimalizált.
:::::
::::::

:::::: section id=hal-4 heading="Feladat 1 — Idézd elő szándékosan, és figyeld meg" nav="Feladat 1" group="Gyakorlat"

<p class="topic-tagline">Cél: lásd élőben, hogyan viselkedik a modell egy olyan kérdésnél, ahol nincs elég tanítási jele.</p>

### Python — hallucináció-kiváltó teszt

```python
import anthropic

client = anthropic.Anthropic()

# szándékosan ritka, specifikus, ellenőrizhetetlen tényt kérünk
test_prompts = [
    "Pontosan hányadik oldalon található a fő tétel bizonyítása "
    "[egy általad kitalált, nem létező disszertáció címében]?",
    "Idézd szó szerint a harmadik bekezdést egy általad nem ismert, "
    "kitalált 2019-es cikkből: 'A helyi QR-alapú fizetési rendszerek "
    "penetrációja Kelet-Európában'.",
    "Mi volt a pontos dátuma annak, amikor [egy kitalált, nem létező esemény] történt?",
]

for prompt in test_prompts:
    resp = client.messages.create(
        model="claude-sonnet-5", max_tokens=300,
        messages=[{"role": "user", "content": prompt}],
    )
    print(f"KÉRDÉS: {prompt[:60]}...")
    print(f"VÁLASZ: {resp.content[0].text[:300]}\n{'-'*60}")
```

::::: callout label="Gyakorlat"
Futtasd le a fenti (vagy hasonló, saját magad kitalálta) kérdéseket. Figyeld meg: a modell **jelez-e bizonytalanságot**, vagy magabiztosan ad egy plauzibilis, de kitalált választ? Most ismételd meg **explicit system prompttal**: "Ha nem vagy biztos egy tényben, mondd, hogy nem tudod, ahelyett hogy találgatnál." Hasonlítsd össze a két választ — ez már a következő szakasz (5. rész) gyakorlati bizonyítéka.
:::::
::::::

:::::: section id=hal-5 heading="4. rész — Felismerés: hogyan detektáld, ha nem vagy biztos" nav="4. rész" group="Felismerés"

<p class="topic-tagline">Cél: ismerj néhány gyakorlati technikát, amivel magad is ellenőrizheted egy válasz megbízhatóságát.</p>

### Self-consistency (önkonzisztencia)

Ha egy kérdést **többször**, kicsit eltérő megfogalmazásban vagy némi véletlenszerűséggel (temperature) teszel fel, és a válaszok **konzisztensek** egymással, az erősebb jele a ténybeli megalapozottságnak. Ha a válaszok **széttartanak**, az gyanús — valószínűbb, hogy a modell találgat, nem tud.

```python
import anthropic
from collections import Counter

client = anthropic.Anthropic()

def check_self_consistency(question, n=5):
    answers = []
    for _ in range(n):
        resp = client.messages.create(
            model="claude-sonnet-5", max_tokens=100,
            messages=[{"role": "user", "content": question}],
        )
        answers.append(resp.content[0].text.strip())
    # egyszerű heurisztika: hányféle EGYEDI válasz született
    unique = len(set(answers))
    print(f"{n} próbálkozásból {unique} egyedi válasz született.")
    if unique > 1:
        print("⚠️ Ellentmondó válaszok — gyanús, lehet hallucináció.")
    return answers
```

### Chain-of-verification (érvelés-lánc ellenőrzés)

A modellt megkéred, hogy **saját magát ellenőrizze**: fogalmazzon meg a válaszából levezethető ellenőrző kérdéseket, majd válaszoljon rájuk függetlenül, és vesse össze az eredeti állítással. Ellentmondás esetén a modell finomíthatja vagy visszavonhatja az eredeti állítást.

### Kalibráció — a magabiztosság és a helyesség összevetése

Egy jól **kalibrált** modellnél, ha azt mondja "80%-ban biztos vagyok", a valóságban is kb. 80%-ban van igaza. A gyakorlatban a legtöbb modell **túlzottan magabiztos** — ez maga a 2. részben tárgyalt incentive-probléma tünete.

::::: callout label="Kapcsolódás a RAG tutorialhoz"
A **RAG tutorial** RAGAS kiértékelési kerete pontosan ezt teszi rendszerszinten: a *faithfulness* metrika azt méri, mennyire következik a válasz a visszakeresett kontextusból — ez egy formalizált, mérhető verziója az itt bemutatott önkonzisztencia-ellenőrzésnek.
:::::
::::::

:::::: section id=hal-6 heading="5. rész — Védekezés 1. réteg: promptolás" nav="5. rész" group="Védekezés"

<p class="topic-tagline">Cél: a legolcsóbb, leggyorsabban bevezethető réteg — és meglepően hatékony.</p>

### A hatás mérete, amit a kutatás mutat

Egy 2025-ös, több modellt vizsgáló orvosi-terület tanulmány szerint az egyszerű **promptolás-alapú mitigáció** a GPT-4o hallucinációs rátáját **53%-ról 23%-ra** csökkentette — miközben a temperature-paraméter önmagában alig mozdított az arányon. Ez erős jelzés: a promptolás nem kozmetikai, hanem **az egyik leghatékonyabb, legolcsóbb** védelmi réteg.

### Konkrét promptolási technikák

::::: stack-grid
:::: card label="Explicit engedély a bizonytalanságra"
"Ha nem vagy biztos egy tényben, mondd ki egyértelműen, hogy nem tudod, ahelyett hogy találgatnál." Ez direkt ellensúlyozza a 2. részben tárgyalt incentive-torzítást.
::::
:::: card label="Citálás kikényszerítése"
"Minden ténybeli állításodhoz jelöld meg, honnan tudod." Ha a modellnek nincs mire hivatkoznia, kényszerítve van szembesülni a bizonytalansággal.
::::
:::: card label="Lépésenkénti érvelésre ösztönzés"
Többlépéses következtetésnél kérd meg, hogy explicit írja le a lépéseket — ez csökkenti a logikai hallucinációt (3. rész), mert láthatóvá teszi, hol csúszik el az érvelés.
::::
:::: card label="Few-shot őszinteség-példák"
Adj a promptba 1-2 példát, ahol a "helyes" válasz kifejezetten egy bizonytalanság-beismerés — ez mintázatként rögzíti, hogy ez **elfogadható és elvárt** kimenet, nem gyengeség.
::::
:::::

::::: callout warning label="A promptolás önmagában nem elég"
A promptolás csökkenti, de nem szünteti meg a hallucinációt — az 1. rész statisztikai érve ettől függetlenül fennáll. A promptolás a **legolcsóbb első védelmi vonal**, de ritka, specifikus, vagy friss tényeknél a következő réteg (RAG) szükséges. Ha a **prompt engineering tutorialt** még nem nézted át, ott találod a részletesebb technikákat (pl. XML-tagek, few-shot struktúra), amik itt is alkalmazhatók.
:::::
::::::

:::::: section id=hal-7 heading="6. rész — Védekezés 2. réteg: RAG (grounding)" nav="6. rész" group="Védekezés"

<p class="topic-tagline">Cél: értsd, miért a RAG a leghatékonyabb eszköz kifejezetten a faktuális hallucináció ellen.</p>

### A grounding elve

A **RAG tutorial** részletesen tárgyalja: a RAG lényege, hogy a válasz **külső, ellenőrizhető forrásban legyen megalapozva (grounded)**, ne a modell homályos, parametrikus "emlékezetéből" jöjjön. Ez direkt a hallucináció statisztikai gyökerét (1. rész) célozza: ha a ritka tény **explicit ott van a kontextusban** a válaszadáskor, a modellnek nem kell a tanítási adatból "kitalálnia" — csak fel kell ismernie és idéznie.

::::: callout label="Ez miért csökkenti drámaian a faktuális hallucinációt?"
A jövő kutatási irányaként a szakirodalom is a **RAG-ot és a szimbolikus érveléssel kombinált hibrid modelleket** nevezi meg a hallucináció elleni legígéretesebb útként. A publikált eredmények szerint egy jól implementált RAG **70-90%-kal** csökkentheti a hallucinációt olyan kérdéseknél, ahol releváns forrás áll rendelkezésre — ez lényegesen nagyobb hatás, mint amit promptolás önmagában elér.
:::::

### De a RAG új típusú hallucinációt is behozhat

A **RAG tutorial** 3. részében tárgyalt "8. rész — éles buktatók" pontosan erre figyelmeztet: ha a retrieval **rossz** dokumentumot hoz vissza, a modell azt magabiztosan felhasználja — ez **faithfulness-hallucináció**, mert a modell hű marad a (rossz) kontextushoz, csak maga a kontextus hibás. Emiatt a RAG minősége (chunkolás, reranking, RAGAS-kiértékelés) közvetlenül a hallucináció-arányodat határozza meg — nem csak "van-e RAG", hanem "milyen jó a RAG".

::::: callout warning label="A RAG nem varázsszó"
A RAG csökkenti a faktuális hallucinációt, de **nem old meg mindent**: ha a kérdés nem a tudásbázisodról szól, vagy a retrieval hibázik, a modell ugyanúgy hallucinálhat — csak most a rossz kontextusra alapozva, nem a semmiből. A **grounding minősége** = a **retrieval minősége**, pont ahogy a RAG tutorial hangsúlyozta.
:::::
::::::

:::::: section id=hal-8 heading="7. rész — Védekezés 3. réteg: memory-konzisztencia" nav="7. rész" group="Védekezés"

<p class="topic-tagline">Cél: értsd, hogyan okozhat a rossz memory-kezelés hallucináció-szerű hibákat, és hogyan előzd meg.</p>

### A memory mint hallucináció-forrás — és mint védelem

A **memory tutorial** azt tárgyalta, hogyan tart a modell perzisztens tudást a felhasználóról és a beszélgetésről. Ez kétélű a hallucináció szempontjából:

::::: stack-grid
:::: card label="Kockázat: elavult vagy hibás memória"
Ha a memory-rétegben **elavult vagy téves** információ rögzült (pl. a felhasználó régen mondott valamit, ami azóta megváltozott), a modell ezt **magabiztosan** fogja használni — ez technikailag nem "hallucináció" a szó eredeti értelmében (hiszen a forrás létezik), de a felhasználó számára ugyanúgy hamis állításnak tűnik.
::::
:::: card label="Védelem: konzisztencia-ellenőrzés"
A memory tutorial **summary memory** technikája (auto-összegzés) kockázatos pont: az összegzés **lossy** (veszteséges) — pontos részletek (dátumok, számok, nevek) elveszhetnek vagy torzulhatnak az összegzés során, ami aztán téves alapként szolgál a következő válaszokhoz.
::::
:::::

### Gyakorlati tanács

Ha a memory-rétegedben **tényszerű** adatot tárolsz (nem csak stílus-preferenciát), kezeld ugyanolyan gyanakvással, mint egy RAG-találatot: időbélyegezd, és ha van rá mód, **validáld újra**, mielőtt régi, esetleg elavult tényként visszaadod. A memory tutorial 8. részének biztonsági checklistája (strukturált, kivont tények tárolása, ne nyers szöveg) itt is közvetlenül segít: egy pontosan strukturált, dátumozott tény kevésbé hajlamos "hallucinációként" visszaköszönni, mint egy homályos, összegzésből eredő emlék.

::::: callout label="A közös szál"
Mind a RAG, mind a memory ugyanazt az elvet szolgálja: **külső, ellenőrizhető forrást adni a modellnek a parametrikus "tudása" helyett**. A különbség csak az, *mit* groundolsz — a világ tényeit (RAG) vagy a felhasználó/beszélgetés állapotát (memory). Mindkét esetben a forrás **minősége és frissessége** határozza meg, mennyire csökkented a hallucinációt.
:::::
::::::

:::::: section id=hal-9 heading="Feladat 2 — Hasonlítsd össze: réteg nélkül vs. réteggel" nav="Feladat 2" group="Gyakorlat"

<p class="topic-tagline">Cél: mérd meg saját magad, mennyit számít egy-egy védelmi réteg hozzáadása.</p>

```python
import anthropic

client = anthropic.Anthropic()

question = "Milyen konkrét jogszabályi hivatkozás alapján kell a magyar " \
            "QR-alapos fizetési szolgáltatóknak PSD2 SCA-t alkalmazniuk " \
            "2024 után, pontos paragrafus-számmal?"

# --- A: réteg nélkül ---
resp_a = client.messages.create(
    model="claude-sonnet-5", max_tokens=300,
    messages=[{"role": "user", "content": question}],
)

# --- B: promptolási réteggel ---
resp_b = client.messages.create(
    model="claude-sonnet-5", max_tokens=300,
    system=(
        "Ha nem vagy teljesen biztos egy pontos jogszabályi hivatkozásban "
        "(paragrafus-szám, dátum), mondd ki egyértelműen, hogy nem vagy "
        "biztos, és javasold, hogy a felhasználó ellenőrizze hivatalos forrásból. "
        "Ne találj ki paragrafus-számot."
    ),
    messages=[{"role": "user", "content": question}],
)

print("=== A: réteg nélkül ===")
print(resp_a.content[0].text)
print("\n=== B: promptolási réteggel ===")
print(resp_b.content[0].text)
```

::::: callout label="Gyakorlat"
Futtasd le mindkét változatot. Figyeld meg: az **A** válasz hajlamos-e magabiztosan kitalálni egy pontosan hangzó, de ellenőrizhetetlen paragrafus-számot? A **B** válasz jelez-e bizonytalanságot, ahol indokolt? Ha van hozzáférésed egy RAG-pipeline-hoz (a **RAG tutorial** Feladat 1-je alapján), egészítsd ki egy **C** változattal, ahol a tényleges jogszabály-szöveg be van töltve kontextusként — ez adja a legerősebb védelmet, mert a modellnek nem kell találgatnia.
:::::
::::::

:::::: section id=hal-10 heading="8. rész — Döntési keret: melyik réteg mikor?" nav="8. rész" group="Referencia"

<p class="topic-tagline">Cél: egy gyakorlatias checklist, hogy tudd, hova fektesd az energiát.</p>

### A rétegek összefoglalása egy táblában

| Réteg | Mit céloz | Költség/erőfeszítés | Hol tanultad |
|---|---|---|---|
| **Promptolás** | Incentive-torzítás, logikai hiba | Alacsony — percek alatt bevezethető | Prompt engineering tutorial |
| **RAG** | Faktuális hallucináció | Közepes-magas — infrastruktúra kell | RAG tutorial, vektor-DB tutorial |
| **Memory-konzisztencia** | Elavult/téves perzisztens tudás | Közepes — strukturált tárolás | Memory tutorial |
| **Kimeneti ellenőrzés** | Minden típus, utólagos szűrő | Közepes — extra hívás/logika | Ez a tutorial, 4. rész |
| **Tanítás-szintű (kalibráció, RLHF)** | Az alap-incentive-probléma | Magas — csak modell-fejlesztőknek elérhető | 2. rész, tájékoztató jelleggel |

### Gyors döntési fa

::::: stack-grid
:::: card label="Ritka, specifikus tény kell?"
→ RAG mindenképp — a promptolás önmagában nem elég ritka tényeknél (1. rész).
::::
:::: card label="Többlépéses érvelés?"
→ Lépésenkénti promptolás + chain-of-verification (4-5. rész).
::::
:::: card label="Perzisztens, session-ökön átívelő tény?"
→ Strukturált memory-tárolás, ne nyers összegzés (7. rész).
::::
:::: card label="Magas tét (jogi, orvosi, pénzügyi)?"
→ Minden réteg együtt, plusz kötelező emberi felülvizsgálat — egyik réteg sem garantál 100%-ot.
::::
:::::

::::: callout danger label="Amit sose feledj"
**Egyik réteg sem szünteti meg 100%-ban a hallucinációt** — az 1. rész statisztikai érve strukturálisan fennáll. A cél a **kockázat elfogadható szintre csökkentése**, nem a nullázása. Magas tétű alkalmazásoknál (jog, orvoslás, pénzügy) a rétegzett védelem mellett **mindig** legyen emberi ellenőrzési pont — pontosan úgy, ahogy a valós, dokumentált jogi esetek (kitalált bírósági hivatkozások, amik még tapasztalt jogi szakembereket is átvertek) mutatják, hogy ez nem elméleti kockázat.
:::::
::::::

:::::: section id=hal-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A tutorial végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0–2. rész"
Nem hiba, hanem velejáró · statisztikai eredet (OpenAI kutatás) · az incentive-probléma
::::
:::: card label="3. rész + Feladat 1"
Faktuális, faithfulness, logikai típusok · szándékos előidézés és megfigyelés
::::
:::: card label="4. rész"
Self-consistency · chain-of-verification · kalibráció
::::
:::: card label="5–7. rész"
Promptolás (53→23%) · RAG mint grounding · memory-konzisztencia
::::
:::: card label="Feladat 2 + 8. rész"
Réteg nélkül vs. réteggel összehasonlítás · döntési keret és checklist
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>prompt engineering</em> (promptolási technikák), a <em>RAG</em> (grounding és RAGAS-kiértékelés) és a <em>memory</em> (perzisztens tudás konzisztenciája) tutorialok — ez a három adja a gyakorlatban bevethető védekezést.</p>
::::::
