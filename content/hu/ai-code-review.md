---
page: ai-code-review
title: AI code review és tesztelés — CodeRabbit és a mezőny
sidebar_groups:
  - Elmélet
  - Az eszközök
  - Gyakorlat
  - Referencia
hero:
  eyebrow: "AI code review · Fejlesztői Tanulási Terv"
  title: "AI code review és tesztelés — <em>CodeRabbit és a mezőny</em>"
  lead: "Az Agentic kódolás tutorial megmutatta, hogyan írasson kódot egy AI-ügynök — ez a cikk a másik oldalra megy: hogyan NÉZESSED át azt a kódot egy másik AI-jal, mielőtt egy ember egyáltalán ránézne. Konkrét eszközök, mért pontossági számok, és egy fontos figyelmeztetés: egyik sem helyettesíti az emberi review-t."
  stats:
    - { val: "52,5% / 36,7%", lbl: "CodeRabbit / Copilot recall*" }
    - { val: "82%", lbl: "Greptile bug catch rate*" }
    - { val: "5", lbl: "Szakasz" }
    - { val: "50%", lbl: "manuális review-idő csökkenés*" }
footer:
  left: "AI Hub · AI code review"
  right: "AI code review · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#ai-code-review-0"><div class="tc-num">0. rész</div><div class="tc-name">Miért kell ez egyáltalán</div><div class="tc-desc">Az AI-generált kód mennyisége meghaladta az emberi review-kapacitást.</div></a>
  <a class="toc-card" href="#ai-code-review-1"><div class="tc-num">1. rész</div><div class="tc-name">A mezőny: kit mire válassz</div><div class="tc-desc">CodeRabbit, Greptile, Qodo, SonarQube — más erősségek.</div></a>
  <a class="toc-card" href="#ai-code-review-2"><div class="tc-num">2. rész</div><div class="tc-name">Konkrét számok, amik döntést segítenek</div><div class="tc-desc">Recall, precizitás, és amit ezek jelentenek.</div></a>
  <a class="toc-card" href="#ai-code-review-3"><div class="tc-num">3. rész</div><div class="tc-name">Amit egyik eszköz sem old meg</div><div class="tc-desc">Az emberi review nem opcionális kiegészítő.</div></a>
</div>
::::::

:::::: section id=ai-code-review-0 num="00" heading="0. rész — Miért kell ez egyáltalán" nav="Miért kell ez egyáltalán" group="Elmélet"

<p class="topic-tagline">Cél: értsd meg a konkrét, gyakorlati kényszert, ami ezt a teljes eszközkategóriát létrehozta.</p>

### A matek, ami mögötte áll

::::: callout label="Egy egyszerű számítás"
Ha egy csapat heti **50 pull requestet** ad ki, és mindegyik átvizsgálása **30 percet** vesz igénybe, az heti **25 fejlesztői órát** jelent — csak a review-ra. Ahogy az <em>Agentic kódolás</em> és a <em>Vibe coding</em> tutorialokban tárgyalt eszközök megnövelték a generált kód mennyiségét és sebességét, ez a szám tovább nőtt: a manuális review egyedül **nem tud lépést tartani**.
:::::

::::: callout label="Amit ez az eszközkategória tesz"
Az AI code review eszközök a **mechanikus ellenőrzéseket** (stílus, jól ismert bugtípusok, ismert biztonsági minták) automatizálják, így az emberi reviewer az **architekturális döntésekre és az üzleti logikára** koncentrálhat — dokumentáltan akár **50%-kal** csökkentve a manuális review-időt.
:::::

::::: callout label="Egy mondatban"
Az AI code review nem luxus-kiegészítő — egy közvetlen válasz arra a konkrét, mérhető problémára, hogy az AI-asszisztált fejlesztés megnövelte a PR-mennyiséget azon a ponton túl, ahol a tisztán emberi review még fenntartható maradna.
:::::
::::::

:::::: section id=ai-code-review-1 num="01" heading="1. rész — A mezőny: kit mire válassz" nav="A mezőny: kit mire válassz" group="Az eszközök"

<p class="topic-tagline">Cél: ismerd meg a fő szereplőket, és mindegyik konkrét erősségét — nincs egyetlen "legjobb" mindenkinek.</p>

::::: stack-grid
:::: card label="CodeRabbit"
A leggyorsabb bevezetés, legkevesebb konfiguráció, **természetes nyelvi** szabálybeállítás (nem regex vagy YAML), és a legszélesebb platform-lefedettség (GitHub, GitLab, Bitbucket, Azure DevOps egyetlen konfigurációval).
::::
:::: card label="Greptile"
A legmagasabb dokumentált bug-elfogási arány (82%) — jó választás, ha a **recall** (hány valós hibát talál meg) a legfontosabb szempont, GitHub-only környezetben.
::::
:::: card label="Qodo (korábban CodiumAI)"
**Teszt-generálásra** specializálódott — a review mellett automatikusan ír unit teszteket, olyan edge case-ekre is, amikre a csapat esetleg nem is gondolt. 2026-tól multi-agent architektúrával (külön ügynök a bugokra, kódminőségre, biztonságra, teszt-lefedettségre).
::::
:::: card label="SonarQube"
Régóta bevált, statikus elemző motor, amit AI-review-képességekkel egészítettek ki — **compliance-grade** minőségi kapukat kínál, amik automatikusan blokkolhatják a merge-t kritikus hiba esetén, nem csak javasolják a javítást.
::::
:::: card label="GitHub Copilot Code Review"
A legkényelmesebb, ha már fizetsz a Copilot Enterprise-ért — natív GitHub-integráció, nulla plusz beállítás, cserébe soronkénti (nem cross-file) elemzés.
::::
:::::

::::: callout label="Egy mondatban"
A döntés nem az, "melyik a legjobb" — hanem hogy mi a csapatod **elsődleges korlátja**: recall (Greptile), zajszint és gyors bevezetés (CodeRabbit), teszt-lefedettség (Qodo), vagy szervezeti szintű, kikényszerített minőségi kapuk (SonarQube).
:::::
::::::

:::::: section id=ai-code-review-2 num="02" heading="2. rész — Konkrét számok, amik döntést segítenek" nav="Konkrét számok, amik döntést segítenek" group="Az eszközök"

<p class="topic-tagline">Cél: érts meg pontosan, mit mérnek ezek a gyakran idézett számok.</p>

### Recall és precizitás

::::: callout label="Amit a recall és a precizitás jelent"
A **recall** azt méri, a valós hibák hány százalékát találja meg az eszköz — a **precizitás** azt, hogy a jelzett problémák hány százaléka valós (nem téves riasztás). Egy dokumentált benchmark szerint a CodeRabbit **52,5%-os**, a GitHub Copilot **36,7%-os** recall-t ért el ugyanazon a teszthalmazon — ez azt jelenti, hogy a CodeRabbit **43%-kal több** valós problémát talál meg PR-onként.
:::::

::::: callout warning label="Miért nem elég csak a legmagasabb számot választani"
A magasabb recall gyakran **magasabb zajszinttel** (több téves riasztással) jár együtt — egy csapatnak, ahol a fejlesztők gyorsan "kikapcsolják fejben" a túl fecsegő eszközt, alacsonyabb, de **pontosabb** jelzés többet érhet, mint egy magasabb, de zajosabb recall.
:::::

::::: callout label="Egy mondatban"
A benchmark-számok (lásd az <em>Evaluation</em> tutorialt hasonló elvekért) jó kiindulópontot adnak, de a végső döntést mindig érdemes egy **saját, éles projekten futtatott** próbaidőszakkal megerősíteni — pontosan azért, mert a "zaj-tolerancia" csapatonként eltérő.
:::::
::::::

:::::: section id=ai-code-review-3 num="03" heading="3. rész — Amit egyik eszköz sem old meg: az emberi review szerepe" nav="Amit egyik eszköz sem old meg" group="Gyakorlat"

<p class="topic-tagline">Cél: zárd le a cikket egy fontos, kiegyensúlyozó figyelmeztetéssel.</p>

### A határ, amit egyik eszköz sem lép át

::::: callout danger label="A közös nevező minden komoly elemzésben"
Minden alaposabb 2026-os összehasonlítás ugyanazt a figyelmeztetést hangsúlyozza: **egyik AI code review eszköz sem helyettesíti** a teljes emberi review-t. A mechanikus hibák (stílus, ismert bugminták, jól dokumentált biztonsági hiányosságok) skálázhatóan kezelhetők — de az **architekturális döntések, az üzleti logika helyessége** és a domain-specifikus tudás, ami nincs a kódban (lásd az <em>Agentic kódolás</em> tutorial "termékdöntés-megfelelés" kutatását), továbbra is emberi ítélőképességet igényel.
:::::

### A gyakorlati bevezetési tanács

::::: callout label="Ne szervezeti szinten, egyszerre vezesd be"
A tapasztalat szerint egy **szelektív, projekt-alapú** bevezetés jobban működik, mint egy azonnali, szervezeti szintű kiterjesztés — kezdj egy nagy volumenű vagy alacsony reviewer-lefedettségű projekttel, mérd a tényleges megtérülést, csak utána bővíts.
:::::

::::: callout warning label="A konfiguráció nem opcionális"
Minden komolyabb elemzés megjegyzi: alapból a legtöbb AI code reviewer **túl bőbeszédű** — időt kell szánni a finomhangolásra (pl. a CodeRabbit `.coderabbit.yaml` konfigurációjára), különben a fejlesztők egyszerűen figyelmen kívül hagyják a túl sok, alacsony értékű megjegyzést.
:::::

::::: callout label="Egy mondatban"
Az AI code review a legjobban akkor működik, ha **kiegészíti**, nem helyettesíti az emberi review-t — a mechanikus terhet veszi le a csapatról, hogy a human reviewer energiája oda menjen, ahol ténylegesen szükség van rá: az architektúrára és a döntésekre.
:::::
::::::

:::::: section id=ai-code-review-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0. rész"
Az AI code review a megnövekedett PR-mennyiségre adott közvetlen válasz — nem luxus, hanem gyakorlati szükségszerűség
::::
:::: card label="1. rész"
A mezőny fő szereplői és erősségeik: CodeRabbit (gyors bevezetés), Greptile (recall), Qodo (teszt-generálás), SonarQube (compliance-gate)
::::
:::: card label="2. rész"
Recall vs. precizitás — konkrét számok (52,5% vs. 36,7%), és miért nem elég csak a legmagasabb számot nézni
::::
:::: card label="3. rész"
A határ, amit egyik eszköz sem lép át: az architekturális döntés és üzleti logika emberi ítélőképességet igényel — gyakorlati bevezetési tanácsokkal
::::
:::::

<p class="topic-tagline">Kapcsolódó: az <em>Agentic kódolás</em> (a kód, amit ezek az eszközök átvizsgálnak, és a "termékdöntés-megfelelés" probléma), az <em>Evaluation</em> (a benchmark-számok korlátai, ami itt is érvényes) és a <em>Vállalati AI</em> (a SOC 2 és megfelelőségi szempontok eszközválasztásnál) tutorialok.</p>

<p class="topic-tagline" style="margin-top:12px;font-size:0.85em;opacity:0.75">* A recall-, bug catch rate- és review-idő adatok 2026-os, publikus benchmark-összehasonlításokból származnak — lásd a 2. részt a kontextusért.</p>
::::::
