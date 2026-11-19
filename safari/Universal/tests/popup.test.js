const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const resources = path.join(__dirname, '..', 'Shared (Extension)', 'Resources');

function engineValues() {
  const html = fs.readFileSync(path.join(resources, 'popup.html'), 'utf8');
  const select = html.match(/<select\b[^>]*id="engine-to-redirect"[^>]*>([\s\S]*?)<\/select>/)[1];
  return Array.from(select.matchAll(/<option value="([^"]+)"/g), match => match[1]);
}

test('the popup offers all eight redirect engines and the All selection', () => {
  assert.deepEqual(engineValues().sort(), ['360 Search', 'All', 'Baidu', 'Bing', 'DuckDuckGo', 'Ecosia', 'Google', 'Yahoo', 'Yandex']);
});

async function openPopup(values, origins) {
  const elements = new Map();
  const writes = [];
  function element(id) {
    if (!elements.has(id)) elements.set(id, {
      handlers: {}, classList: { toggle() {} },
      addEventListener(event, callback) { this.handlers[event] = callback; }
    });
    return elements.get(id);
  }
  const engine = element('engine-to-redirect');
  engine.options = engineValues().map(value => ({ value, disabled: false }));
  engine.selectedIndex = 0;
  engine.namedItem = value => engine.options.find(option => option.value === value);
  Object.defineProperty(engine, 'value', {
    get() { return engine.options[engine.selectedIndex]?.value; },
    set(value) { engine.selectedIndex = engine.options.findIndex(option => option.value === value); }
  });
  let onLoad;
  const context = vm.createContext({
    // Deliberately no runtime or DNR API: settings have a single storage owner.
    browser: {
      storage: { local: {
        async get() { return { ...values }; },
        async set(prefs) { writes.push({ ...prefs }); Object.assign(values, prefs); }
      } },
      permissions: { async getAll() { return { origins }; } }
    },
    navigator: { userAgent: 'Version/26.2 Safari' },
    document: {
      querySelector: selector => element(selector.slice(1)),
      getElementById: element,
      querySelectorAll(selector) {
        if (selector !== '[data-engine]') return [];
        return Array.from(element('current-overrides').innerHTML.matchAll(/data-engine="([^"]+)"/g),
          match => ({ getAttribute: () => match[1] }));
      },
      addEventListener(event, handler) { if (event === 'DOMContentLoaded') onLoad = handler; }
    }
  });
  for (const script of ['rule-builder.js', 'popup.js']) {
    vm.runInContext(fs.readFileSync(path.join(resources, script), 'utf8'), context, { filename: script });
  }
  onLoad();
  await new Promise(resolve => setImmediate(resolve));
  return { element, engine, writes };
}

test('popup settings persist without messaging or writing DNR rules', async () => {
  const values = { kagiEngineToRedirect: 'Yahoo' };
  const bing = 'https://www.bing.com/*';
  const { element, engine } = await openPopup(values, [bing]);
  const input = element('private-session-link');
  // The input event sees the resulting field value, including partial replacements by paste.
  for (const value of ['https://kagi.com/search?token=first', 'https://kagi.com/search?token=second', '']) {
    input.value = value;
    input.handlers.input({ currentTarget: input });
    assert.equal(values.kagiPrivateSessionLink, value);
  }
  engine.value = 'Bing';
  await engine.handlers.change();
  assert.equal(values.kagiEngineToRedirect, 'Bing');
  const reopened = await openPopup(values, [bing, 'https://uk.search.yahoo.com/*']);
  assert.equal(reopened.engine.value, 'Bing');
  const checkbox = element('is-dnr-enabled');
  checkbox.checked = false;
  checkbox.onchange();
  assert.equal(values.kagiDnrEnabled, false);
});

test('reopening the popup after revoking and restoring access preserves the saved engine', async () => {
  const values = { kagiEngineToRedirect: 'Yahoo' };
  const yahoo = 'https://uk.search.yahoo.com/*';
  const google = 'https://www.google.com/*';
  for (const [origins, enabled] of [
    [[google, yahoo], ['All', 'Google', 'Yahoo']],
    [[google], ['All', 'Google']],
    [[], ['All']],
    [['https://kagi.com/*'], ['All']],
    [[yahoo], ['All', 'Yahoo']],
    [['<all_urls>'], engineValues()],
    [['*://*/*'], engineValues()],
  ]) {
    const { engine, writes } = await openPopup(values, origins);
    assert.equal(values.kagiEngineToRedirect, 'Yahoo', 'opening the popup changed the saved preference');
    assert.deepEqual(writes, []);
    assert.equal(engine.value, 'Yahoo');
    assert.deepEqual(engine.options.filter(option => !option.disabled).map(option => option.value), enabled);
  }
});
