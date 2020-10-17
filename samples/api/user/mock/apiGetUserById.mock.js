// We create a mock version of the api call that returns a valid/good response that can be used for our testing
// purposes that developers who use this api don't have to really understand the resulting value or how it works
// Also, if we update the API call later, we can easily change this mock to match, since its in the same file
module.exports = function mockGetUserById() {
  const sampleUser = {
    id: '1',
    name: 'Test User',
    email: 'test@test.com',
  };
  return sampleUser;
};
