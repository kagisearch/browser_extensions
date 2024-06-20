import { summarizeContent, fetchSettings } from './lib/utils.js';

if (!globalThis.browser) {
  globalThis.browser = chrome;
}

let sessionToken = undefined;
let syncSessionFromExisting = true;
let sessionApiToken = undefined;
let sessionApiEngine = undefined;
let sessionSummaryType = undefined;
let sessionTargetLanguage = undefined;
let sessionPrivacyConsent = false;
let IS_CHROME = true;

// Very hacky, but currently works flawlessly
if (typeof browser.runtime.getBrowserInfo === 'function') {
  IS_CHROME = false;
}

async function saveToken(
  {
    token,
    api_token,
    api_engine,
    sync,
    summary_type,
    target_language,
    privacy_consent,
  } = {},
  isManual = false,
) {
  sessionToken = typeof token !== 'undefined' ? token : sessionToken;
  sessionApiToken =
    typeof api_token !== 'undefined' ? api_token : sessionApiToken;
  sessionApiEngine =
    typeof api_engine !== 'undefined' ? api_engine : sessionApiEngine;
  sessionSummaryType =
    typeof summary_type !== 'undefined' ? summary_type : sessionSummaryType;
  sessionTargetLanguage =
    typeof target_language !== 'undefined'
      ? target_language
      : sessionTargetLanguage;
  sessionPrivacyConsent =
    typeof privacy_consent !== 'undefined'
      ? privacy_consent
      : sessionPrivacyConsent;

  let shouldSync = sync || !isManual;
  if (typeof sessionToken === 'undefined' || sessionToken.trim().length === 0) {
    shouldSync = true;
    await browser.runtime.sendMessage({ type: 'reset' });
  }

  syncSessionFromExisting = shouldSync;

  try {
    await browser.storage.local.set({
      session_token: token,
      sync_existing: shouldSync,
      api_token: sessionApiToken,
      api_engine: sessionApiEngine,
      summary_type: sessionSummaryType,
      target_language: sessionTargetLanguage,
      privacy_consent: sessionPrivacyConsent,
    });
  } catch (error) {
    console.error(error);

    await browser.runtime.sendMessage({
      type: 'save-error',
    });

    return;
  }

  await updateRules();

  // tell the extension popup to update the UI
  await browser.runtime.sendMessage({
    type: 'synced',
    token: sessionToken,
    api_token: sessionApiToken,
    api_engine: sessionApiEngine,
    summary_type: sessionSummaryType,
    target_language: sessionTargetLanguage,
    privacy_consent: sessionPrivacyConsent,
  });
}

async function summarizePage(options) {
  const { summary, success, timeSavedInMinutes } =
    await summarizeContent(options);

  if (summary) {
    await browser.runtime.sendMessage({
      type: 'summary_finished',
      summary,
      success,
      url: options.url,
      timeSavedInMinutes,
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
  if (!sessionPrivacyConsent) return;

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
      await saveToken(data, true);
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
      await summarizePage(data);
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
  const {
    token,
    sync_existing,
    api_token,
    api_engine,
    summary_type,
    target_language,
    privacy_consent,
  } = await fetchSettings();

  sessionToken = token;

  if (typeof token === 'undefined')
    syncSessionFromExisting = true;
  else
    syncSessionFromExisting = sync_existing;

  sessionApiToken = api_token;
  sessionApiEngine = api_engine;
  sessionSummaryType = summary_type;
  sessionTargetLanguage = target_language;
  sessionPrivacyConsent = privacy_consent;
}

loadStorageData();

// The function kagiSummarize is called when clicking the context menu item.
async function kagiSummarize(info) {
  // The linkUrl will be undefined if function is triggered by a page event. In that case, the url is taken from pageUrl
  const url = info.linkUrl || info.pageUrl;

  await browser.windows.create({
    url: browser.runtime.getURL(
      `src/summarize_result.html?url=${encodeURIComponent(url)}`,
    ),
    focused: true,
    width: 600,
    height: 500,
    type: 'popup',
  });
}

function kagiImageSearch(info) {
  const imageUrl = info.srcUrl;
  browser.tabs.create({
    url: `https://kagi.com/images?q=${imageUrl}&reverse=reference`,
  });
}

// Create a context menu item.
browser.contextMenus.create({
  id: 'kagi-summarize',
  title: 'Kagi Summarize',
  contexts: ['link', 'page'], // Show the menu item when clicked on a link or elsewhere on page with no matching contexts
});

browser.contextMenus.create({
  id: 'kagi-image-search',
  title: 'Kagi Image Search',
  contexts: ['image'],
});

// Add a listener for the context menu item.
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'kagi-summarize') {
    kagiSummarize(info, tab);
  } else if (info.menuItemId === 'kagi-image-search') {
    kagiImageSearch(info, tab);
  }
});
