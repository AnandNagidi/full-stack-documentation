# Mock Interview Guide
## Senior .NET Full Stack Developer (8+ Years Experience)

---

## Table of Contents
1. [Interview Round Structure](#interview-round-structure)
2. [Technical Deep-Dive Round](#technical-deep-dive-round)
3. [System Design Round](#system-design-round)
4. [Coding Round](#coding-round)
5. [Behavioral/Leadership Round](#behavioral-round)
6. [Evaluation Criteria](#evaluation-criteria)
7. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
8. [Sample Full Interview Simulation](#sample-full-interview)

---

## Interview Round Structure

### Typical Senior Developer Interview (4-5 rounds)

| Round | Duration | Focus | Weight |
|-------|----------|-------|--------|
| 1. Technical Screening | 45-60 min | Core concepts, coding | 20% |
| 2. System Design | 45-60 min | Architecture, scalability | 30% |
| 3. Deep Technical | 60 min | Advanced concepts, problem-solving | 25% |
| 4. Coding/Live | 45-60 min | Implementation, code quality | 15% |
| 5. Behavioral/Culture | 30-45 min | Leadership, communication | 10% |

---

## Technical Deep-Dive Round

### Mock Interview 1: .NET and Architecture (45 min)

**Interviewer Script:**

"Let's start with some questions about .NET internals and work our way up to architecture."

**Q1** (5 min): "Can you explain what happens from the moment an HTTP request hits your ASP.NET Core application until a response is returned?"

**Expected Answer Structure:**
- Kestrel receives the request
- Passes through middleware pipeline (each can short-circuit)
- Routing middleware matches endpoint
- Authentication/Authorization middleware validates
- Model binding deserializes request
- Action filter pipeline executes
- Controller/handler processes
- Response flows back through middleware in reverse
- Kestrel sends response

**Follow-up**: "What if we're behind a reverse proxy like Nginx? How does that change things?"

**Q2** (10 min): "You have a service that's experiencing intermittent slowdowns. Users report 5-second response times on an endpoint that normally returns in 200ms. How do you diagnose this?"

**Expected Approach:**
1. Check Application Insights/metrics for the specific time period
2. Look at dependency durations (database, external APIs)
3. Check for GC pauses (Gen2 collections)
4. Look for thread pool starvation (sync-over-async)
5. Check for connection pool exhaustion
6. Review recent deployments
7. Examine resource utilization (CPU, memory)

**Q3** (10 min): "Explain how you would implement a caching strategy for a product catalog that has 100K products, updates 50 times per day, and serves 10K requests per second."

**Expected Answer:**
- Multi-layer: CDN → Redis distributed cache → in-memory cache
- Cache-aside pattern with TTL (5-15 minutes)
- Event-based invalidation for price changes (can't wait for TTL)
- Partition hot products in Redis cluster
- Use IMemoryCache for top 1000 products (L1)
- Background refresh for popular items approaching expiry

**Q4** (10 min): "Walk me through how you'd design the authentication and authorization for a multi-tenant SaaS application."

**Q5** (10 min): "You need to process 50,000 orders per hour. Each order requires inventory check, payment processing, and email notification. Design the processing pipeline."


---

## System Design Round

### Mock Interview 2: Design an E-Commerce Platform (45 min)

**Interviewer**: "Design the backend for an e-commerce platform that handles 10 million users, 100K orders per day, with real-time inventory management."

**How to Structure Your Answer:**

#### Step 1: Clarify (3-5 min)
Ask:
- "Is this global or single-region?"
- "What's the peak concurrent users? Black Friday scenario?"
- "Do we need real-time inventory or is near-real-time acceptable?"
- "What's the acceptable latency for checkout?"
- "What existing infrastructure do we have?"

#### Step 2: Estimate (3 min)
- 100K orders/day = ~1.2 orders/sec avg, ~12/sec peak
- 10M users, 5% DAU = 500K daily visitors
- Product catalog: 500K products
- Assume 80/20 read/write ratio

#### Step 3: High-Level Design (10 min)
Draw components:
```
Clients → CDN → API Gateway → Services → Databases

Services:
- Product Service (catalog, search)
- Order Service (cart, checkout)
- Inventory Service (stock management)
- Payment Service (transactions)
- User Service (auth, profiles)
- Notification Service (email, push)
- Search Service (Elasticsearch)
```

#### Step 4: Deep Dive (20 min)
Focus areas:
- **Checkout flow**: Cart → Inventory Reserve → Payment → Confirm → Notify
- **Inventory**: Redis for real-time stock counts, event-driven sync to DB
- **Search**: Elasticsearch for product search, Redis for autocomplete
- **Scaling**: Read replicas for product reads, sharding orders by userId

#### Step 5: Trade-offs (5 min)
- "If I had more time, I'd add: recommendation engine, A/B testing"
- "Trade-off: eventual consistency for inventory views vs strong for checkout"

---

## Coding Round

### Mock Interview 3: Live Coding (45 min)

**Problem 1** (20 min): "Implement a rate limiter that allows N requests per time window per user."

```csharp
public interface IRateLimiter
{
    bool IsAllowed(string userId);
}

// Expected implementation: Sliding window or token bucket
public class SlidingWindowRateLimiter : IRateLimiter
{
    private readonly ConcurrentDictionary<string, Queue<DateTime>> _requests = new();
    private readonly int _maxRequests;
    private readonly TimeSpan _window;

    public SlidingWindowRateLimiter(int maxRequests, TimeSpan window)
    {
        _maxRequests = maxRequests;
        _window = window;
    }

    public bool IsAllowed(string userId)
    {
        var now = DateTime.UtcNow;
        var requests = _requests.GetOrAdd(userId, _ => new Queue<DateTime>());
        
        lock (requests)
        {
            // Remove expired entries
            while (requests.Count > 0 && now - requests.Peek() > _window)
                requests.Dequeue();
            
            if (requests.Count >= _maxRequests)
                return false;
            
            requests.Enqueue(now);
            return true;
        }
    }
}
```

**Evaluation Criteria:**
- Thread safety (ConcurrentDictionary + lock)
- Correct sliding window logic
- Memory management (cleanup old entries)
- Edge cases (first request, boundary conditions)

**Problem 2** (15 min): "Implement a simple LRU cache with O(1) get and put operations."

**Problem 3** (10 min): "Write a LINQ query to find the second-highest salary per department."

```csharp
var result = employees
    .GroupBy(e => e.Department)
    .Select(g => new
    {
        Department = g.Key,
        SecondHighest = g.OrderByDescending(e => e.Salary)
            .Select(e => e.Salary)
            .Distinct()
            .Skip(1)
            .FirstOrDefault()
    });
```

---

## Behavioral Round

### Mock Interview 4: Leadership and Communication (30 min)

**Q1**: "Tell me about a time you had to make a difficult technical decision that impacted the team."

**STAR Answer Template:**
- **S**: "Our e-commerce platform was hitting performance bottlenecks at 5K concurrent users..."
- **T**: "As tech lead, I needed to decide between scaling the monolith or starting microservices decomposition..."
- **A**: "I conducted load testing, analyzed bottlenecks, presented options with trade-offs to stakeholders, got buy-in for gradual migration..."
- **R**: "We extracted the payment and notification services first, reducing checkout latency by 60% and enabling independent deployment cycles."

**Q2**: "How do you handle disagreements with team members about technical approaches?"

**Q3**: "Describe a production incident you handled. What was your approach?"

**Q4**: "How do you mentor junior developers?"

**Q5**: "Tell me about a time you had to push back on a requirement and how you handled it."

---

## Evaluation Criteria

### What Interviewers Look For at Senior Level

| Criteria | Junior | Senior | Architect |
|----------|--------|--------|-----------|
| Coding | Correct solution | Clean, tested, SOLID | Scalable, maintainable |
| Design | Basic patterns | Trade-off analysis | Business alignment |
| Communication | Explains code | Explains why | Influences decisions |
| Problem-solving | Follows guidance | Independent diagnosis | Defines the approach |
| Scope | Single feature | Full system | Cross-system impact |

### Green Flags (Senior Level)
- Asks clarifying questions before jumping to solution
- Discusses trade-offs, not just "the" answer
- Mentions monitoring, observability, and failure modes
- Considers scalability and performance from the start
- References real-world experience and lessons learned
- Knows when NOT to use a pattern/technology

### Red Flags
- Jumps to implementation without understanding requirements
- Only knows one way to solve problems
- Can't explain WHY they'd choose an approach
- No consideration for failure scenarios
- Textbook answers without practical depth
- Can't discuss trade-offs or alternatives

---

## Common Mistakes to Avoid

1. **Over-engineering**: Don't add microservices/patterns where a monolith suffices
2. **Textbook answers**: Add real project context and war stories
3. **Not asking questions**: Always clarify requirements and constraints
4. **Ignoring non-functional**: Always mention performance, security, monitoring
5. **Single solution mindset**: Present options, discuss trade-offs, recommend
6. **Talking too much/little**: Aim for 2-3 minute answers, pause for follow-ups
7. **Not admitting gaps**: "I haven't used X in production, but my understanding is..."
8. **Skipping testing**: Always mention how you'd test your solution
9. **Ignoring failure modes**: "What happens when this service goes down?"
10. **No measurement**: "How would you know if this is successful?"

---

## Sample Full Interview Simulation

### 60-Minute Senior Developer Interview

**0-5 min**: Introduction, role overview
**5-15 min**: .NET Core deep dive (middleware, DI, async patterns)
**15-30 min**: Architecture discussion (microservices, event-driven)
**30-45 min**: System design problem (design a notification system)
**45-55 min**: Coding exercise (implement a specific pattern)
**55-60 min**: Your questions to interviewer

### Questions to Ask Interviewer
- "What does a typical day look like for this role?"
- "What's the biggest technical challenge the team is facing?"
- "How do you approach technical debt?"
- "What does the deployment pipeline look like?"
- "How are architectural decisions made?"
