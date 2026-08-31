---
page: conversation-data-training
title: A beszélgetéseidtől a súlyokig — hogyan kerülnek be a felhasználói adatok a modellekbe
sidebar_groups:
  - A tévhit
  - A mechanizmus
  - Cégenként más
  - A rejtett kockázat
  - Referencia
hero:
  eyebrow: "Beszélgetés-adat és tanítás · Fejlesztői Tanulási Terv"
  title: "A beszélgetéseidtől <em>a súlyokig</em>"
  lead: "Amikor beírsz valamit egy AI-chatbe, az a szöveg elméletileg egyszer befolyásolhatja egy jövőbeli modell súlyait. De ez nem folyamatos, automatikus tanulás — egy konkrét, időszakos, emberi döntésekkel teli folyamat, ami cégenként radikálisan eltérően működik. Ez a cikk végigmegy a mechanizmuson, a 2025-2026-os szabályzati változásokon, és egy meglepő kutatási eredményen arról, mennyire nehéz valójában anonimizálni egy beszélgetést."
  stats:
    - { val: "2025. szept. 28.", lbl: "az Anthropic opt-out határideje*" }
    - { val: "5 év", lbl: "megőrzési idő, ha nem opt-outolsz*" }
    - { val: "84-90%", lbl: "kikövetkeztethető életkor/nem/ország F1-je, PII nélkül is*" }
    - { val: "6", lbl: "Szakasz" }
footer:
  left: "AI Hub · Beszélgetés-adat és tanítás"
  right: "Beszélgetés-adat és tanítás · Összeállítva 2026 augusztusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#conversation-data-training-0"><div class="tc-num">0. rész</div><div class="tc-name">A tévhit: nem folyamatos, élő tanulás</div><div class="tc-desc">Miért nem változik a modell a beszélgetésed közben.</div></a>
  <a class="toc-card" href="#conversation-data-training-1"><div class="tc-num">1. rész</div><div class="tc-name">A mechanizmus: hogyan válik ki egy beszélgetés</div><div class="tc-desc">Gyűjtés, szűrés, anonimizálás, majd a következő tanítási kör.</div></a>
  <a class="toc-card" href="#conversation-data-training-2"><div class="tc-num">2. rész</div><div class="tc-name">Cégenként radikálisan más szabály</div><div class="tc-desc">Az Anthropic 2025-ös fordulata, és mi mit csinál 2026-ban.</div></a>
  <a class="toc-card" href="#conversation-data-training-3"><div class="tc-num">3. rész</div><div class="tc-name">API vs. fogyasztói termék: a legfontosabb megkülönböztetés</div><div class="tc-desc">Ugyanaz a cég, más szabály.</div></a>
  <a class="toc-card" href="#conversation-data-training-4"><div class="tc-num">4. rész</div><div class="tc-name">A rejtett kockázat: a PII-szűrés nem elég</div><div class="tc-desc">Amit egy anonimizált beszélgetésből is ki lehet következtetni.</div></a>
  <a class="toc-card" href="#conversation-data-training-5"><div class="tc-num">5. rész</div><div class="tc-name">Mit tehetsz gyakorlatban</div><div class="tc-desc">Konkrét lépések, ha ez fontos neked.</div></a>
</div>
::::::

:::::: section id=conversation-data-training-0 num="00" heading="0. rész — A tévhit: nem folyamatos, élő tanulás" nav="A tévhit" group="A tévhit"

<p class="topic-tagline">Cél: oszlass el egy gyakori félreértést, mielőtt a tényleges mechanizmusra térnénk.</p>

### A beszélgetésed nem módosítja azonnal a modellt

::::: callout label="Amit sokan hisznek, és ami nem igaz"
Egy gyakori téveszme, hogy egy AI-modell **folyamatosan, valós időben tanul** minden beszélgetésből — mintha minden üzeneted azonnal módosítaná a súlyokat. Ez **nem így működik**. A modell, amivel most beszélgetsz, egy **lefagyasztott, statikus** súlykészlet — a beszélgetésed önmagában **semmit nem változtat** rajta, sem most, sem holnap.
:::::

::::: callout label="Ami valójában történik: diszkrét, időszakos tanítási körök"
Ha egy beszélgetésed egyáltalán befolyásolja egy jövőbeli modellt, az egy **teljesen külön, később induló folyamat** részeként történik — a beszélgetést előbb **összegyűjtik, megszűrik, esetleg emberi értékelők nézik át**, majd egy **jövőbeli tanítási körbe** kerülhet be, ami hónapokkal később fut le, és egy **teljesen új modell-verziót** hoz létre, nem a jelenlegit módosítja.
:::::

::::: callout label="Egy mondatban"
Nincs "a modell megjegyezte, amit tegnap mondtál neki" — legfeljebb "ez a beszélgetés bekerülhetett egy adathalmazba, amit egy jövőbeli, más néven kiadott modell tanításához használtak".
:::::
::::::

:::::: section id=conversation-data-training-1 num="01" heading="1. rész — A mechanizmus: hogyan válik ki egy beszélgetés" nav="A mechanizmus" group="A mechanizmus"

<p class="topic-tagline">Cél: ismerd meg a konkrét lépéseket, amiken egy beszélgetés áthalad, mielőtt egyáltalán számítana a tanításban.</p>

### A pipeline, ahova egy beszélgetés bekerülhet

::::: callout label="Hova illeszkedik ez az RLHF-folyamatba"
A <em>RLHF</em> tutorialban megismert három lépéses pipeline (SFT → reward modell → PPO/DPO) elején álló **SFT-adat** és a **preferencia-párok** (amikből a reward modell tanul) származhatnak felhasználói beszélgetésekből is — nem csak a fizetett, dedikált AI-trénerek által írt, mesterséges párbeszédekből.
:::::

::::: callout warning label="A szűrés, ami a legtöbb beszélgetést kizárja"
A gyakorlatban a beszélgetések **túlnyomó többsége soha nem kerül be** semmilyen tanítási adathalmazba — a cégek jellemzően **mintavételeznek** (nem az összes beszélgetést használják), és automatikus/emberi szűrőkkel válogatják ki azokat, amik ténylegesen hasznosak lehetnek (pl. ahol a felhasználó egyértelmű elégedetlenséget vagy elégedettséget jelzett, vagy ahol a beszélgetés egy ritka, tanulságos mintát mutat).
:::::

### Az anonimizálási lépés

::::: callout label="Automatizált eszközök a PII eltávolítására"
Mielőtt egy beszélgetés bármilyen emberi értékelő elé kerülne, a cégek jellemzően **automatizált PII-szűrőket** futtatnak rajta — az OpenAI 2026-ban nyílt forráskódúvá tett egy 1,5 milliárd paraméteres, helyben futtatható modellt (**Privacy Filter**) pontosan erre a célra, ami **96%-os F1-pontszámot** ér el a standard PII-Masking-300k benchmarkon.
:::::

::::: callout danger label="A 96% nem 100%"
Ez azt jelenti, a nevek, címek, jelszavak és fiókazonosítók **kb. 4%-a átcsúszik** még egy jó minőségű, automatizált szűrőn is — ez az az arány, amiért a legtöbb cég **emberi felülvizsgálatot** is beiktat a legérzékenyebbnek tűnő esetekben, mielőtt egy beszélgetés a tényleges tanítási adathalmazba kerülne.
:::::

::::: callout label="Egy mondatban"
Egy beszélgetés hosszú úton megy át — mintavételezés, automatizált PII-szűrés, gyakran emberi felülvizsgálat —, mire egyáltalán bekerülhet abba az adathalmazba, amit egy jövőbeli tanítási kör ténylegesen felhasznál.
:::::
::::::

:::::: section id=conversation-data-training-2 num="02" heading="2. rész — Cégenként radikálisan más szabály" nav="Cégenként más szabály" group="Cégenként más"

<p class="topic-tagline">Cél: ismerd meg a konkrét, 2025-2026-os szabályzati különbségeket a nagy szolgáltatók között.</p>

### Az Anthropic 2025 augusztusi fordulata

::::: callout danger label="A politikaváltás, ami sokakat meglepett"
2025 augusztusában az Anthropic — ami korábban a "nem tanítunk az ügyfelek adatán" hírnevét építette — bejelentette, hogy a **fogyasztói** Claude-fiókok (Free, Pro, Max, valamint a Claude Code) beszélgetései **alapból bekerülnek** a tanítási adatba, hacsak a felhasználó **aktívan ki nem lép** belőle. A határidő **2025. szeptember 28.** volt — aki nem döntött eddig, annak az adata automatikusan bekerült.
:::::

::::: callout warning label="Az 5 éves megőrzés, és amit az opt-out NEM töröl"
Ha valaki **nem** opt-outolt (vagy elfogadta az alapértelmezett beállítást), a beszélgetései **akár 5 évig** megőrződnek. Fontos: az opt-out **csak a jövőbeli** beszélgetésekre vonatkozik — a korábban már hozzájárult adatot az Anthropic **továbbra is megtartja és használja**, azt utólag nem lehet visszavonni.
:::::

### A többi nagy szolgáltató, ugyanebben az időszakban

::::: callout label="Nincs egységes iparági gyakorlat"
Egy 2026-os, hat nagy amerikai AI-céget (Amazon, Anthropic, Google, Meta, Microsoft, OpenAI) vizsgáló Stanford-kutatás megállapította: **mind a hat** cég alapból felhasználja a chat-adatot a tanításhoz, ha a felhasználó nem lép ki explicit módon. Az OpenAI-nál ezt a "Improve the model for everyone" kapcsoló szabályozza; a Google-nél a "Gemini Apps Activity" beállítás.
:::::

::::: callout danger label="A biztonsági kivétel, amit érdemes ismerni"
Az Anthropic adatvédelmi szabályzata fenntartja a jogot, hogy a **"biztonsági felülvizsgálatra megjelölt"** beszélgetéseket **akkor is** felhasználja, ha a felhasználó egyébként opt-outolt — ez azt jelenti, az opt-out **nem abszolút garancia** minden esetben.
:::::

::::: callout label="Egy mondatban"
2026-ra nincs egységes iparági alapértelmezés — a hat nagy szolgáltató mindegyike **alapból bevonja** a fogyasztói beszélgetéseket a tanításba, csak a kilépési mechanizmus helye és a megőrzési idő tér el cégenként.
:::::
::::::

:::::: section id=conversation-data-training-3 num="03" heading="3. rész — API vs. fogyasztói termék: a legfontosabb megkülönböztetés" nav="API vs. fogyasztói termék" group="Cégenként más"

<p class="topic-tagline">Cél: ismerd meg egy kritikus különbséget, ami sokszor elsikkad, pedig teljesen más kockázati profilt jelent.</p>

### Ugyanaz a cég, de más szerződéses garancia

::::: callout label="Az API rendszerint kizárt a tanításból"
Az Anthropic (és az OpenAI, valamint a legtöbb nagy szolgáltató) **kereskedelmi szerződésben, nem csak adatvédelmi ígéretként** rögzíti, hogy az **API-n keresztüli** használat **nem kerül be** a tanítási adatba — ez azt jelenti, ha a te alkalmazásod (lásd a <em>Hivatalos SDK-k</em> tutorialt) az API-t hívja, nem a fogyasztói chat-felületet, a beszélgetések **szerződéses garanciával**, nem csak beállítási kapcsolóval vannak kizárva.
:::::

::::: callout warning label="Miért fontos ez vállalati kontextusban"
A <em>Vállalati AI</em> tutorialban tárgyalt megfelelőségi keretek (GDPR, SOC 2) pontosan erre a megkülönböztetésre épülnek — egy vállalat, ami az API-n vagy egy olyan platformon (Amazon Bedrock, Google Cloud Vertex AI) keresztül éri el a modellt, ami **explicit kizárja** a tanítást, **más adatvédelmi kockázati profillal** dolgozik, mint egy alkalmazott, aki a fogyasztói ChatGPT-t vagy Claude.ai-t használja munkára.
:::::

::::: callout label="A gyakorlati következmény"
Ha érzékeny, üzleti vagy személyes adatot dolgozol fel AI-val, a kérdés nem "melyik céget használom", hanem **"melyik hozzáférési módot"** — ugyanaz a modell, ugyanaz a cég, teljesen más szerződéses garanciát ad API-n és fogyasztói felületen keresztül.
:::::
::::::

:::::: section id=conversation-data-training-4 num="04" heading="4. rész — A rejtett kockázat: a PII-szűrés nem elég" nav="A rejtett kockázat" group="A rejtett kockázat"

<p class="topic-tagline">Cél: ismerd meg egy meglepő, dokumentált kutatási eredményt, ami túlmutat a hagyományos adatvédelmi gondolkodáson.</p>

### Egy kutatás, ami megkérdőjelezi a "csak töröld a neveket" megközelítést

::::: callout danger label="A konkrét kísérlet"
Egy 2026-os kutatás **1057 felhasználó** beszélgetés-történetét vizsgálta — mindegyik előzőleg átment egy **kettős szűrésen**: egy named-entity-recognition (NER) szűrőn ÉS egy LLM-alapú "önfelfedés"-szűrőn, tehát egyetlen felhasználó sem mondta el explicit, ki ő. A kutatók ezután egy sima, kereskedelmi forgalomban elérhető Llama-3.3-70B modellel próbálták **kikövetkeztetni** az életkort, nemet és országot — **kizárólag a stílus és a témaválasztás alapján**.
:::::

::::: callout danger label="Az eredmény: 84-90%-os pontosság, PII nélkül"
A modell **0,84-es F1-pontszámmal** találta el az életkort, **0,90-nel** a nemet, **0,88-cal** az országot — annak ellenére, hogy a beszélgetésekben **semmilyen explicit azonosító adat nem volt jelen**. A minta, amiből ez kiolvasható, nem a "mit mondtál", hanem a **"hogyan mondtad és miről"**.
:::::

::::: callout warning label="Amit ez jelent a hagyományos adatvédelmi eszközökre nézve"
A <em>Biztonság &amp; OWASP</em> tutorialban is érintett, hagyományos **PII-szűrés** (nevek, e-mailek, címek eltávolítása) egy fontos, de **nem elégséges** védelmi réteg — a kutatás szerint a valódi adatvédelmi kockázat **stílus- és téma-szintű**, amit egy szó-alapú szűrő elvileg sem tud kezelni.
:::::

::::: callout label="Egy mondatban"
Még ha egy cég tökéletesen betartja is a saját PII-szűrési ígéreteit, egy elég nagy, elég sokszínű beszélgetés-adathalmazból **statisztikailag kikövetkeztethető** demográfiai információ marad — ez egy alapvetőbb, nehezebben megoldható adatvédelmi probléma, mint a névtelenítés.
:::::
::::::

:::::: section id=conversation-data-training-5 num="05" heading="5. rész — Mit tehetsz gyakorlatban" nav="Mit tehetsz gyakorlatban" group="Referencia"

<p class="topic-tagline">Cél: adj konkrét, cselekvésre alkalmas lépéseket, ha ez a kérdés fontos neked.</p>

### Négy konkrét lépés

::::: stack-grid
:::: card label="1 · Ellenőrizd a beállításaidat"
Minden nagy szolgáltatónál (Anthropic: Beállítások → Adatvédelem → "Segítsd a Claude fejlesztését"; OpenAI: "Improve the model for everyone") van egy konkrét kapcsoló — ez nem mindig az alapértelmezett állapotban van azon a szinten, amit te szeretnél.
::::
:::: card label="2 · API-t használj érzékeny adathoz"
Ha rendszeresen dolgozol fel érzékeny információt, egy API-alapú integráció (lásd a <em>Hivatalos SDK-k</em> tutorialt) **szerződéses garanciát** ad a tanításból való kizárásra, nem csak egy beállítási kapcsolót.
::::
:::: card label="3 · Fontold meg a PII-szűrést a saját oldaladon"
Ha egy alkalmazást építesz, ami felhasználói adatot küld tovább egy AI-modellnek, egy **saját, előzetes PII-szűrési réteg** (a 4. részben látott eszközök mintájára) extra védelmet ad, még mielőtt az adat elhagyná a te rendszeredet.
::::
:::: card label="4 · Ne feledd: az opt-out nem visszamenőleges"
Ha korábban már hozzájárultál (akár tudtodon kívül, egy alapértelmezett beállítással), a már összegyűjtött adat **nem törlődik** egy utólagos opt-outtal — csak a jövőbeli beszélgetéseidre vonatkozik.
::::
:::::

::::: callout label="Egy mondatban"
A legjobb védekezés nem egyetlen kapcsoló megnyomása — egy tudatos kombináció: ellenőrzött beállítások, API-hozzáférés érzékeny adatnál, és annak elfogadása, hogy a névtelenítés önmagában sosem garantál teljes adatvédelmet.
:::::
::::::

:::::: section id=conversation-data-training-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0–1. rész"
Nincs folyamatos, élő tanulás — egy beszélgetés csak egy diszkrét, később induló tanítási kör részeként befolyásolhat egy jövőbeli modellt, mintavételezésen és PII-szűrésen átmenve
::::
:::: card label="2. rész"
Az Anthropic 2025 augusztusi fordulata (opt-out, 5 éves megőrzés) — és hogy mind a hat nagy amerikai AI-cég alapból bevonja a fogyasztói adatot a tanításba
::::
:::: card label="3. rész"
API vs. fogyasztói termék: ugyanaz a cég, de az API szerződéses garanciával kizárja a tanítást, a fogyasztói felület csak egy beállítási kapcsolóval
::::
:::: card label="4–5. rész"
A stílus/téma-alapú kikövetkeztetés kockázata (84-90%-os pontosság PII nélkül is), és négy konkrét lépés, ha ez fontos neked
::::
:::::

<p class="topic-tagline">Kapcsolódó: az <em>RLHF</em> (a technikai pipeline, ahova a beszélgetés-adat illeszkedik), a <em>Vállalati AI</em> (a GDPR és megfelelőségi keret, ami ide is vonatkozik), az <em>AI szabályozás és felelősség</em> (a szélesebb jogi kontextus) és a <em>Biztonság &amp; OWASP</em> (a PII-kezelés technikai oldala) tutorialok.</p>

<p class="topic-tagline" style="margin-top:12px;font-size:0.85em;opacity:0.75">* Az Anthropic 2025. szeptember 28-i határideje és 5 éves megőrzési szabálya, valamint a 84-90%-os kikövetkeztetési pontosság 2026-os, publikus forrásokból (Anthropic hivatalos közlemények, Stanford HAI-kutatás, arXiv-publikáció) származik — lásd a 2. és 4. részt a kontextusért. A szabályzatok gyorsan változnak, érdemes a mindenkori hivatalos forrást ellenőrizni.</p>
::::::
