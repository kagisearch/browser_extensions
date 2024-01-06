const domainMap = {
  "Google": ["google.com.au", "google.md", "google.ru", "google.me", "google.com.qa", "google.com.gt", "google.se", "google.tm", "google.vg", "google.it", "google.cat", "google.com.ru", "google.com.gr", "google.ee", "google.cd", "google.sk", "google.com.ly", "google.hn", "google.co.jp", "google.ad", "google.com.sg", "google.ie", "google.co.vi", "google.kg", "google.com.kh", "google.co.ck", "google.is", "google.tt", "google.vu", "google.bg", "google.ch", "google.com.sa", "google.tn", "google.pl", "google.ro", "google.gm", "google.tl", "google.mg", "google.dk", "google.com.bo", "google.je", "google.com.kw", "google.dz", "google.ga", "google.com.gh", "google.lt", "google.com.ag", "google.ps", "google.com.vc", "google.com.pr", "google.co.cr", "google.pn", "google.com.tr", "google.sn", "google.tg", "google.gg", "google.gr", "google.com.mt", "google.nu", "google.cm", "google.lk", "google.co.mz", "google.cv", "google.sm", "google.no", "google.al", "google.bi", "google.com.af", "google.sr", "google.jo", "google.sh", "google.co.uk", "google.co.bw", "google.dm", "google.at", "google.co.ug", "google.dj", "google.si", "google.com.pg", "google.com.tj", "google.co.za", "google.nl", "google.sc", "google.ae", "google.mv", "google.ne", "google.gy", "google.com.sl", "google.co.in", "google.com.bn", "google.ht", "google.com.ua", "google.com.my", "google.co.kr", "google.com", "google.by", "google.com.cu", "google.com.lb", "google.co.nz", "google.mu", "google.com.om", "google.as", "google.com.pe", "google.mk", "google.td", "google.es", "google.az", "google.com.hk", "google.com.do", "google.bt", "google.am", "google.fm", "google.com.mx", "google.fi", "google.com.bz", "google.st", "google.com.vn", "google.rs", "google.bs", "google.cn", "google.com.pa", "google.com.sb", "google.lv", "google.co.uz", "google.co.hu", "google.co.ve", "google.co.zw", "google.com.ai", "google.com.co", "google.ci", "google.com.uy", "google.cl", "google.mw", "google.cz", "google.co.il", "google.co.th", "google.be", "google.hr", "google.fr", "google.im", "google.com.ec", "google.cg", "google.iq", "google.com.np", "google.gl", "google.co.ke", "google.co.id", "google.ml", "google.ms", "google.com.ni", "google.mn", "google.ki", "google.lu", "google.hu", "google.rw", "google.co.ma", "google.com.tw", "google.co.ls", "google.com.et", "google.li", "google.com.br", "google.bj", "google.com.py", "google.co.tz", "google.ba", "google.co.ao", "google.bf", "google.com.ph", "google.com.sv", "google.com.bd", "google.com.mm", "google.la", "google.ws", "google.com.fj", "google.co.zm", "google.cf", "google.nr", "google.to", "google.com.jm", "google.com.ar", "google.com.gi", "google.ca", "google.kz", "google.com.cy", "google.de", "google.com.na", "google.com.pk", "google.pt", "google.ge", "google.so", "google.com.bh", "google.com.eg", "google.com.ng"],
  "DuckDuckGo": ["duckduckgo.com", "duckduckgo.pl", "duckduckgo.jp", "duckduckgo.co", "duckduckco.de", "duckduckgo.ca", "duckduckgo.co.uk", "duckduckgo.com.mx", "duckduckgo.com.tw", "duckduckgo.dk", "duckduckgo.in", "duckduckgo.ke", "duckduckgo.mx", "duckduckgo.nl", "duckduckgo.org", "duckduckgo.sg", "duckduckgo.uk", "duckgo.com", "ddg.co", "ddg.gg", "duck.co", "duck.com"],
  "Yahoo": ["search.yahoo.com"],
  "Ecosia": ["ecosia.org"],
  "Bing": ["bing.com", "m.baidu.com"],
  "Sogou": ["m.so.com", "so.com", "sogou.com", "m.sogou.com"],
  "Baidu": ["baidu.com", "m.baidu.com"],
  "Yandex": ["yandex.ru", "yandex.org", "yandex.net", "yandex.net.ru", "yandex.com.ru", "yandex.ua", "yandex.com.ua", "yandex.by", "yandex.eu", "yandex.ee", "yandex.lt", "yandex.lv", "yandex.md", "yandex.uz", "yandex.mx", "yandex.do", "yandex.tm", "yandex.de", "yandex.ie", "yandex.in", "yandex.qa", "yandex.so", "yandex.nu", "yandex.tj", "yandex.dk", "yandex.es", "yandex.pt", "yandex.pl", "yandex.lu", "yandex.it", "yandex.az", "yandex.ro", "yandex.rs", "yandex.sk", "yandex.no", "ya.ru", "yandex.com", "yandex.asia", "yandex.mobi"]
}
const paramDomainMap = {
  "text": function() { return domainMap["Yandex"]; },
  "wd": function() { return ["baidu.com"]; },
  "word": function() { return ["m.baidu.com"] },
  "query": function() { return ["sogou.com"]; },
  "keyword": function() { return ["m.sogou.com"]; },
  "p": function() { return ["search.yahoo.com"]; },
  "q": function() { return [...domainMap["Google"], ...domainMap["DuckDuckGo"], ...domainMap["Ecosia"], ...domainMap["Bing"], ...["m.so.com", "so.com"]]; }
};
const allSupportedDomains = [...domainMap["Google"], ...domainMap["DuckDuckGo"], ...domainMap["Ecosia"], ...domainMap["Bing"], ...domainMap["Yahoo"], ...domainMap["Sogou"], ...domainMap["Yandex"], ...domainMap["Baidu"]];
const knownHostPermissions = [];
const setupPermissions = { permissions: ["activeTab", "scripting"], origins: ["*://*.kagi.com/*"] };
var isPrivateBrowsingAllowed = false;
var activeTabUrl = "";
var hostname = "";
var matchPattern = "";

const userAgent = window.navigator.userAgent,
      platform = window.navigator?.userAgentData?.platform || window.navigator.platform,
      macosPlatforms = ['macOS', 'Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
      iosPlatforms = ['iPhone', 'iPad', 'iPod'];
const extensionId = "com.kagi.Kagi-Search.Extension (TFVG979488)";
const ruleIdStart = 100;
const ruleTemplate = {
  "id": 999,
  "priority": 1,
  "action": {
    "type": "redirect",
    "redirect": {
      "regexSubstitution": "https://www.kagi.com/search?q=\\1"
    }
  },
  "condition": {
    "resourceTypes": [ "main_frame" ],
    "requestDomains": [],
    "regexFilter": "^https?:\/\/.+[\?&]{{parameterKey}}=([^&]*)&?",
    "excludedInitiatorDomains": ["kagi.com"]
  }
};
// const kagiCookieTemplate = {
//   "id": 1,
//   "priority": 1,
//   "action": {
//     "type": "modifyHeaders",
//     "requestHeaders": [
//       {
//         "header": "cookie",
//         "operation": "append",
//         "value": "kagi_session=SESSION_TOKEN"
//       }
//     ]
//   },
//   "condition": { "resourceTypes": ["main_frame"], "urlFilter": "||kagi.com" }
// };

// Not currently used since Safari always returns `true` for `isAllowedIncognitoAccess()`
function updatePrivateBrowsingUI(isAllowed) {
  return;
  isPrivateBrowsingAllowed = isAllowed;
  document.body.classList.toggle("private-browsing-allowed", isPrivateBrowsingAllowed);
  document.body.classList.toggle("private-browsing-disallowed", !isPrivateBrowsingAllowed);
  if (isPrivateBrowsingAllowed) {
    
  }
}

// -----------------------
// MARK: - Redirect rules & permissions
// -----------------------

function fetchKnownHostPermissions() {
  return new Promise(async (resolve, reject) => {
    knownHostPermissions.length = 0; // clear the array
    let domainKeys = Object.keys(domainMap);
    for (let i=0; i<domainKeys.length; i++) {
      let domainKey = domainKeys[i];
      let domains = domainMap[domainKey];
      for (let j=0; j<domains.length; j++) {
        let domain = domains[j];
        let containsHostPermission = await browser.permissions.contains({ origins: [`*://*.${domain}/*`], permissions: ["declarativeNetRequestWithHostAccess"]});
        if (containsHostPermission) {
          knownHostPermissions.push(domain);
        }
      }
    }
    console.info(`Host permissions granted for:`, knownHostPermissions);
    updateKnownHostListUI();
    return resolve();
  });
}

async function updateAllRules(sessionToken) {
  let hasSessionToken = (sessionToken != null && sessionToken.trim().length > 0);
  let paramKeys = Object.keys(paramDomainMap);
  try {
    let oldRules = await browser.declarativeNetRequest.getDynamicRules();
    var newRules = [];
    for (let i=0; i<paramKeys.length; i++) {
      let ruleId = i + ruleIdStart;
      let paramKey = paramKeys[i];
      let regexFilterWithParamKey = ruleTemplate["condition"]["regexFilter"].replace("{{parameterKey}}", paramKey);
      // console.log(regexFilterWithParamKey);
      var regexSubstitution = ruleTemplate["action"]["redirect"]["regexSubstitution"];
      if (hasSessionToken) {
        regexSubstitution = regexSubstitution + "&token=" + sessionToken;
      }
      // console.log(regexSubstitution);
      var newRule = structuredClone(ruleTemplate);
      newRule["id"] = ruleId;
      newRule["condition"]["regexFilter"] = regexFilterWithParamKey;
      let wwwDomainMap = structuredClone(paramDomainMap[paramKey]());
      newRule["condition"]["requestDomains"] = paramDomainMap[paramKey]().concat(wwwDomainMap.map((domain) => { return domain.startsWith("www.") ? "" : `www.${domain}`; }).filter((d) => d.length > 0));
      newRule["action"]["redirect"]["regexSubstitution"] = regexSubstitution;
      newRules.push(newRule);
    }
    console.log("Attempting to write new dynamic rules:", newRules);
    return browser.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: oldRules.map(rule => rule.id),
      addRules: newRules
    })
    .then((result) => {
      return fetchKnownHostPermissions();
    })
    .then((result) => { return Promise.resolve(true); });
    
  } catch (e) {
    console.log(`Failed to save rules: ${e}`)
    return Promise.reject(e);
  }
}

function updateKnownHostListUI() {
  document.body.classList.toggle("readyToSearch", knownHostPermissions.length > 0);
  
  const hosts = structuredClone(knownHostPermissions);
  if (hosts.length == 0) {
    hosts.push("No search engines redirecting");
  }
  document.getElementById("current-overrides").innerHTML = `<li>${hosts.join('</li><li>')}</li>`;
}

function hostnameIsSupportedSearchEngine(engineHostname) {
  if (typeof engineHostname != "string" || engineHostname.length < 1) {
    return false;
  }
  return (allSupportedDomains.indexOf(engineHostname) > -1 ||
          allSupportedDomains.indexOf(engineHostname.replace(/^www\./, "")) > -1);
}

// -----------------------
// MARK: - Private session token
// -----------------------

var flagCheckedLocalStorageForPrivateSessionToken = false;
var privateSessionToken = "";
      
function addPrivateSessionLinkListener() {
  const privateSessionInput = document.getElementById('private-session-link');
  privateSessionInput.addEventListener('change', () => {
    const newLink = privateSessionInput.value;
    updatePrivateSessionToken(newLink);
  });
}

function getLocalPrivateSessionToken() {
  browser.storage.local.get("kagiPrivateSessionToken", function(value) {
    var token = value.kagiPrivateSessionToken;
    flagCheckedLocalStorageForPrivateSessionToken = true;
    if (typeof(token) !== "undefined") {
      privateSessionToken = token;
    } else {
      privateSessionToken = "";
    }
    updatePrivateSessionUI(privateSessionToken.length > 0);
  });
}

function getPrivateSessionTokenFromPageIfAvailable(requestScriptingIfNotYetGranted) {
  const kagiScriptingPermissions = {
      permissions: ["scripting"],
      origins: ["*://*.kagi.com/*"]
  };
  
  return new Promise((resolve, reject) => {
    
    if (activeTabUrl.search(/https:\/\/(stage\.)?kagi\.com\/settings\?p=user_details/) != 0) {
      console.info("Skipping private session token fetch, activeTab url is not https://kagi.com/settings?p=user_details");
      return resolve(false);
    }
    // 1. Check for scripting permission on kagi.com
    browser.permissions.contains(kagiScriptingPermissions)
    .then((alreadyHaveKagiScripting) => {
      // 2. If permission granted, get current tab info, otherwise request if desired before requesting current tab info
      const scriptingNotGrantedError = new Error(`Permission for kagi.com scripting was not granted`);
      if (!alreadyHaveKagiScripting && !requestScriptingIfNotYetGranted) {
        return Promise.reject(scriptingNotGrantedError);
      } else if (!alreadyHaveKagiScripting && requestScriptingIfNotYetGranted) {
        return browser.permissions.request(kagiScriptingPermissions).then((scriptingGranted) => {
          if (!scriptingGranted) {
            return Promise.reject(scriptingNotGrantedError);
          } else {
            return browser.tabs.getCurrent();
          }
        });
      } else {
        return browser.tabs.getCurrent();
      }
    })
    .then(async (tab) => {
      // 3. With current tab, execute a script that fetches the token from the page
      console.log(`Executing session token fetch script on tab ${tab.id} on url ${tab.url}`);
      let result = await browser.scripting.executeScript({
        target: {
          tabId: tab.id,
        },
        func: () => {
          let sessionLinkUrl = new URL(document.querySelector(".search_token input").getAttribute("value"));
          let token = sessionLinkUrl.searchParams.get("token");
          return token;
        },
      });
      return Promise.resolve(result);
    })
    .then((scriptResult) => {
      // 4. Store the token and update the UI
      console.log("Retrieved script result:", scriptResult);
      let token = scriptResult[0].result;
      if (typeof token != "string" || token.length < 1) {
        return Promise.reject(new Error(`Session token capture failed. Expected token string, instead received ${token}`));
      } else {
        updatePrivateSessionToken(token);
        return resolve(true);
      }
    }).then((didStoreToken) => {
      return updateAllRules(privateSessionToken);
    })
    .catch((error) => {
      console.error(`Kagi session token fetching failed: ${error.message}`);
      reject(error);
    });
  });
}

function updatePrivateSessionTokenFromLink(link) {
  try {
    const tokenUrl = new URL(link.trim());
    var token = tokenUrl.searchParams.get('token');
    if (token != null) {
      updatePrivateSessionToken(token);
    } else {
      updatePrivateSessionToken("");
    }
  } catch (e) {
    updatePrivateSessionToken("");
  }
}

function updatePrivateSessionToken(token) {
  if (token != null && typeof token == "string" && token.length > 0) {
    browser.storage.local.set({ kagiPrivateSessionToken: token });
    privateSessionToken = token;
  } else {
    browser.storage.local.set({ kagiPrivateSessionToken: "" });
    privateSessionToken = "";
  }
  updatePrivateSessionUI(privateSessionToken.length > 0);
}

function updatePrivateSessionUI(tokenExists) {
  document.body.classList.toggle("readyForPrivateBrowsing", tokenExists);
  if (tokenExists) {
    
  } else {
    
  }
}

// document.getElementById("open-app").onclick = function() {
//   if (macosPlatforms.indexOf(platform) !== -1) {
//     browser.runtime.sendNativeMessage(extensionId, {"type": "openApp"}, function(response) {
//       window.close();
//     });
//   } else if (iosPlatforms.indexOf(platform) !== -1) {
//     window.open("kagisearch://")
//   }
// }

// -----------------------
// MARK: - activeTab checks & updates
// -----------------------

function checkSetupPermissions() {
  return new Promise((resolve, reject) => {
    browser.permissions.contains(setupPermissions)
    .then((alreadyGrantedActiveTab) => {
      updateSetupPermissionsUI(alreadyGrantedActiveTab);
      if (!alreadyGrantedActiveTab) {
        console.log("Permissions for activeTab are not granted");
        resolve(false);
      } else {
        console.log("Permissions for activeTab are currently granted");
        resolve(true);
      }
    })
    .catch((error) => {
      console.error(`ActiveTab permission update onRejected function called: ${error.message}`);
      reject(error);
    });
  });
}

const ACTIVETAB_BUTTON_VALUE_REQUEST = "Grant setup permissions";
const ACTIVETAB_BUTTON_VALUE_REMOVE = "Remove setup permissions";
function updateSetupPermissionsUI(permissionsActive) {
  let activeTabHostnameAcquired = (hostname.length > 0 && matchPattern.length > 0);
  let activeTabHostnameIsSupportedEngine = hostnameIsSupportedSearchEngine(hostname);
  
  document.body.classList.toggle("setupPermissionsGranted", permissionsActive);
  document.body.classList.toggle("activeTabHostnameAcquired", activeTabHostnameAcquired);
  document.body.classList.toggle("activeTabHostnameIsSupportedEngine", activeTabHostnameIsSupportedEngine);
  
  if (!permissionsActive) {
    document.getElementById("setup-permissions-button").setAttribute("value", ACTIVETAB_BUTTON_VALUE_REQUEST);
  } else {
    document.getElementById("setup-permissions-button").setAttribute("value", ACTIVETAB_BUTTON_VALUE_REMOVE); 
  }
  
  let updateRulesButton = document.getElementById("update-rules");
  updateRulesButton.removeAttribute("disabled");
  if (activeTabHostnameIsSupportedEngine &&
      (knownHostPermissions.indexOf(hostname) > -1 ||
       knownHostPermissions.indexOf(hostname.replace(/^www\./, "")) > -1)) {
    updateRulesButton.setAttribute("value", `Disable Kagi redirects for ${hostname}`);
  } else if (activeTabHostnameIsSupportedEngine) {
    updateRulesButton.setAttribute("value", `Enable Kagi redirects for ${hostname}`);
  }
}

function fetchActiveTabHost() {
  return new Promise((resolve, reject) => {
    checkSetupPermissions()
    .then((alreadyGrantedActiveTab) => {
      if (alreadyGrantedActiveTab) {
        return browser.tabs.query({ currentWindow: true, active: true });
      } else {
        return Promise.reject(new Error("Cannot fetch active tab's host without the activeTab permission"));
      }
    })
    .then((tabs) => {
      console.log(`Tab query for activeTab resulted in ${tabs}`);
      if (tabs.length < 1 || tabs[0].url.length < 1) {
        return Promise.reject(new Error("Could not fetch the active tab info, despite activeTab being enabled. Frequently caused by trying to fetch active tab without closing+reopening popup."));
      } else {
        console.log("Returned first tab:", tabs[0]);
        let url = new URL(tabs[0].url);
        activeTabUrl = tabs[0].url;
        hostname = url.hostname;
        matchPattern = `*://*.${hostname.replace(/^www\./, "")}/*`;
        updateSetupPermissionsUI(true); // the activeTab status is already set, but this also updates the UI based on if hostname/matchPattern exist, so we need to call it
        console.log(`Active tab details found, hostname = ${hostname}`);
        return resolve(true);
      }
    })
    .catch((error) => {
      reject(error);
    });
  });
}

// -----------------------
// MARK: - Button click handlers
// -----------------------
document.getElementById("setup-permissions-button").onclick = async function(evt) {
  console.log("Checking activeTab permissions");
  let shouldRequest = document.getElementById("setup-permissions-button").getAttribute("value") != ACTIVETAB_BUTTON_VALUE_REMOVE;
  checkSetupPermissions()
  .then((alreadyGrantedActiveTab) => {
    if (alreadyGrantedActiveTab && shouldRequest) {
      return Promise.resolve(true);
    } else if (!alreadyGrantedActiveTab && !shouldRequest) {
      return Promise.resolve(false);
    } else if (alreadyGrantedActiveTab && !shouldRequest) {
      return browser.permissions.remove(setupPermissions);
    } else {
      return browser.permissions.request(setupPermissions);
    }
  })
  .then((result) => {
    let activeTabGranted = (result && shouldRequest);
    updateSetupPermissionsUI(activeTabGranted);
    if (!activeTabGranted && shouldRequest) {
      return Promise.reject(new Error("Permissions for activeTab were denied"));
    } else if (activeTabGranted && !shouldRequest) {
      return Promise.reject(new Error("Permissions for activeTab remain granted after requesting removal"));
    } else if (!activeTabGranted && !shouldRequest) {
      console.log("Permissions for activeTab successfully removed");
    } else {
      console.log("Permissions for activeTab are granted");
      setTimeout(function(){
        window.location.href = "popup.html";
      }, 500);
      // browser.runtime.reload();
    }
    return Promise.resolve();
  })
  .catch((error) => {
    console.error(`ActiveTab permission update onRejected function called: ${error.message}`);
  });
};

document.getElementById("update-rules").onclick = async function() {
  if (matchPattern.length < 1) {
    console.error("[Update Rules] No matchPattern found.");
    return;
  }
  
  let enablingRedirects = document.getElementById("update-rules").getAttribute("value").indexOf("Enable") == 0;
  let permissionsToUpdate = {
    origins: [matchPattern]
  };
  
  console.info(`${enablingRedirects ? "Requesting" : "Revoking"} declarativeNetRequestWithHostAccess permissions for this ${matchPattern}`);
  
  var requestOrRemove;
  if (enablingRedirects) {
    requestOrRemove = browser.permissions.request(permissionsToUpdate);
  } else {
    requestOrRemove = browser.permissions.remove(permissionsToUpdate);
  }
  
  // 1. Request or remove DNR permission on current tab's domain
  requestOrRemove.then((successful) => {
    // 2a. If removal was successful, we're done
    if (!enablingRedirects && successful) {
      return fetchKnownHostPermissions();
    } else if (!enablingRedirects && !successful) {
      return Promise.reject(new Error(`Permission removal failed for ${matchPattern}`));
    }
    
    // 2b. If DNR permission granted, fetch private session token, otherwise throw error
    if (!successful) {
      return Promise.reject(new Error(`Permissions for declarativeNetRequestWithHostAccess were denied for ${matchPattern}. Cancelling rules updates`));
    } else {
      console.log(`Permissions for declarativeNetRequestWithHostAccess are granted for ${hostname}`);
      return fetchKnownHostPermissions();
    }
  })
  .then((unusedValue) => {
    
    updateSetupPermissionsUI(enablingRedirects);
    // 3a. If removing, move along
    if (!enablingRedirects) {
      return Promise.resolve();
    }
    
    // 3. Update DNR rules (using token, if found)
    return updateAllRules(privateSessionToken);
  })
  .catch((error) => {
    console.error(`Update Rules onRejected function called: ${error.message}`);
    let errorTime = new Date();
    document.getElementById("last-error").innerText = `${errorTime.toLocaleTimeString('en-US')}: ${error.message}`;
  });
  
}

// -----------------------
// MARK: - Onload handler
// -----------------------
document.addEventListener("DOMContentLoaded", (event) => {
  let requestPermissionsIfNeeded = false;
  Promise.all([
    getLocalPrivateSessionToken(),
    fetchActiveTabHost(),
    fetchKnownHostPermissions()
  ])
  .then((values) => {
    getPrivateSessionTokenFromPageIfAvailable(requestPermissionsIfNeeded);
  })
  
});