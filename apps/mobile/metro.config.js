const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Let Metro watch the entire monorepo so it can resolve packages/ symlinks
// that pnpm creates outside of apps/mobile/node_modules.
config.watchFolders = [monorepoRoot];

// Look for node_modules in the mobile project first, then fall back to the
// monorepo root (where pnpm hoists shared workspace dependencies).
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

module.exports = config;
