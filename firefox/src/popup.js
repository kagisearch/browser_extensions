import * as polyfill from "./ext/browser_polyfill.js";

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

  const eKagiLink = document.querySelector("#kagi_link");
  if (eKagiLink) {
    eKagiLink.addEventListener("click", () => {
      browser.tabs.create({
        url:"https://kagi.com/",
        active: true
      });
      window.close();
    });
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

  await browser.runtime.sendMessage({ type: "get_data" }).then((response) => {
    if (!response) return;

    if (response.token && eStatus) {
      eStatus.classList.remove('status_error');
      eStatus.classList.add('status_good');

      eTokenInput.value = response.token;

      if (response.sync_existing)
        setStatus("auto_token");
      else
        setStatus("manual_token");

      browser.extension.isAllowedIncognitoAccess()
        .then((isAllowedAccess) => {
          if (isAllowedAccess)
            return;

          const eIncognito = document.querySelector("#incognito");
          if (!eIncognito) {
            console.error('No div to place text?');
            return;
          }

          eIncognito.style.display = "";

          const eFirefoxExt = document.querySelector("#firefox_ext");
          const eChromeExt = document.querySelector("#chrome_ext");

          if (response.browser === "firefox") {
            eFirefoxExt.style.display = "";
            eChromeExt.style.display = "none";
          } else if (response.browser === "chrome") {
            eFirefoxExt.style.display = "none";
            eChromeExt.style.display = "";
          }

          // NOTE: slight little hack to make the chrome://extensions link not be blocked.
          if (response.browser === "chrome") {
            const eChromeLink = document.querySelector("#chrome_link");
            if (eChromeLink) {
              eChromeLink.addEventListener("click", async () => {
                await browser.runtime.sendMessage({type: "open_extension"});
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

    await browser.runtime.sendMessage({ type: "save_token", token: token });
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

    chrome.tabs.query({ active: true }, (tabs) => {
      const tab = tabs[0];

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

  browser.runtime.onMessage.addListener(async (data) => {
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
  });
}

document.addEventListener("DOMContentLoaded", setup);
