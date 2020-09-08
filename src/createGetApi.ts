import { ApiType } from './types/ApiType';
import { apiLayerInstall, ApiLayer } from './ApiLayer';

/**
 * Creates a new GET API function that wraps your provided API function to allow it be overridden.  This should be only
 * used for functions that retrieve data from your servers (do not set data), such as a REST GET or POST.
 * @param {ApiLayer} apiLayer: The ApiLayer your installing this function into
 * @param {function} apiFunction: Your asynchronous API fetching function.  Should return a Promise.
 * @param {function} mock: The mock implementation of this function.  This should always return a positive/valid response
 * @param {string} apiName: (optional) Provide a name to identify this api with.  The resulting function has its apiName member set with this
 * @returns {ApiFunction} The API function you can call directly, just as you would the apiFunction parameter provided.
 */
export const createGetApi = <T extends Array<any>, U extends any>(
  apiLayer: ApiLayer,
  apiFunction: (...args: T) => Promise<U>,
  mock: (...args: T) => Promise<U>,
  apiName?: string,
) => {
  if (!apiLayer || !apiFunction || !mock) {
    throw new Error('Invalid empty arguments');
  }
  const name = apiName || apiFunction.name || '';
  const options = {
    type: ApiType.Get,
  };
  return apiLayerInstall(apiLayer, name, apiFunction, mock, options);
};
