import { summarizeContent, fetchSettings } from './lib/utils.js';

if (!globalThis.browser) {
  globalThis.browser = chrome;
}

let sessionToken = undefined;
let syncSessionFromExisting = true;
let sessionApiToken = undefined;
let sessionApiEngine = undefined;
let IS_CHROME = true;

// Very hacky, but currently works flawlessly
if (typeof browser.runtime.getBrowserInfo === 'function') {
  IS_CHROME = false;
}

async function saveToken(
  { token, api_token, api_engine, sync } = {},
  isManual = false,
) {
  sessionToken = typeof token !== 'undefined' ? token : sessionToken;
  sessionApiToken =
    typeof api_token !== 'undefined' ? api_token : sessionApiToken;
  sessionApiEngine =
    typeof api_engine !== 'undefined' ? api_engine : sessionApiEngine;

  let shouldSync = sync || !isManual;
  if (typeof sessionToken === 'undefined' || sessionToken.trim().length === 0) {
    shouldSync = true;
    await browser.runtime.sendMessage({ type: 'reset' });
  }

  syncSessionFromExisting = shouldSync;

  await browser.storage.local.set({
    session_token: token,
    sync_existing: shouldSync,
    api_token: sessionApiToken,
    api_engine: sessionApiEngine,
  });

  await updateRules();

  // tell the extension popup to update the UI
  await browser.runtime.sendMessage({
    type: 'synced',
    token: sessionToken,
    api_token: sessionApiToken,
    api_engine: sessionApiEngine,
  });
}

async function summarizePage(options) {
  const { summary, success } = await summarizeContent(options);

  if (summary) {
    await browser.runtime.sendMessage({
      type: 'summary_finished',
      summary,
      success,
    });
  }
}

/*
 * Adds an Authorization header to all Kagi requests.
 * This allows us to provide authentication without having to
 * track if the user is logged in between incognito and normal windows.
 */
async function updateRules() {
  if (!sessionToken) return;

  await browser.declarativeNetRequest.updateDynamicRules({
    addRules: [
      {
        id: 1,
        priority: 1,
        action: {
          type: 'modifyHeaders',
          requestHeaders: [
            {
              header: 'Authorization',
              value: sessionToken,
              operation: 'set',
            },
          ],
        },
        condition: {
          urlFilter: '|https://kagi.com/*',
          resourceTypes: ['main_frame'],
        },
      },
    ],
    removeRuleIds: [1],
  });
}

/*
 * Attempts to grab sessions from existing Kagi windows.
 * This allows us to track the users last session without
 * having to force them to input it in to the extension.
 */
async function checkForSession() {
  if (!syncSessionFromExisting) return;

  const cookie = await browser.cookies.get({
    url: 'https://kagi.com',
    name: 'kagi_session',
  });

  if (!cookie || !cookie.value) return;

  const token = cookie.value;

  if (sessionToken !== token) {
    sessionToken = token;

    await saveToken({ token, sync: true });
  }
}

browser.webRequest.onBeforeRequest.addListener(
  checkForSession,
  { urls: ['https://kagi.com/*'] },
  [],
);

browser.runtime.onMessage.addListener(async (data) => {
  switch (data.type) {
    case 'save_token': {
      saveToken(data, true);
      break;
    }
    case 'open_extension': {
      if (IS_CHROME) {
        await browser.tabs.create({
          url: `chrome://extensions/?id=${browser.runtime.id}`,
        });
      } else {
        await browser.tabs.create({
          url: `addons://detail/${browser.runtime.id}`,
        });
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

browser.commands?.onCommand.addListener(async (command) => {
  if (command === 'summarize-active-page') {
    await browser.windows.create({
      url: browser.runtime.getURL('src/summarize_result.html'),
      focused: true,
      width: 600,
      height: 500,
      type: 'popup',
    });
  }
});

async function loadStorageData() {
  const { token, sync_existing, api_token, api_engine } = await fetchSettings();

  sessionToken = token;
  syncSessionFromExisting = sync_existing;
  sessionApiToken = api_token;
  sessionApiEngine = api_engine;
}

loadStorageData();
