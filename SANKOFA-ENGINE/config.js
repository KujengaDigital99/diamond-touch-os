require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const path = require('path');

const root = path.resolve(__dirname, '..');

// ── Provider auto-detection ───────────────────────────────────────────────────
// Set AI_PROVIDER explicitly, or let the system infer from which key is present.
// If both keys are set, AI_PROVIDER wins; otherwise first found wins.
const PROVIDER = process.env.AI_PROVIDER ||
  (process.env.OPENAI_API_KEY    ? 'openai'    :
   process.env.ANTHROPIC_API_KEY ? 'anthropic' : null);

if (!PROVIDER) {
  console.error('[SANKOFA] No AI provider key found. Set OPENAI_API_KEY or ANTHROPIC_API_KEY in .env');
}

// ── Per-provider model defaults ───────────────────────────────────────────────
// standard = fast/cheap  (Haiku / gpt-4o-mini)
// upgrade  = full power  (Sonnet / gpt-4o) — used by ANANSI RESEARCH mode
const MODEL_DEFAULTS = {
  openai:    { standard: 'gpt-4o-mini',               upgrade: 'gpt-4o'            },
  anthropic: { standard: 'claude-haiku-4-5-20251001',  upgrade: 'claude-sonnet-4-6' },
};

const defaults = MODEL_DEFAULTS[PROVIDER] || MODEL_DEFAULTS.openai;

module.exports = {
  root,
  systemsRoot: path.join(root, 'Systems'),

  provider: PROVIDER,

  // Unified API key accessor — invoke.js reads this
  apiKey: process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY,

  guardians: {
    NOMMO: {
      model:     process.env.NOMMO_MODEL || defaults.standard,
      maxTokens: 768,
    },
    OYA: {
      model:     process.env.OYA_MODEL || defaults.standard,
      maxTokens: 1024,
    },
    MAWU: {
      model:     process.env.MAWU_MODEL || defaults.standard,
      maxTokens: 1024,
    },
    ESHU: {
      model:     process.env.ESHU_MODEL || defaults.standard,
      maxTokens: 768,
    },
    ANANSI: {
      // RESEARCH mode upgrades to ANANSI_RESEARCH_MODEL
      model:         process.env.ANANSI_MODEL          || defaults.standard,
      researchModel: process.env.ANANSI_RESEARCH_MODEL || defaults.upgrade,
      maxTokens:     1024,
    },
    YEMOJA: {
      model:     process.env.YEMOJA_MODEL || defaults.standard,
      maxTokens: 512,
    },
    ELEGBA: {
      model:     process.env.ELEGBA_MODEL || defaults.standard,
      maxTokens: 768,
    },
  },

  watcher: {
    batchQuietMs: parseInt(process.env.WATCHER_BATCH_QUIET_MS, 10) || 30_000,
  },
};
