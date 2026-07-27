# Microservices Architecture - Complete Interview Guide
## For 8+ Years Experienced Senior Developers

---

## 1. Microservices Overview

### Definition
Microservices is an architectural style where an application is composed of small, independently deployable services, each running in its own process and communicating via lightweight mechanisms (typically HTTP/gRPC or messaging).

### Purpose
To enable large organizations to build and evolve complex systems by dividing them into autonomous, independently deployable units aligned with business capabilities.

### Problem It Solves
- **Deployment coupling**: Monolith requires deploying EVERYTHING for any change
- **Scaling limitations**: Can't scale individual components independently
- **Technology lock-in**: Entire app must use same technology stack
- **Team coordination overhead**: All developers modify same codebase
- **Blast radius**: One bug can take down the entire application

### Industry Relevance
- Netflix, Amazon, Uber — all run thousands of microservices at scale
- Required knowledge for any senior/architect role at large enterprises
- Azure, AWS, and GCP all provide microservices-native infrastructure
- Understanding when NOT to use them is equally valued in interviews

### When NOT to Use Microservices

```mermaid
flowchart TD
    A[Should I use Microservices?] --> B{Team size?}
    B -->|< 5 developers| C[❌ Monolith<br/>Overhead too high]
    B -->|5-20 developers| D{Domain complexity?}
    B -->|20+ developers| E[✅ Consider Microservices]
    
    D -->|Simple CRUD| F[❌ Monolith<br/>Not worth complexity]
    D -->|Complex domain| G{Operational maturity?}
    
    G -->|No CI/CD, no monitoring| H[❌ Monolith first<br/>Build ops capability]
    G -->|Mature DevOps| I[✅ Microservices]
    
    style C fill:#ffcdd2
    style F fill:#ffcdd2
    style H fill:#fff3e0
    style E fill:#c8e6c9
    style I fill:#c8e6c9
```

---

## 2. Architecture Concepts

### Monolith vs Microservices Comparison

| Aspect | Monolith | Microservices |
|--------|----------|---------------|
| Deployment | All-or-nothing, risky | Independent, low risk |
| Scaling | Entire application | Individual services |
| Data | Shared database | Database per service |
| Technology | Single stack | Polyglot (best tool per job) |
| Team Structure | Large coordinated team | Small autonomous teams |
| Complexity | In the code | In the infrastructure |
| Consistency | Strong (ACID) | Eventual (Saga pattern) |
| Debugging | Stack trace | Distributed tracing |
| Testing | Integration tests | Contract testing + E2E |
| Initial velocity | Higher (simpler) | Lower (more setup) |
| Long-term velocity | Decreases (coupling) | Maintained (independence) |

### Microservices Architecture Diagram

```mermaid
flowchart TD
    subgraph "Clients"
        W[Web App]
        M[Mobile App]
        T[Third Party]
    end
    
    subgraph "Edge Layer"
        AG[API Gateway<br/>Authentication<br/>Rate Limiting<br/>Routing]
    end
    
    subgraph "Service Layer"
        OS[Order Service]
        PS[Product Service]
        CS[Customer Service]
        PY[Payment Service]
        NS[Notification Service]
    end
    
    subgraph "Data Layer"
        ODB[(Order DB<br/>PostgreSQL)]
        PDB[(Product DB<br/>MongoDB)]
        CDB[(Customer DB<br/>SQL Server)]
        PYDB[(Payment DB<br/>PostgreSQL)]
        Cache[(Redis Cache)]
    end
    
    subgraph "Infrastructure"
        MB[Message Broker<br/>RabbitMQ / Service Bus]
        SD[Service Discovery]
        MT[Monitoring<br/>Prometheus + Grafana]
        TR[Distributed Tracing<br/>Jaeger / App Insights]
    end
    
    W --> AG
    M --> AG
    T --> AG
    AG --> OS & PS & CS
    OS --> ODB
    PS --> PDB
    CS --> CDB
    PY --> PYDB
    OS --> Cache
    PS --> Cache
    
    OS -.->|Events| MB
    MB -.-> PY
    MB -.-> NS
    MB -.-> PS
```

### Service Boundary Design (DDD)

```mermaid
flowchart TD
    subgraph "E-Commerce Bounded Contexts"
        A[Order Context<br/>Order lifecycle<br/>Order aggregate<br/>Cart management]
        B[Catalog Context<br/>Product information<br/>Categories<br/>Search]
        C[Customer Context<br/>User profiles<br/>Preferences<br/>Authentication]
        D[Payment Context<br/>Transactions<br/>Refunds<br/>Payment methods]
        E[Shipping Context<br/>Fulfillment<br/>Tracking<br/>Carrier integration]
        F[Notification Context<br/>Email/SMS/Push<br/>Templates<br/>Preferences]
    end
    
    A -.->|OrderPlaced event| D
    A -.->|OrderConfirmed event| E
    D -.->|PaymentCompleted event| A
    E -.->|Shipped event| F
    A -.->|OrderPlaced event| F
```

---

## 3. Communication Patterns

### Synchronous vs Asynchronous Communication

```mermaid
flowchart TD
    A[Inter-Service Communication] --> B[Synchronous]
    A --> C[Asynchronous]
    
    B --> B1[HTTP REST<br/>Simple, widely understood<br/>Coupled to availability]
    B --> B2[gRPC<br/>High performance, binary<br/>Strong contracts]
    
    C --> C1[Message Queue<br/>Point-to-point<br/>Guaranteed delivery]
    C --> C2[Pub/Sub Events<br/>One-to-many<br/>Loose coupling]
    C --> C3[Event Streaming<br/>Ordered log<br/>Replay capability]
    
    style B fill:#fff3e0
    style C fill:#e8f5e9
```

### Communication Pattern Selection

| Pattern | When to Use | Example | Drawback |
|---------|-------------|---------|----------|
| Sync HTTP/gRPC | Need immediate response | Get product price | Temporal coupling |
| Command Queue | Guaranteed delivery needed | Process payment | Latency |
| Domain Events | Multiple consumers react | Order placed | Eventual consistency |
| Event Streaming | Need replay/audit trail | Transaction log | Complexity |
| Request/Reply | Async but need response | Credit check | Correlation handling |

### Communication Flow Example

```mermaid
sequenceDiagram
    participant Client
    participant Gateway as API Gateway
    participant Order as Order Service
    participant Inventory as Inventory Service
    participant Payment as Payment Service
    participant Bus as Message Bus
    participant Notification as Notification Service
    
    Client->>Gateway: POST /orders
    Gateway->>Order: Create Order
    Order->>Inventory: gRPC: Check Stock (sync)
    Inventory-->>Order: Stock Available
    Order->>Bus: Publish: OrderCreated
    Order-->>Gateway: 202 Accepted (OrderId)
    Gateway-->>Client: 202 Accepted
    
    Bus->>Payment: OrderCreated
    Payment->>Payment: Process Payment
    Payment->>Bus: Publish: PaymentCompleted
    
    Bus->>Order: PaymentCompleted
    Order->>Order: Confirm Order
    
    Bus->>Notification: PaymentCompleted
    Notification->>Client: Email: Order Confirmed
```

---

## 4. Resilience Patterns

### Why Resilience Matters
In distributed systems, network calls WILL fail. The question is not IF but WHEN and HOW OFTEN.

```
Monolith failure:                    Microservices failure:
┌────────────────────────┐          ┌────────────────────────┐
│ One component fails    │          │ One service fails      │
│ → Entire app crashes   │          │ → That feature degrades│
│                        │          │ → Rest of app works    │
│ Binary: works or       │          │ → Graceful degradation │
│ doesn't               │          │                        │
└────────────────────────┘          └────────────────────────┘
                                    (Only with proper resilience!)
```

### Circuit Breaker Pattern

```mermaid
stateDiagram-v2
    [*] --> Closed
    Closed --> Open: Failure threshold exceeded
    Open --> HalfOpen: After timeout period
    HalfOpen --> Closed: Test call succeeds
    HalfOpen --> Open: Test call fails
    
    state Closed {
        [*] --> Normal
        Normal: Calls pass through
        Normal: Track failure count
    }
    
    state Open {
        [*] --> FailFast
        FailFast: All calls rejected immediately
        FailFast: No actual calls made
        FailFast: Return cached/fallback response
    }
    
    state HalfOpen {
        [*] --> Testing
        Testing: Allow limited test calls
        Testing: If succeeds → Closed
        Testing: If fails → Open again
    }
```

### Resilience Strategy Stack

```
┌─────────────────────────────────────────────────────────┐
│ RETRY (innermost)                                        │
│ Handles: transient failures, network blips               │
│ Config: 3 attempts, exponential backoff + jitter          │
├─────────────────────────────────────────────────────────┤
│ CIRCUIT BREAKER (wraps retry)                            │
│ Handles: downstream service outage                       │
│ Config: Open after 50% failure rate in 30s window        │
├─────────────────────────────────────────────────────────┤
│ TIMEOUT (wraps circuit breaker)                          │
│ Handles: slow responses, hanging connections             │
│ Config: 10 second overall timeout                        │
├─────────────────────────────────────────────────────────┤
│ BULKHEAD (wraps timeout)                                 │
│ Handles: resource exhaustion, noisy neighbor             │
│ Config: Max 20 concurrent calls per dependency           │
├─────────────────────────────────────────────────────────┤
│ FALLBACK (outermost)                                     │
│ Handles: all failures after other strategies exhausted   │
│ Config: Return cached data or degraded response          │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Saga Pattern

### Definition
A Saga is a sequence of local transactions where each step publishes an event or triggers the next step. If a step fails, compensating transactions undo the preceding steps.

### Why Sagas Exist
- Distributed transactions (2PC) don't scale and are fragile
- Each microservice owns its database (can't join across services)
- Need to maintain consistency across service boundaries
- Must handle partial failures gracefully

### Choreography vs Orchestration

```mermaid
flowchart TD
    subgraph "Choreography (Event-Driven)"
        A1[Order Service] -->|OrderCreated| B1[Payment Service]
        B1 -->|PaymentCompleted| C1[Inventory Service]
        C1 -->|InventoryReserved| D1[Shipping Service]
        
        B1 -->|PaymentFailed| A1
        C1 -->|OutOfStock| B1
        
        style A1 fill:#e1f5fe
        style B1 fill:#e8f5e9
        style C1 fill:#fff3e0
        style D1 fill:#fce4ec
    end
    
    subgraph "Orchestration (Central Coordinator)"
        O[Saga Orchestrator]
        O -->|1. Reserve| E1[Inventory]
        O -->|2. Charge| F1[Payment]
        O -->|3. Ship| G1[Shipping]
        O -->|4. Notify| H1[Notification]
        
        E1 -->|Success/Fail| O
        F1 -->|Success/Fail| O
        
        style O fill:#e1f5fe
    end
```

### Comparison

| Aspect | Choreography | Orchestration |
|--------|-------------|---------------|
| Coupling | Loose (event-driven) | Coupled to orchestrator |
| Complexity | Distributed, hard to track | Centralized, clear flow |
| Failure handling | Each service compensates | Orchestrator coordinates |
| Debugging | Difficult (follow events) | Easier (single point) |
| Best for | Simple flows (2-3 steps) | Complex flows (4+ steps) |
| Single point of failure | No | Yes (orchestrator) |

---

## 6. CQRS and Event Sourcing

### CQRS (Command Query Responsibility Segregation)

```mermaid
flowchart TD
    subgraph "Traditional (Single Model)"
        T1[Read + Write] --> T2[Same Database<br/>Same Model]
    end
    
    subgraph "CQRS (Separate Models)"
        C[Commands<br/>Create, Update, Delete] --> WM[Write Model<br/>Normalized<br/>Domain logic<br/>Validation]
        WM --> WDB[(Write DB<br/>SQL Server)]
        
        WDB -->|Events/Sync| RDB[(Read DB<br/>Denormalized<br/>Optimized views)]
        
        Q[Queries<br/>Read only] --> RM[Read Model<br/>Denormalized<br/>Fast queries]
        RM --> RDB
    end
    
    style WM fill:#fff3e0
    style RM fill:#e8f5e9
```

### When to Use CQRS

```
USE CQRS when:                          DON'T USE when:
✅ Read and write patterns differ       ❌ Simple CRUD application
✅ Different scaling needs              ❌ Single user system
✅ Complex domain logic on writes       ❌ Always need strong consistency
✅ Multiple read representations        ❌ Small team, simple domain
✅ Event-driven architecture already    ❌ Adding unnecessary complexity
```

---

## 7. Observability

### Three Pillars of Observability

```mermaid
flowchart TD
    A[Observability] --> B[Logs<br/>What happened?]
    A --> C[Metrics<br/>How is it performing?]
    A --> D[Traces<br/>Where did time go?]
    
    B --> B1[Structured logging<br/>Correlation IDs<br/>Log levels]
    C --> C1[Request rate<br/>Error rate<br/>Duration P95/P99]
    D --> D1[Distributed tracing<br/>Span context<br/>Service dependency map]
```

### Distributed Tracing Flow

```mermaid
sequenceDiagram
    participant Client
    participant API as API Gateway
    participant Order as Order Service
    participant DB as Database
    participant Payment as Payment Service
    
    Note over Client,Payment: Trace ID: abc-123
    
    Client->>API: Request (TraceId: abc-123, SpanId: span-1)
    API->>Order: Forward (TraceId: abc-123, SpanId: span-2, Parent: span-1)
    Order->>DB: Query (TraceId: abc-123, SpanId: span-3, Parent: span-2)
    DB-->>Order: Result (15ms)
    Order->>Payment: Charge (TraceId: abc-123, SpanId: span-4, Parent: span-2)
    Payment-->>Order: Success (200ms)
    Order-->>API: Response (TraceId: abc-123)
    API-->>Client: Final Response
    
    Note over Client,Payment: Total: 250ms<br/>DB: 15ms, Payment: 200ms<br/>Bottleneck: Payment Service
```

---

## 8. Interview Questions with Detailed Answers

### Q: How do you handle distributed transactions across microservices?

**Senior-Level Answer:**
Never use distributed 2-phase commit across microservices - it creates tight coupling and doesn't scale.

Use the Saga pattern instead:
- **Choreography** for simple flows (2-3 services): Each service publishes events, next service reacts
- **Orchestration** for complex flows (4+ services): Central coordinator manages steps and compensations

Key principles:
- Each local transaction is independently ACID
- Compensating actions undo previous steps on failure
- Every operation must be idempotent (safe to retry)
- Use the Outbox pattern to ensure events are published reliably

### Q: Explain the Outbox Pattern

**Senior-Level Answer:**
The Outbox pattern solves the "dual write" problem: you need to update your database AND publish an event, but these are two separate systems that can't share a transaction.

Solution: Write the event to an "outbox" table in the SAME database transaction as your business data. A separate background process (relay/publisher) reads the outbox and publishes to the message broker, then marks as processed.

This guarantees at-least-once delivery. Consumers MUST be idempotent because events may be delivered more than once.

### Q: When would you NOT use microservices?

**Senior-Level Answer:**
1. Small teams (< 5 devs) - operational overhead exceeds benefits
2. Unclear domain boundaries - you'll get the boundaries wrong and refactoring distributed systems is expensive
3. Low operational maturity - need CI/CD, monitoring, distributed tracing FIRST
4. Simple domains - CRUD apps don't benefit from the complexity
5. Prototypes/MVPs - speed to market matters more than scalability
6. Strict latency requirements - network hops add latency

My recommendation: Start monolith with clear module boundaries. Extract services when you have clear scaling needs, team growth, or deployment independence requirements.

---

## 9. API Gateway Pattern

### Definition
An API Gateway provides a single entry point for all client requests, handling cross-cutting concerns and routing to appropriate backend services.

### Architecture

```mermaid
flowchart TD
    subgraph "Clients"
        A[Web App]
        B[Mobile App]
        C[Third-Party]
    end
    
    subgraph "API Gateway (Azure APIM)"
        D[Authentication & Authorization]
        E[Rate Limiting & Throttling]
        F[Request/Response Transformation]
        G[Load Balancing & Routing]
        H[Caching]
        I[API Versioning]
    end
    
    subgraph "Backend Services"
        J[Order Service]
        K[Customer Service]
        L[Inventory Service]
        M[Payment Service]
    end
    
    A --> D
    B --> D
    C --> D
    D --> E --> F --> G
    G --> J
    G --> K
    G --> L
    G --> M
    H -.-> G
```

### Backend for Frontend (BFF) Pattern

```
Problem: Mobile and Web need DIFFERENT data shapes from same services

Solution: BFF per client type

Web App ────▶ Web BFF ────┐
                          ├──▶ Order Service
Mobile App ──▶ Mobile BFF ─┤
                          ├──▶ Customer Service
Admin App ───▶ Admin BFF ──┘

Web BFF: Returns rich data, full details, analytics
Mobile BFF: Returns minimal data, optimized for bandwidth
Admin BFF: Returns management data, bulk operations
```

---

## 10. Data Management in Microservices

### Database per Service Pattern

```mermaid
flowchart TD
    subgraph "❌ Shared Database Anti-Pattern"
        A1[Service A] --> DB1[(Shared DB)]
        B1[Service B] --> DB1
        C1[Service C] --> DB1
        Note1[Tight coupling through schema<br/>Can't deploy independently<br/>Performance contention]
    end
    
    subgraph "✅ Database per Service"
        A2[Order Service] --> DB2[(Orders DB<br/>SQL Server)]
        B2[Catalog Service] --> DB3[(Catalog DB<br/>Cosmos DB)]
        C2[Search Service] --> DB4[(Search Index<br/>Elasticsearch)]
        
        A2 -.->|Events| B2
        B2 -.->|Events| C2
        Note2[Independent schemas<br/>Best tech per service<br/>Eventual consistency via events]
    end
```

### Data Consistency Patterns

| Pattern | Consistency | Complexity | Use Case |
|---------|-------------|-----------|----------|
| Saga | Eventual | High | Multi-service writes |
| Event Sourcing | Eventual | Very High | Audit trail, temporal queries |
| Outbox Pattern | At-least-once | Medium | Reliable event publishing |
| Change Data Capture | Eventual | Medium | Sync data between services |
| API Composition | Read-time | Low | Join data from multiple services |

### Event Sourcing Explained

```
Traditional (State-based):          Event Sourcing:
┌──────────────────────────┐       ┌──────────────────────────────────────┐
│ Order { Status: Shipped } │       │ Events:                              │
│                           │       │ 1. OrderCreated { items, customer }  │
│ Only current state        │       │ 2. PaymentReceived { amount, txnId } │
│ History is lost           │       │ 3. InventoryReserved { items }       │
│                           │       │ 4. OrderShipped { trackingId }       │
│                           │       │                                      │
│                           │       │ Current state = replay all events    │
│                           │       │ Full audit trail preserved           │
│                           │       │ Can rebuild state at any point       │
└──────────────────────────┘       └──────────────────────────────────────┘
```

---

## 11. Service Mesh and Sidecar Pattern

### Definition
A service mesh provides infrastructure-level handling of service-to-service communication, including traffic management, security, and observability — without changing application code.

### Architecture

```mermaid
flowchart TD
    subgraph "Service A Pod"
        A[App Container] --> SA[Sidecar Proxy<br/>Envoy/Dapr]
    end
    
    subgraph "Service B Pod"
        SB[Sidecar Proxy<br/>Envoy/Dapr] --> B[App Container]
    end
    
    SA -->|mTLS encrypted| SB
    
    subgraph "Control Plane"
        CP[Mesh Controller<br/>Istio/Linkerd]
        CP -.->|Config| SA
        CP -.->|Config| SB
    end
    
    style SA fill:#fff3e0
    style SB fill:#fff3e0
```

### Dapr (Distributed Application Runtime) with .NET

```csharp
// Service invocation via Dapr (no service URLs in code!)
public class OrderService
{
    private readonly DaprClient _dapr;
    
    public async Task<InventoryStatus> CheckInventoryAsync(string productId)
    {
        // Dapr handles: service discovery, retries, circuit breaking, mTLS
        return await _dapr.InvokeMethodAsync<InventoryStatus>(
            appId: "inventory-service",   // Logical name, not URL
            methodName: "check",
            data: new { ProductId = productId });
    }
    
    // State management (Dapr abstracts Redis/Cosmos/etc.)
    public async Task SaveOrderStateAsync(Order order)
    {
        await _dapr.SaveStateAsync("statestore", order.Id, order);
    }
    
    // Pub/Sub (Dapr abstracts Service Bus/Kafka/etc.)
    public async Task PublishOrderCreatedAsync(Order order)
    {
        await _dapr.PublishEventAsync("pubsub", "orders", new OrderCreatedEvent(order));
    }
}
```

---

## 12. Testing Microservices

### Testing Strategy

```mermaid
flowchart TD
    A[Testing Pyramid for Microservices] --> B[Unit Tests<br/>Domain logic, handlers<br/>Fast, isolated]
    A --> C[Integration Tests<br/>API endpoints, DB<br/>WebApplicationFactory + TestContainers]
    A --> D[Contract Tests<br/>Pact - verify API contracts<br/>between producer & consumer]
    A --> E[End-to-End Tests<br/>Full system flows<br/>Few, slow, expensive]
    
    style B fill:#e8f5e9
    style C fill:#fff3e0
    style D fill:#e1f5fe
    style E fill:#ffcdd2
```

### Contract Testing with Pact

```
Problem: Service A calls Service B
         Service B changes its API → Service A breaks in production!

Solution: Consumer-Driven Contracts (Pact)

1. Consumer (Service A) writes expectations:
   "I expect GET /orders/{id} to return { id, status, total }"

2. Pact generates contract file (.json)

3. Provider (Service B) runs contract against its implementation:
   "Can I fulfill what Service A expects?" ✅ or ❌

4. If provider breaks contract → Build fails BEFORE deployment
```

### Integration Testing with TestContainers

```csharp
// Spin up real dependencies in Docker for integration tests
public class OrderServiceIntegrationTests : IAsyncLifetime
{
    private MsSqlContainer _sqlContainer = null!;
    private WebApplicationFactory<Program> _factory = null!;
    
    public async Task InitializeAsync()
    {
        _sqlContainer = new MsSqlBuilder()
            .WithImage("mcr.microsoft.com/mssql/server:2022-latest")
            .Build();
        await _sqlContainer.StartAsync();
        
        _factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    services.RemoveAll<DbContextOptions<AppDbContext>>();
                    services.AddDbContext<AppDbContext>(options =>
                        options.UseSqlServer(_sqlContainer.GetConnectionString()));
                });
            });
    }
    
    [Fact]
    public async Task CreateOrder_ReturnsCreated()
    {
        var client = _factory.CreateClient();
        var response = await client.PostAsJsonAsync("/orders", new { CustomerId = "123" });
        
        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }
    
    public async Task DisposeAsync()
    {
        await _sqlContainer.DisposeAsync();
        await _factory.DisposeAsync();
    }
}
```

---

## 13. Security in Microservices

### Zero Trust Architecture

```mermaid
flowchart TD
    A[Microservices Security] --> B[Authentication<br/>Who are you?]
    A --> C[Authorization<br/>What can you do?]
    A --> D[Encryption<br/>mTLS between services]
    A --> E[Secrets Management<br/>Key Vault, no hardcoded secrets]
    
    B --> B1[API Gateway validates JWT<br/>Services verify audience claim]
    C --> C1[Policy-based per endpoint<br/>Scope-based access control]
    D --> D1[Service mesh handles mTLS<br/>All internal traffic encrypted]
    E --> E1[Managed Identity for Azure services<br/>Rotate secrets automatically]
```

### Service-to-Service Authentication

```
Pattern: Token Exchange (on-behalf-of flow)

User → API Gateway (validates user token)
     → Order Service (receives scoped service token)
     → Payment Service (validates Order Service's identity)

Each service verifies:
1. Token is from trusted issuer (Azure AD)
2. Audience claim matches this service
3. Scopes/roles authorize the operation
4. Token hasn't expired
```

---

## 14. Best Practices Summary

```mermaid
mindmap
  root((Microservices<br/>Best Practices))
    Design
      Single responsibility per service
      Define clear bounded contexts
      API-first design with OpenAPI
      Design for failure
    Communication
      Prefer async over sync
      Use events for loose coupling
      Idempotent consumers always
      Contract testing between services
    Data
      Database per service
      Event sourcing for audit trails
      Outbox pattern for reliability
      CQRS when read/write differ
    Operations
      CI/CD per service
      Distributed tracing mandatory
      Health checks and readiness probes
      Feature flags for safe rollout
    Resilience
      Circuit breakers on all external calls
      Retry with exponential backoff
      Bulkhead isolation
      Graceful degradation
```

---

## 15. Interview Perspective - What Interviewers Expect

For 8+ years experience, microservices interviewers expect:

1. **Decomposition reasoning** - Why split here? What are the bounded contexts?
2. **Distributed systems awareness** - CAP, eventual consistency, network partitions
3. **Pattern selection** - Saga vs 2PC, choreography vs orchestration, when sync vs async
4. **Production experience** - "We had a cascading failure because..."
5. **Observability strategy** - How to debug across 20 services?
6. **When NOT to use** - Knowing monolith is sometimes better

### Follow-up Questions to Prepare For:
- "How do you handle a breaking API change across 5 consuming services?"
- "Your order service is getting 10x more traffic. What do you do?"
- "How do you debug a request that touches 8 services?"
- "Design the data flow for eventual consistency in an e-commerce checkout"
- "How do you handle schema evolution in event-driven systems?"
- "What's your deployment strategy for zero-downtime releases?"
