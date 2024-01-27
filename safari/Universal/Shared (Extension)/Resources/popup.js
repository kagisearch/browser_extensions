const domainMap = {
  "Google": ["google.com.au", "google.md", "google.ru", "google.me", "google.com.qa", "google.com.gt", "google.se", "google.tm", "google.vg", "google.it", "google.cat", "google.com.ru", "google.com.gr", "google.ee", "google.cd", "google.sk", "google.com.ly", "google.hn", "google.co.jp", "google.ad", "google.com.sg", "google.ie", "google.co.vi", "google.kg", "google.com.kh", "google.co.ck", "google.is", "google.tt", "google.vu", "google.bg", "google.ch", "google.com.sa", "google.tn", "google.pl", "google.ro", "google.gm", "google.tl", "google.mg", "google.dk", "google.com.bo", "google.je", "google.com.kw", "google.dz", "google.ga", "google.com.gh", "google.lt", "google.com.ag", "google.ps", "google.com.vc", "google.com.pr", "google.co.cr", "google.pn", "google.com.tr", "google.sn", "google.tg", "google.gg", "google.gr", "google.com.mt", "google.nu", "google.cm", "google.lk", "google.co.mz", "google.cv", "google.sm", "google.no", "google.al", "google.bi", "google.com.af", "google.sr", "google.jo", "google.sh", "google.co.uk", "google.co.bw", "google.dm", "google.at", "google.co.ug", "google.dj", "google.si", "google.com.pg", "google.com.tj", "google.co.za", "google.nl", "google.sc", "google.ae", "google.mv", "google.ne", "google.gy", "google.com.sl", "google.co.in", "google.com.bn", "google.ht", "google.com.ua", "google.com.my", "google.co.kr", "google.com", "google.by", "google.com.cu", "google.com.lb", "google.co.nz", "google.mu", "google.com.om", "google.as", "google.com.pe", "google.mk", "google.td", "google.es", "google.az", "google.com.hk", "google.com.do", "google.bt", "google.am", "google.fm", "google.com.mx", "google.fi", "google.com.bz", "google.st", "google.com.vn", "google.rs", "google.bs", "google.cn", "google.com.pa", "google.com.sb", "google.lv", "google.co.uz", "google.co.hu", "google.co.ve", "google.co.zw", "google.com.ai", "google.com.co", "google.ci", "google.com.uy", "google.cl", "google.mw", "google.cz", "google.co.il", "google.co.th", "google.be", "google.hr", "google.fr", "google.im", "google.com.ec", "google.cg", "google.iq", "google.com.np", "google.gl", "google.co.ke", "google.co.id", "google.ml", "google.ms", "google.com.ni", "google.mn", "google.ki", "google.lu", "google.hu", "google.rw", "google.co.ma", "google.com.tw", "google.co.ls", "google.com.et", "google.li", "google.com.br", "google.bj", "google.com.py", "google.co.tz", "google.ba", "google.co.ao", "google.bf", "google.com.ph", "google.com.sv", "google.com.bd", "google.com.mm", "google.la", "google.ws", "google.com.fj", "google.co.zm", "google.cf", "google.nr", "google.to", "google.com.jm", "google.com.ar", "google.com.gi", "google.ca", "google.kz", "google.com.cy", "google.de", "google.com.na", "google.com.pk", "google.pt", "google.ge", "google.so", "google.com.bh", "google.com.eg", "google.com.ng"],
  "DuckDuckGo": ["duckduckgo.com", "duckduckgo.pl", "duckduckgo.jp", "duckduckgo.co", "duckduckco.de", "duckduckgo.ca", "duckduckgo.co.uk", "duckduckgo.com.mx", "duckduckgo.com.tw", "duckduckgo.dk", "duckduckgo.in", "duckduckgo.ke", "duckduckgo.mx", "duckduckgo.nl", "duckduckgo.org", "duckduckgo.sg", "duckduckgo.uk", "duckgo.com", "ddg.co", "ddg.gg", "duck.co", "duck.com"],
  "Yahoo": ["search.yahoo.com"],
  "Ecosia": ["ecosia.org"],
  "Bing": ["bing.com"],
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
  "p": function() { return domainMap["Yahoo"]; },
  "q": function() { return [...domainMap["Google"], ...domainMap["DuckDuckGo"], ...domainMap["Ecosia"], ...domainMap["Bing"], ...["m.so.com", "so.com"]]; }
};
const allSupportedDomains = [...domainMap["Google"],
                             ...domainMap["DuckDuckGo"],
                             ...domainMap["Ecosia"],
                             ...domainMap["Bing"],
                             ...domainMap["Yahoo"],
                             ...domainMap["Sogou"],
                             ...domainMap["Yandex"],
                             ...domainMap["Baidu"]];
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
// const extensionId = "com.kagi.Kagi-Search-for-Safari.Extension (TFVG979488)";
// const userAgent = window.navigator.userAgent,
//       platform = window.navigator?.userAgentData?.platform || window.navigator.platform,
//       macosPlatforms = ['macOS', 'Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
//       iosPlatforms = ['iPhone', 'iPad', 'iPod'];
// document.getElementById("open-app").onclick = function() {
//     if (macosPlatforms.indexOf(platform) !== -1) {
//         browser.runtime.sendNativeMessage(extensionId, {"type": "openApp"}, function(response) {
//             window.close();
//         });
//     } else if (iosPlatforms.indexOf(platform) !== -1) {
//         window.open("kagisearch://")
//     }
// }

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
    });
  })
}

document.querySelector("#private-session-link").addEventListener('change', privateSessionLinkTextfieldChanged);
document.querySelector("#private-session-link").addEventListener('paste', privateSessionLinkTextfieldChanged);
  

// -----------------------
// MARK: - Displaying & updating host permissions
// -----------------------
function fetchAndUpdateKnownHostList() {
  return browser.permissions.getAll()
  .then((permissions) => {
    let knownHosts = permissions["origins"].map((pattern) => pattern.replace(/^.*:\/\/.*?\.([.A-Za-z]+)\/.*$/, "$1"));
    let hasKnownHosts = knownHosts.length > 0;
    let enabledElement = document.querySelector("#overrides h3>span");
    enabledElement.classList.toggle("enabledForThisDomain", hasKnownHosts);
    enabledElement.innerText = hasKnownHosts ? "enabled on:" : "disabled";
    updateKnownHostList(knownHosts);
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
//     browser.runtime.sendNativeMessage(extensionId, {"action": "open-safari-extension-settings"}, function(response) {
//       // no-op
//     });
//     window.open('App-Prefs:SAFARI&path=WEB_EXTENSIONS');
    window.open('kagisearch://open-app?destination=safari-extension-settings-deep');
//     let engineToRevoke = evt.currentTarget.getAttribute("data-engine");
//     if (typeof engineToRevoke == "string" && engineToRevoke.length > 0) {
//       let engineMatchPatterns = engineToRevoke == "All" ? ["*://*/*"] : domainMap[engineToRevoke].map((domain) => `*://*.${domain}/*`);
//       revokeHostPermissions(engineMatchPatterns);
//     } else {
//       let hostToRevoke = evt.currentTarget.getAttribute("data-host");
//       let hostMatchPattern = `*://*.${hostToRevoke.replace(/^www\./, "")}/*`; // "www" removal should be redundant, but leaving replacement here for safety in future situations
//       revokeHostPermissions([hostMatchPattern]);
//     }
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
//   browser.tabs.query({ currentWindow: true, active: true })
//   .then((tabs) => {
//     if (tabs.length != 1) {
//       Promise.reject(new Error("activeTab request did not return only 1 tab"));
//     }
//     
//     console.log("Returned first tab:", tabs[0]);
//     let url = new URL(tabs[0].url);
//     document.getElementById("currentHost").innerText = url.hostname;
//   })
  
  Promise.all([
    fetchAndUpdateKnownHostList(),
    browser.storage.local.get("kagiPrivateSessionLink")
  ])
  .then((results) => {
    
    // Fetch the current private session link from storage
    let localPrivateSessionLink = results[1];
    if (typeof localPrivateSessionLink == "object" &&
        typeof localPrivateSessionLink["kagiPrivateSessionLink"] == "string"
        && localPrivateSessionLink["kagiPrivateSessionLink"].length > 0) {
      privateSessionLink = localPrivateSessionLink["kagiPrivateSessionLink"];
      document.querySelector("#private-session-link").value = privateSessionLink;
    }
  });
});

const symbolTrashBase64ImgTag = `<img alt="" src="data:image/png;base64,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" />`;