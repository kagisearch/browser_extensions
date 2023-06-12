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
      sessionToken = data.token || sessionToken;

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
    case "summarize_page": {
      summarizePage(data.token, data.url, data.summary_type, data.target_language);
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

async function summarizePage(token, url, summary_type, target_language) {
  let summary = '';
  let success = false;

  try {
    const requestParams = {
      url,
      summary_type,
    };

    if (target_language) {
      requestParams.target_language = target_language;
    }

    const searchParams = new URLSearchParams(requestParams);

    const response = await fetch(`https://kagi.com/mother/summary_labs?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`,
      },
      credentials: 'include',
    });

    if (response.status === 200) {
      const result = await response.json();

      console.debug('summarize response', result);

      summary = result?.output_text || 'Unknown error';
      success = Boolean(result) && !Boolean(result.error);
    } else {
      console.error('summarize error', response.status, response.statusText);

      if (response.status === 401) {
        summary = 'Invalid Token! Please set a new one.';
      } else {
        summary = `Error: ${response.status} - ${response.statusText}`;
      }
    }
  } catch (error) {
    summary = error.message ? `Error: ${error.message}` : JSON.stringify(error);
  }

  if (summary) {
    chrome.runtime.sendMessage({
      type: "summary_finished",
      summary,
      success,
    }, (response) => {
      if (!response)
        console.error('error setting summary: ', chrome.runtime.lastError.message);
    });
  }
}

setup();
