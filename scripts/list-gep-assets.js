#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const GEP_DIR = path.join(__dirname, '..', 'assets', 'gep');

function readJson(file) {
  const full = path.join(GEP_DIR, file);
  if (!fs.existsSync(full)) {
    console.error('[list-gep-assets] missing', file);
    process.exit(1);
  }
  try {
    return JSON.parse(fs.readFileSync(full, 'utf8'));
  } catch (err) {
    console.error('[list-gep-assets] invalid JSON in', file, err.message);
    process.exit(1);
  }
}

const genesDoc = readJson('genes.json');
const capsulesDoc = readJson('capsules.json');
const genes = Array.isArray(genesDoc.genes) ? genesDoc.genes : [];
const capsules = Array.isArray(capsulesDoc.capsules) ? capsulesDoc.capsules : [];

const eventsPath = path.join(GEP_DIR, 'events.jsonl');
let eventCount = 0;
let latestEventId = null;
if (fs.existsSync(eventsPath)) {
  const eventLines = fs.readFileSync(eventsPath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);
  eventCount = eventLines.length;
  if (eventCount > 0) {
    try {
      latestEventId = JSON.parse(eventLines[eventCount - 1]).id || null;
    } catch (_err) {
      latestEventId = null;
    }
  }
}

const summary = {
  genes: genes.map((g) => ({
    id: g.id,
    category: g.category,
    signals_match: g.signals_match || [],
    asset_id: g.asset_id || null,
  })),
  capsules: capsules.map((c) => ({
    id: c.id,
    gene: c.gene,
    confidence: c.confidence,
    trigger: c.trigger || [],
  })),
  counts: { genes: genes.length, capsules: capsules.length, events: eventCount },
  latest_event_id: latestEventId,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(0);
