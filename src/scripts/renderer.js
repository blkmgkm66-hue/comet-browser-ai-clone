// ===================================================================
// COMET BROWSER - RENDERER PROCESS
// Main renderer script for browser UI and webview functionality
// ===================================================================

// Milestone: Functional browser+AI assistant panel, basic NL navigation working
// - Address bar loads webview; back/forward/refresh work
// - Assistant panel toggle robust (class 'open' + aria/display)
// - Minimal AI command interpreter: "Go to <url>" navigates browser
// - Inline stubs for advanced agent behaviors (click/scrape/multi-step)

// ===================================================================
// DOM ELEMENT REFERENCES
// ===================================================================
// Sidebar navigation elements
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

// Utility: Normalize and sanitize URL input
function normalizeToURL(input) {
  try {
    // If already a valid absolute URL
    const u = new URL(input);
    return u.toString();
  } catch (_) {
    // If it looks like a domain without protocol, add https
    if (/^([\w-]+\.)+[\w-]{2,}(\/[\S]*)?$/.test(input)) {
      return `https://${input}`;
    }
    // If spaces or search-like, fallback to search engine query
    const query = encodeURIComponent(input.trim());
    return `https://www.google.com/search?q=${query}`;
  }
}

// ===================================================================
// BROWSER MAIN VIEW BEHAVIOR
// ===================================================================
function navigateTo(input) {
  if (!webview) return;
  const url = normalizeToURL(input);
  webview.src = url;
  if (urlInput) urlInput.value = url;
}

function updateNavButtons() {
  // Electron <webview> exposes canGoBack/Forward via events; fallback toggles
  // For plain <iframe>, we cannot inspect history; keep buttons enabled conservatively
  if (!webview) return;
  // Robustness: don't rely on properties that might not exist
  const canBack = !!webview.canGoBack || false;
  const canFwd = !!webview.canGoForward || false;
  if (backBtn) backBtn.disabled = !canBack;
  if (forwardBtn) forwardBtn.disabled = !canFwd;
}

function refreshView() {
  if (!webview) return;
  // Prefer reload() if available; otherwise reset src to force refresh
  if (typeof webview.reload === 'function') {
    webview.reload();
  } else if (webview.src) {
    const current = webview.src;
    webview.src = current;
  }
}

// Hook up address bar
if (goBtn) {
  goBtn.addEventListener('click', () => {
    if (!urlInput) return;
    navigateTo(urlInput.value);
  });
}

if (urlInput) {
  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      navigateTo(urlInput.value);
    }
  });
}

// Hook up nav buttons
if (backBtn) {
  backBtn.addEventListener('click', () => {
    try {
      if (webview && typeof webview.goBack === 'function') webview.goBack();
      else window.history.back();
    } catch (e) {
      console.warn('Back navigation not available', e);
    }
  });
}

if (forwardBtn) {
  forwardBtn.addEventListener('click', () => {
    try {
      if (webview && typeof webview.goForward === 'function') webview.goForward();
      else window.history.forward();
    } catch (e) {
      console.warn('Forward navigation not available', e);
    }
  });
}

if (refreshBtn) {
  refreshBtn.addEventListener('click', refreshView);
}

// Update address bar on navigation changes (best-effort across webview/iframe)
if (webview) {
  // Electron webview events
  webview.addEventListener?.('did-navigate', (e) => {
    if (urlInput && e.url) urlInput.value = e.url;
    updateNavButtons();
  });
  webview.addEventListener?.('did-navigate-in-page', (e) => {
    if (urlInput && e.url) urlInput.value = e.url;
    updateNavButtons();
  });
  webview.addEventListener?.('did-start-loading', updateNavButtons);
  webview.addEventListener?.('did-stop-loading', updateNavButtons);
  // Fallback for iframe
  webview.addEventListener?.('load', () => {
    try {
      const current = webview.src;
      if (urlInput) urlInput.value = current;
    } catch {}
    updateNavButtons();
  });
}

// Minimal tab/page switching (single active tab)
function setActiveTab(tabId) {
  if (!tabItems || !tabItems.length) return;
  tabItems.forEach((el) => el.classList.remove('active'));
  const target = document.querySelector(`.tab-item[data-tab="${tabId}"]`);
  if (target) target.classList.add('active');
}

// If tabs present, clicking switches visible page/view containers
if (tabItems && tabItems.length) {
  tabItems.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      setActiveTab(target);
      // Future: load different URLs per tab or switch between multiple webviews
    });
  });
}

// ===================================================================
// ASSISTANT PANEL TOGGLE (ROBUST)
// ===================================================================
function openAssistantPanel() {
  if (!assistantPanel) return;
  assistantPanel.classList.add('open');
  assistantPanel.style.display = '';
  assistantPanel.setAttribute?.('aria-hidden', 'false');
  assistantToggle?.setAttribute?.('aria-expanded', 'true');
}

function hideAssistantPanel() {
  if (!assistantPanel) return;
  assistantPanel.classList.remove('open');
  assistantPanel.style.display = 'none';
  assistantPanel.setAttribute?.('aria-hidden', 'true');
  assistantToggle?.setAttribute?.('aria-expanded', 'false');
}

function toggleAssistantPanel() {
  if (!assistantPanel) return;
  const isOpen = assistantPanel.classList.contains('open');
  if (isOpen) hideAssistantPanel(); else openAssistantPanel();
}

assistantToggle?.addEventListener('click', toggleAssistantPanel);
assistantClose?.addEventListener('click', hideAssistantPanel);

// Ensure panel starts hidden but mounted
hideAssistantPanel();

// ===================================================================
// MINIMAL AI COMMAND INTERPRETER (BASIC NL NAVIGATION)
// ===================================================================
function appendChat(role, text) {
  if (!chatMessages) return;
  const item = document.createElement('div');
  item.className = `chat-msg ${role}`;
  item.textContent = text;
  chatMessages.appendChild(item);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function handleAssistantCommand(text) {
  const t = text.trim();
  if (!t) return;

  // Pattern: "go to <url>" (case-insensitive)
  const goMatch = /^\s*go\s+to\s+(.+)$/i.exec(t);
  if (goMatch && goMatch[1]) {
    const target = goMatch[1].trim().replace(/^\s+|\s+$/g, '');
    appendChat('assistant', `Navigating to ${target}...`);
    navigateTo(target);
    return;
  }

  // Future: add more commands here (open tab, back, forward, click selector, etc.)
  appendChat('assistant', "I can navigate if you say 'Go to <url>'. More soon.");
}

function sendChat() {
  if (!chatInput) return;
  const value = chatInput.value;
  if (!value.trim()) return;
  appendChat('user', value);
  chatInput.value = '';
  handleAssistantCommand(value);
}

chatSend?.addEventListener('click', sendChat);
chatInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChat();
  }
});

// ===================================================================
// ACCESSIBILITY AND UX ENHANCEMENTS (LIGHTWEIGHT)
// ===================================================================
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd+L to focus address bar
  const isMeta = navigator.platform.toLowerCase().includes('mac') ? e.metaKey : e.ctrlKey;
  if (isMeta && e.key.toLowerCase() === 'l') {
    e.preventDefault();
    urlInput?.focus();
    urlInput?.select?.();
  }
});

// When the webview URL changes externally, keep input in sync where possible
window.addEventListener('hashchange', () => {
  try {
    if (urlInput && webview?.src) urlInput.value = webview.src;
  } catch {}
});

// ===================================================================
// STUBS FOR FUTURE AI-AGENT BEHAVIORS (COMMENTED; NO-OP TODAY)
// ===================================================================
// agentClick(selector):
//   - In future milestones, the assistant will parse a command like
//     "Click the Login button" into a DOM selector and execute within
//     the active webview via preload/IPC to avoid cross-origin issues.
//   - Security: will sandbox and restrict actions; require user consent.
// agentScrape(selector):
//   - Extract text/attributes from elements matched by selector within
//     the webview DOM; stream results to chat.
// agentMultiStep(plan):
//   - Execute sequences: navigate, waitFor, click, type, scrape; with
//     retries, timeouts, and clear user-visible summaries.
// historyPersistence:
//   - Persist visited URLs per tab and restore session state on launch.
// toolUse:
//   - Integrate model call and tools (search, open, click) with a planner.

// ===================================================================
// INITIALIZATION
// ===================================================================
(function init() {
  // Default home if provided via data-home attribute
  const home = webview?.getAttribute?.('data-home');
  if (home && !webview.src) {
    navigateTo(home);
  }

  // Optional: click on active tab to enforce initial state
  if (tabItems && tabItems.length) {
    const active = document.querySelector('.tab-item.active');
    active?.dispatchEvent(new Event('click'));
  }

  // Keep nav buttons reasonably updated initially
  updateNavButtons();
})();
