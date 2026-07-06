#!/usr/bin/env node
'use strict';
const fs   = require('fs');
const path = require('path');

const root    = path.resolve(__dirname, '..', '..');
const memFile = path.join(root, 'Systems', 'STATE', 'MEMORY.md');
const stateFl = path.join(root, 'Systems', 'STATE', 'sankofa-state.md');

function read(f) {
  try { return fs.readFileSync(f, 'utf8'); } catch { return null; }
}

const memory = read(memFile);
const state  = read(stateFl);

const { execSync } = require('child_process');
let gitStatus = '';
try { gitStatus = execSync('git status --short', { cwd: root, encoding: 'utf8', timeout: 5000 }); }
catch { gitStatus = '(git not available)'; }

const lines = ['## Diamond Touch AI OS — Session Brief'];
if (memory) lines.push('\n### Session Memory\n' + memory);
if (state)  lines.push('\n### SANKOFA State\n' + state.slice(0, 2000));
lines.push('\n### Uncommitted Changes\n```\n' + (gitStatus.trim() || 'Clean') + '\n```');

process.stdout.write(lines.join('\n') + '\n');
