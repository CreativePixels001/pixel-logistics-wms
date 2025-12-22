import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { config } from '../config/environment';
import { logger } from '../utils/logger';
import { cacheService } from '../config/redis';
import prisma from '../config/database';

interface GovAPIResponse {
  data: any;
  sources: Array<{
    apiName: string;
    url?: string;
    relevance: number;
  }>;
}

class GovAPIService {
  private dataGovInClient: AxiosInstance;
  private ndapClient: AxiosInstance;

  constructor() {
    // Initialize data.gov.in client
    this.dataGovInClient = axios.create({
      baseURL: config.govApis.dataGovIn.baseUrl,
      timeout: 10000,
      params: {
        'api-key': config.govApis.dataGovIn.apiKey,
        format: 'json',
      },
    });

    // Initialize NDAP client
    this.ndapClient = axios.create({
      baseURL: config.govApis.ndap.baseUrl,
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  /**
   * Setup axios interceptors for logging and error handling
   */
  private setupInterceptors() {
    // Request interceptor
    [this.dataGovInClient, this.ndapClient].forEach((client) => {
      client.interceptors.request.use(
        (config) => {
          logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
          return config;
        },
        (error) => {
          logger.error('API Request error:', error);
          return Promise.reject(error);
        }
      );

      // Response interceptor
      client.interceptors.response.use(
        (response) => {
          logger.debug(`API Response: ${response.status} ${response.config.url}`);
          return response;
        },
        async (error) => {
          logger.error('API Response error:', error.message);

          // Log API errors
          if (error.config) {
            await this.logAPICall(
              error.config.baseURL || 'unknown',
              error.config.url || '',
              error.config.params,
              null,
              error.response?.status || 500,
              0,
              error.message
            );
          }

          return Promise.reject(error);
        }
      );
    });
  }

  /**
   * Fetch relevant data from multiple Government APIs
   */
  async fetchRelevantData(
    query: string,
    category: string
  ): Promise<GovAPIResponse> {
    const sources: GovAPIResponse['sources'] = [];
    const allData: any[] = [];

    try {
      // Fetch from multiple sources in parallel
      const results = await Promise.allSettled([
        this.searchDataGovIn(query, category),
        this.searchNDAP(query, category),
        // Add more government APIs here
      ]);

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          allData.push(result.value.data);
          sources.push(...result.value.sources);
        }
      });

      return {
        data: allData,
        sources,
      };
    } catch (error) {
      logger.error('Error fetching government data:', error);
      return {
        data: [],
        sources: [],
      };
    }
  }

  /**
   * Search data.gov.in
   */
  private async searchDataGovIn(
    query: string,
    category: string
  ): Promise<GovAPIResponse | null> {
    const cacheKey = `datagov:${category}:${query}`;
    
    try {
      // Check cache first
      const cached = await cacheService.get<any>(cacheKey);
      if (cached) {
        logger.info('Cache hit for data.gov.in');
        return cached;
      }

      const startTime = Date.now();

      // Example endpoint - adjust based on actual data.gov.in API
      const response = await this.dataGovInClient.get('/resource', {
        params: {
          q: query,
          limit: 10,
          // Add more parameters as per API documentation
        },
      });

      const latency = Date.now() - startTime;

      // Log API call
      await this.logAPICall(
        'data.gov.in',
        '/resource',
        { q: query },
        response.data,
        response.status,
        latency
      );

      const result = {
        data: response.data,
        sources: [
          {
            apiName: 'data.gov.in',
            url: 'https://data.gov.in',
            relevance: 0.8,
          },
        ],
      };

      // Cache the result
      await cacheService.set(cacheKey, result, config.cache.ttlMedium);

      return result;
    } catch (error) {
      logger.error('data.gov.in API error:', error);
      return null;
    }
  }

  /**
   * Search NDAP (National Data & Analytics Platform)
   */
  private async searchNDAP(
    query: string,
    category: string
  ): Promise<GovAPIResponse | null> {
    const cacheKey = `ndap:${category}:${query}`;

    try {
      // Check cache
      const cached = await cacheService.get<any>(cacheKey);
      if (cached) {
        logger.info('Cache hit for NDAP');
        return cached;
      }

      const startTime = Date.now();

      // Authenticate first (if required)
      const token = await this.authenticateNDAP();

      // Search endpoint
      const response = await this.ndapClient.get('/search', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          query,
          category,
          limit: 10,
        },
      });

      const latency = Date.now() - startTime;

      await this.logAPICall(
        'NDAP',
        '/search',
        { query, category },
        response.data,
        response.status,
        latency
      );

      const result = {
        data: response.data,
        sources: [
          {
            apiName: 'NDAP',
            url: 'https://ndap.niti.gov.in',
            relevance: 0.9,
          },
        ],
      };

      await cacheService.set(cacheKey, result, config.cache.ttlMedium);

      return result;
    } catch (error) {
      logger.error('NDAP API error:', error);
      return null;
    }
  }

  /**
   * Authenticate with NDAP (OAuth2 example)
   */
  private async authenticateNDAP(): Promise<string> {
    const cacheKey = 'ndap:token';

    try {
      // Check cached token
      const cachedToken = await cacheService.get<string>(cacheKey);
      if (cachedToken) {
        return cachedToken;
      }

      // Get new token
      const response = await this.ndapClient.post('/oauth/token', {
        grant_type: 'client_credentials',
        client_id: config.govApis.ndap.clientId,
        client_secret: config.govApis.ndap.clientSecret,
      });

      const token = response.data.access_token;
      const expiresIn = response.data.expires_in || 3600;

      // Cache token
      await cacheService.set(cacheKey, token, expiresIn - 60);

      return token;
    } catch (error) {
      logger.error('NDAP authentication error:', error);
      throw error;
    }
  }

  /**
   * Log API call to database
   */
  private async logAPICall(
    apiName: string,
    endpoint: string,
    requestData: any,
    responseData: any,
    statusCode: number,
    latencyMs: number,
    error?: string
  ): Promise<void> {
    try {
      await prisma.apiLog.create({
        data: {
          apiName,
          endpoint,
          requestData,
          responseData: responseData ? JSON.parse(JSON.stringify(responseData)) : null,
          statusCode,
          latencyMs,
          error,
        },
      });
    } catch (err) {
      logger.error('Failed to log API call:', err);
    }
  }

  /**
   * Retry mechanism for failed API calls
   */
  private async retryRequest<T>(
    fn: () => Promise<T>,
    attempts: number = config.apiRetry.attempts
  ): Promise<T> {
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === attempts - 1) throw error;
        
        const delay = config.apiRetry.delay * Math.pow(2, i);
        logger.warn(`Retry attempt ${i + 1} after ${delay}ms`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw new Error('Max retries exceeded');
  }
}

export const govApiService = new GovAPIService();
