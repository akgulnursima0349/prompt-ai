import type { CreateAPIRequest, APIConfiguration, JSONSchema } from '../types';
import { PATTERNS, AI_MODELS } from '../constants';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate create API request
 */
export function validateCreateAPIRequest(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Geçersiz istek verisi'] };
  }

  const request = data as CreateAPIRequest;

  if (!request.prompt || typeof request.prompt !== 'string') {
    errors.push('Prompt zorunludur');
  } else if (request.prompt.length < 10) {
    errors.push('Prompt en az 10 karakter olmalıdır');
  } else if (request.prompt.length > 5000) {
    errors.push('Prompt en fazla 5000 karakter olabilir');
  }

  if (request.name !== undefined) {
    if (typeof request.name !== 'string') {
      errors.push('API adı metin olmalıdır');
    } else if (request.name.length > 100) {
      errors.push('API adı en fazla 100 karakter olabilir');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate API configuration
 */
export function validateAPIConfiguration(config: unknown): ValidationResult {
  const errors: string[] = [];

  if (!config || typeof config !== 'object') {
    return { valid: false, errors: ['Geçersiz yapılandırma'] };
  }

  const cfg = config as APIConfiguration;

  // Model validation
  const validModels = Object.values(AI_MODELS);
  if (!validModels.includes(cfg.model as typeof validModels[number])) {
    errors.push('Geçersiz AI modeli');
  }

  // Temperature validation
  if (typeof cfg.temperature !== 'number' || cfg.temperature < 0 || cfg.temperature > 2) {
    errors.push('Temperature 0-2 arasında olmalıdır');
  }

  // Max tokens validation
  if (typeof cfg.maxTokens !== 'number' || cfg.maxTokens < 1 || cfg.maxTokens > 16000) {
    errors.push('Max tokens 1-16000 arasında olmalıdır');
  }

  // Rate limit validation
  if (cfg.rateLimit) {
    if (typeof cfg.rateLimit.requestsPerMinute !== 'number' || cfg.rateLimit.requestsPerMinute < 1) {
      errors.push('Dakika başına istek sayısı pozitif olmalıdır');
    }
    if (typeof cfg.rateLimit.requestsPerDay !== 'number' || cfg.rateLimit.requestsPerDay < 1) {
      errors.push('Gün başına istek sayısı pozitif olmalıdır');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate JSON Schema
 */
export function validateJSONSchema(schema: unknown): ValidationResult {
  const errors: string[] = [];

  if (!schema || typeof schema !== 'object') {
    return { valid: false, errors: ['Geçersiz şema'] };
  }

  const s = schema as JSONSchema;

  const validTypes = ['string', 'number', 'integer', 'boolean', 'object', 'array', 'null'];

  if (!s.type || !validTypes.includes(s.type)) {
    errors.push('Geçersiz şema tipi');
  }

  if (s.type === 'object' && s.properties) {
    for (const [key, prop] of Object.entries(s.properties)) {
      if (!prop.type || !validTypes.includes(prop.type)) {
        errors.push(`"${key}" özelliği için geçersiz tip`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate API key format
 */
export function validateAPIKey(key: unknown): ValidationResult {
  if (typeof key !== 'string') {
    return { valid: false, errors: ['API anahtarı metin olmalıdır'] };
  }

  if (!PATTERNS.API_KEY.test(key)) {
    return { valid: false, errors: ['Geçersiz API anahtarı formatı'] };
  }

  return { valid: true, errors: [] };
}

/**
 * Validate email
 */
export function validateEmail(email: unknown): ValidationResult {
  if (typeof email !== 'string') {
    return { valid: false, errors: ['E-posta metin olmalıdır'] };
  }

  if (!PATTERNS.EMAIL.test(email)) {
    return { valid: false, errors: ['Geçersiz e-posta formatı'] };
  }

  return { valid: true, errors: [] };
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 10000); // Limit length
}
