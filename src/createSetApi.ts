/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prefer-const */
import { ApiType } from './types/ApiType';
import { ApiFunction } from './types/ApiFunction';
import { ApiLayer } from './types/ApiLayer';
import {
  getApiCallFunction,
  apiLayerOverride,
  apiLayerRemoveOverride,
  getApiUniqueId,
  isApiLayerFunction,
} from './ApiLayerCommon';

/**
 * Creates a new SET API function that wraps your provided API function to allow it be overridden.  This should be
 * used for functions that send data to your servers, such as a REST PUT/POST/DELETE.  You need to make sure to provide
 * a list of any ApiFunction that retrieves the same data that this function sets to ensure their cache is invalidated.
 * @param {function} apiFunction: Your asynchronous API setting function.  Should return a Promise.
 * @param {string} mockPath: The path to the mock data to load for the default mock response.  This should be relative to the path set in your MockResolver
 *    installed in your ApiLayer.
 * @param {Array<ApiFunction>} invalidates: (optional) An array of ApiFunctions this SET API would invalidate once the data is sent. Even if you're not
 *  using client-side caching, it is good to set these to build a relationship between APIs that work on related data.
 * @param {string} apiName: (optional) Provide a name to identify this api with.  The resulting function has its apiName member set with this
 * @param {ApiLayer} apiLayer: (optional) The ApiLayer your installing this function into.  If not set, the globally installed ApiLayer is used.  This
 *    is typically used only for testing purposes.
 * @returns {ApiFunction} The API function you can call directly, just as you would the apiFunction parameter provided.
 */
export const createSetApi = <T extends Array<any>, U extends any>(
  apiFunction: (...args: T) => Promise<U>,
  mockPath: string,
  invalidates?: ApiFunction | Array<ApiFunction> | undefined,
  apiName?: string,
  apiLayer?: ApiLayer,
) => {
  if (!apiFunction) {
    throw new Error('Invalid empty arguments');
  }
  if (isApiLayerFunction(apiFunction)) {
    throw new Error('apiFunction cannot be an existing ApiFunction');
  }
  if (!mockPath) {
    throw new Error(
      'It is required that you provide the path to the mock implementation.  This mock should return a typical/positive result',
    );
  }
  const name = apiName || apiFunction.name || '';
  const uniqueId = getApiUniqueId(name);
  let clear: () => void = () => {};
  const type = typeof apiFunction;
  if ((type === 'function' || type === 'object') && typeof (apiFunction as any).clear === 'function') {
    clear = (apiFunction as any).clear;
  }
  let invalids: Array<ApiFunction> = [];
  if (Array.isArray(invalidates)) {
    invalids = invalids.concat(invalidates);
  } else if (invalidates) {
    invalids.push(invalidates);
  }
  let newApi: any;
  const override = (overrideFunc: (...args: T) => Promise<U>) => {
    apiLayerOverride(newApi, overrideFunc, apiLayer);
  };
  const clearOverride = (overrideFunc: (...args: T) => Promise<U>) => {
    apiLayerRemoveOverride(newApi, overrideFunc, apiLayer);
  };
  const apiLayerFunc = (...args: T): Promise<U> => {
    return new Promise((resolve, reject) => {
      const callFunc = getApiCallFunction(apiFunction, newApi, true, undefined, apiLayer);
      callFunc(...args)
        .then((result: any) => {
          // We need to invalidate all the apis that are specified to this function
          if (invalids && invalids.length) {
            invalids.forEach((getApi: ApiFunction) => {
              if (getApi.clear) {
                getApi.clear();
              }
            });
          }
          return result;
        })
        .then(resolve)
        .catch(reject);
    });
  };
  // Add our special members to designate this as an api
  const additional = {
    apiName: name,
    uniqueId,
    apiType: ApiType.Set,
    invalidates: invalids,
    mockPath,
    clear,
    override,
    clearOverride,
    original: apiFunction,
  };
  const result = Object.assign(apiLayerFunc, additional);
  newApi = result;
  return result;
};
