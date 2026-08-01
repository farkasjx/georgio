---
page: python-typing-pydantic
title: Típusannotáció és Pydantic
sidebar_groups:
  - Type hints
  - Pydantic
  - Haladó minták
  - Projekt
hero:
  eyebrow: "Python az AI-hoz · Fejlesztői Tanulási Terv"
  title: "Típusannotáció — <em>és Pydantic</em>"
  lead: "Az Adatkezelés AI-pipeline-okhoz tutorial már megemlítette a Pydantic-ot a strukturált kimenethez — ez a cikk elmélyíti: mi az a type hint, hogyan épül fel egy Pydantic-modell, és miért lett ez a de facto szabvány AI-válaszok validálására."
  stats:
    - { val: "5-50×", lbl: "Pydantic v2 sebesség-javulás*" }
    - { val: "1", lbl: "forrás az igazságnak (a típus)" }
    - { val: "4", lbl: "Szakasz" }
    - { val: "1", lbl: "projekt a végén" }
footer:
  left: "AI Hub · Python az AI-hoz"
  right: "Típusannotáció · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#python-typing-pydantic-0"><div class="tc-num">0. rész</div><div class="tc-name">Type hint alapok, gyorsan</div><div class="tc-desc">Optional, Union, list — a leggyakoribb minták.</div></a>
  <a class="toc-card" href="#python-typing-pydantic-1"><div class="tc-num">1. rész</div><div class="tc-name">Pydantic: futásidejű validálás</div><div class="tc-desc">A type hint nem elég önmagában — itt jön be a Pydantic.</div></a>
  <a class="toc-card" href="#python-typing-pydantic-2"><div class="tc-num">2. rész</div><div class="tc-name">Diszkriminált union-ok</div><div class="tc-desc">Amikor a modell többféle struktúrát adhat vissza.</div></a>
  <a class="toc-card" href="#python-typing-pydantic-3"><div class="tc-num">3. rész</div><div class="tc-name">Mini-projekt: strukturált kimenet-séma</div><div class="tc-desc">Egy valós, AI-válaszra illő Pydantic-modell.</div></a>
</div>
::::::

:::::: section id=python-typing-pydantic-0 num="00" heading="0. rész — Type hint alapok, gyorsan" nav="Type hint alapok, gyorsan" group="Type hints"

<p class="topic-tagline">Cél: frissítsd fel a leggyakoribb típusannotációs mintákat, amikre a Pydantic épül.</p>

### A leggyakoribb minták

```python
from typing import Optional, Union

def find_user(user_id: int) -> Optional[dict]:
    """Optional[X] ugyanaz, mint Union[X, None] — a függvény dict-et VAGY None-t ad vissza."""
    ...

def stringify(value: Union[int, float, str]) -> str:
    """Union[A, B, C] — az érték az egyik felsorolt típus lehet."""
    return str(value)

# Python 3.10+: rövidebb szintaxis a | jellel
def find_user_modern(user_id: int) -> dict | None:
    ...
```

::::: callout warning label="Melyik szintaxist válaszd"
Ha a projekted **Python 3.10-nél újabbat** céloz, a rövidebb `dict | None` forma olvashatóbb, mint az `Optional[dict]` — ha régebbi verziót is támogatnod kell, maradj az `Optional`/`Union` formánál.
:::::

::::: callout label="Egy mondatban"
A type hint önmagában **nem kényszerít ki semmit futásidőben** — csak dokumentáció és IDE-segítség; a tényleges, futásidejű ellenőrzést a Pydantic adja hozzá, amit a következő rész mutat be.
:::::
::::::

:::::: section id=python-typing-pydantic-1 num="01" heading="1. rész — Pydantic: futásidejű validálás" nav="Pydantic: futásidejű validálás" group="Pydantic"

<p class="topic-tagline">Cél: érts meg, miért nem elég a type hint önmagában, és mit ad hozzá a Pydantic.</p>

### A hiányzó darab

::::: callout danger label="Amit a sima type hint nem tud"
Ha egy függvényed `def process(age: int)`-et deklarál, de valaki egy `"harminc"` stringet ad át neki, Python **nem dob hibát** — a type hint csak jelzés, nem kikényszerített szabály. A <em>Modern Python Typing</em> kutatások szerint ez az egyik leggyakoribb forrása a rejtett, csak futásidőben (gyakran production-ben) felbukkanó hibáknak.
:::::

### A Pydantic BaseModel

```python
from pydantic import BaseModel
from datetime import datetime

class User(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool = True
    created_at: datetime = datetime.utcnow()
    bio: str | None = None

# a Pydantic automatikusan KONVERTÁL, ahol lehetséges
user = User(id="42", username="alice", email="alice@example.com")
print(user.id)  # 42 — int, nem "42" string!

# ha a konverzió nem lehetséges, azonnal, olvasható hibát kapsz
try:
    User(id="nem szám", username="bob", email="bob@example.com")
except Exception as e:
    print(e)  # részletes, mezőnkénti hibaüzenet
```

::::: callout label="Konkrét sebesség-adat"
A **Pydantic v2** egy Rust-alapú validációs maggal íródott újra, ami **5-50-szörös** sebesség-javulást hozott a korábbi, tisztán Python-os v1-hez képest — ez azt jelenti, hogy a validálás ma már nem jelent érdemi teljesítmény-terhet, még nagy volumenű AI-pipeline-oknál sem.
:::::

::::: callout label="Egy mondatban"
A Pydantic a type hintekre épül, de **tovább megy**: futásidőben ellenőriz, automatikusan konvertál, ahol biztonságos, és részletes hibát ad, amikor nem — pontosan ez a réteg hiányzik a sima type hintekből.
:::::
::::::

:::::: section id=python-typing-pydantic-2 num="02" heading="2. rész — Diszkriminált union-ok: amikor a modell többféle struktúrát adhat vissza" nav="Diszkriminált union-ok" group="Haladó minták"

<p class="topic-tagline">Cél: ismerj meg egy haladó mintát, ami kifejezetten AI-válaszok validálásánál hasznos.</p>

### A probléma: több lehetséges válasz-forma

::::: callout label="Egy tipikus helyzet"
Ha egy AI-ügynököt kérsz meg, hogy döntsön egy értesítés típusáról (email, SMS, push), a válasz **struktúrája más és más** attól függően, melyik típust választotta — egy email-válaszban `recipient`/`subject`/`body` mezők vannak, egy SMS-ben `phone_number`/`message`.
:::::

```python
from typing import Literal, Union
from pydantic import BaseModel, Field

class EmailNotification(BaseModel):
    type: Literal["email"] = "email"
    recipient: str
    subject: str
    body: str

class SMSNotification(BaseModel):
    type: Literal["sms"] = "sms"
    phone_number: str
    message: str

Notification = Union[EmailNotification, SMSNotification]

class NotificationRequest(BaseModel):
    # a 'type' mező alapján a Pydantic eldönti, melyik konkrét
    # modellt kell validálásra használnia
    notification: Notification = Field(..., discriminator="type")
```

::::: callout warning label="Miért gyorsabb, mint egy sima Union"
A **diszkriminált union** (a `discriminator="type"` paraméterrel) sokkal gyorsabb, mint egy sima `Union`, mert a Pydantic **közvetlenül** a megkülönböztető mező (itt: `type`) alapján választja ki a megfelelő modellt, ahelyett hogy sorban végigpróbálná mindegyiket.
:::::

::::: callout label="Egy mondatban"
A diszkriminált union pontosan azt a problémát oldja meg, amikor egy AI-ügynök (vagy egy tool-hívás) **többféle, előre definiált struktúra** közül választhat — ez a minta gyakori az <em>Agent architektúra</em> tutorialban tárgyalt eszközhívásoknál.
:::::
::::::

:::::: section id=python-typing-pydantic-3 num="03" heading="3. rész — Mini-projekt: strukturált kimenet-séma" nav="Mini-projekt: strukturált kimenet-séma" group="Projekt"

<p class="topic-tagline">Cél: építs egy valós, felhasználható Pydantic-sémát egy AI-válaszhoz.</p>

### A feladat

::::: callout label="Amit építesz"
Egy `DocumentAnalysis` Pydantic-modellt, ami egy dokumentum-elemző AI-hívás **garantált struktúrájú** válaszát reprezentálja — a modellnek egy sentiment-mezőt (korlátozott értékkészlettel), egy kulcsszó-listát és egy bizalmi pontszámot kell adnia.
:::::

```python
from pydantic import BaseModel, Field
from typing import Literal

class DocumentAnalysis(BaseModel):
    title: str
    sentiment: Literal["positive", "neutral", "negative"]
    keywords: list[str] = Field(min_length=1, max_length=10)
    confidence: float = Field(ge=0.0, le=1.0)

# az AI-válasz (a Hivatalos SDK-k tutorialban látott hívás eredménye)
# ezzel a sémával validálható és típusosan használható
raw_response = {
    "title": "Q3 pénzügyi jelentés",
    "sentiment": "positive",
    "keywords": ["növekedés", "bevétel", "terjeszkedés"],
    "confidence": 0.87
}
analysis = DocumentAnalysis(**raw_response)
```

::::: callout warning label="A Field() korlátok szerepe"
A `Field(min_length=1, max_length=10)` és a `Field(ge=0.0, le=1.0)` **explicit korlátokat** ad a mezőkhöz — ha az AI-válasz üres kulcsszó-listát vagy 1.5-ös bizalmi pontszámot adna vissza (ami hibás lenne), a Pydantic **azonnal** hibát dob, mielőtt a hibás adat továbbterjedne a rendszeredben.
:::::

::::: callout label="Egy mondatban"
Ez a séma pontosan azt a mintát valósítja meg, amit az <em>Adatkezelés AI-pipeline-okhoz</em> tutorial 3. részében ígértünk: kikényszerített, garantált struktúrájú AI-kimenet, típusbiztos validálással.
:::::
::::::

:::::: section id=python-typing-pydantic-summary num=SUMMARY nav="Összefoglalás" sub=true group="Projekt"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0. rész"
Type hint alapok: Optional, Union, és a Python 3.10+ rövidebb | szintaxis
::::
:::: card label="1. rész"
A Pydantic BaseModel — futásidejű validálás, automatikus konverzió, és a v2 5-50x sebesség-javulása
::::
:::: card label="2. rész"
Diszkriminált union-ok — amikor egy AI-válasz többféle struktúra közül választhat, gyors, mező-alapú megkülönböztetéssel
::::
:::: card label="3. rész"
Mini-projekt: egy DocumentAnalysis séma, Field()-korlátokkal, ami egy valós AI-választ validál
::::
:::::

<p class="topic-tagline">Kapcsolódó: az <em>Adatkezelés AI-pipeline-okhoz</em> (ahol a Pydantic először felmerült a strukturált kimenetnél), az <em>Agent architektúra</em> (a diszkriminált union-ok gyakorlati háttere eszközhívásoknál) és a <em>Dekorátorok a gyakorlatban</em> (a következő lépés) tutorialok.</p>

<p class="topic-tagline" style="margin-top:12px;font-size:0.85em;opacity:0.75">* A Pydantic v2 5-50×-es sebesség-javulási adat 2026-os, hivatalos fejlesztői dokumentációkból származik — lásd az 1. részt a kontextusért.</p>
::::::
