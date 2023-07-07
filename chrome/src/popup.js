let summaryTextContents = '';

function setStatus(type) {
	const eNoSession = document.querySelector('#no_session');
	const eManualToken = document.querySelector('#manual_token');
	const eAutoToken = document.querySelector('#auto_token');

	switch (type) {
		case 'no_session': {
			eNoSession.style.display = '';
			eManualToken.style.display = 'none';
			eAutoToken.style.display = 'none';
			break;
		}
		case 'manual_token': {
			eNoSession.style.display = 'none';
			eManualToken.style.display = '';
			eAutoToken.style.display = 'none';
			break;
		}
		case 'auto_token': {
			eNoSession.style.display = 'none';
			eManualToken.style.display = 'none';
			eAutoToken.style.display = '';
			break;
		}
		default:
			break;
	}
}

async function setup() {
	const eTokenDiv = document.querySelector('#token');
	if (!eTokenDiv) {
		console.error('Could not find token div');
		return;
	}

	const eTokenInput = document.querySelector('#token_input');
	if (!eTokenInput) {
		console.error('Could not set token because no input exists');
		return;
	}

	eTokenInput.addEventListener('focus', (e) => {
		e.target.select();
	});

	eTokenInput.addEventListener('click', () =>
		this.value ? this.setSelectionRange(0, this.value.length) : null,
	);

	const eApiTokenInput = document.querySelector('#api_token_input');
	if (!eApiTokenInput) {
		console.error('Could not set API token because no input exists');
		return;
	}

	eApiTokenInput.addEventListener('focus', (e) => {
		e.target.select();
	});

	eApiTokenInput.addEventListener('click', () =>
		this.value ? this.setSelectionRange(0, this.value.length) : null,
	);

	const eApiEngineSelect = document.querySelector('#engine');
	if (!eApiEngineSelect) {
		console.error('Could not set API engine because no select exists');
		return;
	}

	const eStatus = document.querySelector('#status');

	const eAdvanced = document.querySelector('#advanced');
	if (!eAdvanced) {
		console.error('Could not find advanced toggle');
		return;
	}

	const eSummarize = document.querySelector('#summarize');
	if (!eSummarize) {
		console.error('Could not find summarize section');
		return;
	}

	const eSummarizePage = document.querySelector('#summarize_page');
	if (!eSummarizePage) {
		console.error('Could not find summarize page button');
		return;
	}

	const eSummaryResult = document.querySelector('#summary_result');
	if (!eSummaryResult) {
		console.error('Could not find summarize result div');
		return;
	}

	eSummaryResult.style.display = 'none';
	eSummaryResult.classList.remove('error');

	const eCopySummary = document.querySelector('#copy_summary');
	if (!eCopySummary) {
		console.error('Could not find copy summary button');
		return;
	}

	eCopySummary.style.display = 'none';

	const eApiParams = document.querySelectorAll('.api_param');
	if (!eApiParams.length) {
		console.error('Could not find api param divs');
		return;
	}

	eApiParams.forEach((element) => {
		element.style.display = 'none';
	});

	async function handleGetData({
		token,
		api_token,
		sync_existing,
		api_engine,
		browser,
	} = {}) {
		if (token && eStatus) {
			eStatus.classList.remove('status_error');
			eStatus.classList.add('status_good');

			eTokenInput.value = token;
			eApiTokenInput.value = api_token;

			if (sync_existing) {
				setStatus('auto_token');
			} else {
				setStatus('manual_token');
			}

			if (api_token) {
				eApiParams.forEach((element) => {
					element.style.display = '';
				});
			}

			if (api_engine) {
				eApiEngineSelect.value = api_engine;
			}

			chrome.extension.isAllowedIncognitoAccess().then((isAllowedAccess) => {
				if (isAllowedAccess) return;

				const eIncognito = document.querySelector('#incognito');
				if (!eIncognito) {
					console.error('No div to place text?');
					return;
				}

				eIncognito.style.display = '';

				// NOTE: slight little hack to make the chrome://extensions link not be blocked.
				if (browser === 'chrome') {
					const eChromeLink = document.querySelector('#chrome_link');
					if (eChromeLink) {
						eChromeLink.addEventListener('click', async () => {
							chrome.runtime.sendMessage(
								{ type: 'open_extension' },
								(response) => {
									if (!response)
										console.error(
											'error opening extension: ',
											chrome.runtime.lastError.message,
										);
								},
							);
						});
					}
				}
			});
		}
	}

	try {
		chrome.runtime.sendMessage({ type: 'get_data' }, (response) => {
			if (!response) return;

			handleGetData(response);
		});
	} catch (error) {
		// Sometimes the background/popup communication fails, but we can still get local info
		const sessionObject = await chrome.storage.local.get('session_token');
		const syncObject = await chrome.storage.local.get('sync_existing');
		const apiObject = await chrome.storage.local.get('api_token');
		const apiEngineObject = await chrome.storage.local.get('api_engine');

		handleGetData({
			token: sessionObject?.session_token,
			sync_existing:
				typeof syncObject?.sync_existing !== 'undefined' ? syncObject : true,
			api_token: apiObject?.api_token,
			api_engine: apiEngineObject?.api_engine,
			browser: 'chrome',
		});
	}

	const eSaveToken = document.querySelector('#token_save');
	if (!eSaveToken) {
		console.error('Could not find save tokens button');
		return;
	}

	eSaveToken.addEventListener('click', async () => {
		const eToken = document.querySelector('#token_input');
		if (!eToken) {
			console.error('No token input found.');
			return;
		}

		let token = eToken.value;

		if (token.startsWith('https://kagi.com')) {
			const url = new URL(token);
			token = url.searchParams.get('token');

			if (token) eToken.value = token;
		}

		const eApiToken = document.querySelector('#api_token_input');
		if (!eApiToken) {
			console.error('No API token input found.');
			return;
		}

		const api_token = eApiToken.value;

		const eApiEngine = document.querySelector('#engine');
		if (!eApiEngine) {
			console.error('No API engine select found.');
			return;
		}

		const api_engine = eApiEngine.value;

		eSaveToken.innerText = 'Saving...';

		chrome.runtime.sendMessage(
			{ type: 'save_token', token, api_token, api_engine },
			(response) => {
				if (!response)
					console.error(
						'error saving token: ',
						chrome.runtime.lastError.message,
					);
			},
		);
	});

	eAdvanced.addEventListener('click', async () => {
		if (eTokenDiv.style.display === '') {
			eAdvanced.innerHTML = 'Advanced settings';
			eTokenDiv.style.display = 'none';
			eSummarize.style.display = '';
		} else {
			eAdvanced.innerHTML = 'Hide advanced settings';
			eTokenDiv.style.display = '';
			eSummarize.style.display = 'none';
			eSummaryResult.style.display = 'none';
			eCopySummary.style.display = 'none';
		}
	});

	eSummarizePage.addEventListener('click', async () => {
		const eSummaryType = document.querySelector('#summary_type');
		if (!eSummaryType) {
			console.error('No summary type select found.');
			return;
		}

		const eTargetLanguage = document.querySelector('#target_language');
		if (!eTargetLanguage) {
			console.error('No target language select found.');
			return;
		}

		const eEngine = document.querySelector('#engine');
		if (!eEngine) {
			console.error('No engine select found.');
			return;
		}

		const eApiToken = document.querySelector('#api_token_input');
		if (!eApiToken) {
			console.error('No API token input found.');
			return;
		}

		chrome.tabs.query({ active: true }, (tabs) => {
			// Chrome might give us more than one active tab when something like "chrome://*" is also open
			const tab =
				tabs.find(
					(tab) =>
						tab.url.startsWith('http://') || tab.url.startsWith('https://'),
				) || tabs[0];

			const { url } = tab;

			eSummaryResult.classList.remove('error');
			eSummaryResult.style.display = '';
			eSummaryResult.innerHTML = 'Summarizing...';
			eCopySummary.style.display = 'none';
			summaryTextContents = '';

			chrome.runtime.sendMessage(
				{
					type: 'summarize_page',
					url,
					summary_type: eSummaryType.value,
					target_language: eTargetLanguage.value,
					token: eTokenInput.value,
					api_token: eApiToken.value,
					api_engine: eEngine.value,
				},
				(response) => {
					if (!response)
						console.error(
							'error summarizing: ',
							chrome.runtime.lastError.message,
						);
				},
			);
		});
	});

	eCopySummary.addEventListener('click', async () => {
		if (!summaryTextContents) {
			return;
		}

		try {
			await navigator.clipboard.writeText(summaryTextContents);

			eCopySummary.innerText = 'Copied!';

			setTimeout(() => {
				eCopySummary.innerText = 'Copy summary';
			}, 3000);
		} catch (error) {
			console.error('error copying summary to clipboard: ', error);
		}
	});

	let savingButtonTextTimeout = undefined;

	chrome.runtime.onMessage.addListener(async (data, sender, sendResponse) => {
		if (data.type === 'synced') {
			setStatus('manual_token');
			eStatus.classList.add('status_good');
			eStatus.classList.remove('status_error');
			eSaveToken.innerText = 'Saved!';

			if (savingButtonTextTimeout) {
				clearTimeout(savingButtonTextTimeout);
			}

			savingButtonTextTimeout = setTimeout(() => {
				eSaveToken.innerText = 'Save settings';
			}, 2000);

			if (eTokenDiv.style.display === 'none') {
				if (data.token) {
					eSummarize.style.display = '';
				} else {
					eSummarize.style.display = 'none';
				}
			}

			if (data.api_token) {
				eApiParams.forEach((element) => {
					element.style.display = '';
				});
			} else {
				eApiParams.forEach((element) => {
					element.style.display = 'none';
				});
			}
		} else if (data.type === 'reset') {
			setStatus('no_session');
			eStatus.classList.remove('status_good');
			eStatus.classList.add('status_error');
			eTokenDiv.style.display = 'none';
			eAdvanced.style.display = '';
		} else if (data.type === 'summary_finished') {
			if (data.success) {
				eSummaryResult.classList.remove('error');
				summaryTextContents = data.summary;
				eCopySummary.style.display = '';
			} else {
				eSummaryResult.classList.add('error');
				summaryTextContents = '';
				eCopySummary.style.display = 'none';
			}
			eSummaryResult.style.display = '';
			eSummaryResult.innerHTML = data.summary.replaceAll(/\n/g, '<br />');
		} else if (data.type === 'summarize_page') {
			eSummarizePage.dispatchEvent('click');
		}

		sendResponse(true);
		return true;
	});
}

document.addEventListener('DOMContentLoaded', setup);
