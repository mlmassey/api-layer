/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

/**
 * This utility function creates a mock function that can be used for your mock api.  It is not required to be used, but provided
 * as a helper.
 * @param {any} result: (optional) The positive result you want this function to return when called.
 * @param {any} failure: (optional) The negative result you want this function to return when called.  This will result in a Promise rejection.
 * @param {function} callback: (optional) A callback function you want to be called when this mock function is called
 * @param {number} delay: (optional) The amount of artificial delay (in milliseconds) you want to introduce prior to returning the result.  This is useful
 *  for mocking real world delay in API calls and testing loading states.  Default is 0 (no delay).
 * @returns {function}: A mock function that can be called to return the desired result
 */
export const createMockFunction = <T extends Array<any>, U extends any>(
  result?: U,
  failure?: any,
  callback?: (...args: T) => Promise<U>,
  delay?: number,
): ((...args: T) => Promise<U>) => {
  const apiFunc = (...args: T): Promise<U> => {
    return new Promise<U>((resolve, reject) => {
      const returnResult = () => {
        if (failure !== undefined) {
          reject(failure);
          return;
        }
        if (callback) {
          callback(...args)
            .then(resolve)
            .catch(reject);
          return;
        }
        resolve(result as U);
      };
      if (delay && delay > 0) {
        setTimeout(() => {
          returnResult();
        }, delay);
      } else {
        returnResult();
      }
    });
  };
  return apiFunc;
};
