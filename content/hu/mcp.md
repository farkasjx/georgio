---
page: mcp
title: MCP — Model Context Protocol
sidebar_groups:
  - Elmélet
  - Működés
  - Gyakorlat
  - Nagy példa
  - Éles használat
  - Referencia
hero:
  eyebrow: "MCP · Fejlesztői Tanulási Terv"
  title: "MCP — <em>Model Context Protocol</em>"
  lead: "Hogyan kap egy LLM biztonságos, szabványos hozzáférést külső eszközökhöz, adatokhoz és rendszerekhez — anélkül, hogy minden kombinációhoz egyedi integrációt írnál. Architektúra, kódrészletek, Teams/Slack összekötés, és egy teljes Jira multi-agent workflow. Épít a <em>hallucináció</em> (context poisoning), a <em>KV-cache</em> és a <em>model routing</em> tutorialokra."
  stats:
    - { val: "12", lbl: "Szakasz" }
    - { val: "3", lbl: "Feladat" }
    - { val: "2", lbl: "Ábra" }
    - { val: "n×m→n+m", lbl: "Amit megold" }
footer:
  left: "AI Hub · MCP"
  right: "MCP · Összeállítva 2026 júliusában"
---

:::::: raw
<div class="toc-grid" style="margin-top:24px">
  <a class="toc-card" href="#mcp-0"><div class="tc-num">0. rész</div><div class="tc-name">Mi az MCP és miért?</div><div class="tc-desc">Az n×m integrációs probléma.</div></a>
  <a class="toc-card" href="#mcp-1"><div class="tc-num">1. rész</div><div class="tc-name">Architektúra</div><div class="tc-desc">Host, client, server, JSON-RPC.</div></a>
  <a class="toc-card" href="#mcp-2"><div class="tc-num">2. rész</div><div class="tc-name">Három primitíva</div><div class="tc-desc">Tools, resources, prompts, sampling.</div></a>
  <a class="toc-card" href="#mcp-3"><div class="tc-num">3. rész</div><div class="tc-name">Hogyan működik</div><div class="tc-desc">Handshake, capability negotiation.</div></a>
  <a class="toc-card" href="#mcp-4"><div class="tc-num">Feladat 1</div><div class="tc-name">Saját szerver</div><div class="tc-desc">Minimális MCP szerver Pythonban.</div></a>
  <a class="toc-card" href="#mcp-5"><div class="tc-num">4. rész</div><div class="tc-name">Teams / Slack</div><div class="tc-desc">Valós összekötés kóddal.</div></a>
  <a class="toc-card" href="#mcp-6"><div class="tc-num">5. rész</div><div class="tc-name">MCP vs. alternatívák</div><div class="tc-desc">Function calling, REST wrapper.</div></a>
  <a class="toc-card" href="#mcp-7"><div class="tc-num">6. rész</div><div class="tc-name">A token-adó</div><div class="tc-desc">A kontextus-költség, amit senki nem lát.</div></a>
  <a class="toc-card" href="#mcp-8"><div class="tc-num">7. rész</div><div class="tc-name">Nagy példa: Jira</div><div class="tc-desc">Multi-agent workflow, task → review.</div></a>
  <a class="toc-card" href="#mcp-9"><div class="tc-num">8. rész</div><div class="tc-name">Biztonság</div><div class="tc-desc">Context poisoning, OAuth 2.1.</div></a>
  <a class="toc-card" href="#mcp-10"><div class="tc-num">9. rész</div><div class="tc-name">MCP vs. A2A</div><div class="tc-desc">Eszköz-protokoll vs. agent-protokoll.</div></a>
  <a class="toc-card" href="#mcp-11"><div class="tc-num">10. rész</div><div class="tc-name">Mikor/hol?</div><div class="tc-desc">Döntési keret.</div></a>
</div>
::::::

:::::: section id=mcp-0 num="00" heading="0. rész — Mi az MCP, és miért létezik?" nav="Mi az MCP?" group="Elmélet"

<p class="topic-tagline">Cél: értsd meg, milyen konkrét problémát old meg — nem egy divatszó, hanem egy integrációs probléma megoldása.</p>

### Az n×m probléma

Ha minden AI-alkalmazást (Claude, ChatGPT, egy saját agent) minden külső eszközzel (Jira, Slack, GitHub, egy adatbázis) **egyedi, pontban-pontra integrációval** akarsz összekötni, a kombinációk száma **n×m**-ként robban: minden új eszköz minden AI-alkalmazáshoz külön kódot igényel. Ez pontosan az a probléma, amit a webes világban a REST API-k oldottak meg az egyedi protokollok helyett — az MCP ugyanezt teszi az AI-eszközök világában.

### Az MCP megoldása: n+m

A **Model Context Protocol** (Anthropic, 2024 november, azóta nyílt szabvány, 2025 decemberétől a Linux Foundation Agentic AI Foundation gondozásában) egy **közös protokollt** definiál: ha egy eszközhöz **egyszer** megírsz egy MCP-szervert, **bármelyik** MCP-kompatibilis AI-alkalmazás tudja használni — nincs szükség egyedi integrációra. Ez az n×m kombinációt **n+m**-re redukálja: n alkalmazás + m eszköz, nem n×m integráció.

::::: callout label="A leggyakoribb analógia"
Az MCP-t sokan a **USB-C-hez** hasonlítják: egy szabványos csatlakozó, ami nem érdekli, milyen gyártótól származik a kábel egyik vagy másik vége — amíg mindkettő betartja a szabványt, összekapcsolódnak. 2025-2026-ra az MCP-t az Anthropic mellett az OpenAI, a Google DeepMind és a Microsoft is hónapokon belül adaptálta.
:::::

### Mit jelent ez neked konkrétan?

Ha van egy Jira-, Slack- vagy GitHub-MCP-szervered (gyakran **készen** elérhető, nem kell megírnod), a Claude, a Cursor, vagy egy saját agent **azonnal** tud vele dolgozni — nem kell egyedi API-wrappert írnod minden egyes kombinációhoz. Ez a tutorial ezt a mechanizmust, és a köré épülő gyakorlati mintákat mutatja be.
::::::

:::::: section id=mcp-1 num="01" heading="1. rész — Architektúra: host, client, server" nav="Architektúra" group="Elmélet"

<p class="topic-tagline">Cél: ismerd a három szerepkört, és hogy mi kommunikál mivel.</p>

### A három-szerepű minta

::::: stack-grid
:::: card label="Host"
Az az **AI-alkalmazás**, amivel a felhasználó interakcióba lép — pl. Claude Desktop, Claude Code, egy IDE beépített AI-ja. A host a "beszélgetés-vezérlő": ő birtokolja a felhasználói hozzájárulást, a credential-scope-ot és a tool-allowlistet.
::::
:::: card label="Client"
A host **egy MCP-kliens-session-t indít minden egyes szerverhez** — ha 3 szerverhez csatlakozol, 3 külön, izolált kliens fut. Minden kliens egy dedikált, **stateful** JSON-RPC csatornát tart fenn a saját szerverével.
::::
:::: card label="Server"
Egy **könnyű, fókuszált folyamat**, ami szabványosított primitívákon (tools, resources, prompts) keresztül specifikus kontextust és képességeket biztosít. Futhat **lokálisan** (pl. egy fájlrendszer-szerver a saját gépeden) vagy **távolról** (egy hosztolt szolgáltatás HTTPS-en).
::::
:::::

![MCP architektúra: a host több klienst indít, mindegyik külön szerverhez kapcsolódik](__IMG__/mcp-01-architecture.jpg)

### A kommunikáció: JSON-RPC 2.0, két transporttal

Minden üzenet **JSON-RPC 2.0** formátumban utazik — kérés/válasz párok vagy egyirányú értesítések (notifications). Két transport-mód létezik:

| Transport | Mikor | Jelleg |
|---|---|---|
| **stdio** | Lokálisan futó szerver (ugyanazon a gépen) | Szabványos be/kimenet, egyszerű, alacsony overhead |
| **Streamable HTTP** | Távoli, hosztolt szerver | HTTP-alapú, támogatja az OAuth 2.1-et, skálázható |

::::: callout label="Fontos: izoláció és perzisztens kontextus"
Az architektúra két dolgot biztosít egyszerre: **biztonságos izolációt** (minden szerver-kapcsolat külön, egymástól elzárt session) és **perzisztens kontextust** (a session a kapcsolat teljes idejére fennmarad, nem kell minden hívásnál újra-authentikálni vagy újra-deklarálni, mit tud a szerver).
:::::
::::::

:::::: section id=mcp-2 num="02" heading="2. rész — A három primitíva: mit ad az MCP a modellnek" nav="Három primitíva" group="Elmélet"

<p class="topic-tagline">Cél: értsd pontosan, milyen három "csatornán" kaphat a modell külső képességet és tudást.</p>

### Tools, resources, prompts

::::: stack-grid
:::: card label="Tools — amit a modell HÍVHAT"
Függvények, amiket a modell **maga dönt el**, mikor és hogyan hívjon (model-controlled): adatbázis-lekérdezés, e-mail küldés, GitHub issue létrehozása, időjárás API. Ez felel meg a "function calling" fogalmának, csak szabványosított leírással.
::::
:::: card label="Resources — amit a modell OLVASHAT"
Adat, amit a modell kontextusként felhasználhat: fájltartalom, adatbázis-rekordok, API-válaszok. URI-val azonosítottak, és jellemzően **application-controlled** — a host vagy a felhasználó dönti el, mikor kerüljenek a kontextusba, nem maga a modell.
::::
:::: card label="Prompts — újrafelhasználható sablonok"
A szerver fejlesztője által definiált, **strukturált interakció-minták** — pl. egy többlépéses kódreview-workflow sablonja, vagy egy adott adatforráshoz illő lekérdezés-sablon. Ezek **user-controlled**: a felhasználó választja ki őket egy menüből, nem a modell dönt automatikusan.
::::
:::::

### A negyedik, kevésbé ismert primitíva: sampling

Van egy negyedik, fordított irányú mechanizmus is: a **sampling** — amikor a **szerver kér** a hosttól egy LLM-kiegészítést (`sampling/createMessage`). Ez teszi lehetővé a **rekurzív agent-workflow-kat**: egy szerver saját belső logikájában "visszafordulhat" a modellhez egy köztes döntésért, mielőtt folytatná a műveletet. A **7. részben** bemutatott Jira-példánál ez releváns lehet, ha a szerver maga is döntést igényelne a folyamat közben.

::::: callout warning label="A megkülönböztetés miért számít gyakorlatilag"
Ha egy adatot a modell **automatikusan, saját döntése alapján** kérjen le → **tool**. Ha egy adatot **te (vagy a host) akarsz** a kontextusba tenni, függetlenül attól, hogy a modell "kéri-e" → **resource**. Ha egy **workflow-mintát** akarsz a felhasználó számára elérhetővé tenni → **prompt**. A rossz primitíva-választás (pl. minden adatot tool-ként modellezni) feleslegesen sok döntést bíz a modellre, ahol egyszerűbb és megbízhatóbb lenne az alkalmazás-szintű vezérlés.
:::::
::::::

:::::: section id=mcp-3 num="03" heading="3. rész — Hogyan működik: handshake és session" nav="Handshake & session" group="Működés"

<p class="topic-tagline">Cél: értsd a kapcsolat felépülésének lépéseit — ez nem "csak egy API-hívás".</p>

### A kapcsolódás lépései

1. **Kapcsolat felépítése** — a kliens csatlakozik a szerverhez (stdio-t indít, vagy HTTP-kapcsolatot nyit).
2. **Capability negotiation** — a kliens és a szerver **egyeztetik, mit támogatnak** (pl. támogatja-e a szerver a "resources" primitívát, támogatja-e a kliens a sampling-et). Ez egy explicit handshake-lépés, nem feltételezés.
3. **Discovery** — a szerver **deklarálja**, milyen tool-okat, resource-okat és promptokat kínál (ez adja a modellnek megmutatott "tool-leírásokat").
4. **Session fenntartása** — a kapcsolat **állapottal rendelkező (stateful)** marad a session teljes idejére; nem kell minden hívásnál újra-authentikálni.
5. **Notifications** — ha a szerver elérhető képességei **menet közben változnak** (pl. új tool jelenik meg), erről valós idejű értesítést küldhet a kliensnek — ez teszi lehetővé a dinamikus, futásidejű frissítést.

::::: callout label="Ez miért más, mint egy sima REST-hívás?"
Egy REST API-hívás **stateless** és **egyszeri**: minden hívás önmagában áll, a szerver nem "tudja", ki és mit kérdezett korábban. Az MCP **session-alapú**: a kapcsolat felépül, a képességek egyeztetésre kerülnek, és utána **több hívás** történhet ugyanabban a kontextusban — ez ad teret a stateful, több lépéses agent-workflow-knak, amiket a **7. részben** látsz majd.
:::::
::::::

:::::: section id=mcp-4 heading="Feladat 1 — Építs egy minimális MCP szervert" nav="Feladat 1" group="Gyakorlat"

<p class="topic-tagline">Cél: lásd élesben, milyen kevés kód kell egy működő MCP-szerverhez.</p>

### Python — FastMCP

```bash
pip install fastmcp
```

```python
from fastmcp import FastMCP

mcp = FastMCP("nevogate-demo")

# --- 1. Tool: amit a modell hívhat ---
@mcp.tool()
def get_transaction_status(transaction_id: str) -> dict:
    """Lekérdezi egy SimplePay tranzakció aktuális státuszát."""
    # a valóságban itt hívnád a tényleges API-t
    return {"transaction_id": transaction_id, "status": "PENDING"}

# --- 2. Resource: amit a modell olvashat ---
@mcp.resource("config://payment-limits")
def payment_limits() -> str:
    """A jelenlegi fizetési limitek konfigurációja."""
    return "napi limit: 500000 HUF, tranzakciónkénti limit: 200000 HUF"

# --- 3. Prompt: újrafelhasználható sablon ---
@mcp.prompt()
def review_failed_transaction(transaction_id: str) -> str:
    return (
        f"Vizsgáld meg a {transaction_id} tranzakciót: kérdezd le a státuszát, "
        "és ha PENDING-nél tovább ragadt 10 percnél, javasolj cancel-lépést."
    )

if __name__ == "__main__":
    mcp.run()  # alapból stdio transport
```

### Kliens-oldali csatlakozás (ellenőrzésre)

```python
import asyncio
from fastmcp import Client

async def main():
    async with Client("nevogate-demo") as client:
        tools = await client.list_tools()
        print("Elérhető tool-ok:", [t.name for t in tools])

        result = await client.call_tool(
            "get_transaction_status", {"transaction_id": "TX-2026-001"}
        )
        print("Eredmény:", result)

asyncio.run(main())
```

::::: callout label="Gyakorlat"
Futtasd le a szervert, majd a kliens-scriptet — figyeld meg, hogy a `list_tools()` hívás **automatikusan visszaadja** a `get_transaction_status` leírását, paramétereit, mindent, amit a `@mcp.tool()` dekorátorból és a docstring-ből a keretrendszer kiolvasott. Ez a **discovery**, amit a 3. rész említett — nem kellett külön leírnod semmit egy másik formátumban.
:::::
::::::

:::::: section id=mcp-5 num="04" heading="4. rész — Teams / Slack összekötés" nav="Teams/Slack integráció" group="Gyakorlat"

<p class="topic-tagline">Cél: kapcsolj egy valós, gyakorlatban használt csapateszközt egy MCP-szerveren keresztül.</p>

### Slack MCP szerver — csatlakozás és üzenetküldés

A legtöbb népszerű eszközhöz (Slack, Teams, Jira, GitHub) **már létező, kész MCP-szerver** érhető el — ritkán kell nulláról írnod. Egy tipikus Slack-integráció:

```python
from fastmcp import Client

async def post_deploy_notification(channel: str, message: str):
    async with Client("slack-mcp-server") as client:
        await client.call_tool(
            "slack_post_message",
            {"channel": channel, "text": message},
        )

# használat: egy CI/CD pipeline végén
await post_deploy_notification(
    "#nevogate-deploys",
    "✅ A SimplePay integráció v2.3 sikeresen élesítve."
)
```

### Node — Teams-szerű webhook-alapú szerver csatlakoztatása

```javascript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-teams"],
});
const client = new Client({ name: "nevogate-agent", version: "1.0.0" });
await client.connect(transport);

const tools = await client.listTools();
console.log("Elérhető Teams tool-ok:", tools.tools.map(t => t.name));

await client.callTool({
  name: "teams_send_message",
  arguments: {
    channel: "QA csapat",
    message: "A napi teszt-jelentés kész, review szükséges.",
  },
});
```

::::: callout warning label="OAuth és jogosultságok"
A legtöbb éles Slack/Teams/Jira MCP-szerver **OAuth 2.1-alapú** hitelesítést használ — az első kapcsolódáskor egy böngésző-alapú engedélyezési képernyőt kapsz, és utána az **agent a te saját jogosultságaid alatt** dolgozik, nem egy külön, korlátlan service-accounttal. Ez fontos biztonsági tervezési döntés (bővebben a **8. részben**).
:::::
::::::

:::::: section id=mcp-6 num="05" heading="5. rész — MCP vs. sima function calling vs. REST wrapper" nav="MCP vs. function calling" group="Éles használat"

<p class="topic-tagline">Cél: tudd eldönteni, mikor éri meg az MCP-t bevezetni, és mikor felesleges overhead.</p>

### A három megközelítés

| Szempont | Sima function calling | Egyedi REST wrapper | MCP |
|---|---|---|---|
| **Újrafelhasználhatóság** | Csak az adott appban | Csak az adott appban | Bármely MCP-kompatibilis klienssel |
| **Fejlesztési idő** | Gyors, egyszeri appra | Közepes | Egyszeri, de a protokoll tanulási görbéje van |
| **Discovery** | Kézzel karbantartott leírás | Nincs szabványos discovery | Automatikus (a szerver deklarálja) |
| **Session/állapot** | Nincs beépítve | Nincs beépítve | Beépített, stateful |
| **Overhead** | Minimális | Alacsony | A JSON-RPC réteg és a tool-leírások tokenköltsége (6. rész) |
| **Mikor éri meg** | Egyetlen app, egyetlen eszköz, gyors prototípus | Emberi klienseknek is kell az API | Több AI-kliens, több eszköz, hosszú távú újrafelhasználás |

::::: callout label="Ökölszabály"
Ha **egyetlen** alkalmazásban, **egyetlen** eszközhöz kell integráció, és nem valószínű, hogy más AI-kliens is használná — a sima function calling gyorsabb és egyszerűbb. Az MCP akkor éri meg, ha **több** kliens (Claude Desktop, Claude Code, egy saját agent) fogja ugyanazt az eszközt használni, vagy ha **eleve létező** MCP-szerver van az adott eszközhöz (Jira, Slack, GitHub) — ilyenkor gyakorlatilag ingyen kapod a integrációt.
:::::
::::::

:::::: section id=mcp-7 num="06" heading="6. rész — A token-adó: amit senki nem lát a számlán" nav="A token-adó" group="Éles használat"

<p class="topic-tagline">Cél: ismerd a rejtett kontextus-költséget, ami minden bekötött MCP-szerverrel jár — még ha nem is hívod a toolt.</p>

### A meglepő szám

Amikor kutatók megmérték a **hivatalos GitHub MCP-szerver** tool-definícióit, azok összesen **~42 000 tokent** tettek ki — ez egy **200 000 tokenes kontextusablak ~21%-a**, még **mielőtt** az első promptod elindulna. Egy hasonló méretű Jira-szerver (pl. 72 tool-lal) ugyanilyen nagyságrendű terhet ad.

::::: callout danger label="Ez direkt kapcsolódik a KV-cache és a cost-routing tutorialhoz"
Minden bekötött MCP-szerver a **tool-leírásait** (name, paraméterek, dokumentáció) **minden egyes hívásnál** újra a kontextusba teszi — ez pontosan az a token-mennyiség, amit a **KV-cache tutorial** prefill-fázisként ír le, és amit a **cost-routing tutorial** prompt-caching résznél érdemes cache-elni. Ha egyszerre 5-6 szervert kötsz be (Jira + Slack + GitHub + 3 más), a sémák **összeadódnak**, és a kontextus-büdzséd nagy részét már az eszköz-leírások eszik meg, mielőtt bármi tényleges munka elkezdődne.
:::::

### A gyakorlati megoldás: kevesebb, karcsúbb szerver

A legtöbb csapat **csak néhány tool-t hív** ténylegesen egy adott feladatnál — a többi tool-leírás puszta overhead. Ahelyett hogy minden elérhető szervert egyszerre bekötnél:

::::: stack-grid
:::: card label="Szűrd a tool-listát"
Sok kliens (pl. a korábban látott `allowed_tools` paraméter) lehetővé teszi, hogy csak a ténylegesen szükséges tool-okat töltsd be egy adott agent-session-höz — ne az egész szerver teljes tool-katalógusát.
::::
:::: card label="Gondold büdzséként"
Minden tool-leírásra elköltött token egy olyan token, amit az agent **nem tud** a tényleges jegy elolvasására vagy a hibajavításra fordítani. Kezeld úgy, mint bármely más kontextus-költséget — priorizálj.
::::
:::: card label="Pruningold rendszeresen"
Ha egy szervert bekötöttél, de a tool-jainak nagy részét sosem hívod, távolítsd el vagy korlátozd — a "meg-nem-hívott" tool-leírás ugyanúgy fizet, mint a hívott.
::::
:::::
::::::

:::::: section id=mcp-8 num="07" heading="7. rész — Nagy példa: Jira multi-agent workflow" nav="Jira workflow példa" group="Nagy példa"

<p class="topic-tagline">Cél: kösd össze mindazt, amit eddig tanultál, egy teljes, gyakorlati folyamatban.</p>

### A cél

Egy folyamat, ahol: a Jira-taskok **automatikusan lejönnek** egy MCP-szerveren keresztül, egy **planner agent szétosztja** őket, egy **coder agent megírja** a kódot és pusholja, egy **reviewer agent** átnézi, és a Jira-ticket státusza **automatikusan frissül**.

![Jira → multi-agent workflow MCP-n keresztül](__IMG__/mcp-02-jira-workflow.jpg)

### Architektúra-döntés: egy agent vagy több?

Mielőtt kódolnál, ezt a döntést kell meghoznod:

::::: stack-grid
:::: card label="Egyetlen agent, szekvenciális tool-hívások"
Egy modell, egy system prompt, ami **egymás után** hívja a Jira-, git- és review-tool-okat egy hosszabb "gondolkodási" folyamaton belül. **Egyszerűbb**, kevesebb mozgó alkatrész, de egyetlen kontextusban minden szerepkör "keveredik".
::::
:::: card label="Valódi multi-agent, külön szerepkörrel"
Külön agent a tervezésre, kódolásra, review-ra — mindegyiknek **saját, szűkített** system promptja és tool-hozzáférése (a 6. rész elve szerint: a coder agentnek nem kell látnia a Slack-tool-okat). **Tisztább felelősség-elhatárolás**, jobb auditálhatóság, de több orchestrációs kód.
::::
:::::

A gyakorlatban a **második** megközelítés skálázódik jobban, és illeszkedik a **6. rész** token-büdzsé elvéhez: minden agent csak azokat a tool-leírásokat tölti be, amikre ténylegesen szüksége van.

### Vázlatos implementáció

```python
from fastmcp import Client
import anthropic

llm = anthropic.Anthropic()

async def planner_agent(jira_client):
    # 1. Taskok lehívása Jira MCP-n keresztül
    tasks = await jira_client.call_tool("jira_search", {
        "jql": "project = NEVOGATE AND status = 'To Do'"
    })
    # 2. A modell szétosztja a taskokat prioritás és komplexitás szerint
    resp = llm.messages.create(
        model="claude-sonnet-5", max_tokens=800,
        system="Oszd szét a Jira taskokat: melyik mehet közvetlenül kódolásra, "
               "melyik igényel előbb tisztázást.",
        messages=[{"role": "user", "content": str(tasks)}],
    )
    return resp.content[0].text  # strukturált terv

async def coder_agent(task_description, git_client):
    resp = llm.messages.create(
        model="claude-sonnet-5", max_tokens=2000,
        system="Írj kódot a megadott Jira task alapján. "
               "A végén add meg a commit üzenetet is.",
        messages=[{"role": "user", "content": task_description}],
    )
    code_and_commit = resp.content[0].text
    # push a git MCP szerveren keresztül
    await git_client.call_tool("git_commit_and_push", {
        "message": "auto: task implementálva",
        "diff": code_and_commit,
    })
    return code_and_commit

async def reviewer_agent(diff, jira_client, ticket_id):
    resp = llm.messages.create(
        model="claude-sonnet-5", max_tokens=600,
        system="Nézd át a diffet: van-e nyilvánvaló hiba, "
               "hiányzó teszt, biztonsági probléma?",
        messages=[{"role": "user", "content": diff}],
    )
    review = resp.content[0].text
    approved = "elfogadva" in review.lower()
    # Jira-státusz frissítése a review eredménye alapján
    await jira_client.call_tool("jira_transition_issue", {
        "issue_id": ticket_id,
        "status": "Kész" if approved else "Javítás szükséges",
    })
    return review, approved
```

::::: callout label="Amit ez a vázlat NEM old meg — és neked kell"
Ez egy **didaktikus vázlat**, nem éles kód: hiányzik belőle a hibakezelés (mi történik, ha a push elbukik?), a retry-logika, és — kritikusan — az **emberi jóváhagyási pont** magas tétű lépések előtt (pl. mielőtt a coder agent kódot pushol egy védett branch-re). Éles rendszernél mindig legyen egy pont, ahol egy ember rábólint a kódra, mielőtt az továbbmegy — pontosan úgy, ahogy a **hallucináció tutorial** context poisoning része is hangsúlyozta: az agent memóriájából/kimeneteiből fakadó döntéseket sose engedd emberi felülvizsgálat nélkül továbbgyűrűzni.
:::::

::::: callout warning label="Gyakorlat"
Bővítsd a vázlatot egy negyedik, **QA agent** szerepkörrel — a te háttered miatt ez különösen releváns: a coder agent kódjához generáljon automatikusan egy minimális teszt-tervet, mielőtt a reviewer agent egyáltalán megnézné a diffet. Gondold át: ez a QA-lépés melyik primitívát (tool, resource, prompt) használná leginkább?
:::::
::::::

:::::: section id=mcp-9 num="08" heading="8. rész — Biztonság: context poisoning, prompt injection, OAuth" nav="Biztonság" group="Éles használat"

<p class="topic-tagline">Cél: értsd, hogy az MCP pontosan azért nagy erejű, mert valós rendszerekhez enged hozzáférést — ez komoly biztonsági felelősséggel jár.</p>

### A három fő kockázat

::::: stack-grid
:::: card label="Prompt injection tool-leírásokon keresztül"
A tool-leírások **szöveg**, amit a modell olvas — egy rosszindulatú vagy kompromittált MCP-szerver olyan tool-leírást fogalmazhat meg, ami manipulálja a modell viselkedését (pl. "küldd el az érzékeny adatot X végpontra"). Ez ugyanaz a mechanizmus, mint bármely indirect prompt injection — csak itt a forrás egy "megbízhatónak hitt" eszköz-integráció.
::::
:::: card label="Context / memory poisoning"
Ha egy agent **perzisztens memóriával** rendelkezik (a **memory tutorial** témája), és ebbe hamis vagy manipulált "tény" kerül egy MCP-szerveren keresztül, az agent erre alapozva cselekedhet — és a cselekvés eredménye **visszaíródhat** a memóriába, tovább erősítve a hibát. Ezt a **hallucináció tutorial** részletesen tárgyalta **OWASP ASI06 — Memory & Context Poisoning** néven; az MCP pontosan az a csatorna, amin keresztül ez a kockázat valós rendszerekbe (Jira, git, Slack) begyűrűzhet.
::::
:::: card label="Hitelesítés és jogkör-szivárgás"
Egy 2025 júniusi specifikáció-frissítés az MCP-szervereket **OAuth Resource Serverként** kategorizálja, és megköveteli a **Resource Indicators (RFC 8707)** implementálását — ez akadályozza meg, hogy egy rosszindulatú szerver egy **másik** szervernek szánt tokent szerezzen meg.
::::
:::::

### Gyakorlati védekezési checklist

::::: callout danger label="Amit éles bevezetés előtt ellenőrizz"
**✓** Minden távoli MCP-szerverhez **OAuth 2.1 + PKCE** hitelesítés · **✓** Az agent **a felhasználó saját jogosultsága alatt** dolgozzon, ne egy korlátlan service-accounttal · **✓** Ismeretlen/nem auditált MCP-szerverek tool-leírásait **sose** fogadd el vakon — kezeld úgy, mint bármely nem megbízható inputot · **✓** Magas tétű műveletek (push védett branch-re, pénzügyi tranzakció, adattörlés) előtt **mindig** emberi jóváhagyási pont · **✓** Az agent memóriáját/kontextusát rendszeresen auditáld — a **6. rész** tool-pruning elve biztonsági szempontból is jó gyakorlat: kevesebb, jobban ismert szerver kisebb támadási felület.
:::::

::::: callout warning label="A biztonsági érettség egyenetlen"
2026 elején végzett kutatások szerint sok éles MCP-szerver **még mindig hiányos alap-hitelesítéssel** fut. Az OAuth 2.1-előírás segít, de az ökoszisztémán belüli adaptáció **egyenetlen** — ne feltételezd, hogy egy MCP-szerver csak azért biztonságos, mert "hivatalosan" elérhető egy regisztry-ben. Ellenőrizd magad.
:::::
::::::

:::::: section id=mcp-10 num="09" heading="9. rész — MCP vs. A2A: eszköz-protokoll vagy agent-protokoll?" nav="MCP vs. A2A" group="Referencia"

<p class="topic-tagline">Cél: egy gyakori elhatárolás, hogy ne keverd össze a két kiegészítő szabványt.</p>

### A rövid elhatárolás

::::: stack-grid
:::: card label="MCP — agent ↔ eszköz"
Azt szabványosítja, hogyan férjen hozzá egy AI-modell **külső eszközökhöz és adatokhoz** (Jira, Slack, adatbázis, fájlrendszer). Ez a tutorial témája.
::::
:::: card label="A2A — agent ↔ agent"
Az **Agent-to-Agent protokoll** azt szabványosítja, hogyan kommunikáljon és koordináljon **egymással** több, önálló agent — pl. a **7. rész** Jira-példájában a planner, a coder és a reviewer agent közti koordinációt (ha azokat külön, elosztott rendszerekként implementálnád, nem egyetlen scriptben).
::::
:::::

### Az ökoszisztéma: regisztry és felfedezhetőség

Az MCP-hez tartozik egy **nyilvános regisztry**, ahol közösségi és hivatalos szerverek listázva és felfedezhetők — hasonlóan ahhoz, ahogy a Claude-alkalmazásokban (Chrome, Cowork) elérhető connector-directory működik: kereshetsz, és ha van megfelelő szerver, egy kattintással csatlakozol, ahelyett hogy magad írnál integrációt.

::::: callout label="A 2026 H2-es irány"
A specifikáció aktívan fejlődik: stateless szerver-működés, automatikus felfedezés "MCP Server Card"-okon keresztül, és az A2A-val való mélyebb koordináció mind érésben vannak — az MCP az egyszerű eszköz-kapcsolatokból a **multi-agent orchestráció alap-infrastruktúrája** felé mozdul.
:::::
::::::

:::::: section id=mcp-11 num="10" heading="10. rész — Mikor és hol érdemes használni: döntési keret" nav="Döntési keret" group="Referencia"

<p class="topic-tagline">Cél: egy gyakorlatias összegzés, mielőtt nekiállsz építeni.</p>

### Gyors döntési fa

::::: stack-grid
:::: card label="Van már MCP-szerver az eszközödhöz?"
(Jira, Slack, GitHub, stb.) → Használd azt, ne írj sajátot. Nézd meg a regisztryben (9. rész) először.
::::
:::: card label="Egyedi belső rendszered van?"
Adatbázis, saját API, belső dashboard → érdemes lehet egy vékony MCP-szervert írni köré (Feladat 1 mintája), ha **több** AI-kliens fogja használni.
::::
:::: card label="Egyetlen, gyors prototípus?"
→ Sima function calling gyorsabb — ne vezess be MCP-overheadet, ha nincs rá valódi újrafelhasználási igény (5. rész).
::::
:::: card label="Multi-agent, magas tétű workflow?"
→ MCP + explicit emberi jóváhagyási pontok + szűkített, auditált tool-hozzáférés agentenként (7-8. rész).
::::
:::::

::::: callout warning label="Ne feledd a token-adót"
Minden bekötött szerver költséget jelent a kontextus-büdzsédben (6. rész), még mielőtt bármit hívnál. Kezdj **kevés, jól megválasztott** szerverrel, és csak akkor bővíts, ha a feladat ténylegesen igényli — pontosan úgy, ahogy a **cost-routing tutorial** is javasolta: kezdj egyszerűen, mérj, és csak a mérés indokolta komplexitást vezesd be.
:::::
::::::

:::::: section id=mcp-summary num=SUMMARY nav="Összefoglalás" sub=true group="Referencia"
## A tutorial végére <em>ezt tudod</em>

::::: stack-grid
:::: card label="0–2. rész"
Az n×m → n+m probléma · host/client/server architektúra · tools, resources, prompts, sampling
::::
:::: card label="3. rész + Feladat 1"
Handshake és session-életciklus · saját minimális MCP szerver Pythonban
::::
:::: card label="4–5. rész"
Slack/Teams összekötés kóddal · MCP vs. function calling vs. REST döntési tábla
::::
:::: card label="6. rész"
A token-adó: 42k token egy tool-katalógusért · tool-pruning mint gyakorlat
::::
:::: card label="7. rész"
Teljes Jira multi-agent workflow: planner → coder → reviewer → Jira-frissítés
::::
:::: card label="8–10. rész"
Context poisoning, OAuth 2.1 · MCP vs. A2A · döntési keret
::::
:::::

<p class="topic-tagline">Kapcsolódó: a <em>hallucináció</em> (context poisoning, OWASP ASI06), a <em>KV-cache</em> és a <em>model routing</em> (kontextus-költség és büdzsé) tutorialok — az MCP az a réteg, amin keresztül ezek a kockázatok és költségek valós rendszerekbe begyűrűznek.</p>
::::::
