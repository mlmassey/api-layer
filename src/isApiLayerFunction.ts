/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/**
 * Checks if the given value is an ApiFunction or not
 * @param {any} api: The function to check.
 * @returns {boolean} True if it is an ApiFunction, or false if not
 */
export const isApiLayerFunction = (api: any): boolean => {
  return !!(typeof api === 'function' && api.uniqueId);
};
