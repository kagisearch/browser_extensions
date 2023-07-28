import { updateSettings } from './lib/utils.js';

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
    if (data.type === 'summary_finished') {
      loadingElement.style.display = 'none';

      if (data.success) {
        summaryResultElement.classList.remove('error');
        summaryTextContents = data.summary;
        copySummaryElement.style.display = '';
      } else {
        summaryResultElement.classList.add('error');
        summaryTextContents = '';
        copySummaryElement.style.display = 'none';
      }

      summaryResultElement.style.display = '';
      summaryResultElement.innerHTML = data.summary.replaceAll(/\n/g, '<br />');
    }
  });

  async function requestPageSummary() {
    const searchParams = new URLSearchParams(window.location.search);

    // If there's no URL, get the currently active tab and default params
    if (!searchParams.get('url')) {
      searchParams.set('summary_type', 'summary');
      searchParams.set('target_language', '');

      const tabs = await browser.tabs.query({ active: true });

      // Chrome/Firefox might give us more than one active tab when something like "chrome://*" or "about:*" is also open
      const tab =
        tabs.find(
          (tab) =>
            tab?.url?.startsWith('http://') || tab?.url?.startsWith('https://'),
        ) || tabs[0];

      if (!tab) {
        console.error('No tab/url found.');
        console.error(tabs);
        return;
      }

      searchParams.set('url', url);

      await updateSettings(async function handleGetData({
        token,
        api_token,
        api_engine,
      } = {}) {
        if (token) {
          searchParams.set('token', token);
        }
        if (api_token) {
          searchParams.set('api_token', api_token);
        }
        if (api_engine) {
          searchParams.set('api_engine', api_engine);
        }
      });
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
