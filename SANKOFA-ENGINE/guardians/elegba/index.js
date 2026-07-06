'use strict';
const GuardianBase = require('../base');

/**
 * ELEGBA — Social media and channel execution guardian.
 * Named for the Yoruba divine messenger who stands at every crossroads.
 * ELEGBA decides what passes to the world and what goes back for revision.
 * Once NOMMO clears the voice, ELEGBA clears the channel.
 *
 * Modes:
 *   REVIEW   — Check content is ready: platform fit, hook, CTA, length, banned phrases
 *   SCHEDULE — Format content for Buffer and confirm scheduling details
 */
class Elegba extends GuardianBase {
  constructor() { super('ELEGBA'); }

  detectMode(routingDecision) {
    const s = routingDecision?.signals || [];
    if (s.includes('schedule_request')) return 'SCHEDULE';
    return 'REVIEW';
  }
}

module.exports = new Elegba();
