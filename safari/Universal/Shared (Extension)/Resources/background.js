async function redirectCommittedSearch(details) {
    if (details.frameId !== 0 || details.tabId < 0) return;
    const { kagiEngineToRedirect } = await browser.storage.local.get("kagiEngineToRedirect");
    const query = captureQuery(details.url, selectedEngine(kagiEngineToRedirect));
    if (query === undefined) return;

    // The tab may have moved on while we were reading the selected engine.
    const tab = await browser.tabs.get(details.tabId);
    if (tab?.url !== details.url || (tab.pendingUrl && tab.pendingUrl !== details.url)) return;

    await browser.tabs.update(details.tabId, {
        url: `${browser.runtime.getURL("redirect.html")}?q=${encodeURIComponent(query)}`,
        loadReplace: true
    });
}

const searchHosts = new Set(safariSearchFormats.flatMap(format => format.hosts));
const defaultFilter = {
    url: [...searchHosts].map(host => ({ hostEquals: host })).concat({ hostSuffix: ".search.yahoo.com" })
};

// DNR redirects before the engine page commits. A committed search still needs the fallback.
browser.webNavigation.onCommitted.addListener(details =>
    redirectCommittedSearch(details).catch(error => console.error("Could not redirect search:", error)),
    defaultFilter);

// Import the 1.x link only if the user has never saved or cleared the 2.x setting.
browser.runtime.onInstalled.addListener(details => {
    if (details.previousVersion?.split(".")[0] !== "1" || browser.runtime.getManifest().version.split(".")[0] !== "2") return;
    return browser.storage.local.get(["privateSessionLink", "kagiPrivateSessionLink"]).then(prefs => {
        if (prefs.kagiPrivateSessionLink === undefined && typeof prefs.privateSessionLink === "string") {
            return browser.storage.local.set({ kagiPrivateSessionLink: prefs.privateSessionLink });
        }
    }).catch(error => console.error("Could not migrate private session link:", error));
});

// The background is the only writer. Safari keeps dynamic rules while it sleeps.
let rulesUpdate = synchronizeRules().catch(reportRuleError);

function reportRuleError(error) {
    console.error("Could not refresh redirect rules:", error);
}

function ruleKey(rule) {
    return JSON.stringify([rule.id, rule.priority, rule.action.type,
        rule.action.redirect?.regexSubstitution, rule.condition.regexFilter,
        rule.condition.isUrlFilterCaseSensitive, rule.condition.resourceTypes,
        rule.condition.requestDomains?.slice().sort()]);
}

async function synchronizeRules() {
    const dnr = browser.declarativeNetRequest;
    if (!dnr) return;
    const existing = await dnr.getDynamicRules();
    const prefs = await browser.storage.local.get(["kagiEngineToRedirect", "kagiDnrEnabled"]);
    const desired = supportsFastRedirect() && fastRedirectEnabled(prefs)
        ? directRedirectRules(browser.runtime.getURL("redirect.html"), selectedEngine(prefs.kagiEngineToRedirect))
        : [];
    const installed = new Set(existing.map(ruleKey));
    const wanted = new Set(desired.map(ruleKey));
    const removeRuleIds = existing.filter(rule => !wanted.has(ruleKey(rule))).map(rule => rule.id);
    let addRules = desired.filter(rule => !installed.has(ruleKey(rule)));
    try {
        if (dnr.isRegexSupported) {
            const checks = await Promise.all(addRules.map(rule => dnr.isRegexSupported({
                regex: rule.condition.regexFilter, isCaseSensitive: true, requireCapturing: true
            })));
            addRules = addRules.filter((_rule, index) => checks[index].isSupported);
        }
        if (addRules.length || removeRuleIds.length) {
            await dnr.updateDynamicRules({ addRules, removeRuleIds });
        }
    } catch (error) {
        // Even if replacement fails, retire stale engine and legacy token rules.
        if (removeRuleIds.length) await dnr.updateDynamicRules({ removeRuleIds });
        throw error;
    }
}

browser.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (changes.kagiEngineToRedirect || changes.kagiDnrEnabled) {
        rulesUpdate = rulesUpdate.then(synchronizeRules).catch(reportRuleError);
    }
});
