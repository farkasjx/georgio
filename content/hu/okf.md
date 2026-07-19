---
page: okf
title: Open Knowledge Format (OKF) — nyílt tudásformátum AI-ügynököknek
sidebar_groups:
  - Elmélet
  - A formátum
  - Gyakorlat
  - Kontextus
hero:
  eyebrow: "OKF · Fejlesztői Tanulási Terv"
  title: "Open Knowledge Format — <em>nyílt tudásformátum AI-ügynököknek</em>"
  lead: "A Google Cloud 2026 júniusában publikált egy gyártófüggetlen szabványt arra, hogyan csomagoljunk és osszunk meg tudást AI-ügynökökkel — egyszerű markdown fájlokban, YAML frontmatterrel. Nem RAG-helyettesítő, hanem kurált, verzió-kontrollált tudásreprezentáció. Épít a <em>RAG</em> és az <em>AI Config fájlok</em> tutorialokra."
  stats:
    - { val: "0.1", lbl: "Verzió" }
    - { val: "2026.06.12", lbl: "Bejelentés" }
    - { val: "1", lbl: "Kötelező mező" }
    - { val: "Apache 2.0", lbl: "Licenc" }
footer:
  left: "AI Hub · OKF"
  right: "OKF · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#okf-0"><div class="tc-num">0. rész</div><div class="tc-name">Mi az OKF?</div><div class="tc-desc">Definíció, ki adta ki, és miért nem "csak Google-cucc".</div></a>
  <a class="toc-card" href="#okf-1"><div class="tc-num">1. rész</div><div class="tc-name">Miért kellett</div><div class="tc-desc">A széttöredezett tudás problémája, és az "LLM-wiki" minta.</div></a>
  <a class="toc-card" href="#okf-2"><div class="tc-num">2. rész</div><div class="tc-name">A formátum felépítése</div><div class="tc-desc">Bundle, concept, frontmatter mezők, index.md, log.md.</div></a>
  <a class="toc-card" href="#okf-3"><div class="tc-num">3. rész</div><div class="tc-name">Konkrét példa</div><div class="tc-desc">Egy valódi concept-fájl elejétől végig.</div></a>
  <a class="toc-card" href="#okf-4"><div class="tc-num">4. rész</div><div class="tc-name">OKF vs. RAG vs. vektor-DB</div><div class="tc-desc">Kurált tudás vs. hasonlóság-alapú visszakeresés.</div></a>
  <a class="toc-card" href="#okf-5"><div class="tc-num">5. rész</div><div class="tc-name">Kritikus szemmel</div><div class="tc-desc">Még v0.1, korai stádium — mi hiányzik, mi kétséges.</div></a>
  <a class="toc-card" href="#okf-6"><div class="tc-num">6. rész</div><div class="tc-name">A saját site-od tükrében</div><div class="tc-desc">Ez a Hub is lényegében egy "LLM-wiki".</div></a>
</div>
::::::

:::::: section id=okf-0 num="00" heading="0. rész — Mi az OKF, és miért nem \"csak Google-cucc\"?" nav="Mi az OKF?" group="Elmélet"

<p class="topic-tagline">Cél: pontos definíció, és a leggyakoribb félreértés tisztázása.</p>

### A definíció

Az **Open Knowledge Format (OKF)** egy nyílt, verzió 0.1-es specifikáció, amit a Google Cloud tett közzé 2026. június 12-én. Azt írja le, hogyan reprezentáljunk és csomagoljunk **tudást** — metaadatot, kontextust, kurált szakértői ismeretet — úgy, hogy azt AI-ügynökök és emberek egyaránt, gyártófüggetlen módon tudják olvasni, előállítani és megosztani.

A formátum szándékosan minimalista: egy **könyvtárnyi markdown fájl, YAML frontmatterrel** — nincs központi séma-nyilvántartás, nincs kötelező SDK, nincs futásidejű komponens. Ha tudsz `cat`-elni egy fájlt, tudsz OKF-et olvasni; ha tudsz `git clone`-olni egy repót, tudsz OKF-et terjeszteni.

### Miért NEM csak Google-specifikus

Könnyű azt gondolni, hogy ez megint egy gyártó-specifikus, a saját ökoszisztémájába záró megoldás — ennek épp az ellenkezője igaz:

::::: stack-grid
:::: card label="Nyílt licenc"
Apache 2.0 alatt, a `GoogleCloudPlatform/knowledge-catalog` GitHub-repóban publikálva — bárki implementálhatja, forkolhatja, kiterjesztheti.
::::
:::: card label="Nincs lock-in"
A specifikáció explicit kimondja: nincs egyetlen felhőhöz, adatbázishoz, modellszolgáltatóhoz vagy ügynök-keretrendszerhez kötve, és sosem fog fiókot vagy SDK-t megkövetelni.
::::
:::: card label="A legalacsonyabb súrlódású alap"
Nem talál ki új formátumot — a már létező, mindenhol elérhető markdown + frontmatter + Git kombinációra épít, amit amúgy is széles körben használnak.
::::
:::::

::::: callout label="Egy mondatban"
Az OKF **maga a specifikáció** — nem egy Google-termék vagy platform, hanem egy szabad felhasználású szabvány arra, hogyan nézzen ki egy AI-ügynököknek szánt tudásbázis.
:::::
::::::

:::::: section id=okf-1 num="01" heading="1. rész — Miért kellett: a széttöredezett tudás problémája" nav="Miért kellett" group="Elmélet"

<p class="topic-tagline">Cél: értsd meg, milyen valós fájdalompontra válaszol az OKF.</p>

### Minden csapat ugyanazt a problémát oldja meg újra

Amikor egy AI-ügynököt építesz, előbb-utóbb ugyanabba a falba ütközöl: a szükséges tudás **szét van szórva** — katalógusokban, wikikben, kódkommentekben, vagy csak a szenior kollégák fejében. Minden új ügynöknél a csapatok **nulláról** oldják meg ugyanazt a "hogyan gyűjtsem össze a kontextust" feladatot, gyakran egymással inkompatibilis, egyedi formátumban.

### Az "LLM-wiki" minta, amit az OKF szabványosít

Az OKF nem előzmény nélküli — egy már organikusan kialakult mintázatot formalizál:

- **Andrej Karpathy "LLM-wiki" ötlete** (2026 áprilisában terjedt el széles körben) — markdown fájlok, amiket kifejezetten AI-ügynökök olvasására szánnak.
- Az **AGENTS.md / CLAUDE.md konvenció** — projektspecifikus, állandó "prompt"-fájlok, amiket dezes ezer nyílt forráskódú projekt már használ (lásd a **AI Config fájlok tutorialt**).
- **Obsidian-jellegű, kódoló-ügynökökhöz kötött tudástárak** — hierarchikus markdown, kereszthivatkozásokkal.

::::: callout label="A Google szerepe"
A Google nem talált ki új mintát — azt vette észre, hogy ha minden csapat a saját, egyedi verzióját írja meg ennek a mintának, az egész AI-ökoszisztéma fragmentált marad. Az OKF ezt a már létező konvenciót emeli **egy közösen elfogadott, interoperábilis szabvánnyá**.
:::::
::::::

:::::: section id=okf-2 num="02" heading="2. rész — A formátum felépítése: bundle, concept, frontmatter" nav="A formátum felépítése" group="A formátum"

<p class="topic-tagline">Cél: ismerd a specifikáció alapfogalmait és kötelező/ajánlott mezőit.</p>

### Alapfogalmak

::::: stack-grid
:::: card label="Knowledge Bundle"
Egy önmagában értelmezhető, hierarchikus tudásdokumentum-gyűjtemény — ez a terjesztés egysége (repó, tarball, vagy egy nagyobb repó almappája).
::::
:::: card label="Concept"
Egyetlen tudásegység, egyetlen markdown fájlként reprezentálva — lehet konkrét (egy tábla, egy API), vagy elvont (egy metrika, egy folyamat).
::::
:::: card label="Concept ID"
A fájl útvonala a bundle-ön belül, `.md` kiterjesztés nélkül — pl. `tables/users.md` azonosítója `tables/users`.
::::
:::: card label="Frontmatter"
YAML metaadat-blokk, `---` határolókkal a fájl tetején — ez adja meg a típust és az opcionális leíró mezőket.
::::
:::::

### A frontmatter mezői

Minden concept-fájlnak **pontosan egy kötelező mezője** van:

```yaml
---
type: <típus neve>                 # KÖTELEZŐ
title: <megjelenítendő név>        # ajánlott
description: <egysoros összefoglaló>  # ajánlott
resource: <az alátámasztott erőforrás URI-ja>  # opcionális
tags: [<címke>, <címke>, …]        # opcionális
timestamp: <ISO 8601 dátum>        # opcionális, utolsó módosítás
---
```

A `type` értékeit **nem** kell központilag regisztrálni — a fogyasztóknak (consumereknek) toleránsan kell kezelniük az ismeretlen típusokat is, jellemzően általános concept-ként.

### Két speciális fájlnév

::::: compare
::: good label="index.md — katalógus"
Bármely könyvtárban megjelenhet, felsorolja a benne található conceptek listáját, rövid leírással — ez teszi lehetővé, hogy az ügynök *fokozatosan* fedezze fel a tudásbázist, ahelyett hogy mindent egyszerre be kellene töltenie.
:::
::: good label="log.md — változásnapló"
Dátum szerint csoportosított, időrendi lista a könyvtár szintjén történt változásokról — emberi és ügynök-generált módosítások nyomon követésére egyaránt.
:::
:::::

::::: callout warning label="Megengedő fogyasztási modell"
A specifikáció explicit kimondja: egy fogyasztó **nem utasíthatja el** a bundle-t hiányzó opcionális mezők, ismeretlen `type` érték, ismeretlen extra kulcs, törött kereszthivatkozás vagy hiányzó `index.md` miatt. Ez szándékos — az OKF-nek hasznosnak kell maradnia akkor is, ha a bundle növekszik, átalakul, vagy részben ügynökök generálják.
:::::
::::::

:::::: section id=okf-3 num="03" heading="3. rész — Konkrét példa: egy concept-fájl elejétől végig" nav="Konkrét példa" group="Gyakorlat"

<p class="topic-tagline">Cél: lásd, hogyan néz ki mindez a gyakorlatban, nem csak elméletben.</p>

### Egy erőforráshoz kötött concept

```yaml
---
type: BigQuery Table
title: Ügyfél rendelések
description: Egy sor minden lezárt ügyfélrendelésről, csatornától függetlenül.
resource: https://console.cloud.google.com/bigquery?p=acme&d=sales&t=orders
tags: [ertekesites, rendelesek, arbevetel]
timestamp: 2026-05-28T14:30:00Z
---

# Séma

| Oszlop        | Típus     | Leírás                                   |
|---------------|-----------|-------------------------------------------|
| `order_id`    | STRING    | Globálisan egyedi rendelés-azonosító.     |
| `customer_id` | STRING    | Idegen kulcs az [ügyfelek](/tables/customers.md) felé. |
| `total_usd`   | NUMERIC   | Rendelés végösszege USD-ben.               |

# Hivatkozások

[1] [BigQuery táblasémadokumentáció](https://console.cloud.google.com/bigquery?p=acme&d=sales&t=orders)
```

Figyeld meg: a `# Séma` és a `# Hivatkozások` fejlécek **konvencionális jelentéssel** bírnak (a specifikáció ajánlja, de nem kényszeríti ki őket), és a táblázatbeli kereszthivatkozás (`[ügyfelek](/tables/customers.md)`) egy **bundle-relatív link** — ez a formátum ajánlott módja a conceptek összekötésére.

### Egy erőforráshoz NEM kötött concept

Nem minden tudás egy konkrét adatbázis-táblához vagy API-hoz kötődik — egy `Playbook` (eljárásrend) típusú concept épp ennyire jogos:

```yaml
---
type: Playbook
title: Incidenskezelés — adatfrissességi riasztás
description: Lépések egy frissességi riasztás triázsához a rendelés-pipeline-on.
tags: [ugyelet, incidens]
---

# Kiváltó ok

A frissességi riasztás akkor jelez, ha az `orders` tábla 30 percnél
jobban lemarad az elvárt SLA-tól. Lásd a [rendelések táblát](/tables/orders.md).

# Lépések

1. Nézd meg a beolvasási feladat dashboardot.
2. …
```

::::: callout label="Egy mondatban"
Egy OKF-bundle valójában nem más, mint egy **kereshető, kereszthivatkozott markdown-könyvtár** — de a `type` mező és a néhány konvencionális fejléc miatt az ügynökök szabványosan tudnak benne navigálni, akármelyik gyártó eszközét is használják.
:::::
::::::

:::::: section id=okf-4 num="04" heading="4. rész — OKF vs. RAG vs. vektor-DB: mikor melyik?" nav="OKF vs. RAG" group="Kontextus"

<p class="topic-tagline">Cél: helyezd el az OKF-et a már ismert eszközök között — ne keverd össze őket.</p>

### Más problémát oldanak meg

::::: stack-grid
:::: card label="Vektor-adatbázis"
**Hasonlóság-keresés**: szöveget vektorrá alakít, és a legközelebbi találatokat adja vissza — nem tudja, *mi igaz*, csak azt, *mi hasonló*.
::::
:::: card label="RAG"
**Ad-hoc visszakeresés + generálás**: a kérdéshez legrelevánsabb dokumentum-darabokat illeszti a promptba, hogy a modell ezekre alapozva válaszoljon.
::::
:::: card label="OKF"
**Kurált, verzió-kontrollált tudás**: nem hasonlóság alapján keres, hanem **explicit, ember vagy ügynök által szerkesztett** conceptek gráfját adja, amit az ügynök közvetlenül olvas és — ha kell — módosít.
::::
:::::

### A lényegi különbség

A **RAG** (lásd a **RAG tutorial** 0. részét) azt a problémát oldja meg, hogy egy hatalmas, strukturálatlan dokumentumhalmazból a *lekérdezéskor* legrelevánsabb darabokat emelje ki — ehhez kell a chunkolás, az embedding és a hasonlóság-keresés. Az OKF ezzel szemben **előre kurált, kis, kezelhető egységekben** (conceptekben) tárolja a tudást — nem lekérdezéskor darabolja fel a nyers szöveget, hanem a producer (ember vagy ügynök) már eleve **jól strukturált, önmagában értelmes** egységekben rögzíti azt.

::::: callout warning label="Nem helyettesítik egymást"
Az OKF **nem RAG-helyettesítő** — inkább a *bemenete* lehet egy RAG-pipeline-nak (egy OKF-bundle conceptjeit ugyanúgy be lehet ágyazni és vektor-DB-be tölteni), vagy közvetlenül a kontextusba tölthető, ha a bundle elég kicsi. A kettő **különböző rétegben** dolgozik: az OKF a *tudás reprezentációja és karbantartása*, a RAG a *lekérdezéskori visszakeresés mechanizmusa*.
:::::
::::::

:::::: section id=okf-5 num="05" heading="5. rész — Kritikus szemmel: még v0.1, korai stádium" nav="Kritikus szemmel" group="Kontextus"

<p class="topic-tagline">Cél: ne kezeld kész, letisztult szabványként — lásd, mi hiányzik még.</p>

### Amit maga a specifikáció is elismer

::::: callout danger label="Nyitott kérdések"
**✗** A specifikáció maga mondja ki: *"OKF v0.1 egy kiindulópont, nem egy kész szabvány"* — a formátum a jövőben, a valós használat tapasztalatai alapján fog fejlődni. · **✗** Nincs még kötelező erejű, típusok szerinti taxonómia — a `type` mező szabadszöveges, ami rugalmas, de gyenge garanciákat ad az interoperabilitásra. · **✗** Az, hogy valódi "lingua franca" lesz-e belőle, azon múlik, hogy **Google-on kívüli** gyártók és csapatok is elkezdik-e ténylegesen használni — egyelőre a referencia-implementációk java része a Google Cloud Knowledge Cataloghoz kötődik. · **✗** Nincs beépített mechanizmus ellentmondó állítások, megbízhatósági szintek vagy tipizált kapcsolatok kezelésére a conceptek között — ezek egyelőre nyitott tervezési kérdések.
:::::

### Mennyire számít ez neked?

Ha ma szeretnéd kipróbálni, a formátum **öt perc alatt megtanulható**, ingyenesen használható, és nem igényel különleges eszközt — ez az egyik legkisebb belépési küszöbű "szabvány", amivel valaha találkozhatsz. Ugyanakkor érdemes **kísérletként**, nem letisztult, mindenki által elfogadott konvencióként kezelni — a v0.1 jelzés nem véletlen.

::::: callout label="Egy mondatban"
Az OKF technikailag egyszerű, de az igazi kérdés nem technikai: elterjed-e Google-on kívül is annyira, hogy tényleg azt oldja meg, amit ígér — a fragmentált tudásreprezentációk problémáját.
:::::
::::::

:::::: section id=okf-6 num="06" heading="6. rész — A saját site-od tükrében: ez a Hub is egy \"LLM-wiki\"" nav="A saját site-od tükrében" group="Kontextus"

<p class="topic-tagline">Cél: egy meta-reflexió — mennyire hasonlít a saját projekted az OKF mögötti mintára.</p>

### A párhuzam

Ha megnézed, hogyan épül fel ez az AI Hub, feltűnő a hasonlóság az OKF mögötti "LLM-wiki" mintával, még ha nem is formálisan OKF-kompatibilis bundle-ként:

::::: compare
::: good label="Amiben hasonlít"
Markdown fájlok, YAML frontmatterrel (`page`, `title`, `sidebar_groups`) · minden fájl egy önálló, jól elhatárolt "tudásegység" (egy-egy téma) · kereszthivatkozások a `glossary.json` auto-linkeléssel és a kapcsolati térkép éleivel · verziókövetve, Git-ben tárolva.
:::
::: good label="Amiben eltér egy formális OKF-bundle-től"
Nincs kötelező `type` mező conceptenként · a fájlok sokkal hosszabbak, oktató jellegűek (nem egy-egy önálló, atomi "tábla" vagy "playbook" leírás) · a build-lépés (`site/build.js`) HTML-t generál belőle, nem közvetlenül ügynökök fogyasztására szánt markdown-könyvtárként terjed.
:::
:::::

::::: callout label="Záró gondolat"
Nem kell a site-odat formálisan OKF-re átírnod ahhoz, hogy éld a mögötte lévő elvet — a **markdown + frontmatter + kereszthivatkozás + verziókontroll** kombináció, amit már most is használsz, pontosan az a "lowest-friction substrate", amire az OKF is épül. Ha valaha egy tényleges AI-ügynöknek szeretnéd exportálni ennek a Hubnak a tartalmát (nem HTML-ként, hanem közvetlenül fogyasztható tudásként), az OKF konvenciói jó kiindulópontot adnának.
:::::
::::::

:::::: section id=okf-summary num=SUMMARY nav="Összefoglalás" sub=true group="Kontextus"
## A tutorial végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0–1. rész"
Mi az OKF, ki adta ki, miért nyílt és gyártófüggetlen · a széttöredezett tudás problémája · az "LLM-wiki" minta eredete
::::
:::: card label="2–3. rész"
Bundle, concept, concept ID, frontmatter mezők (`type` kötelező) · `index.md` és `log.md` · egy konkrét concept-fájl elejétől végig
::::
:::: card label="4. rész"
OKF vs. RAG vs. vektor-DB — kurált tudás vs. hasonlóság-alapú visszakeresés, és miért nem helyettesítik egymást
::::
:::: card label="5. rész"
Kritikus szemmel: még v0.1, nyitott kérdések, és hogy ez elsősorban adopciós, nem technikai kérdés
::::
:::: card label="6. rész"
Meta-reflexió: ez a Hub is az "LLM-wiki" mintát követi, még ha nem is formálisan OKF-bundle
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>RAG</em> (lekérdezéskori visszakeresés) és az <em>AI Config fájlok</em> (AGENTS.md / CLAUDE.md — az OKF egyik közvetlen előzménye) tutorialok.</p>
::::::
