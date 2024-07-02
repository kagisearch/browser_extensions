
function domainKeyForKnownHost(knownHost) {
  let domainKeys = Object.keys(domainMap);
  for (let i=0; i<domainKeys.length; i++) {
    let domainKey = domainKeys[i];
    if (domainMap[domainKey].indexOf(knownHost) > -1) {
      return domainKey;
    }
  }
  return "";
}
function paramForKnownHost(knownHost) {
  let paramKeys = Object.keys(paramDomainMap);
  for (let i=0; i<paramKeys.length; i++) {
    let paramKey = paramKeys[i];
    if (paramDomainMap[paramKey]().indexOf(knownHost) > -1) {
      return paramKey;
    }
  }
  return "";
}
function paramsForKnownHosts(knownHosts) {
  var params = [];
  for (let i=0; i<knownHosts.length; i++) {
    let param = paramForKnownHost(knownHosts[i]);
    if (param.length > 0) {
      params.push(param);
    }
  }
  return params.filter((value, index, array) => array.indexOf(value) === index);
}

// -----------------------
// MARK: - Private session link handling
// -----------------------
var privateSessionLink = "";

function hasPrivateSessionLink() {
  return (typeof privateSessionLink == "string" && privateSessionLink.length > 0);
}

function privateSessionLinkTextfieldChanged(evt) {
  const newLink = evt.type == "paste" ? event.clipboardData.getData("text") : evt.currentTarget.value;
  browser.storage.local.set({ "kagiPrivateSessionLink": newLink })
  .then((result) => {
    browser.runtime.sendMessage({
      "updatedKagiPrivateSessionLink": newLink
    })
    .then((result) => {
        if (typeof result !== "boolean") {
            console.log("Error sendMessage.updatedKagiPrivateSessionLink");
            (async () => await initialize())();
        }
    });
  })
}

document.querySelector("#private-session-link").addEventListener('change', privateSessionLinkTextfieldChanged);
document.querySelector("#private-session-link").addEventListener('paste', privateSessionLinkTextfieldChanged);


// -----------------------
// MARK: - Selecting default engine to redirect
// -----------------------
const defaultEngineToRedirect = "All";
var engineToRedirect = defaultEngineToRedirect;
const engineSelect = document.getElementById('engine-to-redirect');
const dnrStatusCheckbox = document.getElementById('is-dnr-enabled');

// Updates the UI
function selectCurrentEngine(currentEngine) {
  selectCurrentEngineIndex(Array.from(engineSelect.options).indexOf(engineSelect.namedItem(currentEngine)));
}
function selectCurrentEngineIndex(engineIndex) {
  engineSelect.selectedIndex = engineIndex;
}

// Runs when the selection changes
function engineToRedirectChanged() {
  const index = engineSelect.selectedIndex;
  updateEngineToRedirect(engineSelect.options[index].value);
}

// Stores the new engine in storage
function updateEngineToRedirect(newEngine) {
  engineToRedirect = newEngine;
  selectCurrentEngine(newEngine);
  return browser.storage.local.set({ "kagiEngineToRedirect": newEngine })
  .then((result) => {
      browser.runtime.sendMessage({
          "updatedKagiEngineToRedirect": newEngine
      }).then((result) => {
          if (typeof result !== "boolean") {
              console.log("Error sendMessage.updatedKagiPrivateSessionLink");
              (async () => await initialize())();
          }
      });
  });
}

engineSelect.addEventListener('change', engineToRedirectChanged);

// -----------------------
// MARK: - Displaying & updating host permissions
// -----------------------

const setupPermissions = { permissions: ["storage", "webNavigation", "declarativeNetRequestWithHostAccess", "nativeMessaging"], origins: ["*://kagi.com/*"] };

function checkSetupPermissions() {
  return new Promise((resolve, reject) => {
    browser.permissions.contains(setupPermissions)
    .then((alreadyGranted) => {
      updateSetupPermissionsUI(alreadyGranted);
      if (!alreadyGranted) {
        console.log("Permissions for storage are not granted");
        resolve(false);
      } else {
        console.log("Permissions for storage are currently granted");
        resolve(true);
      }
    })
    .catch((error) => {
      console.error(`Storage permission update onRejected function called: ${error.message}`);
      reject(error);
    });
  });
}

function updateSetupPermissionsUI(permissionsActive) {
    document.body.classList.toggle("setupPermissionsGranted", permissionsActive);
}

function fetchAndUpdateKnownHostList() {
  return browser.permissions.getAll()
  .then((permissions) => {
    let knownHosts = permissions["origins"].map((pattern) => pattern.replace(/^.*:\/\/.*?\.([.A-Za-z]+)\/.*$/, "$1"));
    let hasKnownHosts = knownHosts.length > 0;
    let enabledElement = document.querySelector("#overrides h3>span");
    enabledElement.classList.toggle("enabledForThisDomain", hasKnownHosts);
    enabledElement.innerText = hasKnownHosts ? "enabled on:" : "disabled";
    updateKnownHostList(knownHosts);
    
    // If the currently-redirecting engine no longer has permissions in the extension,
    // reset to "All"
    let enginesToDisplayInRedirectList = ["All"].concat(Array.from(document.querySelectorAll("[data-engine]")).map((en) => en.getAttribute("data-engine")));
    if (engineToRedirect != "All" && enginesToDisplayInRedirectList.indexOf(engineToRedirect) < 0) {
      engineToRedirect = "All";
    }
    
    // If we're still set to "All", update to the default
    // FIXME: "All" is a fallback in case something else breaks in our stored engine setting, to make sure "Redirect to Kagi" is the fallback to broken engine selection rather than "Don't redirect if we don't have a valid engine selected". There should be a more robust solution to this that sets smart defaults or detects Safari's search engine setting. There's a way to do the latter on macOS but not iOS.
    if (engineToRedirect == "All") {
      updateEngineToRedirect(defaultEngineToRedirect); // Need to default to *something*. Starting w/ Google
    }
    
    // Redirect engine list UI updates
    if (knownHosts.indexOf("*://*/*") > -1) {
      // TODO: Do we need custom logic for the "All websites allowed" permission?
    } else {
      if (enginesToDisplayInRedirectList.length > 0) {
        for (let i=0;i<engineSelect.options.length;i++) {
          // Disable engines we don't have permissions for
          engineSelect.options[i].disabled = (enginesToDisplayInRedirectList.indexOf(engineSelect.options[i].value) < 0);
          
          // Select the currently-redirected engine choice if it has permissions
          if (!(engineSelect.options[i].disabled) && engineToRedirect == engineSelect.options[i].value) {
            selectCurrentEngineIndex(i);
          }
        }
          
        // Set the default to the first permissioned engine in the list if we still haven't selected an engine
        if (engineSelect.options[engineSelect.selectedIndex].disabled) {
          let firstEnabledEngine = enginesToDisplayInRedirectList[0];
          updateEngineToRedirect(firstEnabledEngine);
        }
      } else {
        // We end up here if the user grants permission to only non-search-engine urls
        // and opens the popup.
        
        // Leave the list as-is. Let them change the redirect if they please.
      }
    }
    return Promise.resolve();
  });
}

function updateKnownHostList(knownHosts) {
  
  var hostsMap = {};
  var hostsHtml = "";
  
  // Check if permissions have been granted for all urls instead of specific ones 
  let hasAllUrlsPermissions = (knownHosts.indexOf("*://*/*") > -1)
  
  if (hasAllUrlsPermissions) {
    hostsHtml += `<details class="allUrls"><summary>All Search Engines <a href="#" class="revokePermissions" data-engine="All">${symbolTrashBase64ImgTag}<span class="confirmationText"> (tap again to remove permissions)</span></a></summary><ul class="noListStyle"><li>`;
    hostsMap = domainMap;
  } else {
    for (let i=0; i<knownHosts.length; i++) {
      let host = knownHosts[i];
      let engine = domainKeyForKnownHost(host);
      if (engine.length == 0) { continue; }
      if (typeof hostsMap[engine] == "undefined") {
        hostsMap[engine] = [host];
      } else {
        hostsMap[engine] = hostsMap[engine].concat([host]);
      }
    }
  }
  
  let engineKeys = Object.keys(hostsMap);
  for (let i=0; i<engineKeys.length; i++) {
    let engine = engineKeys[i];
    let engineHosts = hostsMap[engine];
    hostsHtml += generateHtmlForEngine(engine, engineHosts);
  }
  
  if (hasAllUrlsPermissions) {
    hostsHtml += `</li></ul></details>`;
  }
  
  document.getElementById("current-overrides").innerHTML = hostsHtml;
  updateRevokeHostPermissionsHandlers();
}

function generateHtmlForEngine(engine, engineHosts) {
  var engineHtml = "";
  engineHtml += `<details><summary>${engine} <a href="#" class="revokePermissions" data-engine="${engine}">${symbolTrashBase64ImgTag}<span class="confirmationText"> (open Safari Extension Settings)</span></a></summary><ul>`;
  for (let hi=0; hi<engineHosts.length; hi++) {
    let host = engineHosts[hi];
    engineHtml += `<li>${host} <a href="#" class="revokePermissions" data-host="${host}">${symbolTrashBase64ImgTag}<span class="confirmationText"> (open Safari Extension Settings)</span></a></li>`;
  }
  engineHtml += `</ul></details>`;
  return engineHtml;
}

function revokeHostPermissionLinkClicked(evt) {
  let el = evt.currentTarget;
  if (el.classList.contains("readyToConfirm")) {
    window.open('kagisearch://open-app?destination=safari-extension-settings-deep');
  } else {
    el.classList.add("readyToConfirm");
  }
}

async function revokeHostPermissions(matchPatterns) {
  console.info("[revokeHostPermissions] Revoking host permissions for origins:", matchPatterns);
  browser.permissions.remove({origins: matchPatterns}).then((successful) => {
    if (successful) {
      return fetchAndUpdateKnownHostList();
    } else {
      // TODO: how to display failure to remove a host permission?
      console.error("[revokeHostPermissions] Failed to revoke host permissions")
      return Promise.resolve(false);
    }
  })
  .catch((error) => {
    console.error(`[revokeHostPermissions] Error revoking host permissions: ${error.message}`);
  });
}

function updateRevokeHostPermissionsHandlers() {
  document.querySelectorAll(".revokePermissions").forEach((element) => {
    element.removeEventListener("click", revokeHostPermissionLinkClicked);
    element.addEventListener("click", revokeHostPermissionLinkClicked);
  });
}

// -----------------------
// MARK: - Override to dismiss confirmation text
// -----------------------
function dismissConfirmationText() {
  document.querySelectorAll(".revokePermissions")
  .forEach((element) => element.classList.remove("readyToConfirm"));
}

document.onclick = function (e) {
  e = e ||  window.event;
  var element = e.target || e.srcElement;

  if ((element.tagName == 'A' && !element.classList.contains("readyToConfirm")) || element.closest(".readyToConfirm") == null) {
    dismissConfirmationText();
    return true; // allow normal event to happen
  }
};

// -----------------------
// MARK: - Onload handler
// -----------------------
document.addEventListener("DOMContentLoaded", (event) => {
  
  browser.storage.local.get(["kagiEngineToRedirect", "kagiPrivateSessionLink"])
  .then((results) => {
    // Fetch the current engine to redirect from local storage
    if (typeof results == "object" &&
      typeof results["kagiEngineToRedirect"] == "string"
      && results["kagiEngineToRedirect"].length > 0) {
        engineToRedirect = results["kagiEngineToRedirect"];
    }
    
    // Fetch the current private session link from storage
    if (typeof results == "object" &&
        typeof results["kagiPrivateSessionLink"] == "string"
        && results["kagiPrivateSessionLink"].length > 0) {
      privateSessionLink = results["kagiPrivateSessionLink"];
      document.querySelector("#private-session-link").value = privateSessionLink;
    }
  })
  .finally(() => {
      selectCurrentEngine(engineToRedirect);
      fetchAndUpdateKnownHostList();
      checkSetupPermissions();
      dnrEnabledStatusUpdateUI();
  });
});

// -----------------------
// MARK: - Button click handlers
// -----------------------
document.getElementById("setup-permissions-button").onclick = async function(evt) {
  console.log("Checking kagi.com permissions");
  checkSetupPermissions()
  .then((alreadyGranted) => {
    if (!alreadyGranted) {
        return browser.permissions.request(setupPermissions);
    }
  })
  .then((granted) => {
    updateSetupPermissionsUI(granted);
    if (!granted) {
      return Promise.reject(new Error("Permissions for kagi.com were denied"));
    } else {
      console.log("Permissions for kagi.com are granted");
      setTimeout(function(){
        window.location.href = "popup.html";
      }, 500);
      // browser.runtime.reload();
    }
    return Promise.resolve();
  })
  .catch((error) => {
    console.error(`kagi.com permission update onRejected function called: ${error.message}`);
  });
};

dnrStatusCheckbox.onchange = async function(evt) {
    if (dnrStatusCheckbox.checked) {
        localStorage.setItem("is-dnr-enabled", true);
        (async () => await initialize())();
    } else {
        localStorage.setItem("is-dnr-enabled", false);
        (async () => await clearDynamicRules())();
    }
};

function dnrEnabledStatusUpdateUI() {
    if (versionMajor < 17) {
        document.getElementById("dnr-status-wrapper").style.display = "none";
        return;
    }
    let isDNREnabled = localStorage.getItem("is-dnr-enabled")
    if (isDNREnabled != null) {
        if (isDNREnabled == "true") {
            dnrStatusCheckbox.setAttribute("checked", "true");
        } else {
            dnrStatusCheckbox.removeAttribute("checked");
        }
    } else {
        dnrStatusCheckbox.setAttribute("checked", "true");
    }
}

const symbolTrashBase64ImgTag = `<img alt="" src="data:image/png;base64,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" />`;
