'use strict';
const config = require('../config');

// ── Provider-agnostic invoke ──────────────────────────────────────────────────
// Loads the SDK for whichever provider was detected in config.js.
// Add a new branch here to support additional providers.

let _client = null;

function client() {
  if (_client) return _client;

  if (config.provider === 'anthropic') {
    const Anthropic = require('@anthropic-ai/sdk');
    _client = { provider: 'anthropic', sdk: new Anthropic({ apiKey: config.apiKey }) };
  } else {
    // default: openai
    const OpenAI = require('openai');
    _client = { provider: 'openai', sdk: new OpenAI({ apiKey: config.apiKey }) };
  }

  console.log(`[SANKOFA] Provider: ${_client.provider}`);
  return _client;
}

async function invoke(systemPrompt, userMessage, model, maxTokens) {
  const c = client();

  if (c.provider === 'anthropic') {
    const response = await c.sdk.messages.create({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });
    return response.content[0]?.text || '';
  }

  // openai
  const response = await c.sdk.chat.completions.create({
    model,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userMessage  },
    ],
  });
  return response.choices[0]?.message?.content || '';
}

module.exports = { invoke };
