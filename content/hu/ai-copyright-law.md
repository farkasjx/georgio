---
page: ai-copyright-law
title: AI és szerzői jog — hol tart most a jogi csata
sidebar_groups:
  - A két kérdés
  - A tanítási per
  - A kimenet kérdése
  - Referencia
hero:
  eyebrow: "AI és szerzői jog · Fejlesztői Tanulási Terv"
  title: "AI és szerzői jog — <em>hol tart most a jogi csata</em>"
  lead: "Ha valaha hallottad, hogy \"az AI-cégeket beperelték szerzői jogsértésért\" — ez két, teljesen különböző jogi kérdést takar: szabad-e szerzői joggal védett művön tanítani egy modellt, és kié a szerzői jog azon, amit egy AI generál. 2026 közepére mindkét kérdésben vannak már konkrét, mértékadó bírói döntések — ez a cikk összefoglalja, hol tart most mindkettő."
  stats:
    - { val: "1,5 mrd $", lbl: "Anthropic-egyezség összege*" }
    - { val: "2026. márc.", lbl: "a Legfelsőbb Bíróság végleges döntése*" }
    - { val: "5", lbl: "Szakasz" }
    - { val: "2", lbl: "külön jogi kérdés, amit nem szabad összekeverni" }
footer:
  left: "AI Hub · AI és szerzői jog"
  right: "AI és szerzői jog · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#ai-copyright-law-0"><div class="tc-num">0. rész</div><div class="tc-name">Két kérdés, amit nem szabad összekeverni</div><div class="tc-desc">Tanítás vs. kimenet — teljesen más jogi probléma.</div></a>
  <a class="toc-card" href="#ai-copyright-law-1"><div class="tc-num">1. rész</div><div class="tc-name">Szabad-e szerzői jogvédett művön tanítani?</div><div class="tc-desc">A fair use négy tényezője, és amit a bíróságok eddig mondtak.</div></a>
  <a class="toc-card" href="#ai-copyright-law-2"><div class="tc-num">2. rész</div><div class="tc-name">A nagy per: Bartz kontra Anthropic</div><div class="tc-desc">Tanítás jogos, kalózkodás nem — egy 1,5 milliárd dolláros egyezség.</div></a>
  <a class="toc-card" href="#ai-copyright-law-3"><div class="tc-num">3. rész</div><div class="tc-name">Kié a szerzői jog egy AI-generált tartalmon?</div><div class="tc-desc">Az emberi szerzőség követelménye, végleg lezárva.</div></a>
  <a class="toc-card" href="#ai-copyright-law-4"><div class="tc-num">4. rész</div><div class="tc-name">Merre tart ez az egész</div><div class="tc-desc">Licencelési piac, joghatósági eltérések, a jövő.</div></a>
</div>
::::::

:::::: section id=ai-copyright-law-0 num="00" heading="0. rész — Két kérdés, amit nem szabad összekeverni" nav="Két kérdés, amit nem szabad összekeverni" group="A két kérdés"

<p class="topic-tagline">Cél: tisztázd a két, gyakran összemosott jogi kérdést, mielőtt bármelyikbe belemennénk.</p>

### A tanítás kérdése és a kimenet kérdése

::::: callout label="Az első kérdés: szabad-e tanítani?"
Amikor egy AI-cég **szerzői jogvédett könyveken, cikkeken, képeken** tanítja a modelljét, ez **szerzői jogsértés**-e, vagy a "fair use" (méltányos használat) doktrína alá esik? Ez az a kérdés, amiről a legtöbb nagy per (New York Times, szerzők csoportjai, Getty Images) szól.
:::::

::::: callout label="A második kérdés: kié a kimenet?"
Amikor egy AI **generál** valamit (szöveget, képet, kódot), **ki a szerzője** ennek jogilag? Te, aki a promptot írtad? A modell? Senki? Ez egy **teljesen más** jogi kérdés, amivel az USA Szerzői Jogi Hivatala (Copyright Office) és a bíróságok külön foglalkoztak.
:::::

::::: callout label="Egy mondatban"
Ha valaki azt mondja, "az AI jogi helyzete tisztázatlan", érdemes megkérdezni, melyik kérdésről beszél — a tanítás kérdésében is, a kimenet kérdésében is más és más a jelenlegi, 2026-os állapot, ahogy a következő részek mutatják.
:::::
::::::

:::::: section id=ai-copyright-law-1 num="01" heading="1. rész — Szabad-e szerzői jogvédett művön tanítani?" nav="Szabad-e tanítani?" group="A tanítási per"

<p class="topic-tagline">Cél: ismerd meg a jogi tesztet, amit a bíróságok erre a kérdésre alkalmaznak.</p>

### A négy-tényezős fair use teszt

::::: callout label="A klasszikus amerikai keret"
Az amerikai bíróságok a hagyományos, **négy-tényezős fair use tesztet** (17 U.S.C. §107) alkalmazzák az AI-tanításra is: (1) a felhasználás célja és jellege (mennyire "átalakító" / transzformatív), (2) az eredeti mű természete, (3) a felhasznált rész mennyisége, (4) a piaci hatás.
:::::

### Egymásnak ellentmondó bírói döntések

::::: callout warning label="Három bíró, három eredmény"
2025-ben három amerikai szövetségi bíró döntött ebben a kérdésben — **eltérő eredménnyel**: Alsup bíró (Bartz-ügy) és Chhabria bíró (Kadrey-ügy) a **tanítást fair use-nak** találta a konkrét ügy tényei alapján, míg Bibas bíró (Thomson Reuters kontra Ross Intelligence) **fair use ellen** döntött — igaz, ez utóbbi nem generatív AI-t, hanem egy jogi keresőeszközt érintett.
:::::

::::: callout danger label="A piaci kár, mint kulcs-tényező"
Egy fontos, dokumentált bírói érv: ha egy AI-modell **elárasztja a piacot** hasonló tartalommal, és ezzel **aláássa** az eredeti szerzők piacát, ez pontosan az a kár, amit a fair use elemzés meg akar akadályozni — ez az egyik legerősebb érv a szerzők oldalán, még ha egy konkrét ügyben (Kadrey kontra Meta) a bíróság végül a bizonyítékok hiánya miatt a Meta javára is döntött.
:::::

::::: callout label="Egy mondatban"
A "szabad-e tanítani szerzői jogvédett anyagon" kérdésre a 2026-os válasz: **attól függ** — a konkrét tényektől és a joghatóságtól, nem egy egyetlen, mindenre érvényes szabálytól.
:::::
::::::

:::::: section id=ai-copyright-law-2 num="02" heading="2. rész — A nagy per: Bartz kontra Anthropic" nav="A nagy per: Bartz kontra Anthropic" group="A tanítási per"

<p class="topic-tagline">Cél: ismerd meg a legfontosabb, precedens-értékű esetet, ami a jövőbeli perek kereteit adja.</p>

### A kulcs-megkülönböztetés

::::: callout label="Amit a bíróság szétválasztott"
Alsup bíró 2025 júniusi döntése egy fontos megkülönböztetést tett: **a tanítás maga** (a modell megtanul a szövegen) **fair use**, de a **kalózkodás** (a tanítóadat jogtalan megszerzése, pl. kalóz-könyvtárakból) **nem az** — ez a "kettévágott" (bifurcated) döntés lett az a keret, amiben azóta minden szerzői per navigál.
:::::

### Az egyezség konkrét számai

::::: callout danger label="1,5 milliárd dollár, kb. 482 000 műre"
A per végül **1,5 milliárd dolláros egyezséggel** zárult — ez kb. **482 000 mű**re vonatkozik, ami **kb. 3 113 dollár/mű** implikált árat ad. Ez az első konkrét, per-műre vetített árazási referenciapont hasonló ügyekhez.
:::::

::::: callout warning label="Miért fontos ez a szám másoknak is"
A törvényi kártérítés (statutory damages) elméletileg **akár 150 000 dollár/műig** is terjedhetne — ez azt jelenti, az egyezség az elméleti maximum kb. **2,1%-án** rendeződött. Ez egy **hiteles padlóértéket** ad más felperesi ügyvédeknek a jövőbeli egyezségi tárgyalásokhoz — a zeneipar hasonló, jelentős pere (zenei kiadók kontra Anthropic, ugyanazzal a kalózkodási elmélettel) is erre a "játékkönyvre" épít.
:::::

::::: callout label="Egy mondatban"
A Bartz-ügy nem azt mondta ki, hogy "az AI-tanítás legális" — azt mondta ki, hogy **a tanítás és a tanítóadat beszerzésének módja** két külön jogi kérdés, és csak az utóbbi vezetett felelősséghez ebben a konkrét ügyben.
:::::
::::::

:::::: section id=ai-copyright-law-3 num="03" heading="3. rész — Kié a szerzői jog egy AI-generált tartalmon?" nav="Kié a szerzői jog" group="A kimenet kérdése"

<p class="topic-tagline">Cél: ismerd meg a most már véglegesen lezárt amerikai jogi állapotot a kimenet kérdésében.</p>

### Az emberi szerzőség követelménye

::::: callout label="A hivatalos amerikai álláspont"
Az USA Szerzői Jogi Hivatala (Copyright Office) következetesen azt az álláspontot képviseli: **emberi szerzőség szükséges** a szerzői jogi védelemhez — ha egy mű **teljes egészében** AI generálta, nem regisztrálható szerzői jogként.
:::::

### A végleges bírói döntés: Thaler kontra Perlmutter

::::: callout danger label="A Legfelsőbb Bíróság 2026 márciusi döntése"
Stephen Thaler egy AI által, állítása szerint "autonóm módon" alkotott képre próbált szerzői jogot bejegyeztetni. A DC Circuit fellebbviteli bíróság elutasította a kérelmét, és **2026. március 2-án a Legfelsőbb Bíróság elutasította az ügy felülvizsgálatát** — ezzel az emberi szerzőség követelménye most már **véglegesen letisztult, biztos jogi ténynek** számít az Egyesült Államokban.
:::::

::::: callout warning label="Amit ez NEM jelent"
A bíróság kifejezetten tisztázta: az emberi szerzőség követelménye **nem tiltja** az AI **segítségével** készült munkák szerzői jogi védelmét — csak azt követeli meg, hogy legyen **egy emberi szerző**, aki létrehozta, irányította vagy használta az AI-t, ne maga a gép legyen a "szerző". A puszta promptolás (bármilyen részletes is) viszont **nem elegendő** ehhez.
:::::

::::: callout label="Egy mondatban"
2026 közepére az amerikai jogi helyzet a kimenet kérdésében **letisztult**: tisztán AI-generált mű nem védhető szerzői joggal, de egy ember **jelentős kreatív hozzájárulása** (nem csak a prompt megírása) a végeredményhez már megalapozhatja a védelmet — bár azt, mi számít "jelentősnek", esetről esetre kell eldönteni.
:::::
::::::

:::::: section id=ai-copyright-law-4 num="04" heading="4. rész — Merre tart ez az egész" nav="Merre tart ez az egész" group="Referencia"

<p class="topic-tagline">Cél: lásd, milyen irányba mozdul a helyzet, túl az egyedi pereken.</p>

### A kialakuló licencelési piac

::::: callout label="Egy új iparág, ami a jogbizonytalanságból nőtt ki"
A perek nyomására egy egész **licencelési ökoszisztéma** alakult ki: **aggregátor piacterek** (amik kiadókat gyűjtenek össze és licencelnek kollektíven az AI-laboroknak), és **közvetlen kiadó-lab megállapodások** (pl. News Corp és az OpenAI között) — ez azt mutatja, hogy a piac a per-kockázat elkerülésére **kereskedelmi megoldásokat** keres, nem várja meg a jogi tisztázást.
:::::

### A joghatósági szakadék

::::: callout warning label="Nem globálisan egységes a válasz"
Amíg az amerikai bíróságok **eset-specifikus, piaci kár-alapú** tesztet alkalmaznak, **Németországban** a Müncheni Regionális Bíróság **elutasította** a fair use amerikai megfelelőjét a GEMA kontra OpenAI ügyben — ez azt jelenti, hogy a **hol fejleszted a modelledet** döntés jogilag is releváns lehet, ami egyfajta "szabályozási arbitrázs" kockázatot hordoz.
:::::

::::: callout label="A dokumentáció szerepe, ami egyre fontosabbá válik"
Azok az AI-cégek, amik **tiszta, dokumentált licencelési láncot** tudnak felmutatni a tanítóadatukhoz, jobban túlélik a bíróság elé kerülő kereseteket és jobb feltételeket kapnak az egyezségeknél, mint azok, akiknek a tanítóadat-pipeline-ja **rosszul dokumentált vagy kalózkodással érintett**.
:::::

::::: callout label="Egy mondatban"
A jogi bizonytalanság nem oldódott meg, hanem **kereskedelmi válaszokat** hozott (licencelési piac) és **stratégiai szempontot** adott (joghatóság-választás, dokumentáció) — miközben az appellátus bíróságok (a Harmadik Körzeti Fellebbviteli Bíróság a Thomson Reuters-ügyben) most alakítják ki az első, magasabb szintű precedenseket.
:::::
::::::

:::::: section id=ai-copyright-law-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0. rész"
Két külön jogi kérdés: szabad-e tanítani szerzői jogvédett anyagon, és kié a szerzői jog egy AI-generált kimeneten
::::
:::: card label="1–2. rész"
A négy-tényezős fair use teszt, egymásnak ellentmondó bírói döntések, és a Bartz kontra Anthropic ügy 1,5 milliárd dolláros egyezsége, ami szétválasztotta a tanítás és a kalózkodás kérdését
::::
:::: card label="3. rész"
Az emberi szerzőség követelménye véglegesen letisztult az USA-ban (Thaler kontra Perlmutter, 2026. március) — tiszta AI-generálás nem védhető, jelentős emberi hozzájárulás igen
::::
:::: card label="4. rész"
A kialakuló licencelési piac és a joghatósági eltérések (pl. Németország), amik stratégiai szempontokat adnak a jogi bizonytalanság mellé
::::
:::::

<p class="topic-tagline">Kapcsolódó: az <em>AI szabályozás és jogi felelősség</em> (a szélesebb, nem csak szerzői jogi kérdéseket tárgyaló testvér-cikk), az <em>Alignment és red teaming</em> (a modell-szintű megbízhatóság kérdései) és a <em>Nyílt súlyú modellek</em> (a licencelés, ami itt is releváns szempont) tutorialok.</p>

<p class="topic-tagline" style="margin-top:12px;font-size:0.85em;opacity:0.75">* Az 1,5 milliárd dolláros egyezségi összeg és a Legfelsőbb Bíróság 2026. március 2-i döntése 2026-os, publikus jogi elemzésekből és sajtóforrásokból származik — lásd a 2. és 3. részt a kontextusért. A jogi helyzet folyamatosan változik, ez a cikk 2026 júliusi állapotot tükröz.</p>
::::::
