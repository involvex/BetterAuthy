const normalizeBasePath = (value?: string) => {
  const input = (value ?? '').trim();
  if (!input) return '/';

  let path = input;
  if (!path.startsWith('/')) path = `/${path}`;
  if (!path.endsWith('/')) path = `${path}/`;
  return path;
};

const LOCATION_ORIGIN = (() => {
  if (typeof globalThis === 'undefined') return '';
  const location = (globalThis as { location?: Location }).location;
  if (!location) return '';
  return location.origin;
})();

export const BASE_PATH = normalizeBasePath(import.meta.env?.VITE_BASE_URL);
export const BASE_URL = LOCATION_ORIGIN ? `${LOCATION_ORIGIN}${BASE_PATH}` : BASE_PATH;

const trimLeadingSlash = (value: string) => value.replace(/^\/+/, '');

export function withBasePath(subpath: string) {
  const trimmed = trimLeadingSlash(subpath).trim();
  if (!trimmed) return BASE_PATH;
  return `${BASE_PATH}${trimmed}`;
}

export function withBaseUrl(subpath: string) {
  const path = withBasePath(subpath);
  if (!LOCATION_ORIGIN) return path;
  return `${LOCATION_ORIGIN}${path}`;
}
