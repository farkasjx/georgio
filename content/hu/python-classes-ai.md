---
page: python-classes-ai
title: Osztályok és AI-kliensek
sidebar_groups:
  - Alapok
  - Közös interfész
  - Modern minták
  - Projekt
hero:
  eyebrow: "Python az AI-hoz · Fejlesztői Tanulási Terv"
  title: "Osztályok — <em>AI-kliensek gyakorlatban</em>"
  lead: "Feltételezzük, hogy tudod, mi az osztály és a példány — ez a cikk azt mutatja meg, hogyan használd ezt konkrétan: egy saját, több AI-providert (Anthropic, OpenAI, lokális Ollama) egységesen kezelő kliens-wrapper felépítését, öröklés és absztrakt interfész segítségével."
  stats:
    - { val: "1", lbl: "közös interfész, sok provider" }
    - { val: "ABC", lbl: "a minta, amit használunk" }
    - { val: "4", lbl: "Szakasz" }
    - { val: "1", lbl: "mini-projekt a végén" }
footer:
  left: "AI Hub · Python az AI-hoz"
  right: "Osztályok · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#python-classes-ai-0"><div class="tc-num">0. rész</div><div class="tc-name">Miért kell ez, ha már működik a sima SDK-hívás</div><div class="tc-desc">A probléma, amit egy wrapper-osztály old meg.</div></a>
  <a class="toc-card" href="#python-classes-ai-1"><div class="tc-num">1. rész</div><div class="tc-name">Közös interfész: absztrakt bázisosztály</div><div class="tc-desc">Egy szerződés, több megvalósítás.</div></a>
  <a class="toc-card" href="#python-classes-ai-2"><div class="tc-num">2. rész</div><div class="tc-name">Dataclass a konfigurációhoz</div><div class="tc-desc">Kevesebb boilerplate, típusos adat.</div></a>
  <a class="toc-card" href="#python-classes-ai-3"><div class="tc-num">3. rész</div><div class="tc-name">Mini-projekt: egységes chat-kliens</div><div class="tc-desc">Rakd össze a fentieket egy működő eszközzé.</div></a>
</div>
::::::

:::::: section id=python-classes-ai-0 num="00" heading="0. rész — Miért kell ez, ha már működik a sima SDK-hívás" nav="Miért kell ez" group="Alapok"

<p class="topic-tagline">Cél: érts meg egy valós problémát, amit egy wrapper-osztály old meg.</p>

### A probléma: több provider, más API

::::: callout label="A konkrét helyzet"
A <em>Hivatalos SDK-k</em> tutorialban az `anthropic` és az `openai` kliensek **különböző metódusneveket és válasz-struktúrákat** használnak — ha a kódod közvetlenül ezekre épít, egy provider-váltás (vagy egy A/B-teszt a kettő között) **mindenhol** módosítást igényel, ahol hívást csinálsz.
:::::

::::: callout label="A megoldás: egy közös interfész"
Egy **wrapper-osztály** elrejti a provider-specifikus részleteket egy egységes metódus mögé (pl. `client.ask("kérdés")`), és a te alkalmazásod kódja **sosem tudja meg**, éppen melyik providerrel beszél — csak a wrapper belsejében kell egyszer kezelni a különbséget.
:::::

::::: callout label="Egy mondatban"
Egy AI-kliens wrapper-osztály nem "felesleges absztrakció" — konkrétan azt oldja meg, hogy a providerváltás egyetlen fájlt érintsen, ne az egész kódbázist.
:::::
::::::

:::::: section id=python-classes-ai-1 num="01" heading="1. rész — Közös interfész: absztrakt bázisosztály" nav="Közös interfész" group="Közös interfész"

<p class="topic-tagline">Cél: építs egy szerződést (interfészt), amit minden konkrét provider-osztály be kell tartson.</p>

### Az ABC minta

::::: callout label="Mire való az ABC"
Egy **absztrakt bázisosztály** (Abstract Base Class, `ABC`) olyan metódusokat definiál, amiket **minden leszármazott osztálynak kötelező megvalósítania** — ha ezt elmulasztod, Python hibát dob már a példányosításnál, nem csak futásidőben, amikor a hiányzó metódust ténylegesen meghívnád.
:::::

```python
from abc import ABC, abstractmethod

class AIClient(ABC):
    """Közös szerződés minden konkrét AI-kliens számára."""

    @abstractmethod
    def ask(self, prompt: str) -> str:
        """Egy kérdést tesz fel a modellnek, és visszaadja a választ szövegként."""
        ...
```

```python
from anthropic import Anthropic

class AnthropicClient(AIClient):
    def __init__(self, model: str = "claude-sonnet-5"):
        self._client = Anthropic()
        self._model = model

    def ask(self, prompt: str) -> str:
        message = self._client.messages.create(
            model=self._model,
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}]
        )
        return message.content[0].text
```

```python
from openai import OpenAI

class OpenAIClient(AIClient):
    def __init__(self, model: str = "gpt-4o"):
        self._client = OpenAI()
        self._model = model

    def ask(self, prompt: str) -> str:
        response = self._client.chat.completions.create(
            model=self._model,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content
```

::::: callout warning label="A nyereség, amit ez ad"
Ezután a kódod, ami az `AIClient`-et használja, **sosem tudja**, konkrétan melyik providerrel beszél — csak annyit tud, hogy van egy `.ask()` metódusa. Egy `model_routing.py`-ban eldöntheted, melyik konkrét osztályt példányosítod, a többi kód változatlan marad.
:::::

::::: callout label="Egy mondatban"
Az absztrakt bázisosztály egy **szerződés**: bármelyik konkrét provider-osztály kompatibilis marad a hívó kóddal, amíg betartja ezt a szerződést — ez adja a <em>Model routing</em> tutorialban tárgyalt providerváltás gyakorlati alapját.
:::::
::::::

:::::: section id=python-classes-ai-2 num="02" heading="2. rész — Dataclass a konfigurációhoz: kevesebb boilerplate" nav="Dataclass a konfigurációhoz" group="Modern minták"

<p class="topic-tagline">Cél: ismerj meg egy modern, kevés kóddal járó mintát a konfigurációs adat kezelésére.</p>

### Miért ne sima osztályt írj kézzel

::::: callout label="Amit a @dataclass automatikusan megcsinál"
A `@dataclass` dekorátor **automatikusan legenerálja** az `__init__`, `__repr__` és `__eq__` metódusokat egy osztályhoz — nem kell kézzel megírnod ezt a rutinszerű kódot minden egyszerű, adatot tároló osztályhoz.
:::::

```python
from dataclasses import dataclass

@dataclass
class ClientConfig:
    model: str
    max_tokens: int = 1024
    temperature: float = 0.7

config = ClientConfig(model="claude-sonnet-5")
print(config)  # ClientConfig(model='claude-sonnet-5', max_tokens=1024, temperature=0.7)
```

::::: callout warning label="A frozen=True opció"
Ha a konfigurációdnak **nem szabadna megváltoznia** a létrehozása után (ami egy AI-kliens beállításainál gyakran elvárt), a `@dataclass(frozen=True)` **kikényszeríti** az immutabilitást — egy módosítási kísérlet hibát dob.
:::::

::::: callout label="Egy mondatban"
A `@dataclass` nem "extra trükk" — a mindennapi, adatot hordozó osztályok (konfigurációk, üzenet-objektumok) írásának modern, kevesebb hibalehetőséget hordozó módja.
:::::
::::::

:::::: section id=python-classes-ai-3 num="03" heading="3. rész — Mini-projekt: egységes chat-kliens" nav="Mini-projekt: egységes chat-kliens" group="Projekt"

<p class="topic-tagline">Cél: rakd össze az eddig tanultakat egy önálló, kis eszközzé.</p>

### A feladat

::::: callout label="Amit építesz"
Egy `UnifiedChatClient` osztályt, ami az 1. részben látott `AIClient` interfészre épül, `ClientConfig`-ot (2. rész) fogad paraméterként, és a konstruktorban **eldönti**, melyik konkrét provider-osztályt (`AnthropicClient` vagy `OpenAIClient`) példányosítsa a `config.model` neve alapján.
:::::

```python
class UnifiedChatClient:
    def __init__(self, config: ClientConfig):
        self._config = config
        if config.model.startswith("claude"):
            self._impl = AnthropicClient(model=config.model)
        elif config.model.startswith("gpt"):
            self._impl = OpenAIClient(model=config.model)
        else:
            raise ValueError(f"Ismeretlen modell: {config.model}")

    def ask(self, prompt: str) -> str:
        return self._impl.ask(prompt)

# Használat
client = UnifiedChatClient(ClientConfig(model="claude-sonnet-5"))
print(client.ask("Mi az a RAG, 1 mondatban?"))
```

::::: callout warning label="Ha van kedved bővíteni"
Adj hozzá egy negyedik ágat egy lokális Ollama-klienshez (lásd az <em>Ollama</em> tutorialt) — ekkor a `UnifiedChatClient` **három** különböző AI-forrás közt tud választani, ugyanazzal az egyszerű `.ask()` hívással.
:::::

::::: callout label="Egy mondatban"
Ez a kis eszköz gyakorlatban mutatja meg, amit az 1. rész elméletben leírt: az absztrakt interfész és a dataclass-alapú konfiguráció együtt egy **bővíthető, providerfüggetlen** AI-kliens alapját adja.
:::::
::::::

:::::: section id=python-classes-ai-summary num=SUMMARY nav="Összefoglalás" sub=true group="Projekt"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0. rész"
Miért kell egy wrapper-osztály, ha a sima SDK-hívás is működik — a providerváltás problémája
::::
:::: card label="1. rész"
Absztrakt bázisosztály (ABC) mint közös szerződés több konkrét AI-kliens implementációhoz
::::
:::: card label="2. rész"
A @dataclass dekorátor — automatikus __init__/__repr__/__eq__, és a frozen=True immutabilitás
::::
:::: card label="3. rész"
Mini-projekt: egy UnifiedChatClient, ami a fenti mintákat összefűzi egy bővíthető, providerfüggetlen eszközzé
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>Hivatalos SDK-k</em> (a konkrét provider-hívások, amiket ez a cikk egységesít), a <em>Model routing</em> (a providerválasztás elméleti háttere) és a <em>Típusannotáció és Pydantic</em> (a következő lépés a Python-rétegben) tutorialok.</p>
::::::
