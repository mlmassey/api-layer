import { ApiFunction, isApiLayerFunction, ApiType } from '.';

export interface CallApiFunctionOptions {
  /** Prevents calling the installed mock function */
  noMock?: boolean;
  /** Prevents calling the override and calls the original instead */
  noOverride?: boolean;
  /** Prevents the SET API call to invalidate the associated GET functions */
  noInvalidation?: boolean;
}

/**
 * Creates a calling function that calls the provided ApiFunction with the options specified in the options argument.  This is useful when
 * you want to modify an existing api and alter its results.  You would take the return value from this function and wrap it in another function,
 * then install it as an override into the api-layer.
 * @param {ApiFunction} apiFunction: The existing ApiFunction that you want to call
 * @param {CallApiFunctionOptions} options: (optional) See the CallApiFunctionOptions interface for a description
 * @returns {function} Returns a wrapper function that (if called) will call the provided ApiFunction with the specified options.  It is recommended
 *  you wrap this function with another function that you can then alter the results or arguments when altering the return value.
 */
export const callApiFunction = <T extends Array<any>, U extends any>(
  apiFunction: ApiFunction<T, U>,
  options?: CallApiFunctionOptions,
): ((...args: T) => Promise<U>) => {
  if (!isApiLayerFunction(apiFunction)) {
    throw new Error('apiFunction argument is not a valid ApiFunction');
  }
  const ops: CallApiFunctionOptions = options || {};
  const newFunc = (...args: T): Promise<U> => {
    return new Promise((resolve, reject) => {
      let callFunc = apiFunction.original;
      if (!ops.noMock && apiFunction.mock) {
        callFunc = apiFunction.mock;
      }
      if (!ops.noOverride && apiFunction.override) {
        callFunc = apiFunction.override;
      }
      callFunc(...args)
        .then((result: U) => {
          if (ops.noInvalidation || apiFunction.apiType !== ApiType.Set) {
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
