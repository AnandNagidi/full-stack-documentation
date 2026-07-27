# JavaScript - Complete Interview Guide
## From Basics to Advanced — For Senior Developers

---

## 1. JavaScript Overview

### Definition
JavaScript is a dynamic, interpreted, multi-paradigm programming language that runs in browsers and server environments (Node.js). It is the language of the web — every browser has a built-in JavaScript engine.

### Purpose
To add interactivity, logic, and dynamic behavior to web pages, and increasingly to build full-stack applications, APIs, and tooling.

### Problem It Solves
- **Static HTML**: Without JS, web pages can't respond to user actions
- **Server round-trips**: Client-side logic avoids unnecessary server calls
- **Rich UX**: Animations, real-time updates, form validation without page reload
- **Full-stack unification**: One language for frontend + backend (Node.js)

### Industry Relevance
- Runs on every browser without installation
- #1 most-used language (Stack Overflow surveys, every year)
- Required for Angular, React, Vue, Node.js, and all frontend frameworks
- Understanding vanilla JS deeply separates senior devs from juniors

---

## 2. Data Types and Type System

### Definition
JavaScript has 8 data types: 7 primitives and 1 non-primitive (Object).

### Primitive Types

| Type | Example | typeof | Notes |
|------|---------|--------|-------|
| string | `"hello"` | `"string"` | Immutable, UTF-16 |
| number | `42`, `3.14` | `"number"` | 64-bit float (no int!) |
| bigint | `9007199254740993n` | `"bigint"` | Arbitrary precision |
| boolean | `true`, `false` | `"boolean"` | |
| undefined | `undefined` | `"undefined"` | Variable declared, no value |
| null | `null` | `"object"` | ⚠️ Bug in spec (historical) |
| symbol | `Symbol('id')` | `"symbol"` | Unique identifier |

### Reference Types

```
Everything else is an Object:
- Object: { key: value }
- Array: [1, 2, 3] (specialized object)
- Function: function() {} (callable object)
- Date, RegExp, Map, Set, WeakMap, WeakSet
```

### Type Coercion — Critical for Interviews

```javascript
// == (loose equality) does type coercion
"5" == 5        // true  (string converted to number)
0 == false      // true  (both coerce to 0)
null == undefined // true (special rule)
"" == false     // true  (both coerce to 0)

// === (strict equality) — NO coercion
"5" === 5       // false (different types)
0 === false     // false

// ALWAYS use === in production code

// Truthy/Falsy values:
// Falsy: false, 0, -0, "", null, undefined, NaN
// Truthy: EVERYTHING else (including "0", [], {}, "false")

if ([])  console.log("arrays are truthy!");  // prints!
if ("0") console.log("string '0' is truthy!"); // prints!
```

---

## 3. Variables: var, let, const

### Definition
Variables are containers for storing data values. JavaScript has three declaration keywords with different scoping and behavior.

### Comparison

| Feature | var | let | const |
|---------|-----|-----|-------|
| Scope | Function | Block | Block |
| Hoisting | Yes (initialized undefined) | Yes (TDZ) | Yes (TDZ) |
| Reassignment | ✅ | ✅ | ❌ |
| Redeclaration | ✅ | ❌ | ❌ |
| Use in 2024 | ❌ Never | ✅ When reassigning | ✅ Default choice |

### Hoisting and Temporal Dead Zone (TDZ)

```javascript
// var is hoisted AND initialized with undefined
console.log(x); // undefined (not error!)
var x = 5;

// let/const are hoisted but NOT initialized (TDZ)
console.log(y); // ReferenceError: Cannot access 'y' before initialization
let y = 5;

// Block scope vs function scope
if (true) {
  var a = 1;   // Leaks out of block!
  let b = 2;   // Stays in block
  const c = 3; // Stays in block
}
console.log(a); // 1 (var leaked!)
console.log(b); // ReferenceError (let is block-scoped)
```

---

## 4. Functions

### Definition
Functions are first-class objects in JavaScript — they can be assigned to variables, passed as arguments, returned from other functions, and have properties.

### Function Types

```javascript
// 1. Function Declaration (hoisted)
function add(a, b) { return a + b; }

// 2. Function Expression (NOT hoisted)
const subtract = function(a, b) { return a - b; };

// 3. Arrow Function (lexical 'this', concise)
const multiply = (a, b) => a * b;

// 4. Immediately Invoked Function Expression (IIFE)
(function() { console.log("Runs immediately!"); })();

// 5. Generator Function
function* counter() {
  let i = 0;
  while (true) yield i++;
}

// 6. Async Function
async function fetchData() {
  const res = await fetch('/api/data');
  return res.json();
}
```

### Arrow Functions vs Regular Functions

| Feature | Regular Function | Arrow Function |
|---------|-----------------|----------------|
| `this` binding | Dynamic (caller decides) | Lexical (inherits from parent) |
| `arguments` object | ✅ Available | ❌ Not available |
| Constructor (`new`) | ✅ Can be used | ❌ Cannot |
| `prototype` property | ✅ Has one | ❌ Does not |
| Best for | Methods, constructors | Callbacks, short functions |

```javascript
// The 'this' problem:
const obj = {
  name: "Timer",
  start() {
    // Regular function: 'this' is window/undefined in callback
    setTimeout(function() {
      console.log(this.name); // undefined! 'this' lost
    }, 100);

    // Arrow function: 'this' inherited from start()
    setTimeout(() => {
      console.log(this.name); // "Timer" ✅
    }, 100);
  }
};
```

---

## 5. Closures

### Definition
A closure is a function that remembers the variables from its outer (enclosing) scope even after the outer function has finished executing.

### How Closures Work

```
When a function is created, it captures a reference to its
surrounding lexical environment (not a copy of values):

function outer() {
  let count = 0;         ← Variable in outer scope
  
  return function inner() {
    count++;             ← inner "closes over" count
    return count;        ← Accesses it even after outer returns
  };
}

const counter = outer();  // outer() finishes, but count lives on!
counter(); // 1
counter(); // 2
counter(); // 3
```

### Practical Use Cases

```javascript
// 1. Data Privacy (module pattern)
function createWallet(initial) {
  let balance = initial; // Private! No direct access

  return {
    deposit(amount) { balance += amount; },
    withdraw(amount) {
      if (amount > balance) throw new Error("Insufficient funds");
      balance -= amount;
    },
    getBalance() { return balance; }
  };
}

const wallet = createWallet(100);
wallet.deposit(50);
wallet.getBalance(); // 150
// wallet.balance → undefined (private!)

// 2. Function Factory
function createMultiplier(factor) {
  return (number) => number * factor;
}
const double = createMultiplier(2);
const triple = createMultiplier(3);
double(5); // 10
triple(5); // 15

// 3. Common Interview Trap: Loop + Closure
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Prints: 3, 3, 3 (var is function-scoped, closure captures reference)

// Fix: Use let (block-scoped, new binding per iteration)
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Prints: 0, 1, 2 ✅
```

---

## 6. Prototypes and Inheritance

### Definition
JavaScript uses prototype-based inheritance. Every object has an internal `[[Prototype]]` link to another object. When a property isn't found on an object, JavaScript walks up the prototype chain.

### Prototype Chain

```
const dog = { bark() { return "Woof!"; } };
const myDog = Object.create(dog);
myDog.name = "Rex";

myDog.name  → Found on myDog itself: "Rex"
myDog.bark() → Not on myDog → check prototype (dog) → Found: "Woof!"
myDog.toString() → Not on myDog → not on dog → check Object.prototype → Found

Chain: myDog → dog → Object.prototype → null
```

### ES6 Classes (syntactic sugar over prototypes)

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    return `${this.name} makes a sound.`;
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name); // Must call super() before using 'this'
    this.breed = breed;
  }

  speak() {
    return `${this.name} barks!`; // Override parent method
  }

  fetch() {
    return `${this.name} fetches the ball.`;
  }
}

const rex = new Dog("Rex", "Labrador");
rex.speak();    // "Rex barks!"
rex instanceof Dog;    // true
rex instanceof Animal; // true
```

---

## 7. Asynchronous JavaScript

### Definition
JavaScript is single-threaded but non-blocking. It uses an event loop to handle asynchronous operations (network requests, timers, file I/O) without blocking the main thread.

### Event Loop

```
┌───────────────────────────────────┐
│         CALL STACK                │  ← Executes synchronous code
│  (one function at a time)         │
└───────────────────┬───────────────┘
                    │
                    ▼
┌───────────────────────────────────┐
│         EVENT LOOP                │  ← Checks: Is stack empty?
│  (continuously checking)          │     If yes, pick from queues
└───────┬───────────────────┬───────┘
        │                   │
        ▼                   ▼
┌───────────────┐   ┌───────────────┐
│ MICROTASK     │   │ MACROTASK     │
│ QUEUE         │   │ QUEUE         │
│ (Promises,    │   │ (setTimeout,  │
│  queueMicro)  │   │  setInterval, │
│               │   │  I/O events)  │
│ Higher        │   │ Lower         │
│ priority      │   │ priority      │
└───────────────┘   └───────────────┘

Order: Stack → ALL microtasks → ONE macrotask → repeat
```

### Callbacks → Promises → Async/Await

```javascript
// 1. Callbacks (old way - callback hell)
getData(function(a) {
  getMore(a, function(b) {
    getEvenMore(b, function(c) {
      // Pyramid of doom!
    });
  });
});

// 2. Promises (ES6)
getData()
  .then(a => getMore(a))
  .then(b => getEvenMore(b))
  .then(c => console.log(c))
  .catch(err => console.error(err));

// 3. Async/Await (ES2017 - cleanest)
async function loadData() {
  try {
    const a = await getData();
    const b = await getMore(a);
    const c = await getEvenMore(b);
    return c;
  } catch (err) {
    console.error(err);
  }
}

// Parallel execution
const [users, orders] = await Promise.all([
  fetchUsers(),
  fetchOrders()
]);
```

### Promise API

```javascript
// Promise.all - Wait for ALL (fails fast on first rejection)
const results = await Promise.all([p1, p2, p3]);

// Promise.allSettled - Wait for ALL (never rejects)
const results = await Promise.allSettled([p1, p2, p3]);
// [{status:"fulfilled", value:...}, {status:"rejected", reason:...}]

// Promise.race - First to settle (resolve OR reject) wins
const fastest = await Promise.race([p1, p2, p3]);

// Promise.any - First to RESOLVE wins (ignores rejections)
const firstSuccess = await Promise.any([p1, p2, p3]);
```

---

## 8. `this` Keyword

### Definition
`this` refers to the execution context — the object that is currently executing the function. Its value depends on HOW a function is called, not where it's defined.

### Rules (in priority order)

```javascript
// 1. new binding: this = newly created object
function Person(name) { this.name = name; }
const p = new Person("Alice"); // this → new object

// 2. Explicit binding: call, apply, bind
function greet() { return `Hi, ${this.name}`; }
greet.call({ name: "Bob" });   // this → { name: "Bob" }
greet.apply({ name: "Bob" });  // Same, args as array
const bound = greet.bind({ name: "Bob" }); // Returns new function

// 3. Implicit binding: object.method()
const obj = { name: "Charlie", greet() { return this.name; } };
obj.greet(); // this → obj → "Charlie"

// 4. Default binding: standalone function
function standalone() { return this; }
standalone(); // this → window (browser) or undefined (strict mode)

// GOTCHA: Losing 'this' context
const method = obj.greet; // Extracting method from object
method(); // this → window/undefined! Context lost!
// Fix: const method = obj.greet.bind(obj);
```

---

## 9. ES6+ Features

### Destructuring

```javascript
// Object destructuring
const { name, age, city = "Unknown" } = user;

// Array destructuring
const [first, second, ...rest] = [1, 2, 3, 4, 5];

// Parameter destructuring
function createUser({ name, email, role = "user" }) {
  return { name, email, role };
}

// Nested destructuring
const { address: { street, zip } } = user;
```

### Spread and Rest

```javascript
// Spread: Expand iterable
const merged = { ...defaults, ...userSettings }; // Object merge
const combined = [...arr1, ...arr2]; // Array concat
const clone = { ...original }; // Shallow clone

// Rest: Collect remaining
function sum(...numbers) { return numbers.reduce((a, b) => a + b, 0); }
const { id, ...rest } = user; // Get everything except id
```

### Optional Chaining and Nullish Coalescing

```javascript
// Optional chaining (?.) - stops if null/undefined
const street = user?.address?.street; // undefined if any part is null
const first = users?.[0]?.name;       // Array access
const result = obj?.method?.();       // Method call

// Nullish coalescing (??) - only null/undefined (not 0, "")
const port = config.port ?? 3000;     // 0 is valid! Use ?? not ||
const name = input ?? "Anonymous";

// Compare with || (treats 0, "", false as falsy)
const port2 = config.port || 3000;    // Bug: port=0 becomes 3000!
```

### Map, Set, WeakMap, WeakSet

```javascript
// Map: Key-value (any type as key, ordered, iterable)
const cache = new Map();
cache.set(userObj, "cached data"); // Objects as keys!
cache.get(userObj); // "cached data"
cache.size; // 1

// Set: Unique values only
const unique = new Set([1, 2, 2, 3, 3]); // Set {1, 2, 3}
unique.has(2); // true
[...unique]; // [1, 2, 3]

// WeakMap/WeakSet: Keys are weakly held (garbage collected)
// Use for: caching per-object data without preventing GC
const metadata = new WeakMap();
metadata.set(domElement, { clicks: 0 }); // GC'd when element removed
```

---

## 10. Array Methods

### Definition
Array methods are the primary tool for data transformation in JavaScript. They replace loops with declarative, chainable operations.

### Essential Methods

```javascript
const orders = [
  { id: 1, total: 250, status: "shipped" },
  { id: 2, total: 120, status: "pending" },
  { id: 3, total: 450, status: "shipped" },
  { id: 4, total: 80,  status: "cancelled" }
];

// filter: Keep items matching condition
const shipped = orders.filter(o => o.status === "shipped");

// map: Transform each item
const totals = orders.map(o => o.total);

// reduce: Aggregate to single value
const sum = orders.reduce((acc, o) => acc + o.total, 0); // 900

// find: First match (or undefined)
const big = orders.find(o => o.total > 300); // {id:3, total:450...}

// some/every: Boolean checks
orders.some(o => o.total > 400);  // true
orders.every(o => o.total > 50);  // true

// flatMap: map + flatten one level
const tags = orders.flatMap(o => o.tags || []);

// Chaining (very common in real code)
const shippedTotal = orders
  .filter(o => o.status === "shipped")
  .map(o => o.total)
  .reduce((sum, t) => sum + t, 0); // 700
```

---

## 11. Error Handling

### Definition
JavaScript uses `try/catch/finally` for synchronous errors and `.catch()` or try/catch with async/await for asynchronous errors.

```javascript
// Custom Error classes
class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

// try/catch/finally
try {
  const data = JSON.parse(input);
  if (!data.email) throw new ValidationError("email", "Email required");
} catch (err) {
  if (err instanceof ValidationError) {
    showFieldError(err.field, err.message);
  } else if (err instanceof SyntaxError) {
    showError("Invalid JSON format");
  } else {
    throw err; // Re-throw unknown errors
  }
} finally {
  hideLoadingSpinner(); // Always runs
}

// Async error handling
async function fetchUser(id) {
  try {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch user:", err.message);
    return null; // Graceful fallback
  }
}
```

---

## 12. Modules (ES Modules)

### Definition
ES Modules are JavaScript's native module system for organizing code into reusable, encapsulated files with explicit imports and exports.

```javascript
// Named exports (multiple per file)
export function formatDate(date) { /* ... */ }
export const API_URL = "https://api.example.com";
export class UserService { /* ... */ }

// Default export (one per file)
export default class OrderService { /* ... */ }

// Importing
import OrderService from './order.service.js';           // Default
import { formatDate, API_URL } from './utils.js';        // Named
import { formatDate as fmt } from './utils.js';          // Rename
import * as Utils from './utils.js';                     // Namespace

// Dynamic import (code splitting, lazy loading)
const module = await import('./heavy-module.js');
module.doSomething();
```

---

## 13. Design Patterns in JavaScript

### Common Patterns

```javascript
// 1. Module Pattern (encapsulation via closure)
const Counter = (() => {
  let count = 0; // Private
  return {
    increment() { return ++count; },
    decrement() { return --count; },
    getCount() { return count; }
  };
})();

// 2. Observer Pattern (pub/sub)
class EventEmitter {
  #listeners = new Map();

  on(event, callback) {
    if (!this.#listeners.has(event)) this.#listeners.set(event, []);
    this.#listeners.get(event).push(callback);
  }

  emit(event, ...args) {
    (this.#listeners.get(event) || []).forEach(cb => cb(...args));
  }

  off(event, callback) {
    const cbs = this.#listeners.get(event) || [];
    this.#listeners.set(event, cbs.filter(cb => cb !== callback));
  }
}

// 3. Singleton (using module scope)
let instance = null;
export function getDatabase() {
  if (!instance) instance = new Database();
  return instance;
}

// 4. Debounce (rate limiting)
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
const search = debounce((query) => fetchResults(query), 300);

// 5. Throttle (fixed rate)
function throttle(fn, limit) {
  let inThrottle = false;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
```

---

## 14. Advanced Concepts

### Proxy and Reflect

```javascript
// Proxy: Intercept operations on objects
const handler = {
  get(target, prop) {
    console.log(`Accessing ${prop}`);
    return prop in target ? target[prop] : `Property ${prop} not found`;
  },
  set(target, prop, value) {
    if (prop === "age" && (value < 0 || value > 150)) {
      throw new Error("Invalid age");
    }
    target[prop] = value;
    return true;
  }
};

const user = new Proxy({}, handler);
user.age = 25;  // OK
user.age = -5;  // Error: Invalid age
user.unknown;   // "Property unknown not found"
```

### Generators and Iterators

```javascript
// Generator: Lazy evaluation, pausable execution
function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

const fib = fibonacci();
fib.next().value; // 0
fib.next().value; // 1
fib.next().value; // 1
fib.next().value; // 2

// Practical: Paginated API fetching
async function* fetchPages(url) {
  let page = 1;
  while (true) {
    const res = await fetch(`${url}?page=${page}`);
    const data = await res.json();
    if (data.length === 0) return;
    yield data;
    page++;
  }
}

for await (const page of fetchPages('/api/users')) {
  processUsers(page);
}
```

### WeakRef and FinalizationRegistry

```javascript
// WeakRef: Hold reference without preventing GC
const cache = new Map();

function getCached(key, compute) {
  const ref = cache.get(key);
  if (ref) {
    const value = ref.deref(); // Returns undefined if GC'd
    if (value !== undefined) return value;
  }
  const value = compute();
  cache.set(key, new WeakRef(value));
  return value;
}
```

---

## 15. Interview Questions with Detailed Answers

### Q: Explain the difference between == and ===

**Answer:** `==` (loose equality) performs type coercion before comparison — it converts operands to the same type. `===` (strict equality) compares both value AND type without conversion. Always use `===` in production code. The only acceptable use of `==` is `value == null` which checks for both null and undefined in one expression.

### Q: What is the event loop and how does it work?

**Answer:** JavaScript is single-threaded. The event loop is the mechanism that allows non-blocking I/O by offloading operations to the browser/OS and processing callbacks when the call stack is empty. Order: Execute all synchronous code → drain microtask queue (Promises, queueMicrotask) → process one macrotask (setTimeout, I/O) → repeat. Microtasks always run before the next macrotask.

### Q: Explain closures with a practical example

**Answer:** A closure is a function that retains access to variables from its enclosing scope even after that scope has finished executing. Practical uses: data privacy (module pattern), function factories (createLogger, createMultiplier), memoization (cache computed results), and React hooks (useState captures state via closure).

### Q: What's the difference between `null` and `undefined`?

**Answer:** `undefined` means a variable was declared but not assigned a value — it's JavaScript's default "no value." `null` is an intentional assignment meaning "no object" — the developer explicitly set it. `typeof undefined` is `"undefined"`, `typeof null` is `"object"` (historical bug). Use `null` to explicitly clear a reference; let `undefined` be the language's default.

### Q: How does prototypal inheritance work?

**Answer:** Every object has an internal `[[Prototype]]` link. When accessing a property, JavaScript first checks the object itself, then walks up the prototype chain until it finds the property or reaches `null`. ES6 classes are syntactic sugar over this — `extends` sets up the prototype chain, `super()` calls the parent constructor. Unlike classical inheritance, prototypes are live objects that can be modified at runtime.

---

## 16. Best Practices Summary

```
JavaScript Best Practices:
┌──────────────────────────────────────────────────────────────┐
│ • Use const by default, let when reassignment needed          │
│ • Always === never ==                                         │
│ • Arrow functions for callbacks, regular for methods          │
│ • Async/await over .then() chains                            │
│ • Optional chaining (?.) and nullish coalescing (??)          │
│ • Destructuring for cleaner parameter handling                │
│ • Array methods (map/filter/reduce) over for loops            │
│ • Custom Error classes for domain errors                      │
│ • ES Modules (import/export) for code organization            │
│ • Debounce user input, throttle scroll/resize handlers        │
│ • Avoid mutating function arguments                          │
│ • Use Map/Set for complex data structures (not plain objects) │
└──────────────────────────────────────────────────────────────┘
```

---

## 17. Interview Perspective - What Interviewers Expect

For senior developers, JavaScript interviewers expect:

1. **Closure mastery** — Explain with examples, identify in code, know the pitfalls
2. **Event loop understanding** — Predict output of mixed sync/async code
3. **`this` rules** — Know all 4 binding rules and their priority
4. **Prototype chain** — Explain how inheritance actually works under the hood
5. **ES6+ fluency** — Destructuring, spread, optional chaining, modules
6. **Async patterns** — Promise combinators, error handling, parallel vs sequential
7. **Performance awareness** — Debounce, throttle, memory leaks, WeakRef
