/**
 * Government API Configuration
 * Centralized configuration for all Indian Government data sources
 */

export interface APISource {
  name: string
  baseUrl: string
  apiKey?: string
  rateLimit: number // requests per minute
  timeout: number // in milliseconds
  cacheTime: number // in seconds
  requiresAuth: boolean
}

export const GOV_API_SOURCES = {
  // Data.gov.in - Open Government Data Platform
  DATA_GOV_IN: {
    name: 'Data.gov.in',
    baseUrl: 'https://api.data.gov.in',
    apiKey: process.env.DATA_GOV_IN_API_KEY,
    rateLimit: 60,
    timeout: 10000,
    cacheTime: 3600, // 1 hour
    requiresAuth: true,
  } as APISource,

  // National Data & Analytics Platform
  NDAP: {
    name: 'NDAP',
    baseUrl: 'https://ndap.niti.gov.in/api',
    apiKey: process.env.NDAP_API_KEY,
    rateLimit: 100,
    timeout: 15000,
    cacheTime: 7200, // 2 hours
    requiresAuth: true,
  } as APISource,

  // Press Information Bureau
  PIB: {
    name: 'PIB',
    baseUrl: 'https://pib.gov.in/api',
    apiKey: process.env.PIB_API_KEY,
    rateLimit: 30,
    timeout: 8000,
    cacheTime: 1800, // 30 minutes
    requiresAuth: false,
  } as APISource,

  // News API (India specific)
  NEWS_API: {
    name: 'NewsAPI',
    baseUrl: 'https://newsapi.org/v2',
    apiKey: process.env.NEWS_API_KEY,
    rateLimit: 100,
    timeout: 5000,
    cacheTime: 900, // 15 minutes
    requiresAuth: true,
  } as APISource,

  // Reserve Bank of India
  RBI: {
    name: 'RBI',
    baseUrl: 'https://rbi.org.in/api',
    apiKey: process.env.RBI_API_KEY,
    rateLimit: 50,
    timeout: 10000,
    cacheTime: 14400, // 4 hours
    requiresAuth: false,
  } as APISource,

  // Ministry of Statistics
  MOSPI: {
    name: 'MOSPI',
    baseUrl: 'https://mospi.gov.in/api',
    apiKey: process.env.MOSPI_API_KEY,
    rateLimit: 40,
    timeout: 12000,
    cacheTime: 21600, // 6 hours
    requiresAuth: false,
  } as APISource,
}

// API Categories for intent classification
export const API_CATEGORIES = {
  ECONOMY: ['DATA_GOV_IN', 'NDAP', 'RBI', 'MOSPI'],
  NEWS: ['NEWS_API', 'PIB'],
  AGRICULTURE: ['DATA_GOV_IN', 'NDAP'],
  HEALTH: ['DATA_GOV_IN', 'NDAP'],
  EDUCATION: ['DATA_GOV_IN', 'NDAP'],
  INFRASTRUCTURE: ['DATA_GOV_IN', 'NDAP'],
  GOVERNMENT_SCHEMES: ['PIB', 'DATA_GOV_IN'],
  STATISTICS: ['MOSPI', 'NDAP'],
}

// Query intents mapped to API sources
export const INTENT_TO_API_MAP: Record<string, string[]> = {
  'general_query': ['DATA_GOV_IN', 'NDAP'],
  'news': ['NEWS_API', 'PIB'],
  'economic_data': ['RBI', 'MOSPI', 'NDAP'],
  'government_scheme': ['PIB', 'DATA_GOV_IN'],
  'statistical_data': ['MOSPI', 'NDAP', 'DATA_GOV_IN'],
  'policy_update': ['PIB'],
  'health_data': ['DATA_GOV_IN', 'NDAP'],
  'education_data': ['DATA_GOV_IN', 'NDAP'],
}

// Default fallback sources
export const DEFAULT_SOURCES = ['DATA_GOV_IN', 'NDAP', 'NEWS_API']

export default GOV_API_SOURCES
