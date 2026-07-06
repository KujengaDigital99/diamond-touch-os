'use strict';
const fs         = require('fs-extra');
const path       = require('path');
const { invoke } = require('../guardians/invoke');
const store      = require('./store');
const config     = require('../config');

const PROPOSAL_MODEL  = 'claude-haiku-4-5-20251001';
const PROPOSAL_TOKENS = 512;
const AMENDMENTS_DIR  = path.join(__dirname, 'amendments');
const THRESHOLD       = 3;

const SYSTEM_PROMPT = `You write prompt improvement proposals for AI guardian systems.

A guardian has a system prompt that tells it how to analyse files. You have been given
a recurring pattern — an issue type the guardian flags repeatedly. Your job is to propose
a specific, targeted addition to the guardian's prompt that would help it:
1. Catch this pattern more reliably
2. Give more useful output when it does

Write ONLY the proposed addition — the exact text to add to the prompt.
Keep it under 8 lines. Be specific. No preamble. No explanation outside the text.`;

async function proposeIfDue() {
  if (!config.anthropic.apiKey) return;
  const pending = store.pendingProposals(THRESHOLD);
  if (!pending.length) return;
  fs.ensureDirSync(AMENDMENTS_DIR);

  for (const pattern of pending) {
    console.log(`[PROPOSER] Writing amendment for: ${pattern.trigger} (${pattern.guardian}, count: ${pattern.count})`);

    const promptFile = path.join(
      __dirname, '..', 'guardians',
      pattern.guardian.toLowerCase(), 'prompts', 'default.md'
    );
    const currentPrompt = fs.existsSync(promptFile)
      ? fs.readFileSync(promptFile, 'utf8').slice(0, 1500)
      : '(prompt file not found)';

    let proposed = '';
    try {
      proposed = await invoke(
        SYSTEM_PROMPT,
        `Guardian: ${pattern.guardian}\nPattern: ${pattern.trigger}\nDescription: ${pattern.description}\nOccurrences: ${pattern.count}\n\nCurrent prompt (excerpt):\n${currentPrompt}`,
        PROPOSAL_MODEL,
        PROPOSAL_TOKENS
      );
    } catch (err) {
      console.error(`[PROPOSER] API error: ${err.message}`);
      continue;
    }

    const date     = new Date().toISOString().slice(0, 10);
    const slug     = pattern.trigger.replace(/[^a-z0-9-]/g, '-');
    const fileName = `${pattern.guardian.toLowerCase()}-${slug}-${date}.md`;
    const filePath = path.join(AMENDMENTS_DIR, fileName);

    const content =
      `# Amendment — ${pattern.guardian} — ${pattern.trigger}\n\n` +
      `**Guardian:** ${pattern.guardian}\n` +
      `**Prompt file:** guardians/${pattern.guardian.toLowerCase()}/prompts/default.md\n` +
      `**Status:** proposed\n` +
      `**Pattern:** ${pattern.trigger}\n` +
      `**Count:** ${pattern.count} occurrences\n` +
      `**First seen:** ${pattern.first_seen.slice(0, 10)}\n\n` +
      `## What Was Observed\n\n${pattern.description}\n\n` +
      `## Proposed Addition to Prompt\n\n${proposed.trim()}\n\n` +
      `## How to Apply\n\n` +
      `1. Review the proposed addition above\n` +
      `2. If approved, change \`**Status:** proposed\` → \`**Status:** approved\`\n` +
      `3. Save the file — SANKOFA Engine will detect the approval and patch the prompt automatically\n` +
      `4. To reject: change status to \`rejected\` and save\n`;

    fs.writeFileSync(filePath, content, 'utf8');
    store.markProposed(pattern.id, fileName);
    console.log(`[PROPOSER] Amendment written → ${fileName}`);
  }
}

module.exports = { proposeIfDue };
