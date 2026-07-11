---
page: tools
title: AI Eszközök
hero:
  eyebrow: "AI Eszközök & Keretrendszerek"
  title: "Legelterjedtebb <em>AI eszközök</em> 2026-ban"
  lead: "Open-source és freemium megoldások gyűjteménye — LLM frameworköktől visual builderekig, RAG eszközöktől agent SDK-kig."
  stats:
    - { val: "12", lbl: "Mainstream" }
    - { val: "13", lbl: "Emerging" }
    - { val: "6",  lbl: "Kategória" }
footer:
  left: "AI Hub · Eszközök"
  right: "Összeállítva 2026 júniusában · Tájékoztató jellegű, árak és ★ változhatnak"
sidebar:
  - label: "Kategóriák"
    links:
      - { href: "#tools-mainstream", text: "Mainstream eszközök", num: "01" }
      - { href: "#tools-emerging",   text: "Felkapott projektek",  num: "02" }
---

<!-- A nagy összehasonlító táblák sok inline HTML-t (badge, tool-name) tartalmaznak,
     ezért ::: raw blokkban maradnak, 1:1 az eredeti HTML-lel. A napi tartalom-
     szerkesztéshez a cellák szövegét itt írod át. -->

::: raw
      <!-- MAINSTREAM -->
      <section id="tools-mainstream">
        <div class="tools-section-title">⭐ Mainstream — széles körben ismert eszközök</div>
        <table>
          <thead>
            <tr>
              <th style="width:16%">Eszköz</th>
              <th style="width:10%">Árazás</th>
              <th style="width:12%">Kategória</th>
              <th style="width:30%">Mire jó?</th>
              <th>Mikor érdemes?</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><div class="tool-name">LangChain</div><div class="tool-gh">github.com/langchain-ai/langchain · ~134k ★</div></td>
              <td><span class="badge b-free">Ingyenes</span><br><small style="color:var(--text-dim)">LangSmith: fizető</small></td>
              <td>LLM Framework</td>
              <td>LLM-alkalmazások építése: chain-ek, promptok, memória, eszközök összekötése. 1000+ integráció.</td>
              <td>Egyéni LLM-app fejlesztésekor, ahol nagy ökoszisztémára és rugalmasságra van szükség.</td>
            </tr>
            <tr>
              <td><div class="tool-name">LangGraph</div><div class="tool-gh">github.com/langchain-ai/langgraph · ~32k ★</div></td>
              <td><span class="badge b-free">Ingyenes</span><br><small style="color:var(--text-dim)">Cloud: fizető</small></td>
              <td>Agent Framework</td>
              <td>Gráf-alapú, állapotgépes ágensek; elágazás, visszacsatolás, emberi jóváhagyás.</td>
              <td>Komplex, hosszan futó agent-munkafolyamatnál, ahol fontos a hibakezelés és branching.</td>
            </tr>
            <tr>
              <td><div class="tool-name">Langflow</div><div class="tool-gh">github.com/logspace-ai/langflow · ~40k ★</div></td>
              <td><span class="badge b-free">Ingyenes</span><br><small style="color:var(--text-dim)">Self-host / Cloud</small></td>
              <td>Visual / Low-code</td>
              <td>Drag-and-drop UI LangChain felett; vizuális prototipizálás, RAG-folyamatok tervezése.</td>
              <td>Ha vizuálisan tervezed az AI-láncokat. Workshopokhoz, demókhoz ideális.</td>
            </tr>
            <tr>
              <td><div class="tool-name">Flowise</div><div class="tool-gh">github.com/FlowiseAI/Flowise · ~35k ★</div></td>
              <td><span class="badge b-fmium">Freemium</span><br><small style="color:var(--text-dim)">Cloud: $35/hó-tól</small></td>
              <td>Visual / Low-code</td>
              <td>Low-code LLM-app és chatbot builder; LangChain + LlamaIndex vizuális kezelőfelülettel, 100+ integrációval.</td>
              <td>Ha nem akarsz Pythont írni, de LangChain erejét szeretnéd. Chatbotokhoz, RAG-prototípusokhoz.</td>
            </tr>
            <tr>
              <td><div class="tool-name">n8n</div><div class="tool-gh">github.com/n8n-io/n8n · ~100k ★</div></td>
              <td><span class="badge b-fmium">Freemium</span><br><small style="color:var(--text-dim)">Self-host ingyenes</small></td>
              <td>Automatizálás</td>
              <td>No-code workflow automatizálás AI-lépésekkel; 400+ integráció; önálló hosztolható.</td>
              <td>Üzleti folyamatok (email, Slack, CRM) AI-val összekapcsolásánál, ahol adatvédelmi kontroll is fontos.</td>
            </tr>
            <tr>
              <td><div class="tool-name">Zapier</div><div class="tool-gh">zapier.com (SaaS)</div></td>
              <td><span class="badge b-fmium">Freemium</span><br><small style="color:var(--text-dim)">$19.99/hó-tól</small></td>
              <td>Automatizálás</td>
              <td>SaaS-appok összekapcsolása; AI-lépések beillesztése meglévő munkafolyamatokba kód nélkül.</td>
              <td>Ha gyorsan kell SaaS-eszközöket összekapcsolni, és nincs adatvédelmi aggály.</td>
            </tr>
            <tr>
              <td><div class="tool-name">CrewAI</div><div class="tool-gh">github.com/joaomdmoura/crewAI · ~28k ★</div></td>
              <td><span class="badge b-free">Ingyenes</span><br><small style="color:var(--text-dim)">Enterprise: fizető</small></td>
              <td>Multi-agent</td>
              <td>Szerepalapú multi-agent rendszerek; „csapatok" koordinálása (kutató, író, szerkesztő ügynök).</td>
              <td>Ha a feladat szakosított szerepekre bontható. Gyors multi-agent prototípushoz Python-tudással.</td>
            </tr>
            <tr>
              <td><div class="tool-name">AutoGen / AG2</div><div class="tool-gh">github.com/microsoft/autogen · ~58k ★</div></td>
              <td><span class="badge b-oss">Open Source</span><br><small style="color:var(--text-dim)">Microsoft</small></td>
              <td>Multi-agent</td>
              <td>Ügynökök közötti „beszélgetéses" multi-agent koordináció; rugalmas, kutatás-orientált.</td>
              <td>Komplex, oda-vissza kommunikáló ügynök-munkafolyamatra. Microsoft ökoszisztémában otthonos.</td>
            </tr>
            <tr>
              <td><div class="tool-name">LlamaIndex</div><div class="tool-gh">github.com/run-llama/llama_index · ~40k ★</div></td>
              <td><span class="badge b-free">Ingyenes</span><br><small style="color:var(--text-dim)">Cloud: fizető</small></td>
              <td>RAG / Search</td>
              <td>Dokumentum-indexelés, RAG-pipeline-ok, privát adatok LLM-be kötése; vektortárak kezelése.</td>
              <td>Ha saját dokumentumokon, PDF-eken, belső adatbázisokon kell LLM-et futtatni.</td>
            </tr>
            <tr>
              <td><div class="tool-name">Haystack</div><div class="tool-gh">github.com/deepset-ai/haystack · ~18k ★</div></td>
              <td><span class="badge b-free">Ingyenes</span><br><small style="color:var(--text-dim)">deepset Cloud: fizető</small></td>
              <td>RAG / Search</td>
              <td>Vállalati keresési pipeline-ok, Q&amp;A rendszerek, dokumentum-feldolgozás. Production-ready.</td>
              <td>Enterprise szintű dokumentumkereső vagy Q&amp;A rendszer építésekor.</td>
            </tr>
            <tr>
              <td><div class="tool-name">Dify</div><div class="tool-gh">github.com/langgenius/dify · ~144k ★</div></td>
              <td><span class="badge b-fmium">Freemium</span><br><small style="color:var(--text-dim)">Cloud: $59/hó-tól</small></td>
              <td>Visual Platform</td>
              <td>LLM-app platform vizuális workflow-szerkesztővel, beépített RAG-gal, chatbot és API-kezelővel.</td>
              <td>Ha gyorsan production-kész AI-apot szeretnél deployment nehézségek nélkül.</td>
            </tr>
            <tr>
              <td><div class="tool-name">OpenAI Agents SDK</div><div class="tool-gh">github.com/openai/openai-agents-python</div></td>
              <td><span class="badge b-free">Ingyenes</span><br><small style="color:var(--text-dim)">API: fizető</small></td>
              <td>Agent Framework</td>
              <td>OpenAI-natív agent-keretrendszer; beépített guardrails, evalok, tool-handoff.</td>
              <td>Ha az OpenAI ökoszisztémán belül maradsz, és guardrail-ekkel ellátott agenteket akarsz gyorsan.</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- EMERGING -->
      <section id="tools-emerging">
        <div class="tools-section-title">🔥 GitHub-on felkapott / kevésbé ismert projektek</div>
        <table>
          <thead>
            <tr>
              <th style="width:16%">Eszköz</th>
              <th style="width:10%">Árazás</th>
              <th style="width:12%">Kategória</th>
              <th style="width:30%">Mire jó?</th>
              <th>Mikor érdemes?</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><div class="tool-name">OpenClaw <span class="badge b-hot" style="font-size:10px;margin-left:4px">viral</span></div><div class="tool-gh">github.com/openclaw · ~310k ★</div></td>
              <td><span class="badge b-free">Ingyenes</span></td>
              <td>Self-hosted Agent</td>
              <td>AI agent, ami WhatsApp/Telegram/Slack üzenetekből hajt végre feladatokat a gépen. Fájlkezelés, webböngészés, API-hívások, cron job-ok.</td>
              <td>Mindig bekapcsolt személyes AI-asszisztens messaging appból vezérelve, felhős SaaS nélkül. <span class="warn">⚠ Biztonsági kockázatokkal jár!</span></td>
            </tr>
            <tr>
              <td><div class="tool-name">Browser-Use</div><div class="tool-gh">github.com/browser-use · ~60k ★</div></td>
              <td><span class="badge b-oss">Open Source</span></td>
              <td>Browser Agent</td>
              <td>Python könyvtár LLM-ek böngészőre kötéséhez — automatikusan navigál, tölt ki formot, nyeri ki adatot.</td>
              <td>Webes feladatok AI-val való automatizálásához: scraping, form kitöltés, web tesztelés.</td>
            </tr>
            <tr>
              <td><div class="tool-name">AutoGPT</div><div class="tool-gh">github.com/Significant-Gravitas/AutoGPT · ~170k ★</div></td>
              <td><span class="badge b-oss">Open Source</span></td>
              <td>Autonóm Agent</td>
              <td>Az egyik első autonóm agent; hosszan futó, önirányított feladatmegoldás webböngészéssel, fájlokkal, memóriával.</td>
              <td>Ha testreszabott agent viselkedésre van szükség, és van mérnöki kapacitás.</td>
            </tr>
            <tr>
              <td><div class="tool-name">Smolagents</div><div class="tool-gh">github.com/huggingface/smolagents · ~15k ★</div></td>
              <td><span class="badge b-oss">Open Source</span></td>
              <td>Minimalist</td>
              <td>~1000 soros könyvtár; CodeAgent paradigma — az agent kódot ír, nem JSON tool call-okat. Modell-agnosztikus.</td>
              <td>Ha minimális overhead-del akarsz egyszerű agent-et írni, és fontos a kód-alapú gondolkodás.</td>
            </tr>
            <tr>
              <td><div class="tool-name">PocketFlow</div><div class="tool-gh">github.com/PocketFlow · ~8k ★</div></td>
              <td><span class="badge b-oss">Open Source</span></td>
              <td>Minimalist</td>
              <td>100 soros LLM framework — node-alapú gráf, nulla felesleges absztrakció. Tanuláshoz, prototípushoz.</td>
              <td>Ha a LangGraph túl nehéz, és csak egy egyszerű, átlátható orchestration logika kell.</td>
            </tr>
            <tr>
              <td><div class="tool-name">Agno (Phidata)</div><div class="tool-gh">github.com/agno-agi/agno · ~20k ★</div></td>
              <td><span class="badge b-free">Ingyenes</span><br><small style="color:var(--text-dim)">Platform: fizető</small></td>
              <td>Agent SDK</td>
              <td>Gyors multimodális agent SDK memóriával, tudásbázissal, eszközökkel. Beépített FastAPI szerver RBAC-kal.</td>
              <td>Nagy volumenű, real-time agentnél, ahol a sebesség kritikus és multimodális input is kell.</td>
            </tr>
            <tr>
              <td><div class="tool-name">PydanticAI</div><div class="tool-gh">github.com/pydantic/pydantic-ai · ~12k ★</div></td>
              <td><span class="badge b-oss">Open Source</span></td>
              <td>Type-safe</td>
              <td>Type-safe agent framework Pydantic-alapon; strukturált, validált LLM outputok FastAPI fejlesztőknek.</td>
              <td>Ha Python-ban dolgozol, és kritikus, hogy az LLM kimenetei strukturáltak és validáltak legyenek.</td>
            </tr>
            <tr>
              <td><div class="tool-name">Mastra</div><div class="tool-gh">github.com/mastra-ai/mastra · ~10k ★</div></td>
              <td><span class="badge b-oss">Open Source</span></td>
              <td>TypeScript</td>
              <td>TypeScript-first agent framework beépített RAG-gal, memóriával, MCP-vel és workflow-kal.</td>
              <td>Ha a csapat JS/TS-ben dolgozik, és nem akar Python-ra váltani az AI stack miatt.</td>
            </tr>
            <tr>
              <td><div class="tool-name">Semantic Kernel</div><div class="tool-gh">github.com/microsoft/semantic-kernel · ~22k ★</div></td>
              <td><span class="badge b-oss">Open Source</span></td>
              <td>Enterprise</td>
              <td>SDK LLM-ek .NET/Python/Java-ba integrálásához; plugin-ökoszisztéma, Azure-integráció, RBAC.</td>
              <td>Ha .NET / Azure környezetben dolgozol, és enterprise-szintű governance szükséges.</td>
            </tr>
            <tr>
              <td><div class="tool-name">Google ADK</div><div class="tool-gh">github.com/google/adk-python · ~8k ★</div></td>
              <td><span class="badge b-oss">Open Source</span></td>
              <td>Cloud-native</td>
              <td>Google hivatalos agent dev kit; natív Vertex AI + Gemini integráció, multi-agent orchestration.</td>
              <td>Ha Google Cloud-on vagy Gemini-modelleken építesz, és natív GCP-integrációra van szükséged.</td>
            </tr>
            <tr>
              <td><div class="tool-name">MetaGPT</div><div class="tool-gh">github.com/geekan/MetaGPT · ~50k ★</div></td>
              <td><span class="badge b-oss">Open Source</span></td>
              <td>Szoftver-szimuláció</td>
              <td>Szoftvercsapatot szimulál: PM, architect, engineer szerepű ügynökök együtt dolgoznak.</td>
              <td>Automatizált szoftver-spec, architektúra-dokumentáció vagy MVP-generálás egy promptból.</td>
            </tr>
            <tr>
              <td><div class="tool-name">Mem0</div><div class="tool-gh">github.com/mem0ai/mem0 · ~25k ★</div></td>
              <td><span class="badge b-free">Ingyenes</span><br><small style="color:var(--text-dim)">Cloud: fizető</small></td>
              <td>Memória réteg</td>
              <td>Hosszú távú memória réteg AI ügynökhöz — vector + graph + key-value tárolás kombinációja.</td>
              <td>Ha bármely meglévő agent mellé production szintű perzisztens memóriát akarsz adni.</td>
            </tr>
            <tr>
              <td><div class="tool-name">Coze Studio</div><div class="tool-gh">github.com/coze-dev/coze-studio · ~25k ★</div></td>
              <td><span class="badge b-oss">Open Source</span></td>
              <td>Visual Platform</td>
              <td>ByteDance vizuális agent-builder RAG-gal, plugin-ekkel, loop-os workflow engine-nel.</td>
              <td>Ha Dify-hoz hasonló vizuális platform kell, alternatív plugin-könyvtárral.</td>
            </tr>
          </tbody>
        </table>
      </section>
:::
