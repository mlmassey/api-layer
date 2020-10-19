module.exports = function mockPromise(input) {
  return Promise.resolve(`${input} mock promise`);
};
