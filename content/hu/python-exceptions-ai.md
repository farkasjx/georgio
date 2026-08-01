---
page: python-exceptions-ai
title: Kivételkezelés és egyedi hibaosztályok
sidebar_groups:
  - Alapok
  - Saját hierarchia
  - Gyakori csapda
  - Projekt
hero:
  eyebrow: "Python az AI-hoz · Fejlesztői Tanulási Terv"
  title: "Kivételkezelés — <em>és egyedi hibaosztályok</em>"
  lead: "A Hivatalos SDK-k tutorialban már megkülönböztetted a retriable és nem-retriable hibákat (RateLimitError, APIStatusError) — ez a cikk megmutatja, hogyan építs egy hasonlóan jól strukturált, saját hiba-hierarchiát egy AI-alkalmazáshoz."
  stats:
    - { val: "1", lbl: "bázis-osztály, sok altípus" }
    - { val: "0", lbl: "generic ValueError a domain-hibákra" }
    - { val: "4", lbl: "Szakasz" }
    - { val: "1", lbl: "csapda, amit sose kövess el" }
footer:
  left: "AI Hub · Python az AI-hoz"
  right: "Kivételkezelés · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#python-exceptions-ai-0"><div class="tc-num">0. rész</div><div class="tc-name">Miért nem elég a generikus ValueError</div><div class="tc-desc">A probléma, amit egy egyedi hibaosztály old meg.</div></a>
  <a class="toc-card" href="#python-exceptions-ai-1"><div class="tc-num">1. rész</div><div class="tc-name">Egy saját hiba-hierarchia felépítése</div><div class="tc-desc">Bázis-osztály, specifikus altípusok, kontextus-attribútumok.</div></a>
  <a class="toc-card" href="#python-exceptions-ai-2"><div class="tc-num">2. rész</div><div class="tc-name">A csapda: except Exception túl széles</div><div class="tc-desc">Amikor egy catch-all handler elnyel valamit, amit nem kellene.</div></a>
  <a class="toc-card" href="#python-exceptions-ai-3"><div class="tc-num">3. rész</div><div class="tc-name">Mini-projekt: AI-alkalmazás hiba-hierarchiája</div><div class="tc-desc">Egy teljes, felhasználható hierarchia.</div></a>
</div>
::::::

:::::: section id=python-exceptions-ai-0 num="00" heading="0. rész — Miért nem elég a generikus ValueError" nav="Miért nem elég a generikus ValueError" group="Alapok"

<p class="topic-tagline">Cél: érts meg egy konkrét problémát, amit egy egyedi hibaosztály old meg.</p>

### A probléma: minden hiba egyformán néz ki

::::: callout danger label="Amikor minden ValueError"
Ha a kódod mindenhol `raise ValueError("valami hiba történt")`-et dob, a hívó fél **nem tudja megkülönböztetni**, hogy a te alkalmazásod egy validálási hibáját kapta-e, vagy egy teljesen más, mélyebb könyvtárból (pl. a Pydantic-ból) származó `ValueError`-t.
:::::

```python
# Rossz: a hívó nem tudja, ez a te hibád, vagy a Pydantic-é
raise ValueError("A modell nem elérhető")

# Jobb: egyértelmű, saját, domain-specifikus hiba
class ModelUnavailableError(Exception):
    pass

raise ModelUnavailableError("A modell nem elérhető")
```

::::: callout label="Egy mondatban"
Egy egyedi kivétel-osztály nem "extra bonyolítás" — pontosan azt teszi lehetővé, hogy a hívó kód **pontosan tudja**, milyen típusú hiba történt, és ennek megfelelően (retry, fallback, felhasználói üzenet) tudjon reagálni.
:::::
::::::

:::::: section id=python-exceptions-ai-1 num="01" heading="1. rész — Egy saját hiba-hierarchia felépítése" nav="Egy saját hiba-hierarchia felépítése" group="Saját hierarchia"

<p class="topic-tagline">Cél: építs egy jól strukturált, bázis-osztályra épülő hierarchiát, ahogy a Hivatalos SDK-k tutorialban látott SDK-k is teszik.</p>

### A minta

::::: callout label="Bázis-osztály + specifikus altípusok"
Egy jó gyakorlat: definiálj egy **bázis kivételt** a teljes alkalmazásodhoz, majd **specifikus altípusokat**, amik ebből öröklődnek. Ez lehetővé teszi, hogy a hívó fél vagy a **bázis osztályt** fogja el (minden alkalmazás-specifikus hibára), vagy egy **konkrét altípust** (célzott kezeléshez).
:::::

```python
class AIAppError(Exception):
    """Bázis kivétel minden alkalmazás-specifikus hibához."""
    def __init__(self, message: str, error_code: str = "UNKNOWN"):
        self.error_code = error_code
        super().__init__(message)

class ModelUnavailableError(AIAppError):
    """A kért modell nem elérhető vagy nem támogatott."""
    def __init__(self, model_name: str):
        self.model_name = model_name
        super().__init__(f"A(z) '{model_name}' modell nem elérhető", error_code="MODEL_UNAVAILABLE")

class ResponseValidationError(AIAppError):
    """Az AI válasza nem felel meg a várt sémának."""
    def __init__(self, expected_schema: str, raw_response: str):
        self.expected_schema = expected_schema
        self.raw_response = raw_response
        super().__init__(f"A válasz nem illeszkedik a(z) '{expected_schema}' sémára", error_code="INVALID_RESPONSE")
```

::::: callout label="A hierarchia gyakorlati haszna"
```python
try:
    result = call_ai_model(prompt)
except ModelUnavailableError as e:
    # célzott kezelés: válts másik modellre
    result = call_fallback_model(prompt)
except AIAppError as e:
    # bármilyen más, alkalmazás-specifikus hiba: naplózd és jelezd
    logger.error(f"[{e.error_code}] {e}")
    raise
```
:::::

::::: callout label="Egy mondatban"
A bázis-osztály + altípusok minta pontosan azt teszi lehetővé, amit a <em>Hivatalos SDK-k</em> tutorialban a `RateLimitError`/`APIStatusError` megkülönböztetésnél láttál — csak most a **saját** alkalmazásod hibáira alkalmazva.
:::::
::::::

:::::: section id=python-exceptions-ai-2 num="02" heading="2. rész — A csapda: except Exception túl széles" nav="A csapda" group="Gyakori csapda"

<p class="topic-tagline">Cél: ismerj meg egy gyakori, veszélyes hibát a kivételkezelésben.</p>

### Miért veszélyes a túl széles `except`

::::: callout danger label="A konkrét veszély: KeyboardInterrupt elnyelése"
A Python kivétel-hierarchiájában a `BaseException` a **legfelső** szint, aminek altípusa a `KeyboardInterrupt` (Ctrl+C) és a `SystemExit` is. Egy `except BaseException: pass` (vagy egy túl agresszív hibakezelő) **elnyeli** ezeket is — ez azt jelenti, hogy a felhasználó **Ctrl+C-vel sem tudja leállítani** a programodat, mert a loop egyszerűen folytatódik.
:::::

```python
# VESZÉLYES: ez elnyeli a Ctrl+C-t is!
try:
    run_long_ai_pipeline()
except BaseException:
    pass

# HELYES: csak az Exception hierarchiát fogd el, a BaseException-t ne
try:
    run_long_ai_pipeline()
except Exception as e:
    logger.error(f"Pipeline hiba: {e}")
```

::::: callout warning label="Az ökölszabály"
Szinte **sosem** kell `except BaseException`-t írnod — az `except Exception` majdnem mindig elég, és nem nyeli el a rendszer-szintű jelzéseket (Ctrl+C, kilépés), amiket a felhasználónak/rendszernek joga van kezelni.
:::::

::::: callout label="Egy mondatban"
Egy túl széles `except` blokk nem "biztonságosabb" — **rejtett hibákat és irányíthatatlan viselkedést** okozhat, beleértve azt, hogy a programod ne reagáljon a leállítási kísérletre.
:::::
::::::

:::::: section id=python-exceptions-ai-3 num="03" heading="3. rész — Mini-projekt: AI-alkalmazás hiba-hierarchiája" nav="Mini-projekt" group="Projekt"

<p class="topic-tagline">Cél: építs egy teljes, felhasználható hiba-hierarchiát egy tipikus AI-alkalmazáshoz.</p>

### A feladat

::::: callout label="Amit építesz"
Egy 3 szintes hierarchiát: egy `AIAppError` bázis, alatta egy `ProviderError` (a Hivatalos SDK-k tutorialban látott API-hibákhoz kapcsolódó problémákra) és egy `ValidationError` (az Adatkezelés AI-pipeline-okhoz tutorialban látott, hibás AI-válaszokra), mindegyik saját, specifikus altípusokkal.
:::::

```python
class AIAppError(Exception):
    """Bázis kivétel az egész alkalmazáshoz."""
    pass

class ProviderError(AIAppError):
    """A mögöttes AI-provider hibázott."""
    pass

class RateLimitExceededError(ProviderError):
    def __init__(self, provider: str, retry_after: float | None = None):
        self.provider = provider
        self.retry_after = retry_after
        super().__init__(f"{provider}: rate limit túllépve")

class ProviderUnavailableError(ProviderError):
    def __init__(self, provider: str):
        self.provider = provider
        super().__init__(f"{provider} jelenleg nem elérhető")

class ValidationError(AIAppError):
    """A modell válasza nem felel meg a várt struktúrának."""
    pass

class SchemaValidationError(ValidationError):
    def __init__(self, missing_fields: list[str]):
        self.missing_fields = missing_fields
        super().__init__(f"Hiányzó mezők: {', '.join(missing_fields)}")
```

::::: callout warning label="Hogyan használnád a gyakorlatban"
```python
try:
    response = client.ask(prompt)
    parsed = DocumentAnalysis(**response)
except RateLimitExceededError:
    # csak a rate limit hibát kezeled külön, retry-jal
    time.sleep(5)
    response = client.ask(prompt)
except ProviderError as e:
    # bármilyen más provider-hiba
    logger.error(f"Provider hiba: {e}")
    raise
except ValidationError as e:
    # a válasz-struktúra hibás, más jellegű probléma
    logger.error(f"Validációs hiba: {e}")
    raise
```
:::::

::::: callout label="Egy mondatban"
Ez a hierarchia lehetővé teszi, hogy a hívó kód **pontosan olyan szinten** fogja el a hibát, amilyenre szüksége van — a legszűkebb (`RateLimitExceededError`) egészen a legtágabbig (`AIAppError`), anélkül hogy bármelyik szint elrejtené a másikat.
:::::
::::::

:::::: section id=python-exceptions-ai-summary num=SUMMARY nav="Összefoglalás" sub=true group="Projekt"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0. rész"
Miért nem elég egy generikus ValueError mindenhol — a hívó fél nem tudja megkülönböztetni a hibák eredetét
::::
:::: card label="1. rész"
A bázis-osztály + specifikus altípusok minta, kontextus-attribútumokkal (error_code, model_name stb.)
::::
:::: card label="2. rész"
A veszélyes csapda: except BaseException elnyeli a Ctrl+C-t is — mindig except Exception-t használj
::::
:::: card label="3. rész"
Mini-projekt: egy 3 szintes, valós AI-alkalmazás hiba-hierarchiája, célzott és tág kezeléssel egyaránt
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>Hivatalos SDK-k</em> (ahol a RateLimitError/APIStatusError megkülönböztetés eredetileg felmerült), az <em>Adatkezelés AI-pipeline-okhoz</em> (a válasz-validálás, amihez a ValidationError kapcsolódik) és a <em>Tesztelés Pythonban</em> (a következő lépés) tutorialok.</p>
::::::
