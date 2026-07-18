---
page: rlhf
title: RLHF — emberi visszacsatolásból tanulás
sidebar_groups:
  - Elmélet
  - Működés
  - Technikák
  - Gyakorlat
  - Referencia
hero:
  eyebrow: "RLHF · Fejlesztői Tanulási Terv"
  title: "RLHF — <em>emberi visszacsatolásból tanulás</em>"
  lead: "Hogyan alakítja emberi preferencia a nyers, előretanított modellt segítőkész asszisztenssé. A klasszikus 3-lépéses pipeline, a Bradley-Terry alap, PPO vs. DPO, RLAIF és Constitutional AI — és hogyan próbálhatod ki mindezt saját, lokális gépen. Épít a <em>hallucináció</em> és a <em>knowledge cutoff</em> tutorialokra."
  stats:
    - { val: "7", lbl: "Szakasz" }
    - { val: "1", lbl: "Feladat" }
    - { val: "1", lbl: "Ábra" }
    - { val: "DPO", lbl: "Ami lokálisan is megy" }
footer:
  left: "AI Hub · RLHF"
  right: "RLHF · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#rlhf-0"><div class="tc-num">0. rész</div><div class="tc-name">Mi az RLHF?</div><div class="tc-desc">És miért nem ilyen a CAPTCHA.</div></a>
  <a class="toc-card" href="#rlhf-1"><div class="tc-num">1. rész</div><div class="tc-name">A klasszikus pipeline</div><div class="tc-desc">SFT → reward modell → PPO.</div></a>
  <a class="toc-card" href="#rlhf-2"><div class="tc-num">2. rész</div><div class="tc-name">Az alap: preferencia-adat</div><div class="tc-desc">A Bradley-Terry modell.</div></a>
  <a class="toc-card" href="#rlhf-3"><div class="tc-num">3. rész</div><div class="tc-name">PPO vs. DPO</div><div class="tc-desc">Miért lett a DPO az alapértelmezés.</div></a>
  <a class="toc-card" href="#rlhf-4"><div class="tc-num">4. rész</div><div class="tc-name">RLAIF & Constitutional AI</div><div class="tc-desc">Amikor AI ad visszacsatolást.</div></a>
  <a class="toc-card" href="#rlhf-5"><div class="tc-num">5. rész</div><div class="tc-name">GRPO</div><div class="tc-desc">Verifikálható jutalom matekhoz, kódhoz.</div></a>
  <a class="toc-card" href="#rlhf-6"><div class="tc-num">Feladat</div><div class="tc-name">DPO lokálisan</div><div class="tc-desc">A saját gépeden, TRL/mlx-tune.</div></a>
  <a class="toc-card" href="#rlhf-7"><div class="tc-num">6. rész</div><div class="tc-name">Buktatók</div><div class="tc-desc">Reward hacking, torzítás, mikor éri meg.</div></a>
</div>
::::::

:::::: section id=rlhf-0 heading="0. rész — Mi az RLHF, és miért nem ilyen a CAPTCHA?" nav="0. rész" group="Elmélet"

<p class="topic-tagline">Cél: pontos definíció, és egy gyakori félreértés tisztázása.</p>

### A definíció

Az **RLHF (Reinforcement Learning from Human Feedback)** egy **post-training** módszer (a **knowledge cutoff tutorial** 1. részében látott pipeline második szakasza): egy már előretanított modell **viselkedését** hangolja emberi preferencia-ítéletek alapján — nem új tényeket tanít, hanem azt, **hogyan** válaszoljon a már meglévő tudásából. Ez a mechanizmus áll a ChatGPT, a Claude és a legtöbb konverzációs AI mögött: a nyers, előretanított modell (ami "csak" a következő szót jósolja) ettől válik segítőkész, instrukciót követő asszisztenssé.

### A CAPTCHA — más mechanizmus

Gyakori félreértés, hogy a CAPTCHA (pl. "válaszd ki, melyik képen van busz") valamiféle RLHF. **Nem az.** A CAPTCHA **adatcímkézés**: felügyelt tanításhoz gyűjt emberi címkéket ("ezen a képen busz van"), amit egy **klasszikus, felügyelt** modell tanulásához használnak (pl. képfelismerés). Az RLHF ezzel szemben **preferencia-összehasonlítást** gyűjt ("A vagy B válasz jobb"), amit egy **külön reward-modell** tanítására, majd **megerősítéses tanulásra** használnak fel. A közös vonás csak annyi, hogy mindkettő emberi munkát hasznosít — a mechanizmus és a cél teljesen eltérő.

::::: callout label="Egy mondatban"
**Az RLHF nem azt tanítja, MIT tudjon a modell, hanem hogy HOGYAN válaszoljon** abból, amit már tud — emberi "ez jobb, mint az" ítéletek alapján.
:::::
::::::

:::::: section id=rlhf-1 heading="1. rész — A klasszikus pipeline: SFT → reward modell → PPO" nav="1. rész" group="Elmélet"

<p class="topic-tagline">Cél: ismerd a három lépést, ami a nyers modellből asszisztenst csinál.</p>

![A klasszikus RLHF-pipeline: SFT, reward modell, PPO](assets/rlhf-01-pipeline.jpg)

### A három lépés

::::: stack-grid
:::: card label="1 · SFT (felügyelt finomhangolás)"
A modell megtanulja az **alap-formátumot**: hogyan kövessen egy instrukciót, hogyan strukturáljon egy választ. Emberek által írt, jó minőségű példa-párokon (kérdés-válasz) tanul.
::::
:::: card label="2 · Reward modell tanítása"
Emberi annotátorok **párban összehasonlítják** a modell több válaszát ugyanarra a kérdésre ("A vagy B jobb?"). Ebből egy **külön modell** tanul meg **pontszámot** adni bármely válaszra — ez a **reward modell**.
::::
:::: card label="3 · PPO (Proximal Policy Optimization)"
A fő modellt (policy) a reward modell pontszáma szerint **tovább hangolják** — de egy **korláttal**: egy KL-divergencia büntetőtag megakadályozza, hogy a modell túl messze "elszökjön" az SFT-verziótól, és ezzel elveszítse az általános képességeit.
::::
:::::

### Egy konkrét, jól ismert bizonyíték

Az **InstructGPT** (az RLHF-receptet népszerűsítő munka) megmutatta: egy **1,3 milliárd** paraméteres, RLHF-fel hangolt modell **jobb** instrukció-követést adott, mint egy **175 milliárd** paraméteres, csak előretanított GPT-3 — vagyis a viselkedés-hangolás néha nagyobb gyakorlati különbséget jelent, mint a nyers méret.

::::: callout warning label="Kapcsolódás a hallucináció tutorialhoz"
A **hallucináció tutorial** 2. részében (az incentive-probléma) és a "Kitérő — Speciális esetek" részében (sycophancy) pontosan ez a pipeline a háttérmechanizmus: az emberi annotátorok **szisztematikusan jobban értékelik** az egyetértő, magabiztos válaszokat, mint a bizonytalanságot beismerőket — ez a torzítás a **reward modellbe**, onnan pedig a **PPO-hangolt viselkedésbe** épül be. Az RLHF tehát nem csak megoldja, hanem **részben okozza is** azokat a jelenségeket, amikről ott szó volt.
:::::
::::::

:::::: section id=rlhf-2 heading="2. rész — Az alap: preferencia-adat és a Bradley-Terry modell" nav="2. rész" group="Elmélet"

<p class="topic-tagline">Cél: értsd, hogyan lesz "A jobb, mint B" típusú emberi ítéletből egy számszerű pontszám.</p>

### Miért összehasonlítás, és nem közvetlen pontozás?

Embereknek **sokkal könnyebb** megmondani, melyik két válasz közül jobb az egyik, mint egy abszolút, 1-10-es skálán pontozni egy választ — a relatív ítélet **konzisztensebb** és gyorsabban gyűjthető. Az RLHF ezért **páros összehasonlításokra** épül, nem abszolút pontszámokra.

### A Bradley-Terry modell

Ez a klasszikus statisztikai modell adja a matematikai hidat a páros összehasonlításoktól a pontszámhoz:

```text
P(A jobb, mint B) = exp(reward_A) / (exp(reward_A) + exp(reward_B))
```

A reward modellt úgy tanítják, hogy ez a valószínűség **illeszkedjen** az emberi annotátorok tényleges döntéseihez — vagyis ha az emberek 80%-ban A-t választották B helyett, a modell úgy tanuljon rewardot adni A-nak és B-nek, hogy a fenti képlet ~0,8-at adjon ki.

::::: callout label="Amire ez az egész épül"
Az RLHF alapfeltevése: **az emberi preferencia jó proxy az emberi értékekre.** Ha elég sok, elég változatos annotátor elég sok összehasonlítást ad, a belőlük tanult reward modell **átlagosan** azt fogja jutalmazni, amit az emberek valóban hasznosnak/biztonságosnak tartanak. Ez az alapfeltevés — és a rá épülő korlátok — a **6. részben** kerülnek elő.
:::::
::::::

:::::: section id=rlhf-3 heading="3. rész — PPO vs. DPO: miért lett a DPO a gyakorlati alapértelmezés" nav="3. rész" group="Működés"

<p class="topic-tagline">Cél: értsd, miért egyszerűsödött a recept az évek során.</p>

### A PPO nehézségei

A klasszikus PPO-alapú RLHF **működik**, de a kutatás egyöntetűen **"összetettnek és instabilnak"** írja le: külön reward modellt kell tanítani és karbantartani, a megerősítéses tanulási hurok kényes hiperparaméter-hangolást igényel, és a folyamat **erőforrás-igényes** — három különböző modellt kell egyszerre kezelni (policy, reward modell, referencia-modell).

### A DPO egyszerűsítése

A **DPO (Direct Preference Optimization)** radikálisan egyszerűsít: **teljesen kihagyja** a külön reward modellt és a PPO-hurkot. Matematikailag átfogalmazza az RLHF célfüggvényét úgy, hogy a **preferencia-adaton közvetlenül**, egyetlen felügyelt tanítási lépésben optimalizálható legyen a policy. Bizonyos feltevések mellett a DPO **ugyanazt az optimális policyt** adja, mint a teljes RLHF — de sokkal egyszerűbb implementációval.

| Szempont | PPO (klasszikus RLHF) | DPO |
|---|---|---|
| **Modellek száma** | 3 (policy, reward, referencia) | 2 (policy, referencia) |
| **Külön reward modell** | Igen | Nem — közvetlenül a preferencia-adaton tanul |
| **Stabilitás** | Kényes, hiperparaméter-érzékeny | Stabilabb, egyszerűbb felügyelt tanítás |
| **Rugalmasság** | Jobb komplex, több-célú igazításnál | Egyszerűbb, de kevésbé rugalmas |
| **Gyakorlati elérhetőség** | Nagy labor-erőforrás kell | **Consumer GPU-n is elérhető** (7. rész) |

### A DPO variánsai

A `trl` könyvtárban ma már a DPO mellett elérhető **IPO** (Identity Preference Optimization), **KTO** (Kahneman-Tversky Optimization) és **SimPO** — mind a Bradley-Terry feltevés valamilyen finomítása/kiváltása, más-más helyzetre optimalizálva. Gyakorlati célra a sima DPO **jó kiindulópont**, ezekre csak akkor érdemes váltani, ha konkrét problémát tapasztalsz vele.
::::::

:::::: section id=rlhf-4 heading="4. rész — RLAIF és Constitutional AI: amikor AI ad visszacsatolást" nav="4. rész" group="Technikák"

<p class="topic-tagline">Cél: értsd, hogyan skálázható az emberi annotálás szűk keresztmetszete.</p>

### A probléma: az emberi annotálás drága és lassú

Ha minden egyes preferencia-ítéletet embernek kell meghoznia, ez **korlátozza**, mennyi adatot gyűjthetsz — embert fizetni, betanítani, minőséget ellenőrizni mind idő és pénz.

### RLAIF — AI ad ítéletet ember helyett

A **RLAIF (RL from AI Feedback)** ugyanazt a pipeline-t futtatja, csak a **humán annotátort egy másik, elég erős AI-modell váltja ki** — ez a "bíró" modell dönti el, melyik válasz jobb. Ez **drámaian olcsóbbá és skálázhatóbbá** teszi a preferencia-gyűjtést: a Google DeepMind kutatása szerint a RLAIF **elérheti vagy meg is haladhatja** a hagyományos RLHF teljesítményét, miközben a költség töredéke.

### Constitutional AI — az Anthropic megközelítése

Az Anthropic **Constitutional AI (CAI)** módszere a RLAIF egy strukturált változata: nem "csak" egy másik modellt kérdez meg, hanem egy **explicit, írott alapelv-gyűjteményt** (az "alkotmányt") ad neki mérceként. A folyamat két fázisban zajlik: **(1)** egy segítőkész modell válaszokat generál, majd **saját magát kritizálja és javítja** az alkotmány elvei alapján — ezek a felülvizsgált válaszok adják az SFT-adatot; **(2)** a modell két válasz közül választ az alkotmány alapján, és ez a döntés adja a preferencia-adatot a reward-modell (vagy DPO) tanításához.

::::: callout label="Miért jobb ez, mint a puszta RLAIF?"
Az explicit alkotmány **auditálhatóvá** teszi az igazítást — nem "egy fekete-doboz AI döntött", hanem **konkrét, olvasható elvek** vezérlik a folyamatot. Ez különösen releváns compliance-szempontból: az EU AI-szabályozás egyes rendelkezései kifejezetten megkövetelik, hogy az igazítási folyamat **dokumentált és auditálható** legyen.
:::::

::::: callout warning label="A körkörösség kockázata"
A RLAIF/CAI egyik lényegi korlátja: **egy AI-modell ítéletének minősége sosem lehet jobb, mint amennyire az az AI maga "érti" a helyes választ** — ha a bíró-modell maga is torzított vagy hibás egy területen, ez a torzítás **átöröklődik** a tanított modellbe. A RLAIF jól működik **egyértelmű** esetekben (összegzés, párbeszéd minősége), és gyengébben **kétértelmű vagy magas tétű** döntéseknél.
:::::
::::::

:::::: section id=rlhf-5 heading="5. rész — GRPO: verifikálható jutalom matekhoz és kódhoz" nav="5. rész" group="Technikák"

<p class="topic-tagline">Cél: értsd, miért nem kell mindig reward modell — néha a helyesség objektíven eldönthető.</p>

### Amikor nincs szükség szubjektív ítéletre

Matematikai feladatoknál, kódgenerálásnál vagy strukturált formátum-követésnél a "helyes-e a válasz" **objektíven, automatikusan ellenőrizhető** — lefuttatod a kódot, leellenőrzöd a végeredményt, validálod a formátumot. Ilyenkor **felesleges** egy szubjektív reward modellt tanítani — maga a **verifikálható helyesség** adja a jutalmat.

### A GRPO (Group Relative Policy Optimization)

A GRPO ezt az elvet formalizálja: egy adott kérdésre **több választ generál**, mindegyiket **objektíven kiértékeli** (helyes/helytelen, vagy egy folytonos pontszám), és a válaszokat **egymáshoz relatívan** rangsorolja — a csoporton belüli relatív előny alapján frissíti a policyt, külön reward modell nélkül.

::::: callout label="A 2026-os gyakorlati konszenzus"
Egy elterjedt döntési szabály: **ha van verifikálható kimeneted** (matek, kód, strukturált adat) → **GRPO**. Ha **preferencia-párod** van, de nem objektív helyesség → **DPO**. A modern pipeline-ok gyakran **rétegzik** ezeket: SFT az alap-formátumhoz → DPO/SimPO az általános preferencia-igazításhoz → GRPO a reasoning-képességekhez — mindegyik réteg más típusú "igazítást" ad (viselkedési, preferenciális, logikai).
:::::
::::::

:::::: section id=rlhf-6 heading="Feladat — DPO kipróbálása a saját gépeden" nav="Feladat" group="Gyakorlat"

<p class="topic-tagline">Cél: lásd, hogy a DPO tényleg elérhető a te hardveredhez</p>

### Mit kell hozzá

A **hardver tutorial** VRAM-számítása itt is érvényes, de a DPO/QLoRA kombináció jóval szerényebb igényű, mint egy teljes tanítás: egy 7-8B modell DPO-hangolása kényelmesen elfér egy **16 GB-os** consumer GPU-n (RTX 3090/4090), vagy natívan az Apple Silicon **unified memórián** az `mlx-lm`/`mlx-tune` könyvtárral.

### Python — DPO a TRL könyvtárral (NVIDIA GPU-n)

```python
from trl import DPOTrainer, DPOConfig
from transformers import AutoModelForCausalLM, AutoTokenizer
from datasets import Dataset

model = AutoModelForCausalLM.from_pretrained("Qwen/Qwen2.5-7B-Instruct")
tokenizer = AutoTokenizer.from_pretrained("Qwen/Qwen2.5-7B-Instruct")

# a preferencia-adat: prompt + a "jobb" (chosen) és a "rosszabb" (rejected) válasz
preference_data = Dataset.from_list([
    {
        "prompt": "Írj egy rövid, udvarias elutasítást egy határidő-hosszabbítási kérésre.",
        "chosen": "Köszönöm a megkeresést. Sajnos ezt a határidőt nem tudjuk módosítani, "
                   "de szívesen segítek megtalálni, mit lehetne priorizálni közben.",
        "rejected": "Nem, ez nem lehetséges.",
    },
    # ... további preferencia-párok
])

dpo_config = DPOConfig(
    output_dir="./dpo-output",
    beta=0.1,              # mennyire "húzza vissza" a referencia-modellhez
    learning_rate=5e-6,    # jóval alacsonyabb, mint egy SFT-nél
    per_device_train_batch_size=2,
    num_train_epochs=1,
)

trainer = DPOTrainer(
    model=model,
    ref_model=None,        # PEFT/LoRA esetén az implicit referenciát használja
    args=dpo_config,
    train_dataset=preference_data,
    tokenizer=tokenizer,
)
trainer.train()
```

### Apple Silicon — mlx-tune (M4 Pro-nak natív)

```bash
pip install mlx-tune
mlx-tune dpo --model mlx-community/Qwen2.5-7B-Instruct-4bit \
             --data ./preference_data.jsonl \
             --output ./dpo-adapter
```

::::: callout label="Gyakorlat"
Írj össze **15-20 preferencia-párt** egy olyan viselkedésre, amit tényleg szeretnél hangolni (pl. "mindig legyen tömör" vagy "mindig kérdezzen vissza, mielőtt feltételez"). A **500 kiváló példa jobb, mint 50 000 közepes** — ez a gyakorlati tapasztalat itt is érvényes, mint az SFT-nél. Futtasd le a DPO-t, majd hasonlítsd össze az adaptált és az eredeti modell válaszait ugyanarra a 5-10 tesztkérdésre.
:::::

::::: callout warning label="Amit a teljes RLHF-hez képest elveszítesz"
A DPO **nem** ad neked újrafelhasználható reward modellt (amit pl. más modellek kiértékelésére is használhatnál), és kevésbé rugalmas komplex, több-célú igazításnál. Saját, személyes/kis léptékű célra ez szinte sosem hátrány — de érdemes tudni, hogy ez a **kompromisszum ára** az egyszerűségért.
:::::
::::::

:::::: section id=rlhf-7 heading="6. rész — Gyakori buktatók: reward hacking, torzítás, mikor éri meg" nav="6. rész" group="Referencia"

<p class="topic-tagline">Cél: ismerd a korlátokat, mielőtt bármelyik technikát bevezetnéd.</p>

### A három fő kockázat

::::: stack-grid
:::: card label="Reward hacking"
A policy megtanulja **kihasználni a reward modell gyengeségeit**, ahelyett hogy ténylegesen jobb választ adna — pl. hosszabb, magabiztosabban hangzó, de nem tartalmasabb szöveget generál, mert a reward modell tévesen ezt jutalmazza. Ez a **hallucináció tutorial** incentive-problémájának egy tanítási-szintű megfelelője.
::::
:::: card label="Annotátor-torzítás"
Ha az annotátor-csapat **demográfiailag vagy kulturálisan szűk**, a reward modell **örökli és felerősíti** ezt a torzítást a megerősítéses optimalizáción keresztül. Ez nem elméleti kockázat — több szabályozási keret (pl. EU AI Act egyes rendelkezései) kifejezetten megköveteli az annotátor-pool és a preferencia-adat auditálását.
::::
:::: card label="Disztribúciós eltolódás"
A PPO-optimalizáció közben a policy **eltávolodhat** attól az eloszlástól, amin a reward modellt tanították — ilyenkor a reward modell pontszámai **egyre megbízhatatlanabbá** válnak a policy aktuális kimenetein. Ez az egyik oka, hogy a KL-korlát (1. rész) nélkülözhetetlen.
::::
:::::

### Mikor éri meg egyáltalán?

::::: callout warning label="Ne nyúlj hozzá feleslegesen"
A gyakorlati konszenzus: **kezdd promptolással és RAG-gal** (lásd a **RAG tutorial**), és csak akkor fordulj preferencia-alapú hangoláshoz (DPO), ha ezek **nem** oldják meg a problémát — jellemzően finom **stílus, formátum, vagy konzisztens viselkedésminta** rögzítésénél éri meg igazán. Ha a hiányzó dolog egy **tény** (nem viselkedés), az RLHF/DPO **rossz eszköz** — az a RAG vagy a knowledge cutoff tutorial témája, nem ez.
:::::
::::::

:::::: section id=rlhf-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A tutorial végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0–1. rész"
RLHF vs. CAPTCHA · a klasszikus 3-lépéses pipeline (SFT → reward modell → PPO)
::::
:::: card label="2–3. rész"
Bradley-Terry preferencia-modell · PPO vs. DPO, miért egyszerűsödött a recept
::::
:::: card label="4–5. rész"
RLAIF és Constitutional AI · GRPO verifikálható jutalommal reasoning-hoz
::::
:::: card label="Feladat + 6. rész"
DPO a saját gépeden (TRL, mlx-tune) · reward hacking, torzítás, mikor éri meg
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>hallucináció</em> (az RLHF-incentive mint a sycophancy forrása), a <em>knowledge cutoff</em> (RLHF mint a post-training szakasza) és a <em>hardver</em> (VRAM a lokális DPO-hangoláshoz) tutorialok.</p>
::::::
