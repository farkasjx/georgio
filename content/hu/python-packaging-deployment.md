---
page: python-packaging-deployment
title: Csomagolás és deployment alapok
sidebar_groups:
  - pyproject.toml
  - Docker
  - Titkok kezelése
  - Projekt
hero:
  eyebrow: "Python az AI-hoz · Fejlesztői Tanulási Terv"
  title: "Csomagolás és <em>deployment alapok</em>"
  lead: "A Python-környezet AI-fejlesztéshez tutorial a venv-nél és a requirements.txt-nél maradt — ez a záró cikk azt mutatja meg, hogyan csomagold a projekted egy modern pyproject.toml-lal, és hogyan konténerezd Docker-rel, hogy ugyanaz fusson a gépeden, mint éles környezetben."
  stats:
    - { val: "1", lbl: "fájl minden konfigurációnak (pyproject.toml)" }
    - { val: "2", lbl: "Docker build-fázis (multi-stage)" }
    - { val: "4", lbl: "Szakasz" }
    - { val: "1", lbl: "projekt: teljes konténerezett AI-app" }
footer:
  left: "AI Hub · Python az AI-hoz"
  right: "Csomagolás és deployment · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#python-packaging-deployment-0"><div class="tc-num">0. rész</div><div class="tc-name">pyproject.toml: a projekt "születési bizonyítványa"</div><div class="tc-desc">Egy fájl, ami mindent leír.</div></a>
  <a class="toc-card" href="#python-packaging-deployment-1"><div class="tc-num">1. rész</div><div class="tc-name">Docker: multi-stage build</div><div class="tc-desc">Miért ne kerüljön a fordító a végleges image-be.</div></a>
  <a class="toc-card" href="#python-packaging-deployment-2"><div class="tc-num">2. rész</div><div class="tc-name">Titkok Docker-környezetben</div><div class="tc-desc">A .env minta konténerben — mit szabad, mit nem.</div></a>
  <a class="toc-card" href="#python-packaging-deployment-3"><div class="tc-num">3. rész</div><div class="tc-name">Mini-projekt: konténerezett AI-alkalmazás</div><div class="tc-desc">Az összes korábbi cikk kódja, becsomagolva.</div></a>
</div>
::::::

:::::: section id=python-packaging-deployment-0 num="00" heading="0. rész — pyproject.toml: a projekt \"születési bizonyítványa\"" nav="pyproject.toml" group="pyproject.toml"

<p class="topic-tagline">Cél: ismerd meg a 2026-os egyértelmű szabványt a Python-projektek konfigurálására.</p>

### Egy fájl, minden metaadat

::::: callout label="Miért ez lett a szabvány"
A `pyproject.toml` 2026-ra a **teljes Python-csomagolási ökoszisztéma** egyértelmű, hivatalos szabványává vált — felváltja a korábbi `setup.py`/`setup.cfg` fájlokat, egyetlen, olvasható helyre gyűjtve a build-rendszer, a projekt-metaadatok és a függőségek leírását.
:::::

```toml
[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_meta"

[project]
name = "my-ai-app"
version = "1.0.0"
description = "Egy AI-alapú dokumentum-elemző alkalmazás"
requires-python = ">=3.11"
dependencies = [
    "anthropic>=0.30.0,<1.0.0",
    "pydantic>=2.0.0",
    "python-dotenv>=1.0.0",
]

[project.scripts]
my-ai-app = "my_ai_app.__main__:main"
```

::::: callout warning label="A src/ layout"
A `pyproject.toml`-lal együtt ajánlott a **`src/` mappastruktúra** (`src/my_ai_app/...`), ami nemcsak a Python-csomagolást teszi tisztábbá, hanem — ahogy a 3. részben látni fogod — a Docker-konténerben is egy **egyértelmű, konzisztens** mappanevet ad az alkalmazás-kódnak.
:::::

::::: callout label="Egy mondatban"
A `pyproject.toml` egyetlen helyen írja le, miből áll a projekted és mitől függ — ez a fájl az, amit egy másik gépen, vagy — ahogy a következő részben látod — egy Docker-konténerben is felhasználsz a pontosan ugyanolyan környezet felépítéséhez.
:::::
::::::

:::::: section id=python-packaging-deployment-1 num="01" heading="1. rész — Docker: multi-stage build" nav="Docker: multi-stage build" group="Docker"

<p class="topic-tagline">Cél: érts meg egy fontos technikát, ami kisebb, biztonságosabb Docker-image-eket ad.</p>

### Miért ne kerüljön minden egy image-be

::::: callout label="A probléma, amit a multi-stage build old meg"
Ha egyetlen Docker-fázisban telepíted a fordítókat, teszt-eszközöket **és** futtatod az alkalmazást, a végleges image **tele lesz** olyan eszközökkel, amikre futásidőben már nincs szükség — ez nagyobb image-méretet és nagyobb támadási felületet jelent.
:::::

```dockerfile
# ── 1. fázis: builder — itt telepítjük a függőségeket ──
FROM python:3.12-slim AS builder
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

# a requirements/pyproject.toml-t ELŐBB másoljuk, mint a kódot —
# így a Docker cache-elheti ezt a réteget, ha csak a kód változik
COPY pyproject.toml .
RUN pip install --no-cache-dir --break-system-packages .

# ── 2. fázis: runtime — csak a futáshoz szükséges, letisztult réteg ──
FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY src/ ./src/

CMD ["python", "-m", "src.my_ai_app"]
```

::::: callout warning label="A réteg-sorrend, ami gyorsítja a build-et"
Figyeld meg, hogy a `pyproject.toml` **előbb** kerül másolásra, és a függőségek telepítése **előbb** történik, mint a tényleges kód másolása — ha csak a kódodat módosítod (nem a függőségeket), a Docker **újrafelhasználja** a cache-elt függőség-réteget, drámaian felgyorsítva az újraépítést.
:::::

::::: callout label="Egy mondatban"
A multi-stage build lehetővé teszi, hogy a build-eszközök (fordítók, ideiglenes csomagok) **ne kerüljenek** a végleges, éles image-be — csak a ténylegesen futtatáshoz szükséges rétegek maradnak.
:::::
::::::

:::::: section id=python-packaging-deployment-2 num="02" heading="2. rész — Titkok Docker-környezetben" nav="Titkok Docker-környezetben" group="Titkok kezelése"

<p class="topic-tagline">Cél: kösd össze a Python-környezet AI-fejlesztéshez tutorialban tanult .env mintát a konténerezett világgal.</p>

### Mi változik, mi marad ugyanaz

::::: callout danger label="Amit sose csinálj"
**Sose** másold be a `.env` fájlt közvetlenül a Docker image-be egy `COPY .env .` paranccsal — ez pontosan ugyanaz a hiba, mint a <em>Python-környezet AI-fejlesztéshez</em> tutorialban tárgyalt "API-kulcs a kódban" probléma, csak most az image rétegeiben ragadna bent véglegesen.
:::::

::::: callout label="A helyes minta: környezeti változók futásidőben"
Az API-kulcsokat **futásidőben**, a konténer indításakor add át, ne build-időben:
:::::

```bash
# a .env fájl TARTALMA kerül át, maga a fájl NEM az image-be
docker run --env-file .env my-ai-app

# vagy egyenként:
docker run -e ANTHROPIC_API_KEY=sk-ant-... my-ai-app
```

::::: callout warning label="Multi-stage build és a titkok elszigetelése"
Az 1. részben látott multi-stage build egy további előnye: ha a build-fázis során **átmenetileg** szükséged lenne egy titokra (pl. egy privát csomag-registry jelszavára), a Docker `--mount=type=secret` funkciója biztosítja, hogy ez **sosem kerül be** egyetlen image-rétegbe sem — a `docker history` paranccsal sem deríthető ki utólag.
:::::

::::: callout label="Egy mondatban"
A `.env` + `python-dotenv` minta, amit a <em>Python-környezet AI-fejlesztéshez</em> tutorialban megismertél, konténerben **ugyanúgy** működik — csak a `.env` fájl helyett futásidejű `--env-file`/`-e` paraméterekkel adod át a titkokat, sosem build-időben másolva be őket.
:::::
::::::

:::::: section id=python-packaging-deployment-3 num="03" heading="3. rész — Mini-projekt: konténerezett AI-alkalmazás" nav="Mini-projekt: konténerezett AI-alkalmazás" group="Projekt"

<p class="topic-tagline">Cél: rakd össze a teljes Python-réteg tanultjait egy futtatható, konténerezett alkalmazássá.</p>

### A feladat

::::: callout label="Amit építesz"
Csomagold be a <em>Osztályok és AI-kliensek</em> tutorialban épített `UnifiedChatClient`-et egy teljes, Docker-konténerezett alkalmazásba — a `pyproject.toml` (0. rész), a multi-stage `Dockerfile` (1. rész) és a futásidejű titok-kezelés (2. rész) mindegyikét felhasználva.
:::::

```
my-ai-app/
├── pyproject.toml
├── Dockerfile
├── .dockerignore
├── .env.example
└── src/
    └── my_ai_app/
        ├── __init__.py
        ├── __main__.py
        ├── client.py       # a UnifiedChatClient (Osztályok és AI-kliensek)
        ├── config.py       # a ClientConfig (Osztályok és AI-kliensek)
        └── exceptions.py   # a hiba-hierarchia (Kivételkezelés)
```

```
# .dockerignore — ne kerüljön a build-kontextusba, ami nem kell
.venv/
__pycache__/
.env
tests/
.git/
```

::::: callout warning label="Az utolsó lépés: futtatás"
```bash
docker build -t my-ai-app .
docker run --env-file .env my-ai-app "Foglald össze a RAG lényegét 2 mondatban"
```
:::::

::::: callout label="Egy mondatban"
Ez a mini-projekt zárja le a teljes Python-réteget: a környezet-kezeléstől (első cikk) a csomagoláson és konténerezésen át egy futtatható, éles-közeli AI-alkalmazásig — mindegyik korábbi cikk egy-egy darabja most egy összefüggő egésszé áll össze.
:::::
::::::

:::::: section id=python-packaging-deployment-summary num=SUMMARY nav="Összefoglalás" sub=true group="Projekt"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0. rész"
A pyproject.toml mint a 2026-os egyértelmű szabvány, és a src/ layout, ami Docker-ben is konzisztens marad
::::
:::: card label="1. rész"
A multi-stage Docker build — miért ne kerüljön a fordító a végleges image-be, és a réteg-cache gyorsítási technikája
::::
:::: card label="2. rész"
Titkok kezelése konténerben — sose COPY-zd be a .env-et, futásidőben add át --env-file-lal vagy --mount=type=secret-tel
::::
:::: card label="3. rész"
Mini-projekt: a teljes Python-réteg összes cikkének kódja egy futtatható, konténerezett AI-alkalmazásba csomagolva
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>Python-környezet AI-fejlesztéshez</em> (a .env minta, ami itt konténerbe kerül), az <em>Osztályok és AI-kliensek</em> (a UnifiedChatClient, amit ez a cikk becsomagol) és minden korábbi Python-cikk, aminek kódja itt egy futtatható egésszé áll össze.</p>
::::::
