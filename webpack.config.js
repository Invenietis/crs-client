module.exports = {
    entry: './ts/src/index.ts',
    output: {
        filename: 'crs-client.js',
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
