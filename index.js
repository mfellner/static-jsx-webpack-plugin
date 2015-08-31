var StaticReactSource = require('./lib/StaticReactSource');

/**
 * Plugin to create static HTML from JSX.
 *
 * @param {(string|object)} source|props - Name of the source chunk / Component properties.
 * @param {(string|object)} target|options - Name of the target file / Options.
 * @param {object} [props] - Component properties.
 * @param {object} [options] - Options.
 */
function StaticJsxPlugin(source, target, props, options) {
  this.sourceName = typeof source === 'string' ? source : 'main';
  this.targetName = typeof target === 'string' ? target : 'index.html';
  props = props || arguments[0];
  options = options || arguments[1];
  this.props = typeof props === 'object' ? props : {};
  this.options = typeof options === 'object' ? options : {};
}

StaticJsxPlugin.prototype.apply = function(compiler) {
  var self = this;

  // Disable the plugin when hot reloading is active.
  // (Incompatible with some loaders, e.g. react-hot.)
  if ([].concat(compiler.options.entry).map(function(e) {
      return e.indexOf('webpack/hot') !== -1;
    }).reduce(function(prev, curr) {
      return prev || curr;
    })) {
    return;
  }

  compiler.plugin('this-compilation', function(compilation) {
    compilation.plugin('additional-chunk-assets', function additionalChunkAssets() {

      if (this.errors && this.errors.length) return this.errors;

      var sourceChunk = this.namedChunks[self.sourceName];

      if (!sourceChunk) throw new Error('no such chunk: ' + self.sourceName);

      var sourceModule = sourceChunk.origins[0].module;
      var filePath = this.getPath(self.targetName, {
        chunk: sourceChunk
      });

      this.additionalChunkAssets.push(filePath);
      this.assets[filePath] = new StaticReactSource(sourceModule, sourceChunk, this, self.props, self.options);
      sourceChunk.files.push(filePath);
    });
  });
}

module.exports = StaticJsxPlugin;
