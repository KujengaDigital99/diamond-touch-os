#!/usr/bin/env node
'use strict';
process.stdout.write([
  '## Diamond Touch AI OS — Session Close',
  '',
  'Before ending this session:',
  '1. Update Systems/STATE/sankofa-state.md — clients, pipeline, tasks, system health',
  '2. Commit all changed files in Systems/ with message: close: YYYY-MM-DD — [summary]',
  '3. Push to remote',
  '',
  'The session is not closed until git push succeeds.',
].join('\n') + '\n');
