---
page: glossary
title: Fogalomtár — az AI Hub kifejezései egy helyen
sidebar_groups:
  - Alapok
  - Architektúra és tanítás
  - Finomhangolás és skálázás
  - Modalitás és biztonság
  - Agentic és eszközök
  - Tudás és kontextus
hero:
  eyebrow: "Fogalomtár · Fejlesztői Tanulási Terv"
  title: "Fogalomtár — <em>az AI Hub kifejezései egy helyen</em>"
  lead: "Nem egy száraz, ábécé-sorrendes lista — minden fogalomhoz egy-két mondatos, érthető magyarázat és egy link a részletes tárgyaláshoz. Ha egy kifejezésbe futsz valamelyik cikkben, és csak gyorsan tudni akarod, mit jelent, itt a helye. Ha a teljes mechanizmust is érteni akarod, a link elvisz a megfelelő szakaszhoz."
  stats:
    - { val: "80+", lbl: "Fogalom" }
    - { val: "6", lbl: "Kategória" }
    - { val: "35", lbl: "Kapcsolódó cikk" }
    - { val: "0", lbl: "Száraz definíció" }
footer:
  left: "AI Hub · Fogalomtár"
  right: "Fogalomtár · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#glossary-0"><div class="tc-num">1</div><div class="tc-name">Alapok</div><div class="tc-desc">Token, attention, kontextusablak — a leggyakrabban használt szavak.</div></a>
  <a class="toc-card" href="#glossary-1"><div class="tc-num">2</div><div class="tc-name">Architektúra és tanítás</div><div class="tc-desc">Rétegek, pretraining, RLHF — hogyan épül fel és tanul egy modell.</div></a>
  <a class="toc-card" href="#glossary-2"><div class="tc-num">3</div><div class="tc-name">Finomhangolás és skálázás</div><div class="tc-desc">LoRA, MoE, kvantálás — hogyan specializálsz és optimalizálsz.</div></a>
  <a class="toc-card" href="#glossary-3"><div class="tc-num">4</div><div class="tc-name">Modalitás és biztonság</div><div class="tc-desc">Multimodalitás, diffúzió, alignment, jailbreak.</div></a>
  <a class="toc-card" href="#glossary-4"><div class="tc-num">5</div><div class="tc-name">Agentic és eszközök</div><div class="tc-desc">MCP, ReAct, vibe coding — hogyan dolgozol AI-jal.</div></a>
  <a class="toc-card" href="#glossary-5"><div class="tc-num">6</div><div class="tc-name">Tudás és kontextus</div><div class="tc-desc">RAG, vektor-DB, halucináció — honnan tudja, amit tud.</div></a>
</div>
::::::

:::::: section id=glossary-0 num="01" heading="1. rész — Alapok" nav="Alapok" group="Alapok"

<p class="topic-tagline">A leggyakrabban előforduló, minden más fogalom alapjául szolgáló kifejezések.</p>

::::: stack-grid
:::: card label="Token"
A szöveg legkisebb egysége, amit a modell ténylegesen lát — sem nem karakter, sem nem szó, hanem egy tanult, statisztikai kompromisszum a kettő között. → <a href="#tokenization-0" data-goto-page="tokenization">Tokenizáció, 0. rész</a>
::::
:::: card label="Attention"
A mechanizmus, amivel egy token "körülnéz" a többi tokenen, és eldönti, melyikek relevánsak hozzá képest — ez adja a kontextus-érzékenységet. → <a href="#reasoning-1" data-goto-page="reasoning">Reasoning, 1. rész</a>
::::
:::: card label="Kontextusablak"
A maximális mennyiségű token, amit a modell egyszerre képes figyelembe venni egy beszélgetésben vagy dokumentumban. → <a href="#kc-0" data-goto-page="knowledge-cutoff">Knowledge cutoff, 0. rész</a>
::::
:::: card label="Reasoning tokens"
A "gondolkodó" tokenek, amiket a modell a végső válasz előtt generál, hogy lépésről lépésre jusson el a megoldásig. → <a href="#reasoning-1" data-goto-page="reasoning">Reasoning, 1. rész</a>
::::
:::: card label="Temperature"
Egy paraméter, ami szabályozza, mennyire "éles" vagy "lapos" a token-választás valószínűségi eloszlása — nem tesz egyenletessé egy torzított eloszlást, csak élesíti vagy lapítja. → <a href="#randomness-2" data-goto-page="randomness">Véletlenszerűség, 2. rész</a>
::::
:::: card label="Mintavételezés"
A folyamat, ahogy a modell egy valószínűségi listából ténylegesen kiválaszt egy konkrét tokent — ez nem "gondolkodás", hanem statisztikai választás. → <a href="#randomness-1" data-goto-page="randomness">Véletlenszerűség, 1. rész</a>
::::
:::: card label="System prompt"
A háttérben, a felhasználó elől jellemzően rejtett instrukció, ami meghatározza a modell viselkedését, hangnemét és korlátait egy adott alkalmazásban. → <a href="#sec-template" data-goto-page="security">Biztonság, sablon rész</a>
::::
:::: card label="Few-shot / zero-shot"
Few-shot: a promptba beírt, konkrét példák segítségével tanítod be a feladatot. Zero-shot: nincs példa, csak a leírás. → <a href="#p-few-shot" data-goto-page="prompting">Prompt Engineering</a>
::::
:::::
::::::

:::::: section id=glossary-1 num="02" heading="2. rész — Architektúra és tanítás" nav="Architektúra és tanítás" group="Architektúra és tanítás"

<p class="topic-tagline">Hogyan épül fel egy modell belülről, és hogyan lesz a nyers súlyokból tudás.</p>

::::: stack-grid
:::: card label="Transformer"
Az architektúra-típus, ami szinte minden mai nagy nyelvi modell alapja — rétegekből áll, amik attention-t és feed-forward számítást váltogatnak. → <a href="#architecture-0" data-goto-page="architecture">Egy modell anatómiája, 0. rész</a>
::::
:::: card label="Embedding réteg"
A modell első lépése: minden token egy tanult, több ezer dimenziós vektorrá alakul, mielőtt a tényleges feldolgozás elkezdődne. → <a href="#architecture-1" data-goto-page="architecture">Egy modell anatómiája, 1. rész</a>
::::
:::: card label="Feed-forward réteg"
Az attention utáni lépés, ami minden tokent önmagában gazdagít tovább — a legtöbb modell paramétereinek nagyobb hányada itt található. → <a href="#architecture-2" data-goto-page="architecture">Egy modell anatómiája, 2. rész</a>
::::
:::: card label="Residual connection"
Egy "ragasztó" mechanizmus, ami minden réteg bemenetét hozzáadja a kimenetéhez — enélkül a 100+ réteges modellek taníthatatlanok lennének. → <a href="#architecture-3" data-goto-page="architecture">Egy modell anatómiája, 3. rész</a>
::::
:::: card label="Pretraining"
Az első nagy tanítási fázis: a modell milliárdnyi szövegen gyakorolja a "jósold meg a következő szót" feladatot — ez adja a nyers nyelvi és tényszerű tudást. → <a href="#model-training-1" data-goto-page="model-training">Modelltanítás, 1. rész</a>
::::
:::: card label="Backpropagation"
A mechanizmus, ami kiszámolja, a modell melyik belső beállítása mennyiben járult hozzá egy hibás jósláshoz, majd ez alapján korrigál. → <a href="#model-training-0" data-goto-page="model-training">Modelltanítás, 0. rész</a>
::::
:::: card label="Base modell"
Egy modell, ami csak a pretraining fázison esett át — statisztikailag folytatja a szöveget, de nem tanult meg kérdésre válaszolni. → <a href="#base-instruct-1" data-goto-page="base-vs-instruct">Base vs. Instruct, 1. rész</a>
::::
:::: card label="Instruction tuning / SFT"
A második tanítási fázis: a modell beszélgetés-párokon (instrukció + elvárt válasz) tanul meg utasítást követni, nem csak szöveget folytatni. → <a href="#base-instruct-2" data-goto-page="base-vs-instruct">Base vs. Instruct, 2. rész</a>
::::
:::: card label="RLHF"
A harmadik tanítási fázis: emberi preferencia alapján finomítja, melyik a "jobb" válasz a több, formailag helyes közül. → <a href="#rlhf-1" data-goto-page="rlhf">RLHF, 1. rész</a>
::::
:::: card label="Knowledge distillation"
Egy nagy "tanár" modell generál tanítóadatot egy kisebb "diák" modell számára — így a diák a tanár már megszűrt, magas minőségű kimeneteiből tanul. → <a href="#model-training-5" data-goto-page="model-training">Modelltanítás, 5. rész</a>
::::
:::::
::::::

:::::: section id=glossary-2 num="03" heading="3. rész — Finomhangolás és skálázás" nav="Finomhangolás és skálázás" group="Finomhangolás és skálázás"

<p class="topic-tagline">Hogyan specializálsz egy már betanított modellt, és hogyan optimalizálod a méretét/sebességét.</p>

::::: stack-grid
:::: card label="LoRA"
Egy fine-tuning technika: a bázis-súlyok fagyva maradnak, csak egy apró, tanítható "javító" mátrix-pár tanul — akár 10 000-szer kevesebb paraméterrel. → <a href="#fine-tuning-2" data-goto-page="fine-tuning">Fine-tuning, 2. rész</a>
::::
:::: card label="QLoRA"
LoRA kombinálva kvantálással — a fagyott bázis-súlyokat 4 bitesre tömöríti, ami akár 65 milliárd paraméteres modellek finomhangolását is lehetővé teszi egyetlen GPU-n. → <a href="#fine-tuning-3" data-goto-page="fine-tuning">Fine-tuning, 3. rész</a>
::::
:::: card label="PEFT"
Parameter-Efficient Fine-Tuning — a LoRA-t is magába foglaló technika-család, amik mind kevesebb tanítható paraméterrel érnek el specializációt. → <a href="#fine-tuning-4" data-goto-page="fine-tuning">Fine-tuning, 4. rész</a>
::::
:::: card label="Catastrophic forgetting"
A jelenség, amikor egy modell további tanítása felülírja a korábban megtanult tudást — a LoRA részlegesen véd ez ellen, mert a bázis-súlyok érintetlenek maradnak. → <a href="#kc-2" data-goto-page="knowledge-cutoff">Knowledge cutoff, 2. rész</a>
::::
:::: card label="MoE (Mixture of Experts)"
Egy architektúra-döntés: a feed-forward réteg helyett sok, kisebb "szakértő" hálóból csak néhányat aktivál egy adott tokenre — így a modell nagy tud lenni, de olcsóbban futtatható. → <a href="#dm-0" data-goto-page="dense-moe">Dense vs. MoE, 0. rész</a>
::::
:::: card label="Kvantálás"
A modell súlyainak pontosság-csökkentése (pl. 16 bitről 4 bitre) — kisebb memóriaigény, cserébe minőségromlás, amit gondosan kell mérlegelni. → <a href="#q-0" data-goto-page="quantization-quality">Kvantálás, 0. rész</a>
::::
:::: card label="KV cache"
A korábban kiszámolt attention-értékek eltárolása, hogy ne kelljen minden új tokennél újraszámolni a teljes eddigi beszélgetést. → <a href="#kv-0" data-goto-page="kv-cache">KV cache, 0. rész</a>
::::
:::: card label="Chinchilla-skálázás"
Az elv, hogy egy modell paraméterszáma és a tanítóadat mennyisége együtt kell nőjön (kb. 20 token/paraméter arányban) az optimális tanuláshoz. → <a href="#sz-1" data-goto-page="model-size">Modellméret, 1. rész</a>
::::
:::::
::::::

:::::: section id=glossary-3 num="04" heading="4. rész — Modalitás és biztonság" nav="Modalitás és biztonság" group="Modalitás és biztonság"

<p class="topic-tagline">Hogyan dolgozza fel a modell a nem-szöveges bemenetet, és hogyan gondolkodunk a megbízhatóságáról.</p>

::::: stack-grid
:::: card label="Multimodális modell"
Egy modell, ami képet, hangot vagy videót is natívan fel tud dolgozni, nem csak szöveget — a bemenet ugyanabba a token-térbe kerül, mint a szó. → <a href="#multimodal-0" data-goto-page="multimodal">Multimodális modellek, 0. rész</a>
::::
:::: card label="Diffúziós modell"
Egy generálási elv, ami a teljes kimenetet (jellemzően kép vagy videó) egyszerre, zajból bontja ki — nem szóról szóra, mint egy LLM. → <a href="#diffusion-0" data-goto-page="diffusion">Diffúziós modellek, 0. rész</a>
::::
:::: card label="Alignment"
Az a tervezési kihívás, hogy egy AI-rendszer viselkedése megbízhatóan illeszkedjen a tervezői és a felhasználók szándékához, ne csak a szó szerinti utasításhoz. → <a href="#ai-safety-0" data-goto-page="ai-safety">Alignment és red teaming, 0. rész</a>
::::
:::: card label="Red teaming"
Az a gyakorlat, hogy tudatosan, támadóként próbáljuk feltörni egy AI-rendszer korlátait, mielőtt valaki más tenné ezt élesben. → <a href="#ai-safety-1" data-goto-page="ai-safety">Alignment és red teaming, 1. rész</a>
::::
:::: card label="Jailbreak"
Egy prompt vagy technika, ami megpróbálja rávenni a modellt, hogy megkerülje a beépített biztonsági korlátait. → <a href="#sec-jailbreak" data-goto-page="security">Biztonság, jailbreak rész</a>
::::
:::: card label="Prompt injection"
Egy támadási forma, ahol a felhasználói (vagy külső, dokumentumból származó) bemenet megpróbálja felülírni a rendszer eredeti instrukcióit. → <a href="#sec-jailbreak" data-goto-page="security">Biztonság, jailbreak rész</a>
::::
:::: card label="OWASP"
Egy iparági szervezet, aminek LLM Top 10 listája a leggyakoribb, dokumentált biztonsági kockázatokat gyűjti össze LLM-alapú alkalmazásoknál. → <a href="#sec-owasp" data-goto-page="security">Biztonság, OWASP rész</a>
::::
:::::
::::::

:::::: section id=glossary-4 num="05" heading="5. rész — Agentic és eszközök" nav="Agentic és eszközök" group="Agentic és eszközök"

<p class="topic-tagline">Hogyan dolgozik egy AI önállóan, eszközökkel, és hogyan dolgozol te együtt vele fejlesztőként.</p>

::::: stack-grid
:::: card label="MCP (Model Context Protocol)"
Egy szabványosított protokoll, ami lehetővé teszi, hogy egy AI biztonságosan, egységes módon férjen hozzá külső eszközökhöz és adatokhoz. → <a href="#mcp-0" data-goto-page="mcp">MCP, 0. rész</a>
::::
:::: card label="ReAct"
Reasoning + Acting — a minta, ami a legtöbb mai AI agent gerince: gondolkodj, cselekedj (eszközt hívj), figyeld meg az eredményt, ismételd. → <a href="#agent-architecture-1" data-goto-page="agent-architecture">Agent architektúra, 1. rész</a>
::::
:::: card label="Function calling"
A mechanizmus, amivel egy modell strukturáltan "kér" egy eszközhívást egy adott paraméterekkel — ő maga sosem futtatja le, csak kéri. → <a href="#agent-architecture-2" data-goto-page="agent-architecture">Agent architektúra, 2. rész</a>
::::
:::: card label="Vibe coding"
Egy felügyelet nélküli, "Accept All" munkamód alacsony tétű prototípusokhoz — Karpathy 2025-ös fogalma, amit 2026-ban ő maga "agentic engineering"-re váltott. → <a href="#vibecoding-0" data-goto-page="vibecoding">Vibe coding, 0. rész</a>
::::
:::: card label="Agentic engineering"
A vibe coding utódfogalma: professzionális, felügyelt ügynök-orkesztrálás, ahol a kód a kész-definíció ellenében ellenőrzött. → <a href="#vibecoding-2" data-goto-page="vibecoding">Vibe coding, 2. rész</a>
::::
:::: card label="Multi-agent orkesztrálás"
Több AI-ügynök koordinált, párhuzamos vagy egymásra épülő munkája egy feladaton — öt bevett mintával (Solo, Parallel, Pipeline, Hub-and-Spoke, Swarm). → <a href="#agentic-coding-5" data-goto-page="agentic-coding">Agentic kódolás, 5. rész</a>
::::
:::: card label="SWE-bench"
Egy benchmark, ami valós GitHub issue-kat és javításokat használ a kódoló ügynökök teljesítményének mérésére. → <a href="#agentic-coding-7" data-goto-page="agentic-coding">Agentic kódolás, 7. rész</a>
::::
:::: card label="AGENTS.md / CLAUDE.md"
Projekt-szintű szabályfájlok, amiket egy agent automatikusan beolvas — konvenciók, tiltások, kontextus, amit egyébként minden alkalommal újra le kellene írnod. → <a href="#ac-agents" data-goto-page="aiconfig">AI Config fájlok</a>
::::
:::::
::::::

:::::: section id=glossary-5 num="06" heading="6. rész — Tudás és kontextus" nav="Tudás és kontextus" group="Tudás és kontextus"

<p class="topic-tagline">Honnan tudja a modell, amit tud — és mi történik, amikor ez félremegy.</p>

::::: stack-grid
:::: card label="RAG (Retrieval-Augmented Generation)"
Egy architektúra, ami a modell válaszadása előtt releváns dokumentum-részleteket keres és ad hozzá a kontextushoz — így a válasz a te saját adataidra épülhet. → <a href="#rag-0" data-goto-page="rag">RAG, 0. rész</a>
::::
:::: card label="Vektor adatbázis"
Egy adattár, ami szöveget (vagy más adatot) embeddingként tárol, és hasonlóság szerint (nem kulcsszó szerint) tud keresni benne. → <a href="#vec-0" data-goto-page="vectordb">Vektor adatbázisok, 0. rész</a>
::::
:::: card label="Embedding"
Egy szöveg (vagy kép) számokból álló vektor-reprezentációja, ami a jelentést kódolja — hasonló jelentésű dolgok közel kerülnek egymáshoz a térben. → <a href="#embedding-models-0" data-goto-page="embedding-models">Embedding modellek, 0. rész</a>
::::
:::: card label="Koszinusz hasonlóság"
A leggyakoribb módszer két embedding-vektor "közelségének" (hasonlóságának) mérésére a vektortérben. → <a href="#vec-1" data-goto-page="vectordb">Vektor adatbázisok, 1. rész</a>
::::
:::: card label="Halucináció"
Amikor a modell magabiztosan állít valami téveset — nem "hazugság", hanem a statisztikailag legvalószínűbb, de nem feltétlenül igaz válasz reprodukálása. → <a href="#hal-0" data-goto-page="hallucination">Halucináció, 0. rész</a>
::::
:::: card label="Knowledge cutoff"
Az az időpont, ameddig egy modell tanítóadata terjed — az utána történt eseményekről a modell alapból nem tud, csak ha külön kontextusba kapja. → <a href="#kc-0" data-goto-page="knowledge-cutoff">Knowledge cutoff, 0. rész</a>
::::
:::: card label="MMLU / benchmark"
Szabványosított tesztek, amik egy modell teljesítményét mérik egy adott feladattípuson — hasznos durva összehasonlításra, de sosem helyettesítik a saját tesztedet. → <a href="#evaluation-1" data-goto-page="evaluation">Evaluation, 1. rész</a>
::::
:::::
::::::

:::::: section id=glossary-summary num=SUMMARY nav="Hogyan használd" sub=true group="Tudás és kontextus"
## Hogyan érdemes <em>használnod ezt az oldalt</em>

::::: stack-grid
:::: card label="Gyors felütés"
Ha egy cikkben egy kifejezésbe futsz, amit nem ismersz, ide gyere vissza — egy-két mondat elég a kontextushoz, hogy folytathasd az olvasást.
::::
:::: card label="Mély megértés"
Ha a teljes mechanizmust is meg akarod érteni, minden kártya linkje elvisz a részletes, lépésről lépésre kifejtő szakaszhoz.
::::
:::: card label="Automatikus linkelés"
A cikkek szövegében is megjelennek ezek a fogalmak automatikusan linkelve — nem kell idáig visszaugranod, ha a cikk maga is mutat tovább.
::::
:::::
::::::
