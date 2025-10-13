/**
 * Agent Configuration System for Milestone 2
 * 
 * This module manages prebuilt agents and their AI capabilities
 * with tier-based feature gating.
 * 
 * Engineering Notes:
 * - Local-only agents work for all tiers
 * - AI-enabled (smart) agents require tier 2 or 3
 * - Model selection routing varies by tier
 * - User testing should verify toggle states and upsell messaging
 */

// Tier definitions
const TIERS = {
  FREE: 1,
  UPGRADED: 2,
  PREMIUM: 3
};

// Model provider configurations
const MODEL_PROVIDERS = {
  OPENAI: 'openai',
  CLAUDE: 'claude',
  PERPLEXITY: 'perplexity'
};

// Prebuilt agent definitions
const PREBUILT_AGENTS = [
  {
    id: 'web-scraper',
    name: 'Web Scraper',
    description: 'Extract structured data from websites',
    localOnly: true,
    supportsAI: true,
    icon: '🌐'
  },
  {
    id: 'data-analyzer',
    name: 'Data Analyzer',
    description: 'Analyze and visualize data patterns',
    localOnly: true,
    supportsAI: true,
    icon: '📊'
  },
  {
    id: 'content-summarizer',
    name: 'Content Summarizer',
    description: 'Summarize articles and documents',
    localOnly: true,
    supportsAI: true,
    icon: '📝'
  },
  {
    id: 'research-assistant',
    name: 'Research Assistant',
    description: 'Help with research and fact-checking',
    localOnly: true,
    supportsAI: true,
    icon: '🔍'
  }
];

/**
 * Agent Configuration Manager
 */
class AgentConfigManager {
  constructor() {
    this.currentTier = TIERS.FREE; // Default to free tier
    this.selectedProvider = MODEL_PROVIDERS.OPENAI;
    this.userApiKeys = {}; // For tier 3 users
  }

  /**
   * Set the user's subscription tier
   * @param {number} tier - User's subscription tier (1, 2, or 3)
   */
  setTier(tier) {
    if (Object.values(TIERS).includes(tier)) {
      this.currentTier = tier;
      console.log(`Tier set to: ${tier}`);
    } else {
      console.error('Invalid tier:', tier);
    }
  }

  /**
   * Check if AI mode is available for current tier
   * @returns {boolean}
   */
  isAIModeAvailable() {
    return this.currentTier >= TIERS.UPGRADED;
  }

  /**
   * Get available agents for current tier
   * @param {boolean} aiEnabled - Whether AI mode is requested
   * @returns {Array} List of available agents
   */
  getAvailableAgents(aiEnabled = false) {
    return PREBUILT_AGENTS.filter(agent => {
      if (aiEnabled && !this.isAIModeAvailable()) {
        return false; // AI mode not available for this tier
      }
      return true;
    });
  }

  /**
   * Get upsell message for locked features
   * @returns {string} Upsell message
   */
  getUpsellMessage() {
    if (this.currentTier === TIERS.FREE) {
      return 'Upgrade to unlock AI-powered agents with advanced capabilities! Get smarter automation with GPT-4, Claude, and more.';
    }
    return '';
  }

  /**
   * Set model provider (OpenAI, Claude, Perplexity)
   * @param {string} provider - Provider name
   */
  setModelProvider(provider) {
    if (Object.values(MODEL_PROVIDERS).includes(provider)) {
      this.selectedProvider = provider;
      console.log(`Model provider set to: ${provider}`);
    } else {
      console.error('Invalid provider:', provider);
    }
  }

  /**
   * Get API routing configuration based on tier
   * @returns {Object} API routing config
   */
  getAPIRoutingConfig() {
    const config = {
      provider: this.selectedProvider,
      useUserKeys: false,
      endpoint: ''
    };

    // Tier 1 & 2: Use platform API keys (routed through backend)
    if (this.currentTier <= TIERS.UPGRADED) {
      config.useUserKeys = false;
      config.endpoint = `/api/proxy/${this.selectedProvider}`;
      config.note = 'Using platform API keys (routed via backend)';
    }
    // Tier 3: Allow user's own API keys
    else if (this.currentTier === TIERS.PREMIUM) {
      config.useUserKeys = true;
      config.endpoint = `/api/direct/${this.selectedProvider}`;
      config.apiKey = this.userApiKeys[this.selectedProvider] || '';
      config.note = 'Using user-provided API keys';
    }

    return config;
  }

  /**
   * Set user API key for a provider (Tier 3 only)
   * @param {string} provider - Provider name
   * @param {string} apiKey - User's API key
   */
  setUserAPIKey(provider, apiKey) {
    if (this.currentTier !== TIERS.PREMIUM) {
      console.warn('User API keys only available for Premium tier (Tier 3)');
      return false;
    }

    if (Object.values(MODEL_PROVIDERS).includes(provider)) {
      this.userApiKeys[provider] = apiKey;
      console.log(`API key set for provider: ${provider}`);
      return true;
    }
    return false;
  }

  /**
   * Create agent configuration object
   * @param {string} agentId - Agent ID
   * @param {boolean} aiEnabled - Whether AI mode is enabled
   * @returns {Object} Agent configuration
   */
  createAgentConfig(agentId, aiEnabled = false) {
    const agent = PREBUILT_AGENTS.find(a => a.id === agentId);
    if (!agent) {
      console.error('Agent not found:', agentId);
      return null;
    }

    const config = {
      agent: agent,
      aiEnabled: aiEnabled && this.isAIModeAvailable(),
      mode: (aiEnabled && this.isAIModeAvailable()) ? 'smart' : 'local',
      apiConfig: null
    };

    // Add API config if AI is enabled
    if (config.aiEnabled) {
      config.apiConfig = this.getAPIRoutingConfig();
    }

    return config;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AgentConfigManager,
    TIERS,
    MODEL_PROVIDERS,
    PREBUILT_AGENTS
  };
}

// Browser global export
if (typeof window !== 'undefined') {
  window.AgentConfig = {
    AgentConfigManager,
    TIERS,
    MODEL_PROVIDERS,
    PREBUILT_AGENTS
  };
}
