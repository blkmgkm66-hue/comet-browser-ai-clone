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
const tabs = [];
let activeTabId = null;

/**
 * Generate a simple unique ID for tabs
 */
function generateTabId() {
  return 'tab-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
}

/**
 * Create a new tab with the given URL and optionally activate it
 */
function createTab(url = 'https://www.perplexity.ai', activate = true) {
  const tab = {
    id: generateTabId(),
    url: url,
    title: getTitleFromUrl(url)
  };
  tabs.push(tab);
  if (activate) {
    activeTabId = tab.id;
  }
  renderTabs();
  if (activate) {
    loadActiveTabIntoWebview();
  }
  saveSession();
}

/**
 * Close a tab by ID; if it's the active tab, switch to another one
 */
function closeTab(tabId) {
  const index = tabs.findIndex((t) => t.id === tabId);
  if (index === -1) return;

  tabs.splice(index, 1);

  // If we closed the active tab, pick a new active tab
  if (activeTabId === tabId) {
    if (tabs.length > 0) {
      // Prefer the tab to the left, or the first tab
      const newIndex = Math.max(0, index - 1);
      activeTabId = tabs[newIndex].id;
      loadActiveTabIntoWebview();
    } else {
      activeTabId = null;
      // If no tabs left, create a new one
      createTab('https://www.perplexity.ai');
    }
  }

  renderTabs();
  saveSession();
}

/**
 * Switch to a tab by ID
 */
function switchTab(tabId) {
  if (!tabs.find((t) => t.id === tabId)) return;
  activeTabId = tabId;
  renderTabs();
  loadActiveTabIntoWebview();
  saveSession();
}

/**
 * Load the active tab's URL into the webview
 */
function loadActiveTabIntoWebview() {
  const activeTab = tabs.find((t) => t.id === activeTabId);
  if (!activeTab) return;

  if (webview) {
    webview.src = activeTab.url;
    if (urlInput) {
      urlInput.value = activeTab.url;
    }
  }
}

/**
 * Render the tab strip based on current in-memory tabs
 */
function renderTabs() {
  if (!tabList) return;

  tabList.innerHTML = '';
  tabs.forEach((tab) => {
    const li = document.createElement('li');
    li.className = 'tab-item' + (tab.id === activeTabId ? ' active' : '');
    li.dataset.tabId = tab.id;

    const titleSpan = document.createElement('span');
    titleSpan.className = 'tab-title';
    titleSpan.textContent = tab.title;
    li.appendChild(titleSpan);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'tab-close';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeTab(tab.id);
    });
    li.appendChild(closeBtn);

    li.addEventListener('click', () => {
      switchTab(tab.id);
    });

    tabList.appendChild(li);
  });
}

/**
 * Save current tabs and active tab to localStorage
 */
function saveSession() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
    localStorage.setItem(STORAGE_ACTIVE_KEY, activeTabId || '');
  } catch (err) {
    console.error('Failed to save session:', err);
  }
}

/**
 * Restore tabs from localStorage
 */
function restoreSession() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const storedActiveId = localStorage.getItem(STORAGE_ACTIVE_KEY);
    if (stored) {
      const parsedTabs = JSON.parse(stored);
      if (Array.isArray(parsedTabs) && parsedTabs.length > 0) {
        tabs.push(...parsedTabs);
        activeTabId = storedActiveId || tabs[0].id;
        return true;
      }
    }
  } catch (err) {
    console.error('Failed to restore session:', err);
  }
  return false;
}

/**
 * Derive a page title from URL (fallback before webview provides actual title)
 */
function getTitleFromUrl(url) {
  try {
    const u = new URL(url);
    return u.hostname || url;
  } catch {
    return url.slice(0, 30);
  }
}

// ===================================================================
// BROWSER NAVIGATION CONTROLS
// ===================================================================

backBtn?.addEventListener?.('click', () => {
  webview?.goBack();
});

forwardBtn?.addEventListener?.('click', () => {
  webview?.goForward();
});

refreshBtn?.addEventListener?.('click', () => {
  webview?.reload();
});

goBtn?.addEventListener?.('click', () => {
  navigateToUrl();
});

urlInput?.addEventListener?.('keypress', (e) => {
  if (e.key === 'Enter') {
    navigateToUrl();
  }
});

function navigateToUrl() {
  let url = urlInput?.value?.trim();
  if (!url) return;

  // Simple heuristic: if it doesn't start with a protocol, prepend https://
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  if (webview) {
    webview.src = url;
  }

  // Update active tab's URL
  const activeTab = tabs.find((t) => t.id === activeTabId);
  if (activeTab) {
    activeTab.url = url;
    activeTab.title = getTitleFromUrl(url);
    renderTabs();
    saveSession();
  }
}

// ===================================================================
// TAB CONTROLS
// ===================================================================

newTabBtn?.addEventListener?.('click', () => {
  createTab('https://www.perplexity.ai');
});

closeTabBtn?.addEventListener?.('click', () => {
  if (activeTabId) {
    closeTab(activeTabId);
  }
});

// ===================================================================
// WEBVIEW EVENT LISTENERS
// Update URL bar and tab title when webview navigates or loads
// ===================================================================

webview?.addEventListener?.('did-navigate', (e) => {
  if (urlInput) {
    urlInput.value = e.url;
  }
  const activeTab = tabs.find((t) => t.id === activeTabId);
  if (activeTab) {
    activeTab.url = e.url;
    activeTab.title = getTitleFromUrl(e.url);
    renderTabs();
    saveSession();
  }
});

webview?.addEventListener?.('did-navigate-in-page', (e) => {
  if (urlInput) {
    urlInput.value = e.url;
  }
  const activeTab = tabs.find((t) => t.id === activeTabId);
  if (activeTab) {
    activeTab.url = e.url;
    renderTabs();
    saveSession();
  }
});

webview?.addEventListener?.('page-title-updated', (e) => {
  const activeTab = tabs.find((t) => t.id === activeTabId);
  if (activeTab) {
    activeTab.title = e.title || getTitleFromUrl(activeTab.url);
    renderTabs();
    saveSession();
  }
});

// ===================================================================
// AI ASSISTANT PANEL CONTROLS
// ===================================================================

// MILESTONE: Fixed typo - changed "a iToggleBtn" to "aiToggleBtn"
aiToggleBtn?.addEventListener?.('click', () => {
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
