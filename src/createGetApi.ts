/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-empty-function */
import { ApiType } from './types/ApiType';
import { ApiLayer } from './types/ApiLayer';
import {
  getApiCallFunction,
  apiLayerOverride,
  apiLayerRemoveOverride,
  getApiUniqueId,
  isApiLayerFunction,
} from './ApiLayerCommon';

/**
 * Creates a new GET API function that wraps your provided API function to allow it be overridden.  This should be only
 * used for functions that retrieve data from your servers (do not set data), such as a REST GET or POST.
 * @param {function} apiFunction: Your asynchronous API fetching function.  Should return a Promise.
 * @param {string} mockPath: The path to the mock data to load for the default mock response.  This should be relative to the path set in your MockResolver
 *    installed in your ApiLayer.
 * @param {string} apiName: (optional) Unique api name you assign to this api.  If not set, it will attempt to use the function name of your api
 * @param {ApiLayer} apiLayer: (optional) The ApiLayer your installing this function into.  If not defined, the globally installed ApiLayer is used.
 *    This is typically used for testing purposes only.
 * @returns {ApiFunction} The API function you can call directly, just as you would the apiFunction parameter provided.
 */
export const createGetApi = <T extends Array<any>, U extends any>(
  apiFunction: (...args: T) => Promise<U>,
  mockPath: string,
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
      return callFunc(...args)
        .then(resolve)
        .catch(reject);
    });
  };
  // Add our special members to designate this as an api
  const additional = {
    apiName: name,
    uniqueId,
    apiType: ApiType.Get,
    invalidates: [],
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
