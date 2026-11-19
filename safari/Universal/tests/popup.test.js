const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

test('popup settings persist without messaging or writing DNR rules', async () => {
  const values = {};
  const elements = new Map();
  function element(id) {
    if (!elements.has(id)) elements.set(id, {
      handlers: {}, options: [{ value: 'All' }, { value: 'Bing' }], selectedIndex: 0,
      namedItem(value) { return this.options.find(option => option.value === value); },
      addEventListener(event, callback) { this.handlers[event] = callback; }
    });
    return elements.get(id);
  }
  const context = vm.createContext({
    // Deliberately no runtime or DNR API: settings have a single storage owner.
    browser: { storage: { local: { set: async prefs => { Object.assign(values, prefs); } } } },
    document: {
      querySelector: selector => element(selector.slice(1)),
      getElementById: element,
      addEventListener() {}
    }
  });
  const source = fs.readFileSync(path.join(__dirname, '..', 'Shared (Extension)', 'Resources', 'popup.js'), 'utf8');
  vm.runInContext(source, context);
  const input = element('private-session-link');
  // The input event sees the resulting field value, including partial replacements by paste.
  for (const value of ['https://kagi.com/search?token=first', 'https://kagi.com/search?token=second', '']) {
    input.value = value;
    input.handlers.input({ currentTarget: input });
    assert.equal(values.kagiPrivateSessionLink, value);
  }
  const engine = element('engine-to-redirect');
  engine.selectedIndex = 1;
  await engine.handlers.change();
  assert.equal(values.kagiEngineToRedirect, 'Bing');
  const checkbox = element('is-dnr-enabled');
  checkbox.checked = false;
  checkbox.onchange();
  assert.equal(values.kagiDnrEnabled, false);
});
