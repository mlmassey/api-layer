import { apiLayerOverride, ApiLayer, apiLayerRemoveOverride } from './ApiLayer';
import { ApiFunction } from 'types/ApiFunction';

export const overrideApi = <T extends Array<any>, U extends Promise<any>>(
  apiLayer: ApiLayer,
  apiToOverride: ApiFunction,
  newApi: (...args: T) => U,
) => {
  apiLayerOverride(apiLayer, apiToOverride, newApi);
  return (): void => {
    apiLayerRemoveOverride(apiLayer, apiToOverride, newApi);
  };
};
