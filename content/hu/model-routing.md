---
page: cost-routing
title: Költség-optimalizáció és model routing
sidebar_groups:
  - Elmélet
  - Döntési keret
  - Technikák
  - Gyakorlat
  - Referencia
hero:
  eyebrow: "Költség & Routing · Fejlesztői Tanulási Terv"
  title: "Költség-optimalizáció és <em>model routing</em>"
  lead: "Melyik modellt mikor éri meg használni — kicsi vs. nagy, lokális vs. API. Hogyan gondolkodik erről a fejlesztő, az elemző, a vállalat és a végfelhasználó — és milyen technikák (routing, cascade, caching) csökkentik a számlát minőségromlás nélkül. Épít a <em>hardver/VRAM</em> és a <em>dense/MoE</em> tutorialokra."
  stats:
    - { val: "10", lbl: "Szakasz" }
    - { val: "4", lbl: "Nézőpont" }
    - { val: "2", lbl: "Feladat" }
    - { val: "40-85%", lbl: "Tipikus megtakarítás" }
footer:
  left: "AI Hub · Költség-optimalizáció és model routing"
  right: "Költség & Routing · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#cr-0"><div class="tc-num">0. rész</div><div class="tc-name">A túlméretezés csapdája</div><div class="tc-desc">Miért drágul el minden "biztos, ami biztos" frontier-hívás.</div></a>
  <a class="toc-card" href="#cr-1"><div class="tc-num">1. rész</div><div class="tc-name">A költség anatómiája</div><div class="tc-desc">API-token, lokális TCO, rejtett költségek.</div></a>
  <a class="toc-card" href="#cr-2"><div class="tc-num">2. rész</div><div class="tc-name">Modellméret-osztályok</div><div class="tc-desc">Melyik méret mire jó.</div></a>
  <a class="toc-card" href="#cr-3"><div class="tc-num">3. rész</div><div class="tc-name">Lokális vs. API</div><div class="tc-desc">A négy döntési tengely.</div></a>
  <a class="toc-card" href="#cr-4"><div class="tc-num">4. rész</div><div class="tc-name">Négy nézőpont</div><div class="tc-desc">Felhasználó, fejlesztő, elemző, vállalat.</div></a>
  <a class="toc-card" href="#cr-5"><div class="tc-num">5. rész</div><div class="tc-name">Routing vs. cascade</div><div class="tc-desc">Ez a két minta, amit tudnod kell.</div></a>
  <a class="toc-card" href="#cr-6"><div class="tc-num">6. rész</div><div class="tc-name">A MoE mint routing</div><div class="tc-desc">Architektúra-szinten már megoldva.</div></a>
  <a class="toc-card" href="#cr-7"><div class="tc-num">7. rész</div><div class="tc-name">Cache, Route, Compress</div><div class="tc-desc">A három pillér, ebben a sorrendben.</div></a>
  <a class="toc-card" href="#cr-8"><div class="tc-num">Feladat</div><div class="tc-name">Router + TCO</div><div class="tc-desc">Kaszkád kóddal, break-even számítás.</div></a>
  <a class="toc-card" href="#cr-9"><div class="tc-num">9. rész</div><div class="tc-name">Buktatók & döntési fa</div><div class="tc-desc">Mikor NE optimalizálj.</div></a>
</div>
::::::

:::::: section id=cr-0 num="00" heading="0. rész — A túlméretezés csapdája" nav="Túlméretezés csapdája" group="Elmélet"

<p class="topic-tagline">Cél: értsd, miért nem "biztonságos alapértelmezés" mindenre a legnagyobb modellt hívni.</p>

### A "biztos, ami biztos" hiba

A leggyakoribb tervezési döntés AI-termékeknél: **minden kérést a legerősebb (frontier) modellhez küldeni**, mert "úgyis a legjobb minőséget akarjuk". Ez a gondolkodás két okból bukik el:

::::: stack-grid
:::: card label="A számla exponenciálisan nő"
A hatékony és a frontier modellek közti ár-különbség 2026-ban jellemzően **5-25×**, extrém esetben ~100× — attól függően, melyik szegmenst hasonlítod. Ha minden kérés a legdrágább utat járja, a költség lineárisan követi a forgalmat, ahelyett hogy a feladat-nehézséghez igazodna.
::::
:::: card label="A minőség nem is romlik, ha jól route-olsz"
A gyakorlati tapasztalat (és a kutatás) azt mutatja: a **valós forgalom nagy része nem is igényel frontier modellt**. Egy jól hangolt routing-réteg a frontier minőség ~95%-át hozza, miközben a hívásoknak csak töredékét küldi drága modellhez.
::::
:::::

### Miért 2026-ban vált ez kulcskérdéssé?

Három dolog esett egybe: (1) a **modell-tér besűrűsödött** — sok, jól dokumentált képességű, eltérő árazású modell verseng egymással; (2) az **agentic workflow-k** (tervezés, tool-hívás, ellenőrzés, válasz) egyetlen felhasználói kérésből **3-10× több modellhívást** csinálnak, mint egy sima chat; (3) a **routing-eszközök** (gateway-ek, kaszkád-keretrendszerek) begyakorlottá és éles-készen elérhetővé váltak, tehát a megoldás már nem kutatási projekt, hanem bevett gyakorlat.

::::: callout label="Egy mondatban"
**A model routing azt jelenti: minden kérést a legolcsóbb modellhez küldesz, ami még megfelel** — nem a legerősebbhez alapból. Ez ma az egyik legnagyobb, egyetlen döntéssel elérhető költség-kar egy AI-terméknél.
:::::
::::::

:::::: section id=cr-1 num="01" heading="1. rész — A költség anatómiája" nav="Költség anatómiája" group="Elmélet"

<p class="topic-tagline">Cél: lásd a teljes költség-képet, nem csak a token-árat.</p>

### API-költség: nem csak a token-ár

Egy API-hívás ára az **input és output tokenek** szorzata az adott modell díjtáblájával — de a tényleges számla ennél összetettebb, mert a modern agentic rendszerek soklépéses hívás-láncokat futtatnak. Egy **korlátlan (unconstrained) agent** egyetlen szoftverfejlesztési feladatot több dollárnyi API-díjért old meg — nem azért, mert a modell drága, hanem mert a folyamat sokszor hívja.

### Lokális TCO (Total Cost of Ownership)

A **hardver tutorial** VRAM-képlete adja meg, milyen kártya kell egy modellhez — de a teljes lokális költség ennél több: a kártya/szerver **beszerzési ára**, az **áramfogyasztás**, és a **kihasználtság**. Az ökölszabály: a lokális hardver csak akkor térül meg, ha a GPU-t **napi 8-12 órán túl, folyamatosan** terheled — alacsonyabb kihasználtságnál egy felhő/API-megoldás olcsóbb, mert nem fizetsz az üresjáratért.

### A rejtett költségek, amiket a legtöbben kihagynak

::::: stack-grid
:::: card label="Latency költsége"
Egy lassabb modell nem csak kényelmetlen — ha a UX-be épül, konverziót/elégedettséget veszíthetsz. Ez nehezen árazható, de valós tétel.
::::
:::: card label="Hibaarány / retry"
Egy gyengébb modell több hibás/hasznavehetetlen választ ad, amit újra kell próbálni — ez megduplázhatja a tényleges hívásszámot.
::::
:::: card label="Fejlesztői idő"
Egy routing-réteg vagy egy egyedi finomhangolt kis modell felépítése mérnöki idő — ezt a megtérülés-számításba be kell venni, nem csak a token-árba.
::::
:::: card label="Infrastruktúra"
Gateway, vektor-DB a semantic cache-hez, monitoring — mindezek saját üzemeltetési költséggel járnak, amit a "csak az API-számla" nézet elrejt.
::::
:::::
::::::

:::::: section id=cr-2 num="02" heading="2. rész — Modellméret-osztályok és mire valók" nav="Modellméret-osztályok" group="Elmélet"

<p class="topic-tagline">Cél: tudd, melyik méret-osztály melyik feladathoz "elég jó".</p>

### A durva térkép

::::: stack-grid
:::: card label="Kicsi (1-8B)"
Osztályozás, egyszerű kinyerés, rövid összegzés, sablon-kitöltés, egyszerű chat-válasz. Lokálisan is futtatható a **hardver tutorial** szerinti szerény VRAM-mal. Ez a cascade "első lépcsője" (5. rész).
::::
:::: card label="Közepes (13-32B)"
Összetettebb következtetés, kódgenerálás egyszerű feladatokra, hosszabb kontextus kezelése. Jó ár/teljesítmény arány, gyakran ez a "munkaerő" tier.
::::
:::: card label="Nagy (70B+) / MoE nagy total"
Komplex, több lépéses érvelés, árnyalt írás, ritka/specializált tudás. Itt jön képbe a **dense/MoE tutorial**: sok nagy modell ma MoE, ami a minőséget úgy adja, hogy a *számítási* költség (nem a memória) alacsonyabb marad.
::::
:::: card label="Frontier API-modellek"
A legjobb elérhető érvelés, komplex agentic feladatok, ritka él-esetek. Itt a legmagasabb az ár, ezért ide kerüljön a forgalom **legkisebb, leginkább indokolt** hányada.
::::
:::::

::::: callout warning label="A minőség nem lineáris a mérettel"
Egy kétszer nagyobb modell nem ad kétszer jobb választ — a legtöbb feladatnál a minőségi görbe **ellaposodik** egy ponton. A kérdés sosem "melyik a legjobb modell", hanem "melyik a legkisebb modell, ami *erre a konkrét feladatra* elég jó".
:::::
::::::

:::::: section id=cr-3 num="03" heading="3. rész — Lokális vs. API: a négy döntési tengely" nav="Lokális vs. API" group="Döntési keret"

<p class="topic-tagline">Cél: strukturált szempontrendszer, nem "érzésre" döntés.</p>

::::: stack-grid
:::: card label="Adatvédelem / compliance"
Ha az adat nem hagyhatja el a szervezetet (GDPR, egészségügyi, pénzügyi adat), a lokális futtatás **eleve kizárja** a megfelelőségi kockázatot — nincs mit mérlegelni.
::::
:::: card label="Volumen és kihasználtság"
Magas, folyamatos (napi 8-12 óra+) terhelésnél a lokális hardver amortizálódik. Alacsony/tüskés forgalomnál az API előnyösebb, mert nem fizetsz üresjáratért.
::::
:::: card label="Latency-igény és offline-képesség"
Ha a hálózati út (API round-trip) latency-kritikus, vagy offline működés kell, a lokális futtatás nyer — feltéve, hogy a hardver bírja (lásd hardver tutorial).
::::
:::: card label="Üzemeltetési komplexitás"
Az API "csak működik" — a lokális futtatás driver-, kvantálás- és skálázási felelősséget ad hozzád. Ha nincs erre kapacitásod, ez az API mellett szól.
::::
:::::

::::: callout label="A hibrid a leggyakoribb éles minta"
A legtöbb éles rendszer nem "vagy-vagy", hanem **hibrid**: gyakori, egyszerű, érzékeny adatú feladatok lokálisan futnak, a ritka, komplex, nem-érzékeny esetek API-ra eszkalálódnak. Ez pontosan a routing/cascade logika (5. rész), csak a "kis modell" és "nagy modell" helyett itt "lokális" és "API" a két végpont.
:::::
::::::

:::::: section id=cr-4 num="04" heading="4. rész — Négy nézőpont: felhasználó, fejlesztő, elemző, vállalat" nav="Négy nézőpont" group="Döntési keret"

<p class="topic-tagline">Cél: ugyanaz a technikai eszköztár mást jelent attól függően, ki néz rá.</p>

### Miért számít ez?

A routing/caching/méretezés ugyanaz a technikai eszköztár marad, de a **döntési kritérium** és a **mit optimalizálunk** kérdés stakeholderenként más. Ha csak a fejlesztői szempontot ismered, könnyen olyan megoldást építesz, ami technikailag elegáns, de üzletileg vagy felhasználóilag nem az, amire szükség volt.

::::: stack-grid
:::: card label="Végfelhasználó"
Egyszerű haszon/ár mérlegelés: "megéri-e a Plus-előfizetés a gyorsabb/jobb válaszért", vagy "melyik ingyenes/olcsó modell elég jó a magánprojektemhez". Nincs routing-infrastruktúra — a döntés maga a **modellválasztás** a felhasználói felületen (pl. melyik modellt választod egy chat-alkalmazásban).
::::
:::: card label="Fejlesztő / mérnök"
A **margin per request** és a **latency budget** a fő szempont. Épít routert, cache-t, eval-harnesst, hogy a termék nyereséges maradjon skálán. Itt dől el, melyik technikai mintát (5-7. rész) érdemes bevezetni, és milyen sorrendben.
::::
:::: card label="Elemző / adattudós"
**TCO-modellezést és szcenárió-elemzést** végez: mi történik a költséggel, ha a forgalom megduplázódik, ha egy modell ára változik, ha a cache-találati arány romlik. Az ő eszköze a feladat 2 (8. rész) típusú számítás, kiterjesztve érzékenység-vizsgálatra.
::::
:::: card label="Vállalat / vezetés / procurement"
**Kockázat, beszállítói függés (vendor lock-in) és költségvetési kormányzás** a fő szempont — nem csak "mennyibe kerül", hanem "mi történik, ha a szolgáltató árat emel, leállítja a modellt, vagy compliance-problémát okoz". Ez a szint dönt a *build vs. buy* kérdésben: saját gateway/routing infrastruktúrát építsenek-e, vagy egy kész (Portkey-, LiteLLM-szerű) megoldást vegyenek.
::::
:::::

::::: callout warning label="A négy nézőpont gyakran összeütközik"
A fejlesztő a legolcsóbb, technikailag legjobb megoldást akarja; a vállalat a legkevesebb kockázatút; a végfelhasználó észre sem akarja venni, hogy routing történik (ne kapjon látványosan gyengébb választ egy "olcsó útra" terelt kérdésnél). Egy jó routing-rendszer mind a négy nézőpontot kiszolgálja: a felhasználó nem lát minőségromlást, a fejlesztő mérhető margint lát, az elemző előre jelezhető költséggörbét kap, a vállalat pedig nem függ egyetlen szolgáltatótól.
:::::
::::::

:::::: section id=cr-5 num="05" heading="5. rész — Routing vs. cascade: a két alapminta" nav="Routing vs. cascade" group="Technikák"

<p class="topic-tagline">Cél: ismerd fel a különbséget — gyakran összekeverik, pedig eltérő minták.</p>

### A fogalmi különbség

::::: stack-grid
:::: card label="Routing — egylépéses döntés"
A kérés végrehajtása **előtt** egy klasszifikátor eldönti, melyik modell kapja — és **csak az** fut. A döntés alapulhat szándék-osztályozáson ("ez kódolási kérdés → kód-specifikus modell"), komplexitás-becslésen, vagy hasonlóságon korábbi kérésekhez.
::::
:::: card label="Cascade — szekvenciális eszkaláció"
A kérés **elsőként** a legolcsóbb modellhez megy. Ha a válasz-megbízhatóság egy küszöb alatt van, a kérés **eszkalálódik** a következő, erősebb (drágább) tierre — és így tovább, amíg elég magabiztos válasz nem születik, vagy el nem éri a legerősebb modellt.
::::
:::::

![Cascade routing folyamata: kis modell, majd eszkaláció bizonytalanság esetén](__IMG__/cost-01-cascade.jpg)

### A router maga is költséget/latency-t ad — de elenyészőt

A routing-döntés maga is időbe kerül: egy szabály-alapú (regex/kulcsszó) router <1 ms-ot ad hozzá, egy embedding-alapú ~5 ms-ot, egy nehezebb ML-klasszifikátor 50-100 ms-ot. Egy tipikus 500-2000 ms-os LLM-válaszidőhöz képest ez **egyszámjegyű százalék** — a routing latency-költsége szinte mindig eltörpül a modellhívás mellett, *kivéve* ha a router maga is egy LLM-et hív klasszifikációra (az egy teljes extra kör, csak akkor éri meg, ha a döntés valóban nehéz máshogy).

### Konkrét, publikált eredmények (tájékoztató jelleggel)

::::: callout label="Amit érdemes fejben tartani"
A publikált kutatások és gyakorlati keretrendszerek (pl. a Stanford FrugalGPT vagy a nyílt RouteLLM) rendre **75-98%-os költségcsökkenést** mutatnak a frontier-only megközelítéshez képest, miközben a válaszminőség **~95%-on** marad a frontier szinthez viszonyítva. A pontos szám mindig a saját feladat-eloszlásodtól függ — de a nagyságrend (a hívások többsége nem igényel frontier modellt) stabilan igaz marad, ahogy az árak és a modellek változnak is.
:::::
::::::

:::::: section id=cr-6 num="06" heading="6. rész — A MoE mint beépített, architektúra-szintű routing" nav="MoE mint routing" group="Technikák"

<p class="topic-tagline">Cél: lásd meg, hogy a MoE tutorialban tanultak már eleve egy routing-mintát valósítanak meg.</p>

### Ugyanaz a minta, más szinten

A **dense vs. MoE tutorial** router-mechanizmusa (top-k gating) és az itt tárgyalt alkalmazás-szintű model routing **fogalmilag azonos elvet** követ: mindkettő azt dönti el, hogy egy adott bemenethez a rendelkezésre álló "erőforrások" (expertek, illetve modellek) közül melyiket érdemes aktiválni — a felesleges számítás elkerülésével.

::::: stack-grid
:::: card label="MoE router (architektúra-szint)"
Egyetlen modellen **belül**, tokenenként dönt, melyik expert-alhálózat aktiválódjon. A cél: a *total* tudás-kapacitást magasan tartani, miközben a *tokenenkénti compute* alacsony marad.
::::
:::: card label="Alkalmazás-szintű router (ez a tutorial)"
Több, **különálló modell** közt, kérésenként dönt, melyik egész modell fusson le. A cél: a *feladat-nehézséghez* igazítani a *modell-erőt és -árat*.
::::
:::::

### Mikor elég a MoE önmagában, és mikor kell rátenni egy alkalmazás-szintű routert is?

Ha egyetlen jó MoE modellt használsz (pl. egy Qwen3-Coder 30B-A3B-t), a MoE már megadja a költséghatékonyságot *azon a modellen belül*. De ha a feladat-eloszlásod nagyon vegyes — vannak triviális kérdések és vannak ritka, nagyon nehéz kérdések is —, egy **alkalmazás-szintű router/cascade** ráadásul azt is eldönti, hogy egyáltalán **melyik modellt** (kis dense, nagy MoE, frontier API) érdemes elindítani. A kettő kombinálható: egy cascade első lépcsője lehet egy olcsó, lokális MoE modell, a második lépcső egy frontier API.

::::: callout label="Kombinált hatás"
A szakirodalom szerint a MoE-architektúra, a kvantálás és a speculative decoding együttes alkalmazása **5-10×-es** költséghatékonyság-javulást hozhat egy dense baseline-hoz képest — ez pedig *még azelőtt* jelentkezik, hogy egyetlen alkalmazás-szintű routing-döntés megszületne. A két szint (architektúra + alkalmazás) hatása szorzódik, nem helyettesíti egymást.
:::::
::::::

:::::: section id=cr-7 num="07" heading="7. rész — Cache, Route, Compress: a három pillér" nav="Cache, Route, Compress" group="Technikák"

<p class="topic-tagline">Cél: ismerd a bevett sorrendet — ez adja a legtöbb megtakarítást a legkevesebb munkával.</p>

### A javasolt sorrend

A gyakorlati tapasztalat szerint van egy **hatékonysági sorrend**, amiben érdemes bevezetni ezeket a technikákat — a legkisebb erőfeszítés/legnagyobb hatás elöl:

::::: stack-grid
:::: card label="1 · Prompt caching (szolgáltatói szint)"
A nagy API-szolgáltatók (Anthropic, OpenAI, Google) natívan kínálják: az ismétlődő prompt-részek (rendszer-prompt, hosszú kontextus eleje) cache-elt feldolgozásáért **jelentősen** kevesebbet fizetsz. Ez erősen kapcsolódik a **KV-cache tutorial** prefix caching részéhez — ugyanaz a mechanizmus, csak API-szinten, díjszabásba építve. Szinte "ingyen" bevezethető, gyakran a legnagyobb egyszeri nyereség.
::::
:::: card label="2 · Batch API"
Ha nem kell azonnali válasz (offline feldolgozás, elemzés, tömeges dokumentum-feldolgozás), a legtöbb szolgáltató **fix, garantált kedvezményt** ad az aszinkron batch-végpontokért. Egyszerű architekturális döntés, nagy, kiszámítható megtakarítással.
::::
:::: card label="3 · Model routing / cascade"
Az 5-6. részben tárgyalt minta — a legnagyobb egyszeri kar, de ez igényli a legtöbb tervezést (klasszifikátor, eval-harness, megbízhatósági küszöb).
::::
:::: card label="4 · Semantic caching"
Nem szó szerinti, hanem **jelentésbeli** egyezésre cache-elsz — a vektor-DB tutorial embedding-hasonlósági technikáját alkalmazva a *válaszokra*, nem a tudásbázisra. Ismétlődő kérdés-mintázatú forgalomnál (support, FAQ-szerű) nagy találati arányt hozhat.
::::
:::: card label="5 · Prompt/context compression"
A promptba kerülő, ténylegesen szükséges token-mennyiség csökkentése — pl. a RAG-találatok tömörebb, kevésbé verbózus beillesztése. Kisebb hatás önmagában, de "ingyen" jön a többi mellé.
::::
:::::

### Hogyan kapcsolódik a semantic caching a vektor-DB tutorialhoz?

A semantic cache ugyanazt a gépezetet használja, mint a RAG retrieval: a bejövő kérdést embeddeled, és a korábbi kérdés-válasz párok embeddingjei közt **hasonlóság alapján** keresel. Ha a hasonlóság egy küszöb fölött van, a tárolt választ adod vissza — **egyetlen modellhívás nélkül**. A különbség a RAG-hoz képest: itt nem *tudást* keresel vissza, hanem egy **korábbi teljes választ**.

::::: callout warning label="A küszöb kalibrálása kényes"
Túl magas hasonlósági küszöb → kevés cache-találat, elmarad a megtakarítás. Túl alacsony → felszínesen hasonló, de valójában eltérő kérdésekre adod vissza a régi választ — ez **hibás válasz**, nem csak elszalasztott megtakarítás. Időérzékeny adatnál (pl. "mennyi van készleten") a cache-nek **érvénytelenítési logika** is kell, különben órákon belül elavult választ ismételget.
:::::
::::::

:::::: section id=cr-8 heading="Feladat — Router + cascade kóddal, és egy TCO-számítás" nav="Feladat" group="Gyakorlat"

<p class="topic-tagline">Cél: építs egy minimál cascade-et, és számold ki, mikor térül meg a lokális hardver.</p>

### 1. rész — Egyszerű cascade router Pythonban

```python
import anthropic

client = anthropic.Anthropic()

# a modell-tierek — a saját elérhető modelljeidhez igazítva
TIERS = ["claude-haiku-4-5-20251001", "claude-sonnet-5", "claude-opus-4-8"]

def confident_enough(response_text, min_length=20):
    # leegyszerűsített "megbízhatóság" heurisztika a demóhoz —
    # élesben ez lehet log-prob alapú, vagy egy külön klasszifikátor
    hedge_words = ["nem vagyok biztos", "talán", "esetleg", "nem tudom eldönteni"]
    is_hedging = any(h in response_text.lower() for h in hedge_words)
    is_too_short = len(response_text) < min_length
    return not (is_hedging or is_too_short)

def cascade(question, tiers=TIERS):
    for i, model in enumerate(tiers):
        resp = client.messages.create(
            model=model, max_tokens=500,
            messages=[{"role": "user", "content": question}],
        )
        answer = resp.content[0].text
        if confident_enough(answer) or i == len(tiers) - 1:
            print(f"[{model}] válaszolt ({i+1}. lépcső)")
            return answer, model
    return answer, model

answer, used_model = cascade("Mi Magyarország fővárosa?")
print(f"Végső modell: {used_model}")
```

::::: callout label="Gyakorlat"
Futtasd le a fenti kaszkádot 10-15 különböző nehézségű kérdéssel (néhány triviális, néhány összetett többlépéses érvelést igénylő). Számold ki, hány %-ban elégedett meg a legkisebb modellel. Cseréld le a `confident_enough` heurisztikát egy szigorúbbra vagy engedékenyebbre, és nézd meg, hogyan tolódik el az arány — ez maga a küszöb-kalibrálás, amiről a 7. rész beszélt.
:::::

### 2. rész — TCO / break-even számítás: lokális GPU vs. API

```python
def break_even_days(gpu_cost_usd, power_cost_per_day_usd,
                     api_cost_per_day_at_same_volume_usd):
    """
    Hány nap alatt térül meg egy lokális GPU-beszerzés
    ugyanannyi forgalom mellett, mint amennyit API-n fizetnél.
    """
    daily_local_cost = power_cost_per_day_usd
    daily_savings = api_cost_per_day_at_same_volume_usd - daily_local_cost
    if daily_savings <= 0:
        return None  # az API így is olcsóbb marad, sosem térül meg
    return gpu_cost_usd / daily_savings

# példa: egy használt RTX 3090 (24GB) beszerzési ára + becsült áramköltség
days = break_even_days(
    gpu_cost_usd=500,
    power_cost_per_day_usd=1.2,       # ~350W, napi 8 óra, helyi áramár szerint
    api_cost_per_day_at_same_volume_usd=8.0,  # a te becsült napi API-forgalmad ára
)
print(f"Megtérülés: ~{days:.0f} nap" if days else "Az API így is olcsóbb marad")
```

::::: callout label="Gyakorlat"
Írd be a saját becsült napi API-forgalmadat (vagy egy tervezett projekt várható hívásszámát × a modell ára). Számítsd ki a break-even pontot egy általad választott GPU-ra (a **hardver tutorial** VRAM-táblázatából). Változtasd a kihasználtságot (napi 2 óra vs. napi 12 óra) — figyeld meg, hogyan tolja el drámaian a megtérülési időt. Ez az elemzői nézőpont (4. rész) gyakorlati eszköze.
:::::
::::::

:::::: section id=cr-9 num="09" heading="9. rész — Éles buktatók és a döntési fa" nav="Éles buktatók" group="Éles használat"

<p class="topic-tagline">Cél: ismerd a gyakori hibákat, és legyen egy záró, gyakorlatias döntési kereted.</p>

### Gyakori hibák

::::: callout danger label="Amiben a legtöbben elbuknak"
**✗** Routing bevezetése eval-harness nélkül — nem tudod, hogy a "olcsó út" tényleg tartja-e a minőséget · **✗** A router latency-jét túlbecsülni, és emiatt el sem indítani a projektet (valójában egyszámjegyű % a teljes válaszidőhöz képest) · **✗** Semantic cache rosszul kalibrált küszöbbel — hibás válaszokat ad vissza felszínesen hasonló kérdésekre · **✗** Időérzékeny adatnál cache-elni érvénytelenítési logika nélkül · **✗** A rejtett költségeket (fejlesztői idő, infrastruktúra) kihagyni a megtérülés-számításból · **✗** Korai over-engineering: routing-infrastruktúrát építeni, mielőtt a forgalom vagy a számla indokolná.
:::::

### Mikor NE optimalizálj még

Ha a projekted korai fázisban van, alacsony a forgalom, és a számla elhanyagolható — **ne** építs routing-réteget. A komplexitás (klasszifikátor karbantartása, több modell eval-elése, cache-invalidáció) csak akkor éri meg, ha a méretezés ezt ténylegesen indokolja. Kezdj egyetlen, megbízható modellel, és **mérd** a költséget és a minőséget — a routing legyen válasz egy mért problémára, ne előre beépített komplexitás.

### A döntési fa

::::: stack-grid
:::: card label="Alacsony forgalom, korai fázis?"
→ Egyetlen jó modell, prompt caching bekapcsolva. Ne építs többet.
::::
:::: card label="Növekvő forgalom, vegyes nehézség?"
→ Cascade vagy routing bevezetése, eval-harness-szel validálva.
::::
:::: card label="Magas, folyamatos, érzékeny adatú forgalom?"
→ Lokális/hibrid megoldás mérlegelése a **hardver tutorial** VRAM-számítása alapján.
::::
:::: card label="Ismétlődő kérdés-mintázat (support, FAQ)?"
→ Semantic caching első helyen — itt a legnagyobb az egyszeri megtakarítás.
::::
:::::
::::::

:::::: section id=cr-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A tutorial végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0–2. rész"
A túlméretezés csapdája · a költség anatómiája · modellméret-osztályok
::::
:::: card label="3–4. rész"
Lokális vs. API négy tengelye · négy nézőpont: felhasználó, fejlesztő, elemző, vállalat
::::
:::: card label="5–6. rész"
Routing vs. cascade · a MoE mint architektúra-szintű routing
::::
:::: card label="7. rész"
Cache, Route, Compress — a bevált sorrend · semantic caching kalibrálása
::::
:::: card label="Feladat"
Cascade router kóddal · TCO/break-even számítás lokális GPU-ra
::::
:::: card label="9. rész"
Gyakori buktatók · mikor NE optimalizálj · záró döntési fa
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>hardver/VRAM</em> (lokális TCO alapja), a <em>dense vs. MoE</em> (architektúra-szintű routing) és a <em>vektor-adatbázisok</em>/<em>KV-cache</em> (semantic és prompt caching mechanizmusa) tutorialok.</p>
::::::
