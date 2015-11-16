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
      query: {
        presets: ['es2015', 'react']
      }
    }]
  },
  plugins: [new StaticJsxPlugin({
    // These are the props that will be passed into the index.jsx component.
    title: 'My little example',
    scripts: [
      // Here you can add some additional scripts (e.g. externals).
      // The output chunk file (bundle.js) will be added by the plugin.
    ],
    styles: [
      'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.5/css/bootstrap.min.css'
    ]
  })]
}
