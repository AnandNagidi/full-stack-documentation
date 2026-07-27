# Quick Revision Notes
## Last-Minute Review for Senior .NET Developer Interviews

---

## .NET Core Quick Facts
- **.NET 8** is latest LTS (Long Term Support)
- **Kestrel** is the cross-platform web server
- **Middleware** executes in order added, returns in reverse
- **DI Lifetimes**: Transient (new every time), Scoped (per request), Singleton (app lifetime)
- **Never** inject Scoped into Singleton (captive dependency)
- **IOptionsMonitor** for real-time config reload in singletons
- **Minimal APIs** for simple microservices, Controllers for complex APIs
- **Output Caching** (.NET 7+) > Response Caching
- **IHttpClientFactory** prevents socket exhaustion (never `new HttpClient()`)
- **Health Checks**: Liveness (is it running?), Readiness (can it serve traffic?)

## C# Key Points
- **Records**: Value equality, immutable, `with` for non-destructive mutation
- **Pattern Matching**: switch expressions, property patterns, list patterns
- **Nullable Reference Types**: `?` suffix, `??` coalescing, `?.` conditional
- **Span<T>**: Zero-allocation slicing of arrays/strings
- **Primary Constructors** (C# 12): Class parameters without explicit fields
- **Collection Expressions** (C# 12): `int[] x = [1, 2, 3]`
- **IAsyncEnumerable**: Streaming async data with `await foreach`
- **Source Generators**: Compile-time code gen, replaces reflection

## Async/Await Rules
- ✅ Async all the way (never `.Result` or `.Wait()`)
- ✅ Use `ConfigureAwait(false)` in library code
- ✅ Use `CancellationToken` everywhere
- ✅ Return `Task` not `void` (except event handlers)
- ❌ Don't use `async void` (exceptions are lost)
- ❌ Don't wrap synchronous code in `Task.Run` in ASP.NET
- ❌ Don't use `Task.WhenAll` with side effects unless idempotent


## SOLID One-Liners
- **S**RP: One class, one reason to change
- **O**CP: Open for extension, closed for modification (use polymorphism)
- **L**SP: Subtypes must be substitutable for base types
- **I**SP: Many small interfaces > one fat interface
- **D**IP: Depend on abstractions, not concretions

## Design Patterns Cheat Sheet
| Pattern | One-Line Purpose | Example |
|---------|-----------------|---------|
| Factory | Create without specifying exact class | `INotificationFactory` |
| Builder | Step-by-step complex object creation | `QueryBuilder`, `StringBuilder` |
| Singleton | One instance (use DI instead) | `IMemoryCache` registration |
| Decorator | Add behavior without modifying | Caching repo wrapping real repo |
| Adapter | Bridge incompatible interfaces | Wrap 3rd party SDK |
| Strategy | Swap algorithms at runtime | Discount calculators |
| Observer | One change notifies many | Domain events |
| Mediator | Decouple sender from handler | MediatR `IRequest`/`INotification` |
| Repository | Abstract data access | `IOrderRepository` |
| Unit of Work | Single transaction boundary | `DbContext.SaveChanges()` |

## SQL Server Key Points
- **Clustered Index**: Physical row order, ONE per table
- **Covering Index**: All query columns in index (no key lookup)
- **Execution Plan**: Seek > Scan, always avoid Table Scans
- **Sargable**: No functions on indexed columns in WHERE
- **Isolation Levels**: READ COMMITTED (default), SNAPSHOT (row versioning)
- **Window Functions**: `ROW_NUMBER() OVER (PARTITION BY x ORDER BY y)`
- **CTE**: `WITH cte AS (...)` for readability and recursion
- **UNION ALL** > UNION (no dedup sort unless needed)
- **Parameter Sniffing**: Use `OPTION (RECOMPILE)` or `OPTIMIZE FOR UNKNOWN`

## Microservices Quick Reference
- **Saga**: Distributed transaction compensation (Choreography or Orchestration)
- **CQRS**: Separate read model from write model
- **Outbox Pattern**: Event + data in same transaction, then relay
- **Circuit Breaker**: Open (fail fast) → Half-Open (test) → Closed (normal)
- **Idempotency**: Safe to retry (use idempotency keys)
- **Service Mesh**: Sidecar proxy handles cross-cutting (Istio, Dapr)
- **API Gateway**: Single entry point, routing, rate limiting, auth

## Angular Quick Reference
- **Signals** (16+): Fine-grained reactivity without Zone.js
- **OnPush**: Only checks on Input ref change, events, or async pipe
- **@defer**: Lazy load components on viewport/interaction/timer
- **switchMap**: Cancel previous (search), **exhaustMap**: Ignore new (submit)
- **takeUntilDestroyed()**: Auto-cleanup subscriptions (Angular 16+)
- **Standalone Components**: Default in Angular 17+, no NgModules needed
- **Control Flow**: `@if`, `@for (track item.id)`, `@switch`

## Azure Quick Reference
- **App Service**: Web apps/APIs (always-on)
- **Functions**: Event-driven, pay-per-execution (Consumption plan)
- **Container Apps**: Serverless containers with KEDA scaling
- **Cosmos DB**: Global distribution, partition key is everything
- **Service Bus**: Queues/Topics with FIFO, dead-letter, sessions
- **Key Vault + Managed Identity**: Zero secrets in config
- **Application Insights**: Distributed tracing, KQL queries

## System Design Checklist
1. ✅ Clarify requirements (functional + non-functional)
2. ✅ Estimate scale (QPS, storage, bandwidth)
3. ✅ Draw high-level components
4. ✅ Design API endpoints
5. ✅ Choose database(s) and schema
6. ✅ Add caching layer
7. ✅ Add message queue for async
8. ✅ Address scaling (LB, replicas, sharding)
9. ✅ Security considerations
10. ✅ Monitoring and alerting

## Numbers to Remember
- Redis: 100K+ ops/sec
- SQL Server: 5K-10K simple queries/sec
- HTTP request overhead: ~100ms network
- SSD read: ~0.1ms, HDD: ~10ms
- 1 day = ~100K seconds
- 1 month = ~2.5M seconds
- 80/20 rule: Cache top 20% for 80% hit rate

## Behavioral Interview Tips (STAR Method)
- **S**ituation: Set the scene briefly
- **T**ask: What was your responsibility?
- **A**ction: What did YOU do specifically?
- **R**esult: Quantifiable outcome + what you learned
