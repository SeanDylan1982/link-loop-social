// src/api/api.ts

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// JWT token management
function getToken() {
  return localStorage.getItem('jwtToken');
}
function setToken(token: string) {
  localStorage.setItem('jwtToken', token);
}
function clearToken() {
  localStorage.removeItem('jwtToken');
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'API error');
  }
  return res.json();
}

// Auth
export async function login(email: string, password: string) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  return data.user;
}

export async function signup(username: string, email: string, password: string) {
  const data = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
  setToken(data.token);
  return data.user;
}

export function logout() {
  clearToken();
}

export { getToken, setToken, clearToken, request }; 