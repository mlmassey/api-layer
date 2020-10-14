/* eslint-disable @typescript-eslint/no-unused-vars */
import { createGetApi } from '../../../src';
import { apiLayer } from '../apiLayer';
import { User } from './User';

function getUserById(id: string): Promise<User> {
  // This API is still in development, so we only use the mock version initially and let the back-end team complete this later
  return Promise.reject('The back-end team needs to complete this function later');
}

// Now we create our api using api-layer's createGetApi, since this api is a GET REST call and retrieves information
// Typescript will throw an error if your function signatures do not match, and the resulting function will have all
// the same type information for arguments and return value as the actual API call.
// Since this is an early/tbd version, we use the mock version for the real api.
export const apiGetUserById = createGetApi(apiLayer, getUserById, require.resolve('./mock/mockGetUserById.js'));
