const assert = require('node:assert/strict');
const test = require('node:test');
const { startBackground, destination } = require('./background');

// Engine, Safari URL, and the parameter that identifies an address-bar search.
const searches = [
  ['Google', 'https://www.google.com/search?client=safari&q=red+panda', 'client'],
  ['Google', 'https://www.google.co.uk/search?q=red+panda&ie=UTF-8&oe=UTF-8&hl=en-gb&client=safari', 'client'],
  ['Google', 'https://google.com.hk/search?q=red+panda&client=safari', 'client'],
  ['Yahoo', 'https://search.yahoo.com/search?p=red+panda&fr=iphone', 'fr'],
  ['Yahoo', 'https://uk.search.yahoo.com/search?p=red+panda&fr=ipad', 'fr'],
  ['Yahoo', 'https://nz.search.yahoo.com/search?fr=applpd&p=red+panda', 'fr'],
  ['Yahoo', 'https://fr.search.yahoo.com/search?fr=aaplw&p=red+panda', 'fr'],
  ['Yahoo', 'https://jp.search.yahoo.com/search?p=red+panda&fr=appsfch2', 'fr'],
  ['Yahoo', 'https://search.yahoo.co.jp/search?p=red+panda&fr=applep1', 'fr'],
  ['Bing', 'https://www.bing.com/search?form=APIPH1&q=red+panda', 'form'],
  ['Bing', 'https://www.bing.com/search?q=red+panda&form=APIPA1', 'form'],
  ['Bing', 'https://www.bing.com/search?q=red+panda&form=APMCS1', 'form'],
  ['DuckDuckGo', 'https://duckduckgo.com/?q=red+panda&t=iphone', 't'],
  ['DuckDuckGo', 'https://duckduckgo.com/?t=ipad&q=red+panda', 't'],
  ['DuckDuckGo', 'https://duckduckgo.com/?q=red+panda&t=osx', 't'],
  ['DuckDuckGo', 'https://duckduckgo.com/?ia=web&q=red+panda&t=iphone', 't'],
  ['DuckDuckGo', 'https://duckduckgo.com/?ia=web&t=iphone&q=red+panda', 't'],
  ['Ecosia', 'https://www.ecosia.org/search?tts=st_asaf_iphone&q=red+panda', 'tts'],
  ['Ecosia', 'https://www.ecosia.org/search?q=red+panda&tts=st_asaf_ipad', 'tts'],
  ['Ecosia', 'https://www.ecosia.org/search?tts=st_asaf_macos&q=red+panda', 'tts'],
  ['Baidu', 'https://m.baidu.com/s?from=1000539d&word=red+panda', 'from'],
  ['Baidu', 'https://m.baidu.com/s?word=red+panda&from=1099b', 'from'],
  ['Baidu', 'https://www.baidu.com/s?tn=84053098_1_dg&wd=red+panda', 'tn'],
  ['Baidu', 'https://www.baidu.com/s?wd=red+panda&tn=84053098_4_dg', 'tn'],
  ['Baidu', 'https://www.baidu.com/s?wd=red+panda&tn=84053098_dg', 'tn'],
  ['Yandex', 'https://yandex.com.tr/search/touch/?clid=1906591&text=red+panda', 'clid'],
  ['Yandex', 'https://yandex.ru/search/touch/?clid=1906591&text=red+panda', 'clid'],
  ['Yandex', 'https://yandex.kz/search/pad/?clid=1906723&text=red+panda', 'clid'],
  ['Yandex', 'https://yandex.by/search?text=red+panda&clid=1906725', 'clid'],
  ['360 Search', 'https://m.so.com/s?q=red+panda&src=home&srcg=safariwap_1', 'srcg'],
  ['360 Search', 'https://www.so.com/s?q=red+panda&src=pclm&ls=safarimac', 'ls'],
];

const frame = { tabId: 7 };
const expected = [{ id: 7, url: 'https://kagi.com/search?q=red%20panda' }];

for (const platform of ['iOS', 'macOS']) {
  test(`${platform} redirects marked searches and leaves engine-site searches alone`, async () => {
    for (const [engine, url, marker] of searches) {
      const { commit, listeners, redirects } = startBackground({ kagiDnrEnabled: false, kagiEngineToRedirect: engine }, platform);
      const ordinary = new URL(url);
      ordinary.searchParams.delete(marker);
      await commit({ ...frame, url: ordinary.href });
      ordinary.searchParams.set(marker, new URL(url).searchParams.get(marker) + 'extra');
      await commit({ ...frame, url: ordinary.href });
      assert.deepEqual(redirects, [], `Unmarked or invalid ${engine} marker on ${url}`);

      const host = ordinary.hostname;
      assert.ok(listeners.navigationFilter.url.some(condition =>
        condition.hostEquals === host || (condition.hostSuffix && host.endsWith(condition.hostSuffix))
      ), `Navigation filter omitted ${host}`);
      await commit({ ...frame, url });
      assert.deepEqual(redirects, expected, url);
    }
  });
}

test('the fallback passes bangs to Kagi once and leaves their destination open', async () => {
  for (const query of ['!g ça C++', 'ça C++ !g']) {
    const { commit, redirects } = startBackground({ kagiDnrEnabled: false });
    const params = new URLSearchParams({ t: 'iphone', q: query });
    await commit({ ...frame, url: `https://duckduckgo.com/?${params}` });
    const page = `https://kagi.com/search?q=${encodeURIComponent(query)}`;
    assert.deepEqual(redirects, [{ id: 7, url: page }]);

    await commit({ ...frame, url: page });
    await commit({ ...frame, url: 'https://www.google.com/search?q=%C3%A7a+C%2B%2B' });
    assert.equal(redirects.length, 1);
  }
});

test('installed rules require the same exact Safari markers and preserve the raw query', async () => {
  const state = {};
  await startBackground({}, 'macOS', state).settled();
  for (const [, url, marker] of searches) {
    assert.equal(destination(state.rules, url), 'safari-web-extension://test/redirect.html?q=red+panda', url);
    const ordinary = new URL(url);
    ordinary.searchParams.delete(marker);
    assert.equal(destination(state.rules, ordinary.href), undefined, ordinary.href);
    ordinary.searchParams.set(marker, new URL(url).searchParams.get(marker) + 'extra');
    assert.equal(destination(state.rules, ordinary.href), undefined, ordinary.href);
  }
});

test('both redirect paths ignore unsupported hosts, paths, and marker lookalikes', async () => {
  const state = {};
  const worker = startBackground({}, 'macOS', state);
  await worker.settled();
  for (const url of [
    'https://www.google.co.uk.evil.example/search?client=safari&q=test',
    'https://maps.google.co.uk/search?client=safari&q=test',
    'https://www.google.evil.google.co.uk/search?client=safari&q=test',
    'https://www.google.invalid/search?client=safari&q=test',
    'https://evil.duckduckgo.com/?q=test&t=iphone',
    'https://duckduckgo.com/?q=test&not_t=iphone',
    'https://www.google.co.uk/search?q=test&notclient=safari',
    'https://www.google.co.uk/images?client=safari&q=test',
    'http://www.google.co.uk/search?client=safari&q=test',
    'https://www.google.co.uk:8443/search?client=safari&q=test',
    'https://nested.uk.search.yahoo.com/search?p=test&fr=iphone',
    'https://other.search.yahoo.com/search?p=test&fr=iphone',
    'https://m.baidu.com/s?tn=84053098_dg&wd=test',
    'https://yandex.ru/search/touch/?clid=1906725&text=test',
    'https://m.so.com/s?q=test&ls=safarimac',
    'https://m.sogou.com/web/sl?keyword=test&v=5',
    'https://www.sogou.com/web?query=test&ie=utf8',
  ]) {
    assert.equal(destination(state.rules, url), undefined, url);
    await worker.commit({ ...frame, url });
  }
  assert.deepEqual(worker.redirects, []);
});

test('opening a link leaves it alone and an address-bar search for its URL preserves the text', async () => {
  const state = {};
  const worker = startBackground({}, 'iOS', state);
  await worker.settled();
  const link = 'https://example.org/article?id=5&utm_source=email#section';
  assert.equal(destination(state.rules, link), undefined);
  await worker.commit({ ...frame, url: link });
  assert.deepEqual(worker.redirects, []);

  const search = new URL('https://www.google.com/search?client=safari');
  search.searchParams.set('q', link);
  const redirectPage = 'safari-web-extension://test/redirect.html?q=' + encodeURIComponent(link);
  assert.equal(destination(state.rules, search.href), redirectPage);
  await worker.commit({ ...frame, url: search.href });
  assert.deepEqual(worker.redirects, [{ id: frame.tabId, url: `https://kagi.com/search?q=${encodeURIComponent(link)}` }]);
});

test('honors the selected engine on startup and when the popup changes it', async () => {
  const { commit, setPreferences, redirects } = startBackground({ kagiDnrEnabled: false, kagiEngineToRedirect: 'Baidu' });
  const url = 'https://uk.search.yahoo.com/search?p=red+panda&fr=iphone';
  await commit({ ...frame, url });
  assert.deepEqual(redirects, []);
  await setPreferences({ kagiEngineToRedirect: 'Yahoo' });
  await commit({ ...frame, url });
  assert.deepEqual(redirects, expected);
});

test('both the 360 Search selection and its old Sogou label match only marked so.com searches', async () => {
  for (const engine of ['360 Search', 'Sogou']) {
    const { commit, redirects } = startBackground({ kagiDnrEnabled: false, kagiEngineToRedirect: engine });
    await commit({ ...frame, url: 'https://www.google.com/search?client=safari&q=test' });
    await commit({ ...frame, url: 'https://www.sogou.com/web?query=test&ie=utf8' });
    await commit({ ...frame, url: 'https://www.so.com/s?q=red+panda&ls=safarimac' });
    assert.deepEqual(redirects, expected, engine);
  }
});
