const esbuild = require('esbuild');

const isProduction = process.argv.includes('--production');
const isWatch = process.argv.includes('--watch');

let buildingCount = 0;
const esbuildProblemMatcherPlugin = {
  name: 'esbuild-problem-matcher',
  setup(build) {
    build.onStart(() => {
      if (buildingCount === 0) {
        console.log('[watch] build started');
      }
      buildingCount++;
    });
    build.onEnd((result) => {
      result.errors.forEach(({ text, location }) => {
        console.error(`✘ [ERROR] ${text}`);
        if (location) console.error(`    ${location.file}:${location.line}:${location.column}:`);
      });
      buildingCount = Math.max(0, buildingCount - 1);
      if (buildingCount === 0) {
        console.log('[watch] build finished');
      }
    });
  },
};

const fs = require('fs');
const path = require('path');

function copyWasmFiles() {
  const targetDir = path.join(__dirname, 'dist', 'wasm');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const mainWasm = path.join(__dirname, 'node_modules', 'web-tree-sitter', 'tree-sitter.wasm');
  if (fs.existsSync(mainWasm)) {
    fs.copyFileSync(mainWasm, path.join(targetDir, 'tree-sitter.wasm'));
  }

  const wasmsDir = path.join(__dirname, 'node_modules', 'tree-sitter-wasms', 'out');
  if (fs.existsSync(wasmsDir)) {
    const files = fs.readdirSync(wasmsDir);
    for (const file of files) {
      if (file.endsWith('.wasm')) {
        fs.copyFileSync(path.join(wasmsDir, file), path.join(targetDir, file));
      }
    }
  }
}

/** @type {import('esbuild').BuildOptions[]} */
const buildConfigs = [
  // 1. Extension Host (Node / CJS)
  {
    entryPoints: ['src/infrastructure/extension.ts'],
    bundle: true,
    format: 'cjs',
    minify: isProduction,
    sourcemap: !isProduction,
    sourcesContent: false,
    platform: 'node',
    outfile: 'dist/extension.js',
    external: ['vscode'],
    logLevel: 'silent',
    plugins: isWatch ? [esbuildProblemMatcherPlugin] : [],
  },
  // 2. Webview Client Application (Browser / IIFE)
  {
    entryPoints: ['src/webview/app/WebviewApp.ts'],
    bundle: true,
    format: 'iife',
    minify: isProduction,
    sourcemap: !isProduction,
    sourcesContent: false,
    platform: 'browser',
    outfile: 'dist/webview.js',
    logLevel: 'silent',
    plugins: isWatch ? [esbuildProblemMatcherPlugin] : [],
  },
  // 3. Test Runner Bundle (Node)
  {
    entryPoints: ['test/runTests.ts'],
    bundle: true,
    format: 'cjs',
    sourcemap: true,
    platform: 'node',
    outfile: 'dist/test.js',
    external: ['vscode'],
    logLevel: 'silent',
    plugins: isWatch ? [esbuildProblemMatcherPlugin] : [],
  }
];

async function main() {
  try {
    copyWasmFiles();
    if (isWatch) {
      console.log('Starting watch mode...');
      const contexts = await Promise.all(buildConfigs.map(cfg => esbuild.context(cfg)));
      await Promise.all(contexts.map(ctx => ctx.watch()));
    } else {
      console.log('Building extension and webview bundles...');
      await Promise.all(buildConfigs.map(cfg => esbuild.build(cfg)));
      console.log('Build complete.');
    }
  } catch (err) {
    console.error('Build failed:', err);
    process.exit(1);
  }
}

main();
