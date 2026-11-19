# Kagi Search for Safari

The Universal extension redirects Safari address-bar searches to Kagi. Keep your current Safari search engine selected and grant the extension access to that engine’s website. The toolbar popup lets you limit redirects to one engine or turn off fast redirects.

## Which searches redirect

The extension recognizes Google, Yahoo, Bing, DuckDuckGo, Ecosia, Baidu, Yandex, and 360 Search. It checks the host, path, query parameter, and marker Safari adds to an address-bar search. This includes regional hosts such as `www.google.co.uk`, `uk.search.yahoo.com`, and `yandex.com.tr`. You can still search directly on an engine’s website or follow a Kagi bang there. [Safari search URL examples](https://zenn.dev/cizzuk/articles/cfa044b8679c8d)

Sogou needs a verified marker that distinguishes its Safari address-bar searches from searches on its own website. Older extension versions used the label “Sogou” for 360 Search. A saved selection with that label still selects `so.com`.

## How redirects work

On Safari 15.4 or later, the background script installs persistent declarativeNetRequest (DNR) rules when the API is available. The rules send the query to the bundled `redirect.html` page even while the background script is asleep. The background script owns rule updates. It reconciles installed rules on startup and when the engine or fast-redirect preference changes.

If a matching engine page commits, the background script cancels the pending redirect when a newer top-level navigation starts. It runs `location.replace` in the matching document to open Kagi directly without adding an engine entry to Back history. This fallback also handles searches with fast redirects turned off and can briefly show the engine page.

Both redirect paths check the target tab before reading the saved private-session link. Private tabs can use the link, and regular tabs keep their own sign-in session. You can paste, replace, or clear the link in the popup. Granting access to `kagi.com` also lets the extension capture it when you sign in. Editing the link leaves the installed redirect rules in place.

## Building and testing

Build the Universal project with Xcode 26.2 or later. The setup app asks SafariServices to open the Kagi extension’s settings on macOS and iOS 26.2 or later. Earlier iOS releases use a shortcut to Settings. If iOS opens the main Settings screen, follow the path shown in the setup guide.

From the repository root, run `npm ci` with Node 20 and npm 10. Use `npm test` for repository lint and the Safari JavaScript regression suite, or `npm run test:safari` for the regression suite alone. To run the native unit and UI tests in Xcode, select the **Kagi Search iOS** scheme and an iOS simulator, then choose **Product → Test**.

### Checks in Safari

- Upgrade from iOS 2.2.8 and macOS 2.2.3. Check the saved engine, fast-redirect preference, and private-session link. Run one search in a regular tab and one in a private tab.
- Start Safari cold and search from the address bar. Try a bang, follow a result, and press Back. Repeat with fast redirects turned off and check the history for duplicate entries.
- On iPad, open the extension’s settings from the setup guide. Check that the website permissions are editable and that the popup reflects the granted engine. Select one engine, revoke its website access, open the popup, then restore access. Check whether the saved selection survives.
- To investigate a link opening as a search, tap a harmless link in an email and then deliberately search for its URL text. Repeat with the standalone extension and the Kagi Search app’s extension enabled individually, together, and with both disabled.
