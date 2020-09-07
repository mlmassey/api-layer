import { ApiType } from 'types/ApiType';
import { apiLayerInstall, ApiLayer } from './ApiLayer';

export const createGetApi = <T extends Array<any>, U extends Promise<any>>(
  apiLayer: ApiLayer,
  apiFunction: (...args: T) => U,
  mock: (...args: T) => U,
  apiName?: string,
) => {
  if (!apiLayer || !apiFunction || !mock) {
    throw new Error('Invalid empty arguments');
  }
  const name = apiName || apiFunction.name || '';
  const options = {
    type: ApiType.Get,
  };
  return apiLayerInstall(apiLayer, name, apiFunction, mock, options);
};
