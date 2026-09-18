import assert from 'node:assert/strict';
import test from 'node:test';
import { parseWhatsAppExport } from './whatsapp';

test('parses month-first dates consistently after unambiguous evidence', () => {
  const result = parseWhatsAppExport([
    '8/29/26, 22:47 - Messages and calls are end-to-end encrypted.',
    '9/17/26, 20:47 - Philosopher: Hello: https://example.test/a',
    '9/18/26, 8:05 PM - Philosopher: Follow-up',
  ].join('\n'));

  assert.equal(result.messages.length, 2);
  assert.equal(result.messages[0]?.dateKey, '2026-09-17');
  assert.equal(result.messages[0]?.text, 'Hello: https://example.test/a');
  assert.equal(result.messages[1]?.timestamp, '8:05 PM');
  assert.equal(result.ignoredLineCount, 1);
});

test('supports day-first dates and keeps ambiguous dates in that convention', () => {
  const result = parseWhatsAppExport([
    '29/8/2026, 22:47 - Ada: First',
    '4/9/2026, 22:48 - Ada: Second',
    '5/9/2026, 22:49 - Ada: Third',
  ].join('\n'));

  assert.deepEqual(result.messages.map((message) => message.dateKey), [
    '2026-08-29',
    '2026-09-04',
    '2026-09-05',
  ]);
});

test('supports bracketed, multiline, and media messages', () => {
  const result = parseWhatsAppExport([
    '[09/17/26, 20:47] Ada: A line with a colon: still one message',
    'continued on the next line',
    '[09/17/26, 20:48] Ada: <image omitted>',
    '[09/17/26, 20:49] Ada: Voice message omitted',
  ].join('\n'));

  assert.equal(result.messages.length, 3);
  assert.equal(result.messages[0]?.text, 'A line with a colon: still one message\ncontinued on the next line');
  assert.equal(result.messages[1]?.text, '<image omitted>');
  assert.equal(result.messages[2]?.text, 'Voice message omitted');
});