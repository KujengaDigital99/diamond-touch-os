'use strict';
const { invoke } = require('../guardians/invoke');
const store      = require('./store');
const config     = require('../config');

const EXTRACTION_MODEL  = 'claude-haiku-4-5-20251001';
const EXTRACTION_TOKENS = 128;

const SYSTEM_PROMPT = `You extract learning patterns from guardian analysis outputs.

A guardian is an automated reviewer. Its output describes what it found in a file.
Your job: identify whether the output contains a repeatable, actionable observation —
something the guardian sees often enough that the prompt could be improved to catch it more reliably.

Respond ONLY in this format (4 lines, no extra text):
TRIGGER: <5-word-kebab-case-slug describing the issue type>
DESCRIPTION: <one sentence — what the guardian flagged and why it matters>
LEARN: yes | no
REASON: <one sentence — why this is or is not worth learning from>

If the output is clean (STATUS: ok or STATUS: ready with no flags), respond:
TRIGGER: none
DESCRIPTION: Clean run — no flags.
LEARN: no
REASON: Nothing to extract from a clean pass.`;

async function extract(guardianName, guardianOutput) {
  if (!config.anthropic.apiKey) return;
  let raw = '';
  try {
    raw = await invoke(
      SYSTEM_PROMPT,
      `Guardian: ${guardianName}\n\nOutput:\n${guardianOutput.slice(0, 2000)}`,
      EXTRACTION_MODEL,
      EXTRACTION_TOKENS
    );
  } catch (err) {
    console.error(`[EXTRACTOR] API error: ${err.message}`);
    return;
  }

  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  const get   = (key) => {
    const line = lines.find(l => l.startsWith(`${key}:`));
    return line ? line.replace(`${key}:`, '').trim() : '';
  };

  const trigger     = get('TRIGGER');
  const description = get('DESCRIPTION');
  const learn       = get('LEARN') === 'yes';

  if (!learn || !trigger || trigger === 'none') return;

  const pattern = store.record(guardianName, trigger, description);
  console.log(`[LEARN] ${guardianName} — "${trigger}" (count: ${pattern.count})`);
}

module.exports = { extract };
