import { ApiFunction, ApiLayer, isApiLayerFunction } from '.';
import { getApiCallFunction } from './ApiLayerCommon';
import { ApiType } from './types/ApiType';

export interface CallApiFunctionOptions {
  preventMock?: boolean;
  preventOverride?: boolean;
  preventInvalidation?: boolean;
}

export const callApiFunction = <T extends Array<any>, U extends any>(
  apiFunction: ApiFunction,
  options: CallApiFunctionOptions,
  apiLayer?: ApiLayer,
) => {
  if (!isApiLayerFunction(apiFunction)) {
    throw new Error('apiFunction argument is not a valid ApiFunction');
  }
  const ops: CallApiFunctionOptions = options || {};
  const newFunc = (...args: T): Promise<U> => {
    return new Promise((resolve, reject) => {
      const callFunc = getApiCallFunction(
        apiFunction.original,
        apiFunction,
        ops.preventOverride,
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
  return newFunc;
};
