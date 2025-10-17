# Ready Robot — Product Requirements Document (PRD)

## 9. Browser LLM Superagent (AI Assistant Superpowers)
A comprehensive NL-to-Action system that plans, executes, and validates multi-step browser automations with safety, extensibility, and user control.

### 9.1 NL-to-Plan Engine
- Natural-language intent → structured plan (tasks, sub-tasks, preconditions, tools, success criteria)
- Deterministic planning schema (YAML/JSON) with explicit inputs/outputs per step
- Hybrid planner: model-based suggestion + rules/templates for common patterns (search, scrape, fill, download)
- Constraint-aware planning: rate limits, auth boundaries, robots.txt, data residency, quotas
- Plan revision loop: re-plan on site changes, failed selectors, or permission denials

### 9.2 Tool Bus and Execution Runtime
- Tool registry with typed contracts: browser DOM tools, network tools, file I/O, vision/OCR, RAG, data transforms
- Sandboxed execution via worker threads + permission-scoped capabilities per plan
- Action DSL: click, type, select, upload, wait, evaluate, fetch, parse, extract, scroll, screenshot, download
- Structured outputs and events: START, STEP_OK, STEP_RETRY, STEP_FAIL, YIELD_DATA, SECURITY_BLOCKED
- Timeouts, retries, backoff; exponential + jitter; circuit breaker for flaky steps

### 9.3 Multi-Step Reasoning, Memory, and State
- Short-term run memory: DOM snapshots, extracted data, prior selectors, cookies/session (scoped)
- Long-term project memory: site playbooks, reusable selectors, form profiles, proven workflows
- Evidence tracking: each step stores inputs, outputs, artifacts (screenshots, HTML clips)
- Plan-state machine: PENDING → RUNNING → PAUSED → AWAITING_CONFIRMATION → COMPLETED/FAILED

### 9.4 User Feedback and Control Loop
- Inline confirmations for sensitive actions (submit, purchase, message)
- Live run console: step logs, diffs, screenshots, DOM targets, network traces
- One-click corrections: “Use this selector”, “Skip step”, “Replace value”, “Try alternative path”
- Post-run review: human-in-the-loop accept/annotate, save as Macro/Agent

### 9.5 Security, Privacy, and Compliance
- Principle of least privilege per plan; capability grants expire post-run
- Policy engine: robots.txt, site ToS tags, domain allow/deny lists, CSP-aware actions
- Secret handling: keytar-backed vault; no model exposure of secrets; redaction in logs
- Data boundaries: PII tagging, export controls, on-device only modes, consent prompts
- Audit trail: immutable run log, diff of page interactions, data lineage for outputs

### 9.6 Extensibility and Integrations
- Plugin API for custom tools (TypeScript), with manifest describing permissions and UI
- Provider adapters (OpenAI/Anthropic/Local) and pluggable embeddings/vision
- Webhook triggers and event subscriptions (onExtract, onSubmit, onDownload)
- External systems: Slack/Email/DB/Sheets/Notion via prebuilt connectors
- Macro → Agent promotion path with parameterization and schema validation

### 9.7 System Prompt and Reasoning Guardrails
- Stable system prompt with: role, objectives, safety rules, tool usage rubric, output schema
- Few-shot exemplars for: scraping tables, robust form fill, pagination, file download, auth guard
- Output contracts: always produce structured plan JSON + concise rationale
- Self-checklist before executing steps: selector existence, visibility, side-effect awareness
- Refusal rules: auth walls, payments, messaging without explicit user confirmation

### 9.8 Implementation Milestones (Weeks 7–10)
- Week 7: Tool bus v1, action DSL, typed results, event stream; basic planner templates
- Week 8: Selector strategy (text, CSS, XPath, role-based), retry policies, screenshot/evidence store; live console UI
- Week 9: Security policy engine, capability grants, secret vault, redaction; user confirmation modals
- Week 10: Memory store (site playbooks, reusable selectors), macro promotion, connectors (Slack/Email/Sheets)

### 9.9 Acceptance Criteria
- Given a natural-language task (e.g., “Find top 5 pricing pages, extract tables, export CSV”), the planner emits a valid plan JSON with tools, constraints, and success metrics
- Execution completes end-to-end on at least 3 heterogeneous sites, with evidence and resilient retries
- Sensitive steps trigger confirmation; declines halt safely with audit record
- Policies enforce robots.txt and domain allowlist; secrets not leaked in logs or prompts
- Macro promotion generates an editable agent manifest with parameterized inputs and permissions
- All runs produce an immutable audit log and downloadable artifacts (CSV, screenshots)

### 9.10 Demo Scenarios
- Research: search, open results, extract pricing/features, compile report PDF
- Operations: login (saved site), fill multi-step form with conditional sections, upload attachments, submit with confirmation
- Data Ops: scrape paginated table with filters, dedupe, write to Google Sheet and local CSV


## 10. Rollout Plan
- Alpha (end of Week 6): Local agents usable; feedback loop.
- Beta (end of Week 10): Builder + RAG complete; select API agents.
- GA (end of Week 12): Marketplace and enterprise basics; documentation published.

## 11. Appendix
- Glossary of node types and agent schema examples.
- Sample manifests and workflow JSONs.
- Links to design tokens and component catalogs.
