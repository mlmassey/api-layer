# Validation
What is any good API management library if it doesn't do validation of the server communication?  This was not built directly into the ApiLayer, but can be easily added using any 3rd party data library that you want.  The [sample.test.ts](./sample.test.ts) file provided uses [AJV](https://ajv.js.org/) to perform JSON schema validation.

## Using validation and Caching
If you are using [client-side caching](../caching) and data validation, it is recommended to call your validator first, then wrap the validation call in a memoization call so that you only run validation on an actual API call (instead of every time).
*NOTE:* Validation is not run on your overrides unless you explicitly wrap them in validation code also