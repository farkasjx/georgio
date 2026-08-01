---
page: ai-regulation-liability
title: AI szabályozás és jogi felelősség
sidebar_groups:
  - A döntéshozók
  - Két modell szemben
  - A felelősség kérdése
  - Referencia
hero:
  eyebrow: "AI szabályozás · Fejlesztői Tanulási Terv"
  title: "AI szabályozás — <em>és jogi felelősség</em>"
  lead: "Ki dönt arról, mit szabad és mit nem egy AI-rendszerrel, és ki felel, ha kárt okoz? Ez a cikk a szerzői jogon túli, általánosabb AI-jogi kérdéseket járja körül: az EU központosított modelljét, az USA töredezett, állami szintű szabályozását, és a talán legégetőbb, még megoldatlan kérdést — ki a felelős, ha egy autonóm AI-ügynök hibázik."
  stats:
    - { val: "2026. aug. 2.", lbl: "az EU AI Act legtöbb szabálya életbe lép*" }
    - { val: "0", lbl: "átfogó szövetségi AI-törvény az USA-ban*" }
    - { val: "5", lbl: "Szakasz" }
    - { val: "1", lbl: "\"felelősség-vákuum\", ami még megoldatlan" }
footer:
  left: "AI Hub · AI szabályozás"
  right: "AI szabályozás és felelősség · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#ai-regulation-liability-0"><div class="tc-num">0. rész</div><div class="tc-name">Kik a döntéshozók</div><div class="tc-desc">Nem egyetlen testület dönt — egy sok szereplős térkép.</div></a>
  <a class="toc-card" href="#ai-regulation-liability-1"><div class="tc-num">1. rész</div><div class="tc-name">Az EU modellje: központosított, kockázat-alapú</div><div class="tc-desc">Az AI Act, és mikor lép ténylegesen életbe.</div></a>
  <a class="toc-card" href="#ai-regulation-liability-2"><div class="tc-num">2. rész</div><div class="tc-name">Az amerikai modell: töredezett, állami szintű</div><div class="tc-desc">Nincs szövetségi törvény — és ez nem véletlen.</div></a>
  <a class="toc-card" href="#ai-regulation-liability-3"><div class="tc-num">3. rész</div><div class="tc-name">Ki felel, ha egy AI-ügynök kárt okoz?</div><div class="tc-desc">A legégetőbb, még nyitott kérdés.</div></a>
  <a class="toc-card" href="#ai-regulation-liability-4"><div class="tc-num">4. rész</div><div class="tc-name">Hová szeretnének eljutni a döntéshozók</div><div class="tc-desc">Két, egymásnak feszülő cél.</div></a>
</div>
::::::

:::::: section id=ai-regulation-liability-0 num="00" heading="0. rész — Kik a döntéshozók" nav="Kik a döntéshozók" group="A döntéshozók"

<p class="topic-tagline">Cél: térképezd fel, kik alakítják ténylegesen az AI jogi kereteit — nincs egyetlen, központi testület.</p>

### Egy sokszereplős térkép

::::: stack-grid
:::: card label="Törvényhozók és kormányok"
Az **EU** (Európai Parlament és Tanács, az AI Act megalkotói), az **USA Kongresszusa** (eddig sikertelenül próbált átfogó törvényt alkotni) és egyes **amerikai államok** (Kalifornia, Colorado), amik saját törvényeket hoztak.
::::
:::: card label="Végrehajtó hatalom"
Az amerikai **elnöki hivatal** (végrehajtási rendeletekkel, mint a 2025 decemberi 14365-ös rendelet), és az EU **Bizottsága**, ami az AI Act részletes végrehajtási szabályait dolgozza ki.
::::
:::: card label="Bíróságok"
Azok a bírók, akik a folyamatban lévő perekben (lásd az <em>AI és szerzői jog</em> tutorialt) ténylegesen **értelmezik**, hogyan vonatkoznak a meglévő törvények az AI-ra — gyakran gyorsabban, mint a törvényhozás tudna reagálni.
::::
:::: card label="Szabályozó ügynökségek"
Az USA-ban ügynökségi szinten (pl. adatvédelmi hatóságok), az EU-ban az újonnan létrehozott **AI Hivatal** (AI Office), és nemzetközi szinten olyan testületek, mint Szingapúr **IMDA**-ja (Infocomm Media Development Authority).
::::
:::::

::::: callout label="Egy mondatban"
Amikor azt kérdezed, "ki dönt az AI jogi kereteiről", a helyes válasz nem egyetlen név — egy **egyszerre több szinten, gyakran egymásnak ellentmondóan** mozgó rendszer, amiben törvényhozók, végrehajtó hatalom, bíróságok és szabályozók mind alakítják a végeredményt.
:::::
::::::

:::::: section id=ai-regulation-liability-1 num="01" heading="1. rész — Az EU modellje: központosított, kockázat-alapú" nav="Az EU modellje" group="Két modell szemben"

<p class="topic-tagline">Cél: ismerd meg a világ első, átfogó AI-szabályozásának szerkezetét és ütemezését.</p>

### A fokozatos bevezetés logikája

::::: callout label="Az AI Act nem egyszerre lép életbe"
Az EU AI Act **fokozatosan** válik alkalmazandóvá, nem egy csapásra: **2025. február 2.**: a tiltott gyakorlatok és az AI-műveltségi kötelezettségek már hatályba léptek. **2025. augusztus 2.**: az általános célú AI-modellekre (GPAI, ide tartoznak a nagy nyelvi modellek is) vonatkozó szabályok léptek életbe. **2026. augusztus 2.**: a legtöbb, magas kockázatú AI-rendszerre vonatkozó szabály és a **tényleges szankcionálási jogkör** lép életbe — ez a legfontosabb egyetlen dátum a teljes ütemtervben.
:::::

::::: callout warning label="Miért kritikus ez a 2026. augusztusi dátum"
Ettől a naptól kezdve a nemzeti piacfelügyeleti hatóságok **teljes körűen vizsgálhatnak és szankcionálhatnak** AI Act-jogsértéseket — ez az a pont, ahol a szabályozás a "papíron létező kötelezettségből" **ténylegesen kikényszeríthető kötelezettséggé** válik.
:::::

::::: callout label="A \"Digital Omnibus\" módosítás"
2026 közepén az EU egy **Digital Omnibus** csomagot dolgozott ki, ami néhány, eredetileg 2026-ra tervezett, magas kockázatú szabályt **elhalaszt**, a szükséges harmonizált szabványok rendelkezésre állásától téve függővé a bevezetést — ez azt mutatja, hogy még egy formálisan elfogadott törvény ütemezése is **rugalmasan alakítható** utólag.
:::::

::::: callout label="Egy mondatban"
Az EU modellje **egységes, kockázat-alapú** keretet ad — minél nagyobb a kockázat (pl. munkaerő-felvétel, bűnüldözés), annál szigorúbb a kötelezettség —, és ez a keret **egyszerre, mindenkire** vonatkozik, aki az EU piacán AI-rendszert kínál, függetlenül attól, hol fejlesztették.
:::::
::::::

:::::: section id=ai-regulation-liability-2 num="02" heading="2. rész — Az amerikai modell: töredezett, állami szintű" nav="Az amerikai modell" group="Két modell szemben"

<p class="topic-tagline">Cél: érts meg egy éles kontrasztot az EU központosított megközelítéséhez képest.</p>

### Nincs átfogó szövetségi törvény

::::: callout danger label="A jelenlegi állapot, 2026 közepén"
Az Egyesült Államoknak **nincs egyetlen, átfogó szövetségi AI-törvénye** — a szabályozás helyette egy **töredezett szövedék**: állami törvények (Colorado AI Act, Kalifornia átláthatósági törvényei), ügynökségi útmutatások, és elnöki végrehajtási rendeletek.
:::::

### A szövetségi kísérlet, ami eddig nem valósult meg

::::: callout warning label="Egy végrehajtási rendelet, ami még nem törvény"
Az elnök 2025. december 11-én aláírta a **14365-ös végrehajtási rendeletet**, ami egy egységes szövetségi keretet szeretne az állami szabályok helyett — de mivel a szövetségi felülbírálás (preemption) hagyományosan **kongresszusi jogalkotásból**, nem végrehajtási rendeletből ered, ez a rendelet **önmagában nem tudja felülírni** a már hatályos állami törvényeket. 2026 júliusáig **nem született** ilyen szövetségi törvény, a Kongresszus kétszer is elutasította a moratórium-javaslatokat.
:::::

::::: callout label="Amit ez a gyakorlatban jelent"
Egy vállalatnak, ami AI-t fejleszt vagy használ, **jelenleg egyszerre** kell figyelembe vennie a Colorado-i, kaliforniai és egyéb állami szabályokat, miközben figyeli, vajon a szövetségi szint mikor (és hogyan) próbálja majd felülírni ezeket — ez a bizonytalanság maga is egy jelentős megfelelőségi kockázat.
:::::

::::: callout label="Egy mondatban"
Amíg az EU **egy** szabályrendszert alkot mindenkinek, az USA-ban a szabályozás **állam szerint eltérő**, egy folyamatban lévő, kimenetel nélküli politikai csatával a szövetségi egységesítésért.
:::::
::::::

:::::: section id=ai-regulation-liability-3 num="03" heading="3. rész — Ki felel, ha egy AI-ügynök kárt okoz?" nav="Ki felel, ha egy AI-ügynök kárt okoz" group="A felelősség kérdése"

<p class="topic-tagline">Cél: érts meg egy konkrét, még megoldatlan jogi problémát, ami egyre sürgetőbbé válik az agentic AI terjedésével.</p>

### A hagyományos lánc, és ahol megszakad

::::: callout label="A jelenlegi, egyszerű modell"
A jelenlegi jogi gondolkodás jellemzően egy egyszerű láncot feltételez: egy **fejlesztő** épít egy AI-rendszert, egy **üzemeltető** integrálja, egy **felhasználó** irányítja — és ha kár keletkezik, a felelősség ezen három szereplő valamelyikéhez köthető.
:::::

::::: callout danger label="A kaliforniai válasz: az autonómia nem mentesít"
Kalifornia **AB 316** törvénye (2026. január 1-től hatályos) kifejezetten **megtiltja**, hogy egy alperes azzal érveljen, "az AI autonóm módon okozta a kárt" — ez a törvény egyértelműen kimondja: **az emberek nem háríthatják el a felelősséget** azzal, hogy az AI önállóan cselekedett.
:::::

### A "felelősség-vákuum" probléma

::::: callout danger label="Amikor senkihez sem köthető a felelősség"
Anglia és Wales Jogi Bizottsága (Law Commission) 2025 júliusában azonosított egy komoly problémát: léteznek olyan forgatókönyvek, ahol **egyetlen természetes vagy jogi személyhez sem** köthető a felelősség egy autonóm AI-rendszer által okozott kárért — ez egy valódi, dokumentált **rés** a jelenlegi jogi keretekben, amit a Szingapúri IMDA 2026 májusi vitairata is részletesen feltérképez.
:::::

::::: callout warning label="A többszereplős AI-ügynökök problémája"
A helyzetet tovább bonyolítja, hogy a modern, **többszereplős** (multi-agent) rendszerekben az ügynökök közti interakciók gyakran **átláthatatlanok, naplózatlanok** — ha egy kár egy hosszú, több ügynökön átívelő döntési láncból ered, a felelősség utólagos rekonstruálása rendkívül nehézzé válik. A NIST 2026 februári kezdeményezése (AI Agent Standards Initiative) pontosan ezt a **nyomon-követhetőségi rést** próbálja technikai szabványokkal (ügynök-azonosítás, hitelesítés) áthidalni.
:::::

::::: callout label="Egy mondatban"
A hagyományos, "fejlesztő-üzemeltető-felhasználó" felelősségi lánc egyre nehezebben alkalmazható, ahogy az AI-rendszerek **önállóbbá és több lépésben cselekvővé** válnak — ez az egyik legégetőbb, még megoldatlan jogi kérdés az egész AI-szabályozási térben.
:::::
::::::

:::::: section id=ai-regulation-liability-4 num="04" heading="4. rész — Hová szeretnének eljutni a döntéshozók" nav="Hová szeretnének eljutni a döntéshozók" group="Referencia"

<p class="topic-tagline">Cél: lásd a két, egymásnak feszülő célt, ami a legtöbb AI-szabályozási vitát mozgatja.</p>

### Két, versengő prioritás

::::: compare
::: good label="Innováció és versenyképesség"
Az amerikai kormányzat explicit céljai közt szerepel a **"globális AI-dominancia fenntartása"**, a **"minimálisan terhelő"** szabályozási keret, és a **töredezett állami szabályozás** felváltása egy egységes, kevésbé megterhelő szövetségi kerettel — a hangsúly az innováció gyorsaságán van.
:::
::: bad label="Elszámoltathatóság és védelem"
Az EU modellje, valamint számos amerikai állam és nemzetközi testület (Szingapúr IMDA-ja, Anglia Jogi Bizottsága) a **gyermekvédelemre, közösségi védelemre, kiszámítható felelősségi keretekre** helyezi a hangsúlyt — még akkor is, ha ez lassabb bevezetést vagy magasabb megfelelőségi költséget jelent.
:::
:::::

::::: callout label="Az amerikai keret konkrét céljai"
A 2026 márciusi Fehér Házi szakpolitikai keret (National Policy Framework) explicit célokként nevezi meg: gyermekbiztonság, közösségi védelem, szólásszabadság, innováció, munkaerő-felkészültség, és **célzott szövetségi felülbírálás** — miközben kifejezetten óva int a **"homályos szabványoktól, korlátlan felelősségtől és a szabályozási széttöredezettségtől"**.
:::::

::::: callout warning label="Egy konkrét, feszültséget okozó pont"
A Fehér Házi keret azt is javasolja, hogy **az államok ne büntessék** az AI-fejlesztőket **harmadik felek** jogellenes cselekedeteiért, amik az ő modelljeiket használják — ez élesen szemben áll a 3. részben látott kaliforniai AB 316 törvény szellemével, ami éppen az ellenkező irányba, a **fejlesztői felelősség szigorítása** felé mozdul. Ez a feszültség jól mutatja, hogy a "hová szeretnénk eljutni" kérdésre **nincs egységes amerikai válasz**, még kormányzati szinten sem.
:::::

::::: callout label="Egy mondatban"
A döntéshozók nem egyetlen célt követnek — egy állandó **egyensúlyozás** zajlik az innováció gyorsítása és a kiszámítható, védelmet nyújtó jogi keretek között, és ez az egyensúly **joghatóságonként, sőt kormányzati szinten belül is** eltérően alakul.
:::::
::::::

:::::: section id=ai-regulation-liability-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0. rész"
Nincs egyetlen döntéshozó — törvényhozók, végrehajtó hatalom, bíróságok és szabályozó ügynökségek együtt alakítják a jogi kereteket
::::
:::: card label="1–2. rész"
Az EU központosított, kockázat-alapú modellje (2026. augusztus 2. a kulcs-dátum) éles ellentétben az USA töredezett, állam szerint eltérő szabályozásával, ahol nincs átfogó szövetségi törvény
::::
:::: card label="3. rész"
A "felelősség-vákuum" probléma — a hagyományos fejlesztő-üzemeltető-felhasználó lánc egyre nehezebben alkalmazható autonóm AI-ügynököknél, dokumentált jogi réssel
::::
:::: card label="4. rész"
Két, egymásnak feszülő cél (innováció vs. elszámoltathatóság), ami még kormányzati szinten belül sem egységes — konkrét, ellentmondó példával (AB 316 vs. a Fehér Házi keret)
::::
:::::

<p class="topic-tagline">Kapcsolódó: az <em>AI és szerzői jog</em> (a szűkebb, de hasonlóan gyorsan változó jogi terület), az <em>Alignment és red teaming</em> (a modell-szintű biztonsági megfontolások, amik a szabályozás tárgyát képezik) és a <em>Vállalati AI</em> (a GDPR és megfelelőségi szempontok, amik gyakorlatban is érvényesülnek) tutorialok.</p>

<p class="topic-tagline" style="margin-top:12px;font-size:0.85em;opacity:0.75">* Az EU AI Act 2026. augusztus 2-i dátuma és az amerikai szövetségi szabályozás hiánya 2026 júliusi állapotot tükröz, publikus jogi elemzésekből és kormányzati forrásokból — ez a terület gyorsan változik, érdemes friss forrásból ellenőrizni a mindenkori állapotot.</p>
::::::
