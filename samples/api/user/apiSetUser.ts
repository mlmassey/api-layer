import { createSetApi } from '../../../src';
import { apiLayer } from '../apiLayer';
import { User } from './User';
import { sampleFetch } from '../../sampleFetch';
import { apiGetUserById } from './apiGetUserById';
import { apiGetUserIdByUsername } from './apiGetUserIdByUsername';

// Suggest to declare your API string as a const at the top so your back-end team can quickly modify these and scan the file
const URL = 'https://api.my-back-end.com/user';

function setUser(user: User): Promise<User> {
  // We are going to make a POST api call to our back-end to update the user information, which is typical for a SET api call
  return sampleFetch(`${URL}/${user.id}`, {
    method: 'POST',
    body: JSON.stringify(user),
    response: user,
  }).then((response) => response.json());
}

// Now we create our api using api-layer's createSetApi, since this api is a POST REST call and saves information
// Typescript will throw an error if your function signatures do not match, and the resulting function will have all
// the same type information for arguments and return value as the actual API call.
// NOTE: We specify which GET api calls will be invalidated by changing this user to clear any cached information
// that they may have.
export const apiSetUser = createSetApi(apiLayer, setUser, require.resolve('./mock/mockSetUser.js'), [
  apiGetUserById,
  apiGetUserIdByUsername,
]);
