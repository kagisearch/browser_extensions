const assert = require('node:assert/strict');
const test = require('node:test');
const { startBackground, destination } = require('./background');

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

for (const platform of ['iOS', 'macOS']) {
  test(`${platform} uses installed rules on a cold search and preserves them on wake`, async () => {
    const state = {};
    await startBackground({}, platform, state).settled();
    assert.ok(state.rules.length > 0 && state.rules.length <= 1000);
    assert.equal(state.rules.length, new Set(state.rules.map(r => r.id)).size);
    for (const rule of state.rules) {
      assert.deepEqual(rule.condition.resourceTypes, ['main_frame']);
      assert.equal(rule.condition.isUrlFilterCaseSensitive, true);
      assert.equal((rule.condition.regexFilter.match(/\(/g) ?? []).length, 1, rule.condition.regexFilter);
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

test('an unknown saved engine enables all supported engines in both redirect paths', async () => {
  const state = {};
  const worker = startBackground({ kagiEngineToRedirect: 'AltaVista' }, 'iOS', state);
  await worker.settled();
  for (const [engine, url] of cases) {
    assert.equal(destination(state.rules, url), expected, engine);
    await worker.commit({ tabId: 1, url });
  }
  assert.equal(worker.redirects.length, cases.length);
  assert.ok(worker.redirects.every(change => new URL(change.url).searchParams.get('q') === '!g café C++'));
});

test('regional Google rules preserve the query in either parameter order on every declared host', async () => {
  const state = {};
  const worker = startBackground({ kagiEngineToRedirect: 'Google' }, 'iOS', state);
  await worker.settled();
  const hosts = worker.listeners.navigationFilter.url.map(filter => filter.hostEquals)
    .filter(host => /^(www\.)?google\./.test(host));
  assert.ok(hosts.includes('www.google.co.uk'));
  for (const host of hosts) {
    for (const search of ['client=safari&q=red+pandas', 'q=red+pandas&ie=UTF-8&oe=UTF-8&hl=en-gb&client=safari']) {
      const url = `https://${host}/search?${search}`;
      assert.equal(destination(state.rules, url), 'safari-web-extension://test/redirect.html?q=red+pandas', url);
      await worker.commit({ tabId: 3, url });
      assert.equal(worker.redirects.pop()?.url, 'https://kagi.com/search?q=red%20pandas', url);
    }
  }
});

test('a regional iPad search uses the fallback before Safari 15.4 or when DNR is unavailable', async () => {
  const url = 'https://www.google.co.uk/search?q=red+pandas&ie=UTF-8&hl=en-gb&client=safari';
  for (const state of [{ safariVersion: '15.3' }, { dnrAvailable: false }]) {
    const worker = startBackground({}, 'iOS', state);
    await worker.settled();
    assert.deepEqual(state.rules, []);
    await worker.commit({ tabId: 4, url });
    assert.deepEqual(worker.redirects, [{ id: 4, url: 'https://kagi.com/search?q=red%20pandas' }]);
  }
});

test('Safari 15.4 and 17 replace legacy host and bang rules on upgrade', async () => {
  for (const safariVersion of ['15.4', '17.6']) {
    const legacy = [
      { id: 1, priority: 2, action: { type: 'redirect', redirect: { url: 'https://kagi.com/' } },
        condition: { regexFilter: '^https://www[.]baidu[.]com/', resourceTypes: ['main_frame'] } },
      { id: 2, priority: 3, action: { type: 'redirect', redirect: { url: 'https://www.google.com/' } },
        condition: { regexFilter: '^https://kagi[.]com/.*!g', resourceTypes: ['main_frame'] } },
    ];
    const state = { safariVersion, rules: legacy };
    await startBackground({}, 'iOS', state).settled();
    assert.ok(state.rules.every(rule => rule.id !== 1 && rule.id !== 2));
    assert.equal(destination(state.rules, 'https://www.baidu.com/s?wd=direct'), undefined);
    assert.equal(destination(state.rules, 'https://kagi.com/search?q=test!g'), undefined);
    assert.equal(destination(state.rules, cases[0][1]), expected);
  }
});

test('wake restores discarded rules and repairs a stale domain allowlist', async () => {
  const state = {};
  await startBackground({}, 'macOS', state).settled();
  const expectedRules = structuredClone(state.rules);
  state.rules.pop();
  for (const { condition } of state.rules) {
    if (condition.requestDomains) condition.requestDomains = ['google.com'];
  }
  assert.equal(destination(state.rules, cases[0][1]), undefined);
  await startBackground({}, 'macOS', state).settled();
  assert.equal(state.updates, 2);
  assert.deepEqual([...state.rules].sort((a, b) => a.id - b.id), expectedRules);
});

test('Safari can return rule properties and domain lists in a different order without a write', async () => {
  const state = {};
  await startBackground({}, 'iOS', state).settled();
  state.rules = state.rules.reverse().map(rule => {
    const condition = Object.fromEntries(Object.entries(rule.condition).reverse());
    if (condition.requestDomains) condition.requestDomains.reverse();
    return { condition, action: rule.action, priority: rule.priority, id: rule.id };
  });
  await startBackground({}, 'iOS', state).settled();
  assert.equal(state.updates, 1);
  assert.equal(destination(state.rules, cases[0][1]), expected);
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
  assert.deepEqual(cold.redirects, [{ id: 12, url: 'https://kagi.com/search?q=!g%20caf%C3%A9%20C%2B%2B' }]);
  await cold.setPreferences({ kagiDnrEnabled: true });
  await cold.settled();
  assert.equal(destination(state.rules, cases[2][1]), expected);
  assert.equal(destination(state.rules, cases[3][1]), undefined);
});

test('a failed upgrade clears obsolete rules and a later wake retries', async () => {
  const legacy = { id: 1, action: { type: 'redirect', redirect: { url: 'https://kagi.com/' } }, condition: {} };
  const state = { rules: [legacy], failInstall: true };
  const worker = startBackground({}, 'macOS', state);
  await worker.settled();
  assert.deepEqual(state.rules, []);
  await worker.commit({ tabId: 5, url: cases[3][1] });
  assert.equal(new URL(worker.redirects[0].url).searchParams.get('q'), '!g café C++');
  state.failInstall = false;
  await startBackground({}, 'macOS', state).settled();
  assert.equal(destination(state.rules, cases[3][1]), expected);
});

test('unsupported regexes and private link edits leave supported rules installed', async () => {
  const state = { isRegexSupported: async ({ regex }) => ({ isSupported: !regex.includes('duckduckgo') }) };
  const worker = startBackground({}, 'iOS', state);
  await worker.settled();
  assert.equal(destination(state.rules, cases[3][1]), undefined);
  await worker.commit({ tabId: 2, url: cases[3][1] });
  assert.equal(new URL(worker.redirects[0].url).searchParams.get('q'), '!g café C++');
  assert.equal(destination(state.rules, cases[0][1]), expected);
  await worker.setPreferences({ kagiPrivateSessionLink: 'https://kagi.com/search?token=sample' });
  await worker.settled();
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
    id: 7, url: 'https://kagi.com/search?q=!g%20caf%C3%A9%20C%2B%2B'
  }]);
  await worker.commit({ tabId: 7, url: worker.redirects[0].url });
  assert.equal(worker.redirects.length, 1);
});

test('both manifests expose the redirect page to all supported engine hosts', async () => {
  const state = {};
  await startBackground({}, 'macOS', state).settled();
  const google = state.rules.find(rule => rule.condition.requestDomains).condition.requestDomains;
  const hosts = [...google.flatMap(host => [host, 'www.' + host]), ...cases.map(([, url]) => new URL(url).hostname),
    'search.yahoo.com', 'search.yahoo.co.jp', 'www.baidu.com', 'm.so.com',
    'yandex.ru', 'yandex.com', 'yandex.kz', 'yandex.by', 'yandex.ua'];
  for (const platform of ['iOS', 'macOS']) {
    const manifest = require(`../${platform} (Extension)/manifest.json`);
    const { matches } = manifest.web_accessible_resources.find(entry => entry.resources.includes('redirect.html'));
    assert.ok(matches.every(pattern => pattern.startsWith('https://')));
    for (const host of hosts) {
      assert.ok(matches.includes(`https://${host}/*`) || matches.some(pattern => {
        if (!pattern.startsWith('https://*.')) return false;
        const domain = pattern.slice('https://*.'.length, -2);
        return host === domain || host.endsWith('.' + domain);
      }), `${platform}: ${host}`);
    }
  }
});
