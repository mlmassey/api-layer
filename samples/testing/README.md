# Unit Testing
The following sample demonstrates using the ApiLayer for your unit tests and overriding functionality to test different conditions using the ApiLayer dependency injection.  See the file [sample.test.ts](./sample.test.ts) for the sample code.

# Creating the API layer
It is recommended that you check if you are running in your unit test environment and set your ApiLayer into mock mode automatically when you call [apiLayerCreate](../../src/ApiLayer.ts). See the sample [apiLayer](../api/apiLayer.ts) for an example.

# Default mock implementations
When you create your API functions using [createGetApi](../../src/createGetApi.ts) or [createSetApi]../../src/createSetApi.ts), the ApiLayer requires you to provide a default mock implementation.  This default implementation should return a test positive response that can be used in your application unit tests.  

# Creating mock implementations
ApiLayer provides a helper function called [createMockApi](../../src/createMockApi.ts) that can be used to easily create mock implementations to test different functionality.  

# Override existing APIs
You can easily override existing API functions using the [overrideApi](../../src/overrideApi.ts) function. This will override the API in your code base during run-time so you can test different conditions.  
*NOTE*: If you call overrideApi multiple times, the previous override will be replaced
