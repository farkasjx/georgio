---
page: python-context-managers-ai
title: Kontextuskezelők a gyakorlatban
sidebar_groups:
  - Alapok
  - A generátor-alapú út
  - Haladó minta
  - Projekt
hero:
  eyebrow: "Python az AI-hoz · Fejlesztői Tanulási Terv"
  title: "Kontextuskezelők — <em>a gyakorlatban</em>"
  lead: "A Hivatalos SDK-k tutorialban már használtad a with client.messages.stream(...) mintát — ez a cikk elmagyarázza, mi történik a with-blokk mögött, és hogyan írj saját kontextuskezelőt, ami garantáltan lefut, még hiba esetén is."
  stats:
    - { val: "2", lbl: "módja saját kontextuskezelő írásának" }
    - { val: "100%", lbl: "az __exit__ garantáltan lefut*" }
    - { val: "4", lbl: "Szakasz" }
    - { val: "1", lbl: "projekt: AI-hívás időzítő" }
footer:
  left: "AI Hub · Python az AI-hoz"
  right: "Kontextuskezelők · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#python-context-managers-ai-0"><div class="tc-num">0. rész</div><div class="tc-name">Mit garantál a with</div><div class="tc-desc">A setup/teardown pár, ami hiba esetén is lefut.</div></a>
  <a class="toc-card" href="#python-context-managers-ai-1"><div class="tc-num">1. rész</div><div class="tc-name">Saját kontextuskezelő: két út</div><div class="tc-desc">Osztály-alapú vs. @contextmanager generátor.</div></a>
  <a class="toc-card" href="#python-context-managers-ai-2"><div class="tc-num">2. rész</div><div class="tc-name">Async kontextuskezelők</div><div class="tc-desc">A with client.messages.stream(...) async párja.</div></a>
  <a class="toc-card" href="#python-context-managers-ai-3"><div class="tc-num">3. rész</div><div class="tc-name">Mini-projekt: AI-hívás időzítő</div><div class="tc-desc">Egy kontextuskezelő, ami minden hívást mér.</div></a>
</div>
::::::

:::::: section id=python-context-managers-ai-0 num="00" heading="0. rész — Mit garantál a with" nav="Mit garantál a with" group="Alapok"

<p class="topic-tagline">Cél: érts meg egy garanciát, amit a with statement ad, és amiért ez fontosabb, mint elsőre tűnik.</p>

### Setup, teardown, garantáltan

::::: callout label="A kulcsgarancia"
A `with` statement biztosítja, hogy egy **setup** lépés (`__enter__`) lefut a blokk elején, és egy **teardown** lépés (`__exit__`) lefut a blokk végén — **még akkor is, ha a blokk közben kivétel (hiba) történt**. Ez az, amiért egy fájl mindig bezáródik, egy zár mindig felszabadul, egy tranzakció mindig commitolódik vagy visszagördül.
:::::

```python
with open("data.txt") as f:
    content = f.read()
# a fájl itt garantáltan bezárva, akkor is, ha a read() hibázott
```

::::: callout label="Egy mondatban"
A `with` nem csak "szintaktikai cukorka" a `try`/`finally` helyett — egy explicit **garancia**, hogy egy erőforrás felszabadulása sosem marad el, függetlenül attól, mi történik a blokkon belül.
:::::
::::::

:::::: section id=python-context-managers-ai-1 num="01" heading="1. rész — Saját kontextuskezelő: két út" nav="Saját kontextuskezelő: két út" group="A generátor-alapú út"

<p class="topic-tagline">Cél: ismerd meg mindkét módot saját kontextuskezelő írására, és melyiket mikor válaszd.</p>

### Osztály-alapú: `__enter__` és `__exit__`

```python
import time

class Timer:
    def __enter__(self):
        self.start = time.time()
        return self  # ez lesz elérhető a "with ... as x" x változójában

    def __exit__(self, exc_type, exc_val, exc_tb):
        elapsed = time.time() - self.start
        print(f"Eltelt idő: {elapsed:.2f}s")
        return False  # False/None: a hiba (ha volt) továbbterjed

with Timer():
    call_ai_model("Foglald össze ezt a dokumentumot")
```

### Generátor-alapú: `@contextmanager`

::::: callout label="Miért ez a preferált, tömörebb út"
A <em>Generátorok és iterátorok</em> tutorialban megismert `yield`-re épülő megközelítés: minden, ami a `yield` **előtt** van, az `__enter__`-nek felel meg; minden, ami **utána** van, az `__exit__`-nek. Ez kiküszöböli a két külön dunder-metódus megírásának boilerplate-jét.
:::::

```python
from contextlib import contextmanager
import time

@contextmanager
def timer():
    start = time.time()
    try:
        yield  # itt fut a with-blokk tartalma
    finally:
        elapsed = time.time() - start
        print(f"Eltelt idő: {elapsed:.2f}s")

with timer():
    call_ai_model("Foglald össze ezt a dokumentumot")
```

::::: callout warning label="Miért kell a try/finally a generátor-alapú verzióban"
A `finally` blokk biztosítja, hogy a teardown-kód **akkor is lefusson**, ha a `with`-blokkban kivétel történt — enélkül egy hiba "elnyelné" a takarítási lépést, pontosan azt a garanciát törve meg, amit a 0. részben megismertél.
:::::

::::: callout label="Egy mondatban"
Mindkét út ugyanazt a garanciát adja — a `@contextmanager` generátoros verzió általában **tömörebb és olvashatóbb** egyszerűbb esetekre, az osztály-alapú megközelítés jobb, ha a kontextuskezelőnek **saját, komplexebb állapotot** kell tartania.
:::::
::::::

:::::: section id=python-context-managers-ai-2 num="02" heading="2. rész — Async kontextuskezelők: a with client.messages.stream(...) async párja" nav="Async kontextuskezelők" group="Haladó minta"

<p class="topic-tagline">Cél: kösd össze ezt a témát az Async Python az AI-hoz tutoriallal.</p>

### `async with`

::::: callout label="Amikor a setup/teardown maga is aszinkron"
Az <em>Async Python az AI-hoz</em> tutorialban megismert `AsyncAnthropic` klienshez hasonló, aszinkron erőforrásoknál (adatbázis-kapcsolatok, HTTP-session-ök) az `async with` és a **`__aenter__`**/**`__aexit__`** metódusok kellenek — ugyanaz a garancia, csak async kontextusban.
:::::

```python
from contextlib import asynccontextmanager

@asynccontextmanager
async def ai_session():
    client = AsyncAnthropic()
    try:
        yield client
    finally:
        await client.close()  # aszinkron takarítás

async def main():
    async with ai_session() as client:
        response = await client.messages.create(...)
```

::::: callout label="Egy mondatban"
Az `async with`/`@asynccontextmanager` ugyanazt a setup/teardown-garanciát adja, mint a szinkron változat — csak akkor kell, ha maga a takarítási lépés is `await`-elendő aszinkron művelet.
:::::
::::::

:::::: section id=python-context-managers-ai-3 num="03" heading="3. rész — Mini-projekt: AI-hívás időzítő" nav="Mini-projekt: AI-hívás időzítő" group="Projekt"

<p class="topic-tagline">Cél: építs egy kontextuskezelőt, ami minden AI-hívás időtartamát méri és naplózza.</p>

### A feladat

::::: callout label="Amit építesz"
Egy `ai_call_timer()` kontextuskezelőt, ami **mérje az időt**, és — ha a hívás **hibázott** — azt is jelezze a naplóban, nem csak a sikeres esetet.
:::::

```python
from contextlib import contextmanager
import time
import logging

logger = logging.getLogger("ai_timing")

@contextmanager
def ai_call_timer(label: str):
    start = time.time()
    try:
        yield
        elapsed = time.time() - start
        logger.info(f"[{label}] sikeres, {elapsed:.2f}s")
    except Exception as e:
        elapsed = time.time() - start
        logger.error(f"[{label}] hiba {elapsed:.2f}s után: {e}")
        raise  # a hiba továbbterjed — a kontextuskezelő csak MEGFIGYEL, nem nyel el semmit

# használat
with ai_call_timer("dokumentum-összefoglalás"):
    summary = call_ai_model("Foglald össze...")
```

::::: callout warning label="Miért fontos a raise a except blokk végén"
Ha a `raise`-t elhagynád, a kontextuskezelő **elnyelné** a hibát — a hívó kód azt hinné, minden rendben ment, holott a mögötte lévő AI-hívás valójában hibázott. A naplózás **mellékhatás**, nem szabad megváltoztatnia az eredeti hiba-viselkedést.
:::::

::::: callout label="Egy mondatban"
Ez a mini-projekt egyesíti a <em>Dekorátorok a gyakorlatban</em> tutorial `@log_api_call`-jának célját (mérés, naplózás) egy kontextuskezelő formájában — mindkettő ugyanazt a "csomagold be a viselkedést" elvet valósítja meg, csak más szintaxissal.
:::::
::::::

:::::: section id=python-context-managers-ai-summary num=SUMMARY nav="Összefoglalás" sub=true group="Projekt"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0. rész"
A with statement garanciája: setup és teardown, ami hiba esetén is lefut
::::
:::: card label="1. rész"
Két út saját kontextuskezelő írásához: osztály-alapú (__enter__/__exit__) vagy generátor-alapú (@contextmanager)
::::
:::: card label="2. rész"
Async kontextuskezelők (async with, @asynccontextmanager) az aszinkron erőforrásokhoz
::::
:::: card label="3. rész"
Mini-projekt: egy AI-hívás időzítő, ami méri és naplózza a hívásokat, hibát nem elnyelve, csak megfigyelve
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>Generátorok és iterátorok</em> (a yield-mechanizmus, amire a @contextmanager épül), a <em>Hivatalos SDK-k</em> (a with client.messages.stream(...) minta eredete) és a <em>Kivételkezelés és egyedi hibaosztályok</em> (a következő lépés) tutorialok.</p>

<p class="topic-tagline" style="margin-top:12px;font-size:0.85em;opacity:0.75">* A with-garancia (az __exit__ mindig lefut, hiba esetén is) a Python hivatalos nyelvi specifikációjának dokumentált viselkedése.</p>
::::::
