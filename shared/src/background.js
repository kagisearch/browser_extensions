import {
  summarizeContent,
  fetchSettings,
  requestActiveTabPermission,
  isPPModeEnabled,
  KAGI_PRIVACY_PASS_EXTENSION_ID,
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
let sessionSummarizeContextMenuEnabled = true;
let sessionImageSearchContextMenuEnabled = true;
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
    token = sessionToken,
    api_token = sessionApiToken,
    api_engine = sessionApiEngine,
    sync,
    summary_type = sessionSummaryType,
    target_language = sessionTargetLanguage,
    privacy_consent = sessionPrivacyConsent,
    summarize_context_menu_enabled = sessionSummarizeContextMenuEnabled,
    image_search_context_menu_enabled = sessionImageSearchContextMenuEnabled,
  } = {},
  isManual = false,
) {
  sessionToken = token;
  sessionApiToken = api_token;
  sessionApiEngine = api_engine;
  sessionSummaryType = summary_type;
  sessionTargetLanguage = target_language;
  sessionPrivacyConsent = privacy_consent;
  sessionSummarizeContextMenuEnabled = summarize_context_menu_enabled;
  sessionImageSearchContextMenuEnabled = image_search_context_menu_enabled;

  let shouldSync = sync || !isManual;
  if (typeof sessionToken === 'undefined' || sessionToken.trim().length === 0) {
    shouldSync = true;
    await updateContextMenus();
    await browser.runtime.sendMessage({ type: 'reset' });
  }

  syncSessionFromExisting = shouldSync;

  try {
    await browser.storage.local.set({
      session_token: sessionToken,
      sync_existing: shouldSync,
      api_token: sessionApiToken,
      api_engine: sessionApiEngine,
      summary_type: sessionSummaryType,
      target_language: sessionTargetLanguage,
      privacy_consent: sessionPrivacyConsent,
      summarize_context_menu_enabled: sessionSummarizeContextMenuEnabled,
      image_search_context_menu_enabled: sessionImageSearchContextMenuEnabled,
    });
  } catch (error) {
    console.error(error);

    await browser.runtime.sendMessage({
      type: 'save-error',
    });

    return;
  }

  await updateRules();
  await updateContextMenus();

  // tell the extension popup to update the UI
  await browser.runtime.sendMessage({
    type: 'synced',
    token: sessionToken,
    api_token: sessionApiToken,
    api_engine: sessionApiEngine,
    summary_type: sessionSummaryType,
    target_language: sessionTargetLanguage,
    privacy_consent: sessionPrivacyConsent,
    summarize_context_menu_enabled: sessionSummarizeContextMenuEnabled,
    image_search_context_menu_enabled: sessionImageSearchContextMenuEnabled,
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

async function updateContextMenus() {
  // FF Android does not support context menus
  if (!browser.contextMenus) return;

  await browser.contextMenus.removeAll();

  if (sessionSummarizeContextMenuEnabled && !(await isPPModeEnabled())) {
    browser.contextMenus.create({
      id: 'kagi-summarize',
      title: 'Kagi Summarize',
      contexts: ['link', 'page'], // Show the menu item when clicked on a link or elsewhere on page with no matching contexts
    });
  }

  if (sessionImageSearchContextMenuEnabled) {
    browser.contextMenus.create({
      id: 'kagi-image-search',
      title: 'Kagi Image Search',
      contexts: ['image'],
    });
  }
}

browser.webRequest.onBeforeRequest.addListener(
  async (details) => {
    await checkForSession();
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
    summarize_context_menu_enabled,
    image_search_context_menu_enabled,
  } = await fetchSettings();

  sessionToken = token;

  if (typeof token === 'undefined') syncSessionFromExisting = true;
  else syncSessionFromExisting = sync_existing;

  sessionApiToken = api_token;
  sessionApiEngine = api_engine;
  sessionSummaryType = summary_type;
  sessionTargetLanguage = target_language;

  if (!IS_CHROME) sessionPrivacyConsent = privacy_consent;
  sessionSummarizeContextMenuEnabled = summarize_context_menu_enabled;
  sessionImageSearchContextMenuEnabled = image_search_context_menu_enabled;
}

loadStorageData().then(async () => {
  await updateRules();
  await updateContextMenus();
});

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

browser.contextMenus?.onClicked.addListener(async (info, tab) => {
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

// Communication with Kagi Privacy Pass extension

/*
 * In Firefox, if this extension and the privacy pass extension both try to
 * modify the same request, the privacy pass extension will run second and
 * successfully remove the headers we set here. (Firefox runs all
 * declarativeNetRequest handlers before any webRequest handlers; we use DNR and
 * they use webRequest.)
 *
 * Continue sending headers because privacy pass extension may be running in
 * incognito-only mode and we may need to set auth back up e.g. in a container
 * or after a cookie wipe.
 *
 * Summarize requests sent from this extension aren't anonymized in privacy pass
 * mode, so we still need to keep track of its state.
 */

if (!IS_CHROME) {
  // PP extension sent an unsolicited status report
  // We update our internal assumption, and update header application
  browser.runtime.onMessageExternal.addListener(
    async (request, sender, sendResponse) => {
      if (sender.id !== KAGI_PRIVACY_PASS_EXTENSION_ID) {
        // ignore messages from extensions other than the PP one
        return;
      }
      // check the message is about the PP mode
      if ('enabled' in request) {
        await updateContextMenus();
      }
    },
  );
}
