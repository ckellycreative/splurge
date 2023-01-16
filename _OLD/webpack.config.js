const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.js$|jsx/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'svg-url-loader',
            options: {
              limit: 10000,
            },
          },
        ],
      },      
      
    ]
  },
devServer: {
   proxy: {
      '/api/**': {
        target: 'http://localhost:4000',
        pathRewrite: { '^/api': '' },
        changeOrigin: true,
        secure: false,
      }
    },
    historyApiFallback: true,
   contentBase: './',
   hot: true,
},
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src', 'index.html')
    })
  ]
};