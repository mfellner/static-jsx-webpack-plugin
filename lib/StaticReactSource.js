var vm = require('vm');
var path = require('path');
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
  this.externals = compilation.compiler.options.externals || {};

  if (!this.props.scripts) this.props.scripts = [];

  var chunkScripts = sourceChunk.files.filter(function(file) {
    return path.extname(file) === '.js';
  });

  this.props.scripts = this.props.scripts.concat(chunkScripts);
}

StaticReactSource.prototype = Object.create(Source.prototype);
StaticReactSource.prototype.constructor = StaticReactSource;

StaticReactSource.prototype.source = function() {
  var self = this;

  /**
   * Compile the source chunk to a vm.Script.
   * @return {Script} Compiled script.
   */
  function compile() {
    var source = self.compilation.mainTemplate
                     .render(self.compilation.hash,
                             self.sourceChunk,
                             self.compilation.moduleTemplate,
                             self.compilation.dependencyTemplates);

    return new vm.Script(source.source(), {
      filename: self.sourceModule.request,
      displayErrors: true
    });
  }

  /**
   * Create a new vm.Context.
   * @return {Context} Contextified sandbox.
   */
  function createContext() {
    var sandbox = Object.keys(self.externals).reduce(function(obj, k) {
      obj[self.externals[k]] = require(k);
      return obj;
    }, {});

    return vm.createContext(sandbox);
  }

  var script = compile();
  var context = createContext();
  var reactClass = script.runInContext(context);
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
