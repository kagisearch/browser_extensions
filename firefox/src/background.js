import * as polyfill from './ext/browser_polyfill.js';

let sessionToken = undefined;
let syncSessionFromExisting = true;
let sessionApiToken = undefined;
let sessionApiEngine = undefined;
const IS_CHROME = chrome.app !== undefined;

browser.runtime.onMessage.addListener(async (data) => {
  switch (data.type) {
    case 'get_data': {
      return {
        token: sessionToken,
        api_token: sessionApiToken,
        api_engine: sessionApiEngine,
        sync_existing: syncSessionFromExisting,
        browser: IS_CHROME ? 'chrome' : 'firefox',
      };
    }
    case 'save_token': {
      sessionToken =
        typeof data.token !== 'undefined' ? data.token : sessionToken;
      sessionApiToken =
        typeof data.api_token !== 'undefined'
          ? data.api_token
          : sessionApiToken;
      sessionApiEngine =
        typeof data.api_engine !== 'undefined'
          ? data.api_engine
          : sessionApiEngine;

      let shouldSync = false;
      if (sessionToken === undefined || sessionToken.trim().length === 0) {
        shouldSync = true;
        await browser.runtime.sendMessage({
          type: 'reset',
        });
      }

      syncSessionFromExisting = shouldSync;

      browser.storage.local
        .set({
          session_token: data.token,
          sync_existing: shouldSync,
          api_token: sessionApiToken,
          api_engine: sessionApiEngine,
        })
        .catch(console.error);

      // tell the extension popup to update the UI
      if (!shouldSync && sessionToken) {
        await browser.runtime.sendMessage({
          type: 'synced',
          token: sessionToken,
          api_token: sessionApiToken,
          api_engine: sessionApiEngine,
        });
      }
      break;
    }
    case 'open_extension': {
      if (IS_CHROME) {
        chrome.tabs.create({
          url: `chrome://extensions/?id=${chrome.runtime.id}`,
        });
      } else {
        chrome.tabs.create({ url: `addons://detail/${chrome.runtime.id}` });
      }
      break;
    }
    case 'summarize_page': {
      summarizePage(data);
      break;
    }
    default:
      console.debug(`Invalid type received: ${data.type}`);
      break;
  }
});

async function summarizePage({
  token,
  url,
  summary_type,
  target_language,
  api_engine,
  api_token,
}) {
  let summary = 'Unknown error';
  let success = false;
  const useApi = Boolean(api_token);

  try {
    const requestParams = {
      url,
      summary_type,
    };

    if (target_language) {
      requestParams.target_language = target_language;
    }

    if (api_engine && useApi) {
      requestParams.engine = api_engine;
    }

    const searchParams = new URLSearchParams(requestParams);

    const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: useApi ? `Bot ${api_token}` : `${token}`,
      },
      credentials: 'include',
    };

    const response = await fetch(
      `${
        useApi
          ? 'https://kagi.com/api/v0/summarize'
          : 'https://kagi.com/mother/summary_labs'
      }?${searchParams.toString()}`,
      requestOptions,
    );

    if (response.status === 200) {
      const result = await response.json();

      console.debug('summarize response', result);

      if (useApi) {
        if (result.data?.output) {
          summary = result.data.output;
        } else if (result.error) {
          summary = JSON.stringify(result.error);
        }
      } else {
        summary = result?.output_text || 'Unknown error';
      }

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
      type: 'summary_finished',
      summary,
      success,
    });
  }
}

/*
 * Attempts to grab sessions from existing Kagi windows.
 * This allows us to track the users last session without
 * having to force them to input it in to the extension.
 */
function checkForSession(_request) {
  if (!syncSessionFromExisting) return;

  browser.cookies
    .get({
      url: 'https://kagi.com',
      name: 'kagi_session',
    })
    .then((cookie) => {
      if (!cookie || !cookie.value) return;

      const token = cookie.value;

      if (sessionToken !== token) {
        sessionToken = token;

        browser.runtime.sendMessage({
          type: 'save_token',
          token: token,
          sync: true,
        });
      }
    })
    .catch(console.error);
}

/*
 * Adds an Authorization header to all Kagi requests.
 * This allows us to provide authentication without having to
 * track if the user is logged in between incognito and normal windows.
 */
function injectSessionHeader(details) {
  if (!sessionToken) return;

  if (
    details.requestHeaders.findIndex(
      (header) => header.name.toLowerCase() === 'authorization',
    ) !== -1
  ) {
    return;
  }

  details.requestHeaders.push({
    name: 'Authorization',
    value: sessionToken,
  });

  return {
    requestHeaders: details.requestHeaders,
  };
}

browser.webRequest.onBeforeSendHeaders.addListener(
  injectSessionHeader,
  { urls: ['https://kagi.com/*'] },
  ['blocking', 'requestHeaders'],
);

browser.webRequest.onBeforeRequest.addListener(
  checkForSession,
  { urls: ['https://kagi.com/*'] },
  ['blocking'],
);

// Set our session token if we have one saved from storage.
async function setup() {
  const sessionObject = await chrome.storage.local.get('session_token');
  if (sessionObject?.session_token) {
    sessionToken = sessionObject.session_token;
  }

  const syncObject = await chrome.storage.local.get('sync_existing');
  if (typeof syncObject?.sync_existing !== 'undefined') {
    syncSessionFromExisting = syncObject.sync_existing;
  }

  const apiObject = await chrome.storage.local.get('api_token');
  if (typeof apiObject?.api_token !== 'undefined') {
    sessionApiToken = apiObject.api_token;
  }

  const apiEngineObject = await chrome.storage.local.get('api_engine');
  if (typeof apiEngineObject?.api_engine !== 'undefined') {
    sessionApiEngine = apiEngineObject.api_engine;
  }
}

setup();
