---
page: cost-optimization
title: Költség-optimalizálás — hogyan csökkentsd az API-számládat
sidebar_groups:
  - A számítás
  - Négy technika
  - Gyakorlat
  - Referencia
hero:
  eyebrow: "Költség-optimalizálás · Fejlesztői Tanulási Terv"
  title: "Költség-optimalizálás — <em>hogyan csökkentsd az API-számládat</em>"
  lead: "A Model routing tutorial azt mutatta meg, mekkora modellt válassz — ez a cikk azt, hogyan csökkentsd a tényleges számlát a modellválasztáson túl: prompt caching, batch API, prompt-tömörítés és kimenet-korlátozás. Négy technika, amik egymásra épülve akár 60-90%-kal csökkenthetik a költséget, minőségromlás nélkül."
  stats:
    - { val: "50-90%", lbl: "megtakarítás prompt caching-gel*" }
    - { val: "50%", lbl: "kedvezmény batch API-val*" }
    - { val: "25%", lbl: "effektív költség a kettő együtt*" }
    - { val: "5", lbl: "Szakasz" }
footer:
  left: "AI Hub · Költség-optimalizálás"
  right: "Költség-optimalizálás · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#cost-optimization-0"><div class="tc-num">0. rész</div><div class="tc-name">Mérd, mielőtt optimalizálsz</div><div class="tc-desc">A költség-formula, és miért téveszt meg a kérésszám.</div></a>
  <a class="toc-card" href="#cost-optimization-1"><div class="tc-num">1. rész</div><div class="tc-name">Prompt caching: a leggyorsabb nyereség</div><div class="tc-desc">Hogyan működik, és a static-first szabály.</div></a>
  <a class="toc-card" href="#cost-optimization-2"><div class="tc-num">2. rész</div><div class="tc-name">Batch API: ha nem kell azonnal a válasz</div><div class="tc-desc">50% kedvezmény, órás késleltetésért.</div></a>
  <a class="toc-card" href="#cost-optimization-3"><div class="tc-num">3. rész</div><div class="tc-name">Prompt-tömörítés és kimenet-korlátozás</div><div class="tc-desc">Kevesebb token be, kevesebb token ki.</div></a>
  <a class="toc-card" href="#cost-optimization-4"><div class="tc-num">4. rész</div><div class="tc-name">Konkrét esettanulmány és sorrend</div><div class="tc-desc">Egy valós pipeline, 61%-os csökkenéssel.</div></a>
</div>
::::::

:::::: section id=cost-optimization-0 num="00" heading="0. rész — Mérd, mielőtt optimalizálsz" nav="Mérd, mielőtt optimalizálsz" group="A számítás"

<p class="topic-tagline">Cél: érts meg egy alapvető mérési hibát, amit sok csapat elkövet, mielőtt egyáltalán optimalizálásba kezdene.</p>

### A költség-formula

::::: callout label="Az alapszámítás"
Havi költség = (napi kérésszám × átlagos input token × input ár/1M) + (napi kérésszám × átlagos output token × output ár/1M) × 30 — ez az a formula, amiből egy pilot-időszak alatt kiindulhatsz, **2-3x pufferrel** a prompt-iterációra.
:::::

::::: callout danger label="Miért téveszt meg a kérésszám"
Két kérés **ugyanahhoz** a végponthoz drámaian eltérő költséget okozhat — az **output tokenek 2-6-szor drágábbak**, mint az input tokenek minden nagy szolgáltatónál, tehát a hosszú válaszok, nem a sok kérés, gyakran a valódi költség-hajtóerő. A modellválasztás önmagában **10-szeres** különbséget okozhat a havi számlában.
:::::

::::: callout warning label="A sikeres kimenet, nem a kérés a mérendő egység"
Mérd a **költséget sikeres kimenetenként**, nem kérésenként — a sikertelen kérések, az újrapróbálkozások és az elvesztegetett reasoning-tokenek (lásd a <em>Reasoning</em> tutorialt) mind felduzzasztják a valódi költséget, amit egy sima "kérésszám × ár" számítás elrejt.
:::::

::::: callout label="Egy mondatban"
Mielőtt bármilyen optimalizálási technikát bevezetnél, mérd fel a jelenlegi token-felhasználásod pontosan — anélkül nem tudod megállapítani, melyik technika ad tényleges, mérhető javulást.
:::::
::::::

:::::: section id=cost-optimization-1 num="01" heading="1. rész — Prompt caching: a leggyorsabb nyereség" nav="Prompt caching" group="Négy technika"

<p class="topic-tagline">Cél: érts meg a legkevesebb erőfeszítéssel bevezethető, mégis a legnagyobb hatású technikát.</p>

### Mi történik technikailag

::::: callout label="A KV-cache szerver-oldali kiterjesztése"
Amikor egy LLM feldolgoz egy promptot, kiszámolja az attention key-value tenzorokat minden tokenre (lásd a <em>KV-cache</em> tutorialt) — a **prompt caching** ezeket a kiszámolt tenzorokat **szerver-oldalon tárolja**, így ha a következő kérésed **ugyanazzal a prefixszel** kezdődik, a modell kihagyja ennek újraszámolását, és egyenesen a tárolt eredményt tölti be. A kimenet **bájt-azonos** — csak a prefill-lépés lesz gyorsabb és olcsóbb.
:::::

### Konkrét számok

::::: callout danger label="A megtakarítás mértéke"
A prompt caching **50-90%-kal** csökkentheti az input-költséget azoknál az alkalmazásoknál, ahol a kontextus **ismétlődik** — plusz a time-to-first-token **13-31%-kal** javul, mert a modellnek kevesebb munkát kell elölről elvégeznie.
:::::

::::: callout warning label="Az egyetlen dolog, amit tudatosan kell megtervezned: a prompt-struktúra"
A cache csak akkor talál, ha a prompt **eleje** (prefix) pontosan egyezik az előző hívással — ezért a szabály: **statikus tartalom előre, dinamikus tartalom hátra**. Ha a system prompt-ot, a hosszú dokumentumokat és a few-shot példákat **a prompt elejére** teszed, és csak a felhasználó **konkrét kérdését** hagyod a végén, a cache **minden alkalommal talál**. Ha rosszul strukturálod (pl. a dinamikus rész elé teszed a statikusat), a cache **sosem** talál.
:::::

::::: callout label="Provider-specifikus részletek, amikre figyelj"
Az Anthropic-nál a **cache-írás** 1,25×-e az alapárnak, és a megtérülési pont **két olvasás** után jön el — minden további olvasás **90%-kal olcsóbb**. Az alapértelmezett cache-élettartam **5 perc**, workspace-szintű. Az OpenAI-nál van egy **1024 tokenes küszöb** — egy 900 tokenes system prompt **sosem** kerül cache-be, függetlenül attól, mennyire konzisztens.
:::::

::::: callout label="Egy mondatban"
A prompt caching a **legjobb ár-érték arányú** költség-optimalizálás — nincs modellváltás, nincs minőségromlás, csak a prompt-struktúra tudatos megtervezése (statikus elöl, dinamikus hátul), és a megtakarítás azonnal, kódmódosítás nélkül (OpenAI-nál) vagy egyetlen extra mezővel (Anthropic-nál) elérhető.
:::::
::::::

:::::: section id=cost-optimization-2 num="02" heading="2. rész — Batch API: ha nem kell azonnal a válasz" nav="Batch API" group="Négy technika"

<p class="topic-tagline">Cél: ismerd meg a második, a caching-gel kombinálható technikát.</p>

### A csere: idő a pénzért

::::: callout label="Az alapkoncepció"
Az OpenAI és az Anthropic egyaránt **50%-os kedvezményt** ad batch-hívásokra — a kompromisszum az, hogy a válasz **órákkal**, nem milliszekundumokkal később érkezik. Ez ideális **éjszakai feldolgozásra, heti elemzésekre**, és minden olyan pipeline-ra, ahol a sebesség **nem** a szűk keresztmetszet.
:::::

### A két technika együtt

::::: callout danger label="A kombinált hatás"
A prompt caching és a batch API **egymásra épül** — ha a batch-kedvezmény (50%) és a cache-olvasás (akár 90%-os megtakarítás) együtt van jelen, az **effektív per-hívás költség kb. 25%-ára** csökken a standard árnak.
:::::

::::: callout warning label="Mikor NEM éri meg"
Ha a felhasználó **valós idejű választ** vár (egy chat-interfész, egy interaktív eszköz), a batch API **nem opció** — az órás késleltetés csak azoknál a feladatoknál elfogadható, ahol amúgy is aszinkron feldolgozás történne (naplózás, tömeges dokumentum-elemzés, jelentés-generálás).
:::::

::::: callout label="Egy mondatban"
A batch API a legjobb választás minden olyan, tömeges, nem-idő-kritikus feladatnál, ahol a válasz percekkel-órákkal később is elfogadható — kombinálva a caching-gel, ez adja a legmélyebb, tudatosan elérhető megtakarítást.
:::::
::::::

:::::: section id=cost-optimization-3 num="03" heading="3. rész — Prompt-tömörítés és kimenet-korlátozás" nav="Prompt-tömörítés és kimenet-korlátozás" group="Négy technika"

<p class="topic-tagline">Cél: ismerd meg két, kevésbé ismert, de hatékony technikát, amik közvetlenül a token-mennyiséget csökkentik.</p>

### Kevesebb token be

::::: callout label="A prompt-tömörítés elve"
Eszközök, mint az **LLMLingua**, a prompt szövegét **2-5-szörösére** tömörítik, minimális minőségromlással — a system promptból kiszűrik a felesleges "hedge" (bizonytalanságot kifejező) nyelvezetet, és az utasításokat **strukturált formátumba** rendezik, ahelyett hogy hosszú, természetes nyelvi bekezdésekben fogalmaznák meg.
:::::

### Kevesebb token ki

::::: callout warning label="Az output ára magasabb, az optimalizálása magasabb hozamú"
Mivel az output tokenek **2-6-szor drágábbak** az inputnál, a kimenet hosszának korlátozása (`max_tokens` paraméterrel) és a **strukturált JSON-séma** kikényszerítése (lásd az <em>Adatkezelés AI-pipeline-okhoz</em> tutorialt) magasabb megtérülést ad, mint az input-oldali optimalizálás.
:::::

::::: callout danger label="A reasoning-tokenek rejtett költsége"
Ha reasoning modellt (lásd a <em>Reasoning</em> tutorialt) használsz, a valós költség **3-9-szerese** lehet a fejcím-output-árnak, a rejtett "gondolkodási" tokenek miatt — ha a feladatod nem igényel mély, több lépéses következtetést, egy nem-reasoning modell **jelentősen olcsóbb** lehet ugyanarra a feladatra.
:::::

::::: callout label="Egy mondatban"
A token-mennyiség csökkentése mindkét irányban (bemenet-tömörítés, kimenet-korlátozás) közvetlen, azonnali megtakarítást ad — és mivel az output drágább, ott van a nagyobb, gyorsabban elérhető nyereség.
:::::
::::::

:::::: section id=cost-optimization-4 num="04" heading="4. rész — Konkrét esettanulmány és a bevezetés sorrendje" nav="Konkrét esettanulmány" group="Gyakorlat"

<p class="topic-tagline">Cél: lásd, hogyan áll össze a négy technika egy valós, dokumentált esetben.</p>

### Egy valós, publikált eset

::::: callout danger label="180$/hó → 70$/hó, egy délután alatt"
Egy multi-agent tartalom-pipeline (kutatás, írás, fordítás 9 nyelvre, publikálás — lásd a <em>Multi-agent rendszerek</em> tutorialt), havi **kb. 12 000 API-hívással**, a rendszer-utasítások és a márka-konfiguráció (kb. 3500 token) **minden hívásnál megismétlődött** — ez önmagában **kb. 180$/hó** volt csak a redundáns system-prompt inputon. A csapat **bekapcsolta a prompt caching-et**, és **áttette a 9 fordítási lépést a batch API-ra** — a rendszer ugyanazt a kimenetet adta, ugyanolyan minőségben, **kb. 70$/hó** áron, **61%-os csökkenés**, és a két módosítás **egy délután** alatt megvalósult.
:::::

### A javasolt bevezetési sorrend

::::: callout label="Kezdd a legkönnyebbel"
A gyakorlatban bevált sorrend: **1)** kapcsold be a prompt caching-et mindenhol, ahol ismétlődő kontextus van (nulla kódváltozás OpenAI-nál, egy extra mező Anthropic-nál) — ez adja a leggyorsabb megtérülést. **2)** Vidd át a batch-alkalmas munkát a Batch API-ra. **3)** Vezess be szemantikus cache-elést (hasonló, nem csak azonos kérdésekre). **4)** Alkalmazz modell-routing-ot (lásd a <em>Model routing</em> tutorialt) az egyszerű feladatokra.
:::::

::::: callout warning label="Realisztikus elvárás az első negyedévre"
Egy tipikus csapat, ami sorban bevezeti a caching-et, a routing-ot és a kontextus-kompressziót, **20-30%-os** költségcsökkenésre számíthat az **első negyedévben** — a 60-90%-os megtakarítási arányok a **legjobb esetre** vonatkoznak, erősen ismétlődő kontextusú, jól optimalizálható munkaterheléseknél.
:::::

::::: callout label="Egy mondatban"
A négy technika (caching, batch, tömörítés, kimenet-korlátozás) **egymásra épül**, nem alternatívák egymáshoz — a legjobb eredményt az adja, ha mindegyiket bevezeted, a legkönnyebben megvalósítható (caching) sorrendjében kezdve.
:::::
::::::

:::::: section id=cost-optimization-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0. rész"
A helyes költség-formula, és miért a sikeres kimenet, nem a kérésszám a mérendő egység
::::
:::: card label="1–2. rész"
Prompt caching (50-90% megtakarítás, static-first prompt-struktúra) és batch API (50% kedvezmény, órás késleltetésért) — a kettő együtt 25%-ra csökkenti az effektív költséget
::::
:::: card label="3. rész"
Prompt-tömörítés (LLMLingua, 2-5x) és kimenet-korlátozás — az output drágább, ezért ott van a nagyobb, gyorsabban elérhető nyereség
::::
:::: card label="4. rész"
Konkrét, publikált esettanulmány (61%-os csökkenés egy délután alatt), és a javasolt bevezetési sorrend a legkönnyebb technikától a legnehezebbig
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>Model routing</em> (a modellméret-választás, ami kiegészíti ezt a négy technikát), a <em>KV-cache</em> (a mechanizmus, amire a prompt caching épül), a <em>Reasoning</em> (a rejtett reasoning-token költség) és a <em>Multi-agent rendszerek</em> (az esettanulmány forrása) tutorialok.</p>

<p class="topic-tagline" style="margin-top:12px;font-size:0.85em;opacity:0.75">* A megtakarítási arányok, a batch API kedvezmény és az esettanulmány adatai 2026-os, publikus iparági elemzésekből származnak — lásd az 1., 2. és 4. részt a kontextusért.</p>
::::::
