import { ApiFunction } from './types/ApiFunction';

const _registeredFunctions: Array<ApiFunction<any, any>> = [];

export const getRegisteredFunctions = (): Array<ApiFunction<any, any>> => {
  return _registeredFunctions;
};

export const registerFunction = (api: ApiFunction<any, any>): void => {
  if (!_registeredFunctions.find((func) => func === api)) {
    _registeredFunctions.push(api);
  }
};
