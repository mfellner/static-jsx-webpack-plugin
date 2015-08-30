var vm = require('vm');
var React = require('react');
var Source = require('webpack/lib/Source');

/**
 * Webpack source for React JSX.
 * @class
 * @augments Source
 * @param {Module} sourceModule
 * @param {Chunk} sourceChunk
 * @param {Compilation} compilation
 * @param {object} props - Properties for the React component.
 * @param {object} options - Options for the Source object.
 */
function StaticReactSource(sourceModule, sourceChunk, compilation, props, options) {
  this.sourceModule = sourceModule;
  this.sourceChunk = sourceChunk;
  this.compilation = compilation;
  this.props = props || {};
  this.options = options || {};

  if (!this.props.scripts) this.props.scripts = [];

  var outputFilename = compilation.options.output.filename;
  if (this.props.scripts.indexOf(outputFilename) === -1) {
    this.props.scripts.push(outputFilename);
  }
}

StaticReactSource.prototype = Object.create(Source.prototype);
StaticReactSource.prototype.constructor = StaticReactSource;

StaticReactSource.prototype.source = function() {
  var self = this;
  var installedModules = {};

  /**
   * Recursively resolve webpack modules using 'eval'.
   * @param  {number} moduleId - ID of the webpack module.
   * @return {*} Resolved module exports.
   */
  function __webpack_require__(moduleId) {
    // Check if module is in cache
    if (installedModules[moduleId]) {
      return installedModules[moduleId].exports;
    }

    var __sourceModule;
    if (typeof moduleId === 'number') {
      __sourceModule = self.compilation.modules.filter(function(m) {
        return m.id === moduleId;
      })[0];
    } else {
      __sourceModule = moduleId;
    }

    if (!__sourceModule) return;

    if (typeof __sourceModule.context === 'string' && (
        __sourceModule.context.indexOf('webpack-dev-server/client') !== -1 ||
        __sourceModule.context.indexOf('webpack/hot') !== -1)) {
      return;
    }

    var module = installedModules[moduleId] = {};
    var exports = module.exports = {};
    eval(__sourceModule.source(null, {}).source());
    return module.exports;
  }

  __webpack_require__.p = self.compilation.options.output.publicPath || '';

  /**
   * Evaluate a module in a sandboxed contxt.
   * @param  {Module} sourceModule
   * @return {*} Resolved module exports.
   */
  function evaluate(sourceModule) {
    var sandbox = {};
    sandbox.module = {};
    sandbox.exports = sandbox.module.exports = {};
    sandbox.__webpack_require__ = __webpack_require__;
    sandbox.global = sandbox;

    var externals = self.compilation.compiler.options.externals;

    Object.keys(externals || {}).forEach(function(k) {
      var external = externals[k];
      sandbox[external] = require(k);
    });

    var options = {
      filename: sourceModule.request,
      displayErrors: true
    };

    var source = sourceModule.source(null, {}).source();
    var script = new vm.Script(source, options);
    script.runInNewContext(sandbox, options);
    return sandbox.module.exports;
  }

  var reactClass = evaluate(self.sourceModule);
  var Component = React.createFactory(reactClass);
  var html = React.renderToStaticMarkup(Component(self.props));
  var beautify = self.options.beautify;

  if (beautify) {
    // js-beautify is an optional dependency.
    var htmlBeautify = require('js-beautify').html;

    if (typeof beautify === 'object') {
      html = htmlBeautify(html, beautify);
    } else {
      html = htmlBeautify(html);
    }
  }
  return html;
};

module.exports = StaticReactSource;
