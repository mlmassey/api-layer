import * as path from 'path';
import { apiLayerCreate, NodeMockResolver } from 'api-layer';

const mockResolver = new NodeMockResolver(path.resolve(__dirname));
const apiLayer = apiLayerCreate({ mockMode: true, mockResolver });

export { apiLayer };
