var path = require('path');
var StaticReactSource = require('./lib/StaticReactSource');
var StaticReactError = require('./lib/StaticReactError');

/**
 * Plugin to create static HTML from JSX.
 *
 * @param {object} [props] - Component properties.
 * @param {object} [options] - Miscellaneous options.
 */
function StaticJsxPlugin(props, options) {
  this.props = typeof props === 'object' ? props : {};
  this.options = typeof options === 'object' ? options : {};
}

StaticJsxPlugin.prototype.apply = function(compiler) {
  var self = this;
  var entry = compiler.options.entry;

  if (typeof entry === 'object' && !Array.isArray(entry)) {
    entry = Object.getOwnPropertyNames(entry).map(function(p) {
      return entry[p];
    })
  }

  // Disable the plugin when hot reloading is active.
  // (Incompatible with some loaders, e.g. react-hot.)
  if ([].concat(entry).map(function(e) {
      return e.indexOf('webpack/hot') !== -1;
    }).reduce(function(prev, curr) {
      return prev || curr;
    })) {
    return;
  }

  compiler.plugin('this-compilation', function(compilation) {
    compilation.plugin('additional-chunk-assets', function additionalChunkAssets() {

      if (this.errors && this.errors.length) return this.errors;

      /**
       * Create a chunk/output name pair.
       *
       * @param  {string} entry - Chunk name or absolute path of the JSX entry.
       * @param  {string} [output] - Alternative name of the output.
       * @return {object} Pair of JSX chunk name and HTML output name.
       */
      function pair(entry, output) {
        if (path.isAbsolute(entry) && path.extname(entry) !== '.jsx') {
          throw new StaticReactError('Not a JSX file: ', entry);
        }
        return {
          chunkName: typeof entry === 'string' ? path.basename(entry, '.jsx') : entry,
          outputName: path.basename(output || entry, '.jsx') + '.html'
        }
      }

      /**
       * Create a list of entry/output pairs.
       *
       * @param  {string|Array|object} entries - Entry (entries) of the project.
       * @return {Array} List of entry/output pairs.
       */
      function getPairs(entries) {
        if (typeof entries === 'string') {
          // Project has only 1 entry.
          return [pair('main', entries)]
        } else if (Array.isArray(entries)) {
          // Project has a list of modules.
          // The last module is the one that will be exported and must be a JSX file.
          var jsxModules = compilation.modules.filter(function(mod) {
            return path.extname(mod.resource) === '.jsx'
          });
          if (jsxModules.length < 1) {
            throw new StaticReactError('No JSX module found.')
          } else if (jsxModules.length > 1) {
            console.warn('Warning: found more than 1 JSX module.')
          }
          return [pair('main', jsxModules[jsxModules.length - 1].resource)];
        } else {
          // Project has a list of named entries.
          return Object.getOwnPropertyNames(entries).map(function(name) {
            return pair(name, entries[name])
          })
        }
      }

      getPairs(compilation.compiler.options.entry).map(function(pair) {
        var chunk = compilation.namedChunks[pair.chunkName];
        if (!chunk) {
          throw new StaticReactError('No such chunk: ' + pair.chunkName);
        }

        var filePath = compilation.getPath(pair.outputName, {
          chunk: chunk
        });
        chunk.files.push(filePath);

        return {
          path: filePath,
          source: new StaticReactSource(chunk, compilation, self.props, self.options)
        };
      }).
      forEach(function(asset) {
        compilation.additionalChunkAssets.push(asset.path);
        compilation.assets[asset.path] = asset.source;
      })
    });
  });
}

module.exports = StaticJsxPlugin;
