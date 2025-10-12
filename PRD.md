# Agentic Browser Automation Platform — Product Requirements Document (PRD)

## 1. Product Overview and Goals

The Agentic Browser Automation Platform is a modular desktop browser built on Chromium/Electron that embeds a multi-model AI assistant and agentic automation engine. It enables users and developers to compose, run, and share automated browsing workflows that combine deterministic steps with reasoning-driven actions.

Goals
- Deliver a reliable Electron-based browser with modern navigation and isolation primitives.
- Provide an integrated, multi-model AI assistant for reasoning, extraction, and action planning.
- Ship an agentic workflow engine that can record, edit, simulate, and execute tasks safely.
- Offer a visual workflow builder and marketplace for sharing automations and agents.
- Ensure strong security via sandboxing, permissions, an API key vault, and auditability.
- Build a sustainable ecosystem with a sandbox for testing and monetization options.

Non-Goals (MVP)
- Full mobile clients (focus on desktop: macOS, Windows, Linux).
- Server-side hosted browser farms (local-first with optional remote runners later).

## 2. Core MVP Features and User Stories

2.1 Core Features
- Browser Shell (Electron + Chromium)
  - Tabs, navigation (back/forward/reload), address/search bar, downloads.
  - Isolated webviews per tab, site permissions prompt, per-tab process model.
- AI Assistant Panel
  - Multi-model routing (OpenAI, Anthropic, local models via Ollama). 
  - Context tools: page DOM snapshot, selection-to-context, screenshot-to-context.
  - Actions: summarize page, extract data, generate steps, validate results.
- Agentic Workflow Engine
  - Deterministic steps (click, type, select, wait, scrape) + AI-planned steps.
  - Recording: macro recorder that converts user actions into editable steps.
  - Variables, branching, loops, retries, timeouts, error handling.
  - Human-in-the-loop checkpoints and dry-run/simulation mode.
- Visual Workflow Builder
  - Node/graph editor with drag-and-drop blocks (Input, Navigate, Click, Extract, LLM, Condition, Loop, Save).
  - Inspector panel for parameters, test run, and inline validation.
- Data Extractor
  - Template-based (CSS/XPath/Regex) and AI-assisted extraction with schema mapping to JSON/CSV.
- Summarizer
  - Page/selection summarization with citations and multi-tab synthesis.
- Sandbox and Logs
  - Sandboxed runner with network, file, and clipboard permissions.
  - Structured run logs with step traces, snapshots, and diffs.
- Marketplace (Read-only in MVP)
  - Browse, install, and rate community agents/flows; local install with provenance.
- Secrets Vault
  - Encrypted API key management (OpenAI, Anthropic, custom HTTP, OAuth tokens).

2.2 User Stories
- As a researcher, I can highlight a section and “Summarize with sources” to get a concise brief with citations.
- As an analyst, I can record steps on an e-commerce site, parameterize product keywords, and run the flow daily.
- As an operations user, I can build a data extraction flow returning CSV and schedule it locally.
- As a QA engineer, I can simulate a multi-step sign-in flow in sandbox with fake credentials and verify DOM assertions.
- As a developer, I can publish a signed agent to the marketplace with documentation and versioning.
- As a security-conscious admin, I can enforce per-flow permissions and require 2FA for secrets usage.

Acceptance Criteria (MVP)
- Can open 10+ tabs without process crashes; each tab isolated with permission prompts.
- AI assistant can summarize page, extract table data to CSV, and propose workflow steps.
- Recorder produces an editable step list with selectors that re-run deterministically on the same site.
- Workflow builder supports variables, condition, loop, and retry; runs with logs and snapshots.
- Secrets vault encrypts keys at rest, never prints key material to logs, and supports redaction.
- Marketplace installs a sample agent; all installed packages run in sandbox with declared permissions.

## 3. System Architecture and Tech Stack

Architecture Overview
- Shell: Electron (Chromium) with multi-process architecture; per-tab BrowserView/WebContents.
- Main Process: app lifecycle, IPC, secret vault access, permission mediation, updater.
- Renderer Process: UI (React/TypeScript), sidebar, workflow builder, logs.
- Worker Processes: sandboxed runners for flows; Playwright/Puppeteer-like control layer.
- AI Services Layer: model routing, prompt templates, tool adapters, and token accounting.
- Data Layer: local SQLite for runs, logs, configs; file-based storage for artifacts.
- Extension Layer: agent/flow plugins with manifest, permissions, and capability constraints.

Tech Stack
- Desktop: Electron, Node.js, Chromium.
- UI: React, TypeScript, Vite, TailwindCSS.
- Graph/Builder: React Flow or D3; Monaco Editor for JSON/script nodes.
- Automation: Playwright core (preferred) with hardened selectors; fallback to Puppeteer.
- LLM: OpenAI/Anthropic SDKs, OpenRouter, local via Ollama; JSON Schema-based tool calling.
- Storage: SQLite + Prisma, file storage in app data directory.
- Crypto: OS keychain integration (Keytar), AES-GCM for secrets, libsodium for signing.
- Telemetry: opt-in only; local-first logs with export options.

Key Modules
- runner-core: executes steps, handles retries/timeouts, emits events and traces.
- selector-engine: robust selectors with auto-healing and shadow DOM support.
- ai-router: model selection, rate limiting, cost tracking.
- vault: secret storage and redaction.
- marketplace-client: browse/install signed agents; provenance checks.

## 4. Menu of Agents & Automations

Built-in Agents
- Summarizer: TL;DR with citations, compare tabs, question answering on selection.
- Data Extractor: schema-guided extraction to JSON/CSV, table/collection detection.
- Macro Recorder: record clicks/keys, auto-generate selectors, convert to workflow.
- Research Agent: multi-tab search, triage, cluster, and synthesize findings.
- Form Filler: parameterized form completion with validation and safe-run checks.
- Monitor Bot: schedule a flow; diff content changes; notify via webhook/email.*
- QA Agent: assertions on DOM/text/HTTP calls; screenshot diffs; report export.

Note: *Notifications may be local in MVP; remote webhooks optional.

Automation Blocks (Builder Palette)
- Input/Prompt, Navigate, Click, Type, Select, Wait, Eval Script (sandboxed), Extract, LLM Call, Branch, Loop, Retry, Save to File, Send Webhook, Ask Human.

## 5. UI/UX Design System

Design Language
- Glassmorphism with frosted panels, subtle blurs, and depth; dark blue theme (#0b1f3a base).
- Rounded corners, micro-shadows, and vivid accent gradients for primary actions.
- Consistent 8px spacing scale; motion reduced by user preference.

Layout
- Left Sidebar: tabs list, agents menu, and workflow builder entry.
- Right Panel: AI assistant chat with detachable drawer; context chips (URL, selection, screenshot).
- Center Stage: webview canvas; bottom dock for logs and run timeline.
- Builder Mode: graph canvas + right inspector panel + bottom console.

Components
- Buttons (solid/ghost), inputs, code blocks, chips, toasts, step cards, log timeline items.
- Theming tokens: color, radius, blur, shadows, typography; light/dark variants.

Accessibility
- WCAG AA contrast, keyboard-first navigation, screen-reader landmarks, focus outlines.

## 6. Marketplace, Sandbox, and Monetization Modules

Marketplace (MVP)
- Browse curated agents/flows with metadata, version, author, permissions, and ratings.
- Install locally with provenance/signature verification; un-install and update flows.

Sandbox
- Separate runner process with OS-level sandbox flags; no direct disk or network access without permission.
- Declarative permissions per flow: network domains allowlist, file read/write scopes, clipboard, screenshots.
- Resource quotas: CPU time per step, memory limit, navigation timeout, request budget.

Monetization
- Optional paid listings and revenue share in future releases.
- MVP: free marketplace with donation links and local license keys for paid agents.

## 7. Security Requirements

- Secrets & API Vault
  - Encrypted at rest using OS keychain (Keytar) for key wrapping; AES-GCM for ciphertext.
  - Access brokered by main process; never exposed to renderer logs; redaction on output.
- Sandboxing & Permissions
  - Electron sandbox, contextIsolation, disable remote module, strict Content-Security-Policy.
  - Per-flow permission manifest reviewed at install/run time with user prompts and audit logs.
- Authentication & 2FA
  - Built-in TOTP for critical actions (revealing secrets, publishing agents). 
  - Support OAuth device flow for third-party APIs; token storage in vault.
- Compliance & Privacy
  - Data minimization; local-first storage; export/delete my data; audit log with hashes.
  - Optional enterprise mode: admin policies, SSO, and SOC 2 roadmap.
- Supply Chain
  - Signed marketplace packages; integrity verified on install and run; SBOM and update checks.

## 8. Actionable Roadmap

Milestone 0 — Foundations (Weeks 1-3)
- Bootstrap Electron app shell with tabs, sidebar, and webview isolation.
- Integrate Playwright automation layer and IPC bridge APIs.
- Implement secrets vault MVP with OS keychain; set up SQLite schema.

Milestone 1 — Assistant + Extractor (Weeks 4-6)
- Add AI router with OpenAI/Anthropic and local model support; context tools (DOM, screenshot).
- Ship summarizer and extractor agents; export to CSV/JSON with schema mapping.
- Implement selection-to-context and multi-tab summarization.

Milestone 2 — Recorder + Builder (Weeks 7-9)
- Build macro recorder; generate step list with selectors; edit in builder.
- Implement visual workflow builder with variables, conditionals, and retry.
- Add run logs with snapshots, diff viewer, and error surfaces.

Milestone 3 — Sandbox + Permissions (Weeks 10-12)
- Harden Electron security settings; sandbox runner processes; permission prompts.
- Enforce per-flow manifest; implement resource quotas and safe eval.

Milestone 4 — Marketplace Preview (Weeks 13-14)
- Read-only marketplace UI; install and run sample signed agents.
- Provenance verification, versioning, and uninstall/update flows.

Milestone 5 — Polish & Release (Weeks 15-16)
- Glassmorphism design tokens, dark blue theme, and accessibility pass.
- Stability, telemetry opt-in, docs, and example flows.

Release Criteria
- All MVP acceptance criteria met; no P0 security issues; passes regression test suite.

---
Commit message: Add Product Requirements Document for agentic browser platform MVP.
