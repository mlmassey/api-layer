import { apiLayerCreate } from '../../../../src/ApiLayerCommon';
import { WebMockResolver } from '../../../../src/WebMockResolver';

const mockMode = process.env.NODE_ENV === 'development';
const mockResolver = mockMode ? new WebMockResolver('/mock') : undefined;

// Creates a global api layer and installs it
apiLayerCreate({ mockMode, mockResolver });
