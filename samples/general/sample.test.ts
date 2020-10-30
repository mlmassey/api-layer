import '../api/testApiLayer';
import { apiGetUserById, apiGetUserIdByUsername, apiSetUser, apiDeleteUser } from '../api/user';
import { apiGetUserByIdFunction } from '../api/user/apiGetUserById/apiGetUserByIdFunction';

test('Sample usage of ApiLayer user apis', async () => {
  const user = await apiGetUserById('1');
  const id = await apiGetUserIdByUsername(user.name);
  expect(id === user.id).toBe(true);
  // Now we change the user information
  user.email = 'new_email@email.com';
  await apiSetUser(user);
  // Finally we delete this user
  await apiDeleteUser(user.id);
});

test('Using a function for a mock', async () => {
  // In some scenarios, you want to do some more elaborate processing for your mock result when creating your api.
  // A good example of this would be to return a different result based on the input argument to your mock function
  // This example shows using the getMockResult to load different scenarios based on the input
  // NOTE: Your mock function code will be included in your final production bundle, even though it is never called/used
  // This is the reason that using a path (instead of a function) is preferred.
  let user = await apiGetUserByIdFunction('1');
  expect(user.email).toBe('test@test.com');
  user = await apiGetUserByIdFunction('2');
  expect(user.email).toBe('alternate@test.com');
});
