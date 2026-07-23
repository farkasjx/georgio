---
page: agent-architecture
title: Hogyan dönt egy AI agent — a ReAct hurok
sidebar_groups:
  - Elmélet
  - A hurok
  - Korlátok
  - Referencia
hero:
  eyebrow: "Agent architektúra · Fejlesztői Tanulási Terv"
  title: "Hogyan dönt egy AI agent — <em>a ReAct hurok</em>"
  lead: "Az MCP tutorial megmutatta, HOGYAN kapcsolódik egy agent külső eszközökhöz — ez a cikk azt nézi meg, mi dönti el, MIKOR és MELYIK eszközt hívja. A ReAct (Reason + Act) minta 2022 óta a legtöbb, ma futó AI-agent gerince — egy egyszerű, de sokat magyarázó hurok. Épít a <em>Reasoning</em> és az <em>MCP</em> tutorialokra."
  stats:
    - { val: "2022", lbl: "a ReAct eredeti kutatása" }
    - { val: "3", lbl: "eszköz-kategória" }
    - { val: "5", lbl: "Szakasz" }
    - { val: "0", lbl: "beépített \"kész\" fogalom" }
footer:
  left: "AI Hub · Agent architektúra"
  right: "Agent architektúra · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#agent-architecture-0"><div class="tc-num">0. rész</div><div class="tc-name">Mi különbözteti meg egy agentet egy chatbottól</div><div class="tc-desc">Egyetlen válasz vs. iteratív hurok.</div></a>
  <a class="toc-card" href="#agent-architecture-1"><div class="tc-num">1. rész</div><div class="tc-name">A ReAct hurok négy lépése</div><div class="tc-desc">Gondolkodj, cselekedj, figyeld meg, ismételd.</div></a>
  <a class="toc-card" href="#agent-architecture-2"><div class="tc-num">2. rész</div><div class="tc-name">Hogyan dönt, melyik eszközt hívja</div><div class="tc-desc">A tool-definíció, ami alapján a modell választ.</div></a>
  <a class="toc-card" href="#agent-architecture-3"><div class="tc-num">3. rész</div><div class="tc-name">A "mikor van vége" probléma</div><div class="tc-desc">A modellnek nincs beépített "kész" fogalma.</div></a>
  <a class="toc-card" href="#agent-architecture-4"><div class="tc-num">4. rész</div><div class="tc-name">Három eszköz-kategória</div><div class="tc-desc">Adat, akció, orkesztrálás — miért érdemes elkülöníteni.</div></a>
</div>
::::::

:::::: section id=agent-architecture-0 num="00" heading="0. rész — Mi különbözteti meg egy agentet egy chatbottól" nav="Mi különbözteti meg egy agentet egy chatbottól" group="Elmélet"

<p class="topic-tagline">Cél: tisztázd a legalapvetőbb megkülönböztetést, mielőtt a mechanizmusba mennénk.</p>

### Egyetlen válasz vs. iteratív hurok

::::: compare
::: bad label="Egy \"sima\" chatbot"
Egy bemenetre **egyetlen** választ ad — nem tud köztes lépéseket tenni, nem tud eszközt hívni, nem tud a saját korábbi akciója eredményére reagálni.
:::
::: good label="Egy AI agent"
**Iteratívan** dolgozik: gondolkodik, cselekszik (pl. eszközt hív), megfigyeli az eredményt, és ez alapján dönt, mi legyen a **következő** lépés — ezt ismétli, amíg a feladat készen nincs.
:::
:::::

::::: callout label="Kapcsolat a Reasoninghoz"
Ez ugyanaz az iteratív hurok, amit a <em>Reasoning</em> tutorial 2–4. részében az Excel-példánál és a kódolásnál láttál — ez a cikk azt a mechanizmust bontja fel részletesebben, ami eldönti, **mikor** és **melyik** eszközt hívja a modell egy ilyen huroknál.
:::::

::::: callout label="Egy mondatban"
A "chatbot" és az "agent" közti különbség nem a modell mérete vagy okossága — hanem hogy a **köré épített rendszer** engedi-e neki, hogy iteratívan, eszközökkel dolgozzon egyetlen válasz helyett.
:::::
::::::

:::::: section id=agent-architecture-1 num="01" heading="1. rész — A ReAct hurok négy lépése" nav="A ReAct hurok négy lépése" group="A hurok"

<p class="topic-tagline">Cél: ismerd meg a konkrét, névvel ellátott mintát, ami a legtöbb mai agent gerince.</p>

### Reason + Act = ReAct

A **ReAct** (Reasoning + Acting) egy 2022-es kutatásból származó minta, ami a chain-of-thought reasoninget (lásd a <em>Reasoning</em> tutorialt) **összefonja** a tényleges eszközhasználattal:

::::: stack-grid
:::: card label="1 · Reason (gondolkodj)"
A modell — a <em>Reasoning</em> tutorialban látott gondolkodó tokenekkel — **átgondolja**, mit kellene tennie, és miért éppen azt.
::::
:::: card label="2 · Act (cselekedj)"
A modell **kér** egy konkrét eszközhívást, meghatározott paraméterekkel — ő maga nem futtatja le, csak "kéri" a futtató rendszertől (lásd a 2. részt).
::::
:::: card label="3 · Observe (figyeld meg)"
Az eszköz **eredménye** visszakerül a modellhez — ez az új információ, amire a következő gondolkodási kör épül.
::::
:::: card label="4 · Ismétlés vagy válasz"
A modell eldönti: elég információja van-e már a végső válaszhoz, vagy **folytatnia** kell egy újabb gondolkodás-cselekvés körrel.
::::
:::::

::::: callout label="Egy konkrét, illusztratív példa"
Ha egy agentnek az a feladata, hogy ellenőrizzen egy fogadási feltételt ("ha esett Londonban, válts dollárra"), és az időjárás-lekérdezés **0 mm csapadékot** ad vissza, a modell **maga dönt úgy**, hogy a feltétel nem teljesült, és a második (valutaváltó) eszközt **nem is hívja meg** — ezt senki nem írta elő explicit szabályként, a modell a megfigyelt eredmény alapján, önállóan következtetett.
:::::

::::: callout label="Egy mondatban"
A ReAct nem egy bonyolult architektúra — egyszerűen egy **while-ciklus**, amiben egy LLM ismételten gondolkodik, eszközt kér, és az eredményből tanul, amíg a feladat készen nincs.
:::::
::::::

:::::: section id=agent-architecture-2 num="02" heading="2. rész — Hogyan dönt, melyik eszközt hívja" nav="Hogyan dönt, melyik eszközt hívja" group="A hurok"

<p class="topic-tagline">Cél: értsd meg a konkrét mechanizmust, ami mögött ez a döntés áll.</p>

### A tool-definíció: a modell "menüje"

Minden elérhető eszközhöz (lásd az <em>MCP</em> tutorialt a szabványosított hozzáféréshez) tartozik egy **strukturált leírás** — a modell ezt "olvassa", amikor eldönti, melyik illik a feladathoz:

```
{
  "name": "get_weather",
  "description": "Aktuális időjárás lekérdezése egy adott városra.",
  "parameters": { "city": "string" }
}
```

::::: callout label="A folyamat"
A modell a promptod és a rendelkezésre álló tool-definíciók alapján kiszámolja (ugyanazzal a token-valószínűségi mechanizmussal, amit az <em>Egy modell anatómiája</em> tutorial 4. részében láttál), melyik eszköz **neve és paraméterei** illenek legjobban a feladathoz — majd ezt kéri a futtató rendszertől. **Ő maga sosem futtatja** az eszközt; csak a kérést fogalmazza meg, a tényleges végrehajtás a köré épített rendszer (a "runtime") dolga.
:::::

::::: callout warning label="Miért fontos a jó eszköz-leírás"
Mivel a modell **kizárólag** a leírás alapján dönt, egy homályos vagy félrevezető `description` mező közvetlenül **rossz eszközválasztáshoz** vezethet — ez ugyanaz az elv, amit a <em>Prompt Engineering</em> tutorialban a pontos instrukció-írásnál is látsz, csak itt a "prompt" egy eszköz leírása.
:::::

::::: callout label="Egy mondatban"
Az eszközválasztás nem varázslat — a modell egy **strukturált leírás-listát** kap, és ugyanazzal a mechanizmussal választ belőle, amivel egy mondat következő szavát is kiválasztja.
:::::
::::::

:::::: section id=agent-architecture-3 num="03" heading="3. rész — A \"mikor van vége\" probléma" nav="A mikor van vége probléma" group="Korlátok"

<p class="topic-tagline">Cél: érts meg egy gyakorlati, gyakran alábecsült korlátot, ami minden agent-rendszert érint.</p>

### A modellnek nincs beépített "kész" fogalma

::::: callout danger label="A probléma lényege"
Egy LLM-nek **nincs belső, megbízható érzéke** arra, mikor "van kész" egy feladat — szubjektíven dönt úgy, hogy befejezte, ami **korai kilépéshez** vezethet (a feladat még nem teljes, de a modell úgy gondolja, igen), vagy — védőháló nélkül — a rendelkezésre álló token-/idő-keret **teljes kimerítéséig** futhat, ha semmi nem állítja meg.
:::::

### A gyakorlati megoldás: explicit stop-feltételek

::::: callout label="Amit a gyakorlatban bevezetnek"
Ahelyett, hogy a modellre bíznák a "kész vagyok" döntést, a rendszertervezők **explicit, ellenőrizhető feltételeket** adnak meg — pl. "a tesztek zöldek", "nincs típushiba", "a kimenet megfelel egy adott sémának". Egy **"stop hook"** elfoghatja a kilépési kísérletet, leellenőrzi, tényleg teljesült-e a feltétel, és ha nem, **visszaküldi** a modellnek a feladatot folytatásra.
:::::

::::: callout warning label="A védőháló másik oldala: circuit breaker"
Fordítva is kell védekezni: **retry-korlátokat** és **token-/idő-költségvetést** kell beépíteni, különben egy hurokba ragadt agent — ami sosem "érzi" magát késznek — a végtelenségig, illetve a rendelkezésre álló keret teljes kimerüléséig futhat.
:::::

::::: callout label="Egy mondatban"
"Hagyd, hogy az agent eldöntse, mikor van kész" egy megbízhatatlan stratégia — a jól megtervezett agent-rendszerek mindig **explicit, kívülről ellenőrzött** feltételekkel zárják le a hurkot, nem a modell szubjektív érzésére hagyatkozva.
:::::
::::::

:::::: section id=agent-architecture-4 num="04" heading="4. rész — Három eszköz-kategória: miért érdemes elkülöníteni" nav="Három eszköz-kategória" group="Referencia"

<p class="topic-tagline">Cél: adj egy gyakorlati, tervezéskor hasznos kategorizálást.</p>

::::: stack-grid
:::: card label="1 · Data tools (adat-eszközök)"
Kontextust **hoznak be** — adatbázis-lekérdezés, vektor-keresés (lásd a <em>Vektor adatbázisok</em> tutorialt), dokumentum-visszakeresés. Ezek **olvasnak**, nem módosítanak semmit.
::::
:::: card label="2 · Action tools (akció-eszközök)"
**Mellékhatással** járó műveletek — rekord írása, külső API hívása, kód futtatása (lásd az <em>Agentic kódolás</em> tutorialt). Ezeknél a hiba ára jellemzően magasabb.
::::
:::: card label="3 · Orchestration tools (orkesztráló eszközök)"
**Más agenteket** hívnak segéd-modulként — ez teszi lehetővé a több-ügynökös rendszereket (lásd az <em>Agentic kódolás</em> tutorial 5. részét a konkrét mintákért).
::::
:::::

::::: callout label="Miért éri meg ez a kategorizálás"
A tervezéskor **egyértelmű besorolás** csökkenti a futásidejű bizonytalanságot: egy data tool hívása előtt nem kell megerősítést kérni, egy action tool hívása előtt viszont — kritikus rendszereknél — érdemes lehet. Ez ugyanaz az elv, amit a <em>Biztonság &amp; OWASP</em> tutorial az agentic rendszerek védelménél is hangsúlyoz.
:::::

::::: callout label="Egy mondatban"
Nem minden eszköz egyforma kockázatú — a data/action/orchestration felosztás gyors, gyakorlati támpontot ad arra, hol érdemes extra óvatosságot (megerősítést, korlátozást) beépíteni a hurokba.
:::::
::::::

:::::: section id=agent-architecture-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A cikk végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0. rész"
A chatbot és az agent közti különbség: egyetlen válasz vs. iteratív, eszközhasználó hurok
::::
:::: card label="1–2. rész"
A ReAct hurok négy lépése (gondolkodj → cselekedj → figyeld meg → ismételj) · hogyan dönt a modell, melyik eszközt hívja (tool-definíció alapú választás)
::::
:::: card label="3. rész"
A "mikor van vége" probléma — a modellnek nincs beépített "kész" érzéke, ezért explicit stop-feltételek és circuit breaker-ek kellenek
::::
:::: card label="4. rész"
Három eszköz-kategória (data, action, orchestration) mint gyakorlati tervezési szempont a kockázat-kezeléshez
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>Reasoning</em> (a gondolkodó tokenek, amikre a ReAct épül), az <em>MCP</em> (hogyan fér hozzá egy agent szabványosítottan az eszközökhöz), az <em>Agentic kódolás</em> (a hurok konkrét, kódolási alkalmazása és a multi-agent orkesztrálás) és a <em>Biztonság &amp; OWASP</em> (az agentic rendszerek kockázatai) tutorialok.</p>
::::::
