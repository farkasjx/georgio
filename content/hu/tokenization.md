---
page: tokenization
title: Tokenizáció — hogyan vágja szét a modell a szöveget
sidebar_groups:
  - Elmélet
  - A mechanizmus
  - Nyelvi egyenlőtlenség
  - Referencia
hero:
  eyebrow: "Tokenizáció · Fejlesztői Tanulási Terv"
  title: "Tokenizáció — <em>hogyan vágja szét a modell a szöveget</em>"
  lead: "Minden korábbi tutorial használta már a \"token\" szót — ez a cikk azt nézi meg, mi az valójában. Nem karakter, nem szó: valami a kettő között, aminek a pontos alakja meghatározza a modell árát, a kontextusablak méretét, és azt is, hogy a magyar nyelv miért kerül gyakran többe, mint az angol. Épít az <em>Egy modell anatómiája</em> tutorialra — ez az, ami a bemenet ELSŐ lépését adja."
  stats:
    - { val: "50–200K", lbl: "szótárméret*" }
    - { val: "2–15×", lbl: "\"nyelvi adó\" nem angol nyelvre*" }
    - { val: "6", lbl: "Szakasz" }
    - { val: "1994", lbl: "az algoritmus eredete" }
footer:
  left: "AI Hub · Tokenizáció"
  right: "Tokenizáció · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#tokenization-0"><div class="tc-num">0. rész</div><div class="tc-name">Mi az a token valójában</div><div class="tc-desc">Sem karakter, sem szó — valami a kettő között.</div></a>
  <a class="toc-card" href="#tokenization-1"><div class="tc-num">1. rész</div><div class="tc-name">A BPE-algoritmus lépésről lépésre</div><div class="tc-desc">Hogyan tanulja meg a modell, mit érdemes egyben kezelni.</div></a>
  <a class="toc-card" href="#tokenization-2"><div class="tc-num">2. rész</div><div class="tc-name">A szótár mérete: kompromisszum</div><div class="tc-desc">Miért nem "minél nagyobb, annál jobb".</div></a>
  <a class="toc-card" href="#tokenization-3"><div class="tc-num">3. rész</div><div class="tc-name">A magyar nyelv hátránya</div><div class="tc-desc">Konkrét, mért adatok a "nyelvi adóról".</div></a>
  <a class="toc-card" href="#tokenization-4"><div class="tc-num">4. rész</div><div class="tc-name">Amikor a tokenizáció félrevezet</div><div class="tc-desc">Miért ront el a modell egyszerű betűzős feladatokat.</div></a>
  <a class="toc-card" href="#tokenization-5"><div class="tc-num">5. rész</div><div class="tc-name">Gyakorlati következmények</div><div class="tc-desc">Mit tehetsz, ha ez a te munkádra is hatással van.</div></a>
</div>
::::::

:::::: section id=tokenization-0 num="00" heading="0. rész — Mi az a token valójában" nav="Mi az a token valójában" group="Elmélet"

<p class="topic-tagline">Cél: tisztázd a legalapvetőbb félreértést — a token nem szó, és nem is karakter.</p>

### Sem az egyik, sem a másik

Amikor beírsz egy mondatot egy LLM-nek, az — mielőtt bármi mást csinálna — **tokenekre** vágja szét (ez az <em>Egy modell anatómiája</em> tutorial 1. részében látott embedding réteg előfutára). A token egy **szó-részlet**: néha egy egész szó, néha csak egy szótöredék, néha egyetlen írásjel.

::::: compare
::: bad label="Amit sokan feltételeznek"
"Egy token egy szó" — ez lenne a legegyszerűbb feltételezés, de a valóságban a legtöbb tokenizáló **nem így** vágja szét a szöveget.
:::
::: good label="Ami ténylegesen történik"
A gyakori szavak (pl. "a", "és", "ház") általában **egyetlen tokenként** maradnak — de a ritkább, hosszabb vagy összetett szavak **több darabra** esnek szét (pl. a "tokenizáció" szót a modell könnyen két részre bonthatja: "token" + "izáció").
:::
:::::

::::: callout label="Egy mondatban"
A token egy **tanult, statisztikai kompromisszum** a karakter (túl apró, túl sok lenne belőle) és a szó (túl sok különböző szó van egy nyelvben ahhoz, hogy mindegyiknek külön helyet adjunk) között — ezt a kompromisszumot konkrétan a következő részben látott **BPE-algoritmus** hozza létre.
:::::
::::::

:::::: section id=tokenization-1 num="01" heading="1. rész — A BPE-algoritmus lépésről lépésre" nav="A BPE-algoritmus lépésről lépésre" group="A mechanizmus"

<p class="topic-tagline">Cél: kövesd végig egy egyszerű példán, hogyan "tanulja meg" a tokenizáló, mit érdemes egyben kezelni.</p>

### Az alapötlet: gyakori párokat összevonni

A ma szinte minden nagy modell (GPT, Claude, Llama, Mistral) mögött álló algoritmus a **BPE** (Byte Pair Encoding) — egy 1994-ben, eredetileg tömörítésre kitalált módszer, amit 2016-ban adaptáltak nyelvi modellekhez.

::::: stack-grid
:::: card label="1 · Indulás karakterekről"
A tokenizáló tanítása az **egyes karakterekkel** kezdődik — ez a kezdeti, legapróbb egység.
::::
:::: card label="2 · A leggyakoribb pár összevonása"
Végigmegy egy hatalmas szövegkorpuszon, és megszámolja, mely **szomszédos karakterpárok** fordulnak elő leggyakrabban — a leggyakoribbat **összevonja** egyetlen új tokenné.
::::
:::: card label="3 · Ismétlés, amíg el nem éri a célméretet"
Ezt a "keresd meg a leggyakoribb szomszédos párt, vond össze" lépést **újra és újra** megismétli — egyre hosszabb egységeket hozva létre —, amíg a szótár el nem éri a kívánt méretet (lásd a 2. részt).
::::
:::::

### Egy egyszerű, végigkövetett példa

::::: callout label="A \"happy\" szó tokenizálása"
Kezdés: `h-a-p-p-y` (öt különálló karakter). Az algoritmus észreveszi, hogy a `p-p` pár nagyon gyakori a korpuszban, és összevonja: `h-a-pp-y`. Ha a `pp-y` vagy `a-pp` pár is elég gyakori, további összevonások történhetnek, amíg végül — elég nagy korpusz esetén — a teljes `happy` egyetlen tokenné állhat össze.
:::::

::::: callout warning label="Miért bájtokból indulnak a modern tokenizálók"
A GPT-2 és sok újabb modell nem Unicode-karakterekből, hanem **nyers bájtokból** indul — ez egy technikai trükk, ami biztosítja, hogy **bármilyen** karaktert (bármilyen nyelv, emoji, ritka szimbólum) kezelni tudjon anélkül, hogy "ismeretlen token" hibába futna.
:::::

::::: callout label="Egy mondatban"
A BPE nem valakinek a kézzel megírt szabályrendszere — egy **korpuszból tanult**, mohó, gyakoriság-alapú összevonási folyamat, aminek a végeredménye (a "szótár" és az összevonási szabályok) rögzül, és utána minden új szöveget ugyanezekkel a szabályokkal, mindig ugyanúgy (determinisztikusan) vág szét.
:::::
::::::

:::::: section id=tokenization-2 num="02" heading="2. rész — A szótár mérete: egy kompromisszum" nav="A szótár mérete: kompromisszum" group="A mechanizmus"

<p class="topic-tagline">Cél: értsd meg, miért nem "minél nagyobb szótár, annál jobb" az egyszerű válasz.</p>

### A két irányba húzó erő

::::: compare
::: good label="Nagyobb szótár"
**Kevesebb token** kell ugyanahhoz a szöveghez — ez olcsóbb (kevesebb token = kevesebb API-költség) és jobban kihasználja a kontextusablakot (lásd a <em>Knowledge cutoff</em> és <em>Agentic kódolás</em> tutorialokat a kontextusablak-korlátokról).
:::
::: bad label="Kisebb szótár"
**Kisebb embedding-mátrix** és kimeneti réteg (lásd az <em>Egy modell anatómiája</em> tutorial 4. részét) — kisebb modellméret, gyorsabb számítás minden egyes token generálásakor.
:::
:::::

### A trend: egyre nagyobb szótárak

::::: callout label="Konkrét számok, generációról generációra"
A szótárméret a modellgenerációkkal folyamatosan nőtt: **~30 000** (BERT) → **~50 000** (GPT-2) → **~100 000** (GPT-4 korai tokenizálója) → **~128 000** (Llama 3) → **~200 000** (GPT-4o tokenizálója). Minden ugrást elsősorban a **többnyelvűség** iránti igény hajtott — minél több nyelvet kell jól lefedni, annál nagyobb szótár kell, hogy a nem angol nyelvek se essenek szét túl apró darabokra (lásd a 3. részt).
:::::

::::: callout label="Egy mondatban"
A szótárméret választása egy állandó kompromisszum a **token-hatékonyság** (kevesebb, olcsóbb token) és a **modell mérete/sebessége** (kisebb, gyorsabb embedding-réteg) között — nincs egyetlen "helyes" válasz, csak tervezési döntés.
:::::
::::::

:::::: section id=tokenization-3 num="03" heading="3. rész — A magyar nyelv hátránya: a \"nyelvi adó\"" nav="A magyar nyelv hátránya" group="Nyelvi egyenlőtlenség"

<p class="topic-tagline">Cél: érts meg egy konkrét, kutatással alátámasztott egyenlőtlenséget, ami közvetlenül érinti a magyar nyelvű használatot.</p>

### Miért éppen a magyar (és a hozzá hasonló nyelvek) járnak rosszabbul

A BPE-algoritmus (lásd az 1. részt) tanítóadata történelmileg **túlnyomórészt angol** szöveg volt — így a leggyakoribb angol szó-részletek kaptak saját tokent, míg a **toldalékoló** (agglutináló) nyelvek, mint a magyar, finn vagy török, ahol egyetlen szótő rengeteg különböző végződést kaphat, **rosszabbul illeszkednek** ebbe a mintázatba.

::::: callout danger label="Konkrét, mért adatok"
Kutatások szerint az angol szöveg tipikusan **~1,2 token/szó** aránnyal kódolódik, míg a magyarhoz hasonló, morfológiailag gazdag európai nyelvek elérhetik a **~3,1-szeres** szorzót ugyanahhoz a tartalomhoz. Tágabb, globális összehasonlításban a "nyelvi adó" bizonyos nyelvpárok közt akár **2–15-szörös** különbséget is mutathat.
:::::

### Miért nem csak kényelmetlenség ez, hanem tényleges költség

::::: callout warning label="A gyakorlati következmény"
Mivel az API-szolgáltatók **tokenenként** számláznak, és a kontextusablak mérete is **tokenben** van megadva (nem karakterben vagy szóban), a magyar nyelvű felhasználó **ugyanazért a tartalomért többet fizet**, és **kevesebb** szöveg fér bele ugyanabba a kontextusablakba, mint egy angol nyelvű felhasználónak. Ez nem szándékos diszkrimináció — a tokenizáló tanítóadatának történelmi angol-túlsúlyából ered —, de a hatása valós és mérhető.
:::::

::::: callout label="A jó hír: ez javul"
Az újabb, kifejezetten többnyelvűségre optimalizált modellek (nagyobb szótárral, tudatosan kiegyensúlyozott tanítóadattal) fokozatosan **csökkentik** ezt a szakadékot — de teljesen nem tüntetik el. Ha a magyar nyelvű tartalom fontos neked, érdemes tudni, hogy ez a különbség **modellenként eltérő**, és egy modellváltás önmagában is számottevő token-megtakarítást hozhat.
:::::

::::: callout label="Egy mondatban"
Ha azt tapasztalod, hogy a magyar nyelvű promptod "gyorsabban fogy el" a kontextusablakból, vagy hogy egy azonos hosszúságú angol és magyar szöveg eltérő API-költséget generál, ez nem a képzeleted — ez egy dokumentált, mérhető jelenség, aminek gyökere a tokenizáló tanítóadatában van.
:::::
::::::

:::::: section id=tokenization-4 num="04" heading="4. rész — Amikor a tokenizáció félrevezet: a betűzős feladatok csapdája" nav="Amikor a tokenizáció félrevezet" group="Nyelvi egyenlőtlenség"

<p class="topic-tagline">Cél: érts meg egy konkrét, gyakran tapasztalt "hibát", ami valójában a tokenizáció következménye.</p>

### Egy híres, meglepő jelenség

Ha megkérdezel egy modellt, hány "r" betű van a "strawberry" szóban, egyes modellek meglepően gyakran **rosszul** válaszolnak — nem azért, mert "hülyék", hanem mert **nem is betűnként látják** a szót.

::::: callout label="Miért történik ez"
A modell a "strawberry" szót valószínűleg **nem öt vagy hat különálló karakterként**, hanem egy-két, nagyobb **tokenként** kapja meg (lásd az 1. részt) — a token belső karakter-összetétele nincs neki közvetlenül "megmutatva", csak a token **azonossága**. Ez olyan, mintha te egy szót csak mint egészet ismernél fel, anélkül hogy tudatosan megszámolnád benne a betűket.
:::::

::::: callout warning label="Ez nem intelligencia-hiány, hanem architekturális korlát"
Ez a jelenség jól mutatja, hogy a modell "látásmódja" **alapvetően más**, mint egy emberé — olyan feladatokban, ahol a **karakter-szintű** pontosság számít (betűszámlálás, anagramma, bizonyos kódolási feladatok), a tokenizáció maga okoz nehézséget, függetlenül attól, mennyire "okos" egyébként a modell.
:::::

::::: callout label="Egy mondatban"
Ha egy modell megbízhatatlannak tűnik karakter-szintű feladatokban, érdemes megkérdezni: vajon **látja-e egyáltalán** karakterenként azt, amit számolnia kellene — gyakran ez a valódi ok, nem az általános képesség hiánya.
:::::
::::::

:::::: section id=tokenization-5 num="05" heading="5. rész — Gyakorlati következmények: mit tehetsz ezzel" nav="Gyakorlati következmények" group="Referencia"

<p class="topic-tagline">Cél: adj konkrét, alkalmazható tanulságokat, ne csak elméletet.</p>

::::: stack-grid
:::: card label="Ha a kontextusablak-korlát szorít"
Tudd, hogy a magyar szöveg **több tokent** fogyaszt, mint az azonos hosszúságú angol — ha egy nagy dokumentumot dolgozol fel, ez a kontextusablak-korlátba (lásd a <em>Knowledge cutoff</em> tutorialt) hamarabb belefuthat, mint várnád.
::::
:::: card label="Ha az API-költség számít"
Egy modellváltás vagy a bemenet angolra fordítása (ahol ez elfogadható) **valós, mérhető** megtakarítást hozhat — nem csak stilisztikai kérdés, hanem tokenszámban kifejezhető, konkrét összeg.
::::
:::: card label="Ha karakter-szintű pontosság kell"
Ne bízz vakon a modellben betűzős, karakter-számláló feladatoknál — ha kritikus a pontosság, kérd meg a modellt, hogy **explicit írja ki** a szót szóközökkel elválasztott karakterekre bontva, mielőtt számolna, vagy validáld kód futtatásával.
::::
:::::

::::: callout label="Egy mondatban"
A tokenizáció nem egy láthatatlan, technikai apróság — közvetlenül alakítja a költséget, a kontextusablak effektív méretét és bizonyos feladattípusok megbízhatóságát, ezért érdemes tudni, hogy létezik, még ha a mindennapi promptolás során nem is gondolsz rá.
:::::
::::::

:::::: section id=tokenization-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0–1. rész"
A token sem karakter, sem szó — egy tanult kompromisszum · a BPE-algoritmus mohó, gyakoriság-alapú összevonási mechanizmusa lépésről lépésre
::::
:::: card label="2. rész"
A szótárméret kompromisszuma (token-hatékonyság vs. modellméret) és a generációról generációra növekvő trend (30K → 200K)
::::
:::: card label="3. rész"
A magyar és hasonló nyelvek dokumentált "nyelvi adója" — konkrét szorzókkal (1,2 vs. 3,1 token/szó) és a valós költség-/kontextusablak-következményekkel
::::
:::: card label="4–5. rész"
Miért hibáznak a modellek betűzős feladatokban (tokenizáció, nem intelligencia-hiány) · gyakorlati tanulságok kontextusablakra, költségre és karakter-szintű feladatokra
::::
:::::

<p class="topic-tagline">Kapcsolódó: az <em>Egy modell anatómiája</em> (hova illeszkedik a tokenizáció a teljes feldolgozási útban), a <em>Knowledge cutoff</em> (a kontextusablak-korlát részletei) és a <em>Hogyan tanul egy modell</em> (hogyan alakul ki az embedding a tokenekből) tutorialok.</p>

<p class="topic-tagline" style="margin-top:12px;font-size:0.85em;opacity:0.75">* A szótárméret-adatok és a nyelvi adó szorzói (1,2× vs. 3,1×, illetve a 2–15×-ös globális tartomány) 2023–2026-os kutatásokból származnak — lásd a 3. részt a kontextusért.</p>
::::::
