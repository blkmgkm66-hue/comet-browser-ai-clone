/**
 * Model Router API - Milestone 2
 * 
 * Backend logic for routing AI model requests based on user tier
 * Handles API key management and model provider selection
 * 
 * Engineering Notes:
 * - Tier 1 & 2: Route through platform API keys (security-conscious backend proxy)
 * - Tier 3: Support user-provided API keys with direct routing
 * - All API keys stored securely (environment variables for platform, encrypted storage for user keys)
 * - Rate limiting and usage tracking should be implemented per tier
 * 
 * Implementation Status: Foundation ready for backend integration
 */

// Configuration constants
const API_ENDPOINTS = {
  openai: {
    base: 'https://api.openai.com/v1',
    chat: '/chat/completions',
    models: ['gpt-4', 'gpt-3.5-turbo']
  },
  claude: {
    base: 'https://api.anthropic.com/v1',
    messages: '/messages',
    models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229']
  },
  perplexity: {
    base: 'https://api.perplexity.ai',
    chat: '/chat/completions',
    models: ['pplx-7b-online', 'pplx-70b-online']
  }
};

// Rate limits per tier (requests per hour)
const RATE_LIMITS = {
  1: 10,    // Free tier: 10 requests/hour
  2: 100,   // Upgraded tier: 100 requests/hour
  3: 1000   // Premium tier: 1000 requests/hour (or unlimited with user keys)
};

/**
 * Model Router Class
 * Handles routing of AI model requests based on user tier and configuration
 */
class ModelRouter {
  constructor() {
    // In production, these would be loaded from secure environment variables
    this.platformKeys = {
      openai: process.env.OPENAI_API_KEY || 'PLATFORM_OPENAI_KEY',
      claude: process.env.ANTHROPIC_API_KEY || 'PLATFORM_CLAUDE_KEY',
      perplexity: process.env.PERPLEXITY_API_KEY || 'PLATFORM_PERPLEXITY_KEY'
    };

    // Usage tracking (in production, use Redis or database)
    this.usageTracking = new Map();
  }

  /**
   * Route a model request based on tier and configuration
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} API response
   */
  async routeRequest(params) {
    const {
      tier,
      provider,
      useUserKey,
      userApiKey,
      userId,
      prompt,
      model,
      ...additionalParams
    } = params;

    // Validate tier
    if (![1, 2, 3].includes(tier)) {
      throw new Error('Invalid tier');
    }

    // Check rate limits
    if (!this.checkRateLimit(userId, tier)) {
      throw new Error('Rate limit exceeded. Please upgrade or wait.');
    }

    // Determine API key to use
    let apiKey;
    let endpoint;

    if (tier === 3 && useUserKey && userApiKey) {
      // Tier 3: Use user-provided API key
      apiKey = userApiKey;
      endpoint = this.getDirectEndpoint(provider);
    } else {
      // Tier 1 & 2: Use platform API key
      apiKey = this.platformKeys[provider];
      endpoint = this.getProxyEndpoint(provider);
      
      if (!apiKey || apiKey.startsWith('PLATFORM_')) {
        throw new Error('Platform API key not configured. Please contact support.');
      }
    }

    // Make the API request
    try {
      const response = await this.makeRequest({
        provider,
        endpoint,
        apiKey,
        prompt,
        model,
        ...additionalParams
      });

      // Track usage
      this.trackUsage(userId, provider);

      return {
        success: true,
        data: response,
        metadata: {
          provider,
          model,
          tier,
          usedUserKey: tier === 3 && useUserKey
        }
      };
    } catch (error) {
      console.error('Model request failed:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          provider,
          tier
        }
      };
    }
  }

  /**
   * Make the actual API request to the model provider
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} API response
   */
  async makeRequest(params) {
    const { provider, endpoint, apiKey, prompt, model, ...additionalParams } = params;

    // Format request based on provider
    let requestBody;
    let headers;

    switch (provider) {
      case 'openai':
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        };
        requestBody = {
          model: model || 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          ...additionalParams
        };
        break;

      case 'claude':
        headers = {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2024-01-01'
        };
        requestBody = {
          model: model || 'claude-3-sonnet-20240229',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1024,
          ...additionalParams
        };
        break;

      case 'perplexity':
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        };
        requestBody = {
          model: model || 'pplx-7b-online',
          messages: [{ role: 'user', content: prompt }],
          ...additionalParams
        };
        break;

      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    // Make the HTTP request
    // Note: In browser environment, this would use fetch()
    // In Node.js backend, use axios or node-fetch
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `API request failed: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
      );
    }

    return await response.json();
  }

  /**
   * Get proxy endpoint for platform API key routing (Tier 1 & 2)
   * @param {string} provider - Model provider name
   * @returns {string} Endpoint URL
   */
  getProxyEndpoint(provider) {
    const baseUrl = '/api/proxy'; // Backend proxy endpoint
    const providerPath = API_ENDPOINTS[provider];
    
    if (!providerPath) {
      throw new Error(`Unknown provider: ${provider}`);
    }

    // Return the backend proxy route
    return `${baseUrl}/${provider}`;
  }

  /**
   * Get direct endpoint for user API key routing (Tier 3)
   * @param {string} provider - Model provider name
   * @returns {string} Endpoint URL
   */
  getDirectEndpoint(provider) {
    const providerConfig = API_ENDPOINTS[provider];
    
    if (!providerConfig) {
      throw new Error(`Unknown provider: ${provider}`);
    }

    // Return direct API endpoint
    switch (provider) {
      case 'openai':
        return `${providerConfig.base}${providerConfig.chat}`;
      case 'claude':
        return `${providerConfig.base}${providerConfig.messages}`;
      case 'perplexity':
        return `${providerConfig.base}${providerConfig.chat}`;
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  /**
   * Check if user is within rate limits
   * @param {string} userId - User identifier
   * @param {number} tier - User tier
   * @returns {boolean} Whether request is allowed
   */
  checkRateLimit(userId, tier) {
    const limit = RATE_LIMITS[tier];
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);

    // Get user's request history
    if (!this.usageTracking.has(userId)) {
      this.usageTracking.set(userId, []);
    }

    const userRequests = this.usageTracking.get(userId);
    
    // Filter to only requests in the last hour
    const recentRequests = userRequests.filter(timestamp => timestamp > hourAgo);
    this.usageTracking.set(userId, recentRequests);

    // Check if under limit
    return recentRequests.length < limit;
  }

  /**
   * Track usage for a user
   * @param {string} userId - User identifier
   * @param {string} provider - Model provider used
   */
  trackUsage(userId, provider) {
    if (!this.usageTracking.has(userId)) {
      this.usageTracking.set(userId, []);
    }

    const userRequests = this.usageTracking.get(userId);
    userRequests.push(Date.now());

    // Log usage for analytics (in production, send to analytics service)
    console.log(`Usage tracked: User ${userId} used ${provider} at ${new Date().toISOString()}`);
  }

  /**
   * Get usage statistics for a user
   * @param {string} userId - User identifier
   * @returns {Object} Usage statistics
   */
  getUserUsage(userId) {
    if (!this.usageTracking.has(userId)) {
      return {
        requestsLastHour: 0,
        totalRequests: 0
      };
    }

    const userRequests = this.usageTracking.get(userId);
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);
    const recentRequests = userRequests.filter(timestamp => timestamp > hourAgo);

    return {
      requestsLastHour: recentRequests.length,
      totalRequests: userRequests.length
    };
  }
}

/**
 * Express.js middleware example for backend integration
 * This would be used in your Express server
 */
function createModelRouterMiddleware() {
  const router = new ModelRouter();

  return {
    // Proxy endpoint for Tier 1 & 2 (platform keys)
    proxyRequest: async (req, res) => {
      try {
        const { tier, provider, prompt, model, userId } = req.body;

        if (!userId) {
          return res.status(401).json({ error: 'Authentication required' });
        }

        const result = await router.routeRequest({
          tier,
          provider,
          useUserKey: false,
          userId,
          prompt,
          model
        });

        if (result.success) {
          res.json(result);
        } else {
          res.status(500).json(result);
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    // Direct endpoint for Tier 3 (user keys)
    directRequest: async (req, res) => {
      try {
        const { tier, provider, userApiKey, prompt, model, userId } = req.body;

        if (!userId) {
          return res.status(401).json({ error: 'Authentication required' });
        }

        if (tier !== 3) {
          return res.status(403).json({ error: 'User API keys only available for Premium tier' });
        }

        const result = await router.routeRequest({
          tier,
          provider,
          useUserKey: true,
          userApiKey,
          userId,
          prompt,
          model
        });

        if (result.success) {
          res.json(result);
        } else {
          res.status(500).json(result);
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

    // Usage stats endpoint
    getUsage: (req, res) => {
      try {
        const userId = req.user?.id; // Assumes authentication middleware
        
        if (!userId) {
          return res.status(401).json({ error: 'Authentication required' });
        }

        const usage = router.getUserUsage(userId);
        res.json(usage);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ModelRouter,
    createModelRouterMiddleware,
    API_ENDPOINTS,
    RATE_LIMITS
  };
}

// Browser global export (for testing)
if (typeof window !== 'undefined') {
  window.ModelRouter = {
    ModelRouter,
    API_ENDPOINTS,
    RATE_LIMITS
  };
}
