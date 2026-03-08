const DEFAULT_GOOGLE_CLIENT_ID =
  '613086116653-v1e3ajri9st764pudl04ffo4f066s50s.apps.googleusercontent.com';

const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

let scriptPromise;

function getClientId() {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID;
}

function loadGoogleScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Sign-In is only available in browser.'));
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Google script.')));
      return;
    }

    const script = document.createElement('script');
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google script.'));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export async function requestGoogleIdToken() {
  const clientId = getClientId();
  if (!clientId) {
    throw new Error('Google Client ID is missing. Set VITE_GOOGLE_CLIENT_ID.');
  }

  await loadGoogleScript();

  if (!window.google?.accounts?.id) {
    throw new Error('Google Sign-In SDK not available.');
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    const timeoutId = setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error('Google sign-in timed out. Please try again.'));
      }
    }, 15000);

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (settled) return;
        clearTimeout(timeoutId);
        settled = true;
        if (response?.credential) {
          resolve(response.credential);
          return;
        }
        reject(new Error('Google did not return an ID token.'));
      },
      ux_mode: 'popup',
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    window.google.accounts.id.prompt((notification) => {
      if (settled) return;
      if (
        notification.isNotDisplayed() ||
        notification.isSkippedMoment() ||
        notification.isDismissedMoment()
      ) {
        clearTimeout(timeoutId);
        settled = true;
        reject(new Error('Google sign-in was cancelled or blocked.'));
      }
    });
  });
}

