import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  appName: process.env.APP_NAME || 'Indian-Gov-QA-Backend',
  apiVersion: process.env.API_VERSION || 'v1',

  // Database
  database: {
    url: process.env.DATABASE_URL || '',
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000', 10),
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
  },

  // Anthropic
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
  },

  // Government APIs
  govApis: {
    dataGovIn: {
      apiKey: process.env.DATA_GOV_IN_API_KEY || '',
      baseUrl: 'https://api.data.gov.in',
    },
    ndap: {
      apiKey: process.env.NDAP_API_KEY || '',
      clientId: process.env.NDAP_CLIENT_ID || '',
      clientSecret: process.env.NDAP_CLIENT_SECRET || '',
      baseUrl: 'https://ndap.niti.gov.in/api',
    },
  },

  // Pinecone
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY || '',
    environment: process.env.PINECONE_ENVIRONMENT || 'us-west1-gcp',
    indexName: process.env.PINECONE_INDEX_NAME || 'indian-gov-qa',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },

  // Cache TTL
  cache: {
    ttlShort: parseInt(process.env.CACHE_TTL_SHORT || '300', 10),
    ttlMedium: parseInt(process.env.CACHE_TTL_MEDIUM || '1800', 10),
    ttlLong: parseInt(process.env.CACHE_TTL_LONG || '3600', 10),
  },

  // API Retry
  apiRetry: {
    attempts: parseInt(process.env.API_RETRY_ATTEMPTS || '3', 10),
    delay: parseInt(process.env.API_RETRY_DELAY || '1000', 10),
  },
};

// Validate critical environment variables
const validateConfig = () => {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'OPENAI_API_KEY',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

if (config.nodeEnv === 'production') {
  validateConfig();
}

export default config;
