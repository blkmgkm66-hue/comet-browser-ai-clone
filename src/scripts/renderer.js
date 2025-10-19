/**
 * Frontend Renderer - Milestone 3 Update
 * LLM Planner Integration & Multi-Tool Executor
 * 
 * New additions:
 * - Async plan POST to /api/model/plan
 * - Plan execution loop
 * - Tool execution shell (extensible framework)
 * - DOMContentLoaded wrapper for robust initialization
 * - Defensive element presence checks
 */
// ===================================================================
// DOM ELEMENT REFERENCES & INITIALIZATION
// ===================================================================
// Declare element references at module scope
let webview, urlInput, goBtn, backBtn, forwardBtn, refreshBtn;
let chatInput, chatSend, chatMessages, tabItems;
let assistantPanel, assistantToggle;
// Wrap all DOM initialization in DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Renderer] DOMContentLoaded fired - initializing elements...');
  
  // Assign all DOM elements
  webview = document.getElementById('webview');
  urlInput = document.getElementById('url-input');
  goBtn = document.getElementById('go-btn');
  backBtn = document.getElementById('back-btn');
  forwardBtn = document.getElementById('forward-btn');
  refreshBtn = document.getElementById('refresh-btn');
  chatInput = document.getElementById('chat-input');
  chatSend = document.getElementById('chat-send');
  chatMessages = document.getElementById('chat-messages');
  assistantPanel = document.getElementById('assistant-panel');
  assistantToggle = document.getElementById('assistant-toggle');
  tabItems = document.querySelectorAll('.tab-item');
  
  // Defensive logging for critical elements
  if (!webview) console.warn('[Renderer] CRITICAL: webview element not found!');
  if (!urlInput) console.warn('[Renderer] WARNING: urlInput element not found!');
  if (!goBtn) console.warn('[Renderer] WARNING: goBtn element not found!');
  if (!backBtn) console.warn('[Renderer] WARNING: backBtn element not found!');
  if (!forwardBtn) console.warn('[Renderer] WARNING: forwardBtn element not found!');
  if (!refreshBtn) console.warn('[Renderer] WARNING: refreshBtn element not found!');
  if (!chatInput) console.warn('[Renderer] WARNING: chatInput element not found!');
  if (!chatSend) console.warn('[Renderer] WARNING: chatSend element not found!');
  if (!chatMessages) console.warn('[Renderer] WARNING: chatMessages element not found!');
  if (!assistantPanel) console.warn('[Renderer] WARNING: assistantPanel element not found!');
  if (!assistantToggle) console.warn('[Renderer] WARNING: assistantToggle element not found!');
  
  // Wire up UI and initialize features
  wireUI();
  init();
  
  console.log('[Renderer] Initialization complete');
});
// ===================================================================
// NAVIGATION HELPERS
// ===================================================================
function navigateTo(rawUrl) {
  if (!webview) {
    console.warn('[Renderer] navigateTo: webview not available');
    return;
  }
  let url = rawUrl.trim();
  if (!url) return;
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  webview.src = url;
  if (urlInput) urlInput.value = url;
  updateNavButtons();
}
function updateNavButtons() {
  if (!webview) return;
  if (backBtn) backBtn.disabled = !webview.canGoBack();
  if (forwardBtn) forwardBtn.disabled = !webview.canGoForward();
}
// ===================================================================
// AI SUPERAGENT - MILESTONE 3: LLM PLANNER & EXECUTOR
// ===================================================================
/**
 * Available tools registry
 * Each tool has: name, description, params schema, and execute function
 */
const AVAILABLE_TOOLS = [
  {
    name: 'search',
    description: 'Search the web for information',
    params: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] },
    async execute({ query }) {
      navigateTo(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
      return { status: 'search_started', query };
    }
  },
  {
    name: 'navigate',
    description: 'Navigate to a specific URL',
    params: { type: 'object', properties: { url: { type: 'string' } }, required: ['url'] },
    async execute({ url }) {
      navigateTo(url);
      return { status: 'navigated', url };
    }
  },
  {
    name: 'get_page_content',
    description: 'Extract text content from the current page',
    params: { type: 'object', properties: {} },
    async execute() {
      if (!webview) return { error: 'Webview not available' };
      try {
        const content = await webview.executeJavaScript('document.body.innerText');
        return { status: 'success', content: content.slice(0, 5000) };
      } catch (err) {
        return { error: err.message };
      }
    }
  }
];
/**
 * Execute a single tool by name with provided parameters
 */
async function executeTool(toolName, params) {
  const tool = AVAILABLE_TOOLS.find(t => t.name === toolName);
  if (!tool) {
    return { error: `Tool "${toolName}" not found` };
  }
  try {
    return await tool.execute(params);
  } catch (err) {
    return { error: err.message };
  }
}
/**
 * Send user prompt to /api/model/plan, get back a list of steps
 */
async function fetchPlan(userPrompt) {
  try {
    const resp = await fetch('http://localhost:3000/api/model/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: userPrompt,
        tools: AVAILABLE_TOOLS.map(t => ({ name: t.name, description: t.description, params: t.params }))
      })
    });
    if (!resp.ok) throw new Error(`Plan API error: ${resp.status}`);
    const data = await resp.json();
    return data.steps || [];
  } catch (err) {
    console.error('[Renderer] fetchPlan error:', err);
    return [];
  }
}
/**
 * Execute each step in the plan sequentially
 */
async function executePlan(steps) {
  const results = [];
  for (const step of steps) {
    appendMessage('assistant', `Executing: ${step.tool} with ${JSON.stringify(step.params)}`);
    const result = await executeTool(step.tool, step.params);
    results.push(result);
    appendMessage('assistant', `Result: ${JSON.stringify(result)}`);
  }
  return results;
}
/**
 * Main handler when user clicks "Send" in assistant chat
 */
async function handleSendMessage() {
  if (!chatInput || !chatMessages) {
    console.warn('[Renderer] handleSendMessage: chat elements not available');
    return;
  }
  
  const userMsg = chatInput.value.trim();
  if (!userMsg) return;
  
  appendMessage('user', userMsg);
  chatInput.value = '';
  
  // Show thinking indicator
  appendMessage('assistant', 'Thinking...');
  
  // 1) Get plan from LLM
  const steps = await fetchPlan(userMsg);
  
  // 2) Execute plan
  if (steps.length > 0) {
    await executePlan(steps);
    appendMessage('assistant', 'Done!');
  } else {
    appendMessage('assistant', 'No plan generated. Please try a different prompt.');
  }
}
function appendMessage(role, text) {
  if (!chatMessages) return;
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', role === 'user' ? 'user-message' : 'assistant-message');
  msgDiv.textContent = `[${role}] ${text}`;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
// ===================================================================
// WIRE UP UI EVENTS
// ===================================================================
function wireUI() {
  console.log('[Renderer] wireUI called');
  
  // Navigation buttons
  if (goBtn && urlInput) {
    goBtn.addEventListener('click', () => navigateTo(urlInput.value));
  } else {
    console.warn('[Renderer] wireUI: goBtn or urlInput not available for navigation');
  }
  
  if (urlInput) {
    urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') navigateTo(urlInput.value);
    });
  }
  
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (webview) webview.goBack();
    });
  }
  
  if (forwardBtn) {
    forwardBtn.addEventListener('click', () => {
      if (webview) webview.goForward();
    });
  }
  
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      if (webview) webview.reload();
    });
  }
  
  // Assistant chat
  if (chatSend) {
    chatSend.addEventListener('click', handleSendMessage);
  } else {
    console.warn('[Renderer] wireUI: chatSend button not available');
  }
  
  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSendMessage();
    });
  }
  
  // Assistant toggle
  if (assistantToggle && assistantPanel) {
    assistantToggle.addEventListener('click', () => {
      const isOpen = assistantPanel.classList.toggle('open');
      assistantToggle.setAttribute('aria-expanded', isOpen.toString());
    });
  } else {
    console.warn('[Renderer] wireUI: assistantToggle or assistantPanel not available');
  }
  
  // Webview event listeners
  if (webview) {
    webview.addEventListener('did-start-loading', () => {
      if (urlInput) urlInput.value = webview.getURL();
    });
    webview.addEventListener('did-stop-loading', updateNavButtons);
  } else {
    console.warn('[Renderer] wireUI: webview not available for event listeners');
  }
  
  // Tab switching
  if (tabItems && tabItems.length > 0) {
    tabItems.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabItems.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
      });
    });
  }
}
// ===================================================================
// INITIALIZATION
// ===================================================================
function init() {
  console.log('[Renderer] init called');
  
  // Only initialize if critical elements are present
  if (!webview) {
    console.error('[Renderer] init: Cannot initialize without webview element');
    return;
  }
  
  // Load default page
  navigateTo('https://www.google.com');
  
  // Additional initialization logic here
  console.log('[Renderer] init: Default page loaded');
}
