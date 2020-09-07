import { apiGetUserById, User } from '../api/user';
import { apiLayer } from '../api/apiLayer';
import { createMockApi, overrideApi } from '../../src';

// We are going to create 3 sample mock apis to use in our testing to test different conditions
function mockPositiveResult(id: string): Promise<User> {
  const mockUser: User = {
    id: 'mock_user',
    name: 'Mock User',
    email: 'user@mock.com',
  };
  return createMockApi(mockUser)(id);
}

function mockNegativeResult(id: string): Promise<User> {
  const mockUser: User = {
    id: 'mock_user',
    name: 'Mock User',
    email: 'user@mock.com',
  };
  return createMockApi(mockUser, 'Error result')(id);
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
const mockCallback = createMockApi(undefined, undefined, sampleCallback);

test('Using createMockApi and overrideApi', async () => {
  // Now we want to override the API to return a different result in our test case
  const removeOverride = overrideApi(apiLayer, apiGetUserById, mockPositiveResult);
  // Call our api function again to see if it is now returning the new override value
  const user = await apiGetUserById('1');
  expect(user.id).toBe('mock_user');
  // Now that we are done, we can remove the override.  This is not necessary, since later calls will replace the current override, but its a good idea
  removeOverride();
});

test('Negative test case', () => {
  // Now we want to override the API to return a different result in our test case
  overrideApi(apiLayer, apiGetUserById, mockNegativeResult);
  // Call our api function again to see if it is now returning the new override value
  return apiGetUserById('1').catch((error: string) => {
    expect(error).toBe('Error result');
  });
});

test('Using a callback function in your mock api', async () => {
  // Now we want to override the API to return a different result in our test case
  overrideApi(apiLayer, apiGetUserById, mockCallback);
  // Call our api function again to see if it is now returning the new override value
  const user = await apiGetUserById('1');
  expect(user.id).toBe('callback_user');
  expect(currentUser.id).toBe('callback_user');
});

test('Removing a previous override does nothing', async () => {
  // This will demonstrate how making multiple override calls replaces the existing override
  const user1: User = {
    id: 'user1',
    name: 'user1',
    email: 'user1',
  };
  const override1 = createMockApi(user1);
  const user2: User = {
    id: 'user2',
    name: 'user2',
    email: 'user2',
  };
  const override2 = createMockApi(user2);
  const removeOverride1 = overrideApi(apiLayer, apiGetUserById, override1);
  // We now expect our api to return the user1
  let user = await apiGetUserById('1');
  expect(user.id).toBe('user1');
  // Now lets install the second override
  const removeOverride2 = overrideApi(apiLayer, apiGetUserById, override2);
  user = await apiGetUserById('1');
  expect(user.id).toBe('user2');
  // Now, if we try to remove override1, it should do nothing, since it is no longer installed
  removeOverride1();
  user = await apiGetUserById('1');
  expect(user.id).toBe('user2');
  // If we remove override2, it should return back to the default mock implementation
  removeOverride2();
  user = await apiGetUserById('1');
  expect(user.id).toBe('1');
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
  const override = createMockApi(user1, undefined, undefined, 1000);
  overrideApi(apiLayer, apiGetUserById, override);
  const start = Date.now();
  await apiGetUserById('1');
  const finish = Date.now();
  expect(finish - start).toBeGreaterThanOrEqual(1000);
});
