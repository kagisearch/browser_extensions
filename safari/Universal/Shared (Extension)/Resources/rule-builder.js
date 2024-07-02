let versionString = navigator.userAgent.split("Version/")[1].split(" ")[0];
let versionMajor = parseInt(versionString);

const domainMap = {
    "Google": ["google.com.au", "google.md", "google.ru", "google.me", "google.com.qa", "google.com.gt", "google.se", "google.tm", "google.vg", "google.it", "google.cat", "google.com.ru", "google.com.gr", "google.ee", "google.cd", "google.sk", "google.com.ly", "google.hn", "google.co.jp", "google.ad", "google.com.sg", "google.ie", "google.co.vi", "google.kg", "google.com.kh", "google.co.ck", "google.is", "google.tt", "google.vu", "google.bg", "google.ch", "google.com.sa", "google.tn", "google.pl", "google.ro", "google.gm", "google.tl", "google.mg", "google.dk", "google.com.bo", "google.je", "google.com.kw", "google.dz", "google.ga", "google.com.gh", "google.lt", "google.com.ag", "google.ps", "google.com.vc", "google.com.pr", "google.co.cr", "google.pn", "google.com.tr", "google.sn", "google.tg", "google.gg", "google.gr", "google.com.mt", "google.nu", "google.cm", "google.lk", "google.co.mz", "google.cv", "google.sm", "google.no", "google.al", "google.bi", "google.com.af", "google.sr", "google.jo", "google.sh", "google.co.uk", "google.co.bw", "google.dm", "google.at", "google.co.ug", "google.dj", "google.si", "google.com.pg", "google.com.tj", "google.co.za", "google.nl", "google.sc", "google.ae", "google.mv", "google.ne", "google.gy", "google.com.sl", "google.co.in", "google.com.bn", "google.ht", "google.com.ua", "google.com.my", "google.co.kr", "google.com", "google.by", "google.com.cu", "google.com.lb", "google.co.nz", "google.mu", "google.com.om", "google.as", "google.com.pe", "google.mk", "google.td", "google.es", "google.az", "google.com.hk", "google.com.do", "google.bt", "google.am", "google.fm", "google.com.mx", "google.fi", "google.com.bz", "google.st", "google.com.vn", "google.rs", "google.bs", "google.cn", "google.com.pa", "google.com.sb", "google.lv", "google.co.uz", "google.co.hu", "google.co.ve", "google.co.zw", "google.com.ai", "google.com.co", "google.ci", "google.com.uy", "google.cl", "google.mw", "google.cz", "google.co.il", "google.co.th", "google.be", "google.hr", "google.fr", "google.im", "google.com.ec", "google.cg", "google.iq", "google.com.np", "google.gl", "google.co.ke", "google.co.id", "google.ml", "google.ms", "google.com.ni", "google.mn", "google.ki", "google.lu", "google.hu", "google.rw", "google.co.ma", "google.com.tw", "google.co.ls", "google.com.et", "google.li", "google.com.br", "google.bj", "google.com.py", "google.co.tz", "google.ba", "google.co.ao", "google.bf", "google.com.ph", "google.com.sv", "google.com.bd", "google.com.mm", "google.la", "google.ws", "google.com.fj", "google.co.zm", "google.cf", "google.nr", "google.to", "google.com.jm", "google.com.ar", "google.com.gi", "google.ca", "google.kz", "google.com.cy", "google.de", "google.com.na", "google.com.pk", "google.pt", "google.ge", "google.so", "google.com.bh", "google.com.eg", "google.com.ng"],
    "DuckDuckGo": ["duckduckgo.com", "duckduckgo.pl", "duckduckgo.jp", "duckduckgo.co", "duckduckco.de", "duckduckgo.ca", "duckduckgo.co.uk", "duckduckgo.com.mx", "duckduckgo.com.tw", "duckduckgo.dk", "duckduckgo.in", "duckduckgo.ke", "duckduckgo.mx", "duckduckgo.nl", "duckduckgo.org", "duckduckgo.sg", "duckduckgo.uk", "duckgo.com", "ddg.co", "ddg.gg", "duck.co", "duck.com"],
    "Yahoo": ["search.yahoo.com", "search.yahoo.com"],
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
const allSupportedDomains = [...domainMap["Google"],
                             ...domainMap["DuckDuckGo"],
                             ...domainMap["Ecosia"],
                             ...domainMap["Bing"],
                             ...domainMap["Yahoo"],
                             ...domainMap["Sogou"],
                             ...domainMap["Yandex"],
                             ...domainMap["Baidu"]];
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
    "!yahoo": engineDefaultRedirectInfo["Yahoo"],
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

function paramsForSelectedEngine(engine) {
    
    if (engine == "Google") {
        return {
            "q": function() { return domainMap["Google"]; }
        };
    } else if (engine == "DuckDuckGo") {
        return {
            "q": function() { return domainMap["DuckDuckGo"]; }
        };
    } else if (engine == "Yahoo") {
        return {
            "p": function() { return domainMap["Yahoo"]; }
        };
    } else if (engine == "Sogou") {
        return {
            "query": function() { return ["sogou.com"]; },
            "keyword": function() { return ["m.sogou.com"]; },
            "q": function() { return ["m.so.com", "so.com"]; }
        };
    } else if (engine == "Bing") {
        return {
            "q": function() { return domainMap["Bing"]; }
        };
    } else if (engine == "Yandex") {
        return {
            "q": function() { return domainMap["Yandex"]; }
        };
    } else if (engine == "Ecosia") {
        return {
            "q": function() { return domainMap["Ecosia"]; }
        };
    } else if (engine == "Baidu") {
        return {
            "wd": function() { return ["baidu.com"]; },
            "word": function() { return ["m.baidu.com"] }
        };
    }
    
    return paramDomainMap;
}

function getRedirectRulesForEngine(engine, kagiToken) {
    let ruleTemplate = {
        "id": 999,
        "priority": 2,
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
    let allowedTemplate = {
        "id": 999,
        "priority": 5,
        "action": {
            "type": "allow"
        },
        "condition": {
            "resourceTypes": [ "main_frame" ],
            "regexFilter": "^https?.*\/url[?&]q=?.*$"
        }
    };
    let bangFromKagiRuleTemplate = {
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
    let bangFromKagiRuleEndOfURLTemplate = {
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
    
    let kagiCookieTemplate = {
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
        "condition": { "urlFilter": "||kagi.com/*", "resourceTypes": [ "main_frame", "other" ] }
    };
    // Negate cookies on the login form to avoid bugs. Needed due to limitations in Safari content blocker regex
    let kagiCookieNegationTemplate = {
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
    
    var newRules = [];
    let hasSessionToken = (kagiToken != null && kagiToken.trim().length > 0);
    let engineParamDomainMap = paramsForSelectedEngine(engine);
    let paramKeys = Object.keys(engineParamDomainMap);
    let bangKeys = Object.keys(bangDomainMap);
    var idCounter = 0;
    
    idCounter += 1;
    var allowRule = structuredClone(allowedTemplate);
    allowRule["id"] = idCounter;
    newRules.push(allowRule);
    
    for (let i=0; i<paramKeys.length; i++) {
        idCounter += 1;
        let paramKey = paramKeys[i];
        
        let regexFilterWithParamKey = ruleTemplate["condition"]["regexFilter"].replace("{{parameterKey}}", paramKey);
        var regexSubstitution = ruleTemplate["action"]["redirect"]["regexSubstitution"];
        if (hasSessionToken) {
            // Modify the redirect location since the "www" hack is not needed if we have a session token
            regexSubstitution += ("&token=" + kagiToken);
        }
        var newRule = structuredClone(ruleTemplate);
        newRule["id"] = idCounter;
        newRule["condition"]["regexFilter"] = regexFilterWithParamKey;
        let wwwDomainMap = structuredClone(engineParamDomainMap[paramKey]());
        newRule["condition"]["requestDomains"] = engineParamDomainMap[paramKey]().concat(wwwDomainMap.map((domain) => { return domain.startsWith("www.") ? "" : `www.${domain}`; }).filter((d) => d.length > 0));
        newRule["action"]["redirect"]["regexSubstitution"] = regexSubstitution;
        newRules.push(newRule);
    }
    
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
        newRules.push(newBangFromKagiRule);
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
        newRules.push(newBangAtEndOfUrlFromKagiRule);
    }
    
    if (hasSessionToken) {
        idCounter += 1;
        // FIXME: Re-add cookie rule after figuring out how to make it reliable. It's preferred over sending the token in the URL itself which can be sniffed
        var kagiCookieRule = structuredClone(kagiCookieTemplate);
        var kagiCookieNegationRule = structuredClone(kagiCookieNegationTemplate);
        kagiCookieRule["id"] = idCounter;
        idCounter += 1;
        kagiCookieNegationRule["id"] = idCounter;
        kagiCookieRule["action"]["requestHeaders"][0]["value"] = kagiCookieRule["action"]["requestHeaders"][0]["value"].replace("{{sessionToken}}", kagiToken);
        newRules.push(kagiCookieRule);
        newRules.push(kagiCookieNegationRule);
    }
    
    return newRules;
}

async function clearDynamicRules() {
    const currentRules = await browser.declarativeNetRequest.getDynamicRules();
    
    if (currentRules.length > 0) {
        console.log("Cleaning up old rules...");
        const currentRuleIds = currentRules.map((rule) => rule.id);
        await browser.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: currentRuleIds,
        });
    }
}

async function synchronizeRules(engine, privateSessionLink) {
    let kagiToken;
    
    if (privateSessionLink != null && typeof privateSessionLink === "string") {
        if (privateSessionLink.indexOf("https://kagi.com/search?token=") == 0) {
            try {
                kagiToken = new URL(privateSessionLink)?.searchParams.get("token");
            } catch {
                await clearDynamicRules()
                return
            }
        }
    }
    
    try {
        const enabledRules = getRedirectRulesForEngine(engine, kagiToken);
        
        console.log("Setting rules...", enabledRules);
        
        await clearDynamicRules();
        
        await browser.declarativeNetRequest.updateDynamicRules({
        addRules: enabledRules,
        });
        
        console.log("Seems like it worked...");
    } catch (err) {
        console.error("Something went wrong", err);
    }
}

function shouldUseDNR() {
    var useDNR = true;
    let isDNREnabled = localStorage.getItem("is-dnr-enabled")
    if (isDNREnabled != null) {
        if (isDNREnabled == "false") {
            useDNR = false;
        }
    }
    
    if (versionMajor >= 17) {
        return useDNR;
    } else {
        return false;
    }
}

async function initialize() {
    console.log("Starting up...");
    
    if (shouldUseDNR()) {
        let currentEngine, privateSessionLink;
        
        try {
            const prefs = await browser.storage.local.get(["kagiPrivateSessionLink","kagiEngineToRedirect"]);
            
            currentEngine = prefs.kagiEngineToRedirect;
            privateSessionLink = prefs.kagiPrivateSessionLink;
            
            if (typeof currentEngine === "undefined") {
                currentEngine = "All";
            }
            
            if (typeof privateSessionLink === "undefined") {
                privateSessionLink = null;
            }
            
            console.log("Received preferences", { currentEngine, privateSessionLink });
        } catch (err) {
            console.error("Error requesting engine and private session link", err);
            return;
        }
        
        console.log("Initializing...");
        await synchronizeRules(currentEngine, privateSessionLink);
    }
    
}

function stringIsValid(theString) {
    return (theString != null && typeof theString == "string" && theString.length > 0);
}
