const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const manifest = require('../macOS (Extension)/manifest.json');
const resources = path.join(__dirname, '../Shared (Extension)/Resources');

function startBackground() {
  const listeners = {};
  const storage = { privateSessionLink: 'https://kagi.com/search?token=example' };
  const redirects = [];
  const browser = {
    runtime: {
      getManifest: () => manifest,
      onInstalled: { addListener(listener) { listeners.install = listener; } },
      onMessage: { addListener() {} },
    },
    webNavigation: {
      onBeforeNavigate: { addListener(listener) { listeners.navigate = listener; } },
    },
    storage: {
      local: {
        get(keys, callback) {
          const names = Array.isArray(keys) ? keys : [keys];
          callback(Object.fromEntries(names.map(key => [key, storage[key]])));
        },
        async set(values) { Object.assign(storage, values); },
      },
    },
    declarativeNetRequest: { async getDynamicRules() { return []; } },
    tabs: {
      async get(id) { return { id, incognito: false }; },
      update(id, change) { redirects.push([id, change.url]); },
    },
  };
  const context = vm.createContext({
    browser, URL, URLSearchParams, navigator: { userAgent: 'Version/27.0 Safari' },
    localStorage: { getItem() { return null; } },
  });
  for (const script of manifest.background.scripts) {
    vm.runInContext(readFileSync(path.join(resources, script), 'utf8'), context, { filename: script });
  }
  return { listeners, storage, redirects };
}

test('the Mac toolbar action references a PNG resource', () => {
  const icon = readFileSync(path.join(resources, manifest.action.default_icon['128']));
  assert.equal(icon.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
});

test('a fresh install skips migration and a 1.x upgrade keeps its session link', () => {
  const { listeners, storage } = startBackground();
  listeners.install({ reason: 'install' });
  listeners.install({ reason: 'update', previousVersion: '2.2.3' });
  assert.equal(storage.kagiPrivateSessionLink, undefined);
  listeners.install({ reason: 'update', previousVersion: '1.0.4' });
  assert.equal(storage.kagiPrivateSessionLink, storage.privateSessionLink);
});

test('an unrelated navigation leaves the next search free to redirect', async () => {
  const { listeners, redirects } = startBackground();
  const frame = { parentFrameId: -1, tabId: 7 };
  listeners.navigate({ ...frame, url: 'https://www.google.com/maps?q=Boston' });
  listeners.navigate({ ...frame, url: 'https://www.google.com/search' });
  listeners.navigate({ ...frame, url: 'https://www.google.com/search?q=red+panda' });
  await Promise.resolve();
  assert.deepEqual(redirects, [[7, 'https://kagi.com/search?q=red%20panda']]);
});
