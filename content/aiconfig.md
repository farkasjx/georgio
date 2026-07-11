---
page: aiconfig
title: AI Config fájlok
sidebar:
  - label: "Témák"
    links:
      - { href: "#ac-overview", text: "Miért kellenek?", num: "00" }
      - { href: "#ac-agents", text: "AGENTS.md — közös alap", num: "01" }
      - { href: "#ac-instructions", text: "Instructions fájlok", num: "02" }
      - { href: "#ac-skills", text: "Skill fájlok", num: "03" }
      - { href: "#ac-persona", text: "Persona / agent", num: "04" }
      - { href: "#ac-layout", text: "Mappaszerkezet", num: "05" }
---

<!-- MIGRÁLÁSI ÁLLAPOT: raw (az eredeti HTML 1:1).
     Fokozatosan bontsd ::: blokkokra a prompting.md mintájára. -->

::: raw

      <div class="page-hero">
        <div class="hero-eyebrow">Skill · Persona · Config fájlok · AI-asszisztensek irányítása</div>
        <h1>Ahogy egy AI-kódasszisztensnek <em>kontextust</em> adsz</h1>
        <p class="lead">
          A modern kódasszisztensek (Copilot, Claude Code, Cursor, Gemini CLI) nem üres lappal indulnak:
          repóba tett Markdown-fájlokból olvassák ki, mi a projekt, hogyan dolgozz, és mikor melyik
          tudást húzzák be. Ez az oldal a Pálya projekthez készült valódi konfigurációs csomagot bontja szét —
          fájltípusonként, a legfontosabb tudnivalókkal és tanuló feladatokkal.
        </p>
        <div class="hero-stats">
          <div class="hero-stat"><span class="val">4</span><span class="lbl">Fájltípus</span></div>
          <div class="hero-stat"><span class="val">2</span><span class="lbl">Eszköz</span></div>
          <div class="hero-stat"><span class="val">1</span><span class="lbl">Közös alap</span></div>
        </div>

        <div class="toc-grid" style="margin-top:24px">
          <a class="toc-card" href="#ac-overview"><div class="tc-num">&lt;00&gt;</div><div class="tc-name">Miért kellenek?</div><div class="tc-desc">Kontextus repóba írva, nem chatbe ragasztva.</div></a>
          <a class="toc-card" href="#ac-agents"><div class="tc-num">&lt;01&gt;</div><div class="tc-name">AGENTS.md — közös alap</div><div class="tc-desc">Az eszközfüggetlen szabvány.</div></a>
          <a class="toc-card" href="#ac-instructions"><div class="tc-num">&lt;02&gt;</div><div class="tc-name">Instructions fájlok</div><div class="tc-desc">Always-on szabályok, path-scope-pal.</div></a>
          <a class="toc-card" href="#ac-skills"><div class="tc-num">&lt;03&gt;</div><div class="tc-name">Skill fájlok</div><div class="tc-desc">Igény szerint behúzott tudás.</div></a>
          <a class="toc-card" href="#ac-persona"><div class="tc-num">&lt;04&gt;</div><div class="tc-name">Persona / agent fájlok</div><div class="tc-desc">Hívható szakértő szerepek.</div></a>
          <a class="toc-card" href="#ac-layout"><div class="tc-num">&lt;05&gt;</div><div class="tc-name">Mappaszerkezet</div><div class="tc-desc">Mi hova kerül és miért.</div></a>
        </div>
      </div>

      <!-- 00 ÁTTEKINTÉS -->
      <section class="topic" id="ac-overview">
        <span class="topic-marker">&lt;00&gt; TOPIC</span>
        <h2>Miért kellenek <em>konfigurációs fájlok</em>?</h2>
        <p class="topic-tagline">A jó promptot nem minden munkamenet elején gépeled be újra — beírod a repóba, egyszer.</p>

        <h3>A probléma</h3>
        <p>Egy AI-kódasszisztens alapból nem tudja, mi a projekted, milyen a stack, mik a szabályaid. Ha ezt minden
        beszélgetés elején elmondod, az fárasztó, felejtős és eszközönként más. A megoldás: a kontextust
        <strong>verziózott Markdown-fájlokba</strong> teszed a repóba, és az asszisztens automatikusan beolvassa.</p>

        <h3>A négy fájltípus egy pillantásra</h3>
        <div class="stack-grid">
          <div class="stack-card">
            <div class="sc-label" style="color:#7dd3fc">AGENTS.md</div>
            <div class="sc-items"><strong style="color:var(--text)">Közös alap.</strong> Eszközfüggetlen. Mindig aktív. Ide kerül minden, ami minden eszközre igaz.</div>
          </div>
          <div class="stack-card">
            <div class="sc-label" style="color:#6ee7b7">Instructions</div>
            <div class="sc-items"><strong style="color:var(--text)">Always-on szabályok.</strong> Repó-szintű vagy path-specifikus. Kötelező konvenciók, amiket mindig tartani kell.</div>
          </div>
          <div class="stack-card">
            <div class="sc-label" style="color:#fcd34d">SKILL.md</div>
            <div class="sc-items"><strong style="color:var(--text)">Igény szerinti tudás.</strong> Csak akkor húzódik be, amikor épp releváns. Nem terheli feleslegesen a kontextust.</div>
          </div>
          <div class="stack-card">
            <div class="sc-label" style="color:#f472b6">*.agent.md</div>
            <div class="sc-items"><strong style="color:var(--text)">Hívható persona.</strong> Egy szakértő szerep (pl. architekt), amit szándékosan hívsz elő nagyobb feladathoz.</div>
          </div>
        </div>

        <h3>A vezérelv: rétegzés</h3>
        <p>A cél, hogy az <strong>„always on"</strong> szabályok külön legyenek a <strong>„csak amikor kell"</strong> tudástól.
        A mindig aktív dolgok (mi a projekt, két adatmodell-aranyszabály) minden kérésnél ott vannak; a ritkán kellő,
        részletes tudás (pl. egy státuszmotor belső logikája) skillbe kerül, és csak akkor töltődik be, amikor épp azon dolgozol.
        Így a kontextusablak nem telik meg olyasmivel, ami az adott feladathoz nem kell.</p>

        <div class="callout">
          <div class="callout-label">Kulcsgondolat</div>
          <p>Ne másold ugyanazt négy fájlba. Egy közös alap (<code>AGENTS.md</code>), fölötte vékony,
          eszköz-specifikus rétegek, amik <em>hivatkoznak</em> az alapra, nem ismétlik.</p>
        </div>

        <div class="callout warning">
          <div class="callout-label">Tanuló feladat · bemelegítés</div>
          <p>Nyisd meg egy meglévő projekted repóját, és sorold fel fejben (vagy jegyzetbe): mi az a 3 dolog,
          amit <em>minden</em> munkamenet elején elmondanál egy új fejlesztőnek? Ez lesz az <code>AGENTS.md</code> magja.
          Aztán: mi az a tudás, amit csak <em>néha</em> mondanál el (egy konkrét komponens szabályai)? Az lesz egy skill.</p>
        </div>
      </section>

      <!-- 01 AGENTS.md -->
      <section class="topic" id="ac-agents">
        <span class="topic-marker">&lt;01&gt; TOPIC</span>
        <h2><em>AGENTS.md</em> — a közös alap</h2>
        <p class="topic-tagline">Egy fájl, amit a Copilot, a Claude Code, a Cursor és a Gemini CLI is beolvas.</p>

        <h3>Mi ez?</h3>
        <p>Az <code>AGENTS.md</code> egy <strong>eszközfüggetlen, nyíltan elterjedt konvenció</strong>: a repó gyökerébe
        kerül, és a legtöbb AI-kódasszisztens automatikusan figyelembe veszi. Mivel több eszköz is olvassa,
        ide kerül minden, ami <em>eszköztől függetlenül</em> igaz a projektre.</p>

        <h3>Mi kerüljön bele?</h3>
        <ul>
          <li><strong>Mi a projekt.</strong> Egy-két mondatos leírás — mit csinál, kinek.</li>
          <li><strong>Tech stack.</strong> Nyelvek, keretrendszerek, adatbázis, futtatókörnyezet.</li>
          <li><strong>Adatmodell / domain aranyszabályai.</strong> A Pálya esetében pl. a <code>parent_id</code> (hierarchia) és a <code>depends_on</code> (blokkolás) szigorú szétválasztása.</li>
          <li><strong>Alap build/teszt parancsok.</strong> Hogyan indul, hogyan tesztelsz.</li>
          <li><strong>Elsődleges forrás.</strong> Pl. hivatkozás a <code>docs/palya-fejlesztesi-specifikacio.docx</code>-ra.</li>
        </ul>

        <h3>Mi NE kerüljön bele?</h3>
        <ul>
          <li>Eszköz-specifikus dolgok (azok a <code>CLAUDE.md</code>-be / <code>copilot-instructions.md</code>-be valók).</li>
          <li>Ritkán kellő, részletes tudás (az skillbe való).</li>
          <li>Titkok, API-kulcsok (soha semmilyen config fájlba, ami verziózva van).</li>
        </ul>

        <h3>Példa · AGENTS.md részlet (Pálya)</h3>
<pre data-lang="markdown"><code><span class="c"># AGENTS.md — Pálya</span>

Személyes projekt- és feladatkezelő webapp: naptár + todo +
függőség-tudatos projektkövetés egyben.

<span class="c">## Stack</span>
- Frontend: Angular
- Backend: NestJS vagy Spring Boot
- DB: PostgreSQL · Reverse proxy: Caddy · Docker

<span class="c">## Adatmodell — két aranyszabály</span>
1. `parent_id` = HIERARCHIA (al-elemek). Nem jelent blokkolást.
2. `depends_on` = BLOKKOLÁS. Ha a függőség nincs kész,
   az elem SOHA nem "végezhető most".

<span class="c">## Elsődleges forrás</span>
A követelmények forrása: docs/palya-fejlesztesi-specifikacio.docx
(FR-01 … FR-52). Ütközésnél a spec dönt.</code></pre>

        <div class="callout success">
          <div class="callout-label">Tanuló feladat · AGENTS.md</div>
          <p>Írj egy 20–30 soros <code>AGENTS.md</code>-t egy saját (akár kicsi) projektedhez. Kötelező elemek:
          projektleírás, stack, egy „aranyszabály" a domainből, és egy indítási parancs. Utána tedd fel magadnak
          a kérdést: ha ezt átadnád egy junior fejlesztőnek, el tudná-e kezdeni a munkát <em>kérdés nélkül</em>? Ha nem, mi hiányzik?</p>
        </div>
      </section>

      <!-- 02 INSTRUCTIONS -->
      <section class="topic" id="ac-instructions">
        <span class="topic-marker">&lt;02&gt; TOPIC</span>
        <h2>Instructions fájlok — <em>always-on</em> szabályok</h2>
        <p class="topic-tagline">Amit mindig tartani kell — akár az egész repóra, akár csak bizonyos fájlokra.</p>

        <h3>Mi ez?</h3>
        <p>Az instructions fájlok <strong>mindig aktív viselkedési szabályokat</strong> tartalmaznak. A GitHub Copilotnál
        két szintjük van: a repó-szintű <code>.github/copilot-instructions.md</code> (minden kérésnél aktív), és a
        <strong>path-specifikus</strong> <code>*.instructions.md</code> fájlok, amik csak a megadott fájlmintára vonatkoznak.</p>

        <h3>Repó-szintű vs path-specifikus</h3>
        <div class="compare">
          <div class="compare-card good">
            <div class="label">✓ Repó-szintű</div>
<pre><code>.github/
  copilot-instructions.md

→ MINDEN kérésnél aktív.
  Ide: általános
  kódstílus, commit
  konvenciók, nyelv.</code></pre>
          </div>
          <div class="compare-card good">
            <div class="label">✓ Path-specifikus</div>
<pre><code>.github/instructions/
  backend.instructions.md
  frontend.instructions.md

→ CSAK a megadott
  path-ra (pl.
  backend/**/*.ts).</code></pre>
          </div>
        </div>

        <h3>Path-specifikus fejléc (frontmatter)</h3>
        <p>A path-scope-ot a fájl tetején YAML frontmatterben adod meg egy <code>applyTo</code> mezővel:</p>
<pre data-lang="markdown"><code><span class="c">---</span>
applyTo: "frontend/**/*.ts,frontend/**/*.html"
<span class="c">---</span>

<span class="c"># Frontend szabályok (Angular)</span>
- Standalone komponensek, NgModule nélkül.
- A backend adta státuszt jelenítsd meg — SOHA ne
  találj ki státuszt a kliensen.
- Színt/elrendezés-logikát ne másolj komponensek
  közé; emeld ki közös helyre.</code></pre>

        <div class="callout warning">
          <div class="callout-label">Vigyázz</div>
          <p>Az instructions „always on" — ezért <strong>rövid és általános</strong> maradjon. Ha minden apró
          domain-részletet ide teszel, feleslegesen tölti a kontextust minden kérésnél. A részletes, ritkán kellő
          tudás skillbe való, nem instructionbe.</p>
        </div>

        <div class="callout success">
          <div class="callout-label">Tanuló feladat · instructions</div>
          <p>Bontsd két csoportba a projekted szabályait: (1) amit <em>minden</em> fájlnál tartani kell → repó-szintű;
          (2) amit csak a backend vagy csak a frontend fájloknál → path-specifikus. Írd meg mindkettőt, és a
          path-specifikushoz állítsd be helyesen az <code>applyTo</code> mintát. Teszt: hozz létre egy fájlt a scope-on
          kívül — a szabály tényleg nem vonatkozik rá?</p>
        </div>
      </section>

      <!-- 03 SKILLS -->
      <section class="topic" id="ac-skills">
        <span class="topic-marker">&lt;03&gt; TOPIC</span>
        <h2>Skill fájlok — <em>igény szerinti</em> tudás</h2>
        <p class="topic-tagline">Nem minden kérésnél kell tudni a státuszmotor részleteit — csak amikor épp azt írod.</p>

        <h3>Mi ez?</h3>
        <p>Egy <strong>skill</strong> egy mappa egyetlen <code>SKILL.md</code> fájllal (esetleg segédfájlokkal), ami egy
        <em>konkrét, körülhatárolt feladathoz</em> ad mély tudást. A lényeg: <strong>on-demand</strong> töltődik be —
        az asszisztens akkor húzza be, amikor a leírása alapján úgy ítéli, hogy releváns. Így a részletek nem
        terhelik a kontextust, amikor épp máson dolgozol.</p>

        <h3>Instruction vs skill — mi a különbség?</h3>
        <table>
          <thead><tr><th>Szempont</th><th>Instruction (always-on)</th><th>Skill (on-demand)</th></tr></thead>
          <tbody>
            <tr><td>Mikor aktív</td><td>Minden kérésnél</td><td>Csak amikor releváns</td></tr>
            <tr><td>Tartalom</td><td>Rövid, általános szabály</td><td>Mély, részletes tudás egy témáról</td></tr>
            <tr><td>Kontextus-költség</td><td>Állandó teher</td><td>Csak amikor betöltődik</td></tr>
            <tr><td>Példa</td><td>„Standalone komponenseket használj"</td><td>„Így járd be a függőségi gráfot a státuszmotorban"</td></tr>
          </tbody>
        </table>

        <h3>Egy SKILL.md felépítése</h3>
        <p>A skill legfontosabb része a <strong>leírás (description)</strong> a frontmatterben — ez alapján dönti el az
        asszisztens, hogy behúzza-e. Legyen konkrét, tele a triggerelő kulcsszavakkal (mikor van rá szükség).</p>
<pre data-lang="markdown"><code><span class="c">---</span>
name: status-engine
description: &gt;
  A Pálya státuszmotorja. Használd, amikor egy elem
  állapotát számolod (todo / blocked / done), amikor
  a függőségi gráfot járod be, vagy amikor a blokkolás
  feloldódását propagálod. A projekt szíve.
<span class="c">---</span>

<span class="c"># Skill: Státuszmotor</span>

<span class="c">## A szabály</span>
Egy elem "végezhető most", ha minden `depends_on`
függősége `done`. Ha bármelyik nincs kész → "blocked".
Blokkolt elem SOHA nem kerül a "Végezhető most" listába.

<span class="c">## Propagáció</span>
Ha egy elem `done` lesz, ellenőrizd az összes elemet,
ami rá `depends_on`-nal hivatkozik: ha most már minden
függőségük kész, todo-ra váltanak.</code></pre>

        <div class="callout">
          <div class="callout-label">Discovery — hol keresi az eszköz?</div>
          <p>A Copilot a <code>.github/skills/&lt;név&gt;/SKILL.md</code> alatt keresi őket, a Claude Code a
          <code>.claude/skills/&lt;név&gt;/SKILL.md</code> alatt. Ha mindkét eszközzel dolgozol, ugyanazt a skillt
          <strong>mindkét helyre</strong> tedd (pl. másolással vagy szimbolikus linkkel), hogy egyik se maradjon le róla.</p>
        </div>

        <div class="callout success">
          <div class="callout-label">Tanuló feladat · skill</div>
          <p>Válaszd ki a projekted legkényesebb, legtöbbször elrontott logikáját (nálad ez lehet a PSD2 IBAN-irány
          logika vagy egy EAM/SimplePay cancel-szabály). Írd meg skillként: egy éles <code>description</code>, ami leírja
          <em>mikor</em> kell, és egy tömör törzs, ami leírja <em>hogyan</em>. Majd teszteld: kérj az asszisztenstől egy
          ehhez kapcsolódó feladatot, és nézd meg, behúzza-e a skillt magától.</p>
        </div>
      </section>

      <!-- 04 PERSONA -->
      <section class="topic" id="ac-persona">
        <span class="topic-marker">&lt;04&gt; TOPIC</span>
        <h2>Persona / agent fájlok — <em>hívható</em> szakértők</h2>
        <p class="topic-tagline">Nem egysoros kiegészítéshez — hanem amikor átgondolt, indokolt munkát akarsz.</p>

        <h3>Mi ez?</h3>
        <p>Egy <strong>persona</strong> (Copilotnál <code>*.agent.md</code>, az OpenClaw-féle rendszereknél
        <code>SOUL.md</code> / <code>IDENTITY.md</code>) egy <em>szerepet</em> ír le, amit szándékosan hívsz elő.
        Míg a skill <em>tudást</em> ad, a persona <em>hozzáállást és munkamódszert</em>: ki ez a „valaki", hogyan
        gondolkodik, mit ad vissza.</p>

        <h3>Skill vs persona</h3>
        <div class="compare">
          <div class="compare-card good">
            <div class="label">✓ Skill = tudás</div>
<pre><code>"Így számold a
 státuszt."

Egy konkrét feladat
mély how-to-ja.
Automatikusan behúzva.</code></pre>
          </div>
          <div class="compare-card good">
            <div class="label">✓ Persona = szerep</div>
<pre><code>"Senior architekt vagy.
 Előbb tervezel, aztán
 kódolsz. Indokolsz."

Munkamódszer + hozzáállás.
Szándékosan hívva.</code></pre>
          </div>
        </div>

        <h3>Mi kerüljön egy personába?</h3>
        <ul>
          <li><strong>Ki ez.</strong> Pl. „tapasztalt full-stack architekt, erőssége a gráf-alapú adatmodellezés".</li>
          <li><strong>Hogyan dolgozik.</strong> Pl. nem ugrik azonnal kódra; előbb tervet javasol; szakaszok után jóváhagyást kér.</li>
          <li><strong>Mire figyel különösen.</strong> A projekt kritikus pontjai (nálad: a státuszmotor helyessége).</li>
          <li><strong>Mit ad vissza mindig.</strong> Pl. a szakasz elején mit fog csinálni, a végén mi készült el.</li>
        </ul>

        <h3>Példa · persona részlet (Pálya architekt)</h3>
<pre data-lang="markdown"><code><span class="c">---</span>
name: palya-architect
description: &gt;
  Senior full-stack architekt persona. Hívd meg
  tervezési döntéshez vagy nagyobb feature indításához
  — nem egysoros kódkiegészítéshez.
<span class="c">---</span>

<span class="c"># Persona: Pálya architekt</span>

<span class="c">## Hogyan dolgozol</span>
- Nem ugrasz azonnal kódra. Előbb összefoglalod, mit
  értettél meg, és tervet javasolsz.
- Nagyobb szakaszok után megállsz, jóváhagyást kérsz.
- Minden nem triviális döntésnél elmondod, MIÉRT azt
  választottad és mi az alternatíva.

<span class="c">## Mire figyelsz</span>
- parent_id (hierarchia) vs depends_on (blokkolás)
  szigorú szétválasztása.
- Ez MVP: az egyszerűség fontosabb a fölös absztrakciónál.</code></pre>

        <div class="callout">
          <div class="callout-label">Tanulást segítő trükk</div>
          <p>Ha a projekt egyben tanulási cél is, tedd a personába: „a fontos döntéseket 2-3 mondatban indokold,
          mintha egy junior fejlesztőnek magyaráznád". Így minden nagyobb lépésnél kapsz egy kis magyarázatot is —
          a kód mellé jár a <em>miért</em>.</p>
        </div>

        <div class="callout success">
          <div class="callout-label">Tanuló feladat · persona</div>
          <p>Írj egy personát ahhoz a szerephez, akire a projektedben leginkább szükséged lenne (pl. „QA mérnök, aki
          edge case-eket vadász" vagy „code reviewer, aki a biztonságra fókuszál"). Definiáld: hogyan dolgozik, mire
          figyel, mit ad vissza. Aztán hívd elő egy valós feladatnál, és vesd össze: másképp válaszol-e, mint persona nélkül?</p>
        </div>
      </section>

      <!-- 05 MAPPASZERKEZET -->
      <section class="topic" id="ac-layout">
        <span class="topic-marker">&lt;05&gt; TOPIC</span>
        <h2>A teljes <em>mappaszerkezet</em></h2>
        <p class="topic-tagline">Mi hova kerül — két eszközre (Copilot + Claude Code) felkészítve.</p>

        <h3>A Pálya AI-config csomag</h3>
<pre data-lang="text"><code>AGENTS.md                            ← KÖZÖS alap (mindkét eszköz)
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
    react-view-component/SKILL.md</code></pre>

        <h3>A rétegek prioritási sorrendje (Copilot)</h3>
        <ol>
          <li><strong>Közös alap</strong> — <code>AGENTS.md</code> (eszközfüggetlen).</li>
          <li><strong>Repó-szintű instruction</strong> — <code>copilot-instructions.md</code> (mindig aktív).</li>
          <li><strong>Path-specifikus instruction</strong> — <code>*.instructions.md</code> (csak a megadott fájlokra).</li>
          <li><strong>On-demand skillek</strong> — <code>skills/*/SKILL.md</code> (csak amikor kellenek).</li>
          <li><strong>Hívható persona</strong> — <code>agents/*.agent.md</code> (amikor szándékosan előhívod).</li>
        </ol>

        <h3>A négy fájltípus — összefoglaló tábla</h3>
        <table>
          <thead><tr><th>Fájl</th><th>Szerep</th><th>Mikor aktív</th><th>Hivatkozik az alapra?</th></tr></thead>
          <tbody>
            <tr><td><code>AGENTS.md</code></td><td>Közös alap</td><td>Mindig, minden eszközön</td><td>— (ez az alap)</td></tr>
            <tr><td><code>CLAUDE.md</code> / <code>copilot-instructions.md</code></td><td>Eszköz-specifikus réteg</td><td>Mindig (az adott eszközön)</td><td>Igen — nem ismétel</td></tr>
            <tr><td><code>*.instructions.md</code></td><td>Path-scope szabály</td><td>Csak a megadott fájlokra</td><td>Igen</td></tr>
            <tr><td><code>SKILL.md</code></td><td>On-demand tudás</td><td>Csak amikor releváns</td><td>Áttételesen</td></tr>
            <tr><td><code>*.agent.md</code></td><td>Hívható persona</td><td>Csak amikor előhívod</td><td>Igen</td></tr>
          </tbody>
        </table>

        <div class="callout warning">
          <div class="callout-label">Két szabály, amit sose szegj meg</div>
          <p><strong>1.</strong> Ne duplikáld a tartalmat — egy közös alap, fölötte hivatkozó rétegek.
          <strong>2.</strong> Titok, API-kulcs SOHA nem kerül verziózott config fájlba.</p>
        </div>

        <div class="callout success">
          <div class="callout-label">Tanuló feladat · összegzés (nagy)</div>
          <p>Állítsd össze a saját projekted teljes AI-config csomagját a fenti szerkezet mintájára: egy
          <code>AGENTS.md</code>, egy repó-szintű instruction, legalább egy path-specifikus instruction, egy skill és egy
          persona. Végül írj egy rövid <code>README-ai-config.md</code>-t, ami elmagyarázza, melyik fájl mit csinál —
          mintha egy csapattársnak adnád át. Ez a README a legjobb teszt: ha nem tudod egyszerűen leírni, valószínűleg
          túl bonyolítottad.</p>
        </div>
      </section>

      <div class="page-footer">
        <span>AI Hub · AI Config fájlok</span>
        <span>A Pálya projekt konfigurációja alapján · 2026</span>
      </div>

:::
