'use strict';
/* Result Analyzer BD \u2014 DOM app. Depends on js/logic.js (global scope when
   loaded in browser; logic.js also exports via module.exports for Node). */
(function () {
  const LS_KEY = 'result-analyzer-bd-v1';
  const $ = id => document.getElementById(id);

  const STR = {
    en: {
      appTitle: 'Result Analyzer BD', tagline: 'SSC / HSC GPA with the 4th-subject rule',
      tabResult: 'Result', tabSheets: 'Sheets', tabData: 'Data', sheet: 'Result sheet',
      gpa: 'GPA', status: 'Status', totalMarks: 'Total marks', average: 'Average',
      subjects: 'Subjects', colSubject: 'Subject', colMarks: 'Marks', colGrade: 'Grade',
      colPoint: 'Point', colFourth: '4th?', colAction: 'Action',
      subjectName: 'Subject name', marks: 'Marks (0\u2013100)', fourthSubject: '4th (optional) subject',
      addSubject: 'Add subject', loadPreset: 'Load subject preset:', science: 'Science',
      commerce: 'Commerce', arts: 'Arts',
      presetNote: 'Replaces subjects in this sheet; marks stay blank until you enter them.',
      whatIf: 'What-if simulator', wiPick: 'Subject', wiMarks: 'New marks (0\u2013100)',
      wiRun: 'Simulate', wiHint: 'Pick a subject and try different marks to see the GPA change \u2014 nothing is saved.',
      target: 'Target GPA planner', tgTarget: 'Target GPA (0\u20135)', tgRemaining: 'Subjects still to be entered',
      tgRun: 'Calculate', tgHint: 'Shows the average marks band your remaining subjects need.',
      howTitle: 'How GPA is calculated (BD board rules)',
      howBody: 'Marks map to grades: 80+ A+ (5.00), 70\u201379 A (4.00), 60\u201369 A\u2212 (3.50), 50\u201359 B (3.00), 40\u201349 C (2.00), 33\u201339 D (1.00), below 33 F (0). GPA = (sum of compulsory grade points + any 4th-subject points above 2.00) \u00f7 number of compulsory subjects, capped at 5.00. Failing any compulsory subject fails the whole result; failing the 4th subject does not. Golden A+ means A+ in every subject including the 4th.',
      sheetsTitle: 'Result sheets', sheetName: 'New sheet name', group: 'Group', other: 'Other',
      createSheet: 'Create sheet', dataTitle: 'Backup & restore', export: 'Export JSON',
      importFile: 'Import JSON file', importPaste: 'Or paste exported JSON', import: 'Import',
      eraseTitle: 'Erase everything', eraseHint: 'Type DELETE to erase all sheets and start over. This cannot be undone.',
      eraseLabel: 'Type DELETE', eraseBtn: 'Erase all data',
      footer1: 'Offline personal tool. Your data stays in this browser (localStorage). Not affiliated with any education board.',
      footer2: 'GPA rules follow the standard Bangladesh SSC/HSC board grading system. Verify official results with your board.',
      passed: 'Passed', failed: 'Failed', golden: '\u2605 Golden A+',
      entered: '{n} of {m} subjects have marks',
      failNote: 'Failed in: {list}',
      delete: 'Delete', open: 'Open', active: '(active)',
      wiOut: 'GPA {before} \u2192 {after} (change {delta})',
      tgNeed: 'Need an average of {point} points in each remaining subject \u2014 at least {min} marks ({band}).',
      tgImpossible: 'Not possible: even A+ in all remaining subjects cannot reach GPA {target}.',
      tgAny: 'Already on track \u2014 any marks in the remaining subjects keep GPA \u2265 {target}.',
      tgBad: 'Enter a target GPA 0\u20135 and a remaining count of 1\u201320.',
      importOk: 'Imported {n} sheet(s).',
      importBad: 'Import rejected: {reason}',
      importParse: 'Import rejected: not valid JSON.',
      eraseOk: 'All data erased.',
      eraseWrong: 'Type DELETE exactly to erase.',
      errName: 'Enter a subject name.',
      errNameLong: 'Subject name is too long (max 60).',
      errMarks: 'Enter marks 0\u2013100.',
      errMarksRange: 'Marks must be between 0 and 100.',
      errFourthDup: 'This sheet already has a 4th subject.',
      errSheetName: 'Enter a sheet name.',
      emptyNote: 'No subjects yet \u2014 add subjects above or load a preset.',
      noEntered: 'Enter marks for at least one subject to see the result.',
      distLabel: 'Grades: {dist}',
      confirmPreset: '',
      noSubjects: '\u2014',
    },
    bn: {
      appTitle: '\u09ab\u09b2\u09be\u09ab\u09b2 \u09ac\u09bf\u09b6\u09cd\u09b2\u09c7\u09b7\u0995', tagline: 'SSC / HSC GPA \u2014 \u09ea\u09b0\u09cd\u09a5 \u09ac\u09bf\u09b7\u09af\u09bc \u09a8\u09bf\u09af\u09bc\u09ae\u09b8\u09b9',
      tabResult: '\u09ab\u09b2\u09be\u09ab\u09b2', tabSheets: '\u09b6\u09bf\u099f\u09b8\u09ae\u09c2\u09b9', tabData: '\u09a1\u09c7\u099f\u09be', sheet: '\u09ab\u09b2\u09be\u09ab\u09b2 \u09b6\u09bf\u099f',
      gpa: 'GPA', status: '\u0985\u09ac\u09b8\u09cd\u09a5\u09be', totalMarks: '\u09ae\u09cb\u099f \u09a8\u09ae\u09cd\u09ac\u09b0', average: '\u0997\u09a1\u09bc',
      subjects: '\u09ac\u09bf\u09b7\u09af\u09bc\u09b8\u09ae\u09c2\u09b9', colSubject: '\u09ac\u09bf\u09b7\u09af\u09bc', colMarks: '\u09a8\u09ae\u09cd\u09ac\u09b0', colGrade: '\u0997\u09cd\u09b0\u09c7\u09a1',
      colPoint: '\u09aa\u09af\u09bc\u09c7\u09a8\u09cd\u099f', colFourth: '\u09ea\u09b0\u09cd\u09a5?', colAction: '\u0985\u09cd\u09af\u09be\u0995\u09b6\u09a8',
      subjectName: '\u09ac\u09bf\u09b7\u09af\u09bc\u09c7\u09b0 \u09a8\u09be\u09ae', marks: '\u09a8\u09ae\u09cd\u09ac\u09b0 (\u09e6\u2013\u09e7\u09e6\u09e6)', fourthSubject: '\u09ea\u09b0\u09cd\u09a5 (\u0990\u099a\u09cd\u099b\u09bf\u0995) \u09ac\u09bf\u09b7\u09af\u09bc',
      addSubject: '\u09ac\u09bf\u09b7\u09af\u09bc \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8', loadPreset: '\u09aa\u09cd\u09b0\u09bf\u09b8\u09c7\u099f \u09b2\u09cb\u09a1 \u0995\u09b0\u09c1\u09a8:', science: '\u09ac\u09bf\u099c\u09cd\u099e\u09be\u09a8',
      commerce: '\u09ac\u09be\u09a3\u09bf\u099c\u09cd\u09af', arts: '\u09ae\u09be\u09a8\u09ac\u09bf\u0995',
      presetNote: '\u098f\u0987 \u09b6\u09bf\u099f\u09c7\u09b0 \u09ac\u09bf\u09b7\u09af\u09bc\u0997\u09c1\u09b2\u09cb \u09ac\u09a6\u09b2\u09c7 \u09af\u09be\u09ac\u09c7; \u09a8\u09ae\u09cd\u09ac\u09b0 \u0996\u09be\u09b2\u09bf \u09a5\u09be\u0995\u09ac\u09c7 \u09af\u09a4\u0995\u09cd\u09b7\u09a3 \u09a8\u09be \u0986\u09aa\u09a8\u09bf \u09a6\u09c7\u09a8\u0964',
      whatIf: 'What-if \u09b8\u09bf\u09ae\u09c1\u09b2\u09c7\u099f\u09b0', wiPick: '\u09ac\u09bf\u09b7\u09af\u09bc', wiMarks: '\u09a8\u09a4\u09c1\u09a8 \u09a8\u09ae\u09cd\u09ac\u09b0 (\u09e6\u2013\u09e7\u09e6\u09e6)',
      wiRun: '\u09b8\u09bf\u09ae\u09c1\u09b2\u09c7\u099f \u0995\u09b0\u09c1\u09a8', wiHint: '\u098f\u0995\u099f\u09bf \u09ac\u09bf\u09b7\u09af\u09bc \u09ac\u09c7\u099b\u09c7 \u09a8\u09bf\u09af\u09bc\u09c7 \u09ad\u09bf\u09a8\u09cd\u09a8 \u09a8\u09ae\u09cd\u09ac\u09b0 \u099a\u09c7\u09b7\u09cd\u099f\u09be \u0995\u09b0\u09c1\u09a8 \u2014 \u0995\u09bf\u099b\u09c1\u0987 \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09bf\u09a4 \u09b9\u09ac\u09c7 \u09a8\u09be\u0964',
      target: '\u09b2\u0995\u09cd\u09b7\u09cd\u09af GPA \u09aa\u09b0\u09bf\u0995\u09b2\u09cd\u09aa\u09a8\u09be', tgTarget: '\u09b2\u0995\u09cd\u09b7\u09cd\u09af GPA (\u09e6\u2013\u09eb)', tgRemaining: '\u098f\u0996\u09a8\u09cb \u09ac\u09be\u0995\u09bf \u09ac\u09bf\u09b7\u09af\u09bc',
      tgRun: '\u09b9\u09bf\u09b8\u09be\u09ac \u0995\u09b0\u09c1\u09a8', tgHint: '\u09ac\u09be\u0995\u09bf \u09ac\u09bf\u09b7\u09af\u09bc\u0997\u09c1\u09b2\u09cb\u09a4\u09c7 \u0997\u09a1\u09bc\u09c7 \u0995\u09cb\u09a8 \u09a8\u09ae\u09cd\u09ac\u09b0-\u09ac\u09cd\u09af\u09be\u09a8\u09cd\u09a1 \u09b2\u09be\u0997\u09ac\u09c7 \u09a4\u09be \u09a6\u09c7\u0996\u09be\u09ac\u09c7\u0964',
      howTitle: 'GPA \u0995\u09c0\u09ad\u09be\u09ac\u09c7 \u09b9\u09bf\u09b8\u09be\u09ac \u09b9\u09af\u09bc (\u09ac\u09cb\u09b0\u09cd\u09a1 \u09a8\u09bf\u09af\u09bc\u09ae)',
      howBody: '\u09a8\u09ae\u09cd\u09ac\u09b0 \u09a5\u09c7\u0995\u09c7 \u0997\u09cd\u09b0\u09c7\u09a1: \u09ee\u09e6+ A+ (\u09eb.\u09e6\u09e6), \u09ed\u09e6\u2013\u09ed\u09ef A (\u09ea.\u09e6\u09e6), \u09ec\u09e6\u2013\u09ec\u09ef A\u2212 (\u09e9.\u09eb\u09e6), \u09eb\u09e6\u2013\u09eb\u09ef B (\u09e9.\u09e6\u09e6), \u09ea\u09e6\u2013\u09ea\u09ef C (\u09e8.\u09e6\u09e6), \u09e9\u09e9\u2013\u09e9\u09ef D (\u09e7.\u09e6\u09e6), \u09e9\u09e9-\u098f\u09b0 \u09a8\u09bf\u099a\u09c7 F (\u09e6)\u0964 GPA = (\u0986\u09ac\u09b6\u09cd\u09af\u09bf\u0995 \u09ac\u09bf\u09b7\u09af\u09bc\u0997\u09c1\u09b2\u09cb\u09b0 \u0997\u09cd\u09b0\u09c7\u09a1 \u09aa\u09af\u09bc\u09c7\u09a8\u09cd\u099f\u09c7\u09b0 \u09af\u09cb\u0997 + \u09ea\u09b0\u09cd\u09a5 \u09ac\u09bf\u09b7\u09af\u09bc\u09c7\u09b0 \u09e8.\u09e6\u09e6-\u098f\u09b0 \u0989\u09aa\u09b0\u09c7\u09b0 \u09aa\u09af\u09bc\u09c7\u09a8\u09cd\u099f) \u00f7 \u0986\u09ac\u09b6\u09cd\u09af\u09bf\u0995 \u09ac\u09bf\u09b7\u09af\u09bc\u09c7\u09b0 \u09b8\u0982\u0996\u09cd\u09af\u09be, \u09b8\u09b0\u09cd\u09ac\u09cb\u099a\u09cd\u099a \u09eb.\u09e6\u09e6\u0964 \u0995\u09cb\u09a8\u09cb \u0986\u09ac\u09b6\u09cd\u09af\u09bf\u0995 \u09ac\u09bf\u09b7\u09af\u09bc\u09c7 \u09ab\u09c7\u09b2 \u0995\u09b0\u09b2\u09c7 \u09aa\u09c1\u09b0\u09cb \u09ab\u09b2\u09be\u09ab\u09b2 \u09ab\u09c7\u09b2; \u09ea\u09b0\u09cd\u09a5 \u09ac\u09bf\u09b7\u09af\u09bc\u09c7 \u09ab\u09c7\u09b2 \u0995\u09b0\u09b2\u09c7 \u09ab\u09b2\u09be\u09ab\u09b2 \u09ab\u09c7\u09b2 \u09b9\u09af\u09bc \u09a8\u09be\u0964 \u0997\u09cb\u09b2\u09cd\u09a1\u09c7\u09a8 A+ \u09ae\u09be\u09a8\u09c7 \u09ea\u09b0\u09cd\u09a5 \u09ac\u09bf\u09b7\u09af\u09bc\u09b8\u09b9 \u09b8\u09ac \u09ac\u09bf\u09b7\u09af\u09bc\u09c7 A+\u0964',
      sheetsTitle: '\u09ab\u09b2\u09be\u09ab\u09b2 \u09b6\u09bf\u099f\u09b8\u09ae\u09c2\u09b9', sheetName: '\u09a8\u09a4\u09c1\u09a8 \u09b6\u09bf\u099f\u09c7\u09b0 \u09a8\u09be\u09ae', group: '\u0997\u09cd\u09b0\u09c1\u09aa', other: '\u0985\u09a8\u09cd\u09af\u09be\u09a8\u09cd\u09af',
      createSheet: '\u09b6\u09bf\u099f \u09a4\u09c8\u09b0\u09bf \u0995\u09b0\u09c1\u09a8', dataTitle: '\u09ac\u09cd\u09af\u09be\u0995\u0986\u09aa \u0993 \u09aa\u09c1\u09a8\u09b0\u09c1\u09a6\u09cd\u09a7\u09be\u09b0', export: 'JSON \u098f\u0995\u09cd\u09b8\u09aa\u09cb\u09b0\u09cd\u099f',
      importFile: 'JSON \u09ab\u09be\u0987\u09b2 \u0987\u09ae\u09cd\u09aa\u09cb\u09b0\u09cd\u099f', importPaste: '\u0985\u09a5\u09ac\u09be \u098f\u0995\u09cd\u09b8\u09aa\u09cb\u09b0\u09cd\u099f \u0995\u09b0\u09be JSON \u09aa\u09c7\u09b8\u09cd\u099f \u0995\u09b0\u09c1\u09a8', import: '\u0987\u09ae\u09cd\u09aa\u09cb\u09b0\u09cd\u099f',
      eraseTitle: '\u09b8\u09ac \u09ae\u09c1\u099b\u09c7 \u09ab\u09c7\u09b2\u09c1\u09a8', eraseHint: '\u09b8\u09ac \u09b6\u09bf\u099f \u09ae\u09c1\u099b\u09c7 \u09a8\u09a4\u09c1\u09a8 \u0995\u09b0\u09c7 \u09b6\u09c1\u09b0\u09c1 \u0995\u09b0\u09a4\u09c7 DELETE \u09b2\u09bf\u0996\u09c1\u09a8\u0964 \u098f\u099f\u09bf \u09ab\u09c7\u09b0\u09be\u09a8\u09cb \u09af\u09be\u09ac\u09c7 \u09a8\u09be\u0964',
      eraseLabel: 'DELETE \u09b2\u09bf\u0996\u09c1\u09a8', eraseBtn: '\u09b8\u09ac \u09a1\u09c7\u099f\u09be \u09ae\u09c1\u099b\u09c1\u09a8',
      footer1: '\u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u0985\u09ab\u09b2\u09be\u0987\u09a8 \u09ac\u09cd\u09af\u0995\u09cd\u09a4\u09bf\u0997\u09a4 \u099f\u09c1\u09b2\u0964 \u0986\u09aa\u09a8\u09be\u09b0 \u09a1\u09c7\u099f\u09be \u098f\u0987 \u09ac\u09cd\u09b0\u09be\u0989\u099c\u09be\u09b0\u09c7\u0987 \u09a5\u09be\u0995\u09c7 (localStorage)\u0964 \u0995\u09cb\u09a8\u09cb \u09b6\u09bf\u0995\u09cd\u09b7\u09be \u09ac\u09cb\u09b0\u09cd\u09a1\u09c7\u09b0 \u09b8\u09be\u09a5\u09c7 \u09b8\u0982\u09b6\u09cd\u09b2\u09bf\u09b7\u09cd\u099f \u09a8\u09af\u09bc\u0964',
      footer2: 'GPA \u09a8\u09bf\u09af\u09bc\u09ae \u09ac\u09be\u0982\u09b2\u09be\u09a6\u09c7\u09b6\u09c7\u09b0 SSC/HSC \u09ac\u09cb\u09b0\u09cd\u09a1\u09c7\u09b0 \u09aa\u09cd\u09b0\u099a\u09b2\u09bf\u09a4 \u0997\u09cd\u09b0\u09c7\u09a1\u09bf\u0982 \u09aa\u09a6\u09cd\u09a7\u09a4\u09bf \u0985\u09a8\u09c1\u09b8\u09b0\u09a3 \u0995\u09b0\u09c7\u0964 \u0985\u09ab\u09bf\u09b8\u09bf\u09af\u09bc\u09be\u09b2 \u09ab\u09b2\u09be\u09ab\u09b2 \u0986\u09aa\u09a8\u09be\u09b0 \u09ac\u09cb\u09b0\u09cd\u09a1 \u09a5\u09c7\u0995\u09c7 \u09af\u09be\u099a\u09be\u0987 \u0995\u09b0\u09c1\u09a8\u0964',
      passed: '\u09aa\u09be\u09b6', failed: '\u09ab\u09c7\u09b2', golden: '\u2605 \u0997\u09cb\u09b2\u09cd\u09a1\u09c7\u09a8 A+',
      entered: '{n} / {m}\u099f\u09bf \u09ac\u09bf\u09b7\u09af\u09bc\u09c7 \u09a8\u09ae\u09cd\u09ac\u09b0 \u09a6\u09c7\u0993\u09af\u09bc\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7',
      failNote: '\u09ab\u09c7\u09b2: {list}',
      delete: '\u09ae\u09c1\u099b\u09c1\u09a8', open: '\u0996\u09c1\u09b2\u09c1\u09a8', active: '(\u099a\u09b2\u09ae\u09be\u09a8)',
      wiOut: 'GPA {before} \u2192 {after} (\u09aa\u09b0\u09bf\u09ac\u09b0\u09cd\u09a4\u09a8 {delta})',
      tgNeed: '\u09ac\u09be\u0995\u09bf \u09aa\u09cd\u09b0\u09a4\u09bf\u099f\u09bf \u09ac\u09bf\u09b7\u09af\u09bc\u09c7 \u0997\u09a1\u09bc\u09c7 {point} \u09aa\u09af\u09bc\u09c7\u09a8\u09cd\u099f \u09b2\u09be\u0997\u09ac\u09c7 \u2014 \u0995\u09ae\u09aa\u0995\u09cd\u09b7\u09c7 {min} \u09a8\u09ae\u09cd\u09ac\u09b0 ({band})\u0964',
      tgImpossible: '\u09b8\u09ae\u09cd\u09ad\u09ac \u09a8\u09af\u09bc: \u09ac\u09be\u0995\u09bf \u09b8\u09ac \u09ac\u09bf\u09b7\u09af\u09bc\u09c7 A+ \u09aa\u09c7\u09b2\u09c7\u0993 GPA {target} \u09b9\u09ac\u09c7 \u09a8\u09be\u0964',
      tgAny: '\u0987\u09a4\u09bf\u09ae\u09a7\u09cd\u09af\u09c7\u0987 \u09b2\u0995\u09cd\u09b7\u09cd\u09af\u09c7 \u0986\u099b\u09c7\u09a8 \u2014 \u09ac\u09be\u0995\u09bf \u09ac\u09bf\u09b7\u09af\u09bc\u09c7 \u09af\u09c7\u0995\u09cb\u09a8\u09cb \u09a8\u09ae\u09cd\u09ac\u09b0\u09c7\u0987 GPA {target} \u09ac\u09be \u09a4\u09be\u09b0 \u09ac\u09c7\u09b6\u09bf \u09a5\u09be\u0995\u09ac\u09c7\u0964',
      tgBad: '\u09b2\u0995\u09cd\u09b7\u09cd\u09af GPA \u09e6\u2013\u09eb \u098f\u09ac\u0982 \u09ac\u09be\u0995\u09bf \u09ac\u09bf\u09b7\u09af\u09bc \u09e7\u2013\u09e8\u09e6 \u098f\u09b0 \u09ae\u09a7\u09cd\u09af\u09c7 \u09a6\u09bf\u09a8\u0964',
      importOk: '{n}\u099f\u09bf \u09b6\u09bf\u099f \u0987\u09ae\u09cd\u09aa\u09cb\u09b0\u09cd\u099f \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964',
      importBad: '\u0987\u09ae\u09cd\u09aa\u09cb\u09b0\u09cd\u099f \u09ac\u09be\u09a4\u09bf\u09b2: {reason}',
      importParse: '\u0987\u09ae\u09cd\u09aa\u09cb\u09b0\u09cd\u099f \u09ac\u09be\u09a4\u09bf\u09b2: \u09b8\u09a0\u09bf\u0995 JSON \u09a8\u09af\u09bc\u0964',
      eraseOk: '\u09b8\u09ac \u09a1\u09c7\u099f\u09be \u09ae\u09c1\u099b\u09c7 \u09ab\u09c7\u09b2\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964',
      eraseWrong: '\u09ae\u09c1\u099b\u09a4\u09c7 \u09b9\u09b2\u09c7 \u09a0\u09bf\u0995 DELETE \u09b2\u09bf\u0996\u09c1\u09a8\u0964',
      errName: '\u09ac\u09bf\u09b7\u09af\u09bc\u09c7\u09b0 \u09a8\u09be\u09ae \u09a6\u09bf\u09a8\u0964',
      errNameLong: '\u09ac\u09bf\u09b7\u09af\u09bc\u09c7\u09b0 \u09a8\u09be\u09ae \u0985\u09a8\u09c7\u0995 \u09b2\u09ae\u09cd\u09ac\u09be (\u09b8\u09b0\u09cd\u09ac\u09cb\u099a\u09cd\u099a \u09ec\u09e6)\u0964',
      errMarks: '\u09e6\u2013\u09e7\u09e6\u09e6 \u098f\u09b0 \u09ae\u09a7\u09cd\u09af\u09c7 \u09a8\u09ae\u09cd\u09ac\u09b0 \u09a6\u09bf\u09a8\u0964',
      errMarksRange: '\u09a8\u09ae\u09cd\u09ac\u09b0 \u09e6 \u09a5\u09c7\u0995\u09c7 \u09e7\u09e6\u09e6 \u098f\u09b0 \u09ae\u09a7\u09cd\u09af\u09c7 \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964',
      errFourthDup: '\u098f\u0987 \u09b6\u09bf\u099f\u09c7 \u0987\u09a4\u09bf\u09ae\u09a7\u09cd\u09af\u09c7 \u098f\u0995\u099f\u09bf \u09ea\u09b0\u09cd\u09a5 \u09ac\u09bf\u09b7\u09af\u09bc \u0986\u099b\u09c7\u0964',
      errSheetName: '\u09b6\u09bf\u099f\u09c7\u09b0 \u09a8\u09be\u09ae \u09a6\u09bf\u09a8\u0964',
      emptyNote: '\u098f\u0996\u09a8\u09cb \u0995\u09cb\u09a8\u09cb \u09ac\u09bf\u09b7\u09af\u09bc \u09a8\u09c7\u0987 \u2014 \u0989\u09aa\u09b0\u09c7 \u09ac\u09bf\u09b7\u09af\u09bc \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8 \u09ac\u09be \u09aa\u09cd\u09b0\u09bf\u09b8\u09c7\u099f \u09b2\u09cb\u09a1 \u0995\u09b0\u09c1\u09a8\u0964',
      noEntered: '\u09ab\u09b2\u09be\u09ab\u09b2 \u09a6\u09c7\u0996\u09a4\u09c7 \u0985\u09a8\u09cd\u09a4\u09a4 \u098f\u0995\u099f\u09bf \u09ac\u09bf\u09b7\u09af\u09bc\u09c7 \u09a8\u09ae\u09cd\u09ac\u09b0 \u09a6\u09bf\u09a8\u0964',
      distLabel: '\u0997\u09cd\u09b0\u09c7\u09a1: {dist}',
      confirmPreset: '',
      noSubjects: '\u2014',
    },
  };

  const BN_DIGITS = { 0: '\u09e6', 1: '\u09e7', 2: '\u09e8', 3: '\u09e9', 4: '\u09ea', 5: '\u09eb', 6: '\u09ec', 7: '\u09ed', 8: '\u09ee', 9: '\u09ef' };
  let state = load();

  function t(key, vars) {
    let s = (STR[state.lang] && STR[state.lang][key]) || STR.en[key] || key;
    if (vars) for (const k of Object.keys(vars)) s = s.split('{' + k + '}').join(String(vars[k]));
    return s;
  }
  function locNum(x) {
    let s = String(x);
    if (state.lang === 'bn') s = s.replace(/[0-9]/g, d => BN_DIGITS[d]);
    return s;
  }
  function fmt(n, dec) {
    if (n === null || n === undefined || Number.isNaN(n)) return t('noSubjects');
    const v = dec === 2 ? round2(n).toFixed(2) : String(round2(n));
    return locNum(v);
  }

  function defaultState() {
    return { lang: 'en', activeId: 's1', sheets: [{ id: 's1', name: 'My Result', group: 'science', subjects: [] }] };
  }
  function load() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return defaultState();
      const d = JSON.parse(raw);
      if (!d || !Array.isArray(d.sheets) || !d.sheets.length) return defaultState();
      const sheets = d.sheets.filter(s => validateSheet(s).length === 0);
      if (!sheets.length) return defaultState();
      return { lang: d.lang === 'bn' ? 'bn' : 'en', activeId: sheets.some(s => s.id === d.activeId) ? d.activeId : sheets[0].id, sheets };
    } catch (e) { return defaultState(); }
  }
  function save() { try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {} }
  function activeSheet() { return state.sheets.find(s => s.id === state.activeId) || state.sheets[0]; }
  function enteredSubjects(sheet) { return sheet.subjects.filter(s => typeof s.marks === 'number' && Number.isFinite(s.marks)); }

  function applyLang() {
    document.documentElement.lang = state.lang === 'bn' ? 'bn' : 'en';
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.getAttribute('data-i18n')); });
    $('langBtn').textContent = state.lang === 'bn' ? 'English' : '\u09ac\u09be\u0982\u09b2\u09be';
    $('subName').placeholder = state.lang === 'bn' ? '\u09af\u09c7\u09ae\u09a8: \u0997\u09a3\u09bf\u09a4' : 'e.g. Mathematics';
    $('sheetName').placeholder = state.lang === 'bn' ? '\u09af\u09c7\u09ae\u09a8: SSC \u099f\u09c7\u09b8\u09cd\u099f \u09aa\u09b0\u09c0\u0995\u09cd\u09b7\u09be' : 'e.g. SSC Test Exam';
  }

  function render() {
    applyLang();
    const sheet = activeSheet();
    // sheet select
    const sel = $('sheetSelect');
    sel.innerHTML = '';
    for (const s of state.sheets) {
      const o = document.createElement('option');
      o.value = s.id; o.textContent = s.name; o.selected = s.id === sheet.id;
      sel.appendChild(o);
    }
    $('groupBadge').textContent = t(sheet.group === 'other' ? 'other' : sheet.group) || sheet.group;

    // summary
    const a = analyzeResult(sheet.subjects);
    const entered = a.subjectCount;
    if (entered === 0) {
      $('gpaVal').textContent = '\u2014'; $('gpaGrade').textContent = t('noEntered');
      $('statusVal').textContent = '\u2014'; $('statusVal').className = 'card-value';
      $('goldenVal').textContent = '';
      $('totalVal').textContent = '\u2014'; $('avgVal').textContent = '\u2014';
      $('enteredVal').textContent = sheet.subjects.length ? t('entered', { n: locNum(0), m: locNum(sheet.subjects.length) }) : '';
      $('distVal').textContent = '';
      $('failNote').classList.add('hidden');
    } else {
      $('gpaVal').textContent = fmt(a.gpa, 2);
      $('gpaGrade').textContent = a.gpaGrade;
      $('statusVal').textContent = a.passed ? t('passed') : t('failed');
      $('statusVal').className = 'card-value ' + (a.passed ? 'pass' : 'fail');
      $('goldenVal').textContent = a.golden ? t('golden') : '';
      $('totalVal').textContent = fmt(a.totalMarks);
      $('avgVal').textContent = fmt(a.average, 2);
      $('enteredVal').textContent = t('entered', { n: locNum(entered), m: locNum(sheet.subjects.length) });
      const dist = Object.keys(a.gradeDist).sort().map(g => g + ' \u00d7' + locNum(a.gradeDist[g])).join(' \u00b7 ');
      $('distVal').textContent = t('distLabel', { dist });
      if (!a.passed) {
        $('failNote').textContent = t('failNote', { list: a.failedSubjects.join(', ') });
        $('failNote').classList.remove('hidden');
      } else $('failNote').classList.add('hidden');
    }
    $('emptyNote').textContent = sheet.subjects.length === 0 ? t('emptyNote') : '';

    // table
    const body = $('subjectBody');
    body.innerHTML = '';
    for (const s of sheet.subjects) {
      const tr = document.createElement('tr');
      const g = typeof s.marks === 'number' ? gradeFor(s.marks) : null;
      const tdName = document.createElement('td'); tdName.textContent = s.name;
      const tdMarks = document.createElement('td');
      const inp = document.createElement('input');
      inp.type = 'number'; inp.min = 0; inp.max = 100; inp.step = '0.01';
      inp.className = 'marks-input'; inp.setAttribute('aria-label', s.name);
      if (typeof s.marks === 'number') inp.value = s.marks;
      inp.addEventListener('change', () => onMarksEdit(s.id, inp));
      tdMarks.appendChild(inp);
      const tdGrade = document.createElement('td'); tdGrade.textContent = g ? g.grade : '\u2014';
      const tdPoint = document.createElement('td'); tdPoint.textContent = g ? fmt(g.point, 2) : '\u2014';
      const tdFourth = document.createElement('td');
      const cb = document.createElement('input');
      cb.type = 'checkbox'; cb.checked = !!s.isFourth; cb.setAttribute('aria-label', t('fourthSubject'));
      cb.addEventListener('change', () => onFourthToggle(s.id, cb.checked));
      tdFourth.appendChild(cb);
      if (s.isFourth) { const b = document.createElement('span'); b.className = 'fourth-badge'; b.textContent = '4th'; tdFourth.appendChild(b); }
      const tdAct = document.createElement('td');
      const del = document.createElement('button');
      del.className = 'btn btn-small'; del.type = 'button'; del.textContent = t('delete');
      del.addEventListener('click', () => { sheet.subjects = sheet.subjects.filter(x => x.id !== s.id); save(); render(); });
      tdAct.appendChild(del);
      tr.append(tdName, tdMarks, tdGrade, tdPoint, tdFourth, tdAct);
      body.appendChild(tr);
    }

    // what-if select
    const wi = $('wiSubject');
    wi.innerHTML = '';
    for (const s of enteredSubjects(sheet)) {
      const o = document.createElement('option');
      o.value = s.id; o.textContent = s.name + ' (' + fmt(s.marks) + ')';
      wi.appendChild(o);
    }

    // sheets list
    const list = $('sheetList');
    list.innerHTML = '';
    for (const s of state.sheets) {
      const li = document.createElement('li');
      if (s.id === sheet.id) li.className = 'active-sheet';
      const span = document.createElement('span');
      span.textContent = s.name + ' (' + locNum(s.subjects.length) + ' ' + t('subjects').toLowerCase() + ')' + (s.id === sheet.id ? ' ' + t('active') : '');
      const btns = document.createElement('span');
      const open = document.createElement('button');
      open.className = 'btn btn-small'; open.type = 'button'; open.textContent = t('open');
      open.addEventListener('click', () => { state.activeId = s.id; save(); render(); switchTab('result'); });
      const del = document.createElement('button');
      del.className = 'btn btn-small'; del.type = 'button'; del.textContent = t('delete');
      del.addEventListener('click', () => {
        state.sheets = state.sheets.filter(x => x.id !== s.id);
        if (!state.sheets.length) state.sheets = [defaultState().sheets[0]];
        if (state.activeId === s.id) state.activeId = state.sheets[0].id;
        save(); render();
      });
      btns.append(open, del);
      li.append(span, btns);
      list.appendChild(li);
    }
  }

  function onMarksEdit(id, inp) {
    const sheet = activeSheet();
    const s = sheet.subjects.find(x => x.id === id);
    if (!s) return;
    const raw = inp.value.trim();
    if (raw === '') { s.marks = null; inp.classList.remove('invalid'); save(); render(); return; }
    const v = Number(raw);
    if (!Number.isFinite(v) || v < 0 || v > 100) { inp.classList.add('invalid'); return; }
    s.marks = v; inp.classList.remove('invalid'); save(); render();
  }
  function onFourthToggle(id, checked) {
    const sheet = activeSheet();
    if (checked) for (const x of sheet.subjects) x.isFourth = (x.id === id);
    else { const s = sheet.subjects.find(x => x.id === id); if (s) s.isFourth = false; }
    save(); render();
  }

  function switchTab(name) {
    document.querySelectorAll('.tab').forEach(b => {
      const on = b.getAttribute('data-tab') === name;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    document.querySelectorAll('main .panel').forEach(p => p.classList.add('hidden'));
    $('tab-' + name).classList.remove('hidden');
  }

  // --- events ---
  document.querySelectorAll('.tab').forEach(b => b.addEventListener('click', () => switchTab(b.getAttribute('data-tab'))));
  $('langBtn').addEventListener('click', () => { state.lang = state.lang === 'bn' ? 'en' : 'bn'; save(); render(); });
  $('sheetSelect').addEventListener('change', e => { state.activeId = e.target.value; save(); render(); });

  $('addForm').addEventListener('submit', e => {
    e.preventDefault();
    const sheet = activeSheet();
    const name = $('subName').value.trim();
    const marksRaw = $('subMarks').value.trim();
    const isFourth = $('subFourth').checked;
    const errors = validateSubject(name, marksRaw === '' ? '' : Number(marksRaw), isFourth, sheet.subjects);
    const errEl = $('addError');
    if (errors.length) {
      const map = { name: 'errName', 'name-long': 'errNameLong', marks: 'errMarks', 'marks-range': 'errMarksRange', 'fourth-dup': 'errFourthDup' };
      errEl.textContent = t(map[errors[0]] || 'errMarks');
      errEl.classList.remove('hidden');
      return;
    }
    errEl.classList.add('hidden');
    sheet.subjects.push({ id: newId(), name, marks: Number(marksRaw), isFourth });
    $('subName').value = ''; $('subMarks').value = ''; $('subFourth').checked = false;
    save(); render();
  });

  document.querySelectorAll('[data-preset]').forEach(btn => btn.addEventListener('click', () => {
    const sheet = activeSheet();
    const preset = GROUP_PRESETS[btn.getAttribute('data-preset')] || [];
    sheet.subjects = preset.map(n => ({ id: newId(), name: n, marks: null, isFourth: false }));
    save(); render();
  }));

  $('wiBtn').addEventListener('click', () => {
    const sheet = activeSheet();
    const id = $('wiSubject').value;
    const raw = $('wiMarks').value.trim();
    const out = $('wiOut');
    if (!id || raw === '') { out.textContent = t('wiHint'); return; }
    const v = Number(raw);
    if (!Number.isFinite(v) || v < 0 || v > 100) { out.textContent = t('errMarksRange'); return; }
    const w = whatIf(enteredSubjects(sheet), id, v);
    const before = analyzeResult(enteredSubjects(sheet));
    out.textContent = t('wiOut', { before: fmt(before.gpa, 2), after: fmt(w.analysis.gpa, 2), delta: (w.delta >= 0 ? '+' : '') + fmt(w.delta, 2) });
  });

  $('tgBtn').addEventListener('click', () => {
    const sheet = activeSheet();
    const target = Number($('tgTarget').value);
    const remaining = Number($('tgRemaining').value);
    const out = $('tgOut');
    if (!Number.isFinite(target) || target < 0 || target > 5 || !Number.isInteger(remaining) || remaining < 1 || remaining > 20) {
      out.textContent = t('tgBad'); return;
    }
    const r = requiredForTarget(enteredSubjects(sheet), remaining, target);
    if (!r.possible) { out.textContent = t('tgImpossible', { target: fmt(target, 2) }); return; }
    if (r.neededMarksBand === 'any') { out.textContent = t('tgAny', { target: fmt(target, 2) }); return; }
    out.textContent = t('tgNeed', { point: fmt(r.neededAvgPoint, 2), min: locNum(r.neededMarksMin), band: r.neededMarksBand });
  });

  $('newSheetForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('sheetName').value.trim();
    const errEl = $('sheetError');
    if (!name) { errEl.textContent = t('errSheetName'); errEl.classList.remove('hidden'); return; }
    errEl.classList.add('hidden');
    const s = { id: newId(), name, group: $('sheetGroup').value, subjects: [] };
    state.sheets.push(s);
    state.activeId = s.id;
    $('sheetName').value = '';
    save(); render(); switchTab('result');
  });

  $('exportBtn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({ app: EXPORT_APP, version: EXPORT_VERSION, sheets: state.sheets }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'result-analyzer-bd.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  function doImport(data) {
    const msg = $('importMsg');
    let parsed = data;
    if (typeof data === 'string') {
      try { parsed = JSON.parse(data); } catch (e) { msg.textContent = t('importParse'); return; }
    }
    const errors = validateImport(parsed);
    if (errors.length) { msg.textContent = t('importBad', { reason: errors[0] }); return; }
    state.sheets = parsed.sheets;
    state.activeId = state.sheets[0].id;
    save(); render();
    msg.textContent = t('importOk', { n: locNum(state.sheets.length) });
  }
  $('importBtn').addEventListener('click', () => doImport($('importText').value));
  $('importFile').addEventListener('change', e => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => doImport(String(r.result));
    r.readAsText(f);
  });

  $('eraseBtn').addEventListener('click', () => {
    const msg = $('eraseMsg');
    if ($('eraseInput').value !== 'DELETE') { msg.textContent = t('eraseWrong'); return; }
    state = defaultState();
    $('eraseInput').value = '';
    try { localStorage.removeItem(LS_KEY); } catch (e) {}
    save(); render();
    msg.textContent = t('eraseOk');
  });

  render();
})();
