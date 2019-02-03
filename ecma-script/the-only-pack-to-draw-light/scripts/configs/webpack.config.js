const path = require('path');
const os = require('os');
module.exports = {
    entry: {
        index: path.resolve(__dirname, '../../index.js'),
        demo: path.resolve(__dirname, '../../demo.js'),
    },
    output: {
        path: path.resolve(__dirname, '../../dist'),
        filename: '[name].min.js',
        library: 'theonlypacktodrawlight',
        libraryTarget: 'umd'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: [{
                    loader: 'babel-loader'
                }],
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
    ]
};