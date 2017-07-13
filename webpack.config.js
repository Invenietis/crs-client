const EXCLUDE_RX = !!process.env.EXCLUDE_RX;

const config = {
    entry: './ts/src/index.ts',
    output: {
        filename: EXCLUDE_RX ? 'crs-client.js' : 'crs-client-observable.js',
        library: 'Crs',
        libraryTarget: 'umd'
    },
    resolve: {
        extensions: ['.ts', '.js']
    },

    module: {
        rules: [
            { test: /\.ts$/, loader: 'ts-loader' }
        ]
    }
}

if (EXCLUDE_RX) {
    config.externals = {
        'rxjs/Observable': {
            root: ['Rx', 'Observable'],
            global: ['Rx', 'Observable'],
            commonjs2: 'rxjs/Observable',
            commonjs: 'rxjs/Observable'
        }
    };
}

module.exports = config;