export function getAuthToken() {
  return localStorage.getItem("nexora_auth_token");
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function clearAuth() {
  localStorage.removeItem("nexora_auth_token");
  localStorage.removeItem("nexora_logged_in");
  localStorage.removeItem("nexora_user");
}
