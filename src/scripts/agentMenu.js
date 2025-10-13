/**
 * Agent Menu UI Component - Milestone 2
 * 
 * Provides the user interface for selecting and configuring prebuilt agents
 * with tier-based AI mode toggling and upsell messaging.
 * 
 * User Testing Flow:
 * 1. Free Tier (Tier 1):
 *    - Can select any prebuilt agent
 *    - "Make Smarter" toggle is visible but locked with upsell message
 *    - Clicking locked toggle shows upgrade prompt
 * 
 * 2. Upgraded Tier (Tier 2):
 *    - Can select any prebuilt agent
 *    - "Make Smarter" toggle is enabled
 *    - Can select AI model provider (OpenAI, Claude, Perplexity)
 *    - Uses platform API keys (backend routing)
 * 
 * 3. Premium Tier (Tier 3):
 *    - All Tier 2 features
 *    - Additional option to input own API keys
 *    - Direct API routing available
 */

class AgentMenuUI {
  constructor(containerId, agentConfigManager) {
    this.container = document.getElementById(containerId);
    this.configManager = agentConfigManager;
    this.selectedAgent = null;
    this.aiEnabled = false;
    
    this.init();
  }

  init() {
    if (!this.container) {
      console.error('Agent menu container not found');
      return;
    }
    
    this.render();
    this.attachEventListeners();
  }

  render() {
    const agents = this.configManager.getAvailableAgents(false);
    const isAIAvailable = this.configManager.isAIModeAvailable();
    const currentTier = this.configManager.currentTier;
    
    this.container.innerHTML = `
      <div class="agent-menu">
        <div class="agent-menu-header">
          <h2>🤖 Prebuilt Agents</h2>
          <p class="agent-menu-subtitle">Select an agent and configure its capabilities</p>
        </div>

        <!-- Agent Selection Grid -->
        <div class="agent-grid">
          ${agents.map(agent => `
            <div class="agent-card" data-agent-id="${agent.id}">
              <div class="agent-icon">${agent.icon}</div>
              <h3 class="agent-name">${agent.name}</h3>
              <p class="agent-description">${agent.description}</p>
              <button class="agent-select-btn" data-agent-id="${agent.id}">
                Select Agent
              </button>
            </div>
          `).join('')}
        </div>

        <!-- Agent Configuration Panel -->
        <div class="agent-config-panel" id="agentConfigPanel" style="display: none;">
          <h3 id="selectedAgentName">Agent Configuration</h3>
          
          <!-- AI Mode Toggle Section -->
          <div class="config-section">
            <div class="config-header">
              <label class="toggle-label">
                <span class="toggle-title">🧠 Make Smarter (AI-Enabled)</span>
                <span class="toggle-subtitle">Enable advanced AI capabilities</span>
              </label>
              <div class="toggle-wrapper ${!isAIAvailable ? 'locked' : ''}">
                <label class="switch">
                  <input 
                    type="checkbox" 
                    id="aiModeToggle" 
                    ${!isAIAvailable ? 'disabled' : ''}
                  />
                  <span class="slider"></span>
                </label>
                ${!isAIAvailable ? '<span class="lock-icon">🔒</span>' : ''}
              </div>
            </div>
            
            <!-- Upsell Message for Free Tier -->
            ${!isAIAvailable ? `
              <div class="upsell-message">
                <div class="upsell-content">
                  <p class="upsell-text">${this.configManager.getUpsellMessage()}</p>
                  <button class="upgrade-btn" id="upgradeBtn">
                    ⚡ Upgrade Now
                  </button>
                </div>
              </div>
            ` : ''}
          </div>

          <!-- AI Model Provider Selection (Tier 2+) -->
          <div class="config-section" id="modelProviderSection" style="display: none;">
            <h4>AI Model Provider</h4>
            <div class="provider-selector">
              <label class="provider-option">
                <input type="radio" name="provider" value="openai" checked />
                <span class="provider-label">
                  <strong>OpenAI</strong>
                  <span class="provider-desc">GPT-4, GPT-3.5</span>
                </span>
              </label>
              <label class="provider-option">
                <input type="radio" name="provider" value="claude" />
                <span class="provider-label">
                  <strong>Claude</strong>
                  <span class="provider-desc">Claude 3 Opus, Sonnet</span>
                </span>
              </label>
              <label class="provider-option">
                <input type="radio" name="provider" value="perplexity" />
                <span class="provider-label">
                  <strong>Perplexity</strong>
                  <span class="provider-desc">Perplexity AI</span>
                </span>
              </label>
            </div>

            <!-- API Key Input (Tier 3 Only) -->
            ${currentTier === 3 ? `
              <div class="api-key-section">
                <h5>Use Your Own API Key (Optional)</h5>
                <p class="api-key-note">Leave blank to use platform keys</p>
                <input 
                  type="password" 
                  id="apiKeyInput" 
                  class="api-key-input" 
                  placeholder="Enter your API key..."
                />
                <button class="save-key-btn" id="saveKeyBtn">Save Key</button>
              </div>
            ` : `
              <p class="api-routing-note">
                ℹ️ Using platform API keys (no additional setup required)
              </p>
            `}
          </div>

          <!-- Action Buttons -->
          <div class="config-actions">
            <button class="action-btn secondary" id="cancelConfigBtn">Cancel</button>
            <button class="action-btn primary" id="startAgentBtn">Start Agent</button>
          </div>
        </div>

        <!-- Debug Info (for testing) -->
        <div class="debug-info" id="debugInfo" style="display: none;">
          <h4>Debug Information</h4>
          <pre id="debugContent"></pre>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Agent selection
    const selectButtons = this.container.querySelectorAll('.agent-select-btn');
    selectButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const agentId = e.target.dataset.agentId;
        this.selectAgent(agentId);
      });
    });

    // AI mode toggle
    const aiToggle = document.getElementById('aiModeToggle');
    if (aiToggle) {
      aiToggle.addEventListener('change', (e) => {
        this.toggleAIMode(e.target.checked);
      });
    }

    // Upgrade button
    const upgradeBtn = document.getElementById('upgradeBtn');
    if (upgradeBtn) {
      upgradeBtn.addEventListener('click', () => {
        this.showUpgradeModal();
      });
    }

    // Model provider selection
    const providerRadios = this.container.querySelectorAll('input[name="provider"]');
    providerRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.configManager.setModelProvider(e.target.value);
        this.updateDebugInfo();
      });
    });

    // API key save (Tier 3)
    const saveKeyBtn = document.getElementById('saveKeyBtn');
    if (saveKeyBtn) {
      saveKeyBtn.addEventListener('click', () => {
        const apiKeyInput = document.getElementById('apiKeyInput');
        const provider = this.container.querySelector('input[name="provider"]:checked').value;
        if (apiKeyInput && apiKeyInput.value) {
          this.configManager.setUserAPIKey(provider, apiKeyInput.value);
          alert('API key saved successfully!');
          this.updateDebugInfo();
        }
      });
    }

    // Action buttons
    const cancelBtn = document.getElementById('cancelConfigBtn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.hideConfigPanel();
      });
    }

    const startBtn = document.getElementById('startAgentBtn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        this.startAgent();
      });
    }
  }

  selectAgent(agentId) {
    this.selectedAgent = agentId;
    const agent = window.AgentConfig.PREBUILT_AGENTS.find(a => a.id === agentId);
    
    if (agent) {
      // Update panel
      const panel = document.getElementById('agentConfigPanel');
      const agentNameElement = document.getElementById('selectedAgentName');
      
      if (agentNameElement) {
        agentNameElement.textContent = `${agent.icon} ${agent.name} Configuration`;
      }
      
      if (panel) {
        panel.style.display = 'block';
      }
      
      // Reset AI toggle
      const aiToggle = document.getElementById('aiModeToggle');
      if (aiToggle) {
        aiToggle.checked = false;
        this.aiEnabled = false;
      }
      
      // Hide model provider section initially
      const modelSection = document.getElementById('modelProviderSection');
      if (modelSection) {
        modelSection.style.display = 'none';
      }
      
      this.updateDebugInfo();
    }
  }

  toggleAIMode(enabled) {
    this.aiEnabled = enabled;
    const modelSection = document.getElementById('modelProviderSection');
    
    if (modelSection) {
      modelSection.style.display = enabled ? 'block' : 'none';
    }
    
    this.updateDebugInfo();
  }

  hideConfigPanel() {
    const panel = document.getElementById('agentConfigPanel');
    if (panel) {
      panel.style.display = 'none';
    }
    this.selectedAgent = null;
    this.aiEnabled = false;
  }

  startAgent() {
    if (!this.selectedAgent) {
      alert('Please select an agent first');
      return;
    }

    const config = this.configManager.createAgentConfig(this.selectedAgent, this.aiEnabled);
    
    if (config) {
      console.log('Starting agent with config:', config);
      
      // Show debug info
      const debugInfo = document.getElementById('debugInfo');
      if (debugInfo) {
        debugInfo.style.display = 'block';
      }
      this.updateDebugInfo();
      
      // Emit event for agent start
      const event = new CustomEvent('agentStart', { detail: config });
      document.dispatchEvent(event);
      
      alert(`Agent "${config.agent.name}" started in ${config.mode} mode!\n\nCheck the debug section for configuration details.`);
    }
  }

  showUpgradeModal() {
    // For now, show an alert. In production, this would open a proper modal/page
    alert(
      'Upgrade to unlock AI-powered agents!\n\n' +
      'Benefits:\n' +
      '✨ Access to GPT-4, Claude 3, and Perplexity AI\n' +
      '🚀 10x faster automation\n' +
      '🎯 More accurate results\n' +
      '💡 Advanced reasoning capabilities\n\n' +
      'Plans start at $9.99/month'
    );
  }

  updateDebugInfo() {
    const debugContent = document.getElementById('debugContent');
    if (!debugContent || !this.selectedAgent) return;

    const config = this.configManager.createAgentConfig(this.selectedAgent, this.aiEnabled);
    debugContent.textContent = JSON.stringify(config, null, 2);
  }

  // Public method to change tier (for testing)
  setTier(tier) {
    this.configManager.setTier(tier);
    this.render();
    this.attachEventListeners();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AgentMenuUI;
}

// Browser global export
if (typeof window !== 'undefined') {
  window.AgentMenuUI = AgentMenuUI;
}
