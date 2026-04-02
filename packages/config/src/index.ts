let _apiBaseUrl = '';

export function setApiBaseUrl(url: string) {
  _apiBaseUrl = url;
}

export function getApiBaseUrl(): string {
  return _apiBaseUrl;
}

export const TOKEN_KEY = 'dayla_auth_token';
