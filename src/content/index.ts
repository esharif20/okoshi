import type { Layer, Project, Role, Room, Site } from "./types";

export type * from "./types";
export { validateContent, ROOM_IDS, LAYER_IDS } from "./validate";
export type { Content } from "./validate";

// Every sentence here is listed in docs/COPY.md for approval.

export const site: Site = {
  name: "Eshan Sharif",
  line: "Software engineer. Firmware, computer vision and AI agents.",
  city: "London",
  email: "esharif2004@gmail.com",
  links: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/eshan-sharif" },
    { label: "GitHub", href: "https://github.com/esharif20" },
  ],
};

export const rooms: Room[] = [
  {
    id: "entrance",
    name: "Entrance",
    standsFor: "Where the work starts: the degree, the city, the first job.",
    facts: [
      "BSc Computer Science, First Class Honours.",
      "University of Warwick, 2023 to 2026.",
      "Based in London.",
      "Software Engineer at PA Consulting.",
    ],
  },
  {
    id: "workshop",
    name: "Workshop",
    standsFor: "Engineering at PA Consulting: firmware, devices and the pipelines that ship them.",
    facts: [
      "Embedded C++ on Zephyr RTOS for medical devices.",
      "Signed image capture on a Raspberry Pi.",
      "Deployed to air-gapped servers.",
    ],
  },
  {
    id: "study",
    name: "Study",
    standsFor: "Research and coursework: compilers, pathology and language models.",
    facts: [
      "A C compiler that emits LLVM IR.",
      "Gigapixel slide analysis at the TIA Centre.",
      "LLM data augmentation for sentiment analysis.",
    ],
  },
  {
    id: "lookout",
    name: "Lookout",
    standsFor: "Computer vision: reading a match from one camera and a forest through cloud.",
    facts: [
      "Players tracked at 0.916 IDF1 from broadcast video.",
      "6,545 ha of forest loss flagged from radar.",
      "Won the hardest track at a 25-team hackathon.",
    ],
  },
  {
    id: "hall",
    name: "Great Hall",
    standsFor: "AI agents: systems that do the work and show their working.",
    facts: [
      "A team of coding agents 36% to 61% faster than one model alone.",
      "A finance assistant whose figures come from the ledger, never the model.",
      "LangGraph workflows that log every agent action for audit.",
    ],
  },
  {
    id: "garden",
    name: "Garden",
    standsFor: "Teaching and community outside the day job.",
    facts: [
      "Taught 60+ students to train their first models.",
      "Residential Community Assistant at Warwick.",
    ],
  },
];

export const layers: Layer[] = [
  { id: "firmware", name: "Firmware", skills: ["C", "C++", "Zephyr RTOS", "Raspberry Pi", "Linux"] },
  { id: "languages", name: "Languages", skills: ["C++", "Flex", "LLVM IR", "Python", "TypeScript", "Java", "SQL", "Bash"] },
  {
    id: "services",
    name: "Services",
    skills: ["FastAPI", "React", "PostgreSQL", "Docker", "Jenkins", "Google Cloud", "Cloud Run"],
  },
  { id: "vision", name: "Vision", skills: ["PyTorch", "ONNX", "YOLOv8", "ByteTrack", "HoVer-Net", "TIAToolbox", "Earth Engine"] },
  {
    id: "agents",
    name: "Agents",
    skills: ["LangGraph", "MCP", "Claude Code", "Ollama", "FActScore", "G-Eval", "sub-agent workflows"],
  },
];

export const roles: Role[] = [
  {
    id: "pa-engineer",
    title: "Software Engineer, Software and Controls",
    org: "PA Consulting",
    place: "Cambridge, UK",
    start: "2026-10",
    summary:
      "Firmware and AI tooling for regulated clients. Medical devices on one side, a finance team that keeps its models in-house on the other.",
    points: [
      "Prototypes embedded C++ firmware on Zephyr RTOS for medical devices, where every change has to stand up to regulation.",
      "Joining a finance project that runs language models locally, for a client that does not allow hosted AI tools.",
      "Builds LangGraph agent workflows and is trialling pi.dev to ticket and log each agent action, so every step can be audited.",
    ],
    room: "workshop",
  },
  {
    id: "pa-intern",
    title: "Software Engineer Intern",
    org: "PA Consulting",
    place: "Cambridge, UK",
    start: "2025-06",
    end: "2025-08",
    summary:
      "A camera app that proves a photo has not been changed since it was taken, built end to end and deployed on PA's own air-gapped servers.",
    points: [
      "Built a React Native capture app with a FastAPI backend on a Raspberry Pi. Each image is signed with C2PA at the moment of capture.",
      "Designed tamper detection that re-derives an image's hashes and compares them with its C2PA manifest, backed by Lab colour watermarks.",
      "Deployed to air-gapped on-premises servers, with dependencies pulled through Artifactory and a GitLab cache.",
      "Set up a Jenkins and Docker pipeline to staging, with tests written first and Claude Code working under strict TDD.",
    ],
    room: "workshop",
  },
  {
    id: "medai-education",
    title: "AI Education Officer",
    org: "Warwick Medical AI Society",
    place: "Coventry, UK",
    start: "2025-10",
    end: "2026-06",
    summary: "A six-week course that took non-technical students from no code to training models.",
    points: [
      "Designed and taught the course to 60+ students with no programming background.",
      "Ran hands-on pathology sessions on HoVer-Net, with ready-made Git repos so every session started on code, not setup.",
    ],
    room: "garden",
  },
  {
    id: "warwick-rca",
    title: "Residential Community Assistant",
    org: "University of Warwick",
    place: "Coventry, UK",
    start: "2025-09",
    end: "2026-07",
    summary: "First point of contact for students in halls, alongside the final year.",
    points: [
      "Supported residents' wellbeing and passed concerns to the right university services.",
      "Planned and ran community events for the halls.",
    ],
    room: "garden",
  },
  {
    id: "tia-research",
    title: "Research Intern, Applied AI in Medical Imaging",
    org: "TIA Centre, University of Warwick",
    place: "Coventry, UK",
    start: "2025-08",
    end: "2025-09",
    summary: "A pipeline that turns gigapixel pathology slides into features a model can score.",
    points: [
      "Built a modular slide pipeline in Python with TIAToolbox: tiling, stain normalisation and quality filtering.",
      "Ran HoVer-Net nuclei segmentation over TCGA slides, batching tiles to cut the runtime per slide.",
      "Rolled per-nucleus counts up into slide-level features, scored by ROC AUC and F1 under fixed seeds.",
    ],
    room: "study",
  },
  {
    id: "urss-research",
    title: "Research Assistant, NLP and Synthetic Data",
    org: "University of Warwick (URSS)",
    place: "London, UK",
    start: "2024-07",
    end: "2024-10",
    summary: "Tested whether text written by a language model makes sentiment analysis of module feedback more accurate.",
    points: [
      "Cleaned and merged several sources of student feedback in Python.",
      "Generated extra examples for the rarer sentiment classes and measured the effect on the classifier.",
    ],
    room: "study",
  },
  {
    id: "jazz-edc",
    title: "EDC Programmer Intern",
    org: "Jazz Pharmaceuticals",
    place: "London, UK",
    start: "2024-07",
    end: "2024-09",
    summary: "Code that keeps clinical trial data consistent across several regulated trials at once.",
    points: [
      "Wrote C# functions and automated electronic data capture workflows across concurrent trials.",
      "Connected the capture systems to clinical databases and caught discrepancies between them, cutting manual reconciliation.",
    ],
    room: "entrance",
  },
];

export const projects: Project[] = [
  {
    slug: "football-intelligence",
    title: "Football Intelligence",
    year: 2026,
    summary: "Tactical analysis of a football match from a single broadcast camera. The dissertation.",
    stack: ["PyTorch", "YOLOv8x", "ByteTrack", "ONNX", "FastAPI", "React", "Supabase Postgres", "RunPod"],
    figures: [
      { value: "0.916", measures: "IDF1 for player tracking" },
      { value: "24 FPS", measures: "pipeline speed with ONNX FP16 batching" },
      { value: "0.516 → 0.647", measures: "macro F1 for event classification" },
      { value: "48.7% → 70.2%", measures: "grounded statistics in generated commentary" },
    ],
    panels: [
      {
        kind: "problem",
        heading: "One camera, twenty-two players",
        text: "A broadcast feed is one moving camera that cuts, zooms and loses players off screen. The question was how much tactical analysis that single feed can still support.",
        picture: {
          src: "work/football-intelligence/keypoints.webp",
          alt: "Two diagrams of a football pitch with 32 numbered keypoints. Before a fix, 29 are found and three are marked missing with red crosses. After it, the three are filled in grey.",
        },
      },
      {
        kind: "approach",
        heading: "Track, classify, then explain",
        text: "YOLOv8x and ByteTrack follow every player. A 2.5D CNN with a calibrated cascade labels events. A language model then writes commentary from the numbers, checked by an evaluation harness with FActScore, G-Eval and a 58-question test set judged by Claude Haiku and GPT-4o.",
        figure: { value: "24 FPS", measures: "with ONNX FP16 batching on a RunPod GPU worker" },
        picture: {
          src: "work/football-intelligence/radar.webp",
          alt: "A top-down pitch radar. Pink and blue dots mark the players of two teams, and shaded regions show which team controls each part of the pitch.",
        },
      },
      {
        kind: "result",
        heading: "Fewer invented numbers",
        text: "Tracking reached 0.916 IDF1. Event macro F1 rose from 0.516 to 0.647. Linear probes on Qwen2-VL-7B compared text inputs with chart inputs, to stop invented statistics. Grounding rose from 48.7% to 70.2%.",
        figure: { value: "70.2%", measures: "of stated statistics grounded in the data" },
        picture: {
          src: "work/football-intelligence/probing.webp",
          alt: "Bar chart of macro F1 on four tactical tasks for Qwen2-VL-7B, comparing linear probes on text, visual and combined inputs with prompting. The probes beat prompting on pressing type and compactness trend.",
        },
      },
    ],
    repo: "https://github.com/esharif20/football-analytics-dashboard",
    room: "lookout",
    layer: "vision",
  },
  {
    slug: "deforestation-detection",
    title: "Deforestation Detection",
    year: 2026,
    summary: "Finding forest loss under cloud cover with radar. Won the hardest track at Treefera's hackathon.",
    stack: ["Python", "PyTorch", "Earth Engine", "Sentinel-1", "Docker", "Cloud Run", "MCP"],
    figures: [
      { value: "6,545 ha", measures: "of forest loss flagged" },
      { value: "100,000 ha", measures: "studied over 8 years" },
      { value: "25", measures: "teams at the hackathon" },
    ],
    panels: [
      {
        kind: "problem",
        heading: "The forest is under cloud",
        text: "Carbon credits depend on proving a forest still stands. Optical satellites cannot see through cloud, so loss under cloud cover goes unrecorded and the carbon checks fail.",
      },
      {
        kind: "approach",
        heading: "Radar instead of light",
        text: "Sentinel-1 radar passes through cloud. Eight years of it over 100,000 ha came in through Earth Engine. A Docker API, an MCP server and a dashboard went to Cloud Run, built with Claude sub-agents.",
        figure: { value: "8 years", measures: "of radar over 100,000 ha" },
        picture: {
          src: "work/deforestation-detection/backscatter.webp",
          alt: "Line chart of median PALSAR HV radar backscatter from 2017 to 2024. Stable forest stays near -11.5 dB. Cleared pixels fall away from it, 1.73 dB lower by 2024.",
        },
      },
      {
        kind: "result",
        heading: "Forest loss, found by radar",
        text: "The system flagged 6,545 ha of forest loss and won the hardest of the challenge tracks, against 25 teams.",
        figure: { value: "6,545 ha", measures: "flagged" },
        picture: {
          src: "work/deforestation-detection/change-map.webp",
          alt: "Left: a map of the change in HV radar backscatter from 2017 to 2024, with a red band of loss across the upper right. Right: histograms of that change for 35,709 cleared and 268,477 stable pixels. The cleared pixels sit lower.",
        },
      },
    ],
    room: "lookout",
    layer: "vision",
  },
  {
    slug: "minic-compiler",
    title: "Mini C Compiler",
    year: 2025,
    summary: "A compiler for a subset of C that produces native x86-64 binaries through LLVM.",
    stack: ["C++", "Flex", "LLVM IR", "llc", "clang"],
    figures: [
      { value: "20%", measures: "less IR after optimisation" },
      { value: "120+", measures: "tests" },
    ],
    panels: [
      {
        kind: "problem",
        heading: "From text to a running program",
        text: "Source code is just characters. A compiler has to turn it into a structure it can check, then into instructions a machine can run, and say exactly where the programmer went wrong.",
        picture: {
          src: "work/minic-compiler/program.webp",
          alt: "The fibonacci.c test program in the compiler's repository on GitHub: a MiniC function with declarations, a while loop and an if-else.",
        },
      },
      {
        kind: "approach",
        heading: "Every stage, source to binary",
        text: "A lexer and parser build a full syntax tree. Semantic analysis checks it against scoped symbol tables. Code generation emits LLVM IR for expressions and control flow, and llc and clang link it into x86-64 binaries.",
        picture: {
          src: "work/minic-compiler/grammar.webp",
          alt: "The grammar file in the compiler's repository on GitHub. Its header reads: final LL(k) grammar, left recursion removed, precedence enforced. The production rules follow.",
        },
      },
      {
        kind: "result",
        heading: "Smaller code, tested",
        text: "Constant folding and dead code elimination passes cut the generated IR by 20%, measured across more than 120 tests.",
        figure: { value: "20%", measures: "less IR" },
        picture: {
          src: "work/minic-compiler/tests.webp",
          alt: "GitHub Actions run 35 on the compiler's repository, titled 'finished the project'. Status: Success. The build-and-test job passed in 55 seconds.",
        },
      },
    ],
    repo: "https://github.com/esharif20/minic-compiler",
    room: "study",
    layer: "languages",
  },
  {
    slug: "software-factory",
    title: "Software Factory",
    year: 2026,
    summary: "A team of AI coding agents that plans and builds software faster than one model working alone.",
    stack: ["Claude Code", "Herdr", "JavaScript", "Shell", "git worktrees"],
    figures: [
      { value: "−36% to −61%", measures: "wall time against one Opus session, on three benchmarks" },
      { value: "3 of 3", measures: "benchmarks with hidden-test scores equal to or above the solo run" },
      { value: "−24% to +8%", measures: "cost against the solo run" },
    ],
    panels: [
      {
        kind: "problem",
        heading: "One agent is a bottleneck",
        text: "A single coding agent works one file at a time. Splitting the work between agents usually costs more and breaks more than it saves.",
      },
      {
        kind: "approach",
        heading: "A Lead, lanes and checks",
        text: "A Lead plans the work into lanes that never touch the same files. Builders work in their own git worktrees. Scripts run the tests and merge by exact commit, and a reviewer reads the riskiest changes. One rule was set before any run: the team may cost at most 15% more than one agent. The build log is public.",
        picture: {
          src: "work/software-factory/team.webp",
          alt: "Herdr running the team on a benchmark project. A side panel lists the Lead, four Builders at work, Reviewers and UI Polish. The main pane shows a builder editing a test file and a test run with 30 passes and no failures.",
        },
      },
      {
        kind: "result",
        heading: "Faster at the same quality",
        text: "On three benchmarks the team finished 36% to 61% sooner than one Opus session. It passed as many hidden tests or more each time. Cost ranged from 24% less to 8% more, inside the cap.",
        figure: { value: "−61%", measures: "wall time on the best benchmark" },
        picture: {
          src: "work/software-factory/benchmarks.webp",
          alt: "The Status table from the project's README. Three benchmarks, with time against one Opus session of -61%, -36% and -42%, cost of -14%, -24% and +8%, and hidden-test scores for team and solo.",
        },
      },
    ],
    repo: "https://github.com/esharif20/herdr-software-factory",
    room: "hall",
    layer: "agents",
  },
  {
    slug: "finance-agent",
    title: "Finance Agent",
    year: 2026,
    summary: "A read-only personal finance app that runs on a Mac, with a local model that answers questions about spending.",
    stack: ["Python", "FastAPI", "TypeScript", "React", "SQLCipher", "Ollama", "GSAP"],
    figures: [
      { value: "8 s → <300 ms", measures: "to load the monthly summary" },
      { value: "150+", measures: "merged pull requests" },
      { value: "6", measures: "fictional households in the public demo" },
    ],
    panels: [
      {
        kind: "problem",
        heading: "Bank data is too private for the cloud",
        text: "Budgeting apps send every transaction to someone else's server, and chat assistants invent numbers. A finance tool needs to keep the data at home and get the sums right.",
        picture: {
          src: "work/finance-agent/transactions.webp",
          alt: "The demo app's Transactions screen, under a banner reading 'Synthetic data. Nothing here is real.' Made-up transactions are listed by day, each with a merchant, an amount and a category.",
        },
      },
      {
        kind: "approach",
        heading: "Local, encrypted, read-only",
        text: "Transactions land in a SQLCipher ledger with its key in the Keychain. Rules, corrections and a local Ollama model sort them into categories. Questions in plain English are answered by retrieving the figures from the ledger first. The app can never move money.",
        picture: {
          src: "work/finance-agent/architecture.webp",
          alt: "The demo's architecture page, headed 'How the Assistant answers'. Four cards read: 30 parts, 2 hosts outside the Mac, 1 retry for a reply that misquotes a figure, 0 tools that can pay or move money.",
        },
      },
      {
        kind: "result",
        heading: "Fast, and the numbers add up",
        text: "The monthly summary went from 8 seconds to under 300 ms. Every figure in an answer comes from the ledger, and the public demo runs on six fictional households.",
        figure: { value: "<300 ms", measures: "monthly summary, down from 8 s" },
        picture: {
          src: "work/finance-agent/answer.webp",
          alt: "From the demo site: the question 'How much did I spend on eating out in October?' is answered as £226.40 across 14 payments, up from £189.20 in September, with the ledger query behind it shown beneath.",
        },
      },
    ],
    repo: "https://github.com/esharif20/finance-agent",
    demo: "https://finance-agent-demo-chi.vercel.app",
    room: "hall",
    layer: "services",
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
