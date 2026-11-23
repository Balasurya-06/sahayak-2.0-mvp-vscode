// Run with:  node tests/run-tests.js      (no packages needed)
const vm = require('vm'), fs = require('fs'), path = require('path'), assert = require('assert');
const src = fs.readFileSync(path.join(__dirname, '../js/core.js'), 'utf8');
const ctx = vm.createContext({ console });
vm.runInContext(src + `
;globalThis.API={DEPTS,ROUTE_DEPTS,buildIndex,route,initCounts,buildTestSet,evalRouting,buildHistory,evalTimers,
 km,learnedTimers,wer,LR,avgModels,runContinual,runFederated};`, ctx);
const A = ctx.API;
let pass = 0, fail = 0;
const t = (name, fn) => { try { fn(); console.log('  ✔', name); pass++; } catch (e) { console.log('  ✘', name, '\n     ', e.message); fail++; } };
const near = (a, b, eps = 1e-6) => assert(Math.abs(a - b) < eps, `${a} !~ ${b}`);

console.log('Core logic tests');
t('word error rate = (S+D+I)/N', () => near(A.wer('no water in tap', 'no water in the tap please'), 0.5));
t('Kaplan–Meier matches hand calculation (0.9, 0.7, 0.5, 0.375, censoring kept)', () => {
  const obs = [4, 6, 6, 9, 9, 14, 20, 25, 30].map(x => ({ t: x, e: 1 })).concat([{ t: 11, e: 0 }]);
  const S = A.km(obs).map(p => +p.S.toFixed(3));
  assert.strictEqual(JSON.stringify(S.slice(0, 5)), JSON.stringify([1, 0.9, 0.7, 0.5, 0.375]));
});
t('learned first timer never exceeds the Charter', () => {
  const slow = Array.from({ length: 40 }, (_, i) => ({ t: 20 + i, e: 1 }));
  const lt = A.learnedTimers({ charter: 7 }, slow, { q: 0.8 });
  assert.strictEqual(lt.t[0], 7); assert(lt.capped);
});
t('falls back to the fixed ladder when history is too small', () => {
  const lt = A.learnedTimers({ charter: 7 }, [{ t: 3, e: 1 }], { nmin: 20 });
  assert.strictEqual(lt.source, 'fallback'); assert.strictEqual(lt.t[0], 7);
});
t('escalation levels strictly increase', () => {
  const H = A.buildHistory();
  A.ROUTE_DEPTS.forEach(d => { const T = A.learnedTimers(d, H[d.id].train, { q: 0.8 }); for (let i = 1; i < 4; i++) assert(T.t[i] > T.t[i - 1]); assert(T.legal > T.t[3]); });
});
t('routing: water complaint goes to Water Supply', () => {
  const r = A.route(A.buildIndex(A.ROUTE_DEPTS), A.initCounts(), 'No water coming in the tap since three days');
  assert.strictEqual(r.top.id, 'water');
});
t('routing: gibberish is handed to a human operator', () => {
  const r = A.route(A.buildIndex(A.ROUTE_DEPTS), A.initCounts(), 'qqqq zzzz xxxx');
  assert(r.human);
});
t('prior P(d|intent) with add-one smoothing sums to 1', () => {
  const r = A.route(A.buildIndex(A.ROUTE_DEPTS), A.initCounts(), 'pothole on the road');
  near(r.rows.reduce((s, x) => s + x.prior, 0), 1);
});
t('federated averaging is a weighted average (600/300/100 → 0.35)', () => {
  const ms = [0.2, 0.5, 0.8].map(v => { const m = new A.LR(2); m.b[0] = v; return m; });
  near(A.avgModels(ms, [600, 300, 100]).b[0], 0.35, 1e-5);
});

console.log('Behaviour checks on synthetic data');
t('similarity+prior router beats keyword router on speech-error-like typos', () => {
  const R = A.evalRouting(A.buildIndex(A.ROUTE_DEPTS), A.initCounts(), A.buildTestSet(), { alpha: 0.6, delta: 0.15 });
  assert(R.by.noisy.full.top1 > R.by.noisy.keyword.top1);
});
t('learned timers cut needless escalations and never breach the Charter', () => {
  const E = A.evalTimers(A.ROUTE_DEPTS, A.buildHistory(), { q: 0.8 });
  assert(E.needlessLearned < E.needlessFixed); assert.strictEqual(E.lateLearned, 0);
});
t('replay keeps old-department accuracy higher than naive fine-tuning', () => {
  const c = A.runContinual(11); assert(c.replay.old > c.naive.old);
});
t('federated model beats the average single-state model', () => {
  const f = A.runFederated(21); assert(f.federated > f.singleMean);
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
