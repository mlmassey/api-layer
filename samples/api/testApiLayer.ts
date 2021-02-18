//
// Your global ApiLayer needs to be initialized in mock mode when running in a unit test environment
// This examples shows how to initialize with mock mode on when it detects Jest
//
import { apiLayerCreate } from '../../src';
import { NodeMockResolver } from '../../src/NodeMockResolver';

// We initialize with a NodeMockResolver for Node/Jest testing.  We use the current dirname
// as the root that we will resolve all our paths to
const mockResolver = new NodeMockResolver(__dirname);
const inJest = process.env.JEST_WORKER_ID !== undefined || process.env.NODE_ENV === 'test';
const mockMode = inJest;

// You need to call apiLayer create and not export const apiLayer, since it will not actually be called if you don't import it
const apiLayer = apiLayerCreate({ mockMode, mockResolver });

export { apiLayer };
