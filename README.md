# Static JSX webpack plugin [![Build Status](https://travis-ci.org/mfellner/static-jsx-webpack-plugin.svg?branch=master)](https://travis-ci.org/mfellner/static-jsx-webpack-plugin) [![npm](https://img.shields.io/npm/v/static-jsx-webpack-plugin.svg)](https://www.npmjs.com/package/static-jsx-webpack-plugin)

Use React JSX as entrypoints in webpack and render them to static HTML!

Inspired by:

* https://github.com/unbroken-dome/indexhtml-webpack-plugin
* https://github.com/markdalgleish/react-to-html-webpack-plugin
* https://github.com/markdalgleish/static-site-generator-webpack-plugin

### Usage

**webpack.config.js**

```javascript
var StaticJsxPlugin = require('static-jsx-webpack-plugin');

module.exports = {
  target: 'web',
  entry: './index.jsx',
  output: {
    path: 'dist',
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      test: /\.(js|jsx)$/,     // You're gonna need a JSX loader.
      exclude: /node_modules/, // Babel (babeljs.io) is recommended.
      loader: 'babel',
    }]
  },
  plugins: [new StaticJsxPlugin()]
}
```

**Configuration**

```javascript
new StaticJsxPlugin(
  'main',       // Name of the entrypoint.
  'index.html', // Name of the output file.
  {
    title: 'Hello world' // Properties for the React component.
  },
  {
    beautify: true // Optional, requires js-beautify. You can
  })               // also pass an object with js-beautify options.
```
