export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | string;
  phone?: string | null;
  avatarUrl?: string | null;
  googleId?: string | null;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

const SESSION_KEY = 'lmneg_session';

export function saveSession(session: AuthSession) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new CustomEvent('lmneg-auth-change'));
}

export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed?.token || !parsed?.user?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new CustomEvent('lmneg-auth-change'));
}

export function getToken() {
  return getSession()?.token ?? null;
}

export function isLoggedIn() {
  return Boolean(getSession());
}

export function requireAuthRedirect(redirectTo?: string) {
  if (typeof window === 'undefined') return false;
  if (getSession()) return true;
  const target = redirectTo || `${window.location.pathname}${window.location.search}`;
  window.location.href = `/admin?redirect=${encodeURIComponent(target)}`;
  return false;
}

export function getRedirectTarget(fallback = '/mis-propiedades') {
  if (typeof window === 'undefined') return fallback;
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get('redirect');
  if (!redirect || !redirect.startsWith('/') || redirect.startsWith('//')) {
    return fallback;
  }
  return redirect;
}
