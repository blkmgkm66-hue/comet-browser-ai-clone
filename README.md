# Ready Robot - Comet Browser AI Clone
A sophisticated desktop browser with integrated AI assistant capabilities, built on Electron.

## ✅ Milestone: Click, Fill, Scrape actions + LLM tool-use fallback
Date: October 16, 2025

### What’s included in this milestone
- AI command interpreter now supports:
  - Go to <url>
  - Click <selector|text>
  - Fill <field|selector> with <value>
  - Scrape <selector|data>
- Webview action execution:
  - Runs Click/Fill/Scrape inside the active webview via executeJavaScript
  - Fallback postMessage bridge when executeJavaScript is unavailable
- LLM fallback for ambiguous commands:
  - Uses backend router at /api/model/parse to parse intent and produce a tool plan
  - Router can call OpenAI, Anthropic, or Perplexity depending on config
- Security and config:
  - No API keys in client code
  - Server reads keys from environment (see “API keys & models”)
- UX improvements and wiring:
  - Assistant chat returns scrape summaries for selectors
  - Auto-submit heuristics on Fill when a form submit is present

### How to use the new commands
- Click by text:
  - "Click Login" — clicks visible button/link with matching text
- Click by selector:
  - "Click .cta.primary" — uses CSS selector
- Fill by label/placeholder/selector:
  - "Fill Email with alice@example.com"
  - "Fill #password with hunter2"
- Scrape page or selector:
  - "Scrape data" — returns a summary of visible page text
  - "Scrape .result h3" — returns tag/text/attrs for matching nodes

Tip: If a command is ambiguous (e.g., multiple similar targets), the agent automatically calls the backend LLM to interpret intent and propose a concrete plan.

### API keys & models (server-side only)
- Create a .env (not committed) with any of:
  - OPENAI_API_KEY=...
  - ANTHROPIC_API_KEY=...
  - PERPLEXITY_API_KEY=...
- The router (src/api/modelRouter.js) should read from process.env and choose the provider/model based on configuration. Do not hard-code keys in JavaScript.

### Developer notes
- Renderer additions live in src/scripts/renderer.js
- The webview helpers evaluate functions in-page; prefer preload/IPC for production
- Future hardening: element disambiguation UI, timeouts, retries, and sandboxing

---

## Previous Milestone: Functional browser + AI assistant panel, basic NL navigation
Completed October 15, 2025
- Address bar + Back/Forward/Refresh
- Assistant panel open/close
- Basic "Go to <url>" in chat

## Coming next
- Preload/IPC action bus with safe allowlist for selectors and inputs
- Robust multi-step planner (navigate, waitFor, click, type, scrape)
- Tab/session management and state restore
- Streaming responses and tool traces in the chat UI
