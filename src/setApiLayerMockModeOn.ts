import { getRegisteredFunctions } from './registeredFunctions';

export interface SetApiLayerMockModeOptions {
  /** Throws an error if any api-layer function is found with no mock implementation */
  throwError?: boolean;
}

/**
 * Checks to make sure all api-layer functions that are currently registered and in use have
 * mock functions installed.
 * @param {SetApiLayerMockModeOptions} options : See options for details
 * @returns true if all functions are in mock mode, or false if at least one is found not in mock mode
 */
export const setApiLayerMockModeOn = (options?: SetApiLayerMockModeOptions): boolean => {
  const registered = getRegisteredFunctions();
  const errors: Array<string> = [];
  registered.forEach((func) => {
    if (!func.mock) {
      errors.push(`Function ${func.apiName} is missing mock declaration`);
    }
  });
  if (errors.length) {
    if (options?.throwError) {
      throw new Error(`${errors}`);
    }
    return false;
  }
  return true;
};
