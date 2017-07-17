const path = require('path');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
const EXCLUDE_RX = !!process.env.EXCLUDE_RX;

const config = {
    entry: './ts/src/index.ts',
    output: {
        path: path.resolve(__dirname,'dist'),
        filename: EXCLUDE_RX ? 'crs-client.js' : 'crs-client-observable.js',
        library: 'Crs',
        libraryTarget: 'window'
    },
    resolve: {
        extensions: ['.ts', '.js']
    },

    module: {
        rules: [
            { 
                test: /\.ts$/,
                use: {
                    loader: 'awesome-typescript-loader',
                    options: {
                        configFileName: 'tsconfig.webpack.json'
                    }
                }
            }
        ]
    },
    plugins: [
        new UglifyJsPlugin({
            beautify: false, //prod
            output: {
            comments: false
            }, //prod
            mangle: {
            screw_ie8: true
            }, //prod
            compress: {
            screw_ie8: true,
            warnings: false,
            conditionals: true,
            unused: true,
            comparisons: true,
            sequences: true,
            dead_code: true,
            evaluate: true,
            if_return: true,
            join_vars: true,
            negate_iife: false // we need this for lazy v8
        },
      })
    ]
}

if (EXCLUDE_RX) {
    config.externals = {
        'rxjs/Observable': {
            window: ['Rx']
        }
    };
}

module.exports = config;