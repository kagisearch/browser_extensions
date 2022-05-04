import * as polyfill from "./ext/browser_polyfill.js";

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

  await browser.runtime.sendMessage({ type: "get_data" }).then((response) => {
    if (!response) return;

    if (response.sync_existing) {
      eTokenDiv.style.display = "none";
      eAdvanced.style.display = "";
    } else {
      eTokenDiv.style.display = "";
      eAdvanced.style.display = "none";
    }

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
    eAdvanced.style.display = "none";
    eTokenDiv.style.display = '';
  });

  browser.runtime.onMessage.addListener(async (data) => {
    if (data.type === "synced") {
      setStatus("manual_token");
      eStatus.classList.add('status_good');
      eStatus.classList.remove('status_error');
    } else if (data.type === "reset") {
      setStatus("no_session");
      eStatus.classList.remove('status_good');
      eStatus.classList.add('status_error');
      eTokenDiv.style.display = 'none';
      eAdvanced.style.display = '';
    }
  });
}

document.addEventListener("DOMContentLoaded", setup);
