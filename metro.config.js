// const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

// /**
//  * Metro configuration
//  * https://reactnative.dev/docs/metro
//  *
//  * @type {import('@react-native/metro-config').MetroConfig}
//  */
// const config = {};

// module.exports = mergeConfig(getDefaultConfig(__dirname), config);




const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const os = require('os');

// Temporary polyfill for Node environments where availableParallelism isn't defined
if (typeof os.availableParallelism !== 'function') {
  os.availableParallelism = () => os.cpus().length;
}

const config = {};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
