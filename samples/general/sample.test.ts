import '../api/testApiLayer';
import { apiGetUserById, apiGetUserIdByUsername, apiSetUser, apiDeleteUser } from '../api/user';

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
