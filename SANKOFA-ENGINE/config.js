require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const path = require('path');

const root = path.resolve(__dirname, '..');

module.exports = {
  root,
  systemsRoot: path.join(root, 'Systems'),

  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model:  process.env.DEFAULT_MODEL || 'claude-haiku-4-5-20251001',
  },

  guardians: {
    NOMMO: {
      model:     process.env.NOMMO_MODEL || 'claude-haiku-4-5-20251001',
      maxTokens: 768,
    },
    OYA: {
      model:     process.env.OYA_MODEL || 'claude-haiku-4-5-20251001',
      maxTokens: 1024,
    },
    MAWU: {
      model:     process.env.MAWU_MODEL || 'claude-haiku-4-5-20251001',
      maxTokens: 1024,
    },
    ESHU: {
      model:     process.env.ESHU_MODEL || 'claude-haiku-4-5-20251001',
      maxTokens: 768,
    },
    ANANSI: {
      // RESEARCH mode upgrades to ANANSI_RESEARCH_MODEL
      model:     process.env.ANANSI_MODEL || 'claude-haiku-4-5-20251001',
      maxTokens: 1024,
    },
    YEMOJA: {
      model:     process.env.YEMOJA_MODEL || 'claude-haiku-4-5-20251001',
      maxTokens: 512,
    },
    ELEGBA: {
      model:     process.env.ELEGBA_MODEL || 'claude-haiku-4-5-20251001',
      maxTokens: 768,
    },
  },

  watcher: {
    batchQuietMs: parseInt(process.env.WATCHER_BATCH_QUIET_MS, 10) || 30_000,
  },
};
