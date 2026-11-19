const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const { startBackground } = require('./background');

const legacy = 'https://kagi.com/search?token=legacy&q=%s';
const upgrade = { reason: 'update', previousVersion: '1.0.9' };

test('a 1.x upgrade imports the legacy link only when the current setting is absent', async () => {
  for (const platform of ['macOS', 'iOS']) {
    for (const current of [undefined, 'https://kagi.com/search?token=replacement', '']) {
      const settings = { privateSessionLink: legacy };
      if (current !== undefined) settings.kagiPrivateSessionLink = current;
      const { listeners, storage } = startBackground(settings, platform);
      await listeners.install(upgrade);
      assert.equal(storage.kagiPrivateSessionLink, current ?? legacy);
    }
  }
});

test('fresh installs, unrelated updates, and missing legacy settings skip migration', async () => {
  const { listeners, storage } = startBackground({ privateSessionLink: legacy });
  for (const details of [{ reason: 'install' }, { reason: 'update', previousVersion: '2.2.3' },
    { reason: 'update', previousVersion: '10.1' }]) {
    await listeners.install(details);
    assert.equal(storage.kagiPrivateSessionLink, undefined);
  }
  for (const settings of [{}, { privateSessionLink: 42 }]) {
    const worker = startBackground(settings);
    await worker.listeners.install(upgrade);
    assert.equal(worker.storage.kagiPrivateSessionLink, undefined);
  }
});

const contentScript = readFileSync(path.join(__dirname, '../Shared (Extension)/Resources/kagi-content-script.js'), 'utf8');

test('automatic session capture and sign-in replay preserve the token as one HTTPS query parameter', async () => {
  const token = 'a+b&c=d#%';
  const replay = { 'search?q=C%2B%2B+%26+caf%C3%A9&token=stale#results': {} };
  for (const fromOpenSearch of [false, true]) {
    const storage = {};
    const window = {};
    await vm.runInNewContext(contentScript, {
      URL, window, location: { href: 'https://kagi.com/signin' },
      document: { querySelector: () => ({ getAttribute: () => 'https://kagi.com/opensearch.xml' + (fromOpenSearch ? '/' + token : '') }) },
      fetch: async () => ({ json: async () => ({ id: fromOpenSearch ? 'old' : token }) }),
      localStorage: { getItem: () => JSON.stringify(replay) },
      browser: { storage: { local: { set: async prefs => Object.assign(storage, prefs) } } },
    });
    const saved = new URL(storage.kagiPrivateSessionLink);
    const destination = new URL(window.location);
    for (const url of [saved, destination]) {
      assert.equal(url.origin, 'https://kagi.com');
      assert.equal(url.pathname, '/search');
      assert.deepEqual(url.searchParams.getAll('token'), [token]);
    }
    assert.equal(destination.searchParams.get('q'), 'C++ & café');
    assert.equal(destination.hash, '#results');
  }
});
