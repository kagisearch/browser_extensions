import { fetchSettings, getActiveTab } from './lib/utils.js';

if (!globalThis.browser) {
  globalThis.browser = chrome;
}

let summaryTextContents = '';

async function setup() {
  const loadingElement = document.querySelector('#loading');
  if (!loadingElement) {
    console.error('Could not find loading div');
    return;
  }

  const summaryResultElement = document.querySelector('#summary_result');
  if (!summaryResultElement) {
    console.error('Could not find summarize result div');
    return;
  }

  summaryResultElement.style.display = 'none';
  summaryResultElement.classList.remove('error');

  const copySummaryElement = document.querySelector('#copy_summary');
  if (!copySummaryElement) {
    console.error('Could not find copy summary button');
    return;
  }

  copySummaryElement.style.display = 'none';

  copySummaryElement.addEventListener('click', async () => {
    if (!summaryTextContents) {
      return;
    }

    try {
      await navigator.clipboard.writeText(summaryTextContents);

      copySummaryElement.innerText = 'Copied!';

      setTimeout(() => {
        copySummaryElement.innerText = 'Copy summary';
      }, 3000);
    } catch (error) {
      console.error('error copying summary to clipboard: ', error);
    }
  });

  browser.runtime.onMessage.addListener(async (data) => {
    const searchParams = new URLSearchParams(window.location.search);
    const url = searchParams.get('url');

    if (data.type === 'summary_finished' && data.url === url) {
      loadingElement.style.display = 'none';

      if (data.success) {
        summaryResultElement.classList.remove('error');
        summaryTextContents = new DOMParser().parseFromString(
          data.summary.replaceAll(/<br>/g, '\n'),
          'text/html',
        ).documentElement.textContent;
        copySummaryElement.style.display = '';
      } else {
        summaryResultElement.classList.add('error');
        summaryTextContents = '';
        copySummaryElement.style.display = 'none';
      }

      summaryResultElement.style.display = '';
      summaryResultElement.innerText = summaryTextContents;
    }
  });

  async function requestPageSummary() {
    const hasTabAccess = await browser.permissions.contains({
      permissions: ['activeTab'],
    });

    if (!hasTabAccess) {
      summaryResultElement.style.display = '';
      summaryResultElement.classList.add('error');
      summaryResultElement.innerText =
        "You can't summarize without allowing access to the currently active tab.";
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);

    // If there's no URL, get the currently active tab and default params
    if (!searchParams.get('url')) {
      searchParams.set('summary_type', 'summary');
      searchParams.set('target_language', '');

      const tab = await getActiveTab(true);

      if (!tab) {
        console.error('No tab/url found.');
        return;
      }

      searchParams.set('url', tab.url);

      // Add ?url=<tab.url> to the window, so it receives the proper summary
      const popupUrl = new URL(window.location.href);
      popupUrl.searchParams.set('url', tab.url);
      window.history.replaceState(null, '', popupUrl.toString());

      const { token, api_token, api_engine, summary_type, target_language } =
        await fetchSettings();

      if (token) {
        searchParams.set('token', token);
      }
      if (api_token) {
        searchParams.set('api_token', api_token);
      }
      if (api_engine) {
        searchParams.set('api_engine', api_engine);
      }
      if (summary_type) {
        searchParams.set('summary_type', summary_type);
      }
      if (target_language) {
        searchParams.set('target_language', target_language);
      }
    }

    loadingElement.style.display = '';
    summaryResultElement.classList.remove('error');
    summaryResultElement.style.display = '';
    summaryResultElement.innerHTML = 'Summarizing...';
    copySummaryElement.style.display = 'none';
    summaryTextContents = '';

    await browser.runtime.sendMessage({
      type: 'summarize_page',
      ...Object.fromEntries(searchParams),
    });
  }

  await requestPageSummary();
}

document.addEventListener('DOMContentLoaded', setup);
