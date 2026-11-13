# Copy deck

Every sentence the site says, taken from `src/content/index.ts`, for Eshan's approval. Nothing here is live until it is approved.

Sources: the CV, two LinkedIn screenshots and the public GitHub repos. The CV and screenshots are not stored in this repo. A sentence marked *Sample* says something no source states. It is a placeholder until approved or replaced.

## For approval

Each point below needs a yes, a no or a correction.

1. **PA Consulting title.** The CV says "Software Engineer, Software and Controls". LinkedIn says "Software & Controls System Engineer". The site uses the CV title.
2. **Roles only on LinkedIn.** Residential Community Assistant (University of Warwick, Sep 2025 to Jul 2026) and Research Assistant, NLP and Synthetic Data (URSS, Jul 2024 to Oct 2024) are not on the CV. Both are included. The URSS dates overlap the Jazz Pharmaceuticals internship (Jul to Sep 2024). The LinkedIn text for both was cut off in the screenshot, so their last points paraphrase what was visible.
3. **TIA Centre title.** The CV says "Research Intern, Applied AI in Medical Imaging". LinkedIn says "Summer Research Intern - Computational Pathology". The site uses the CV title.
4. **Medical AI society name.** The CV says "Warwick Medical AI Society". LinkedIn says "Warwick Medical AI and Innovation Society". The site uses the CV name.
5. **Mini C parser.** The CV says an LALR(1) parser. The repo README describes a predictive recursive descent parser, and the grammar file shown in the approach Panel is headed "FINAL LL(k) GRAMMAR". The site says only "a lexer and parser" until this is settled.
6. **Deforestation repo.** `esharif20/Treefera` has no README or code, so the Project shows no repo link.
7. **Finance Agent demo.** https://finance-agent-demo-chi.vercel.app, taken from the repo's merged pull requests. It answered with HTTP 200 on 2026-11-13.
8. **Room meanings.** The glossary names the six Rooms but not what each stands for. Every "Stands for" line is a sample.
9. **Sample sentences.** Five problem Panels add context that no source states. Each is marked *Sample* where it appears and listed again under Samples.
10. **Email.** `site.email` is the address printed on the CV.
11. **City.** The site says "London" and "Based in London". The CV header gives no city and the current Role is in Cambridge. The source is the LinkedIn header, "London Area, United Kingdom".
12. **Client names.** No client of PA Consulting is named, and no test can know the names. Please read the two PA Consulting Roles with that in mind.
13. **Software Factory numbers.** They come from the project's own README, not the CV. See Sources for figures.
14. **Finance Agent numbers.** They come from the repo, not the CV. See Sources for figures.
15. **Role summaries.** Each Role's one-line summary is a paraphrase of its CV bullets, not a quotation.
16. **Pictures.** Thirteen pictures are listed under Pictures with the source of each. Please check that each may be shown, the dissertation radar and the two hackathon figures above all.
17. **Deforestation figures show PALSAR.** Both figures are of L-band PALSAR HV backscatter. The copy, following the CV, names Sentinel-1. The project's README uses both. Say which the text should name.
18. **Finance Agent demo errors.** The hosted demo's Assistant and Overview were failing on 2026-11-13 (see Pictures). The result Panel's picture is the demo site's own worked example, not a live reply.

No phone number appears anywhere on the site.

## Sources for figures

Every number on the site, and where it comes from.

| Figure | Where it appears | Source |
|---|---|---|
| 0.916 IDF1, 24 FPS, macro F1 0.516 to 0.647, grounding 48.7% to 70.2%, 58-question QA | Football Intelligence, Lookout | CV, Multimodal Football Intelligence |
| 6,545 ha, 100,000 ha, 8 years, 25 teams | Deforestation Detection, Lookout | CV, Cloud-Penetrating Deforestation Detection |
| 20% less IR, 120+ tests | Mini C Compiler | CV, Mini C Compiler |
| 60+ students, 6 weeks | AI Education Officer, Garden | CV, AI Education Officer |
| −36% to −61% wall time | Software Factory, Great Hall | `esharif20/herdr-software-factory` README at `81ac5e7`, Status table, "Time vs solo": bench10 −61%, bench11 −36%, bench12 −42%. The same rows are in `docs/08-mvp.md` with the run times and costs. |
| 3 of 3 benchmarks with equal or better hidden-test scores | Software Factory | Same table, "Hidden tests (team / solo)": 203 / 203 of 205, 172 / 171 of 172, 140 / 140 of 140. |
| −24% to +8% cost | Software Factory | Same table, "Cost vs solo": −14%, −24%, +8%. |
| 15% cost cap (a rule, stated in the approach Panel, not a result) | Software Factory | Same README, "The goal in one line": "at most 15% above solo (a hard cap)". |
| 8 s to under 300 ms | Finance Agent | `esharif20/finance-agent` pull request #323, "Overview: summary 8 s → <300 ms; instant month switching", merged 2026-11-08. |
| 150+ merged pull requests | Finance Agent | `gh pr list -R esharif20/finance-agent --state merged` returned 159 on 2026-11-13. |
| 6 fictional households | Finance Agent | `esharif20/finance-agent` README at `874121b`, Demo: "six fictional households". |

The Software Factory benchmarks were run and reported by Eshan in that repo. Nothing here re-ran them.

## Site

- Name: Eshan Sharif
- Line: Software engineer. Firmware, computer vision and AI agents. *(Sample: a proposed one-line summary.)*
- City: London
- Email: esharif2004@gmail.com
- LinkedIn: https://www.linkedin.com/in/eshan-sharif
- GitHub: https://github.com/esharif20

## Rooms

### Entrance

Stands for: Where the work starts: the degree, the city, the first job. *(Sample.)*

- BSc Computer Science, First Class Honours.
- University of Warwick, 2023 to 2026.
- Based in London.
- Software Engineer at PA Consulting.

### Workshop

Stands for: Engineering at PA Consulting: firmware, devices and the pipelines that ship them. *(Sample.)*

- Embedded C++ on Zephyr RTOS for medical devices.
- Signed image capture on a Raspberry Pi.
- Deployed to air-gapped servers.

### Study

Stands for: Research and coursework: compilers, pathology and language models. *(Sample.)*

- A C compiler that emits LLVM IR.
- Gigapixel slide analysis at the TIA Centre.
- LLM data augmentation for sentiment analysis.

### Lookout

Stands for: Computer vision: reading a match from one camera and a forest through cloud. *(Sample.)*

- Players tracked at 0.916 IDF1 from broadcast video.
- 6,545 ha of forest loss flagged from radar.
- Won the hardest track at a 25-team hackathon.

### Great Hall

Stands for: AI agents: systems that do the work and show their working. *(Sample.)*

- A team of coding agents 36% to 61% faster than one model alone.
- A finance assistant whose figures come from the ledger, never the model.
- LangGraph workflows that log every agent action for audit.

### Garden

Stands for: Teaching and community outside the day job. *(Sample.)*

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

A camera app that proves a photo has not been changed since it was taken, built end to end and deployed on PA's own air-gapped servers.

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
- Connected the capture systems to clinical databases and caught discrepancies between them, cutting manual reconciliation.

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

*Sample: the whole Panel is context that no source states.*

**approach: Track, classify, then explain**

YOLOv8x and ByteTrack follow every player. A 2.5D CNN with a calibrated cascade labels events. A language model then writes commentary from the numbers, checked by an evaluation harness with FActScore, G-Eval and a 58-question test set judged by Claude Haiku and GPT-4o.

Figure: 24 FPS, with ONNX FP16 batching on a RunPod GPU worker

**result: Fewer invented numbers**

Tracking reached 0.916 IDF1. Event macro F1 rose from 0.516 to 0.647. Linear probes on Qwen2-VL-7B compared text inputs with chart inputs, to stop invented statistics. Grounding rose from 48.7% to 70.2%.

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

*Sample: the first sentence. The rest restates the CV.*

**approach: Radar instead of light**

Sentinel-1 radar passes through cloud. Eight years of it over 100,000 ha came in through Earth Engine. A Docker API, an MCP server and a dashboard went to Cloud Run, built with Claude sub-agents.

Figure: 8 years, of radar over 100,000 ha

**result: Forest loss, found by radar**

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

*Sample: the whole Panel.*

**approach: Every stage, source to binary**

A lexer and parser build a full syntax tree. Semantic analysis checks it against scoped symbol tables. Code generation emits LLVM IR for expressions and control flow, and llc and clang link it into x86-64 binaries.

**result: Smaller code, tested**

Constant folding and dead code elimination passes cut the generated IR by 20%, measured across more than 120 tests.

Figure: 20%, less IR

### Software Factory (software-factory)

2026. Room: hall. Layer: agents. Repo: https://github.com/esharif20/herdr-software-factory.

A team of AI coding agents that plans and builds software faster than one model working alone.

Stack: Claude Code, Herdr, JavaScript, Shell, git worktrees

Figures:

- −36% to −61%: wall time against one Opus session, on three benchmarks
- 3 of 3: benchmarks with hidden-test scores equal to or above the solo run
- −24% to +8%: cost against the solo run

**problem: One agent is a bottleneck**

A single coding agent works one file at a time. Splitting the work between agents usually costs more and breaks more than it saves.

*Sample: the whole Panel.*

**approach: A Lead, lanes and checks**

A Lead plans the work into lanes that never touch the same files. Builders work in their own git worktrees. Scripts run the tests and merge by exact commit, and a reviewer reads the riskiest changes. One rule was set before any run: the team may cost at most 15% more than one agent. The build log is public.

**result: Faster at the same quality**

On three benchmarks the team finished 36% to 61% sooner than one Opus session. It passed as many hidden tests or more each time. Cost ranged from 24% less to 8% more, inside the cap.

Figure: −61%, wall time on the best benchmark

### Finance Agent (finance-agent)

2026. Room: hall. Layer: services. Repo: https://github.com/esharif20/finance-agent. Demo: https://finance-agent-demo-chi.vercel.app.

A read-only personal finance app that runs on a Mac, with a local model that answers questions about spending.

Stack: Python, FastAPI, TypeScript, React, SQLCipher, Ollama, GSAP

Figures:

- 8 s → <300 ms: to load the monthly summary
- 150+: merged pull requests
- 6: fictional households in the public demo

**problem: Bank data is too private for the cloud**

Budgeting apps send every transaction to someone else's server, and chat assistants invent numbers. A finance tool needs to keep the data at home and get the sums right.

*Sample: the whole Panel.*

**approach: Local, encrypted, read-only**

Transactions land in a SQLCipher ledger with its key in the Keychain. Rules, corrections and a local Ollama model sort them into categories. Questions in plain English are answered by retrieving the figures from the ledger first. The app can never move money.

**result: Fast, and the numbers add up**

The monthly summary went from 8 seconds to under 300 ms. Every figure in an answer comes from the ledger, and the public demo runs on six fictional households.

Figure: <300 ms, monthly summary, down from 8 s

## Pictures

Thirteen pictures, in `public/work/<slug>/`. Each is real: a screenshot of a live public page, or a figure the project itself saved. None was drawn or mocked up for this site, and none of the projects was run to make them. `tools/media/pictures.json` holds this list, `tools/media/capture.cjs` takes the screenshots and `tools/media/make.mjs` converts them to WebP (at most 1600px wide, under 300 KB, metadata stripped).

`picture.src` is relative to the site base, with no leading slash, like the other files in `public/`.

### football-intelligence

- `work/football-intelligence/keypoints.webp`, problem Panel. Taken from the repository as saved. Source: esharif20/football-analytics-dashboard, backend/tests/keypoint_fix_demo.png. A figure saved by the project's own keypoint test.
  Alt text: Two diagrams of a football pitch with 32 numbered keypoints. Before a fix, 29 are found and three are marked missing with red crosses. After it, the three are filled in grey.
- `work/football-intelligence/radar.webp`, approach Panel. Taken from the repository as saved. Source: esharif20/Dissertation (private), voronoi_radar.png. Output of the pipeline, used as a figure in the dissertation.
  Alt text: A top-down pitch radar. Pink and blue dots mark the players of two teams, and shaded regions show which team controls each part of the pitch.
- `work/football-intelligence/probing.webp`, result Panel. Taken from the repository as saved. Source: esharif20/football-analytics-dashboard, dissertation/figures/linear_probing_results.png. A result figure from the dissertation.
  Alt text: Bar chart of macro F1 on four tactical tasks for Qwen2-VL-7B, comparing linear probes on text, visual and combined inputs with prompting. The probes beat prompting on pressing type and compactness trend.

### deforestation-detection

- `work/deforestation-detection/backscatter.webp`, approach Panel. Taken from the project folder as saved. Source: The hackathon project folder (not on GitHub), figures/fig07_palsar_hv_trajectory.png. A figure exported by the project's notebooks for the presentation.
  Alt text: Line chart of median PALSAR HV radar backscatter from 2017 to 2024. Stable forest stays near -11.5 dB. Cleared pixels fall away from it, 1.73 dB lower by 2024.
- `work/deforestation-detection/change-map.webp`, result Panel. Taken from the project folder as saved. Source: The hackathon project folder (not on GitHub), figures/fig08_hv_change_map.png. A figure exported by the project's notebooks for the presentation.
  Alt text: Left: a map of the change in HV radar backscatter from 2017 to 2024, with a red band of loss across the upper right. Right: histograms of that change for 35,709 cleared and 268,477 stable pixels. The cleared pixels sit lower.

### minic-compiler

- `work/minic-compiler/program.webp`, problem Panel. Captured from a live page. Source: Screenshot of github.com/esharif20/minic-compiler, code/tests/fibonacci/fibonacci.c, taken 2026-11-13.
  Alt text: The fibonacci.c test program in the compiler's repository on GitHub: a MiniC function with declarations, a while loop and an if-else.
- `work/minic-compiler/grammar.webp`, approach Panel. Captured from a live page. Source: Screenshot of github.com/esharif20/minic-compiler, grammar/Task_1_2_1.txt, taken 2026-11-13.
  Alt text: The grammar file in the compiler's repository on GitHub. Its header reads: final LL(k) grammar, left recursion removed, precedence enforced. The production rules follow.
- `work/minic-compiler/tests.webp`, result Panel. Captured from a live page. Source: Screenshot of GitHub Actions run 19601759266 on esharif20/minic-compiler, taken 2026-11-13.
  Alt text: GitHub Actions run 35 on the compiler's repository, titled 'finished the project'. Status: Success. The build-and-test job passed in 55 seconds.

### software-factory

- `work/software-factory/team.webp`, approach Panel. Taken from the repository as saved. Source: esharif20/herdr-software-factory, herdr/herdr-team/preview.png. The repo's own screenshot of the team running in Herdr.
  Alt text: Herdr running the team on a benchmark project. A side panel lists the Lead, four Builders at work, Reviewers and UI Polish. The main pane shows a builder editing a test file and a test run with 30 passes and no failures.
- `work/software-factory/benchmarks.webp`, result Panel. Captured from a live page. Source: Screenshot of the Status table in the README on github.com/esharif20/herdr-software-factory, taken 2026-11-13.
  Alt text: The Status table from the project's README. Three benchmarks, with time against one Opus session of -61%, -36% and -42%, cost of -14%, -24% and +8%, and hidden-test scores for team and solo.

### finance-agent

- `work/finance-agent/transactions.webp`, problem Panel. Captured from a live page. Source: Screenshot of the live demo, /app, Transactions tab, taken 2026-11-13. Synthetic data.
  Alt text: The demo app's Transactions screen, under a banner reading 'Synthetic data. Nothing here is real.' Made-up transactions are listed by day, each with a merchant, an amount and a category.
- `work/finance-agent/architecture.webp`, approach Panel. Captured from a live page. Source: Screenshot of the live demo, /architecture, taken 2026-11-13.
  Alt text: The demo's architecture page, headed 'How the Assistant answers'. Four cards read: 30 parts, 2 hosts outside the Mac, 1 retry for a reply that misquotes a figure, 0 tools that can pay or move money.
- `work/finance-agent/answer.webp`, result Panel. Captured from a live page. Source: Screenshot of the live demo's landing page, section "The app itself", taken 2026-11-13. It is the site's worked example of an Assistant answer on synthetic data, not a live reply: the demo's Assistant endpoint returned errors that day.
  Alt text: From the demo site: the question 'How much did I spend on eating out in October?' is answered as £226.40 across 14 payments, up from £189.20 in September, with the ledger query behind it shown beneath.

### Not used, and why

- **Annotated match frames** (player boxes, tracking, keypoints on video) exist in the private dissertation repo. They are frames of a television broadcast with a third party's watermark, so none is used. They are the clearest pictures of the tracking. Say if they may be shown.
- **The satellite photograph and the biomass and land-cover figures** in the hackathon folder are made from imagery and data products supplied for the hackathon. Only the two figures made from radar backscatter and the public Hansen forest-loss record are used.
- **The Mini C compiler was not run.** The machine has no LLVM toolchain. Its pictures are screenshots of the repository and of its last test run on GitHub.
- **The Software Factory diagram** in the README does not render on GitHub ("Unable to render rich display"), so the repo's own screenshot is used.
- **A live Assistant answer and the Overview screen** could not be captured. On 2026-11-13 the hosted demo answered `/api/chat` with a server error every time, and `/api/transactions` and `/api/months` some of the time.

## Samples

Sentences that say something no source states. Each is also marked where it appears above.

- Site line: a proposed one-line summary.
- Every Room's "Stands for" line.
- Football Intelligence, problem: the whole Panel.
- Deforestation Detection, problem: "Carbon credits depend on proving a forest still stands."
- Mini C Compiler, problem: the whole Panel.
- Software Factory, problem: the whole Panel.
- Finance Agent, problem: the whole Panel.
