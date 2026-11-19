const assert = require('node:assert/strict');
const test = require('node:test');
const { startBackground } = require('./background');

const cases = [
  ['Google', 'https://www.google.co.uk/search?q=%21g+caf%C3%A9+C%2B%2B&hl=en&client=safari'],
  ['Yahoo', 'https://nz.search.yahoo.com/search?fr=ipad&p=%21g+caf%C3%A9+C%2B%2B'],
  ['Bing', 'https://www.bing.com/search?x=y&form=APIPH1&q=%21g+caf%C3%A9+C%2B%2B'],
  ['DuckDuckGo', 'https://duckduckgo.com/?t=osx&q=%21g+caf%C3%A9+C%2B%2B'],
  ['Ecosia', 'https://www.ecosia.org/search?q=%21g+caf%C3%A9+C%2B%2B&tts=st_asaf_iphone'],
  ['Baidu', 'https://m.baidu.com/s?word=%21g+caf%C3%A9+C%2B%2B&from=1099b'],
  ['Yandex', 'https://yandex.com.tr/search?clid=1906725&text=%21g+caf%C3%A9+C%2B%2B'],
  ['360 Search', 'https://www.so.com/s?q=%21g+caf%C3%A9+C%2B%2B&ls=safarimac'],
];
const expected = 'safari-web-extension://test/redirect.html?q=%21g+caf%C3%A9+C%2B%2B';

// Evaluate the browser-owned rules without running any background script.
function destination(rules, url) {
  const host = new URL(url).hostname;
  for (const { condition, action } of rules) {
    if (condition.requestDomains && !condition.requestDomains.some(d => host === d || host.endsWith('.' + d))) continue;
    const match = new RegExp(condition.regexFilter).exec(url);
    if (match) return action.redirect.regexSubstitution.replace('\\1', () => match[1]);
  }
}

for (const platform of ['iOS', 'macOS']) {
  test(`${platform} uses installed rules on a cold search and preserves them on wake`, async () => {
    const state = {};
    await startBackground({}, platform, state).settled();
    assert.ok(state.rules.length > 0 && state.rules.length <= 1000);
    assert.equal(state.rules.length, new Set(state.rules.map(r => r.id)).size);
    for (const rule of state.rules) {
      assert.deepEqual(rule.condition.resourceTypes, ['main_frame']);
      assert.equal(rule.condition.isUrlFilterCaseSensitive, true);
    }
    for (const [, url] of cases) assert.equal(destination(state.rules, url), expected, url);
    for (const url of [
      'https://www.google.co.uk/search?q=direct',
      'https://www.google.co.uk/search?q=direct&notclient=safari',
      'https://www.google.invalid/search?q=direct&client=safari',
      'https://www.google.evil.google.co.uk/search?q=direct&client=safari',
      'https://duckduckgo.com/?q=direct&t=iphone123',
      'https://duckduckgo.com/?q=direct#&t=iphone',
      'https://kagi.com/search?q=!g+bang',
    ]) assert.equal(destination(state.rules, url), undefined, url);
    await startBackground({}, platform, state).settled();
    assert.equal(state.updates, 1);
  });
}

test('every engine selection persists across restart; All restores every engine', async () => {
  const state = {};
  let worker = startBackground({}, 'macOS', state);
  await worker.settled();
  for (const [selection] of [...cases, ['Sogou'], ['All']]) {
    await worker.setPreferences({ kagiEngineToRedirect: selection });
    await worker.settled();
    for (const [engine, url] of cases) {
      const selected = selection === 'All' || engine === (selection === 'Sogou' ? '360 Search' : selection);
      assert.equal(destination(state.rules, url), selected ? expected : undefined, selection + ': ' + url);
    }
    const count = state.updates;
    worker = startBackground({}, 'macOS', state);
    await worker.settled();
    assert.equal(state.updates, count);
  }
});

test('the fast-redirect toggle survives restart and honors the released opt-out', async () => {
  const state = { legacyToggle: 'false' };
  const worker = startBackground({}, 'iOS', state);
  await worker.settled();
  assert.deepEqual(state.rules, []);
  await worker.setPreferences({ kagiEngineToRedirect: 'Bing', kagiDnrEnabled: true });
  await worker.settled();
  assert.equal(destination(state.rules, cases[2][1]), expected);
  await worker.setPreferences({ kagiDnrEnabled: false });
  await worker.settled();
  const cold = startBackground({}, 'iOS', state);
  await cold.settled();
  assert.deepEqual(state.rules, []);
  await cold.commit({ tabId: 12, url: cases[2][1] });
  assert.deepEqual(cold.redirects, [{ id: 12, url: 'safari-web-extension://test/redirect.html?q=!g%20caf%C3%A9%20C%2B%2B', loadReplace: true }]);
  await cold.setPreferences({ kagiDnrEnabled: true });
  await cold.settled();
  assert.equal(destination(state.rules, cases[2][1]), expected);
  assert.equal(destination(state.rules, cases[3][1]), undefined);
});

test('a failed upgrade clears obsolete rules and a later wake retries', async () => {
  const legacy = { id: 1, action: { type: 'redirect', redirect: { url: 'https://kagi.com/' } }, condition: {} };
  const state = { rules: [legacy], failInstall: true };
  await startBackground({}, 'macOS', state).settled();
  assert.deepEqual(state.rules, []);
  state.failInstall = false;
  await startBackground({}, 'macOS', state).settled();
  assert.equal(destination(state.rules, cases[3][1]), expected);
});

test('unsupported regexes and private link edits leave supported rules installed', async () => {
  const state = { isRegexSupported: async ({ regex }) => ({ isSupported: !regex.includes('duckduckgo') }) };
  const worker = startBackground({}, 'iOS', state);
  await worker.settled();
  assert.equal(destination(state.rules, cases[3][1]), undefined);
  assert.equal(destination(state.rules, cases[0][1]), expected);
  const rulesBeforeEdit = structuredClone(state.rules);
  for (const link of ['https://kagi.com/search?token=first', 'https://kagi.com/search?token=replacement', '']) {
    await worker.setPreferences({ kagiPrivateSessionLink: link });
    await worker.settled();
    assert.equal(state.updates, 1);
    assert.deepEqual(state.rules, rulesBeforeEdit);
  }
  await startBackground({}, 'iOS', state).settled();
  assert.equal(state.updates, 1);
  assert.ok(!JSON.stringify(state.rules).includes('token'));
});

test('an engine search that commits despite an installed DNR rule still redirects once', async () => {
  const state = {};
  const worker = startBackground({ kagiEngineToRedirect: 'DuckDuckGo' }, 'macOS', state);
  await worker.settled();
  const url = cases[3][1];
  assert.equal(destination(state.rules, url), expected);
  await worker.commit({ tabId: 7, url });
  assert.deepEqual(worker.redirects, [{
    id: 7, url: 'safari-web-extension://test/redirect.html?q=!g%20caf%C3%A9%20C%2B%2B', loadReplace: true
  }]);
  await worker.commit({ tabId: 7, url: worker.redirects[0].url });
  assert.equal(worker.redirects.length, 1);
});

test('both manifests limit website access to the redirect engines and Kagi session capture', () => {
  const { navigationFilter } = startBackground().listeners;
  const hosts = new Set(navigationFilter.url.map(filter => filter.hostEquals).filter(Boolean));
  for (const { hostSuffix } of navigationFilter.url) {
    if (hostSuffix) {
      // A wildcard match pattern covers the base host and regional subdomains.
      hosts.delete(hostSuffix.slice(1));
      hosts.add('*' + hostSuffix);
    }
  }
  const engines = Array.from(hosts, host => `https://${host}/*`).sort();
  const kagi = '*://*.kagi.com/*';
  for (const platform of ['iOS', 'macOS']) {
    const manifest = require(`../${platform} (Extension)/manifest.json`);
    assert.deepEqual(manifest.host_permissions.slice().sort(), [...engines, kagi].sort());
    assert.equal(manifest.web_accessible_resources.length, 1);
    const [redirect] = manifest.web_accessible_resources;
    assert.deepEqual(redirect.resources, ['redirect.html']);
    assert.deepEqual(redirect.matches.slice().sort(), engines);
    assert.deepEqual(manifest.content_scripts.map(({ js, matches }) => ({ js, matches })), [
      { js: ['kagi-content-script.js'], matches: [kagi] },
    ]);
    assert.equal(manifest.permissions.includes('activeTab'), false);
    assert.deepEqual(manifest.optional_permissions, []);
    assert.deepEqual(manifest.optional_host_permissions ?? [], []);
  }
});
