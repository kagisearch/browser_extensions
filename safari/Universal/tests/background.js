const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const resources = path.join(__dirname, '../Shared (Extension)/Resources');

function startBackground(settings = {}, platform = 'macOS', state = {}) {
  const manifest = require(`../${platform} (Extension)/manifest.json`);
  const listeners = {};
  const storage = state.storage ??= { ...settings };
  state.rules ??= [];
  state.updates ??= 0;
  const redirects = [];
  const tabs = new Map();
  const browser = {
    runtime: {
      getManifest: () => manifest,
      onInstalled: { addListener(listener) { listeners.install = listener; } },
      getURL: resource => `safari-web-extension://test/${resource}`,
    },
    webNavigation: {
      onCommitted: {
        addListener(listener, filter) {
          listeners.committed = listener;
          listeners.navigationFilter = filter;
        },
      },
    },
    storage: {
      onChanged: { addListener(listener) { listeners.settingsChanged = listener; } },
      local: {
        get(keys, callback) {
          const names = Array.isArray(keys) ? keys : [keys];
          const prefs = Object.fromEntries(names.map(key => [key, storage[key]]));
          if (callback) return callback(prefs);
          return Promise.resolve(prefs);
        },
        async set(values) {
          const changes = {};
          for (const [key, newValue] of Object.entries(values)) {
            if (storage[key] !== newValue) changes[key] = { oldValue: storage[key], newValue };
          }
          Object.assign(storage, values);
          listeners.settingsChanged(changes, 'local');
        },
      },
    },
    declarativeNetRequest: {
      async getDynamicRules() { return structuredClone(state.rules); },
      isRegexSupported: state.isRegexSupported,
      async updateDynamicRules({ addRules = [], removeRuleIds = [] }) {
        if (state.failInstall && addRules.length) throw new Error('Installation failed');
        state.rules = state.rules.filter(rule => !removeRuleIds.includes(rule.id)).concat(structuredClone(addRules));
        state.updates++;
      },
    },
    tabs: {
      async get(id) {
        if (!tabs.has(id)) throw new Error('Tab closed');
        return tabs.get(id);
      },
      async update(id, change) { redirects.push({ id, ...change }); },
    },
  };
  const context = vm.createContext({
    browser, URL, URLSearchParams, navigator: { userAgent: 'Version/27.0 Safari' },
    localStorage: { getItem() { return state.legacyToggle ?? null; } },
  });
  for (const script of manifest.background.scripts) {
    vm.runInContext(readFileSync(path.join(resources, script), 'utf8'), context, { filename: script });
  }
  function commit({ tabId, url, frameId = 0 }) {
    if (frameId === 0 && tabId >= 0) tabs.set(tabId, { id: tabId, url });
    return listeners.committed({ tabId, url, frameId });
  }
  return { listeners, storage, redirects, tabs, commit, setPreferences: browser.storage.local.set,
    settled: () => vm.runInContext('rulesUpdate', context) };
}

module.exports = { startBackground };
