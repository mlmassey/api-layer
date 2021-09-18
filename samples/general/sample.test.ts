import { apiGetUserById, apiSetUser, apiDeleteUser } from '../api/';

test('Sample usage of api-layer user apis', async () => {
  const user = await apiGetUserById('1');
  // Now we change the user information
  user.email = 'new_email@email.com';
  await apiSetUser(user);
  // Finally we delete this user
  await apiDeleteUser(user.id);
});
