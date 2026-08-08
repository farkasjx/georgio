---
page: fine-tuning-workflow
title: Fine-tuning gyakorlati workflow — adattól a betanított modellig
sidebar_groups:
  - Döntés
  - Adatelőkészítés
  - Futtatás
  - Referencia
hero:
  eyebrow: "Fine-tuning workflow · Fejlesztői Tanulási Terv"
  title: "Fine-tuning gyakorlati <em>workflow</em>"
  lead: "A Fine-tuning technikák tutorial elmagyarázta a LoRA/QLoRA mechanizmusát — ez a cikk a hiányzó, gyakorlati láncot adja hozzá: honnan szerezz adatot, milyen formátumban, milyen platformon futtasd le, és hogyan derítsd ki, ha a modelled túltanult."
  stats:
    - { val: "500-5000", lbl: "példa, jó minőségben*" }
    - { val: "1e-5 – 5e-5", lbl: "tipikus tanulási ráta*" }
    - { val: "5", lbl: "Szakasz" }
    - { val: "12GB", lbl: "VRAM elég egy 8B modellhez QLoRA-val*" }
footer:
  left: "AI Hub · Fine-tuning workflow"
  right: "Fine-tuning workflow · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#fine-tuning-workflow-0"><div class="tc-num">0. rész</div><div class="tc-name">Kell-e egyáltalán fine-tuning</div><div class="tc-desc">Döntési keret prompt engineering és RAG ellenében.</div></a>
  <a class="toc-card" href="#fine-tuning-workflow-1"><div class="tc-num">1. rész</div><div class="tc-name">Adathalmaz: formátum, méret, minőség</div><div class="tc-desc">ChatML, ShareGPT, Alpaca — és miért a minőség nyer a mennyiség ellen.</div></a>
  <a class="toc-card" href="#fine-tuning-workflow-2"><div class="tc-num">2. rész</div><div class="tc-name">Base modell és platform választása</div><div class="tc-desc">Saját GPU vagy managed platform.</div></a>
  <a class="toc-card" href="#fine-tuning-workflow-3"><div class="tc-num">3. rész</div><div class="tc-name">A futtatás: hiperparaméterek és monitorozás</div><div class="tc-desc">Konkrét induló értékek, és mit nézz a loss-görbén.</div></a>
  <a class="toc-card" href="#fine-tuning-workflow-4"><div class="tc-num">4. rész</div><div class="tc-name">Kiértékelés és exportálás</div><div class="tc-desc">Mielőtt élesbe tennéd, és hogyan futtasd lokálisan.</div></a>
</div>
::::::

:::::: section id=fine-tuning-workflow-0 num="00" heading="0. rész — Kell-e egyáltalán fine-tuning" nav="Kell-e egyáltalán fine-tuning" group="Döntés"

<p class="topic-tagline">Cél: érts meg egy döntési keretet, mielőtt bármilyen adatot gyűjtenél.</p>

### Három alternatíva, amit előbb érdemes megnézni

::::: callout warning label="A leggyakoribb, drága hiba"
Sok csapat fine-tuninggal old meg problémákat, amiket **prompt engineering** (lásd a <em>Prompt Engineering</em> tutorialt) vagy **RAG** (lásd a <em>RAG</em> tutorialt) olcsóbban, gyorsabban megoldana. A fine-tuning **költséget, latenciát és adatvédelmi** szempontokat mérlegelő döntés kell legyen, nem az alapértelmezett válasz "a modell nem elég jó ebben" problémára.
:::::

::::: callout label="Mikor a fine-tuning a helyes válasz"
Ha a feladat egy **konzisztens, ismétlődő formátumot** vagy **stílust** igényel (amit promptban nehéz stabilan kikényszeríteni), vagy egy **szűk, specializált** viselkedést (lásd a <em>Speciális területre tanított modellek</em> tutorialt), és ezt **sokszor**, nagy volumenben futtatod — ekkor a fine-tuning valóban jobb ár-érték arányt ad, mint egy hosszú, minden hívásnál újra elküldött prompt.
:::::

::::: callout label="Egy mondatban"
Mielőtt adatot gyűjtenél, tedd fel a kérdést: "megoldaná ezt egy jobb prompt vagy egy RAG-pipeline olcsóbban?" — csak ha a válasz nem, érdemes a fine-tuning teljes költségébe (adatgyűjtés, tanítás, validálás) belefogni.
:::::
::::::

:::::: section id=fine-tuning-workflow-1 num="01" heading="1. rész — Adathalmaz: formátum, méret, minőség" nav="Adathalmaz" group="Adatelőkészítés"

<p class="topic-tagline">Cél: ismerd meg a konkrét formátumokat és a mennyiségre vonatkozó realisztikus elvárást.</p>

### A három elterjedt formátum

::::: stack-grid
:::: card label="ChatML"
Strukturált, szerep-alapú formátum (`system`/`user`/`assistant`), amit sok modern keretrendszer natívan támogat — jó választás, ha a célod egy konverzációs asszisztens finomhangolása.
::::
:::: card label="ShareGPT"
Egy elterjedt, közösségi eredetű formátum többfordulós beszélgetésekhez — sok nyílt forráskódú tanítóadat ebben a formátumban érkezik.
::::
:::: card label="Alpaca"
Instrukció-válasz páros formátum (`instruction`/`input`/`output`) — egyszerűbb, egy-fordulós feladatokhoz (összefoglalás, klasszifikáció, átírás) ideális.
::::
:::::

### Mennyi adat kell valójában

::::: callout danger label="A minőség nyer a mennyiség ellen"
A dokumentált ajánlás **500-5000 jó minőségű** példa — nem több tízezer, gyenge minőségű. Klasszifikációs feladatnál biztosítsd a **kategóriák kiegyensúlyozott** eloszlását, generálási feladatnál a **változatos megfogalmazásokat és kontextusokat**.
:::::

::::: callout warning label="Deduplikáció és hosszúság-szűrés"
Mielőtt tanítanál, futtasd le a <em>Kódoló modellek</em> tutorialban is látott deduplikációs elvet a saját adatodra — távolítsd el az ismétlődő vagy közel-azonos példákat, és szűrd ki a szélsőségesen rövid vagy hosszú bejegyzéseket, amik torzíthatják a tanítást.
:::::

::::: callout label="Ha kevés valós adatod van"
Szintetikus adat-generálás (egy nagyobb modellel generált, majd emberileg ellenőrzött példák) és **back-translation**, **szinonima-cserés** augmentáció segíthet a hatékony adathalmaz-méret növelésében — de a szintetikus adatot mindig **adversarial promptokkal** stressz-teszteld, mielőtt megbíznál benne, hogy tényleg javítja a generalizációt.
:::::

::::: callout label="Egy mondatban"
Egy 500-5000 elemű, gondosan válogatott, deduplikált adathalmaz jobb eredményt ad, mint egy tízszer nagyobb, de zajos, ismétlődő adatkészlet.
:::::
::::::

:::::: section id=fine-tuning-workflow-2 num="02" heading="2. rész — Base modell és platform választása" nav="Base modell és platform" group="Adatelőkészítés"

<p class="topic-tagline">Cél: dönts a saját hardveren futó és a managed platformos megoldás között.</p>

### Saját GPU vs. managed platform

::::: compare
::: good label="Saját GPU (Unsloth, Axolotl, LLaMA-Factory)"
Egy **12GB VRAM-os** fogyasztói GPU (pl. RTX 3060) mára **elég** egy 8B paraméteres modell QLoRA-alapú finomhangolásához — teljes kontroll, nincs adat-kiszivárgási kockázat, de neked kell kezelned az infrastruktúrát.
:::
::: bad label="Managed platform (Together AI, Fireworks AI)"
Elveszi a GPU-provisioning és skálázás terhét azoktól a csapatoktól, akiknek nincs dedikált MLOps-infrastruktúrájuk — gyorsabb indulás, de a te adatod egy harmadik fél infrastruktúráján fut át (lásd a <em>Vállalati AI</em> tutorial megfelelőségi szempontjait).
:::
:::::

::::: callout label="A base modell választása"
Egy **engedékeny licencű**, 7-8B paraméteres modell (Llama 3.1 8B, Mistral 7B, Qwen 2.5 7B — lásd a <em>Nyílt súlyú modellek</em> tutorialt) a leggyakoribb kiindulópont — elég nagy ahhoz, hogy komplex feladatokat is tanuljon, de elég kicsi, hogy egyetlen fogyasztói GPU-n finomhangolható legyen.
:::::

::::: callout label="Egy mondatban"
A saját GPU-n futó megoldás (Unsloth-tal) a legjobb, ha van hardvered és adatvédelmi okod van rá — a managed platform a leggyorsabb út, ha az infrastruktúra-kezelés nem a te erősséged.
:::::
::::::

:::::: section id=fine-tuning-workflow-3 num="03" heading="3. rész — A futtatás: hiperparaméterek és monitorozás" nav="A futtatás" group="Futtatás"

<p class="topic-tagline">Cél: ismerd meg a konkrét, induló hiperparamétereket, és mit figyelj a tanítás közben.</p>

### Konzervatív, dokumentáltan bevált induló értékek

::::: callout label="A négy legfontosabb paraméter"
**Tanulási ráta**: 1×10⁻⁵ – 5×10⁻⁵ (lásd a <em>Speciális területre tanított modellek</em> tutorial hasonló ajánlását DAPT-hoz). **Batch méret**: 4-16, a GPU-memóriától függően. **Epoch-szám**: maximum 3-5 — ennél tovább a <em>Gépi tanulás alapjai</em> tutorialban tárgyalt overfitting kockázata nő. **LoRA rank**: 64-128 a legjobb teljesítmény/hatékonyság arányért.
:::::

```python
# Unsloth + SFTTrainer minta-konfiguráció
from unsloth import FastLanguageModel

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="unsloth/llama-3.1-8b-bnb-4bit",
    max_seq_length=2048,
)
model = FastLanguageModel.get_peft_model(
    model, r=64, lora_alpha=128,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
)
```

::::: callout warning label="Mit nézz a loss-görbén"
Kövesd **egyszerre** a tanító és validációs loss-t — ha a validációs loss **emelkedni kezd**, míg a tanító loss továbbra is csökken, ez a klasszikus overfitting jele (lásd a <em>Gépi tanulás alapjai</em> tutorialt), és itt kell **early stopping**-gal leállítanod a tanítást, ne várd meg a beállított epoch-szám végét.
:::::

::::: callout label="Egy mondatban"
Ezek a konzervatív induló értékek (alacsony tanulási ráta, kevés epoch, early stopping) nem "biztonsági öv" — ezek adják a legjobb esélyt arra, hogy a modelled valóban általánosítson, ne csak bemagolja a tanítóadatot.
:::::
::::::

:::::: section id=fine-tuning-workflow-4 num="04" heading="4. rész — Kiértékelés és exportálás" nav="Kiértékelés és exportálás" group="Referencia"

<p class="topic-tagline">Cél: ismerd meg az utolsó lépéseket, mielőtt a modelledet éles használatra vagy lokális futtatásra adnád.</p>

### Kettős kiértékelés: számok és szemmel

::::: callout label="Ne csak a benchmarkra hagyatkozz"
A <em>Evaluation</em> tutorialban tárgyalt kvantitatív metrikák mellett végezz **oldalt-oldal melletti** (side-by-side) összehasonlítást a base modell és a finomhangolt verzió között ugyanazokon a promptokon — ez gyakran felfed olyan minőségi különbségeket (stílus, konzisztencia), amiket egy sima pontszám nem mutat meg.
:::::

### Exportálás lokális futtatáshoz

::::: callout label="A LoRA-adapter beolvasztása"
A tanítás után a LoRA-adaptereket **be kell olvasztani** (merge) az eredeti base modellbe, majd **GGUF formátumra** exportálni, ha az <em>Ollama</em> tutorialban megismert lokális futtatást szeretnéd — ez teszi lehetővé, hogy a finomhangolt modelled ugyanolyan egyszerűen fusson, mint egy kész, letöltött modell.
:::::

::::: callout label="Egy mondatban"
A kiértékelés és az exportálás nem utólagos, opcionális lépés — a side-by-side összehasonlítás az, ami megmondja, tényleg megérte-e a finomhangolás, és a GGUF-exportálás az, ami a modelledet valóban használhatóvá teszi a saját infrastruktúrádon.
:::::
::::::

:::::: section id=fine-tuning-workflow-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0. rész"
Döntési keret: mikor a fine-tuning a helyes válasz, mikor olcsóbb a prompt engineering vagy a RAG
::::
:::: card label="1. rész"
Konkrét adathalmaz-formátumok (ChatML, ShareGPT, Alpaca), és a "minőség a mennyiség ellen" elv (500-5000 jó példa)
::::
:::: card label="2. rész"
Saját GPU (Unsloth) vs. managed platform (Together AI, Fireworks AI) — és a base modell választása
::::
:::: card label="3–4. rész"
Konkrét hiperparaméterek és loss-görbe monitorozás · kettős kiértékelés (benchmark + side-by-side) és GGUF-exportálás lokális futtatáshoz
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>Fine-tuning technikák</em> (a LoRA/QLoRA mechanizmusa, amire ez a workflow épül), a <em>Nyílt súlyú modellek</em> (a base modell választása), az <em>Ollama</em> (a GGUF-exportált modell lokális futtatása) és a <em>Speciális területre tanított modellek</em> (a DAPT mint kiegészítő lépés) tutorialok.</p>

<p class="topic-tagline" style="margin-top:12px;font-size:0.85em;opacity:0.75">* A hiperparaméterek, adathalmaz-méretek és VRAM-becslés 2026-os, publikus gyakorlati útmutatókból származnak — lásd az 1. és 3. részt a kontextusért.</p>
::::::
