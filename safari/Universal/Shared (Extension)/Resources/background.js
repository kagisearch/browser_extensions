/**
 * Returns redirect rules for a given search engine and kagi token
 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/declarativeNetRequest#rules
 */
/**
 * getRedirectRulesForEngine
 * @description generates a set of redirect rules for a user
 * @param {string} engine The search engine to enable, or 'All' for all rules.
 * @param {string} kagiToken A JWT for the Kagi user
 * @returns
 */
const getRedirectRulesForEngine = (engine, kagiToken) => {
  if (typeof engine !== "string") {
    throw new Error("An engine must be set!");
  }

  if (typeof kagiToken !== "string") {
    throw new Error(
      "A Kagi token is required before a redirect can be configured."
    );
  }

  // This rule injects a session cookie into Kagi requests
  const kagiInjectTokenCookieRule = {
    id: 1,
    priority: 1,
    action: {
      type: "modifyHeaders",
      requestHeaders: [
        {
          header: "cookie",
          operation: "set",
          value: `kagi_session=${kagiToken}`,
        },
      ],
    },
    condition: { resourceTypes: ["main_frame"], urlFilter: "||kagi.com" },
  };

  const searchRedirectRules = {
    Google: {
      id: 2,
      priority: 1,
      action: {
        type: "redirect",
        redirect: {
          transform: {
            scheme: "https",
            host: "kagi.com",
            path: "/search",
            queryTransform: {
              removeParams: ["client", "rls", "ie", "oe"],
              addOrReplaceParams: [
                {
                  key: "token",
                  value: kagiToken,
                },
              ],
            },
          },
        },
      },
      condition: {
        resourceTypes: ["main_frame"],
        requestDomains: ["google.com"],
      },
    },

    DuckDuckGo: {
      id: 3,
      priority: 1,
      action: {
        type: "redirect",
        redirect: {
          transform: {
            scheme: "https",
            host: "kagi.com",
            path: "/search",
            queryTransform: {
              removeParams: ["t", "ia"],
              addOrReplaceParams: [
                {
                  key: "token",
                  value: kagiToken,
                },
              ],
            },
          },
        },
      },
      condition: {
        resourceTypes: ["main_frame"],
        requestDomains: ["duckduckgo.com"],
      },
    },

    Yahoo: {
      id: 4,
      priority: 1,
      action: {
        type: "redirect",
        redirect: {
          regexSubstitution: `https://kagi.com/search?q=\\1&token=${kagiToken}`,
        },
      },
      condition: {
        regexFilter: `^https?://.*?[?&]p=([^&]+)$`,
        resourceTypes: ["main_frame"],
        requestDomains: ["yahoo.com"],
      },
    },

    Bing: {
      id: 5,
      priority: 1,
      action: {
        type: "redirect",
        redirect: {
          transform: {
            scheme: "https",
            host: "kagi.com",
            path: "/search",
            queryTransform: {
              removeParams: ["form", "PC"],
              addOrReplaceParams: [
                {
                  key: "token",
                  value: kagiToken,
                },
              ],
            },
          },
        },
      },
      condition: {
        resourceTypes: ["main_frame"],
        requestDomains: ["bing.com"],
      },
    },

    Ecosia: {
      id: 6,
      priority: 1,
      action: {
        type: "redirect",
        redirect: {
          transform: {
            scheme: "https",
            host: "kagi.com",
            path: "/search",
            queryTransform: {
              removeParams: ["tts"],
              addOrReplaceParams: [
                {
                  key: "token",
                  value: kagiToken,
                },
              ],
            },
          },
        },
      },
      condition: {
        resourceTypes: ["main_frame"],
        requestDomains: ["ecosia.org"],
      },
    },
  };

  const enabledEngineRules =
    engine === "All"
      ? Object.values(searchRedirectRules)
      : engine in searchRedirectRules
      ? [searchRedirectRules[engine]]
      : [];

  if (enabledEngineRules.length < 1) {
    throw new Error(
      `${engine} is not an available search engine. The options are: ${Object.keys(
        searchRedirectRules
      ).join(" ")}`
    );
  }

  const enabledRules = [kagiInjectTokenCookieRule, ...enabledEngineRules];

  return {
    enabledRules,
    allRuleIds: [
      kagiInjectTokenCookieRule.id,
      ...Object.values(searchRedirectRules).map((rule) => rule.id),
    ],
  };
};

async function clearDynamicRules() {
  const currentRules = await browser.declarativeNetRequest.getDynamicRules();
  const currentRuleIds = currentRules.map((rule) => rule.id);
  await browser.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: currentRuleIds,
  });
}

/**
 * @description
 * @param {string} engine the search engine
 * @param {string} privateSessionLink the user's private session link, should be a URL.
 */
async function synchronizeRules(engine, privateSessionLink) {
  const kagiToken = new URL(privateSessionLink)?.searchParams.get("token");
  try {
    const { enabledRules, allRuleIds } = getRedirectRulesForEngine(
      engine,
      kagiToken
    );

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

const port = browser.runtime.connectNative(browser.runtime.id);

port.onMessage.addListener(async function handleNativeMessage(message) {
  console.log(`Received message`, message);

  if (message?.name) {
    switch (message.name) {
      case "syncData": {
        const { currentEngine, privateSessionLink } = message.userInfo;

        if (currentEngine && privateSessionLink) {
          await synchronizeRules(currentEngine, privateSessionLink);
        }
        break;
      }
    }
  }
});

(async function onLoad() {
  console.log("Starting up...");

  let currentEngine, privateSessionLink;

  try {
    const [currentEngineEvent, privateSessionLinkEvent] = await Promise.all([
      browser.runtime.sendNativeMessage(browser.runtime.id, {
        type: "currentEngine",
      }),
      browser.runtime.sendNativeMessage(browser.runtime.id, {
        type: "privateSessionLink",
      }),
    ]);

    currentEngine = currentEngineEvent.currentEngine;
    privateSessionLink = privateSessionLinkEvent.privateSessionLink;

    console.log("Received preferences", { currentEngine, privateSessionLink });
  } catch (err) {
    console.error("Error requesting engine and private session link", err);
    return;
  }

  if (
    typeof currentEngine === "string" &&
    typeof privateSessionLink === "string"
  ) {
    await synchronizeRules(currentEngine, privateSessionLink);
  } else {
    console.log(
      `Initialised with no engine or session token link set. We'll need a sync when the private session link is available.`
    );
  }
})();
