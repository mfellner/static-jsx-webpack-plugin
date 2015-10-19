var StaticJsxPlugin = require('static-jsx-webpack-plugin');

module.exports = {
  entry: './index.jsx',
  output: {
    path: 'dist',
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      loader: 'babel',
    }]
  },
  plugins: [new StaticJsxPlugin({
    scripts: [
      // some additional scripts
    ],
    styles: [
      'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.5/css/bootstrap.min.css'
    ]
  })]
}
