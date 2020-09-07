/* eslint-disable @typescript-eslint/no-unused-vars */
import { createGetApi, createMockApi } from '../../../src';
import { apiLayer } from '../apiLayer';
import { User } from './User';

function getUserById(id: string): Promise<User> {
  // This API is still in development, so we only use the mock version initially and let the back-end team complete this later
  return Promise.reject('The back-end team needs to complete this function later');
}

// We create a mock version of the api call that returns a valid/good response that can be used for our testing
// purposes that developers who use this api don't have to really understand the resulting value or how it works
// Also, if we update the API call later, we can easily change this mock to match, since its in the same file
function mockGetUserById(id: string): Promise<User> {
  const sampleUser: User = {
    id: '1',
    name: 'Test User',
    email: 'test@test.com',
  };
  const mock = createMockApi({ result: sampleUser });
  return mock();
}

// Now we create our api using api-layer's createGetApi, since this api is a GET REST call and retrieves information
// Typescript will throw an error if your function signatures do not match, and the resulting function will have all
// the same type information for arguments and return value as the actual API call.
// Since this is an early/tbd version, we use the mock version for the real api.
export const apiGetUserById = createGetApi(apiLayer, mockGetUserById, mockGetUserById);
