'use strict';
const GuardianBase = require('../base');

/**
 * OYA — Training and facilitation operations guardian.
 * Named for the Yoruba deity of transformation, wind, and change.
 * OYA governs the moment before and after the training room —
 * the assessment that shapes what goes in, and the report that captures what came out.
 *
 * Modes:
 *   ASSESS  — Review or generate pre-training assessment / needs survey
 *   CONTENT — Review training content for quality, relevance, client fit
 *   REPORT  — Review or generate post-training report + feedback survey
 */
class Oya extends GuardianBase {
  constructor() { super('OYA'); }

  detectMode(routingDecision) {
    const s = routingDecision?.signals || [];
    if (s.includes('assessment_file')) return 'ASSESS';
    if (s.includes('report_file'))     return 'REPORT';
    return 'CONTENT';
  }
}

module.exports = new Oya();
