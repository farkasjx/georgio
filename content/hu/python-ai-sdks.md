---
page: python-ai-sdks
title: A hivatalos SDK-k — OpenAI és Anthropic Pythonban
sidebar_groups:
  - Az első hívás
  - Streaming
  - Hibakezelés
  - Referencia
hero:
  eyebrow: "Python az AI-hoz · Fejlesztői Tanulási Terv"
  title: "A hivatalos SDK-k — <em>OpenAI és Anthropic Pythonban</em>"
  lead: "A Python-környezet cikk után itt az első valódi API-hívás. Ez a cikk a leggyakoribb mintákat mutatja meg: az első kérés, streaming válasz token-ről tokenre, és — a legfontosabb rész — a hibakezelés, ami nélkül az alkalmazásod egyetlen rate limit hibánál összeomlik."
  stats:
    - { val: "2", lbl: "beépített automatikus retry* " }
    - { val: "12% → 1,5%", lbl: "hibaarány retry-logikával*" }
    - { val: "5", lbl: "Szakasz" }
    - { val: "3", lbl: "rate limit dimenzió (RPM/ITPM/OTPM)" }
footer:
  left: "AI Hub · Python az AI-hoz"
  right: "SDK-k Pythonban · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#python-ai-sdks-0"><div class="tc-num">0. rész</div><div class="tc-name">Az első hívás</div><div class="tc-desc">Öt sor kód, ami már működik.</div></a>
  <a class="toc-card" href="#python-ai-sdks-1"><div class="tc-num">1. rész</div><div class="tc-name">Streaming: token-ről tokenre</div><div class="tc-desc">Miért ne várj a teljes válaszra.</div></a>
  <a class="toc-card" href="#python-ai-sdks-2"><div class="tc-num">2. rész</div><div class="tc-name">A hibák típusai</div><div class="tc-desc">Melyik hiba retriable, melyik nem.</div></a>
  <a class="toc-card" href="#python-ai-sdks-3"><div class="tc-num">3. rész</div><div class="tc-name">Retry-logika saját kézzel</div><div class="tc-desc">Miért ne bízz kizárólag a beépített retry-ra.</div></a>
  <a class="toc-card" href="#python-ai-sdks-4"><div class="tc-num">4. rész</div><div class="tc-name">Rate limitek: a három dimenzió</div><div class="tc-desc">Nem csak a kérésszám számít.</div></a>
</div>
::::::

:::::: section id=python-ai-sdks-0 num="00" heading="0. rész — Az első hívás: öt sor kód, ami már működik" nav="Az első hívás" group="Az első hívás"

<p class="topic-tagline">Cél: futtass le egy valódi API-hívást, a Python-környezet tutorialban megismert .env mintára építve.</p>

### Anthropic

```python
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()  # lásd a Python-környezet tutorialt

client = Anthropic()  # a kulcsot automatikusan az ANTHROPIC_API_KEY env-változóból olvassa

message = client.messages.create(
    model="claude-sonnet-5",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Foglald össze 2 mondatban, mi az a RAG."}]
)
print(message.content[0].text)
```

### OpenAI

```python
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI()  # az OPENAI_API_KEY env-változót olvassa

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Foglald össze 2 mondatban, mi az a RAG."}]
)
print(response.choices[0].message.content)
```

::::: callout label="Egy mondatban"
Mindkét SDK ugyanazt a mintát követi: kliens létrehozása (ami automatikusan megkeresi az API-kulcsot a környezeti változók között), majd egy `create()` hívás a promptoddal — a különbség csak a metódusnevekben és a válasz-objektum szerkezetében van.
:::::
::::::

:::::: section id=python-ai-sdks-1 num="01" heading="1. rész — Streaming: token-ről tokenre" nav="Streaming: token-ről tokenre" group="Streaming"

<p class="topic-tagline">Cél: értsd meg, miért éri meg a legtöbb felhasználói felületnél streaming választ kérni, nem egy blokkoló, teljes választ.</p>

### Miért számít ez a felhasználói élménynek

::::: callout label="A time-to-first-token előnye"
Egy **blokkoló** (nem streamelt) hívásnál a felhasználó a **teljes válasz** elkészültéig semmit nem lát — ez hosszabb válaszoknál kellemetlenül hosszú várakozást jelenthet. A **streaming** válasz esetén a szöveg **token-ről tokenre** érkezik, gyakran **200 ezredmásodpercen belüli** időn belül megjelenik az első darab — ez az, amiért a legtöbb chat-alapú AI-felület soha nem blokkoló hívást használ.
:::::

```python
with client.messages.stream(
    model="claude-sonnet-5",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Írj egy rövid verset a télről."}]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

::::: callout warning label="Amivel cserébe jár"
A streaming kezelése **komplexebb állapotkezelést** igényel, mint egy egyetlen, blokkoló válasz — a kliensoldalnak fokozatosan kell összeraknia a darabokat, és kezelnie kell, ha a stream **menet közben** szakad meg (pl. hálózati hiba).
:::::

::::: callout label="Egy mondatban"
Streaminget használj, ha a felhasználó **valós időben** figyeli a választ (chat-felület) — blokkoló hívást, ha a válasz **feldolgozásra** kerül tovább, mielőtt bárki látná (pl. egy háttérben futó elemző szkript).
:::::
::::::

:::::: section id=python-ai-sdks-2 num="02" heading="2. rész — A hibák típusai: melyik retriable, melyik nem" nav="A hibák típusai" group="Hibakezelés"

<p class="topic-tagline">Cél: ismerd meg a leggyakoribb hibakódokat, és hogy melyikre érdemes újrapróbálkozni, melyikre nem.</p>

### A hibák két nagy családja

::::: compare
::: good label="Retriable hibák — érdemes újrapróbálni"
**429** (rate limit — túl sok kérés), **500/503/529** (a szolgáltató szerver-oldali, átmeneti problémája) — ezeknél egy pillanatnyi várakozás után a kérés valószínűleg sikerülni fog.
:::
::: bad label="Nem-retriable hibák — kód-javítás kell"
**400** (rossz kérés-formátum), **401** (érvénytelen API-kulcs), **413** (a kérés túl nagy) — ezeknél az újrapróbálkozás **értelmetlen**, mert a hiba oka nem múlik el magától, a kódodban vagy a promptodban van a probléma.
:::
:::::

```python
from anthropic import APIError, RateLimitError, APIStatusError

try:
    message = client.messages.create(...)
except RateLimitError:
    print("Túl sok kérés — várj, majd próbáld újra.")
except APIStatusError as e:
    if e.status_code >= 500:
        print("Szerver-oldali hiba — érdemes újrapróbálni.")
    else:
        print(f"Kliens-oldali hiba ({e.status_code}) — ellenőrizd a kérést.")
```

::::: callout label="A jó hír: van beépített, alapszintű retry"
Mindkét SDK **automatikusan újrapróbálja** a retriable hibákat — alapértelmezetten **2-szer**, exponenciálisan növekvő várakozással a próbálkozások között. Ez sok esetprogramnak elég is lehet, kis volumennél.
:::::

::::: callout label="Egy mondatban"
A hibák nem egyformák — egy jól megírt kliens **különbséget tesz** aközött, hogy "próbáld újra egy pillanat múlva" vagy "állj meg, ez a kód/prompt hibás", és ennek megfelelően viselkedik.
:::::
::::::

:::::: section id=python-ai-sdks-3 num="03" heading="3. rész — Retry-logika saját kézzel: miért ne bízz kizárólag a beépítettre" nav="Retry-logika saját kézzel" group="Hibakezelés"

<p class="topic-tagline">Cél: érts meg, miért van szükség saját retry-logikára production-környezetben, még akkor is, ha az SDK maga is retriál.</p>

### A beépített retry korlátai

::::: callout warning label="Amit a beépített retry NEM tud"
Az SDK beépített retry-ja **nem tud** a saját, több-szolgáltatós fallback-stratégiádról (pl. ha az Anthropic túlterhelt, válts át egy másik providerre ugyanahhoz a modellhez), **nem logol** a te megfigyelő-rendszeredbe, és **nem mér** metrikákat a saját monitorozásodhoz.
:::::

### Egy konkrét, mért eredmény

::::: callout danger label="A számok, amik ezt indokolják"
Egy dokumentált production-eset szerint a hibaarány **12%-ról 1,5%-ra csökkent**, miután exponenciális backoff retry-logikát vezettek be — ez konkrét, mérhető bizonyíték arra, hogy a saját, jitter-rel (véletlenszerű, apró eltéréssel a várakozási időben) kiegészített retry-logika **jelentősen megbízhatóbbá** teszi a rendszert nagy terhelésnél.
:::::

```python
import time
import random

def call_with_retry(fn, max_retries=5):
    for attempt in range(max_retries):
        try:
            return fn()
        except (RateLimitError, APIStatusError) as e:
            if attempt == max_retries - 1:
                raise
            wait = (2 ** attempt) + random.uniform(0, 1)  # exponenciális + jitter
            time.sleep(wait)
```

::::: callout label="Miért kell a \"jitter\" (véletlen eltérés)"
Ha sok kliens **pontosan ugyanabban a pillanatban** próbálkozik újra (mert mindegyik ugyanazt a fix várakozási időt számolta ki), egy újabb terhelési csúcsot okoznak együtt — egy apró, véletlenszerű eltérés szétteríti ezeket az újrapróbálkozásokat időben.
:::::

::::: callout label="Egy mondatban"
A beépített retry jó kiindulópont kis projekteknél, de production-környezetben (ahol logolás, monitorozás és esetleg többszolgáltatós fallback is kell) érdemes saját, jitter-rel kiegészített retry-logikát írni.
:::::
::::::

:::::: section id=python-ai-sdks-4 num="04" heading="4. rész — Rate limitek: a három dimenzió" nav="Rate limitek: a három dimenzió" group="Referencia"

<p class="topic-tagline">Cél: érts meg egy gyakran alábecsült részletet — a rate limit nem csak a kérésszámra vonatkozik.</p>

### Három, egymástól független korlát

::::: callout label="RPM, ITPM, OTPM"
Az Anthropic API (és a legtöbb hasonló szolgáltató) **három külön dimenzióban** korlátoz: **RPM** (requests per minute — kérések száma percenként), **ITPM** (input tokens per minute — bemeneti tokenek percenként) és **OTPM** (output tokens per minute — kimeneti tokenek percenként). **Bármelyiket** átléped, 429-es hibát kapsz — nem elég csak a kérésszámra figyelni.
:::::

::::: callout warning label="Miért lepődnek meg ezen sokan"
Egy alkalmazás, ami **kevés, de nagyon hosszú** promptot küld (sok input token), simán elérheti az ITPM-korlátot **jóval a kérésszám-korlát** előtt — ha csak az RPM-et figyeled, ez a fajta rate limit meglepetésként érhet.
:::::

::::: callout label="Egy mondatban"
Ha rate limit hibát kapsz, ne feltételezd automatikusan, hogy "túl sok kérést küldtél" — lehet, hogy a **token-mennyiség** (nem a kérésszám) a valódi szűk keresztmetszet, és ez befolyásolja, hogyan optimalizálj (pl. rövidebb promptokkal, nem csak ritkább hívásokkal).
:::::
::::::

:::::: section id=python-ai-sdks-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0–1. rész"
Az első hívás mindkét SDK-val (Anthropic, OpenAI) · streaming válasz, és mikor éri meg blokkoló hívás helyett
::::
:::: card label="2. rész"
A hibák két családja: retriable (429, 5xx) vs. nem-retriable (400, 401) — és a beépített, alapszintű automatikus retry
::::
:::: card label="3. rész"
Saját retry-logika jitter-rel — konkrét, mért javulás (12% → 1,5% hibaarány) production-környezetben
::::
:::: card label="4. rész"
A rate limit három dimenziója (RPM, ITPM, OTPM) — miért nem elég csak a kérésszámra figyelni
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>Python-környezet AI-fejlesztéshez</em> (a .env minta, amit itt használunk az API-kulcsokhoz), az <em>Async Python az AI-hívásokhoz</em> (hogyan párhuzamosítsd ezeket a hívásokat) és a <em>Model routing</em> (a többszolgáltatós fallback-stratégia elméleti háttere) tutorialok.</p>

<p class="topic-tagline" style="margin-top:12px;font-size:0.85em;opacity:0.75">* A beépített retry-szám és a 12%→1,5%-os hibaarány-javulás 2026-os, publikus fejlesztői dokumentációkból és esettanulmányokból származik — lásd a 2–3. részt a kontextusért.</p>
::::::
