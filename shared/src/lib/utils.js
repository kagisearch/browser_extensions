export async function summarizeContent({
  url,
  text,
  summary_type,
  target_language,
  api_engine,
  token,
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

    if (useApi) {
      if (api_engine) {
        requestParams.engine = api_engine;
      }

      if (text) {
        requestParams.text = text;
        requestParams.url = undefined;
      }
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

  return {
    summary,
    success,
  };
}
