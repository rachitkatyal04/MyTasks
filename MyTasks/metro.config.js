const { getDefaultConfig } = require("@expo/metro-config");

const defaultConfig = getDefaultConfig(__dirname);

// Add support for .cjs files (required for Firebase)
defaultConfig.resolver.sourceExts.push("cjs");

// Disable package exports support to fix Firebase compatibility
defaultConfig.resolver.unstable_enablePackageExports = false;

module.exports = defaultConfig;
