---
page: model-training
title: Hogyan tanul egy modell — a pretraining motorja
sidebar_groups:
  - Elmélet
  - A gépezet
  - Léptékek
  - Referencia
hero:
  eyebrow: "Modelltanítás · Fejlesztői Tanulási Terv"
  title: "Hogyan tanul egy modell — <em>a pretraining motorja</em>"
  lead: "Eddig a legtöbb tutorial azt vette, mi történik, miután egy modell már betanult — ez a cikk azt nézi meg, hogyan lesz egyáltalán belőle valami. Próbálkozás, hiba, javítás — milliárdszor egymás után. Ez a \"motor\", ami körül a vektortér, a tudás és minden más felépül. Épít a <em>Modellméret és tudás</em>, a <em>Base vs. Instruct</em> és a <em>Vektor adatbázisok</em> tutorialokra — matek nélkül, fogalmi szinten."
  stats:
    - { val: "1,72M", lbl: "GPU-óra (Llama2-70B)*" }
    - { val: "9", lbl: "Szakasz" }
    - { val: "0", lbl: "Képlet" }
    - { val: "1", lbl: "Alapmechanizmus mindenhez" }
footer:
  left: "AI Hub · Modelltanítás"
  right: "Modelltanítás · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#model-training-0"><div class="tc-num">0. rész</div><div class="tc-name">Próbálkozás, hiba, javítás</div><div class="tc-desc">A tanulás alapötlete — egyetlen mechanizmus mindenhez.</div></a>
  <a class="toc-card" href="#model-training-1"><div class="tc-num">1. rész</div><div class="tc-name">A motor: súlyokból embedding</div><div class="tc-desc">Hogyan lesz egy véletlenszerű számhalmazból értelmes vektortér.</div></a>
  <a class="toc-card" href="#model-training-2"><div class="tc-num">2. rész</div><div class="tc-name">A tanítási adat</div><div class="tc-desc">Mennyi kell, honnan jön, és mennyibe kerül.</div></a>
  <a class="toc-card" href="#model-training-3"><div class="tc-num">3. rész</div><div class="tc-name">Egy konkrét lépés végigkövetve</div><div class="tc-desc">Forward pass → loss → backward pass → frissítés.</div></a>
  <a class="toc-card" href="#model-training-4"><div class="tc-num">4. rész</div><div class="tc-name">Kis vs. nagy modell tanítása</div><div class="tc-desc">Más stratégia, más cél, más korlát.</div></a>
  <a class="toc-card" href="#model-training-5"><div class="tc-num">5. rész</div><div class="tc-name">Distillation és szintetikus adat</div><div class="tc-desc">Hogyan tanít egy nagy modell egy kicsit.</div></a>
  <a class="toc-card" href="#model-training-6"><div class="tc-num">6. rész</div><div class="tc-name">Kitekintés: diffúziós tanítás</div><div class="tc-desc">Más jóslási cél, ugyanaz a mechanizmus.</div></a>
  <a class="toc-card" href="#model-training-7"><div class="tc-num">7. rész</div><div class="tc-name">Hova illeszkedik ez a nagy képbe</div><div class="tc-desc">Pretraining, majd minden, amit eddig tanultál.</div></a>
</div>
::::::

:::::: section id=model-training-0 num="00" heading="0. rész — Próbálkozás, hiba, javítás: a tanulás alapötlete" nav="Próbálkozás, hiba, javítás" group="Elmélet"

<p class="topic-tagline">Cél: értsd meg az EGY mechanizmust, ami a teljes cikk hátterében áll — utána minden más erre épül rá.</p>

### Egyetlen ötlet, milliárdszor megismételve

Egy neurális háló tanítása mögött egy meglepően egyszerű ötlet áll, amit egy gyerek is ismer intuitívan: **próbálj meg valamit, nézd meg, mennyire tévedtél, és korrigálj egy kicsit a jó irányba** — majd ismételd ezt milliárdszor.

::::: stack-grid
:::: card label="1 · Jóslás"
A modell (kezdetben **teljesen véletlenszerű** belső beállításokkal) megpróbál megjósolni valamit — egy LLM esetén a következő szót egy szövegben.
::::
:::: card label="2 · Hiba mérése"
Egy **loss function** (hibafüggvény) számszerűsíti, mennyire tévedett a jóslás a valós, helyes választáshoz képest — minél nagyobb a szám, annál rosszabb volt a jóslás.
::::
:::: card label="3 · Korrekció"
A **backpropagation** (visszaterjesztés) és a **gradiens ereszkedés** kiszámolja, a belső beállítások melyik irányba mozdítása csökkentené ezt a hibát legjobban — majd egy **apró lépést** tesz abba az irányba.
::::
:::::

::::: callout label="Az egyetlen mondat, ami az egész cikket összefogja"
Minden, amiről ez a cikk szól — legyen szó egy LLM-ről vagy egy diffúziós képgenerátorról —, ugyanezt a **jósolj → mérd a hibát → korrigálj** hurkot ismétli **milliárdszor**, csak a "mit jósolunk" kérdésre adott válasz különbözik.
:::::

::::: callout warning label="Miért \"apró\" lépés, és miért nem egyszerre nagy javítás"
Ha a modell egyetlen hibás jóslás után **nagyot** korrigálna, könnyen "túllőne" a célon, és összezavarodna a korábban már jól megtanult mintázatokban is. Az apró, sok lépésben történő finomítás — amit egy **tanulási ráta** nevű beállítás szabályoz — az, ami stabilan, fokozatosan vezeti a modellt egyre jobb jóslások felé.
:::::
::::::

:::::: section id=model-training-1 num="01" heading="1. rész — A motor: hogyan lesz a súlyokból értelmes vektortér" nav="A motor: súlyokból embedding" group="A gépezet"

<p class="topic-tagline">Cél: kösd össze ezt a hurkot azzal, amit a Vektor adatbázisok tutorialban már megismertél az embeddingekről.</p>

### A kezdet: véletlenszerű számok, semmi értelme

Egy neurális háló (a transformer, amiről a <em>Reasoning</em> tutorial 1. részében volt szó) tanítás **előtt** csupán milliárdnyi **véletlenszerű** számból áll — ezeket hívjuk **súlyoknak** (weights). Ezen a ponton a modell szó szerint **semmit nem tud**: ha ekkor kérnél tőle egy embeddinget (lásd a <em>Vektor adatbázisok</em> tutorial 1–2. részét), az egy értelmetlen, véletlenszerű vektor lenne.

::::: callout label="Amit a 0. részben látott hurok ténylegesen épít"
Minden egyes **jósolj → mérd a hibát → korrigálj** ismétlés egy icipicit **arrébb tolja** ezeket a súlyokat — és ahogy ez milliárdszor megtörténik, a súlyok fokozatosan olyan mintázatot vesznek fel, hogy a belőlük számolt vektorok (embeddingek) elkezdik **tükrözni a jelentést**: hasonló jelentésű szavak egyre közelebb kerülnek egymáshoz a vektortérben.
:::::

### Miért nem "beprogramozzák" ezt valakik

::::: callout warning label="Fontos félreértés eloszlatása"
Senki nem írja le kézzel, hogy "a király" vektora milyen legyen, vagy hogy ez mennyire hasonlítson a "királynő" vektorára. Ez a struktúra **magától alakul ki**, kizárólag abból, hogy a modell milliárdszor próbálja megjósolni, milyen szó jön egy másik szó után — a nyelv statisztikai szerkezete "belenyomódik" a súlyokba a sok apró korrekció során.
:::::

::::: callout label="Egy mondatban"
A vektortér, amiről a <em>Vektor adatbázisok</em> tutorialban mint kész, használatra kész eszközről volt szó, valójában **a 0. részben látott tanítási hurok mellékterméke** — senki nem tervezte meg direktben, hanem a sok apró korrekcióból emergál.
:::::
::::::

:::::: section id=model-training-2 num="02" heading="2. rész — A tanítási adat: mennyi kell, honnan jön, mennyibe kerül" nav="A tanítási adat" group="A gépezet"

<p class="topic-tagline">Cél: érzékeltess konkrét nagyságrendeket — ne csak azt, hogy "sok adat kell".</p>

### A nyers adat mennyisége

A pretraining tanítóadata az internet, könyvek, kód és egyéb szöveges források hatalmas tömege — a <em>Modellméret és tudás</em> tutorial 2. részében látott **Chinchilla-arány** (kb. 20 token adat minden egyes paraméterre) adja meg a nagyságrendet: egy 70 milliárd paraméteres modellhez nagyjából **1,4 billió tokennyi** szöveg kell.

::::: callout danger label="Konkrét számok, amik érzékeltetik a léptéket"
A **Llama2-70B** pretraining-je dokumentáltan **1,72 millió GPU-órát** vett igénybe — ez egyetlen GPU-n futtatva több mint **196 évig** tartana. A négy Llama2-változat együttes tanításának **csak az áramköltsége** kb. **158 000 dollár** volt — ez nem is számolja bele magát a GPU-bérlést vagy a hardvert.
:::::

### Miért fogy el a "jó" adat

::::: callout warning label="A \"data wall\" jelenség"
2024 óta a kutatás egy növekvő problémával szembesül: a magas információsűrűségű, nyilvánosan elérhető szöveges adat mennyisége **véges** — ahogy a modellek egyre több billió tokent igényelnek, a további internetes adatgyűjtés hozama rohamosan csökken. Ez terelte a kutatókat a **szintetikus adat** (más modellek által generált tanítóadat) felé, amiről az 5. részben lesz szó.
:::::

::::: callout label="Egy mondatban"
A pretraining nem "csak sok adat" — konkrétan **billiónyi token** és **milliónyi GPU-óra**, ami miatt a legtöbb szervezet — ahogy a következő részekben látod majd — inkább **meglévő modellekre épít**, mint hogy nulláról tanítson.
:::::
::::::

:::::: section id=model-training-3 num="03" heading="3. rész — Egy konkrét lépés végigkövetve" nav="Egy konkrét lépés végigkövetve" group="A gépezet"

<p class="topic-tagline">Cél: lásd a 0. részben leírt hurkot egyetlen, konkrét, végigkövetett lépésben.</p>

### A négy mozzanat egyetlen tanítási lépésben

::::: stack-grid
:::: card label="1 · Forward pass"
A modell megkapja egy mondat elejét (pl. "A macska felugrott a"), és a jelenlegi súlyai alapján **kiszámolja**, szerinte melyik szó jön legvalószínűbben ezután.
::::
:::: card label="2 · Loss számítás"
Mivel a tanítóadatban a **valódi** következő szó is ismert (pl. "asztalra"), a loss function összeveti a modell jóslását a valósággal, és egyetlen számmá sűríti, **mekkora volt a hiba**.
::::
:::: card label="3 · Backward pass"
A **backpropagation** algoritmus visszafelé haladva, rétegről rétegre kiszámolja, a háló **melyik konkrét súlya mennyiben** járult hozzá ehhez a hibához.
::::
:::: card label="4 · Súlyfrissítés"
Egy **optimalizáló** (pl. Adam) minden egyes súlyt egy icipici lépéssel abba az irányba tol, ami — a 3. lépés számítása szerint — **csökkentené** a hibát legközelebb.
::::
:::::

::::: callout label="A lépték, ami ezt nehézzé teszi"
Ez a négy mozzanat **nem egyszer**, hanem a teljes tanítóadaton **milliárdszor-billiószor** megismétlődik, jellemzően nagy **batch-ekben** (egyszerre sok szövegrészleten párhuzamosan) — ez az, amiért a 2. részben látott GPU-óra mennyiség ilyen hatalmas.
:::::

::::: callout label="Egy mondatban"
Egyetlen tanítási lépés — forward, loss, backward, frissítés — önmagában egyszerű és gyors; a pretraining nehézsége abból fakad, hogy ezt **elképesztő mennyiségben** kell megismételni, mire a súlyok valóban hasznos mintázatokat vesznek fel.
:::::
::::::

:::::: section id=model-training-4 num="04" heading="4. rész — Kis vs. nagy modell tanítása: más stratégia, más cél" nav="Kis vs. nagy modell tanítása" group="Léptékek"

<p class="topic-tagline">Cél: értsd meg, hogy a kis és nagy modellek tanítása nem csak "kevesebb/több", hanem eltérő filozófia.</p>

### Két teljesen más tervezési cél

::::: compare
::: good label="Nagy modell (tipikusan 30B+ paraméter)"
A cél az **általános tudás**: minél szélesebb témakörben legyen kompetens. A tanítóadat a lehető legszélesebb spektrumú, nyers webes szöveg — mennyiség számít, a Chinchilla-arány (lásd a <em>Modellméret és tudás</em> tutorialt) szerint skálázva.
:::
::: bad label="Kis modell (tipikusan 1–14B paraméter)"
A cél gyakran a **specializáció**: egy szűkebb feladatkörben (pl. ügyfélszolgálat, kódgenerálás egy adott nyelven) legyen kiváló. Itt a tanítóadat **minősége** számít jobban, mint a mennyisége — gondosan szűrt, magas információsűrűségű ("tankönyv-minőségű") adaton tanítva.
:::
:::::

### Egy konkrét, dokumentált példa

::::: callout label="A Phi-3 sztori"
A Microsoft **Phi-3** modellcsaládja tudatosan **szintetikus, "tankönyv-minőségű"** adaton lett tanítva (gondosan szűrt, zajmentesített tartalom) — nem a teljes, nyers internet mennyiségén. Az eredmény: egy **jóval kisebb** modell, ami a képességek **90%+ -át** megtartotta egy sokkal nagyobb modellhez képest, miközben a mérete a nagy modell kb. **5%-a** volt.
:::::

::::: callout warning label="A gyakorlati következmény"
Ha egy kis, specializált modellt tanítasz (vagy fine-tune-olsz — lásd a <em>Fine-tuning technikák</em> tutorialt), a kérdés nem az, hogy "hogyan pótoljam a hiányzó méretet", hanem hogy **milyen szűkebb, magasabb minőségű adaton** érdemes tanítanod — egy jól megválasztott, kisebb adathalmaz gyakran jobb eredményt ad, mint egy hatalmas, de zajos.
:::::
::::::

:::::: section id=model-training-5 num="05" heading="5. rész — Distillation és szintetikus adat: amikor egy nagy modell tanít egy kicsit" nav="Distillation és szintetikus adat" group="Léptékek"

<p class="topic-tagline">Cél: ismerd meg a konkrét technikát, amivel a 4. részben látott "kis, specializált modell" felépül.</p>

### A tanár-diák minta

A **knowledge distillation** (tudás-desztilláció) lényege: egy nagy, már betanított **"tanár" modell** generál tanítóadatot (kérdés-válasz párokat, magyarázatokat) egy kisebb **"diák" modell** számára — a diák nem a nyers internetről tanul, hanem a tanár már megszűrt, magas minőségű kimeneteiből.

::::: callout label="Konkrét, klinikai példa"
Egy dokumentált kísérletben egy **70 milliárd paraméteres** tanár modell (Llama 3.1 70B-Instruct) generált szintetikus kérdés-válasz párokat orvosi dokumentumokból, amikkel egy **8 milliárd paraméteres** diák modellt tanítottak — a diák modell **több feladaton felül is múlta** a nála 9-szer nagyobb tanárt.
:::::

### Miért nem csalás ez

::::: callout warning label="A minőség-szűrés a lényeg, nem a méret-csalás"
A trükk nem az, hogy a diák "lemásolja" a tanárt — hanem hogy a tanár modell **megszűri és strukturálja** a nyers tudást olyan formába (jó kérdés-válasz párok, magyarázatokkal), amiből egy kisebb modell **hatékonyabban tanul**, mint ha ugyanannyi nyers, rendezetlen szöveget kapna. Ez pontosan az, amit a 4. részben "tankönyv-minőségű adatnak" hívtunk.
:::::

::::: callout label="Egy mondatban"
A distillation és a szintetikus adat a 2. részben látott "data wall" problémára ad választ: ahelyett, hogy egyre több nyers internetes szöveget próbálnál összegyűjteni, egy **már meglévő, nagy modellt** használsz arra, hogy magas minőségű tanítóadatot generáljon egy kisebb, célzottabb modell számára.
:::::
::::::

:::::: section id=model-training-6 num="06" heading="6. rész — Kitekintés: hogyan tanul egy diffúziós modell" nav="Kitekintés: diffúziós tanítás" group="Léptékek"

<p class="topic-tagline">Cél: lásd, hogy a 0. részben megismert hurok a diffúziós modellekben is pontosan ugyanígy működik — csak más a jóslási cél.</p>

### Ugyanaz a hurok, más "amit jóslunk"

A <em>Diffúziós modellek</em> tutorialban megismert forward/reverse folyamat mögött **pontosan ugyanaz** a tanítási mechanizmus áll, mint az 1–3. részben egy LLM-nél: jóslás → hiba mérése → korrekció. A különbség csak annyi, hogy **mit** jósol a modell.

::::: compare
::: good label="LLM: a következő szót jósolja"
A modell bemenete egy szöveg eleje, a kimenete a legvalószínűbb következő token — a loss azt méri, mennyire tévedett a szó-jóslás.
:::
::: bad label="Diffúziós modell: a hozzáadott zajt jósolja"
A modell bemenete egy **zajjal elrontott** kép (és az, hogy a zajosítás hányadik lépésénél tartunk), a kimenete pedig egy jóslat arról, **pontosan milyen zajt** adtak hozzá az eredeti, tiszta képhez — a loss azt méri, mennyire pontos ez a zaj-jóslás.
:::
:::::

::::: callout label="Miért működik ez generálásra"
Ha a modell megbízhatóan meg tudja jósolni, "mi volt a zaj", akkor ezt a jóslatot **ki is tudja vonni** a zajos képből — és ha ezt sok apró lépésben, ismételten megteszi egy vadonatúj, véletlen zajból indulva, fokozatosan egy koherens, új kép bontakozik ki. Ez a <em>Diffúziós modellek</em> tutorial 1. részében látott reverse folyamat — most már azt is látod, **honnan tudja** a modell, hogyan kell zajt eltávolítania: pontosan ugyanaz a jósolj-mérd-korrigálj hurok tanította meg neki, milliárdnyi zajosított képen keresztül.
:::::

::::: callout label="Egy mondatban"
Egy diffúziós modell tanítása nem egy "másik fajta gépezet" — ugyanaz a gradiens-alapú tanítási hurok, csak a jóslási feladat más (zaj, nem a következő szó), ez a közös alap köti össze a teljes cikket a <em>Diffúziós modellek</em> tutoriallal.
:::::
::::::

:::::: section id=model-training-7 num="07" heading="7. rész — Hova illeszkedik ez a nagy képbe" nav="Hova illeszkedik ez a nagy képbe" group="Referencia"

<p class="topic-tagline">Cél: zárd le a cikket azzal, ahol elkezdődik a következő fázis — a Base vs. Instruct tutorial.</p>

### A pretraining csak az első állomás

::::: callout label="A teljes lánc, amit ez a cikk megalapoz"
Amit ez a cikk leírt — a nyers, "csak folytatja a szöveget" súlyhalmaz kialakulása — az pontosan az, amit a <em>Base vs. Instruct modell</em> tutorial **base modellnek** nevez. Utána jön az **instruction tuning** (ugyanaz a jósolj-mérd-korrigálj hurok, de már beszélgetés-párokon), majd az **RLHF** (emberi preferencia szerinti finomhangolás) — mindkettő technikailag **ugyanazt** a mechanizmust használja, amit ebben a cikkben megismertél, csak más tanítóadaton és más céllal.
:::::

::::: callout label="Egy mondatban"
Nincs négy különböző "tanítási technológia" (pretraining, instruction tuning, RLHF, diffúzió) — van **egyetlen, közös gradiens-alapú tanulási mechanizmus**, amit különböző adaton, különböző jóslási céllal alkalmaznak újra és újra, a nyers szövegjóslótól a segítőkész asszisztensig és a képgenerátorig.
:::::
::::::

:::::: section id=model-training-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0–1. rész"
A "jósolj → mérd a hibát → korrigálj" hurok mint az EGYETLEN alapmechanizmus · hogyan alakul ki a vektortér a véletlenszerű súlyokból, tisztán ennek a huroknak a mellékterméke
::::
:::: card label="2–3. rész"
Konkrét adat- és költségnagyságrendek (1,72M GPU-óra, 158 000$ áramköltség) · egyetlen tanítási lépés négy mozzanata (forward, loss, backward, frissítés)
::::
:::: card label="4–5. rész"
Kis vs. nagy modell tanítása mint eltérő tervezési filozófia (mennyiség vs. minőség) · distillation és szintetikus adat, konkrét Phi-3 és klinikai példákkal
::::
:::: card label="6–7. rész"
Kitekintés: a diffúziós modell tanítása ugyanaz a hurok, csak "zajt jósol" · hova illeszkedik mindez a Base vs. Instruct és RLHF pipeline-jába
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>Base vs. Instruct modell</em> (mi történik a pretraining UTÁN), a <em>Modellméret és tudás</em> (a Chinchilla-skálázás részletei), a <em>Diffúziós modellek</em> (a generálási folyamat maga) és a <em>Fine-tuning technikák</em> (hogyan specializálj egy már betanított modellt anélkül, hogy újra végigcsinálnád ezt az egészet) tutorialok.</p>

<p class="topic-tagline" style="margin-top:12px;font-size:0.85em;opacity:0.75">* A Llama2-70B GPU-óra adat egy 2024-es kutatásból származik (400W-os A100 GPU-kkal mérve) — lásd a 2. részt a kontextusért.</p>
::::::
