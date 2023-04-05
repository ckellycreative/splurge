var HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader'
            },
            {
                test: /\.(woff|woff2|ttf|eot)$/,
                use: 'file-loader'
            },
            {
                test: /\.svg$/,
                loader: 'svg-inline-loader'
            },            
            {
              test: /\.(scss)$/,
              use: [{
                // inject CSS to page
                loader: 'style-loader'
              }, {
                // translates CSS into CommonJS modules
                loader: 'css-loader'
              }, {
                // Run postcss actions
                loader: 'postcss-loader',
                options: {
                  // `postcssOptions` is needed for postcss 8.x;
                  // if you use postcss 7.x skip the key
                  postcssOptions: {
                    // postcss plugins, can be exported to postcss.config.js
                    plugins: function () {
                      return [
                        require('precss'),
                        require('autoprefixer')
                      ];
                    }
                  }
                }
              }, {
                // compiles Sass to CSS
                loader: 'sass-loader'
              }]
           }
        ]
    },
    resolve: {
        mainFiles: ['index', 'Index'],
        extensions: ['.js', '.jsx', 'scss'],
        alias: {
            '@': path.resolve(__dirname, 'src/'),
        }
    },
    plugins: [new HtmlWebpackPlugin({
        template: './src/index.html'
    })],
    devServer: {
        historyApiFallback: true
    },
    externals: {
        // global app config object
        config: JSON.stringify({
            apiUrl: 'http://localhost:4000/api'
        })
    }
}