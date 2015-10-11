function Example(name) {
  this.name = name;
}

Example.prototype.toString = function() {
  return 'Example[' + this.name + ']';
};

module.exports = Example;
