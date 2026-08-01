---
page: python-decorators-ai
title: Dekorátorok a gyakorlatban
sidebar_groups:
  - Alapok
  - Beépített dekorátorok
  - Saját dekorátor
  - Projekt
hero:
  eyebrow: "Python az AI-hoz · Fejlesztői Tanulási Terv"
  title: "Dekorátorok — <em>a gyakorlatban</em>"
  lead: "A Hivatalos SDK-k tutorialban már írtál saját retry-logikát — ez a cikk megmutatja, hogyan csomagold ezt egy újrahasználható dekorátorba, plusz a leggyakoribb, AI-pipeline-oknál előkerülő beépített dekorátorokat: @lru_cache drága hívások gyorsítótárazásához, @timer méréshez."
  stats:
    - { val: "3", lbl: "beépített dekorátor, amit érdemes ismerni" }
    - { val: "@wraps", lbl: "amit sose felejts el" }
    - { val: "4", lbl: "Szakasz" }
    - { val: "1", lbl: "projekt: saját @log_api_call" }
footer:
  left: "AI Hub · Python az AI-hoz"
  right: "Dekorátorok · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#python-decorators-ai-0"><div class="tc-num">0. rész</div><div class="tc-name">Mi az a dekorátor, egy mondatban</div><div class="tc-desc">Függvény, ami függvényt vesz át és ad vissza.</div></a>
  <a class="toc-card" href="#python-decorators-ai-1"><div class="tc-num">1. rész</div><div class="tc-name">Beépített dekorátorok, amiket használj a sajátod helyett</div><div class="tc-desc">@lru_cache, @cached_property.</div></a>
  <a class="toc-card" href="#python-decorators-ai-2"><div class="tc-num">2. rész</div><div class="tc-name">Saját dekorátor: a @retry mintája</div><div class="tc-desc">Decorator factory, @wraps, és amit sose felejts el.</div></a>
  <a class="toc-card" href="#python-decorators-ai-3"><div class="tc-num">3. rész</div><div class="tc-name">Mini-projekt: @log_api_call</div><div class="tc-desc">Minden AI-hívás automatikus naplózása.</div></a>
</div>
::::::

:::::: section id=python-decorators-ai-0 num="00" heading="0. rész — Mi az a dekorátor, egy mondatban" nav="Mi az a dekorátor, egy mondatban" group="Alapok"

<p class="topic-tagline">Cél: gyors emlékeztető a mechanizmusra, mielőtt a gyakorlati mintákra térnénk.</p>

### A lényeg

::::: callout label="A dekorátor definíciója"
Egy **dekorátor** egy függvény, ami **átvesz egy másik függvényt**, és **egy új, kiegészített viselkedésű függvényt ad vissza** — a `@decorator_name` szintaxis csupán rövidítés a `func = decorator_name(func)` mintára. Ez teszi lehetővé, hogy naplózást, gyorsítótárazást, újrapróbálkozást adj hozzá egy függvényhez **anélkül, hogy módosítanád az eredeti kódját**.
:::::

```python
def simple_decorator(func):
    def wrapper(*args, **kwargs):
        print(f"Hívás előtt: {func.__name__}")
        result = func(*args, **kwargs)
        print(f"Hívás után: {func.__name__}")
        return result
    return wrapper

@simple_decorator
def ask_ai(prompt):
    return f"Válasz erre: {prompt}"
```

::::: callout label="Egy mondatban"
Ha megérted, hogy a dekorátor csak "függvényt vesz át, függvényt ad vissza", a naplózás, gyorsítótárazás és újrapróbálkozás mögötti minta már nem varázslat, hanem egy felismerhető, ismétlődő szerkezet.
:::::
::::::

:::::: section id=python-decorators-ai-1 num="01" heading="1. rész — Beépített dekorátorok, amiket használj a sajátod helyett" nav="Beépített dekorátorok" group="Beépített dekorátorok"

<p class="topic-tagline">Cél: ismerd meg a leggyakrabban hasznos, beépített dekorátorokat, mielőtt sajátot írnál.</p>

### @lru_cache: drága hívások gyorsítótárazása

::::: callout label="Mire való"
Az `@functools.lru_cache` **eltárolja** egy függvény korábbi hívásainak eredményét, és ha **ugyanazokkal a paraméterekkel** hívod meg újra, a tárolt eredményt adja vissza a tényleges (esetleg drága, lassú) számítás megismétlése helyett.
:::::

```python
from functools import lru_cache

@lru_cache(maxsize=128)
def get_embedding(text: str) -> tuple:
    """Ha ugyanazt a szöveget kéred le újra, nem hívja meg újra az AI-modellt."""
    # ... embedding API-hívás (lásd az Adatkezelés AI-pipeline-okhoz tutorialt)
    return tuple(embedding_vector)
```

::::: callout warning label="A korlát, amire figyelj"
Az `@lru_cache` csak **hashelhető** argumentumokkal működik — listát vagy dict-et **nem** fogadhatsz el paraméterként egy cache-elt függvényben; ha ilyen adatot kell átadnod, alakítsd tuple-lé vagy más hashelhető formává előbb.
:::::

::::: callout label="Egy mondatban"
Mielőtt sajátot írnál, mindig nézd meg, van-e már beépített megoldás — az `@lru_cache` robusztusabb (thread-safe, van cache-statisztikája a `.cache_info()`-val), mint egy kézzel írt gyorsítótár.
:::::
::::::

:::::: section id=python-decorators-ai-2 num="02" heading="2. rész — Saját dekorátor: a @retry mintája" nav="Saját dekorátor: a @retry mintája" group="Saját dekorátor"

<p class="topic-tagline">Cél: alakítsd át a Hivatalos SDK-k tutorialban látott retry-kódot egy újrahasználható dekorátorrá.</p>

### A decorator factory minta

::::: callout label="Miért kell egy extra réteg"
Ha a dekorátornak **paramétereket** kell fogadnia (pl. `@retry(max_attempts=3)`), egy plusz beágyazási szintre van szükség — ezt hívják **decorator factory**-nak: egy külső függvény (a konfigurációt fogadja) egy belső dekorátort ad vissza, ami a tényleges függvényt csomagolja be.
:::::

```python
import functools
import time

def retry(max_attempts: int = 3, delay: float = 1.0):
    """Decorator factory — a @retry(max_attempts=3) hívás ezt futtatja le."""
    def decorator(func):
        @functools.wraps(func)  # megőrzi a func nevét, docstringjét — lásd lent
        def wrapper(*args, **kwargs):
            last_exc = None
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exc = e
                    time.sleep(delay * (2 ** attempt))  # exponenciális backoff
            raise last_exc
        return wrapper
    return decorator

@retry(max_attempts=3, delay=1.0)
def call_ai_model(prompt):
    # ... a Hivatalos SDK-k tutorialban látott API-hívás
    ...
```

::::: callout danger label="A @functools.wraps, amit sose hagyj ki"
`@functools.wraps(func)` nélkül a dekorált függvény **elveszíti** az eredeti nevét, docstringjét és egyéb metaadatait — ez megtöri a hibakeresést, a dokumentáció-generálást, és bármi mást, ami ezekre a metaadatokra támaszkodik. Ez az egyetlen sor, amit **sose** szabad elfelejteni egy saját dekorátorban.
:::::

::::: callout label="Egy mondatban"
A decorator factory minta (három beágyazott szint: konfiguráció → dekorátor → wrapper) tűnhet bonyolultnak elsőre, de ez az egyetlen módja annak, hogy egy dekorátor **paramétereket** is fogadjon, mint a `max_attempts`.
:::::
::::::

:::::: section id=python-decorators-ai-3 num="03" heading="3. rész — Mini-projekt: @log_api_call" nav="Mini-projekt: @log_api_call" group="Projekt"

<p class="topic-tagline">Cél: építs egy saját dekorátort, ami minden AI-hívást automatikusan naplóz.</p>

### A feladat

::::: callout label="Amit építesz"
Egy `@log_api_call` dekorátort, ami **minden AI-hívás előtt és után** naplóz — mennyi ideig tartott, milyen paraméterekkel hívtad, és sikerült-e — anélkül, hogy a tényleges hívást végző kódot módosítanod kellene.
:::::

```python
import functools
import time
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai_calls")

def log_api_call(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        logger.info(f"AI-hívás indul: {func.__name__}")
        try:
            result = func(*args, **kwargs)
            elapsed = time.time() - start
            logger.info(f"AI-hívás sikeres: {func.__name__} ({elapsed:.2f}s)")
            return result
        except Exception as e:
            elapsed = time.time() - start
            logger.error(f"AI-hívás hibázott: {func.__name__} ({elapsed:.2f}s) — {e}")
            raise
    return wrapper

@log_api_call
@retry(max_attempts=3)
def ask(prompt: str) -> str:
    # ... a Hivatalos SDK-k tutorialban látott API-hívás
    ...
```

::::: callout warning label="A dekorátorok sorrendje számít"
A dekorátorok **alulról felfelé** alkalmazódnak — a fenti kódban a `@retry` fut le először (legközelebb a függvényhez), a `@log_api_call` **azt csomagolja be** — ez azt jelenti, hogy a naplózás **minden retry-próbálkozást** is látni fog, nem csak a végső sikert vagy hibát.
:::::

::::: callout label="Egy mondatban"
Ez a mini-projekt egyszerre mutatja meg a `@functools.wraps` fontosságát, a decorator factory mintát, és azt, hogyan **rétegezhetsz** több dekorátort egymásra egy production-szintű AI-hívás köré.
:::::
::::::

:::::: section id=python-decorators-ai-summary num=SUMMARY nav="Összefoglalás" sub=true group="Projekt"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0. rész"
A dekorátor lényege: függvény, ami átvesz egy másik függvényt, és kiegészített viselkedésűt ad vissza
::::
:::: card label="1. rész"
Beépített dekorátorok (@lru_cache) — miért érdemesebb ezeket használni saját megoldás írása helyett
::::
:::: card label="2. rész"
A decorator factory minta (@retry) — a @functools.wraps fontossága, ami sose maradhat ki
::::
:::: card label="3. rész"
Mini-projekt: @log_api_call, ami minden AI-hívást naplóz, rétegezve egy @retry-jal
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>Hivatalos SDK-k</em> (ahol a retry-logika eredetileg felmerült, most dekorátorrá alakítva), a <em>Generátorok és iterátorok</em> (a következő lépés a Python-rétegben) és a <em>Kontextuskezelők</em> (egy másik, kiegészítő módja a "csomagold be a viselkedést" elvnek) tutorialok.</p>
::::::
