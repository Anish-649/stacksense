'use strict';

const SENSITIVE_PATTERNS = [
  // API keys and tokens
  { pattern: /[a-zA-Z0-9]{32,}/g, label: '[API_KEY]' },
  
  // JWT tokens
  { pattern: /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g, label: '[JWT_TOKEN]' },
  
  // passwords in connection strings
  { pattern: /password=[^\s&]+/gi, label: 'password=[HIDDEN]' },
  { pattern: /pwd=[^\s&]+/gi, label: 'pwd=[HIDDEN]' },
  
  // MongoDB connection strings
  { pattern: /mongodb(\+srv)?:\/\/[^\s]+/gi, label: '[MONGODB_URL]' },
  
  // PostgreSQL connection strings
  { pattern: /postgresql:\/\/[^\s]+/gi, label: '[POSTGRES_URL]' },
  
  // IP addresses
  { pattern: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, label: '[IP_ADDRESS]' },
  
  // email addresses
  { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, label: '[EMAIL]' },
  
  // secret keys in env format
  { pattern: /[A-Z_]+(KEY|SECRET|TOKEN|PASSWORD)=[^\s]+/g, label: '[SECRET]' },
];

function sanitizeError(errorText) {
  let cleaned = errorText;

  for (const { pattern, label } of SENSITIVE_PATTERNS) {
    cleaned = cleaned.replace(pattern, label);
  }

  // trim to 3000 characters max
  // gemini doesn't need the full log, just the relevant part
  if (cleaned.length > 3000) {
    cleaned = cleaned.substring(0, 3000) + '\n... [truncated]';
  }

  return cleaned.trim();
}

module.exports = { sanitizeError };