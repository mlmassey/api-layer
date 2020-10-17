import { createGetApi } from '../../../../src/createGetApi';

function sampleGet(): Promise<string> {
  return Promise.resolve('Production sampleGet response');
}

export const apiSampleGet = createGetApi(sampleGet, 'apiSampleGet.mock.js');
