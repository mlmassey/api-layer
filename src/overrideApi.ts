import { isApiLayerFunction } from '.';
import { ApiFunction } from './types/ApiFunction';

/**
 * Overrides an existing API with a new function that will be called instead.  This is used for
 * dependency injection when performing testing.
 * @param {ApiFunction} apiToOverride: The ApiFunction that was installed that you want to override
 * @param {function} overrideFunction: The new function you want to be called instead.
 * @returns {function} Returns a function that can be called to remove the installed override
 */
export const overrideApi = <T extends Array<any>, U extends any>(
  apiToOverride: ApiFunction<T, U>,
  overrideFunction: (...args: T) => Promise<U>,
): (() => void) => {
  if (!isApiLayerFunction(apiToOverride)) {
    throw new Error('apiToOverride must be an ApiFunction');
  }
  if (isApiLayerFunction(overrideFunction)) {
    throw new Error('overrideFunction should not be an ApiFunction');
  }
  apiToOverride.installOverride(overrideFunction);
  return () => {
    apiToOverride.clearOverride(overrideFunction);
  };
};
