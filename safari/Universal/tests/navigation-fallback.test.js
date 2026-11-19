const assert = require('node:assert/strict');
const test = require('node:test');
const { startBackground } = require('./background');

const search = query => 'https://duckduckgo.com/?t=iphone&q=' + encodeURIComponent(query);
const redirect = (id, query) => ({
  id, url: 'safari-web-extension://test/redirect.html?q=' + encodeURIComponent(query), loadReplace: true
});

test('simultaneous commits in different tabs each redirect their own query with fast redirect off', async () => {
  const { commit, redirects } = startBackground({ kagiDnrEnabled: false });
  await Promise.all([
    commit({ tabId: 6, url: 'https://duckduckgo.com/' }),
    commit({ tabId: 7, url: search('first') }),
    commit({ tabId: 8, url: search('second !g') }),
  ]);
  assert.deepEqual(redirects.sort((a, b) => a.id - b.id), [redirect(7, 'first'), redirect(8, 'second !g')]);
});

test('a newer commit wins when two searches overlap in the same tab', async () => {
  const { commit, redirects } = startBackground({ kagiDnrEnabled: false });
  const first = commit({ tabId: 7, url: search('first') });
  const second = commit({ tabId: 7, url: search('second') });
  await Promise.all([first, second]);
  assert.deepEqual(redirects, [redirect(7, 'second')]);
});

test('a stale commit cannot replace a pending navigation, an unrelated page, or a closed tab', async () => {
  const { commit, tabs, redirects } = startBackground({ kagiDnrEnabled: false });
  const url = search('old');
  const pending = commit({ tabId: 7, url });
  tabs.get(7).pendingUrl = 'https://example.org/';
  const old = commit({ tabId: 8, url });
  const newer = commit({ tabId: 8, url: 'https://example.org/' });
  const closed = commit({ tabId: 9, url });
  tabs.delete(9);
  await Promise.all([pending, old, newer, closed]);
  assert.deepEqual(redirects, []);
});

test('only main-frame commits in real tabs redirect, preserving empty queries and exact whitespace', async () => {
  const { commit, tabs, redirects } = startBackground({ kagiDnrEnabled: false });
  const url = search('main');
  // Even if the top-level URL is identical, a subframe commit must be ignored.
  tabs.set(0, { id: 0, url });
  tabs.set(-1, { id: -1, url });
  await commit({ tabId: 0, frameId: 1, url });
  await commit({ tabId: -1, url });
  await commit({ tabId: 0, url: 'https://duckduckgo.com/?t=iphone' });
  assert.deepEqual(redirects, []);
  for (const query of ['', '  two  spaces ', 'C++ & 100% 日本語']) {
    await commit({ tabId: 0, url: search(query) });
    assert.deepEqual(redirects.at(-1), redirect(0, query));
  }
});

test('a committed search can redirect while DNR installation is still pending', async () => {
  let finishCheck;
  const check = new Promise(resolve => { finishCheck = resolve; });
  const state = { isRegexSupported: () => check };
  const worker = startBackground({ kagiEngineToRedirect: 'DuckDuckGo' }, 'macOS', state);
  try {
    await worker.commit({ tabId: 7, url: search('first search') });
    assert.deepEqual(worker.redirects, [redirect(7, 'first search')]);
    assert.deepEqual(state.rules, []);
  } finally {
    finishCheck({ isSupported: true });
  }
  await worker.settled();
  assert.ok(state.rules.length > 0);
});
