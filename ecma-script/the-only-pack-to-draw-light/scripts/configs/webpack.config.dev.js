const base = require('./webpack.config');
const merge = require('webpack-merge');

module.exports = merge(base, {
    mode: 'development'
});