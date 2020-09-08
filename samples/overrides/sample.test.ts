/* eslint-disable @typescript-eslint/no-unused-vars */
import { apiGetUserById, User } from '../api/user';
import { overrideApi } from '../../src';

test('Overriding an API to alter functionality', async () => {
  // Now we want to override the API to return a different result in our test case
  let logoutUser = false;
  const override = (id: string): Promise<User> => {
    if (logoutUser) {
      return Promise.reject('User has been logged out');
    }
    return Promise.resolve({
      id: 'test',
      name: 'test',
      email: 'test',
    });
  };
  // Call our API and see the result
  let user = await apiGetUserById('1');
  expect(user.id).toBe('1');
  // Now install our override
  overrideApi(apiGetUserById, override);
  user = await apiGetUserById('1');
  expect(user.id).toBe('test');
  // Now lets log the user out
  logoutUser = true;
  expect.assertions(3);
  return expect(apiGetUserById('1')).rejects.toMatch('User has been logged out');
});
