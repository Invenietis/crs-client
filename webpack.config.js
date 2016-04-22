module.exports = {  
    output: {
        filename: 'ck-crs.js',
        library: 'CRS'
    },
  
    devtool: 'source-map',
    resolve: {
        extensions: ['', '.webpack.js', '.web.js',  '.js']
    },
    module: {
        // loaders: [
        //     { test: /\.ts(x?)$/ }
        // ]
    }
}