import {
  summarizeContent,
  fetchSettings,
  requestActiveTabPermission,
} from './lib/utils.js';

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
  IS_CHROME = false; // really, this test for Firefox, not for Chrome
}

// Force acceptance since we do not show the policy on chrome.
if (IS_CHROME) {
  sessionPrivacyConsent = true;
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

  await applyHeader(true);

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
              header: 'X-Kagi-Authorization',
              value: sessionToken,
              operation: 'set',
            },
          ],
        },
        condition: {
          urlFilter: '||kagi.com/',
          resourceTypes: ['main_frame', 'xmlhttprequest'],
        },
      },
    ],
    removeRuleIds: [1],
  });
}

async function removeRules() {
  await browser.declarativeNetRequest.updateDynamicRules({
    addRules: [],
    removeRuleIds: [1],
  });
}

/*
 * Attempts to grab sessions from existing Kagi windows.
 * This allows us to track the users last session without
 * having to force them to input it in to the extension.
 */
async function checkForSession(isManual = false) {
  if (!isManual) {
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
  // we want to always make sure to update the rules, even if the sessionToken did not change
  // this allows the header to be reapplied in the case where the PP extension is used to set
  // PP mode on, and then the extension is uninstalled (without setting PP mode off).
  await updateRules();
}

function createSummarizeMenuEntry() {
  browser.contextMenus.create({
    id: 'kagi-summarize',
    title: 'Kagi Summarize',
    contexts: ['link', 'page'], // Show the menu item when clicked on a link or elsewhere on page with no matching contexts
  });
}

function removeSummarizeMenuEntry() {
  browser.contextMenus.remove('kagi-summarize');
}

async function applyHeader(isManual = false) {
  if (!IS_CHROME) {
    // check if PP mode is enabled, if so remove X-Kagi-Authorization header
    await requestPPMode();

    const pp_mode_enabled = await isPPModeEnabled();
    if (pp_mode_enabled) {
      // we reset syncSessionFromExisting so that once PP mode is set off
      // (or if the PP extension is uninstalled), checkForSession() reapplies
      // the X-Kagi-Authorize header
      syncSessionFromExisting = true;
      await removeRules();

      // disable summarizer button
      removeSummarizeMenuEntry();
      return;
    }
  }

  // enable summarizer button
  createSummarizeMenuEntry();

  // PP mode is not enabled, proceed with header application
  await checkForSession(isManual);
}

browser.webRequest.onBeforeRequest.addListener(
  async (details) => {
    await applyHeader()
  },
  { urls: ['https://*.kagi.com/*'] },
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

  if (typeof token === 'undefined') syncSessionFromExisting = true;
  else syncSessionFromExisting = sync_existing;

  sessionApiToken = api_token;
  sessionApiEngine = api_engine;
  sessionSummaryType = summary_type;
  sessionTargetLanguage = target_language;

  if (!IS_CHROME) sessionPrivacyConsent = privacy_consent;
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

// FF Android does not support context menus
if (browser.contextMenus !== undefined) {
  // Create a context menu item.

  // a context menu item for Summarize is added in applyHeader()
  // to match the status of Privacy Pass

  browser.contextMenus.create({
    id: 'kagi-image-search',
    title: 'Kagi Image Search',
    contexts: ['image'],
  });

  // Add a listener for the context menu item.
  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === 'kagi-summarize') {
      if (!IS_CHROME) {
        // Attach permission request to user input handler for Firefox
        await requestActiveTabPermission();
      }
      kagiSummarize(info, tab);
    } else if (info.menuItemId === 'kagi-image-search') {
      kagiImageSearch(info, tab);
    }
  });
}

// Communication with Kagi Privacy Pass extension

/*
  This extension makes the browser send a custom X-Kagi-Authorization header
  to kagi.com, to authenticate users even when using incognito mode.
  This can enter a "race condition" with the Kagi Privacy Pass extension,
  which strips all de-anonymising information sent to kagi.com, such as X-Kagi-Authorization,
  whenever "Privacy Pass mode" is in use.

  To avoid this race, we let the two extensions communicate, so that this extenesion removes
  (respectively, adds) the header when "Privacy Pass mode" is active (respectively, "PP mode"
  is inactive or the other extension is not installed/enabled).

  We achieve this syncronization with a simple messaging protocol outlined below:

  The Privacy Pass extension will send this extension single messages:
  - When being enabled (installed, activated) reports whether "PP mode" is enabled
  - When activating/deactivating "PP mode"
  Due to Chromium extension limitations, it cannot send a message when uninstalled/deactivated.

  The main extension (this one) keeps track of whether the "PP mode" is acrive or not by keeping state.
  This state is updated by the following actions:
  - When this extension is being enabled (installed, activated), it asks the PP extension for the "PP mode".
  - When it receives a status report from the PP extension, updates its state.

  Having both extensions send / request the "PP mode" status allows for the following:
  - When both are installed and active, whenever "PP mode" is toggled, this extension is informed and adjusts
  - Whenever one extension is installed, it attempts to sync with the other on whether "PP mode" is active

  There is one limitation, due to the PP extension being unable to signal to this one that it was uninstalled.
  This means that in theory, one could have a scenario where first PP mode is enabled, this extension removes
  X-Kagi-Authorization, and then the PP extension is uninstalled. In Incognito mode, where the kagi_session
  cookie is not sent by the browser, this would cause failed authentication with Kagi.

  Possible solutions:
  1. have PP extension open a URL on uninstall, that signals this extension to update the header. This is possible
     but it means adding an extra new tab on uninstall.
  2. Have this extension periodically poll whether the other one was uninstalled. This adds needless communication.
     Polling only when applying the header is not sufficient (as the PP extension could be uninstalled without
     webRequest.onBeforeRequest being triggered).

  In practice neither of these solutions seems necessary. Instead, we have this extension poll the PP extension every
  time it checks whether to apply the header. This means that even in the case where the PP extension is uninstalled while
  PP mode was set on, at most one query to kagi.com will fail to authenticate. Such query will then trigger webRequest.onBeforeRequest,
  which will then find out the PP extension was uninstalled, and hence reinstate X-Kagi-Authorize.
*/

const KAGI_PRIVACY_PASS_EXTENSION_ID = "privacypass@kagi.com"; // Firefox only

async function requestPPMode() {
  if (IS_CHROME) {
    return;
  }
  let pp_mode_enabled = false;
  try {
    pp_mode_enabled = await browser.runtime.sendMessage(KAGI_PRIVACY_PASS_EXTENSION_ID, "status_report");
  } catch (ex) {
    // other end does not exist, likely Privacy Pass extension disabled/not installed
    pp_mode_enabled = false; // PP mode not enabled
  }
  await browser.storage.local.set({ "pp_mode_enabled": pp_mode_enabled })
}

async function isPPModeEnabled() {
  if (IS_CHROME) {
    return false;
  }
  const { pp_mode_enabled } = await browser.storage.local.get({ "pp_mode_enabled": false });
  return pp_mode_enabled;
}

if (!IS_CHROME) {
  // PP extension sent an unsolicited status report
  // We update our internal assumption, and update header application
  browser.runtime.onMessageExternal.addListener(async (request, sender, sendResponse) => {
    if (sender.id !== KAGI_PRIVACY_PASS_EXTENSION_ID) {
      // ignore messages from extensions other than the PP one
      return;
    }
    // check the message is about the PP mode
    if ('enabled' in request) {
      // update X-Kagi-Authorization header application
      await applyHeader();
    }
  });
}

// when extension is started, ask for status report, and apply header accordingly
(async () => {
  await applyHeader();
})();
