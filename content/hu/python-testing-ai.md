---
page: python-testing-ai
title: Tesztelés AI-alkalmazásokhoz
sidebar_groups:
  - Alapok
  - Mock-olás
  - Mit tesztelj
  - Projekt
hero:
  eyebrow: "Python az AI-hoz · Fejlesztői Tanulási Terv"
  title: "Tesztelés — <em>AI-alkalmazásokhoz</em>"
  lead: "Egy AI-alkalmazás tesztelése más, mint egy sima API-kliensé — nem a modellt teszteled (az nem determinisztikus), hanem a köré épülő logikát: a prompt-sablonokat, a válasz-parszolást, a retry-viselkedést. Ez a cikk megmutatja, hogyan mock-old az AI-hívásokat, hogy gyors, megbízható teszteid legyenek."
  stats:
    - { val: "31%", lbl: "kevesebb production incidens mock-olt teszteléssel*" }
    - { val: "0", lbl: "valódi API-hívás a unit tesztekben" }
    - { val: "4", lbl: "Szakasz" }
    - { val: "1", lbl: "projekt: teljes teszt-készlet" }
footer:
  left: "AI Hub · Python az AI-hoz"
  right: "Tesztelés · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#python-testing-ai-0"><div class="tc-num">0. rész</div><div class="tc-name">Mit tesztelj, ha a modell nem determinisztikus</div><div class="tc-desc">A logikát teszteld, ne a modellt.</div></a>
  <a class="toc-card" href="#python-testing-ai-1"><div class="tc-num">1. rész</div><div class="tc-name">Az első mock-olt teszt</div><div class="tc-desc">unittest.mock és pytest-mock alapok.</div></a>
  <a class="toc-card" href="#python-testing-ai-2"><div class="tc-num">2. rész</div><div class="tc-name">Konkrét tesztelendő esetek</div><div class="tc-desc">Retry-logika, hibás válasz, eszközhívás.</div></a>
  <a class="toc-card" href="#python-testing-ai-3"><div class="tc-num">3. rész</div><div class="tc-name">Mini-projekt: teszt-készlet egy AI-klienshez</div><div class="tc-desc">Rakd össze az eddigi cikkek kódját tesztekkel.</div></a>
</div>
::::::

:::::: section id=python-testing-ai-0 num="00" heading="0. rész — Mit tesztelj, ha a modell nem determinisztikus" nav="Mit tesztelj, ha a modell nem determinisztikus" group="Alapok"

<p class="topic-tagline">Cél: érts meg egy alapvető különbséget az AI-alkalmazások és a hagyományos szoftverek tesztelése között.</p>

### A modellt nem tesztelheted, a logikát igen

::::: callout label="Amiért ez más, mint egy sima API-teszt"
A <em>Véletlenszerűség és mintavételezés</em> tutorialban látott okok miatt egy AI-modell **ugyanarra a promptra sem ad garantáltan ugyanazt a választ** — emiatt nem tesztelheted "helyesnek" magát a modell kimenetét. Amit viszont tesztelhetsz, és **kell** is: a **kódod**, ami a modell körül van — a prompt-összeállítás, a válasz-parszolás, a hibakezelés.
:::::

### Konkrét, dokumentált eredmény

::::: callout danger label="Miért éri meg ezt komolyan venni"
Azok a csapatok, amik tudatosan tesztelik az AI-komponenseiket (mock-olt modellhívásokkal), dokumentáltan **31%-kal kevesebb production incidenst** tapasztaltak az első 90 napban — ez konkrét, mérhető bizonyíték arra, hogy a "nem lehet tesztelni, mert a modell véletlenszerű" gondolkodás téves.
:::::

::::: callout label="Egy mondatban"
Az AI-alkalmazás tesztelésénél a modell egy **fekete doboz, amit szimulálsz** — a valódi teszt tárgya mindig a köré épített, determinisztikus kódod.
:::::
::::::

:::::: section id=python-testing-ai-1 num="01" heading="1. rész — Az első mock-olt teszt" nav="Az első mock-olt teszt" group="Mock-olás"

<p class="topic-tagline">Cél: írj egy első, valódi API-hívás nélküli tesztet a Hivatalos SDK-k tutorialban látott kódhoz.</p>

### A minta: `mocker.patch`

```python
import pytest
from unittest.mock import MagicMock

def test_ask_returns_text(mocker):
    # a valódi Anthropic klienst egy hamis (mock) objektummal helyettesítjük
    mock_client = mocker.patch("anthropic.Anthropic")
    mock_response = MagicMock()
    mock_response.content = [MagicMock(text="Ez egy teszt-válasz")]
    mock_client.return_value.messages.create.return_value = mock_response

    from my_ai_client import AnthropicClient
    client = AnthropicClient()
    result = client.ask("Bármilyen kérdés")

    assert result == "Ez egy teszt-válasz"
    mock_client.return_value.messages.create.assert_called_once()
```

::::: callout label="Mi történik itt valójában"
A `mocker.patch("anthropic.Anthropic")` **lecseréli** a valódi kliens-osztályt egy hamis objektumra, ami **előre beprogramozott** választ ad vissza — a teszt így **gyors** (nincs valódi hálózati hívás), **ingyenes** (nem fizetsz API-hívásért), és **determinisztikus** (mindig ugyanazt az eredményt adja).
:::::

::::: callout label="Egy mondatban"
A mock nem "csalás" — egy szándékos, tudatos helyettesítés, ami lehetővé teszi, hogy a kódod logikáját tesztelhesd anélkül, hogy a nem-determinisztikus, drága, lassú valódi modellre kellene támaszkodnod.
:::::
::::::

:::::: section id=python-testing-ai-2 num="02" heading="2. rész — Konkrét tesztelendő esetek" nav="Konkrét tesztelendő esetek" group="Mit tesztelj"

<p class="topic-tagline">Cél: ismerd meg a leggyakoribb, AI-specifikus eseteket, amiket érdemes tesztekkel lefedni.</p>

### Négy tipikus eset

::::: stack-grid
:::: card label="Prompt-sablon"
Ellenőrizd, hogy a változó-behelyettesítés a promptba **pontosan** azt a szöveget adja, amit vársz — mielőtt egyáltalán API-hívás történne.
::::
:::: card label="Retry-logika"
Szimulálj egy 429-es (rate limit) választ, és ellenőrizd, hogy a <em>Hivatalos SDK-k</em> tutorialban látott, vagy a <em>Dekorátorok a gyakorlatban</em> tutorialban épített `@retry` valóban visszavár és újrapróbál.
::::
:::: card label="Hibás válasz-struktúra"
Adj vissza egy váratlan, extra mezőt tartalmazó JSON-t, és ellenőrizd, hogy az <em>Adatkezelés AI-pipeline-okhoz</em> tutorialban látott parszoló ezt megfelelően kezeli, nem omlik össze.
::::
:::: card label="Eszközhívás (tool call)"
Ha a modell egy eszközhívást kér (lásd az <em>Agent architektúra</em> tutorialt), szimuláld ezt a választ, és ellenőrizd, hogy a kódod a megfelelő függvényt hívja meg a megfelelő paraméterekkel.
::::
:::::

```python
def test_retry_on_rate_limit(mocker):
    mock_client = mocker.patch("anthropic.Anthropic")
    # az első hívás 429-et dob, a második sikeres
    mock_client.return_value.messages.create.side_effect = [
        RateLimitError("Túl sok kérés"),
        MagicMock(content=[MagicMock(text="Végül sikerült")])
    ]

    result = call_with_retry(lambda: client.ask("kérdés"))
    assert result == "Végül sikerült"
    assert mock_client.return_value.messages.create.call_count == 2
```

::::: callout label="Egy mondatban"
Ezek a tesztek nem azt ellenőrzik, "okos-e" a modell — hanem hogy a **te kódod** helyesen viselkedik-e a modell különböző, szimulált reakcióira.
:::::
::::::

:::::: section id=python-testing-ai-3 num="03" heading="3. rész — Mini-projekt: teszt-készlet egy AI-klienshez" nav="Mini-projekt: teszt-készlet" group="Projekt"

<p class="topic-tagline">Cél: rakj össze egy kis, de teljes teszt-készletet az eddigi Python-cikkek kódjához.</p>

### A feladat

::::: callout label="Amit építesz"
Egy `test_ai_client.py` fájlt, ami az <em>Osztályok és AI-kliensek</em> tutorialban épített `UnifiedChatClient`-hez ír 3 tesztet: sikeres hívás, rate limit + retry, és érvénytelen modellnév kezelése.
:::::

```python
import pytest
from unittest.mock import MagicMock

class TestUnifiedChatClient:
    def test_successful_ask(self, mocker):
        mocker.patch("my_ai_client.AnthropicClient.ask", return_value="Válasz")
        client = UnifiedChatClient(ClientConfig(model="claude-sonnet-5"))
        assert client.ask("kérdés") == "Válasz"

    def test_unknown_model_raises(self):
        with pytest.raises(ValueError, match="Ismeretlen modell"):
            UnifiedChatClient(ClientConfig(model="valami-ismeretlen"))

    def test_retry_after_rate_limit(self, mocker):
        mock_ask = mocker.patch("my_ai_client.AnthropicClient.ask")
        mock_ask.side_effect = [RateLimitExceededError("anthropic"), "Sikeres válasz"]
        # ... a retry-logikát tesztelő rész
```

::::: callout warning label="Fedezettség vs. mélység"
Ne törekedj arra, hogy **minden** lehetséges bemenetet leteszteld — koncentrálj a **kritikus útvonalakra**: a leggyakoribb sikeres esetre, a leggyakoribb hibaesetekre (rate limit, hibás válasz), és a saját, egyedi hibaosztályaid (lásd a <em>Kivételkezelés</em> tutorialt) helyes dobására.
:::::

::::: callout label="Egy mondatban"
Ez a mini teszt-készlet bemutatja, hogyan fűzöd össze a Python-réteg korábbi cikkeiben tanultakat (osztályok, kivételek, retry) egy tesztelhető, megbízható egésszé — anélkül, hogy egyetlen valódi API-hívást is végrehajtanál a teszt futása közben.
:::::
::::::

:::::: section id=python-testing-ai-summary num=SUMMARY nav="Összefoglalás" sub=true group="Projekt"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0. rész"
Miért a modell KÖRÜLI kódot teszteled, nem magát a nem-determinisztikus modellt — konkrét, 31%-os incidens-csökkenési adattal
::::
:::: card label="1. rész"
Az első mock-olt teszt: mocker.patch, ami lecseréli a valódi klienst egy előre beprogramozott hamis válaszra
::::
:::: card label="2. rész"
Négy tipikus tesztelendő eset: prompt-sablon, retry-logika, hibás válasz-struktúra, eszközhívás
::::
:::: card label="3. rész"
Mini-projekt: egy teljes teszt-készlet a korábbi cikkekben épített UnifiedChatClient-hez
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>Hivatalos SDK-k</em> (a retry-logika, amit itt tesztelünk), az <em>Osztályok és AI-kliensek</em> (a UnifiedChatClient, amire a mini-projekt épül), a <em>Kivételkezelés</em> (a saját hibaosztályok, amiket a tesztek ellenőriznek) és a <em>Csomagolás és deployment</em> (a következő, utolsó lépés) tutorialok.</p>

<p class="topic-tagline" style="margin-top:12px;font-size:0.85em;opacity:0.75">* A 31%-os production incidens-csökkenési adat egy 2026-os, AI-alkalmazás tesztelési gyakorlatokat vizsgáló elemzésből származik — lásd a 0. részt a kontextusért.</p>
::::::
