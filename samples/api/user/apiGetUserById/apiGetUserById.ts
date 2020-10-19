/* eslint-disable @typescript-eslint/no-unused-vars */
import { createGetApi } from '../../../../src';
import { User } from '../User';
import { sampleFetch } from '../../../sampleFetch';

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

// Now we create our api using api-layer's createGetApi, since this api is a GET REST call and retrieves information
// Typescript will throw an error if your function signatures do not match, and the resulting function will have all
// the same type information for arguments and return value as the actual API call.
export const apiGetUserById = createGetApi(getUserById, 'user/apiGetUserById/apiGetUserById.mock.js');
