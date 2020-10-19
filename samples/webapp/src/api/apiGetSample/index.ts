import { createGetApi } from '../../../../../src/createGetApi';

function getSample(): Promise<string> {
  return Promise.resolve('Production sampleGet response');
}

export const apiGetSample = createGetApi(getSample, 'apiGetSample/apiGetSample.mock.js');
