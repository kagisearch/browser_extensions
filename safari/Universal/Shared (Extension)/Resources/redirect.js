async function redirectSearch() {
    const query = new URL(window.location.href).searchParams.get("q");
    if (query === null) {
        document.getElementById("message").textContent = "The search query is missing.";
        return;
    }

    const destination = new URL("https://kagi.com/search");
    try {
        // This page runs in the target tab, even when the background is asleep.
        // Never attach a private token unless Safari identifies this tab as private.
        const tab = await browser.tabs.getCurrent();
        if (tab?.incognito === true) {
            const prefs = await browser.storage.local.get("kagiPrivateSessionLink");
            const link = typeof prefs.kagiPrivateSessionLink === "string" ? prefs.kagiPrivateSessionLink.trim() : "";
            if (link) {
                const session = new URL(link);
                if (session.origin === "https://kagi.com" && session.pathname === "/search" &&
                    !session.username && !session.password && session.searchParams.get("token")) {
                    destination.searchParams.set("token", session.searchParams.get("token"));
                }
            }
        }
    } catch {
        // Missing settings or tab information must not strand the search page.
        // Fall back to normal Kagi authentication without exposing a token.
    }
    // Preserve the query exactly, including spaces and literal plus signs.
    const separator = destination.search ? "&" : "?";
    window.location.replace(`${destination.href}${separator}q=${encodeURIComponent(query)}`);
}

void redirectSearch();
