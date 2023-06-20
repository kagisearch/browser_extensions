let summaryTextContents = '';

function setStatus(type) {
  const eNoSession = document.querySelector("#no_session");
  const eManualToken = document.querySelector("#manual_token");
  const eAutoToken = document.querySelector("#auto_token");

  switch (type) {
    case "no_session": {
      eNoSession.style.display = "";
      eManualToken.style.display = "none";
      eAutoToken.style.display = "none";
      break;
    }
    case "manual_token": {
      eNoSession.style.display = "none";
      eManualToken.style.display = "";
      eAutoToken.style.display = "none";
      break;
    }
    case "auto_token": {
      eNoSession.style.display = "none";
      eManualToken.style.display = "none";
      eAutoToken.style.display = "";
      break;
    }
    default:
      break;
  }
}

async function setup() {
  const eTokenDiv = document.querySelector("#token");
  if (!eTokenDiv) {
    console.error("Could not find token div");
    return;
  }

  const eTokenInput = document.querySelector("#token_input");
  if (!eTokenInput) {
    console.error("Could not set token because no input exists");
    return;
  }

  eTokenInput.addEventListener("focus", (e) => {
    e.target.select();
  });

  eTokenInput.addEventListener("click", () => this.value ? this.setSelectionRange(0, this.value.length) : null);

  const eStatus = document.querySelector("#status");

  const eAdvanced = document.querySelector("#advanced");
  if (!eAdvanced) {
    console.error("Could not find advanced toggle");
    return;
  }

  const eSummarize = document.querySelector("#summarize");
  if (!eSummarize) {
    console.error("Could not find summarize section");
    return;
  }

  const eSummarizePage = document.querySelector("#summarize_page");
  if (!eSummarizePage) {
    console.error("Could not find summarize page button");
    return;
  }

  const eSummaryResult = document.querySelector("#summary_result");
  if (!eSummaryResult) {
    console.error("Could not find summarize result div");
    return;
  }

  eSummaryResult.style.display = "none";
  eSummaryResult.classList.remove('error');

  const eCopySummary = document.querySelector("#copy_summary");
  if (!eCopySummary) {
    console.error("Could not find copy summary button");
    return;
  }

  eCopySummary.style.display = "none";

  async function handleGetData(response) {
    if (response.token && eStatus) {
      eStatus.classList.remove('status_error');
      eStatus.classList.add('status_good');

      eTokenInput.value = response.token;

      if (response.sync_existing)
        setStatus("auto_token");
      else
        setStatus("manual_token");

      chrome.extension.isAllowedIncognitoAccess()
        .then((isAllowedAccess) => {
          if (isAllowedAccess)
            return;

          const eIncognito = document.querySelector("#incognito");
          if (!eIncognito) {
            console.error('No div to place text?');
            return;
          }

          eIncognito.style.display = "";

          // NOTE: slight little hack to make the chrome://extensions link not be blocked.
          if (response.browser === "chrome") {
            const eChromeLink = document.querySelector("#chrome_link");
            if (eChromeLink) {
              eChromeLink.addEventListener("click", async () => {
                chrome.runtime.sendMessage({ type: "open_extension" }, (response) => {
                  if (!response)
                    console.error('error opening extension: ', chrome.runtime.lastError.message);
                });
              });
            }
          }
        });
    }
  }

  try {
    chrome.runtime.sendMessage({ type: "get_data" }, (response) => {
      if (!response) return;

      handleGetData(response);
    });
  } catch (error) {
    // Sometimes the background/popup communication fails, but we can still get local info
    const sessionObject = await chrome.storage.local.get('session_token');
    const syncObject = await chrome.storage.local.get('sync_existing');

    handleGetData({
      token: sessionObject?.session_token,
      sync_existing: typeof syncObject?.sync_existing !== 'undefined' ? syncObject : true,
      browser: "chrome",
    });
  }

  const eSaveToken = document.querySelector("#token_save");
  if (!eSaveToken) {
    console.error("Could not find save token button");
    return;
  }

  eSaveToken.addEventListener("click", async () => {
    const eToken = document.querySelector("#token_input");
    if (!eToken) {
      console.error("No token input found.");
      return;
    }

    let token = eToken.value;

    if (token.startsWith("https://kagi.com")) {
      const url = new URL(token);
      token = url.searchParams.get("token");

      if (token) eToken.value = token;
    }

    chrome.runtime.sendMessage({ type: "save_token", token: token }, (response) => {
      if (!response)
        console.error('error saving token: ', chrome.runtime.lastError.message);
    });
  });

  eAdvanced.addEventListener("click", async () => {
    if (eTokenDiv.style.display === '') {
      eAdvanced.innerHTML = 'Advanced settings';
      eTokenDiv.style.display = 'none';
      eSummarize.style.display = '';
    } else {
      eAdvanced.innerHTML = 'Hide advanced settings';
      eTokenDiv.style.display = '';
      eSummarize.style.display = 'none';
      eSummaryResult.style.display = 'none';
      eCopySummary.style.display = 'none';
    }
  });

  eSummarizePage.addEventListener("click", async () => {
    const eSummaryType = document.querySelector("#summary_type");
    if (!eSummaryType) {
      console.error("No summary type select found.");
      return;
    }

    const eTargetLanguage = document.querySelector("#target_language");
    if (!eTargetLanguage) {
      console.error("No target language select found.");
      return;
    }

    chrome.tabs.query({ active: true }, (tabs) => {
      // Chrome might give us more than one active tab when something like "chrome://*" is also open
      const tab = tabs.find((tab) => tab.url.startsWith('http://') || tab.url.startsWith('https://')) || tabs[0];

      const { url } = tab;

      eSummaryResult.classList.remove('error');
      eSummaryResult.style.display = "";
      eSummaryResult.innerHTML = 'Summarizing...';
      eCopySummary.style.display = "none";
      summaryTextContents = '';

      chrome.runtime.sendMessage({ type: "summarize_page", url, summary_type: eSummaryType.value, target_language: eTargetLanguage.value }, (response) => {
        if (!response)
          console.error('error summarizing: ', chrome.runtime.lastError.message);
      });
    });
  });

  eCopySummary.addEventListener("click", async () => {
    if (!summaryTextContents) {
      return;
    }

    try {
      await navigator.clipboard.writeText(summaryTextContents);

      eCopySummary.innerText = "Copied!";

      setTimeout(() => {
        eCopySummary.innerText = "Copy summary";
      }, 3000);
    } catch (error) {
      console.error('error copying summary to clipboard: ', error);
    }
  });

  chrome.runtime.onMessage.addListener(async (data, sender, sendResponse) => {
    if (data.type === "synced") {
      setStatus("manual_token");
      eStatus.classList.add('status_good');
      eStatus.classList.remove('status_error');
      eSummarize.style.display = "";
    } else if (data.type === "reset") {
      setStatus("no_session");
      eStatus.classList.remove('status_good');
      eStatus.classList.add('status_error');
      eTokenDiv.style.display = 'none';
      eAdvanced.style.display = '';
    } else if (data.type === "summary_finished") {
      if (data.success) {
        eSummaryResult.classList.remove('error');
        summaryTextContents = data.summary;
        eCopySummary.style.display = '';
      } else {
        eSummaryResult.classList.add('error');
        summaryTextContents = '';
        eCopySummary.style.display = 'none';
      }
      eSummaryResult.style.display = "";
      eSummaryResult.innerHTML = data.summary.replaceAll(/\n/g, '<br />');
    } else if (data.type === "summarize_page") {
      eSummarizePage.dispatchEvent('click');
    }

    sendResponse(true);
    return true;
  });
}

document.addEventListener("DOMContentLoaded", setup);
