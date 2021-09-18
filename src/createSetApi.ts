/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prefer-const */
import { ApiType } from './types/ApiType';
import { ApiFunction } from './types/ApiFunction';
import { isApiLayerFunction } from './isApiLayerFunction';
import { getApiUniqueId } from './getApiUniqueId';
import { registerFunction } from './registeredFunctions';

export interface CreateSetApiOptions {
  /** The name to use for the api instead of the default */
  apiName?: string;
}

/**
 * Creates a new SET API function that wraps your provided API function to allow it be overridden.  This should be
 * used for functions that send data to your servers, such as a REST PUT/POST/DELETE.  You need to make sure to provide
 * a list of any ApiFunction that retrieves the same data that this function sets to ensure their cache is invalidated.
 * @param {function} apiFunction: Your asynchronous API setting function.  Should return a Promise.
 * @param {Array<ApiFunction>} invalidates: (optional) An array of ApiFunctions this SET API would invalidate once the data is sent. Even if you're not
 *  using client-side caching, it is good to set these to build a relationship between APIs that work on related data.
 * @param {CreateSetApiOptions} options: (optional) Additional options.  See CreateSetApiOptions for details
 * @returns {ApiFunction} The API function you can call directly, just as you would the apiFunction parameter provided.
 */
export const createSetApi = <T extends Array<any>, U extends any>(
  apiFunction: (...args: T) => Promise<U>,
  invalidates?: ApiFunction<any, any> | Array<ApiFunction<any, any>> | undefined,
  options?: CreateSetApiOptions,
): ApiFunction<T, U> => {
  if (!apiFunction) {
    throw new Error('Invalid empty arguments');
  }
  if (isApiLayerFunction(apiFunction)) {
    throw new Error('apiFunction cannot be an existing ApiFunction');
  }
  const ops = options || {};
  const name = ops.apiName || apiFunction.name || '';
  const uniqueId = getApiUniqueId(name);
  let clear: () => void = () => {};
  const type = typeof apiFunction;
  if ((type === 'function' || type === 'object') && typeof (apiFunction as any).clear === 'function') {
    clear = (apiFunction as any).clear;
  }
  let invalids: Array<ApiFunction<any, any>> = [];
  if (Array.isArray(invalidates)) {
    invalids = invalids.concat(invalidates);
  } else if (invalidates) {
    invalids.push(invalidates);
  }
  let newApi: any;
  const installOverride = (overrideFunc: (...args: T) => Promise<U>) => {
    newApi.override = overrideFunc;
  };
  const clearOverride = (overrideFunc: (...args: T) => Promise<U>) => {
    if (newApi.override === overrideFunc) {
      newApi.override = undefined;
    }
  };
  const installMock = (mockFunc: (...args: T) => Promise<U>) => {
    newApi.mock = mockFunc;
  };
  const clearMock = (mockFunc: (...args: T) => Promise<U>) => {
    if (newApi.mock === mockFunc) {
      newApi.mock = undefined;
    }
  };
  const apiLayerFunc = (...args: T): Promise<U> => {
    let cancel: () => any;
    const newPromise = new Promise<U>((resolve, reject) => {
      const callFunc = newApi.override || newApi.mock || newApi.original;
      newApi.callCount++;
      newApi.lastCallTime = Date.now();
      const res = callFunc(...args);
      // We need to check if the resulting promise has a cancel function.  If it does, then
      // we want to allow our outer promise to call this cancel function when cancel is
      // called on it
      if (res && typeof (res as any).cancel === 'function') {
        cancel = (res as any).cancel as () => any;
      }
      // We have to call res.then.catch after we check for the cancel we will not see the
      // promises cancel function
      res
        .then((result: any) => {
          // We need to invalidate all the apis that are specified to this function
          if (invalids && invalids.length) {
            invalids.forEach((getApi: ApiFunction<any, any>) => {
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
    (newPromise as any).cancel = () => {
      if (cancel) {
        return cancel();
      }
    };
    return newPromise;
  };
  // Add our special members to designate this as an api
  const additional = {
    apiName: name,
    uniqueId,
    apiType: ApiType.Set,
    invalidates: invalids,
    clear,
    installOverride,
    clearOverride,
    original: apiFunction,
    installMock,
    clearMock,
    callCount: 0,
    lastCallTime: 0,
  };
  const result = Object.assign(apiLayerFunc, additional);
  // This forces the function name to be applied to the name property
  if (ops.apiName) {
    Object.defineProperty(result, 'name', { value: ops.apiName });
  }
  newApi = result;
  registerFunction(result);
  return result;
};
