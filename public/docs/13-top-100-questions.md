# Top 100 Interview Questions with Answers
## For Senior .NET Full Stack Developer (8+ Years Experience)

---

## .NET Core & C# (Questions 1-25)

### Q1: What is the difference between .NET Core and .NET Framework?
**A:** .NET Core (now .NET 5+) is cross-platform, open-source, high-performance with side-by-side deployment. .NET Framework is Windows-only, machine-wide install, maintenance mode. Always choose .NET 8+ for new projects.

### Q2: Explain the .NET request pipeline
**A:** Request enters Kestrel → passes through middleware chain (each can short-circuit) → reaches endpoint → response flows back through middleware in reverse order. Middleware order matters: exception handling first, then auth, then routing, then endpoint.

### Q3: What are the differences between Transient, Scoped, and Singleton?
**A:** Transient: new instance per injection. Scoped: one per HTTP request. Singleton: one for app lifetime. Rule: never inject shorter-lived into longer-lived (Scoped into Singleton = captive dependency bug).

### Q4: How does async/await work internally?
**A:** Compiler generates a state machine. At `await`, if task incomplete: saves state, registers continuation, releases thread. When awaited task completes: continuation resumes (on captured SynchronizationContext or thread pool). No thread is blocked during the wait.

### Q5: What is middleware and how do you create custom middleware?
**A:** Middleware is a component that handles requests/responses in the pipeline. Create via class with `InvokeAsync(HttpContext context)` method and `RequestDelegate _next`. Register with `app.UseMiddleware<T>()`. Each middleware can process before/after calling `_next`.

### Q6: Explain IOptions, IOptionsSnapshot, and IOptionsMonitor
**A:** IOptions: singleton, never reloads. IOptionsSnapshot: scoped, reloads per request. IOptionsMonitor: singleton with change tracking and OnChange callback. Use Monitor for long-running services needing hot-reload.

### Q7: What is the difference between Task.Run and await?
**A:** `await` suspends without blocking (I/O). `Task.Run` offloads CPU-bound work to thread pool. In ASP.NET, don't wrap I/O in Task.Run (wastes a thread). Use Task.Run only for CPU-intensive parallel work.

### Q8: How do you prevent memory leaks in .NET?
**A:** Implement IDisposable for unmanaged resources, unsubscribe from events, use WeakReference for caches, avoid static collections growing unbounded, use MemoryCache with size limits, profile with dotnet-dump.

### Q9: What are records in C# and when do you use them?
**A:** Records provide value equality, immutability (init-only by default), `with` expressions for non-destructive mutation, and concise syntax. Use for DTOs, value objects, events, commands. Don't use for entities with identity-based equality.

### Q10: Explain Span<T> and its benefits
**A:** Span<T> provides safe access to contiguous memory (arrays, strings, native memory) without allocation. It's a ref struct (stack only, can't be boxed, can't be in async methods). Used for high-performance string parsing, buffer management, zero-allocation slicing.


### Q11: What is the difference between abstract class and interface?
**A:** Abstract class: single inheritance, can have state/constructors, partial implementation. Interface: multiple implementation, no state (until C# 8 default methods), pure contract. Use abstract for IS-A with shared behavior; interface for CAN-DO capabilities.

### Q12: How does garbage collection work in .NET?
**A:** GC uses generational collection (Gen0, Gen1, Gen2 + LOH). Objects start in Gen0. Survived objects promote to Gen1, then Gen2. Gen0 collections are fast and frequent. Gen2 collections are expensive. LOH (>85KB) collects with Gen2. Server GC uses thread per CPU core.

### Q13: What are delegates and events? How are they different?
**A:** Delegates are type-safe function pointers. Events are delegates with restricted access (only owner class can invoke). Events support multicast (multiple subscribers). Use events for publish-subscribe within a component; delegates for callbacks and strategies.

### Q14: Explain covariance and contravariance
**A:** Covariance (`out`): IEnumerable<Dog> assignable to IEnumerable<Animal> (can return derived). Contravariance (`in`): Action<Animal> assignable to Action<Dog> (can accept base). Applies to generic interfaces/delegates with type params used only as output or input.

### Q15: What is the difference between `ref`, `in`, and `out` parameters?
**A:** `ref`: bidirectional, must be initialized. `out`: output only, must be assigned in method. `in`: readonly reference (prevents copy for large structs). Use `in` for performance with readonly structs > 16 bytes.

### Q16: How do you implement global exception handling in .NET 8?
**A:** Implement `IExceptionHandler`, register with `builder.Services.AddExceptionHandler<T>()`, use `app.UseExceptionHandler()`. Map exception types to appropriate HTTP status codes and ProblemDetails responses.

### Q17: What are source generators?
**A:** Compile-time code generation that runs during compilation. Generates C# files added to compilation. Replaces runtime reflection (faster, AOT-compatible). Examples: System.Text.Json serialization, regex, logging.

### Q18: Explain the difference between ValueTask and Task
**A:** Task always allocates on heap. ValueTask is a struct that can wrap a synchronous result without allocation. Use ValueTask for methods that often complete synchronously (cache hits). Don't await ValueTask multiple times or store it.

### Q19: What is IHttpClientFactory and why use it?
**A:** Factory manages HttpClient lifetime, prevents socket exhaustion (reuses connections), supports named/typed clients, integrates with Polly for resilience. Never `new HttpClient()` in a loop (DNS changes aren't respected, sockets leak).

### Q20: How does EF Core change tracking work?
**A:** EF Core tracks entity state (Added, Modified, Deleted, Unchanged) via snapshot comparison or notification. On SaveChanges, generates SQL for changed entities. Disable with `AsNoTracking()` for read-only queries (significant performance improvement).

### Q21: What are channels in .NET?
**A:** Thread-safe producer-consumer data structures. Bounded (backpressure) or Unbounded. Async-friendly with `WriteAsync`/`ReadAllAsync`. Better than `BlockingCollection` for async scenarios. Used in high-performance pipelines and background processing.

### Q22: Explain Output Caching vs Response Caching
**A:** Response Caching: HTTP-based (Cache-Control headers), client/proxy caching. Output Caching (.NET 7+): Server-side, tag-based invalidation, programmatic control, works without HTTP headers. Output Caching gives you more control.

### Q23: What is the Options pattern validation with ValidateOnStart?
**A:** Validates configuration at startup before serving traffic. Fail-fast approach catches misconfiguration immediately. Register with `.ValidateDataAnnotations().ValidateOnStart()`. Prevents runtime failures from invalid config.

### Q24: How do you implement health checks?
**A:** Register with `builder.Services.AddHealthChecks().AddSqlServer().AddRedis()`. Map endpoints: `/health/live` (basic), `/health/ready` (with dependencies). Kubernetes uses liveness for restart, readiness for traffic routing.

### Q25: What's new in .NET 8?
**A:** Native AOT improvements, Blazor United, keyed DI services, TimeProvider abstraction, FrozenDictionary/FrozenSet, IExceptionHandler, short-circuit routing, improved minimal APIs with form binding.

---

## Angular (Questions 26-40)


### Q26: What are Angular Signals?
**A:** Fine-grained reactive primitives (Angular 16+). `signal()` holds a value, `computed()` derives values, `effect()` runs side effects. Signals enable zone-less change detection and better performance than Zone.js. They replace many RxJS use cases for synchronous state.

### Q27: Explain Angular change detection
**A:** Zone.js patches async APIs, triggers change detection on every event. Default strategy checks entire tree. OnPush only checks when: Input ref changes, event fires, or async pipe emits. Signals provide even finer granularity.

### Q28: What is the difference between switchMap, mergeMap, concatMap, and exhaustMap?
**A:** switchMap: cancels previous (search). mergeMap: parallel, no order. concatMap: sequential, preserves order. exhaustMap: ignores new until current completes (form submit). Choose based on whether order matters and whether previous should be cancelled.

### Q29: How do you prevent memory leaks in Angular?
**A:** Use `takeUntilDestroyed()` (Angular 16+), `takeUntil(destroy$)` pattern, async pipe (auto-unsubscribes), or manual unsubscribe in `ngOnDestroy`. Never subscribe in component without cleanup plan.

### Q30: What are standalone components?
**A:** Components without NgModules (default in Angular 17+). Import dependencies directly in component decorator. Simplifies app structure, enables better tree-shaking, easier lazy loading with `loadComponent`.

### Q31: Explain Angular's new control flow
**A:** `@if/@else` replaces `*ngIf`, `@for` replaces `*ngFor` (requires `track`), `@switch` replaces `ngSwitch`, `@defer` enables lazy loading components. Built into template compiler, better performance than structural directives.

### Q32: How does lazy loading work in Angular?
**A:** Routes use `loadComponent` or `loadChildren` to code-split. Webpack creates separate chunks loaded on navigation. Use `@defer` for component-level lazy loading. Preloading strategies (PreloadAllModules) improve UX for likely-needed routes.

### Q33: What is NgRx and when should you use it?
**A:** Redux-inspired state management (Store, Actions, Reducers, Effects, Selectors). Use for: complex shared state, undo/redo, time-travel debugging. Don't use for: simple apps, local component state. Modern alternative: SignalStore (simpler API with signals).

### Q34: How do you optimize Angular bundle size?
**A:** Lazy loading, standalone components (tree-shaking), @defer, Angular CLI budgets, avoid importing full libraries, use source-map-explorer to analyze. AOT compilation (default) removes template compiler from bundle.

### Q35: Explain Angular HTTP interceptors
**A:** Middleware for HTTP requests/responses. Use for: adding auth tokens, caching, retry logic, error handling, loading indicators. In Angular 17+, use functional interceptors with `withInterceptors([authInterceptor, errorInterceptor])`.

### Q36: What is Content Projection?
**A:** Passing template content into a component's designated slot (`<ng-content>`). Multi-slot projection with `select` attribute. Used for wrapper/layout components. Similar to React's children prop.

### Q37: How do Reactive Forms differ from Template-Driven Forms?
**A:** Reactive: Programmatic, immutable model, synchronous access, easier testing, better for dynamic forms. Template-driven: Directive-based, two-way binding, simpler for basic forms. Senior devs should prefer Reactive Forms for complex scenarios.

### Q38: What is ControlValueAccessor?
**A:** Interface for creating custom form controls that work with Angular's form system. Bridges native form element to Reactive/Template forms. Methods: writeValue, registerOnChange, registerOnTouched, setDisabledState.

### Q39: How do you handle errors globally in Angular?
**A:** HTTP interceptor for API errors (401 → refresh token, 403 → redirect, 5xx → retry/show error). Custom ErrorHandler class for unhandled exceptions. Global error boundary component. Structured error messaging to user.

### Q40: Explain Angular's dependency injection hierarchy
**A:** Hierarchical injectors: Root → Module → Component. ProvidedIn 'root' = singleton. Provided in component = instance per component. This enables scoped services (e.g., form state per component instance).

---

## SQL Server (Questions 41-55)

### Q41: What is a clustered vs non-clustered index?
**A:** Clustered: determines physical row order, one per table, leaf = data. Non-clustered: separate structure with pointers to data, up to 999 per table, leaf = index key + bookmark to clustered index.

### Q42: What is a covering index?
**A:** Index containing all columns needed by a query (key + INCLUDE columns). Eliminates key lookup to clustered index. Most impactful single optimization for read queries.

### Q43: How do you identify and fix a slow query?
**A:** Check execution plan (scans → seeks, key lookups → covering index), STATISTICS IO (logical reads), check for implicit conversions, parameter sniffing, missing indexes (DMVs), non-sargable predicates.

### Q44: Explain transaction isolation levels
**A:** READ UNCOMMITTED (dirty reads OK), READ COMMITTED (default, no dirty reads), REPEATABLE READ (no non-repeatable), SERIALIZABLE (no phantom reads), SNAPSHOT (row versioning, no blocking). Choose based on consistency vs concurrency needs.

### Q45: What is parameter sniffing?
**A:** SQL Server compiles plan for first parameter value. Subsequent calls reuse that plan even if different parameters would benefit from a different plan. Fix: RECOMPILE option, OPTIMIZE FOR UNKNOWN, or Query Store forced plans.

### Q46: Difference between DELETE, TRUNCATE, and DROP?
**A:** DELETE: row-by-row, logged, triggers fire, can filter. TRUNCATE: deallocate pages, minimal log, resets identity, no triggers. DROP: removes table entirely. Use TRUNCATE for clearing large tables, DELETE for selective removal.

### Q47: What are window functions?
**A:** Functions that compute across a set of rows (window) without collapsing them. ROW_NUMBER, RANK, DENSE_RANK for numbering. LAG/LEAD for comparing adjacent rows. SUM/AVG OVER for running totals. Essential for analytics queries.

### Q48: How do you handle deadlocks?
**A:** Prevention: access tables in consistent order, keep transactions short, use SNAPSHOT isolation. Detection: SQL Server automatically detects and kills one victim. Recovery: implement retry logic for error 1205.

### Q49: What is a CTE and when do you use it?
**A:** Common Table Expression: named temporary result set for query readability. Use for: recursive queries (hierarchies), breaking complex queries into steps, pagination with ROW_NUMBER. Not persisted - re-evaluated each reference.

### Q50: Explain CROSS APPLY vs OUTER APPLY
**A:** CROSS APPLY: like INNER JOIN for table-valued functions (only returns rows where function returns data). OUTER APPLY: like LEFT JOIN (returns all left rows with NULLs if function returns nothing). Used with TVFs and lateral queries.

### Q51: What are filtered indexes?
**A:** Indexes with a WHERE clause. Smaller, faster, less maintenance than full indexes. Use when queries consistently filter on a condition (e.g., WHERE IsActive = 1 covers 5% of rows).

### Q52: How does SQL Server handle concurrency?
**A:** Lock-based (default): shared/exclusive locks with escalation. Row versioning (SNAPSHOT/RCSI): readers don't block writers. TempDB stores row versions. RCSI recommended for OLTP workloads to reduce blocking.

### Q53: What is query plan caching?
**A:** SQL Server caches execution plans by query hash. Parameterized queries reuse plans. Dynamic SQL with string concatenation creates new plan per unique string. Use sp_executesql for parameterized dynamic SQL.

### Q54: Explain columnstore indexes
**A:** Column-based storage with high compression. Ideal for analytical queries on large tables. 10-100x compression, 10-100x faster for aggregations. Use for data warehouse / reporting tables. Not for OLTP point lookups.

### Q55: How do you migrate database schema safely?
**A:** Use EF Core migrations or DbUp/Flyway. Deploy schema changes before code (backward compatible). Add columns as nullable, backfill, then make required. Never drop columns in same release as code change. Blue-green deployment for zero-downtime.


---

## Microservices (Questions 56-70)

### Q56: When should you NOT use microservices?
**A:** Small teams (<5 devs), unclear domain boundaries, early-stage products, when operational maturity is low (no CI/CD, monitoring), prototypes. Start monolith, extract services when boundaries become clear and team grows.

### Q57: How do you handle distributed transactions?
**A:** Use Saga pattern. Never distributed 2PC across services. Choreography (events) for simple flows. Orchestration (central coordinator) for complex flows. Each step must be idempotent with compensation logic for rollbacks.

### Q58: What is the Circuit Breaker pattern?
**A:** Prevents cascading failures. States: Closed (normal), Open (fail fast after threshold), Half-Open (test with limited calls). After break duration, allows test call. If succeeds → Closed. If fails → Open again. Implemented with Polly/Microsoft.Extensions.Resilience.

### Q59: Explain the Outbox Pattern
**A:** Solves dual-write problem (DB + event bus). Write event to outbox table in same DB transaction as business data. Background process reads outbox, publishes to broker, marks as processed. Guarantees at-least-once delivery. Consumers must be idempotent.

### Q60: What is CQRS?
**A:** Command Query Responsibility Segregation. Separate write model (normalized, consistent) from read model (denormalized, fast). Events synchronize read model from write model. Benefits: independent scaling, optimized query stores, simpler models.

### Q61: How do you handle service discovery?
**A:** DNS-based (Kubernetes Services), Client-side (Consul, Eureka), Server-side (load balancer). In Azure: Azure Container Apps use internal DNS. AKS uses Kubernetes Services + Ingress. API Management for external discovery.

### Q62: What is Event Sourcing?
**A:** Store every state change as an event (append-only). Current state = replay all events. Benefits: complete audit trail, temporal queries, event replay. Challenges: eventual consistency, query complexity (use projections), storage growth.

### Q63: How do you test microservices?
**A:** Unit tests (per service), Integration tests (service + its DB), Contract tests (Pact - verify API compatibility), Component tests (service in isolation with mocked deps), E2E tests (minimal, happy paths only). Testing pyramid applies.

### Q64: Explain API Gateway pattern
**A:** Single entry point for all clients. Handles: routing, authentication, rate limiting, response aggregation, protocol translation. Implementations: Azure API Management, Kong, Ocelot. Avoids client coupling to internal service topology.

### Q65: What is the Strangler Fig pattern?
**A:** Gradually replace monolith functionality with microservices. Route new features to new services, migrate existing features incrementally. Use API Gateway/proxy to route traffic. Old and new coexist during transition. Zero big-bang migration risk.

### Q66: How do you handle eventual consistency?
**A:** Accept it as a trade-off for availability/performance. Techniques: optimistic UI (show pending state), compensation on conflict, idempotent operations, read-your-writes (read from primary after write), version vectors for conflict resolution.

### Q67: What is the Sidecar pattern?
**A:** Attach helper container alongside main service container. Handles cross-cutting: logging, monitoring, security, networking. Examples: Envoy proxy (Istio), Dapr sidecar. Keeps main service focused on business logic.

### Q68: How do you implement health checks across services?
**A:** Each service exposes /health endpoint. Liveness: is process running? Readiness: can it handle traffic (DB connected, dependencies available)? Kubernetes uses these for restart/routing decisions. Cascade dependency health (shallow vs deep checks).

### Q69: What is the Bulkhead pattern?
**A:** Isolate components so failure in one doesn't cascade. Thread pool per dependency, connection pool per service, separate circuit breakers. Like ship compartments - water in one doesn't sink the whole ship.

### Q70: How do you version microservice APIs?
**A:** URL path (/v1/orders), Header (Api-Version: 2), Query param (?version=2). Prefer additive changes (backward compatible). For breaking changes: run both versions, migrate consumers, sunset old version with timeline.

---

## OOP, SOLID & Design Patterns (Questions 71-85)

### Q71: Explain all four OOP pillars with one real example
**A:** Payment system: **Abstraction** (IPaymentGateway hides complexity), **Encapsulation** (BankAccount protects balance with Deposit/Withdraw), **Inheritance** (BasePayment → CreditCardPayment, WirePayment), **Polymorphism** (ProcessPayment works with any IPaymentGateway implementation).

### Q72: What's the difference between Strategy and Factory patterns?
**A:** Factory creates objects (WHICH). Strategy selects behavior (HOW). Factory returns instances. Strategy encapsulates algorithms. Often combined: Factory creates the appropriate Strategy based on context.

### Q73: When would you use Decorator over inheritance?
**A:** When: combining behaviors dynamically (cache + log + retry), avoiding class explosion, following OCP. Decorators are stackable, configurable at runtime via DI. Inheritance is static and creates tight coupling to parent.

### Q74: Explain the Repository pattern pros and cons
**A:** Pros: abstracts data access, enables testing with mocks, consistent query API, encapsulates query logic. Cons: adds indirection, can become a thin wrapper over DbContext (debatable value), leaky abstraction risk with IQueryable.

### Q75: What is the Mediator pattern? How does MediatR implement it?
**A:** Objects communicate through a mediator instead of directly. MediatR: IRequest → single IRequestHandler (command/query). INotification → multiple INotificationHandler (events). Pipeline behaviors for cross-cutting (validation, logging, caching).

### Q76: How does Dependency Inversion differ from Dependency Injection?
**A:** DIP is the principle: depend on abstractions, not concretions. DI is the mechanism: IoC container injects dependencies via constructor. You can apply DIP without DI (manual wiring). You can misuse DI without DIP (injecting concretions).

### Q77: Explain the Observer pattern vs Event-Driven Architecture
**A:** Observer: design pattern, in-process, direct notification through interface. EDA: architectural style, cross-process/service, via message broker. Observer is the building block; EDA is the system-level application. MediatR notifications = in-process Observer. Service Bus = EDA.

### Q78: What is the Specification pattern?
**A:** Encapsulates query criteria as reusable, composable objects. Each specification has `IsSatisfiedBy(entity)` method or an expression for IQueryable. Can AND/OR/NOT compose. Benefits: reusable filter logic, testable rules, clean repository methods.

### Q79: How do you decide between adding behavior via inheritance vs composition?
**A:** Inheritance: IS-A relationship, shared state/behavior, template method pattern. Composition: HAS-A relationship, multiple behaviors, runtime flexibility. Default to composition. Use inheritance only for clear hierarchies (Shape → Circle/Rectangle).

### Q80: What is the Builder pattern vs Factory pattern?
**A:** Factory: creates simple objects in one step. Builder: constructs complex objects step by step, allows optional parameters. Factory returns in one call. Builder uses fluent API with final Build() call. Use Builder when object has many optional configuration parameters.

### Q81: Explain Interface Segregation with a real-world violation
**A:** `IRepository<T>` with GetAll, GetById, Add, Update, Delete, BulkInsert, Query. A reporting service only needs GetAll and Query but depends on entire interface. Fix: IReadRepository<T>, IWriteRepository<T>, IBulkRepository<T>.

### Q82: What is the Chain of Responsibility pattern?
**A:** Request passes through a chain of handlers until one handles it. Each handler decides: handle or pass to next. Examples: ASP.NET middleware pipeline, exception handlers, approval workflows, validation chains.

### Q83: How do you apply OCP without over-engineering?
**A:** Apply when you see a pattern of change (3rd time modifying a switch, adding if-else). Use Strategy/Template Method for variable algorithms. Don't preemptively add abstractions. Rule of Three: abstract after three similar changes, not one.

### Q84: What's the difference between Domain Events and Integration Events?
**A:** Domain Events: within a bounded context, in-process, immediate, part of domain model. Integration Events: cross-service, via message broker, async, eventual consistency. Domain events may trigger integration events at the boundary.

### Q85: Explain the Template Method pattern
**A:** Base class defines algorithm skeleton, subclasses override specific steps. Example: data export base class defines: ValidateData → TransformData → WriteOutput. Subclasses implement CSV, JSON, XML specific logic while reusing common flow.

---

## Azure & Architecture (Questions 86-100)

### Q86: When would you choose Azure Functions vs App Service?
**A:** Functions: event-driven, sporadic traffic, short execution, pay-per-use. App Service: steady traffic, complex middleware, WebSockets, always-on. Functions scale to zero; App Service has minimum instance cost.

### Q87: How do you design for high availability on Azure?
**A:** Multi-zone (Availability Zones), multi-region (Traffic Manager/Front Door), geo-redundant storage, auto-scaling, health probes, circuit breakers. Define RTO/RPO. Use paired regions for disaster recovery.

### Q88: Explain Cosmos DB consistency levels
**A:** Strong (linearizable, highest latency) → Bounded Staleness → Session (default, per-client consistency) → Consistent Prefix → Eventual (lowest latency). Session consistency is best for most web apps (user sees their own writes).

### Q89: How would you implement multi-tenancy on Azure?
**A:** Options: shared database with tenant column (cheapest, least isolated), database-per-tenant (most isolated), schema-per-tenant (middle ground). Use row-level security, separate connection strings, or Azure SQL elastic pools.

### Q90: What is Azure Service Bus vs Event Grid vs Event Hubs?
**A:** Service Bus: enterprise messaging, FIFO, dead-letter, sessions. Event Grid: reactive pub/sub, Azure resource events. Event Hubs: high-throughput streaming (telemetry, logs). Choose based on: ordering needs, throughput, and pattern.

### Q91: How do you secure an Azure microservices architecture?
**A:** Managed Identity (no secrets), Key Vault for secrets, VNet integration + Private Endpoints, WAF on API Gateway, mTLS between services, Azure AD for authentication, RBAC for authorization, network security groups.

### Q92: Explain Azure Container Apps vs AKS
**A:** Container Apps: serverless containers, KEDA auto-scale, simpler ops, Dapr integration, pay-per-use. AKS: full Kubernetes, maximum control, complex networking, requires ops expertise. Use Container Apps unless you need Kubernetes-specific features.

### Q93: How do you handle logging and monitoring in distributed systems?
**A:** Structured logging (Serilog), correlation IDs across services, Application Insights with OpenTelemetry, distributed tracing, custom metrics, KQL for analysis, alerts on error rates/latency P95.

### Q94: What is your approach to database scaling on Azure?
**A:** Read replicas for read-heavy, elastic pools for multi-tenant, Hyperscale for large databases (100TB+), sharding for write-heavy, Redis for caching hot data, Cosmos DB for global distribution.

### Q95: How would you design a CI/CD pipeline for microservices?
**A:** Per-service pipelines (independent deployment), build → test → security scan → containerize → deploy to staging → integration test → deploy to production. Use feature flags, canary deployments, and automatic rollback on health check failure.

### Q96: Explain blue-green deployment vs canary deployment
**A:** Blue-green: two identical environments, switch traffic instantly (all or nothing). Canary: gradually shift traffic (1% → 10% → 50% → 100%), monitor at each step. Canary is safer for detecting issues with real traffic. Blue-green is simpler.

### Q97: How do you handle configuration across environments?
**A:** Azure App Configuration for centralized config, Key Vault for secrets, environment variables for per-environment overrides, feature flags for conditional logic. Validate config at startup (fail fast).

### Q98: What is your strategy for API versioning?
**A:** URL path versioning (/api/v1/) for clarity. Prefer additive changes (add fields, never remove). For breaking changes: run both versions for migration period, deprecation headers with sunset dates, consumer-driven contract tests.

### Q99: How do you optimize Azure costs?
**A:** Right-size VMs (monitor utilization), Reserved Instances for steady workloads, auto-scale rules, use consumption-based services (Functions, Container Apps), delete unused resources, blob lifecycle management, Azure Cost Management alerts.

### Q100: Design a system to process 1 million events per second
**A:** Event Hubs (partitioned by key) → Azure Functions (event-triggered, scaled by partition) → Cosmos DB (partition key aligned with Event Hub partition) → Redis for hot data. Use checkpointing for exactly-once processing. Monitor with Application Insights custom metrics.
