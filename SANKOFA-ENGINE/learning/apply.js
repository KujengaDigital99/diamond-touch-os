'use strict';
const fs    = require('fs-extra');
const path  = require('path');
const store = require('./store');

const AMENDMENTS_DIR = path.join(__dirname, 'amendments');

async function applyApproved(changedFile) {
  const target = changedFile
    ? [changedFile]
    : fs.readdirSync(AMENDMENTS_DIR).map(f => path.join(AMENDMENTS_DIR, f));

  for (const filePath of target) {
    if (!filePath.endsWith('.md')) continue;
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, 'utf8');
    if (!/\*\*Status:\*\*\s*approved/i.test(content)) continue;

    const guardianMatch = content.match(/\*\*Guardian:\*\*\s*(\w+)/);
    const promptMatch   = content.match(/\*\*Prompt file:\*\*\s*([^\n]+)/);
    const patternMatch  = content.match(/\*\*Pattern:\*\*\s*([^\n]+)/);

    if (!guardianMatch || !promptMatch) {
      console.error(`[APPLY] Malformed amendment file: ${path.basename(filePath)}`);
      continue;
    }

    const guardianName = guardianMatch[1].toUpperCase();
    const promptRel    = promptMatch[1].trim();
    const patternSlug  = patternMatch ? patternMatch[1].trim() : 'unknown';
    const promptFile   = path.join(__dirname, '..', promptRel);

    const additionMatch = content.match(/## Proposed Addition to Prompt\n\n([\s\S]*?)(?=\n## |$)/);
    if (!additionMatch) {
      console.error(`[APPLY] No "Proposed Addition" section in: ${path.basename(filePath)}`);
      continue;
    }
    const addition = additionMatch[1].trim();

    if (!fs.existsSync(promptFile)) {
      console.error(`[APPLY] Prompt file not found: ${promptRel}`);
      continue;
    }

    let prompt = fs.readFileSync(promptFile, 'utf8');
    const statusLineIdx = prompt.lastIndexOf('\nEnd with:');
    const insertionPoint = statusLineIdx > -1 ? statusLineIdx : prompt.length;

    const patch =
      `\n\n## Learned: ${patternSlug}\n\n` +
      `<!-- Applied from amendment ${path.basename(filePath)} -->\n` +
      addition;

    prompt = prompt.slice(0, insertionPoint) + patch + prompt.slice(insertionPoint);
    fs.writeFileSync(promptFile, prompt, 'utf8');

    const updated = content.replace(/\*\*Status:\*\*\s*approved/, '**Status:** applied');
    fs.writeFileSync(filePath, updated, 'utf8');

    const patternStore = store.load();
    const matched = patternStore.patterns.find(p => p.guardian === guardianName && p.trigger === patternSlug);
    if (matched) store.markApplied(matched.id);

    console.log(`[APPLY] Prompt patched: ${promptRel} ← ${path.basename(filePath)}`);
  }
}

module.exports = { applyApproved };
