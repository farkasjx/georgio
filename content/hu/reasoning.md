---
page: reasoning
title: Reasoning — hogyan old meg egy AI egy összetett feladatot?
sidebar_groups:
  - Elmélet
  - A folyamat
  - Gyakorlati példák
  - Határok
  - Referencia
hero:
  eyebrow: "Reasoning · Fejlesztői Tanulási Terv"
  title: "Reasoning — <em>hogyan old meg egy AI egy összetett feladatot?</em>"
  lead: "Amikor feltöltesz egy Excelt és azt mondod, elemezze és csináljon grafikont, a modell nem varázsütésre \"érti meg\" a táblát. Attention, gondolkodó tokenek (chain-of-thought) és eszközhasználat (tool use) játszik össze egy láthatóan követhető hurokban — se nem \"csak jósol\", se nem \"gondolkodik, mint egy ember\". Épít a <em>Prompt Engineering</em> és az <em>MCP</em> tutorialokra."
  stats:
    - { val: "7", lbl: "Szakasz" }
    - { val: "2", lbl: "Élő példa" }
    - { val: "3", lbl: "Mechanizmus" }
    - { val: "0", lbl: "Transformer-matek" }
footer:
  left: "AI Hub · Reasoning"
  right: "Reasoning · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#reasoning-0"><div class="tc-num">0. rész</div><div class="tc-name">A tévhit</div><div class="tc-desc">"Csak statisztikai papagáj" vs. "megérti, mint egy ember".</div></a>
  <a class="toc-card" href="#reasoning-1"><div class="tc-num">1. rész</div><div class="tc-name">Attention — csak amennyi kell</div><div class="tc-desc">Mire "figyel" a modell, és miért fér bele egyszerre a tábla és a kérdésed.</div></a>
  <a class="toc-card" href="#reasoning-2"><div class="tc-num">2. rész</div><div class="tc-name">Reasoning / chain-of-thought</div><div class="tc-desc">Mi a "gondolkodó token", és miért javít a pontosságon.</div></a>
  <a class="toc-card" href="#reasoning-3"><div class="tc-num">3. rész</div><div class="tc-name">Élő példa: az Excel-feladat</div><div class="tc-desc">Lépésről lépésre, a feltöltéstől a grafikonig.</div></a>
  <a class="toc-card" href="#reasoning-4"><div class="tc-num">4. rész</div><div class="tc-name">Ugyanez kódolásnál</div><div class="tc-desc">Az agentic coding loop — ugyanaz a minta.</div></a>
  <a class="toc-card" href="#reasoning-5"><div class="tc-num">5. rész</div><div class="tc-name">Amit ez NEM csinál</div><div class="tc-desc">A reasoning határai — hallucináció, hűtlen indoklás.</div></a>
  <a class="toc-card" href="#reasoning-6"><div class="tc-num">6. rész</div><div class="tc-name">Hova illeszkedik mindez?</div><div class="tc-desc">Vektor-DB, RAG és reasoning — a teljes kép.</div></a>
</div>
::::::

:::::: section id=reasoning-0 num="00" heading="0. rész — A tévhit: sem papagáj, sem ember" nav="A tévhit" group="Elmélet"

<p class="topic-tagline">Cél: tisztázd a két leggyakoribb, egymásnak ellentmondó félreértést.</p>

### Két hibás, de gyakori kép

Amikor feltöltesz egy Excel-táblát és azt mondod egy AI-nak, "nézd át, és csinálj belőle grafikont", könnyű az egyik szélsőséges magyarázatba esni:

::::: compare
::: bad label="1. \"Csak statisztikai papagáj\""
A modell állítólag pusztán a legvalószínűbb következő tokent jósolja, a bemenet vektorok közti hasonlóság-keresés, nincs benne semmi, amit "gondolkodásnak" hívhatnánk. Ez a kép **elavult** — nem magyarázza meg, hogyan ír a modell futtatható Python-kódot egy táblára, amit még sosem látott.
:::
::: good label="2. \"Megérti, mint egy ember\""
A modell állítólag elolvassa az Excelt, "felfogja" a jelentését, és tudatosan eldönti, mit csináljon — ahogy egy kolléga tenné. Ez a kép **túlzó** — nincs mögötte tartós, tudatos world model, és a modell ugyanannyira magabiztosan hibázhat, mint ahogy jól old meg valamit.
:::
:::::

### A valóság a kettő között van

A modell **nem ért meg** semmit abban az értelemben, ahogy egy ember — de az sem igaz, hogy "csak vektorok alapján hasonlóságot keres és tokent jósol". Ami valójában történik, az **három, jól megkülönböztethető mechanizmus** összjátéka egy hurokban:

::::: stack-grid
:::: card label="1 · Attention"
A modell minden token generálásakor "odafigyel" a releváns korábbi tokenekre — a te kérdésedre és az Excel tartalmára egyszerre.
::::
:::: card label="2 · Reasoning"
A modell nem egyből válaszol, hanem lépésenkénti, tervező jellegű "gondolkodó" tokeneket generál, mielőtt a végső választ vagy kódot megírná.
::::
:::: card label="3 · Tool use"
A modell **kódot ír, lefuttatja** egy sandboxban, elolvassa az eredményt (vagy a hibaüzenetet), és szükség esetén javít — ez egy hurok, nem egyetlen pillanat.
::::
:::::

::::: callout label="Egy mondatban"
Amikor azt hiszed, a modell "megértette" az Excelt, valójában ez a három mechanizmus zajlott le egymás után — ezt a folyamatot bontja szét ez a tutorial, lépésről lépésre.
:::::
::::::

:::::: section id=reasoning-1 num="01" heading="1. rész — Attention: csak amennyi a megértéshez kell" nav="Attention alapok" group="Elmélet"

<p class="topic-tagline">Cél: annyit érts az attention-ből, ami a reasoning megértéséhez kell — nem többet.</p>

### Mire figyel a modell

A transformer-architektúra lényege — mély matek nélkül —, hogy minden egyes token generálásakor a modell egy **súlyozott pillantást** vet az addig látott összes tokenre (a kérdésedre, az Excel feltöltött tartalmára, a korábbi válaszaira), és eldönti, melyikek a legrelevánsabbak az éppen következő szó/token szempontjából. Ez a **self-attention** mechanizmus — innen a "figyelem" elnevezés.

Ez teszi lehetővé, hogy amikor azt írod, "nézd át ezt az Excelt, és csinálj grafikont az árbevételről", a modell egyszerre tudjon:
- **odafigyelni** a táblázat releváns oszlopaira (nem az összesre egyenlő súllyal),
- **összekötni** ezt a te kérésed kulcsszavaival ("árbevétel", "grafikon"),
- és mindezt **egyetlen, koherens folyamban** tartani, amíg a válasz el nem készül.

### Miért fontos ez a reasoninghoz

Az attention nem "gondolkodás" — inkább az a mechanizmus, ami **lehetővé teszi**, hogy a modell kontextusban maradjon, miközben több lépésben dolgozik egy feladaton. A következő részben ("2. rész — Reasoning") pont ez a "több lépés" kerül középpontba: a modell nem egyetlen attention-pillantásból adja a végső választ, hanem **sok egymásra épülő lépésben**, amelyek mindegyike új attention-kört jelent az addigi gondolatmenetre is.

::::: callout label="Egy mondatban"
Az attention teszi lehetővé, hogy a modell a hosszú Excel-tartalmat ÉS a rövid kérdésedet egyszerre, súlyozottan tartsa szem előtt — ez az alapja mindennek, ami ez után történik.
:::::
::::::

:::::: section id=reasoning-2 num="02" heading="2. rész — Reasoning: a \"gondolkodó token\"" nav="Reasoning / CoT" group="A folyamat"

<p class="topic-tagline">Cél: értsd, mi történik a végső válasz előtt, és miért javítja ez a pontosságot.</p>

### A chain-of-thought lényege

A **reasoning** (más néven *extended thinking* vagy *chain-of-thought*) azt jelenti, hogy a modell a végső válasz megírása **előtt** egy sor köztes, tervező jellegű tokent generál — ezekben végiggondolja a feladatot, felsorolja a lépéseket, néha kipróbál egy megközelítést, elveti, másikat választ. Ez **tanult mintázat**: a modellt úgy tanították (és hangolták RLHF-fel, lásd a **RLHF tutorial**), hogy ez a köztes "gondolkodás" statisztikailag jobb végeredményhez vezet, nem azért, mert a modellben egy tudatos "én" ülne és fontolgatna.

::::: callout label="Fontos pontosítás"
A reasoning **nem azonos** az emberi tudatos gondolkodással. Nincs mögötte folytonos "én", ami emlékszik a beszélgetés előtti gondolataira, vagy ami "tudja, hogy tudja". A gondolkodó tokenek **maguk is** csak tokenek — a modell ugyanazzal a mechanizmussal generálja őket, mint bármely más szöveget, csak egy más *célra* optimalizált mintázat szerint.
:::::

### Miért javít mégis a pontosságon

Empirikusan jól dokumentált jelenség, hogy a köztes lépések generálása javítja a komplex feladatok (matek, több lépéses logika, kódolás) pontosságát — néhány ok, ami emögött áll:

::::: stack-grid
:::: card label="Több \"számítási lépés\""
Egy nehéz feladatot egy lépésben megoldani korlátozott — a köztes tokenek több "számítási kört" adnak a modellnek, mielőtt elköteleződne egy válasz mellett.
::::
:::: card label="Terv, mielőtt válasz"
A modell explicit felsorolhatja, milyen részfeladatokra bontja a problémát (pl. "előbb be kell olvasnom az adatot, aztán eldönteni, milyen grafikon illik rá") — ez csökkenti az elhamarkodott, felszínes válaszokat.
::::
:::: card label="Önellenőrzés"
A gondolkodás közben a modell néha észreveszi a saját hibáját ("várj, ez az oszlop dátum, nem szám") — ez egyfajta köztes önjavítás, mielőtt a végleges válasz megszületne.
::::
:::::

### Ez nem egyenlő a tool use-zal

Fontos különbség: a reasoning **önmagában** még nem old meg olyan feladatot, mint egy Excel elemzése — az csak "gondolkodó szöveg", nem futtatható kód, és nem fér hozzá a fájlhoz azon túl, amit a kontextusba beolvastak belőle. Az Excel-feladatnál a reasoning **eldönti a tervet** ("pandas-szal beolvasom, aztán matplotlib-bel ábrázolom"), de a **végrehajtást** egy másik mechanizmus, a **tool use** végzi — ez a következő rész témája.
::::::

:::::: section id=reasoning-3 num="03" heading="3. rész — Élő példa: az Excel-feladat végigkövetve" nav="Excel-példa" group="Gyakorlati példák"

<p class="topic-tagline">Cél: lásd pontosan, mi történik lépésről lépésre, amikor feltöltesz egy Excelt és grafikont kérsz.</p>

### A teljes hurok

Amikor azt mondod egy AI-nak, "itt egy Excel, nézd át, és csinálj grafikont belőle", az alábbi lépések futnak le — ez az, amit a bevezetőben **agentic loop**-nak neveztünk:

| # | Lépés | Mi történik valójában |
|---|---|---|
| 1 | **Fájl beolvasás** | A rendszer beolvassa a fájlt (pl. `pandas.read_excel`), és a tartalom (vagy egy előnézete) bekerül a modell kontextusába. |
| 2 | **Attention a kérésre + tartalomra** | A modell (1. rész) egyszerre figyel a kérésedre ("csinálj grafikont") és a tábla struktúrájára (oszlopnevek, adattípusok). |
| 3 | **Reasoning: terv** | A modell végiggondolja (2. rész): milyen oszlopok relevánsak, milyen grafikontípus illik az adatra (vonaldiagram idősornál, oszlopdiagram kategóriáknál), milyen könyvtárral valósítja meg. |
| 4 | **Kódgenerálás** | A modell **Python-kódot ír** (pl. `pandas` a feldolgozáshoz, `matplotlib`/`plotly` az ábrázoláshoz) — ez még nem futtatás, csak a terv kód formában. |
| 5 | **Sandbox-futtatás** | A kód **ténylegesen lefut** egy elszigetelt környezetben — ez az igazi "csinálás", nem a modell fejében, hanem egy külső interpreterben. |
| 6 | **Eredmény visszaolvasása** | A modell megkapja a futtatás kimenetét: sikeres ábra, vagy egy hibaüzenet (pl. `KeyError: 'Árbevétel'`, mert az oszlop valójában `"Bevétel"`). |
| 7 | **Iteráció, ha kell** | Hiba esetén a modell **újra reasoning-ol** ("ja, az oszlopnév más"), **javítja a kódot**, és újra futtatja — ez a hurok addig ismétlődik, amíg működik, vagy amíg fel nem adja és jelzi a problémát. |

::::: callout label="A kulcs-felismerés"
A "megértés" illúziója valójában ebből a **hurokból** fakad: a modell nem egyszerre "látja át" a táblát, hanem **kódot ír, lefuttatja, és a hibaüzenetből tanul** — pontosan úgy, ahogy egy ember is tenné, ha még sosem látott adatszerkezettel dolgozna Pythonban.
:::::

### Egy tipikus generált kódrészlet

```python
import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_excel("adatok.xlsx")
print(df.columns.tolist())  # a modell gyakran ezt futtatja először, hogy lássa az oszlopneveket

df.plot(x="Hónap", y="Bevétel", kind="line", title="Havi bevétel alakulása")
plt.savefig("grafikon.png")
```

Figyeld meg: az első sor (`print(df.columns.tolist())`) gyakran **önálló, felderítő lépés** — a modell "reasoning" közben eldönti, hogy előbb meg kell néznie a tényleges oszlopneveket, mielőtt a végleges grafikon-kódot megírná. Ez a **felderítés → terv → végrehajtás → ellenőrzés** minta a reasoning + tool use együttműködésének tankönyvi példája.

::::: callout warning label="Gyakorlat"
Ha van hozzáférésed egy olyan AI-hoz, ami mutatja a "gondolkodás" (thinking) blokkját, tölts fel egy saját, valóban rendezetlen Excel-táblát (vegyes oszlopnevek, üres cellák), és kérj belőle grafikont. Olvasd el a gondolkodás-blokkot: látni fogod benne pontosan a fenti 7 lépés lenyomatát — a felderítést, a tervet, és ha hibázik, a javítást.
:::::
::::::

:::::: section id=reasoning-4 num="04" heading="4. rész — Ugyanez kódolásnál: az agentic coding loop" nav="Ugyanez kódolásnál" group="Gyakorlati példák"

<p class="topic-tagline">Cél: ismerd fel ugyanazt a mintát egy másik, gyakori felhasználásban.</p>

### Ugyanaz a hurok, más tartalom

Amikor egy AI-tól kódolási feladatot kérsz (pl. "javítsd ki ezt a bugot", vagy "írj egy tesztet erre a függvényre"), **pontosan ugyanaz** a hurok fut le, mint az Excel-példában, csak a "tábla" helyett most **kódbázis**, a "grafikon" helyett **működő, tesztelt kód** a cél:

::::: stack-grid
:::: card label="1 · Felderítés"
A modell beolvassa a releváns fájlokat, keres a kódbázisban (grep-szerű eszközökkel), hogy megértse a kontextust — mielőtt bármit írna.
::::
:::: card label="2 · Reasoning: terv"
Végiggondolja, mi okozza a hibát, vagy hogyan kell felépíteni az új funkciót — gyakran explicit felsorolva a lépéseket.
::::
:::: card label="3 · Kódírás"
Megírja vagy módosítja a kódot (`str_replace`-szerű eszközökkel, vagy teljes fájl generálásával).
::::
:::: card label="4 · Futtatás/tesztelés"
Lefuttatja a teszteket vagy a programot — ez az igazi visszajelzés, nem a modell "érzése" arról, hogy jó-e a kód.
::::
:::: card label="5 · Hiba olvasása, javítás"
Ha a teszt elbukik, elolvassa a hibaüzenetet/stack trace-t, és **ez alapján**, nem találgatásból, javít.
::::
:::: card label="6 · Ismétlés, amíg zöld"
A hurok addig fut, amíg a tesztek át nem mennek, vagy amíg a modell fel nem ismeri, hogy emberi döntés kell (pl. kétértelmű specifikáció).
::::
:::::

::::: callout label="A párhuzam lényege"
Az Excel-elemzés és a kódolás **ugyanazon a mintán** fut: felderítés → reasoning (terv) → végrehajtás egy külső eszközzel → az eszköz **valós** visszajelzésének elolvasása → iteráció. A "megértés" mindkét esetben ebből a **megfigyelhető, ismételhető folyamatból** áll össze, nem egy rejtett, egyszeri "aha-élményből".
:::::
::::::

:::::: section id=reasoning-5 num="05" heading="5. rész — Amit ez a folyamat NEM csinál" nav="A határok" group="Határok"

<p class="topic-tagline">Cél: ne romantizáld túl a reasoning-ot — ismerd a korlátait is.</p>

### A reasoning is tévedhet

::::: callout danger label="Fontos korlátok"
**✗** A reasoning közben is **hallucinálhat** a modell — egy magabiztosan felsorolt "terv" lépései lehetnek tévesek, még akkor is, ha jól strukturáltnak tűnnek (lásd a **Halucináció tutorial**). · **✗** A modell **nem "tudja", hogy tudja** — nincs megbízható belső jelzés arra, mennyire biztos a válaszában; a magabiztosság hangneme nem arányos a tényleges helyességgel. · **✗** A gondolkodás-blokk **nem mindig hű tükre** a ténylegesen lezajlott számításnak — a modell néha más okból jut el egy válaszhoz, mint amit a gondolkodásában "elmesél"; ez aktívan kutatott terület (interpretálhatóság / *faithfulness*). · **✗** Nincs tartós, folyamatos **world model** — minden egyes feladatnál "nulláról" építi fel a kontextust a beszélgetés/fájlok alapján, nincs emberi értelemben vett hosszú távú, egységes világkép.
:::::

### Miért fontos ez gyakorlatban

Ha az Excel-példádban a modell magabiztosan generál egy grafikont, **még nem jelenti azt, hogy az adat-értelmezése helyes** — pl. összekeverheti az oszlopok jelentését, ha azok félreérthetők (pl. két oszlop is "Összeg" néven). A **sandbox-futtatás és az eredmény tényleges ellenőrzése** (3. rész, 6–7. lépés) az, ami ezt részben kordában tartja — nem a modell "meggyőződése". Éppen ezért érdemes a végeredményt (a grafikont, a kódot) **te magad is átnézni**, nem csak a gondolkodás-blokk meggyőző hangvételére hagyatkozni.

::::: callout label="Egy mondatban"
A reasoning javítja a pontosságot, de nem garantálja azt — a valódi ellenőrzés a **külső visszajelzésből** (futtatási eredmény, teszt, a te átnézésed) jön, nem a modell magabiztosságából.
:::::
::::::

:::::: section id=reasoning-6 num="06" heading="6. rész — Hova illeszkedik mindez a többi témába?" nav="Kapcsolódás" group="Referencia"

<p class="topic-tagline">Cél: lásd össze a nagy képet a vektor-DB és a RAG tutorialokkal.</p>

### A három tutorial együtt adja ki a teljes képet

::::: stack-grid
:::: card label="Vektor-adatbázisok"
**Hasonlóság-keresés**: szöveg → vektor, és a legközelebbi vektorok megtalálása. Ez egy **statikus keresési** művelet, nem generálás vagy tervezés.
::::
:::: card label="RAG"
**Tudás-injektálás**: a visszakeresett releváns dokumentumrészleteket a promptba illeszti, hogy a modell ezekre alapozva válaszoljon — a *mit tud a modell* kérdésre ad választ.
::::
:::: card label="Reasoning (ez a tutorial)"
**Generálás + tervezés + eszközhasználat**: a modell lépésről lépésre gondolkodik, kódot ír, futtat, és a visszajelzésből tanul — a *hogyan old meg egy feladatot* kérdésre ad választ.
::::
:::::

Egy komplex, valós felhasználásban (mint az Excel-elemzés) mindhárom együtt jelenhet meg: a modell **visszakereshet** releváns kontextust (RAG/vektor-DB, pl. egy korábbi beszélgetésből vagy dokumentációból), miközben **reasoning-gal** megtervezi és **tool use-zal** végrehajtja a konkrét feladatot.

::::: callout label="Zárógondolat"
A "megérti-e az AI, amit csinál" kérdésre a legpontosabb válasz: **nem úgy, ahogy egy ember, de messze nem is "csak jósol"** — egy megfigyelhető, lépésenkénti folyamat zajlik, amit ez a tutorial szétbontott: attention, reasoning, tool use, és a köztük lévő visszacsatolási hurok.
:::::
::::::

:::::: section id=reasoning-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A tutorial végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0–1. rész"
A "papagáj vs. ember" tévhit tisztázása · attention alapjai, amennyi a reasoning megértéséhez kell
::::
:::: card label="2. rész"
Mi a "gondolkodó token" (chain-of-thought) · miért javít a pontosságon · miért nem egyenlő a tool use-zal
::::
:::: card label="3–4. rész"
Az Excel-feladat és a kódolás **ugyanazon** agentic loop-ja: felderítés → terv → végrehajtás → visszajelzés → iteráció
::::
:::: card label="5. rész"
A reasoning korlátai: hallucinálhat, nem "tudja hogy tudja", a gondolkodás-blokk nem mindig hű tükör
::::
:::: card label="6. rész"
Hogyan illeszkedik a vektor-DB (keresés) és a RAG (tudás-injektálás) mellé — a teljes context engineering kép
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>Prompt Engineering</em> (hogyan írd le a feladatot) és az <em>MCP</em> (milyen eszközökhöz fér hozzá a modell) tutorialok.</p>
::::::
