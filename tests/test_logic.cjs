'use strict';
/* Node unit tests for result-analyzer-bd logic. Run: node tests/test_logic.mjs */
const assert = require('assert');
const L = require('../js/logic.js');

let n = 0;
function check(name, fn) { fn(); n++; console.log('ok - ' + name); }

// --- grade bands ---
check('grade bands boundaries', () => {
  assert.deepStrictEqual(L.gradeFor(100), { grade: 'A+', point: 5 });
  assert.deepStrictEqual(L.gradeFor(80), { grade: 'A+', point: 5 });
  assert.deepStrictEqual(L.gradeFor(79.99), { grade: 'A', point: 4 });
  assert.deepStrictEqual(L.gradeFor(70), { grade: 'A', point: 4 });
  assert.deepStrictEqual(L.gradeFor(69.99), { grade: 'A-', point: 3.5 });
  assert.deepStrictEqual(L.gradeFor(60), { grade: 'A-', point: 3.5 });
  assert.deepStrictEqual(L.gradeFor(59.99), { grade: 'B', point: 3 });
  assert.deepStrictEqual(L.gradeFor(50), { grade: 'B', point: 3 });
  assert.deepStrictEqual(L.gradeFor(49.99), { grade: 'C', point: 2 });
  assert.deepStrictEqual(L.gradeFor(40), { grade: 'C', point: 2 });
  assert.deepStrictEqual(L.gradeFor(39.99), { grade: 'D', point: 1 });
  assert.deepStrictEqual(L.gradeFor(33), { grade: 'D', point: 1 });
  assert.deepStrictEqual(L.gradeFor(32.99), { grade: 'F', point: 0 });
  assert.deepStrictEqual(L.gradeFor(0), { grade: 'F', point: 0 });
  assert.strictEqual(L.gradeFor(-1), null);
  assert.strictEqual(L.gradeFor(101), null);
  assert.strictEqual(L.gradeFor(NaN), null);
});

// --- GPA math: classic SSC scenario ---
// 7 compulsory: 5.0,5.0,4.0,4.0,3.5,3.0,2.0 = 26.5 ; 4th subject A (4.0) -> excess 2.0
// GPA = (26.5 + 2.0) / 7 = 4.0714 -> 4.07
check('GPA with 4th subject excess', () => {
  const subs = [
    { id: '1', name: 'Bangla', marks: 85 },
    { id: '2', name: 'English', marks: 82 },
    { id: '3', name: 'Math', marks: 75 },
    { id: '4', name: 'Physics', marks: 72 },
    { id: '5', name: 'Chemistry', marks: 65 },
    { id: '6', name: 'Biology', marks: 55 },
    { id: '7', name: 'ICT', marks: 45 },
    { id: '8', name: 'Higher Math', marks: 78, isFourth: true },
  ];
  const a = L.analyzeResult(subs);
  assert.strictEqual(a.passed, true);
  assert.strictEqual(a.gpa, 4.07);
  assert.strictEqual(a.gpaGrade, 'A');
  assert.strictEqual(a.totalMarks, 557);
  assert.strictEqual(a.average, 69.63);
  assert.strictEqual(a.golden, false);
});

check('GPA without 4th subject', () => {
  const subs = [
    { id: '1', name: 'A', marks: 90 },
    { id: '2', name: 'B', marks: 90 },
  ];
  const a = L.analyzeResult(subs);
  assert.strictEqual(a.gpa, 5);
  assert.strictEqual(a.golden, true);
});

check('4th subject C (2.0) adds zero excess', () => {
  const subs = [
    { id: '1', name: 'A', marks: 90 },
    { id: '2', name: 'B', marks: 90 },
    { id: '3', name: 'Opt', marks: 45, isFourth: true },
  ];
  const a = L.analyzeResult(subs);
  assert.strictEqual(a.gpa, 5);
  assert.strictEqual(a.passed, true);
});

check('GPA capped at 5.00', () => {
  const subs = [
    { id: '1', name: 'A', marks: 90 },
    { id: '2', name: 'B', marks: 90 },
    { id: '3', name: 'Opt', marks: 95, isFourth: true },
  ];
  const a = L.analyzeResult(subs);
  assert.strictEqual(a.gpa, 5);
});

check('compulsory fail -> whole result F, GPA 0', () => {
  const subs = [
    { id: '1', name: 'A', marks: 90 },
    { id: '2', name: 'B', marks: 20 },
    { id: '3', name: 'Opt', marks: 95, isFourth: true },
  ];
  const a = L.analyzeResult(subs);
  assert.strictEqual(a.passed, false);
  assert.strictEqual(a.gpa, 0);
  assert.strictEqual(a.gpaGrade, 'F');
  assert.deepStrictEqual(a.failedSubjects, ['B']);
  assert.strictEqual(a.golden, false);
});

check('4th subject fail does NOT fail result', () => {
  const subs = [
    { id: '1', name: 'A', marks: 90 },
    { id: '2', name: 'B', marks: 80 },
    { id: '3', name: 'Opt', marks: 10, isFourth: true },
  ];
  const a = L.analyzeResult(subs);
  assert.strictEqual(a.passed, true);
  assert.strictEqual(a.gpa, 5);
  assert.strictEqual(a.golden, false); // 4th is F, not A+
});

check('golden A+ requires all A+ including 4th', () => {
  const subs = [
    { id: '1', name: 'A', marks: 80 },
    { id: '2', name: 'Opt', marks: 80, isFourth: true },
  ];
  assert.strictEqual(L.analyzeResult(subs).golden, true);
});

check('empty subjects -> not passed, gpa 0', () => {
  const a = L.analyzeResult([]);
  assert.strictEqual(a.passed, false);
  assert.strictEqual(a.gpa, 0);
  assert.strictEqual(a.totalMarks, 0);
  assert.strictEqual(a.average, 0);
});

check('grade distribution counts', () => {
  const subs = [
    { id: '1', name: 'A', marks: 90 },
    { id: '2', name: 'B', marks: 75 },
    { id: '3', name: 'C', marks: 75 },
    { id: '4', name: 'D', marks: 20 },
  ];
  const a = L.analyzeResult(subs);
  assert.deepStrictEqual(a.gradeDist, { 'A+': 1, A: 2, F: 1 });
});

// --- what-if ---
check('what-if delta', () => {
  const subs = [
    { id: '1', name: 'A', marks: 90 },
    { id: '2', name: 'B', marks: 65 },
  ];
  const w = L.whatIf(subs, '2', 85);
  assert.strictEqual(w.analysis.gpa, 5);
  assert.strictEqual(w.delta, 0.75); // (5+3.5)/2=4.25 -> (5+5)/2=5
});

// --- target GPA ---
check('target GPA: reachable', () => {
  const subs = [{ id: '1', name: 'A', marks: 90 }]; // GP 5, 1 compulsory
  const r = L.requiredForTarget(subs, 1, 4.5);
  assert.strictEqual(r.possible, true);
  assert.strictEqual(r.neededAvgPoint, 4); // (5 + x)/2 = 4.5 -> x = 4
  assert.strictEqual(r.neededMarksBand, 'A');
  assert.strictEqual(r.neededMarksMin, 70);
});
check('target GPA: impossible', () => {
  const subs = [{ id: '1', name: 'A', marks: 40 }]; // GP 2
  const r = L.requiredForTarget(subs, 1, 5);
  assert.strictEqual(r.possible, false);
  assert.strictEqual(r.reason, 'impossible');
});
check('target GPA: already met', () => {
  const subs = [{ id: '1', name: 'A', marks: 95 }];
  const r = L.requiredForTarget(subs, 1, 2);
  assert.strictEqual(r.possible, true);
  assert.strictEqual(r.neededMarksBand, 'any');
});
check('target GPA: needs exactly B average', () => {
  const subs = [{ id: '1', name: 'A', marks: 95 }];
  const r = L.requiredForTarget(subs, 1, 4);
  assert.strictEqual(r.possible, true);
  assert.strictEqual(r.neededAvgPoint, 3);
  assert.strictEqual(r.neededMarksBand, 'B');
  assert.strictEqual(r.neededMarksMin, 50);
});
check('target GPA: bad args', () => {
  assert.strictEqual(L.requiredForTarget([], 0, 4).possible, false);
  assert.strictEqual(L.requiredForTarget([], 1, 6).possible, false);
});

// --- validation ---
check('validateSubject', () => {
  assert.deepStrictEqual(L.validateSubject('Math', 85, false, []), []);
  assert.deepStrictEqual(L.validateSubject('', 85, false, []), ['name']);
  assert.deepStrictEqual(L.validateSubject('Math', 101, false, []), ['marks-range']);
  assert.deepStrictEqual(L.validateSubject('Math', -1, false, []), ['marks-range']);
  assert.deepStrictEqual(L.validateSubject('Math', 'abc', false, []), ['marks']);
  assert.deepStrictEqual(L.validateSubject('Math', 85, true, [{ isFourth: true }]), ['fourth-dup']);
  assert.deepStrictEqual(L.validateSubject('x'.repeat(61), 85, false, []), ['name-long']);
});
check('validateSheet + validateImport', () => {
  const good = { app: 'result-analyzer-bd', version: 1, sheets: [{ id: 'a', name: 'SSC', subjects: [{ id: '1', name: 'Math', marks: 80, isFourth: false }] }] };
  assert.deepStrictEqual(L.validateImport(good), []);
  assert.deepStrictEqual(L.validateImport({ app: 'other', version: 1, sheets: [] }), ['app']);
  assert.deepStrictEqual(L.validateImport({ app: 'result-analyzer-bd', version: 2, sheets: [] }), ['version']);
  assert.deepStrictEqual(L.validateImport({ app: 'result-analyzer-bd', version: 1, sheets: [{ id: 'a', name: 'X', subjects: [{ id: '1', name: 'A', marks: 80, isFourth: true }, { id: '2', name: 'B', marks: 80, isFourth: true }] }] }), ['sheet:fourth-dup']);
  assert.deepStrictEqual(L.validateImport({ app: 'result-analyzer-bd', version: 1, sheets: [{ id: 'a', name: 'X', subjects: [] }, { id: 'a', name: 'Y', subjects: [] }] }), ['dup-id']);
  assert.deepStrictEqual(L.validateImport(null), ['shape']);
});

check('draft rows (marks null) excluded from GPA', () => {
  const subs = [
    { id: '1', name: 'A', marks: 90 },
    { id: '2', name: 'B', marks: null },
    { id: '3', name: 'C', marks: undefined },
  ];
  const a = L.analyzeResult(subs);
  assert.strictEqual(a.gpa, 5);
  assert.strictEqual(a.subjectCount, 1);
  assert.strictEqual(a.totalRows, 3);
  assert.strictEqual(a.totalMarks, 90);
});
check('validateSheet accepts draft rows', () => {
  const sh = { id: 'a', name: 'X', subjects: [{ id: '1', name: 'A', marks: null, isFourth: false }] };
  assert.deepStrictEqual(L.validateSheet(sh), []);
});
check('round2 half away from zero', () => {
  assert.strictEqual(L.round2(2.345), 2.35);
  assert.strictEqual(L.round2(-2.345), -2.35);
});

console.log('ALL ' + n + ' unit test blocks passed');
