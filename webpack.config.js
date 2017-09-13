module.exports = {
    //context: __dirname + '/src',
    devtool: 'inline-source-map',

    entry: './client/index.js',

    output: {
        filename: 'bundle.js',
        chunkFilename: '[name].chunk.js',
        path: __dirname + '/dist',
        publicPath: "/dist/",
    },

    resolve: {
        extensions: ['.js', '.json'],
    },

    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loaders: ["babel-loader"],
            },
        ],
    },

    devServer: {
        port: 8080,
    },
};
