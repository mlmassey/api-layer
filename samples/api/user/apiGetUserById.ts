/* eslint-disable @typescript-eslint/no-unused-vars */
import { createGetApi } from '../../../src';
import { apiLayer } from '../apiLayer';
import { User } from './User';
import { sampleFetch } from '../../sampleFetch';

// Suggest to declare your API string as a const at the top so your back-end team can quickly modify these and scan the file
const URL = 'https://api.my-back-end.com/user';

function getUserById(id: string): Promise<User> {
  // We would typically make a back-end API call to our end-point to get the user information
  const response: User = {
    id: '123456789',
    name: 'Joe Balls',
    email: 'joe@balls.com',
  };
  return sampleFetch(`${URL}/${response.id}`, { response }).then((result) => result.json());
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
  return Promise.resolve(sampleUser);
}

// Now we create our api using api-layer's createGetApi, since this api is a GET REST call and retrieves information
// Typescript will throw an error if your function signatures do not match, and the resulting function will have all
// the same type information for arguments and return value as the actual API call.
export const apiGetUserById = createGetApi(apiLayer, getUserById, mockGetUserById);
