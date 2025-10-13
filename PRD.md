# Agentic Browser Automation Platform — Product Requirements Document (PRD)
## 1. Product Overview and Goals
The Agentic Browser Automation Platform is a modular desktop browser built on Chromium/Electron that embeds a multi-model AI assistant and agentic automation engine. It enables users and developers to compose, run, and share automated browsing workflows that combine deterministic steps with reasoning-driven actions.
### Primary Design Goal: Extreme Ease of Use
This platform prioritizes **extreme ease-of-use** above all else. Every interaction, from basic browsing to advanced agent creation, must be intuitive for beginners while remaining powerful for experts. The interface should eliminate technical barriers and make AI automation accessible to non-technical users through visual, template-driven workflows.
### Goals
- Deliver a reliable Electron-based browser with modern navigation and isolation primitives
- Provide an integrated, multi-model AI assistant for reasoning, extraction, and action planning
- **Integrate web search seamlessly** through embedded search nodes and browser navigation capabilities
- Leverage best-in-class open-source libraries for agentic workflows, graph visualization, and workflow automation
- Offer a **drag-and-drop visual workflow builder** and marketplace for sharing automations and agents
- **Provide extensive template gallery** with prebuilt agents and customization options
- Ensure strong security via sandboxing, permissions, an API key vault, and auditability
- Build a sustainable ecosystem with a sandbox for testing and monetization options
- **Prioritize GraphRAG tool simplicity** for knowledge management workflows
### Non-Goals (MVP)
- Full mobile clients (focus on desktop: macOS, Windows, Linux)
- Server-side hosted browser farms (local-first with optional remote runners later)
- Custom development of workflow engines, graph databases, or visualization frameworks (leveraging open-source solutions instead)

## 2. Integrated Web Search Capabilities
### 2.1 Browser as Search Tool
The browser acts as an integrated web search tool, eliminating the need for separate search utilities:
- **Embedded Search Nodes**: Workflow steps can invoke web searches directly within the browser context
- **Smart Search Integration**: Address bar includes intelligent search suggestions and quick actions
- **Search Result Processing**: Built-in capabilities to extract, analyze, and act on search results
- **Multi-Engine Support**: Integrate multiple search engines (Google, Bing, DuckDuckGo, etc.) through unified interface
- **Context-Aware Search**: AI assistant can perform searches based on current page context and user intent
### 2.2 Search Workflow Integration
- **Search-to-Action Pipelines**: Convert search results directly into actionable workflow steps
- **Result Filtering**: Advanced filtering and ranking of search results based on user-defined criteria
- **Batch Search Operations**: Perform multiple related searches and aggregate results
- **Search History & Analytics**: Track and analyze search patterns for workflow optimization

## 3. UI/UX Requirements for Maximum Usability
### 3.1 Core UX Principles
#### Extreme Simplicity
- **Zero Learning Curve**: New users should accomplish basic tasks within 30 seconds
- **Progressive Disclosure**: Advanced features remain hidden until needed
- **Plain Language Interface**: All UI text uses conversational, non-technical language
- **Visual Feedback**: Immediate visual confirmation for all user actions
#### Template-First Approach

---

## 4. Tiered Agent and Feature Architecture
This section defines product tiers, agent menu structure, feature gates, API key policies, GraphRAG availability, and monetization/upsell logic for engineering and business alignment.

### 4.1 Tiers Overview
- Free (Starter):
  - Local-first, privacy-preserving defaults. No bundled paid LLM usage by us.
  - Core browser automation, basic templates, limited runs/day, community support.
  - Models: local-only (LLM, rerankers, OCR) via user-installed backends (Ollama/LM Studio) and free third-party APIs the user supplies.
- Pro (Individual/Team):
  - Adds cloud “smart/AI” mode with usage-based metering, higher run limits, priority execution.
  - Advanced templates, scheduling, background agents, GraphRAG sync, API credits wallet.
  - Admin controls for key vault, policy, and audit logs (single user or small team).
- Custom (Enterprise):
  - SSO/SAML, SCIM, policy engine, private model routing, VPC connectors, on-prem runners.
  - Unlimited scale by contract, custom SLAs, dedicated support, invoice billing.

### 4.2 Agent Menu and Toggles
- Prebuilt Agent Menu (examples):
  - Researcher, Web Scraper, Form Filler, Lead Finder, Outreach, Meeting Notes, QA Tester, Price Tracker, Data Extractor, Recruiter Sourcing, Competitor Monitor, Support Triage.
- Per-Agent Mode Toggle:
  - Local-only: executes with on-device models/tools only; no network calls to paid LLMs. Strict offline mode supported where feasible.
  - Smart/AI: enables cloud model routing, tool augmentation (web search, vision, code), and retrieval. Can fall back to local when quota exhausted (configurable).
- Defaults by Tier:
  - Free: default Local-only (Smart disabled by default; user can enable if they add keys).
  - Pro: default Smart/AI with metered billing; Local-only available as a privacy mode.
  - Custom: policy-controlled default; org admins can lock mode per agent.

### 4.3 Feature Gating Matrix (examples; enforce via flags and server checks)
- Core execution: Free (basic), Pro (priority + concurrency 3), Custom (priority + configurable concurrency, remote runners).
- Workflow builder: Free (basic), Pro (advanced nodes, schedulers), Custom (custom nodes, governance).
- Templates: Free (starter set), Pro (full catalog + premium), Custom (org templates + private catalog).
- GraphRAG: Free (local index only, size cap), Pro (cloud sync + multi-index + embeddings store), Custom (bring-your-own graph DB, VPC connectors).
- Model routing: Free (local + user-provided free APIs), Pro (managed model router + usage policies), Custom (private endpoints + fine-tuned models).
- API key vault: Free (local encrypted vault), Pro (cloud sync + rotation + scopes), Custom (HSM/KMS integration, scoped sharing).
- Data limits: Free (N pages/run, M runs/day), Pro (higher limits), Custom (contracted).
- Collaboration: Free (export/import), Pro (team share, roles), Custom (SSO, audit, DLP).
- Support: Free (community), Pro (email/chat SLA), Custom (dedicated CSM).

### 4.4 API Key Usage Policies
- Storage:
  - Free: keys stored locally, encrypted at rest; never uploaded by default.
  - Pro: optional cloud sync to encrypted vault; device-bound secrets; rotation prompts.
  - Custom: enterprise KMS/HSM support; role-based access; just-in-time decryption.
- Scope and Least Privilege:
  - Keys scoped per agent/workflow; deny wildcard scopes by default; approval prompts for escalations.
- Execution Rules:
  - Local-only mode must hard-block outbound calls to paid endpoints unless explicitly allowed per run.
  - Smart/AI mode uses org/model router with guardrails: rate limits, budget caps, per-agent quotas.
- Observability and Audit:
  - Per-call logs include model, tokens, cost, latency, tool usage; exportable.
  - Redaction of sensitive fields in logs by default.

### 4.5 GraphRAG Availability by Plan
- Free:
  - Local-only graph indexing of user-specified folders/files; size cap; single workspace.
  - Basic retrieval in agents; no cross-workspace joins.
- Pro:
  - Cloud-synced embeddings/graph store; multi-workspace, scheduled refresh; semantic joins across sources.
  - Visualization enhancements; query templates; cost-aware retrieval planning.
- Custom:
  - BYO graph DB (Neo4j/Azure Cosmo/Neptune) and private vector stores; VPC peering.
  - Policy-based PII handling; field-level access controls; audit exports.

### 4.6 Monetization and Upsell Logic
- Pricing Levers:
  - Pro subscription (monthly/annual) includes monthly AI credits; overage billed pay-as-you-go.
  - Add-ons: advanced templates pack, team seats, higher concurrency, managed GraphRAG capacity.
- In-product Upsell:
  - Contextual modals when a gated feature is invoked; show benefit, limits, and clear pricing.
  - Soft wall for Free: allow limited trial of Smart/AI per week before requiring Pro.
  - Hard wall for GraphRAG cloud sync from Free; prompt to upgrade or stay local.
- Cost Controls:
  - Per-agent budgets, run-level cost estimates, and auto-pause on threshold.
  - Usage digest emails; admin-level monthly budget caps and alerts.

### 4.7 Rationale and Alignment
- Ease-of-use: simple tier defaults and a per-agent Local/Smart toggle minimize setup complexity.
- Cost control: strict local-only paths for Free, budgets/quotas for Pro/Custom, and auditability.
- Scalability: feature flags and server checks enable progressive unlock from individual to enterprise.
- PRD alignment: honors visual builder/templates focus, GraphRAG simplicity-first, and local-first posture with optional smart augmentation.

### 4.8 Engineering Notes
- Implement feature flags in renderer and main process; server verifies entitlements for cloud calls.
- Central capability registry powering UI gating, node availability, and error messaging.
- Mode toggle propagates to planner, tool router, and network policy layer.
- Add tests for: gating, budget enforcement, local-only blocking, and fallback behavior.

### 4.9 Business Notes
- Define SKUs: Free, Pro (Solo/Team), Custom (Enterprise) with seat-based pricing for team tiers.
- Publish clear fair-use limits; communicate with in-app meters and preflight cost estimates.
- Offer 14-day Pro trial with limited AI credits to showcase Smart/AI benefits.

---

### Roadmap Milestones
- Security Implementation: Process isolation and sandboxing
- Cytoscape.js Setup: Implement basic graph visualization components
- AI Router: Add multi-model AI support with context tools
- Milestone 2 — Workflow Builder (Weeks 7-9): n8n editor, custom nodes, LangGraph bridge, live viz, template gallery, palette
- Milestone 3 — Advanced Features (Weeks 10-12): Neo4j integration (optional), analytics, advanced AI, hardening, GraphRAG simplification, modal builder
- Milestone 4 — Marketplace (Weeks 13-14): community workflows, templates, sharing, versioning, customization, onboarding
- Milestone 5 — Polish & Release (Weeks 15-16): UI polish, performance, docs, testing, agent management

### Release Criteria and Metrics
- Usability testing: 90% of new users can create basic automation within 5 minutes
- Template coverage: 50+ high-quality templates covering major use cases
- Integration success: LangGraph (multi-step agents), n8n (10+ browser nodes), Cytoscape.js (100+ nodes), Neo4j (efficient relationships)
- Stability and security: No P0 issues; regression suite; performance targets met
- Adoption and usability: 95% task completion; 80% create at least one workflow in week one

---

**Commit message: Add tiered agent/feature architecture: tiers, agent toggles, gating, API key policy, GraphRAG plan availability, monetization/upsell, rationale, and engineering/business notes.**
