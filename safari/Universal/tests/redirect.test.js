const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '..', 'Shared (Extension)', 'Resources', 'redirect.js'), 'utf8');

async function redirect(options = {}) {
  const { query = 'caf%C3%A9+%26+privacy', incognito = false,
    tabError = false, tabMissing = false, storageError = false } = options;
  const link = Object.hasOwn(options, 'link') ? options.link : 'https://kagi.com/search?token=private';
  let destination;
  let reads = 0;
  const message = {};
  const context = vm.createContext({
    URL, encodeURIComponent,
    document: { getElementById: () => message },
    window: { location: {
      href: `safari-web-extension://test/redirect.html${query === null ? '' : '?q=' + query}`,
      replace(url) { destination = url; }
    } },
    browser: {
      tabs: { getCurrent: async () => {
        if (tabError) throw new Error('tab unavailable');
        return tabMissing ? undefined : { incognito };
      } },
      storage: { local: { get: async () => {
        reads++;
        if (storageError) throw new Error('storage unavailable');
        return { kagiPrivateSessionLink: link };
      } } }
    }
  });
  // Run the real page's top-level call and drain its asynchronous work.
  vm.runInContext(source, context);
  for (let i = 0; i < 3; i++) await new Promise(resolve => setImmediate(resolve));
  return { destination, reads, message };
}

test('regular tabs never read or attach the private-session link', async () => {
  const result = await redirect();
  assert.equal(result.destination, 'https://kagi.com/search?q=caf%C3%A9%20%26%20privacy');
  assert.equal(result.reads, 0);
});

test('private tabs use the current token and preserve query encoding', async () => {
  for (const token of ['old', 'replacement', 'a+b&c=d']) {
    const result = await redirect({ incognito: true,
      link: ` https://kagi.com/search?token=${encodeURIComponent(token)}&q=stale#fragment ` });
    const destination = new URL(result.destination);
    assert.equal(destination.searchParams.get('token'), token);
    assert.equal(destination.searchParams.get('q'), 'café & privacy');
    assert.equal(destination.hash, '');
  }
});

test('cleared, malformed and non-Kagi session links fall back to normal authentication', async () => {
  for (const link of ['', '   ', undefined, 123, 'not a URL', 'javascript:alert(1)',
    'http://kagi.com/search?token=secret', 'https://evil.com/search?token=secret',
    'https://kagi.com.evil.com/search?token=secret', 'https://user:pass@kagi.com/search?token=secret',
    'https://kagi.com/login?token=secret', 'https://kagi.com/search?token=']) {
    const result = await redirect({ incognito: true, link });
    assert.equal(new URL(result.destination).searchParams.has('token'), false, String(link));
    assert.equal(new URL(result.destination).searchParams.get('q'), 'café & privacy');
  }
});

test('missing tab information or failed storage reads cannot strand searches or expose tokens', async () => {
  for (const options of [{ tabError: true }, { tabMissing: true }, { incognito: null }, { incognito: true, storageError: true }]) {
    const result = await redirect(options);
    assert.equal(result.destination, 'https://kagi.com/search?q=caf%C3%A9%20%26%20privacy');
  }
});

test('empty queries and literal plus signs survive the redirect', async () => {
  for (const query of ['', '%2B+%2520', '%E6%97%A5%E6%9C%AC%E8%AA%9E', '+two++spaces+']) {
    const result = await redirect({ query });
    assert.equal(new URL(result.destination).searchParams.get('q'), new URLSearchParams('q=' + query).get('q'));
  }
});

test('a missing query displays an error without navigating', async () => {
  const result = await redirect({ query: null });
  assert.equal(result.destination, undefined);
  assert.equal(result.message.textContent, 'The search query is missing.');
});
