import {
  fetchSettings,
  getActiveTab,
  requestActiveTabPermission,
} from './lib/utils.js';

if (!globalThis.browser) {
  globalThis.browser = chrome;
}

let IS_CHROME = true;

// Very hacky, but currently works flawlessly
if (typeof browser.runtime.getBrowserInfo === 'function') {
  IS_CHROME = false;
}

function setStatus(type) {
  const linksDiv = document.querySelector('#links');
  const statusElement = document.querySelector('#status');
  const statusPermissionMessageElement = document.querySelector(
    '#status_permission_message',
  );
  const statusErrorMessageElement = document.querySelector(
    '#status_error_message',
  );
  const statusLoadingMessageElement = document.querySelector(
    '#status_loading_message',
  );

  const statusIcons = statusElement.querySelectorAll('svg');

  const statusErrorIcon = statusIcons[0];
  const statusLoadingIcon = statusIcons[1];
  const statusGoodIcon = statusIcons[2];

  statusLoadingMessageElement.style.display = 'none';
  statusLoadingIcon.style.display = 'none';

  switch (type) {
    case 'no_session': {
      const openKagiLinkElement = document.querySelector('#open_kagi');

      openKagiLinkElement.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();

        const grant = await browser.permissions.request({
          origins: ['https://kagi.com/*'],
        });
        if (grant) {
          browser.tabs.create({
            url: 'https://kagi.com/',
          });
        } else {
          statusPermissionMessageElement.style.display = '';
        }
      });

      linksDiv.style.visibility = 'hidden';
      statusErrorMessageElement.style.display = '';
      statusErrorIcon.style.display = '';
      statusGoodIcon.style.display = 'none';
      statusElement.setAttribute('title', 'No session found!');
      break;
    }
    case 'manual_token': {
      linksDiv.style.visibility = 'visible';
      statusErrorMessageElement.style.display = 'none';
      statusErrorIcon.style.display = 'none';
      statusGoodIcon.style.display = '';
      statusElement.setAttribute('title', 'Token found!');
      break;
    }
    case 'auto_token': {
      linksDiv.style.visibility = 'visible';
      statusErrorMessageElement.style.display = 'none';
      statusErrorIcon.style.display = 'none';
      statusGoodIcon.style.display = '';
      statusElement.setAttribute('title', 'Session found!');
      break;
    }
    default:
      break;
  }
}

async function setup() {
  const linksDiv = document.querySelector('#links');
  if (!linksDiv) {
    console.error('Could not find links div');
    return;
  }

  const privacyConsentDiv = document.querySelector('#privacy_consent_message');
  if (!privacyConsentDiv) {
    console.error('Could not find privacy div');
    return;
  }

  const privacyConsentButton = document.querySelector(
    '#privacy_consent_button',
  );
  if (!privacyConsentButton) {
    console.error('No privacy consent button found.');
    return;
  }

  const tokenDiv = document.querySelector('#token');
  if (!tokenDiv) {
    console.error('Could not find token div');
    return;
  }

  const tokenInput = document.querySelector('#token_input');
  if (!tokenInput) {
    console.error('Could not set token because no input exists');
    return;
  }

  tokenInput.addEventListener('focus', (event) => {
    event.target.select();
  });

  tokenInput.addEventListener('click', () =>
    this.value ? this.setSelectionRange(0, this.value.length) : null,
  );

  const apiTokenInput = document.querySelector('#api_token_input');
  if (!apiTokenInput) {
    console.error('Could not set API token because no input exists');
    return;
  }

  apiTokenInput.addEventListener('focus', (event) => {
    event.target.select();
  });

  apiTokenInput.addEventListener('click', () =>
    this.value ? this.setSelectionRange(0, this.value.length) : null,
  );

  const apiEngineSelect = document.querySelector('#engine');
  if (!apiEngineSelect) {
    console.error('Could not set API engine because no select exists');
    return;
  }

  const advancedToggle = document.querySelector('#advanced');
  if (!advancedToggle) {
    console.error('Could not find advanced toggle');
    return;
  }

  const fastGptSection = document.querySelector('#fastgpt');
  if (!fastGptSection) {
    console.error('Could not find fastgpt section');
    return;
  }

  const fastGptQueryInput = document.querySelector('#fastgpt_query');
  if (!fastGptQueryInput) {
    console.error('Could not find fastgpt input');
    return;
  }

  const summarizeSection = document.querySelector('#summarize');
  if (!summarizeSection) {
    console.error('Could not find summarize section');
    return;
  }

  const summarizePageButton = document.querySelector('#summarize_page');
  if (!summarizePageButton) {
    console.error('Could not find summarize page button');
    return;
  }

  const apiParamElements = document.querySelectorAll('.api_param');
  if (!apiParamElements.length) {
    console.error('Could not find api param divs');
    return;
  }

  apiParamElements.forEach((element) => {
    element.style.display = 'none';
  });

  const saveTokenButton = document.querySelector('#token_save');
  if (!saveTokenButton) {
    console.error('Could not find save settings button');
    return;
  }

  const summaryTypeSelect = document.querySelector('#summary_type');
  if (!summaryTypeSelect) {
    console.error('No summary type select found.');
    return;
  }

  const targetLanguageSelect = document.querySelector('#target_language');
  if (!targetLanguageSelect) {
    console.error('No target language select found.');
    return;
  }

  const engineSelect = document.querySelector('#engine');
  if (!engineSelect) {
    console.error('No engine select found.');
    return;
  }

  const summarizeOptions = document.querySelectorAll('.summarize_option');
  if (summarizeOptions.length === 0) {
    console.error('No summarize options found.');
    return;
  }

  const requestPermissionsSection = document.querySelector(
    '#request_permissions',
  );
  if (!requestPermissionsSection) {
    console.error('No request permissions section found.');
    return;
  }

  const requestPermissionsButton = document.querySelector(
    '#request_permissions_button',
  );
  if (!requestPermissionsButton) {
    console.error('No request permissions button found.');
    return;
  }

  const saveErrorDiv = document.querySelector('#save_error');
  if (!saveErrorDiv) {
    console.error('Could not find save error div');
    return;
  }

  privacyConsentButton.addEventListener('click', async () => {
    try {
      await browser.runtime.sendMessage({
        type: 'save_token',
        privacy_consent: true,
      });
    } catch (error) {
      console.error(error);

      showSavingError();
    }
  });

  saveTokenButton.addEventListener('click', async () => {
    let token = tokenInput.value;

    if (token.startsWith('https://kagi.com')) {
      const url = new URL(token);
      token = url.searchParams.get('token');

      if (token) tokenInput.value = token;
    }

    const api_token = apiTokenInput.value;

    const api_engine = apiEngineSelect.value;

    const summary_type = summaryTypeSelect.value;

    const target_language = targetLanguageSelect.value;

    saveTokenButton.innerText = 'Saving...';

    try {
      await browser.runtime.sendMessage({
        type: 'save_token',
        token,
        api_token,
        api_engine,
        summary_type,
        target_language,
      });
    } catch (error) {
      console.error(error);

      showSavingError();
    }
  });

  async function toggleAdvancedDisplay(forceState) {
    const icons = advancedToggle.querySelectorAll('svg');
    const showSettingsIcon = icons[0];
    const closeSettingsIcon = icons[1];

    if (forceState === 'close' || tokenDiv.style.display === '') {
      showSettingsIcon.style.display = '';
      closeSettingsIcon.style.display = 'none';
      tokenDiv.style.display = 'none';
      if (tokenInput.value) {
        fastGptSection.style.display = '';

        const hasPermissions = await browser.permissions.contains({
          permissions: ['activeTab'],
        });

        if (!hasPermissions) {
          summarizeSection.style.display = 'none';
          requestPermissionsSection.style.display = '';
        } else {
          summarizeSection.style.display = '';
          requestPermissionsSection.style.display = 'none';
        }
      } else {
        fastGptSection.style.display = 'none';
      }
      advancedToggle.setAttribute('title', 'Advanced settings');
    } else {
      showSettingsIcon.style.display = 'none';
      closeSettingsIcon.style.display = '';
      tokenDiv.style.display = '';
      summarizeSection.style.display = 'none';
      fastGptSection.style.display = 'none';
      requestPermissionsSection.style.display = 'none';
      advancedToggle.setAttribute('title', 'Close advanced settings');
    }
  }
  advancedToggle.addEventListener('click', () => toggleAdvancedDisplay());

  async function handleSummarizePageButtonClick(event) {
    event.preventDefault();
    event.stopPropagation();

    const tab = await getActiveTab();

    if (!tab) {
      console.error('No tab/url found.');
      return;
    }

    const { url } = tab;

    const searchParams = {
      url,
      summary_type: summaryTypeSelect.value,
      target_language: targetLanguageSelect.value,
      token: tokenInput.value,
      api_token: apiTokenInput.value,
      api_engine: engineSelect.value,
    };

    const urlSearchParams = new URLSearchParams({ ...searchParams });

    await browser.windows.create({
      url: `${browser.runtime.getURL(
        'src/summarize_result.html',
      )}?${urlSearchParams.toString()}`,
      focused: true,
      width: 600,
      height: 500,
      type: 'popup',
    });

    // Save new summary_type preferences
    await browser.runtime.sendMessage({
      type: 'save_token',
      token: searchParams.token,
      api_token: searchParams.api_token,
      api_engine: searchParams.api_engine,
      summary_type: searchParams.summary_type,
      target_language: searchParams.target_language,
    });

    // Give the browser time to save the info before closing the window (when await isn't respected)
    setTimeout(() => window.close(), 100);
  }

  summarizePageButton.addEventListener('click', handleSummarizePageButtonClick);

  async function handleRequestPermissionsButtonClick(event) {
    event.preventDefault();
    event.stopPropagation();

    const permissionGranted = await requestActiveTabPermission();

    if (!permissionGranted) {
      alert(
        "You can't summarize without allowing access to the currently active tab.",
      );
    }

    window.close();
  }

  const platformInfo = await browser.runtime.getPlatformInfo();
  const browserInfo =
    typeof browser.runtime.getBrowserInfo === 'function' &&
    (await browser.runtime.getBrowserInfo());

  // Note, _hoping_ by 119 this works, but there's no guarantee.
  if (
    platformInfo.os === 'android' &&
    browserInfo?.version &&
    Number.parseInt(browserInfo.version, 10) <= 118
  ) {
    requestPermissionsButton.addEventListener('click', () => {
      alert('Cannot request activeTab permission on Android yet.');
    });
  } else {
    requestPermissionsButton.addEventListener(
      'click',
      handleRequestPermissionsButtonClick,
    );
  }

  async function handleGetData({
    token,
    api_token,
    sync_existing,
    api_engine,
    summary_type,
    target_language,
    privacy_consent,
  } = {}) {
    if ((privacy_consent || IS_CHROME) && token) {
      tokenInput.value = token;

      if (api_token) {
        apiTokenInput.value = api_token;
      }

      if (tokenDiv.style.display === 'none') {
        const hasPermissions = await browser.permissions.contains({
          permissions: ['activeTab'],
        });

        if (!hasPermissions) {
          summarizeSection.style.display = 'none';
          requestPermissionsSection.style.display = '';
        } else {
          summarizeSection.style.display = '';
          requestPermissionsSection.style.display = 'none';
        }

        fastGptSection.style.display = '';
      } else {
        fastGptSection.style.display = 'none';
      }

      if (sync_existing) {
        setStatus('auto_token');
      } else {
        setStatus('manual_token');
      }

      if (api_token) {
        apiParamElements.forEach((element) => {
          element.style.display = '';
        });
      }

      if (api_engine) {
        apiEngineSelect.value = api_engine;
      }

      if (summary_type) {
        summaryTypeSelect.value = summary_type;
      }

      if (target_language) {
        targetLanguageSelect.value = target_language;
      }

      const hasIncognitoAccess =
        await browser.extension.isAllowedIncognitoAccess();

      if (!hasIncognitoAccess) {
        const incognitoSection = document.querySelector('#incognito');

        if (!incognitoSection) {
          console.error('No incognito div to place text');
          return;
        }

        incognitoSection.style.display = '';

        const firefoxExtensionSection = document.querySelector('#firefox_ext');
        const chromeExtensionSection = document.querySelector('#chrome_ext');

        if (!IS_CHROME) {
          firefoxExtensionSection.style.display = '';
          chromeExtensionSection.style.display = 'none';
        } else {
          firefoxExtensionSection.style.display = 'none';
          chromeExtensionSection.style.display = '';
        }

        // NOTE: slight little hack to make the chrome://extensions link not be blocked.
        if (IS_CHROME) {
          const chromeLinkElement = document.querySelector('#chrome_link');
          if (chromeLinkElement) {
            chromeLinkElement.addEventListener('click', async () => {
              await browser.runtime.sendMessage({ type: 'open_extension' });
            });
          }
        }
      }
    } else if (!privacy_consent && !IS_CHROME) {
      setStatus('');
      privacyConsentDiv.style.display = '';
      tokenDiv.style.display = 'none';
      advancedToggle.style.display = 'none';
      saveErrorDiv.style.display = 'none';
      toggleAdvancedDisplay('close');
    } else {
      privacyConsentDiv.style.display = 'none';
      advancedToggle.style.display = '';
      setStatus('no_session');
    }
  }

  const fetchedSettings = await fetchSettings();
  await handleGetData(fetchedSettings);

  let savingButtonTextTimeout = undefined;

  function showSavingError() {
    saveTokenButton.innerText = 'Error saving!';

    if (savingButtonTextTimeout) {
      clearTimeout(savingButtonTextTimeout);
    }

    savingButtonTextTimeout = setTimeout(() => {
      saveTokenButton.innerText = 'Save settings';
    }, 2000);

    if (!IS_CHROME) {
      const incognitoNameSpan = saveErrorDiv.querySelector('span');
      if (incognitoNameSpan) {
        incognitoNameSpan.innerText = 'Run in Private Windows';
      }
    }

    saveErrorDiv.style.display = '';
  }

  browser.runtime.onMessage.addListener(async (data) => {
    if (data.type === 'synced') {
      setStatus('manual_token');
      saveTokenButton.innerText = 'Saved!';
      saveErrorDiv.style.display = 'none';
      advancedToggle.style.display = '';

      const newlyFetchedSettings = await fetchSettings();
      await handleGetData(newlyFetchedSettings);

      if (savingButtonTextTimeout) {
        clearTimeout(savingButtonTextTimeout);
      }

      savingButtonTextTimeout = setTimeout(() => {
        saveTokenButton.innerText = 'Save settings';
      }, 2000);

      if (tokenDiv.style.display === 'none') {
        if (data.token) {
          const hasPermissions = await browser.permissions.contains({
            permissions: ['activeTab'],
          });

          fastGptSection.style.display = '';

          if (!hasPermissions) {
            summarizeSection.style.display = 'none';
            requestPermissionsSection.style.display = '';
          } else {
            summarizeSection.style.display = '';
            requestPermissionsSection.style.display = 'none';
          }
        } else {
          summarizeSection.style.display = 'none';
          requestPermissionsSection.style.display = 'none';
          fastGptSection.style.display = 'none';
        }
      }

      if (data.api_token) {
        apiParamElements.forEach((element) => {
          element.style.display = '';
        });
      } else {
        apiParamElements.forEach((element) => {
          element.style.display = 'none';
        });
      }
    } else if (data.type === 'reset') {
      setStatus('no_session');
      tokenDiv.style.display = 'none';
      advancedToggle.style.display = '';
      saveErrorDiv.style.display = 'none';
      toggleAdvancedDisplay('close');
    } else if (data.type === 'save-error') {
      showSavingError();
    }
  });

  if (fastGptSection.style.display !== 'none') {
    fastGptQueryInput.focus();
  }

  // Close popup after submitting fastGpt
  fastGptSection.querySelector('form').addEventListener('submit', () => {
    setTimeout(() => window.close(), 50); // Without this timeout, the browser opens a new window instead of a new tab
  });

  // Close popup after clicking on top link
  linksDiv.querySelectorAll('a').forEach((anchor) =>
    anchor.addEventListener('click', () => {
      setTimeout(() => window.close(), 50); // Without this timeout, the browser opens a new window instead of a new tab
    }),
  );
}

document.addEventListener('DOMContentLoaded', setup);
