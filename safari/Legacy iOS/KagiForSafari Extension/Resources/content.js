const searchQuery = navigateIfNeeded(window.location);

if (window.location.href.startsWith("https://kagi.com/")) {
	if (window.location.href.startsWith("https://kagi.com/signin") && getCookie("extRedirected") == "") {
		setCookie("extRedirected", "1");
		chrome.storage.local.get(["privateSessionLink", "lastKagiUrl"], function(value) {
			var privateSessionLink = value.privateSessionLink;
			var lastKagiUrl = value.lastKagiUrl;
			var searchQuery = getParameterByName("q", lastKagiUrl)
			if (typeof(privateSessionLink) !== "undefined" && privateSessionLink.startsWith(`https://kagi.com/`)) {
                if (privateSessionLink.includes("q=%s")) {
                    window.location.replace(privateSessionLink.replace("%s", searchQuery != null ? searchQuery : ""));
                } else {
                    window.location.replace(privateSessionLink.concat("&q=", searchQuery != null ? searchQuery : ""));
                }
			}
		});
	} else {
		setCookie("extRedirected", "");
	}
} else if (searchQuery != null) {
	if (!shouldSkipRedirect()) {
		window.location.replace(`https://kagi.com/search?q=${searchQuery}`);
	}
}

function shouldSkipRedirect(url = window.location.href) {
	var result = false;
	const host = location.host.replace("www.", "");
	if (host.includes("google.") && getParameterByName("client") == null) {
		result = true;
	} else if (host.includes("bing.") && getParameterByName("form") == null) {
		result = true;
	} else if (host.includes("duckduckgo.") && getParameterByName("t") == null) {
		result = true;
	} else if (host.includes("search.yahoo.") && getParameterByName("fr") == null) {
		result = true;
	}
	
	return result;
}

function navigateIfNeeded(location) {
	var result = null;
	const host = location.host.replace("www.", "");
	
	["google.", "bing.", "ecosia.", "search.yahoo"].forEach(function(item){
		if (host.includes(item)) {
			if (location.pathname === "/search") {
				result = getParameterByName((host.includes("search.yahoo")) ? "p" : "q");
			}
		}
	});
				
	
	if (host.startsWith("duckduckgo.")) {
		result = getParameterByName("q");
	}
				
	if (host.startsWith("yandex.")) {
		if (location.pathname === "/search/touch/") {
			result = getParameterByName("text");
		}
	}
	
	["baidu.", "so."].forEach(function(item){
		if (host.includes(item)) {
			result = getParameterByName((host.includes("baidu.")) ? "oq" : "src");
		}
	});
	
	if (host.startsWith("sogou.")) {
		if (location.pathname === "/web") {
			result = getParameterByName("query");
		}
	}
	
	return result;
}

function getParameterByName(name, url = window.location.href) {
	name = name.replace(/[\[\]]/g, '\\$&');
	var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
		results = regex.exec(url);

	if (!results) return null;
	if (!results[2]) return '';

	return results[2].replace(/\+/g, ' ');
}

function setCookie(cname, cvalue) {
	const d = new Date();
	d.setTime(d.getTime() + (5000));
	let expires = "expires="+ d.toUTCString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
		
function getCookie(cname) {
	let name = cname + "=";
	let decodedCookie = decodeURIComponent(document.cookie);
	let ca = decodedCookie.split(';');
	for(let i = 0; i <ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}
