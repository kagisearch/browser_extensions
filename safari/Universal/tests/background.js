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
      onBeforeNavigate: { addListener(listener) { listeners.beforeNavigate = listener; } },
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
    declarativeNetRequest: state.dnrAvailable === false ? undefined : {
      async getDynamicRules() { return structuredClone(state.rules); },
      isRegexSupported: state.isRegexSupported,
      async updateDynamicRules({ addRules = [], removeRuleIds = [] }) {
        if (state.failInstall && addRules.length) throw new Error('Installation failed');
        state.rules = state.rules.filter(rule => !removeRuleIds.includes(rule.id)).concat(structuredClone(addRules));
        state.updates++;
      },
    },
    tabs: { async get(id) { return tabs.get(id); } },
    scripting: {
      async executeScript({ target, func, args }) {
        const tab = tabs.get(target.tabId);
        if (!tab || (target.documentIds && !target.documentIds.includes(tab.documentId))) return;
        const location = { href: tab.url, replace(url) { redirects.push({ id: tab.id, url }); } };
        vm.runInNewContext('(' + func.toString() + ')(...args)', { location, args });
      },
    },
  };
  const context = vm.createContext({
    browser, URL, URLSearchParams, navigator: { userAgent: `Version/${state.safariVersion ?? '27.0'} Safari` },
    localStorage: { getItem() { return state.legacyToggle ?? null; } },
  });
  for (const script of manifest.background.scripts) {
    vm.runInContext(readFileSync(path.join(resources, script), 'utf8'), context, { filename: script });
  }
  let sequence = 0;
  function commit({ tabId, url, frameId = 0 }) {
    const documentId = String(++sequence);
    listeners.beforeNavigate({ tabId, url, frameId });
    if (frameId === 0 && tabId >= 0) tabs.set(tabId, { id: tabId, url, documentId });
    return listeners.committed({ tabId, url, frameId, documentId });
  }
  return { listeners, storage, redirects, tabs, commit, setPreferences: browser.storage.local.set,
    settled: () => vm.runInContext('rulesUpdate', context) };
}

// Evaluate the browser-owned rules without running any background script.
function destination(rules, url) {
  const host = new URL(url).hostname;
  for (const { condition, action } of rules) {
    if (condition.requestDomains && !condition.requestDomains.some(d => host === d || host.endsWith('.' + d))) continue;
    const match = new RegExp(condition.regexFilter).exec(url);
    if (match) return action.redirect.regexSubstitution.replace('\\1', () => match[1]);
  }
}

module.exports = { startBackground, destination };
