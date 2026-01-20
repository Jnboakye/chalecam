const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Fix for Firebase Auth "Component auth has not been registered yet" error
// Firebase Auth uses .cjs files that need to be included in the bundle
config.resolver.sourceExts.push('cjs');
// Disable package exports to ensure Firebase modules are properly resolved
config.resolver.unstable_enablePackageExports = false;

module.exports = withNativeWind(config, { input: './global.css' });

