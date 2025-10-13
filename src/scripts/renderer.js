// ===================================================================
// COMET BROWSER - RENDERER PROCESS
// Main renderer script for browser UI and webview functionality
// ===================================================================

// ===================================================================
// MILESTONE [2025-10-13]
// Milestone 1: Initial multi-tab browsing and session restore completed.
// - Implemented in-memory tab model with create/close/switch operations
// - Rendered tab strip with active state and close buttons
// - Webview navigation bound to active tab URL and updates address bar
// - Session persistence via localStorage with debounced saves
// - Session restore on startup with sane fallbacks
// - Comprehensive inline comments and TODO markers for next milestones
// ===================================================================

// ===================================================================
// DOM ELEMENT REFERENCES
// Core browser and AI assistant UI elements
// ===================================================================

// Tab management elements
const tabList = document.getElementById('tab-list');
const newTabBtn = document.getElementById('new-tab-btn');
const closeTabBtn = document.getElementById('close-tab-btn');

// Browser functionality
const webview = document.getElementById('webview');
const urlInput = document.getElementById('url-input');
const backBtn = document.getElementById('back-btn');
const forwardBtn = document.getElementById('forward-btn');
const refreshBtn = document.getElementById('refresh-btn');
const goBtn = document.getElementById('go-btn');

// AI Assistant elements
const aiToggleBtn = document.getElementById('ai-toggle-btn');
const aiPanel = document.getElementById('ai-panel');
const closeAiBtn = document.getElementById('close-ai-btn');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');

// ===================================================================
// TAB MODEL AND SESSION PERSISTENCE
// Implements multi-tab state in memory and persists to localStorage
// ===================================================================

/**
 * Tab data shape
 * id: string (uuid-ish)
 * title: string (best-effort from URL; updated via webview title when available)
 * url: string
 */

const STORAGE_KEY = 'comet.tabs.v1';
const STORAGE_ACTIVE_KEY = 'comet.activeTabId.v1';

/**
 * In-memory state for tabs
 */
const TabState = {
  tabs: [],
  activeId: null,
};

/**
 * Generate a simple unique id for tabs (sufficient for renderer-only use)
 */
function uid() {
  return 't_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

/**
 * Persist current tab state to localStorage
 * Debounced to avoid excessive writes during rapid navigation
 */
let saveTimer = null;
function saveSession(debounced = true) {
  const doSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(TabState.tabs));
      localStorage.setItem(STORAGE_ACTIVE_KEY, TabState.activeId || '');
    } catch (e) {
      console.warn('Session save failed:', e);
    }
  };
  if (!debounced) return doSave();
  clearTimeout(saveTimer);
  saveTimer = setTimeout(doSave, 200);
}

/**
 * Restore tab state from localStorage; returns true if a restore occurred.
 */
function restoreSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const active = localStorage.getItem(STORAGE_ACTIVE_KEY) || '';
    if (!raw) return false;
    const tabs = JSON.parse(raw);
    if (!Array.isArray(tabs) || tabs.length === 0) return false;
    TabState.tabs = tabs.filter(t => t && t.id && t.url);
    TabState.activeId = TabState.tabs.find(t => t.id === active)?.id || (TabState.tabs[0]?.id || null);
    return TabState.tabs.length > 0;
  } catch (e) {
    console.warn('Session restore failed:', e);
    return false;
  }
}

// ===================================================================
// TAB OPERATIONS
// Create, close, switch tabs and render the tab strip
// ===================================================================

function createTab(initialUrl = 'https://www.perplexity.ai') {
  const tab = {
    id: uid(),
    title: prettifyTitle(initialUrl),
    url: normalizeUrl(initialUrl),
  };
  TabState.tabs.push(tab);
  setActiveTab(tab.id);
  saveSession();
  return tab.id;
}

function closeTab(tabId) {
  const idx = TabState.tabs.findIndex(t => t.id === tabId);
  if (idx === -1) return;
  TabState.tabs.splice(idx, 1);
  // Determine next active tab
  if (TabState.activeId === tabId) {
    const next = TabState.tabs[idx] || TabState.tabs[idx - 1] || TabState.tabs[0] || null;
    TabState.activeId = next ? next.id : null;
  }
  renderTabs();
  loadActiveTabIntoWebview();
  saveSession();
}

function setActiveTab(tabId) {
  if (!TabState.tabs.some(t => t.id === tabId)) return;
  TabState.activeId = tabId;
  renderTabs();
  loadActiveTabIntoWebview();
  saveSession();
}

function updateActiveTabUrl(newUrl) {
  const tab = getActiveTab();
  if (!tab) return;
  tab.url = normalizeUrl(newUrl);
  tab.title = prettifyTitle(tab.url);
  renderTabs();
  loadActiveTabIntoWebview();
  saveSession();
}

function getActiveTab() {
  return TabState.tabs.find(t => t.id === TabState.activeId) || null;
}

function renderTabs() {
  if (!tabList) return;
  tabList.innerHTML = '';
  TabState.tabs.forEach(tab => {
    const li = document.createElement('li');
    li.className = 'tab-item' + (tab.id === TabState.activeId ? ' active' : '');

    const btn = document.createElement('button');
    btn.className = 'tab-button';
    btn.textContent = tab.title || 'New Tab';
    btn.title = tab.url;
    btn.addEventListener('click', () => setActiveTab(tab.id));

    const close = document.createElement('button');
    close.className = 'tab-close';
    close.textContent = '×';
    close.title = 'Close tab';
    close.addEventListener('click', (e) => {
      e.stopPropagation();
      closeTab(tab.id);
    });

    li.appendChild(btn);
    li.appendChild(close);
    tabList.appendChild(li);
  });
}

function loadActiveTabIntoWebview() {
  const tab = getActiveTab();
  if (!tab) {
    // No tabs left: create a default one
    createTab('https://www.perplexity.ai');
    return;
  }
  if (webview && webview.src !== tab.url) {
    webview.src = tab.url;
  }
  if (urlInput) urlInput.value = tab.url;
}

// ===================================================================
// NAVIGATION CONTROLS
// Event handlers for browser back/forward/refresh actions
// ===================================================================

backBtn.addEventListener('click', () => {
  try {
    if (webview && webview.canGoBack()) webview.goBack();
  } catch {}
});

forwardBtn.addEventListener('click', () => {
  try {
    if (webview && webview.canGoForward()) webview.goForward();
  } catch {}
});

refreshBtn.addEventListener('click', () => {
  try { if (webview) webview.reload(); } catch {}
});

goBtn.addEventListener('click', () => {
  navigateToUrl();
});

urlInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    navigateToUrl();
  }
});

// ===================================================================
// URL NAVIGATION FUNCTION
// Handles URL normalization and navigation logic
// ===================================================================

function normalizeUrl(url) {
  if (!url) return '';
  const trimmed = url.trim();
  // Basic heuristic: if it contains spaces or no dot, treat as search
  const isLikelySearch = /\s/.test(trimmed) || !/[.]/.test(trimmed.replace(/^https?:\/\//, ''));
  if (isLikelySearch) {
    const q = encodeURIComponent(trimmed);
    return `https://www.google.com/search?q=${q}`;
  }
  if (!/^https?:\/\//i.test(trimmed)) {
    return 'https://' + trimmed;
  }
  return trimmed;
}

function prettifyTitle(url) {
  try {
    const u = new URL(normalizeUrl(url));
    return u.hostname.replace(/^www\./, '');
  } catch {
    return 'Tab';
  }
}

function navigateToUrl() {
  let url = urlInput.value.trim();
  if (!url) return;
  updateActiveTabUrl(url);
}

// ===================================================================
// WEBVIEW LIFECYCLE EVENTS
// Event handlers for webview state changes and navigation
// ===================================================================

// Keep address bar synced and update tab title where possible
webview.addEventListener('did-navigate', (e) => {
  const tab = getActiveTab();
  if (tab) {
    tab.url = e.url;
    urlInput.value = e.url;
    saveSession();
  }
});

webview.addEventListener('did-navigate-in-page', (e) => {
  const tab = getActiveTab();
  if (tab) {
    tab.url = e.url;
    urlInput.value = e.url;
    saveSession();
  }
});

webview.addEventListener('page-title-updated', (e) => {
  const tab = getActiveTab();
  if (tab && e && e.title) {
    tab.title = e.title.slice(0, 60);
    renderTabs();
    saveSession();
  }
});

webview.addEventListener('dom-ready', () => {
  // Future: inject helpers, add content capture for AI context, etc.
  // TODO(next): Capture page metadata for AI context panel.
});

// ===================================================================
// TAB MANAGEMENT UI EVENT LISTENERS
// Hook up New/Close buttons and dynamic tab selection
// ===================================================================

newTabBtn.addEventListener('click', () => {
  createTab('https://www.perplexity.ai');
});

closeTabBtn.addEventListener('click', () => {
  if (!TabState.activeId) return;
  closeTab(TabState.activeId);
});

// Note: per-tab close buttons are wired in renderTabs()

// ===================================================================
// AI ASSISTANT PANEL CONTROLS
// Event handlers for showing/hiding the AI chat interface
// ===================================================================

a iToggleBtn?.addEventListener?.('click', () => {
  aiPanel?.classList?.toggle('hidden');
});

closeAiBtn?.addEventListener?.('click', () => {
  aiPanel?.classList?.add('hidden');
});

// ===================================================================
// AI CHAT FUNCTIONALITY (placeholder)
// TODO(next milestone): Integrate with AI API and persist conversations
// ===================================================================

sendBtn?.addEventListener?.('click', () => {
  sendMessage();
});

chatInput?.addEventListener?.('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

function sendMessage() {
  const message = chatInput?.value?.trim();
  if (!message) return;
  addMessageToChat('user', message);
  chatInput.value = '';
  setTimeout(() => {
    addMessageToChat('ai', 'Placeholder response. AI API integration coming next.');
  }, 300);
}

function addMessageToChat(sender, message) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${sender}-message`;
  messageDiv.textContent = message;
  chatMessages?.appendChild(messageDiv);
  if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ===================================================================
// STARTUP: SESSION RESTORE OR INITIAL TAB
// ===================================================================

(function init() {
  const restored = restoreSession();
  if (!restored) {
    // First run or nothing to restore
    createTab('https://www.perplexity.ai');
  } else {
    renderTabs();
    loadActiveTabIntoWebview();
  }
})();

// ===================================================================
// TODOs for upcoming milestones
// - Persist per-tab history (if feasible) or last URLs only [renderer-only]
// - Sync AI context with active tab (page title, URL, selected text)
// - Drag-reorder tabs and keyboard shortcuts (Ctrl+T, Ctrl+W, Ctrl+Tab)
// - Favicons in tab strip; show loading state/spinner
// - Error handling UI for failed navigations
// ===================================================================
