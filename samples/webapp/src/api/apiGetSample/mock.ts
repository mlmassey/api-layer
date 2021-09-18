import { apiGetSample } from '.';
import { setMockFunction } from '../../../../../src';

setMockFunction(apiGetSample, () => Promise.resolve('Mock sampleGet response'));

export { apiGetSample };
