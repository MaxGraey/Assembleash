const path = require('path');

module.exports = function (config) {
    // TODO add webpack plugins

    config.resolve.fallback = [...config.resolve.fallback, path.resolve('src')];
    return config;
};
