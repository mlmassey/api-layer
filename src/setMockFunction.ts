import { isApiLayerFunction } from './isApiLayerFunction';
import { ApiFunction } from './types/ApiFunction';

/**
 * Installs a default mock function that will be called instead of the actual function.  This puts the ApiFunction
 * into mock mode and will only give mock results (unless an override is installed)
 * @param {ApiFunction} apiToInstallInto: The ApiFunction that you want to install the mock into
 * @param {function} mockFunction: The new mock function to be called instead
 * @returns {function} Returns a function that can be called to remove the installed mock
 */
export const setMockFunction = <T extends Array<any>, U extends any>(
  apiToInstallInto: ApiFunction<T, U>,
  mockFunction: (...args: T) => Promise<U>,
): (() => void) => {
  if (!isApiLayerFunction(apiToInstallInto)) {
    throw new Error('apiToInstallInto must be an ApiFunction');
  }
  if (isApiLayerFunction(mockFunction)) {
    throw new Error('mockFunction should not be an ApiFunction');
  }
  apiToInstallInto.installMock(mockFunction);
  return () => {
    apiToInstallInto.clearMock(mockFunction);
  };
};
