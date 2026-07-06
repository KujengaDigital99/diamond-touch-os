'use strict';
const GuardianBase = require('../base');

/**
 * ESHU — Client pipeline and intake guardian.
 * Named for the Yoruba deity of the crossroads — the one at every gate
 * who decides what passes and what does not.
 * ESHU watches every inquiry, every lead, every booking request.
 * Nothing enters the system without ESHU knowing about it.
 *
 * Modes:
 *   PIPELINE — Scan pipeline for stalls, next actions, entries to close
 *   INTAKE   — New inquiry or booking request → onboarding steps
 */
class Eshu extends GuardianBase {
  constructor() { super('ESHU'); }

  detectMode(routingDecision) {
    const s = routingDecision?.signals || [];
    if (s.includes('booking_file')) return 'INTAKE';
    return 'PIPELINE';
  }
}

module.exports = new Eshu();
