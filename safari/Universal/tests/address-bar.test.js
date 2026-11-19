const assert = require('node:assert/strict');
const test = require('node:test');
const { startBackground } = require('./background');

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
  ['Ecosia', 'https://www.ecosia.org/search?tts=st_asaf_iphone&q=red+panda', 'tts'],
  ['Ecosia', 'https://www.ecosia.org/search?q=red+panda&tts=st_asaf_ipad', 'tts'],
  ['Ecosia', 'https://www.ecosia.org/search?tts=st_asaf_macos&q=red+panda', 'tts'],
  ['Baidu', 'https://m.baidu.com/s?from=1000539d&word=red+panda', 'from'],
  ['Baidu', 'https://m.baidu.com/s?word=red+panda&from=1099b', 'from'],
  ['Baidu', 'https://www.baidu.com/s?tn=84053098_1_dg&wd=red+panda', 'tn'],
  ['Baidu', 'https://www.baidu.com/s?wd=red+panda&tn=84053098_4_dg', 'tn'],
  ['Baidu', 'https://www.baidu.com/s?wd=red+panda&tn=84053098_dg', 'tn'],
  ['Yandex', 'https://yandex.com.tr/search/touch/?clid=1906591&text=red+panda', 'clid'],
  ['Yandex', 'https://yandex.kz/search/pad/?clid=1906723&text=red+panda', 'clid'],
  ['Yandex', 'https://yandex.by/search?text=red+panda&clid=1906725', 'clid'],
  ['360 Search', 'https://m.so.com/s?q=red+panda&src=home&srcg=safariwap_1', 'srcg'],
  ['360 Search', 'https://www.so.com/s?q=red+panda&src=pclm&ls=safarimac', 'ls'],
];

const frame = { parentFrameId: -1, tabId: 7 };
const expected = [[7, 'https://kagi.com/search?q=red%20panda']];

for (const platform of ['iOS', 'macOS']) {
  test(`${platform} redirects marked searches and leaves engine-site searches alone`, async () => {
    for (const [engine, url, marker] of searches) {
      const { listeners, redirects } = startBackground({ kagiEngineToRedirect: engine }, platform);
      const ordinary = new URL(url);
      ordinary.searchParams.delete(marker);
      listeners.navigate({ ...frame, url: ordinary.href });
      ordinary.searchParams.set(marker, new URL(url).searchParams.get(marker) + 'extra');
      listeners.navigate({ ...frame, url: ordinary.href });
      await Promise.resolve();
      assert.deepEqual(redirects, [], `Unmarked or invalid ${engine} marker on ${url}`);

      const host = ordinary.hostname;
      assert.ok(listeners.navigationFilter.url.some(condition =>
        condition.hostEquals === host || (condition.hostSuffix && host.endsWith(condition.hostSuffix))
      ), `Navigation filter omitted ${host}`);
      listeners.navigate({ ...frame, url });
      await Promise.resolve();
      assert.deepEqual(redirects, expected, url);
    }
  });
}

test('bangs reach Kagi once and their destination stays open', async () => {
  for (const query of ['!g ça C++', 'ça C++ !g']) {
    const { listeners, redirects } = startBackground();
    const params = new URLSearchParams({ t: 'iphone', q: query });
    listeners.navigate({ ...frame, url: `https://duckduckgo.com/?${params}` });
    await Promise.resolve();
    const kagiURL = `https://kagi.com/search?q=${encodeURIComponent(query)}`;
    assert.deepEqual(redirects, [[7, kagiURL]]);

    // A fresh worker rules out the redirect throttle hiding a bang loop.
    const outgoing = startBackground();
    outgoing.listeners.navigate({ ...frame, url: kagiURL });
    outgoing.listeners.navigate({ ...frame, url: 'https://www.google.com/search?q=%C3%A7a+C%2B%2B' });
    await Promise.resolve();
    assert.deepEqual(outgoing.redirects, []);
  }
});

test('ignores unsupported hosts, paths, and marker lookalikes', async () => {
  const { listeners, redirects } = startBackground();
  for (const url of [
    'https://www.google.co.uk.evil.example/search?client=safari&q=test',
    'https://maps.google.co.uk/search?client=safari&q=test',
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
    listeners.navigate({ ...frame, url });
  }
  await Promise.resolve();
  assert.deepEqual(redirects, []);
});

test('honors the selected engine on startup and when the popup changes it', async () => {
  const { listeners, storage, redirects } = startBackground({ kagiEngineToRedirect: 'Baidu' });
  const url = 'https://uk.search.yahoo.com/search?p=red+panda&fr=iphone';
  listeners.navigate({ ...frame, url });
  await Promise.resolve();
  assert.deepEqual(redirects, []);
  storage.kagiEngineToRedirect = 'Yahoo';
  await listeners.message({ updatedKagiEngineToRedirect: 'Yahoo' });
  listeners.navigate({ ...frame, url });
  await Promise.resolve();
  assert.deepEqual(redirects, expected);
});

test('both the 360 Search selection and its old Sogou label match only marked so.com searches', async () => {
  for (const engine of ['360 Search', 'Sogou']) {
    const { listeners, redirects } = startBackground({ kagiEngineToRedirect: engine });
    listeners.navigate({ ...frame, url: 'https://www.google.com/search?client=safari&q=test' });
    listeners.navigate({ ...frame, url: 'https://www.sogou.com/web?query=test&ie=utf8' });
    listeners.navigate({ ...frame, url: 'https://www.so.com/s?q=red+panda&ls=safarimac' });
    await Promise.resolve();
    assert.deepEqual(redirects, expected, engine);
  }
});
