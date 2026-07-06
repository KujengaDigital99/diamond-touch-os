'use strict';
const GuardianBase = require('../base');

/**
 * NOMMO — Voice and brand guardian.
 * Named for the Dogon divine word — the primordial creative utterance.
 * NOMMO says: every word Doric puts into the world either builds her diamond
 * or chips it. Nothing leaves without passing through.
 *
 * Modes:
 *   REVIEW — Single piece: voice, specificity, platform fit, CTA
 *   AUDIT  — Full content pipeline: cadence, variety, brand drift
 */
class Nommo extends GuardianBase {
  constructor() { super('NOMMO'); }

  detectMode(routingDecision) {
    const s = routingDecision?.signals || [];
    if (s.includes('content_audit') || s.includes('overview_file')) return 'AUDIT';
    return 'REVIEW';
  }
}

module.exports = new Nommo();
