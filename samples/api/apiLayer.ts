//
// Your global ApiLayer needs to be initialized in mock mode when running in a unit test environment
// This examples shows how to initialize with mock mode on when it detects Jest, or when we are in
// development mode or in test mode for NODE_ENV
//
import { apiLayerCreate } from '../../src';

const inJest = process.env.JEST_WORKER_ID !== undefined;
const mockMode = inJest || process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
export const apiLayer = apiLayerCreate({ mockMode });
