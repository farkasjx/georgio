---
page: architecture
title: Egy modell anatómiája — rétegről rétegre
sidebar_groups:
  - Elmélet
  - A rétegek
  - Léptékek
  - Referencia
hero:
  eyebrow: "Architektúra · Fejlesztői Tanulási Terv"
  title: "Egy modell anatómiája — <em>rétegről rétegre</em>"
  lead: "A Reasoning tutorial már megmutatta, mit csinál az attention — de honnan tudja a modell, hol kezdődik és végződik ez a mechanizmus a teljes gépezetben? Ez a cikk egy térkép: bemenettől kimenetig, réteget réteg után, mi történik egy szöveggel, mire válasz lesz belőle. Fogalmi szinten, matek nélkül — a mélyebb részletekért (attention, tanítás, MoE) a kapcsolódó tutorialok visznek tovább."
  stats:
    - { val: "32", lbl: "réteg (Llama 3.1 8B)*" }
    - { val: "126", lbl: "réteg (Llama 3 405B)*" }
    - { val: "6", lbl: "Szakasz" }
    - { val: "1", lbl: "Ismétlődő alap-blokk" }
footer:
  left: "AI Hub · Architektúra"
  right: "Architektúra · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#architecture-0"><div class="tc-num">0. rész</div><div class="tc-name">A teljes útvonal madártávlatból</div><div class="tc-desc">Bemenet, gerinc, kimenet — a három nagy szakasz.</div></a>
  <a class="toc-card" href="#architecture-1"><div class="tc-num">1. rész</div><div class="tc-name">A bemenet: embedding és pozíció</div><div class="tc-desc">Hogyan lesz egy szóból szám, és honnan tudja a sorrendet.</div></a>
  <a class="toc-card" href="#architecture-2"><div class="tc-num">2. rész</div><div class="tc-name">Az ismétlődő blokk belülről</div><div class="tc-desc">Attention + feed-forward — a téglák, amikből minden épül.</div></a>
  <a class="toc-card" href="#architecture-3"><div class="tc-num">3. rész</div><div class="tc-name">Miért nem omlik össze 100 réteg mélyen</div><div class="tc-desc">Residual connection és normalizáció — a "ragasztó".</div></a>
  <a class="toc-card" href="#architecture-4"><div class="tc-num">4. rész</div><div class="tc-name">A kimenet: az utolsó lépés</div><div class="tc-desc">Hogyan lesz egy vektorból egy konkrét, kiválasztott szó.</div></a>
  <a class="toc-card" href="#architecture-5"><div class="tc-num">5. rész</div><div class="tc-name">Konkrét modellek, konkrét számok</div><div class="tc-desc">Mennyi réteg, mekkora modell — valós példákkal.</div></a>
</div>
::::::

:::::: section id=architecture-0 num="00" heading="0. rész — A teljes útvonal madártávlatból" nav="A teljes útvonal madártávlatból" group="Elmélet"

<p class="topic-tagline">Cél: lásd a nagy képet, mielőtt a részletekbe mennénk — ez a térkép, amit a további részek kitöltenek.</p>

### Három nagy szakasz

Amikor beírsz egy mondatot egy LLM-nek, a szöveg egy hosszú, de **egyszerűen három szakaszra bontható** úton halad végig, mire válasz lesz belőle:

::::: stack-grid
:::: card label="1 · Bemenet"
A szöveg **tokenekre** bomlik (lásd a <em>Tokenizáció</em> tutorialt), majd ezek a tokenek **számokká** (vektorokká) alakulnak — ez az **embedding réteg**.
::::
:::: card label="2 · A gerinc"
A vektorok végigmennek egy **hosszú, ismétlődő rétegsoron** — ez a modell "dereka", ahol a tényleges "megértés" és "feldolgozás" történik.
::::
:::: card label="3 · Kimenet"
Az utolsó réteg kimenete egy **valószínűségi eloszlássá** alakul az összes lehetséges következő token fölött — ebből választja ki a modell a végleges szót.
::::
:::::

::::: callout label="A modern LLM-ek közös vonása: decoder-only"
A 2017-es eredeti transformer még két részből állt (encoder + decoder, fordításra tervezve) — a mai LLM-ek (GPT, Llama, Claude alapjai) szinte kivétel nélkül **csak a decoder felét** használják, egyetlen, hosszú rétegsorként. Ez a cikk erre a — ma domináns — felépítésre fókuszál.
:::::

::::: callout label="Egy mondatban"
Egy LLM nem "egy fekete doboz" — egy pontosan meghatározott, réteges felépítésű gépezet, aminek minden lépése megnevezhető és megérthető, még ha a bennük futó pontos számítás bonyolult is.
:::::
::::::

:::::: section id=architecture-1 num="01" heading="1. rész — A bemenet: embedding és pozíció" nav="A bemenet: embedding és pozíció" group="A rétegek"

<p class="topic-tagline">Cél: értsd meg az első két lépést, mielőtt a gerinc rétegeibe mennénk.</p>

### Az embedding réteg: szóból szám

Miután a szöveg tokenekre bomlott (lásd a <em>Tokenizáció</em> tutorialt), minden egyes tokenhez a modell egy **tanult vektort** rendel — ezt hívjuk **embeddingnek**. Ez egy egyszerű "keresőtábla": minden lehetséges token (a szótár egy eleme) egy fix, több ezer dimenziós vektorhoz van hozzárendelve, amit a <em>Hogyan tanul egy modell</em> tutorialban leírt tanítási hurok alakított ki.

### A pozicionális kódolás: honnan tudja a sorrendet

::::: callout warning label="Egy meglepő technikai részlet"
A transformer-architektúra **önmagában** nem érzékeli a szavak sorrendjét — ha csak az embeddingeket adnád át neki, a "a kutya megharapta az embert" és "az embert megharapta a kutya" ugyanúgy nézne ki számára (ugyanazok a szavak, csak "halomba öntve"). Ezért minden embeddinghez **hozzáadnak** egy második vektort, ami kódolja, **hányadik pozícióban** áll a token a mondatban — ezt hívják **pozicionális kódolásnak**.
:::::

::::: callout label="Egy mondatban"
Mire a szöveg eléri a gerinc első rétegét, már nem "szöveg" — egy számsorozat, ami egyszerre kódolja **mit jelent** az adott token, és **hol áll** a mondatban.
:::::
::::::

:::::: section id=architecture-2 num="02" heading="2. rész — Az ismétlődő blokk belülről: a tégla, amiből minden épül" nav="Az ismétlődő blokk belülről" group="A rétegek"

<p class="topic-tagline">Cél: értsd meg az EGY blokkot, ami — sokszorozva — a teljes gerincet adja.</p>

### Egyetlen blokk, sokszor egymás után

A modell "gerince" nem más, mint **ugyanannak az egy blokk-típusnak** a sok, egymás utáni ismétlése (tipikusan 30-100+ alkalommal, lásd az 5. részt). Minden blokk két fő résztből áll:

::::: stack-grid
:::: card label="1 · Attention réteg"
A <em>Reasoning</em> tutorial 1. részében részletesen tárgyalt mechanizmus: minden token "körülnéz" a többi tokenen, és eldönti, melyikek relevánsak hozzá képest. Ez adja a **kontextus-érzékenységet**.
::::
:::: card label="2 · Feed-forward réteg"
Az attention kimenetét egy **egyszerűbb**, de szélesebb neurális háló dolgozza fel — ez nem a tokenek **közti** kapcsolatokat nézi, hanem **minden egyes tokent önmagában** gazdagít tovább, új mintázatokat keresve benne.
::::
:::::

::::: callout label="Egy konkrét arány, ami érzékelteti a méreteket"
A feed-forward réteg **rejtett dimenziója** tipikusan **4-szer akkora**, mint a modell alap-dimenziója — a GPT-3-nál például a 12 288-as alapdimenzióhoz **49 152**-es feed-forward dimenzió tartozik. A legtöbb modell **paramétereinek nagyobb hányada** ebben a feed-forward rétegben található, nem az attention-ben.
:::::

### Miért pont ez a kettő, ismételve

::::: callout label="Egy mondatban"
Az attention réteg összeköti a tokeneket egymással ("mi releváns mihez képest"), a feed-forward réteg pedig **elmélyíti** az egyes tokenek saját reprezentációját — ez a két lépés, sokszor egymás után ismételve, adja azt a fokozatosan gazdagodó megértést, amiről a <em>Reasoning</em> tutorial is beszél.
:::::
::::::

:::::: section id=architecture-3 num="03" heading="3. rész — Miért nem omlik össze 100 réteg mélyen: a \"ragasztó\"" nav="Miért nem omlik össze 100 réteg mélyen" group="A rétegek"

<p class="topic-tagline">Cél: értsd meg a két, kevéssé látványos, de nélkülözhetetlen mechanizmust.</p>

### A probléma, amit meg kell oldani

Ha egyszerűen csak **egymás után** raknál 32, 96 vagy 126 réteget (lásd az 5. részt), a számok gyakorlatilag garantáltan "elszabadulnának" — vagy eltűnnének, vagy a végtelenbe nőnének, mire végigmennek ennyi rétegen. Két mechanizmus tartja ezt kordában:

::::: compare
::: good label="Residual connection (\"maradék-kapcsolat\")"
Minden réteg kimenetéhez **hozzáadják** a réteg **bemenetét** is — így a modellnek elég csak a *változást* megtanulnia egy rétegben, nem kell "újra megalkotnia" az egész reprezentációt minden lépésben.
:::
::: bad label="Layer normalization (rétegnormalizálás)"
Minden réteg után egy normalizáló lépés **visszahúzza** a számokat egy stabil tartományba — ez akadályozza meg, hogy 100+ réteg után a számok kontrollálhatatlanul nagyra vagy kicsire nőjenek.
:::
:::::

::::: callout label="Egy mondatban"
A residual connection és a normalizáció nem "extra funkció" — ezek nélkül a mély, sok-réteges modellek egyszerűen **nem lennének taníthatók**; ez a két, csendes mechanizmus teszi lehetővé, hogy egyáltalán legyen értelme 100+ réteget egymásra pakolni.
:::::
::::::

:::::: section id=architecture-4 num="04" heading="4. rész — A kimenet: hogyan lesz egy vektorból egy kiválasztott szó" nav="A kimenet: az utolsó lépés" group="A rétegek"

<p class="topic-tagline">Cél: zárd le az utat — a gerinc után mi történik, mielőtt a válasz megjelenik a képernyőn.</p>

### Az utolsó lépés: vetítés a szótárra

Az utolsó blokk kimenete még mindig egy **absztrakt vektor** — ahhoz, hogy ebből tényleges token legyen, egy utolsó réteg (**LM head**) ezt a vektort **visszavetíti** a teljes szótár méretére (ez lehet 50 000-től 200 000+ tokenig, lásd a <em>Tokenizáció</em> tutorialt).

::::: callout label="A valószínűségi eloszlás"
Az eredmény minden egyes lehetséges következő tokenre egy **valószínűségi pontszám** — ebből a listából választ végül a modell egyet, a <em>Véletlenszerűség és mintavételezés</em> tutorialban tárgyalt mechanizmus (temperature, top-p) szerint.
:::::

::::: callout label="Egy mondatban"
A "gerinc" feladata, hogy egy gazdag, kontextusban értelmezett reprezentációt építsen fel; az utolsó lépés dolga csupán ennek **lefordítása** egy konkrét, kiválasztható token-listára — a tényleges "döntés", hogy melyik szó legyen a válasz, már egy külön mechanizmusban történik.
:::::
::::::

:::::: section id=architecture-5 num="05" heading="5. rész — Konkrét modellek, konkrét számok" nav="Konkrét modellek, konkrét számok" group="Léptékek"

<p class="topic-tagline">Cél: tedd kézzelfoghatóvá az eddig elvontan tárgyalt fogalmakat valós modellek adataival.</p>

### Réteg-számok a gyakorlatban

| Modell | Rétegek száma | Modell-dimenzió |
|---|---|---|
| GPT-2 (nagy) | 48 | 1600 |
| GPT-3 (175B) | 96 | 12 288 |
| Llama 3.1 (8B) | 32 | 4096 |
| Llama 3 (405B) | 126 | 16 384 |

::::: callout label="Amit ez a táblázat elárul"
A <em>Modellméret és tudás</em> tutorialban tárgyalt "paraméterszám" gyakorlatilag ebből a két számból (rétegek száma × dimenzió mérete, plusz a feed-forward rétegek) áll össze — minél mélyebb (több réteg) és minél szélesebb (nagyobb dimenzió) egy modell, annál több paramétere van.
:::::

::::: callout warning label="Nem csak \"minél több, annál jobb\""
A rétegek számának növelése **mélyebb, absztraktabb** mintázatok felismerését teszi lehetővé, de a <em>Modellméret és tudás</em> tutorialban tárgyalt Chinchilla-skálázás szerint ez önmagában nem elég — a rétegszám és a tanítási adat mennyiségének **együtt** kell nőnie ahhoz, hogy a plusz mélység ténylegesen kihasználható legyen.
:::::

::::: callout label="Egy mondatban"
Amikor legközelebb egy modellnév mellett látod, hogy "8B" vagy "405B", most már tudod, mi áll e mögött: nem egy homályos "méret", hanem konkrétan **ennyi réteg, ekkora dimenzióval, milliárdnyi tanult számmal** feltöltve.
:::::
::::::

:::::: section id=architecture-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0. rész"
A teljes út három nagy szakasza: bemenet (embedding) → gerinc (ismétlődő blokkok) → kimenet (szótárra vetítés)
::::
:::: card label="1–2. rész"
Az embedding réteg és a pozicionális kódolás · az ismétlődő blokk két fő része: attention (kontextus) és feed-forward (mélyítés)
::::
:::: card label="3–4. rész"
A residual connection és a normalizáció mint "ragasztó", ami lehetővé teszi a 100+ réteg mélységet · hogyan lesz az utolsó vektorból konkrét, kiválasztható token
::::
:::: card label="5. rész"
Konkrét réteg- és dimenziószámok valós modelleknél (GPT-3: 96 réteg, Llama 3 405B: 126 réteg) — és a kapcsolat a Modellméret tutorialhoz
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>Tokenizáció</em> (mi történik, mielőtt a szöveg elérné az embedding réteget), a <em>Reasoning</em> (az attention mélyebb tárgyalása), a <em>Hogyan tanul egy modell</em> (honnan erednek a rétegek súlyai) és a <em>Dense vs. MoE</em> (a feed-forward réteg egyik alternatív felépítése) tutorialok.</p>

<p class="topic-tagline" style="margin-top:12px;font-size:0.85em;opacity:0.75">* A rétegszámok a modellek nyilvánosan dokumentált architektúra-specifikációiból származnak — lásd az 5. részt a kontextusért.</p>
::::::
