# Example

Build and run the example:

```bash
npm install
webpack && npm run serve
```

What doesn't work:

* Different props for different entry points
* Support for CommonsChunkPlugin
* Automatic dev-server reloading (using `--inline`)
* Hot reloading (requires [babel-plugin-react-transform](https://github.com/gaearon/babel-plugin-react-transform))
