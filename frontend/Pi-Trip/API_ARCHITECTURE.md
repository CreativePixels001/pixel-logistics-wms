# 🏛️ Government API Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         PI-TRIP APPLICATION                       │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      TRIP DETAILS PAGE                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  trip-details.html + trip-details.js                       │ │
│  │  • User clicks Featured Road Trip                          │ │
│  │  • loadTripDetails() triggered                             │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CHECK CACHE FIRST                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  localStorage.getItem('tourism_Manali')                    │ │
│  │  • Cache Hit (< 24h old) → Return cached data             │ │
│  │  • Cache Miss → Proceed to API fetch                      │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     TOURISM API SERVICE                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  tourism-api.js                                            │ │
│  │  • tourismAPI.getDestinationDetails('Manali')             │ │
│  │  • Parallel fetch from 3 sources                          │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                 │
                 ┌───────────────┼───────────────┐
                 │               │               │
                 ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ data.gov.in │  │  Incredible │  │    State    │
│             │  │    India    │  │   Tourism   │
│ Tourism DB  │  │  Ministry   │  │    Board    │
│             │  │  of Tourism │  │             │
└─────────────┘  └─────────────┘  └─────────────┘
       │                │                │
       └────────────────┼────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MERGE RESPONSES                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Promise.allSettled([api1, api2, api3])                   │ │
│  │  • Collect successful responses                           │ │
│  │  • Ignore failed requests                                 │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA ADAPTER                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  data-adapter.js                                           │ │
│  │  • transformDataGovIn()                                    │ │
│  │  • transformIncredibleIndia()                              │ │
│  │  • transformStateTourism()                                 │ │
│  │  • mergeResponses()                                        │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│               TRANSFORM TO TRIP FORMAT                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  transformAPIToTrip(apiData)                               │ │
│  │  {                                                         │ │
│  │    title: "Road Trip to Manali"                           │ │
│  │    highlights: [...]                                       │ │
│  │    itinerary: generateItinerary()                          │ │
│  │    packing: generatePackingList()                          │ │
│  │    amenities: generateAmenities()                          │ │
│  │    source: 'government-api'                                │ │
│  │  }                                                         │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                  SAVE TO CACHE                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  localStorage.setItem('tourism_Manali', {                 │ │
│  │    timestamp: Date.now(),                                  │ │
│  │    content: tripData                                       │ │
│  │  })                                                        │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                POPULATE PAGE DATA                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  populateTripData(trip)                                    │ │
│  │  • Update title, description                              │ │
│  │  • Render highlights cards                                │ │
│  │  • Generate itinerary timeline                            │ │
│  │  • Display packing list                                   │ │
│  │  • Show amenities                                         │ │
│  │  • Update data source badge                               │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DISPLAY TO USER                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  ✓ Hero section with grayscale image                      │ │
│  │  ✓ Data source badge (🏛️ Government Data)                 │ │
│  │  ✓ Highlights with line icons                             │ │
│  │  ✓ Day-by-day itinerary                                   │ │
│  │  ✓ Smart packing list                                     │ │
│  │  ✓ Amenities map                                          │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════

                        FALLBACK SYSTEM

┌─────────────────────────────────────────────────────────────────┐
│                 IF ANY API FAILS                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  try {                                                     │ │
│  │    await tourismAPI.getDestinationDetails()                │ │
│  │  } catch (error) {                                         │ │
│  │    // Use local templates                                  │ │
│  │    tripData = tripTemplates[destination]                   │ │
│  │    source: 'fallback'                                      │ │
│  │  }                                                         │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Configuration Layer

```
config.js
├── API Endpoints
│   ├── data.gov.in: api.data.gov.in/resource
│   ├── Incredible India: india.gov.in/api/tourism
│   ├── State Tourism: tourism boards URLs
│   └── ASI: asi.nic.in/api
│
├── API Keys
│   ├── dataGovIn.apiKey: "YOUR_KEY"
│   └── unsplash.accessKey: "YOUR_KEY"
│
├── Feature Flags
│   ├── useGovernmentAPI: true/false
│   ├── useFallbackData: true/false
│   ├── useUnsplash: true/false
│   └── showAPISource: true/false
│
└── Cache Settings
    ├── enabled: true
    ├── expiryHours: 24
    └── prefix: 'pitrip_'
```

---

## Data Flow Timeline

```
Time    Action
─────   ──────────────────────────────────────────────────
0ms     User clicks "Delhi to Manali" trip card
10ms    trip-details.html loads
20ms    loadTripDetails() called
30ms    Check localStorage cache
        
        ┌─ Cache Hit (data < 24h old)
        │  40ms   Load from cache
        │  50ms   Display data
        │  60ms   Done! ✅
        │
        └─ Cache Miss (no data or expired)
           40ms   Parallel API fetch started
           
           ┌─ data.gov.in (200-400ms)
           ├─ Incredible India (300-500ms)  
           └─ State Tourism (250-450ms)
           
           600ms  All APIs responded
           610ms  Merge data (dataAdapter)
           620ms  Transform to trip format
           630ms  Save to cache
           640ms  Display data
           650ms  Done! ✅
```

---

## Cache Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                     CACHE LIFECYCLE                               │
└─────────────────────────────────────────────────────────────────┘

First Visit (Manali)
  ↓
No Cache → API Fetch (600ms) → Save to Cache
  ↓
localStorage: {
  'pitrip_tourism_Manali': {
    timestamp: 1733414400000,
    content: { trip data... }
  }
}

Second Visit (within 24h)
  ↓
Cache Hit (10ms) → Load from localStorage
  ↓
Fast! No API call needed

After 24 Hours
  ↓
Cache Expired → Remove old data → API Fetch → Update Cache
```

---

## Error Handling

```
┌─────────────────────────────────────────────────────────────────┐
│                  ERROR SCENARIOS                                  │
└─────────────────────────────────────────────────────────────────┘

Scenario 1: No API Key
  ↓
API returns 401 Unauthorized
  ↓
Fallback to templates
  ↓
Badge shows: 📋 Template Data

Scenario 2: Network Offline
  ↓
Fetch fails
  ↓
Try cache first
  ↓
If cache exists → Use it (badge: 📦 Cached)
If no cache → Fallback (badge: 📋 Template)

Scenario 3: API Down
  ↓
Promise.allSettled() handles failures gracefully
  ↓
At least 1 API succeeds → Use available data
All APIs fail → Fallback

Scenario 4: Invalid Destination
  ↓
API returns empty
  ↓
createDefaultTrip(destination)
  ↓
Generic template with destination name
```

---

## Data Source Indicators

```
┌─────────────────────────────────────────────────────────────────┐
│                  DATA SOURCE BADGE                                │
└─────────────────────────────────────────────────────────────────┘

🏛️ Government Data (Green)
   ├─ Fresh from government API
   ├─ Verified official content
   └─ Most reliable

📦 Cached Data (Yellow)
   ├─ Loaded from localStorage
   ├─ Less than 24h old
   └─ Fast loading

📋 Template Data (Gray)
   ├─ Fallback templates
   ├─ API unavailable
   └─ Still functional
```

---

## Performance Optimization

```
Strategy                Impact              Benefit
─────────────────────  ──────────────────  ─────────────────────
Parallel API calls     3x faster           600ms vs 1800ms
localStorage cache     60x faster          10ms vs 600ms
Promise.allSettled     More reliable       Handles partial fails
Data deduplication     Smaller payload     Less memory
Lazy image loading     Faster initial      Better UX
Fallback templates     100% uptime         Never broken
```

---

## Security Measures

```
Layer           Protection              Implementation
──────────────  ──────────────────────  ────────────────────────
API Keys        Not in code             config.js (gitignored)
HTTPS Only      Encrypted transport     All endpoints HTTPS
Rate Limiting   Prevent abuse           Cache + 100 req/hr limit
CORS            Cross-origin security   Server-side validation
No PII          Privacy                 No user data sent
localStorage    Domain-scoped           Can't cross-site access
```

---

*Architecture diagram created: December 5, 2025*
