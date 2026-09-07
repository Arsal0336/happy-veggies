/** API root: relative for local proxy; absolute when hosted on a separate API domain. */
const isSplitHost =
  typeof window !== 'undefined' &&
  /(?:^|\.)vtoxi\.com$/i.test(window.location.hostname);

export const API_BASE = isSplitHost
  ? 'https://hv-api.vtoxi.com/api/v1'
  : '/api/v1';
