let sessionToken = undefined;
let syncSessionFromExisting = true;

function saveToken(token, manual) {
  sessionToken = token || sessionToken;

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

chrome.runtime.onMessage.addListener(async (data, sender, sendResponse) => {
  switch(data.type) {
    case "get_data": {
      sendResponse({
        token: sessionToken,
        sync_existing: syncSessionFromExisting,
        browser: "chrome",
      });
      break;
    }
    case "save_token": {
      saveToken(data.token, true);
      break;
    }
    case "open_extension": {
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
}

setup();
