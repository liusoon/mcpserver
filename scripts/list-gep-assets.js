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
let latestOutcomeScore = null;
let eventChain = [];
let intentCounts = {};
let genesUsedCounts = {};
let outcomeScores = [];
if (fs.existsSync(eventsPath)) {
  const eventLines = fs.readFileSync(eventsPath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);
  eventCount = eventLines.length;
  const parsedEvents = eventLines.map((line) => {
    try {
      return JSON.parse(line);
    } catch (_err) {
      return null;
    }
  }).filter(Boolean);

  parsedEvents.forEach((evt) => {
    if (evt.intent) {
      intentCounts[evt.intent] = (intentCounts[evt.intent] || 0) + 1;
    }
    if (Array.isArray(evt.genes_used)) {
      evt.genes_used.forEach((geneId) => {
        genesUsedCounts[geneId] = (genesUsedCounts[geneId] || 0) + 1;
      });
    }
    if (evt.outcome && evt.outcome.score != null) {
      outcomeScores.push(evt.outcome.score);
    }
  });

  eventChain = parsedEvents.slice(-5).map((evt) => ({
    id: evt.id,
    parent: evt.parent || null,
    intent: evt.intent || null,
  }));
  if (parsedEvents.length > 0) {
    const latest = parsedEvents[parsedEvents.length - 1];
    latestEventId = latest.id || null;
    latestOutcomeScore = latest.outcome && latest.outcome.score != null
      ? latest.outcome.score
      : null;
  }
}

const averageOutcomeScore = outcomeScores.length > 0
  ? Number((outcomeScores.reduce((a, b) => a + b, 0) / outcomeScores.length).toFixed(3))
  : null;

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
  latest_outcome_score: latestOutcomeScore,
  average_outcome_score: averageOutcomeScore,
  intent_counts: intentCounts,
  genes_used_counts: genesUsedCounts,
  event_chain: eventChain,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(0);
