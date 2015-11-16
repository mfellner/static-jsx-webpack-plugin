# Example

Build and run the example:

```bash
npm install
npm run build && npm run serve
```

**Warning:** babel might pick up a .babelrc file from a parent directory.
Configuring babel presets in both webpack.config.js and .babelrc breaks things.
In that case comment out or remove one or the other.

What doesn't work:

* Different props for different entry points
* Support for CommonsChunkPlugin
* Automatic dev-server reloading (using `--inline`)
* Hot reloading (requires [babel-plugin-react-transform](https://github.com/gaearon/babel-plugin-react-transform))
