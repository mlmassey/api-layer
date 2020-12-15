/* eslint-disable @typescript-eslint/no-unused-vars */
import { createGetApi, getMockResult } from '../../../../src';
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

// In this example, we are going to create a mock function instead of providing a path.  This is convenient if you want to
// do complex things for your result
// NOTE: This is not recommended because the code will always be present, even in your production bundle. This is not
// really a problem, but should be noted.
function mockGetUserById(id: string): Promise<User> {
  // For this mock, if the user id === "1", we return one value, otherwise we return a different value
  if (id === '1') {
    return getMockResult('user/apiGetUserById/apiGetUserById.mock.js').then((res: any) => res(id));
  }
  return getMockResult('user/apiGetUserById/differentTestUser.mock.js').then((res: any) => res(id));
}

// Now we create our api using api-layer's createGetApi, since this api is a GET REST call and retrieves information
// Typescript will throw an error if your function signatures do not match, and the resulting function will have all
// the same type information for arguments and return value as the actual API call.
export const apiGetUserByIdFunction = createGetApi(getUserById, mockGetUserById);
