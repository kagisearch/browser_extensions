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

  const eApiTokenInput = document.querySelector("#api_token_input");
  if (!eApiTokenInput) {
    console.error("Could not set API token because no input exists");
    return;
  }

  eApiTokenInput.addEventListener("focus", (e) => {
    e.target.select();
  });

  eApiTokenInput.addEventListener("click", () => this.value ? this.setSelectionRange(0, this.value.length) : null);

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

  chrome.runtime.sendMessage({ type: "get_data" }, (response) => {
    if (!response) return;

    if (response.api_token) {
      eSummarize.style.display = "";
      eApiTokenInput.value = response.api_token;
    } else {
      eSummarize.style.display = "none";
    }

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
              chrome.runtime.sendMessage({type: "open_extension"}, (response) => {
                if (!response)
                  console.error('error opening extension: ', chrome.runtime.lastError.message);
              });
            });
          }
        }
      });
    }
  });

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

    const eApiToken = document.querySelector("#api_token_input");
    if (!eApiToken) {
      console.error("No API token input found.");
      return;
    }

    const apiToken = eApiToken.value;

    chrome.runtime.sendMessage({ type: "save_token", token: token, api_token: apiToken }, (response) => {
      if (!response)
        console.error('error saving token: ', chrome.runtime.lastError.message);
    });
  });

  eAdvanced.addEventListener("click", async () => {
    if (eTokenDiv.style.display === '') {
      eAdvanced.innerHTML = 'Advanced settings';
      eTokenDiv.style.display = 'none';
    } else {
      eAdvanced.innerHTML = 'Hide advanced settings';
      eTokenDiv.style.display = '';
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

    const eApiToken = document.querySelector("#api_token_input");
    if (!eApiToken) {
      console.error("No API token input found.");
      return;
    }

    const apiToken = eApiToken.value;

    chrome.tabs.query({ active: true }, (tabs) => {
      const tab = tabs[0];

      const { url } = tab;

      eSummaryResult.classList.remove('error');
      eSummaryResult.style.display = "";
      eSummaryResult.innerHTML = 'Summarizing...';

      chrome.runtime.sendMessage({ type: "summarize_page", api_token: apiToken, url, summary_type: eSummaryType.value, target_language: eTargetLanguage.value }, (response) => {
        if (!response)
          console.error('error summarizing: ', chrome.runtime.lastError.message);
      });
    });
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
      } else {
        eSummaryResult.classList.add('error');
      }
      eSummaryResult.style.display = "";
      eSummaryResult.innerHTML = data.summary.replaceAll(/\n/g, '<br />');
    }

    sendResponse(true);
    return true;
  });
}

document.addEventListener("DOMContentLoaded", setup);
