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
 * - DOM startup validator for core UI stability
 */

// ===================================================================
// DOM ELEMENT REFERENCES & INITIALIZATION
// ===================================================================

// Declare element references at module scope
let webview, urlInput, goBtn, backBtn, forwardBtn, refreshBtn;
let chatInput, chatSend, chatMessages, tabItems;
let assistantPanel, assistantToggle;

// ===================================================================
// DOM STARTUP VALIDATOR
// ===================================================================

/**
 * Validates that all critical DOM elements are present at startup.
 * If any are missing, alerts the user and throws an error to prevent
 * the UI from running in a broken state.
 */
function validateCriticalElements() {
  const criticalIds = [
    'webview',
    'url-input',
    'go-btn',
    'back-btn',
    'forward-btn',
    'refresh-btn',
    'assistant-panel',
    'assistant-toggle',
    'chat-input',
    'chat-send',
    'chat-messages'
  ];

  const missing = [];
  
  for (const id of criticalIds) {
    if (!document.getElementById(id)) {
      missing.push(id);
    }
  }

  if (missing.length > 0) {
    const errorMsg = `CRITICAL ERROR: Missing required DOM elements: ${missing.join(', ')}`;
    alert(errorMsg);
    throw new Error(errorMsg);
  }
}

// Wrap all DOM initialization in DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Renderer] DOMContentLoaded fired - initializing elements...');
  
  // Validate critical elements first
  validateCriticalElements();
  
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
    console.error('[Renderer] navigateTo: webview not available');
    return;
  }
  
  let url = rawUrl.trim();
  
  // If no protocol, add https://
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }
  
  console.log('[Renderer] Navigating to:', url);
  webview.src = url;
}

function updateNavButtons() {
  if (!webview) {
    console.warn('[Renderer] updateNavButtons: webview not available');
    return;
  }
  
  if (backBtn) backBtn.disabled = !webview.canGoBack();
  if (forwardBtn) forwardBtn.disabled = !webview.canGoForward();
}

// ===================================================================
// UI WIRING
// ===================================================================

function wireUI() {
  console.log('[Renderer] wireUI called');
  
  // Navigation buttons
  if (goBtn) {
    goBtn.addEventListener('click', () => {
      if (urlInput) navigateTo(urlInput.value);
    });
  } else {
    console.warn('[Renderer] wireUI: goBtn not available');
  }
  
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (webview && webview.canGoBack()) webview.goBack();
    });
  } else {
    console.warn('[Renderer] wireUI: backBtn not available');
  }
  
  if (forwardBtn) {
    forwardBtn.addEventListener('click', () => {
      if (webview && webview.canGoForward()) webview.goForward();
    });
  } else {
    console.warn('[Renderer] wireUI: forwardBtn not available');
  }
  
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      if (webview) webview.reload();
    });
  } else {
    console.warn('[Renderer] wireUI: refreshBtn not available');
  }
  
  // URL input: Enter key navigation
  if (urlInput) {
    urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') navigateTo(urlInput.value);
    });
  } else {
    console.warn('[Renderer] wireUI: urlInput not available');
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

// ===================================================================
// ASSISTANT MESSAGE HANDLING
// ===================================================================

function handleSendMessage() {
  if (!chatInput || !chatMessages) {
    console.warn('[Renderer] handleSendMessage: Missing chat input or messages container');
    return;
  }
  
  const userMessage = chatInput.value.trim();
  if (!userMessage) return;
  
  // Display user message
  appendMessage('user', userMessage);
  chatInput.value = '';
  
  // Send to backend planner
  fetchPlanAndExecute(userMessage);
}

function appendMessage(role, content) {
  if (!chatMessages) {
    console.warn('[Renderer] appendMessage: chatMessages container not available');
    return;
  }
  
  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${role}-message`;
  msgDiv.textContent = content;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ===================================================================
// PLANNER INTEGRATION (Milestone 3)
// ===================================================================

async function fetchPlanAndExecute(userGoal) {
  try {
    appendMessage('system', 'Thinking...');
    
    // POST to planner
    const response = await fetch('http://localhost:3000/api/model/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal: userGoal })
    });
    
    if (!response.ok) {
      throw new Error(`Planner API error: ${response.status}`);
    }
    
    const plan = await response.json();
    console.log('[Renderer] Received plan:', plan);
    
    // Display plan summary
    appendMessage('assistant', `Plan: ${plan.steps ? plan.steps.length : 0} steps`);
    
    // Execute plan
    if (plan.steps && Array.isArray(plan.steps)) {
      for (const step of plan.steps) {
        await executeStep(step);
      }
      appendMessage('assistant', 'Plan complete!');
    } else {
      appendMessage('assistant', 'No executable steps in plan.');
    }
    
  } catch (error) {
    console.error('[Renderer] fetchPlanAndExecute error:', error);
    appendMessage('error', `Error: ${error.message}`);
  }
}

async function executeStep(step) {
  console.log('[Renderer] Executing step:', step);
  
  // Tool execution framework (extensible)
  const { tool, params } = step;
  
  switch (tool) {
    case 'navigate':
      if (params && params.url) {
        appendMessage('system', `Navigating to: ${params.url}`);
        navigateTo(params.url);
        // Wait for page load (simplified)
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      break;
      
    case 'click':
      if (params && params.selector) {
        appendMessage('system', `Clicking: ${params.selector}`);
        // TODO: Implement webview injection for click
      }
      break;
      
    case 'type':
      if (params && params.selector && params.text) {
        appendMessage('system', `Typing into: ${params.selector}`);
        // TODO: Implement webview injection for typing
      }
      break;
      
    default:
      console.warn('[Renderer] Unknown tool:', tool);
      appendMessage('system', `Unknown tool: ${tool}`);
  }
}
