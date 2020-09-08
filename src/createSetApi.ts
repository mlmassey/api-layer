import { ApiType } from './types/ApiType';
import { apiLayerInstall } from './ApiLayerCommon';
import { ApiFunction } from './types/ApiFunction';
import { ApiLayer } from './types/ApiLayer';

/**
 * Creates a new SET API function that wraps your provided API function to allow it be overridden.  This should be
 * used for functions that send data to your servers, such as a REST PUT/POST/DELETE.  You need to make sure to provide
 * a list of any ApiFunction that retrieves the same data that this function sets to ensure their cache is invalidated.
 * @param {ApiLayer} apiLayer: The ApiLayer your installing this function into
 * @param {function} apiFunction: Your asynchronous API setting function.  Should return a Promise.
 * @param {function} mock: The mock implementation of this function.  This should always return a positive/valid response
 * @param {Array<ApiFunction>} invalidates: An array of ApiFunctions this SET API would invalidate once the data is sent. Even if you're not
 *  using client-side caching, it is good to set these to build a relationship between APIs that work on related data.
 * @param {string} apiName: (optional) Provide a name to identify this api with.  The resulting function has its apiName member set with this
 * @returns {ApiFunction} The API function you can call directly, just as you would the apiFunction parameter provided.
 */
export const createSetApi = <T extends Array<any>, U extends any>(
  apiLayer: ApiLayer,
  apiFunction: (...args: T) => Promise<U>,
  mock: (...args: T) => Promise<U>,
  invalidates?: ApiFunction | Array<ApiFunction>,
  apiName?: string,
) => {
  if (!apiLayer || !apiFunction || !mock) {
    throw new Error('Invalid empty arguments');
  }
  const name = apiName || apiFunction.name || '';
  let invalids: Array<ApiFunction> = [];
  if (Array.isArray(invalidates)) {
    invalids = invalids.concat(invalidates);
  } else if (invalidates) {
    invalids.push(invalidates);
  }
  const options = {
    type: ApiType.Set,
    invalidates: invalids,
  };
  return apiLayerInstall(apiLayer, name, apiFunction, mock, options);
};
