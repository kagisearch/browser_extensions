chrome.webNavigation.onBeforeNavigate.addListener(function(details) {
	let url = details.url;
	if (typeof(url) !== "undefined" && url.startsWith(`https://kagi.com`)) {
		chrome.storage.local.set({ lastKagiUrl: url });
	} else {
		chrome.storage.local.set({ lastKagiUrl: "" });
	}
});
