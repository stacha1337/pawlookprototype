import * as esbuild from 'esbuild';
import { cpSync, mkdirSync } from 'fs';

const watch = process.argv.includes('--watch');

mkdirSync('dist', { recursive: true });
cpSync('public/index.html', 'dist/index.html');
cpSync('public/styles.css', 'dist/styles.css');

// PAWLOOK_API_URL is the PUBLIC URL of the backend endpoint
// (e.g. https://your-app.vercel.app/api/generate). It is NOT a secret —
// it's just baked into the bundle so the static frontend knows where to
// send requests. The actual Gemini API key lives only in the backend's
// environment variables and is never referenced here.
const apiUrl = process.env.PAWLOOK_API_URL || '';
if (!apiUrl) {
  console.warn(
    '[build] WARNING: PAWLOOK_API_URL is not set. The built app will not be able to reach the AI backend.\n' +
      '         Set it before building, e.g.: PAWLOOK_API_URL=https://your-app.vercel.app/api/generate npm run build'
  );
}

const options = {
  entryPoints: ['src/main.tsx'],
  bundle: true,
  outfile: 'dist/bundle.js',
  format: 'esm',
  jsx: 'automatic',
  loader: { '.tsx': 'tsx', '.ts': 'ts' },
  sourcemap: true,
  minify: false,
  target: ['es2020'],
  logLevel: 'info',
  define: {
    __PAWLOOK_API_URL__: JSON.stringify(apiUrl),
  },
};

if (watch) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  console.log('Watching for changes...');
} else {
  await esbuild.build(options);
  console.log('Build complete.');
}
