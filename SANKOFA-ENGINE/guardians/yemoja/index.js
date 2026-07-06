'use strict';
const GuardianBase = require('../base');

/**
 * YEMOJA — Financial and business intelligence guardian.
 * Named for the Yoruba deity of water, the source of all life and sustenance.
 * YEMOJA watches the money — revenue, expenses, client database, SARS readiness.
 * A business that cannot see its own finances cannot grow.
 *
 * Modes:
 *   TRACK    — Review income/expense entries for completeness and anomalies
 *   REPORT   — Generate SARS-ready financial summary for a period
 *   DATABASE — Audit client database health: missing data, inactive clients, upsell signals
 */
class Yemoja extends GuardianBase {
  constructor() { super('YEMOJA'); }

  detectMode(routingDecision) {
    const s = routingDecision?.signals || [];
    if (s.includes('sars_report'))     return 'REPORT';
    if (s.includes('client_database')) return 'DATABASE';
    return 'TRACK';
  }
}

module.exports = new Yemoja();
