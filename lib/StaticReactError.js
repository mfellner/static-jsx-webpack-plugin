function StaticReactError(message) {
  this.name = 'StaticReactError';
  this.message = message || '';
}

StaticReactError.prototype = Object.create(Error.prototype);

module.exports = StaticReactError;
