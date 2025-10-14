# Ready Robot — Product Requirements Document (PRD)

## 10. Open-Source Resources, Custom Builds, and Integration Architecture (Browser + AI Assistant + Agent Builder + RAG)

This section enumerates required open-source components, what we must custom-build, and a concrete integration plan that ties together: the browser shell, AI assistant, drag-and-drop agent builder (node graph), visualization, and Retrieval-Augmented Generation (RAG). It also specifies UI behaviors for a modal agent-builder workspace, an agent dropdown/selector, palette, and the distinction between local (no external APIs) vs API-enabled agents. Finally, it defines how the AI assistant gains full programmatic access to both the browser and the agent builder to automate construction and execution of workflows.

### 10.1 Open-Source Resources and Libraries

- Application Shell / Framework
  - Electron (desktop shell) or Tauri (Rust core, smaller footprint) for cross-platform desktop.
  - Vite + React (UI runtime) or SvelteKit (lighter) for renderer front-end.
  - State: Redux Toolkit, Zustand, or Recoil for app/agent graph state.
- UI Components and Styling
  - Tailwind CSS + headless UI for accessible primitives (Dialog, Menu, Listbox) used in modals/dropdowns.
  - Radix UI primitives for accessible, composable components (Popover, Tabs, DropdownMenu) used in builder palette/inspector.
  - Framer Motion or Motion One for transitions and drag/hover animations.
- Graph/Node Editor (Agent Builder Visualization)
  - React Flow or Rete.js for node-based graph editor, edges, minimap, zoom/pan, connection validation, custom node renderers.
  - Dagre or Elk.js for auto-layout of DAGs.
- Workflow Runtime / Orchestration
  - n8n (reference) and/or LangChain Expression Language (LCEL) concepts; we will borrow patterns, not embed the server.
  - Temporal (optional, later) for durable, resumable workflows.
- LLM / Tooling / Agents
  - OpenAI/Anthropic SDKs (optional) for API agents.
  - Open-source LLM inference: Ollama (local), llama.cpp, vLLM (server), text-generation-webui connectors.
  - LangChainJS or LangGraphJS for tool wiring, agent executors, and RAG chains.
  - OpenAI function calling JSON schema or Toolformer-like tool spec via JSON Schema.
- RAG Stack
  - Embeddings: BGE, E5, or all-MiniLM via sentence-transformers; for local: Instructor-xl, nomic-embed-text (via Ollama) when feasible.
  - Vector DB: Qdrant (local-first), Chroma (simple local), or Weaviate (optional managed). Client libraries in JS/TS.
  - Document loaders/parsers: LangChain document loaders; PDF parsing via pdf.js and/or unstructured.io (optional), HTML parsing via cheerio.
  - Chunking/splitting: LangChain text splitters.
- Browser Automation / Web Control
  - Playwright (preferred) or Puppeteer for headless/embedded automation; use Electron/Chromium DevTools Protocol for in-app control.
  - DOM capture: Readability.js for article extraction; Lighthouse (optional) for audits.
- Storage / Persistence
  - SQLite via better-sqlite3, or IndexedDB for local user data; Dexie.js if using IndexedDB.
  - File-based project workspaces using JSON/YAML manifests for agents and graphs.
- Security and Sandboxing
  - Electron contextIsolation, secure IPC; DOMPurify for sanitizing HTML in previews.
- Telemetry and Logs
  - Pino or Winston logger; OpenTelemetry (optional) for tracing.

### 10.2 What We Must Custom-Build

- Agent Model and Manifest
  - Unified Agent schema (JSON) describing: id, name, type (local vs API), inputs/outputs, tools, credentials requirements, and UI affordances.
  - Agent capability interface for tool registration (browser tools, file tools, RAG tools) and permission prompts.
- Graph Node Library
  - Custom node types: Input, Output, Branch/Condition, LLM Call, Tool Call, Browser Action (Navigate/Click/Fill/Wait/Screenshot), Scrape/Extract, Data Transform, RAG Retrieve, RAG Index, Loop/Map, Error Handler, Subgraph/Composite Agent, Trigger nodes.
  - Node inspectors (right panel) with schema-driven property editors (JSON Schema -> form renderers with Zod validation).
- Workflow Engine (in-app)
  - Lightweight, in-process executor that walks the directed acyclic graph (DAG), supports async steps, retries, timeouts, cancellation, and variable/context passing.
  - Deterministic execution logs, step snapshots, and replay; hooks for tool calls and rate limiting.
- Modal Agent Builder Workspace
  - Fullscreen modal with: canvas (React Flow/Rete), left palette, top toolbar, right inspector/logs, bottom console/run output.
  - Import/export agents as JSON; versioning; diff view between versions.
- AI Assistant Control Layer
  - Tool-using assistant that can: create/edit nodes, wire edges, set properties, run the workflow, and open browser contexts—via internal tool APIs.
  - Guardrails: confirmation prompts for destructive changes; dry-run and plan preview.
- Agent Catalog and Dropdown Selector
  - Bottom bar segmented list (Local vs API), plus global dropdown in header to switch active agent.
  - Badges for API usage, cost estimate, and permission state.
- Credentials and Secrets Vault
  - Local encrypted storage for API keys; granular scoping to agents/workspaces; runtime injection via environment bindings.
- RAG Pipelines
  - Background indexer for user-selected sources (files, URLs, notes). Chunking, embedding, metadata tagging, versioned indexes.
  - Query pipeline nodes: retrieve->rerank(optional)->compose context->LLM call.
- Browser Control Tools
  - Safe wrappers for Playwright/CDP exposed as graph tools and assistant-callable functions: open, goto, click, type, select, wait, scrape, extract, download, upload.

### 10.3 Integration Architecture and Data Flows

- High-Level Modules
  - UI Shell: Navigation, bottom agent catalog, right assistant panel, modal builder.
  - Agent Core: Agent registry, graph store, workflow executor, tool registry, credentials vault.
  - RAG Service: Indexers, vector DB client, retriever, embeddings provider abstraction.
  - Browser Control: Embedded Chromium context + automation API.
- Data Contracts
  - Agent manifest JSON; Graph JSON (nodes, edges, metadata); Run record JSON (inputs, outputs, logs); Tool spec JSON Schema.
  - Credential reference tokens (never store raw keys in graph); runtime injection.
- Execution Path
  1) User selects agent from dropdown or bottom catalog.
  2) If prebuilt: manifest loads graph; if custom: open modal builder.
  3) Assistant can propose a plan, generate or modify the graph (tool calls), and request confirmation.
  4) On run: executor instantiates tools (browser, RAG, LLM), validates inputs, executes nodes, streams logs to UI.
  5) Outputs are collected and shown in assistant panel and run console; users can save as new version or export.
- Permissions and Safety
  - Capability prompts when an agent first requests browser control, file access, or external APIs; remember decisions per agent.
  - Sandboxed execution contexts; network egress toggles for local-only mode.

### 10.4 UI/UX Specifications

- Agent Dropdown Selector
  - Single selector in header: categories (Local, API); search; favorites; recent.
  - Each item shows: name, icon, type badge (Local/API), short description, permissions state.
- Modal Agent Builder
  - Opens centered, fullscreen (esc or Close returns to prior view). Restores last canvas view and unsaved changes detection.
  - Layout:
    - Left: Palette with groups (Core, Control Flow, Browser, Data, LLM, RAG, Integrations, Utilities).
    - Center: Canvas with grid, pan/zoom, snap-to-grid, auto-layout option, selection marquee, mini-map.
    - Right: Inspector with property forms, variable bindings, validation messages; tabs for Node, Run Logs, Schema.
    - Top: Toolbar (Run, Stop, Save, Version, Auto-Layout, Validate, Zoom, Share, Export JSON).
    - Bottom: Console with streaming logs, token/cost meter for API runs, and warnings.
- Local vs API Agents
  - Local agents: only local tools (browser, filesystem, local LLM via Ollama); no external network by default.
  - API agents: can declare external providers (OpenAI, Anthropic, search APIs, Slack, etc.); per-provider credentials required.
  - Mixed mode allowed if user enables network egress for a local agent.
- Palette and Node Config
  - Drag from palette to canvas; drop opens quick-config; edges only connect compatible ports (type-checked).
  - Validation shows inline errors; “Validate” compiles the graph schema and reports missing fields.

### 10.5 Assistant Access to Builder and Browser

- Assistant Tooling
  - Expose first-class tool methods: create_node, connect, set_prop, delete_node, run_workflow, open_modal_builder, select_agent, open_url, click, fill, wait, extract, index_docs, query_rag.
  - All assistant actions go through capability checks and are logged with an undo stack.
- Autonomous Build Flow (opt-in)
  - User: “Create a scraper that visits X, extracts Y, and saves CSV.”
  - Assistant: Drafts plan -> builds nodes/edges -> validates -> asks confirm -> runs test -> presents results -> offers save as prebuilt agent.
- Collaboration
  - Live co-edit mode where the assistant’s edits are highlighted; user can accept/reject changes.

### 10.6 RAG Design

- Indexing
  - Sources: local files, URLs, clipboard, notes. MIME-aware loaders. Chunking by token length with overlap. Metadata: source, author, timestamp, tags.
  - Embeddings backend is pluggable: local (Ollama/nomic) or API (OpenAI, Cohere). Batch jobs with progress UI.
- Retrieval
  - Vector search top-k with score threshold; optional rerank (Cohere Rerank or local Cross-Encoder) when enabled.
  - Context assembly: citation snippets with token budgeting; deduplication; safety filters.
- Graph Nodes
  - RAG Index node (build/update), RAG Retrieve node (query), RAG Compose node (format prompt/context), RAG Answer node (LLM call).
- Caching
  - Per-graph cache of retrieval results and LLM responses; invalidation on data changes.

### 10.7 Persistence, Projects, and Versioning

- Project Workspaces
  - Each project contains agents, graphs, credentials references, and indexes. Stored under a workspace folder.
- Version Control
  - Semantic versioning for agents; diff view of graphs; rollback.
- Import/Export
  - JSON export for agents and graphs; bundle with assets; signed manifests (optional) for marketplace.

### 10.8 Security, Privacy, and Offline Mode

- All secrets encrypted at rest; least-privilege capability requests; per-agent network toggle.
- Offline-first: local LLM and vector DB enable full functionality without internet when desired.
- Audit logs for tool usage; redaction of PII in logs where possible.

### 10.9 Implementation Plan Summary (Milestones)

- M1: Core shell and UI (left nav, right assistant panel, bottom catalog, modal system). Choose Electron/Tauri + React + Tailwind + Radix.
- M2: Graph editor integration (React Flow), basic node library (Browser, LLM, Data, Control Flow), executor MVP with logs.
- M3: Assistant tool interface wired to builder and browser; capability prompts; undo/redo; run/stop controls.
- M4: RAG service (Qdrant/Chroma), indexing UI, retrieve/compose/answer nodes; local embeddings backend via Ollama.
- M5: Agent catalog with Local/API distinction, credentials vault, manifest schema, import/export.
- M6: Stability pass: validation, auto-layout, error handling, caching, tests, telemetry, and docs.

This section defines the complete resource map and integration approach needed to implement the Ready Robot browser with an AI assistant, agent builder, RAG, and a cohesive visualization experience.
