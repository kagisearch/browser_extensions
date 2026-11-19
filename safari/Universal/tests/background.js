const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const resources = path.join(__dirname, '../Shared (Extension)/Resources');

function startBackground(settings = {}, platform = 'macOS') {
  const manifest = require(`../${platform} (Extension)/manifest.json`);
  const listeners = {};
  const storage = { ...settings };
  const redirects = [];
  const browser = {
    runtime: {
      getManifest: () => manifest,
      onInstalled: { addListener(listener) { listeners.install = listener; } },
      onMessage: { addListener(listener) { listeners.message = listener; } },
    },
    webNavigation: {
      onBeforeNavigate: {
        addListener(listener, filter) {
          listeners.navigate = listener;
          listeners.navigationFilter = filter;
        },
      },
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

module.exports = { startBackground };
