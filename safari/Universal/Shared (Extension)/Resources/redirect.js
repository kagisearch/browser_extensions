async function redirectSearch() {
    const query = new URL(window.location.href).searchParams.get("q");
    const message = document.getElementById("message");
    if (query === null) {
        message.textContent = "The search query is missing.";
        return;
    }

    setTimeout(() => { message.textContent = "Opening Kagi…"; }, 1500);
    window.location.replace(await kagiSearchURL(query, () => browser.tabs.getCurrent()));
}

void redirectSearch();
