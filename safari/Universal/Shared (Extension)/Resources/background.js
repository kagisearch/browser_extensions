const googleUrls = {
    "google.com.au": "q",
    "google.md": "q",
    "google.ru": "q",
    "google.me": "q",
    "google.com.qa": "q",
    "google.com.gt": "q",
    "google.se": "q",
    "google.tm": "q",
    "google.vg": "q",
    "google.it": "q",
    "google.cat": "q",
    "google.com.ru": "q",
    "google.com.gr": "q",
    "google.ee": "q",
    "google.cd": "q",
    "google.sk": "q",
    "google.com.ly": "q",
    "google.hn": "q",
    "google.co.jp": "q",
    "google.ad": "q",
    "google.com.sg": "q",
    "google.ie": "q",
    "google.co.vi": "q",
    "google.kg": "q",
    "google.com.kh": "q",
    "google.co.ck": "q",
    "google.is": "q",
    "google.tt": "q",
    "google.vu": "q",
    "google.bg": "q",
    "google.ch": "q",
    "google.com.sa": "q",
    "google.tn": "q",
    "google.pl": "q",
    "google.ro": "q",
    "google.gm": "q",
    "google.tl": "q",
    "google.mg": "q",
    "google.dk": "q",
    "google.com.bo": "q",
    "google.je": "q",
    "google.com.kw": "q",
    "google.dz": "q",
    "google.ga": "q",
    "google.com.gh": "q",
    "google.lt": "q",
    "google.com.ag": "q",
    "google.ps": "q",
    "google.com.vc": "q",
    "google.com.pr": "q",
    "google.co.cr": "q",
    "google.pn": "q",
    "google.com.tr": "q",
    "google.sn": "q",
    "google.tg": "q",
    "google.gg": "q",
    "google.gr": "q",
    "google.com.mt": "q",
    "google.nu": "q",
    "google.cm": "q",
    "google.lk": "q",
    "google.co.mz": "q",
    "google.cv": "q",
    "google.sm": "q",
    "google.no": "q",
    "google.al": "q",
    "google.bi": "q",
    "google.com.af": "q",
    "google.sr": "q",
    "google.jo": "q",
    "google.sh": "q",
    "google.co.uk": "q",
    "google.co.bw": "q",
    "google.dm": "q",
    "google.at": "q",
    "google.co.ug": "q",
    "google.dj": "q",
    "google.si": "q",
    "google.com.pg": "q",
    "google.com.tj": "q",
    "google.co.za": "q",
    "google.nl": "q",
    "google.sc": "q",
    "google.ae": "q",
    "google.mv": "q",
    "google.ne": "q",
    "google.gy": "q",
    "google.com.sl": "q",
    "google.co.in": "q",
    "google.com.bn": "q",
    "google.ht": "q",
    "google.com.ua": "q",
    "google.com.my": "q",
    "google.co.kr": "q",
    "google.com": "q",
    "google.by": "q",
    "google.com.cu": "q",
    "google.com.lb": "q",
    "google.co.nz": "q",
    "google.mu": "q",
    "google.com.om": "q",
    "google.as": "q",
    "google.com.pe": "q",
    "google.mk": "q",
    "google.td": "q",
    "google.es": "q",
    "google.az": "q",
    "google.com.hk": "q",
    "google.com.do": "q",
    "google.bt": "q",
    "google.am": "q",
    "google.fm": "q",
    "google.com.mx": "q",
    "google.fi": "q",
    "google.com.bz": "q",
    "google.st": "q",
    "google.com.vn": "q",
    "google.rs": "q",
    "google.bs": "q",
    "google.cn": "q",
    "google.com.pa": "q",
    "google.com.sb": "q",
    "google.lv": "q",
    "google.co.uz": "q",
    "google.co.hu": "q",
    "google.co.ve": "q",
    "google.co.zw": "q",
    "google.com.ai": "q",
    "google.com.co": "q",
    "google.ci": "q",
    "google.com.uy": "q",
    "google.cl": "q",
    "google.mw": "q",
    "google.cz": "q",
    "google.co.il": "q",
    "google.co.th": "q",
    "google.be": "q",
    "google.hr": "q",
    "google.fr": "q",
    "google.im": "q",
    "google.com.ec": "q",
    "google.cg": "q",
    "google.iq": "q",
    "google.com.np": "q",
    "google.gl": "q",
    "google.co.ke": "q",
    "google.co.id": "q",
    "google.ml": "q",
    "google.ms": "q",
    "google.com.ni": "q",
    "google.mn": "q",
    "google.ki": "q",
    "google.lu": "q",
    "google.hu": "q",
    "google.rw": "q",
    "google.co.ma": "q",
    "google.com.tw": "q",
    "google.co.ls": "q",
    "google.com.et": "q",
    "google.li": "q",
    "google.com.br": "q",
    "google.bj": "q",
    "google.com.py": "q",
    "google.co.tz": "q",
    "google.ba": "q",
    "google.co.ao": "q",
    "google.bf": "q",
    "google.com.ph": "q",
    "google.com.sv": "q",
    "google.com.bd": "q",
    "google.com.mm": "q",
    "google.la": "q",
    "google.ws": "q",
    "google.com.fj": "q",
    "google.co.zm": "q",
    "google.cf": "q",
    "google.nr": "q",
    "google.to": "q",
    "google.com.jm": "q",
    "google.com.ar": "q",
    "google.com.gi": "q",
    "google.ca": "q",
    "google.kz": "q",
    "google.com.cy": "q",
    "google.de": "q",
    "google.com.na": "q",
    "google.com.pk": "q",
    "google.pt": "q",
    "google.ge": "q",
    "google.so": "q",
    "google.com.bh": "q",
    "google.com.eg": "q",
    "google.com.ng": "q"
};
const yandexUrls = {
    "yandex.ru": "text",
    "yandex.org": "text",
    "yandex.net": "text",
    "yandex.net.ru": "text",
    "yandex.com.ru": "text",
    "yandex.ua": "text",
    "yandex.com.ua": "text",
    "yandex.by": "text",
    "yandex.eu": "text",
    "yandex.ee": "text",
    "yandex.lt": "text",
    "yandex.lv": "text",
    "yandex.md": "text",
    "yandex.uz": "text",
    "yandex.mx": "text",
    "yandex.do": "text",
    "yandex.tm": "text",
    "yandex.de": "text",
    "yandex.ie": "text",
    "yandex.in": "text",
    "yandex.qa": "text",
    "yandex.so": "text",
    "yandex.nu": "text",
    "yandex.tj": "text",
    "yandex.dk": "text",
    "yandex.es": "text",
    "yandex.pt": "text",
    "yandex.pl": "text",
    "yandex.lu": "text",
    "yandex.it": "text",
    "yandex.az": "text",
    "yandex.ro": "text",
    "yandex.rs": "text",
    "yandex.sk": "text",
    "yandex.no": "text",
    "ya.ru": "text",
    "yandex.com": "text",
    "yandex.asia": "text",
    "yandex.mobi": "text"
};
const ddgUrls = {
    "duckduckgo.com": "q",
    "duckduckgo.pl": "q",
    "duckduckgo.jp": "q",
    "duckduckgo.co": "q",
    "duckduckco.de": "q",
    "duckduckgo.ca": "q",
    "duckduckgo.co.uk": "q",
    "duckduckgo.com.mx": "q",
    "duckduckgo.com.tw": "q",
    "duckduckgo.dk": "q",
    "duckduckgo.in": "q",
    "duckduckgo.ke": "q",
    "duckduckgo.mx": "q",
    "duckduckgo.nl": "q",
    "duckduckgo.org": "q",
    "duckduckgo.sg": "q",
    "duckduckgo.uk": "q",
    "duckgo.com": "q",
    "ddg.co": "q",
    "ddg.gg": "q",
    "duck.co": "q",
    "duck.com": "q"
};
const bingUrls = {
    "bing.com": "q"
};
const baiduUrls = {
    "baidu.com": "wd",
    "m.baidu.com": "word"
};
const sogouUrls = {
    "sogou.com": "query",
    "m.sogou.com": "keyword",
    "m.so.com": "q",
    "so.com": "q"
};
const ecosiaUrls = {
    "ecosia.org": "q"
};
const yahooUrls = {
    "search.yahoo.com": "p"
};
const builtInEngines = Object.assign({}, googleUrls, yandexUrls, ddgUrls, bingUrls, baiduUrls, sogouUrls, ecosiaUrls, yahooUrls);
const domainMap = {
  "Google": ["google.com.au", "google.md", "google.ru", "google.me", "google.com.qa", "google.com.gt", "google.se", "google.tm", "google.vg", "google.it", "google.cat", "google.com.ru", "google.com.gr", "google.ee", "google.cd", "google.sk", "google.com.ly", "google.hn", "google.co.jp", "google.ad", "google.com.sg", "google.ie", "google.co.vi", "google.kg", "google.com.kh", "google.co.ck", "google.is", "google.tt", "google.vu", "google.bg", "google.ch", "google.com.sa", "google.tn", "google.pl", "google.ro", "google.gm", "google.tl", "google.mg", "google.dk", "google.com.bo", "google.je", "google.com.kw", "google.dz", "google.ga", "google.com.gh", "google.lt", "google.com.ag", "google.ps", "google.com.vc", "google.com.pr", "google.co.cr", "google.pn", "google.com.tr", "google.sn", "google.tg", "google.gg", "google.gr", "google.com.mt", "google.nu", "google.cm", "google.lk", "google.co.mz", "google.cv", "google.sm", "google.no", "google.al", "google.bi", "google.com.af", "google.sr", "google.jo", "google.sh", "google.co.uk", "google.co.bw", "google.dm", "google.at", "google.co.ug", "google.dj", "google.si", "google.com.pg", "google.com.tj", "google.co.za", "google.nl", "google.sc", "google.ae", "google.mv", "google.ne", "google.gy", "google.com.sl", "google.co.in", "google.com.bn", "google.ht", "google.com.ua", "google.com.my", "google.co.kr", "google.com", "google.by", "google.com.cu", "google.com.lb", "google.co.nz", "google.mu", "google.com.om", "google.as", "google.com.pe", "google.mk", "google.td", "google.es", "google.az", "google.com.hk", "google.com.do", "google.bt", "google.am", "google.fm", "google.com.mx", "google.fi", "google.com.bz", "google.st", "google.com.vn", "google.rs", "google.bs", "google.cn", "google.com.pa", "google.com.sb", "google.lv", "google.co.uz", "google.co.hu", "google.co.ve", "google.co.zw", "google.com.ai", "google.com.co", "google.ci", "google.com.uy", "google.cl", "google.mw", "google.cz", "google.co.il", "google.co.th", "google.be", "google.hr", "google.fr", "google.im", "google.com.ec", "google.cg", "google.iq", "google.com.np", "google.gl", "google.co.ke", "google.co.id", "google.ml", "google.ms", "google.com.ni", "google.mn", "google.ki", "google.lu", "google.hu", "google.rw", "google.co.ma", "google.com.tw", "google.co.ls", "google.com.et", "google.li", "google.com.br", "google.bj", "google.com.py", "google.co.tz", "google.ba", "google.co.ao", "google.bf", "google.com.ph", "google.com.sv", "google.com.bd", "google.com.mm", "google.la", "google.ws", "google.com.fj", "google.co.zm", "google.cf", "google.nr", "google.to", "google.com.jm", "google.com.ar", "google.com.gi", "google.ca", "google.kz", "google.com.cy", "google.de", "google.com.na", "google.com.pk", "google.pt", "google.ge", "google.so", "google.com.bh", "google.com.eg", "google.com.ng"],
  "DuckDuckGo": ["duckduckgo.com", "duckduckgo.pl", "duckduckgo.jp", "duckduckgo.co", "duckduckco.de", "duckduckgo.ca", "duckduckgo.co.uk", "duckduckgo.com.mx", "duckduckgo.com.tw", "duckduckgo.dk", "duckduckgo.in", "duckduckgo.ke", "duckduckgo.mx", "duckduckgo.nl", "duckduckgo.org", "duckduckgo.sg", "duckduckgo.uk", "duckgo.com", "ddg.co", "ddg.gg", "duck.co", "duck.com"],
  "Yahoo": ["search.yahoo.com"],
  "Ecosia": ["ecosia.org"],
  "Bing": ["bing.com"],
  "Sogou": ["m.so.com", "so.com", "sogou.com", "m.sogou.com"],
  "Baidu": ["baidu.com", "m.baidu.com"],
  "Yandex": ["yandex.ru", "yandex.org", "yandex.net", "yandex.net.ru", "yandex.com.ru", "yandex.ua", "yandex.com.ua", "yandex.by", "yandex.eu", "yandex.ee", "yandex.lt", "yandex.lv", "yandex.md", "yandex.uz", "yandex.mx", "yandex.do", "yandex.tm", "yandex.de", "yandex.ie", "yandex.in", "yandex.qa", "yandex.so", "yandex.nu", "yandex.tj", "yandex.dk", "yandex.es", "yandex.pt", "yandex.pl", "yandex.lu", "yandex.it", "yandex.az", "yandex.ro", "yandex.rs", "yandex.sk", "yandex.no", "ya.ru", "yandex.com", "yandex.asia", "yandex.mobi"]
};
function domainKeyForHost(knownHost) {
  let domainKeys = Object.keys(domainMap);
  for (let i=0; i<domainKeys.length; i++) {
    let domainKey = domainKeys[i];
    if (domainMap[domainKey].indexOf(knownHost) > -1) {
      return domainKey;
    }
  }
  return "";
}
const supportedEngineNames = Object.keys(domainMap);
const www = "www.";
const yahoo = "search.yahoo.com";
const extensionId = "com.kagi.Kagi-Search-for-Safari.Extension (TFVG979488)";

var ua = {},
    tg = "0",
    pt = 0,
    os = !0,
    rs = !0,
    currentEngine = "All",
    defaultEngineToRedirect = "Google",
    defaultKagiSearchTemplate = "https://kagi.com/search?q=%s",
    kagiSearchTemplate = defaultKagiSearchTemplate,
    kagiPrivateSearchTemplate = "",
    flagFetchedPreferences = false,
    customURLMode = 0,
    customURLList = [],
    regularTabIds = [],
    incognitoTabIds = [];

function stringIsValid(theString) {
  return (theString != null && typeof theString == "string" && theString.length > 0);
}

function setKagiSearchTemplate(isPrivateTab) {
    if (isPrivateTab) {
        if (typeof kagiPrivateSearchTemplate == "string" && kagiPrivateSearchTemplate.length > 0) {
            kagiSearchTemplate = kagiPrivateSearchTemplate;
            return;
        }
    }
    kagiSearchTemplate = defaultKagiSearchTemplate;
}
function captureQuery(a) {
    a = new URL(a);
    var b = a.host;
    b.startsWith(www) && (b = b.slice(www.length));
    b.endsWith(yahoo) && (b = yahoo);
    const path = a.pathname;
    var shouldBlockGoogleNonSearch = (b in googleUrls && !(path.startsWith("/search")));
    var shouldBlockRedirectBasedOnUserPreference = ([currentEngine, "All"].indexOf(domainKeyForHost(b)) < 0);
    if (b in builtInEngines && !(shouldBlockGoogleNonSearch || shouldBlockRedirectBasedOnUserPreference) && (a = (new URLSearchParams(a.search)).get(builtInEngines[b]))) return a;
}

function rewriteQueryURL(a, b) {
    var c = !0,
        d, e = !1;
    if (0 == pt || 2 == pt) {
        if (d = ua[a[0].toLowerCase()]) {
            var f = d.ul;
            c = d.ec
        }
        d = a.slice(1)
    }
    if ((1 == pt || 2 == pt) && !f && 1 < a.length) {
        if (d = ua[a[a.length - 1].toLowerCase()]) f = d.ul, c = d.ec;
        d = a.slice(0, -1)
    }
    1 == os && kagiSearchTemplate && (!f || 1 == a.length && rs) && (e = !0, f = kagiSearchTemplate, c = !0, d = a);
    f && (c = c ? d.map(function(g) {
        return encodeURIComponent(g)
    }).join("%20") : d.join("%20"), b(e, f.replaceAll("%s", c)))
}
var tk = 0;
function checkForSearch(a) {
    if (!flagFetchedPreferences) {
        console.log("[checkForSearch] Search query started before preferences were fetched");
        getPreferencesFromStorage(function(){
            console.log("[checkForSearch] Fetched preferences as part of first search query during current browsing session");
            _checkForSearch(a);
        });
    } else {
        _checkForSearch(a);
    }
}

function _checkForSearch(a) {
    if (-1 == a.parentFrameId && 0 < a.tabId) {
        var b = Date.now(),
            c = a.url,
            d = captureQuery(c).replace(/ +$/, "");
        if (0 == tk || 500 < b - tk) {
            if (d) {
                var e = d.split(/\s+/);
                function tabRewriteURL(f,g) {
                    g && (new URL(c), matchesCustomURL(c) && (f = 1 == os && kagiSearchTemplate && f, 1 < e.length || f ? browser.tabs.update(a.tabId, {
                    url: g,
                    loadReplace: !0
                    }) : rs || browser.tabs.update(a.tabId, {
                    url: g,
                    loadReplace: !0
                    })))
                }
                if (incognitoTabIds.includes(a.tabId)) {
                    setKagiSearchTemplate(true);
                    rewriteQueryURL(e, tabRewriteURL);
                } else if (regularTabIds.includes(a.tabId)) {
                    setKagiSearchTemplate(false);
                    rewriteQueryURL(e, tabRewriteURL);
                } else {
                    browser.tabs.get(a.tabId).then( (thisTab) => {
                        storeIncognitoTabIds(thisTab);
                        setKagiSearchTemplate(thisTab.incognito);
                        rewriteQueryURL(e, tabRewriteURL);
                    });
                }
            }
            tk = b
        }
    }
}

function storeIncognitoTabIds(tab) {
  if (tab.incognito) {
    incognitoTabIds.push(tab.id);
  } else {
    regularTabIds.push(tab.id);
  }
}

function matchesCustomURL(a) {
  return !0
}

function updatePrivateSessionLink(link) {
  if (link.trim().length > 0) {
    // set variable used in current browsing session
    kagiPrivateSearchTemplate = link + "&q=%s";
    // cache it in browser storage so we have an available
    // link as soon as background.js is loaded, otherwise user's
    // first private browsing search will be logged-out and fail
    return browser.storage.local.set({ kagiPrivateSessionLink: link });
  } else {
    kagiPrivateSearchTemplate = "";
    return browser.storage.local.set({ kagiPrivateSessionLink: "" });
  }
}

function getPreferencesFromStorage(callback) {
  browser.storage.local.get(["kagiPrivateSessionLink","kagiEngineToRedirect"], function(value) {
    // Private session link
    var link = value.kagiPrivateSessionLink;
    if (typeof (link) == "string") {
      updatePrivateSessionLink(link);
    }
    // Engine to redirect
    var engine = value.kagiEngineToRedirect;
    if (typeof (engine) == "string") {
      if (engine == "All" || supportedEngineNames.indexOf(engine) < 0) {
        currentEngine = defaultEngineToRedirect; // default to redirecting Google
      } else {
        currentEngine = engine;
      }
    }
    flagFetchedPreferences = true;
    callback();
  });
}

var defaultFilter = {
  url: Object.keys(builtInEngines).flatMap(function(a) {
    return [{
      hostContains: a
    }, {
      hostContains: www + a
    }, {
      hostSuffix: yahoo
    }]
  })
};

browser.webNavigation.onBeforeNavigate.addListener(checkForSearch, defaultFilter);

// Checks for upgrade from 1.x to 2.x. If so, attempts to migrate
// the privateSessionLink url from the previous extension
browser.runtime.onInstalled.addListener(function(details) {
  if (!(details.previousVersion.startsWith("1") == true && browser.runtime.getManifest().version.startsWith("2") == true)) {
    return;
  }
  browser.storage.local.get("privateSessionLink", function(value) {
    var privateSessionLink = value.privateSessionLink;
    if (typeof privateSessionLink == "string" && privateSessionLink.length > 0) {
      updatePrivateSessionLink(privateSessionLink);
    }
  });
});


// Check for a private session link and default engine at startup so that the first search
// in a private window or tab doesn't fail
getPreferencesFromStorage(function(){
    console.log("Finished fetching preferences on startup");
});

function messageReceived(data, sender) {
  let updatedKagiPrivateSessionLink = data["updatedKagiPrivateSessionLink"];
  let updatedKagiEngineToRedirect = data["updatedKagiEngineToRedirect"];
  if (stringIsValid(updatedKagiPrivateSessionLink) || stringIsValid(updatedKagiEngineToRedirect)) {
    // FIXME: Decide whether to send the session link and engine choice through storage or through the message itself. Right now we're doing both.
    getPreferencesFromStorage(function(){
      console.log("Finished fetching preferences after receiving an update message from popup.js");
    });
    return Promise.resolve(true);
  } else {
    return false;
  }
}
browser.runtime.onMessage.addListener(messageReceived);
