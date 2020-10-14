import { createSetApi } from '../../../src';
import { apiLayer } from '../apiLayer';
import { sampleFetch } from '../../sampleFetch';
import { apiGetUserById } from './apiGetUserById';
import { apiGetUserIdByUsername } from './apiGetUserIdByUsername';

// Suggest to declare your API string as a const at the top so your back-end team can quickly modify these and scan the file
const URL = 'https://api.my-back-end.com/user';

function deleteUser(id: string): Promise<boolean> {
  // We are going to make a DELETE api call to our back-end to update the user information.  Since DELETE calls change
  // information on the server, it is considered a SET api call
  return sampleFetch(`${URL}/${id}`, {
    method: 'DELETE',
  }).then(() => {
    return true;
  });
}
// Now we create our api using api-layer's createSetApi
// Typescript will throw an error if your function signatures do not match, and the resulting function will have all
// the same type information for arguments and return value as the actual API call.
// NOTE: We specify which GET api calls will be invalidated by changing this user to clear any cached information
// that they may have.
export const apiDeleteUser = createSetApi(apiLayer, deleteUser, require.resolve('./mock/mockDeleteUser.js'), [
  apiGetUserById,
  apiGetUserIdByUsername,
]);
