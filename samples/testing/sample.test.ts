/* eslint-disable @typescript-eslint/no-unused-vars */
import { apiGetUserById, User } from '../api/';
import { callApiFunction, createMockFunction, overrideApi } from '../../src';

// We are going to create 3 sample mock apis to use in our testing to test different conditions
function mockPositiveResult(id: string): Promise<User> {
  const mockUser: User = {
    id: 'mock_user',
    name: 'Mock User',
    email: 'user@mock.com',
  };
  return createMockFunction(mockUser)(id);
}

function mockNegativeResult(id: string): Promise<User> {
  const mockUser: User = {
    id: 'mock_user',
    name: 'Mock User',
    email: 'user@mock.com',
  };
  return createMockFunction(mockUser, 'Error result')(id);
}

let currentUser: User;
function sampleCallback(id: string): Promise<User> {
  // This demonstrates using a callback function to perform additional work than simply returning a result
  currentUser = {
    id: 'callback_user',
    name: 'Callback User',
    email: 'user@callback.com',
  };
  return Promise.resolve(currentUser);
}
const mockCallback = createMockFunction(undefined, undefined, sampleCallback);

test('Using createMockApi and overrideApi', async () => {
  // Now we want to override the API to return a different result in our test case
  const removeOverride = overrideApi(apiGetUserById, mockPositiveResult);
  // Call our api function again to see if it is now returning the new override value
  const user = await apiGetUserById('1');
  expect(user.id).toBe('mock_user');
  // Now that we are done, we can remove the override.  This is not necessary, since later calls will replace the current override, but its a good idea
  removeOverride();
});

test('Negative test case', () => {
  // Now we want to override the API to return a negative result in our test case
  overrideApi(apiGetUserById, mockNegativeResult);
  // Call our api function again to see if it is now returning the new override value
  return apiGetUserById('1').catch((error: string) => {
    expect(error).toBe('Error result');
  });
});

test('Using a callback function in your mock api', async () => {
  overrideApi(apiGetUserById, mockCallback);
  // Call our api function again to see if it is now returning the new overridden value
  const user = await apiGetUserById('1');
  expect(user.id).toBe('callback_user');
  expect(currentUser.id).toBe('callback_user');
});

test('Setting a delay on your mock apis', async () => {
  // You can insert artificial delay in your mock apis to more closely simulate network environments and test loading conditions
  // The ApiLayer can be created with a default delay, or each api can set its own delay
  const user1: User = {
    id: 'user1',
    name: 'user1',
    email: 'user1',
  };
  // Lets create an override with a 1000 millisecond delay
  const override = createMockFunction(user1, undefined, undefined, 1000);
  overrideApi(apiGetUserById, override);
  const start = Date.now();
  await apiGetUserById('1');
  const finish = Date.now();
  expect(finish - start).toBeGreaterThanOrEqual(1000);
});

test('Use callApiFunction to alter an existing api', async () => {
  const override = (id: string) => {
    return callApiFunction(apiGetUserById, { noOverride: true, noMock: true })(id).then((user: User) => {
      // Lets change the users name
      user.name = 'Override User';
      return user;
    });
  };
  // We will install this override, which is basically the same as calling the original api, but we get to change the
  // result before its returned to the caller
  overrideApi(apiGetUserById, override);
  const user = await apiGetUserById('1');
  expect(user.name).toBe('Override User');
});
