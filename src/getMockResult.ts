import { ApiFunction, ApiLayer } from '.';
import { callMock } from './ApiLayerCommon';

export const MOCK_RESULT_UNIQUE_ID = 'getMockResult_UniqueId';
export const MOCK_RESULT_NAME = 'getMockResult';

/**
 * Gets a mock result from a file.  This is used purely for loading different mock results
 * @param {string} mockPath: The path to the mock result file that will be loaded
 * @param {number} mockDelay: (optional) Additional delay (in milliseconds) to add to the call to simulate a real api call
 * @param {ApiLayer} apiLayer: (optional) Used primarily for testing purposes
 */
export const getMockResult = <U extends any>(mockPath: string, mockDelay?: number, apiLayer?: ApiLayer): Promise<U> => {
  return new Promise((resolve, reject) => {
    const apiFunction = {
      uniqueId: MOCK_RESULT_UNIQUE_ID,
      apiName: MOCK_RESULT_NAME,
      mock: mockPath,
    };
    callMock(apiFunction as ApiFunction<any, U>, apiLayer, undefined, mockDelay, true)
      .then(resolve)
      .catch(reject);
  });
};
