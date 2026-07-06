'use strict';
const fs   = require('fs-extra');
const path = require('path');

function writeLog(guardianName, content) {
  const logsDir = path.join(
    __dirname, '..', '..', 'Systems', 'STATE', 'sessions', 'guardian-logs'
  );
  fs.ensureDirSync(logsDir);
  const ts   = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const file = path.join(logsDir, `${guardianName.toLowerCase()}-${ts}.md`);
  fs.writeFileSync(file, content, 'utf8');
  return file;
}

module.exports = { writeLog };
