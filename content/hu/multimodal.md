---
page: multimodal
title: Multimodális modellek — hogyan lát, hall és ért egy AI
sidebar_groups:
  - Elmélet
  - Modalitások
  - Korlátok
  - Gyakorlat
  - Referencia
hero:
  eyebrow: "Multimodalitás · Fejlesztői Tanulási Terv"
  title: "Multimodális modellek — <em>hogyan lát, hall és ért egy AI</em>"
  lead: "Amikor egy AI \"ránéz\" egy képre, nem \"megnézi\" úgy, ahogy egy ember — a kép patch-ekre esik szét, számokká válik, és ugyanabba a térbe kerül, ahol a szavak élnek. Ez a cikk szétbontja, mi történik ilyenkor ténylegesen: a natív és az összefűzött (kaszkád) architektúra közti különbséget, miért olvas ki a modell néha nem létező dolgokat egy képből, és hogyan válaszd meg helyesen, mikor éri meg OCR-t, vision-modellt vagy mindkettőt használni. Épít a <em>Reasoning</em>, a <em>Halucináció</em> és a <em>Vektor adatbázisok</em> tutorialokra — csak a megértésről (input) szól, a kép/videó generálásról nem."
  stats:
    - { val: "3", lbl: "Fő komponens" }
    - { val: "~10%", lbl: "figyelem a képre*" }
    - { val: "576+", lbl: "token egyetlen képből" }
    - { val: "0", lbl: "generálás ebben a cikkben" }
footer:
  left: "AI Hub · Multimodális modellek"
  right: "Multimodális modellek · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#multimodal-0"><div class="tc-num">0. rész</div><div class="tc-name">Mi számít valóban multimodálisnak</div><div class="tc-desc">Natív architektúra vs. összefűzött pipeline — nem ugyanaz.</div></a>
  <a class="toc-card" href="#multimodal-1"><div class="tc-num">1. rész</div><div class="tc-name">Hogyan lát egy vision-modell</div><div class="tc-desc">Patch, encoder, projection layer — a kép számmá válik.</div></a>
  <a class="toc-card" href="#multimodal-2"><div class="tc-num">2. rész</div><div class="tc-name">Ugyanaz az attention, más token</div><div class="tc-desc">Kapcsolat a Reasoning tutorialhoz — és ahol ez elromlik.</div></a>
  <a class="toc-card" href="#multimodal-3"><div class="tc-num">3. rész</div><div class="tc-name">Hang: natív vs. kaszkád</div><div class="tc-desc">STT→LLM→TTS lánc kontra egyetlen, hangban gondolkodó modell.</div></a>
  <a class="toc-card" href="#multimodal-4"><div class="tc-num">4. rész</div><div class="tc-name">Videó: kép + hang + idő</div><div class="tc-desc">Miért nehezebb, mint a másik kettő együtt.</div></a>
  <a class="toc-card" href="#multimodal-5"><div class="tc-num">5. rész</div><div class="tc-name">A 90/10 probléma</div><div class="tc-desc">Miért hisz a modell inkább a szövegnek, mint a szemének.</div></a>
  <a class="toc-card" href="#multimodal-6"><div class="tc-num">6. rész</div><div class="tc-name">Konkrét hibamódok</div><div class="tc-desc">Számlálás, "hol van", vizuális hallucináció élesben.</div></a>
  <a class="toc-card" href="#multimodal-7"><div class="tc-num">7. rész</div><div class="tc-name">Dokumentum: OCR vs. vision LLM</div><div class="tc-desc">Döntési tábla dokumentumtípusonként.</div></a>
  <a class="toc-card" href="#multimodal-8"><div class="tc-num">8. rész</div><div class="tc-name">Melyik architektúrát mikor</div><div class="tc-desc">Konkrét döntési szempontok natív vs. kaszkád között.</div></a>
  <a class="toc-card" href="#multimodal-9"><div class="tc-num">9. rész</div><div class="tc-name">Kapcsolódás a RAG-hoz</div><div class="tc-desc">Multimodális embedding — amikor a kép is kereshető vektor.</div></a>
</div>
::::::

:::::: section id=multimodal-0 num="00" heading="0. rész — Mi számít valóban multimodálisnak?" nav="Mi számít valóban multimodálisnak" group="Elmélet"

<p class="topic-tagline">Cél: tanuld meg a legfontosabb megkülönböztetést, mielőtt bármi másba belemész.</p>

### A csapda, amibe a legtöbben belefutnak

"Multimodális" alatt sokan bármilyen rendszert értenek, ami képet vagy hangot is elfogad — pedig ez alatt **két, technikailag nagyon eltérő** dolog húzódhat meg.

::::: compare
::: bad label="✗ Összefűzött (kaszkád) pipeline"
A hangot előbb egy külön **beszédfelismerő** (ASR/STT) modell szöveggé alakítja, ezt egy **szöveges** LLM dolgozza fel, majd egy külön **szintetizátor** (TTS) mondja ki a választ. A modell, ami "gondolkodik", **sosem hallja** a hangot — csak az átiratot.
:::
::: good label="✓ Natív multimodális architektúra"
**Egyetlen** neurális háló dolgozza fel közvetlenül a nyers hangot (vagy képet) — a hangszín, a szünetek, a hangsúly mind **megmarad** a feldolgozás során, nem vész el egy köztes szöveges lépésben.
:::
:::::

::::: callout label="Miért nem mindegy ez"
Egy kaszkád rendszer az átirat elkészülte után **eldobja** a paralingvisztikai információt (gúny, bizonytalanság hangsúlya, nevetés) — a szöveges LLM ezekhez **nem is fér hozzá**. Egy natív rendszer elméletileg mindezt megőrzi — cserébe kevésbé rugalmas: nehezebb benne kicserélni csak az egyik komponenst (pl. csak a hangot vagy csak az "agyat").
:::::

### A gyakorlati kompromisszum

::::: callout warning label="A 2026-os valóság: egyik sem egyértelműen jobb"
A natív rendszerek nyers sebességben és a hangszín/érzelem megőrzésében nyernek. Az optimalizált kaszkád pipeline-ok viszont **rugalmasságban** nyernek: külön cserélhető STT, LLM és TTS komponens, függetlenül frissíthető, és **a legtöbb éles rendszer 2026-ban emiatt még mindig kaszkádot használ** — nem azért, mert lassabb megoldás, hanem mert kontrollálhatóbb.
:::::

::::: callout label="Egy mondatban"
Mielőtt megkérdeznéd, "melyik multimodális modell a legjobb", kérdezd meg előbb: **natívan** dolgozza-e fel a modalitást, vagy egy szöveges köztes lépésen keresztül — ez a különbség többet számít, mint bármelyik konkrét modell neve.
:::::
::::::

:::::: section id=multimodal-1 num="01" heading="1. rész — Hogyan lát egy vision-modell belülről" nav="Hogyan lát egy vision-modell" group="Elmélet"

<p class="topic-tagline">Cél: értsd meg pontosan, mi történik a kép feltöltése és a modell válasza között.</p>

### A három komponens

Egy natívan vision-képes modell (VLM — vision-language model) jellemzően **három**, egymásra épülő részből áll:

::::: stack-grid
:::: card label="1 · Vision encoder"
A kép **patch-ekre** (kis, fix méretű darabokra, pl. 14×14 pixel) esik szét — ezt egy Vision Transformer (ViT) vagy hasonló háló (pl. SigLIP) alakítja **vektorokká**, ugyanúgy, ahogy a szöveg is tokenekre esik szét feldolgozás előtt.
::::
:::: card label="2 · Projection layer (illesztő réteg)"
A vision encoder kimenete **más dimenziójú**, mint amit a nyelvi modell vár (pl. 1408 dimenziós vektor egy 4096 dimenziósat váró modellnek) — egy tanult, jellemzően kétrétegű MLP hidalja át ezt a szakadékot.
::::
:::: card label="3 · LLM decoder (nyelvi mag)"
Az immár azonos "nyelvre" (dimenzióra) fordított vizuális tokenek a **szöveges tokenek közé keverve** kerülnek a nyelvi modellbe — innentől ugyanúgy dolgozza fel őket, mint bármilyen más tokent.
:::::

### Egy kép ára tokenben

::::: callout label="Konkrét szám"
Egy 336×336 pixeles kép egy tipikus architektúrában **576 vizuális tokent** termel — egy nagyobb felbontású vagy több csempére (tile) bontott kép ezt könnyen **több ezerre** növelheti. Ez azt jelenti, hogy **egyetlen kép** a kontextusablakod jelentős részét elfoglalhatja, mielőtt egyetlen szót elolvastál volna a promptodból.
:::::

### Miért fontos ez neked

::::: callout label="Egy mondatban"
A modell nem "néz rá" a képre úgy, ahogy egy ember — **lefordítja számokká, majd ugyanazzal a gépezettel dolgozza fel**, amivel a szöveget is; ez a technikai tény magyarázza meg a következő részekben látott korlátok jó részét is.
:::::
::::::

:::::: section id=multimodal-2 num="02" heading="2. rész — Ugyanaz az attention, más token" nav="Ugyanaz az attention, más token" group="Elmélet"

<p class="topic-tagline">Cél: kösd össze ezt a tudást a Reasoning tutorialban tanultakkal.</p>

### A közös mechanizmus

A <em>Reasoning</em> tutorial 1. részében megismert **attention-mechanizmus** — a modell súlyozott "pillantása" a releváns korábbi tokenekre — **nem változik** azért, mert a token most egy kép egy darabjából, nem egy szóból származik. Ugyanaz a transformer-réteg dolgozza fel a vizuális és a szöveges tokent, ugyanazzal a matematikai apparátussal.

::::: callout label="A pozíció-kódolás extra rétege"
Egy fontos kiegészítés a szöveghez képest: a modellnek tudnia kell, hogy egy adott képrészlet **hol** helyezkedett el a képen (fent-lent, mellette) — ezt külön **pozicionális kódolással** oldják meg, hogy a kép geometriai szerkezete (mi van kinek a szomszédságában) ne vesszen el azzal, hogy a képet egy sorozattá (token-sorrá) lapítjuk.
:::::

### Ahol ez a közös mechanizmus elromlik

::::: callout danger label="Előretekintés az 5. részre"
Ha a szöveges és a vizuális token **ugyanazzal** az attention-mechanizmussal versenyez a modell "figyelméért", felmerül a kérdés: mi van, ha a kettő **egyenlőtlenül** kap figyelmet? Ez pontosan az a probléma, amit az 5. rész ("A 90/10 probléma") részletez — és ami a leggyakoribb, gyakorlatban tapasztalt vizuális hibák gyökere.
:::::

::::: callout label="Egy mondatban"
A multimodalitás nem egy **külön** gondolkodási mód a modellben — ugyanaz a reasoning-hurok fut, csak most a bemenetek egy része képből vagy hangból származik, nem kizárólag szövegből.
:::::
::::::

:::::: section id=multimodal-3 num="03" heading="3. rész — Hang: natív vs. kaszkád a gyakorlatban" nav="Hang: natív vs. kaszkád" group="Modalitások"

<p class="topic-tagline">Cél: lásd konkrét számokkal, mit jelent a 0. részben tárgyalt választás hangnál.</p>

### A két architektúra egymás mellett

::::: stack-grid
:::: card label="Kaszkád (chained)"
Hang → **beszédfelismerés** (STT) → szöveg → **LLM** → válaszszöveg → **beszédszintézis** (TTS) → hang. Minden lépésnek saját mérhető late­nciája és hibafelülete van — külön cserélhetők.
::::
:::: card label="Natív (speech-to-speech)"
Egyetlen modell **hallja** a nyers hangot, és **közvetlenül hangban** válaszol — a hangszínt, a szünetet, az érzelmi tónust a teljes feldolgozás alatt megőrzi.
::::
:::::

::::: callout label="Konkrét latencia-adatok (2026 eleje)"
A vezető natív (speech-to-speech) modellek első hangválasz-ideje kb. **0,78–2,98 másodperc** között szór (a leggyorsabbtól a leglassabbig) — összehasonlításképp az emberi beszélgetési válaszidő kb. **200 ezredmásodperc**. Egy jól megépített, streamelő kaszkád pipeline ugyanakkor **100–250 ezredmásodperc alatt** el tudja kezdeni az első hangkimenetet — tehát a "natív mindig gyorsabb" feltételezés **nem** áll meg minden esetben.
:::::

### Miért választják mégis sokan a kaszkádot élesben

::::: callout warning label="A rugalmasság ára és haszna"
A legtöbb 2026-os production-rendszer **kaszkádot** használ, annak ellenére, hogy a natív megoldás elméletileg gazdagabb jelet őriz meg — mert a csapatoknak kell tudniuk **függetlenül cserélni**, melyik LLM végzi a reasoninget, melyik hang szólal meg, és milyen üzleti logika fut a beszédfelismerés és a válasz között. Ez a fajta darabolhatóság **nem érhető el** egyetlen, monolitikus natív modellel.
:::::

::::: callout label="Egy mondatban"
Hangnál a döntés ritkán "melyik gyorsabb" — inkább az, hogy **mennyi paralingvisztikai árnyalatra** van szükséged (natív felé húz), vagy **mennyi kontrollra és cserélhetőségre** (kaszkád felé húz).
:::::
::::::

:::::: section id=multimodal-4 num="04" heading="4. rész — Videó: kép + hang + idő, ami mindent nehezebbé tesz" nav="Videó: kép + hang + idő" group="Modalitások"

<p class="topic-tagline">Cél: értsd meg, miért nem "csak sok kép egymás után" a videó a modell szemszögéből.</p>

### A videó nem folyamatos — neked sem, a modellnek pláne nem

Egy videó a modell számára gyakorlatilag **különálló képkockák sorozata** — a folyamatos mozgás illúzióját maga a videóformátum adja, a modell viszont csak annyi kockát "lát", amennyit ténylegesen odaadsz neki. Ez egy alapvető **erőforrás-kompromisszumot** kényszerít ki:

::::: compare
::: bad label="✗ Sok kocka, sűrű mintavétel"
Jobban megragadja a finom mozgást és az átmeneteket, de **drámaian megnöveli** a token-számot — egy hosszú videó könnyen szétfeszíti a kontextusablakot, mielőtt bármi hasznosat mondanál róla.
:::
::: good label="✓ Ritka mintavétel, kevesebb kocka"
Olcsóbb és belefér a kontextusba, de **kockáztatja**, hogy egy fontos esemény pont két mintavételezett kocka között történik, és a modell soha nem "látja" azt.
:::
:::::

### Az időbeli következtetés extra nehézsége

::::: callout danger label="Nem csak mennyiségi, minőségi probléma is"
A videó-megértés nem csak "több képkocka feldolgozása" — a modellnek **idői relációkat** is helyesen kell kezelnie (mi történt előbb, mi utána, mi tart meddig). Kutatások szerint sok modell a kockákat **külön-külön** kódolja, majd időbélyeg nélkül vagy gyengén illeszti össze — ez rontja pont azt a fajta kérdést, amire a felhasználók a leggyakrabban kíváncsiak ("mi történt ez UTÁN, hogy...").
:::::

### A gyakorlati következmény

::::: callout label="Egy mondatban"
Ha valaha úgy érzed, hogy egy AI "nem vette észre" egy fontos pillanatot egy hosszabb videóban, valószínűleg nem hibázott — egyszerűen **nem is kapta meg** azt a képkockát a mintavételezés során; ez a videó-megértés talán legfontosabb, gyakorlati korlátja.
:::::
::::::

:::::: section id=multimodal-5 num="05" heading="5. rész — A 90/10 probléma: miért hisz a modell inkább a szövegnek" nav="A 90/10 probléma" group="Korlátok"

<p class="topic-tagline">Cél: értsd meg a legfontosabb, kutatással alátámasztott okot a vizuális hibák mögött.</p>

### A mért egyensúlytalanság

::::: callout danger label="A kulcs-adat"
Egy kutatás azt találta, hogy egy tipikus vision-language modellben az attention **kb. 90%-a** a **szöveges** tokenekre irányul, és csak kb. **10%-a** jut a **vizuális** tokenekre. A nyelvi mag ugyanis sokkal nagyobb és szemantikailag "hangosabb" tanítási adaton edződött, mint a vision encoder — ezért a modell hajlamos **a promptra és a saját nyelvi statisztikájára** támaszkodni, a képet csak "futólag" konzultálva.
:::::

### Egy konkrét, jól megfigyelhető következmény

Ha egy kép logikusan "szokatlan" — pl. fejjel lefelé fordítva mutat egy jelenetet —, a modell hajlamos azt állítani, amit a **nyelvi prior** (a tanult, statisztikailag megszokott világ) diktál, nem amit a kép ténylegesen mutat:

::::: callout label="Illusztráció a kutatásból"
Ha a modell tudja, hogy a felhők "általában" a fű fölött vannak, akkor **akkor is** ezt fogja állítani, ha a kép ténylegesen fejjel lefelé van — a modell a **valószínűt hallucinálja**, nem a **láthatót** jelenti.
:::::

### Kapcsolat a Halucináció tutorialhoz

::::: callout label="Egy mondatban"
Ez lényegében ugyanaz a jelenség, amit a <em>Halucináció</em> tutorial 1–2. részében a szöveges hallucinációnál láttál — a modell inkább a **statisztikailag valószínűt** mondja, mint hogy beismerje a bizonytalanságot —, csak itt a "bizonytalanság" forrása nem hiányzó tudás, hanem egy **alulsúlyozott** érzékszerv: a kép.
:::::
::::::

:::::: section id=multimodal-6 num="06" heading="6. rész — Konkrét hibamódok: számlálás, térbeliség, vizuális hallucináció" nav="Konkrét hibamódok" group="Korlátok"

<p class="topic-tagline">Cél: ismerd fel ezeket, amikor éles rendszerben találkozol velük.</p>

### A leggyakoribb, dokumentált hibatípusok

::::: stack-grid
:::: card label="Számlálás"
Zsúfolt, sok-tárgyas képeken (pl. "hány alma van a kosárban") a modellek megbízhatóan **rosszul** teljesítenek — ez nem véletlen hiba, hanem abból fakad, hogy a modell nehezen **köti össze** helyesen az egyes vizuális jellemzőket a hozzájuk tartozó, különálló tárgyakkal.
::::
:::: card label="Térbeli reláció"
Egyszerű kérdések, mint "a kutya AZ ASZTAL ALATT vagy AZ ASZTALON van?" meglepően gyakran hibáznak — a modell "tudja", hova kell néznie, de a **finom részletek** tényleges érzékelésében bukik el, különösen kisebb tárgyaknál.
::::
:::: card label="Nem létező tárgy/tulajdonság"
A modell magabiztosan említhet egy gyűrűt, ami nincs a képen, vagy téves színt/formát állíthat — ez a klasszikus "objektum-hallucináció", ami a leggyakrabban vizsgált vizuális hallucináció-típus.
::::
::::::

### Miért fontos ezt tudnod, nem csak érdekesség

::::: callout warning label="Amikor ez nem csak vicces, hanem veszélyes"
Ezek a hibatípusok **kritikus alkalmazásokban** (orvosi képelemzés, minőségbiztosítás, biztonsági megfigyelés) nem apróságok — egy hamis "nincs rendellenesség" vagy egy tévesen megszámolt tárgy valós következményekkel járhat. A jelenlegi kutatás szerint ezek a hibák **architekturális eredetűek** (lásd 5. rész), nem egyszerűen "még nem elég adat" kérdése — vagyis egyszerű méret-növeléssel nem tűnnek el automatikusan.
:::::

### Egy gyakorlati védekezési irány

::::: callout label="Amit érdemes tudni, ha ez a kockázat releváns nálad"
Kritikus, számlálást vagy pontos lokalizációt igénylő feladatoknál egyes kutatások **dedikált objektumdetektáló modellekkel** (pl. YOLO-szerű architektúrák) egészítik ki a vision-language modellt — ezek a specializált modellek a számlálásban és a pontos határok kijelölésében **lényegesen megbízhatóbbak**, mint egy általános célú, generatív VLM.
:::::
::::::

:::::: section id=multimodal-7 num="07" heading="7. rész — Dokumentum-feldolgozás: OCR vs. vision LLM vs. hibrid" nav="Dokumentum: OCR vs. vision LLM" group="Gyakorlat"

<p class="topic-tagline">Cél: adj konkrét döntési támpontot egy gyakori, üzletileg releváns felhasználási esetre.</p>

### Miért nem egyértelmű a válasz

A hagyományos OCR **karaktereket** ismer fel egy rögzített módon, a vision LLM viszont **egészében értelmezi** a dokumentumot — felismerheti, mi a "végösszeg" egy számlán anélkül, hogy pontosan tudná a szó helyét, vagy hibásan "kitalálhat" egy értéket, ha a kép homályos.

::::: stack-grid
:::: card label="OCR — mikor jó"
Szabványos, egységes elrendezésű formanyomtatványoknál (pl. adóűrlapok) — ahol a **konzisztencia** és a validációs szabályok fontosabbak, mint a kontextus-érzékeny értelmezés.
::::
:::: card label="Vision LLM — mikor jó"
Változó formátumú, kontextus-függő dokumentumoknál (nyugták, kézírásos jegyzetek, orvosi feljegyzések) — ahol a **jelentés** megértése fontosabb, mint a pontos elrendezés visszaadása.
::::
:::: card label="Hibrid — mikor jó"
Félig-strukturált dokumentumoknál (számlák, mérlegek): OCR/táblázat-kinyerés a fejléc-adatokra és a táblázatos részekre, vision LLM a kontextus-függő tételsorokra és az összegzésre.
::::
:::::

### A pontosság és a költség valós számai

::::: callout label="Konkrét, mért adatok"
Tiszta, digitálisan generált szöveges PDF-eken a vezető modellek **96–98%-os** pontosságot érnek el, míg a hagyományos OCR (pl. Textract) **82%** körül teljesít összetettebb, táblázatos tételsorok kinyerésénél egy vision LLM-hez képest. Ugyanakkor a vision-módú (kép alapú) LLM-hívás **akár ötször drágább** lehet, mint egy sima OCR API-hívás — nagy volumennél ez a különbség gyorsan komoly költségtétellé válik.
:::::

::::: callout warning label="A biztonsági háló, amit sose hagyj ki"
Egy vision LLM **magabiztosan kitalálhat** egy mezőértéket, ami nincs is a dokumentumban — különösen gyenge minőségű vagy kézírásos bemeneten. Éles rendszerben ez **konfidencia-pontszámmal** és **emberi felülvizsgálattal** kezelendő az alacsony-konfidenciájú mezőknél: egy "nincs érték" biztonságosabb kimenet, mint egy magabiztos, de téves szám egy pénzügyi dokumentumon.
:::::

::::: callout label="Egy mondatban"
A "melyiket használjam" kérdésre nincs egyetlen válasz — a dokumentum **változékonysága** és a hiba **ára** dönti el, hogy OCR, vision LLM, vagy a kettő kombinációja illik-e a feladatra.
:::::
::::::

:::::: section id=multimodal-8 num="08" heading="8. rész — Melyik architektúrát mikor: gyakorlati döntési keret" nav="Melyik architektúrát mikor" group="Gyakorlat"

<p class="topic-tagline">Cél: foglald össze a 0., 3. és 7. részben látott döntéseket egyetlen, használható keretbe.</p>

### A három alapkérdés

::::: stack-grid
:::: card label="Mennyire fontos a nyers jel?"
Ha a hangszín, az érzelem, vagy a kép finom vizuális részlete kritikus, natív feldolgozás felé húzz. Ha egy szöveges köztes lépés "elég jó", a kaszkád egyszerűbb és olcsóbb.
::::
:::: card label="Mennyi kontrollt akarsz a komponensek felett?"
Ha külön akarod tudni cserélni a modellt, a hangot vagy a beszédfelismerőt, a kaszkád architektúra ad erre lehetőséget — egy natív, monolitikus modellnél ez nem opció.
::::
:::: card label="Mekkora a hiba ára?"
Kritikus (orvosi, pénzügyi, biztonsági) alkalmazásoknál a 6–7. részben látott hibamódok miatt **mindig** építs be konfidencia-küszöböt és emberi felülvizsgálatot — függetlenül attól, natív vagy kaszkád architektúrát választasz.
::::
:::::

::::: callout label="Egy mondatban"
A "legjobb" multimodális architektúra nem létezik elvontan — csak **a te konkrét feladatodhoz** legjobban illő van, és ezt a fenti három kérdés megválaszolása dönti el, nem egy modell márkaneve vagy egy benchmark-szám.
:::::
::::::

:::::: section id=multimodal-9 num="09" heading="9. rész — Kapcsolódás a RAG-hoz: amikor a kép is kereshető vektor" nav="Kapcsolódás a RAG-hoz" group="Referencia"

<p class="topic-tagline">Cél: kösd össze ezt a tudást a Vektor adatbázisok és a RAG tutorialokkal.</p>

### A közös reprezentációs tér

A <em>Vektor adatbázisok</em> tutorial 1. részében megismert **embedding**-ötlet (szöveg → vektor, hasonlóság-keresés) natívan kiterjeszthető képekre is — ez az, amit **CLIP-szerű** architektúráknak neveznek: a képet és a hozzá tartozó szöveges leírást **ugyanabba** a vektortérbe képezik le, úgy, hogy egy kép és a témába vágó szöveg vektorai **közel** kerüljenek egymáshoz.

::::: callout label="Amit ez lehetővé tesz"
Egy multimodális embedding-tér miatt kereshetsz **szöveggel képek között** ("mutass egy naplementés fotót") vagy **képpel szöveg között** — anélkül, hogy a képet előbb szöveggé (pl. képaláírássá) kellene alakítanod. Ez egy más felhasználási eset, mint a 7. részben tárgyalt dokumentum-kinyerés: itt nem a kép **tartalmát** akarod kinyerni, hanem a képet magát akarod **megtalálni** egy nagy gyűjteményben.
:::::

::::: callout label="Egy mondatban"
A multimodalitás és a RAG két, egymást erősítő technika: a <em>Vektor adatbázisok</em> és <em>RAG</em> tutorialokban tanult keresési logika ugyanúgy működik képekre, hangra vagy videóra, amint van egy közös vektortér, amibe mindegyik modalitás lefordítható.
:::::
::::::

:::::: section id=multimodal-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0–2. rész"
Natív vs. kaszkád architektúra a legfontosabb megkülönböztetés · a vision-modell belső felépítése (encoder → projection → LLM) · ugyanaz az attention dolgozza fel a vizuális és szöveges tokent
::::
:::: card label="3–4. rész"
Hang: natív (speech-to-speech) vs. kaszkád (STT→LLM→TTS) valós latencia-adatokkal · videó: miért nehezebb, mint kép + hang külön-külön (frame sampling, időbeli reasoning)
::::
:::: card label="5–6. rész"
A "90/10 probléma": a modell inkább a szövegnek hisz, mint a képnek · konkrét, dokumentált hibamódok — számlálás, térbeli reláció, objektum-hallucináció
::::
:::: card label="7–8. rész"
OCR vs. vision LLM vs. hibrid dokumentum-feldolgozásnál, konkrét pontosság/költség adatokkal · gyakorlati döntési keret architektúra-választáshoz
::::
:::: card label="9. rész"
Multimodális embedding (CLIP-szerű közös tér) mint a RAG és a vektor-keresés természetes kiterjesztése képekre és más modalitásokra
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>Reasoning</em> (az attention és a hurok, amit a multimodalitás is használ), a <em>Halucináció</em> (a vizuális hallucináció szöveges rokona) és a <em>Vektor adatbázisok</em> / <em>RAG</em> (multimodális embedding és keresés) tutorialok.</p>

<p class="topic-tagline" style="margin-top:12px;font-size:0.85em;opacity:0.75">* A kb. 10%-os vizuális figyelem-arány egy kutatási megfigyelésre utal, nem univerzális, minden modellre érvényes konstans — lásd az 5. részt a forrás kontextusáért.</p>
::::::
