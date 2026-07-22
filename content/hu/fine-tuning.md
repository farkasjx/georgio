---
page: fine-tuning
title: Fine-tuning technikák — LoRA, QLoRA és a specializáció
sidebar_groups:
  - Elmélet
  - A technikák
  - Gyakorlat
  - Referencia
hero:
  eyebrow: "Fine-tuning · Fejlesztői Tanulási Terv"
  title: "Fine-tuning technikák — <em>LoRA, QLoRA és a specializáció</em>"
  lead: "A <em>Hogyan tanul egy modell</em> tutorial megmutatta, mennyibe kerül egy modellt nulláról betanítani — milliónyi GPU-óra, több millió dollár. A jó hír: a legtöbb esetben erre nincs szükséged. Ez a cikk azt mutatja meg, hogyan specializálhatsz egy már betanított modellt egy törtrésznyi költségért — a teljes finomhangolástól a LoRA \"kis mátrix\" trükkjéig. Épít a <em>Hogyan tanul egy modell</em>, a <em>Kvantálás</em> és a <em>Knowledge cutoff</em> tutorialokra."
  stats:
    - { val: "10 000×", lbl: "kevesebb paraméter (LoRA)*" }
    - { val: "48GB", lbl: "GPU elég 65B modellhez (QLoRA)" }
    - { val: "8", lbl: "Szakasz" }
    - { val: "1-5%", lbl: "a pretraining költségének" }
footer:
  left: "AI Hub · Fine-tuning technikák"
  right: "Fine-tuning · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#fine-tuning-0"><div class="tc-num">0. rész</div><div class="tc-name">Miért nem nulláról indulunk</div><div class="tc-desc">A transfer learning alapötlete.</div></a>
  <a class="toc-card" href="#fine-tuning-1"><div class="tc-num">1. rész</div><div class="tc-name">A teljes fine-tuning és a memória-fal</div><div class="tc-desc">Miért drága még ez is, ha a modell nagy.</div></a>
  <a class="toc-card" href="#fine-tuning-2"><div class="tc-num">2. rész</div><div class="tc-name">LoRA: a kis mátrix trükk</div><div class="tc-desc">Fagyott súlyok, és egy apró, tanulható "javítás".</div></a>
  <a class="toc-card" href="#fine-tuning-3"><div class="tc-num">3. rész</div><div class="tc-name">QLoRA: kvantálás + LoRA</div><div class="tc-desc">Amikor egyetlen fogyasztói GPU is elég lehet.</div></a>
  <a class="toc-card" href="#fine-tuning-4"><div class="tc-num">4. rész</div><div class="tc-name">Más PEFT-technikák röviden</div><div class="tc-desc">Adapter, prefix-tuning — a LoRA rokonai.</div></a>
  <a class="toc-card" href="#fine-tuning-5"><div class="tc-num">5. rész</div><div class="tc-name">A felejtés kockázata</div><div class="tc-desc">Miért véd (részben) a LoRA a catastrophic forgetting ellen.</div></a>
  <a class="toc-card" href="#fine-tuning-6"><div class="tc-num">6. rész</div><div class="tc-name">Döntési keret</div><div class="tc-desc">Melyik technikát mikor válaszd.</div></a>
</div>
::::::

:::::: section id=fine-tuning-0 num="00" heading="0. rész — Miért nem nulláról indulunk: a transfer learning alapötlete" nav="Miért nem nulláról indulunk" group="Elmélet"

<p class="topic-tagline">Cél: értsd meg, miért éri meg majdnem mindig egy meglévő modellre építeni.</p>

### Az arányok, amik mindent eldöntenek

A <em>Hogyan tanul egy modell</em> tutorial 2. részében látott számok — 1,72 millió GPU-óra, több százezer dolláros áramszámla egyetlen modellért — teszik egyértelművé, miért nem tanít nulláról szinte senki. A **fine-tuning** (finomhangolás) ehhez képest egy már **kész, sok általános tudással rendelkező** modellt vesz alapul, és **csak egy szűkebb feladatra** specializálja tovább.

::::: callout label="Konkrét arány"
A fine-tuning dokumentáltan a pretraining költségének mindössze **1–5%-át** emészti fel — egy olyan modell finomhangolása, mint a Llama 2, jellemzően **5000–50 000 dollárba** kerül, szemben a **100 millió dolláros** nagyságrendű pretraining-gel. Ez **1000–10 000-szeres** költségkülönbség.
:::::

### Mit "örökölsz" a base/instruct modelltől

::::: callout label="Amit a fine-tuning ténylegesen csinál"
A <em>Base vs. Instruct modell</em> tutorialban látott, már betanított súlyokból indulsz — ezek már tudják a nyelv szerkezetét, rengeteg tényszerű tudást és (ha instruct modellből indulsz) az alapvető beszélgetési viselkedést. A fine-tuning **erre az alapra épít**, és csak azt a szűk réteget hangolja tovább, ami a te konkrét feladatodhoz kell.
:::::

::::: callout label="Egy mondatban"
A fine-tuning nem "kisebb tanítás" — hanem egy **teljesen más gazdasági logika**: kihasználod, hogy valaki más már kifizette a drága, általános tudást megalapozó lépést, és te csak a hangolást fizeted.
:::::
::::::

:::::: section id=fine-tuning-1 num="01" heading="1. rész — A teljes fine-tuning és a memória-fal" nav="A teljes fine-tuning és a memória-fal" group="Elmélet"

<p class="topic-tagline">Cél: értsd meg, miért drága még a fine-tuning is, ha "teljes" módon csinálod egy nagy modellen.</p>

### Miért nem elég csak "kisebb" a fine-tuning adathalmaza

A **teljes fine-tuning** (full fine-tuning) technikailag ugyanazt a <em>Hogyan tanul egy modell</em> tutorial 3. részében látott hurkot futtatja — forward, loss, backward, frissítés —, csak most a modell **összes** súlyát frissíti, nem csak egy részét.

::::: callout danger label="A memória-probléma konkrétan"
Egy 7 milliárd paraméteres modell **16 bites** pontosságban már **14 GB memóriát** foglal el **csak a súlyoknak** — de a tanításhoz ezen felül kell hely az **optimalizáló állapotainak** és a **gradienseknek** is, amik könnyen a súlyok memóriaigényének **több szörösét** is kitehetik. Egy nagyobb, 65 milliárd paraméteres modell teljes fine-tuningja emiatt gyakran **több, nagy VRAM-mal rendelkező GPU-t** igényel egyszerre.
:::::

### Mikor éri meg mégis a teljes fine-tuning

::::: callout warning label="Nem mindig a parameter-efficient a jobb választás"
Kutatások szerint a **parameter-efficient** módszerek (mint a 2. részben tárgyalt LoRA) alacsony és közepes erőforrás-keretek közt jellemzően jól teljesítenek — de **magas erőforrás-keretek** mellett a teljes fine-tuning néha **felülmúlhatja** őket. Ha van rá kereted, és a feladat elég eltér a modell eredeti képességeitől, a teljes fine-tuning továbbra is jogos választás marad.
:::::

::::: callout label="Egy mondatban"
A teljes fine-tuning **működik**, de a memória-igénye majdnem akkora falat állít, mint maga a pretraining — ez a fal az, amit a következő részben látott LoRA-trükk kerül meg.
:::::
::::::

:::::: section id=fine-tuning-2 num="02" heading="2. rész — LoRA: a kis mátrix trükk" nav="LoRA: a kis mátrix trükk" group="A technikák"

<p class="topic-tagline">Cél: értsd meg pontosan, technikailag mit csinál a LoRA — mátrix-méretekkel, képlet nélkül.</p>

### A kulcsfelismerés

A **LoRA** (Low-Rank Adaptation) mögötti megfigyelés: amikor egy modellt finomhangolsz, a szükséges **változás** a súlyokban (nem maguk a súlyok, hanem a *módosítás*, amit rájuk alkalmaznál) tipikusan **sokkal egyszerűbb szerkezetű**, mint amennyi szabadságfokot egy teljes súlymátrix megengedne.

::::: callout label="A trükk, amatőr-analógiával"
Ha a teljes fine-tuning egy **teljes könyv újraírása** lenne, a LoRA ehhez képest **margószéli jegyzeteket** ad hozzá, amik módosítják az értelmezést — anélkül, hogy az eredeti szöveget egyáltalán megérintenéd.
:::::

### Hogyan néz ez ki gyakorlatban

::::: stack-grid
:::: card label="1 · A bázis-súly fagyott marad"
Az eredeti, nagy súlymátrix (jelöljük W-nek) **változatlan** marad a teljes fine-tuning alatt — nem kap gradienst, nem frissül.
::::
:::: card label="2 · Két kicsi, tanulható mátrix"
A módosítást két, **jóval kisebb** mátrix szorzata adja — ezeket tanítja a fine-tuning, nem az eredeti W-t.
::::
:::: card label="3 · A kettő összeadva adja a végeredményt"
Kimenet = (bemenet × fagyott W) + (bemenet × a két kis mátrix szorzata) — a gradiens **csak** a kis mátrixokon folyik át.
::::
:::::

::::: callout label="Konkrét számpélda"
Egy 4096×4096-os súlymátrixnál a teljes finomhangolás **16,7 millió** paramétert érintene. Egy LoRA-adapter (rank=16 beállítással) ugyanide mindössze **kb. 131 ezer** tanítható paramétert vezet be — **128-szoros** csökkenés. Nagyobb, konkrét esetben (GPT-3 175B) a dokumentált csökkenés **10 000-szeres** volt a paraméterszámban, és **3-szoros** a GPU-memória igényben.
:::::

::::: callout label="Egy mondatban"
A LoRA nem "kevésbé alapos" fine-tuning — hanem egy megfigyelésre épülő trükk: a szükséges módosítás **kis szerkezetű**, ezért egy sokkal kisebb, tanítható "javítás" hozzáadásával a fő súlyok érintése nélkül is elérhető a hangolás.
:::::
::::::

:::::: section id=fine-tuning-3 num="03" heading="3. rész — QLoRA: kvantálás + LoRA" nav="QLoRA: kvantálás + LoRA" group="A technikák"

<p class="topic-tagline">Cél: lásd, hogyan kombinálódik a LoRA a Kvantálás tutorialban tanultakkal egy még nagyobb memória-megtakarításért.</p>

### Egy réteggel tovább

A **QLoRA** a 2. részben látott LoRA-trükkre épít, és hozzáad egy második optimalizálást: a **fagyott** bázis-súlyokat (amiken egyáltalán nem folyik tanítás) a <em>Kvantálás</em> tutorialban megismert módon **4 bites** pontosságra tömöríti — miközben a LoRA két kis, tanítható mátrixa **16 bites** pontosságban marad.

::::: callout label="Miért biztonságos ez a kombináció"
Mivel a bázis-súlyok **egyáltalán nem** kapnak gradienst (lásd a 2. részt), a kvantálásukból eredő pontosságvesztés **nem halmozódik** a tanítás során — a gradiens csak a 16 bites LoRA-mátrixokon folyik át, azok pedig teljes pontossággal tanulnak.
:::::

### A konkrét, elérhetőséget megváltoztató szám

::::: callout danger label="Amit ez lehetővé tesz"
A QLoRA dokumentáltan lehetővé tette egy **65 milliárd paraméteres** modell finomhangolását **egyetlen, 48 GB memóriájú GPU-n** — ami a teljes fine-tuninghoz szükséges, több, nagy VRAM-mal rendelkező GPU-s beállításhoz képest hatalmas elérhetőség-javulás. Egy dokumentált kísérlet egy 4 bitesre előre kvantált modellt egyetlen, mindössze **16 GB memóriájú fogyasztói GPU-n** (NVIDIA T4) finomhangolt sikeresen **7 óra** alatt.
:::::

::::: callout label="Egy mondatban"
A QLoRA azt a kérdést válaszolja meg, hogy "hogyan férjen bele a fine-tuning egyetlen, otthon vagy egy ingyenes felhő-GPU-n elérhető kártyára" — a LoRA csökkenti a **tanítandó** paraméterek számát, a kvantálás pedig a **fagyott** bázis-modell memóriaigényét (lásd a <em>Kvantálás és minőség</em> tutorialt a részletekért).
:::::
::::::

:::::: section id=fine-tuning-4 num="04" heading="4. rész — Más PEFT-technikák röviden: a LoRA rokonai" nav="Más PEFT-technikák röviden" group="A technikák"

<p class="topic-tagline">Cél: tudj a LoRA-n kívüli alternatívákról is — anélkül, hogy mindegyikbe mélyen belemennénk.</p>

### A parameter-efficient fine-tuning (PEFT) családja

A LoRA csak **egy** tagja egy szélesebb technika-családnak, amit összefoglalóan **PEFT**-nek (Parameter-Efficient Fine-Tuning) hívnak — mindegyik ugyanazt a célt szolgálja (kevesebb tanítható paraméter), csak más mechanizmussal:

::::: stack-grid
:::: card label="Adapter tuning"
Kis, tanítható rétegeket **illeszt be** a transformer blokkok közé (nem a meglévő súlyok mellé, mint a LoRA, hanem **sorban**, közéjük). Hátránya: extra számítási lépést ad hozzá, ami lassíthatja az inferenciát.
::::
:::: card label="Prefix / Prompt tuning"
Nem a súlyokhoz nyúl, hanem **tanulható "virtuális tokeneket"** told a bemenet elé — a modell ezekből "olvassa ki" a feladat-specifikus kontextust, miközben a teljes modell fagyott marad.
::::
:::: card label="BitFit"
Egy szélsőségesen minimalista megközelítés: **csak** a modell torzítás-paramétereit (bias) hangolja, a súlymátrixokat egyáltalán nem érinti.
::::
:::::

::::: callout warning label="Miért lett mégis a LoRA a de facto alapértelmezés"
A LoRA egyik gyakorlati előnye, hogy tanítás **után** az adapter **összeolvasztható** (merge-elhető) az eredeti súlyokkal — így az inferencia során **nincs extra késleltetés**, szemben az adapter tuning-gal, ahol a beillesztett rétegek végig ott maradnak a számítási útban.
:::::

::::: callout label="Egy mondatban"
Ha csak egyetlen PEFT-technikát tanulsz meg, legyen az a LoRA (és a QLoRA) — ez vált a gyakorlati alapértelmezéssé pont azért, mert nem lassítja az inferenciát, és a legtöbb éles eszköz (Hugging Face PEFT, Unsloth) ezt támogatja elsődlegesen.
:::::
::::::

:::::: section id=fine-tuning-5 num="05" heading="5. rész — A felejtés kockázata: miért véd (részben) a LoRA" nav="A felejtés kockázata" group="Referencia"

<p class="topic-tagline">Cél: kösd össze ezt a témát a Knowledge cutoff tutorialban már megismert catastrophic forgetting jelenséggel.</p>

### Rövid emlékeztető, aztán a LoRA-specifikus rész

A <em>Knowledge cutoff</em> tutorial 2. része már részletesen tárgyalja a **catastrophic forgetting** jelenségét: ha egy modellt tovább tanítasz, a gradiens-frissítések felülírhatják a régi tudáshoz szükséges súlyokat. Ez a cikk itt nem ismétli meg azt a tárgyalást — csak azt teszi hozzá, amit kifejezetten a **LoRA-ra nézve** érdemes tudni.

::::: callout label="Miért kevésbé sérülékeny (de nem immunis) a LoRA"
Mivel a LoRA a bázis-súlyokat **teljesen fagyva** hagyja (lásd 2. rész), és csak egy kis, mellé illesztett mátrixot tanít, a modell **eredeti, általános tudása szerkezetileg védettebb** marad, mint egy teljes fine-tuningnál, ahol minden súly mozoghat. Ez nem jelenti azt, hogy a LoRA-val tanított viselkedés ne tudná "elnyomni" a régi tudást bizonyos promptoknál — csak azt, hogy maga az **alapul szolgáló súlyhalmaz** érintetlen marad, és az adapter eltávolításával a modell pontosan visszaáll az eredeti állapotába.
:::::

::::: callout label="Egy mondatban"
A LoRA egyik alábecsült előnye, hogy **reverzibilis**: mivel a bázis-súlyok sosem változnak, egy rosszul sikerült finomhangolás egyszerűen "levehető" — ezzel szemben egy teljes fine-tuningnál a felülírt súlyokat nem lehet csak úgy visszaállítani.
:::::
::::::

:::::: section id=fine-tuning-6 num="06" heading="6. rész — Döntési keret: melyik technikát mikor válaszd" nav="Döntési keret" group="Gyakorlat"

<p class="topic-tagline">Cél: adj egy gyakorlati, azonnal használható döntési támpontot.</p>

| Helyzet | Ajánlott technika |
|---|---|
| Van bőven GPU-kereted, és a feladat nagyon eltér a modell eredeti képességeitől | Teljes fine-tuning |
| Fogyasztói GPU-d van (16–24 GB VRAM), specializált feladatra hangolnál | LoRA |
| Csak egy nagyon korlátozott GPU-hoz férsz hozzá (pl. ingyenes felhő-instance) | QLoRA |
| Több, egymással versengő feladat-verziót akarsz ugyanazon a bázis-modellen tárolni | LoRA (az adapterek kicserélhetők, a bázis-modell egy marad) |
| A legkisebb lehetséges memória-lábnyomot keresed, és a feladat nagyon egyszerű | BitFit vagy prompt tuning |

::::: callout warning label="Egy gyakorlati ökölszabály"
Kezdd LoRA-val — ez a legtöbb, konzumer-hardveren futtatható fine-tuning feladat de facto alapértelmezése 2026-ban. Csak akkor válts teljes fine-tuningra, ha konkrét, mért bizonyítékod van arra, hogy a LoRA minőségi korlátot jelent a te feladatodnál — ez a legtöbb esetben **nem** így van: a dokumentált összehasonlítások szerint a LoRA gyakran a teljes fine-tuninghoz **nagyon közeli**, néha **jobb** eredményt ad, egy töredéknyi paraméterrel.
:::::
::::::

:::::: section id=fine-tuning-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0–1. rész"
Miért éri meg majdnem mindig meglévő modellre építeni (1000–10 000× olcsóbb, mint a pretraining) · miért drága még a teljes fine-tuning is nagy modelleknél
::::
:::: card label="2–3. rész"
A LoRA "kis mátrix" trükkje konkrét számokkal (128×, 10 000× paraméter-csökkenés) · a QLoRA kvantálással kombinálva (65B modell egyetlen 48GB GPU-n)
::::
:::: card label="4–5. rész"
Más PEFT-technikák (adapter, prefix-tuning, BitFit) és miért a LoRA lett mégis az alapértelmezés · a LoRA reverzibilitása és részleges védelme a catastrophic forgetting ellen
::::
:::: card label="6. rész"
Gyakorlati döntési tábla: mikor melyik technikát válaszd a rendelkezésre álló hardver és a feladat alapján
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>Hogyan tanul egy modell</em> (az alap tanítási mechanizmus, amire a fine-tuning épül), a <em>Base vs. Instruct modell</em> (mit "örökölsz" a kiindulási modelltől), a <em>Kvantálás és minőség</em> (a QLoRA második összetevője) és a <em>Knowledge cutoff</em> (a catastrophic forgetting részletes tárgyalása) tutorialok.</p>

<p class="topic-tagline" style="margin-top:12px;font-size:0.85em;opacity:0.75">* A 10 000×-es paraméter-csökkenés a GPT-3 175B-n dokumentált LoRA-eredmény — lásd a 2. részt a kontextusért.</p>
::::::
