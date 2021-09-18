import { createGetApi } from '../../../../../src';

function getSample(): Promise<string> {
  return Promise.resolve('Production sampleGet response');
}

export const apiGetSample = createGetApi(getSample);
