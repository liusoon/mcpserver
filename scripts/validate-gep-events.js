#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const EVENTS_PATH = path.join(__dirname, '..', 'assets', 'gep', 'events.jsonl');

function fail(message) {
  console.error('[validate-gep-events]', message);
  process.exit(1);
}

if (!fs.existsSync(EVENTS_PATH)) {
  fail('missing assets/gep/events.jsonl');
}

const raw = fs.readFileSync(EVENTS_PATH, 'utf8');
const lines = raw.split(/\r?\n/).filter((line) => line.trim().length > 0);

if (lines.length === 0) {
  fail('events.jsonl is empty');
}

for (let i = 0; i < lines.length; i += 1) {
  let event;
  try {
    event = JSON.parse(lines[i]);
  } catch (err) {
    fail(`line ${i + 1} is not valid JSON: ${err.message}`);
  }

  if (event.type !== 'EvolutionEvent') {
    fail(`line ${i + 1} must be type EvolutionEvent`);
  }
  if (!event.id || !event.intent || !event.outcome) {
    fail(`line ${i + 1} missing required EvolutionEvent fields`);
  }
  if (!event.blast_radius || event.blast_radius.files <= 0 || event.blast_radius.lines <= 0) {
    fail(`line ${i + 1} blast_radius must have files > 0 and lines > 0`);
  }
  if (!event.outcome.score || event.outcome.score < 0.7) {
    fail(`line ${i + 1} outcome.score must be >= 0.7`);
  }
}

console.log('[validate-gep-events] OK:', lines.length, 'event(s)');
process.exit(0);
