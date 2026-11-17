# JS (Salesforce Certified JavaScript Developer) lesson outline

Exam guide: https://help.salesforce.com/s/articleView?id=005298945&type=1&language=en_US (read 2026-11-17, through its Trailhead alias https://trailhead.salesforce.com/help?article=Salesforce-Certified-JavaScript-Developer-Exam-Guide).
60 scored questions + up to 5 unscored, 105 min, 65% to pass, US$200 (retake US$100), prerequisite **none**, aligned to the **Summer '22** release.

Objective codes below: `types-1..6`, `objects-1..5`, `browser-1..4`, `debug-1..2`, `async-1..2`, `server-1..4`, `testing-1`, numbered in the order of `src/data/js/exam.json` (24 objectives).

Key-fact markers: **[read]** = I read this on the cited page's source on 2026-11-17. **[check]** = standard fact, not re-read this session; open the URL before writing a question on it.

Short forms: `MDN:<path>` = `https://developer.mozilla.org/en-US/docs/<path>`; `NODE:<page>` = `https://nodejs.org/api/<page>.html`; `NPM:<path>` = `https://docs.npmjs.com/cli/v10/<path>`; `JEST:<slug>` = `https://jestjs.io/docs/<slug>`. developer.mozilla.org, jestjs.io and docs.npmjs.com were blocked from this environment, so [read] for those means I read the page's official source (mdn/content, jestjs/jest `docs/`, npm/cli `docs/`) on GitHub; the text is the same as the public page. Cert Prep = the three official Trailhead modules in the trail https://trailhead.salesforce.com/content/learn/trails/study-for-the-salesforce-javascript-developer-i-exam (read).

> **Version trap for question writers.** The exam is Summer '22 (mid-2022): roughly **ECMAScript 2022** and **Node.js 16/18**. Everything below was finished later (TC39 finished-proposals list, read: https://github.com/tc39/proposals/blob/main/finished-proposals.md) and must never be the only right answer: **ES2023** `toSorted`/`toReversed`/`toSpliced`/`with`, `findLast`/`findLastIndex`, hashbang; **ES2024** `Object.groupBy`/`Map.groupBy`, `Promise.withResolvers`; **ES2025** Set methods (`union`…), iterator helpers, `Promise.try`, import attributes/JSON modules, `RegExp.escape`; **ES2026+** `Array.fromAsync`, `Error.isError`, Temporal (2027). ES2022 itself (`at()`, `Object.hasOwn`, error `cause`, class fields with `#private` and `static {}` blocks, top-level `await`) was brand new at the exam's release: fine to teach, but don't build a question on it alone. **Node.js:** `--watch` (v18.11), stable `--test` (v20), `--env-file` (v20.6), `require()` of ES modules (v22/v20.17) and stable `fetch` (v21) are newer; the current docs mark `process.nextTick()` **Legacy** (use `queueMicrotask()`), which the exam era didn't. **Jest:** Jest 30 removed the alias matchers (`toBeCalled`, `toBeCalledWith`, `lastCalledWith`, `toReturn`…); teach `toHaveBeenCalled…`. **Credential:** older material says the credential also needs the *Lightning Web Components Specialist* superbadge; the current guide says prerequisite none and lists no second requirement.

---

## Variables, Types, and Collections (23%): 10 lessons

| # | Lesson | Objectives |
|---|---|---|
| types-1 | var, let and const: declaring and initializing | types-1 |
| types-2 | Primitive types and typeof | types-1, types-3 |
| types-3 | Strings and template literals | types-2 |
| types-4 | Numbers, Math, BigInt and dates | types-2 |
| types-5 | Type coercion: +, - and == vs === | types-3 |
| types-6 | Truthy, falsy and the logical operators | types-4 |
| types-7 | Arrays: change it or copy it? | types-5 |
| types-8 | Arrays: map, filter, reduce, find and sort | types-5 |
| types-9 | Map, Set and WeakMap | types-5 |
| types-10 | JSON in and out | types-6 |

**Key facts**
- types-1: `let` and `const` are block-scoped; `var` is function- (or script-) scoped and hoisted: `var` declarations are processed before any code runs, so reading one early gives `undefined`. [read] MDN:Web/JavaScript/Reference/Statements/var, MDN:Web/JavaScript/Reference/Statements/let
- types-1: `const` must be initialized and can't be reassigned, but it is not immutability: an object held in a `const` can still have properties added, changed or removed. [read] MDN:Web/JavaScript/Reference/Statements/const
- types-1: Redeclaring a `let`/`const` in the same scope is a `SyntaxError`; redeclaring `var` is allowed. Assigning to an undeclared name creates a global in sloppy mode and throws `ReferenceError` in strict mode. [check] MDN:Web/JavaScript/Reference/Statements/let, MDN:Web/JavaScript/Reference/Strict_mode
- types-2: Seven primitive types (string, number, bigint, boolean, undefined, symbol, null) plus Object; primitives are immutable, and every primitive except `null` and `undefined` has a wrapper object that supplies its methods. [read] MDN:Web/JavaScript/Guide/Data_structures
- types-2: `typeof null === "object"` (a historical bug), `typeof function(){} === "function"`, `typeof class {} === "function"`, `typeof undeclaredVariable === "undefined"` (no error), but `typeof` on a `let`/`const` in its TDZ throws. Use `Array.isArray()` for arrays (`typeof [] === "object"`). [read] MDN:Web/JavaScript/Reference/Operators/typeof
- types-3: Template literals use backticks, allow `${expression}` interpolation and real line breaks. String methods return new strings (strings are immutable): `slice` takes negative indexes, `substring` swaps its arguments if start > end and treats negatives as 0; `replace` with a string changes only the first match, `replaceAll` changes all, and `replaceAll` with a regex without the `g` flag throws `TypeError`. [read] MDN:Web/JavaScript/Reference/Template_literals, MDN:Web/JavaScript/Reference/Global_Objects/String/replaceAll; substring/slice [check] MDN:Web/JavaScript/Reference/Global_Objects/String/substring
- types-3: `padStart`/`padEnd`, `trim`, `includes`, `startsWith`, `split`/`join`, `toUpperCase` are the everyday tools. [check] MDN:Web/JavaScript/Reference/Global_Objects/String
- types-4: `NaN` is the only value not equal to itself (`NaN === NaN` is false); test with `Number.isNaN()`, which, unlike global `isNaN()`, does not coerce (`isNaN("abc")` true, `Number.isNaN("abc")` false). [read] MDN:Web/JavaScript/Reference/Global_Objects/NaN, MDN:Web/JavaScript/Reference/Global_Objects/Number/isNaN
- types-4: `parseInt(string, radix)` reads a leading integer and ignores leading whitespace (`parseInt("42px")` → 42); always pass the radix. `toFixed(n)` returns a **string**, rounded. `Number.MAX_SAFE_INTEGER` is 9007199254740991 (2^53 − 1); beyond it use **BigInt** (`10n`), which can't be mixed with Number in arithmetic (TypeError) or used with `Math`. `0.1 + 0.2 !== 0.3` (floating point). [read] MDN:Web/JavaScript/Reference/Global_Objects/parseInt, …/Number/toFixed, …/Number/MAX_SAFE_INTEGER, …/BigInt; float [check] MDN:Web/JavaScript/Reference/Global_Objects/Number
- types-4: `Date` months are **zero-based** (`getMonth()` January = 0; `new Date(2022, 0, 31)`), days of the month start at 1. `Date.now()` gives milliseconds since the epoch; `Intl.DateTimeFormat`/`toLocaleDateString` format for a locale. [read] MDN:Web/JavaScript/Reference/Global_Objects/Date/getMonth, …/Date/Date; Intl [check]
- types-5: `+` first converts both operands to primitives; if either is a string, it concatenates (`1 + "2"` → `"12"`), otherwise adds numbers. `-`, `*`, `/` always convert to numbers (`"5" - 2` → 3, `"a" * 1` → NaN). [read] MDN:Web/JavaScript/Reference/Operators/Addition; others [check]
- types-5: `==` coerces; `null == undefined` is true but `0 == null` and `0 == undefined` are false; `===` never coerces. `Object.is` is like `===` except `Object.is(NaN, NaN)` true and `Object.is(0, -0)` false. [read] MDN:Web/JavaScript/Reference/Operators/Equality, …/Strict_equality; Object.is [check]
- types-6: The falsy values: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN` (and the odd `document.all`). Everything else is truthy, including `[]`, `{}`, `"0"`, `"false"` and `new Boolean(false)`. [read] https://developer.mozilla.org/en-US/docs/Glossary/Falsy, https://developer.mozilla.org/en-US/docs/Glossary/Truthy
- types-6: `||` returns the first truthy operand, `&&` the first falsy one (they return values, not booleans). `??` falls back only for `null`/`undefined` (so `0 ?? 5` is 0 but `0 || 5` is 5); `?.` stops at `null`/`undefined` and returns `undefined`. `||=`, `&&=`, `??=` assign conditionally. [read] MDN:Web/JavaScript/Reference/Operators/Nullish_coalescing, …/Optional_chaining, …/Logical_OR_assignment
- types-7: Mutating methods: `push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`, `fill`. Copying methods: `slice` (shallow copy, original unchanged), `concat`, `map`, `filter`, spread `[...a]`, `Array.from` (from any iterable or array-like). `sort` sorts **in place** and returns the same array. [read] MDN:Web/JavaScript/Reference/Global_Objects/Array/sort, …/slice, …/splice, …/from
- types-7: `includes` uses SameValueZero (finds `NaN`); `indexOf` uses `===` (can't find `NaN`). `at(-1)` reads from the end (ES2022, new at the exam's release). [read] MDN:…/Array/includes, …/Array/indexOf, …/Array/at
- types-8: Default `sort()` converts elements to strings and compares UTF-16 code units, so `[1, 10, 2].sort()` → `[1, 10, 2]`; numbers need `(a, b) => a - b`. [read] MDN:Web/JavaScript/Reference/Global_Objects/Array/sort
- types-8: `reduce` on an empty array with no initial value throws `TypeError`; `forEach` returns `undefined` and can't be stopped with `break`; `find` returns the first matching element (or `undefined`), `some`/`every` return booleans. [read] MDN:…/Array/reduce; forEach/find/some [check]
- types-9: `Map` keeps insertion order and accepts any value (objects too) as keys; `size` is a property. `Set` holds unique values (`[...new Set(arr)]` de-duplicates). `WeakMap` keys must be objects (or non-registered symbols), are held weakly (garbage-collectable) and can't be iterated. [read] MDN:Web/JavaScript/Reference/Global_Objects/Map, …/WeakMap; Set [read] …/Set
- types-10: `JSON.parse(text, reviver)` builds values from a JSON string (invalid JSON throws `SyntaxError`; JSON needs double-quoted keys and no trailing commas). `JSON.stringify(value, replacer, space)`: `undefined`, functions and symbols are **omitted** in objects and become `null` in arrays; BigInt throws; an object's `toJSON()` is used; Dates become ISO strings and don't come back as Dates. [read] MDN:Web/JavaScript/Reference/Global_Objects/JSON/stringify, …/JSON/parse; SyntaxError and Dates [check]

---

## Objects, Functions, and Classes (25%): 10 lessons

| # | Lesson | Objectives |
|---|---|---|
| objects-1 | Function declarations, expressions and arrows | objects-1 |
| objects-2 | Parameters: defaults, rest, spread and arguments | objects-1 |
| objects-3 | Higher-order functions and callbacks | objects-1 |
| objects-4 | What is `this`? call, apply and bind | objects-1, objects-5 |
| objects-5 | Objects: literals, destructuring, getters and setters | objects-2 |
| objects-6 | Copying, comparing and protecting objects | objects-2 |
| objects-7 | Prototypes and inheritance | objects-2, objects-3 |
| objects-8 | Classes: constructor, extends, static and private | objects-3 |
| objects-9 | Modules: import and export | objects-4 |
| objects-10 | Scope, hoisting, the TDZ and closures | objects-5 |

**Key facts**
- objects-1: Function **declarations** are hoisted with their body (callable before the line); function **expressions** and arrows follow their variable's rules (`var` → `undefined`, so calling it throws `TypeError`; `let`/`const` → `ReferenceError`). [read] https://developer.mozilla.org/en-US/docs/Glossary/Hoisting
- objects-1: Arrow functions have no own `this`, `arguments` or `super`, can't be used with `new` (TypeError) and shouldn't be used as methods; `this` comes from the surrounding scope. [read] MDN:Web/JavaScript/Reference/Functions/Arrow_functions
- objects-2: Default parameters apply only when the argument is `undefined` (not `null`). A rest parameter `...args` is a real array and must be last; `arguments` is array-like, not in arrows. Spread `...` expands an iterable into arguments or array/object literals. [read] MDN:Web/JavaScript/Reference/Functions/Default_parameters, …/Rest_parameters, …/arguments, MDN:Web/JavaScript/Reference/Operators/Spread_syntax
- objects-3: Functions are values: pass them as callbacks (`arr.map(fn)`), return them from functions (factories, currying). Pick a pure function (no side effects) for array callbacks. [check] MDN:Web/JavaScript/Guide/Functions
- objects-4: `this` depends on **how** a function is called, not where it is defined: `obj.f()` → `obj`; a plain call `f()` → `undefined` in strict mode (global object in sloppy mode); `new` → the new object; arrows inherit `this`. Class bodies are always strict, so a detached method gets `this === undefined`. [read] MDN:Web/JavaScript/Reference/Operators/this, MDN:Web/JavaScript/Reference/Classes
- objects-4: `call(thisArg, a, b)` and `apply(thisArg, [a, b])` call now; `bind(thisArg, ...preset)` returns a new function with `this` (and leading arguments) fixed. A bound function's `this` can't be changed again by `call` (but `new` ignores it). [read] MDN:Web/JavaScript/Reference/Global_Objects/Function/bind, …/Function/call
- objects-5: Object literals: shorthand properties and methods, computed keys `[key]`, `get`/`set` accessors. Destructuring with defaults and renaming: `const { a: x = 1, ...rest } = obj`, `const [first, , third] = arr`. Dot vs bracket access (bracket for dynamic or non-identifier keys). [read] MDN:Web/JavaScript/Reference/Operators/Destructuring, MDN:Web/JavaScript/Reference/Functions/get
- objects-5: Iterate with `Object.keys/values/entries` (own enumerable string keys); `for...in` also walks **inherited** enumerable properties; `for...of` needs an iterable (plain objects aren't). `Object.hasOwn(obj, key)` (ES2022) replaces `hasOwnProperty`. [read] MDN:…/Statements/for...in, …/Statements/for...of, …/Object/hasOwn; keys [read] …/Object/keys
- objects-6: Objects compare by reference (`{} === {}` false). `{...obj}` and `Object.assign` make **shallow** copies (assign copies own enumerable properties and invokes getters/setters); `structuredClone` makes a deep copy but can't clone functions or DOM nodes (`DataCloneError`); `JSON.parse(JSON.stringify(x))` loses functions, `undefined` and Dates. [read] MDN:…/Object/assign, MDN:Web/API/Window/structuredClone; spread equality [check]
- objects-6: `Object.freeze` blocks adding, removing and changing properties, but only **shallowly**; changes fail silently in sloppy mode and throw `TypeError` in strict mode. `Object.seal` blocks adding and removing but allows changing values. `Object.defineProperty` sets `writable`, `enumerable`, `configurable` (all default `false` when defined this way). [read] MDN:…/Object/freeze, …/Object/seal; defineProperty defaults [check] …/Object/defineProperty
- objects-7: Every object has a `[[Prototype]]` (read with `Object.getPrototypeOf`); a property lookup walks the chain up to `null`, and an own property **shadows** one on the prototype. A function's `prototype` property is what instances made with `new` get as their `[[Prototype]]`. `Object.create(proto)` makes an object with a chosen prototype. `instanceof` checks whether `Ctor.prototype` is on the chain. [read] MDN:Web/JavaScript/Guide/Inheritance_and_the_prototype_chain, …/Object/create, MDN:Web/JavaScript/Reference/Operators/instanceof
- objects-8: Classes are functions (`typeof` → "function") but are **not hoisted** usefully: class declarations have a TDZ like `let`. Bodies run in strict mode. A subclass constructor must call `super()` before using `this` (else `ReferenceError`). `static` members live on the class, not instances. [read] MDN:Web/JavaScript/Reference/Classes, …/Classes/extends, …/Operators/super, …/Classes/static
- objects-8: Private elements `#x` (ES2022) are a `SyntaxError` to reference outside the class; constructors can't be private. Before them, privacy came from closures or `WeakMap`. Getters/setters with `get`/`set`. [read] MDN:Web/JavaScript/Reference/Classes/Private_elements
- objects-9: Named exports (`export const a`, `import { a as b }`) vs one default export (`export default`, imported with any name); `import * as ns`. Imports are **read-only live bindings** and **hoisted**; modules run in strict mode, once, and are deferred in the browser (`<script type="module">`). In Node use `.mjs` or `"type": "module"`. [read] MDN:Web/JavaScript/Guide/Modules, MDN:Web/JavaScript/Reference/Statements/import, …/Statements/export
- objects-9: `import()` (dynamic import) returns a promise for the module namespace and works in non-module scripts; `import` is a keyword, not a function. Top-level `await` works only in modules (ES2022). [read] MDN:Web/JavaScript/Reference/Operators/import, MDN:Web/JavaScript/Reference/Operators/await
- objects-10: Scope chain: block → function → module/script → global. `let`/`const`/`class` are in the **temporal dead zone** from the start of the block until the declaration runs; reading them there throws `ReferenceError` (and so does `typeof`). [read] MDN:Web/JavaScript/Reference/Statements/let
- objects-10: A closure is a function plus the variables of the scope where it was created; inner functions keep access after the outer function returns. Classic trap: `for (var i…) setTimeout(() => log(i))` logs the final value every time; `let` creates a new binding per iteration. [read] MDN:Web/JavaScript/Guide/Closures ("Creating closures in loops: A common mistake")

---

## Browser and Events (17%): 7 lessons

| # | Lesson | Objectives |
|---|---|---|
| browser-1 | Finding elements in the DOM | browser-2 |
| browser-2 | Changing the DOM safely | browser-2 |
| browser-3 | Event listeners and their options | browser-1 |
| browser-4 | Propagation: capture, target, bubble | browser-1 |
| browser-5 | Event delegation and custom events | browser-1 |
| browser-6 | Browser APIs: storage, history, location, fetch and timers | browser-4 |
| browser-7 | Browser Dev Tools: inspect, watch and measure | browser-3 |

**Key facts**
- browser-1: `getElementById` returns one element or `null`; `querySelector` the first CSS match or `null`; `querySelectorAll` a **static** (not live) `NodeList`, while `getElementsByClassName`/`children` are live `HTMLCollection`s. `closest(selector)` walks up the ancestors. [read] MDN:Web/API/Document/querySelector, …/querySelectorAll, MDN:Web/API/Element/closest; live collections [check]
- browser-1: `DOMContentLoaded` fires when the HTML is parsed and deferred and module scripts have run, without waiting for stylesheets or images; `load` waits for everything. [read] MDN:Web/API/Document/DOMContentLoaded_event, MDN:Web/API/Window/load_event
- browser-2: `textContent` sets plain text (safe) and reads all text including `<script>`/`<style>`; `innerText` reads only rendered text; `innerHTML` parses HTML and is an XSS sink for untrusted input. [read] MDN:Web/API/Node/textContent, MDN:Web/API/Element/innerHTML
- browser-2: Build with `document.createElement`, then `append` (many nodes or strings, returns nothing) or `appendChild` (one node, returns it); `insertAdjacentHTML`; `classList.add/remove/toggle`; `dataset` maps `data-*` attributes (`data-user-id` → `dataset.userId`); `setAttribute`. [read] MDN:Web/API/Element/append, MDN:Web/API/Node/appendChild, MDN:Web/API/Element/classList, MDN:Web/API/HTMLElement/dataset
- browser-3: `addEventListener(type, listener, options)` with `capture`, `once`, `passive` (never calls `preventDefault`), `signal` (remove with an `AbortController`). Adding the **same** function twice is ignored; two identical-looking anonymous functions are two listeners. `removeEventListener` needs the same function and the same `capture` flag. In a regular-function listener `this` is the element (`currentTarget`); in an arrow it isn't. [read] MDN:Web/API/EventTarget/addEventListener, …/removeEventListener
- browser-4: Events travel capture (window → target), target, then bubble (target → window) if `bubbles` is true. `stopPropagation()` stops travel but **not** the default action; `stopImmediatePropagation()` also skips the remaining listeners on the same element; `preventDefault()` cancels the default action (form submit, link navigation) only. [read] MDN:Web/API/Event/stopPropagation, …/stopImmediatePropagation, …/preventDefault
- browser-5: Delegation: one listener on a parent, use `event.target` (what was clicked) with `closest()`; `event.currentTarget` is the element the listener is on (and is `null` outside the handler). [read] MDN:Web/API/Event/currentTarget, …/Event/target
- browser-5: `new CustomEvent(type, { detail, bubbles, composed })`: `bubbles` defaults to **false**; `composed` lets it cross a shadow DOM boundary (matters for Lightning Web Components). `dispatchEvent` runs the listeners **synchronously** before returning (unlike native events). [read] MDN:Web/API/CustomEvent/CustomEvent, MDN:Web/API/Event/Event, MDN:Web/API/EventTarget/dispatchEvent, MDN:Web/API/Event/composed
- browser-6: `localStorage` persists per origin with no expiry; `sessionStorage` is per origin **and tab**, survives reloads, cleared when the tab closes; both store strings only (use JSON). [read] MDN:Web/API/Window/localStorage, …/sessionStorage
- browser-6: `history.pushState`/`replaceState` change the URL without loading; they do **not** fire `popstate`, which fires on back/forward. `location.href`/`assign` navigate; `navigator` describes the browser. [read] MDN:Web/API/History/pushState, MDN:Web/API/Window/popstate_event; location/navigator [check]
- browser-6: `fetch()` rejects only on network failure; a 404 or 500 **fulfills** – check `response.ok` (status 200-299). Cancel with `AbortController`. [read] MDN:Web/API/Window/fetch, MDN:Web/API/Response/ok, MDN:Web/API/AbortController
- browser-6: Timers: `setTimeout`/`setInterval` return an id for `clearTimeout`/`clearInterval`; nested timeouts are clamped to at least 4 ms after 5 levels, and background tabs throttle further. **Debounce** waits until calls stop for a while; **throttle** limits the rate. Pointer events unify mouse, pen and touch. `requestAnimationFrame` runs before the next repaint. [read] MDN:Web/API/Window/setTimeout, https://developer.mozilla.org/en-US/docs/Glossary/Debounce, MDN:Web/API/Pointer_events, MDN:Web/API/Window/requestAnimationFrame
- browser-7: Dev Tools panels: Elements (DOM, styles, event listeners, break on DOM changes), Console (run code, `$0` = selected element), Sources (breakpoints, call stack, scope, watch), Network (requests, status, timing, throttling), Performance and Memory, Application (storage, cookies). [check] https://developer.chrome.com/docs/devtools (not read; also https://javascript.info/debugging-chrome, listed in the trailmix)

---

## Debugging and Error Handling (7%): 3 lessons

| # | Lesson | Objectives |
|---|---|---|
| debug-1 | try, catch, finally and throw | debug-1 |
| debug-2 | Error types and catching selectively | debug-1 |
| debug-3 | The console and breakpoints | debug-2 |

**Key facts**
- debug-1: `try` needs a `catch`, a `finally`, or both; `finally` always runs before control leaves (even after `return`); a `return` in `finally` overrides the earlier one [check]. The catch binding is optional (`catch {}`). `throw` takes any expression, but throw `Error` objects for a stack trace. try/catch doesn't catch errors thrown later in callbacks or unawaited promises. [read] MDN:Web/JavaScript/Reference/Statements/try...catch, …/Statements/throw; async part [check]
- debug-2: Built-in errors: `ReferenceError` (unknown or not-yet-initialized variable), `TypeError` (wrong type, e.g. calling `undefined`), `SyntaxError`, `RangeError` (value out of range, e.g. `new Array(-1)`), `URIError`, `EvalError`, `AggregateError` (from `Promise.any`). Catch selectively with `if (e instanceof TypeError)` and rethrow the rest; custom errors `class ValidationError extends Error` set `name`; wrap with `new Error(msg, { cause })` (ES2022). [read] MDN:Web/JavaScript/Reference/Global_Objects/Error, …/ReferenceError, …/TypeError, …/RangeError, …/Error/cause
- debug-3: `console.log/info/debug/warn/error` (log levels you can filter), `console.table` (tabular), `console.time`/`timeEnd` (same label), `console.count`, `console.group`/`groupEnd`, `console.trace` (stack), `console.dir`. `console.assert(cond, msg)` logs an error only when the condition is false and **doesn't throw**. [read] MDN:Web/API/console, MDN:Web/API/console/assert_static, …/table_static, …/time_static
- debug-3: The `debugger;` statement pauses like a breakpoint when dev tools are open and does nothing otherwise. Breakpoint kinds: line, conditional, logpoint, DOM change, event listener, XHR/fetch, exceptions (caught/uncaught); step over / into / out, watch expressions, call stack. [read] MDN:Web/JavaScript/Reference/Statements/debugger; breakpoint kinds [check] https://developer.chrome.com/docs/devtools/javascript/breakpoints

---

## Asynchronous Programming (13%): 6 lessons

| # | Lesson | Objectives |
|---|---|---|
| async-1 | Sync vs async, and callbacks | async-1 |
| async-2 | Promises: states, then, catch, finally | async-1 |
| async-3 | Promise.all, allSettled, any and race | async-1 |
| async-4 | async and await | async-1 |
| async-5 | The event loop: microtasks before tasks | async-2 |
| async-6 | Predicting the output: timers, loops and order | async-2 |

**Key facts**
- async-1: JavaScript runs one job at a time on one thread (run-to-completion); async work (timers, I/O, events) finishes later and queues a callback. Nested callbacks ("callback hell") and error-first callbacks `(err, data)` (Node style) are what promises replace. [read] MDN:Web/JavaScript/Reference/Execution_model; error-first [check] NODE:errors
- async-2: A promise is **pending**, then **fulfilled** or **rejected** (settled) once. `then` returns a new promise (chain by returning values or promises), `catch(fn)` = `then(undefined, fn)`, `finally` runs either way and passes the result through. Handlers attached after settling still run. A `.then` callback always runs asynchronously. [read] MDN:Web/JavaScript/Reference/Global_Objects/Promise, MDN:Web/JavaScript/Guide/Using_promises
- async-3: `Promise.all`: fulfills with values **in input order** when all fulfill, rejects on the first rejection; empty input fulfills at once. `allSettled`: always fulfills with `{status, value|reason}` objects. `any`: first fulfillment; rejects with `AggregateError` if all reject (or if empty). `race`: settles like the first to settle; stays pending forever if empty. [read] MDN:…/Promise/all, …/Promise/allSettled, …/Promise/any, …/Promise/race
- async-4: An `async` function always returns a promise (resolved with its return value, rejected with an uncaught throw). `await` pauses only that function; use try/catch around awaits. `await` is allowed only in async functions and at the top level of modules. Sequential awaits run one after another; start promises first and `await Promise.all` to run them in parallel. [read] MDN:Web/JavaScript/Reference/Statements/async_function, MDN:Web/JavaScript/Reference/Operators/await; parallel pattern [check]
- async-5: Order: all synchronous code → **all microtasks** (promise callbacks, `queueMicrotask`, MutationObserver) until the queue is empty → one task (macrotask: `setTimeout`, `setInterval`, events, I/O) → microtasks again… So `setTimeout(f, 0)` runs after `Promise.resolve().then(g)`. Recursive microtasks can starve the loop. [read] MDN:Web/API/HTML_DOM_API/Microtask_guide, MDN:Web/API/Window/queueMicrotask
- async-6: `setTimeout(fn, 0)` means "next cycle, after current code", never immediately; the delay is a minimum. The code after an `await` runs as a microtask. Loop outcomes: `var` in a loop with async callbacks logs the last value; `let` logs each. `Promise` executor code runs **synchronously** (`new Promise(r => { console.log('a') })` logs at once). [read] MDN:Web/API/Window/setTimeout; executor and await [check] MDN:…/Promise/Promise
- async-6: In Node, `process.nextTick` callbacks run after the current operation, before promise microtasks and before the event loop continues; `setImmediate` runs in the check phase after I/O. `setTimeout(0)` vs `setImmediate` from the main module is **non-deterministic**; inside an I/O callback `setImmediate` always runs first. [read] https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick, NODE:process (nextTick before promises [check])

---

## Server Side JavaScript (8%): 4 lessons

| # | Lesson | Objectives |
|---|---|---|
| server-1 | Node.js: what it is and how modules load | server-1 |
| server-2 | Node and npm on the command line | server-2 |
| server-3 | Core modules and popular frameworks | server-3 |
| server-4 | npm packages: package.json, versions and the lock file | server-4 |

**Key facts**
- server-1: Node runs JavaScript outside the browser on V8 with a single-threaded event loop and non-blocking I/O handed to the system; good for I/O-heavy servers and APIs, poor for CPU-heavy work on the main thread (use worker threads/child processes). No DOM or `window`; `globalThis`/`global`, `process`, `Buffer` instead. [read] https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick; workers [check] NODE:worker_threads
- server-1: CommonJS: `require()` / `module.exports`; `exports.x = …` is a shortcut, but **assigning** `exports = …` doesn't export anything. Modules are **cached** after the first `require`. ES modules: `.mjs`, or `.js` with `"type": "module"` in package.json; `.cjs` forces CommonJS. ES modules have no `require`, `__filename` or `__dirname` (use `import.meta.url`), and need full file extensions in relative imports. [read] NODE:modules, NODE:esm, NODE:packages
- server-2: `node app.js`; `node -e "code"` evaluates, `node -p "expr"` evaluates and prints; `node --inspect` opens the inspector (Chrome DevTools via `chrome://inspect`), `--inspect-brk` breaks at the first line; `node inspect app.js` is the built-in CLI debugger; `-r`/`--require` preloads a module; `node` alone opens the REPL. [read] NODE:cli, NODE:debugger
- server-2: npm/npx: `npm init` (`-y` for defaults) creates package.json; `npm install` (`-D`/`--save-dev` → devDependencies, `-g` global); `npm ci` installs exactly from the lock file; `npm run <script>` (`npm test`, `npm start` without `run`); `npx` runs a package's command, fetching it if it isn't installed. [read] NPM:commands/npm-init, NPM:commands/npm-install, NPM:commands/npm-ci, NPM:commands/npx, NPM:commands/npm-run (read via npm/cli source)
- server-3: Core modules (import as `node:fs` etc.): `fs` (callback, sync and `fs/promises` APIs; sync APIs **block the event loop**), `http`/`https` (`createServer`, `request`, `get`), `path` (`join`, `resolve`), `events` (`EventEmitter`), `stream`, `util` (`promisify`), `os`, `url`, `child_process`, `crypto`. [read] NODE:fs, NODE:http, NODE:path, NODE:util; os/url/crypto [check]
- server-3: `EventEmitter` calls listeners **synchronously** in registration order; `once` for one-shot; emitting `'error'` with no listener **throws** and can crash the process; warning after more than **10** listeners per event by default. [read] NODE:events
- server-3: Streams: four types (Readable, Writable, Duplex, Transform); `pipe`/`stream.pipeline` connect them and handle backpressure (`highWaterMark`); use streams for large files instead of reading them whole. [read] NODE:stream
- server-3: Frameworks: Express (minimal, middleware), Koa, Fastify, NestJS, Hapi, Next.js and others; the guide's own link is a third-party blog list. Pick by need (minimal REST API → Express/Fastify; structured enterprise app → NestJS). [check] (guide link: https://anywhere.epam.com/en/blog/best-node-js-frameworks, not read)
- server-4: `dependencies` (needed at run time) vs `devDependencies` (tests, build tools; not installed for consumers) vs `peerDependencies` (plugins that need a host package); `name` and `version` are required only to publish; `"private": true` blocks publishing; `main`, `bin`, `scripts`, `engines`. [read] NPM:configuring-npm/package-json
- server-4: Semver ranges: `^1.2.3` = `>=1.2.3 <2.0.0` (no change to the left-most non-zero part, so `^0.2.3` = `<0.3.0`); `~1.2.3` = `>=1.2.3 <1.3.0` (patch only); exact `1.2.3`; `1.2.x`. `package-lock.json` records the exact tree and is meant to be **committed**; `npm ci` needs it, deletes `node_modules`, and fails instead of updating it when it doesn't match package.json. `pre<name>`/`post<name>` scripts run around `<name>`. `npm audit` reports known vulnerabilities. [read] https://github.com/npm/node-semver#ranges, NPM:configuring-npm/package-lock-json, NPM:commands/npm-ci, NPM:using-npm/scripts, NPM:commands/npm-audit

---

## Testing (7%): 3 lessons

| # | Lesson | Objectives |
|---|---|---|
| testing-1 | What makes a test effective? | testing-1 |
| testing-2 | Jest: matchers, setup and async tests | testing-1 |
| testing-3 | Test doubles: mocks, spies and fake timers | testing-1 |

**Key facts**
- testing-1: Unit (one function, dependencies replaced), integration (parts together), end-to-end (the whole app like a user). Black-box tests check behaviour through the public interface; white-box tests know the code. **False positive** (fails though the code works, e.g. testing implementation details) vs **false negative** (passes though the code is broken, e.g. no real assertion). An effective test covers edge cases (empty, null, boundaries, errors), asserts the actual result, and stays independent of other tests. [read] Cert Prep unit https://trailhead.salesforce.com/content/learn/modules/javascript-developer-i-certification-prep-debugging-error-handling-testing/explore-testing (topics only); definitions [check]
- testing-1: `console.assert` is not a test: it only logs and never fails anything. [read] MDN:Web/API/console/assert_static
- testing-2: Jest: `npm install --save-dev jest`, `"test": "jest"`, files like `sum.test.js`; `describe`/`test` (`it`), `expect(x).matcher()`. `toBe` uses `Object.is` (primitives, same reference); `toEqual` compares recursively (deep), ignoring `undefined` properties; `toStrictEqual` also checks types/undefined properties; `toThrow` needs the call wrapped: `expect(() => fn()).toThrow()`. [read] JEST:getting-started, JEST:expect
- testing-2: Async tests must `return` or `await` the promise, or the test ends before it settles and passes falsely; use `.resolves`/`.rejects`, and `expect.assertions(n)` when testing a rejection with `.catch`. `beforeEach`/`afterEach` run around every test, `beforeAll`/`afterAll` once per file or `describe`. [read] JEST:asynchronous, JEST:setup-teardown
- testing-3: `jest.fn()` creates a mock (records `mock.calls`, `mock.results`; set `mockReturnValue(Once)`, `mockResolvedValue`, `mockImplementation`); `jest.spyOn(obj, 'method')` wraps a real method and tracks calls; `jest.mock('module')` replaces a module (hoisted above imports with babel-jest, not with native ESM). Check with `toHaveBeenCalled`, `toHaveBeenCalledTimes`, `toHaveBeenCalledWith`. `clearAllMocks` clears call records, `resetAllMocks` also removes implementations, `restoreAllMocks` puts spied originals back. [read] JEST:mock-functions, JEST:jest-object, JEST:manual-mocks
- testing-3: Fake timers: `jest.useFakeTimers()`, then `jest.runAllTimers()` or `jest.advanceTimersByTime(ms)` to test debounce/setTimeout code without waiting. Stub (canned answers) vs spy (records calls) vs mock (pre-programmed expectations). [read] JEST:timer-mocks; stub/spy/mock definitions [check]

---

## Lesson count
Variables, Types, and Collections 10 · Objects, Functions, and Classes 10 · Browser and Events 7 · Debugging and Error Handling 3 · Asynchronous Programming 6 · Server Side JavaScript 4 · Testing 3 · **total 43**.

Objective coverage check: types-1 (L1-2), types-2 (L3-4), types-3 (L2, 5), types-4 (L6), types-5 (L7-9), types-6 (L10); objects-1 (L1-4), objects-2 (L5-7), objects-3 (L7-8), objects-4 (L9), objects-5 (L4, 10); browser-1 (L3-5), browser-2 (L1-2), browser-3 (L7), browser-4 (L6); debug-1 (L1-2), debug-2 (L3); async-1 (L1-4), async-2 (L5-6); server-1 (L1), server-2 (L2), server-3 (L3), server-4 (L4); testing-1 (L1-3). Every objective is covered.

## Gotchas the exam likes (cross-section)
- Coercion: `[] + {}`, `"5" - 2`, `1 + "2"`, `null == 0` (false), `null >= 0` (true) [check], `NaN !== NaN`. (types-5, types-6)
- `this`: method pulled off its object, arrow vs regular callback, `bind` once and for all. (objects-4, browser-3)
- Hoisting: function declarations vs expressions, `var` → `undefined`, `let`/`const`/`class` → TDZ `ReferenceError`. (types-1, objects-1, objects-10)
- Closures in loops with `var` vs `let`. (objects-10, async-6)
- Prototype chain: shadowing, `instanceof`, `Object.create`. (objects-7)
- Event loop order: sync → microtasks (`then`, `await` continuation, `queueMicrotask`) → timers; Node adds `nextTick` (before promises) and `setImmediate`. (async-5, async-6)
- Promise combinators with a rejection in the mix; empty-array edge cases. (async-3)
- Modules: default vs named import syntax, live read-only bindings, `type="module"` is deferred and strict. (objects-9)
- Propagation: `stopPropagation` vs `preventDefault` vs `stopImmediatePropagation`; `target` vs `currentTarget`; `CustomEvent` doesn't bubble by default. (browser-4, browser-5)
- Node: `module.exports` vs `exports`, `npm ci` vs `npm install`, `^` vs `~`, dev vs regular dependencies, `--inspect`. (server-1, server-2, server-4)
- Jest: missing `await`/`return` → false pass, `toBe` vs `toEqual` on objects, `expect(fn()).toThrow()` mistake, mocks never asserted. (testing-2, testing-3)
- Errors: `instanceof` to catch selectively, `finally` always runs, `console.assert` never throws. (debug-1, debug-2, debug-3)
