import { getRegisteredFunctions } from './registeredFunctions';
import { ApiType } from './types/ApiType';

/**
 * Calls all GET functions clear() function to clear their cache
 */
export const clearApiLayerCache = (): void => {
  const registry = getRegisteredFunctions();
  registry.forEach((func) => {
    if (func.apiType === ApiType.Get && func.clear) {
      func.clear();
    }
  });
};
