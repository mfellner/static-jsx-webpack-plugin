var vm = require('vm');
var path = require('path');
var React = require('react');
var ReactDOMServer = require('react-dom/server');
var Source = require('webpack/lib/Source');

/**
 * Webpack source for React JSX.
 * @class
 * @augments Source
 * @param {Chunk} sourceChunk
 * @param {Compilation} compilation
 * @param {object} props - Properties for the React component.
 * @param {object} options - Options for the Source object.
 */
function StaticReactSource(sourceChunk, compilation, props, options) {
  this.sourceChunk = sourceChunk;
  this.compilation = compilation;
  this.props = Object.freeze(props || {});
  this.options = Object.freeze(options || {});
  this.externals = Object.freeze(compilation.compiler.options.externals || {});
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

  var props = (function() {
    function copy(obj) {
      return Object.getOwnPropertyNames(self.props)
        .reduce(function(obj, key) {
          var val = self.props[key];
          if (Array.isArray(val)) {
            obj[key] = val.slice();
          } else if (typeof val === 'object') {
            obj[key] = copy(val);
          } else {
            obj[key] = val;
          }
          return obj;
        }, {});
    }

    var props = copy(self.props);
    props.scripts = Array.isArray(props.scripts) ? props.scripts : [];
    props.scripts = props.scripts.concat(self.sourceChunk.files.filter(function(file) {
      return path.extname(file) === '.js';
    }));

    return props;
  }());

  var script = compile();
  var context = createContext();
  var reactClass = script.runInContext(context);
  var Component = React.createFactory(reactClass);
  var html = ReactDOMServer.renderToStaticMarkup(Component(props));
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
