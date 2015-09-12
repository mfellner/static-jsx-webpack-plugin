function TestModule(foo) {
  this.foo = foo;
}

TestModule.prototype.bar = function(bar) {
  return this.foo + bar;
};

module.exports = TestModule;
