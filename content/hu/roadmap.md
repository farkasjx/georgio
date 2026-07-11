---
page: roadmap
title: Roadmap
sidebar:
  - label: "Tartalom"
    links:
      - { href: "#roadmap-overview", text: "Áttekintés" }
      - { href: "#roadmap-tracks",   text: "Tanulási trackek" }
      - { href: "#roadmap-timeline", text: "Timeline · 90 nap" }
      - { href: "#roadmap-phases",   text: "A három fázis" }
      - { href: "#roadmap-papers",   text: "5 kötelező paper" }
      - { href: "#roadmap-layers",   text: "AI rétegek" }
      - { href: "#roadmap-stack",    text: "Tech stack" }
---

<!-- MIGRÁLÁSI ÁLLAPOT: raw (az eredeti HTML 1:1).
     Fokozatosan bontsd ::: section / ::: stack-grid / ::: card blokkokra,
     ahogy a prompting.md-ben látod. Amíg raw, a build érintetlenül átveszi. -->

::: raw

      <div class="page-hero" id="roadmap-overview">
        <div class="hero-eyebrow">AI Engineer Learning Path</div>
        <h1>Agents, Models &amp; <em>Local Infra</em> Roadmap</h1>
        <p class="lead">
          Strukturált tanulási útvonal AI mérnököknek — az alapoktól a production-kész
          agentic rendszerekig. Elmélet, lokális modellek, API integráció és modern eszközök egy helyen.
        </p>
        <div class="hero-stats">
          <div class="hero-stat"><span class="val">5</span><span class="lbl">Track</span></div>
          <div class="hero-stat"><span class="val">60+</span><span class="lbl">Téma</span></div>
          <div class="hero-stat"><span class="val">90</span><span class="lbl">Nap terv</span></div>
          <div class="hero-stat"><span class="val">18+</span><span class="lbl">Nyitott kérdés</span></div>
        </div>
      </div>

      <!-- TANULÁSI TRACKEK -->
      <section id="roadmap-tracks">
        <div class="section-heading">Tanulási trackek</div>

        <div class="stack-grid">
          <div class="stack-card">
            <div class="sc-label" style="color:#c4a0ff">🧠 Track 1</div>
            <div class="sc-items"><strong style="color:var(--text)">Alapok &amp; Elmélet</strong><br>Tokenizáció, transformer, attention, kvantálás, KV cache, MoE, hallucináció</div>
          </div>
          <div class="stack-card">
            <div class="sc-label" style="color:#7dd3fc">💻 Track 2</div>
            <div class="sc-items"><strong style="color:var(--text)">Lokális modellek</strong><br>llama.cpp, Ollama, LM Studio, GGUF, AMD/CUDA setup, vLLM, HuggingFace</div>
          </div>
          <div class="stack-card">
            <div class="sc-label" style="color:#6ee7b7">🌐 Track 3</div>
            <div class="sc-items"><strong style="color:var(--text)">API &amp; Remote modellek</strong><br>Claude, OpenAI, Gemini, tool calling, RAG, benchmarkok, system prompt</div>
          </div>
          <div class="stack-card">
            <div class="sc-label" style="color:#fcd34d">🤖 Track 4</div>
            <div class="sc-items"><strong style="color:var(--text)">Agentic fejlesztés</strong><br>MCP, ReAct, context engineering, multi-agent, LangGraph, CrewAI</div>
          </div>
          <div class="stack-card">
            <div class="sc-label" style="color:#7dd3fc">⚙️ Track 5</div>
            <div class="sc-items"><strong style="color:var(--text)">Dev környezet</strong><br>Python env, benchmarks, integrációk, Slack/Gmail MCP, ReactFlow</div>
          </div>
        </div>

        <div class="section-heading" style="margin-top:36px">Eszközök &amp; tech stack</div>
        <div class="stack-grid">
          <div class="stack-card">
            <div class="sc-label">Inference engine-ek</div>
            <div class="sc-items">llama.cpp · ollama · LM Studio · vLLM</div>
          </div>
          <div class="stack-card">
            <div class="sc-label">LLM keretrendszerek</div>
            <div class="sc-items">LangChain · LangGraph · LlamaIndex · CrewAI</div>
          </div>
          <div class="stack-card">
            <div class="sc-label">Model API-k</div>
            <div class="sc-items">Anthropic · OpenAI · Gemini · Mistral · DeepSeek</div>
          </div>
          <div class="stack-card">
            <div class="sc-label">Observability</div>
            <div class="sc-items">LangSmith · Langfuse · Helicone · DeepEval</div>
          </div>
          <div class="stack-card">
            <div class="sc-label">Vector DB</div>
            <div class="sc-items">pgvector · Qdrant · Pinecone · Chroma</div>
          </div>
          <div class="stack-card">
            <div class="sc-label">MCP integrációk</div>
            <div class="sc-items">Slack · Gmail · Calendar · Drive · Notion · Jira</div>
          </div>
        </div>

        <div class="callout" style="margin-top:24px">
          <div class="callout-label">Nyitott kérdések</div>
          <p>Transformer architektúra részletek · GGUF kvantálási jelölések · KV cache tuning ·
          MCP szerver implementáció · YaRN kontextus-kiterjesztés · AMD GPU setup llama.cpp-vel ·
          Benchmark kontamináció · MoE vs dense összehasonlítás</p>
        </div>
      </section>

      <!-- TIMELINE -->
      <section id="roadmap-timeline">
        <div class="section-heading">Timeline · 90 nap</div>
        <p>Három egymásra épülő fázis, mindegyik konkrét projekt-mérföldkővel.</p>

        <div class="timeline-bar">
          <div class="tbar-segment tbar-1">Foundations<br><small>1–30. nap</small></div>
          <div class="tbar-segment tbar-2">Systems<br><small>30–60. nap</small></div>
          <div class="tbar-segment tbar-3">Production<br><small>60–90. nap</small></div>
        </div>
      </section>

      <!-- A HÁROM FÁZIS -->
      <section id="roadmap-phases">
        <div class="section-heading">A három fázis</div>

        <div class="phase-block" style="--phase-color: var(--t1)">
          <h3>Foundations · 1–30. nap</h3>
          <p>Célok: Megérteni az LLM belső működését, lokálisan futtatni modellt, az első valódi tool callingot megcsinálni, és saját API-t hívni. <strong>Ne nézz tutorialokat. Olvasd az eredeti dokumentációt.</strong></p>
          <ul>
            <li>LLM mentális modell — mi ez egyáltalán, mi NEM ez</li>
            <li>Tokenizáció, embedding, transformer architektúra intuitívan</li>
            <li>Attention: Q, K, V — saját szavakkal magyarázni tudni</li>
            <li>Kvantálás: Q4_K_M mit jelent, miért 4GB a 7B modell</li>
            <li>Ollama + LM Studio + llama.cpp lokálisan, saját gépen</li>
            <li>Első Claude/OpenAI API hívás tool callinggal — Python, nem wrapper</li>
            <li>5 kötelező paper: Attention is All You Need, GPT-1, RLHF, LoRA, Chain-of-Thought</li>
          </ul>
        </div>

        <div class="phase-block" style="--phase-color: var(--t2)">
          <h3>Systems · 30–60. nap</h3>
          <p>Első RAG rendszer, agent loop, MCP integráció. Minden lépésnél <strong>mérd amit csinálsz</strong>: latency, token cost, quality.</p>
          <ul>
            <li>RAG pipeline: chunking, embedding, vector DB, retrieval, reranker</li>
            <li>MCP server írása: tools, resources, stdio transport</li>
            <li>Agent loop: ReAct pattern, tool orchestration, guardrails</li>
            <li>Slack/Gmail MCP integráció — valódi pipeline, nem demo</li>
            <li>Context engineering: mi kerüljön be, mi ne, sorrendezés</li>
            <li>Lokális modell benchmarkok: mikor jobb az API, mikor a lokális</li>
          </ul>
        </div>

        <div class="phase-block" style="--phase-color: var(--t3)">
          <h3>Production · 60–90. nap</h3>
          <p>Observability, prompt regression testing, fine-tuning döntési keretrendszer, portfólió. <strong>Ha nem tudsz elvonatkoztatni a demótól — nem kész.</strong></p>
          <ul>
            <li>Eval framework: golden dataset, LLM-as-judge, Promptfoo/Langfuse</li>
            <li>Prompt injection: szimulálj támadást, építs védelmet</li>
            <li>Fine-tuning döntés: mikor RAG, mikor prompt-only, mikor fine-tune</li>
            <li>Multimodal pipeline: PDF/számla feldolgozás, structured extraction</li>
            <li>Portfólió: 4–6 projekt, minden döntéssel és trade-offjal dokumentálva</li>
          </ul>
        </div>
      </section>

      <!-- 5 KÖTELEZŐ PAPER -->
      <section id="roadmap-papers">
        <div class="section-heading">5 kötelező paper — Foundations fázis</div>
        <p style="font-family:var(--mono);font-size:12px;color:var(--text-dim);margin-bottom:20px">Ezeket el kell olvasni az első 30 napban. Outcome: el tudod magyarázni a csapatodnak, hogyan működik egy LLM.</p>

        <div class="paper-card">
          <div class="paper-num">01</div>
          <div class="paper-body">
            <div class="ptitle">Attention is All You Need (Vaswani et al., 2017)</div>
            <div class="pnote">Az eredeti transformer paper. Self-attention, multi-head attention, pozíciókódolás. Decoder-only (GPT/LLaMA) és encoder-only (BERT) modellek alapja. 3–4× újraolvasva érthetővé válik.</div>
          </div>
        </div>
        <div class="paper-card">
          <div class="paper-num">02</div>
          <div class="paper-body">
            <div class="ptitle">Language Models are Few-Shot Learners (GPT-3, Brown et al., 2020)</div>
            <div class="pnote">In-context learning, emergent capabilities, scaling. Megmutatja, miért értékes a skáláznánk és miért működik a few-shot prompting.</div>
          </div>
        </div>
        <div class="paper-card">
          <div class="paper-num">03</div>
          <div class="paper-body">
            <div class="ptitle">Training language models to follow instructions (InstructGPT, 2022)</div>
            <div class="pnote">RLHF — hogyan lesz pre-trained modellből asszisztens. SFT + reward model + PPO. Minden jelenlegi chat modell alapja.</div>
          </div>
        </div>
        <div class="paper-card">
          <div class="paper-num">04</div>
          <div class="paper-body">
            <div class="ptitle">LoRA: Low-Rank Adaptation of Large Language Models (2022)</div>
            <div class="pnote">Fine-tuning kevés paraméterrel. Miért elegendő a teljes modell helyett csak kis mátrixokat tanítani. QLoRA és PEFT alapja.</div>
          </div>
        </div>
        <div class="paper-card">
          <div class="paper-num">05</div>
          <div class="paper-body">
            <div class="ptitle">Chain-of-Thought Prompting Elicits Reasoning in Large Language Models (2022)</div>
            <div class="pnote">"Think step by step." Miért javít drasztikusan a minőségen, ha gondolkodást kérsz a modelltől. Zero-shot CoT, few-shot CoT alapjai.</div>
          </div>
        </div>
      </section>

      <!-- AI RÉTEGEK -->
      <section id="roadmap-layers">
        <div class="section-heading">AI rendszer rétegei</div>
        <p>GenAI-tól az Agentic AI-ig — alulról felfelé egyre több autonómia, komplexitás és governance igény.</p>

        <div class="phase-block" style="--phase-color: #7c3aed">
          <h3>Réteg 1 · Generative AI</h3>
          <p>Szöveg, kép, kód generálás. Alapmodell API hívás. Semmi autonómia, semmi memória. <em>Claude/GPT single-turn call.</em></p>
        </div>
        <div class="phase-block" style="--phase-color: #0ea5e9">
          <h3>Réteg 2 · Augmented LLM</h3>
          <p>Tool calling, RAG, structured output. A modell külső forrásokhoz fér. <em>LangChain, LlamaIndex.</em></p>
        </div>
        <div class="phase-block" style="--phase-color: #10b981">
          <h3>Réteg 3 · Agentic Loop</h3>
          <p>ReAct, multi-step planning, context engineering. Az LLM önállóan dönt a következő lépésről. <em>LangGraph, OpenAI Agents SDK.</em></p>
        </div>
        <div class="phase-block" style="--phase-color: #f59e0b">
          <h3>Réteg 4 · Multi-Agent</h3>
          <p>Koordinált ügynökök, szerepek, kommunikáció. <em>CrewAI, AutoGen, MCP orchestration.</em></p>
        </div>
        <div class="phase-block" style="--phase-color: #f43f5e">
          <h3>Réteg 5 · Autonomous Systems</h3>
          <p>Hosszan futó, emberi beavatkozás nélküli rendszerek. Saját céllal, memóriával, self-correction looppal. <em>OpenClaw, SWE-bench-szintű kódagent.</em></p>
        </div>
      </section>

      <!-- TECH STACK -->
      <section id="roadmap-stack">
        <div class="section-heading">Key benchmarkok — referencia</div>
        <table>
          <thead>
            <tr>
              <th>Benchmark</th>
              <th>Mit mér</th>
              <th>Claude Sonnet 4.5</th>
              <th>Qwen3.6-35B-A3B</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>MMLU-Redux</td><td>Általános tudás</td><td>93.3%</td><td>93.2%</td></tr>
            <tr><td>SWE-bench Verified</td><td>GitHub issue megoldás</td><td>70.0%</td><td>75.0%</td></tr>
            <tr><td>GPQA Diamond</td><td>Doktori szintű tudomány</td><td>84.2%</td><td>85.5%</td></tr>
            <tr><td>MCPMark</td><td>MCP tool-használat</td><td>36.3%</td><td>37.0%</td></tr>
            <tr><td>HallusionBench</td><td>Vizuális hallucináció</td><td>59.9%</td><td>70.0%</td></tr>
          </tbody>
        </table>

        <div class="callout warning" style="margin-top:20px">
          <div class="callout-label">Benchmark olvasás</div>
          <p>Friss benchmarkok kevésbé kontamináltak (HMMT Feb 26, SWE-bench Pro). Saját benchmark gyanús (pl. QwenClawBench: Qwen előnyben). MoE trükk: 35B-A3B ≈ 27B dense teljesítmény, de csak 3B aktív paraméter — az inference cost sokkal kisebb.</p>
        </div>
      </section>

      <div class="page-footer">
        <span>AI Hub · Roadmap</span>
        <span>Összeállítva 2026 júniusában</span>
      </div>

:::
