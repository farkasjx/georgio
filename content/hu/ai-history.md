---
page: ai-history
title: AI történelem — a ciklusok, amik idáig vezettek
sidebar_groups:
  - Korai évek
  - A telek
  - A modern korszak
  - Referencia
hero:
  eyebrow: "AI történelem · Fejlesztői Tanulási Terv"
  title: "AI történelem — <em>a ciklusok, amik idáig vezettek</em>"
  lead: "2026-ban könnyű azt hinni, hogy az AI 2022-ben, a ChatGPT megjelenésével kezdődött. Valójában egy 76 éves, hullámzó történet állomásához érkeztünk — két nagy \"téllel\", amikor a terület majdnem teljesen leállt. Ez a cikk nem száraz évszám-lista: azt mutatja meg, milyen ismétlődő mintázat vezetett a mai agentic korszakig, és miért érdemes ismerni a teleket ahhoz, hogy a mai hype-ot is jól tudd megítélni."
  stats:
    - { val: "1950", lbl: "Turing kérdése" }
    - { val: "2", lbl: "AI-tél" }
    - { val: "2017", lbl: "a transformer éve" }
    - { val: "76", lbl: "év Turingtól máig" }
footer:
  left: "AI Hub · AI történelem"
  right: "AI történelem · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#ai-history-0"><div class="tc-num">0. rész</div><div class="tc-name">A gyakran kihagyott kezdet</div><div class="tc-desc">Turing kérdése és a Dartmouth-konferencia.</div></a>
  <a class="toc-card" href="#ai-history-1"><div class="tc-num">1. rész</div><div class="tc-name">Az első AI-tél</div><div class="tc-desc">Túlígért ígéretek, és amikor a pénzcsap elzárult.</div></a>
  <a class="toc-card" href="#ai-history-2"><div class="tc-num">2. rész</div><div class="tc-name">Szakértői rendszerek és a második tél</div><div class="tc-desc">Egy másfajta hype, ugyanaz a kifutás.</div></a>
  <a class="toc-card" href="#ai-history-3"><div class="tc-num">3. rész</div><div class="tc-name">A csendes újjáéledés</div><div class="tc-desc">Neurális hálók, adat, számítási kapacitás.</div></a>
  <a class="toc-card" href="#ai-history-4"><div class="tc-num">4. rész</div><div class="tc-name">A transformer-forradalom</div><div class="tc-desc">Egyetlen 2017-es cikk, ami mindent megváltoztatott.</div></a>
  <a class="toc-card" href="#ai-history-5"><div class="tc-num">5. rész</div><div class="tc-name">A ChatGPT-pillanat</div><div class="tc-desc">Nem új technológia — új csomagolás.</div></a>
  <a class="toc-card" href="#ai-history-6"><div class="tc-num">6. rész</div><div class="tc-name">A reasoning és agentic korszak</div><div class="tc-desc">Ahol most tartunk.</div></a>
  <a class="toc-card" href="#ai-history-7"><div class="tc-num">7. rész</div><div class="tc-name">Mit tanulhatunk a ciklusokból</div><div class="tc-desc">A minta, ami minden hullámban megismétlődött.</div></a>
</div>
::::::

:::::: section id=ai-history-0 num="00" heading="0. rész — A gyakran kihagyott kezdet: Turing kérdése és Dartmouth" nav="A gyakran kihagyott kezdet" group="Korai évek"

<p class="topic-tagline">Cél: lásd, hogy az AI nem egy 2020-as évekbeli jelenség — a gyökerei sokkal mélyebbre nyúlnak.</p>

### 1950: egy kérdés, ami máig visszhangzik

Alan Turing 1950-ben publikálta a *"Computing Machinery and Intelligence"* című tanulmányát, amiben feltette a kérdést: *"gondolkodhatnak-e a gépek?"* Az általa javasolt teszt (az "Imitation Game", ma Turing-tesztként ismert) volt az első formális kísérlet arra, hogy egyáltalán definiálják, mit jelentene ez.

::::: callout label="1956: a névadó pillanat"
A **Dartmouth-konferencián** John McCarthy megalkotta magát az **"artificial intelligence"** kifejezést — ez a pillanat tekinthető a terület formális születésének. A résztvevők optimizmusa túláradó volt: sokan úgy gondolták, néhány évtizeden belül megoldott lesz az emberi szintű gépi gondolkodás.
:::::

### Az első technikai áttörés

::::: callout label="1958: a perceptron"
Frank Rosenblatt megépítette a **perceptront** — az első, tanulásra képes, egyrétegű neurális hálót. Ez volt a **connectionist** (kapcsolat-alapú) megközelítés első komoly technikai megvalósítása, szemben a **szimbolikus** (szabály-alapú) megközelítéssel, ami akkoriban a fő irányvonal volt.
:::::

::::: callout label="Egy mondatban"
Az AI nem 2022-ben kezdődött — egy 76 éves, hullámzó történet jelenlegi állomásánál tartunk, és ez a hullámzás (nem a folyamatos, egyenletes fejlődés) az, ami a következő részekben a legfontosabb tanulságot adja.
:::::
::::::

:::::: section id=ai-history-1 num="01" heading="1. rész — Az első AI-tél: túlígért ígéretek" nav="Az első AI-tél" group="A telek"

<p class="topic-tagline">Cél: érts meg egy visszatérő mintázatot, ami később kétszer is megismétlődött.</p>

### Amikor az elméleti korlát valósággá vált

::::: callout danger label="1969: a Perceptrons könyv"
Marvin Minsky és Seymour Papert kimutatták, hogy az **egyrétegű perceptron** matematikailag képtelen megoldani az **XOR-problémát** — egy alapvető logikai függvényt. Bár ez nem volt általános kritika minden neurális hálóra, a hatás mégis az volt, hogy világszerte **leálltak a hálózat-alapú kutatások finanszírozásai**.
:::::

### A pénzcsap elzárása

::::: callout label="A Lighthill-jelentés (1973)"
Az Egyesült Királyságban egy kormányzati jelentés élesen kritizálta az AI-kutatás addigi eredményeit, ami közvetlen **finanszírozás-megvonáshoz** vezetett Európában és az USA-ban egyaránt. Ezzel párhuzamosan az **ALPAC-jelentés** (1966) a gépi fordítás kudarcát dokumentálta, tovább mélyítve a csalódottságot.
:::::

::::: callout warning label="A gyökér-ok, ami minden telet magyaráz"
A DataCamp elemzése szerint a minta mindig ugyanaz: **túlígért ígéret** → a rendszer nem tudja teljesíteni → **csalódottság** → **finanszírozás-megvonás** → a kutatás gyakorlatilag leáll. Ezt a jelenséget a Gartner Hype Cycle "a felfújt várakozások csúcsa" utáni "kiábrándultság vályújaként" írja le.
:::::

::::: callout label="Egy mondatban"
Az első AI-tél (kb. 1974–1980) nem egy technikai kudarc volt önmagában — hanem a **túlígért várakozás és a valós képesség közötti szakadék** első, nagy, dokumentált esete, ami mintát adott a második télhez is.
:::::
::::::

:::::: section id=ai-history-2 num="02" heading="2. rész — Szakértői rendszerek és a második tél" nav="Szakértői rendszerek és a második tél" group="A telek"

<p class="topic-tagline">Cél: lásd, hogy egy teljesen más technikai megközelítés is ugyanabba a csapdába futott.</p>

### Egy más stratégia, ugyanaz a kifutás

A 80-as évek elején egy új irány hozott átmeneti fellendülést: a **szakértői rendszerek** (expert systems) — programok, amik emberi szakértők tudását kódolták le szabályokként egy szűk területen.

::::: stack-grid
:::: card label="MYCIN (1972)"
Fertőzések diagnosztizálására és antibiotikum-ajánlásra tervezett rendszer — az egyik legkorábbi, komolyan vehető szakértői rendszer.
::::
:::: card label="XCON (1980)"
A Digital Equipment Corporation számítógép-konfigurálást segítő rendszere — üzleti sikerré vált, és beindította a szakértői rendszer-ipart.
::::
:::: card label="LISP-gépek"
Speciálisan a szakértői rendszerek futtatására tervezett hardver — egy több százmillió dolláros piac épült ki köréjük az évtized közepére.
::::
:::::

### A második összeomlás

::::: callout danger label="A \"tudás-akvizíciós szűk keresztmetszet\""
A szakértői rendszerek **törékenynek** bizonyultak: egyetlen hiányzó szabály elronthatta az egész rendszert, és a szabályok kódolása fájdalmasan lassú, drága folyamat volt. A rendszerek nem tudtak **általánosítani** új helyzetekre, és hiányzott belőlük a legalapvetőbb "közös értelem".
:::::

::::: callout warning label="A piaci összeomlás konkrétuma"
1987–88-ban a **LISP-gépek piaca összeomlott**, amint az általános célú munkaállomások (Sun, Apple) ugyanazt a teljesítményt sokkal olcsóbban tudták nyújtani. Ez indította el a **második AI-telet**, ami a 90-es évek nagy részén át tartott.
:::::

::::: callout label="Egy mondatban"
A második tél megerősítette az első tanulságát egy teljesen más technikai megközelítésen keresztül: nem az számított, hogy szimbolikus vagy connectionist volt-e a módszer, hanem hogy a **valós teljesítmény alulmúlta a piaci ígéretet**.
:::::
::::::

:::::: section id=ai-history-3 num="03" heading="3. rész — A csendes újjáéledés: adat, hardver, neurális hálók" nav="A csendes újjáéledés" group="A modern korszak"

<p class="topic-tagline">Cél: értsd meg, mi változott meg alapvetően a 2010-es évek elejére, ami a korábbi teleket lezárta.</p>

### Három tényező, ami korábban hiányzott

A 90-es évek mélypontja után az AI iránti lelkesedés fokozatosan nőtt, és **2012 körül** drámai fordulat állt be — nem egyetlen áttörés miatt, hanem mert három, korábban hiányzó feltétel egyszerre teljesült:

::::: stack-grid
:::: card label="Számítási kapacitás"
A GPU-k (eredetileg videojáték-grafikához tervezve) kiválónak bizonyultak a neurális hálók tanításához szükséges párhuzamos számításokhoz.
::::
:::: card label="Adat mennyisége"
Az internet elterjedése olyan mennyiségű digitális szöveget, képet és egyéb adatot termelt, amivel korábban egyszerűen nem lehetett számolni.
::::
:::: card label="Algoritmikus finomítás"
A mélytanulás (deep learning) technikái — több rétegű neurális hálók, jobb tanítási módszerek — érettebbé váltak, és végre kihasználhatóvá tették az első két tényezőt.
::::
:::::

::::: callout label="Egy mondatban"
A 2012 utáni fellendülés nem egy hirtelen "felfedezés" volt — hanem az, hogy a **hardver, az adat és az algoritmusok** végre egyszerre értek be, ellentétben a korábbi telekkel, ahol legalább az egyik hiányzott.
:::::
::::::

:::::: section id=ai-history-4 num="04" heading="4. rész — A transformer-forradalom: egyetlen 2017-es cikk" nav="A transformer-forradalom" group="A modern korszak"

<p class="topic-tagline">Cél: lásd, hogyan vezetett egyetlen architekturális ötlet a ma használt szinte minden nagy modellhez.</p>

### "Attention Is All You Need"

::::: callout label="A cikk, ami mindent megváltoztatott"
2017-ben Google-kutatók publikálták a **transformer**-architektúrát — az <em>Egy modell anatómiája</em> és a <em>Reasoning</em> tutorialokban részletesen tárgyalt felépítést —, ami a korábbi, szekvenciális (RNN-alapú) modelleket egy **önmagára figyelő (self-attention)** mechanizmussal váltotta fel.
:::::

### Miért volt ez ekkora ugrás

A korábbi architektúrák szekvenciálisan, szóról szóra dolgozták fel a szöveget — ez lassú volt, és nehezen skálázódott. A transformer **párhuzamosan** tudta feldolgozni a teljes bemenetet, ami drámaian felgyorsította a tanítást nagy adathalmazokon.

::::: callout label="A közvetlen következmény: BERT és GPT-1 (2018)"
Egy évvel a transformer megjelenése után a Google BERT-je és az OpenAI GPT-1-je bebizonyította: a **nagy méretű, előtanított** (pretrained) nyelvi modellek — lásd a <em>Hogyan tanul egy modell</em> tutorialt — radikálisan jobb, univerzálisabb nyelvi képességeket adnak, mint bármi korábbi.
:::::

::::: callout label="Egy mondatban"
Szinte minden mai nagy nyelvi modell — GPT, Claude, Gemini, Llama — ugyanarra az egyetlen, 2017-es architekturális ötletre épül; ez az egyik legritkább eset a tudománytörténetben, amikor egyetlen publikáció ilyen hosszan és ilyen szélesen dominál.
:::::
::::::

:::::: section id=ai-history-5 num="05" heading="5. rész — A ChatGPT-pillanat: nem új technológia, új csomagolás" nav="A ChatGPT-pillanat" group="A modern korszak"

<p class="topic-tagline">Cél: érts meg egy gyakran félreértett tényt — a ChatGPT nem technikai, hanem termék-áttörés volt.</p>

### A leggyorsabban növekvő termék a történelemben

::::: callout danger label="A számok, amik mutatják a léptéket"
A ChatGPT (GPT-3.5 alapú, RLHF-fel finomítva — lásd az <em>RLHF</em> tutorialt) **2 hónap alatt érte el a 100 millió havi aktív felhasználót** 2022 végén — összehasonlításképp a TikTok-nak 9 hónapig, az Instagramnak két és fél évig tartott ugyanez.
:::::

### Miért pont ekkor, ha a technológia már megvolt

::::: callout warning label="Egy gyakran elfelejtett részlet"
A GPT-3 már **2020 óta** létezett — a ChatGPT nem hozott új alapkutatást. Amit hozott: egy **intuitív, chat-alapú felületet** egy addig kutatói/fejlesztői eszközből, amivel bárki, technikai háttér nélkül is azonnal érezhette a modell képességét. Ez a csomagolási döntés — nem egy technikai áttörés — indította el a tömeges elterjedést.
:::::

::::: callout label="A gazdasági utórengés"
A Google belső "code red" állapotot hirdetett a keresési szokások elmozdulása miatt, a Microsoft 10 milliárd dollárt fektetett be az OpenAI-ba, és 2023-ban az AI-startupokba áramló kockázati tőke **50 milliárd dollár fölé** ugrott globálisan.
:::::

::::: callout label="Egy mondatban"
A "ChatGPT-pillanat" egy fontos tanulságot ad: néha nem az alapkutatás, hanem a **termékesítés** (hogyan éred el, hogy bárki azonnal érezze az értéket) a döntő tényező abban, mikor és hogyan robban be egy technológia a köztudatba.
:::::
::::::

:::::: section id=ai-history-6 num="06" heading="6. rész — A reasoning és agentic korszak: ahol most tartunk" nav="A reasoning és agentic korszak" group="A modern korszak"

<p class="topic-tagline">Cél: helyezd el a jelenlegi pillanatot a nagy ívben — ez az, amiről a legtöbb más cikked szól.</p>

### A "rendszer 2" gondolkodás megjelenése

::::: callout label="2024–2025: a reasoning modellek kora"
A 2023-as modellek lényegében fejlett "autocomplete"-ek voltak: a következő, statisztikailag legvalószínűbb tokent jósolták (lásd a <em>Véletlenszerűség és mintavételezés</em> tutorialt), de nehezen boldogultak szigorú logikai vagy matematikai feladatokkal. Az **OpenAI o-sorozata**, a **Claude Opus** és hasonló **reasoning modellek** (lásd a <em>Reasoning</em> tutorialt) ezt a rést hidalták át: rejtett gondolatláncokat futtatnak, mielőtt válaszolnának.
:::::

### Az agentic váltás

::::: callout label="2026: a stateless válaszoktól a stateful ügynökökig"
A jelenlegi frontier nem a "jobb chatbot" — hanem az **agentic AI**: olyan rendszerek, amik önállóan, több lépésen át, gyakran órákon keresztül végeznek összetett feladatokat (lásd az <em>Agentic kódolás</em> és az <em>Agent architektúra</em> tutorialokat). 2026-ra a fejlett kódoló ügynökök rutinszerűen végeznek 30+ perces fejlesztői feladatokat felügyelet nélkül.
:::::

::::: callout label="Egy mondatban"
Ha a 2020–2022 közötti időszakot a "generatív érának" hívjuk (a modell generál, te reagálsz), a 2024 utáni időszak az "agentic éra" — a modell már nemcsak válaszol, hanem önállóan cselekszik, ami minden, e cikk után olvasott gyakorlati tutorialod közvetlen kontextusa.
:::::
::::::

:::::: section id=ai-history-7 num="07" heading="7. rész — Mit tanulhatunk a ciklusokból" nav="Mit tanulhatunk a ciklusokból" group="Referencia"

<p class="topic-tagline">Cél: zárd le a cikket egy gyakorlati, mai relevanciájú tanulsággal.</p>

### A minta, ami mindháromszor megismétlődött

::::: callout warning label="Túlígéret → csalódottság → megvonás — vagy?"
Mindkét korábbi AI-tél ugyanazt a mintát követte: túlzott ígéret, a valós teljesítmény elmaradása, majd a finanszírozás és a lelkesedés összeomlása. A jogos kérdés: **megismétlődhet-e ez ma is** a generatív AI-boom kapcsán?
:::::

### Miért más (talán) a mai helyzet

::::: compare
::: good label="Ami ma másképp alakul"
Skálázható hardver, bőséges adat és **valós, üzleti ROI-t termelő alkalmazások** léteznek már ma — az AI mélyen beépült olyan iparágakba (egészségügy, pénzügy, szoftverfejlesztés), amik nem tudnak egyszerűen "kiszállni" belőle egy csalódás esetén sem.
:::
::: bad label="Ami hasonló kockázatot hordoz"
A generatív AI körüli hype felfújhat irreális elvárásokat, a szabályozási/etikai kihívások lassíthatják a fejlődést, és ha a befektetett tőke nem térül meg elég gyorsan, a befektetői lelkesedés lehűlhet.
:::
:::::

::::: callout label="A legtöbb szakértő szerinti várható forgatókönyv"
Sok elemző szerint egy teljes "AI-tél" helyett inkább **"AI-őszök"** (lassulási periódusok) valószínűbbek — nem egy teljes leállás, hanem időszakos, kijózanodó korrekciók a túlfűtött várakozásokban.
:::::

::::: callout label="Egy mondatban"
A történelem ismerete nem azért fontos, hogy megjósold, mikor jön a következő tél — hanem hogy **felismerd a mintát**, amikor egy új képesség körül a hype gyorsabban nő, mint a valós teljesítmény, és ennek megfelelően kalibráld a saját várakozásaidat.
:::::
::::::

:::::: section id=ai-history-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0–2. rész"
Turing (1950) és Dartmouth (1956) mint formális kezdet · két AI-tél (perceptron/XOR és szakértői rendszerek), mindkettő ugyanazzal a túlígéret→csalódottság mintával
::::
:::: card label="3–4. rész"
A 2012 körüli fellendülés három együttes feltétele (hardver, adat, algoritmus) · a 2017-es transformer-cikk, ami szinte minden mai modell alapja
::::
:::: card label="5–6. rész"
A ChatGPT nem technikai, hanem termékesítési áttörés volt (100M felhasználó 2 hónap alatt) · a mai reasoning és agentic korszak
::::
:::: card label="7. rész"
A történelmi minta (túlígéret → csalódottság → megvonás), és miért gondolják sokan, hogy ma inkább "AI-őszök", nem teljes tél várható
::::
:::::

<p class="topic-tagline">Kapcsolódó: az <em>Egy modell anatómiája</em> és a <em>Reasoning</em> (a transformer, amiről ez a cikk mesél), a <em>RLHF</em> (a ChatGPT mögötti finomhangolási technika) és az <em>Agentic kódolás</em> / <em>Agent architektúra</em> (a jelenlegi korszak, ahol tartunk) tutorialok.</p>
::::::
