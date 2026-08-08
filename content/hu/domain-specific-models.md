---
page: domain-specific-models
title: Speciális területre tanított modellek
sidebar_groups:
  - Elmélet
  - A három út
  - A felejtés kockázata
  - Referencia
hero:
  eyebrow: "Domain-specifikus modellek · Fejlesztői Tanulási Terv"
  title: "Speciális területre <em>tanított modellek</em>"
  lead: "A Kódoló modellek tutorial egy konkrét esetet mutatott be — ez a cikk az általánosabb kérdésre válaszol: hogyan specializálsz egy modellt bármilyen szűk területre (jog, orvoslás, pénzügy), milyen architektúrák illenek ehhez, és miért nem mindig a teljes újratanítás vagy a sima fine-tuning a jó válasz."
  stats:
    - { val: "3", lbl: "fő út a specializáláshoz" }
    - { val: "5-20%", lbl: "replay-adat a felejtés ellen*" }
    - { val: "6", lbl: "Szakasz" }
    - { val: "1e-5 – 5e-5", lbl: "tipikus tanulási ráta CPT-nél*" }
footer:
  left: "AI Hub · Domain-specifikus modellek"
  right: "Domain-specifikus modellek · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#domain-specific-models-0"><div class="tc-num">0. rész</div><div class="tc-name">Miért nem elég egy általános modell mindenhez</div><div class="tc-desc">A szűk szaknyelv és a hiányzó mélységi tudás problémája.</div></a>
  <a class="toc-card" href="#domain-specific-models-1"><div class="tc-num">1. rész</div><div class="tc-name">Három út a specializáláshoz</div><div class="tc-desc">Nulláról tanítás, folytatott pretraining, fine-tuning — mikor melyik.</div></a>
  <a class="toc-card" href="#domain-specific-models-2"><div class="tc-num">2. rész</div><div class="tc-name">A köztes út: Domain-Adaptive Pretraining</div><div class="tc-desc">Amikor a fine-tuning nem elég, de a nulláról tanítás túl sok.</div></a>
  <a class="toc-card" href="#domain-specific-models-3"><div class="tc-num">3. rész</div><div class="tc-name">A catastrophic forgetting kockázata</div><div class="tc-desc">Amikor a specializálás közben a modell elfelejt "általánosan gondolkodni".</div></a>
  <a class="toc-card" href="#domain-specific-models-4"><div class="tc-num">4. rész</div><div class="tc-name">Konkrét esetek: orvoslás, jog, pénzügy</div><div class="tc-desc">Mi különbözteti meg egymástól ezeket a domain-eket.</div></a>
  <a class="toc-card" href="#domain-specific-models-5"><div class="tc-num">5. rész</div><div class="tc-name">Döntési keret: melyik utat válaszd</div><div class="tc-desc">Konkrét szempontok a saját projektedhez.</div></a>
</div>
::::::

:::::: section id=domain-specific-models-0 num="00" heading="0. rész — Miért nem elég egy általános modell mindenhez" nav="Miért nem elég egy általános modell" group="Elmélet"

<p class="topic-tagline">Cél: érts meg egy konkrét okot, amiért egyáltalán specializált modellekre van szükség.</p>

### A szűk szaknyelv és a hiányzó mélységi tudás

::::: callout label="A probléma, ami minden szűk területen visszatér"
Egy általános célú, a <em>Nyílt súlyú modellek</em> tutorialban tárgyalt modell **széles**, de nem **mély** tudással rendelkezik — egy jogi, orvosi vagy pénzügyi szakterület specifikus terminológiáját, kontextusát és következtetési mintáit csak **felszínesen** ismeri, mert a tanítóadatában ezek csak kis arányban voltak jelen.
:::::

### A korai, klasszikus előzmény

::::: callout label="Nem új probléma — csak nagyobb léptékben"
A domain-specifikus specializálás nem az LLM-korszak találmánya — a **BioBERT**, **ClinicalBERT** és **SciBERT** modellek már a BERT-korszakban (2019-2020) demonstrálták, hogy egy általános nyelvi modell **folytatott tanítása** egy szűk területen jelentősen javítja a teljesítményt azon a területen — az elv ugyanaz maradt, csak a mai modellek nagyságrendekkel nagyobbak.
:::::

::::: callout label="Egy mondatban"
Egy általános modell "tudja, hogy létezik" egy szakterület, de egy specializált modell **mélyen ismeri** annak szaknyelvét és tipikus következtetési mintáit — ez a különbség, amiért a specializálás egyáltalán megéri.
:::::
::::::

:::::: section id=domain-specific-models-1 num="01" heading="1. rész — Három út a specializáláshoz" nav="Három út a specializáláshoz" group="A három út"

<p class="topic-tagline">Cél: ismerd meg a három fő stratégiát, és a köztük lévő alapvető kompromisszumot.</p>

### A három út, költség szerint növekvő sorrendben

::::: stack-grid
:::: card label="1 · Fine-tuning egy meglévő modellen"
A <em>Fine-tuning technikák</em> tutorialban megismert LoRA/QLoRA-alapú specializálás — **órák, nem hetek**, viszonylag kevés (ezres-tízezres) domain-specifikus adatpont is elég lehet.
::::
:::: card label="2 · Domain-Adaptive Pretraining (DAPT)"
Egy köztes út — **tovább tanítod** a modellt egy nagy, domain-specifikus **korpuszon** (nem célfeladat-specifikus adaton), mielőtt fine-tuningolnád — ezt a 2. rész tárgyalja részletesen.
::::
:::: card label="3 · Nulláról tanítás, domain-specifikus adaton"
A <em>Saját, puritán modell</em> tutorialban megismert teljes pretraining, csak a tanítóadat **kizárólag** a domain-re szűkítve — ez a legdrágább, és ritkán indokolt, kivéve ha a domain nyelve/struktúrája **radikálisan** eltér az általános szövegtől.
::::
:::::

::::: callout warning label="Mikor NEM éri meg a nulláról tanítás"
A BloombergGPT (pénzügyi domain, nulláról tanítva) egy dokumentált, tanulságos eset: hatalmas erőforrás-ráfordítás ellenére a végeredmény **nem múlta felül jelentősen** a hasonló méretű, általános modellek finomhangolt verzióit — ez azt mutatja, hogy a "nulláról, csak domain-adaton" stratégia gyakran **nem** adja meg a ráfordításhoz mért extra teljesítményt.
:::::

::::: callout label="Egy mondatban"
A három út közti választás alapvetően egy **erőforrás vs. mélység** kompromisszum — minél mélyebb, radikálisabb specializálás kell, annál drágább út szükséges, de a legdrágább út nem mindig adja a legjobb eredményt.
:::::
::::::

:::::: section id=domain-specific-models-2 num="02" heading="2. rész — A köztes út: Domain-Adaptive Pretraining" nav="A köztes út: DAPT" group="A három út"

<p class="topic-tagline">Cél: érts meg részletesen a legkevésbé ismert, de gyakran legjobb ár-érték arányú stratégiát.</p>

### Mi különbözteti meg a sima fine-tuningtól

::::: callout label="A DAPT lényege"
A **Domain-Adaptive Pretraining** (DAPT, más néven Continued Pretraining/CPT) a modellt **ugyanazzal a célfüggvénnyel** (következő token jóslása), amit az eredeti pretraining is használt, **tovább tanítja** egy nagy, domain-specifikus, de **feladat-specifikusan nem címkézett** korpuszon — pl. az összes elérhető orvosi szakcikk, nem egy konkrét "diagnosztizáld ezt" feladatra felkészített adatkészlet.
:::::

::::: callout label="Miért jön ez a fine-tuning ELŐTT, nem helyette"
A tipikus, gyakorlatban bevált sorrend: **1)** DAPT egy nagy, domain-szövegen (a modell megtanulja a szaknyelvet, a tipikus mondatszerkezeteket), **2)** ezután SFT/fine-tuning egy kisebb, feladat-specifikus adathalmazon (lásd a <em>Fine-tuning technikák</em> tutorialt) — a DAPT adja meg a "mélyebb ismertséget", a fine-tuning pedig a konkrét feladatra való "élesítést".
:::::

### A modern eszköztár

::::: callout label="Milyen keretrendszerekkel csinálják 2026-ban"
A gyakorlatban használt eszközök közé tartozik a **Megatron-LM**, a **DeepSpeed**, az **Axolotl**, az **NVIDIA NeMo** és az **Unsloth** — ezek mind támogatják a nagy léptékű, elosztott (multi-GPU) folytatott tanítást, gyakran LoRA-szerű, paraméter-hatékony módszerekkel kombinálva.
:::::

::::: callout label="Egy mondatban"
A DAPT egy tudatos középút: nem annyira drága, mint a nulláról tanítás, de **mélyebb** specializálást ad, mint egy önmagában alkalmazott fine-tuning — jellemzően a kettő **kombinációja** (DAPT, majd fine-tuning) adja a legjobb eredményt.
:::::
::::::

:::::: section id=domain-specific-models-3 num="03" heading="3. rész — A catastrophic forgetting kockázata" nav="A catastrophic forgetting kockázata" group="A felejtés kockázata"

<p class="topic-tagline">Cél: ismerd meg a legfontosabb kockázatot, ami minden folytatott tanításnál felmerül, és a konkrét mitigálási technikákat.</p>

### A jelenség

::::: callout danger label="Amikor a specializálás árat követel"
A <em>Knowledge cutoff</em> tutorialban érintett **catastrophic forgetting** itt konkrét, gyakorlati kockázatként jelenik meg: ha egy modellt túl agresszíven, túl sokáig tanítasz egy szűk domain-en, **elveszítheti** az általános képességeit (pl. egy orvosi szakterületre specializált modell hirtelen rosszabbul teljesít egy sima, hétköznapi beszélgetésben).
:::::

### Három, gyakorlatban bevált mitigáló technika

::::: stack-grid
:::: card label="1 · Replay buffer"
A domain-specifikus tanítóadatba **5-20%** arányban **általános célú** adatot (pl. a <em>Gépi tanulás alapjai</em> tutorialban megismert FineWeb-Edu mintáit) kevernek bele, hogy a modell "emlékezzen" az általános tudására tanítás közben is.
::::
:::: card label="2 · Alacsonyabb tanulási ráta"
Egy tipikus, DAPT-nál használt tanulási ráta **1×10⁻⁵ és 5×10⁻⁵** között mozog — ez jóval alacsonyabb, mint egy nulláról induló pretraining rátája, hogy a modell ne "ugorjon el" túl messze az eredeti, jól működő súlyaitól.
::::
:::: card label="3 · Paraméter-hatékony módszerek (LoRA, DoRA)"
A <em>Fine-tuning technikák</em> tutorialban megismert LoRA (és újabb variánsai, mint a DoRA vagy a LoRA-XS) **lefagyasztja** az eredeti súlyokat, és csak egy kis, kiegészítő réteget tanít — ez csökkenti a felejtés kockázatát, cserébe valamivel gyengébb domain-specifikus tanulást ad.
::::
:::::

::::: callout warning label="A méréshez kell egy külön értékelési réteg"
A specializálás sikerét **két, külön dimenzióban** kell mérni: **kapacitás-megtartás** (mennyire jó maradt az általános feladatokban, pl. a <em>Evaluation</em> tutorialban tárgyalt benchmarkokkal) és **domain-nyereség** (mennyivel jobb lett a szűk területen) — csak az egyiket mérni félrevezető lehet.
:::::

::::: callout label="Egy mondatban"
A specializálás sosem "ingyenes" — a catastrophic forgetting kockázatát tudatosan kell kezelni (replay-adat, alacsony tanulási ráta, paraméter-hatékony módszerek), és a sikert mindig **mindkét** dimenzióban (megtartás és nyereség) kell mérni.
:::::
::::::

:::::: section id=domain-specific-models-4 num="04" heading="4. rész — Konkrét esetek: orvoslás, jog, pénzügy" nav="Konkrét esetek" group="Referencia"

<p class="topic-tagline">Cél: lásd, hogyan alkalmazzák ezeket az elveket a gyakorlatban, konkrét szakterületeken.</p>

### Három domain, három hangsúly

::::: stack-grid
:::: card label="Orvoslás (Med-PaLM, ClinicalBERT)"
A hangsúly a **pontosságon és a biztonságon** van — egy hibás orvosi következtetés valós kárt okozhat, ezért itt a fine-tuning utáni **szigorú kiértékelés** (szakértői validálás) kritikusabb, mint sok más területen.
::::
:::: card label="Jog"
A hangsúly a **precíz terminológián és a hivatkozási struktúrán** van — a jogi szövegek jellemzően hosszú, egymásra hivatkozó dokumentumok, ami miatt a <em>RAG</em> tutorialban tárgyalt retrieval-alapú megközelítés gyakran **kiegészíti**, nem helyettesíti a domain-specifikus tanítást.
::::
:::: card label="Pénzügy (BloombergGPT, FinBERT)"
A hangsúly az **időérzékeny adaton** van — a pénzügyi információ gyorsan elavul, ezért a <em>Model routing</em> és a <em>RAG</em> tutorialokban tárgyalt, valós idejű adatlekérés gyakran **fontosabb**, mint a modell "belső" tudása egy adott pénzügyi tényről.
::::
:::::

::::: callout label="Egy mondatban"
Nem minden domain-specializálás egyforma — az, mire optimalizálsz elsősorban (pontosság, terminológia, frissesség), a konkrét szakterület jellegétől függ, és ez befolyásolja, mennyire éri meg a tanítás mellett retrieval-t is bevonni.
:::::
::::::

:::::: section id=domain-specific-models-5 num="05" heading="5. rész — Döntési keret: melyik utat válaszd" nav="Döntési keret" group="Referencia"

<p class="topic-tagline">Cél: adj egy konkrét, gyakorlatban használható döntési szempontrendszert.</p>

::::: callout label="A kiindulási kérdés"
Van-e **elég, jó minőségű, szűk feladatra** vonatkozó adatod (ezres-tízezres nagyságrend)? Ha igen, **kezdd a fine-tuninggal** — ez a leggyorsabb, legkevesebb kockázatú út, és sokszor ez már elég.
:::::

::::: callout warning label="Mikor lépj a DAPT felé"
Ha a fine-tuning eredménye **nem elégséges**, mert a modell **nem érti eléggé** a domain szaknyelvét (nem csak a konkrét feladatot nem tudja jól), és van hozzáférésed egy **nagy, domain-specifikus, feladat-független** korpuszhoz — ekkor éri meg a DAPT-ot beiktatni a fine-tuning elé.
:::::

::::: callout danger label="Mikor NEM éri meg a nulláról tanítás"
Csak akkor, ha **radikálisan** más a domain nyelve/struktúrája, mint bármi, amin a meglévő nyílt súlyú modellek tanultak (pl. egy ritka programozási nyelv, egy nagyon specifikus szimbolikus rendszer) — a BloombergGPT esete is azt mutatja, hogy "csak azért, mert egy szakterület fontos" nem indokolja automatikusan a nulláról tanítást.
:::::

::::: callout label="Egy mondatban"
A gyakorlatban a legtöbb domain-specializálási projekt a **fine-tuning**-nal kezdődik, és csak akkor lép feljebb (DAPT, majd ritkán teljes pretraining), ha az egyszerűbb, olcsóbb út bizonyítottan nem elégséges.
:::::
::::::

:::::: section id=domain-specific-models-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0–1. rész"
Miért nem elég egy általános modell szűk területekhez · a három fő út (fine-tuning, DAPT, nulláról tanítás), költség szerint növekvő sorrendben
::::
:::: card label="2. rész"
A Domain-Adaptive Pretraining (DAPT) mint köztes út — miért jön a fine-tuning elé, nem helyette, és a modern eszköztár
::::
:::: card label="3. rész"
A catastrophic forgetting kockázata, és három, gyakorlatban bevált mitigáló technika (replay buffer, alacsony tanulási ráta, LoRA/DoRA)
::::
:::: card label="4–5. rész"
Konkrét domain-eltérések (orvoslás, jog, pénzügy) · gyakorlati döntési keret, mikor melyik utat válaszd
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>Kódoló modellek</em> (egy konkrét, jól dokumentált domain-specializálási eset), a <em>Fine-tuning technikák</em> (a LoRA/QLoRA technikai részletei), a <em>Saját, puritán modell</em> (a legdrágább, nulláról tanítási út gyakorlati megvalósítása) és a <em>Knowledge cutoff</em> (a catastrophic forgetting rokon jelensége) tutorialok.</p>

<p class="topic-tagline" style="margin-top:12px;font-size:0.85em;opacity:0.75">* A replay-adat aránya (5-20%), a tanulási ráta tartomány (1e-5 – 5e-5) és a BloombergGPT-esettanulmány 2026-os, publikus kutatási elemzésekből származnak — lásd a 2–3. részt a kontextusért.</p>
::::::
