/**
 * Phase 2: Real Government API Integration
 * This file contains the implementation template for integrating actual Indian Government APIs
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { GOV_API_SOURCES, APISource } from '../config/api-sources'
import { logger } from '../utils/logger'
import { redisClient } from '../config/redis'

export interface APIResponse {
  success: boolean
  data: any
  source: string
  cachedAt?: Date
  error?: string
}

export class GovAPIClient {
  private apiClients: Map<string, AxiosInstance> = new Map()
  private requestCounts: Map<string, number> = new Map()

  constructor() {
    this.initializeClients()
  }

  /**
   * Initialize HTTP clients for each API source
   */
  private initializeClients() {
    Object.entries(GOV_API_SOURCES).forEach(([key, config]) => {
      const client = axios.create({
        baseURL: config.baseUrl,
        timeout: config.timeout,
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey && { 'api-key': config.apiKey }),
        },
      })

      // Request interceptor for rate limiting
      client.interceptors.request.use(async (config) => {
        await this.checkRateLimit(key)
        return config
      })

      // Response interceptor for error handling
      client.interceptors.response.use(
        (response) => response,
        (error) => {
          logger.error(`API Error from ${key}:`, error.message)
          throw error
        }
      )

      this.apiClients.set(key, client)
    })
  }

  /**
   * Check and enforce rate limiting
   */
  private async checkRateLimit(sourceKey: string): Promise<void> {
    const source = GOV_API_SOURCES[sourceKey as keyof typeof GOV_API_SOURCES]
    const count = this.requestCounts.get(sourceKey) || 0
    
    if (count >= source.rateLimit) {
      throw new Error(`Rate limit exceeded for ${source.name}`)
    }

    this.requestCounts.set(sourceKey, count + 1)
    
    // Reset counter after 1 minute
    setTimeout(() => {
      this.requestCounts.set(sourceKey, Math.max(0, (this.requestCounts.get(sourceKey) || 0) - 1))
    }, 60000)
  }

  /**
   * Get cached response or fetch from API
   */
  private async getCachedOrFetch(
    cacheKey: string,
    fetchFn: () => Promise<any>,
    cacheTime: number
  ): Promise<any> {
    // Try to get from cache
    const cached = await redisClient.get(cacheKey)
    if (cached) {
      logger.info(`Cache hit for ${cacheKey}`)
      return { ...JSON.parse(cached), cached: true }
    }

    // Fetch from API
    const data = await fetchFn()
    
    // Store in cache
    await redisClient.setex(cacheKey, cacheTime, JSON.stringify(data))
    
    return { ...data, cached: false }
  }

  /**
   * DATA.GOV.IN - Fetch government datasets
   */
  async fetchDataGovIn(query: string, filters?: any): Promise<APIResponse> {
    try {
      const cacheKey = `datagov:${query}:${JSON.stringify(filters)}`
      const source = GOV_API_SOURCES.DATA_GOV_IN
      
      const result = await this.getCachedOrFetch(
        cacheKey,
        async () => {
          const client = this.apiClients.get('DATA_GOV_IN')!
          
          // TODO: Replace with actual API endpoint and parameters
          const response = await client.get('/resource/search', {
            params: {
              query,
              format: 'json',
              limit: 10,
              ...filters,
            },
          })
          
          return {
            records: response.data.records || [],
            total: response.data.total || 0,
            metadata: response.data.metadata || {},
          }
        },
        source.cacheTime
      )

      return {
        success: true,
        data: result,
        source: 'Data.gov.in',
        cachedAt: result.cached ? new Date() : undefined,
      }
    } catch (error: any) {
      logger.error('Data.gov.in API error:', error)
      return {
        success: false,
        data: null,
        source: 'Data.gov.in',
        error: error.message,
      }
    }
  }

  /**
   * NDAP - Fetch analytics and insights
   */
  async fetchNDAP(topic: string, parameters?: any): Promise<APIResponse> {
    try {
      const cacheKey = `ndap:${topic}:${JSON.stringify(parameters)}`
      const source = GOV_API_SOURCES.NDAP
      
      const result = await this.getCachedOrFetch(
        cacheKey,
        async () => {
          const client = this.apiClients.get('NDAP')!
          
          // TODO: Replace with actual NDAP API endpoint
          const response = await client.get('/analytics', {
            params: {
              topic,
              ...parameters,
            },
          })
          
          return {
            insights: response.data.insights || [],
            datasets: response.data.datasets || [],
            visualizations: response.data.visualizations || [],
          }
        },
        source.cacheTime
      )

      return {
        success: true,
        data: result,
        source: 'NDAP',
        cachedAt: result.cached ? new Date() : undefined,
      }
    } catch (error: any) {
      logger.error('NDAP API error:', error)
      return {
        success: false,
        data: null,
        source: 'NDAP',
        error: error.message,
      }
    }
  }

  /**
   * NEWS API - Fetch latest news
   */
  async fetchNewsAPI(query: string, category?: string): Promise<APIResponse> {
    try {
      const cacheKey = `news:${query}:${category || 'all'}`
      const source = GOV_API_SOURCES.NEWS_API
      
      const result = await this.getCachedOrFetch(
        cacheKey,
        async () => {
          const client = this.apiClients.get('NEWS_API')!
          
          const response = await client.get('/everything', {
            params: {
              q: `${query} India`,
              language: 'en',
              sortBy: 'publishedAt',
              pageSize: 10,
            },
          })
          
          return {
            articles: response.data.articles || [],
            total: response.data.totalResults || 0,
          }
        },
        source.cacheTime
      )

      return {
        success: true,
        data: result,
        source: 'NewsAPI',
        cachedAt: result.cached ? new Date() : undefined,
      }
    } catch (error: any) {
      logger.error('NewsAPI error:', error)
      return {
        success: false,
        data: null,
        source: 'NewsAPI',
        error: error.message,
      }
    }
  }

  /**
   * PIB - Fetch press releases
   */
  async fetchPIB(topic: string, dateRange?: { from: string; to: string }): Promise<APIResponse> {
    try {
      const cacheKey = `pib:${topic}:${JSON.stringify(dateRange)}`
      const source = GOV_API_SOURCES.PIB
      
      const result = await this.getCachedOrFetch(
        cacheKey,
        async () => {
          const client = this.apiClients.get('PIB')!
          
          // TODO: Replace with actual PIB API endpoint
          const response = await client.get('/press-releases', {
            params: {
              topic,
              from: dateRange?.from,
              to: dateRange?.to,
              limit: 10,
            },
          })
          
          return {
            releases: response.data.releases || [],
            total: response.data.total || 0,
          }
        },
        source.cacheTime
      )

      return {
        success: true,
        data: result,
        source: 'PIB',
        cachedAt: result.cached ? new Date() : undefined,
      }
    } catch (error: any) {
      logger.error('PIB API error:', error)
      return {
        success: false,
        data: null,
        source: 'PIB',
        error: error.message,
      }
    }
  }

  /**
   * Multi-source query - Fetch from multiple APIs in parallel
   */
  async multiSourceQuery(query: string, sources: string[]): Promise<APIResponse[]> {
    const promises = sources.map(async (source) => {
      switch (source) {
        case 'DATA_GOV_IN':
          return this.fetchDataGovIn(query)
        case 'NDAP':
          return this.fetchNDAP(query)
        case 'NEWS_API':
          return this.fetchNewsAPI(query)
        case 'PIB':
          return this.fetchPIB(query)
        default:
          return {
            success: false,
            data: null,
            source,
            error: 'Unknown source',
          }
      }
    })

    return Promise.all(promises)
  }
}

// Export singleton instance
export const govAPIClient = new GovAPIClient()
