// This will create the global api-layer in your web application
import { apiLayerCreate } from '../../../../src/ApiLayerCommon';
import { WebMockResolver } from '../../../../src/WebMockResolver';

// If we are in development mode, run with mocking turned on and set the resolver
const mockMode = process.env.NODE_ENV === 'development';
const mockResolver = mockMode ? new WebMockResolver('/mock') : undefined;

// Creates a global api layer and installs it
apiLayerCreate({ mockMode, mockResolver });
