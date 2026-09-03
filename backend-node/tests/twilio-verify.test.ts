import { test } from 'node:test';
import assert from 'node:assert/strict';
import { config } from '../src/config.js';

config.twilioAccountSid = 'ACtest0000000000000000000000000000';
config.twilioAuthToken = 'test-auth-token';
config.twilioVerifyServiceSid = 'VAtest0000000000000000000000000000';

const { startVerification, checkVerification } = await import('../src/twilio-verify.js');

test('startVerification surfaces Twilio error code (e.g. 21608) instead of swallowing it', async (t) => {
  const originalFetch = global.fetch;
  global.fetch = (async () =>
    new Response(
      JSON.stringify({
        code: 21608,
        message: 'The number +15005550006 is unverified. Trial accounts cannot send messages to unverified numbers',
        more_info: 'https://www.twilio.com/docs/errors/21608',
      }),
      { status: 400 },
    )) as typeof fetch;
  t.after(() => {
    global.fetch = originalFetch;
  });

  const result = await startVerification('+15005550006');
  assert.equal(result.ok, false);
  assert.equal(result.error, 'twilio_error');
  assert.equal(result.twilioCode, 21608);
});

test('checkVerification surfaces Twilio error code on non-404 failure', async (t) => {
  const originalFetch = global.fetch;
  global.fetch = (async () =>
    new Response(JSON.stringify({ code: 60200, message: 'Invalid parameter' }), { status: 400 })) as typeof fetch;
  t.after(() => {
    global.fetch = originalFetch;
  });

  const result = await checkVerification('+15005550006', '123456');
  assert.equal(result.ok, false);
  assert.equal(result.error, 'twilio_error');
  assert.equal(result.twilioCode, 60200);
});

test('checkVerification still treats 404 as invalid_or_expired without needing a body', async (t) => {
  const originalFetch = global.fetch;
  global.fetch = (async () => new Response('', { status: 404 })) as typeof fetch;
  t.after(() => {
    global.fetch = originalFetch;
  });

  const result = await checkVerification('+15005550006', '123456');
  assert.equal(result.ok, false);
  assert.equal(result.error, 'invalid_or_expired');
  assert.equal(result.status, 'expired');
});

test('startVerification falls back gracefully when Twilio returns a non-JSON error body', async (t) => {
  const originalFetch = global.fetch;
  global.fetch = (async () => new Response('Bad gateway', { status: 502 })) as typeof fetch;
  t.after(() => {
    global.fetch = originalFetch;
  });

  const result = await startVerification('+15005550006');
  assert.equal(result.ok, false);
  assert.equal(result.error, 'twilio_error');
  assert.equal(result.twilioCode, undefined);
});
