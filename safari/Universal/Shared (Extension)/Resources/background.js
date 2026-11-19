// Safari address-bar formats and regional variants: https://zenn.dev/cizzuk/articles/cfa044b8679c8d
// Sogou's website searches have no verified address-bar marker.
const googleHosts = domainMap.Google.flatMap(host => [host, `www.${host}`]);
const yandexHosts = ["yandex.ru", "yandex.com", "yandex.com.tr", "yandex.kz", "yandex.by", "yandex.ua"];
const yahooRegion = /^[a-z]{2}\.search\.yahoo\.com$/;

const safariSearchFormats = [
    { engine: "Google", hosts: googleHosts, path: "/search", query: "q",
      marker: "client", values: ["safari"] },
    { engine: "Yahoo", hosts: ["search.yahoo.com", "search.yahoo.co.jp"], path: "/search", query: "p",
      marker: "fr", values: ["iphone", "applep1", "ipad", "applpd", "aaplw", "appsfch2"] },
    { engine: "Bing", hosts: ["www.bing.com"], path: "/search", query: "q",
      marker: "form", values: ["APIPH1", "APIPA1", "APMCS1"] },
    { engine: "DuckDuckGo", hosts: ["duckduckgo.com"], path: "/", query: "q",
      marker: "t", values: ["iphone", "ipad", "osx"] },
    { engine: "Ecosia", hosts: ["www.ecosia.org"], path: "/search", query: "q",
      marker: "tts", values: ["st_asaf_iphone", "st_asaf_ipad", "st_asaf_macos"] },
    { engine: "Baidu", hosts: ["m.baidu.com"], path: "/s", query: "word",
      marker: "from", values: ["1099b", "1000539d"] },
    { engine: "Baidu", hosts: ["www.baidu.com"], path: "/s", query: "wd",
      marker: "tn", values: ["84053098_1_dg", "84053098_4_dg", "84053098_dg"] },
    { engine: "Yandex", hosts: yandexHosts, path: "/search/touch/", query: "text",
      marker: "clid", values: ["1906591"] },
    { engine: "Yandex", hosts: yandexHosts, path: "/search/pad/", query: "text",
      marker: "clid", values: ["1906723"] },
    { engine: "Yandex", hosts: yandexHosts, path: "/search", query: "text",
      marker: "clid", values: ["1906725"] },
    { engine: "360 Search", hosts: ["m.so.com"], path: "/s", query: "q",
      marker: "srcg", values: ["safariwap_1"] },
    { engine: "360 Search", hosts: ["www.so.com"], path: "/s", query: "q",
      marker: "ls", values: ["safarimac"] },
];

const extensionId = "com.kagi.Kagi-Search-for-Safari.Extension (TFVG979488)";

var ua = {},
    tg = "0",
    pt = 0,
    os = !0,
    rs = !0,
    currentEngine = "All",
    defaultEngineToRedirect = "All",
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
function captureQuery(url, engine) {
    const search = new URL(url);
    if (search.protocol !== "https:") return;

    // The released popup groups 360 Search's so.com hosts under "Sogou".
    const selectedEngine = engine === "Sogou" ? "360 Search" : engine;
    for (const format of safariSearchFormats) {
        if (selectedEngine !== "All" && selectedEngine !== format.engine) continue;
        if (search.pathname !== format.path) continue;
        const matchesHost = format.hosts.includes(search.host) ||
            (format.engine === "Yahoo" && yahooRegion.test(search.host));
        if (matchesHost && format.values.includes(search.searchParams.get(format.marker))) {
            return search.searchParams.get(format.query) ?? undefined;
        }
    }
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
    console.log("webNavigation redirect");
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
        const query = captureQuery(a.url, currentEngine);
        if (!query) return;
        var b = Date.now(),
            c = a.url,
            d = query.replace(/ +$/, "");
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

function setCurrentEngine(engine) {
  const knownEngine = engine === "Sogou" || safariSearchFormats.some(format => format.engine === engine);
  currentEngine = knownEngine ? engine : defaultEngineToRedirect;
}

function getPreferencesFromStorage(callback) {
  browser.storage.local.get(["kagiPrivateSessionLink","kagiEngineToRedirect"], function(value) {
    // Private session link
    var link = value.kagiPrivateSessionLink;
    if (typeof (link) == "string") {
      updatePrivateSessionLink(link);
    }
    // Engine to redirect
    setCurrentEngine(value.kagiEngineToRedirect);
    flagFetchedPreferences = true;
    callback();
  });
}

const searchHosts = new Set(safariSearchFormats.flatMap(format => format.hosts));
const defaultFilter = {
    url: [...searchHosts].map(host => ({ hostEquals: host })).concat({ hostSuffix: ".search.yahoo.com" })
};

browser.webNavigation.onBeforeNavigate.addListener(checkForSearch, defaultFilter);

// Checks for upgrade from 1.x to 2.x. If so, attempts to migrate
// the privateSessionLink url from the previous extension
browser.runtime.onInstalled.addListener(function(details) {
  if (!details.previousVersion?.startsWith("1") || !browser.runtime.getManifest().version.startsWith("2")) {
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

async function messageReceived(data, sender) {
    let updatedKagiPrivateSessionLink = data["updatedKagiPrivateSessionLink"];
    let updatedKagiEngineToRedirect = data["updatedKagiEngineToRedirect"];
    if (stringIsValid(updatedKagiPrivateSessionLink) || stringIsValid(updatedKagiEngineToRedirect)) {
        if (shouldUseDNR()) {
            const prefs = await browser.storage.local.get(["kagiPrivateSessionLink","kagiEngineToRedirect"]);
            
            if (stringIsValid(updatedKagiPrivateSessionLink)) {
                if (updatedKagiPrivateSessionLink == prefs.kagiPrivateSessionLink) {
                    return;
                }
            }
            
            currentEngine = prefs.kagiEngineToRedirect;
            privateSessionLink = prefs.kagiPrivateSessionLink;
            
            if (typeof currentEngine === "undefined") {
                currentEngine = "All";
            }
            
            if (typeof privateSessionLink === "undefined") {
                privateSessionLink = null;
            }
            
            console.log("Updating rules with preps", { currentEngine, privateSessionLink });
            await synchronizeRules(currentEngine, privateSessionLink);
        } else if (stringIsValid(updatedKagiEngineToRedirect)) {
            setCurrentEngine(updatedKagiEngineToRedirect);
        }
        return Promise.resolve(true);
    } else {
        return false;
    }
}

browser.runtime.onMessage.addListener(messageReceived);

(async () => await initialize())();
