# Copy deck

Every sentence the site says, taken from `src/content/index.ts`, for Eshan's approval. Nothing here is live until it is approved.

Sources: the CV, two LinkedIn screenshots and the public GitHub repos. None of them is stored in this repo.

## For approval

Each point below needs a yes, a no or a correction.

1. **PA Consulting title.** The CV says "Software Engineer, Software and Controls". LinkedIn says "Software & Controls System Engineer". The site uses the CV title.
2. **Roles only on LinkedIn.** Residential Community Assistant (University of Warwick, Sep 2025 to Jul 2026) and Research Assistant, NLP and Synthetic Data (URSS, Jul 2024 to Oct 2024) are not on the CV. Both are included. The URSS dates overlap the Jazz Pharmaceuticals internship (Jul to Sep 2024).
3. **TIA Centre title.** The CV says "Research Intern, Applied AI in Medical Imaging". LinkedIn says "Summer Research Intern - Computational Pathology". The site uses the CV title.
4. **Medical AI society name.** The CV says "Warwick Medical AI Society". LinkedIn says "Warwick Medical AI and Innovation Society". The site uses the CV name.
5. **Mini C parser.** The CV says an LALR(1) parser. The repo README describes a predictive recursive descent parser. The site says only "a lexer and parser" until this is settled.
6. **Deforestation repo.** `esharif20/Treefera` has no README or code, so the Project shows no repo link.
7. **Finance Agent demo.** https://finance-agent-demo-chi.vercel.app, taken from the repo's merged pull requests. It answered with HTTP 200 on 2026-11-13.
8. **Room meanings.** The glossary names the six Rooms but not what each stands for. The "Stands for" lines below are a first proposal.
9. **Sentences that go beyond the sources.** The problem Panels add a sentence of context that the CV does not state. They are marked *sample* below the Project.
10. **Email.** `site.email` is the address printed on the CV.

No phone number appears anywhere on the site. Clients of PA Consulting are not named.

## Site

- Name: Eshan Sharif
- Line: Software engineer. Firmware, computer vision and AI agents.
- City: London
- Email: esharif2004@gmail.com
- LinkedIn: https://www.linkedin.com/in/eshan-sharif
- GitHub: https://github.com/esharif20

## Rooms

### Entrance

Stands for: Where the work starts: the degree, the city, the first job.

- BSc Computer Science, First Class Honours.
- University of Warwick, 2023 to 2026.
- Based in London.
- Software Engineer at PA Consulting.

### Workshop

Stands for: Engineering at PA Consulting: firmware, devices and the pipelines that ship them.

- Embedded C++ on Zephyr RTOS for medical devices.
- Signed image capture on a Raspberry Pi.
- Deployed to air-gapped servers.

### Study

Stands for: Research and coursework: compilers, pathology and language models.

- A C compiler that emits LLVM IR.
- Gigapixel slide analysis at the TIA Centre.
- LLM data augmentation for sentiment analysis.

### Lookout

Stands for: Computer vision: reading a match from one camera and a forest through cloud.

- Players tracked at 0.916 IDF1 from broadcast video.
- 6,545 ha of forest loss flagged from radar.
- Won the hardest track at a 25-team hackathon.

### Great Hall

Stands for: AI agents: systems that do the work and show their working.

- A team of coding agents 36% to 61% faster than one model alone.
- A finance assistant whose figures come from the ledger, never the model.
- LangGraph workflows that log every agent action for audit.

### Garden

Stands for: Teaching and community outside the day job.

- Taught 60+ students to train their first models.
- Residential Community Assistant at Warwick.

## Layers

- **Firmware**: C, C++, Zephyr RTOS, Raspberry Pi, Linux
- **Languages**: C++, Flex, LLVM IR, Python, TypeScript, Java, SQL, Bash
- **Services**: FastAPI, React, PostgreSQL, Docker, Jenkins, Google Cloud, Cloud Run
- **Vision**: PyTorch, ONNX, YOLOv8, ByteTrack, HoVer-Net, TIAToolbox, Earth Engine
- **Agents**: LangGraph, MCP, Claude Code, Ollama, FActScore, G-Eval, sub-agent workflows

## Roles

### Software Engineer, Software and Controls, PA Consulting

Cambridge, UK. 2026-10 to present. Room: workshop.

Firmware and AI tooling for regulated clients. Medical devices on one side, a finance team that keeps its models in-house on the other.

- Prototypes embedded C++ firmware on Zephyr RTOS for medical devices, where every change has to stand up to regulation.
- Joining a finance project that runs language models locally, for a client that does not allow hosted AI tools.
- Builds LangGraph agent workflows and is trialling pi.dev to ticket and log each agent action, so every step can be audited.

### Software Engineer Intern, PA Consulting

Cambridge, UK. 2025-06 to 2025-08. Room: workshop.

A camera app that proves a photo has not been changed since it was taken, built end to end and deployed on a client's own servers.

- Built a React Native capture app with a FastAPI backend on a Raspberry Pi. Each image is signed with C2PA at the moment of capture.
- Designed tamper detection that re-derives an image's hashes and compares them with its C2PA manifest, backed by Lab colour watermarks.
- Deployed to air-gapped on-premises servers, with dependencies pulled through Artifactory and a GitLab cache.
- Set up a Jenkins and Docker pipeline to staging, with tests written first and Claude Code working under strict TDD.

### AI Education Officer, Warwick Medical AI Society

Coventry, UK. 2025-10 to 2026-06. Room: garden.

A six-week course that took non-technical students from no code to training models.

- Designed and taught the course to 60+ students with no programming background.
- Ran hands-on pathology sessions on HoVer-Net, with ready-made Git repos so every session started on code, not setup.

### Residential Community Assistant, University of Warwick

Coventry, UK. 2025-09 to 2026-07. Room: garden.

First point of contact for students in halls, alongside the final year.

- Supported residents' wellbeing and passed concerns to the right university services.
- Planned and ran community events for the halls.

### Research Intern, Applied AI in Medical Imaging, TIA Centre, University of Warwick

Coventry, UK. 2025-08 to 2025-09. Room: study.

A pipeline that turns gigapixel pathology slides into features a model can score.

- Built a modular slide pipeline in Python with TIAToolbox: tiling, stain normalisation and quality filtering.
- Ran HoVer-Net nuclei segmentation over TCGA slides, batching tiles to cut the runtime per slide.
- Rolled per-nucleus counts up into slide-level features, scored by ROC AUC and F1 under fixed seeds.

### Research Assistant, NLP and Synthetic Data, University of Warwick (URSS)

London, UK. 2024-07 to 2024-10. Room: study.

Tested whether text written by a language model makes sentiment analysis of module feedback more accurate.

- Cleaned and merged several sources of student feedback in Python.
- Generated extra examples for the rarer sentiment classes and measured the effect on the classifier.

### EDC Programmer Intern, Jazz Pharmaceuticals

London, UK. 2024-07 to 2024-09. Room: entrance.

Code that keeps clinical trial data consistent across several regulated trials at once.

- Wrote C# functions and automated electronic data capture workflows across concurrent trials.
- Connected the capture systems to clinical databases so discrepancies were caught automatically, cutting manual reconciliation.

## Projects

### Football Intelligence (football-intelligence)

2026. Room: lookout. Layer: vision. Repo: https://github.com/esharif20/football-analytics-dashboard.

Tactical analysis of a football match from a single broadcast camera. The dissertation.

Stack: PyTorch, YOLOv8x, ByteTrack, ONNX, FastAPI, React, Supabase Postgres, RunPod

Figures:

- 0.916: IDF1 for player tracking
- 24 FPS: pipeline speed with ONNX FP16 batching
- 0.516 → 0.647: macro F1 for event classification
- 48.7% → 70.2%: grounded statistics in generated commentary

**problem: One camera, twenty-two players**

A broadcast feed is one moving camera that cuts, zooms and loses players off screen. The question was how much tactical analysis that single feed can still support.

**approach: Track, classify, then explain**

YOLOv8x and ByteTrack follow every player. A 2.5D CNN with a calibrated cascade labels events. A language model then writes commentary from the numbers, checked by an evaluation harness with FActScore, G-Eval and a 58-question test set judged by Claude Haiku and GPT-4o.

Figure: 24 FPS, with ONNX FP16 batching on a RunPod GPU worker

**result: Fewer invented numbers**

Tracking reached 0.916 IDF1. Event macro F1 rose from 0.516 to 0.647. Linear probes on Qwen2-VL-7B showed it read statistics better from text than from charts, and switching inputs raised grounding from 48.7% to 70.2%.

Figure: 70.2%, of stated statistics grounded in the data

### Deforestation Detection (deforestation-detection)

2026. Room: lookout. Layer: vision.

Finding forest loss under cloud cover with radar. Won the hardest track at Treefera's hackathon.

Stack: Python, PyTorch, Earth Engine, Sentinel-1, Docker, Cloud Run, MCP

Figures:

- 6,545 ha: of forest loss flagged
- 100,000 ha: studied over 8 years
- 25: teams at the hackathon

**problem: The forest is under cloud**

Carbon credits depend on proving a forest still stands. Optical satellites cannot see through cloud, so loss under cloud cover goes unrecorded and the carbon checks fail.

**approach: Radar instead of light**

Sentinel-1 radar passes through cloud. Eight years of it over 100,000 ha came in through Earth Engine. A Docker API, an MCP server and a dashboard went to Cloud Run, built with Claude sub-agents.

Figure: 8 years, of radar over 100,000 ha

**result: Loss that optical imagery missed**

The system flagged 6,545 ha of forest loss and won the hardest of the challenge tracks, against 25 teams.

Figure: 6,545 ha, flagged

### Mini C Compiler (minic-compiler)

2025. Room: study. Layer: languages. Repo: https://github.com/esharif20/minic-compiler.

A compiler for a subset of C that produces native x86-64 binaries through LLVM.

Stack: C++, Flex, LLVM IR, llc, clang

Figures:

- 20%: less IR after optimisation
- 120+: tests

**problem: From text to a running program**

Source code is just characters. A compiler has to turn it into a structure it can check, then into instructions a machine can run, and say exactly where the programmer went wrong.

**approach: Every stage by hand**

A lexer and parser build a full syntax tree. Semantic analysis checks it against scoped symbol tables. Code generation emits LLVM IR for expressions and control flow, and llc and clang link it into x86-64 binaries.

**result: Smaller code, tested**

Constant folding and dead code elimination passes cut the generated IR by 20%, measured across more than 120 tests.

Figure: 20%, less IR

### Software Factory (software-factory)

2026. Room: hall. Layer: agents. Repo: https://github.com/esharif20/herdr-software-factory.

A team of AI coding agents that plans and builds software faster than one model working alone.

Stack: Claude Code, Herdr, JavaScript, Shell, git worktrees

Figures:

- −36% to −61%: wall time against one Opus session
- 15%: hard cap on extra cost
- 3: benchmarks beaten on speed, quality and cost

**problem: One agent is a bottleneck**

A single coding agent works one file at a time. Splitting the work between agents usually costs more and breaks more than it saves.

**approach: A Lead, lanes and checks**

A Lead plans the work into lanes that never touch the same files. Builders work in their own git worktrees. Scripts run the tests and merge by exact commit, and a reviewer reads the riskiest changes. The build log is public.

Figure: 15%, most extra cost allowed over one agent

**result: Faster at the same quality**

On three benchmarks the team finished 36% to 61% sooner than one Opus session, passed the same hidden tests or more, and stayed inside the cost cap.

Figure: −61%, wall time on the best benchmark

### Finance Agent (finance-agent)

2026. Room: hall. Layer: services. Repo: https://github.com/esharif20/finance-agent. Demo: https://finance-agent-demo-chi.vercel.app.

A read-only personal finance app that runs on a Mac, with a local model that answers questions about spending.

Stack: Python, FastAPI, TypeScript, React, SQLCipher, Ollama, GSAP

Figures:

- 8 s → <300 ms: to load the monthly summary
- 29: merged pull requests
- 0: figures written by the model

**problem: Bank data is too private for the cloud**

Budgeting apps send every transaction to someone else's server, and chat assistants invent numbers. A finance tool needs to keep the data at home and get the sums right.

**approach: Local, encrypted, read-only**

Transactions land in a SQLCipher ledger with its key in the Keychain. Rules, corrections and a local Ollama model sort them into categories. Questions in plain English are answered by retrieving the figures from the ledger first. The app can never move money.

**result: Fast, and the numbers add up**

The monthly summary went from 8 seconds to under 300 ms. Every figure in an answer comes from the ledger, and the public demo runs on synthetic households.

Figure: <300 ms, monthly summary, down from 8 s

## Samples

These sentences add context that is not in the CV, LinkedIn or a repo README:

- Football Intelligence, problem: "A broadcast feed is one moving camera that cuts, zooms and loses players off screen."
- Mini C Compiler, problem: the whole Panel.
- Software Factory, problem: "Splitting the work between agents usually costs more and breaks more than it saves."
- Finance Agent, problem: "Budgeting apps send every transaction to someone else's server, and chat assistants invent numbers."
- Every Room's "Stands for" line.
