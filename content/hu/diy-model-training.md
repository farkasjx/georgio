---
page: diy-model-training
title: Saját, puritán modell — hogyan építs és taníts egyet nulláról
sidebar_groups:
  - Mielőtt belevágsz
  - A gépezet
  - A tanítóadat
  - Gyakorlat
  - Referencia
hero:
  eyebrow: "Saját modell építése · Fejlesztői Tanulási Terv"
  title: "Saját, puritán modell — <em>hogyan építs és taníts egyet nulláról</em>"
  lead: "A Hogyan tanul egy modell tutorial elméletben mutatta meg a tanítási hurkot — ez a cikk végigmegy a tényleges, futtatható lépéseken: milyen környezet, keretrendszer, tokenizáció, tanítóadat és hardver kell ahhoz, hogy a saját gépeden felépíts és megtaníts egy kicsi, de valóban működő, egy nyelven beszélő modellt nulláról."
  stats:
    - { val: "~50$", lbl: "GPT-2-minőségű modell 2026-ban*" }
    - { val: "10-25M", lbl: "paraméter, otthoni GPU-n*" }
    - { val: "7", lbl: "Szakasz" }
    - { val: "1", lbl: "afternoon, hogy végigolvasd a kódot*" }
footer:
  left: "AI Hub · Saját modell építése"
  right: "Saját modell építése · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#diy-model-training-0"><div class="tc-num">0. rész</div><div class="tc-name">Mielőtt belevágsz: mire jó ez valójában</div><div class="tc-desc">Nem termékfejlesztés — tanulás.</div></a>
  <a class="toc-card" href="#diy-model-training-1"><div class="tc-num">1. rész</div><div class="tc-name">A keretrendszer: nanochat vagy nanoGPT</div><div class="tc-desc">Két kész, olvasható kódbázis, amiből kiindulhatsz.</div></a>
  <a class="toc-card" href="#diy-model-training-2"><div class="tc-num">2. rész</div><div class="tc-name">A hardver: mit bír el a géped</div><div class="tc-desc">CPU-tól a bérelt GPU-ig, konkrét idővel.</div></a>
  <a class="toc-card" href="#diy-model-training-3"><div class="tc-num">3. rész</div><div class="tc-name">A tanítóadat: honnan és mennyi</div><div class="tc-desc">FineWeb-Edu és a "csak egy nyelv" döntés.</div></a>
  <a class="toc-card" href="#diy-model-training-4"><div class="tc-num">4. rész</div><div class="tc-name">Saját tokenizáló tanítása</div><div class="tc-desc">Miért nem a GPT-2 tokenizálóját használod.</div></a>
  <a class="toc-card" href="#diy-model-training-5"><div class="tc-num">5. rész</div><div class="tc-name">A tanítási hurok elindítása</div><div class="tc-desc">Konkrét parancsok, és mit nézz a folyamat közben.</div></a>
  <a class="toc-card" href="#diy-model-training-6"><div class="tc-num">6. rész</div><div class="tc-name">Mit várj el a végeredménytől</div><div class="tc-desc">Reális elvárás, és hogyan vidd tovább.</div></a>
</div>
::::::

:::::: section id=diy-model-training-0 num="00" heading="0. rész — Mielőtt belevágsz: mire jó ez valójában" nav="Mielőtt belevágsz" group="Mielőtt belevágsz"

<p class="topic-tagline">Cél: állítsd be helyesen a várakozásaidat, mielőtt bármilyen kódot futtatnál.</p>

### Ez nem termékfejlesztés

::::: callout danger label="A legfontosabb tisztázó mondat"
A <em>Nyílt súlyú modellek</em> tutorialban megismert, production-szintű modellek (Llama, Qwen, Mistral) **billiónyi** tokenen, **több millió dolláros** infrastruktúrán tanulnak. Amit ebben a cikkben építesz, egy **10-25 millió paraméteres**, egyetlen nyelven, alap-szintű mintázatokra képes modell lesz — ez **nem versenyez** semmilyen komoly modellel, és nem is ez a cél.
:::::

### Mikor van értelme saját modellt tanítani, mikor nincs

::::: compare
::: good label="Amikor ÉRDEMES ez a projekt"
Meg akarod érteni, **mi történik ténylegesen** egy tanítási lépésnél, nem csak elméletben · van egy **szűk, egyedi nyelvi/adatterület**, amit egyetlen létező modell sem lát jól · egyszerűen kíváncsi vagy, és van néhány órád/napod rá.
:::
::: bad label="Amikor NEM ez a jó út"
Egy **működő terméket** szeretnél gyorsan — arra a <em>Fine-tuning technikák</em> tutorialban tárgyalt, meglévő nyílt súlyú modell finomhangolása a helyes út, nem a nulláról tanítás · **production-minőségű** válaszokat vársz — ehhez a jelenlegi, otthoni hardveren elérhető léptékek egyszerűen kevesek.
:::
:::::

::::: callout label="Egy mondatban"
Ez a projekt a **tanulásról** szól — arról, hogy egyszer, végigcsinálva lásd, mi rejlik a "modell tanul" kifejezés mögött —, nem arról, hogy egy használható terméket építs belőle.
:::::
::::::

:::::: section id=diy-model-training-1 num="01" heading="1. rész — A keretrendszer: nanochat vagy nanoGPT" nav="A keretrendszer" group="A gépezet"

<p class="topic-tagline">Cél: válassz egy kész, olvasható kódbázist kiindulópontnak, ahelyett hogy nulláról írnál mindent.</p>

### Két elterjedt, egymást kiegészítő választás

::::: stack-grid
:::: card label="nanochat"
Andrej Karpathy 2025 végi projektje — egyetlen `speedrun.sh` script viszi végig a teljes utat: **tokenizáló tanítás → pretraining → mid-training → SFT → opcionális RL → kiértékelés → webes chat felület**. A kód egy délután alatt végigolvasható. Ez a **javasolt belépési pont**, ha most kezded.
::::
:::: card label="nanoGPT / modded-nanoGPT"
Karpathy korábbi, egyszerűbb projektje — `train.py` (~300 sor) és `model.py` (~300 sor), ami "tanít, nem tanít" filozófiával készült: kevesebb funkció, de még könnyebben áttekinthető. A `modded-nanoGPT` a közösség által tovább gyorsított, "speedrun" változata.
::::
:::::

::::: callout label="Miért ezekkel érdemes kezdeni, nem sajáttal"
A saját, nulláról írt transformer-implementáció (lásd az <em>Egy modell anatómiája</em> tutorialt) egy **külön, hosszú tanulási projekt** lenne önmagában — a nanochat/nanoGPT azért jó kiindulópont, mert a nehéz, hibalehetőségekkel teli részek (adatbetöltés, gradiens-akkumuláció, checkpoint-mentés) már **helyesen meg vannak írva**, és a kód elég rövid ahhoz, hogy ténylegesen megérts minden sorát.
:::::

::::: callout label="Egy mondatban"
Ne írj mindent nulláról — a nanochat vagy a nanoGPT egy olyan, néhány száz soros, jól dokumentált kiindulópontot ad, amiből a tényleges tanulás (nem a keretrendszer-írás) áll a fókuszban.
:::::
::::::

:::::: section id=diy-model-training-2 num="02" heading="2. rész — A hardver: mit bír el a géped" nav="A hardver" group="A gépezet"

<p class="topic-tagline">Cél: reálisan mérd fel, mekkora modellt és mennyi idő alatt tudsz ténylegesen tanítani a saját gépeden.</p>

### Négy hardver-szint, négy reális elvárás

::::: stack-grid
:::: card label="CPU + 8GB RAM"
**1-10 millió paraméteres** nanoGPT-variáns tanítható kis adathalmazon — 5000 lépés kb. **20-60 perc** alatt fut le. Ez elég ahhoz, hogy Shakespeare-stílusú, koherens szöveget generáljon.
::::
:::: card label="CPU + 16-32GB RAM"
Valamivel nagyobb nanoGPT-variánsok, és már **valós, használható** helyi LLM-élmény kezdődik (bár ez inkább a meglévő, kvantált modellek futtatására vonatkozik, nem a nulláról tanításra).
::::
:::: card label="GPU 8GB VRAM (pl. RTX 3070/4060)"
NanoGPT gyorsan tanítható, LoRA alkalmazható 7B modellekre (lásd a <em>Fine-tuning technikák</em> tutorialt) — ez már egy komfortos szint a saját, kis modell kísérletezéshez.
::::
:::: card label="Bérelt cloud GPU (8× H100)"
Egy **GPT-2-minőségű** (124M paraméteres) modell **kb. 50 dollárért**, körülbelül **1,65 óra** alatt tanítható a nanochat-tal — ez a leggyorsabb, leginkább production-közeli tapasztalat, ha hajlandó vagy fizetni érte.
::::
:::::

::::: callout warning label="Egy reális, otthoni célkitűzés"
Egy **10-25 millió paraméteres**, egy nyelven (pl. csak magyarul vagy csak angolul) tanított modell egy közepes, otthoni GPU-n (8GB+ VRAM) **órákon belül** lefuttatható — ez a cikk további részei erre a léptékre optimalizálnak, nem a bérelt, 8× H100-as opcióra.
:::::

::::: callout label="Egy mondatban"
A hardvered dönti el, mekkora modellt és mennyi adatot tanulj meg reálisan — a jó hír, hogy egy **valóban tanulságos**, koherens szöveget generáló modell már egy közepes, otthoni GPU-n is elérhető órák, nem napok alatt.
:::::
::::::

:::::: section id=diy-model-training-3 num="03" heading="3. rész — A tanítóadat: honnan és mennyi" nav="A tanítóadat" group="A tanítóadat"

<p class="topic-tagline">Cél: válassz konkrét, elérhető tanítóadatot, és döntsd el, mennyi kell egy egy-nyelvű, alap-szintű modellhez.</p>

### A FineWeb-Edu, mint kiindulópont

::::: callout label="Egy jó minőségű, kész adathalmaz"
A **FineWeb-Edu** (Hugging Face) egy 1,3 billió tokenes, oktatási jellegű weboldalakból szűrt adathalmaz, ami **10B, 100B és 350B tokenes** kisebb mintákban is elérhető — kifejezetten kisebb, "toy" projektekhez ajánlott méretekben, nem csak a teljes, 15 billiós verzióban.
:::::

### Mennyi adat kell egy puritán, egy-nyelvű modellhez

::::: callout warning label="A lépték, ami reálisan elérhető"
Dokumentált kísérletek egy **10-25 millió paraméteres** modellt **10-12 milliárd token** körüli mennyiségen tanítottak (a FineWeb-Edu 10B-es mintáján), 12 réteggel, 768-as rejtett dimenzióval — ez az a nagyságrend, ami **egy nyelven, alapvető mintázatokra** (nyelvtan, gyakori szókapcsolatok, egyszerű mondatszerkesztés) már reálisan tanítható otthoni hardveren.
:::::

::::: callout label="Miért éri meg \"csak egy nyelvre\" szűkíteni"
Ha a modelled **csak egyetlen nyelvet** (pl. csak magyart) tanul, ugyanannyi paraméterrel **jobb minőséget** érhetsz el azon az egy nyelven, mintha a paramétereket több nyelv között osztanád meg — ez pontosan a <em>Modelltípusok térképe</em> tutorial SLM-koncepciójának egy szélsőséges, extra szűk alkalmazása.
:::::

::::: callout label="Egy mondatban"
A FineWeb-Edu kisebb mintái (10B token) pontosan a megfelelő nagyságrendet adják egy puritán, egy-nyelvű modellhez — nem kell a teljes, 15 billiós adathalmazzal bajlódnod.
:::::
::::::

:::::: section id=diy-model-training-4 num="04" heading="4. rész — Saját tokenizáló tanítása" nav="Saját tokenizáló tanítása" group="A tanítóadat"

<p class="topic-tagline">Cél: érts meg, miért érdemes saját tokenizálót tanítani, ahelyett hogy egy meglévőt (pl. GPT-2-ét) használnál.</p>

### Miért nem elég egy kész tokenizáló

::::: callout label="A kapcsolat a Tokenizáció tutorialhoz"
A <em>Tokenizáció</em> tutorialban megismert "nyelvi adó" jelenség (egy adott nyelv szavai több tokenre bomlanak egy más nyelvre optimalizált tokenizálóval) itt konkrétan számít: ha csak egy nyelven tanítasz, egy **erre a nyelvre optimalizált, saját tokenizáló** hatékonyabban használja ki a korlátozott paramétereidet.
:::::

```python
# a Hugging Face tokenizers könyvtárával, BPE-alapú tokenizáló tanítása
from tokenizers import Tokenizer, trainers, models, pre_tokenizers

tokenizer = Tokenizer(models.BPE())
tokenizer.pre_tokenizer = pre_tokenizers.ByteLevel()
trainer = trainers.BpeTrainer(vocab_size=32000, special_tokens=["<|endoftext|>"])

# csak a saját, egy-nyelvű adathalmazodon tanítod, nem egy általános korpuszon
tokenizer.train(files=["training_data.txt"], trainer=trainer)
tokenizer.save("my_tokenizer.json")
```

::::: callout warning label="A szótárméret döntése"
A GPT-2 **50 257**, a Llama 2 **32 000**, a Llama 3 **128 256** szavas szótárat használ — egy kicsi, egy-nyelvű modellnél egy **kisebb, kb. 16 000-32 000** közötti szótár gyakran elég, és kevesebb paramétert "pazarol el" az embedding rétegre (lásd az <em>Egy modell anatómiája</em> tutorial embedding-részét), ami helyette a tényleges nyelvi mintázat-tanulásra fordítható.
:::::

::::: callout label="Egy mondatban"
Egy saját, kis szótárú, csak a te nyelvedre tanított tokenizáló hatékonyabban használja ki a szűkös paraméter-költségvetést, mint egy általános, sokszor feleslegesen nagy, sokféle nyelvre optimalizált kész tokenizáló.
:::::
::::::

:::::: section id=diy-model-training-5 num="05" heading="5. rész — A tanítási hurok elindítása" nav="A tanítási hurok elindítása" group="Gyakorlat"

<p class="topic-tagline">Cél: futtasd le a tényleges tanítást, konkrét parancsokkal és paraméterekkel.</p>

### A konkrét lépések

```bash
# 1. Környezet előkészítése (lásd a Python-környezet elveit egy sima venv-vel)
git clone https://github.com/karpathy/nanoGPT
cd nanoGPT
pip install torch numpy transformers datasets tiktoken wandb tqdm

# 2. Adat előkészítése (a saját tokenizálóddal, 4. rész)
python data/prepare.py --dataset my_language_corpus

# 3. Tanítás indítása — a hiperparaméterek egy kis modellhez
python train.py \
  --n_layer=12 --n_head=10 --n_embd=768 \
  --batch_size=32 --block_size=1024 \
  --max_iters=19000
```

### Mit figyelj a folyamat közben

::::: callout label="A loss-görbe, mint az egyetlen fontos jelző"
A tanítás közben kiírt **loss** (veszteség) érték az elsődleges jelző: kezdetben magasról indul (a modell véletlenszerű súlyokból indul), és fokozatosan csökken, ahogy a modell **egyre jobban** jósolja a következő tokent. Ha a loss **nem csökken**, vagy hirtelen **megugrik** (instabilitás), a tanulási ráta túl magas lehet.
:::::

::::: callout warning label="Konkrét referencia-időpontok"
Egy hasonló léptékű (10-25M paraméter) modellnél, a FineWeb-Edu 10B-es mintáján, **19 000 lépés kb. egy epoch**-nak felel meg — ez egyetlen 8× H100-as node-on órák, egyetlen fogyasztói GPU-n (8GB VRAM) ennél hosszabb, de reálisan **egy-két nap** alatt lefuttatható.
:::::

::::: callout label="Egy mondatban"
A tanítás elindítása néhány parancs, a valódi munka a **loss-görbe figyelése** és a hiperparaméterek (batch-méret, tanulási ráta) finomhangolása, ha valami nem a várt módon viselkedik.
:::::
::::::

:::::: section id=diy-model-training-6 num="06" heading="6. rész — Mit várj el a végeredménytől" nav="Mit várj el a végeredménytől" group="Referencia"

<p class="topic-tagline">Cél: kalibráld a végeredménnyel kapcsolatos elvárásaidat, és lásd, hova mehetsz tovább innen.</p>

### Egy reális, dokumentált eredmény

::::: callout label="Amit ténylegesen kapsz"
Egy hasonló léptékű, saját tanítású modell **koherens, nyelvtanilag helyes, de tartalmilag gyakran semmitmondó vagy furcsa** szöveget generál — ez **nem hiba**, hanem pontosan az, amit egy ilyen kis paraméterszám és adatméret mellett reálisan várni lehet. A cél nem a "meggyőző" kimenet volt, hanem hogy **lásd a folyamatot** működés közben.
:::::

::::: callout warning label="A benchmark-tesztelés korlátai itt"
Az <em>Evaluation</em> tutorialban tárgyalt benchmarkok (MMLU stb.) egy ilyen kis modellnél **nem lesznek informatívak** — egyszerűen túl kicsi a modell ahhoz, hogy ezeken a teszteken bármi értelmeset mutasson. A helyes "kiértékelés" itt a szöveg **szemmel való átolvasása**: koherens-e, van-e nyelvtani szerkezete, ismétlődik-e feleslegesen.
:::::

### Hova mehetsz tovább innen

::::: callout label="A logikus következő lépések"
Ha megértetted ezt a folyamatot, a következő, természetes lépések: (1) próbáld ki a <em>Fine-tuning technikák</em> tutorialban tárgyalt LoRA-t egy **meglévő, nyílt súlyú** modellen — ez sokkal jobb minőséget ad, kevesebb erőforrásból; (2) ha a cél a mélyebb megértés maradt, próbáld ki a `modded-nanoGPT` "speedrun" versenyt, ami a hatékonyság-optimalizálás felé visz tovább.
:::::

::::: callout label="Egy mondatban"
Ez a projekt a célja szerint sikeres, ha **megértetted, mi történik** minden lépésnél — nem attól, hogy a végeredmény lenyűgöző szöveget generál, mert egy 10-25 milliós, egy-nyelvű modelltől ez reálisan nem várható el.
:::::
::::::

:::::: section id=diy-model-training-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0–1. rész"
Ez egy tanulási, nem termékfejlesztési projekt · a nanochat/nanoGPT mint kész, olvasható kiindulópont
::::
:::: card label="2–3. rész"
Reális hardver-elvárások (10-25M paraméter otthoni GPU-n) · a FineWeb-Edu kisebb mintái mint tanítóadat-forrás
::::
:::: card label="4–5. rész"
Saját, kis szótárú tokenizáló tanítása egy nyelvre · a tényleges tanítási parancsok és a loss-görbe figyelése
::::
:::: card label="6. rész"
Reális elvárás a végeredményről (koherens, de nem "okos" szöveg), és a logikus következő lépések (LoRA egy meglévő modellen)
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>Hogyan tanul egy modell</em> (az elméleti alap, amire ez a cikk épít), a <em>Tokenizáció</em> (a saját tokenizáló mögötti elv), a <em>Fine-tuning technikák</em> (a jobb minőségű alternatíva egy meglévő modellen) és az <em>Egy modell anatómiája</em> (a rétegek, amiket a nanoGPT ténylegesen implementál) tutorialok.</p>

<p class="topic-tagline" style="margin-top:12px;font-size:0.85em;opacity:0.75">* Az 50 dolláros, 1,65 órás GPT-2-minőségű tanítási adat és a 10-25M paraméteres otthoni becslés 2026-os, publikus oktatóanyagokból (nanochat, dev.to, Medium) és kutatási cikkekből származik — lásd az 1–3. részt a kontextusért.</p>
::::::
