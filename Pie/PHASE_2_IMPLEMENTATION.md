# Phase 2 Implementation Guide: Real Government API Integration

## 🎯 Objective
Replace mock API calls with real Indian Government data sources to provide accurate, real-time information.

---

## 📋 Prerequisites

### 1. API Keys Required

#### a) Data.gov.in
1. Visit: https://data.gov.in/
2. Create account
3. Navigate to API section
4. Request API key
5. Add to `.env`: `DATA_GOV_IN_API_KEY=your_key_here`

#### b) NewsAPI
1. Visit: https://newsapi.org/
2. Sign up for free tier (100 requests/day)
3. Get API key from dashboard
4. Add to `.env`: `NEWS_API_KEY=your_key_here`

#### c) Other APIs (Optional)
- NDAP: Contact NITI Aayog for access
- PIB: Check https://pib.gov.in/ for API documentation
- RBI: https://rbi.org.in/Scripts/bs_viewcontent.aspx?Id=2009

### 2. Environment Setup

Update `/backend/.env`:
```env
# Government API Keys
DATA_GOV_IN_API_KEY=your_key_here
NEWS_API_KEY=your_key_here
NDAP_API_KEY=your_key_here
PIB_API_KEY=your_key_here
RBI_API_KEY=your_key_here
MOSPI_API_KEY=your_key_here

# API Configuration
API_RATE_LIMIT_ENABLED=true
API_CACHE_ENABLED=true
API_TIMEOUT=10000
```

---

## 🔧 Implementation Steps

### Step 1: Update AI Service to Use Real APIs

**File**: `/backend/src/services/ai.service.ts`

Replace the mock `fetchGovernmentData` function:

```typescript
import { govAPIClient } from './govApiClient.service'
import { INTENT_TO_API_MAP, DEFAULT_SOURCES } from '../config/api-sources'

async fetchGovernmentData(intent: string, query: string) {
  try {
    // Determine which APIs to query based on intent
    const sources = INTENT_TO_API_MAP[intent] || DEFAULT_SOURCES
    
    // Query multiple sources in parallel
    const responses = await govAPIClient.multiSourceQuery(query, sources)
    
    // Filter successful responses
    const successfulResponses = responses.filter(r => r.success)
    
    if (successfulResponses.length === 0) {
      return this.fallbackResponse(query)
    }
    
    // Combine and format data
    return this.formatAPIResponses(successfulResponses)
  } catch (error) {
    logger.error('Error fetching government data:', error)
    return this.fallbackResponse(query)
  }
}

private formatAPIResponses(responses: any[]) {
  return responses.map(response => ({
    apiName: response.source,
    data: response.data,
    cached: !!response.cachedAt,
    timestamp: new Date().toISOString()
  }))
}

private fallbackResponse(query: string) {
  return [{
    apiName: 'Fallback',
    data: { message: 'Unable to fetch real-time data. Please try again.' },
    cached: false,
    timestamp: new Date().toISOString()
  }]
}
```

### Step 2: Test Individual APIs

Create test script: `/backend/src/scripts/test-apis.ts`

```typescript
import { govAPIClient } from '../services/govApiClient.service'

async function testAPIs() {
  console.log('🧪 Testing Government APIs...\n')
  
  // Test Data.gov.in
  console.log('1️⃣ Testing Data.gov.in...')
  const dataGovResult = await govAPIClient.fetchDataGovIn('agriculture')
  console.log('Result:', dataGovResult.success ? '✅' : '❌')
  console.log('Data:', JSON.stringify(dataGovResult.data, null, 2))
  
  // Test NewsAPI
  console.log('\n2️⃣ Testing NewsAPI...')
  const newsResult = await govAPIClient.fetchNewsAPI('India economy')
  console.log('Result:', newsResult.success ? '✅' : '❌')
  console.log('Articles:', newsResult.data?.articles?.length || 0)
  
  // Test NDAP
  console.log('\n3️⃣ Testing NDAP...')
  const ndapResult = await govAPIClient.fetchNDAP('GDP growth')
  console.log('Result:', ndapResult.success ? '✅' : '❌')
  
  // Test PIB
  console.log('\n4️⃣ Testing PIB...')
  const pibResult = await govAPIClient.fetchPIB('agriculture')
  console.log('Result:', pibResult.success ? '✅' : '❌')
  
  console.log('\n✅ API Testing Complete!')
}

testAPIs()
```

Run test:
```bash
cd backend
npx tsx src/scripts/test-apis.ts
```

### Step 3: Update Data Models

Ensure database schema supports API metadata:

```typescript
// prisma/schema.prisma
model ApiLog {
  id            String   @id @default(cuid())
  apiName       String
  endpoint      String
  query         String
  responseTime  Int      // milliseconds
  statusCode    Int
  success       Boolean
  cached        Boolean  @default(false)
  errorMessage  String?
  createdAt     DateTime @default(now())
  
  @@index([apiName, createdAt])
  @@index([success])
}

model ApiCache {
  id         String   @id @default(cuid())
  cacheKey   String   @unique
  data       Json
  source     String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  accessedAt DateTime @default(now())
  hitCount   Int      @default(0)
  
  @@index([cacheKey])
  @@index([expiresAt])
}
```

Run migration:
```bash
npm run prisma:migrate
```

### Step 4: Implement Error Handling & Fallbacks

Create fallback service: `/backend/src/services/fallback.service.ts`

```typescript
export class FallbackService {
  // Maintain list of working APIs
  private healthyAPIs: Set<string> = new Set()
  
  async checkAPIHealth(apiName: string): Promise<boolean> {
    // Implement health check logic
    return true
  }
  
  async getAlternativeSources(failedSource: string, intent: string): string[] {
    // Return alternative APIs based on intent
    return []
  }
  
  async getFallbackData(query: string): Promise<any> {
    // Return cached or general information
    return {}
  }
}
```

### Step 5: Add Monitoring & Analytics

Create monitoring service: `/backend/src/services/monitoring.service.ts`

```typescript
export class MonitoringService {
  async logAPICall(apiName: string, success: boolean, responseTime: number) {
    await prisma.apiLog.create({
      data: {
        apiName,
        endpoint: '/query',
        query: 'tracked_separately',
        responseTime,
        statusCode: success ? 200 : 500,
        success,
      }
    })
  }
  
  async getAPIStats(apiName: string, timeRange: string) {
    // Return success rate, avg response time, etc.
  }
}
```

---

## 🧪 Testing Strategy

### 1. Unit Tests
```typescript
// __tests__/services/govApiClient.test.ts
describe('GovAPIClient', () => {
  it('should fetch from Data.gov.in successfully', async () => {
    const result = await govAPIClient.fetchDataGovIn('test query')
    expect(result.success).toBe(true)
  })
  
  it('should handle rate limiting', async () => {
    // Make more requests than rate limit
    // Expect rate limit error
  })
  
  it('should return cached data when available', async () => {
    // First call
    await govAPIClient.fetchDataGovIn('test')
    // Second call should be cached
    const result = await govAPIClient.fetchDataGovIn('test')
    expect(result.cachedAt).toBeDefined()
  })
})
```

### 2. Integration Tests
```typescript
describe('End-to-End API Flow', () => {
  it('should process query with real APIs', async () => {
    const response = await request(app)
      .post('/api/chat/query')
      .send({ query: 'Latest India GDP data' })
    
    expect(response.status).toBe(200)
    expect(response.body.message.sources).toBeDefined()
  })
})
```

### 3. Load Testing
```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:8000/api/chat/query

# Using Artillery
artillery quick --count 100 --num 10 http://localhost:8000/api/chat/query
```

---

## 📊 Monitoring Dashboard

Create admin endpoint to view API stats:

```typescript
// /backend/src/routes/admin.routes.ts
router.get('/api/admin/stats', async (req, res) => {
  const stats = {
    apiCalls: await prisma.apiLog.count(),
    successRate: await calculateSuccessRate(),
    avgResponseTime: await calculateAvgResponseTime(),
    cacheHitRate: await calculateCacheHitRate(),
    topAPIs: await getTopAPIs(),
  }
  
  res.json(stats)
})
```

---

## 🚀 Deployment Checklist

- [ ] All API keys added to production environment
- [ ] Rate limiting configured
- [ ] Caching enabled and tested
- [ ] Error handling implemented
- [ ] Fallback mechanisms in place
- [ ] Monitoring/logging configured
- [ ] Load testing completed
- [ ] Documentation updated
- [ ] Team trained on new APIs

---

## 📈 Success Metrics

Track these KPIs:
- **API Success Rate**: >95%
- **Average Response Time**: <3 seconds
- **Cache Hit Rate**: >60%
- **API Cost per Query**: <$0.01
- **User Satisfaction**: NPS >50

---

## 🐛 Troubleshooting

### Common Issues:

**1. Rate Limit Exceeded**
- Solution: Implement request queuing
- Increase cache time
- Add multiple API keys rotation

**2. API Timeout**
- Solution: Increase timeout values
- Implement retry logic with exponential backoff
- Use faster alternative APIs

**3. Invalid API Response**
- Solution: Add response validation
- Implement fallback data
- Log and alert on failures

**4. Cache Issues**
- Solution: Check Redis connection
- Verify cache key generation
- Monitor cache size

---

## 📚 Resources

- Data.gov.in Docs: https://data.gov.in/help/api
- NewsAPI Docs: https://newsapi.org/docs
- Redis Caching: https://redis.io/docs/manual/client-side-caching/
- Rate Limiting: https://github.com/animir/node-rate-limiter-flexible

---

## 👥 Team Responsibilities

**Backend Developer**:
- Implement API clients
- Set up caching
- Configure rate limiting
- Error handling

**DevOps**:
- Secure API keys
- Monitor API usage
- Set up alerts
- Performance optimization

**QA**:
- Test all APIs
- Verify error handling
- Load testing
- Document edge cases

---

*Ready to implement? Start with Step 1 and work through systematically!*
