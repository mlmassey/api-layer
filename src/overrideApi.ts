import { apiLayerOverride, apiLayerRemoveOverride } from './ApiLayer';
import { ApiFunction } from 'types/ApiFunction';

/**
 * Overrides an existing API with a new function that will be called instead of the installed function.  This is used for
 * dependency injection when performing testing.
 * @param {ApiFunction} apiToOverride: The ApiFunction that was installed that you want to override
 * @param {function} overrideFunction: The new function you want to be called instead.
 * @returns {function} Returns a function that can be called to remove the installed override
 */
export const overrideApi = <T extends Array<any>, U extends Promise<any>>(
  apiToOverride: ApiFunction,
  overrideFunction: (...args: T) => U,
) => {
  apiLayerOverride(apiToOverride, overrideFunction);
  return (): void => {
    apiLayerRemoveOverride(apiToOverride, overrideFunction);
  };
};
