---
page: python-generators-ai
title: Generátorok és iterátorok
sidebar_groups:
  - Alapok
  - Miért ideális streaminghez
  - Gyakorlat
  - Projekt
hero:
  eyebrow: "Python az AI-hoz · Fejlesztői Tanulási Terv"
  title: "Generátorok — <em>és iterátorok</em>"
  lead: "A Hivatalos SDK-k tutorialban láttál streaming AI-választ — ez a cikk azt mutatja meg, mi történik ez alatt a felszín alatt: a generátor, ami lehetővé teszi, hogy egy válasz token-ről tokenre érkezzen, anélkül hogy a teljes választ előbb memóriába kellene tölteni."
  stats:
    - { val: "8GB → ~0", lbl: "memóriaigény lista vs. generátor*" }
    - { val: "1×", lbl: "egy generátor csak egyszer járható be" }
    - { val: "4", lbl: "Szakasz" }
    - { val: "1", lbl: "projekt: saját streaming parszoló" }
footer:
  left: "AI Hub · Python az AI-hoz"
  right: "Generátorok · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#python-generators-ai-0"><div class="tc-num">0. rész</div><div class="tc-name">A yield alapmechanizmusa</div><div class="tc-desc">Egy függvény, ami szünetelhet és folytatódhat.</div></a>
  <a class="toc-card" href="#python-generators-ai-1"><div class="tc-num">1. rész</div><div class="tc-name">Miért ideális ez streaminghez</div><div class="tc-desc">A memória-különbség, konkrét számmal.</div></a>
  <a class="toc-card" href="#python-generators-ai-2"><div class="tc-num">2. rész</div><div class="tc-name">Egy korlát, amit észben kell tartani</div><div class="tc-desc">A generátor csak egyszer járható be.</div></a>
  <a class="toc-card" href="#python-generators-ai-3"><div class="tc-num">3. rész</div><div class="tc-name">Mini-projekt: saját streaming-feldolgozó</div><div class="tc-desc">Egy generátor, ami token-ről tokenre gyűjt és jelez.</div></a>
</div>
::::::

:::::: section id=python-generators-ai-0 num="00" heading="0. rész — A yield alapmechanizmusa" nav="A yield alapmechanizmusa" group="Alapok"

<p class="topic-tagline">Cél: érts meg egy alapvető különbséget a sima függvény és a generátor közt.</p>

### Szünetel, nem visszatér

::::: callout label="A kulcsfelismerés"
Egy sima függvény a `return`-nél **végleg befejeződik** — a helyi változói eltűnnek. Egy **generátor függvény** (ami `yield`-et használ `return` helyett) ehelyett **szünetel** minden `yield`-nél, és **megőrzi** a teljes belső állapotát, amíg a hívó fél nem kér egy következő értéket.
:::::

```python
def count_up_to(max_n):
    count = 1
    while count <= max_n:
        yield count  # itt szünetel, visszaadja az értéket
        count += 1   # ide tér vissza, amikor újra hívják

counter = count_up_to(3)
print(next(counter))  # 1
print(next(counter))  # 2 — a count változó értéke megmaradt!
print(next(counter))  # 3
```

::::: callout label="Egy mondatban"
A generátor nem "különleges lista" — egy olyan függvény, ami emlékszik, hol tartott legutóbb, és onnan folytatja, amikor újra meghívod, ahelyett hogy elölről kezdene mindent.
:::::
::::::

:::::: section id=python-generators-ai-1 num="01" heading="1. rész — Miért ideális ez streaminghez: a memória-különbség" nav="Miért ideális ez streaminghez" group="Miért ideális streaminghez"

<p class="topic-tagline">Cél: érts meg egy konkrét, számokkal illusztrált okot, amiért a streaming AI-válaszok generátorra épülnek.</p>

### Lista vs. generátor kifejezés

```python
# lista-derivált — MINDEN elem azonnal, egyszerre memóriában van
squares_list = [x ** 2 for x in range(1_000_000_000)]  # ~8 GB memória!

# generátor-kifejezés — egyszerre csak EGY elem van memóriában
squares_gen = (x ** 2 for x in range(1_000_000_000))
total = sum(squares_gen)  # ugyanaz az eredmény, elenyésző memóriával
```

::::: callout danger label="A konkrét memória-különbség"
Egymilliárd négyzetszám **listaként** tárolva kb. **8 gigabájt** memóriát igényelne — ugyanez **generátorként** feldolgozva gyakorlatilag **elhanyagolható** memóriát használ, mert sosem létezik egyszerre az összes érték, csak az éppen aktuális.
:::::

### A kapcsolat a streaming AI-válaszhoz

::::: callout label="Amit ez megmagyaráz"
A <em>Hivatalos SDK-k</em> tutorialban látott `stream.text_stream` **pontosan ez a minta**: a modell válasza token-ről tokenre **generátorként** érkezik, nem egy előre elkészített, teljes stringként — ezért tudsz azonnal, az első token megérkezésekor megjeleníteni valamit, ahelyett hogy a teljes válaszra várnál.
:::::

::::: callout label="Egy mondatban"
A generátorok memória-hatékonysága nem elvont optimalizálás — ez a konkrét, technikai ok, amiért egy streaming AI-válasz **azonnal** elkezd megjelenni, ahelyett hogy a teljes generálás végéig várnál.
:::::
::::::

:::::: section id=python-generators-ai-2 num="02" heading="2. rész — Egy korlát, amit észben kell tartani: a generátor csak egyszer járható be" nav="Egy korlát, amit észben kell tartani" group="Alapok"

<p class="topic-tagline">Cél: ismerj meg egy gyakorlati korlátot, ami gyakori, meglepő hibaforrás.</p>

### Az "exhaustible" (kimeríthető) jelleg

::::: callout danger label="A gyakori csapda"
Egy generátor **egyszer** járható be — miután végigmentél rajta (pl. egy `for`-ciklussal vagy `list()`-té alakítva), **kiürül**, és egy második bejárási kísérlet **semmit nem ad vissza**, hiba nélkül is.
:::::

```python
gen = (x for x in range(5))
print(list(gen))  # [0, 1, 2, 3, 4]
print(list(gen))  # [] — a generátor már kiürült!
```

::::: callout warning label="A gyakorlati következmény"
Ha egy AI-válasz streaming generátorát **véletlenül kétszer** próbálod bejárni (pl. egyszer naplózáshoz, egyszer a felhasználónak való megjelenítéshez), a második bejárás **üres eredményt** ad — ha ilyen kettős felhasználásra van szükséged, előbb alakítsd listává, vagy tervezd meg a generátort úgy, hogy csak egyszer fogyasszák el.
:::::

::::: callout label="Egy mondatban"
A generátor nem "újrafelhasználható" adatstruktúra, mint egy lista — ez egy **egyszer-fogyasztható folyam**, amit tudatosan kell kezelni, ha a kódod több helyen is hozzá akar férni ugyanahhoz az adathoz.
:::::
::::::

:::::: section id=python-generators-ai-3 num="03" heading="3. rész — Mini-projekt: saját streaming-feldolgozó" nav="Mini-projekt: saját streaming-feldolgozó" group="Projekt"

<p class="topic-tagline">Cél: építs egy generátort, ami egy AI-válasz streamjét dolgozza fel, miközben egy másodlagos állapotot is vezet.</p>

### A feladat

::::: callout label="Amit építesz"
Egy generátor-alapú `stream_and_count()` függvényt, ami **továbbadja** a streaming AI-válasz minden darabját (ahogy megérkezik), miközben **közben számolja** a kapott karakterek összesített mennyiségét — anélkül, hogy a teljes választ egyszerre memóriába kellene gyűjtened.
:::::

```python
def stream_and_count(text_stream):
    """Generátor, ami továbbadja a darabokat, miközben számol."""
    total_chars = 0
    for chunk in text_stream:
        total_chars += len(chunk)
        yield chunk  # a darabot azonnal továbbadja a hívónak

    # ez a rész csak a stream végén fut le
    print(f"\n[Összesen {total_chars} karakter érkezett]")

# használat a Hivatalos SDK-k tutorialban látott streaminggel
with client.messages.stream(...) as stream:
    for piece in stream_and_count(stream.text_stream):
        print(piece, end="", flush=True)
```

::::: callout warning label="Miért generátor ez, nem sima függvény"
Ha `stream_and_count()` egy **sima függvény** lenne, ami egy listát gyűjt össze és ad vissza a végén, elveszne a streaming előnye — a felhasználó **megint csak a teljes válasz végén** látna bármit. A `yield` az, ami megőrzi az azonnali, token-ről tokenre való megjelenítést, miközben egy másodlagos számítást (a karakterszámlálást) is elvégez a háttérben.
:::::

::::: callout label="Egy mondatban"
Ez a mini-projekt megmutatja, hogy egy generátor nem csak "adatot ad tovább" — **köztes állapotot** (mint a karakterszámláló) is fenntarthat a bejárás közben, anélkül hogy ez megtörné a streaming, azonnali-megjelenítés tulajdonságát.
:::::
::::::

:::::: section id=python-generators-ai-summary num=SUMMARY nav="Összefoglalás" sub=true group="Projekt"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0. rész"
A yield alapmechanizmusa — a generátor szünetel és megőrzi az állapotát, nem tér vissza véglegesen
::::
:::: card label="1. rész"
Miért ideális streaminghez — konkrét memória-adat (8GB vs. elhanyagolható), és a kapcsolat a streaming AI-válaszhoz
::::
:::: card label="2. rész"
A generátor egyszer-fogyasztható jellege — gyakori hibaforrás, ha véletlenül kétszer próbálod bejárni
::::
:::: card label="3. rész"
Mini-projekt: egy generátor, ami tovább adja a streaming darabokat, közben köztes állapotot (karakterszám) vezet
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>Hivatalos SDK-k</em> (a streaming API-hívás, aminek mechanizmusát ez a cikk magyarázza) és a <em>Kontextuskezelők</em> (a következő lépés — a `with client.messages.stream(...)` mögötti mechanizmus) tutorialok.</p>

<p class="topic-tagline" style="margin-top:12px;font-size:0.85em;opacity:0.75">* A 8GB-os memória-becslés egy 2026-os Python-oktatóanyag illusztratív számítása egymilliárd elemű listára — lásd az 1. részt a kontextusért.</p>
::::::
