import { apiSetSample } from '.';
import { setMockFunction } from '../../../../../src';

setMockFunction(apiSetSample, () => Promise.resolve('json response'));

export { apiSetSample };
