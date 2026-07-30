---
page: python-data-handling
title: Adatkezelés AI-pipeline-okhoz
sidebar_groups:
  - JSON és AI-válaszok
  - Batch-elés
  - Strukturált kimenet
  - Referencia
hero:
  eyebrow: "Python az AI-hoz · Fejlesztői Tanulási Terv"
  title: "Adatkezelés — <em>AI-pipeline-okhoz</em>"
  lead: "Nem egy pandas-kurzus — csak amennyi adatkezelés egy tipikus AI-projektnél ténylegesen előkerül: hogyan parszolj (majdnem) JSON-t, ami a modell válaszában jön vissza, hogyan dolgozz fel nagy mennyiséget anélkül, hogy kifogyna a memóriád, és hogyan kényszerítsd ki, hogy a modell tényleg a kért formátumban válaszoljon."
  stats:
    - { val: "20%", lbl: "adatvesztés validálás nélkül*" }
    - { val: "3GB+", lbl: "fájlméret, ahol a batch-elés kötelező*" }
    - { val: "4", lbl: "Szakasz" }
    - { val: "1", lbl: "trükk a garantált JSON-hoz" }
footer:
  left: "AI Hub · Python az AI-hoz"
  right: "Adatkezelés · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#python-data-handling-0"><div class="tc-num">0. rész</div><div class="tc-name">Amikor a modell "majdnem" JSON-t ad vissza</div><div class="tc-desc">A leggyakoribb AI-specifikus adatprobléma.</div></a>
  <a class="toc-card" href="#python-data-handling-1"><div class="tc-num">1. rész</div><div class="tc-name">Validálás: ne bízz vakon a bemenetben</div><div class="tc-desc">Miért kell ellenőrizni, amit a modell (vagy egy API) visszaad.</div></a>
  <a class="toc-card" href="#python-data-handling-2"><div class="tc-num">2. rész</div><div class="tc-name">Nagy mennyiség: a batch-elés</div><div class="tc-desc">Miért nem tölthetsz be mindent egyszerre a memóriába.</div></a>
  <a class="toc-card" href="#python-data-handling-3"><div class="tc-num">3. rész</div><div class="tc-name">Kikényszerített strukturált kimenet</div><div class="tc-desc">Ne parszolj — kérj garantált formátumot.</div></a>
</div>
::::::

:::::: section id=python-data-handling-0 num="00" heading="0. rész — Amikor a modell \"majdnem\" JSON-t ad vissza" nav="Amikor a modell majdnem JSON-t ad vissza" group="JSON és AI-válaszok"

<p class="topic-tagline">Cél: érts meg egy jellemzően AI-specifikus adatkezelési problémát, amivel klasszikus API-knál ritkán találkozol.</p>

### A probléma, ami csak AI-válaszoknál jelentkezik

::::: callout warning label="Miért más ez, mint egy sima API-válasz"
Egy hagyományos REST API-tól kapott JSON **mindig szintaktikailag helyes** — a szerver garantálja ezt. Egy AI-modell válaszánál viszont, még ha JSON-t is kérsz, előfordulhat, hogy a modell **extra magyarázó szöveget** told a JSON elé/mögé, vagy egy apró szintaktikai hibát ejt (pl. záró vessző egy listában) — ez a <em>Véletlenszerűség és mintavételezés</em> tutorialban tárgyalt, statisztikai jellegű generálás egyenes következménye.
:::::

### Egy egyszerű, védekező parszolási minta

```python
import json
import re

def extract_json(text):
    """Kinyeri a JSON-t akkor is, ha a modell extra szöveget told köré."""
    # próbáld meg simán, hátha tiszta JSON
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    # keress egy { ... } vagy [ ... ] blokkot a szövegben
    match = re.search(r'[\{\[].*[\}\]]', text, re.DOTALL)
    if match:
        return json.loads(match.group())
    raise ValueError("Nem található érvényes JSON a válaszban")
```

::::: callout label="Egy mondatban"
Amíg egy hagyományos API-válaszban megbízhatsz a szintaktikai helyességben, egy AI-modell szöveges válaszánál mindig számolj azzal, hogy **defenzív parszolásra** lesz szükséged — vagy, ahogy a 3. részben látni fogod, kérd meg a modellt garantáltan struktúrált formában válaszolni.
:::::
::::::

:::::: section id=python-data-handling-1 num="01" heading="1. rész — Validálás: ne bízz vakon a bemenetben" nav="Validálás: ne bízz vakon a bemenetben" group="JSON és AI-válaszok"

<p class="topic-tagline">Cél: érts meg egy konkrét, dokumentált kockázatot, ha kihagyod a validálást.</p>

### Miért nem elég a sikeres parszolás

::::: callout danger label="A konkrét kockázat"
Validálás nélküli adatpipeline-oknál a **hibás vagy hiányzó adat aránya elérheti a 20%-ot** — egy sikeresen parszolt JSON **még nem jelenti**, hogy a benne lévő adat **helyes vagy teljes**. Egy AI-válasznál ez különösen fontos: a modell szintaktikailag helyes, de **tartalmilag hibás** (pl. hiányzó mező, rossz típusú érték) JSON-t is adhat.
:::::

```python
import pandas as pd

def load_and_validate(records):
    df = pd.DataFrame(records)
    # hibás dátumokat NaT-ra alakítja hiba dobása helyett
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    # hiányzó, kritikus mezőket alapértékkel tölti ki, nem hagyja üresen
    df["confidence_score"] = df["confidence_score"].fillna(0)
    return df
```

::::: callout label="Egy mondatban"
Egy sikeresen betöltött adatstruktúra nem jelenti azt, hogy az adat helyes — mindig érdemes explicit ellenőrizni a kritikus mezőket, mielőtt továbbadnád őket a pipeline következő lépésének.
:::::
::::::

:::::: section id=python-data-handling-2 num="02" heading="2. rész — Nagy mennyiség: a batch-elés" nav="Nagy mennyiség: a batch-elés" group="Batch-elés"

<p class="topic-tagline">Cél: érts meg egy gyakorlati korlátot, ami akkor jön elő, amikor a projekted "kinő" egy kis teszt-adathalmazt.</p>

### Miért nem tölthetsz be mindent egyszerre

::::: callout danger label="A konkrét méret-küszöb"
Egy **3 gigabájtnál nagyobb** fájl (pl. millió sornyi AI-generált vagy AI-feldolgozandó rekord) betöltése egyben, teljes egészében a memóriába, könnyen **memóriakifogyáshoz vagy órákig tartó feldolgozáshoz** vezethet — ilyenkor a **batch-elés** (darabokban való feldolgozás) nem opcionális optimalizálás, hanem gyakorlati szükségszerűség.
:::::

```python
import pandas as pd

def process_in_batches(filepath, batch_size=1000):
    results = []
    for chunk in pd.read_json(filepath, lines=True, chunksize=batch_size):
        # csak a releváns mezőket tartjuk meg, a többit eldobjuk
        processed = chunk[["id", "name", "status"]].copy()
        results.append(processed)
    return pd.concat(results, ignore_index=True)
```

::::: callout label="Ugyanez elve AI-hívásoknál is"
Ugyanez a batch-elési elv vonatkozik arra is, amikor **sok elemet küldesz feldolgozásra egy AI-modellnek** — a <em>Async Python az AI-hívásokhoz</em> tutorialban tárgyalt `Semaphore`-os korlátozás technikailag ugyanezt a "ne csinálj mindent egyszerre" elvet valósítja meg, csak API-hívásokra, nem fájl-feldolgozásra.
:::::

::::: callout label="Egy mondatban"
Ha egy projekted kinő egy kis, kényelmesen memóriába férő teszt-adathalmazt, a batch-elés (chunk-onkénti feldolgozás) az az egyszerű, de nélkülözhetetlen technika, ami megakadályozza, hogy a rendszered összeomoljon nagy volumennél.
:::::
::::::

:::::: section id=python-data-handling-3 num="03" heading="3. rész — Kikényszerített strukturált kimenet: ne parszolj, kérj garantált formátumot" nav="Kikényszerített strukturált kimenet" group="Strukturált kimenet"

<p class="topic-tagline">Cél: ismerj meg egy jobb megoldást a 0. részben tárgyalt "majdnem JSON" problémára.</p>

### A jobb megoldás: kényszerített séma

::::: callout label="Amit ez a technika old meg"
Ahelyett hogy a 0. részben látott, defenzív parszolásra hagyatkoznál, sok modern API kínál **kikényszerített strukturált kimenetet** (structured output / JSON mode) — ilyenkor a modell **garantáltan** egy általad megadott séma szerinti JSON-t ad vissza, nem "majdnem jó" szöveget.
:::::

```python
from pydantic import BaseModel

class DocumentSummary(BaseModel):
    title: str
    key_points: list[str]
    sentiment: str

# a kliens könyvtára a séma alapján validált, garantált struktúrájú
# választ ad vissza — nincs szükség a 0. részben látott defenzív parszolásra
response = client.messages.create(
    model="claude-sonnet-5",
    max_tokens=500,
    messages=[{"role": "user", "content": "Foglald össze ezt a dokumentumot..."}],
    # a konkrét paraméter neve és formátuma a mindenkori SDK-dokumentációtól függ
)
```

::::: callout warning label="Miért érdemes ezt preferálni a szabad szöveges parszolás helyett"
A kikényszerített strukturált kimenet **kiküszöböli** a 0. részben tárgyalt "extra szöveg a JSON körül" problémát, és **típusbiztos** validálást ad (pl. a `pydantic` könyvtárral) — ha a projekted megengedi, ez mindig jobb választás, mint utólag reguláris kifejezésekkel kibányászni a JSON-t egy szabad szöveges válaszból.
:::::

::::: callout label="Egy mondatban"
Ha csak teheted, ne a modell válaszának utólagos parszolására építs — kérj **kikényszerített, séma szerint validált** strukturált kimenetet, ami eleve garantálja a helyes formátumot.
:::::
::::::

:::::: section id=python-data-handling-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0. rész"
Az AI-válaszok "majdnem JSON" problémája, és egy egyszerű, védekező parszolási minta erre
::::
:::: card label="1. rész"
Miért kell validálni a sikeresen parszolt adatot is — a 20%-os hibaarány validálás nélkül
::::
:::: card label="2. rész"
Batch-elés: miért nem tölthetsz be mindent egyszerre a memóriába, konkrét méret-küszöbbel
::::
:::: card label="3. rész"
Kikényszerített strukturált kimenet (pydantic-alapú séma) mint jobb megoldás a szabad szöveges parszolás helyett
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>Hivatalos SDK-k</em> (az API-hívások, amiknek válaszát itt feldolgozzuk), az <em>Async Python az AI-hívásokhoz</em> (a Semaphore-os korlátozás, ami ugyanazt az elvet valósítja meg API-hívásokra) és a <em>Véletlenszerűség és mintavételezés</em> (miért nem garantált egy modell kimenetének szintaktikai helyessége) tutorialok.</p>

<p class="topic-tagline" style="margin-top:12px;font-size:0.85em;opacity:0.75">* A 20%-os adatvesztési arány és a 3GB-os fájlméret-küszöb 2026-os, gyakorlati adatpipeline-elemzésekből származik — lásd az 1. és 2. részt a kontextusért.</p>
::::::
