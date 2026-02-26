// Override global fetch on the client to centrally handle 401/suspended cases.
const SUSPENDED_MESSAGE = 'Your account has been suspended.';

if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input, init) => {
    try {
      const res = await originalFetch(input, init);
      if (res.status === 401) {
        let data = {};
        try {
          data = await res.clone().json();
        } catch (e) {
          // ignore parse errors
        }

        const message = data?.message || data?.error?.message || '';
        const code = data?.error?.code || data?.code;

        if (message === SUSPENDED_MESSAGE || code === 'ACCOUNT_SUSPENDED') {
          window.location.replace('/account/suspended');
        } else {
          const next = window.location.pathname + window.location.search;
          window.location.replace(`/login?next=${encodeURIComponent(next)}`);
        }

        return Promise.reject(new Error(message || 'Unauthorized'));
      }
      return res;
    } catch (err) {
      // network or other errors - rethrow to preserve original behavior
      throw err;
    }
  };
}
