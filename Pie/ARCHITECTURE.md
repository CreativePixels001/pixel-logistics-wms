# 🇮🇳 Indian Government Data Q&A System - Architecture Document

## Executive Summary
A production-ready AI-powered chat application that answers user queries about India using official Government APIs and datasets.

---

## 1. System Architecture

### 1.1 High-Level Design
```
┌─────────────────────────────────────────────────────────────┐
│                   USERS (All India Scale)                    │
│              Mobile Apps + Web Browsers                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              CDN Layer (CloudFlare/AWS CloudFront)           │
│         • Static Assets Caching                              │
│         • DDoS Protection                                    │
│         • Edge Computing (Response time < 50ms)              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         Application Load Balancer (Multi-Region)             │
│         • Health Checks                                      │
│         • SSL Termination                                    │
│         • Auto-scaling triggers                              │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
┌──────────────────┐    ┌──────────────────────┐
│  FRONTEND TIER   │    │   BACKEND API TIER   │
│  (Next.js 14)    │◄───┤   (Node.js/Express)  │
│  • SSR/SSG       │    │   • REST + WebSocket │
│  • React Query   │    │   • JWT Auth         │
│  • Tailwind UI   │    │   • Rate Limiting    │
└──────────────────┘    └──────────┬───────────┘
                                   │
                ┌──────────────────┼──────────────────┐
                ▼                  ▼                  ▼
        ┌───────────────┐  ┌─────────────┐  ┌───────────────┐
        │ AI ORCHESTRATION│ │ GOVT API    │  │ CACHE LAYER   │
        │ • LangChain    │  │ AGGREGATOR  │  │ (Redis)       │
        │ • GPT-4/Claude │  │ • Retry Logic│  │ • Session     │
        │ • Vector DB    │  │ • Transform  │  │ • API Cache   │
        └───────────────┘  └─────────────┘  └───────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                             ▼
            ┌───────────────┐           ┌──────────────────┐
            │ PostgreSQL    │           │ INDIAN GOVT APIs │
            │ (Primary DB)  │           │ • data.gov.in    │
            │ • Users       │           │ • NDAP           │
            │ • Queries     │           │ • State APIs     │
            │ • Logs        │           │ • Ministry APIs  │
            └───────────────┘           └──────────────────┘
```

---

## 2. Technology Stack

### 2.1 Frontend
| Component | Technology | Justification |
|-----------|------------|---------------|
| Framework | Next.js 14 (App Router) | SSR, SSG, Edge functions, Image optimization |
| Language | TypeScript | Type safety, better DX |
| Styling | Tailwind CSS + shadcn/ui | Rapid development, consistency |
| State Management | React Query + Zustand | Server state caching, global state |
| Forms | React Hook Form + Zod | Performance, validation |
| Testing | Jest + React Testing Library | Industry standard |

### 2.2 Backend
| Component | Technology | Justification |
|-----------|------------|---------------|
| Runtime | Node.js 20 LTS | Performance, ecosystem |
| Framework | Express.js | Lightweight, flexible |
| Language | TypeScript | Type safety |
| ORM | Prisma | Type-safe queries, migrations |
| Validation | Zod | Shared with frontend |
| Queue | Bull (Redis) | Job processing, retries |
| Testing | Jest + Supertest | API testing |

### 2.3 AI/NLP Layer
- **LLM**: OpenAI GPT-4 Turbo / Anthropic Claude 3
- **Orchestration**: LangChain
- **Vector Database**: Pinecone or Qdrant (for semantic search)
- **Embeddings**: OpenAI text-embedding-3-large

### 2.4 Databases
- **Primary DB**: PostgreSQL 15+ (AWS RDS Multi-AZ)
- **Cache**: Redis 7+ (AWS ElastiCache)
- **Vector Store**: Pinecone / Qdrant

### 2.5 DevOps & Infrastructure
- **Containers**: Docker + Docker Compose
- **Orchestration**: AWS ECS Fargate / Kubernetes (EKS)
- **CI/CD**: GitHub Actions
- **IaC**: Terraform
- **Monitoring**: Grafana + Prometheus + Sentry
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)

---

## 3. Database Schema Design

### 3.1 Core Tables

```sql
-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(15) UNIQUE,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    metadata JSONB
);

-- Conversations Table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    title VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Messages Table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id),
    role VARCHAR(20), -- 'user' or 'assistant'
    content TEXT,
    metadata JSONB, -- API sources, intent, etc.
    created_at TIMESTAMP DEFAULT NOW()
);

-- API Logs Table
CREATE TABLE api_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES messages(id),
    api_name VARCHAR(255),
    endpoint VARCHAR(500),
    request_data JSONB,
    response_data JSONB,
    status_code INTEGER,
    latency_ms INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- API Cache Table
CREATE TABLE api_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key VARCHAR(500) UNIQUE,
    api_name VARCHAR(255),
    response_data JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    hit_count INTEGER DEFAULT 0
);

-- User Feedback Table
CREATE TABLE user_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES messages(id),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_api_logs_message_id ON api_logs(message_id);
CREATE INDEX idx_api_cache_key ON api_cache(cache_key);
CREATE INDEX idx_api_cache_expires ON api_cache(expires_at);
```

---

## 4. Indian Government API Integration

### 4.1 Primary Data Sources

1. **Open Government Data Platform (data.gov.in)**
   - API: https://data.gov.in/apis
   - Categories: Health, Education, Finance, Agriculture, etc.
   - Authentication: API Key

2. **National Data & Analytics Platform (NDAP)**
   - API: https://ndap.niti.gov.in/
   - Real-time datasets
   - Authentication: OAuth 2.0

3. **State Government Portals**
   - Maharashtra: https://data.maharashtra.gov.in
   - Karnataka: https://data.karnataka.gov.in
   - Delhi: https://data.delhi.gov.in

4. **Ministry Specific APIs**
   - Ministry of Health: NDHM APIs
   - Ministry of Education: UDISE+
   - Ministry of Finance: Budget APIs

### 4.2 API Wrapper Strategy

```typescript
interface GovAPIWrapper {
  name: string;
  baseUrl: string;
  authenticate(): Promise<string>;
  fetch(endpoint: string, params?: any): Promise<any>;
  transform(data: any): NormalizedData;
  cache(key: string, data: any, ttl: number): Promise<void>;
  retry(fn: Function, attempts: number): Promise<any>;
}
```

---

## 5. AI Query Processing Flow

```
User Query
    ↓
┌───────────────────────┐
│ Intent Classification │ ← GPT-4: Extract intent, entities, context
└───────┬───────────────┘
        ↓
┌───────────────────────┐
│ API Router            │ ← Match intent to Gov API sources
└───────┬───────────────┘
        ↓
┌───────────────────────┐
│ Parallel API Calls    │ ← Fetch from multiple sources
│ (with retry + cache)  │
└───────┬───────────────┘
        ↓
┌───────────────────────┐
│ Data Aggregation      │ ← Merge, deduplicate, enrich
└───────┬───────────────┘
        ↓
┌───────────────────────┐
│ Response Generation   │ ← GPT-4: Natural language answer
└───────┬───────────────┘
        ↓
    User Response
```

---

## 6. Security Architecture

### 6.1 Authentication & Authorization
- **User Auth**: JWT with refresh tokens
- **API Keys**: Encrypted storage in environment variables
- **Rate Limiting**: 100 requests/minute per user, 1000/minute per IP
- **CORS**: Whitelisted domains only

### 6.2 Data Protection
- **Encryption at Rest**: AES-256
- **Encryption in Transit**: TLS 1.3
- **PII Handling**: Minimal collection, anonymization
- **Compliance**: IT Act 2000, GDPR-inspired practices

### 6.3 Input Validation
- Zod schemas for all inputs
- SQL injection prevention (Prisma ORM)
- XSS protection (sanitization)
- CSRF tokens

---

## 7. Scalability Strategy

### 7.1 Horizontal Scaling
- **Auto-scaling**: CPU > 70% → add instances
- **Load Distribution**: Round-robin with health checks
- **Database**: Read replicas for queries
- **Redis Cluster**: Sharding for cache distribution

### 7.2 Performance Optimization
- **API Response Caching**: 5-60 min TTL based on data type
- **CDN**: 90% static assets from edge
- **Database Query Optimization**: Indexed queries, connection pooling
- **Lazy Loading**: Frontend components

### 7.3 Capacity Planning (All India Scale)
| Metric | Target | Infrastructure |
|--------|--------|----------------|
| Concurrent Users | 1M+ | 50+ ECS Tasks (2 vCPU, 4GB each) |
| Requests/Second | 10K+ | ALB + Auto-scaling |
| Database QPS | 50K+ | RDS Multi-AZ + 5 Read Replicas |
| Cache Hit Rate | 80%+ | Redis Cluster (20GB+) |
| Response Time | <500ms | CDN + Edge Computing |

---

## 8. Monitoring & Observability

### 8.1 Metrics
- **Application**: Request rate, error rate, latency (p50, p95, p99)
- **Infrastructure**: CPU, memory, disk, network
- **Business**: DAU, MAU, query types, satisfaction score

### 8.2 Logging
- **Structured Logs**: JSON format
- **Log Levels**: ERROR, WARN, INFO, DEBUG
- **Retention**: 30 days hot, 1 year cold storage

### 8.3 Alerting
- **Critical**: API down, DB connection loss → PagerDuty
- **Warning**: High latency, error rate spike → Slack
- **Info**: Deployment status → Email

---

## 9. Deployment Strategy

### 9.1 Environments
1. **Development**: Local Docker Compose
2. **Staging**: AWS ECS (Single AZ)
3. **Production**: AWS ECS Multi-Region (Mumbai, Delhi)

### 9.2 CI/CD Pipeline
```
Code Push → GitHub
    ↓
GitHub Actions
    ├─ Lint + Type Check
    ├─ Unit Tests
    ├─ Build Docker Images
    ├─ Push to ECR
    └─ Deploy to ECS (Blue-Green)
```

### 9.3 Rollback Strategy
- **Blue-Green Deployment**: Instant rollback
- **Database Migrations**: Backward compatible
- **Feature Flags**: LaunchDarkly for controlled rollouts

---

## 10. Cost Estimation (Monthly - All India Scale)

| Service | Specification | Cost (USD) |
|---------|--------------|-----------|
| AWS ECS | 50 tasks (2vCPU, 4GB) | $1,500 |
| RDS PostgreSQL | db.r6g.2xlarge Multi-AZ | $800 |
| ElastiCache Redis | cache.r6g.xlarge Cluster | $400 |
| CloudFront CDN | 1TB data transfer | $100 |
| S3 Storage | 500GB | $12 |
| OpenAI API | 10M tokens/day | $3,000 |
| Pinecone | 10M vectors | $70 |
| Monitoring | Grafana Cloud + Sentry | $200 |
| **Total** | | **~$6,000/month** |

*Optimizations possible: Self-hosted LLM, aggressive caching, reserved instances*

---

## 11. Development Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Week 1 | 7 days | Architecture, setup, DB schema |
| Week 2 | 7 days | Backend APIs, Gov API wrappers |
| Week 3 | 7 days | AI engine, query processing |
| Week 4 | 7 days | Frontend UI, chat interface |
| Week 5 | 7 days | Testing, security hardening |
| Week 6 | 7 days | DevOps, deployment, monitoring |
| **Total** | **6 weeks** | **Production-ready MVP** |

---

## 12. Success Metrics (KPIs)

1. **User Satisfaction**: >4.5/5 rating
2. **Response Accuracy**: >90% correct answers
3. **Uptime**: 99.9% availability
4. **Performance**: <500ms average response time
5. **Adoption**: 100K MAU in first 3 months

---

## 13. Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Gov API downtime | High | Multi-source fallback, cached data |
| API rate limits | Medium | Request queuing, distributed calls |
| Data privacy breach | Critical | Encryption, minimal PII, audits |
| AI hallucination | High | Source verification, human review loop |
| High costs | Medium | Auto-scaling limits, cost alerts |

---

**Document Version**: 1.0  
**Last Updated**: December 12, 2025  
**Maintained By**: Senior Full-Stack Solution Architect
