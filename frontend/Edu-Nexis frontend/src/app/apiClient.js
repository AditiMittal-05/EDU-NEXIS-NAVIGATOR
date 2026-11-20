const AI_API_BASE = 'http://127.0.0.1:8000';

export async function authFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${AI_API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // Response Interceptor: Auto-logout on expired/invalid JWT
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = '/login';
    throw new Error('Session expired. Redirecting to login...');
  }

  return response;
}