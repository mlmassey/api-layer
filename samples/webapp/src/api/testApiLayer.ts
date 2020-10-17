import * as path from 'path';
import { apiLayerCreate } from '../../../../src/ApiLayerCommon';
import { NodeMockResolver } from '../../../../src/NodeMockResolver';

const mockResolver = new NodeMockResolver(path.resolve(__dirname, './mock'));
const apiLayer = apiLayerCreate({ mockMode: true, mockResolver });

export { apiLayer };
