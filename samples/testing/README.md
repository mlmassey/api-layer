# Testing and Overrides
The following sample demonstrates using the ApiLayer for your tests and overriding functionality to test different conditions using the ApiLayer dependency injection.  See the file [sample.test.ts](./sample.test.ts) for the sample code.

# Creating the API layer
It is recommended that you check if you are running in your unit test environment and set your ApiLayer into mock mode automatically when you call [apiLayerCreate](../../src/ApiLayer.ts). See the sample [apiLayer](../api/apiLayer.ts) for an example.

# Default mock implementations
When you create your API functions using [createGetApi](../../src/createGetApi.ts) or [createSetApi]../../src/createSetApi.ts), the ApiLayer requires you to provide the file path to a default mock implementation.  This default implementation should return a positive/valid response that can be used in your application tests.  

# Creating mock implementations
ApiLayer provides a helper function called [createMockApi](../../src/createMockApi.ts) that can be used to easily create mock implementations to test different functionality.  

# Override existing APIs
You can easily override existing API functions using the [overrideApi](../../src/overrideApi.ts) function. This will override the API in your code base during run-time so you can test different conditions.  
*NOTE*: If you call overrideApi multiple times, the previous override will be replaced

# Creating an OverrideGroup
To help you managed a large number of overrides in your testing functions, you can create an instance of an [OverrideGroup](../../src/OverrideGroup.ts).  This will allow you to easily override a large number of ApiFunctions quickly and then remove them when your done.
```javascript
import { OverrideGroup } from 'api-layer';
import { apiGet1, apiGet2, apiGet3 } from 'api';

function override() {
  return Promise.resolve('override value');
}

const overrides = new OverrideGroup();
// Add all your overrides by chaining the requests
overrides
  .add(apiGet1, override)
  .add(apiGet2, override)
  .add(apiGet3, override);
// Do your testing work
// Now remove all the overrides at once
overrides.removeAll();
```
