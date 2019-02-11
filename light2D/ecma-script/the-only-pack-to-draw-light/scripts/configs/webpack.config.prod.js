const base = require('./webpack.config');
const merge = require('webpack-merge');
const os = require('os');
const UglifyJsparallelPlugin = require('webpack-uglify-parallel');

module.exports = merge(base, {
    // production 会触发编译bug.[Cannot read property 'minify' of undefined]
    mode: 'none',
    plugins: [
        new UglifyJsparallelPlugin({
            workers: os.cpus().length,
            mangle: true,
            compressor: {
                warnings: false,
                drop_console: true,
                drop_debugger: true
            }
        })
    ]
})