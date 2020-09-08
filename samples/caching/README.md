# Client-Side API caching
The ApiLayer does not directly implement client-side caching.  The file [sample.test.ts](./sample.test.ts) demonstrates how to use the 3rd party memoization library [memoizee](https://github.com/medikoo/memoizee) to memoize your API calls to provide caching.  ApiLayer supports caching if you do the following:

## Memoize your API functions
When you write your actual API function, wrap it in a memoization.  It is recommended to have a cache age that matches how frequently your server side data changes.  
```javascript
import * as memoize from 'memoizee';
import { createGetApi, apiLayerCreate } from 'api-layer';

const apiLayer = apiLayerCreate();

function getSampleData(): Promise<object> {
  // Fetch the data from your server
  return fetch('https://api.my-back-end.com/data').then(response => response.json());
}

function mockGetSampleData(): Promise<object> {
  return Promise.resolve({ myData: true });
}

// Set our cache age to one hour, since that is about how frequently the data changes on our server
const cacheOptions = {
  maxAge: 1000 * 60 * 60,  // Set cache age to 1 hour 
}

export default createGetApi(apiLayer, memoize(getSampleData, cacheOptions), memoize(mockGetSampleData, cacheOptions));
```

## Make your SET api invalidate related GET functions
You need to tell your `SET` API function to invalidate any `GET` function that fetches the same data.  ApiLayer will take care of invalidating 
these related APIs for you if you call your `SET` function.  You need to be careful to list all related `GET` apis in the invalidates parameter or you risk data becoming out of sync, since some functions are cached and some are not.
```javascript
import { createSetApi, apiLayerCreate } from 'api-layer';
import apiGetSampleData from './apiGetSampleData'; // See function declared above

const apiLayer = apiLayerCreate();

function setSampleData(value: object): Promise<object> {
  // Set the data on your back-end
  return fetch('https://api.my-back-end.com/data', { method: 'PUT', body: JSON.stringify(value) }).then(response => response.json());
}

function mockSetSampleData(value: object): Promise<object> {
  return Promise.resolve(value);
}

// Make sure to list the apiGetSampleData as a related function in your SET API
export default createSetApi(apiLayer, setSampleData, mockSetSampleData, [apiGetSampleData]));
```

## Using a different memoization library
There is no requirement to use memoizee for caching.  Feel free to use any library you want.  The only requirement is that the cached/memoized function needs to include a `clear()` function to signal that it is cached and should be cleared.  The functions created by `createGetApi` and `createSetApi` will always include a `clear()` function, but if the called functions have no `clear()` function defined, it will do nothing.
```javascript
const myGetApi = (): Promise<string> => {
  return Promise.resolve('hello');
};
myGetApi.clear = () => {
  // Call your 3rd party memoization library to clear this functions cache
};
```