// What runs inside the playground's sandboxed frame, before the learner's code: a console that prints the way
// the browser's does, timers the playground can count (so it knows when the code has finished), a guard that
// stops endless loops, gentle stand-ins for alert/confirm/prompt, and tiny Jest-style test/expect/jest.fn.
//
// installRuntime is injected as source text (installRuntime.toString()), so it must stay self-contained:
// no imports and no references to anything outside its own body. Node tests call it with a fake `scope`.

export function installRuntime(scope, post) {
  const MAX_LINES = 400;
  const MAX_DEPTH = 3;
  const LOOP_LIMIT_MS = 2000;
  let printed = 0;

  // ---------- printing values like the browser console ----------
  const quote = (s) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`;
  const keyText = (k) => (typeof k === 'symbol' ? `[${k.toString()}]` : /^[A-Za-z_$][\w$]*$/.test(k) ? k : quote(k));

  function show(v, depth = 0, seen = [], nested = false) {
    const t = typeof v;
    if (t === 'string') return nested ? quote(v) : v;
    if (t === 'number') return Object.is(v, -0) ? '-0' : String(v);
    if (t === 'bigint') return `${v}n`;
    if (v === null || t === 'undefined' || t === 'boolean') return String(v);
    if (t === 'symbol') return v.toString();
    if (t === 'function') {
      const src = Function.prototype.toString.call(v);
      return /^class\b/.test(src) ? `[class ${v.name || '(anonymous)'}]` : `[Function: ${v.name || '(anonymous)'}]`;
    }
    if (seen.includes(v)) return '[Circular]';
    if (v instanceof Error) return `${v.name}: ${v.message}`;
    if (v instanceof Date) return Number.isNaN(v.getTime()) ? 'Invalid Date' : v.toISOString();
    if (v instanceof RegExp) return String(v);
    if (v instanceof Promise) return 'Promise { … }';
    if (scope.Element && v instanceof scope.Element) {
      const id = v.id ? `#${v.id}` : '';
      const cls = typeof v.className === 'string' && v.className.trim() ? `.${v.className.trim().split(/\s+/).join('.')}` : '';
      return `<${v.tagName.toLowerCase()}${id}${cls}>`;
    }
    if (scope.Node && v instanceof scope.Node) return v.nodeName;
    if (v instanceof WeakMap || v instanceof WeakSet) return `${v.constructor.name} { <items unknown> }`;
    const isArray = Array.isArray(v);
    if (depth >= MAX_DEPTH) return isArray ? '[Array]' : '[Object]';
    const inner = [...seen, v];
    const f = (x) => show(x, depth + 1, inner, true);
    const list = (items, open, close) => (items.length ? `${open} ${items.join(', ')} ${close}` : `${open}${close}`);
    if (isArray) {
      const items = [];
      let holes = 0;
      for (let i = 0; i < Math.min(v.length, 100); i += 1) {
        if (!(i in v)) { holes += 1; continue; }
        if (holes) { items.push(`<${holes} empty item${holes > 1 ? 's' : ''}>`); holes = 0; }
        items.push(f(v[i]));
      }
      if (holes) items.push(`<${holes} empty item${holes > 1 ? 's' : ''}>`);
      if (v.length > 100) items.push(`… ${v.length - 100} more items`);
      return list(items, '[', ']');
    }
    if (v instanceof Map) return `Map(${v.size}) ${list([...v].map(([k, x]) => `${f(k)} => ${f(x)}`), '{', '}')}`;
    if (v instanceof Set) return `Set(${v.size}) ${list([...v].map(f), '{', '}')}`;
    if (ArrayBuffer.isView(v) && !(v instanceof DataView)) return `${v.constructor.name}(${v.length}) ${list([...v].map(f), '[', ']')}`;
    const proto = Object.getPrototypeOf(v);
    const name = proto === null ? '[Object: null prototype]' : proto === Object.prototype ? '' : proto.constructor?.name || '';
    const parts = Reflect.ownKeys(v).filter((k) => Object.getOwnPropertyDescriptor(v, k).enumerable).map((k) => {
      const d = Object.getOwnPropertyDescriptor(v, k);
      if (d.get || d.set) return `${keyText(k)}: [${d.get && d.set ? 'Getter/Setter' : d.get ? 'Getter' : 'Setter'}]`;
      return `${keyText(k)}: ${f(d.value)}`;
    });
    const body = list(parts, '{', '}');
    return name ? `${name} ${body}` : body;
  }

  // console.log('%s is %d', 'x', 5) style placeholders, then the rest joined by spaces
  function format(args) {
    const rest = [...args];
    let head = '';
    if (typeof rest[0] === 'string' && /%[sdifoOjc%]/.test(rest[0])) {
      head = rest.shift().replace(/%([sdifoOjc%])/g, (m, k) => {
        if (k === '%') return '%';
        if (!rest.length) return m;
        const a = rest.shift();
        if (k === 'c') return '';
        if (k === 's') return typeof a === 'string' ? a : show(a, 1, [], true);
        if (k === 'd' || k === 'i') return typeof a === 'bigint' ? `${a}n` : String(k === 'i' ? parseInt(a, 10) : Number(a));
        if (k === 'f') return String(parseFloat(a));
        return show(a, 0, [], true);
      });
      return [head, ...rest.map((a) => show(a))].join(' ');
    }
    return rest.map((a) => show(a)).join(' ');
  }

  // ---------- console ----------
  let indent = '';
  const send = (level, text) => {
    printed += 1;
    if (printed > MAX_LINES) {
      if (printed === MAX_LINES + 1) post({ type: 'log', level: 'warn', text: `Output stopped after ${MAX_LINES} lines.` });
      return;
    }
    post({ type: 'log', level, text: indent ? text.split('\n').map((l) => indent + l).join('\n') : text });
  };
  const out = (level) => (...args) => send(level, format(args));
  const counts = new Map();
  const timings = new Map();
  const now = () => (scope.performance ? scope.performance.now() : Date.now());

  function table(data) {
    if (data === null || typeof data !== 'object') { send('log', format([data])); return; }
    const rows = [...(data instanceof Map ? data : Object.entries(data))];
    const cols = [];
    for (const [, row] of rows) {
      if (row !== null && typeof row === 'object') for (const k of Object.keys(row)) if (!cols.includes(k)) cols.push(k);
    }
    const hasValues = rows.some(([, row]) => row === null || typeof row !== 'object');
    const head = ['(index)', ...cols, ...(hasValues ? ['Values'] : [])];
    const cell = (x) => (x === undefined ? '' : show(x, 1, [], true));
    const body = rows.map(([k, row]) => [String(k), ...cols.map((c) => (row !== null && typeof row === 'object' ? cell(row[c]) : '')),
      ...(hasValues ? [row !== null && typeof row === 'object' ? '' : cell(row)] : [])]);
    const widths = head.map((h, i) => Math.max(h.length, ...body.map((r) => r[i].length)));
    const line = (cells) => `│ ${cells.map((c, i) => c.padEnd(widths[i])).join(' │ ')} │`;
    const rule = (a, b, c) => `${a}${widths.map((w) => '─'.repeat(w + 2)).join(b)}${c}`;
    send('log', [rule('┌', '┬', '┐'), line(head), rule('├', '┼', '┤'), ...body.map(line), rule('└', '┴', '┘')].join('\n'));
  }

  const console = {
    log: out('log'), info: out('info'), debug: out('log'), warn: out('warn'), error: out('error'),
    dir: (v) => send('log', show(v)),
    trace: (...a) => send('log', format(['Trace:', ...a])),
    table,
    assert: (ok, ...a) => { if (!ok) send('error', format(a.length ? ['Assertion failed:', ...a] : ['Assertion failed'])); },
    count: (label = 'default') => { const n = (counts.get(label) || 0) + 1; counts.set(label, n); send('log', `${label}: ${n}`); },
    countReset: (label = 'default') => { counts.set(label, 0); },
    time: (label = 'default') => { timings.set(label, now()); },
    timeLog: (label = 'default', ...a) => { if (timings.has(label)) send('log', format([`${label}: ${(now() - timings.get(label)).toFixed(3)}ms`, ...a])); },
    timeEnd: (label = 'default') => { if (timings.has(label)) { send('log', `${label}: ${(now() - timings.get(label)).toFixed(3)}ms`); timings.delete(label); } },
    group: (...a) => { if (a.length) send('log', format(a)); indent += '  '; },
    groupEnd: () => { indent = indent.slice(2); },
    clear: () => { printed = 0; post({ type: 'clear' }); },
  };
  console.groupCollapsed = console.group;
  scope.console = console;

  scope.alert = (msg = '') => send('info', `alert: ${format([msg])}`);
  scope.confirm = (msg = '') => { send('info', `confirm: ${format([msg])} → true (OK pressed)`); return true; };
  scope.prompt = (msg = '', value = '') => { send('info', `prompt: ${format([msg])} → ${quote(String(value))}`); return String(value); };

  // ---------- endless-loop guard (calls are added to loop bodies before the code runs) ----------
  let lastLoopCall = 0;
  let loopStart = 0;
  let loopStopped = false;
  scope.__lg = () => {
    const t = now();
    if (t - lastLoopCall > 50) loopStart = t;
    lastLoopCall = t;
    if (loopStopped || t - loopStart > LOOP_LIMIT_MS) { loopStopped = true; throw new Error('__PLAYGROUND_LOOP__'); }
  };

  // ---------- knowing when the code is finished ----------
  const native = {
    setTimeout: scope.setTimeout.bind(scope), clearTimeout: scope.clearTimeout.bind(scope),
    setInterval: scope.setInterval.bind(scope), clearInterval: scope.clearInterval.bind(scope),
  };
  const pending = new Set();
  let finishedTopLevel = false;
  let testsRunning = false;
  let idleCheck = null;
  const checkIdle = () => {
    if (!finishedTopLevel) return;
    native.clearTimeout(idleCheck);
    idleCheck = native.setTimeout(() => { if (!pending.size && !testsRunning) post({ type: 'idle' }); }, 60);
  };
  scope.setTimeout = (fn, ms, ...args) => {
    const id = native.setTimeout(() => {
      pending.delete(id);
      try { if (typeof fn === 'function') fn(...args); } finally { checkIdle(); }
    }, ms);
    pending.add(id);
    return id;
  };
  scope.setInterval = (fn, ms, ...args) => {
    const id = native.setInterval(() => {
      try { if (typeof fn === 'function') fn(...args); } finally { checkIdle(); }
    }, ms);
    pending.add(id);
    return id;
  };
  scope.clearTimeout = (id) => { native.clearTimeout(id); pending.delete(id); checkIdle(); };
  scope.clearInterval = (id) => { native.clearInterval(id); pending.delete(id); checkIdle(); };

  const errorInfo = (err) => ({
    name: err instanceof Error ? err.name : 'Uncaught',
    message: err instanceof Error ? err.message : show(err, 0, [], true),
    stack: err instanceof Error ? String(err.stack || '') : '',
  });
  scope.__report = (err) => post({ type: 'error', ...errorInfo(err) });
  if (scope.addEventListener) {
    scope.addEventListener('error', (e) => {
      post({ type: 'error', ...(e.error !== undefined ? errorInfo(e.error) : { name: 'Error', message: String(e.message || '').replace(/^Uncaught\s+/, '') }), line: e.lineno });
      e.preventDefault();
      checkIdle();
    });
    scope.addEventListener('unhandledrejection', (e) => {
      post({ type: 'error', ...errorInfo(e.reason), promise: true });
      e.preventDefault();
      checkIdle();
    });
  }

  // ---------- tiny Jest: test / describe / expect / jest.fn ----------
  const tests = [];
  const hooks = { beforeEach: [], afterEach: [], beforeAll: [], afterAll: [] };
  const suites = [];
  scope.describe = (name, fn) => { suites.push(name); try { fn(); } finally { suites.pop(); } };
  scope.test = (name, fn) => { tests.push({ name: [...suites, name].join(' › '), fn }); };
  scope.test.skip = (name) => { tests.push({ name: [...suites, name].join(' › '), skip: true }); };
  scope.test.todo = scope.test.skip;
  scope.it = scope.test;
  scope.describe.skip = () => {};
  for (const k of Object.keys(hooks)) scope[k] = (fn) => { hooks[k].push(fn); };

  function equals(a, b, strict) {
    if (Object.is(a, b)) return true;
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
    if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
    if (a instanceof RegExp && b instanceof RegExp) return String(a) === String(b);
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    if (a instanceof Map && b instanceof Map) return a.size === b.size && [...a].every(([k, x]) => b.has(k) && equals(x, b.get(k), strict));
    if (a instanceof Set && b instanceof Set) return a.size === b.size && [...a].every((x) => [...b].some((y) => equals(x, y, strict)));
    const keys = (o) => Object.keys(o).filter((k) => strict || o[k] !== undefined);
    const ka = keys(a);
    const kb = keys(b);
    if (ka.length !== kb.length) return false;
    return ka.every((k) => Object.prototype.hasOwnProperty.call(b, k) && equals(a[k], b[k], strict));
  }
  const partial = (a, b) => (typeof b !== 'object' || b === null ? equals(a, b)
    : typeof a === 'object' && a !== null && Object.keys(b).every((k) => partial(a[k], b[k])));
  const s = (x) => show(x, 0, [], true);
  const isMock = (f) => typeof f === 'function' && !!f.mock;

  const MATCHERS = {
    toBe: (a, b) => [Object.is(a, b), `Expected: ${s(b)}\nReceived: ${s(a)}`],
    toEqual: (a, b) => [equals(a, b, false), `Expected: ${s(b)}\nReceived: ${s(a)}`],
    toStrictEqual: (a, b) => [equals(a, b, true), `Expected: ${s(b)}\nReceived: ${s(a)}`],
    toBeTruthy: (a) => [!!a, `Received: ${s(a)}`],
    toBeFalsy: (a) => [!a, `Received: ${s(a)}`],
    toBeNull: (a) => [a === null, `Received: ${s(a)}`],
    toBeUndefined: (a) => [a === undefined, `Received: ${s(a)}`],
    toBeDefined: (a) => [a !== undefined, `Received: ${s(a)}`],
    toBeNaN: (a) => [Number.isNaN(a), `Received: ${s(a)}`],
    toBeGreaterThan: (a, b) => [a > b, `Expected: > ${s(b)}\nReceived: ${s(a)}`],
    toBeGreaterThanOrEqual: (a, b) => [a >= b, `Expected: >= ${s(b)}\nReceived: ${s(a)}`],
    toBeLessThan: (a, b) => [a < b, `Expected: < ${s(b)}\nReceived: ${s(a)}`],
    toBeLessThanOrEqual: (a, b) => [a <= b, `Expected: <= ${s(b)}\nReceived: ${s(a)}`],
    toBeCloseTo: (a, b, digits = 2) => [Math.abs(a - b) < 10 ** -digits / 2, `Expected: ${s(b)} (±${10 ** -digits / 2})\nReceived: ${s(a)}`],
    toContain: (a, b) => [a != null && typeof a.includes === 'function' && a.includes(b), `Expected to contain: ${s(b)}\nReceived: ${s(a)}`],
    toContainEqual: (a, b) => [Array.isArray(a) && a.some((x) => equals(x, b, false)), `Expected to contain: ${s(b)}\nReceived: ${s(a)}`],
    toHaveLength: (a, n) => [a != null && a.length === n, `Expected length: ${n}\nReceived length: ${a?.length}`],
    toHaveProperty: (a, path, ...v) => {
      const keys = Array.isArray(path) ? path : String(path).split('.');
      let cur = a;
      for (const k of keys) { if (cur == null || !(k in Object(cur))) return [false, `Expected property: ${s(path)}\nReceived: ${s(a)}`]; cur = cur[k]; }
      return [!v.length || equals(cur, v[0], false), `Expected ${s(path)}: ${s(v[0])}\nReceived: ${s(cur)}`];
    },
    toMatch: (a, re) => [typeof a === 'string' && (re instanceof RegExp ? re.test(a) : a.includes(re)), `Expected to match: ${s(re)}\nReceived: ${s(a)}`],
    toMatchObject: (a, b) => [partial(a, b), `Expected to match: ${s(b)}\nReceived: ${s(a)}`],
    toBeInstanceOf: (a, C) => [a instanceof C, `Expected an instance of ${C?.name}\nReceived: ${s(a)}`],
    toThrow: (fn, expected) => {
      if (typeof fn !== 'function') return [false, 'expect(…) needs a function here: expect(() => code).toThrow()'];
      try { fn(); } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        const ok = expected === undefined ? true : typeof expected === 'string' ? msg.includes(expected)
          : expected instanceof RegExp ? expected.test(msg) : typeof expected === 'function' ? err instanceof expected : equals(err, expected);
        return [ok, `Expected to throw: ${s(expected)}\nThrown: ${s(err)}`];
      }
      return [false, 'Expected the function to throw, but it did not.'];
    },
    toHaveBeenCalled: (f) => [isMock(f) && f.mock.calls.length > 0, `Calls: ${f?.mock?.calls.length ?? 'not a jest.fn()'}`],
    toHaveBeenCalledTimes: (f, n) => [isMock(f) && f.mock.calls.length === n, `Expected calls: ${n}\nReceived calls: ${f?.mock?.calls.length}`],
    toHaveBeenCalledWith: (f, ...args) => [isMock(f) && f.mock.calls.some((c) => equals(c, args, false)), `Expected a call with: ${s(args)}\nCalls: ${s(f?.mock?.calls)}`],
    toHaveBeenLastCalledWith: (f, ...args) => [isMock(f) && equals(f.mock.calls[f.mock.calls.length - 1], args, false), `Expected last call: ${s(args)}\nCalls: ${s(f?.mock?.calls)}`],
    toHaveReturnedWith: (f, v) => [isMock(f) && f.mock.results.some((r) => equals(r.value, v, false)), `Expected a return of: ${s(v)}`],
  };
  MATCHERS.toThrowError = MATCHERS.toThrow;
  MATCHERS.toBeCalled = MATCHERS.toHaveBeenCalled;
  MATCHERS.toBeCalledWith = MATCHERS.toHaveBeenCalledWith;

  function matchersFor(actual, not, mode) {
    const m = {};
    for (const [name, check] of Object.entries(MATCHERS)) {
      const verify = (value, args) => {
        const [pass, detail] = check(value, ...args);
        if (pass === not) throw new Error(`expect(received).${not ? 'not.' : ''}${name}(…)\n${detail}`);
      };
      m[name] = (...args) => {
        if (mode === 'resolves') return Promise.resolve(actual).then((v) => verify(v, args), (e) => { throw new Error(`Expected the promise to resolve, but it rejected: ${s(e)}`); });
        if (mode === 'rejects') return Promise.resolve(actual).then((v) => { throw new Error(`Expected the promise to reject, but it resolved: ${s(v)}`); }, (e) => verify(name === 'toThrow' || name === 'toThrowError' ? () => { throw e; } : e, args));
        return verify(actual, args);
      };
    }
    return m;
  }
  scope.expect = (actual) => {
    const m = matchersFor(actual, false);
    m.not = matchersFor(actual, true);
    m.resolves = matchersFor(actual, false, 'resolves');
    m.resolves.not = matchersFor(actual, true, 'resolves');
    m.rejects = matchersFor(actual, false, 'rejects');
    m.rejects.not = matchersFor(actual, true, 'rejects');
    return m;
  };
  scope.expect.assertions = () => {};
  scope.expect.any = (C) => C;

  function fn(impl) {
    const once = [];
    let base = impl;
    const mock = function mockFn(...args) {
      mock.mock.calls.push(args);
      const use = once.length ? once.shift() : base;
      try {
        const value = use ? use.apply(this, args) : undefined;
        mock.mock.results.push({ type: 'return', value });
        return value;
      } catch (err) { mock.mock.results.push({ type: 'throw', value: err }); throw err; }
    };
    mock.mock = { calls: [], results: [] };
    mock.mockImplementation = (f) => { base = f; return mock; };
    mock.mockImplementationOnce = (f) => { once.push(f); return mock; };
    mock.mockReturnValue = (v) => mock.mockImplementation(() => v);
    mock.mockReturnValueOnce = (v) => mock.mockImplementationOnce(() => v);
    mock.mockResolvedValue = (v) => mock.mockImplementation(() => Promise.resolve(v));
    mock.mockResolvedValueOnce = (v) => mock.mockImplementationOnce(() => Promise.resolve(v));
    mock.mockRejectedValue = (v) => mock.mockImplementation(() => Promise.reject(v));
    mock.mockRejectedValueOnce = (v) => mock.mockImplementationOnce(() => Promise.reject(v));
    mock.mockClear = () => { mock.mock.calls = []; mock.mock.results = []; return mock; };
    mock.mockReset = () => { mock.mockClear(); base = undefined; once.length = 0; return mock; };
    return mock;
  }
  scope.jest = {
    fn,
    spyOn: (obj, key) => {
      const original = obj[key];
      const spy = fn((...a) => original.apply(obj, a));
      spy.mockRestore = () => { obj[key] = original; };
      obj[key] = spy;
      return spy;
    },
  };

  async function runTests() {
    testsRunning = true;
    let passed = 0;
    let failed = 0;
    let skipped = 0;
    const call = (f) => (f.length ? new Promise((resolve, reject) => {
      const done = (err) => (err ? reject(err) : resolve());
      done.fail = reject;
      f(done);
    }) : f());
    const withTimeout = (p) => Promise.race([p, new Promise((_, reject) => native.setTimeout(() => reject(new Error('Test took longer than 3 seconds.')), 3000))]);
    try {
      for (const h of hooks.beforeAll) await withTimeout(call(h));
      for (const t of tests) {
        if (t.skip) { skipped += 1; send('info', `○ ${t.name} (skipped)`); continue; }
        try {
          for (const h of hooks.beforeEach) await withTimeout(call(h));
          await withTimeout(call(t.fn));
          for (const h of hooks.afterEach) await withTimeout(call(h));
          passed += 1;
          send('pass', `✓ ${t.name}`);
        } catch (err) {
          failed += 1;
          send('fail', `✕ ${t.name}\n${String(err instanceof Error ? err.message : s(err)).split('\n').map((l) => `    ${l}`).join('\n')}`);
        }
      }
      for (const h of hooks.afterAll) await withTimeout(call(h));
    } catch (err) { send('error', `A beforeAll/afterAll hook failed: ${err instanceof Error ? err.message : s(err)}`); }
    send(failed ? 'fail' : 'pass', `Tests: ${[failed && `${failed} failed`, `${passed} passed`, skipped && `${skipped} skipped`].filter(Boolean).join(', ')}, ${tests.length} total`);
    testsRunning = false;
    checkIdle();
  }

  // Called right after the learner's code has run to the end (or stopped with an error)
  scope.__done = () => {
    if (finishedTopLevel) return;
    finishedTopLevel = true;
    post({ type: 'sync' });
    if (tests.length) runTests(); else checkIdle();
  };
}
