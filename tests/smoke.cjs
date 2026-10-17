'use strict';
/* Raw-CDP headless-Chrome smoke test. Run: node tests/smoke.cjs
   Exits non-zero on any failure. */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME = '/opt/meta-chromium/chrome';
const PORT = 9229;
const USER_DIR = '/tmp/ra-smoke-profile';
const FILE_URL = 'file://' + path.resolve(__dirname, '..', 'index.html');

let n = 0;
function check(name, cond, extra) {
  n++;
  if (!cond) { console.error('FAIL - ' + name + (extra ? ' | ' + extra : '')); process.exitCode = 1; throw new Error('smoke failed: ' + name); }
  console.log('ok - ' + name);
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  fs.rmSync(USER_DIR, { recursive: true, force: true });
  const chrome = spawn(CHROME, ['--headless=new', '--no-sandbox', '--disable-gpu', '--no-first-run', '--remote-debugging-port=' + PORT, '--user-data-dir=' + USER_DIR, 'about:blank'], { stdio: 'ignore' });
  const errors = [];
  let ws = null;
  try {
    let version;
    for (let i = 0; i < 50; i++) {
      try { version = await (await fetch('http://127.0.0.1:' + PORT + '/json/version')).json(); break; } catch (e) { await sleep(200); }
    }
    if (!version) throw new Error('chrome did not start');
    ws = new WebSocket(version.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    let seq = 0;
    const pending = new Map();       // browser-level responses by outer id
    const innerPending = new Map();  // target-level responses by inner id
    let sessionId = null;
    ws.onmessage = ev => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) { const p = pending.get(msg.id); pending.delete(msg.id); p(msg); return; }
      // Flat protocol: target events arrive directly with a sessionId.
      if (msg.method === 'Runtime.consoleAPICalled') {
        const args = (msg.params.args || []).map(a => a.value ?? a.description ?? '').join(' ');
        if (msg.params.type === 'error') errors.push('console.error: ' + args);
      }
      if (msg.method === 'Runtime.exceptionThrown') errors.push('exception: ' + (msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text));
    };
    function send(method, params) {
      return new Promise(resolve => { const id = ++seq; pending.set(id, resolve); ws.send(JSON.stringify({ id, method, params: params || {} })); });
    }
    let innerSeq = 0;
    function ev(method, params) {
      // Flat protocol (flatten:true): target commands go directly on the
      // browser socket with a top-level sessionId — NOT via sendMessageToTarget.
      return new Promise(resolve => {
        const id = ++seq;
        pending.set(id, resolve);
        ws.send(JSON.stringify({ id, method, params: params || {}, sessionId }));
      });
    }
    async function evaluate(expr) {
      const res = await ev('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      if (res.error) throw new Error('evaluate error: ' + JSON.stringify(res.error));
      const r = res.result;
      if (r && r.exceptionDetails) throw new Error('JS exception: ' + JSON.stringify(r.exceptionDetails.exception?.description || r.exceptionDetails.text));
      return r ? r.result?.value : undefined;
    }

    const created = await send('Target.createTarget', { url: FILE_URL });
    if (created.error) throw new Error('createTarget failed: ' + JSON.stringify(created.error));
    const targetId = created.result.targetId;
    const attached = await send('Target.attachToTarget', { targetId, flatten: true });
    if (attached.error) throw new Error('attach failed: ' + JSON.stringify(attached.error));
    sessionId = attached.result.sessionId;
    await ev('Runtime.enable', {});
    await ev('Page.enable', {});
    await sleep(800);

    // 1. basic render
    check('title', await evaluate(`document.title.includes('Result Analyzer')`));
    check('h1', await evaluate(`document.querySelector('h1').textContent === 'Result Analyzer BD'`));
    check('tabs present', await evaluate(`document.querySelectorAll('.tab').length === 3`));

    async function addSubject(name, marks, fourth) {
      await evaluate(`(function(){ document.getElementById('subName').value = ${JSON.stringify(name)}; document.getElementById('subMarks').value = ${JSON.stringify(String(marks))}; document.getElementById('subFourth').checked = ${!!fourth}; document.getElementById('addForm').dispatchEvent(new Event('submit', {bubbles:true, cancelable:true})); })()`);
      await sleep(150);
    }
    // 2. add Math 85 -> GPA 5.00 Passed
    await addSubject('Mathematics', 85, false);
    check('1 subject GPA 5.00', await evaluate(`document.getElementById('gpaVal').textContent === '5.00'`));
    check('status Passed', await evaluate(`document.getElementById('statusVal').textContent === 'Passed'`));
    check('total 85', await evaluate(`document.getElementById('totalVal').textContent === '85'`));
    // 3. add Physics 45 -> GPA (5+2)/2 = 3.50
    await addSubject('Physics', 45, false);
    check('2 subjects GPA 3.50', await evaluate(`document.getElementById('gpaVal').textContent === '3.50'`));
    check('grade A-', await evaluate(`document.getElementById('gpaGrade').textContent === 'A-'`));
    // 4. mark Physics as 4th -> compulsory Math 5.0, 4th excess 0 -> GPA 5.00
    await evaluate(`(function(){ const rows=[...document.querySelectorAll('#subjectBody tr')]; const row=rows.find(r=>r.cells[0].textContent==='Physics'); row.querySelector('input[type=checkbox]').click(); })()`);
    await sleep(200);
    check('4th subject: GPA back to 5.00', await evaluate(`document.getElementById('gpaVal').textContent === '5.00'`));
    check('4th badge shown', await evaluate(`document.querySelector('.fourth-badge') !== null`));
    // 5. what-if: Math -> 70 => compulsory 4.0, 4th excess 0 => GPA 4.00, delta -1.00
    await evaluate(`(function(){ const sel=document.getElementById('wiSubject'); sel.value=[...sel.options].find(o=>o.text.includes('Mathematics')).value; document.getElementById('wiMarks').value='70'; document.getElementById('wiBtn').click(); })()`);
    await sleep(200);
    check('what-if 70 -> GPA 4.00 delta -1.00', await evaluate(`document.getElementById('wiOut').textContent.includes('4.00') && document.getElementById('wiOut').textContent.includes('-1.00')`), await evaluate(`document.getElementById('wiOut').textContent`));
    check('what-if did not save (GPA still 5.00)', await evaluate(`document.getElementById('gpaVal').textContent === '5.00'`));
    // 6. target: GPA 5, 1 remaining -> need avg 5.0 -> at least 80 (A+)
    await evaluate(`(function(){ document.getElementById('tgTarget').value='5'; document.getElementById('tgRemaining').value='1'; document.getElementById('tgBtn').click(); })()`);
    await sleep(150);
    check('target needs 80 A+', await evaluate(`document.getElementById('tgOut').textContent.includes('80') && document.getElementById('tgOut').textContent.includes('A+')`), await evaluate(`document.getElementById('tgOut').textContent`));
    // 7. validation: empty name rejected
    await evaluate(`(function(){ document.getElementById('subName').value=''; document.getElementById('subMarks').value='90'; document.getElementById('addForm').dispatchEvent(new Event('submit', {bubbles:true, cancelable:true})); })()`);
    await sleep(150);
    check('empty name inline error', await evaluate(`!document.getElementById('addError').classList.contains('hidden')`));
    check('row count still 2', await evaluate(`document.querySelectorAll('#subjectBody tr').length === 2`));
    // 8. fail case: add Chemistry 20 (compulsory) -> whole result F
    await addSubject('Chemistry', 20, false);
    check('compulsory fail -> GPA 0.00', await evaluate(`document.getElementById('gpaVal').textContent === '0.00'`));
    check('status Failed', await evaluate(`document.getElementById('statusVal').textContent === 'Failed'`));
    check('fail note names Chemistry', await evaluate(`document.getElementById('failNote').textContent.includes('Chemistry')`));
    // 9. BN toggle: digits + labels
    await evaluate(`document.getElementById('langBtn').click()`);
    await sleep(200);
    check('BN toggle shows English button', await evaluate(`document.getElementById('langBtn').textContent === 'English'`));
    check('BN total digits 150 -> ১৫০', await evaluate(`document.getElementById('totalVal').textContent === '১৫০'`), await evaluate(`document.getElementById('totalVal').textContent`));
    check('BN h1', await evaluate(`document.querySelector('h1').textContent === 'ফলাফল বিশ্লেষক'`));
    // back to EN
    await evaluate(`document.getElementById('langBtn').click()`);
    await sleep(150);
    // 10. reload persistence
    await ev('Page.reload', {});
    for (let i = 0; i < 40; i++) { await sleep(100); if (await evaluate(`document.querySelectorAll('#subjectBody tr').length === 3`)) break; }
    check('reload keeps 3 subjects', await evaluate(`document.querySelectorAll('#subjectBody tr').length === 3`));
    check('reload keeps GPA 0.00', await evaluate(`document.getElementById('gpaVal').textContent === '0.00'`));
    // 11. preset load replaces subjects
    await evaluate(`(function(){ document.querySelector('[data-preset="science"]').click(); })()`);
    await sleep(200);
    check('science preset -> 12 rows', await evaluate(`document.querySelectorAll('#subjectBody tr').length === 12`));
    check('preset rows blank -> GPA dash', await evaluate(`document.getElementById('gpaVal').textContent === '—'`));
    // 12. import: paste JSON, import, verify sheet
    const imp = JSON.stringify({ app: 'result-analyzer-bd', version: 1, sheets: [{ id: 'imp1', name: 'SSC Mock', group: 'commerce', subjects: [{ id: 'a', name: 'Accounting', marks: 88, isFourth: false }, { id: 'b', name: 'Finance', marks: 76, isFourth: false }] }] });
    await evaluate(`(function(){ document.querySelector('[data-tab="data"]').click(); document.getElementById('importText').value = ${JSON.stringify(imp)}; document.getElementById('importBtn').click(); })()`);
    await sleep(250);
    check('import ok message', await evaluate(`document.getElementById('importMsg').textContent.includes('Imported')`), await evaluate(`document.getElementById('importMsg').textContent`));
    await evaluate(`document.querySelector('[data-tab="result"]').click()`);
    await sleep(150);
    check('imported sheet GPA (5+4)/2=4.50', await evaluate(`document.getElementById('gpaVal').textContent === '4.50'`), await evaluate(`document.getElementById('gpaVal').textContent`));
    // 13. malformed import rejected, data intact
    await evaluate(`(function(){ document.querySelector('[data-tab="data"]').click(); document.getElementById('importText').value='{"app":"wrong","version":1,"sheets":[]}'; document.getElementById('importBtn').click(); })()`);
    await sleep(200);
    check('bad import rejected', await evaluate(`document.getElementById('importMsg').textContent.includes('rejected')`));
    await evaluate(`document.querySelector('[data-tab="result"]').click()`);
    await sleep(150);
    check('data intact after bad import', await evaluate(`document.getElementById('gpaVal').textContent === '4.50'`));
    // 14. erase: wrong word then DELETE
    await evaluate(`(function(){ document.querySelector('[data-tab="data"]').click(); document.getElementById('eraseInput').value='nope'; document.getElementById('eraseBtn').click(); })()`);
    await sleep(150);
    check('erase wrong word blocked', await evaluate(`document.getElementById('eraseMsg').textContent.includes('DELETE')`));
    await evaluate(`(function(){ document.getElementById('eraseInput').value='DELETE'; document.getElementById('eraseBtn').click(); })()`);
    await sleep(250);
    check('erase ok', await evaluate(`document.getElementById('eraseMsg').textContent.includes('erased')`));
    await evaluate(`document.querySelector('[data-tab="result"]').click()`);
    await sleep(150);
    check('after erase: empty sheet', await evaluate(`document.querySelectorAll('#subjectBody tr').length === 0`));
    // 15. mobile 390px no horizontal overflow
    await ev('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await sleep(300);
    check('390px no horizontal overflow', await evaluate(`document.documentElement.scrollWidth <= 390`), 'scrollWidth=' + await evaluate(`document.documentElement.scrollWidth`));
    await ev('Emulation.clearDeviceMetricsOverride', {});
    // 16. zero console/page errors
    check('zero console/page errors', errors.length === 0, errors.join(' | '));
    console.log('ALL ' + n + ' smoke checks passed');
  } finally {
    try { if (ws) ws.close(); } catch (e) {}
    chrome.kill();
  }
}
main().catch(e => { console.error('SMOKE ERROR:', e.message); process.exit(1); });
