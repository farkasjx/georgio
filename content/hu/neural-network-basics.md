---
page: neural-network-basics
title: Neurális hálók alapjai — a belépő pont a transformer előtt
sidebar_groups:
  - Alapfogalmak
  - Miért kell a nemlinearitás
  - A tanulási folyamat
  - Referencia
hero:
  eyebrow: "Neurális hálók alapjai · Fejlesztői Tanulási Terv"
  title: "Neurális hálók alapjai — <em>a belépő pont a transformer előtt</em>"
  lead: "Az Egy modell anatómiája tutorial rögtön a transformer-specifikus rétegekkel indít — attention, feed-forward, embedding. Ez a cikk egy lépéssel korábbra megy: mi az a neuron, mi az a réteg, és miért omlana össze az egész mélytanulás egyetlen mátrix-szorzattá egy apró, de kritikus trükk (a nemlinearitás) nélkül."
  stats:
    - { val: "3", lbl: "rétegtípus (bemeneti/rejtett/kimeneti)" }
    - { val: "1", lbl: "trükk, ami mindent lehetővé tesz" }
    - { val: "5", lbl: "Szakasz" }
    - { val: "0", lbl: "amennyit egy nemlineáris réteg nélkül tudna a háló" }
footer:
  left: "AI Hub · Neurális hálók alapjai"
  right: "Neurális hálók alapjai · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#neural-network-basics-0"><div class="tc-num">0. rész</div><div class="tc-name">Mi az a neuron</div><div class="tc-desc">A legkisebb egység, amiből minden felépül.</div></a>
  <a class="toc-card" href="#neural-network-basics-1"><div class="tc-num">1. rész</div><div class="tc-name">Rétegek: bemeneti, rejtett, kimeneti</div><div class="tc-desc">Hogyan áll össze egy hálózat neuronokból.</div></a>
  <a class="toc-card" href="#neural-network-basics-2"><div class="tc-num">2. rész</div><div class="tc-name">A nemlinearitás trükkje</div><div class="tc-desc">Az egyetlen ok, amiért a mély háló nem omlik össze egyetlen szorzássá.</div></a>
  <a class="toc-card" href="#neural-network-basics-3"><div class="tc-num">3. rész</div><div class="tc-name">Mi az a "mély" a mélytanulásban</div><div class="tc-desc">Rétegszám, és mit ad hozzá minden újabb réteg.</div></a>
  <a class="toc-card" href="#neural-network-basics-4"><div class="tc-num">4. rész</div><div class="tc-name">Hova illeszkedik ez a transformerhez</div><div class="tc-desc">A híd az Egy modell anatómiája tutorialhoz.</div></a>
</div>
::::::

:::::: section id=neural-network-basics-0 num="00" heading="0. rész — Mi az a neuron" nav="Mi az a neuron" group="Alapfogalmak"

<p class="topic-tagline">Cél: értsd meg a legkisebb építőelemet, mielőtt a teljes hálózatra rátérnénk.</p>

### Egy neuron: bemenet, súly, összeg

::::: callout label="A neuron működése, fogalmi szinten"
Egy **neuron** néhány bemenetet fogad, mindegyiket egy tanult **súllyal** (weight) megszoroz, összeadja őket, hozzáad egy **torzítási értéket** (bias), majd az eredményt átengedi egy **aktivációs függvényen** (lásd a 2. részt), mielőtt továbbadná a kimenetét. Ez ugyanaz a "súly" fogalom, amit a <em>Hogyan tanul egy modell</em> tutorialban a tanítási hurok kontextusában már megismertél.
:::::

::::: callout label="Egy elnagyolt biológiai analógia"
A neurális háló neve az agyi neuronok inspirálta modellből ered: egy biológiai neuron csak akkor "tüzel" (aktiválódik), ha a bejövő jelek összessége átlép egy küszöböt — a mesterséges neuron aktivációs függvénye ezt a küszöb-viselkedést modellezi, jóval leegyszerűsítve.
:::::

::::: callout label="Egy mondatban"
Egy neuron önmagában egy egyszerű, súlyozott összeg-számítás — az igazi erő abból jön, hogy **több ezer, réteges elrendezésben összekapcsolt** neuron együtt dolgozik, amit a következő rész mutat be.
:::::
::::::

:::::: section id=neural-network-basics-1 num="01" heading="1. rész — Rétegek: bemeneti, rejtett, kimeneti" nav="Rétegek: bemeneti, rejtett, kimeneti" group="Alapfogalmak"

<p class="topic-tagline">Cél: értsd meg, hogyan áll össze egyetlen neuronból egy teljes hálózat.</p>

### A három rétegtípus

::::: stack-grid
:::: card label="Bemeneti réteg"
Itt lép be az adat a hálózatba — nincs benne tényleges számítás, csak "átadja" a nyers bemenetet (pl. egy kép pixelértékeit, vagy egy token embeddingjét) a következő rétegnek.
::::
:::: card label="Rejtett réteg(ek)"
Itt történik a tényleges feldolgozás — minden neuron a **saját, tanult súlyaival** kombinálja az előző réteg kimeneteit, és egy aktivációs függvényen keresztül továbbadja az eredményt.
::::
:::: card label="Kimeneti réteg"
Az utolsó réteg adja a végső eredményt — pl. egy szám (regresszióhoz, lásd a <em>Gépi tanulás alapjai</em> tutorialt), vagy egy valószínűségi eloszlás (klasszifikációhoz, illetve az LLM-ek token-jóslásához, lásd a <em>Véletlenszerűség és mintavételezés</em> tutorialt).
::::
:::::

::::: callout label="Egy mondatban"
Egy neurális háló nem más, mint neuronok **rétegekbe rendezett** csoportja, ahol minden réteg kimenete a következő réteg bemenete — ez az egyszerű, ismétlődő struktúra teszi lehetővé, hogy a hálózat egyre absztraktabb mintázatokat ismerjen fel.
:::::
::::::

:::::: section id=neural-network-basics-2 num="02" heading="2. rész — A nemlinearitás trükkje: az egyetlen ok, amiért ez működik" nav="A nemlinearitás trükkje" group="Miért kell a nemlinearitás"

<p class="topic-tagline">Cél: érts meg egy kritikus, gyakran átugrott technikai részletet, ami nélkül a teljes mélytanulás értelmetlen lenne.</p>

### Mi történne aktivációs függvény nélkül

::::: callout danger label="A meglepő matematikai tény"
Ha egy neurális hálóból **teljesen elhagynád** az aktivációs függvényeket (csak a súlyozott összegeket adnád tovább rétegről rétegre), a végeredmény — **függetlenül attól, hány réteget pakolsz egymásra** — matematikailag ekvivalens lenne egyetlen, egyszerű lineáris transzformációval. 100 réteg ugyanannyit érne, mint 1 réteg.
:::::

### Az aktivációs függvény, ami ezt megakadályozza

::::: callout label="Amit egy aktivációs függvény ténylegesen csinál"
Az **aktivációs függvény** (pl. a ma legelterjedtebb **ReLU** — Rectified Linear Unit, ami egyszerűen "nullára vágja" a negatív értékeket) egy **nemlineáris** lépést illeszt be minden réteg után. Ez a nemlinearitás az, ami lehetővé teszi, hogy a hálózat **görbült, összetett mintázatokat** tanuljon meg, ne csak egyenes vonalakat/síkokat illesszen az adatra.
:::::

::::: callout warning label="Miért pont a ReLU lett a legnépszerűbb"
A ReLU számítási szempontból rendkívül **egyszerű és gyors** (csak egy összehasonlítás: "pozitív-e a szám"), és jobban ellenáll egy klasszikus tanítási problémának (az ún. eltűnő gradiens jelenségnek), mint a korábban népszerű szigmoid vagy tanh függvények — ezért vált a rejtett rétegek de facto alapértelmezésévé.
:::::

::::: callout label="Egy mondatban"
A nemlinearitás nem egy technikai apróság — ez az **egyetlen** ok, amiért egyáltalán érdemes több réteget egymásra pakolni; enélkül a "mély" tanulás szó szerint értelmét vesztené.
:::::
::::::

:::::: section id=neural-network-basics-3 num="03" heading="3. rész — Mi az a \"mély\" a mélytanulásban" nav="Mi az a mély a mélytanulásban" group="A tanulási folyamat"

<p class="topic-tagline">Cél: értsd meg, mit ad hozzá ténylegesen minden újabb réteg egy hálózathoz.</p>

### A rétegszám és a mintázat-absztrakció kapcsolata

::::: callout label="Egyre absztraktabb mintázatok"
Minden újabb rejtett réteg lehetőséget ad a hálózatnak, hogy az **előző réteg által felismert mintázatokból** egy még absztraktabb mintázatot építsen fel. Egy képfelismerő hálónál ez szemléletesen követhető: a korai rétegek éleket és színátmeneteket ismernek fel, a középső rétegek ezekből formákat, a késői rétegek pedig ezekből teljes objektumokat.
:::::

::::: callout label="\"Mély\" egyszerűen azt jelenti: sok réteg"
A "mélytanulás" (deep learning) kifejezés a **rétegek számára** utal — egy "sekély" hálózatnak csak egy-két rejtett rétege van, egy "mély" hálózatnak jellemzően több tucat vagy száz. Az <em>Egy modell anatómiája</em> tutorial 5. részében látott konkrét példák (GPT-3: 96 réteg, Llama 3 405B: 126 réteg) pontosan ezt a rétegszámot mutatják egy modern LLM esetén.
:::::

::::: callout label="Egy mondatban"
A mélység (rétegszám) és a nemlinearitás (2. rész) együtt adják azt a képességet, hogy a hálózat egyre elvontabb, egyre összetettebb mintázatokat ismerjen fel a nyers bemenetből.
:::::
::::::

:::::: section id=neural-network-basics-4 num="04" heading="4. rész — Hova illeszkedik ez a transformerhez" nav="Hova illeszkedik ez a transformerhez" group="Referencia"

<p class="topic-tagline">Cél: kösd össze ezt a cikket az Egy modell anatómiája tutoriallal — lásd, mi az általános elv, és mi a transformer-specifikus megvalósítás.</p>

### Az általános elv és a konkrét megvalósítás

::::: callout label="Amit ez a cikk megalapoz"
Az <em>Egy modell anatómiája</em> tutorialban tárgyalt **feed-forward réteg** (a 2. részben) technikailag pontosan az itt bemutatott, neuronokból és aktivációs függvényekből álló struktúra egy konkrét megvalósítása. A transformer "különlegessége" nem ebben a rétegtípusban van, hanem az **attention mechanizmusban**, ami egy másik, kiegészítő elem — de az alapvető "súly, összeg, nemlinearitás" logika ugyanaz marad.
:::::

::::: callout label="Egy mondatban"
Ha ezt a cikket megértetted, az <em>Egy modell anatómiája</em> tutorial feed-forward rétege most már nem egy "fekete doboz" — hanem egy felismerhető, jól definiált szerkezet: neuronok, súlyok, és egy nemlineáris lépés, ismételve.
:::::
::::::

:::::: section id=neural-network-basics-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0–1. rész"
A neuron mint súlyozott összeg-számítás · a bemeneti/rejtett/kimeneti rétegek szerepe egy teljes hálózatban
::::
:::: card label="2. rész"
A nemlinearitás kritikus szerepe — aktivációs függvény nélkül 100 réteg ugyanannyit érne, mint 1, és a ReLU miért lett a de facto alapértelmezés
::::
:::: card label="3. rész"
Mi az a "mély" a mélytanulásban — a rétegszám és az egyre absztraktabb mintázat-felismerés kapcsolata
::::
:::: card label="4. rész"
A híd az Egy modell anatómiája tutorialhoz — a feed-forward réteg mint ennek az általános elvnek egy konkrét megvalósítása
::::
:::::

<p class="topic-tagline">Kapcsolódó: az <em>Egy modell anatómiája</em> (a transformer-specifikus rétegek, amikre ez a cikk az alapot adja), a <em>Gépi tanulás alapjai</em> (a tanítási keret, amiben a neurális hálók működnek) és a <em>Hogyan tanul egy modell</em> (a súlyok tanulási mechanizmusa) tutorialok.</p>
::::::
