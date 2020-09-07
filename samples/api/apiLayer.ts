//
// Your global ApiLayer needs to be initialized in mock mode when running in a unit test environment
// This examples shows how to initialize with mock mode on when it detects Jest
//
import { apiLayerCreate } from '../../src';

const inJest = process.env.JEST_WORKER_ID !== undefined;
export const apiLayer = apiLayerCreate({ mockMode: inJest });
