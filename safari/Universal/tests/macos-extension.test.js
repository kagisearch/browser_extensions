const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { startBackground } = require('./background');

const manifest = require('../macOS (Extension)/manifest.json');
const resources = path.join(__dirname, '../Shared (Extension)/Resources');

test('the Mac toolbar action references a PNG resource', () => {
  const icon = readFileSync(path.join(resources, manifest.action.default_icon['128']));
  assert.equal(icon.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
});

test('an unrelated navigation leaves the next search free to redirect', async () => {
  const { commit, redirects } = startBackground({ kagiDnrEnabled: false });
  const frame = { tabId: 7 };
  await commit({ ...frame, url: 'https://www.google.com/maps?q=Boston' });
  await commit({ ...frame, url: 'https://www.google.com/search' });
  await commit({ ...frame, url: 'https://www.google.com/search?q=red+panda&client=safari' });
  assert.deepEqual(redirects, [{ id: 7, url: 'https://kagi.com/search?q=red%20panda' }]);
});
