'use strict';
const https = require('https');

const BASE = 'https://api.bufferapp.com/1';

function token() {
  const t = process.env.BUFFER_ACCESS_TOKEN;
  if (!t) throw new Error('BUFFER_ACCESS_TOKEN not set in .env');
  return t;
}

function request(method, endpoint, body = null) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? new URLSearchParams(body).toString() : '';
    const options = {
      hostname: 'api.bufferapp.com',
      path:     `/1${endpoint}`,
      method,
      headers: {
        Authorization:    `Bearer ${token()}`,
        'Content-Type':   'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(bodyStr),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve({ raw: data, status: res.statusCode }); }
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

let _profiles = null;

async function getProfiles() {
  if (_profiles) return _profiles;
  const data = await request('GET', '/profiles.json');
  if (!Array.isArray(data)) throw new Error(`Buffer profiles error: ${JSON.stringify(data)}`);
  _profiles = data.map(p => ({
    id:      p.id,
    service: p.service,
    name:    p.service_username || p.formatted_username,
    type:    p.service_type,
  }));
  return _profiles;
}

async function schedulePost(text, profileIds, scheduledAt = null) {
  if (!profileIds.length) throw new Error('At least one profile ID required');
  const body = { text };
  profileIds.forEach((id, i) => { body[`profile_ids[${i}]`] = id; });
  if (scheduledAt) body.scheduled_at = scheduledAt;
  return request('POST', '/updates/create.json', body);
}

async function getQueue(profileId) {
  return request('GET', `/profiles/${profileId}/updates/pending.json`);
}

module.exports = { getProfiles, schedulePost, getQueue };
