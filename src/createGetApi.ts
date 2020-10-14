import { ApiType } from './types/ApiType';
import { apiLayerInstall } from './ApiLayerCommon';
import { ApiLayer } from './types/ApiLayer';

/**
 * Creates a new GET API function that wraps your provided API function to allow it be overridden.  This should be only
 * used for functions that retrieve data from your servers (do not set data), such as a REST GET or POST.
 * @param {ApiLayer} apiLayer: The ApiLayer your installing this function into
 * @param {function} apiFunction: Your asynchronous API fetching function.  Should return a Promise.
 * @param {string} mockPath: The full path to the mock data to load for the default mock response.  You should use require.resolve() to resolve the full path
 * @param {string} apiName: (optional) Unique api name you assign to this api.  If not set, it will attempt to use the function name of your api
 * @returns {ApiFunction} The API function you can call directly, just as you would the apiFunction parameter provided.
 */
export const createGetApi = <T extends Array<any>, U extends any>(
  apiLayer: ApiLayer,
  apiFunction: (...args: T) => Promise<U>,
  mockPath: string,
  apiName?: string,
) => {
  if (!apiLayer || !apiFunction || !mockPath) {
    throw new Error('Invalid empty arguments');
  }
  const name = apiName || apiFunction.name || '';
  const options = {
    type: ApiType.Get,
  };
  return apiLayerInstall(apiLayer, name, apiFunction, mockPath, options);
};
