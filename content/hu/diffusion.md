---
page: diffusion
title: Diffúziós modellek — egy másik generálási elv
sidebar_groups:
  - Elmélet
  - Kontraszt
  - Referencia
hero:
  eyebrow: "Diffúziós modellek · Kitekintés"
  title: "Diffúziós modellek — <em>egy másik generálási elv</em>"
  lead: "Ez az oldal főleg LLM-ekkel foglalkozik — de az AI-generálásnak van egy másik, teljesen más elven működő ága is, ami a legtöbb kép- és videógeneráló eszköz (Midjourney, Stable Diffusion, Sora) mögött áll. Ez egy rövid kitekintés, nem teljes tutorial: a lényeg, hogy tudd, ez is létezik, és nagyjából hogyan működik — plusz egy meglepő fordulat a végén, ahol ez az elv visszaszivárog a szöveggenerálásba is."
  stats:
    - { val: "2", lbl: "Fő fázis" }
    - { val: "5", lbl: "Szakasz" }
    - { val: "5×", lbl: "gyorsabb (diffúziós LLM)*" }
    - { val: "kitekintés", lbl: "Mélység" }
footer:
  left: "AI Hub · Diffúziós modellek"
  right: "Diffúziós modellek · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#diffusion-0"><div class="tc-num">0. rész</div><div class="tc-name">Két teljesen más elv</div><div class="tc-desc">Jóslás szóról szóra vs. bontás zajból — a kiindulópont.</div></a>
  <a class="toc-card" href="#diffusion-1"><div class="tc-num">1. rész</div><div class="tc-name">Hogyan működik: zaj oda, zaj vissza</div><div class="tc-desc">Forward és reverse folyamat — a lényeg, matek nélkül.</div></a>
  <a class="toc-card" href="#diffusion-2"><div class="tc-num">2. rész</div><div class="tc-name">Miért pont ez jó képhez</div><div class="tc-desc">Globális koherencia — nem sorban, hanem egészében készül.</div></a>
  <a class="toc-card" href="#diffusion-3"><div class="tc-num">3. rész</div><div class="tc-name">A meglepetés: diffúziós LLM-ek</div><div class="tc-desc">Amikor ez az elv visszaszivárog a szöveggenerálásba.</div></a>
  <a class="toc-card" href="#diffusion-4"><div class="tc-num">4. rész</div><div class="tc-name">Mikor melyiket</div><div class="tc-desc">Gyors döntési támpont — nem kell mélyebbre menni.</div></a>
</div>
::::::

:::::: section id=diffusion-0 num="00" heading="0. rész — Két teljesen más elv, ugyanahhoz a célhoz" nav="Két teljesen más elv" group="Elmélet"

<p class="topic-tagline">Cél: lásd a legfontosabb, elvi különbséget — a részletek nélkül is ez viszi a legtöbbet.</p>

### Ahogy egy LLM eddig generált — és ahogy egy diffúziós modell

Minden eddigi tutorialban (lásd a <em>Reasoning</em> tutorialt) a modell **szóról szóra, sorban** épített fel egy választ — minden token a korábbiak alapján, balról jobbra. Egy diffúziós modell ehhez képest **teljesen máshogy** old meg egy generálási feladatot:

::::: compare
::: good label="LLM — autoregresszív"
Egy token → a következő token, mindig az eddig leírtak alapján. A folyamat **sorban** halad, és egy korábbi szó nem módosul, miután leírtad.
:::
::: bad label="Diffúziós modell — nem sorban"
A teljes kimenet (egy kép minden pixele, vagy egy hang teljes hossza) **egyszerre**, tiszta zajként indul, és lépésről lépésre, **globálisan** bontakozik ki belőle a végeredmény — nincs "első" vagy "utolsó" rész, ami elkészül.
:::
:::::

::::: callout label="Egy mondatban"
Az LLM egy mondatot **ír**, szóról szóra; a diffúziós modell egy képet (vagy hangot) **előhív a zajból**, egészében finomítva — ez a két, alapvetően különböző generálási filozófia áll a mai AI-eszközök mögött.
:::::
::::::

:::::: section id=diffusion-1 num="01" heading="1. rész — Hogyan működik: zaj oda, zaj vissza" nav="Hogyan működik" group="Elmélet"

<p class="topic-tagline">Cél: értsd a két fázist — ennyi elég a lényeg megértéséhez, matek nélkül.</p>

### A két fázis

::::: stack-grid
:::: card label="1 · Forward — zajosítás (csak tanításkor)"
A tanítás során a modell valódi képeket néz, és **fokozatosan, lépésről lépésre zajt ad hozzájuk**, amíg tiszta, felismerhetetlen "hó" nem marad belőlük. Ez maga a tanítási trükk: a modell megtanulja, **milyen zajt** adtak hozzá minden egyes lépésben.
::::
:::: card label="2 · Reverse — zajmentesítés (ez történik, amikor te generálsz)"
Amikor te kérsz egy képet, a modell **színtiszta véletlen zajból indul**, és ezt a megtanult zajmentesítést ismételve, lépésről lépésre **egyre tisztább, egyre koherensebb** képpé alakítja — addig, amíg egy felismerhető kép nem marad.
::::
:::::

::::: callout label="Az analógia, ami segít"
Képzeld el, hogy egy fényképet lassan, sok lépésben belemerítesz a statikus zajba, amíg semmi nem látszik belőle — ez a forward folyamat. A modell pontosan ezt tanulja meg **visszafelé**: hogyan lehet egy zajos képből, lépésről lépésre, visszanyerni valami koherenset. Generáláskor csak a visszafelé irányt használod, egy vadonatúj, véletlen zajból indulva.
:::::

::::: callout label="Egy mondatban"
A "varázslat" nem abban van, hogy a modell "kitalálja" a képet egyetlen lépésben — hanem abban, hogy **sok apró, tanult zajmentesítő lépés** összeadva alakítja koherens képpé a véletlen zajt.
:::::
::::::

:::::: section id=diffusion-2 num="02" heading="2. rész — Miért pont ez jó képhez és hanghoz" nav="Miért pont ez jó képhez" group="Kontraszt"

<p class="topic-tagline">Cél: értsd meg, miért nem "csak egy másik módszer" ez, hanem miért illik jól a feladathoz.</p>

### A globális koherencia előnye

Mivel a diffúziós modell a **teljes** képet egyszerre finomítja minden lépésben (nem pixelről pixelre, sorban), könnyebben tart fenn **globális konzisztenciát** — pl. hogy a fényforrás iránya minden árnyékon ugyanaz legyen, vagy hogy egy arc két oldala összeillő legyen. Egy szóról-szóra generáló megközelítésnek ehhez képest nehezebb lenne "visszamenni" és módosítani egy már "leírt" pixelt, ha a kép egy másik része ezt utólag indokolttá tenné.

::::: callout label="Egy mondatban"
A diffúziós modellek azért lettek a kép- és videógenerálás uralkodó módszerei (Midjourney, Stable Diffusion, Sora és hasonlók mind ezt az elvet használják), mert a **globális, egészében történő finomítás** jobban illik ahhoz a feladathoz, ahol a kimenet minden része összefügg a többivel — nem ahhoz, mint egy mondat, ahol van egy természetes, sorban haladó olvasási irány.
:::::
::::::

:::::: section id=diffusion-3 num="03" heading="3. rész — A meglepetés: amikor a diffúzió visszaszivárog a szövegbe" nav="A meglepetés: diffúziós LLM-ek" group="Kontraszt"

<p class="topic-tagline">Cél: lásd, hogy ez a "másik" elv nem marad zárt kategóriában — kezdi visszahatni az LLM-világra is.</p>

### Diffúziós szöveggenerálás — igen, ez is létezik

2025-ben megjelentek az első kereskedelmi **diffúziós nyelvi modellek** (dLLM-ek) — ezek a 0–1. részben látott zajmentesítő elvet alkalmazzák **szövegre**, nem képre. Ahelyett, hogy szóról szóra, balról jobbra generálnának, egy **teljes szövegblokkot** finomítanak egyszerre, több körben.

::::: callout label="Konkrét, mért sebességelőny"
A Mercury Coder (2025 februárjában, az első kereskedelmi diffúziós nyelvi modell) H100 GPU-n **1109 token/másodperc** sebességet ért el — ez **5–10-szer gyorsabb**, mint egy hasonló méretű, hagyományos autoregresszív modell. A Google Gemini Diffusion (2025 májusában bemutatva) kb. **ötször gyorsabb** volt, mint a Gemini 2.0 Flash Lite, miközben a kódolási benchmarkokon (HumanEval, MBPP) **gyakorlatilag azonos** pontszámot ért el, mint az autoregresszív megfelelője.
:::::

### Miért pont ez a sebességelőny — és mi az ára

::::: compare
::: good label="✓ Ahol a dLLM-ek nyernek"
Rövid, jól strukturált kimenetek (kódrészletek, SQL, regex), és a **fill-in-the-middle** jellegű feladatok (egy kód közepébe kell illeszteni valamit) — mert a diffúziós modell nem csak "előre" tud nézni, hanem a teljes blokkot egyszerre kezeli, oda-vissza.
:::
::: bad label="✗ Ahol még lemaradnak"
Összetett, többlépéses következtetés (lásd a <em>Reasoning</em> tutorialt), hosszú, koherens szövegek és a szigorú formai megkötések betartása — 2026 közepén a diffúziós LLM-ek ezeken a területeken **még elmaradnak** az autoregresszív modellek mögött.
:::
:::::

::::: callout label="Egy mondatban"
A diffúzió nem maradt "csak kép- és videógenerálás" — a mögötte álló elv (teljes blokk egyszerre, iteratív finomítással) elkezdett **visszaszivárogni** a szöveggenerálásba is, elsősorban ott, ahol a sebesség fontosabb, mint a mély, soklépéses következtetés.
:::::
::::::

:::::: section id=diffusion-4 num="04" heading="4. rész — Mikor melyiket: gyors összegzés" nav="Mikor melyiket" group="Referencia"

<p class="topic-tagline">Cél: egy mondatos döntési támpont, nem több — ez egy kitekintés, nem egy külön tutorial.</p>

::::: stack-grid
:::: card label="Kép, videó, hang generálása"
Ez ma szinte kizárólag diffúziós modellek területe — ha valaha kép- vagy videógeneráló eszközzel dolgozol, azt valószínűleg egy diffúziós architektúra hajtja a háttérben.
::::
:::: card label="Szöveg és kód generálása"
Ez ma még túlnyomórészt az autoregresszív LLM-ek területe (amiről ez az egész oldal szól) — a diffúziós LLM-ek egy gyors növekedésű, de még niche kiegészítő ág, elsősorban sebesség-kritikus, rövid kimeneteknél.
::::
:::::

::::: callout label="Amivel érdemes elmenned innen"
Nem kell megjegyezned a forward/reverse folyamat matematikáját — csak azt, hogy **két, alapvetően eltérő generálási filozófia** létezik egymás mellett, és hogy a határvonal köztük (kép/videó = diffúzió, szöveg = autoregresszív) **kezd elmosódni**, ahogy 2026-ban a diffúziós LLM-ek egyre inkább termékérett technológiává válnak.
:::::
::::::

:::::: section id=diffusion-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A kitekintés végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0–1. rész"
Az LLM szóról szóra, sorban generál; a diffúziós modell a teljes kimenetet zajból bontja ki, lépésről lépésre, globálisan finomítva
::::
:::: card label="2. rész"
Ezért illik jól kép/videó/hang generálásához: a globális koherencia (fényirány, arc-szimmetria) könnyebben megtartható, mint szóról-szóra haladva
::::
:::: card label="3. rész"
A meglepetés: 2025 óta léteznek diffúziós **szöveg**generáló modellek is (Mercury, Gemini Diffusion) — 5–10× gyorsabbak rövid, strukturált kimeneteknél, de elmaradnak összetett következtetésben
::::
:::: card label="4. rész"
Gyakorlati ökölszabály: kép/videó/hang generálása → szinte mindig diffúzió; szöveg és összetett következtetés → egyelőre még az autoregresszív LLM-eké
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>Reasoning</em> (hogyan generál egy hagyományos, autoregresszív LLM) és a <em>Multimodális modellek</em> (hogyan dolgozza fel egy modell a képet vagy hangot bemenetként — ez a cikk a generálásról szól, az a megértésről) tutorialok.</p>

<p class="topic-tagline" style="margin-top:12px;font-size:0.85em;opacity:0.75">* Az 5×-ös és a Mercury/Gemini Diffusion sebességadatok gyártói és független benchmarkokból származnak (2025–2026) — lásd a 3. részt a kontextusért.</p>
::::::
