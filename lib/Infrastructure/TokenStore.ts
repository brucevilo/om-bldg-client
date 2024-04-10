const OM_TOKEN_KEY = 'om_access_token';

export function getAccessToken(): string | null {
    return localStorage.getItem(OM_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
    localStorage.setItem(OM_TOKEN_KEY, token);
}

export function deleteAccessToken(): void {
    return localStorage.removeItem(OM_TOKEN_KEY);
}
