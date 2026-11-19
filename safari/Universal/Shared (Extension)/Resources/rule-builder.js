function supportsFastRedirect() {
    const version = navigator.userAgent.match(/Version\/([\d.]+)/);
    return Boolean(browser.declarativeNetRequest) && (!version || parseFloat(version[1]) >= 15.4);
}

// Preserve regional Google hosts used by older Safari search templates.
const googleDomains = [
    "google.ad", "google.ae", "google.al", "google.am", "google.as",
    "google.at", "google.az", "google.ba", "google.be", "google.bf",
    "google.bg", "google.bi", "google.bj", "google.bs", "google.bt",
    "google.by", "google.ca", "google.cat", "google.cd", "google.cf",
    "google.cg", "google.ch", "google.ci", "google.cl", "google.cm",
    "google.cn", "google.co.ao", "google.co.bw", "google.co.ck", "google.co.cr",
    "google.co.hu", "google.co.id", "google.co.il", "google.co.in", "google.co.jp",
    "google.co.ke", "google.co.kr", "google.co.ls", "google.co.ma", "google.co.mz",
    "google.co.nz", "google.co.th", "google.co.tz", "google.co.ug", "google.co.uk",
    "google.co.uz", "google.co.ve", "google.co.vi", "google.co.za", "google.co.zm",
    "google.co.zw", "google.com", "google.com.af", "google.com.ag", "google.com.ai",
    "google.com.ar", "google.com.au", "google.com.bd", "google.com.bh", "google.com.bn",
    "google.com.bo", "google.com.br", "google.com.bz", "google.com.co", "google.com.cu",
    "google.com.cy", "google.com.do", "google.com.ec", "google.com.eg", "google.com.et",
    "google.com.fj", "google.com.gh", "google.com.gi", "google.com.gr", "google.com.gt",
    "google.com.hk", "google.com.jm", "google.com.kh", "google.com.kw", "google.com.lb",
    "google.com.ly", "google.com.mm", "google.com.mt", "google.com.mx", "google.com.my",
    "google.com.na", "google.com.ng", "google.com.ni", "google.com.np", "google.com.om",
    "google.com.pa", "google.com.pe", "google.com.pg", "google.com.ph", "google.com.pk",
    "google.com.pr", "google.com.py", "google.com.qa", "google.com.ru", "google.com.sa",
    "google.com.sb", "google.com.sg", "google.com.sl", "google.com.sv", "google.com.tj",
    "google.com.tr", "google.com.tw", "google.com.ua", "google.com.uy", "google.com.vc",
    "google.com.vn", "google.cv", "google.cz", "google.de", "google.dj",
    "google.dk", "google.dm", "google.dz", "google.ee", "google.es",
    "google.fi", "google.fm", "google.fr", "google.ga", "google.ge",
    "google.gg", "google.gl", "google.gm", "google.gr", "google.gy",
    "google.hn", "google.hr", "google.ht", "google.hu", "google.ie",
    "google.im", "google.iq", "google.is", "google.it", "google.je",
    "google.jo", "google.kg", "google.ki", "google.kz", "google.la",
    "google.li", "google.lk", "google.lt", "google.lu", "google.lv",
    "google.md", "google.me", "google.mg", "google.mk", "google.ml",
    "google.mn", "google.ms", "google.mu", "google.mv", "google.mw",
    "google.ne", "google.nl", "google.no", "google.nr", "google.nu",
    "google.pl", "google.pn", "google.ps", "google.pt", "google.ro",
    "google.rs", "google.ru", "google.rw", "google.sc", "google.se",
    "google.sh", "google.si", "google.sk", "google.sm", "google.sn",
    "google.so", "google.sr", "google.st", "google.td", "google.tg",
    "google.tl", "google.tm", "google.tn", "google.to", "google.tt",
    "google.vg", "google.vu", "google.ws"
];

// Safari address-bar formats and regional variants: https://zenn.dev/cizzuk/articles/cfa044b8679c8d
// Sogou's website searches have no verified address-bar marker.
const googleHosts = googleDomains.flatMap(host => [host, `www.${host}`]);
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

const domainMap = {};
for (const { engine, hosts } of safariSearchFormats) {
    domainMap[engine] = [...new Set([...(domainMap[engine] || []), ...hosts.map(host => host.replace(/^www[.]/, ""))])];
}

function selectedEngine(engine) {
    // Older releases labelled the so.com engine "Sogou" in the popup.
    if (engine === "Sogou") return "360 Search";
    return safariSearchFormats.some(format => format.engine === engine) ? engine : "All";
}

function fastRedirectEnabled(prefs) {
    if (typeof prefs.kagiDnrEnabled === "boolean") return prefs.kagiDnrEnabled;
    return globalThis.localStorage?.getItem("is-dnr-enabled") !== "false";
}

function directRedirectRules(redirectURL, engine = "All") {
    const rules = [];
    let id = 1000;
    for (const source of safariSearchFormats) {
        if (engine !== "All" && engine !== source.engine) continue;
        const q = source.query;
        const marker = source.marker;
        // Share Google's regexes across its regional hosts to stay below the
        // regex-rule quota. requestDomains still restricts them to the allowlist;
        // Fixed suffix shapes exclude arbitrary subdomains of those domains.
        const hostPatterns = source.engine === "Google"
            ? ["[a-z][a-z]", "[a-z][a-z][a-z]", "[a-z][a-z][.][a-z][a-z]", "[a-z][a-z][a-z][.][a-z][a-z]"]
                .flatMap((suffix) => [`google[.]${suffix}`, `www[.]google[.]${suffix}`])
            : source.hosts.map((host) => host.replaceAll(".", "[.]"));
        if (source.engine === "Yahoo") {
            hostPatterns.push("[a-z][a-z][.]search[.]yahoo[.]com");
        }
        for (const hostPattern of hostPatterns) {
            const base = `^https://${hostPattern}${source.path}[?]`;
            for (const value of source.values) {
                // Exact parameter boundaries matter: "notclient=safari" and
                // "t=iphone123" must not redirect. Each pattern captures only q.
                const patterns = [
                    `${base}${q}=([^&#]*)[&]${marker}=${value}$`,
                    `${base}${q}=([^&#]*)[&]${marker}=${value}[&#].*$`,
                    `${base}${q}=([^&#]*)[&][^#]*[&]${marker}=${value}$`,
                    `${base}${q}=([^&#]*)[&][^#]*[&]${marker}=${value}[&#].*$`,
                    `${base}[^#]*[&]${q}=([^&#]*)[&]${marker}=${value}$`,
                    `${base}[^#]*[&]${q}=([^&#]*)[&]${marker}=${value}[&#].*$`,
                    `${base}[^#]*[&]${q}=([^&#]*)[&][^#]*[&]${marker}=${value}$`,
                    `${base}[^#]*[&]${q}=([^&#]*)[&][^#]*[&]${marker}=${value}[&#].*$`,
                    `${base}${marker}=${value}[&]${q}=([^&#]*).*$`,
                    `${base}${marker}=${value}[&][^#]*[&]${q}=([^&#]*).*$`,
                    `${base}[^#]*[&]${marker}=${value}[&]${q}=([^&#]*).*$`,
                    `${base}[^#]*[&]${marker}=${value}[&][^#]*[&]${q}=([^&#]*).*$`
                ];
                for (const regexFilter of patterns) {
                    rules.push({
                        id: id++,
                        priority: 100,
                        action: { type: "redirect", redirect: { regexSubstitution: `${redirectURL}?q=\\1` } },
                        condition: { regexFilter, isUrlFilterCaseSensitive: true, resourceTypes: ["main_frame"],
                            ...(source.engine === "Google" ? { requestDomains: googleDomains } : {}) }
                    });
                }
            }
        }
    }
    return rules;
}

function captureQuery(url, engine) {
    const search = new URL(url);
    if (search.protocol !== "https:") return;

    for (const format of safariSearchFormats) {
        if (engine !== "All" && engine !== format.engine) continue;
        if (search.pathname !== format.path) continue;
        const matchesHost = format.hosts.includes(search.host) ||
            (format.engine === "Yahoo" && yahooRegion.test(search.host));
        if (matchesHost && format.values.includes(search.searchParams.get(format.marker))) {
            return search.searchParams.get(format.query) ?? undefined;
        }
    }
}

async function kagiSearchURL(query, getTab) {
    const destination = new URL("https://kagi.com/search");
    try {
        const tab = await getTab();
        if (tab?.incognito === true) {
            const prefs = await browser.storage.local.get("kagiPrivateSessionLink");
            const link = typeof prefs.kagiPrivateSessionLink === "string" ? prefs.kagiPrivateSessionLink.trim() : "";
            if (link) {
                const session = new URL(link);
                if (session.origin === "https://kagi.com" && session.pathname === "/search" &&
                    !session.username && !session.password && session.searchParams.get("token")) {
                    destination.searchParams.set("token", session.searchParams.get("token"));
                }
            }
        }
    } catch {
        // Missing settings or tab information must not strand the search page.
        // Fall back to normal Kagi authentication without exposing a token.
    }
    // Preserve the query exactly, including spaces and literal plus signs.
    const separator = destination.search ? "&" : "?";
    return `${destination.href}${separator}q=${encodeURIComponent(query)}`;
}
