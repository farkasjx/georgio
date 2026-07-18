---
page: model-size
title: Modellméret és tudás
sidebar_groups:
  - Elmélet
  - Működés
  - Gyakorlat
  - Referencia
hero:
  eyebrow: "Modellméret · Fejlesztői Tanulási Terv"
  title: "Modellméret és <em>tudás</em>"
  lead: "Mi az a paraméter valójában, milyen méret-kategóriák vannak, és mit jelent, hogy egy modell \"tudja\" valamit. A méret nem azonos a tudással, és a méret nem azonos a frissességgel — két teljesen független tengely, amit gyakran összemosnak. Épít a <em>vektor-adatbázis</em>, a <em>kvantálás</em> és a <em>knowledge cutoff</em> tutorialokra."
  stats:
    - { val: "7", lbl: "Szakasz" }
    - { val: "1", lbl: "Feladat" }
    - { val: "1", lbl: "Ábra" }
    - { val: "20:1", lbl: "Chinchilla-arány" }
footer:
  left: "AI Hub · Modellméret és tudás"
  right: "Modellméret · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#sz-0"><div class="tc-num">0. rész</div><div class="tc-name">Mi a paraméter?</div><div class="tc-desc">Egyetlen tanult szám — semmi több.</div></a>
  <a class="toc-card" href="#sz-1"><div class="tc-num">1. rész</div><div class="tc-name">Méret-kategóriák</div><div class="tc-desc">Mit jelent ténylegesen "több paraméter".</div></a>
  <a class="toc-card" href="#sz-2"><div class="tc-num">2. rész</div><div class="tc-name">Chinchilla-skálázás</div><div class="tc-desc">A méret önmagában nem elég.</div></a>
  <a class="toc-card" href="#sz-3"><div class="tc-num">3. rész</div><div class="tc-name">Mi az a "tudás"?</div><div class="tc-desc">Parametrikus vs. kontextuális réteg.</div></a>
  <a class="toc-card" href="#sz-4"><div class="tc-num">4. rész</div><div class="tc-name">Méret vs. cutoff</div><div class="tc-desc">Két teljesen független tengely.</div></a>
  <a class="toc-card" href="#sz-5"><div class="tc-num">5. rész</div><div class="tc-name">Emergens képességek</div><div class="tc-desc">Valódi ugrás, vagy mérési műtermék?</div></a>
  <a class="toc-card" href="#sz-6"><div class="tc-num">Feladat</div><div class="tc-name">Kicsi vs. nagy</div><div class="tc-desc">Ritka tény kontextussal és anélkül.</div></a>
</div>
::::::

:::::: section id=sz-0 heading="0. rész — Mi a paraméter, tulajdonképpen?" nav="0. rész" group="Elmélet"

<p class="topic-tagline">Cél: pontosítsd a legalapvetőbb fogalmat, amire a modellméret egésze épül.</p>

### Egyetlen tanult szám

Egy **paraméter** egyetlen szám (súly) a modellben — a **vektor-adatbázis tutorial** és a **kvantálás tutorial** már bevezette: egy súly-mátrix minden komponense egy ilyen paraméter, amit a tanítás során fokozatosan finomítottak. Egy paraméter **önmagában nem jelent semmit** — nem "egy tény", nem "egy szó", nem "egy szabály". Csak akkor nyer jelentést, ha **több ezer másikkal együtt**, egy mátrixszorzat részeként számol.

### A "modellméret" definíciója

Amikor azt mondod, egy modell "70 milliárd paraméteres", ez egyszerűen azt jelenti: **ennyi tanult szám van összesen** a hálózatban. Ez a szám határozza meg a **VRAM-igényt** (lásd a **hardver tutorial** képletét), és — ahogy a következő részekben látod — valamilyen mértékben a modell **kapacitását** is, hogy mennyire finom mintázatokat tudjon megjegyezni és reprodukálni.

::::: callout label="Egy mondatban"
**A paraméter egy szám, a modellméret pedig ezeknek a számoknak az összesített darabszáma.** Az, hogy ez a szám mit "jelent" a modell viselkedésére nézve, sokkal bonyolultabb kérdés — erről szól a tutorial többi része.
:::::
::::::

:::::: section id=sz-1 heading="1. rész — Méret-kategóriák: mit jelent \"több paraméter\"?" nav="1. rész" group="Elmélet"

<p class="topic-tagline">Cél: értsd meg, hogy a nagyobb méret nem "több tényt" jelent, hanem nagyobb mintázat-kapacitást.</p>

### A durva térkép

A **cost-routing** és **hardver tutorialokban** már szerepelt egy gyakorlati felosztás — itt megismételve, de a hangsúly most azon van, **mit jelent** ez a méret-kategória, nem azon, mikor melyiket válaszd:

| Kategória | Tipikus tartomány | Mit jelent a méret |
|---|---|---|
| **Kicsi** | 1-8B | Kevesebb mintázat-kapacitás, egyszerűbb feladatokra elegendő |
| **Közepes** | 13-32B | Több árnyalat, összetettebb következtetési láncok |
| **Nagy** | 70B+ | Finomabb, ritkább mintázatok is megjegyezhetők |
| **Frontier** | Nyilvánosan nem közölt méret | A legfinomabb, legritkább mintázatok is elérhetők |

### Ez NEM egy "tényadatbázis mérete"

A leggyakoribb félreértés: több paraméter = "több tény van eltárolva". Ez **félrevezető analógia**. A paraméterek nem "cellák" egy táblázatban, amikbe tényeket írtak — hanem egy **függvény alakját** kódolják, ami a bemenetből (egy prompt) kimenetet (a következő token valószínűségeit) generál. **Több paraméter = a függvény finomabb, több árnyalatú lehet** — több, egymástól finoman megkülönböztethető mintázatot tud reprezentálni. Ez közvetve **valóban** összefügg azzal, "mennyi mindent tud" a modell, de nem azon az egyszerű módon, mint egy adatbázis mérete.

::::: callout warning label="Miért fontos ez a különbségtétel?"
Ha a paramétert "tárolt tényként" képzeled el, azt várnád, hogy egy modell **pontosan visszaadja**, amit "tud" — mint egy lekérdezés egy adatbázisból. De a modell **generál**, nem keres elő — ez az alapja annak, amit a **hallucináció tutorial** részletesen tárgyalt: a modell a tanult mintázatok alapján **valószínű** folytatást ad, ami a legtöbbször helyes, de nem garantáltan az.
:::::
::::::

:::::: section id=sz-2 heading="2. rész — Chinchilla-skálázás: a méret önmagában nem elég" nav="2. rész" group="Elmélet"

<p class="topic-tagline">Cél: értsd meg, hogy a paraméterszám csak az egyik fele az egyenletnek.</p>

### A felfedezés, ami mindent megváltoztatott

2022-ben a DeepMind **Chinchilla**-kutatása megmutatta: egy adott számítási költségvetésnél nem elég csak a paraméterszámot növelni — a **paraméterszám és a tanítási adat mennyisége** együtt kell, hogy nőjön. A megtalált optimális arány: nagyjából **20 token tanítási adat minden egyes paraméterre**.

### A bizonyíték: a GPT-3 alultanított volt

A kutatás rámutatott, hogy a **175 milliárd paraméteres GPT-3**-at mindössze **~300 milliárd** tokenen tanították — miközben a számítási költségvetése alapján **~3,5 billió** tokent bírt volna el. A Chinchilla saját, 70 milliárd paraméteres modellje, ami **1,4 billió** tokenen tanult (a 20:1 arány szerint), **felülmúlta** a nála négyszer nagyobb, de alultanított Gopher modellt — **ugyanakkora** számítási költséggel.

::::: callout label="A gyakorlati tanulság"
**A nagyobb modell nem automatikusan jobb** — ha nincs mellé elég, jó minőségű tanítási adat, a "extra" paraméterek kihasználatlanok maradnak. Egy kisebb, de **jól tanított** modell felülteljesítheti a nagyobb, alultanítottat, azonos számítási költség mellett.
:::::

### A 2026-os fordulat: a "túltanítás" tudatos stratégiája

A modern gyakorlat **messze túlmegy** a Chinchilla 20:1 arányán — nem tudatlanságból, hanem **tudatos inferencia-optimalizálásból**. A **Llama 3 8B**-t **15 billió** tokenen tanították — ez **~1875 token/paraméter**, közel **100×-osa** a Chinchilla-ajánlásnak. Az ok egyszerű: ha a modellt **milliók** fogják használni, olcsóbb egy **kisebb, de sokkal tovább tanított** modellt szolgáltatni, mint egy Chinchilla-optimális, de nagyobb (és ezért drágább inferenciájú) modellt — az inferencia-költség megtakarítása hosszú távon meghaladja a plusz tanítási költséget. Ez direkt kapcsolódik a **cost-routing tutorial** teljes szemléletéhez: a döntés sosem csak a tanítási, hanem a **teljes életciklus-költségről** szól.

::::: callout warning label="A MoE bonyolítja a képletet"
A **dense vs. MoE tutorialban** látott total/active paraméter-megkülönböztetés itt is előkerül: egy 600 milliárd total, de 40 milliárd aktív paraméteres MoE modell **nem** feltétlenül alultanított, ha "csak" 800 milliárd tokenen tanult — a Chinchilla-arányt az **aktív** paraméterszámhoz kell viszonyítani, nem a totálhoz. A modern frontier-tervezésnél **mindkét** számot egyszerre kell kezelni.
:::::
::::::

:::::: section id=sz-3 heading="3. rész — Mi az a \"tudás\"? Parametrikus vs. kontextuális réteg" nav="3. rész" group="Működés"

<p class="topic-tagline">Cél: a legfontosabb tisztázás — a "tudás" szó két, nagyon eltérő dolgot takarhat.</p>

### Két réteg, amit sose keverj össze

::::: stack-grid
:::: card label="Parametrikus tudás"
Ami a **súlyokba van "besütve"** a tanítás során — tömörített statisztikai szabályosság, nem egy lexikon. A modell nem "keres elő" egy tényt, hanem **generál** valami valószínűt a tanult mintázatok alapján. Ez a réteg **méret- és tanítási adat-függő**.
::::
:::: card label="Kontextuális tudás"
Ami a **promptban / context windowban** van jelen — egy RAG-találat, egy keresési eredmény, egy korábbi üzenet. Ez **teljesen méret-független**: egy kicsi modell jó kontextussal **többet "tud"** egy adott pillanatban, mint egy hatalmas modell kontextus nélkül.
::::
:::::

### Miért fontos ez a megkülönböztetés?

A **RAG tutorial** és a **memory tutorial** pontosan erről a második rétegről szólt: külső, ellenőrizhető forrást adni a modellnek, ahelyett hogy a bizonytalan, parametrikus "emlékezetére" hagyatkozna. A modellméret **csak az első réteget** befolyásolja — a második réteg minőségét a **retrieval, a chunkolás, a prompt-szerkezet** határozza meg, nem a paraméterszám.

::::: callout label="Egy konkrét példa"
Egy 8B-os lokális modell, aminek megadod a pontos Jira-ticket szövegét kontextusként, **pontosabb** választ ad arra a ticketre, mint egy 700B-os frontier modell, aminek **nincs** hozzáférése a ticket-hez — a frontier modell ilyenkor vagy elutasítja a választ, vagy **hallucinál** valami plauzibilis, de rossz választ (lásd **hallucináció tutorial**, 1. rész: a ritka, specifikus tények eleve gyengén reprezentáltak a parametrikus rétegben).
:::::
::::::

:::::: section id=sz-4 heading="4. rész — Méret vs. knowledge cutoff: két független tengely" nav="4. rész" group="Működés"

<p class="topic-tagline">Cél: a kérdésedre a direkt válasz — van-e kapcsolat a méret és a cutoff között.</p>

### A rövid válasz: nincs korreláció

A **knowledge-cutoff tutorial** bevezette a "termék-szint vs. modell-szint" megkülönböztetést. Itt ennek egy fontos kiegészítése: **a modellméret és a knowledge cutoff dátuma két, egymástól teljesen független tengely.** Egy modell mérete azt határozza meg, **mennyi mintázat-kapacitása** van (1-2. rész); a cutoff azt határozza meg, **meddig terjedt** a tanítási adat időben. A kettő **nem függ össze**: lehet egy hatalmas modell régi cutoffal, és egy kicsi modell friss cutoffal — a kettő a tanítási döntések **különböző dimenziói**.

![Méret és knowledge cutoff mint két független tengely](assets/size-01-independence.jpg)

### Amit ez konkrétan jelent

::::: stack-grid
:::: card label="Nagy modell ≠ frissebb"
Egy hatalmas, frontier modell **ugyanolyan "elavult"** lehet egy adott témában, mint egy kicsi, ha **ugyanaz** a cutoffja — a méret nem "frissíti" a tudást, csak **mélyebben és árnyaltabban** kódolja azt, amit addig a pontig látott.
::::
:::: card label="Kicsi modell + friss cutoff = lehetséges"
Egy újonnan kiadott, kisebb modell **frissebb** tudással rendelkezhet egy korábban kiadott, sokkal nagyobb modellnél — a kiadási dátum (és az ahhoz tartozó cutoff) a döntő, nem a paraméterszám.
::::
:::::

::::: callout warning label="Miért keverik ezt gyakran össze?"
Mert a frontier laborok jellemzően **egyszerre** adnak ki nagyobb modellt és frissebb cutoffot egy új generációnál — ez **együtt jár a gyakorlatban**, de **nem oksági kapcsolat**. A méret-növelés és a cutoff-frissítés két külön tervezési döntés, amik egy adott kiadási ciklusban **egybeesnek**, de elvileg teljesen szétválaszthatók lennének (és néha szét is válnak — pl. egy kisebb, gyorsan iterált modell frissebb adaton, mint a nagy testvére).
:::::
::::::

:::::: section id=sz-5 heading="5. rész — Emergens képességek: valódi ugrás, vagy mérési műtermék?" nav="5. rész" group="Működés"

<p class="topic-tagline">Cél: ismerd a vitát a méret és a képességek közti "ugrásszerű" változásról.</p>

### Az eredeti megfigyelés

2022-ben kutatók (Wei és szerzőtársai) dokumentáltak olyan feladatokat, ahol a modell teljesítménye **egy kritikus méret alatt gyakorlatilag véletlenszerű** volt, majd **hirtelen, ugrásszerűen javult** egy küszöb felett — pl. a few-shot aritmetikai feladatoknál nagyjából **10 milliárd paraméter** alatt közel nulla, afölött gyors javulás. Ezt nevezték **emergens képességnek**: olyan tulajdonság, ami kisebb modelleknél hiányzik, de nagyobbaknál "hirtelen megjelenik".

### A cáfolat: sok "ugrás" mérési műtermék

2023-ban egy másik kutatás (Schaeffer és szerzőtársai) megmutatta: az "emergens ugrások" jó része **eltűnik**, ha **sima (folytonos) mérőszámot** használsz az éles, bináris helyett. Ha egy feladatot **"pontos egyezés" (exact-match)** szerint mérsz (teljesen jó vagy teljesen rossz), egy valójában **fokozatosan** javuló belső valószínűség **mesterségesen éles ugrásnak** tűnhet a küszöbnél — miközben a modell **tokenenkénti log-valószínűsége** valójában **folyamatosan, simán** javul a méret növekedésével.

::::: callout label="A jelenlegi konszenzus"
A jelenség **részben mérési műtermék, részben valódi.** Néhány képesség (pl. hogy a lépésenkénti gondolkodás egyáltalán segít-e, vagy hogy a kódgenerálás átlép-e egy használhatósági küszöböt) **továbbra is valódi, érdemi ugrásnak** tűnik a felhasználó szemszögéből — nem csak a mérőszám váltása miatt. A tanulság: **légy szkeptikus**, ha valaki "emergens képességre" hivatkozik — nézd meg, milyen mérőszámmal mérték, mielőtt elfogadnád az "ugrás" állítást.
:::::
::::::

:::::: section id=sz-6 heading="Feladat — Kicsi vs. nagy modell: ritka tény kontextussal és anélkül" nav="Feladat" group="Gyakorlat"

<p class="topic-tagline">Cél: lásd élőben a 3. rész két rétegének (parametrikus vs. kontextuális) különbségét.</p>

```python
import anthropic

client = anthropic.Anthropic()

# egy ritka, specifikus "tény" — a te saját projektedből, amit egyik modell sem tanulhatott meg
context = (
    "A Nevogate projekt SimplePay integrációjának Cancel API-ja "
    "kizárólag PENDING állapotú tranzakciót képes érvényteleníteni, "
    "és a válasz mezőben egy 'cancellation_id' azonosítót ad vissza."
)
question = "Milyen állapotú tranzakciót tud érvényteleníteni a Nevogate Cancel API-ja, és mit ad vissza válaszként?"

# --- A: kis modell, KONTEXTUS NÉLKÜL — parametrikus tudásra hagyatkozva ---
resp_a = client.messages.create(
    model="claude-haiku-4-5-20251001", max_tokens=200,
    messages=[{"role": "user", "content": question}],
)

# --- B: kis modell, KONTEXTUSSAL ---
resp_b = client.messages.create(
    model="claude-haiku-4-5-20251001", max_tokens=200,
    messages=[{"role": "user", "content": f"Forrás: {context}\n\nKérdés: {question}"}],
)

print("=== A: kis modell, kontextus nélkül ===")
print(resp_a.content[0].text)
print("\n=== B: kis modell, kontextussal ===")
print(resp_b.content[0].text)
```

::::: callout label="Gyakorlat"
Figyeld meg: az **A** válasz vagy elutasítja a kérdést ("nincs ilyen infóm"), vagy **hallucinál** valami plauzibilis, de rossz választ — mert ez a ritka, projekt-specifikus tény **sosem** volt egyik modell tanítási adatában sem (parametrikus réteg, 3. rész). A **B** válasz **pontos**, annak ellenére, hogy ugyanaz a (kis) modell — mert a **kontextuális réteg** teljesen pótolja a hiányzó parametrikus tudást. Ismételd meg egy **nagyobb** modellel is (pl. `claude-opus-4-8`) kontextus nélkül — valószínűleg az is hallucinál vagy elutasít, bizonyítva, hogy **a méret itt nem segít**, csak a kontextus.
:::::
::::::

:::::: section id=sz-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A tutorial végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0–1. rész"
A paraméter mint egyetlen tanult szám · méret-kategóriák · miért nem "tényadatbázis" a méret
::::
:::: card label="2. rész"
Chinchilla 20:1 arány · a GPT-3 alultanítási esete · a tudatos túltanítás inferencia-költség miatt · MoE-komplikáció
::::
:::: card label="3–4. rész"
Parametrikus vs. kontextuális tudás · méret és knowledge cutoff mint két független tengely
::::
:::: card label="5. rész + Feladat"
Emergens képességek — valódi és mérési-műtermék jelenség · saját teszt kis modellel, kontextussal/anélkül
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>vektor-adatbázis</em> és a <em>kvantálás</em> (mi a paraméter/súly), a <em>knowledge cutoff</em> (méret és frissesség szétválasztása), a <em>dense vs. MoE</em> (total/active paraméter) és a <em>hallucináció</em> (miért generál a modell tényadatbázis-keresés helyett) tutorialok.</p>
::::::
