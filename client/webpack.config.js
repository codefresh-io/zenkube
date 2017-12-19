const
    path = require('path'),
    webpack = require('webpack'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    entry: "./src/js/main.js",
    output:  {
        path: path.resolve(__dirname, 'build'),
        filename: "main.js",
        publicPath: "/"
    },
    module: {
        rules: [
            {
                test: /\.less$/,
                use: [{ loader: "style-loader" }, { loader: "css-loader" }, { loader: "less-loader", options: { strictMath: true, noIeCompat: true }}]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({ title: "Zenkube" }),
        new UglifyJSPlugin({ sourceMap: true }),
        new webpack.DefinePlugin({ "process.env.NODE_ENV": JSON.stringify('production') })
    ]
};