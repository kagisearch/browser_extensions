let sessionToken = undefined;
let syncSessionFromExisting = true;
let sessionApiToken = undefined;

function saveToken(token, manual, apiToken) {
  sessionToken = token;
  sessionApiToken = apiToken ? apiToken : sessionApiToken;

  let shouldSync = !manual;
  if (sessionToken === undefined || sessionToken.trim().length === 0) {
    shouldSync = true;
    chrome.runtime.sendMessage({
      type: "reset"
    }, (response) => {
      if (!response)
        console.error('error resetting state: ', chrome.runtime.lastError.message);
    });
  }

  syncSessionFromExisting = shouldSync;

  chrome.storage.local.set({
    session_token: token,
    sync_existing: shouldSync,
    api_token: sessionApiToken,
  });

  updateRules();

  // tell the extension popup to update the UI
  if (!shouldSync && sessionToken) {
    chrome.runtime.sendMessage({
      type: "synced",
    }, (response) => {
      if (!response)
        console.error('error setting synced: ', chrome.runtime.lastError.message);
    });
  }
}

async function summarizePage(apiToken, url, summary_type, target_language) {
  let summary = '';

  try {
    const requestBody = {
      url,
      summary_type,
    };

    if (target_language) {
      requestBody.target_language = target_language;
    }

    const response = await fetch('https://kagi.com/api/v0/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bot ${apiToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (response.status === 200) {

      const result = await response.json();

      console.debug('summarize API response', result);

      if (result.data?.output) {
        summary = result.data.output;
      } else if (result.error) {
        summary = JSON.stringify(result.error);
      }
    } else {
      console.error('summarize API error', response.status, response.statusText);

      if (response.status === 401) {
        summary = 'Invalid API Token! Please set a new one.';
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
    }, (response) => {
      if (!response)
        console.error('error setting summary: ', chrome.runtime.lastError.message);
    });
  }
}

chrome.runtime.onMessage.addListener(async (data, sender, sendResponse) => {
  switch(data.type) {
    case "get_data": {
      sendResponse({
        token: sessionToken,
        api_token: sessionApiToken,
        sync_existing: syncSessionFromExisting,
        browser: "chrome",
      });
      break;
    }
    case "save_token": {
      saveToken(data.token, true, data.api_token);
      break;
    }
    case "open_extension": {
      chrome.tabs.create({'url': `chrome://extensions/?id=${chrome.runtime.id}`});
      break;
    }
    case "summarize_page": {
      summarizePage(data.api_token, data.url, data.summary_type, data.target_language);
      break;
    }
    default:
      console.debug(`Invalid type received: ${data.type}`);
      break;
  }

  sendResponse(true);
  return true;
});

/*
 * Attempts to grab sessions from existing Kagi windows.
 * This allows us to track the users last session without
 * having to force them to input it in to the extension.
 */
function checkForSession(_request) {
  if (!syncSessionFromExisting)
    return;

  chrome.cookies.get({
    url: "https://kagi.com",
    name: "kagi_session"
  }, (cookie) => {
    if (!cookie || !cookie.value)
      return;

    const token = cookie.value;

    if (sessionToken !== token) {
      sessionToken = token;
      saveToken(token, false);
    }
  });
}

/*
 * Adds an Authorization header to all Kagi requests.
 * This allows us to provide authentication without having to
 * track if the user is logged in between incognito and normal windows.
 */
function updateRules() {
  if (!sessionToken)
    return;

  chrome.declarativeNetRequest.updateDynamicRules(
    {
      addRules: [
      {
        "id": 1,
        "priority": 1,
        "action": {
          "type": "modifyHeaders",
          "requestHeaders": [
            {
              "header": "Authorization",
              "value": sessionToken,
              "operation": "set",
            },
          ],
        },
        "condition": {
          "urlFilter": "||kagi.com/",
          "resourceTypes": ["main_frame"]
        }
      }],
      removeRuleIds: [1]
    },
 );
}

chrome.webRequest.onBeforeRequest.addListener(
  checkForSession,
  { urls: [
    "https://kagi.com/*",
  ] },
  []
);

// Set our session token if we have one saved from storage.
function setup() {
  chrome.storage.local.get("session_token", (sessionObj) => {
    if (sessionObj && sessionObj.session_token) {
      sessionToken = sessionObj.session_token;
      updateRules();
    }
  });

  chrome.storage.local.get("sync_existing", (syncObj) => {
    if (syncObj && syncObj.sync_existing != undefined) {
      syncSessionFromExisting = syncObj.sync_existing;
    }
  });

  chrome.storage.local.get("api_token", (apiSessionObject) => {
    if (apiSessionObject && apiSessionObject.api_token) {
      sessionApiToken = apiSessionObject.api_token;
    }
  });
}

setup();
