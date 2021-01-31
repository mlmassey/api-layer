// This will create the global api-layer in your web application
import { apiLayerCreate } from 'api-layer';

// If we are in development mode, run with mocking turned on and set the resolver
// const mockMode = process.env.NODE_ENV === 'development';
// const mockResolver = mockMode ? new WebMockResolver('/mock') : undefined;

// Creates a global api layer and installs it
export const apiLayer = apiLayerCreate();

