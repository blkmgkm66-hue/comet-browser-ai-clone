/**
 * Frontend Renderer - Milestone 3 Update
 * LLM Planner Integration & Multi-Tool Executor
 * 
 * New additions:
 * - Async plan POST to /api/model/plan
 * - Plan execution loop
 * - Tool execution shell (extensible framework)
 */

// ===================================================================
// DOM ELEMENT REFERENCES
// ===================================================================
const webview = document.getElementById('browser-webview');
const urlInput = document.getElementById('url-input');
const goBtn = document.getElementById('go-btn');
const backBtn = document.getElementById('back-btn');
const forwardBtn = document.getElementById('forward-btn');
const refreshBtn = document.getElementById('refresh-btn');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');
const chatMessages = document.getElementById('chat-messages');
const tabItems = document.querySelectorAll('.tab-item');

// ===================================================================
// NAVIGATION HELPERS
// ===================================================================
function navigateTo(rawUrl) {
  if (!webview) return;
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

if (webview) {
  webview.addEventListener('did-start-loading', () => {
    if (urlInput) urlInput.value = webview.getURL();
  });
  webview.addEventListener('did-stop-loading', updateNavButtons);
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
    params: { query: 'string' },
    execute: async (params) => {
      return { status: 'success', data: `Search results for: ${params.query}` };
    }
  },
  {
    name: 'navigate',
    description: 'Navigate browser to a URL',
    params: { url: 'string' },
    execute: async (params) => {
      navigateTo(params.url);
      return { status: 'success', data: `Navigated to ${params.url}` };
    }
  },
  {
    name: 'analyze',
    description: 'Analyze page content',
    params: { selector: 'string?' },
    execute: async (params) => {
      return { status: 'success', data: 'Content analysis complete' };
    }
  },
  {
    name: 'extract',
    description: 'Extract data from current page',
    params: { fields: 'array' },
    execute: async (params) => {
      return { status: 'success', data: { extracted: params.fields } };
    }
  }
];

/**
 * Request a plan from the LLM planner backend
 * @param {string} query - User's natural language query
 * @param {object} context - Additional context (current URL, page state, etc.)
 * @returns {Promise<object>} Plan response with steps array
 */
async function requestPlan(query, context = {}) {
  try {
    addChatMessage('system', `🤖 Planning: "${query}"...`);

    const response = await fetch('http://localhost:3000/api/model/plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        tools: AVAILABLE_TOOLS.map(t => ({
          name: t.name,
          description: t.description,
          params: t.params
        })),
        context: {
          ...context,
          currentUrl: webview?.getURL?.() || '',
          timestamp: new Date().toISOString()
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      addChatMessage('system', `✅ Plan created: ${result.plan.length} steps`);
      return result;
    } else {
      addChatMessage('error', `⚠️ Planning failed: ${result.error}`);
      return result;
    }
  } catch (error) {
    addChatMessage('error', `❌ Plan request failed: ${error.message}`);
    return {
      success: false,
      error: error.message,
      fallback: [{
        tool: 'manual',
        action: 'Manual execution required',
        params: { query }
      }]
    };
  }
}

/**
 * Execute a single tool from the plan
 * @param {object} step - Plan step with tool, action, params
 * @returns {Promise<object>} Tool execution result
 */
async function executeTool(step) {
  const { tool, action, params } = step;
  
  addChatMessage('system', `🔧 Executing: ${action}`);
  
  try {
    // Find the tool in registry
    const toolDefinition = AVAILABLE_TOOLS.find(t => t.name === tool);
    
    if (!toolDefinition) {
      throw new Error(`Unknown tool: ${tool}`);
    }
    
    // Execute the tool
    const result = await toolDefinition.execute(params);
    
    addChatMessage('system', `✓ ${action} completed`);
    
    return {
      success: true,
      tool,
      action,
      result
    };
  } catch (error) {
    addChatMessage('error', `✗ ${action} failed: ${error.message}`);
    
    return {
      success: false,
      tool,
      action,
      error: error.message
    };
  }
}

/**
 * Execute a complete plan from the LLM planner
 * @param {array} plan - Array of plan steps
 * @returns {Promise<array>} Array of execution results
 */
async function executePlan(plan) {
  const results = [];
  
  addChatMessage('system', `🚀 Executing plan with ${plan.length} steps...`);
  
  for (let i = 0; i < plan.length; i++) {
    const step = plan[i];
    addChatMessage('system', `Step ${i + 1}/${plan.length}: ${step.action}`);
    
    const result = await executeTool(step);
    results.push(result);
    
    // If a step fails, decide whether to continue or stop
    if (!result.success) {
      addChatMessage('warning', `⚠️ Step ${i + 1} failed, continuing...`);
      // Could add logic here to stop on critical failures
    }
    
    // Small delay between steps for UX
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  addChatMessage('system', `✅ Plan execution complete: ${results.filter(r => r.success).length}/${results.length} successful`);
  
  return results;
}

/**
 * Main command handler for superagent queries
 * Routes between direct commands and LLM-planned actions
 */
async function runCommand(cmd) {
  const trimmed = cmd.trim().toLowerCase();
  
  // Direct command shortcuts (bypass planner)
  if (trimmed.startsWith('go ') || trimmed.startsWith('nav ')) {
    const url = cmd.slice(trimmed.indexOf(' ') + 1);
    navigateTo(url);
    addChatMessage('user', cmd);
    addChatMessage('assistant', `Navigating to ${url}`);
    return;
  }
  
  // LLM Superagent mode (default)
  addChatMessage('user', cmd);
  
  try {
    // Step 1: Request plan from backend
    const planResponse = await requestPlan(cmd, {
      userIntent: 'web_automation',
      browserState: 'ready'
    });
    
    if (!planResponse.success) {
      addChatMessage('assistant', 'I couldn\'t create a plan for that. Try rephrasing?');
      return;
    }
    
    // Step 2: Execute the plan
    const results = await executePlan(planResponse.plan);
    
    // Step 3: Summarize results
    const successCount = results.filter(r => r.success).length;
    const summary = `Completed ${successCount}/${results.length} actions successfully.`;
    addChatMessage('assistant', summary);
  } catch (error) {
    addChatMessage('error', `Command execution failed: ${error.message}`);
  }
}

// ===================================================================
// CHAT MESSAGE RENDERING
// ===================================================================
function addChatMessage(role, text) {
  if (!chatMessages) return;
  const msg = document.createElement('div');
  msg.className = `chat-message chat-${role}`;
  msg.textContent = text;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ===================================================================
// TAB SWITCHING
// ===================================================================
if (tabItems) {
  tabItems.forEach((item) => {
    item.addEventListener('click', () => {
      const target = item.getAttribute('data-tab');
      if (!target) return;
      document.querySelectorAll('.tab-item').forEach((t) => t.classList.remove('active'));
      item.classList.add('active');
      document.querySelectorAll('.tab-content').forEach((c) => c.classList.remove('active'));
      const panel = document.getElementById(`${target}-panel`);
      if (panel) panel.classList.add('active');
    });
  });
}

// ===================================================================
// UI EVENT WIRING
// ===================================================================
function wireUI() {
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
