#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const EVENTS_PATH = path.join(__dirname, '..', 'assets', 'gep', 'events.jsonl');

function usage() {
  console.error('Usage: node scripts/append-gep-event.js <json-file>');
  process.exit(1);
}

const input = process.argv[2];
if (!input) usage();

let event;
try {
  event = JSON.parse(fs.readFileSync(path.resolve(input), 'utf8'));
} catch (err) {
  console.error('[append-gep-event] failed to read event:', err.message);
  process.exit(1);
}

if (event.type !== 'EvolutionEvent') {
  console.error('[append-gep-event] event must have type EvolutionEvent');
  process.exit(1);
}

fs.mkdirSync(path.dirname(EVENTS_PATH), { recursive: true });
fs.appendFileSync(EVENTS_PATH, JSON.stringify(event) + '\n', 'utf8');
console.log('[append-gep-event] appended', event.id || '(no id)');
