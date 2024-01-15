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
  "p": function() { return domainMap["Yahoo"]; },
  "q": function() { return [...domainMap["Google"], ...domainMap["DuckDuckGo"], ...domainMap["Ecosia"], ...domainMap["Bing"], ...["m.so.com", "so.com"]]; }
};
const allSupportedDomains = [...domainMap["Google"], ...domainMap["DuckDuckGo"], ...domainMap["Ecosia"], ...domainMap["Bing"], ...domainMap["Yahoo"], ...domainMap["Sogou"], ...domainMap["Yandex"], ...domainMap["Baidu"]];
const bangDomainMap = {
  "!g": domainMap["Google"],
  "!google": domainMap["Google"],
  "!ddg": domainMap["DuckDuckGo"],
  "!duckduckgo": domainMap["DuckDuckGo"],
  "!yahoo": domainMap["Yahoo"],
  "!y": domainMap["Yahoo"],
  "!sogou": domainMap["Sogou"],
  "!bing": domainMap["Bing"],
  "!b": domainMap["Bing"],
  "!yandex": domainMap["Yandex"],
  "!ya": domainMap["Yandex"],
  "!ec": domainMap["Ecosia"],
  "!eco": domainMap["Ecosia"],
  "!ecosia": domainMap["Ecosia"],
  "!bd": domainMap["Baidu"],
  "!baidu": domainMap["Baidu"]
};
const engineDefaultRedirectInfo = {
  "Google": { domain: "www.google.com", path: "search", param: "q"},
  "DuckDuckGo": { domain: "duckduckgo.com", path: "", param: "q"},
  "Yahoo": { domain: "search.yahoo.com", path: "search", param: "p"},
  "Sogou": { domain: "www.sogou.com", path: "web", param: "query"},
  "Bing": { domain: "www.bing.com", path: "search", param: "q"},
  "Yandex": { domain: "www.yandex.ru", path: "yandsearch", param: "text"},
  "Ecosia": { domain: "www.ecosia.org", path: "search", param: "q"},
  "Baidu": { domain: "www.baidu.com", path: "s", param: "wd"}
};
const bangDefaultRedirectMap = {
  "!g": engineDefaultRedirectInfo["Google"],
  "!google": engineDefaultRedirectInfo["Google"],
  "!ddg": engineDefaultRedirectInfo["DuckDuckGo"],
  "!duckduckgo": engineDefaultRedirectInfo["DuckDuckGo"],
  "!yahoo": engineDefaultRedirectInfo["Yahpp"],
  "!y": engineDefaultRedirectInfo["Yahoo"],
  "!sogou": engineDefaultRedirectInfo["Sogou"],
  "!bing": engineDefaultRedirectInfo["Bing"],
  "!b": engineDefaultRedirectInfo["Bing"],
  "!yandex": engineDefaultRedirectInfo["Yandex"],
  "!ya": engineDefaultRedirectInfo["Yandex"],
  "!ec": engineDefaultRedirectInfo["Ecosia"],
  "!eco": engineDefaultRedirectInfo["Ecosia"],
  "!ecosia": engineDefaultRedirectInfo["Ecosia"],
  "!bd": engineDefaultRedirectInfo["Baidu"],
  "!baidu": engineDefaultRedirectInfo["Baidu"]
};
function relatedDomainsForKnownHost(knownHost) {
  let domainKeys = Object.keys(domainMap);
  for (let i=0; i<domainKeys.length; i++) {
    let domainKey = domainKeys[i];
    if (domainMap[domainKey].indexOf(knownHost) > -1) {
      return domainMap[domainKey];
    }
  }
  return [];
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
  return params;
}
function bangsForKnownHost(knownHost) {
  var bangs = [];
  let bangKeys = Object.keys(bangDomainMap);
  for (let i=0; i<bangKeys.length; i++) {
    let bangKey = bangKeys[i];
    if (bangDomainMap[bangKey].indexOf(knownHost) > -1) {
      bangs.push(bangKey);
    }
  }
  return bangs;
}
function bangsForKnownHosts(knownHosts) {
  var bangs = [];
  for (let i=0; i<knownHosts.length; i++) {
    let hostBangs = bangsForKnownHost(knownHosts[i]);
    if (hostBangs.length > 0) {
      bangs = bangs.concat(hostBangs);
    }
  }
  return bangs;
}

const knownHostPermissions = [];
var privateSessionToken = "";
const setupPermissions = { permissions: ["activeTab", "scripting"], origins: ["*://*.kagi.com/*"] };
const setupPermissionsWithoutKagiOrigin = { permissions: ["activeTab", "scripting"] };
var isPrivateBrowsingAllowed = false;
var activeTabUrl = "";
var hostname = "";
var matchPattern = "";

const extensionId = "com.kagi.Kagi-Search.Extension (TFVG979488)";
const ruleIdStart = 100;
const bangRuleIdStart = 1000;
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
    "regexFilter": "^https?.*[?&]{{parameterKey}}=([^&#]*[&#]?.*[^~][^~])$",
    "excludedInitiatorDomains": ["kagi.com"]
  }
};
const bangRuleTemplate = {
  "id": 999999,
  "priority": 3,
  "action": {
    "type": "redirect",
    "redirect": {
      "regexSubstitution": "\\1\\2\\3&~~"
    }
  },
  "condition": {
    "resourceTypes": [ "main_frame" ],
    "requestDomains": [],
    "regexFilter": "^(https?:\/\/.+[?&]{{parameterKey}}=)([^&#]*){{bang}}([^A-Za-z0-9_][^&#]*)[&#]?.*$"
  }
};
// The following rule is needed because we can't use the "OR" `|` delimiter in Safari Content Blocker regex.
const bangRuleEndOfURLTemplate = {
  "id": 999999,
  "priority": 4,
  "action": {
    "type": "redirect",
    "redirect": {
      "regexSubstitution": "\\1\\2&~~"
    }
  },
  "condition": {
    "resourceTypes": [ "main_frame" ],
    "requestDomains": [],
    "regexFilter": "^(https?:\/\/.+[?&]{{parameterKey}}=)([^&#]*){{bang}}$"
  }
};
// FIXME: Bangs typed into kagi.com directly get redirected back by the extension
const bangFromKagiRuleTemplate = {
  "id": 999999,
  "priority": 3,
  "action": {
    "type": "redirect",
    "redirect": {
      "regexSubstitution": "https://{{domain}}/{{path}}?{{parameterKey}}=\\1\\2&~~"
    }
  },
  "condition": {
    "resourceTypes": [ "main_frame" ],
    "requestDomains": [ "kagi.com" ],
    "regexFilter": "^https?:\/\/.+[?&]q=([^&#]*){{bang}}([^A-Za-z0-9_][^&#]*)[&#]?.*$"
  }
};
const bangFromKagiRuleEndOfURLTemplate = {
  "id": 999999,
  "priority": 4,
  "action": {
    "type": "redirect",
    "redirect": {
      "regexSubstitution": "https://{{domain}}/{{path}}?{{parameterKey}}=\\1&~~"
    }
  },
  "condition": {
    "resourceTypes": [ "main_frame" ],
    "requestDomains": [ "kagi.com" ],
    "regexFilter": "^(https?:\/\/.+[?&]q=)([^&#]*){{bang}}$"
  }
};
const bangAllowTemplate = {
  "id": 9000,
  "condition": {
    "urlFilter": "*~~|",
    "resourceTypes": [ "main_frame" ],
    "requestDomains": []
  },
  "priority": 2,
  "action": {
    "type": "allow"
  }
};
const kagiCookieTemplate = {
  "id": 1,
  "priority": 1,
  "action": {
    "type": "modifyHeaders",
    "requestHeaders": [
      {
        "header": "Cookie",
        "operation": "set",
        "value": "kagi_session={{sessionToken}}"
      }
    ]
  },
  "condition": { "urlFilter": "||kagi.com/*", "resourceTypes": [ "main_frame" ] }
};
// Negate cookies on the login form to avoid bugs. Needed due to limitations in Safari content blocker regex
const kagiCookieNegationTemplate = {
  "id": 2,
  "priority": 2,
  "action": {
    "type": "modifyHeaders",
    "requestHeaders": [
      {
        "header": "Cookie",
        "operation": "remove"
      }
    ]
  },
  "condition": { "urlFilter": "||kagi.com/login", "resourceTypes": [ "main_frame" ] }
};

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
  let paramKeys = paramsForKnownHosts(knownHostPermissions);
  let bangKeys = bangsForKnownHosts(knownHostPermissions);
  var idCounter = 100;
  try {
    let oldRules = await browser.declarativeNetRequest.getDynamicRules();
    var newRules = [];
    // Rules for redirecting searches to Kagi
    for (let i=0; i<paramKeys.length; i++) {
      idCounter += 1;
      let paramKey = paramKeys[i];
      let regexFilterWithParamKey = ruleTemplate["condition"]["regexFilter"].replace("{{parameterKey}}", paramKey);
      var regexSubstitution = ruleTemplate["action"]["redirect"]["regexSubstitution"];
      if (hasSessionToken) {
        // Modify the redirect location since the "www" hack is not needed if we have a session token
        regexSubstitution += ("&token=" + sessionToken);
      }
      var newRule = structuredClone(ruleTemplate);
      newRule["id"] = idCounter;
      newRule["condition"]["regexFilter"] = regexFilterWithParamKey;
      let wwwDomainMap = structuredClone(paramDomainMap[paramKey]());
      newRule["condition"]["requestDomains"] = paramDomainMap[paramKey]().concat(wwwDomainMap.map((domain) => { return domain.startsWith("www.") ? "" : `www.${domain}`; }).filter((d) => d.length > 0));
      newRule["action"]["redirect"]["regexSubstitution"] = regexSubstitution;
      newRules.push(newRule);
      
      // For each param, there is a potential set of !bangs to also handle redirects for
      for (let bi=0; bi<bangKeys.length; bi++) {
        let bangKey = bangKeys[bi];
        let bangDomains = bangDomainMap[bangKey].filter((bangDomain) => newRule["condition"]["requestDomains"].indexOf(bangDomain) > -1);
        if (bangDomains.length > 0) {
          idCounter += 1;
          // Most mid-url !bang covered by bangRuleTemplate
          var newBangRule = structuredClone(bangRuleTemplate);
          newBangRule["id"] = idCounter;
          let bangRegexFilterWithParamKey = bangRuleTemplate["condition"]["regexFilter"].replace("{{parameterKey}}", paramKey).replace("{{bang}}", bangKey);
          newBangRule["condition"]["regexFilter"] = bangRegexFilterWithParamKey;
          let bangWwwDomainMap = structuredClone(bangDomainMap[bangKey]);
          let bangRequestDomains = bangDomainMap[bangKey].concat(bangWwwDomainMap.map((domain) => { return domain.startsWith("www.") ? "" : `www.${domain}`; }).filter((d) => d.length > 0));
          newBangRule["condition"]["requestDomains"] = bangRequestDomains;
          newRules.push(newBangRule);
          // Edge-case !bang-at-end-of-url covered by bangRuleEndOfURLTemplate
          idCounter += 1;
          var newBangAtEndOfUrlRule = structuredClone(bangRuleEndOfURLTemplate);
          newBangAtEndOfUrlRule["id"] = idCounter;
          let bangAtEndOfUrlRegexFilterWithParamKey = bangRuleEndOfURLTemplate["condition"]["regexFilter"].replace("{{parameterKey}}", paramKey).replace("{{bang}}", bangKey);
          newBangAtEndOfUrlRule["condition"]["regexFilter"] = bangAtEndOfUrlRegexFilterWithParamKey;
          newBangAtEndOfUrlRule["condition"]["requestDomains"] = bangRequestDomains;
          newRules.push(newBangAtEndOfUrlRule);
        }
      }
    }
    // Handle the cases where users are inputting a bang for a redirected
    // engine within the Kagi search field instead of the Safari location bar.
    // FIXME: Not currently working; Commented out rule inclusion below
    for (let bi=0; bi<bangKeys.length; bi++) {
      let bangKey = bangKeys[bi];
      let bangDomainInfo = bangDefaultRedirectMap[bangKey];
      idCounter += 1;
      // Add the mid-query bang rule for kagi.com searches
      var newBangFromKagiRule = structuredClone(bangFromKagiRuleTemplate);
      newBangFromKagiRule["id"] = idCounter;
      newBangFromKagiRule["action"]["redirect"]["regexSubstitution"] = newBangFromKagiRule["action"]["redirect"]["regexSubstitution"]
        .replace("{{parameterKey}}", bangDomainInfo["param"])
        .replace("{{domain}}", bangDomainInfo["domain"])
        .replace("{{path}}", bangDomainInfo["path"]);
      newBangFromKagiRule["condition"]["regexFilter"] = newBangFromKagiRule["condition"]["regexFilter"]
        .replace("{{bang}}", bangKey);
      // newRules.push(newBangFromKagiRule);
      idCounter += 1;
      // Add the end-of-query bang rule for kagi.com searches
      var newBangAtEndOfUrlFromKagiRule = structuredClone(bangFromKagiRuleEndOfURLTemplate);
      newBangAtEndOfUrlFromKagiRule["id"] = idCounter;
      newBangAtEndOfUrlFromKagiRule["action"]["redirect"]["regexSubstitution"] = newBangAtEndOfUrlFromKagiRule["action"]["redirect"]["regexSubstitution"]
        .replace("{{parameterKey}}", bangDomainInfo["param"])
        .replace("{{domain}}", bangDomainInfo["domain"])
        .replace("{{path}}", bangDomainInfo["path"]);
      newBangAtEndOfUrlFromKagiRule["condition"]["regexFilter"] = newBangAtEndOfUrlFromKagiRule["condition"]["regexFilter"]
        .replace("{{bang}}", bangKey);
      // newRules.push(newBangAtEndOfUrlFromKagiRule);
    }
    if (hasSessionToken) {
      // FIXME: Re-add cookie rule after figuring out how to make it reliable. It's preferred over sending the token in the URL itself which can be sniffed
      var kagiCookieRule = structuredClone(kagiCookieTemplate);
      kagiCookieRule["action"]["requestHeaders"][0]["value"] = kagiCookieRule["action"]["requestHeaders"][0]["value"].replace("{{sessionToken}}", sessionToken);
      newRules.push(kagiCookieRule);
      newRules.push(kagiCookieNegationTemplate);
    }
    // Add the rule that prevents re-redirecting to Kagi if the parameter kagiBang=true is present
    var bangAllowRule = structuredClone(bangAllowTemplate);
    bangAllowRule["condition"]["requestDomains"] = allSupportedDomains.concat(allSupportedDomains.map((domain) => { return domain.startsWith("www.") ? "" : `www.${domain}`; }).filter((d) => d.length > 0));
    newRules.push(bangAllowRule);
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
    console.log(`Failed to save rules: ${e}`);
    
    return Promise.reject(e);
  }
}

async function updateRedirectHostPermissions(enablingRedirects, requestOrRemovePromise) {
  // 1. Request or remove DNR permission on current tab's domain
  requestOrRemovePromise.then((successful) => {
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

function updateKnownHostListUI() {
  document.body.classList.toggle("readyToSearch", knownHostPermissions.length > 0);
  
  const hosts = structuredClone(knownHostPermissions);
  if (hosts.length == 0) {
    hosts.push("No search engines redirecting");
  }
  var liHtml = "";
  for (host in hosts) {
    liHtml += `<li>${hosts[host]} <a href="#" class="revokePermissions" data-host="${hosts[host]}">${symbolTrashBase64ImgTag}<span class="confirmationText"> (tap again to confirm)</span></a></li>`;
  }
  document.getElementById("current-overrides").innerHTML = liHtml;
  updateRevokeHostPermissionsHandlers();
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

// Returns a Promise with no result value if conflicts were resolved (or
// no conflicts found) and rejects with an error if it encounters an
// unexpected issue
function checkForSessionTokenConflicts() {
  return browser.storage.local.get({
    "kagiNewFetchedToken": "",
    "kagiNewScrapedToken": "",
    "kagiPrivateSessionToken": ""})
  .then((tokens) => {
    if (typeof tokens != "object") {
      return Promise.reject(new Error("Unexpected storage return type"));
    }
    let fetchedToken = tokens["kagiNewFetchedToken"],
        scrapedToken = tokens["kagiNewScrapedToken"],
        storedSessionToken = tokens["kagiPrivateSessionToken"];
    
    console.info(`Checking for conflicts in found tokens: { fetchedToken: "${fetchedToken}", scrapedToken: "${scrapedToken}", storedSessionToken: "${storedSessionToken}" }`);
    
    // If no fetchedToken or scrapedToken exist to be checked, resolve
    if (fetchedToken.length == 0 && scrapedToken.length == 0) {
      return Promise.resolve({showConflictUI: false, shouldUpdateRules: false});
    }
    // If tokens are all the same, resolve
    else if (fetchedToken == scrapedToken && fetchedToken == storedSessionToken) {
      return Promise.resolve({showConflictUI: false, shouldUpdateRules: false});
    }
    else {
      // If both tokens exist but are not equal, check if one matches the existing token
      if ((fetchedToken != scrapedToken && fetchedToken == storedSessionToken) ||
          (fetchedToken != scrapedToken && scrapedToken == storedSessionToken)) {
        return Promise.resolve({showConflictUI: false, shouldUpdateRules: false});
      }
      
      var usableToken = fetchedToken.length > 0 ? fetchedToken : scrapedToken;
      // If we don't yet have a stored session token, we store one now
      if (storedSessionToken.length == 0) {
        updatePrivateSessionToken(usableToken);
        return Promise.resolve({showConflictUI: true, shouldUpdateRules: true});
      }
      
      console.warn(`No token resolution found for { fetchedToken: "${fetchedToken}", scrapedToken: "${scrapedToken}", storedSessionToken: "${storedSessionToken}" }; Overwriting existing token with newly found token of value "${usableToken}"`);
      updatePrivateSessionToken(usableToken);
      return Promise.resolve({showConflictUI: true, shouldUpdateRules: true});
    }
  })
  .then((result) => {
    let shouldUpdateRules = result["shouldUpdateRules"],
        shouldShowConflictUI = result["showConflictUI"];
    if (shouldUpdateRules) {
      return updateAllRules(privateSessionToken).then(() => Promise.resolve(shouldShowConflictUI));
    } else {
      return Promise.resolve(shouldShowConflictUI);
    }
  })
  .then((showConflictUI) => {
    updateTokenConflictUI(showConflictUI, true);
    return clearFetchedAndScrapedTokens();
  })
  .catch((error) => {
    updateTokenConflictUI(true, false);
    console.error(`Kagi session token conflict check failed: ${error.message}`);
    Promise.reject(error);
  });
}

function clearFetchedAndScrapedTokens() {
  return browser.storage.local.remove(["kagiNewFetchedToken", "kagiNewScrapedToken"])
  .then(() => browser.action.setBadgeText({ text: "" }))
  .then(() => Promise.resolve()); // Redundant, but just in case future API changes to include a result instead of being empty
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

function updateTokenConflictUI(showUI, didResolve) {
  document.body.classList.toggle("tokenConflictOccurred", showUI);
  document.body.classList.toggle("tokenConflictResolved", didResolve);
  document.body.classList.toggle("tokenConflictUnresolved", !didResolve);
}

function updatePrivateSessionUI(tokenExists) {
  document.body.classList.toggle("readyForPrivateBrowsing", tokenExists);
  if (tokenExists) {
    
  } else {
    
  }
}

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
      // When removing setup permissions, retain kagi host permissions
      // so that users can still use the !bang syntax while searching
      // directly from kagi.com
      return browser.permissions.remove(setupPermissionsWithoutKagiOrigin);
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
  
  updateRedirectHostPermissions(enablingRedirects, requestOrRemove);
  
};

document.querySelectorAll(".update-all-rules").forEach((element) => {
  element.addEventListener("click", async function() {
    element.classList.remove("success", "failure");
    updateAllRules(privateSessionToken)
    .then(() => {
      element.classList.add("success");
    })
    .catch((e) => {
      element.classList.add("failure");
    });
  });
});

function revokeHostPermissionLinkClicked(evt) {
  let el = evt.currentTarget;
  if (el.classList.contains("readyToConfirm")) {
    let hostToRevoke = evt.currentTarget.getAttribute("data-host");
    let hostMatchpattern = `*://*.${hostToRevoke.replace(/^www\./, "")}/*`; // should be redundant, but leaving replacement here for safety in future situations
    let removePromise = browser.permissions.remove({ origins: [hostMatchpattern] });
    updateRedirectHostPermissions(false, removePromise);
  } else {
    el.classList.add("readyToConfirm");
  }
  
}
function updateRevokeHostPermissionsHandlers() {
  document.querySelectorAll(".revokePermissions").forEach((element) => {
    element.removeEventListener("click", revokeHostPermissionLinkClicked);
    element.addEventListener("click", revokeHostPermissionLinkClicked);
  });
}

// -----------------------
// MARK: - Show/hide handlers
// -----------------------
document.querySelectorAll(".showMore").forEach((element) => {
  element.addEventListener("click", async function(e) {
    e.preventDefault();
    element.closest("li").classList.toggle("displayChildren");
  });
});

// -----------------------
// MARK: - Onload handler
// -----------------------
document.addEventListener("DOMContentLoaded", (event) => {
  let requestPermissionsIfNeeded = false;
  Promise.all([
    getLocalPrivateSessionToken(),
    fetchActiveTabHost(),
    fetchKnownHostPermissions(),
    checkForSessionTokenConflicts()
  ])
  .catch((error) => {
    console.error(`[Document OnLoad] Error: ${error.message}`);
  })
  .finally((values) => {
    // getPrivateSessionTokenFromPageIfAvailable(requestPermissionsIfNeeded);
  })
  
});

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

const symbolTrashBase64ImgTag = `<img alt="" src="data:image/png;base64,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" />`;