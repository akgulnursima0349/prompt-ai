// User Types
export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// API Types
export interface GeneratedAPI {
  id: string;
  userId: string;
  name: string;
  description: string;
  prompt: string;
  systemPrompt: string;
  configuration: APIConfiguration;
  status: APIStatus;
  endpoint: string;
  apiKey: string;
  usageCount: number;
  lastUsedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface APIConfiguration {
  model: string;
  temperature: number;
  maxTokens: number;
  inputSchema: JSONSchema;
  outputSchema: JSONSchema;
  rateLimit: RateLimitConfig;
  authentication: boolean;
}

export interface JSONSchema {
  type: string;
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
  description?: string;
}

export interface JSONSchemaProperty {
  type: string;
  description?: string;
  enum?: string[];
  default?: unknown;
  items?: JSONSchemaProperty;
}

export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerDay: number;
}

export type APIStatus = 'draft' | 'configuring' | 'active' | 'paused' | 'error';

// API Key Types
export interface APIKey {
  id: string;
  apiId: string;
  key: string;
  name: string;
  isActive: boolean;
  expiresAt: Date | null;
  lastUsedAt: Date | null;
  usageCount: number;
  createdAt: Date;
}

// Request/Response Types
export interface CreateAPIRequest {
  prompt: string;
  name?: string;
}

export interface CreateAPIResponse {
  success: boolean;
  api?: GeneratedAPI;
  setupSuggestions?: APISetupSuggestion;
  error?: string;
}

export interface APISetupSuggestion {
  name: string;
  description: string;
  systemPrompt: string;
  inputSchema: JSONSchema;
  outputSchema: JSONSchema;
  exampleInput: Record<string, unknown>;
  exampleOutput: Record<string, unknown>;
  suggestedEndpoint: string;
}

export interface ExecuteAPIRequest {
  input: Record<string, unknown>;
}

export interface ExecuteAPIResponse {
  success: boolean;
  output?: Record<string, unknown>;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Usage & Analytics Types
export interface APIUsageStats {
  apiId: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatency: number;
  tokensUsed: number;
  periodStart: Date;
  periodEnd: Date;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error Types
export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
