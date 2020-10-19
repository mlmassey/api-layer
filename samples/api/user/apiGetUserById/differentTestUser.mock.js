// We want to provide a different test user as an alternate mock implementation of this function
module.exports = function mockGetUserById() {
  const sampleUser = {
    id: '1',
    name: 'Alternate Test User',
    email: 'alternate@test.com',
  };
  return sampleUser;
};
