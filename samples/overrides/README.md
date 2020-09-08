# Overriding
The following sample demonstrates using the ApiLayer to override API functionality during run-time of your application.  See the file [sample.test.ts](./sample.test.ts) for the sample code.

# Overriding APIs
Typically, you would only use overrides in your test code for testing different conditions.  You can see samples of thing in [Unit Testing](../testing).  ApiLayer does not limit this functionality to just unit testing though.  You will need to be careful using this functionality though, since you can only have one override installed at a time and installing a new override will replace the previously installed override.

# Creating an OverrideGroup
To help you managed a large number of overrides in your testing functions, you can create an instance of an [OverrideGroup](../../src/OverrideGroup.ts).  This will allow you to easily override a large number of ApiFunctions quickly and then remove them when your complete.
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