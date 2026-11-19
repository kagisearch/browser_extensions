function show(platform, enabled, directSettings = true) {
    document.body.classList.add(`platform-${platform}`);
    if (platform === 'ios' && !directSettings) {
        document.querySelectorAll('.open-preferences').forEach((button) => {
            button.firstChild.textContent = 'Open Settings ';
        });
    }
    document.body.classList.toggle('state-on', enabled === true);
    document.body.classList.toggle('state-off', enabled === false);
}

document.querySelectorAll('.open-preferences').forEach((button) => {
    button.addEventListener('click', () => {
        webkit.messageHandlers.controller.postMessage({ action: 'open-preferences' });
    });
});

document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link || !link.href.startsWith('https://')) return;
    event.preventDefault();
    webkit.messageHandlers.controller.postMessage({ action: 'open-external-link', url: link.href });
});

document.querySelector('.settings-shortcut').addEventListener('click', () => {
    webkit.messageHandlers.controller.postMessage({ action: 'open-settings' });
});
