/**
 * API Access for Developers (P2.6)
 * REST API with authentication, rate limiting, webhooks
 * Developer portal, SDK generation, API documentation
 */

export interface APIKey {
  id: string;
  name: string;
  key: string;
  secret: string;
  userId: string;
  scopes: APIScope[];
  rateLimit: RateLimit;
  createdAt: Date;
  lastUsedAt?: Date;
  expiresAt?: Date;
  active: boolean;
}

export type APIScope =
  | 'presentations:read'
  | 'presentations:write'
  | 'presentations:delete'
  | 'templates:read'
  | 'analytics:read'
  | 'collaboration:read'
  | 'collaboration:write'
  | 'webhooks:manage'
  | 'admin';

export interface RateLimit {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstAllowance: number;
}

export interface APIRequest {
  id: string;
  apiKeyId: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  timestamp: Date;
  statusCode: number;
  responseTime: number; // milliseconds
  ipAddress?: string;
  userAgent?: string;
}

export interface Webhook {
  id: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  active: boolean;
  createdAt: Date;
  lastTriggeredAt?: Date;
}

export type WebhookEvent =
  | 'presentation.created'
  | 'presentation.updated'
  | 'presentation.deleted'
  | 'presentation.published'
  | 'collaboration.comment_added'
  | 'collaboration.user_joined'
  | 'analytics.session_completed'
  | 'live.presentation_started'
  | 'live.presentation_ended';

export interface APIEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  description: string;
  scopes: APIScope[];
  parameters?: APIParameter[];
  requestBody?: APISchema;
  responseSchema: APISchema;
  examples: APIExample[];
}

export interface APIParameter {
  name: string;
  in: 'path' | 'query' | 'header' | 'body';
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  description: string;
  default?: any;
}

export interface APISchema {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean';
  properties?: Record<string, APISchema>;
  items?: APISchema;
  required?: string[];
  description?: string;
}

export interface APIExample {
  title: string;
  request: {
    method: string;
    url: string;
    headers?: Record<string, string>;
    body?: any;
  };
  response: {
    status: number;
    body: any;
  };
}

export interface OAuthClient {
  id: string;
  name: string;
  clientId: string;
  clientSecret: string;
  redirectUris: string[];
  scopes: APIScope[];
  createdAt: Date;
}

export interface RateLimitStatus {
  remaining: number;
  limit: number;
  reset: Date;
  retryAfter?: number;
}

/**
 * API Access Manager
 * Developer API with authentication and webhooks
 */
export class APIAccessManager {
  private apiKeys: Map<string, APIKey>;
  private webhooks: Map<string, Webhook>;
  private requests: Map<string, APIRequest[]>;
  private endpoints: APIEndpoint[];
  private oauthClients: Map<string, OAuthClient>;
  private rateLimitCache: Map<string, { count: number; resetAt: Date }>;

  constructor() {
    this.apiKeys = new Map();
    this.webhooks = new Map();
    this.requests = new Map();
    this.oauthClients = new Map();
    this.rateLimitCache = new Map();
    this.endpoints = this.initializeEndpoints();
  }

  /**
   * Initialize API endpoints
   */
  private initializeEndpoints(): APIEndpoint[] {
    return [
      {
        path: '/api/v1/presentations',
        method: 'GET',
        description: 'List all presentations',
        scopes: ['presentations:read'],
        parameters: [
          { name: 'page', in: 'query', type: 'number', required: false, description: 'Page number', default: 1 },
          { name: 'limit', in: 'query', type: 'number', required: false, description: 'Items per page', default: 20 }
        ],
        responseSchema: {
          type: 'object',
          properties: {
            presentations: { type: 'array', items: { type: 'object' } },
            total: { type: 'number' },
            page: { type: 'number' }
          }
        },
        examples: [{
          title: 'List presentations',
          request: { method: 'GET', url: '/api/v1/presentations?page=1&limit=10' },
          response: { status: 200, body: { presentations: [], total: 0, page: 1 } }
        }]
      },
      {
        path: '/api/v1/presentations/:id',
        method: 'GET',
        description: 'Get presentation by ID',
        scopes: ['presentations:read'],
        parameters: [
          { name: 'id', in: 'path', type: 'string', required: true, description: 'Presentation ID' }
        ],
        responseSchema: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            slides: { type: 'array' }
          }
        },
        examples: [{
          title: 'Get presentation',
          request: { method: 'GET', url: '/api/v1/presentations/pres123' },
          response: { status: 200, body: { id: 'pres123', title: 'My Presentation', slides: [] } }
        }]
      },
      {
        path: '/api/v1/presentations',
        method: 'POST',
        description: 'Create new presentation',
        scopes: ['presentations:write'],
        requestBody: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string', description: 'Presentation title' },
            slides: { type: 'array', description: 'Slide content' }
          }
        },
        responseSchema: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            createdAt: { type: 'string' }
          }
        },
        examples: [{
          title: 'Create presentation',
          request: {
            method: 'POST',
            url: '/api/v1/presentations',
            body: { title: 'New Deck', slides: [] }
          },
          response: { status: 201, body: { id: 'pres456', title: 'New Deck', createdAt: '2025-01-15T00:00:00Z' } }
        }]
      },
      {
        path: '/api/v1/analytics/sessions',
        method: 'GET',
        description: 'Get analytics sessions',
        scopes: ['analytics:read'],
        parameters: [
          { name: 'presentationId', in: 'query', type: 'string', required: true, description: 'Presentation ID' }
        ],
        responseSchema: {
          type: 'object',
          properties: {
            sessions: { type: 'array' },
            summary: { type: 'object' }
          }
        },
        examples: [{
          title: 'Get analytics',
          request: { method: 'GET', url: '/api/v1/analytics/sessions?presentationId=pres123' },
          response: { status: 200, body: { sessions: [], summary: {} } }
        }]
      }
    ];
  }

  /**
   * Create API key
   */
  createAPIKey(
    userId: string,
    name: string,
    scopes: APIScope[],
    rateLimit?: Partial<RateLimit>
  ): APIKey {
    const apiKey: APIKey = {
      id: this.generateId(),
      name,
      key: this.generateKey(),
      secret: this.generateSecret(),
      userId,
      scopes,
      rateLimit: {
        requestsPerMinute: rateLimit?.requestsPerMinute || 60,
        requestsPerHour: rateLimit?.requestsPerHour || 1000,
        requestsPerDay: rateLimit?.requestsPerDay || 10000,
        burstAllowance: rateLimit?.burstAllowance || 10
      },
      createdAt: new Date(),
      active: true
    };

    this.apiKeys.set(apiKey.key, apiKey);
    return apiKey;
  }

  /**
   * Validate API key
   */
  validateAPIKey(key: string, requiredScopes?: APIScope[]): {
    valid: boolean;
    apiKey?: APIKey;
    error?: string;
  } {
    const apiKey = this.apiKeys.get(key);

    if (!apiKey) {
      return { valid: false, error: 'Invalid API key' };
    }

    if (!apiKey.active) {
      return { valid: false, error: 'API key is inactive' };
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return { valid: false, error: 'API key has expired' };
    }

    // Check scopes
    if (requiredScopes) {
      const hasAllScopes = requiredScopes.every(scope =>
        apiKey.scopes.includes(scope) || apiKey.scopes.includes('admin')
      );

      if (!hasAllScopes) {
        return { valid: false, error: 'Insufficient permissions' };
      }
    }

    return { valid: true, apiKey };
  }

  /**
   * Check rate limit
   */
  checkRateLimit(apiKeyId: string): {
    allowed: boolean;
    status: RateLimitStatus;
  } {
    const apiKey = Array.from(this.apiKeys.values()).find(k => k.id === apiKeyId);
    if (!apiKey) {
      return {
        allowed: false,
        status: { remaining: 0, limit: 0, reset: new Date() }
      };
    }

    const now = new Date();
    const cacheKey = `${apiKeyId}-${now.getMinutes()}`;
    let cache = this.rateLimitCache.get(cacheKey);

    if (!cache || cache.resetAt < now) {
      // Reset cache
      const resetAt = new Date(now.getTime() + 60000); // 1 minute
      cache = { count: 0, resetAt };
      this.rateLimitCache.set(cacheKey, cache);
    }

    const remaining = apiKey.rateLimit.requestsPerMinute - cache.count;
    const allowed = remaining > 0;

    if (allowed) {
      cache.count++;
    }

    return {
      allowed,
      status: {
        remaining: Math.max(0, remaining),
        limit: apiKey.rateLimit.requestsPerMinute,
        reset: cache.resetAt,
        retryAfter: allowed ? undefined : Math.ceil((cache.resetAt.getTime() - now.getTime()) / 1000)
      }
    };
  }

  /**
   * Log API request
   */
  logRequest(request: Omit<APIRequest, 'id'>): void {
    const fullRequest: APIRequest = {
      id: this.generateId(),
      ...request
    };

    if (!this.requests.has(request.apiKeyId)) {
      this.requests.set(request.apiKeyId, []);
    }

    this.requests.get(request.apiKeyId)!.push(fullRequest);

    // Update last used timestamp
    const apiKey = Array.from(this.apiKeys.values()).find(k => k.id === request.apiKeyId);
    if (apiKey) {
      apiKey.lastUsedAt = new Date();
    }
  }

  /**
   * Create webhook
   */
  createWebhook(url: string, events: WebhookEvent[]): Webhook {
    const webhook: Webhook = {
      id: this.generateId(),
      url,
      events,
      secret: this.generateSecret(),
      active: true,
      createdAt: new Date()
    };

    this.webhooks.set(webhook.id, webhook);
    return webhook;
  }

  /**
   * Trigger webhook
   */
  async triggerWebhook(event: WebhookEvent, payload: any): Promise<void> {
    const webhooks = Array.from(this.webhooks.values()).filter(
      w => w.active && w.events.includes(event)
    );

    for (const webhook of webhooks) {
      try {
        const signature = this.generateWebhookSignature(webhook.secret, payload);

        // In production, would use fetch()
        console.log(`Webhook triggered: ${webhook.url}`, {
          event,
          signature,
          payload
        });

        webhook.lastTriggeredAt = new Date();
      } catch (error) {
        console.error(`Webhook failed: ${webhook.url}`, error);
      }
    }
  }

  /**
   * Generate webhook signature (HMAC-SHA256)
   */
  private generateWebhookSignature(secret: string, payload: any): string {
    // In production, would use crypto.createHmac()
    const payloadString = JSON.stringify(payload);
    return `sha256=${secret}-${payloadString.length}`;
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(signature: string, secret: string, payload: any): boolean {
    const expectedSignature = this.generateWebhookSignature(secret, payload);
    return signature === expectedSignature;
  }

  /**
   * Create OAuth client
   */
  createOAuthClient(name: string, redirectUris: string[], scopes: APIScope[]): OAuthClient {
    const client: OAuthClient = {
      id: this.generateId(),
      name,
      clientId: this.generateKey(),
      clientSecret: this.generateSecret(),
      redirectUris,
      scopes,
      createdAt: new Date()
    };

    this.oauthClients.set(client.clientId, client);
    return client;
  }

  /**
   * Generate OpenAPI documentation
   */
  generateOpenAPISpec(): any {
    return {
      openapi: '3.0.0',
      info: {
        title: 'AI Slide Designer API',
        version: '1.0.0',
        description: 'REST API for AI-powered presentation management'
      },
      servers: [
        { url: 'https://api.slidedesigner.ai/v1', description: 'Production' },
        { url: 'https://sandbox.slidedesigner.ai/v1', description: 'Sandbox' }
      ],
      components: {
        securitySchemes: {
          ApiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key'
          },
          OAuth2: {
            type: 'oauth2',
            flows: {
              authorizationCode: {
                authorizationUrl: 'https://auth.slidedesigner.ai/oauth/authorize',
                tokenUrl: 'https://auth.slidedesigner.ai/oauth/token',
                scopes: this.getScopeDescriptions()
              }
            }
          }
        }
      },
      paths: this.generatePathsSpec()
    };
  }

  /**
   * Generate paths specification
   */
  private generatePathsSpec(): any {
    const paths: any = {};

    this.endpoints.forEach(endpoint => {
      if (!paths[endpoint.path]) {
        paths[endpoint.path] = {};
      }

      paths[endpoint.path][endpoint.method.toLowerCase()] = {
        summary: endpoint.description,
        security: [{ ApiKeyAuth: [] }],
        parameters: endpoint.parameters?.map(p => ({
          name: p.name,
          in: p.in,
          required: p.required,
          schema: { type: p.type },
          description: p.description
        })),
        requestBody: endpoint.requestBody ? {
          required: true,
          content: {
            'application/json': {
              schema: endpoint.requestBody
            }
          }
        } : undefined,
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: endpoint.responseSchema
              }
            }
          }
        }
      };
    });

    return paths;
  }

  /**
   * Get scope descriptions
   */
  private getScopeDescriptions(): Record<string, string> {
    return {
      'presentations:read': 'Read presentation data',
      'presentations:write': 'Create and update presentations',
      'presentations:delete': 'Delete presentations',
      'templates:read': 'Read templates',
      'analytics:read': 'Read analytics data',
      'collaboration:read': 'Read collaboration data',
      'collaboration:write': 'Participate in collaboration',
      'webhooks:manage': 'Manage webhooks',
      'admin': 'Full administrative access'
    };
  }

  /**
   * Generate SDK code examples
   */
  generateSDKExample(language: 'javascript' | 'python' | 'curl'): string {
    if (language === 'javascript') {
      return `
// JavaScript SDK Example
const SlideDesignerAPI = require('@slidedesigner/api-client');

const client = new SlideDesignerAPI({
  apiKey: 'your-api-key'
});

// List presentations
const presentations = await client.presentations.list({ page: 1, limit: 10 });

// Create presentation
const newPresentation = await client.presentations.create({
  title: 'My New Deck',
  slides: [
    { title: 'Welcome', content: 'Hello World' }
  ]
});

// Get analytics
const analytics = await client.analytics.getSessions('pres123');
      `.trim();
    } else if (language === 'python') {
      return `
# Python SDK Example
from slidedesigner import APIClient

client = APIClient(api_key='your-api-key')

# List presentations
presentations = client.presentations.list(page=1, limit=10)

# Create presentation
new_presentation = client.presentations.create(
    title='My New Deck',
    slides=[
        {'title': 'Welcome', 'content': 'Hello World'}
    ]
)

# Get analytics
analytics = client.analytics.get_sessions('pres123')
      `.trim();
    } else {
      return `
# cURL Example
# List presentations
curl -X GET "https://api.slidedesigner.ai/v1/presentations?page=1&limit=10" \\
  -H "X-API-Key: your-api-key"

# Create presentation
curl -X POST "https://api.slidedesigner.ai/v1/presentations" \\
  -H "X-API-Key: your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{"title":"My New Deck","slides":[{"title":"Welcome"}]}'

# Get analytics
curl -X GET "https://api.slidedesigner.ai/v1/analytics/sessions?presentationId=pres123" \\
  -H "X-API-Key: your-api-key"
      `.trim();
    }
  }

  /**
   * Get API statistics
   */
  getStats(): {
    totalKeys: number;
    activeKeys: number;
    totalRequests: number;
    totalWebhooks: number;
    averageResponseTime: number;
  } {
    const totalRequests = Array.from(this.requests.values()).reduce(
      (sum, reqs) => sum + reqs.length,
      0
    );

    const allRequests = Array.from(this.requests.values()).flat();
    const averageResponseTime = allRequests.length > 0
      ? allRequests.reduce((sum, req) => sum + req.responseTime, 0) / allRequests.length
      : 0;

    return {
      totalKeys: this.apiKeys.size,
      activeKeys: Array.from(this.apiKeys.values()).filter(k => k.active).length,
      totalRequests,
      totalWebhooks: this.webhooks.size,
      averageResponseTime
    };
  }

  /**
   * Revoke API key
   */
  revokeAPIKey(keyId: string): boolean {
    const apiKey = Array.from(this.apiKeys.values()).find(k => k.id === keyId);
    if (!apiKey) return false;

    apiKey.active = false;
    return true;
  }

  /**
   * Delete webhook
   */
  deleteWebhook(webhookId: string): boolean {
    return this.webhooks.delete(webhookId);
  }

  /**
   * Get all API keys for user
   */
  getAPIKeys(userId: string): APIKey[] {
    return Array.from(this.apiKeys.values())
      .filter(k => k.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get all webhooks
   */
  getWebhooks(): Webhook[] {
    return Array.from(this.webhooks.values());
  }

  /**
   * Get request logs for API key
   */
  getRequestLogs(apiKeyId: string, limit: number = 100): APIRequest[] {
    return (this.requests.get(apiKeyId) || [])
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Generate API key
   */
  private generateKey(): string {
    return `sk_${this.randomString(32)}`;
  }

  /**
   * Generate secret
   */
  private generateSecret(): string {
    return this.randomString(64);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `api-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate random string
   */
  private randomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

// Singleton instance
export const apiAccessManager = new APIAccessManager();
