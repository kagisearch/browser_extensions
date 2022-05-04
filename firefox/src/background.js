import * as polyfill from "./ext/browser_polyfill.js";

let sessionToken = undefined;
let syncSessionFromExisting = true;
const IS_CHROME = chrome.app !== undefined;

browser.runtime.onMessage.addListener(async (data) => {
  switch(data.type) {
    case "get_data": {
      return {
        token: sessionToken,
        sync_existing: syncSessionFromExisting,
        browser: IS_CHROME ? "chrome" : "firefox"
      };
    }
    case "save_token": {
      sessionToken = data.token;

      let shouldSync = false;
      if (sessionToken === undefined || sessionToken.trim().length === 0) {
        shouldSync = true;
        await browser.runtime.sendMessage({
          type: "reset"
        });
      }

      syncSessionFromExisting = shouldSync;

      browser.storage.local.set({
        session_token: data.token,
        sync_existing: shouldSync,
      }).catch(console.error);

      // tell the extension popup to update the UI
      if (!shouldSync && sessionToken) {
        await browser.runtime.sendMessage({
          type: "synced",
        });
      }
      break;
    }
    case "open_extension": {
        if (IS_CHROME)
          chrome.tabs.create({'url': `chrome://extensions/?id=${chrome.runtime.id}`});
      break;
    }
    default:
      console.debug(`Invalid type received: ${data.type}`);
      break;
  }
});

/*
 * Attempts to grab sessions from existing Kagi windows.
 * This allows us to track the users last session without
 * having to force them to input it in to the extension.
 */
function checkForSession(_request) {
  if (!syncSessionFromExisting)
    return;

  browser.cookies.get({
    url: "https://kagi.com",
    name: "kagi_session"
  }).then((cookie) => {
    if (!cookie || !cookie.value)
      return;

    const token = cookie.value;

    if (sessionToken !== token) {
      sessionToken = token;

      browser.runtime.sendMessage({
        type: "save_token",
        token: token,
        sync: true
      });
    }
  }).catch(console.error);
}

/*
 * Adds an Authorization header to all Kagi requests.
 * This allows us to provide authentication without having to
 * track if the user is logged in between incognito and normal windows.
 */
function injectSessionHeader(details) {
  if (!sessionToken)
    return;

  details.requestHeaders.push({
    name: "Authorization",
    value: sessionToken
  });

  return {
    requestHeaders: details.requestHeaders
  };
}

browser.webRequest.onBeforeSendHeaders.addListener(
  injectSessionHeader,
  { urls: [
    "https://kagi.com/*",
  ] },
  ["blocking", "requestHeaders"]
);

browser.webRequest.onBeforeRequest.addListener(
  checkForSession,
  { urls: [
    "https://kagi.com/*",
  ] },
  ["blocking"]
);

// Set our session token if we have one saved from storage.
async function setup() {
  const sessionObj = await browser.storage.local.get("session_token");
  if (sessionObj && sessionObj.session_token) {
    sessionToken = sessionObj.session_token;
  }

  const syncObj = await browser.storage.local.get("sync_existing");
  if (syncObj && syncObj.sync_existing != undefined) {
    syncSessionFromExisting = syncObj.sync_existing;
  }
}

setup();