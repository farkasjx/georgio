---
page: python-ai-environment
title: Python-környezet AI-fejlesztéshez
sidebar_groups:
  - Alapok
  - Gyakorlat
  - Biztonság
  - Referencia
hero:
  eyebrow: "Python az AI-hoz · Fejlesztői Tanulási Terv"
  title: "Python-környezet — <em>AI-fejlesztéshez</em>"
  lead: "Nem Python-alapozó — feltételezzük, hogy tudsz Pythonban írni. Ez a cikk azt a néhány, kifejezetten AI-projekteknél előkerülő szokást mutatja meg, amit érdemes az első sortól kezdve helyesen csinálni: izolált környezet, API-kulcs-kezelés, és a leggyakoribb hiba, ami miatt egy kulcs kikerül a GitHube."
  stats:
    - { val: "1", lbl: "parancs a venv létrehozásához" }
    - { val: "0", lbl: "API-kulcs a kódban" }
    - { val: "4", lbl: "Szakasz" }
    - { val: "1", lbl: "sor, amit sose felejts el a .gitignore-ban" }
footer:
  left: "AI Hub · Python az AI-hoz"
  right: "Python-környezet · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#python-ai-environment-0"><div class="tc-num">0. rész</div><div class="tc-name">Virtuális környezet</div><div class="tc-desc">Miért ne telepíts semmit globálisan.</div></a>
  <a class="toc-card" href="#python-ai-environment-1"><div class="tc-num">1. rész</div><div class="tc-name">Függőségek kezelése</div><div class="tc-desc">requirements.txt, verziórögzítés.</div></a>
  <a class="toc-card" href="#python-ai-environment-2"><div class="tc-num">2. rész</div><div class="tc-name">API-kulcsok: a .env minta</div><div class="tc-desc">A leggyakoribb kezdő hiba, és hogyan kerüld el.</div></a>
  <a class="toc-card" href="#python-ai-environment-3"><div class="tc-num">3. rész</div><div class="tc-name">Amikor mégis kiszivárog egy kulcs</div><div class="tc-desc">Mit tegyél, ha megtörtént a baj.</div></a>
</div>
::::::

:::::: section id=python-ai-environment-0 num="00" heading="0. rész — Virtuális környezet: miért ne telepíts semmit globálisan" nav="Virtuális környezet" group="Alapok"

<p class="topic-tagline">Cél: érts meg egy alapszokást, ami minden következő Python-cikkben magától értetődőnek számít.</p>

### A probléma, amit a venv megold

::::: callout label="Miért kell izolált környezet"
Ha minden projektedhez ugyanazokat a Python-csomagokat telepíted **globálisan**, két projekted könnyen **ütköző verziót** igényelhet ugyanabból a könyvtárból — az egyik `openai==1.30`, a másik `openai==2.1`-et várna. Egy **virtuális környezet** (venv) minden projekthez saját, elszigetelt csomag-készletet ad, hogy ez sose okozzon konfliktust.
:::::

```bash
# Virtuális környezet létrehozása a .venv mappában
python3 -m venv .venv

# Aktiválás macOS/Linux alatt
source .venv/bin/activate

# Aktiválás Windows alatt
.venv\Scripts\activate

# Ellenőrzés: melyik Python-t használod éppen
python --version
```

::::: callout warning label="Honnan tudod, hogy aktív a környezet"
Ha a venv aktív, a terminál promptod elé egy `(.venv)` jelzés kerül — ha ezt nem látod, valószínűleg globálisan telepítenél csomagokat, ami a fenti problémához vezethet.
:::::

::::: callout label="Egy mondatban"
A virtuális környezet nem AI-specifikus trükk, hanem általános Python-jó gyakorlat — de mivel az AI-projektek gyakran sok, gyorsan változó SDK-t (openai, anthropic, transformers) használnak, itt különösen fontos, hogy a projektjeid ne zavarják egymást.
:::::
::::::

:::::: section id=python-ai-environment-1 num="01" heading="1. rész — Függőségek kezelése: requirements.txt és verziórögzítés" nav="Függőségek kezelése" group="Gyakorlat"

<p class="topic-tagline">Cél: értsd meg, hogyan dokumentáld és reprodukáld a projekted pontos csomag-készletét.</p>

### A requirements.txt fájl

::::: callout label="Mire való"
A `requirements.txt` egy szöveges fájl, ami felsorolja a projekted **összes függőségét és azok verzióját** — így egy másik gépen (vagy egy csapattársadnál) egyetlen paranccsal telepíthető ugyanaz a környezet.
:::::

```bash
# SDK telepítése az aktív venv-be
pip install openai anthropic python-dotenv

# Az éppen telepített csomagok exportálása
pip freeze > requirements.txt

# Egy új gépen: a pontos ugyanazon környezet visszaállítása
pip install -r requirements.txt
```

::::: callout warning label="Miért érdemes verziót rögzíteni, ne csak a csomag nevét"
Az AI-SDK-k (`openai`, `anthropic`) gyakran, akár havonta frissülnek, néha **API-t törő** (breaking) változtatásokkal. Egy `pip install openai` (verzió nélkül) ma működhet, de három hónap múlva egy új telepítésnél már más viselkedést kaphatsz. A `openai>=1.30.0,<2.0.0` típusú, **tartományhoz kötött** rögzítés a gyakorlati kompromisszum: enged kisebb frissítéseket, de a nagy, törő verzióváltást kizárja.
:::::

::::: callout label="Egy mondatban"
A `requirements.txt` a projekted "receptje" — enélkül minden új környezet-beállítás találgatás, vele pedig egy paranccsal reprodukálható.
:::::
::::::

:::::: section id=python-ai-environment-2 num="02" heading="2. rész — API-kulcsok: a .env minta" nav="API-kulcsok: a .env minta" group="Biztonság"

<p class="topic-tagline">Cél: sajátíts el egy mintát, ami megvéd a leggyakoribb, legkínosabb kezdő hibától.</p>

### Miért nem szabad a kulcsot közvetlenül a kódba írni

::::: callout danger label="A veszély, amit ez a minta kerül"
Ha egy API-kulcsot **közvetlenül a kódba** írsz, és a kódot feltöltöd GitHub-ra (akár egy publikus, akár egy később nyilvánossá váló privát repóba), a kulcs **véglegesen kompromittálódik** — még ha törlöd is a sort egy későbbi commitban, a git-history-ban megmarad, amíg valaki kifejezetten ki nem tisztítja onnan.
:::::

### A megoldás: `.env` fájl + `python-dotenv`

```python
# .env fájl (SOSE commitold ezt!)
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...
```

```python
# main.py
from dotenv import load_dotenv
import os

load_dotenv()  # beolvassa a .env fájlt, és environment-változóként elérhetővé teszi

api_key = os.environ["ANTHROPIC_API_KEY"]
```

::::: callout danger label="A legfontosabb sor, amit sose hagyj ki"
A `.env` fájlt **fel kell venni a `.gitignore`-ba**, mielőtt először commitolnál — ha ez elmarad, a `.env` fájl (benne a kulcsokkal) simán bekerül a repóba.
:::::

```bash
# .gitignore
.venv/
__pycache__/
.env
```

::::: callout label="A csapat-barát megoldás: .env.example"
Ahelyett hogy a csapattársaidnak külön elmagyaráznád, milyen kulcsok kellenek, hozz létre egy **`.env.example`** fájlt, ami tartalmazza a **kulcsneveket**, de **nem a valódi értékeket** — ezt már biztonságos commitolni, mert csak azt mutatja, mit kell kitölteni, nem magát a titkot.
:::::

```bash
# .env.example (ez commitolható)
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
```

::::: callout label="Egy mondatban"
A `.env` + `python-dotenv` + `.gitignore` hármas a legegyszerűbb, mégis a legtöbb kezdő hibát megelőző minta — ha ezt betartod, gyakorlatilag kizárt, hogy véletlenül publikálj egy API-kulcsot.
:::::
::::::

:::::: section id=python-ai-environment-3 num="03" heading="3. rész — Amikor mégis kiszivárog egy kulcs" nav="Amikor mégis kiszivárog egy kulcs" group="Referencia"

<p class="topic-tagline">Cél: adj egy konkrét, azonnali cselekvési tervet arra az esetre, ha a védelem ellenére megtörténik a baj.</p>

::::: callout danger label="Az azonnali teendő: ne a git-history törlésével kezdd"
Ha egy API-kulcs mégis kikerült (akár egy `.env` fájl véletlen commitolásával, akár másképp), az **első és legfontosabb lépés a kulcs azonnali visszavonása és lecserélése** a szolgáltató (OpenAI, Anthropic stb.) irányítópultján — a git-history utólagos tisztítása **másodlagos**, mert a kulcs onnantól kezdve, hogy nyilvánosan látható volt, kompromittáltnak számít, függetlenül attól, törlöd-e utólag a commitot.
:::::

::::: callout label="Automatizált védelem, amit érdemes bekapcsolni"
A GitHub **push protection** funkciója és külső eszközök (pl. **Gitleaks**, **TruffleHog**) automatikusan felismerik, ha egy commit API-kulcsot tartalmaz, és **blokkolják a push-t**, mielőtt az egyáltalán megjelenne a nyilvános repóban — ez egy hasznos, ingyenes, utolsó védelmi vonal az emberi hiba ellen.
:::::

::::: callout label="Egy mondatban"
A leggyorsabb reakció a legjobb védekezés — ha egy kulcs kikerül, ne a "hogyan tüntessem el a nyomokat" legyen az első gondolatod, hanem a "hogyan vonom vissza és cserélem le azonnal".
:::::
::::::

:::::: section id=python-ai-environment-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0. rész"
Virtuális környezet (venv) — miért ne telepíts semmit globálisan, hogyan hozz létre és aktiválj egyet
::::
:::: card label="1. rész"
A requirements.txt szerepe és miért érdemes verzió-tartományt rögzíteni, ne csak a csomag nevét
::::
:::: card label="2. rész"
A .env + python-dotenv + .gitignore minta, ami megvédi az API-kulcsaidat, plusz a csapat-barát .env.example
::::
:::: card label="3. rész"
Konkrét cselekvési terv, ha mégis kiszivárog egy kulcs — azonnali visszavonás, majd git-history tisztítás
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>Hivatalos SDK-k</em> (ahol ezt a .env mintát ténylegesen használni fogod egy API-hívásnál) és az <em>Async Python az AI-hívásokhoz</em> (a következő lépés, miután a környezeted készen áll) tutorialok.</p>
::::::
