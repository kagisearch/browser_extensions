function messageReceived(data, sender) {
  let scrapedToken = data["scrapedToken"];
  let fetchedToken = data["fetchedToken"];
  if (tokenIsValid(fetchedToken) || tokenIsValid(scrapedToken)) {
    return browser.storage.local.get("kagiPrivateSessionToken")
    .then((result) => {
      let existingToken = result["kagiPrivateSessionToken"];
      if (tokenIsValid(existingToken) && ((existingToken != fetchedToken) ||
                                          (existingToken != scrapedToken))) {
        return browser.storage.local.set({ "kagiNewFetchedToken": fetchedToken, "kagiNewScrapedToken": scrapedToken })
        .then(() => {
          // If there's both fetched and scraped tokens don't match, warn the user
          // with a badge in the toolbar. When they open the extension popup,
          // it will resolve the conflict, update redirect rules, and remove the badge.
          if (existingToken != fetchedToken && existingToken != scrapedToken) {
            browser.action.setBadgeText({text: "!"});
          }
        })
        .then(() => Promise.resolve(true));
      } else {
        return Promise.resolve(false);
      }
    })
    return Promise.resolve(true);
  } else {
    return false;
  }
}
browser.runtime.onMessage.addListener(messageReceived);

function tokenIsValid(theToken) {
  return (theToken != null && typeof theToken == "string" && theToken.length > 0);
}