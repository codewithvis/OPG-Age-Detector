const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Optimization: Ignore very long paths in node_modules that cause Windows watcher crashes
config.resolver.blockList = [
  /node_modules\/.*\/node_modules\/@react-native\/codegen\/.*/,
  /\.expo\/.*/,
];

module.exports = config;
