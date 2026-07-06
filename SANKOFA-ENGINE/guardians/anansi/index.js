'use strict';
const GuardianBase = require('../base');

/**
 * ANANSI — Proposals and research guardian.
 * Named for the Akan spider deity of stories, knowledge, and strategy.
 * ANANSI weaves the narrative that wins work — proposals to companies,
 * speaker topic documents, research on target clients.
 *
 * Modes:
 *   PROPOSAL — Review or generate a corporate training/coaching proposal
 *   RESEARCH — Research a target company or client before proposal writing
 *              Upgrades to ANANSI_RESEARCH_MODEL for depth.
 */
class Anansi extends GuardianBase {
  constructor() { super('ANANSI'); }

  detectMode(routingDecision) {
    const s = routingDecision?.signals || [];
    if (s.includes('research_request')) return 'RESEARCH';
    return 'PROPOSAL';
  }

  resolveModel(mode) {
    if (mode === 'RESEARCH') {
      return process.env.ANANSI_RESEARCH_MODEL || 'claude-sonnet-4-6';
    }
    return require('../../config').guardians.ANANSI?.model || 'claude-haiku-4-5-20251001';
  }
}

module.exports = new Anansi();
