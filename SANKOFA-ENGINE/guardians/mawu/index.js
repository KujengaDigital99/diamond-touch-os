'use strict';
const GuardianBase = require('../base');

/**
 * MAWU — Coaching operations guardian.
 * Named for the Fon/Ewe supreme goddess of wisdom, the moon, and creation.
 * MAWU holds the arc of every coaching relationship — from first contact
 * to the final report that proves the journey was real.
 *
 * Modes:
 *   SESSION    — Summarize coaching session notes; extract progress + outstanding items
 *   PROGRESS   — Review client progress file; flag what still needs attention
 *   ONBOARD    — Generate onboarding documents: welcome email, agreement, programme overview
 *   CONCLUSION — Generate end-of-coaching report + review request for client
 */
class Mawu extends GuardianBase {
  constructor() { super('MAWU'); }

  detectMode(routingDecision) {
    const s = routingDecision?.signals || [];
    if (s.includes('session_file'))    return 'SESSION';
    if (s.includes('onboard_file'))    return 'ONBOARD';
    if (s.includes('conclusion_file')) return 'CONCLUSION';
    return 'PROGRESS';
  }
}

module.exports = new Mawu();
