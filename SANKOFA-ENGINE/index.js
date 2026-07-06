require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const path   = require('path');
const fs     = require('fs-extra');
const config = require('./config');

// ── PID lockfile ──────────────────────────────────────────────────────────────
const LOCK = path.join(__dirname, '.sankofa.lock');

function acquireLock() {
  if (fs.existsSync(LOCK)) {
    const pid = parseInt(fs.readFileSync(LOCK, 'utf8').trim(), 10);
    let alive = false;
    try { process.kill(pid, 0); alive = true; } catch {}
    if (alive) {
      console.error(`[SANKOFA] FATAL: Already running (PID ${pid}). Stop it first: pm2 stop sankofa`);
      process.exit(1);
    }
    console.warn(`[SANKOFA] Stale lock (PID ${pid} gone). Claiming.`);
  }
  fs.writeFileSync(LOCK, String(process.pid), 'utf8');
}

function releaseLock() {
  try { fs.unlinkSync(LOCK); } catch {}
}

acquireLock();

if (!config.anthropic.apiKey) {
  releaseLock();
  console.error('[SANKOFA] FATAL: ANTHROPIC_API_KEY not set. Copy .env.example to .env and add your key.');
  process.exit(1);
}

// ── Startup banner ─────────────────────────────────────────────────────────────
const LINE = '='.repeat(60);
console.log(LINE);
console.log('  Diamond Touch AI OS  —  SANKOFA Engine v1.0.0');
console.log('  NOMMO · OYA · MAWU · ESHU · ANANSI · YEMOJA · ELEGBA');
console.log(LINE);
console.log(`  Systems root : ${config.systemsRoot}`);
console.log(`  PID          : ${process.pid}`);
console.log('');

// ── Start file watcher ─────────────────────────────────────────────────────────
const watcher = require('./watcher');
watcher.start();

// ── Amendment watcher ──────────────────────────────────────────────────────────
{
  const chokidar          = require('chokidar');
  const { applyApproved } = require('./learning/apply');
  const amendDir          = path.join(__dirname, 'learning', 'amendments');
  fs.ensureDirSync(amendDir);

  chokidar.watch(amendDir, { ignoreInitial: true, awaitWriteFinish: { stabilityThreshold: 500 } })
    .on('change', async (fp) => {
      console.log(`\n[AMENDMENT] Changed: ${require('path').basename(fp)}`);
      try { await applyApproved(fp); }
      catch (err) { console.error('[AMENDMENT] Apply error:', err.message); }
    });
  console.log('[AMENDMENT] Watching learning/amendments/ for approvals\n');
}

console.log('[SANKOFA] All systems active. Press Ctrl+C to stop.\n');

// ── Graceful shutdown ──────────────────────────────────────────────────────────
function shutdown(signal) {
  console.log(`\n[SANKOFA] ${signal} — shutting down.`);
  releaseLock();
  process.exit(0);
}

process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('exit',    releaseLock);
process.on('uncaughtException',  err => { console.error('[SANKOFA] Uncaught:', err.message); releaseLock(); process.exit(1); });
process.on('unhandledRejection', err => console.error('[SANKOFA] Unhandled:', err));
