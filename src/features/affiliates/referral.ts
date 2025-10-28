export function setReferral(code: string) {
  try {
    const expires = new Date();
    expires.setDate(expires.getDate() + 90);
    document.cookie = `moon_ref=${encodeURIComponent(code)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    localStorage.setItem('moon_ref', code);
  } catch {
    // ignore storage errors
  }
}

export function getReferral(): string | null {
  try {
    const c = document.cookie.split('; ').find(r => r.startsWith('moon_ref='));
    if (c) return decodeURIComponent(c.split('=')[1]);
    return localStorage.getItem('moon_ref');
  } catch {
    return null;
  }
}

export function captureReferralFromURL() {
  const ref = new URLSearchParams(window.location.search).get('ref');
  if (ref) setReferral(ref);
}
