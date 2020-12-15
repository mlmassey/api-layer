import { ApiFunction, ApiLayer, isApiLayerFunction } from '.';
import { getApiCallFunction } from './ApiLayerCommon';
import { ApiType } from './types/ApiType';

export interface CallApiFunctionOptions {
  /** Prevents calling mock results and calls the actual api function, even in mockMode */
  preventMock?: boolean;
  /** Prevents the SET API call to invalidate the associated GET functions */
  preventInvalidation?: boolean;
  /** Calls the override function.  Typically you don't want to do this because you will be installing the result from callApiFunction as an override
   * WARNING: If you set this to true, then install it as an override, you could create an infinite loop that will crash your system.
   */
  useOverride?: boolean;
  /** Alternate mockPath to use when calling this function.  This allows you to load a different mock result when calling this ApiFunction */
  mockPath?: string;
}

/**
 * Creates a calling function that calls the provided ApiFunction with the options specified in the options argument.  This is useful when
 * you want to modify an existing api and alter its results.  You would take the return value from this function and wrap it in another function,
 * then install it as an override into the api-layer.
 *
 * @param {ApiFunction} apiFunction: The existing ApiFunction that you want to call
 * @param {CallApiFunctionOptions} options: (optional) See the CallApiFunctionOptions interface for a description
 * @param {ApiLayer} apiLayer: (optional) The ApiLayer you want the returned call function to use.  If not set, it uses the globally installed ApiLayer.
 *  This is typically only used for testing purposes.
 * @returns {function} Returns a wrapper function that (if called) will call the provided ApiFunction with the specified options.  It is recommended
 *  you wrap this function with another function that you can then alter the results or arguments when calling this return value.
 */
export const callApiFunction = <T extends Array<any>, U extends any>(
  apiFunction: ApiFunction<T, U>,
  options?: CallApiFunctionOptions,
  apiLayer?: ApiLayer,
): ((...args: T) => Promise<U>) => {
  if (!isApiLayerFunction(apiFunction)) {
    throw new Error('apiFunction argument is not a valid ApiFunction');
  }
  const ops: CallApiFunctionOptions = options || {};
  const newFunc = (...args: T): Promise<U> => {
    return new Promise((resolve, reject) => {
      const newApiFunction = ({ ...apiFunction } as unknown) as ApiFunction<T, U>;
      if (ops.mockPath) {
        if (ops.preventMock) {
          throw new Error('Using preventMock with a mockPath does not make sense');
        }
        newApiFunction.mock = ops.mockPath;
      }
      const callFunc = getApiCallFunction(
        newApiFunction.original,
        newApiFunction,
        ops.useOverride,
        ops.preventMock,
        apiLayer,
      );
      callFunc(...args)
        .then((result: U) => {
          if (ops.preventInvalidation || apiFunction.apiType !== ApiType.Set) {
            return result;
          }
          // We need to invalidate all the apis that are specified to this function
          const invalids = apiFunction.invalidates || [];
          if (invalids && invalids.length) {
            invalids.forEach((getApi: ApiFunction<T, U>) => {
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
  return newFunc;
};
