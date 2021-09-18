import { getRegisteredFunctions } from './registeredFunctions';

/**
 * Removes all installed overrides for all ApiFunctions
 */
export const clearApiLayerOverrides = (): void => {
  const registry = getRegisteredFunctions();
  registry.forEach((func) => {
    if (func.override) {
      func.override = undefined;
    }
  });
};
