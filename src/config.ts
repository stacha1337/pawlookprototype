/**
 * Build-time configuration.
 *
 * `__PAWLOOK_API_URL__` is injected by esbuild (see build.mjs) from the
 * `PAWLOOK_API_URL` environment variable at build time. This is just the
 * PUBLIC URL of the backend endpoint (e.g. https://your-app.vercel.app/api/generate)
 * — never a secret — so it's safe to bake into the frontend bundle that
 * ships to GitHub Pages.
 */
declare const __PAWLOOK_API_URL__: string;

export const API_URL: string =
  typeof __PAWLOOK_API_URL__ !== 'undefined' ? __PAWLOOK_API_URL__ : '';
