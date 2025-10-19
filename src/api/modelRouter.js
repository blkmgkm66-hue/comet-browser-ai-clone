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
   * @returns {Promise} API response
   */
  async routeRequest(params) {
    const { tier, model, userApiKey, prompt, options = {} } = params;
    
    // Check rate limits
    if (!this.checkRateLimit(params.userId, tier)) {
      throw new Error('Rate limit exceeded. Please upgrade or wait.');
    }
    
    // Determine which API key to use
    const apiKey = tier === 3 && userApiKey ? userApiKey : this.getplatformKey(model);
    
    // Route to appropriate provider
    const provider = this.detectProvider(model);
    const endpoint = API_ENDPOINTS[provider];
    
    if (!endpoint) {
      throw new Error(`Unsupported model: ${model}`);
    }
    
    // Make the API request
    return await this.makeRequest({
      provider,
      endpoint,
      apiKey,
      model,
      prompt,
      options
    });
  }
  
  /**
   * LLM Planner Endpoint - Milestone 3
   * Multi-tool planning superagent
   */
  async plan(params) {
    const { query, tools = [], context = {} } = params;
    
    const systemPrompt = `You are a planning AI superagent. Given a user query and available tools, create a step-by-step execution plan.
Available tools:
${tools.map(t => `- ${t.name}: ${t.description}`).join('\n')}
Return your plan as a JSON array of steps. Each step should have:
- tool: the tool name to use
- action: description of what to do
- params: parameters for the tool
Example format:
[
  {"tool": "search", "action": "Search for information", "params": {"query": "..."}},
  {"tool": "analyze", "action": "Analyze results", "params": {"data": "..."}}
]`;

    const planPrompt = `User query: ${query}\n\nContext: ${JSON.stringify(context)}\n\nCreate an execution plan:`;

    try {
      // Use GPT-4 for planning (configurable)
      const response = await this.routeRequest({
        tier: 2, // Use platform key for planner
        model: 'gpt-4',
        prompt: planPrompt,
        options: {
          systemPrompt,
          temperature: 0.7,
          maxTokens: 2000
        }
      });

      // Parse and validate the plan
      const planText = response.choices[0].message.content;
      const plan = JSON.parse(planText);

      // Validate plan structure
      if (!Array.isArray(plan)) {
        throw new Error('Plan must be an array of steps');
      }

      for (const step of plan) {
        if (!step.tool || !step.action) {
          throw new Error('Each step must have tool and action');
        }
      }

      return {
        success: true,
        plan,
        metadata: {
          query,
          toolsAvailable: tools.length,
          stepsGenerated: plan.length
        }
      };
    } catch (error) {
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
  
  checkRateLimit(userId, tier) {
    // Simplified rate limiting (production would use Redis with sliding window)
    const now = Date.now();
    const userUsage = this.usageTracking.get(userId) || { count: 0, resetTime: now + 3600000 };
    
    if (now > userUsage.resetTime) {
      userUsage.count = 0;
      userUsage.resetTime = now + 3600000;
    }
    
    if (userUsage.count >= RATE_LIMITS[tier]) {
      return false;
    }
    
    userUsage.count++;
    this.usageTracking.set(userId, userUsage);
    return true;
  }
  
  getplatformKey(model) {
    const provider = this.detectProvider(model);
    return this.platformKeys[provider];
  }
  
  detectProvider(model) {
    if (model.includes('gpt')) return 'openai';
    if (model.includes('claude')) return 'claude';
    if (model.includes('pplx')) return 'perplexity';
    return 'openai'; // default
  }
  
  async makeRequest({ provider, endpoint, apiKey, model, prompt, options }) {
    // Only implement OpenAI for now (can be extended for other providers)
    if (provider === 'openai') {
      try {
        const fetch = require('node-fetch');
        const url = `${endpoint.base}${endpoint.chat}`;
        
        // Build the messages array
        const messages = [];
        
        // Add system prompt if provided
        if (options.systemPrompt) {
          messages.push({
            role: 'system',
            content: options.systemPrompt
          });
        }
        
        // Add user prompt
        messages.push({
          role: 'user',
          content: prompt
        });
        
        // Make the POST request to OpenAI
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: model,
            messages: messages,
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || 1000
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
        }
        
        const data = await response.json();
        return data;
        
      } catch (error) {
        console.error('Error making OpenAI request:', error);
        throw error;
      }
    }
    
    // Placeholder for other providers
    throw new Error(`Provider ${provider} not yet implemented`);
  }
}

// Express router setup
const express = require('express');
const router = express.Router();
const modelRouter = new ModelRouter();

// POST /api/model/route - Main routing endpoint
router.post('/route', async (req, res) => {
  try {
    const result = await modelRouter.routeRequest(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /api/model/plan - LLM Planner endpoint (Milestone 3)
router.post('/plan', async (req, res) => {
  try {
    const result = await modelRouter.plan(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      fallback: [{
        tool: 'manual',
        action: 'Manual execution required',
        params: { query: req.body.query }
      }]
    });
  }
});

// GET /api/model/status - Health check
router.get('/status', (req, res) => {
  res.json({
    status: 'operational',
    endpoints: ['/route', '/plan'],
    providers: Object.keys(API_ENDPOINTS)
  });
});

module.exports = router;
