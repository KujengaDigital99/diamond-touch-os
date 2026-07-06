'use strict';
const chokidar = require('chokidar');
const path     = require('path');
const fs       = require('fs-extra');
const config   = require('./config');

function guardians() {
  return {
    NOMMO:  require('./guardians/nommo'),
    OYA:    require('./guardians/oya'),
    MAWU:   require('./guardians/mawu'),
    ESHU:   require('./guardians/eshu'),
    ANANSI: require('./guardians/anansi'),
    YEMOJA: require('./guardians/yemoja'),
    ELEGBA: require('./guardians/elegba'),
  };
}

// ── Path-based router ─────────────────────────────────────────────────────────
function route(filePath) {
  const rel = filePath.replace(/\\/g, '/');

  // STATE is output — never route back
  if (/\/Systems\/STATE\//.test(rel))       return { names: [], signals: [] };

  // Social content — voice check + channel review
  if (/\/Systems\/CONTENT\//.test(rel))
    return { names: ['NOMMO', 'ELEGBA'], signals: ['content_file'] };

  // Training materials — training ops + voice check
  if (/\/Systems\/TRAINING\//.test(rel)) {
    const signals = ['training_file'];
    if (/post-training|report|debrief/i.test(rel)) signals.push('report_file');
    if (/assessment|survey/i.test(rel))            signals.push('assessment_file');
    return { names: ['OYA', 'NOMMO'], signals };
  }

  // Coaching files — coaching ops
  if (/\/Systems\/COACHING\//.test(rel)) {
    const signals = ['coaching_file'];
    if (/session|notes|minutes/i.test(rel))     signals.push('session_file');
    if (/onboard|agreement|welcome/i.test(rel)) signals.push('onboard_file');
    if (/conclusion|final|close/i.test(rel))    signals.push('conclusion_file');
    return { names: ['MAWU'], signals };
  }

  // Pipeline — client intake and tracking
  if (/\/Systems\/PIPELINE\//.test(rel))
    return { names: ['ESHU'], signals: ['pipeline_file'] };

  // Proposals — proposal review + voice check
  if (/\/Systems\/PROPOSALS\//.test(rel))
    return { names: ['ANANSI', 'NOMMO'], signals: ['proposal_file'] };

  // Finance — financial intelligence
  if (/\/Systems\/FINANCE\//.test(rel))
    return { names: ['YEMOJA'], signals: ['finance_file'] };

  // Speakers — profile + booking tracking + voice check
  if (/\/Systems\/SPEAKERS\//.test(rel)) {
    const signals = ['speaker_file'];
    if (/booking|request|inquiry/i.test(rel)) signals.push('booking_file');
    return { names: ['ANANSI', 'ESHU', 'NOMMO'], signals };
  }

  // Anything else in Systems/
  if (/\/Systems\//.test(rel))
    return { names: ['NOMMO'], signals: [] };

  return { names: [], signals: [] };
}

// ── Batch accumulator ─────────────────────────────────────────────────────────
const batchAccum = new Map();
let batchTimer   = null;

async function flushBatch() {
  batchTimer = null;
  if (!batchAccum.size) return;
  const entries = [...batchAccum.entries()];
  batchAccum.clear();
  console.log(`[WATCHER] Batch flush — ${entries.length} file(s)`);
  for (const [fp, routing] of entries) {
    try { await dispatch(fp, routing); }
    catch (err) { console.error(`[WATCHER] ${fp}: ${err.message}`); }
  }
}

function scheduleFlush(fp, routing) {
  batchAccum.set(fp, routing);
  if (batchTimer) clearTimeout(batchTimer);
  batchTimer = setTimeout(flushBatch, config.watcher.batchQuietMs);
}

async function dispatch(filePath, { names, signals }) {
  if (!names.length) return;
  let content = '';
  try { content = fs.readFileSync(filePath, 'utf8'); } catch { return; }
  if (!content.trim()) return;

  const rel = filePath.replace(/\\/g, '/').split('/Systems/').pop() || filePath;
  const g   = guardians();
  const routingDecision = { signals };

  for (const name of names) {
    if (!g[name]) continue;
    console.log(`[WATCHER] → ${name}: ${rel}`);
    try { await g[name].run(filePath, content, routingDecision); }
    catch (err) { console.error(`[${name}] run error: ${err.message}`); }
  }
}

// ── File watcher ──────────────────────────────────────────────────────────────
function start() {
  const watchPath = config.systemsRoot;

  const IGNORE = [
    /[/\\]STATE[/\\]sessions[/\\]guardian-logs[/\\]/,
    /[/\\]\.git[/\\]/,
    /[/\\]node_modules[/\\]/,
    /~$/,
    /\.tmp$/,
  ];

  const watcher = chokidar.watch(watchPath, {
    ignored:        (p) => IGNORE.some(r => r.test(p)),
    persistent:     true,
    ignoreInitial:  true,
    awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 },
  });

  const handle = (event) => (filePath) => {
    if (!filePath.endsWith('.md') && !filePath.endsWith('.html')) return;
    const routing = route(filePath);
    if (!routing.names.length) return;
    const rel = filePath.replace(/\\/g, '/').split('/Systems/').pop() || filePath;
    console.log(`\n[WATCHER] ${event.toUpperCase()}: ${rel}`);
    scheduleFlush(filePath, routing);
  };

  watcher.on('add',    handle('add'));
  watcher.on('change', handle('change'));
  watcher.on('error',  (err) => console.error('[WATCHER] Error:', err.message));
  watcher.on('ready',  () => console.log(`[WATCHER] Watching ${watchPath}\n`));

  return watcher;
}

module.exports = { start };
