# Testing and Overrides
The following sample demonstrates using the api-layer for your tests and overriding functionality to test different conditions using the api-layer dependency injection.  See the file [sample.test.ts](./sample.test.ts) for the sample code.

# Default mock implementations
When you create your API functions using [createGetApi](../../src/createGetApi.ts) or [createSetApi](../../src/createSetApi.ts), you should always
create a mock version as shown in the examples.  This default mock should return a positive response that is a default response that can be used
by your application when testing.

# Creating mock implementations
ApiLayer provides a helper function called [createMockFunction](../../src/createMockFunction.ts) that can be used to easily create mock implementations to test different functionality.  

# Override existing APIs
You can easily override existing API functions using the [overrideApi](../../src/overrideApi.ts) function. This will override the API in your code base during run-time so you can test different conditions.  
*NOTE*: If you call overrideApi multiple times, the previous override will be replaced

# Using callApiFunction to wrap/alter an existing API
The [callApiFunction](../../src/callApiFunction.ts) allows you to create function that you can then wrap to alter
its inputs/outputs.  Typically, you would wrap the return value from callApiFunction to alter it, then install it as an override.  Examples have been provided in [sample.test.ts](./sample.test.ts) to showcase its functionality.  Typical usage shown below:
```javascript
import { callApiFunction, overrideApi } from 'api-layer';
import { apiGetSample } from 'api';

/**
 * The override will call the original API function, but first alter its arguments before calling the original,
 * then altering its result before returning. 
 */
const override = (value: string): Promise<string> => {
  // Change the input value to manipulate the existing function
  const newValue = `${value} override`;
  return callApiFunction(apiGetSample)(newValue).then((result) => {
    // Alter the result also
    return `${result} also overridden`;
  });
}
// Install your new override
overrideApi(apiGetSample, override);
```
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
  .add(apiGet1, () => Promise.resolve('override1'))
  .add(apiGet2, () => Promise.resolve('override2'))
  .add(apiGet3, () => Promise.resolve('override3'));
// Do your testing work
// Now remove all the overrides at once
overrides.removeAll();
```
