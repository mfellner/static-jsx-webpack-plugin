/**
 * A basic Javascript class that can be used as
 * a classical webpack entry point.
 */
function Example(name) {
  this.name = name;
}

Example.prototype.toString = function() {
  return 'Example[' + this.name + ']';
};

module.exports = Example;
