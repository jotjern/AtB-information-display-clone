const TEN_YEARS_IN_SECONDS = 60 * 60 * 24 * 365 * 10;

export function getCookie(name: string): string | null {
  const prefix = `${encodeURIComponent(name)}=`;
  const cookie = document.cookie
    .split("; ")
    .find(cookie => cookie.startsWith(prefix));
  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
}

export function setCookie(name: string, value: string) {
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; max-age=${TEN_YEARS_IN_SECONDS}; SameSite=Lax`;
}
