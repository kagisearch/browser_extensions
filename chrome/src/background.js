let sessionToken = undefined;
let syncSessionFromExisting = true;
let sessionApiToken = undefined;
let sessionApiEngine = undefined;

function saveToken({ token, api_token, api_engine } = {}, isManual = false) {
	sessionToken = typeof token !== 'undefined' ? token : sessionToken;
	sessionApiToken =
		typeof api_token !== 'undefined' ? api_token : sessionApiToken;
	sessionApiEngine =
		typeof api_engine !== 'undefined' ? api_engine : sessionApiEngine;

	let shouldSync = !isManual;
	if (sessionToken === undefined || sessionToken.trim().length === 0) {
		shouldSync = true;
		chrome.runtime.sendMessage(
			{
				type: 'reset',
			},
			(response) => {
				if (!response)
					console.error(
						'error resetting state: ',
						chrome.runtime.lastError.message,
					);
			},
		);
	}

	syncSessionFromExisting = shouldSync;

	chrome.storage.local.set({
		session_token: token,
		sync_existing: shouldSync,
		api_token: sessionApiToken,
		api_engine: sessionApiEngine,
	});

	updateRules();

	// tell the extension popup to update the UI
	if (!shouldSync && sessionToken) {
		chrome.runtime.sendMessage(
			{
				type: 'synced',
				token: sessionToken,
				api_token: sessionApiToken,
				api_engine: sessionApiEngine,
			},
			(response) => {
				if (!response)
					console.error(
						'error setting synced: ',
						chrome.runtime.lastError.message,
					);
			},
		);
	}
}

async function summarizePage({
	token,
	url,
	summary_type,
	target_language,
	api_engine,
	api_token,
}) {
	let summary = 'Unknown error';
	let success = false;
	const useApi = Boolean(api_token);

	try {
		const requestParams = {
			url,
			summary_type,
		};

		if (target_language) {
			requestParams.target_language = target_language;
		}

		if (api_engine && useApi) {
			requestParams.engine = api_engine;
		}

		const searchParams = new URLSearchParams(requestParams);

		const requestOptions = {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: useApi ? `Bot ${api_token}` : `${token}`,
			},
			credentials: 'include',
		};

		const response = await fetch(
			`${
				useApi
					? 'https://kagi.com/api/v0/summarize'
					: 'https://kagi.com/mother/summary_labs'
			}?${searchParams.toString()}`,
			requestOptions,
		);

		if (response.status === 200) {
			const result = await response.json();

			console.debug('summarize response', result);

			if (useApi) {
				if (result.data?.output) {
					summary = result.data.output;
				} else if (result.error) {
					summary = JSON.stringify(result.error);
				}
			} else {
				summary = result?.output_text || 'Unknown error';
			}

			success = Boolean(result) && !Boolean(result.error);
		} else {
			console.error('summarize error', response.status, response.statusText);

			if (response.status === 401) {
				summary = 'Invalid Token! Please set a new one.';
			} else {
				summary = `Error: ${response.status} - ${response.statusText}`;
			}
		}
	} catch (error) {
		summary = error.message ? `Error: ${error.message}` : JSON.stringify(error);
	}

	if (summary) {
		chrome.runtime.sendMessage(
			{
				type: 'summary_finished',
				summary,
				success,
			},
			(response) => {
				if (!response)
					console.error(
						'error setting summary: ',
						chrome.runtime.lastError.message,
					);
			},
		);
	}
}

chrome.runtime.onMessage.addListener(async (data, sender, sendResponse) => {
	switch (data.type) {
		case 'get_data': {
			sendResponse({
				token: sessionToken,
				api_token: sessionApiToken,
				api_engine: sessionApiEngine,
				sync_existing: syncSessionFromExisting,
				browser: 'chrome',
			});
			break;
		}
		case 'save_token': {
			saveToken(data, true);
			break;
		}
		case 'open_extension': {
			chrome.tabs.create({
				url: `chrome://extensions/?id=${chrome.runtime.id}`,
			});
			break;
		}
		case 'summarize_page': {
			summarizePage(data);
			break;
		}
		default:
			console.debug(`Invalid type received: ${data.type}`);
			break;
	}

	sendResponse(true);
	return true;
});

/*
 * Attempts to grab sessions from existing Kagi windows.
 * This allows us to track the users last session without
 * having to force them to input it in to the extension.
 */
function checkForSession(_request) {
	if (!syncSessionFromExisting) return;

	chrome.cookies.get(
		{
			url: 'https://kagi.com',
			name: 'kagi_session',
		},
		(cookie) => {
			if (!cookie || !cookie.value) return;

			const token = cookie.value;

			if (sessionToken !== token) {
				sessionToken = token;
				saveToken({ token }, false);
			}
		},
	);
}

/*
 * Adds an Authorization header to all Kagi requests.
 * This allows us to provide authentication without having to
 * track if the user is logged in between incognito and normal windows.
 */
function updateRules() {
	if (!sessionToken) return;

	chrome.declarativeNetRequest.updateDynamicRules({
		addRules: [
			{
				id: 1,
				priority: 1,
				action: {
					type: 'modifyHeaders',
					requestHeaders: [
						{
							header: 'Authorization',
							value: sessionToken,
							operation: 'set',
						},
					],
				},
				condition: {
					urlFilter: '||kagi.com/',
					resourceTypes: ['main_frame'],
				},
			},
		],
		removeRuleIds: [1],
	});
}

chrome.webRequest.onBeforeRequest.addListener(
	checkForSession,
	{ urls: ['https://kagi.com/*'] },
	[],
);

// Set our session token if we have one saved from storage.
async function setup() {
	const sessionObject = await chrome.storage.local.get('session_token');
	if (sessionObject?.session_token) {
		sessionToken = sessionObject.session_token;
		updateRules();
	}

	const syncObject = await chrome.storage.local.get('sync_existing');
	if (typeof syncObject?.sync_existing !== 'undefined') {
		syncSessionFromExisting = syncObject.sync_existing;
	}

	const apiObject = await chrome.storage.local.get('api_token');
	if (typeof apiObject !== 'undefined') {
		sessionApiToken = apiObject.api_token;
	}

	const apiEngineObject = await chrome.storage.local.get('api_engine');
	if (typeof apiEngineObject !== 'undefined') {
		sessionApiEngine = apiEngineObject.api_engine;
	}
}

setup();
