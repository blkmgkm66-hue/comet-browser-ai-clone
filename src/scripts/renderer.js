// ===================================================================
// COMET BROWSER - RENDERER PROCESS
// Main renderer script for browser UI and webview functionality
// ===================================================================

// ===================================================================
// MILESTONE [2025-10-15]
// Phase 1, Week 2: Layout & Modal System enhancements
// - Added dark mode CSS variable support
// - Implemented hover/focus/active states for all interactive elements
// - Assistant panel always mounted with toggle functionality
// - Sidebar auto-slide animation stubs (mouse-in/mouse-leave)
// - Added ARIA roles and labels for accessibility
// - Comments for future routing areas
// ===================================================================

// ===================================================================
// DOM ELEMENT REFERENCES
// Core browser and AI assistant UI elements
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

// Assistant panel elements (always mounted)
const assistantPanel = document.getElementById('assistant-panel');
const assistantToggle = document.getElementById('assistant-toggle');
const assistantClose = document.getElementById('assistant-close');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');

// Agent catalog elements
const agentCatalog = document.getElementById('agent-catalog');
const agentCards = document.querySelectorAll('.agent-card');

// ===================================================================
// SIDEBAR NAVIGATION & AUTO-SLIDE ANIMATION
// TODO(future): Deep routing for different views (home, agents, history, settings)
// ===================================================================

let sidebarExpanded = true;
let sidebarHoverTimeout = null;

// Sidebar toggle button handler
if (sidebarToggle) {
  sidebarToggle.addEventListener('click', () => {
    toggleSidebar();
  });
}

// Sidebar mouse-in/mouse-leave animation stub for auto-slide
// TODO(future): Refine timing and animation curves
if (sidebar) {
  sidebar.addEventListener('mouseenter', () => {
    clearTimeout(sidebarHoverTimeout);
    if (!sidebarExpanded) {
      expandSidebar();
    }
  });

  sidebar.addEventListener('mouseleave', () => {
    if (!sidebarExpanded) {
      sidebarHoverTimeout = setTimeout(() => {
        collapseSidebar();
      }, 300);
    }
  });
}

// Sidebar item click handlers
// TODO(future routing): Implement proper routing system for different views
sidebarItems.forEach(item => {
  item.addEventListener('click', () => {
    const view = item.getAttribute('data-view');
    
    // Remove active class from all items
    sidebarItems.forEach(i => i.classList.remove('active'));
    
    // Add active class to clicked item
    item.classList.add('active');
    
    // TODO(future routing): Route to appropriate view
    console.log(`[STUB] Navigate to view: ${view}`);
    console.log('[STUB] Future routing implementation will load:', view);
    
    // Placeholder for different views
    switch(view) {
      case 'home':
        // TODO: Show home/dashboard view
        break;
      case 'agents':
        // TODO: Show agents configuration view
        break;
      case 'history':
        // TODO: Show browsing history view
        break;
      case 'settings':
        // TODO: Show settings view
        break;
      default:
        console.warn('Unknown view:', view);
    }
  });
});

function toggleSidebar() {
  sidebarExpanded = !sidebarExpanded;
  if (sidebarExpanded) {
    expandSidebar();
  } else {
    collapseSidebar();
    // Trigger immediate auto-hide on close
    sidebar?.classList.add('auto-hidden');
  }
}

function expandSidebar() {
  sidebar?.classList.remove('collapsed', 'auto-hidden');
  sidebar?.classList.add('expanded');
  sidebarToggle?.setAttribute('aria-expanded', 'true');
  sidebarToggle?.setAttribute('aria-label', 'Collapse sidebar');
}

function collapseSidebar() {
  sidebar?.classList.remove('expanded');
  sidebar?.classList.add('collapsed');
  sidebarToggle?.setAttribute('aria-expanded', 'false');
  sidebarToggle?.setAttribute('aria-label', 'Expand sidebar');
}

// ===================================================================
// BROWSER NAVIGATION CONTROLS
// Toolbar buttons with hover/focus/active state support
// ===================================================================

if (backBtn) {
  backBtn.addEventListener('click', () => {
    webview?.goBack();
    console.log('[STUB] Navigate back - Not implemented yet');
  });
}

if (forwardBtn) {
  forwardBtn.addEventListener('click', () => {
    webview?.goForward();
    console.log('[STUB] Navigate forward - Not implemented yet');
  });
}

if (refreshBtn) {
  refreshBtn.addEventListener('click', () => {
    webview?.reload();
    console.log('[STUB] Refresh page - Not implemented yet');
  });
}

if (goBtn) {
  goBtn.addEventListener('click', () => {
    navigateToUrl();
  });
}

if (urlInput) {
  urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      navigateToUrl();
    }
  });
}

function navigateToUrl() {
  const url = urlInput?.value.trim();
  if (!url) return;
  
  console.log('[STUB] Navigate to:', url);
  console.log('[STUB] Webview navigation not fully implemented yet');
  
  // TODO: Implement actual navigation
  // webview.src = formatUrl(url);
}

// ===================================================================
// ASSISTANT PANEL - ALWAYS MOUNTED WITH TOGGLE
// Includes model selection dropdown (stub with local/API dummy entries)
// ===================================================================

// Assistant panel is always mounted in DOM
// Toggle visibility with button
if (assistantToggle) {
  assistantToggle.addEventListener('click', () => {
    toggleAssistantPanel();
  });
}

if (assistantClose) {
  assistantClose.addEventListener('click', () => {
    hideAssistantPanel();
  });
}

function toggleAssistantPanel() {
  const isVisible = assistantPanel?.classList.contains('visible');
  if (isVisible) {
    hideAssistantPanel();
  } else {
    showAssistantPanel();
  }
}

function showAssistantPanel() {
  assistantPanel?.classList.add('visible');
  assistantToggle?.setAttribute('aria-expanded', 'true');
  assistantToggle?.setAttribute('aria-label', 'Close assistant panel');
  console.log('[INFO] Assistant panel opened');
}

function hideAssistantPanel() {
  assistantPanel?.classList.remove('visible');
  assistantToggle?.setAttribute('aria-expanded', 'false');
  assistantToggle?.setAttribute('aria-label', 'Open assistant panel');
  console.log('[INFO] Assistant panel closed');
}

// Model selection dropdown (stub)
// TODO(future): Integrate with actual API providers
function createModelSelector() {
  console.log('[STUB] Model selector - Local models:');
  console.log('  - Local Model 1 (stub)');
  console.log('  - Local Model 2 (stub)');
  console.log('[STUB] Model selector - API models:');
  console.log('  - GPT-4 (stub)');
  console.log('  - Claude (stub)');
  console.log('  - Perplexity (stub)');
}

// Initialize model selector stub
createModelSelector();

// ===================================================================
// CHAT FUNCTIONALITY (STUB)
// TODO(future): Integrate with AI API and persist conversations
// ===================================================================

if (chatSend) {
  chatSend.addEventListener('click', () => {
    sendMessage();
  });
}

if (chatInput) {
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
}

function sendMessage() {
  const message = chatInput?.value.trim();
  if (!message) return;
  
  addMessageToChat('user', message);
  chatInput.value = '';
  
  // Stub response
  setTimeout(() => {
    addMessageToChat('assistant', '[STUB] AI response not implemented yet. This is a placeholder.');
  }, 500);
}

function addMessageToChat(sender, message) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${sender}-message`;
  messageDiv.setAttribute('role', sender === 'user' ? 'article' : 'article');
  messageDiv.setAttribute('aria-label', `${sender} message`);
  messageDiv.textContent = message;
  
  chatMessages?.appendChild(messageDiv);
  if (chatMessages) {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

// ===================================================================
// AGENT CATALOG - CLICK HANDLERS
// TODO(future): Implement agent configuration modal and launch
// ===================================================================

agentCards.forEach(card => {
  card.addEventListener('click', () => {
    const agentId = card.getAttribute('data-agent');
    console.log(`[STUB] Open agent configuration for: ${agentId}`);
    console.log('[STUB] Agent config modal not implemented yet');
    // TODO: Open agent configuration modal
  });
  
  // Add keyboard support
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.click();
    }
  });
});

// ===================================================================
// HOVER/FOCUS/ACTIVE STATE MANAGEMENT
// Visual feedback for all interactive elements
// ===================================================================

// Add focus-visible class for keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    document.body.classList.add('keyboard-navigation');
  }
});

document.addEventListener('mousedown', () => {
  document.body.classList.remove('keyboard-navigation');
});

// Button state indicators (for debugging)
function addButtonStateListeners(button) {
  if (!button) return;
  
  button.addEventListener('mouseenter', () => {
    console.log(`[HOVER] ${button.id || button.className}`);
  });
  
  button.addEventListener('focus', () => {
    console.log(`[FOCUS] ${button.id || button.className}`);
  });
  
  button.addEventListener('mousedown', () => {
    console.log(`[ACTIVE] ${button.id || button.className}`);
  });
}

// Apply to all buttons (debugging aid)
const allButtons = document.querySelectorAll('button, .agent-card, .sidebar-item');
allButtons.forEach(btn => addButtonStateListeners(btn));

// ===================================================================
// INITIALIZATION
// ===================================================================

(function init() {
  console.log('[INIT] Comet Browser renderer initialized');
  console.log('[INFO] Dark mode CSS variables applied');
  console.log('[INFO] Assistant panel mounted and ready');
  console.log('[INFO] Sidebar animation stubs active');
  console.log('[INFO] ARIA labels and roles configured');
  
  // Ensure assistant panel starts hidden
  hideAssistantPanel();
  
  // Set initial ARIA states
  sidebarToggle?.setAttribute('aria-expanded', 'true');
  sidebarToggle?.setAttribute('aria-label', 'Collapse sidebar');
  assistantToggle?.setAttribute('aria-expanded', 'false');
  assistantToggle?.setAttribute('aria-label', 'Open assistant panel');
  
  console.log('[READY] Comet Browser ready for use');
})();

// ===================================================================
// TODO: FUTURE ENHANCEMENTS
// - Deep routing system for sidebar navigation
// - Tab management with multi-tab support
// - Session persistence and restore
// - Agent configuration modal UI
// - AI API integration for chat
// - Model selection dropdown with real models
// - WebView navigation and history management
// - Keyboard shortcuts (Ctrl+T, Ctrl+W, etc.)
// - Error handling and user feedback
// ===================================================================
