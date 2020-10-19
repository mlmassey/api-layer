import { ApiLayer } from '.';
import { apiLayerOverride, apiLayerRemoveOverride } from './ApiLayerCommon';
import { ApiFunction } from './types/ApiFunction';

/**
 * Overrides an existing API with a new function that will be called instead of the installed function.  This is used for
 * dependency injection when performing testing.
 * @param {ApiFunction} apiToOverride: The ApiFunction that was installed that you want to override
 * @param {function} overrideFunction: The new function you want to be called instead.
 * @param {ApiLayer} apiLayer: (optional) The optional ApiLayer to install this override into. If not specified, the globally installed ApiLayer will
 *    be used.  This is typically only used for testing purposes.
 * @returns {function} Returns a function that can be called to remove the installed override
 */
export const overrideApi = <T extends Array<any>, U extends any>(
  apiToOverride: ApiFunction,
  overrideFunction: (...args: T) => Promise<U>,
  apiLayer?: ApiLayer,
) => {
  apiLayerOverride(apiToOverride, overrideFunction, apiLayer);
  return () => {
    apiLayerRemoveOverride(apiToOverride, overrideFunction, apiLayer);
  };
};
