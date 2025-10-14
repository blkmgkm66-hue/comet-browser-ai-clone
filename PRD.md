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
- AC: Route transitions <200ms; fuzzy search returns ranked results.
- TS: Route E2E; search unit tests; performance budget checks.

Week 4: Bottom Catalog & Assistant Chat
- Outcomes: Horizontal agent catalog; drag reorder; assistant chat UI.
- Libs: embla-carousel, react-markdown, prismjs, date-fns.
- CB: Agent registry; agent state indicators; chat message list with streaming.
- AC: Agents install/remove; chat streams; copy/retry actions work.
- TS: Catalog interactions E2E; message streaming tests; snapshot tests.

### Phase 3: Local Agents (Weeks 5-6)

Week 5: Web Scraper, Form Filler, Screenshot
- Outcomes: Scraper with CSS/XPath; Form Filler with type inference; Screenshot tool.
- Libs: cheerio, puppeteer/playwright, csv-writer, sharp.
- CB: Form detection/mapping; screenshot annotations; job queue.
- AC: Extract fields from 5 target sites; fill common forms >90% correctly; capture full/element screenshots.
- TS: Scrape fixtures; form mapping tests; image diff for screenshots.

Week 6: PDF, File Manager, Macro/Workflow MVP
- Outcomes: PDF export; file organizer; macro recorder/replayer; simple workflow runner.
- Libs: pdf-lib, node-cron, glob.
- CB: Recorder hook; event serializer; workflow state machine.
- AC: Generate PDFs with templates; macro replay fidelity >95%; workflow run/stop.
- TS: PDF golden tests; macro replay E2E; workflow state unit tests.

### Phase 4: API Agents (Weeks 7-8)

Week 7: Communication & Research
- Outcomes: Email agent (Gmail/Outlook); Calendar agent; Research agent.
- Libs: googleapis, @microsoft/microsoft-graph-client, node-ical.
- CB: OAuth2 flow UI; credential vault; rate limiter.
- AC: Send/receive email; create events; fetch papers with citations.
- TS: OAuth mock tests; API contract tests; rate-limit retry tests.

Week 8: Business Integrations
- Outcomes: CRM (Salesforce/HubSpot), Analytics (GA4), E-commerce (Shopify/WooCommerce), Finance agent (read-only).
- Libs: respective SDKs; openapi-types; zod for schema validation.
- CB: Connector abstraction; pagination helpers; error classifier.
- AC: Pull lists/entities; create/update minimal records (sandbox); reports render.
- TS: Integration mocks; pagination tests; error handling E2E.

### Phase 5: Builder + RAG (Weeks 9-10)

Week 9: Graph Builder UI and Node Library
- Outcomes: Canvas with pan/zoom, minimap; node palette; inspectors; validation.
- Libs: React Flow/Rete.js, elkjs/dagre; zod.
- CB: Node renderers; port typing; schema-driven inspectors; graph serializer.
- AC: Build sample graphs without errors; auto-layout works; validate highlights.
- TS: Graph serialization tests; auto-layout snapshot tests; validation unit tests.

Week 10: RAG Stack Integration
- Outcomes: Indexing UI; embeddings; vector DB; retrieve/compose/answer nodes.
- Libs: qdrant/chroma-js, sentence-transformers API bindings, pdf.js, cheerio, langchain.
- CB: Background indexer; citation assembler; rerank toggle.
- AC: Index 1k docs <5 min locally; accurate top-k with citations; cached retrieval.
- TS: Indexer throughput tests; retrieval accuracy on labeled set; cache invalidation tests.

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

## 9. Rollout Plan
- Alpha (end of Week 6): Local agents usable; feedback loop.
- Beta (end of Week 10): Builder + RAG complete; select API agents.
- GA (end of Week 12): Marketplace and enterprise basics; documentation published.

## 10. Appendix
- Glossary of node types and agent schema examples.
- Sample manifests and workflow JSONs.
- Links to design tokens and component catalogs.
