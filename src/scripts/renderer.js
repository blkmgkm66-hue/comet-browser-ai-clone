// ===================================================================
// COMET BROWSER - RENDERER PROCESS
// Main renderer script for browser UI and webview functionality
// ===================================================================
// Milestone: Functional browser+AI assistant panel, basic NL navigation working
// - Address bar loads webview; back/forward/refresh work
// - Assistant panel toggle robust (class 'open' + aria/display)
// - AI command interpreter now supports: Go to, Click, Fill, Scrape
// - LLM fallback (OpenAI/Anthropic/Perplexity) for ambiguous commands via backend router
// ===================================================================

// DOM ELEMENT REFERENCES
// -------------------------------------------------------------------
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebarItems = document.querySelectorAll('.sidebar-item');

// Browser navigation toolbar
const backBtn = document.getElementById('back-btn');
const forwardBtn = document.getElementById('forward-btn');
const refreshBtn = document.getElementById('refresh-btn');
const goBtn = document.getElementById('go-btn');
const urlInput = document.getElementById('url-input');

// Webview container
const webview = document.getElementById('webview');
const browserView = document.getElementById('browser-view');

// Assistant panel elements
const assistantPanel = document.getElementById('assistant-panel');
const assistantToggle = document.getElementById('assistant-toggle');
const assistantClose = document.getElementById('assistant-close');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');

// Tabs (optional/minimal support)
const tabBar = document.getElementById('tab-bar');
const tabItems = document.querySelectorAll('.tab-item');

// ===================================================================
// UTILITIES
// ===================================================================
function normalizeToURL(input) {
  try {
    const u = new URL(input);
    return u.toString();
  } catch (_) {
    if (/^([\w-]+\.)+[\w-]{2,}(\/[^\s]*)?$/.test(input)) {
      return `https://${input}`;
    }
    const query = encodeURIComponent(input.trim());
    return `https://www.google.com/search?q=${query}`;
  }
}

function addChatMessage(role, text) {
  if (!chatMessages) return;
  const el = document.createElement('div');
  el.className = `msg ${role}`;
  el.textContent = text;
  chatMessages.appendChild(el);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function navigateTo(url) {
  const safe = normalizeToURL(url);
  if (webview) {
    webview.src = safe;
  }
  if (urlInput) urlInput.value = safe;
}

function updateNavButtons() {
  backBtn && (backBtn.disabled = false);
  forwardBtn && (forwardBtn.disabled = false);
}

// ===================================================================
// WEBVIEW DOM HELPERS (executeJavaScript wrapper)
// ===================================================================
async function evalInWebview(fn, ...args) {
  return new Promise((resolve, reject) => {
    try {
      if (webview && typeof webview.executeJavaScript === 'function') {
        const code = `(${fn})(...${JSON.stringify(args)})`;
        webview.executeJavaScript(code, true).then(resolve).catch(reject);
      } else if (webview && webview.contentWindow) {
        const reqId = `req_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        function onMessage(ev) {
          if (!ev.data || ev.data.type !== 'wv-eval-resp' || ev.data.id !== reqId) return;
          window.removeEventListener('message', onMessage);
          ev.data.ok ? resolve(ev.data.result) : reject(new Error(ev.data.error || 'Eval error'));
        }
        window.addEventListener('message', onMessage);
        webview.contentWindow.postMessage({ type: 'wv-eval', id: reqId, fn: fn.toString(), args }, '*');
        setTimeout(() => {
          window.removeEventListener('message', onMessage);
          reject(new Error('Webview eval timeout'));
        }, 15000);
      } else {
        reject(new Error('Webview not available'));
      }
    } catch (e) {
      reject(e);
    }
  });
}

function pageClickImpl(selectorOrText) {
  const s = selectorOrText;
  const tryClick = (el) => {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;
    el.click();
    return true;
  };
  try {
    const el = document.querySelector(s);
    if (tryClick(el)) return { ok: true, via: 'selector' };
  } catch {}
  const candidates = Array.from(document.querySelectorAll('button, a, input[type="button"], input[type="submit"], [role="button"]'));
  const norm = (t) => (t || '').trim().toLowerCase();
  let target = candidates.find(el => norm(el.textContent || el.value) === norm(s));
  if (!target) target = candidates.find(el => norm(el.textContent || el.value).includes(norm(s)));
  if (tryClick(target)) return { ok: true, via: 'text' };
  return { ok: false, error: 'Element not found or not visible' };
}

function pageFillImpl(selectorOrField, value) {
  const s = selectorOrField;
  let el = null;
  try { el = document.querySelector(s); } catch {}
  const byLabel = () => {
    const norm = (t) => (t || '').trim().toLowerCase();
    const labels = Array.from(document.querySelectorAll('label'));
    let label = labels.find(l => norm(l.textContent) === norm(s)) || labels.find(l => norm(l.textContent).includes(norm(s)));
    if (label) {
      const forId = label.getAttribute('for');
      if (forId) return document.getElementById(forId);
      const input = label.querySelector('input, textarea, [contenteditable="true"]');
      if (input) return input;
    }
    const all = Array.from(document.querySelectorAll('input, textarea'));
    return all.find(i => norm(i.placeholder) === norm(s) || norm(i.placeholder).includes(norm(s)));
  };
  if (!el) el = byLabel();
  if (!el) return { ok: false, error: 'Field not found' };
  const tag = (el.tagName || '').toLowerCase();
  const type = (el.getAttribute('type') || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea') {
    el.focus();
    el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    if (type === 'submit') el.form?.submit?.();
  } else if (el.isContentEditable) {
    el.focus();
    el.textContent = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  } else {
    return { ok: false, error: 'Target is not fillable' };
  }
  const form = el.form || el.closest('form');
  if (form) {
    const hasSubmit = form.querySelector('button[type="submit"], input[type="submit"]');
    if (hasSubmit) hasSubmit.click();
  }
  return { ok: true };
}

function pageScrapeImpl(selectorOrData) {
  const s = selectorOrData?.trim();
  const visibleText = () => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let acc = '';
    while (walker.nextNode()) {
      const t = walker.currentNode.nodeValue;
      if (t && t.trim()) acc += t.trim() + '\n';
    }
    return acc.trim();
  };
  if (!s || s.toLowerCase() === 'data' || s.toLowerCase() === 'text') {
    return { ok: true, text: visibleText().slice(0, 5000) };
  }
  try {
    const nodes = Array.from(document.querySelectorAll(s));
    if (!nodes.length) return { ok: false, error: 'No elements match selector' };
    const results = nodes.map(n => {
      const tag = n.tagName.toLowerCase();
      const text = (n.innerText || n.textContent || '').trim();
      const attrs = {};
      for (const a of n.attributes) attrs[a.name] = a.value;
      return { tag, text: text.slice(0, 1000), attrs };
    });
    return { ok: true, results };
  } catch (e) {
    return { ok: false, error: 'Invalid selector' };
  }
}

// ===================================================================
// COMMAND INTERPRETER
// ===================================================================
function parseSimpleCommand(input) {
  const raw = input.trim();
  const lower = raw.toLowerCase();
  const goMatch = lower.match(/^go to\s+(.+)$/);
  if (goMatch) return { type: 'goto', url: raw.slice(6).trim() };
  const clickMatch = lower.match(/^click\s+(.+)$/);
  if (clickMatch) return { type: 'click', target: raw.slice(6).trim() };
  const fillMatch = raw.match(/^fill\s+(.+?)\s+with\s+([\s\S]+)$/i);
  if (fillMatch) return { type: 'fill', field: fillMatch[1].trim(), value: fillMatch[2].trim() };
  const scrapeMatch = lower.match(/^scrape\s+(.+)$/);
  if (scrapeMatch) return { type: 'scrape', target: raw.slice(7).trim() };
  return null;
}

async function callLLMRouter(prompt) {
  try {
    const resp = await fetch('/api/model/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    if (!resp.ok) throw new Error(`Router HTTP ${resp.status}`);
    return await resp.json();
  } catch (e) {
    return { error: e.message };
  }
}

async function runCommand(input) {
  addChatMessage('user', input);
  let plan = parseSimpleCommand(input);
  if (!plan) {
    addChatMessage('assistant', 'Parsing with model...');
    const llm = await callLLMRouter(input);
    if (llm && llm.plan) {
      plan = llm.plan;
    } else {
      addChatMessage('assistant', `Could not parse command: ${llm?.error || 'unknown error'}`);
      return;
    }
  }
  try {
    if (plan.type === 'goto') {
      navigateTo(plan.url);
      addChatMessage('assistant', `Navigating to ${plan.url}`);
      return;
    }
    if (plan.type === 'click') {
      const res = await evalInWebview(pageClickImpl, plan.target);
      addChatMessage('assistant', res.ok ? `Clicked (${res.via})` : `Click failed: ${res.error}`);
      return;
    }
    if (plan.type === 'fill') {
      const res = await evalInWebview(pageFillImpl, plan.field, plan.value);
      addChatMessage('assistant', res.ok ? 'Filled input' : `Fill failed: ${res.error}`);
      return;
    }
    if (plan.type === 'scrape') {
      const res = await evalInWebview(pageScrapeImpl, plan.target);
      if (res.ok && res.text) {
        addChatMessage('assistant', res.text);
      } else if (res.ok && res.results) {
        const summary = res.results.slice(0, 5).map((r, i) => `${i+1}. <${r.tag}> ${r.text}`).join('\n');
        addChatMessage('assistant', summary || 'No content');
      } else {
        addChatMessage('assistant', `Scrape failed: ${res.error}`);
      }
      return;
    }
    addChatMessage('assistant', `Unsupported plan type: ${plan.type}`);
  } catch (e) {
    addChatMessage('assistant', `Error: ${e.message}`);
  }
}

// ===================================================================
// EVENT WIRING
// ===================================================================
function wireUI() {
  if (assistantToggle && assistantPanel) {
    assistantToggle.addEventListener('click', () => assistantPanel.classList.toggle('open'));
  }
  if (assistantClose && assistantPanel) {
    assistantClose.addEventListener('click', () => assistantPanel.classList.remove('open'));
  }
  if (backBtn) backBtn.addEventListener('click', () => window.history.back());
  if (forwardBtn) forwardBtn.addEventListener('click', () => window.history.forward());
  if (refreshBtn && webview) refreshBtn.addEventListener('click', () => webview.src = webview.src);
  if (goBtn && urlInput) {
    goBtn.addEventListener('click', () => navigateTo(urlInput.value));
  }
  if (urlInput) {
    urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') navigateTo(urlInput.value);
    });
  }
  if (chatSend && chatInput) {
    chatSend.addEventListener('click', () => {
      const v = chatInput.value.trim();
      if (v) runCommand(v);
      chatInput.value = '';
    });
  }
  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const v = chatInput.value.trim();
        if (v) runCommand(v);
        chatInput.value = '';
      }
    });
  }
}

// ===================================================================
// ACCESSIBILITY AND UX
// ===================================================================
document.addEventListener('keydown', (e) => {
  const isMeta = navigator.platform.toLowerCase().includes('mac') ? e.metaKey : e.ctrlKey;
  if (isMeta && e.key.toLowerCase() === 'l') {
    e.preventDefault();
    urlInput?.focus();
    urlInput?.select?.();
  }
});

window.addEventListener('hashchange', () => {
  try {
    if (urlInput && webview?.src) urlInput.value = webview.src;
  } catch {}
});

// ===================================================================
// INIT
// ===================================================================
(function init() {
  wireUI();
  const home = webview?.getAttribute?.('data-home');
  if (home && !webview.src) navigateTo(home);
  if (tabItems?.length) {
    const active = document.querySelector('.tab-item.active');
    active?.dispatchEvent(new Event('click'));
  }
  updateNavButtons();
})();
