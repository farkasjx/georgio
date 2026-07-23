---
page: embedding-models
title: Embedding modellek — hogyan készül a vektortér, amit használsz
sidebar_groups:
  - Elmélet
  - A tanítás
  - Gyakorlat
  - Referencia
hero:
  eyebrow: "Embedding modellek · Fejlesztői Tanulási Terv"
  title: "Embedding modellek — <em>hogyan készül a vektortér, amit használsz</em>"
  lead: "A Vektor adatbázisok tutorial megmutatta, hogyan HASZNÁLJ egy embedding modellt — ez a cikk azt nézi meg, hogyan KÉSZÜL az a modell, ami ezeket a vektorokat generálja. Miért nem ugyanaz egy embedding modell, mint egy csevegésre tanított LLM, és miért van szükség egy külön tanítási célra, nem elég a pretraining önmagában."
  stats:
    - { val: "384–4096", lbl: "tipikus dimenzió*" }
    - { val: "70,58", lbl: "MTEB-pontszám (Qwen3 Embedding)*" }
    - { val: "5", lbl: "Szakasz" }
    - { val: "100×+", lbl: "kisebb, mint egy LLM" }
footer:
  left: "AI Hub · Embedding modellek"
  right: "Embedding modellek · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#embedding-models-0"><div class="tc-num">0. rész</div><div class="tc-name">Miért kell külön modell erre</div><div class="tc-desc">Egy LLM nem "automatikusan" jó embedding-generátor.</div></a>
  <a class="toc-card" href="#embedding-models-1"><div class="tc-num">1. rész</div><div class="tc-name">A kontrasztív tanulás alapötlete</div><div class="tc-desc">Húzd közel a hasonlót, told el a különbözőt.</div></a>
  <a class="toc-card" href="#embedding-models-2"><div class="tc-num">2. rész</div><div class="tc-name">Honnan jönnek a pozitív/negatív párok</div><div class="tc-desc">A tanítóadat, ami a teret formálja.</div></a>
  <a class="toc-card" href="#embedding-models-3"><div class="tc-num">3. rész</div><div class="tc-name">LLM-ből embedding modell</div><div class="tc-desc">Amikor egy nagy, meglévő modellt alakítanak át.</div></a>
  <a class="toc-card" href="#embedding-models-4"><div class="tc-num">4. rész</div><div class="tc-name">Mérés: az MTEB benchmark</div><div class="tc-desc">Hogyan hasonlítják össze az embedding modelleket.</div></a>
</div>
::::::

:::::: section id=embedding-models-0 num="00" heading="0. rész — Miért kell külön modell erre" nav="Miért kell külön modell erre" group="Elmélet"

<p class="topic-tagline">Cél: értsd meg, miért nem elég egy általános LLM-et "csak úgy" embedding-generálásra használni.</p>

### Két különböző tanítási cél

A <em>Hogyan tanul egy modell</em> tutorialban látott pretraining a "jósold meg a következő szót" célra optimalizál — ez remek szöveggeneráláshoz, de **nem garantálja**, hogy a modell belső reprezentációi jól rendezettek lennének **hasonlóság szerint**. Egy jó embedding modellnél az a konkrét elvárás, hogy **hasonló jelentésű** szövegek vektorai **közel** legyenek egymáshoz, a különbözőek pedig **távol** — ezt a pretraining önmagában nem biztosítja megbízhatóan.

::::: callout label="Az analógia"
Egy általános LLM olyan, mint egy sokoldalú séf, aki remekül főz bármit — egy embedding modell olyan, mint egy specialista, aki **csak** azt csinálja, hogy megkóstol két ételt, és megmondja, mennyire hasonlítanak egymásra. A kettő **rokon** tudásra épül, de más a végső, élesre csiszolt képesség.
:::::

::::: callout label="Egy mondatban"
Egy embedding modell nem "véletlenül jó" a hasonlóság-mérésben — ez egy **külön, tudatos tanítási célra** optimalizált modell, amit a következő részben tárgyalt technikával érnek el.
:::::
::::::

:::::: section id=embedding-models-1 num="01" heading="1. rész — A kontrasztív tanulás alapötlete" nav="A kontrasztív tanulás alapötlete" group="A tanítás"

<p class="topic-tagline">Cél: értsd meg a konkrét tanítási mechanizmust, ami a jó embedding-teret létrehozza.</p>

### Húzd közel, told el

A leggyakoribb módszer a **kontrasztív tanulás** (contrastive learning) — a <em>Hogyan tanul egy modell</em> tutorialban megismert "jósolj → mérd a hibát → korrigálj" hurok itt egy speciális feladatra fut:

::::: stack-grid
:::: card label="1 · Pozitív pár"
A modell két, **jelentésben hasonló** szöveget kap (pl. egy kérdést és a rá adott helyes választ, vagy ugyanannak a mondatnak két, kicsit átfogalmazott verzióját).
::::
:::: card label="2 · Negatív pár"
Ezzel egy időben **nem-releváns** szövegeket is kap — ezeket a modellnek **távol** kell tartania a pozitív pártól a vektortérben.
::::
:::: card label="3 · A hiba és a korrekció"
A loss function (jellemzően **InfoNCE** vagy hasonló) számszerűsíti, mennyire vannak közel/távol a vektorok a kívánthoz képest — a gradiens ezt korrigálja, apránként "áthúzva" a hasonló szövegeket egymás mellé.
::::
:::::

::::: callout label="Egy mondatban"
A kontrasztív tanulás nem más, mint a már ismert gradiens-alapú tanítási hurok, csak a "helyes válasz" itt nem egy szó, hanem egy **relatív pozíció** a vektortérben — közelebb a hasonlóhoz, távolabb a különbözőtől.
:::::
::::::

:::::: section id=embedding-models-2 num="02" heading="2. rész — Honnan jönnek a pozitív/negatív párok" nav="Honnan jönnek a pozitív/negatív párok" group="A tanítás"

<p class="topic-tagline">Cél: értsd meg, honnan ered a tanítóadat, ami ezt a folyamatot lehetővé teszi.</p>

### A tanítóadat forrásai

::::: compare
::: good label="Természetes, meglévő párok"
Kérdés-válasz oldalak, dokumentum-címsor és -bekezdés párok, fordítási párok — ezek **eleve létező**, emberi eredetű szövegpárok, amiknél a "hasonlóság" definíció szerint adott.
:::
::: bad label="Szintetikus, generált párok"
Ahogy a <em>Hogyan tanul egy modell</em> tutorial 5. részében a szöveggenerálásnál is látott distillation technika: egy nagy LLM-et **megkérnek**, generáljon hasonló-különböző szövegpárokat — ez a módszer, amit pl. az E5 embedding modell tanításánál is használtak, dokumentáltan **1,3 milliárd** párt tartalmazó korpuszt hozott létre.
:::
:::::

::::: callout label="A \"same-tower negatives\" trükk"
Egyes modernebb embedding modellek nemcsak a kérdés-válasz pár közti negatívokat használják, hanem **ugyanabból a kötegből (batch) más kérdéseket és más válaszokat is** negatívként párosítanak — ez akár **háromszor több** negatív példát ad ugyanannyi adatból, ami dokumentáltan jobb minőségű embeddingekhez vezethet.
:::::

::::: callout label="Egy mondatban"
Az embedding modell minősége nagyrészt a **tanítópárok minőségén és mennyiségén** múlik — ez ugyanaz az elv, amit a <em>Hogyan tanul egy modell</em> tutorialban a "kis vs. nagy modell" résznél láttál: a gondosan válogatott adat gyakran többet ér, mint a puszta mennyiség.
:::::
::::::

:::::: section id=embedding-models-3 num="03" heading="3. rész — LLM-ből embedding modell: amikor egy nagy modellt alakítanak át" nav="LLM-ből embedding modell" group="A tanítás"

<p class="topic-tagline">Cél: ismerd meg a legújabb trendet — nem külön kell építeni, hanem egy meglévő LLM-et alakítanak át.</p>

### A hagyományos út és az újabb alternatíva

::::: compare
::: good label="Hagyományos: dedikált, kisebb encoder"
Egy **kisebb**, kifejezetten erre a célra tervezett transformer-encoder (BERT-szerű architektúra) — ez a klasszikus "sentence transformer" megközelítés, ami sokkal kisebb, mint egy teljes LLM.
:::
::: bad label="Újabb: LLM-ből átalakítva"
Egy már betanított, nagy LLM-et (pl. Mistral-7B, Qwen) **finomhangolnak** kontrasztív tanulással (gyakran a <em>Fine-tuning technikák</em> tutorialban tárgyalt LoRA-val) — így a modell megtartja a nagy LLM gazdag nyelvi tudását, de embedding-generálásra specializálódik.
:::
:::::

::::: callout label="Egy meglepő, friss kutatási irány"
Egy kutatás azt találta, hogy egy **Mixture-of-Experts** LLM (lásd a <em>Dense vs. MoE</em> tutorialt) **külön tanítás nélkül** is meglepően jó embeddingeket tud adni, ha a belső, útvonalválasztó (routing) mechanizmusát használják fel erre — ez azt sugallja, hogy egy jól betanított nagy modell "eleve tartalmaz" hasznos hasonlóság-információt, csak eddig nem így hívták le belőle.
:::::

::::: callout label="Egy mondatban"
Az embedding modellek fejlődése két irányból közelít ugyanahhoz a célhoz: vagy egy kicsi, dedikált modellt tanítanak a nulláról erre a feladatra, vagy egy nagy, már meglévő LLM-et alakítanak át rá — mindkettő a 2. részben látott kontrasztív elvet használja.
:::::
::::::

:::::: section id=embedding-models-4 num="04" heading="4. rész — Mérés: az MTEB benchmark" nav="Mérés: az MTEB benchmark" group="Referencia"

<p class="topic-tagline">Cél: kösd össze ezt a témát az Evaluation tutoriallal — hogyan mérik és hasonlítják össze az embedding modelleket.</p>

### Az embedding-világ MMLU-ja

Ahogy az <em>Evaluation</em> tutorialban látott MMLU a nyelvi modelleket, úgy méri az **MTEB** (Massive Text Embedding Benchmark) az embedding modelleket — sokféle feladaton (keresés, klaszterezés, hasonlóság-mérés) összesített pontszámmal.

::::: callout label="Konkrét, friss adat"
A **Qwen3 Embedding** (8 milliárd paraméteres) modell **70,58**-as MTEB-pontszámot ért el, 9 versengő modellt megelőzve — a legközelebbi vetélytárshoz (Google Gemini Embedding) képest **2,2%**-os előnnyel. Érdekesség: a Gemini Embedding modell dokumentáltan **szinte azonos** vektort ad a "macska" szóra angolul és kínaiul, de a "kutya" szóra **eltérőt** ad hindi nyelven — ez jól mutatja, hogy a nyelvek közti konzisztencia sem automatikus, ez is a tanítóadat és a módszer függvénye.
:::::

::::: callout warning label="Ugyanaz a figyelmeztetés, mint az Evaluation tutorialban"
Az MTEB-pontszám is csak egy **összesített, sokféle feladatot átlagoló** szám — ha a te konkrét használati eseted (pl. jogi dokumentum-keresés magyarul) eltér az MTEB tesztkészletétől, érdemes a <em>Evaluation</em> tutorial 5. részében leírt elvet követni: építs egy kis, saját, releváns tesztkészletet.
:::::

::::: callout label="Egy mondatban"
Az embedding modellek mérése ugyanazokkal a korlátokkal küzd, mint a nyelvi modelleké — egy magas MTEB-pontszám jó kiindulópont, de nem helyettesíti a saját adatodon való kipróbálást.
:::::
::::::

:::::: section id=embedding-models-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0. rész"
Egy embedding modell nem "véletlenül jó" hasonlóság-mérésben — külön, tudatos tanítási célra optimalizálják
::::
:::: card label="1–2. rész"
A kontrasztív tanulás mechanizmusa (pozitív/negatív párok, húzás-tolás) · a tanítóadat forrásai (természetes és szintetikus párok, "same-tower negatives")
::::
:::: card label="3. rész"
Két fejlesztési út: dedikált, kisebb encoder vs. egy nagy LLM átalakítása embedding-generátorrá (LoRA-val vagy anélkül)
::::
:::: card label="4. rész"
Az MTEB benchmark mint az embedding-világ MMLU-ja, konkrét, friss pontszámokkal — és ugyanaz a figyelmeztetés, mint az Evaluation tutorialban
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>Vektor adatbázisok</em> (hogyan HASZNÁLD a kész embedding modellt), a <em>Hogyan tanul egy modell</em> (az alapul szolgáló gradiens-hurok), a <em>Fine-tuning technikák</em> (LoRA mint az LLM-ből embedding modell átalakítás eszköze) és az <em>Evaluation</em> (a benchmarkok korlátai, amik itt is érvényesek) tutorialok.</p>

<p class="topic-tagline" style="margin-top:12px;font-size:0.85em;opacity:0.75">* A dimenzió-tartomány és az MTEB-pontszám 2026-os, publikusan dokumentált embedding modellekből származik — lásd a 4. részt a kontextusért.</p>
::::::
