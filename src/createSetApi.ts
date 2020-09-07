import { ApiType } from 'types/ApiType';
import { apiLayerInstall, ApiLayer } from './ApiLayer';
import { ApiFunction } from 'types/ApiFunction';

export const createSetApi = <T extends Array<any>, U extends Promise<any>>(
  apiLayer: ApiLayer,
  apiFunction: (...args: T) => U,
  mock: (...args: T) => U,
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
