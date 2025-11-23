// API Status Labels
export const API_STATUS_LABELS: Record<string, string> = {
  draft: 'Taslak',
  configuring: 'Yapılandırılıyor',
  active: 'Aktif',
  paused: 'Duraklatıldı',
  error: 'Hata',
};

// API Models
export const AI_MODELS = {
  LLAMA_70B: 'llama-3.1-70b-versatile',
  LLAMA_8B: 'llama-3.1-8b-instant',
  MIXTRAL: 'mixtral-8x7b-32768',
  GEMMA: 'gemma2-9b-it',
} as const;

export const DEFAULT_MODEL = AI_MODELS.LLAMA_70B;

// Rate Limits
export const DEFAULT_RATE_LIMIT = {
  requestsPerMinute: 60,
  requestsPerDay: 1000,
};

export const PLAN_LIMITS = {
  free: {
    maxApis: 3,
    requestsPerMinute: 10,
    requestsPerDay: 100,
    maxTokensPerRequest: 2000,
  },
  starter: {
    maxApis: 10,
    requestsPerMinute: 60,
    requestsPerDay: 1000,
    maxTokensPerRequest: 4000,
  },
  pro: {
    maxApis: 50,
    requestsPerMinute: 200,
    requestsPerDay: 10000,
    maxTokensPerRequest: 8000,
  },
  enterprise: {
    maxApis: -1, // unlimited
    requestsPerMinute: 1000,
    requestsPerDay: -1, // unlimited
    maxTokensPerRequest: 16000,
  },
};

// API Configuration Defaults
export const DEFAULT_API_CONFIG = {
  model: DEFAULT_MODEL,
  temperature: 0.7,
  maxTokens: 2000,
  rateLimit: DEFAULT_RATE_LIMIT,
  authentication: true,
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
} as const;

// Error Codes
export const ERROR_CODES = {
  INVALID_INPUT: 'INVALID_INPUT',
  UNAUTHORIZED: 'UNAUTHORIZED',
  API_NOT_FOUND: 'API_NOT_FOUND',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  AI_MODEL_ERROR: 'AI_MODEL_ERROR',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

// Regex Patterns
export const PATTERNS = {
  API_KEY: /^pak_[a-zA-Z0-9]{32}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
};

// Time Constants (in milliseconds)
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
};
