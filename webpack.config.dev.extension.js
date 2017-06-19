const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = function (config) {
    // TODO add webpack plugins

    config.plugins.push(new CopyWebpackPlugin([
        {
            from: 'node_modules/monaco-editor/min/vs',
            to: 'vs'
        }
    ]));

    //console.log(config);

    //config.resolve.fallback = [...config.resolve.fallback, path.resolve('src')];
    return config;
};
