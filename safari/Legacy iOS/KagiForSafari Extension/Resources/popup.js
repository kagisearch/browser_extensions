document.getElementById("footerLink").onclick = function() {
	window.open("https://kagi.com/settings?p=user_details#sessionlink");
};

chrome.storage.local.get("privateSessionLink", function(value) {
	var privateSessionLink = value.privateSessionLink;
	if (typeof(privateSessionLink) !== "undefined") {
		document.getElementById('privateSessionLink').value = value.privateSessionLink;
	}
});

document.getElementById('privateSessionLink').addEventListener('input', function (evt) {
	chrome.storage.local.set({ privateSessionLink: document.getElementById('privateSessionLink').value});
});
