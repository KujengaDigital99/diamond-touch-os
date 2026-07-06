'use strict';
const Anthropic = require('@anthropic-ai/sdk');
const config    = require('../config');

let _client = null;
function client() {
  if (!_client) _client = new Anthropic({ apiKey: config.anthropic.apiKey });
  return _client;
}

async function invoke(systemPrompt, userMessage, model, maxTokens) {
  const response = await client().messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });
  return response.content[0]?.text || '';
}

module.exports = { invoke };
