---
page: model-types
title: Modelltípusok térképe — LLM, SLM, LAM, VLM és a többi
sidebar_groups:
  - A térkép
  - A típusok
  - Együtt
  - Referencia
hero:
  eyebrow: "Modelltípusok · Fejlesztői Tanulási Terv"
  title: "Modelltípusok térképe — <em>LLM, SLM, LAM, VLM és a többi</em>"
  lead: "LLM, SLM, LAM, VLM, LCM, MLM, SAM — az AI-világ betűszó-inflációja könnyen zavaróvá válik. Ez a cikk nem mindegyiket fejti ki mélyen (a legtöbbről már van önálló tutoriald), hanem megmutatja, hova illik mindegyik a térképen, és hogyan dolgoznak együtt egy modern rendszerben — mert 2026-ban egyetlen komoly AI-alkalmazás sem egyetlen modelltípusra épül."
  stats:
    - { val: "7+", lbl: "gyakori modelltípus" }
    - { val: "1", lbl: "közös alap (transformer)" }
    - { val: "5", lbl: "Szakasz" }
    - { val: "0", lbl: "\"egy modell mindenre\"" }
footer:
  left: "AI Hub · Modelltípusok"
  right: "Modelltípusok · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#model-types-0"><div class="tc-num">0. rész</div><div class="tc-name">Miért ennyi betűszó</div><div class="tc-desc">A közös alap, és mi tesz egy típust "külön típussá".</div></a>
  <a class="toc-card" href="#model-types-1"><div class="tc-num">1. rész</div><div class="tc-name">Méret szerinti típusok: LLM és SLM</div><div class="tc-desc">Nagy, általános tudás vs. kicsi, célzott hatékonyság.</div></a>
  <a class="toc-card" href="#model-types-2"><div class="tc-num">2. rész</div><div class="tc-name">Modalitás szerinti típusok: VLM és a többi</div><div class="tc-desc">Amikor a bemenet nem csak szöveg.</div></a>
  <a class="toc-card" href="#model-types-3"><div class="tc-num">3. rész</div><div class="tc-name">Cselekvés szerinti típusok: LAM</div><div class="tc-desc">Amikor a modell nem válaszol, hanem csinál valamit.</div></a>
  <a class="toc-card" href="#model-types-4"><div class="tc-num">4. rész</div><div class="tc-name">Hogyan dolgoznak együtt éles rendszerben</div><div class="tc-desc">A hierarchikus, hibrid minta, ami 2026-ban a norma.</div></a>
</div>
::::::

:::::: section id=model-types-0 num="00" heading="0. rész — Miért ennyi betűszó: a közös alap" nav="Miért ennyi betűszó" group="A térkép"

<p class="topic-tagline">Cél: lásd, hogy a legtöbb "új" modelltípus nem egy teljesen más technológia, hanem ugyanannak az alapnak egy célzott variánsa.</p>

### Egy alap, sok specializáció

::::: callout label="A közös nevező"
A legtöbb ma használt modelltípus (LLM, SLM, VLM, és jórészt a LAM is) ugyanarra a <em>Egy modell anatómiája</em> tutorialban tárgyalt **transformer-architektúrára** épül — a különbség nem az alapmechanizmusban van, hanem abban, **mire optimalizálták**: méretre, modalitásra, vagy cselekvésre.
:::::

### A három tengely, ami elrendezi a térképet

::::: stack-grid
:::: card label="Méret"
Mekkora a modell, és milyen erőforráson fut — ez különbözteti meg az LLM-et az SLM-től.
::::
:::: card label="Modalitás"
Milyen bemenetet dolgoz fel — csak szöveget, vagy képet/hangot/videót is (lásd a <em>Multimodális modellek</em> tutorialt).
::::
:::: card label="Cselekvés"
Csak válaszol, vagy ténylegesen végre is hajt valamit a világban (kattint, kitölt egy űrlapot, vezérel egy alkalmazást).
::::
:::::

::::: callout label="Egy mondatban"
Amikor egy új betűszóval találkozol, ne azt kérdezd, "ez egy teljesen új technológia?" — hanem azt, "melyik tengelyen specializálódott ez a modell a sima LLM-hez képest?"
:::::
::::::

:::::: section id=model-types-1 num="01" heading="1. rész — Méret szerinti típusok: LLM és SLM" nav="Méret szerinti típusok" group="A típusok"

<p class="topic-tagline">Cél: értsd meg a méret-tengely két végpontját, és mikor melyiket válaszd.</p>

::::: compare
::: good label="LLM (Large Language Model)"
Milliárd, sokszor száz milliárd+ paraméteres modell, ami **szélességre** optimalizál — minél több témában, minél jobb minőségben. Jó chatbotokhoz, tartalomgeneráláshoz, kódoláshoz, tudás-visszakereséshez. A <em>Modellméret és tudás</em> tutorialban tárgyalt Chinchilla-skálázás ide vonatkozik.
:::
::: bad label="SLM (Small Language Model)"
Tipikusan 10 milliárd paraméter alatti modell (pl. TinyLlama, Phi-sorozat, SmolLM), ami **hatékonyságra, magánéletre és valós idejű futtatásra** optimalizál — edge-eszközön, telefonon, helyben futtatva. Cserébe szűkebb tudás-lefedettség.
:::
:::::

::::: callout label="Mikor melyik éri meg"
Az SLM-ek különösen jók **determinisztikus feladatokban** (nyelvtani javítás, átfogalmazás, strukturált adat-kinyerés), **szűk területeken** (egy adott termék ügyfélszolgálata) és **korlátozott környezetben** (mobilalkalmazás, IoT, adatvédelmi okból helyben futtatott feldolgozás) — lásd a <em>Fine-tuning technikák</em> és <em>Modelltanítás</em> tutorialokban tárgyalt "kis, specializált modell" filozófiát.
:::::

::::: callout warning label="A csökkenő hozamok törvénye"
A modellméretre is érvényes az általános elv: egy adott ponton túl a méret **megduplázása** már csak marginális javulást hoz — egy jól tanított, 3 milliárd paraméteres SLM egy szűk területen felülmúlhat egy sokkal nagyobb, általános LLM-et.
:::::
::::::

:::::: section id=model-types-2 num="02" heading="2. rész — Modalitás szerinti típusok: VLM és a többi" nav="Modalitás szerinti típusok" group="A típusok"

<p class="topic-tagline">Cél: kösd össze ezt a részt a Multimodális modellek tutoriallal — itt csak a betűszó-térképet adjuk meg.</p>

::::: stack-grid
:::: card label="VLM (Vision-Language Model)"
Képet és szöveget együtt dolgoz fel — a <em>Multimodális modellek</em> tutorialban részletesen tárgyalt architektúra. Jó képaláírásozásra, dokumentum-értelmezésre, vizuális kérdés-válaszra.
::::
:::: card label="MLM (Multimodal Language Model)"
Egy tágabb kategória, ami több modalitást (kép, hang, videó) egyszerre kezel, nem csak képet és szöveget — a VLM ennek egy specifikus esete.
::::
:::: card label="SAM (Segment Anything Model)"
Egy speciális, képszegmentálásra optimalizált modelltípus — nem "ért" a képhez általánosságban, hanem pontosan kijelöli, mely pixelek tartoznak egy adott objektumhoz.
::::
:::: card label="LCM (Large Concept Model)"
Egy kísérleti, korai stádiumú irány (pl. a Meta nyílt forráskódú kutatása) — token helyett magasabb szintű "koncepciókon" gondolkodik, mondat- vagy bekezdés-szinten, nem szó-szinten.
::::
:::::

::::: callout warning label="Ami még korai stádiumban van"
Az LCM-ek dokumentáltan **korai fázisban** vannak — ígéretesek, de a valós, éles agentic használati esetek validálása még folyamatban van. Ha egy cikkben ilyen kifejezéssel találkozol, érdemes tudni, hogy ez még kutatási, nem kiforrott, széles körben bevált technológia.
:::::

::::: callout label="Egy mondatban"
A modalitás-alapú típusok (VLM, MLM, SAM) mind arra válaszolnak, "mit lát/érzékel" a modell a szövegen túl — a <em>Multimodális modellek</em> tutorial adja meg, technikailag hogyan történik ez.
:::::
::::::

:::::: section id=model-types-3 num="03" heading="3. rész — Cselekvés szerinti típusok: LAM" nav="Cselekvés szerinti típusok" group="A típusok"

<p class="topic-tagline">Cél: értsd meg a harmadik tengelyt — amikor a modell nem csak mond valamit, hanem csinál is.</p>

### A LAM: Large Action Model

::::: callout label="Mi különbözteti meg egy LLM-től"
Egy **LAM** (Large Action Model) a tervezett lépéseket **ténylegesen végrehajtható akció-sorozattá** fordítja — ez szorosan kapcsolódik az <em>Agent architektúra</em> tutorialban tárgyalt function calling és ReAct hurokhoz, csak itt a modell maga kifejezetten **cselekvés-generálásra** van optimalizálva, nem csak szöveges válaszra.
:::::

### A dokumentált nehézségek

::::: callout danger label="Amivel a LAM-ok ma küzdenek"
A LAM-ok komoly kihívásokkal néznek szembe éles bevetésnél: váratlan felhasználói felület-állapotok kezelése, hibából való felépülés, és **biztonsági korlátok visszafordíthatatlan akcióknál** (pl. egy fájl törlése, egy fizetés elindítása) — ez pontosan az az "excessive agency" kockázat, amit a <em>Biztonság &amp; OWASP</em> tutorial is tárgyal.
:::::

::::: callout label="Egy mondatban"
A LAM nem egy másik "agyat" jelent — hanem azt a specializációt, hogy a modell kimenete nem egy mondat, hanem egy **futtatható cselekvés-lánc**, ami miatt a biztonsági megfontolások (lásd a 4. részt) itt különösen fontosak.
:::::
::::::

:::::: section id=model-types-4 num="04" heading="4. rész — Hogyan dolgoznak együtt éles rendszerben" nav="Hogyan dolgoznak együtt éles rendszerben" group="Együtt"

<p class="topic-tagline">Cél: lásd az igazi, 2026-os mintát — nem egyetlen modelltípus, hanem egy hierarchikus együttműködés.</p>

### Az "egy modell mindenre" korszak vége

::::: callout label="A tipikus, éles architektúra"
A mai production AI-rendszerek ritkán támaszkodnak egyetlen modelltípusra — egy jellemző, hierarchikus minta: egy **reasoning modell** (lásd a <em>Reasoning</em> tutorialt) tervez és bont célokra, egy **LAM** ezt végrehajtható lépésekké fordítja, egy **VLM** dolgozza fel a vizuális bemenetet (screenshotot, dokumentumot), egy **SLM** végzi a nagy volumenű, késleltetés-érzékeny előfeldolgozást, és egy általános **LLM** kezeli a felhasználóval folyó párbeszédet.
:::::

### A gyakorlati megvalósítás

::::: callout label="Runtime MoE, agent-szinten"
Egyes keretrendszerek (pl. OpenAI Agents SDK "handoff" mechanizmusa) formalizálják ezt: specializált ügynökök — mindegyik más modelltípussal vagy konfigurációval — **képesség szerint adják át egymásnak** a feladatot. Ez lényegében ugyanaz az elv, mint a <em>Dense vs. MoE</em> tutorialban tárgyalt útvonalválasztás (routing) — csak itt nem rétegek, hanem teljes **ügynökök** között választ a rendszer.
:::::

::::: callout warning label="Iparági specializáció, amerre tart a fejlődés"
A trend egyre inkább **iparág-specifikus** modellek felé mutat: jogi LLM-ek, orvosi VLM-ek, gyártási LAM-ok — mindegyik a saját szakterület zsargonjára, folyamataira és követelményeire hangolva (lásd a <em>Fine-tuning technikák</em> tutorialt).
:::::

::::: callout label="Egy mondatban"
Ha egy komplex AI-rendszert tervezel, a kérdés nem az, "melyik modelltípust válasszam", hanem az, "melyik feladatrészhez melyik típus illik legjobban" — a modern architektúra hierarchikus és hibrid, nem egyetlen, mindenre használt modell.
:::::
::::::

:::::: section id=model-types-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0. rész"
A legtöbb modelltípus közös transformer-alapra épül · három tengely rendezi a térképet: méret, modalitás, cselekvés
::::
:::: card label="1. rész"
LLM (szélesség) vs. SLM (hatékonyság, edge, magánélet) — és mikor éri meg a kisebb modell a nagyobb helyett
::::
:::: card label="2–3. rész"
Modalitás-alapú típusok (VLM, MLM, SAM, LCM) és a cselekvés-alapú LAM — utóbbi konkrét, dokumentált biztonsági kihívásokkal
::::
:::: card label="4. rész"
A 2026-os valóság: hierarchikus, hibrid rendszerek, ahol több modelltípus dolgozik együtt, "handoff" mechanizmussal
::::
:::::

<p class="topic-tagline">Kapcsolódó: az <em>Egy modell anatómiája</em> (a közös transformer-alap), a <em>Multimodális modellek</em> (a VLM technikai részletei), az <em>Agent architektúra</em> (a LAM mögötti cselekvés-generálás) és a <em>Dense vs. MoE</em> (a routing-elv, amit az agent-szintű "handoff" is követ) tutorialok.</p>
::::::
