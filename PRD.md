# Ready Robot — Product Requirements Document (PRD)
-
 Long-term project memory: site playbooks, reusable selectors, form profiles, proven workflows
-
 Evidence tracking: each step stores inputs, outputs, artifacts (screenshots, HTML clips)
-
 Plan-state machine: PENDING → RUNNING → PAUSED → AWAITING_CONFIRMATION → COMPLETED/FAILED
###
 9.4 User Feedback and Control Loop
-
 Inline confirmations for sensitive actions (submit, purchase, message)
-
 Live run console: step logs, diffs, screenshots, DOM targets, network traces
-
 One-click corrections: "Use this selector", "Skip step", "Replace value", "Try alternative path"
-
 Post-run review: human-in-the-loop accept/annotate, save as Macro/Agent
###
 9.5 Security, Privacy, and Compliance
-
 Principle of least privilege per plan; capability grants expire post-run
-
 Policy engine: robots.txt, site ToS tags, domain allow/deny lists, CSP-aware actions
-
 Secret handling: keytar-backed vault; no model exposure of secrets; redaction in logs
-
 Data boundaries: PII tagging, export controls, on-device only modes, consent prompts
-
 Audit trail: immutable run log, diff of page interactions, data lineage for outputs
###
 9.6 Extensibility and Integrations
-
 Plugin API for custom tools (TypeScript), with manifest describing permissions and UI
-
 Provider adapters (OpenAI/Anthropic/Local) and pluggable embeddings/vision
-
 Webhook triggers and event subscriptions (onExtract, onSubmit, onDownload)
-
 External systems: Slack/Email/DB/Sheets/Notion via prebuilt connectors
-
 Macro → Agent promotion path with parameterization and schema validation
###
 9.7 System Prompt and Reasoning Guardrails
-
 Stable system prompt with: role, objectives, safety rules, tool usage rubric, output schema
-
 Few-shot exemplars for: scraping tables, robust form fill, pagination, file download, auth guard
-
 Output contracts: always produce structured plan JSON + concise rationale
-
 Self-checklist before executing steps: selector existence, visibility, side-effect awareness
-
 Refusal rules: auth walls, payments, messaging without explicit user confirmation
###
 9.8 Implementation Milestones (Weeks 7–10)
-
 Week 7: Tool bus v1, action DSL, typed results, event stream; basic planner templates
-
 Week 8: Selector strategy (text, CSS, XPath, role-based), retry policies, screenshot/evidence store; live console UI
-
 Week 9: Security policy engine, capability grants, secret vault, redaction; user confirmation modals
-
 Week 10: Memory store (site playbooks, reusable selectors), macro promotion, connectors (Slack/Email/Sheets)
###
 9.9 Acceptance Criteria
-
 Given a natural-language task (e.g., "Find top 5 pricing pages, extract tables, export CSV"), the planner emits a valid plan JSON with tools, constraints, and success metrics
-
 Execution completes end-to-end on at least 3 heterogeneous sites, with evidence and resilient retries
-
 Sensitive steps trigger confirmation; declines halt safely with audit record
-
 Policies enforce robots.txt and domain allowlist; secrets not leaked in logs or prompts
-
 Macro promotion generates an editable agent manifest with parameterized inputs and permissions
-
 All runs produce an immutable audit log and downloadable artifacts (CSV, screenshots)
###
 9.10 Demo Scenarios
-
 Research: search, open results, extract pricing/features, compile report PDF
-
 Operations: login (saved site), fill multi-step form with conditional sections, upload attachments, submit with confirmation
-
 Data Ops: scrape paginated table with filters, dedupe, write to Google Sheet and local CSV
##
 10. Rollout Plan
-
 Alpha (end of Week 6): Local agents usable; feedback loop.
-
 Beta (end of Week 10): Builder + RAG complete; select API agents.
-
 GA (end of Week 12): Marketplace and enterprise basics; documentation published.
##
 11. Appendix
-
 Glossary of node types and agent schema examples.
-
 Sample manifests and workflow JSONs.
-
 Links to design tokens and component catalogs.

---

## 12. Development Best Practices

### UI Stability & Core Functionality Guardrails

**Critical browser and assistant panel elements (IDs):**
- List: webview, url-input, go-btn, back-btn, forward-btn, refresh-btn, assistant-panel, assistant-toggle, chat-input, chat-send, chat-messages
- These IDs must always exist and not be renamed or deleted across all HTML/JS updates.

**UI/logic update rules:**
- Never rename/delete above IDs or markup without updating all JS selectors *in the same commit*.
- Always check required elements exist at DOMContentLoaded; log or fail if not.
- Add a JS validator to run on every startup—alerts/fails loud if anything missing.
- Keep a minimal UI smoke test (manual or automated) before every major push.
- Use defensive JS (only wire listeners if elements exist, log if not).
- Never ship changes if nav/assistant/chat fail to load or toggle.
- For larger refactors (like moving to componentized UI), update this contract in PRD and refactor all affected JS in lock-step.

**Development Process:**
- Enforce these rules for all changes (self or AI-driven), review every merge for core UI contract adherence.
- Rollback or hotfix immediately if navigation, assistant, or chat panels become non-functional.
