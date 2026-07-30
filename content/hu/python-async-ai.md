---
page: python-async-ai
title: Async Python az AI-hívásokhoz
sidebar_groups:
  - Miért kell ez
  - A minta
  - Korlátok
  - Referencia
hero:
  eyebrow: "Python az AI-hoz · Fejlesztői Tanulási Terv"
  title: "Async Python — <em>az AI-hívásokhoz</em>"
  lead: "Ha egyszerre több AI-hívást indítasz (pl. 100 dokumentumot dolgozol fel egyenként), a szekvenciális, egyesével várakozó kód percekig futhat. Az async/await ugyanezt másodpercek alatt oldja meg — anélkül, hogy szálakkal vagy processzekkel kellene bajlódnod."
  stats:
    - { val: "3s → ~1s", lbl: "3 párhuzamos hívás ideje*" }
    - { val: "1", lbl: "szál, mégis sok feladat" }
    - { val: "4", lbl: "Szakasz" }
    - { val: "I/O-bound", lbl: "amire ez a legjobb" }
footer:
  left: "AI Hub · Python az AI-hoz"
  right: "Async Python · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#python-async-ai-0"><div class="tc-num">0. rész</div><div class="tc-name">Miért lassú a szekvenciális hívás</div><div class="tc-desc">Amikor a várakozás dominál, nem a számítás.</div></a>
  <a class="toc-card" href="#python-async-ai-1"><div class="tc-num">1. rész</div><div class="tc-name">Az async/await alapjai</div><div class="tc-desc">Coroutine, event loop — a legfontosabb fogalmak.</div></a>
  <a class="toc-card" href="#python-async-ai-2"><div class="tc-num">2. rész</div><div class="tc-name">Több AI-hívás párhuzamosan</div><div class="tc-desc">asyncio.gather a gyakorlatban.</div></a>
  <a class="toc-card" href="#python-async-ai-3"><div class="tc-num">3. rész</div><div class="tc-name">Mikor NE használj asyncot</div><div class="tc-desc">Az I/O-bound vs. CPU-bound megkülönböztetés.</div></a>
</div>
::::::

:::::: section id=python-async-ai-0 num="00" heading="0. rész — Miért lassú a szekvenciális hívás" nav="Miért lassú a szekvenciális hívás" group="Miért kell ez"

<p class="topic-tagline">Cél: érts meg egy konkrét, számokkal illusztrált problémát, amit az async megold.</p>

### A várakozás dominál, nem a számítás

::::: callout label="Egy egyszerű, illusztratív számítás"
Ha 3 AI-hívást **egyesével, szekvenciálisan** csinálsz, és mindegyik 1 másodpercig tart (a hálózati kör-utazás és a modell feldolgozási ideje miatt), a teljes folyamat **3 másodpercig** tart. Ha ugyanezt a 3 hívást **párhuzamosan** indítod, a teljes idő **kb. 1 másodpercre** csökken — mert a program nem az egyik hívás befejezését várja meg, mielőtt elindítaná a másikat.
:::::

::::: callout warning label="Ez az AI-API-hívások jellemző esete"
Az AI-API-hívások tipikusan **I/O-bound** műveletek — a program túlnyomó része **a hálózati választ várja**, nem tényleges számítást végez a saját gépén. Ez pontosan az a helyzet, ahol az async programozás a **legnagyobb nyereséget** adja.
:::::

::::: callout label="Egy mondatban"
Ha 100 dokumentumot kell egyenként egy AI-modellel feldolgoztatnod, a szekvenciális megközelítés perceket vehet igénybe — az async ugyanezt a valós idő töredéke alatt végzi el, mert a várakozási időket egymásra fedi, nem egymás után rakja.
:::::
::::::

:::::: section id=python-async-ai-1 num="01" heading="1. rész — Az async/await alapjai: coroutine, event loop" nav="Az async/await alapjai" group="A minta"

<p class="topic-tagline">Cél: ismerd meg a néhány kulcsfogalmat, ami nélkül az async kód olvashatatlan marad.</p>

### A három alapfogalom

::::: stack-grid
:::: card label="Coroutine"
Egy `async def`-fel definiált függvény — meghívva **nem fut le azonnal**, hanem egy "coroutine objektumot" ad vissza, amit **el kell "await-olni"**, hogy ténylegesen lefusson.
::::
:::: card label="Event loop"
A "karmester", ami eldönti, melyik coroutine fusson éppen — amikor egy coroutine egy `await`-nél **várakozik** valamire (pl. hálózati válaszra), az event loop **átvált** egy másik, közben futtatható feladatra.
::::
:::: card label="asyncio.gather"
A leggyakoribb módja annak, hogy **több coroutine-t egyszerre** indíts el, és megvárd, amíg mindegyik befejeződik — ez adja a párhuzamosítás tényleges nyereségét.
::::
:::::

```python
import asyncio

async def fetch_data(delay):
    await asyncio.sleep(delay)  # ez szimulálja a hálózati választ
    return f"kész {delay} másodperc után"

async def main():
    # szekvenciális: kb. 3 másodperc
    r1 = await fetch_data(1)
    r2 = await fetch_data(1)
    r3 = await fetch_data(1)

    # párhuzamos: kb. 1 másodperc
    r1, r2, r3 = await asyncio.gather(
        fetch_data(1), fetch_data(1), fetch_data(1)
    )

asyncio.run(main())
```

::::: callout label="Egy mondatban"
Az `async def` egy coroutine-t definiál, az `await` elindítja és megvárja, az `asyncio.gather` pedig sok coroutine-t indít **egyszerre**, kihasználva, hogy amíg az egyik a válaszra vár, a másik már futhat.
:::::
::::::

:::::: section id=python-async-ai-2 num="02" heading="2. rész — Több AI-hívás párhuzamosan a gyakorlatban" nav="Több AI-hívás párhuzamosan" group="A minta"

<p class="topic-tagline">Cél: alkalmazd az 1. rész mintáját egy valódi, AI-hívásokat tartalmazó feladatra.</p>

### Konkrét minta: sok dokumentum egyszerre

::::: callout label="Az async kliens"
Mindkét fő SDK (a <em>Hivatalos SDK-k</em> tutorialban megismert `anthropic` és `openai`) kínál **async verziót** a klienshez — ez a szinkron kliens szinte pontos mása, csak `await`-tel kell meghívni a metódusokat.
:::::

```python
import asyncio
from anthropic import AsyncAnthropic

client = AsyncAnthropic()

async def summarize(text):
    message = await client.messages.create(
        model="claude-sonnet-5",
        max_tokens=200,
        messages=[{"role": "user", "content": f"Foglald össze: {text}"}]
    )
    return message.content[0].text

async def main():
    documents = ["...dokumentum 1...", "...dokumentum 2...", "...dokumentum 3..."]
    summaries = await asyncio.gather(*[summarize(doc) for doc in documents])
    return summaries

asyncio.run(main())
```

::::: callout warning label="Vigyázz a rate limitekkel"
Ha **túl sok** hívást indítasz egyszerre (pl. 500 dokumentumot egy `asyncio.gather`-be), könnyen átlépheted a <em>Hivatalos SDK-k</em> tutorialban tárgyalt rate limiteket. Egy **`asyncio.Semaphore`**-ral korlátozhatod, hány hívás fusson egyszerre.
:::::

```python
sem = asyncio.Semaphore(10)  # max 10 párhuzamos hívás

async def summarize_limited(text):
    async with sem:
        return await summarize(text)
```

::::: callout label="Egy mondatban"
A gyakorlatban a párhuzamosítás nem azt jelenti, hogy "minden hívást egyszerre indíts" — egy `Semaphore`-ral kordában tartott, korlátozott párhuzamosság adja a legjobb egyensúlyt a sebesség és a rate limitek betartása között.
:::::
::::::

:::::: section id=python-async-ai-3 num="03" heading="3. rész — Mikor NE használj asyncot" nav="Mikor NE használj asyncot" group="Korlátok"

<p class="topic-tagline">Cél: érts meg egy fontos megkülönböztetést, ami eldönti, mikor van egyáltalán értelme az asyncnak.</p>

### I/O-bound vs. CPU-bound

::::: compare
::: good label="I/O-bound feladatok — itt segít az async"
Hálózati kérések (AI API-hívások), fájl-műveletek, adatbázis-lekérdezések — ezeknél a program idejének **nagy részét várakozással** tölti, amit az async hatékonyan kihasznál.
:::
::: bad label="CPU-bound feladatok — itt NEM segít"
Nehéz matematikai számítás, nagy adathalmaz helyi feldolgozása, egy modell **lokális** futtatása (nem API-hívás, hanem a te gépeden futó számítás) — ezeknél a Python **Global Interpreter Lock** (GIL) miatt az async **nem ad tényleges párhuzamosítást**; ehhez `multiprocessing` kell.
:::
:::::

::::: callout warning label="Egy gyakori félreértés"
Az async **nem varázsütés** minden lassú kódra — ha egy CPU-igényes feladatot (pl. nagy adathalmaz tisztítása pandas-szal) `async def`-fel csomagolsz be, az **nem lesz gyorsabb**, mert a probléma nem a várakozásban van, hanem a tényleges számításban.
:::::

::::: callout label="Egy mondatban"
Az AI-API-hívások szinte mindig I/O-bound feladatok, tehát az async pontosan a megfelelő eszköz rájuk — de ha a projekted lokális, számításigényes lépéseket is tartalmaz (pl. egy lokális modell futtatása vagy nagy adathalmaz-feldolgozás), azoknál más eszközre (multiprocessing) lesz szükséged.
:::::
::::::

:::::: section id=python-async-ai-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0. rész"
Miért lassú a szekvenciális AI-hívás — a várakozás dominál, nem a tényleges számítás (3s → ~1s párhuzamosan)
::::
:::: card label="1. rész"
A három alapfogalom: coroutine (async def), event loop, és az asyncio.gather mint a párhuzamosítás eszköze
::::
:::: card label="2. rész"
Konkrét minta sok AI-hívás párhuzamos indítására, Semaphore-ral kordában tartva a rate limitek miatt
::::
:::: card label="3. rész"
I/O-bound vs. CPU-bound megkülönböztetés — az async csak az előbbinél segít, a GIL miatt
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>Hivatalos SDK-k</em> (a szinkron kliens, aminek ez az async párja), a <em>Python-környezet AI-fejlesztéshez</em> (az alapkörnyezet, amire ez épül) és az <em>Adatkezelés AI-pipeline-okhoz</em> (a következő lépés a Python-rétegben) tutorialok.</p>

<p class="topic-tagline" style="margin-top:12px;font-size:0.85em;opacity:0.75">* A 3s → ~1s illusztratív időpélda egy 2026-os asyncio-oktatóanyagból származik, konkrét, egyenletes hívásidőt feltételezve — lásd a 0. részt a kontextusért.</p>
::::::
