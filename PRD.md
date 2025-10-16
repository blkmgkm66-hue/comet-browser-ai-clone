# Ready Robot — Product Requirements Document (PRD)
Version: 1.0
Owner: Ready Robot Core Team
Last Updated: 2025-10-14
## 1. Product Summary
Ready Robot is a desktop browser with an integrated AI assistant and an extensible agent system. The product blends traditional browsing with automation: users can chat with the assistant, run purpose-built agents (local and API-based), and visually compose workflows via a node-graph builder with RAG.
Goals:
- Deliver a fast, minimal Electron-based browser UI with three key surfaces: left navigation, main content, right assistant panel.
- Provide a bottom agent catalog and management system.
- Ship a visual workflow builder for composing multi-step automations.
- Support both local (offline-capable) and API-enabled agents.
- Include a robust RAG stack for knowledge tasks.
Non-Goals (v1):
- Full-fledged general-purpose web browser engine parity with Chrome/Firefox
- Multi-user cloud collaboration (beyond local file-based projects)
## 2. Personas and Use Cases
- Researcher: scrapes websites, summarizes, compiles PDFs.
- Operations Specialist: fills forms, schedules posts, syncs data.
- Analyst: builds workflows combining scraping, RAG, and reporting.
- Developer: extends with custom agents and shares with team.
## 3. System Architecture (High Level)
- Electron shell: main process, renderer, secure IPC, contextIsolation.
- Renderer UI: Vanilla TS + Web Components (or lightweight React), Tailwind CSS.
- Agent Runtime: Node.js worker threads + sandboxed tools.
- AI Layer: Provider adapters (OpenAI, Anthropic, local via Ollama).
- RAG: Local vector DB (Qdrant/Chroma), pluggable embeddings, document loaders.
- Storage: SQLite (better-sqlite3) and JSON project manifests.
## 4. Phased Delivery Plan (12 Weeks)
Each week defines outcomes, acceptance criteria (AC), and testing steps (TS). Libraries (Libs) and Custom Build (CB) callouts specify technology choices and bespoke work.
### Phase 1: Foundation (Weeks 1-2)
Week 1: App Skeleton & Tooling
- Outcomes: Electron app boots, HMR dev, TS strict, lint/test harness.
- Libs: electron, vite, typescript, eslint, prettier, jest, playwright, electron-builder.
- CB: App menu, window controller, secure IPC scaffold.
- AC: App launches; dev reload works; lint/test pass; no TS errors.
- TS: E2E launch test (Playwright); unit tests for IPC guards; lint CI.
Week 2: Layout & Modal System
- Outcomes: Three-panel layout; resizable splitters; modal component system.
- Libs: tailwindcss, radix-ui, motion (framer-motion or motion-one).
- CB: Splitter component; focus trap; z-index manager; animation queue.
- AC: Panels resize; modal stacking; keyboard accessibility.
- TS: Visual regression for layout; a11y checks (axe); keyboard nav tests.
### Phase 2: Navigation, Catalog, Assistant (Weeks 3-4)
Week 3: Left Navigation & Routing
- Outcomes: Collapsible nav; routes (Home, History, Bookmarks, Settings); search.
- Libs: fuse.js, lucide icons.
- CB: Lightweight router; breadcrumb component; stateful nav.
- AC: Nav collapse/expand; search filters; browser history persists; settings CRUD.
- TS: Route transition tests; search relevance benchmarks; nav keyboard accessibility.
Week 4: Agent Catalog & Right Panel Assistant
- Outcomes: Bottom catalog with cards; right-side assistant chat UI; conversation state.
- Libs: marked (for Markdown), highlight.js (code syntax), react-virtualized (optional).
- CB: Agent card grid; infinite scroll or pagination; chat message renderer; state sync (main↔renderer).
- AC: Catalog displays local+API agents; chat persists across reloads; Markdown renders; code blocks syntax-highlighted.
- TS: Catalog sorting/filtering tests; chat E2E (send, receive, Markdown); message history integrity.
### Phase 3: Agents & Core Tools (Weeks 5-6)
Week 5: Local & API Agent Architecture
- Outcomes: Worker-based local agent runner; API agent adapter; tool registration.
- Libs: node:worker_threads, axios, zod for schema validation.
- CB: Agent registry (manifest JSON → runtime); sandbox enforcement (permissions); tool dispatch layer.
- AC: Local agent runs in worker; API agent calls external endpoint; tool invocation logged; output JSON validated.
- TS: Unit tests for agent lifecycle; mocked API agent responses; permission denial tests.
Week 6: Core Tools (Scrape, PDF, Screenshot)
- Outcomes: Web scraping, PDF generation, screenshot, email sender agents.
- Libs: cheerio, puppeteer/playwright, pdf-lib, nodemailer.
- CB: Scraper with rate limits; PDF assembler; screenshot tool; email template renderer.
- AC: Scraper respects robots.txt and rate limits; PDF includes bookmarks/TOC; screenshot includes full page/viewport; email sends HTML + attachments.
- TS: E2E scraping (mock server); PDF structure validation; screenshot visual regression; email delivery stub.
### Phase 4: Workflow Builder (Weeks 7-8)
Week 7: Node-Graph Editor
- Outcomes: Drag-drop graph builder; node types (agent, data, control flow); connections.
- Libs: React Flow or Rete.js, elkjs/dagre for layout.
- CB: Node palette; edge validation (type checking); zoom/pan controls; minimap.
- AC: Add/remove nodes; connect outputs to inputs; graph serializes to JSON; undo/redo.
- TS: Graph manipulation tests; edge routing correctness; serialization round-trip.
Week 8: Workflow Execution Engine
- Outcomes: Run button executes workflow; logs; error handling; parallel node execution.
- Libs: p-queue, bottleneck (for concurrency).
- CB: Execution scheduler; dependency resolver; retry/backoff logic; progress UI.
- AC: Workflow runs in correct order; parallel nodes execute concurrently; errors caught and logged; pause/resume works.
- TS: Workflow execution correctness; concurrency limits; retry behavior; error propagation.
### Phase 5: RAG & Advanced Features (Weeks 9-10)
Week 9: RAG System
- Outcomes: Document ingestion; vector embedding; similarity search; context injection into prompts.
- Libs: qdrant-client or chromadb, sentence-transformers (or OpenAI embeddings API), pdf.js, cheerio.
- CB: Ingestion pipeline (PDF, HTML, TXT); chunking strategy; embedding job queue; query builder.
- AC: Upload docs; index vector store; search returns relevant chunks; assistant answers with citations.
- TS: Ingestion correctness (PDF → chunks); embedding accuracy (benchmark set); recall/precision metrics.
Week 10: Macro Recorder & Advanced Tools
- Outcomes: Record user interactions; replay; cron scheduler; API integration tool.
- Libs: node-cron, axios interceptors, deep-copy.
- CB: Event capture (clicks, forms); playback engine; scheduler UI; API config wizard.
- AC: Record a sequence; replay deterministically; schedule workflow; API tool calls external service.
- TS: Playback correctness; cron trigger tests; API tool integration (mock endpoints).
### Phase 6: Performance, UX, Enterprise (Weeks 11-12)
Week 11: Responsive & Performance
- Outcomes: Mobile/tablet responsiveness; WCAG 2.1 AA; code-splitting; startup <2s.
- Libs: @axe-core/playwright, webpack-bundle-analyzer, workbox (for caching in web views).
- CB: Route-level lazy-loading; memory budget guardrails; profiler scripts.
- AC: Lighthouse a11y >90; TTI <2.5s; mem footprint within target.
- TS: A11y automated checks; performance CI; memory regression tests.
Week 12: Marketplace, Sharing, Enterprise
- Outcomes: Agent marketplace (local file manifest), sharing, versioning; SSO and team basics.
- Libs: keytar for secrets, openid-client for OAuth/OIDC, semver.
- CB: Signed manifests; import/export; role/permission model; audit logs.
- AC: Install/update agents; SSO login; team roles; audit trail exports.
- TS: Manifest signature tests; SSO flow integration tests; RBAC unit/E2E.
## 5. Detailed Acceptance Criteria Matrix
For every milestone M1–M6:
- Functional: features operate as described and persist state across restarts.
- UX: interactions complete within performance budgets; a11y compliant.
- Reliability: graceful error handling; retries/backoff; offline mode where applicable.
- Security: contextIsolation on; CSP enforced; secrets encrypted; least privilege.
- Observability: logs with redaction; basic telemetry opt-in; crash reports.
## 6. Testing Strategy
- Unit: Jest + Testing Library for components, utils, agents.
- Integration: Playwright for UI flows; API mocks; visual regression.
- Performance: Lighthouse (embedded pages), custom timers, memory profiling.
- Security: dependency scanning; IPC fuzz tests; permission prompt coverage.
- Data: deterministic fixtures for scraping, RAG ground-truth set for recall/precision.
## 7. Open-Source Libraries & Custom Builds
- See weekly sections for Libs and CB. Master list:
  
- UI/UX: Tailwind, Radix UI, lucide icons, framer-motion/motion-one
  
- Graph: React Flow/Rete.js, dagre/elkjs
  
- Agents: cheerio, puppeteer/playwright, pdf-lib, sharp, node-cron
  
- AI: OpenAI/Anthropic SDKs, Ollama, langchain, sentence-transformers
  
- RAG: qdrant/chroma, pdf.js, cheerio
  
- Storage: better-sqlite3, Dexie (if IndexedDB), keytar
  
- Tooling: vite, eslint, prettier, jest, playwright, electron-builder
Custom Build Highlights:
- Splitter, Modal, Router, Agent Registry, Provider Adapters, Workflow Engine, Macro Recorder, Credential Vault, Manifest/Schema Validators, RAG Indexer.
## 8. Risks & Mitigations
- Risk: API rate limits -> Mitigation: queue + backoff + caching.
- Risk: LLM cost overruns -> Mitigation: token/cost meter, local model options.
- Risk: Performance regressions -> Mitigation: budgets, CI checks, profiling.
- Risk: Security of secrets -> Mitigation: keytar, encryption, secure IPC, permissions.
- Risk: Legal/ToS scraping -> Mitigation: robots.txt respect, rate limits, user warnings.
## 9. AI Assistant Superpowers: Full Browser Automation Scope
The integrated AI assistant goes beyond chat—it has comprehensive browser control and automation capabilities enabling autonomous task execution:

### Navigation & Page Control
- Navigate to URLs, back/forward through history
- Refresh pages and manage multiple tabs
- Scroll to specific elements or positions
- Wait for page load, element visibility, or custom conditions
- Handle popups, alerts, confirms, and prompts

### Element Interaction
- Click buttons, links, and interactive elements
- Fill forms with text, numbers, dates, files
- Select checkboxes, radio buttons, dropdowns
- Drag and drop elements
- Hover for tooltips and dynamic content
- Execute keyboard shortcuts and key combinations

### Data Extraction & Scraping
- Extract text content from specific elements or entire pages
- Parse structured data (tables, lists, JSON, XML)
- Capture screenshots (full page, viewport, specific elements)
- Download files and attachments
- Monitor changes and scrape dynamic content
- Respect robots.txt and implement polite scraping with rate limits

### Form Automation
- Auto-fill complex multi-step forms
- Handle conditional logic and dynamic fields
- Upload files and documents
- Submit forms and handle validations
- Save and reuse form templates

### Authentication & Session Management
- Store and manage credentials securely (via keytar)
- Handle OAuth flows and SSO
- Maintain session state across workflows
- Auto-login to saved sites

### Multi-Step Workflows
- Chain actions into reusable workflows
- Implement conditional logic and loops
- Handle errors gracefully with retry logic
- Execute workflows on schedules (cron)
- Parallel execution for independent tasks

### Content Manipulation
- Modify DOM elements for testing or automation
- Inject custom JavaScript or CSS
- Manipulate browser storage (cookies, localStorage)
- Simulate user behavior patterns

### Intelligent Automation
- Natural language to action translation
- Context-aware suggestions for next steps
- Learn from user corrections and preferences
- Adaptive retry strategies
- Smart wait times based on page behavior

### Data Processing & RAG Integration
- Process scraped data through RAG for insights
- Generate summaries and reports
- Cross-reference multiple sources
- Build knowledge bases from browsed content
- Answer questions based on scraped data

### Macro Recording & Playback
- Record user interactions as reusable macros
- Edit recorded macros with visual builder
- Parameterize macros for different inputs
- Share macros with team

### API & External Tool Integration
- Call external APIs with authentication
- Transform and map data between systems
- Trigger webhooks based on browser events
- Integrate with popular tools (Slack, email, databases)

### Safety & Compliance
- Sandbox execution with permission controls
- Rate limiting and backoff strategies
- User confirmation for sensitive actions
- Audit logs for all automation
- Respect site terms of service

### Performance & Reliability
- Parallel execution within resource limits
- Progress tracking and cancellation
- Checkpoint/resume for long workflows
- Memory-efficient handling of large datasets
- Graceful degradation on errors

These capabilities transform the assistant from a chat interface into a fully autonomous browser automation engine, enabling users to describe tasks in natural language and have the AI execute complex multi-step workflows with minimal supervision.
## 10. Rollout Plan
- Alpha (end of Week 6): Local agents usable; feedback loop.
- Beta (end of Week 10): Builder + RAG complete; select API agents.
- GA (end of Week 12): Marketplace and enterprise basics; documentation published.
## 11. Appendix
- Glossary of node types and agent schema examples.
- Sample manifests and workflow JSONs.
- Links to design tokens and component catalogs.
