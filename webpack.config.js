const path = require('path');

const config = {
    entry: './ts/src/index.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'crs-client.js',
        library: 'Crs',
        libraryTarget: 'window'
    },
    resolve: {
        extensions: ['.ts', '.js']
    },

    module: {
        rules: [{
            test: /\.ts$/,
            use: {
                loader: 'awesome-typescript-loader',
                options: {
                    configFileName: 'tsconfig.webpack.json'
                }
            }
        }]
    },
    plugins: [
    ]
}

module.exports = config;