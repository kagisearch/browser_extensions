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
        return;
    }
    var token = json["id"];
    if (scrapedToken.length > 0) {
        token = scrapedToken;
    }
    
    if (typeof token == "string" && token.length > 0) {
        const tokenLink = "https://kagi.com/search?token=" + encodeURIComponent(token);
        return browser.storage.local.set({ "kagiPrivateSessionLink": tokenLink })
        .then((result) => {
            if (location.href.indexOf("https://kagi.com/signin") == 0) {
                let kagi_sse_replay = localStorage.getItem("kagi_sse_replay")
                if (typeof kagi_sse_replay !== "undefined" && kagi_sse_replay != null) {
                    let values = JSON.parse(kagi_sse_replay);
                    if (typeof values !== "undefined" && values != null) {
                        let keys = Object.keys(values);
                        if (keys.length > 0) {
                            let searchString = keys[0];
                            if (searchString.indexOf("search?q=") == 0) {
                                const replayURL = new URL(searchString, "https://kagi.com/");
                                replayURL.searchParams.set("token", token);
                                window.location = replayURL.href;
                            }
                        }
                    }
                }
            }
        })
    }
})
.catch((e) => console.error(`[Extension] Error fetching Kagi session token through API: ${e.message}`));



