function show(platform, enabled, useSettingsInsteadOfPreferences) {
    document.body.classList.add(`platform-${platform}`);

//    if (useSettingsInsteadOfPreferences) {
//        document.getElementsByClassName('platform-mac state-on')[0].innerText = "Kagi Search for Safari’s extension is currently on. You can turn it off in the Extensions section of Safari Settings.";
//        document.getElementsByClassName('platform-mac state-off')[0].innerText = "Kagi Search for Safari’s extension is currently off. You can turn it on in the Extensions section of Safari Settings.";
//        document.getElementsByClassName('platform-mac state-unknown')[0].innerText = "You can turn on Kagi Search for Safari’s extension in the Extensions section of Safari Settings.";
//        document.getElementsByClassName('platform-mac open-preferences')[0].innerText = "Quit and Open Safari Settings…";
//    }

    if (typeof enabled === "boolean") {
        document.body.classList.toggle(`state-on`, enabled);
        document.body.classList.toggle(`state-off`, !enabled);
    } else {
        document.body.classList.remove(`state-on`);
        document.body.classList.remove(`state-off`);
    }
}

function addEngineListener() {
    const engineSelect = document.getElementById('engine-select');
    engineSelect.addEventListener('change', () => {
        const index = engineSelect.selectedIndex;
        const newEngine = engineSelect.options[index].value;
        updateUIForEngine(newEngine);
        webkit.messageHandlers.controller.postMessage({"action": "engine-changed", "newEngine": newEngine});
    });
}

function addPrivateSessionLinkListener() {
    const privateSessionInput = document.getElementById('private-session-link');
    privateSessionInput.addEventListener('change', () => {
        const newLink = privateSessionInput.value;
        webkit.messageHandlers.controller.postMessage({"action": "private-session-link-changed", "newLink": newLink});
    });
}

function updateUIForEngine(newEngine) {
    if (newEngine == "All") {
        document.querySelector('#engines').classList.toggle(`allEngines`, true);
    } else {
        document.querySelector('#engines').classList.toggle(`allEngines`, false);
    }
    setTimeout(function(){
        updateWindowSizeToMatchWebviewContentSize();
    }, 500);
}

function selectCurrentEngine(currentEngine) {
    const engineSelect = document.getElementById('engine-select');
    engineSelect.selectedIndex = Array.from(engineSelect.options).indexOf(engineSelect.namedItem(currentEngine));
    updateUIForEngine(currentEngine);
}

function setCurrentPrivateSessionLink(currentLink) {
    const privateSessionInput = document.getElementById('private-session-link');
    privateSessionInput.value = currentLink;
}

function openPreferences() {
    webkit.messageHandlers.controller.postMessage({"action": "open-preferences"});
}

function syncWithSafari() {
    webkit.messageHandlers.controller.postMessage({"action": "sync-with-safari"});
    document.querySelector("button.sync-with-safari").innerText = "Syncing…";
}

function cachePrescreenshotSize() {
    webkit.messageHandlers.controller.postMessage({
        "action": "cache-prescreenshot-size"
    });
}

function updateWindowSizeToCachedSize() {
    webkit.messageHandlers.controller.postMessage({
        "action": "update-window-size",
        "useCachedSize": true
    });
}

function updateWindowSizeToMatchWebviewContentSize() {
    var newWidth = 0
    let lightbox = document.querySelector(".basicLightbox");
    if (lightbox != null && !lightbox.classList.contains("closing")) {
        newWidth = Math.max(800, lightbox.getBoundingClientRect().width);
    }
    webkit.messageHandlers.controller.postMessage({
        "action": "update-window-size",
        "newHeight": document.getElementById("wrapper").getBoundingClientRect().height,
        "newWidth": newWidth
    });
}

// Returns true if an external link or screenshot link is detected. Prevents in-app webview from opening links.
function handleLinkElement(el) {
    if (el.href.startsWith("http")) {
        webkit.messageHandlers.controller.postMessage({"action": "open-external-link", "url": el.href });
        return true
    } else if (el.classList.contains("screenshot")) {
        let screenshotHref = el.href;
        cachePrescreenshotSize();
        var imageHTML = '<img width="800" src="' + screenshotHref + '">';
        if (el.classList.contains("multi-image")) {
            let images = el.getAttribute("data-images").split(",");
            let imageWidth = 300;
            let containerWidth = (images.length * (imageWidth + 12)) // 300px width, ~12px buffer between each
            imageHTML = '<div class="modal" style="width: ' + containerWidth + 'px;">';
            for (imageHref in images) {
                imageHTML += '<img width="' + imageWidth + '" src="' + images[imageHref] + '">';
            }
            imageHTML += '</div>';
        }
        basicLightbox.create(imageHTML, {
            onClose: (instance) => {
                instance.element().classList.add("closing");
                document.body.classList.toggle(`lightbox-open`, false);
                webkit.messageHandlers.controller.postMessage({"action": "toggle-statusbar", "isVisible": true });
                updateWindowSizeToCachedSize();
            },
            onShow: (instance) => {
                document.body.classList.toggle(`lightbox-open`, true);
                webkit.messageHandlers.controller.postMessage({"action": "toggle-statusbar", "isVisible": false });
            }
        }).show();
        setTimeout(function(){
            updateWindowSizeToMatchWebviewContentSize();
        }, 50);
        return true
    }
    return false
}

document.querySelectorAll("button.open-preferences, a.open-preferences").forEach(function(el){el.addEventListener("click", openPreferences);});
//document.querySelector("button.sync-with-safari").addEventListener("click", syncWithSafari);

document.onclick = function (e) {
  e = e ||  window.event;
  var element = e.target || e.srcElement;

  if (element.tagName == 'A') {
      if (handleLinkElement(element)) { return false; }
  } else if (element.parentElement.tagName == 'A') {
      if (handleLinkElement(element.parentElement)) { return false; }
  }
};
