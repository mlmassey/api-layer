import { createSetApi } from '../../../../../src/createSetApi';
import { apiGetSample } from '../apiGetSample';

function setSample(): Promise<string> {
  return Promise.resolve('Production setSample response');
}

export const apiSetSample = createSetApi(setSample, [apiGetSample]);
