---
page: knowledge-cutoff
title: Knowledge cutoff és modell-frissítés
sidebar_groups:
  - Elmélet
  - Működés
  - Gyakorlat
  - Referencia
hero:
  eyebrow: "Knowledge Cutoff · Fejlesztői Tanulási Terv"
  title: "Knowledge cutoff és <em>modell-frissítés</em>"
  lead: "A frontier modellek nem kapnak élő frissítést — a súlyok a kiadás után is fixek maradnak. Miért van rés a tanítás és a megjelenés között, miért nem \"csak frissítik menet közben\", és hogyan jut a modell mégis friss infóhoz. Épít a <em>RAG</em>, az <em>MCP</em> és a <em>hallucináció</em> tutorialokra."
  stats:
    - { val: "7", lbl: "Szakasz" }
    - { val: "1", lbl: "Feladat" }
    - { val: "6-18", lbl: "Hónap a cutoff-résre" }
    - { val: "1%", lbl: "RAG ára a folyt. tanításhoz képest" }
footer:
  left: "AI Hub · Knowledge cutoff és modell-frissítés"
  right: "Knowledge Cutoff · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#kc-0"><div class="tc-num">0. rész</div><div class="tc-name">Tanítás vs. inferencia</div><div class="tc-desc">A súlyok befagyasztása — mit jelent ez.</div></a>
  <a class="toc-card" href="#kc-1"><div class="tc-num">1. rész</div><div class="tc-name">A cutoff mechanikája</div><div class="tc-desc">Miért van rés a tanítás és a kiadás közt.</div></a>
  <a class="toc-card" href="#kc-2"><div class="tc-num">2. rész</div><div class="tc-name">Miért nem "csak frissítik"?</div><div class="tc-desc">Catastrophic forgetting és a folytatólagos tanítás ára.</div></a>
  <a class="toc-card" href="#kc-3"><div class="tc-num">3. rész</div><div class="tc-name">Hogyan jut friss infóhoz</div><div class="tc-desc">Tool-use, web-search, RAG — ugyanaz az elv.</div></a>
  <a class="toc-card" href="#kc-4"><div class="tc-num">Feladat</div><div class="tc-name">Teszteld magad</div><div class="tc-desc">Kereséssel vs. anélkül.</div></a>
  <a class="toc-card" href="#kc-5"><div class="tc-num">4. rész</div><div class="tc-name">Termék vs. modell szint</div><div class="tc-desc">Mi frissülhet a súlyok érintése nélkül.</div></a>
  <a class="toc-card" href="#kc-6"><div class="tc-num">5. rész</div><div class="tc-name">Döntési keret</div><div class="tc-desc">Mikor bízz benne, mikor kérj keresést.</div></a>
</div>
::::::

:::::: section id=kc-0 heading="0. rész — Tanítás vs. inferencia: a súlyok befagyasztása" nav="0. rész" group="Elmélet"

<p class="topic-tagline">Cél: értsd meg az alapvető tényt, amire az egész téma épül — a modell, amivel beszélgetsz, nem tanul közben.</p>

### Két, teljesen különálló fázis

Egy nyelvi modell életciklusa élesen kettéválik:

::::: stack-grid
:::: card label="Tanítás (training)"
Egyszeri, hatalmas számítási folyamat, ami során a modell **súlyai** (paraméterei) fokozatosan alakulnak egy hatalmas szöveg-korpuszon. Ez **hetekig-hónapokig** tart, és **rendkívül drága** (sok millió dolláros GPU-idő).
::::
:::: card label="Inferencia (amikor beszélgetsz vele)"
Amikor kérdezel valamit, a modell a **már rögzített** súlyokkal számol — a te kérdésed **nem** módosítja őket. A modell "elolvassa" a kérdésedet, előreszámol egy választ, és a súlyok **utána is pontosan ugyanazok**, mint előtte.
::::
:::::

### Amit ez konkrétan jelent

A beszélgetésed a modellel **nem tanítja** azt — nincs olyan mechanizmus, hogy "ha most kijavítalak, azt megjegyzed a következő felhasználónak". Minden egyes beszélgetés **a rögzített súlyokból indul ki**, ugyanúgy, mint bárki másé. Amit "emlékezésnek" élsz meg egy hosszabb beszélgetésben, az a **context window** tartalma (lásd a **KV-cache tutorial**), nem a súlyok módosulása.

::::: callout label="Egy mondatban"
**A modell, amivel beszélgetsz, egy befagyasztott pillanatkép** — a tanítás lezárása utáni állapot. Nincs "élő tanulás" a beszélgetés közben, és nincs automatikus, folyamatos frissülés a háttérben.
:::::
::::::

:::::: section id=kc-1 heading="1. rész — A knowledge cutoff mechanikája" nav="1. rész" group="Elmélet"

<p class="topic-tagline">Cél: értsd, miért van rés a modell "tudása" és a tényleges kiadás dátuma között.</p>

### A pipeline, ami a rést okozza

Egy új modell-generáció nem egyik napról a másikra készül el — egy többlépéses folyamat eredménye:

1. **Pretraining** — a szöveg-korpusz **összegyűjtésének lezárása** egy adott dátumig. Ez maga a **knowledge cutoff** — minden, ami eddig a dátumig történt és bekerült az adatba, az a modell "tudása"; ami utána, arról fogalma sincs.
2. **Post-training** — finomhangolás, instruction-tuning, RLHF — a modell "viselkedésének" alakítása (hogyan válaszoljon, mit utasítson el).
3. **Biztonsági tesztelés** — red teaming, kiértékelés, iterálás — ez **hetekig-hónapokig** tart egy felelős kiadás előtt.
4. **Kiadás** — a modell nyilvánossá válik.

![A tanítási pipeline és a cutoff-rés](assets/cutoff-01-timeline.jpg)

### Miért olyan nagy a rés?

A gyakorlatban a **frontier alapmodellek cutoffja jellemzően 6-18 hónappal a nyilvános kiadás előtti** — a fenti lépések (2-4) egyszerűen időbe telnek, és amikor a tanítási adatot "lezárják", onnantól a modell nem tud semmit a világ további eseményeiről, egészen a következő tanítási ciklusig.

::::: callout warning label="Ez miért fontos gyakorlatilag?"
Amikor egy modell azt mondja, "a tudásom eddig és eddig tart", ez **nem** azt jelenti, hogy ma reggelig mindent tud, csak azt, hogy a **tanítási adatgyűjtés** eddig a pontig tartott — ami hónapokkal a beszélgetésetek előtti lehet. Erre a jelenségre a rendszer-prompt-szintű "frissítések" (lásd 4. rész) részben tudnak korrigálni, de a mögöttes tudás maga nem változik.
:::::
::::::

:::::: section id=kc-2 heading="2. rész — Miért nem \"csak frissítik menet közben\"?" nav="2. rész" group="Elmélet"

<p class="topic-tagline">Cél: értsd, miért nem egyszerű megoldás az, hogy "adjunk hozzá friss adatot, és tanítsuk tovább".</p>

### A catastrophic forgetting probléma

Ha egy már kész modellt **tovább tanítasz** friss adaton (ezt hívják **folytatólagos tanításnak**, continued/continual pretraining), a gradiens-frissítések, amik az **új** tudást beírják, **felülírhatják** a régi tudáshoz szükséges súlyokat. Ezt hívják **catastrophic forgetting**-nek: a modell **hirtelen elfelejt** korábban jól működő képességeket, miközben az újakat tanulja — és a kutatás szerint ez a jelenség **kifejezettebbé válik**, ahogy a modell mérete nő.

### Ez nem csak elméleti kockázat

A folytatólagos tanítás **valós, dokumentált mellékhatásai**: **disztribúciós eltolódás** (a modell "elhúz" az új adat stílusa felé), **ismétlődő kimenetek** gyakoribbá válása, és — talán a legkomolyabb — a **biztonsági korlátok gyengülése**: kutatások kimutatták, hogy még jóindulatú, ártalmatlannak tűnő finomhangolás is **eltávolíthatja a biztonsági "őrkorlátokat"**, amiket a post-training gondosan beépített.

::::: callout danger label="Miért nem éri meg egyszerűen 'csak hozzátanítani'?"
A folytatólagos tanítás **működik**, de kényes: alacsonyabb tanulási rátát igényel (5-10×-szer kisebbet, mint az eredeti pretraining), és a régi tudást **explicit "replay"-jel** kell védeni (a batch-ek 5-20%-a régi, általános adat kell maradjon, különben a modell "felejt"). Ez **komoly mérnöki munka és költség** — ezért a frontier-labek nem "napi frissítést" adnak, hanem **ritkán, nagy, gondosan tesztelt lépésekben** adnak ki új modell-generációkat.
:::::

### A gyakorlati ökölszabály

A kutatás egyértelmű vezérelvet ad: **ha a hiányzó tudás friss tény** (mi történt tegnap, mennyi egy árfolyam most) — **a RAG oldja meg**, nem a újratanítás. Ha a hiányzó tudás **domain-specifikus szókincs vagy érvelési minta** (pl. egy szűk szakterület zsargonja), akkor a folytatólagos tanítás indokolt lehet — de a legtöbb csapat **feleslegesen** nyúl hozzá, amikor a RAG **a költség töredékéért** megoldaná ugyanazt.
::::::

:::::: section id=kc-3 heading="3. rész — Hogyan jut mégis friss infóhoz: tool-use és web-search" nav="3. rész" group="Működés"

<p class="topic-tagline">Cél: értsd meg pontosan a mechanizmust, amivel egy modell "friss" választ tud adni anélkül, hogy a súlyai megváltoznának.</p>

### A modell nem "néz ki" a netre — valaki ad neki egy eszközt

A modellnek **nincs saját, autonóm internet-hozzáférése**. Amikor egy AI-alkalmazás (pl. ez a chat-felület) képes friss információt adni, az azért van, mert a **host-alkalmazás** biztosít egy **eszközt** (pl. `web_search`), amit a modell **hívhat** — pontosan úgy, ahogy az **MCP tutorial** 2. részében a "tools" primitíva működik.

### A folyamat lépései

1. A modell **eldönti**, hogy a kérdés megválaszolásához friss infó kell (pl. "ki a jelenlegi miniszterelnök" — ez időfüggő).
2. **Meghívja** a kereső-eszközt — ez a hívás **a host infrastruktúrájában** fut, nem a modell "fejében".
3. A keresés **eredménye szövegként** visszakerül a modellhez, **beillesztve a context windowba**.
4. A modell a **beillesztett szöveg alapján** válaszol — ugyanúgy, ahogy egy **RAG-rendszer** a visszakeresett dokumentum alapján válaszolna.

::::: callout label="Ugyanaz az elv, mint a RAG"
A **RAG tutorial** pontosan ezt a mechanizmust írta le: külső, ellenőrizhető forrást adni a modellnek a "parametrikus tudása" helyett. A web-search tool-hívás **technikailag ugyanaz** — csak itt a "tudásbázis" a teljes nyilvános internet, nem egy előre feltöltött vektor-adatbázis. A modell mindkét esetben **a beillesztett szövegben megalapozva (grounded)** válaszol, nem a tanítási adatból.
:::::

::::: callout warning label="Ha nincs eszköz, nincs friss infó"
Ha egy AI-alkalmazás **nem** ad a modellnek keresési (vagy más, friss adatot biztosító) eszközt, a modell **kizárólag** a tanítási adatára hagyatkozhat — és ilyenkor időfüggő kérdéseknél (aki most a miniszterelnök, mennyi egy árfolyam) **magabiztosan, de elavult** választ adhat. Ez direkt kapcsolódik a **hallucináció tutorial** 1. részéhez: minél időfüggőbb egy tény, annál nagyobb a kockázata, hogy a parametrikus tudás egyszerűen **elavult**, nem is feltétlenül "hamis" a tanítás idején.
:::::
::::::

:::::: section id=kc-4 heading="Feladat — Teszteld magad: kereséssel vs. anélkül" nav="Feladat" group="Gyakorlat"

<p class="topic-tagline">Cél: lásd élőben a különbséget a parametrikus tudás és a tool-alapú grounding között.</p>

```python
import anthropic

client = anthropic.Anthropic()

question = "Ki a jelenlegi vezérigazgatója a [egy általad választott, gyakran váltakozó vezetésű cégnek]?"

# --- A: keresés nélkül — csak a parametrikus tudásra hagyatkozva ---
resp_a = client.messages.create(
    model="claude-sonnet-5", max_tokens=200,
    messages=[{"role": "user", "content": question}],
)

# --- B: web-search eszközzel ---
resp_b = client.messages.create(
    model="claude-sonnet-5", max_tokens=200,
    tools=[{"type": "web_search_20250305", "name": "web_search"}],
    messages=[{"role": "user", "content": question}],
)

print("=== A: csak a modell tudása ===")
print(resp_a.content[0].text)
print("\n=== B: web-search eszközzel ===")
for block in resp_b.content:
    if block.type == "text":
        print(block.text)
```

::::: callout label="Gyakorlat"
Válassz egy **gyorsan változó** témát (egy sportbajnokság állása, egy cég vezetése, egy árfolyam). Figyeld meg: az **A** válasz jelez-e bizonytalanságot ("a tudásom eddig tart, ez azóta változhatott"), vagy magabiztosan ad egy **esetleg elavult** választ? A **B** válasz mennyivel pontosabb, és **hivatkozik-e forrásra**? Ez a kísérlet a **0-3. rész** teljes elméletét egy konkrét, kézzelfogható példában mutatja meg.
:::::
::::::

:::::: section id=kc-5 heading="4. rész — Termék-szint vs. modell-szint frissítés" nav="4. rész" group="Működés"

<p class="topic-tagline">Cél: különböztesd meg, mi változhat a súlyok érintése nélkül — ez a saját tapasztalatod is ebben a beszélgetésben.</p>

### Két, gyakran összemosott dolog

::::: stack-grid
:::: card label="Modell-szint (a súlyok)"
Csak egy **teljes, új tanítási ciklussal** változik (0-2. rész) — ritkán, nagy lépésekben, komoly teszteléssel. Ez a modell "parametrikus tudása" és alapvető képességei.
::::
:::: card label="Termék-felszín (amit köré építenek)"
A **system prompt**, az elérhető **eszközök** (web-search, MCP-connectorok), a felhasználói felület — ezek a modell **súlyainak érintése nélkül**, akár **naponta** frissülhetnek. Ez nem "a modell tanult valamit", hanem "a host-alkalmazás más kontextust ad neki".
::::
:::::

### Egy konkrét, kézzelfogható példa

Ha egy modellnek a rendszer-promptjában szerepel egy friss hír vagy egy házirend-változás (pl. egy termék-elérhetőségi frissítés), a modell **erről tud beszélni** — de ez **nem azért van, mert újratanították**, hanem mert a **host-alkalmazás explicit odaírta** a system promptba. A modell súlyai ettől **egyáltalán nem** változtak — csak több/más információt kapott a context windowban, mielőtt válaszolt.

::::: callout label="Miért fontos ezt szétválasztani?"
Ha valaki azt látja, hogy egy AI-asszisztens "tud" valami nagyon friss dologról, ebből **nem következik**, hogy a modellt frissítették. Sokkal valószínűbb, hogy **(1)** egy tool-hívás (3. rész) hozta be az infót, vagy **(2)** a host explicit betette a rendszer-kontextusba. A "tudás" és a "hozzáférés az infóhoz" **két különböző réteg** — az előbbi lassan, ritkán változik, az utóbbi gyorsan és gyakran.
:::::
::::::

:::::: section id=kc-6 heading="5. rész — Döntési keret: mikor bízz, mikor kérj keresést?" nav="5. rész" group="Referencia"

<p class="topic-tagline">Cél: egy gyakorlatias szabály, amit magaddal vihetsz.</p>

### A három forgatókönyv

::::: stack-grid
:::: card label="Időfüggő vagy gyorsan változó tény?"
(ki a jelenlegi X, mennyi az árfolyam, mi történt a héten) → **Mindig kérj explicit keresést/tool-hívást** — a parametrikus tudás itt **strukturálisan elavult** lehet, függetlenül attól, mennyire magabiztosan hangzik a válasz.
::::
:::: card label="Stabil, általános tudás?"
(történelmi tények, matematikai definíciók, jól bevált fogalmak) → A modell parametrikus tudása **jellemzően megbízható**, keresés nélkül is — ezek nem változnak a cutoff óta.
::::
:::: card label="Saját, belső (céges/projekt) tudás?"
→ Ez **soha nem** volt a modell tanítási adatában — itt **mindig** RAG vagy explicit kontextus-betáplálás kell (lásd **RAG tutorial**), függetlenül attól, mennyi idő telt el.
::::
:::::

### RAG vagy folytatólagos tanítás?

A **2. részben** látott ökölszabály megismétlve, mert ez a leggyakorlatiasabb tanulság: ha a hiányzó tudás **"nem ismeri a legfrissebb tényt"** típusú — a **RAG** oldja meg, **töredék költségért**. Ha a hiányzó tudás **"nem ismeri a szakterület nyelvezetét/logikáját"** típusú — akkor indokolt lehet a folytatólagos tanítás, de ez a ritkább eset.

::::: callout warning label="Amit sose feledj"
Egy modell magabiztos hangneme **nem jelzi**, hogy a tudása friss — ahogy a **hallucináció tutorial** is hangsúlyozta, a modell nincs "beépített ösztönözve" arra, hogy bizonytalanságot jelezzen. A te felelősséged eldönteni, mikor van szükség külső, friss forrásra — a modell ezt magától nem fogja megbízhatóan jelezni.
:::::
::::::

:::::: section id=kc-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A tutorial végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0–1. rész"
Tanítás vs. inferencia · a súlyok befagyasztása · a cutoff-rés eredete (6-18 hónap)
::::
:::: card label="2. rész"
Catastrophic forgetting · miért nem "csak frissítik" · RAG vs. folytatólagos tanítás ökölszabály
::::
:::: card label="3. rész + Feladat"
Tool-use/web-search mechanika · ugyanaz az elv, mint a RAG · saját teszt kereséssel/anélkül
::::
:::: card label="4–5. rész"
Termék-szint vs. modell-szint frissítés · döntési keret: mikor bízz, mikor keress
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>RAG</em> (külső grounding mechanizmusa), az <em>MCP</em> (a tool-hívás protokollja) és a <em>hallucináció</em> (miért nem jelez magától bizonytalanságot a modell) tutorialok.</p>
::::::
