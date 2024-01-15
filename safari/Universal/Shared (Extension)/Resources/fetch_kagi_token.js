// Find local token on page
var scrapedToken = "";
try {
  let openSearchHrefSplit = document.querySelector("link[rel=search]").getAttribute("href").split(".xml/");
  if (openSearchHrefSplit.length == 2) {
    scrapedToken = openSearchHrefSplit[1];
  }
} catch (e) {
  console.error(`[Extension] Error finding Kagi session token on page: ${e.message}`);
}

// Fetch current session token
fetch("https://kagi.com/user/session", {
  credentials: "include"
})
.then((response) => response.json())
.then((json) => {
  if (json == null) {
    // FIXME: How can we determine if `null` is because the user is logged out
    // vs if there's some kind of other error in the fetch?
  }
  let token = json["id"];
  if (typeof token == "string" && token.length > 0) {
    browser.runtime.sendMessage({
      "scrapedToken": scrapedToken,
      "fetchedToken": token
    });
  }
})
.catch((e) => console.error(`[Extension] Error fetching Kagi session token through API: ${e.message}`));