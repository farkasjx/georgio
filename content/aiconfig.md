---
page: aiconfig
title: AI Config fájlok
sidebar_groups:
  - Témák
hero:
  eyebrow: "Skill · Persona · Config fájlok · AI-asszisztensek irányítása"
  title: "Ahogy egy AI-kódasszisztensnek <em>kontextust</em> adsz"
  lead: "A modern kódasszisztensek (Copilot, Claude Code, Cursor, Gemini CLI) nem üres lappal indulnak: repóba tett Markdown-fájlokból olvassák ki, mi a projekt, hogyan dolgozz, és mikor melyik tudást húzzák be. Ez az oldal a Pálya projekthez készült valódi konfigurációs csomagot bontja szét — fájltípusonként, a legfontosabb tudnivalókkal és tanuló feladatokkal."
  stats:
    - { val: "4", lbl: "Fájltípus" }
    - { val: "2", lbl: "Eszköz" }
    - { val: "1", lbl: "Közös alap" }
footer:
  left: "AI Hub · AI Config fájlok"
  right: "A Pálya projekt konfigurációja alapján · 2026"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#ac-overview"><div class="tc-num">&lt;00&gt;</div><div class="tc-name">Miért kellenek?</div><div class="tc-desc">Kontextus repóba írva, nem chatbe ragasztva.</div></a>
  <a class="toc-card" href="#ac-agents"><div class="tc-num">&lt;01&gt;</div><div class="tc-name">AGENTS.md — közös alap</div><div class="tc-desc">Az eszközfüggetlen szabvány.</div></a>
  <a class="toc-card" href="#ac-instructions"><div class="tc-num">&lt;02&gt;</div><div class="tc-name">Instructions fájlok</div><div class="tc-desc">Always-on szabályok, path-scope-pal.</div></a>
  <a class="toc-card" href="#ac-skills"><div class="tc-num">&lt;03&gt;</div><div class="tc-name">Skill fájlok</div><div class="tc-desc">Igény szerint behúzott tudás.</div></a>
  <a class="toc-card" href="#ac-persona"><div class="tc-num">&lt;04&gt;</div><div class="tc-name">Persona / agent fájlok</div><div class="tc-desc">Hívható szakértő szerepek.</div></a>
  <a class="toc-card" href="#ac-layout"><div class="tc-num">&lt;05&gt;</div><div class="tc-name">Mappaszerkezet</div><div class="tc-desc">Mi hova kerül és miért.</div></a>
</div>
::::::

:::::: section id=ac-overview num=00 nav="Miért kellenek?" group="Témák"
## Miért kellenek <em>konfigurációs fájlok</em>?

<p class="topic-tagline">A jó promptot nem minden munkamenet elején gépeled be újra — beírod a repóba, egyszer.</p>

### A probléma

Egy AI-kódasszisztens alapból nem tudja, mi a projekted, milyen a stack, mik a szabályaid. Ha ezt minden beszélgetés elején elmondod, az fárasztó, felejtős és eszközönként más. A megoldás: a kontextust **verziózott Markdown-fájlokba** teszed a repóba, és az asszisztens automatikusan beolvassa.

### A négy fájltípus egy pillantásra

::::: stack-grid
:::: card label="AGENTS.md" color="#7dd3fc"
**Közös alap.** Eszközfüggetlen. Mindig aktív. Ide kerül minden, ami minden eszközre igaz.
::::
:::: card label="Instructions" color="#6ee7b7"
**Always-on szabályok.** Repó-szintű vagy path-specifikus. Kötelező konvenciók, amiket mindig tartani kell.
::::
:::: card label="SKILL.md" color="#fcd34d"
**Igény szerinti tudás.** Csak akkor húzódik be, amikor épp releváns. Nem terheli feleslegesen a kontextust.
::::
:::: card label="*.agent.md" color="#f472b6"
**Hívható persona.** Egy szakértő szerep (pl. architekt), amit szándékosan hívsz elő nagyobb feladathoz.
::::
:::::

### A vezérelv: rétegzés

A cél, hogy az **„always on"** szabályok külön legyenek a **„csak amikor kell"** tudástól. A mindig aktív dolgok (mi a projekt, két adatmodell-aranyszabály) minden kérésnél ott vannak; a ritkán kellő, részletes tudás (pl. egy státuszmotor belső logikája) skillbe kerül, és csak akkor töltődik be, amikor épp azon dolgozol. Így a kontextusablak nem telik meg olyasmivel, ami az adott feladathoz nem kell.

::::: callout label="Kulcsgondolat"
Ne másold ugyanazt négy fájlba. Egy közös alap (`AGENTS.md`), fölötte vékony, eszköz-specifikus rétegek, amik _hivatkoznak_ az alapra, nem ismétlik.
:::::

::::: callout warning label="Tanuló feladat · bemelegítés"
Nyisd meg egy meglévő projekted repóját, és sorold fel fejben (vagy jegyzetbe): mi az a 3 dolog, amit _minden_ munkamenet elején elmondanál egy új fejlesztőnek? Ez lesz az `AGENTS.md` magja. Aztán: mi az a tudás, amit csak _néha_ mondanál el (egy konkrét komponens szabályai)? Az lesz egy skill.
:::::
::::::

:::::: section id=ac-agents num=01 nav="AGENTS.md — közös alap" group="Témák"
## <em>AGENTS.md</em> — a közös alap

<p class="topic-tagline">Egy fájl, amit a Copilot, a Claude Code, a Cursor és a Gemini CLI is beolvas.</p>

### Mi ez?

Az `AGENTS.md` egy **eszközfüggetlen, nyíltan elterjedt konvenció**: a repó gyökerébe kerül, és a legtöbb AI-kódasszisztens automatikusan figyelembe veszi. Mivel több eszköz is olvassa, ide kerül minden, ami _eszköztől függetlenül_ igaz a projektre.

### Mi kerüljön bele?

- **Mi a projekt.** Egy-két mondatos leírás — mit csinál, kinek.
- **Tech stack.** Nyelvek, keretrendszerek, adatbázis, futtatókörnyezet.
- **Adatmodell / domain aranyszabályai.** A Pálya esetében pl. a `parent_id` (hierarchia) és a `depends_on` (blokkolás) szigorú szétválasztása.
- **Alap build/teszt parancsok.** Hogyan indul, hogyan tesztelsz.
- **Elsődleges forrás.** Pl. hivatkozás a `docs/palya-fejlesztesi-specifikacio.docx`-ra.

### Mi NE kerüljön bele?

- Eszköz-specifikus dolgok (azok a `CLAUDE.md`-be / `copilot-instructions.md`-be valók).
- Ritkán kellő, részletes tudás (az skillbe való).
- Titkok, API-kulcsok (soha semmilyen config fájlba, ami verziózva van).

### Példa · AGENTS.md részlet (Pálya)

```markdown
# AGENTS.md — Pálya

Személyes projekt- és feladatkezelő webapp: naptár + todo +
függőség-tudatos projektkövetés egyben.

## Stack
- Frontend: Angular
- Backend: NestJS vagy Spring Boot
- DB: PostgreSQL · Reverse proxy: Caddy · Docker

## Adatmodell — két aranyszabály
1. `parent_id` = HIERARCHIA (al-elemek). Nem jelent blokkolást.
2. `depends_on` = BLOKKOLÁS. Ha a függőség nincs kész,
   az elem SOHA nem "végezhető most".

## Elsődleges forrás
A követelmények forrása: docs/palya-fejlesztesi-specifikacio.docx
(FR-01 … FR-52). Ütközésnél a spec dönt.
```

::::: callout success label="Tanuló feladat · AGENTS.md"
Írj egy 20–30 soros `AGENTS.md`-t egy saját (akár kicsi) projektedhez. Kötelező elemek: projektleírás, stack, egy „aranyszabály" a domainből, és egy indítási parancs. Utána tedd fel magadnak a kérdést: ha ezt átadnád egy junior fejlesztőnek, el tudná-e kezdeni a munkát _kérdés nélkül_? Ha nem, mi hiányzik?
:::::
::::::

:::::: section id=ac-instructions num=02 nav="Instructions fájlok" group="Témák"
## Instructions fájlok — <em>always-on</em> szabályok

<p class="topic-tagline">Amit mindig tartani kell — akár az egész repóra, akár csak bizonyos fájlokra.</p>

### Mi ez?

Az instructions fájlok **mindig aktív viselkedési szabályokat** tartalmaznak. A GitHub Copilotnál két szintjük van: a repó-szintű `.github/copilot-instructions.md` (minden kérésnél aktív), és a **path-specifikus** `*.instructions.md` fájlok, amik csak a megadott fájlmintára vonatkoznak.

### Repó-szintű vs path-specifikus

::::: compare
:::: good label="✓ Repó-szintű"
```
.github/
  copilot-instructions.md

→ MINDEN kérésnél aktív.
  Ide: általános
  kódstílus, commit
  konvenciók, nyelv.
```
::::
:::: good label="✓ Path-specifikus"
```
.github/instructions/
  backend.instructions.md
  frontend.instructions.md

→ CSAK a megadott
  path-ra (pl.
  backend/**/*.ts).
```
::::
:::::

### Path-specifikus fejléc (frontmatter)

A path-scope-ot a fájl tetején YAML frontmatterben adod meg egy `applyTo` mezővel:

```markdown
---
applyTo: "frontend/**/*.ts,frontend/**/*.html"
---

# Frontend szabályok (Angular)
- Standalone komponensek, NgModule nélkül.
- A backend adta státuszt jelenítsd meg — SOHA ne
  találj ki státuszt a kliensen.
- Színt/elrendezés-logikát ne másolj komponensek
  közé; emeld ki közös helyre.
```

::::: callout warning label="Vigyázz"
Az instructions „always on" — ezért **rövid és általános** maradjon. Ha minden apró domain-részletet ide teszel, feleslegesen tölti a kontextust minden kérésnél. A részletes, ritkán kellő tudás skillbe való, nem instructionbe.
:::::

::::: callout success label="Tanuló feladat · instructions"
Bontsd két csoportba a projekted szabályait: (1) amit _minden_ fájlnál tartani kell → repó-szintű; (2) amit csak a backend vagy csak a frontend fájloknál → path-specifikus. Írd meg mindkettőt, és a path-specifikushoz állítsd be helyesen az `applyTo` mintát. Teszt: hozz létre egy fájlt a scope-on kívül — a szabály tényleg nem vonatkozik rá?
:::::
::::::

:::::: section id=ac-skills num=03 nav="Skill fájlok" group="Témák"
## Skill fájlok — <em>igény szerinti</em> tudás

<p class="topic-tagline">Nem minden kérésnél kell tudni a státuszmotor részleteit — csak amikor épp azt írod.</p>

### Mi ez?

Egy **skill** egy mappa egyetlen `SKILL.md` fájllal (esetleg segédfájlokkal), ami egy _konkrét, körülhatárolt feladathoz_ ad mély tudást. A lényeg: **on-demand** töltődik be — az asszisztens akkor húzza be, amikor a leírása alapján úgy ítéli, hogy releváns. Így a részletek nem terhelik a kontextust, amikor épp máson dolgozol.

### Instruction vs skill — mi a különbség?

| Szempont | Instruction (always-on) | Skill (on-demand) |
|----------|------------------------|-------------------|
| Mikor aktív | Minden kérésnél | Csak amikor releváns |
| Tartalom | Rövid, általános szabály | Mély, részletes tudás egy témáról |
| Kontextus-költség | Állandó teher | Csak amikor betöltődik |
| Példa | „Standalone komponenseket használj" | „Így járd be a függőségi gráfot a státuszmotorban" |

### Egy SKILL.md felépítése

A skill legfontosabb része a **leírás (description)** a frontmatterben — ez alapján dönti el az asszisztens, hogy behúzza-e. Legyen konkrét, tele a triggerelő kulcsszavakkal (mikor van rá szükség).

```markdown
---
name: status-engine
description: >
  A Pálya státuszmotorja. Használd, amikor egy elem
  állapotát számolod (todo / blocked / done), amikor
  a függőségi gráfot járod be, vagy amikor a blokkolás
  feloldódását propagálod. A projekt szíve.
---

# Skill: Státuszmotor

## A szabály
Egy elem "végezhető most", ha minden `depends_on`
függősége `done`. Ha bármelyik nincs kész → "blocked".
Blokkolt elem SOHA nem kerül a "Végezhető most" listába.

## Propagáció
Ha egy elem `done` lesz, ellenőrizd az összes elemet,
ami rá `depends_on`-nal hivatkozik: ha most már minden
függőségük kész, todo-ra váltanak.
```

::::: callout label="Discovery — hol keresi az eszköz?"
A Copilot a `.github/skills/<név>/SKILL.md` alatt keresi őket, a Claude Code a `.claude/skills/<név>/SKILL.md` alatt. Ha mindkét eszközzel dolgozol, ugyanazt a skillt **mindkét helyre** tedd (pl. másolással vagy szimbolikus linkkel), hogy egyik se maradjon le róla.
:::::

::::: callout success label="Tanuló feladat · skill"
Válaszd ki a projekted legkényesebb, legtöbbször elrontott logikáját (nálad ez lehet a PSD2 IBAN-irány logika vagy egy EAM/SimplePay cancel-szabály). Írd meg skillként: egy éles `description`, ami leírja _mikor_ kell, és egy tömör törzs, ami leírja _hogyan_. Majd teszteld: kérj az asszisztenstől egy ehhez kapcsolódó feladatot, és nézd meg, behúzza-e a skillt magától.
:::::
::::::

:::::: section id=ac-persona num=04 nav="Persona / agent" group="Témák"
## Persona / agent fájlok — <em>hívható</em> szakértők

<p class="topic-tagline">Nem egysoros kiegészítéshez — hanem amikor átgondolt, indokolt munkát akarsz.</p>

### Mi ez?

Egy **persona** (Copilotnál `*.agent.md`, az OpenClaw-féle rendszereknél `SOUL.md` / `IDENTITY.md`) egy _szerepet_ ír le, amit szándékosan hívsz elő. Míg a skill _tudást_ ad, a persona _hozzáállást és munkamódszert_: ki ez a „valaki", hogyan gondolkodik, mit ad vissza.

### Skill vs persona

::::: compare
:::: good label="✓ Skill = tudás"
```
"Így számold a
 státuszt."

Egy konkrét feladat
mély how-to-ja.
Automatikusan behúzva.
```
::::
:::: good label="✓ Persona = szerep"
```
"Senior architekt vagy.
 Előbb tervezel, aztán
 kódolsz. Indokolsz."

Munkamódszer + hozzáállás.
Szándékosan hívva.
```
::::
:::::

### Mi kerüljön egy personába?

- **Ki ez.** Pl. „tapasztalt full-stack architekt, erőssége a gráf-alapú adatmodellezés".
- **Hogyan dolgozik.** Pl. nem ugrik azonnal kódra; előbb tervet javasol; szakaszok után jóváhagyást kér.
- **Mire figyel különösen.** A projekt kritikus pontjai (nálad: a státuszmotor helyessége).
- **Mit ad vissza mindig.** Pl. a szakasz elején mit fog csinálni, a végén mi készült el.

### Példa · persona részlet (Pálya architekt)

```markdown
---
name: palya-architect
description: >
  Senior full-stack architekt persona. Hívd meg
  tervezési döntéshez vagy nagyobb feature indításához
  — nem egysoros kódkiegészítéshez.
---

# Persona: Pálya architekt

## Hogyan dolgozol
- Nem ugrasz azonnal kódra. Előbb összefoglalod, mit
  értettél meg, és tervet javasolsz.
- Nagyobb szakaszok után megállsz, jóváhagyást kérsz.
- Minden nem triviális döntésnél elmondod, MIÉRT azt
  választottad és mi az alternatíva.

## Mire figyelsz
- parent_id (hierarchia) vs depends_on (blokkolás)
  szigorú szétválasztása.
- Ez MVP: az egyszerűség fontosabb a fölös absztrakciónál.
```

::::: callout label="Tanulást segítő trükk"
Ha a projekt egyben tanulási cél is, tedd a personába: „a fontos döntéseket 2-3 mondatban indokold, mintha egy junior fejlesztőnek magyaráznád". Így minden nagyobb lépésnél kapsz egy kis magyarázatot is — a kód mellé jár a _miért_.
:::::

::::: callout success label="Tanuló feladat · persona"
Írj egy personát ahhoz a szerephez, akire a projektedben leginkább szükséged lenne (pl. „QA mérnök, aki edge case-eket vadász" vagy „code reviewer, aki a biztonságra fókuszál"). Definiáld: hogyan dolgozik, mire figyel, mit ad vissza. Aztán hívd elő egy valós feladatnál, és vesd össze: másképp válaszol-e, mint persona nélkül?
:::::
::::::

:::::: section id=ac-layout num=05 nav="Mappaszerkezet" group="Témák"
## A teljes <em>mappaszerkezet</em>

<p class="topic-tagline">Mi hova kerül — két eszközre (Copilot + Claude Code) felkészítve.</p>

### A Pálya AI-config csomag

```text
AGENTS.md                            ← KÖZÖS alap (mindkét eszköz)
CLAUDE.md                            ← Claude Code / Cowork belépő
README-ai-config.md                  ← mi hova kerül és miért

.github/
  copilot-instructions.md            ← Copilot repó-szintű, mindig aktív
  instructions/
    backend.instructions.md          ← csak backend/**/*.ts
    frontend.instructions.md         ← csak frontend/**/*.{ts,html}
  skills/
    status-engine/SKILL.md           ← a státuszmotor (a projekt szíve)
    react-view-component/SKILL.md    ← új nézet-komponensekhez
  agents/
    palya-architect.agent.md         ← Copilot persona (architekt)

.claude/
  skills/
    status-engine/SKILL.md           ← ugyanaz, Claude Code discovery-hez
    react-view-component/SKILL.md
```

### A rétegek prioritási sorrendje (Copilot)

1. **Közös alap** — `AGENTS.md` (eszközfüggetlen).
2. **Repó-szintű instruction** — `copilot-instructions.md` (mindig aktív).
3. **Path-specifikus instruction** — `*.instructions.md` (csak a megadott fájlokra).
4. **On-demand skillek** — `skills/*/SKILL.md` (csak amikor kellenek).
5. **Hívható persona** — `agents/*.agent.md` (amikor szándékosan előhívod).

### A négy fájltípus — összefoglaló tábla

| Fájl | Szerep | Mikor aktív | Hivatkozik az alapra? |
|------|--------|-------------|----------------------|
| `AGENTS.md` | Közös alap | Mindig, minden eszközön | — (ez az alap) |
| `CLAUDE.md` / `copilot-instructions.md` | Eszköz-specifikus réteg | Mindig (az adott eszközön) | Igen — nem ismétel |
| `*.instructions.md` | Path-scope szabály | Csak a megadott fájlokra | Igen |
| `SKILL.md` | On-demand tudás | Csak amikor releváns | Áttételesen |
| `*.agent.md` | Hívható persona | Csak amikor előhívod | Igen |

::::: callout warning label="Két szabály, amit sose szegj meg"
**1.** Ne duplikáld a tartalmat — egy közös alap, fölötte hivatkozó rétegek. **2.** Titok, API-kulcs SOHA nem kerül verziózott config fájlba.
:::::

::::: callout success label="Tanuló feladat · összegzés (nagy)"
Állítsd össze a saját projekted teljes AI-config csomagját a fenti szerkezet mintájára: egy `AGENTS.md`, egy repó-szintű instruction, legalább egy path-specifikus instruction, egy skill és egy persona. Végül írj egy rövid `README-ai-config.md`-t, ami elmagyarázza, melyik fájl mit csinál — mintha egy csapattársnak adnád át. Ez a README a legjobb teszt: ha nem tudod egyszerűen leírni, valószínűleg túl bonyolítottad.
:::::
::::::
