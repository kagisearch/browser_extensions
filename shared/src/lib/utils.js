if (!globalThis.browser) {
  globalThis.browser = chrome;
}

export async function summarizeContent({
  url,
  text,
  summary_type,
  target_language,
  api_engine,
  token,
  api_token,
}) {
  let summary = 'Unknown error';
  let success = false;
  let timeSavedInMinutes = 0;
  const useApi = Boolean(
    api_token && ((api_engine && api_engine !== 'cecil') || text),
  );

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

    if (useApi) {
      if (api_engine) {
        requestParams.engine = api_engine;
      }

      if (text) {
        requestParams.text = text;
        requestParams.url = undefined;
      }
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
        timeSavedInMinutes = result?.output_data?.word_stats?.time_saved || 0;
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

  return {
    summary,
    success,
    timeSavedInMinutes,
  };
}

export async function fetchSettings() {
  const sessionObject = await browser.storage.local.get('session_token');
  const syncObject = await browser.storage.local.get('sync_existing');
  const apiObject = await browser.storage.local.get('api_token');
  const apiEngineObject = await browser.storage.local.get('api_engine');
  const summaryTypeObject = await browser.storage.local.get('summary_type');
  const targetLanguageObject =
    await browser.storage.local.get('target_language');

  return {
    token: sessionObject?.session_token,
    sync_existing:
      typeof syncObject?.sync_existing !== 'undefined'
        ? syncObject.sync_existing
        : true,
    api_token: apiObject?.api_token,
    api_engine: apiEngineObject?.api_engine,
    summary_type: summaryTypeObject?.summary_type,
    target_language: targetLanguageObject?.target_language,
  };
}

export async function getActiveTab(fetchingFromShortcut = false) {
  const tabsQuery = {
    active: true,
    lastFocusedWindow: true,
  };

  // Don't look just in the last focused window if we're opening from the shortcut
  if (fetchingFromShortcut) {
    tabsQuery.lastFocusedWindow = undefined;
  }

  const tabs = await browser.tabs.query(tabsQuery);

  // Chrome/Firefox might give us more than one active tab when something like "chrome://*" or "about:*" is also open
  const tab =
    tabs.find(
      (tab) =>
        tab?.url?.startsWith('http://') || tab?.url?.startsWith('https://'),
    ) || tabs[0];

  if (tab?.url?.startsWith('about:reader?url=')) {
    const newUrl = new URL(tab.url);
    tab.url = newUrl.searchParams.get('url');
  }

  if (!tab || !tab.url) {
    console.error('No tab/url found.');
    console.error(JSON.stringify(tabs));
    return null;
  }

  return tab;
}
