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

  function createContext(moduleId) {
    var m = installedModules[moduleId] = {};
    var e = m.exports = {};
    var sandbox = {module: m, exports: e};
    sandbox.__webpack_require__ = __webpack_require__;
    sandbox.global = sandbox;

    var externals = self.compilation.compiler.options.externals;
    Object.keys(externals || {}).forEach(function(k) {
      var external = externals[k];
      sandbox[external] = require(k);
    });

    return vm.createContext(sandbox);
  }

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

    var sourceModule;
    if (typeof moduleId === 'number') {
      sourceModule = self.compilation.modules.filter(function(m) {
        return m.id === moduleId;
      })[0];
    } else {
      sourceModule = moduleId;
    }

    if (!sourceModule) return;

    if (typeof sourceModule.context === 'string' && (
        sourceModule.context.indexOf('webpack-dev-server/client') !== -1 ||
        sourceModule.context.indexOf('webpack/hot') !== -1)) {
      return;
    }

    var context = createContext(moduleId);
    var code = sourceModule.source(null, {}).source();
    // HACK: instanceof does not work across multiple contexts
    if (sourceModule.request.indexOf('react/lib/keyMirror.js') !== -1) {
      code = code.replace(/obj\ instanceof\ Object/g, "typeof obj === 'object'");
    }

    var options = {filename: sourceModule.request, displayErrors: true};
    vm.runInContext(code, context, options);
    return context.module.exports;

    // 'eval' does not see the externals
    // var module = installedModules[moduleId] = {};
    // var exports = module.exports = {};
    // eval(sourceModule.source(null, {}).source());
    // return module.exports;
  }

  __webpack_require__.p = self.compilation.options.output.publicPath || '';

  /**
   * Evaluate a module in a sandboxed contxt.
   * @param  {Module} sourceModule
   * @return {*} Resolved module exports.
   */
  function evaluate(sourceModule) {
    var context = createContext(0);
    var code = sourceModule.source(null, {}).source();
    var options = {filename: sourceModule.request, displayErrors: true};
    vm.runInContext(code, context, options);
    return context.module.exports;
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
