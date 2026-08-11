import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizePhone, phoneDigits, validatePassword } from '../src/security/validate.js';

test('normalizePhone: 10-digit local number gets default country code', () => {
  assert.equal(normalizePhone('9876543210', '+91'), '+919876543210');
  assert.equal(normalizePhone('98765 43210', '+91'), '+919876543210');
});

test('normalizePhone: keeps explicit country code', () => {
  assert.equal(normalizePhone('+91 98765 43210'), '+919876543210');
  assert.equal(normalizePhone('919876543210'), '+919876543210');
});

test('normalizePhone: rejects too-short / too-long input', () => {
  assert.equal(normalizePhone('12345'), null);
  assert.equal(normalizePhone(''), null);
  assert.equal(normalizePhone('1234567890123456'), null);
});

test('phoneDigits: returns last 10 digits regardless of formatting', () => {
  assert.equal(phoneDigits('9876543210'), '9876543210');
  assert.equal(phoneDigits('+91 98765-43210'), '9876543210');
  assert.equal(phoneDigits('0919876543210'), '9876543210');
  assert.equal(phoneDigits('12345'), null);
});

test('phoneDigits normalization matches for equivalent forms', () => {
  assert.equal(phoneDigits('+919876543210'), phoneDigits('9876543210'));
});

test('validatePassword: enforces length bounds', () => {
  assert.equal(validatePassword('short'), null);
  assert.equal(validatePassword('123456'), '123456');
  assert.equal(validatePassword('x'.repeat(129)), null);
});
