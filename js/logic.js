'use strict';
/* Result Analyzer BD \u2014 pure logic (Node-testable, no DOM).
   Bangladesh SSC/HSC grading system (Education Board rules):
   marks -> grade point: 80+ A+ 5.00 | 70-79 A 4.00 | 60-69 A- 3.50 |
   50-59 B 3.00 | 40-49 C 2.00 | 33-39 D 1.00 | 0-32 F 0.00.
   GPA = (sum of grade points of compulsory subjects
          + max(0, 4th-subject GP - 2.00))
         / (number of compulsory subjects), capped at 5.00.
   Failing ANY compulsory subject fails the whole result (GPA 0.00 / F).
   Failing the 4th (optional) subject does NOT fail the result.
   "Golden A+" = A+ in every subject including the 4th (when present). */

const GRADE_BANDS = [
  { min: 80, grade: 'A+', point: 5.0 },
  { min: 70, grade: 'A', point: 4.0 },
  { min: 60, grade: 'A-', point: 3.5 },
  { min: 50, grade: 'B', point: 3.0 },
  { min: 40, grade: 'C', point: 2.0 },
  { min: 33, grade: 'D', point: 1.0 },
  { min: 0, grade: 'F', point: 0.0 },
];

const GROUP_PRESETS = {
  science: ['Bangla 1st Paper', 'Bangla 2nd Paper', 'English 1st Paper', 'English 2nd Paper', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'ICT', 'Religion', 'Bangladesh & Global Studies', 'Higher Mathematics'],
  commerce: ['Bangla 1st Paper', 'Bangla 2nd Paper', 'English 1st Paper', 'English 2nd Paper', 'Mathematics', 'Accounting', 'Business Entrepreneurship', 'Finance & Banking', 'ICT', 'Religion', 'Bangladesh & Global Studies', 'Agriculture Studies'],
  arts: ['Bangla 1st Paper', 'Bangla 2nd Paper', 'English 1st Paper', 'English 2nd Paper', 'Mathematics', 'History', 'Geography', 'Civics', 'Economics', 'ICT', 'Religion', 'Bangladesh & Global Studies', 'Logic'],
};

function gradeFor(marks) {
  if (typeof marks !== 'number' || !Number.isFinite(marks) || marks < 0 || marks > 100) return null;
  for (const b of GRADE_BANDS) if (marks >= b.min) return { grade: b.grade, point: b.point };
  return null; // unreachable
}

function gradeForGpa(gpa) {
  if (gpa === null || gpa === undefined) return 'F';
  if (gpa >= 5) return 'A+';
  if (gpa >= 4) return 'A';
  if (gpa >= 3.5) return 'A-';
  if (gpa >= 3) return 'B';
  if (gpa >= 2) return 'C';
  if (gpa >= 1) return 'D';
  return 'F';
}

// Round half away from zero to 2 decimals (JS Math.round rounds -x.5 toward +inf).
function round2(x) {
  const s = x < 0 ? -1 : 1;
  return s * Math.round(Math.abs(x) * 100) / 100;
}

function analyzeResult(subjects) {
  const list = Array.isArray(subjects) ? subjects : [];
  // Draft rows (marks === null, e.g. from a loaded preset) are excluded
  // from every computation until marks are entered.
  const entered = list.filter(s => typeof s.marks === 'number' && Number.isFinite(s.marks));
  const graded = entered.map(s => {
    const g = gradeFor(s.marks);
    return { id: s.id, name: s.name, marks: s.marks, isFourth: !!s.isFourth, grade: g ? g.grade : 'F', point: g ? g.point : 0 };
  });
  const compulsory = graded.filter(s => !s.isFourth);
  const fourth = graded.find(s => s.isFourth) || null;
  const totalMarks = round2(graded.reduce((a, s) => a + s.marks, 0));
  const average = graded.length ? round2(totalMarks / graded.length) : 0;
  const failedCompulsory = compulsory.filter(s => s.point === 0);
  const passed = compulsory.length > 0 && failedCompulsory.length === 0;
  let gpa = 0;
  if (passed) {
    const sum = compulsory.reduce((a, s) => a + s.point, 0);
    const excess = fourth ? Math.max(0, fourth.point - 2) : 0;
    gpa = Math.min(5, round2((sum + excess) / compulsory.length));
  }
  const golden = passed && graded.length > 0 && graded.every(s => s.grade === 'A+');
  const dist = {};
  for (const s of graded) dist[s.grade] = (dist[s.grade] || 0) + 1;
  return {
    subjects: graded, compulsoryCount: compulsory.length, fourth,
    totalMarks, average, passed, gpa: passed ? gpa : 0,
    gpaGrade: passed ? gradeForGpa(gpa) : 'F', golden,
    failedSubjects: failedCompulsory.map(s => s.name),
    gradeDist: dist, subjectCount: graded.length, totalRows: list.length,
  };
}

// What-if: replace one subject's marks, re-analyse. Returns {analysis, delta}.
function whatIf(subjects, subjectId, newMarks) {
  const copy = subjects.map(s => (s.id === subjectId ? { ...s, marks: newMarks } : { ...s }));
  const before = analyzeResult(subjects);
  const after = analyzeResult(copy);
  return { analysis: after, delta: round2(after.gpa - before.gpa) };
}

// Target GPA: with `remaining` more compulsory subjects still to be entered,
// what average grade point must they earn to reach `target` GPA?
// Returns {possible, neededAvgPoint, neededMarksBand, neededTotalPoint} or {possible:false, reason}.
function requiredForTarget(subjects, remaining, target) {
  const a = analyzeResult(subjects);
  const comp = a.subjects.filter(s => !s.isFourth);
  const fourthExcess = a.fourth ? Math.max(0, a.fourth.point - 2) : 0;
  const known = comp.reduce((x, s) => x + s.point, 0) + fourthExcess;
  const denom = comp.length + remaining;
  if (!Number.isInteger(remaining) || remaining < 1) return { possible: false, reason: 'remaining' };
  if (target < 0 || target > 5) return { possible: false, reason: 'target' };
  if (denom === 0) return { possible: false, reason: 'no-subjects' };
  const neededTotal = target * denom;
  const neededFromRemaining = neededTotal - known;
  const neededAvg = neededFromRemaining / remaining;
  if (neededAvg <= 0) return { possible: true, neededAvgPoint: 0, neededMarksBand: 'any', neededTotalPoint: round2(neededFromRemaining) };
  if (neededAvg > 5) return { possible: false, reason: 'impossible', neededAvgPoint: round2(neededAvg) };
  const band = [...GRADE_BANDS].reverse().find(b => neededAvg <= b.point) || GRADE_BANDS[GRADE_BANDS.length - 1];
  const bandMin = { 'A+': 80, A: 70, 'A-': 60, B: 50, C: 40, D: 33, F: 0 }[band.grade];
  return { possible: true, neededAvgPoint: round2(neededAvg), neededMarksBand: band.grade, neededMarksMin: bandMin, neededTotalPoint: round2(neededFromRemaining) };
}

function newId() {
  return 's' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36);
}

function validateSubject(name, marks, isFourth, existing) {
  const errors = [];
  const n = (name || '').trim();
  if (!n) errors.push('name');
  else if (n.length > 60) errors.push('name-long');
  if (marks === '' || marks === null || marks === undefined || Number.isNaN(Number(marks))) errors.push('marks');
  else {
    const m = Number(marks);
    if (m < 0 || m > 100) errors.push('marks-range');
    else if (!Number.isInteger(m * 100) || String(marks).includes('e')) errors.push('marks-format');
  }
  if (isFourth && existing && existing.some(s => s.isFourth)) errors.push('fourth-dup');
  return errors;
}

function validateSheet(sheet) {
  if (!sheet || typeof sheet !== 'object') return ['shape'];
  const errors = [];
  if (!sheet.id || typeof sheet.id !== 'string') errors.push('id');
  if (!sheet.name || typeof sheet.name !== 'string' || !sheet.name.trim() || sheet.name.length > 80) errors.push('name');
  if (!Array.isArray(sheet.subjects)) errors.push('subjects');
  else {
    const fourths = sheet.subjects.filter(s => s.isFourth).length;
    if (fourths > 1) errors.push('fourth-dup');
    for (const s of sheet.subjects) {
      if (!s.id || typeof s.id !== 'string') errors.push('subject-id');
      if (s.marks === null || s.marks === undefined) {
        // Draft row (preset): name still required, marks may be blank.
        if (!s.name || typeof s.name !== 'string' || !s.name.trim()) errors.push('subject:name');
      } else {
        const e = validateSubject(s.name, s.marks, false, []);
        if (e.length) errors.push('subject:' + e.join(','));
      }
    }
  }
  return errors;
}

const EXPORT_APP = 'result-analyzer-bd';
const EXPORT_VERSION = 1;
function validateImport(data) {
  if (!data || typeof data !== 'object') return ['shape'];
  if (data.app !== EXPORT_APP) return ['app'];
  if (data.version !== EXPORT_VERSION) return ['version'];
  if (!Array.isArray(data.sheets)) return ['sheets'];
  const ids = new Set();
  for (const sh of data.sheets) {
    const e = validateSheet(sh);
    if (e.length) return ['sheet:' + e.join(',')];
    if (ids.has(sh.id)) return ['dup-id'];
    ids.add(sh.id);
  }
  return [];
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { gradeFor, gradeForGpa, round2, analyzeResult, whatIf, requiredForTarget, newId, validateSubject, validateSheet, validateImport, GRADE_BANDS, GROUP_PRESETS, EXPORT_APP, EXPORT_VERSION };
}
