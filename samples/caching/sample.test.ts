/* eslint-disable import/default */
/* eslint-disable import/no-extraneous-dependencies */
import memoize from 'memoizee';
import { apiLayerCreate, createGetApi, createSetApi, overrideApi, NodeMockResolver } from '../../src';

// Create a global variable that will store our testing value
let testValue = '';
let numGetApiCalls = 0;

// First we create our apiLayer for testing purposes
const mockResolver = new NodeMockResolver();
apiLayerCreate({ mockMode: false, mockResolver });

// Now we will create our sample GET api
function getApi(): Promise<string> {
  if (!testValue) {
    testValue = 'get';
  }
  numGetApiCalls++;
  return Promise.resolve(testValue);
}

// Create our sample SET API
function setApi(value: string): Promise<string> {
  testValue = value;
  return Promise.resolve(testValue);
}

// We will use the memoizee library for easy/fast memoization to create our client-side cache layer
// When creating your memoized functions, its best to think about how often the data that is being fetched from your
// server changes and set a cache timeout.  For instance, if our data changes every hour, we should set the cache
// timeout to an hour to make sure we get fresh data occasionally.
const cacheOptions = {
  maxAge: 1000 * 60 * 60, // Set our max age to 1 hour
};
const memoizedGet = memoize(getApi, cacheOptions);

// Create our api-layer functions, but wrap our actual API calls with memoize
// The memoized functions attach an additional function to our API function called clear() that is used to clear the cache.
// If your memoization library does not add a clear() function, you will have to add it yourself manually
const apiSampleGet = createGetApi(memoizedGet, 'mock is never called so this is ignored', {
  cacheAge: cacheOptions.maxAge,
});
// Create our set api function and make sure to tell it that it will invalidate our get API if it is called using the invalidates argument
const apiSampleSet = createSetApi(setApi, 'mock is never called so this is ignored', [apiSampleGet]);

test('Test our client-side API caching', async () => {
  // Call our get API call to retrieve the server value
  let result: string = await apiSampleGet();
  expect(result).toBe('get');
  expect(numGetApiCalls).toBe(1);
  // Now lets call our get api call again many more times to see if our cache is working
  await apiSampleGet();
  await apiSampleGet();
  await apiSampleGet();
  // Now lets check if our API was actually called.  If our cache is working, we would expect only one call still
  expect(numGetApiCalls).toBe(1);
  // Now lets call our set api to change the value.  This should cause our get api cache to be invalidated so it will be called again
  result = await apiSampleSet('set');
  expect(result).toBe('set');
  // Now call our get to see its still cached
  result = await apiSampleGet();
  expect(result).toBe('set');
  expect(numGetApiCalls).toBe(2);
  // Now lets override our get Api to return a different result
  const override = () => {
    if (testValue === 'set') {
      testValue = 'override';
    }
    numGetApiCalls++;
    return Promise.resolve(testValue);
  };
  // Install the override should invalidate the cache and receive our override value
  // Remember though, unless you memoize your override, it will not be cached
  overrideApi(apiSampleGet, override);
  result = await apiSampleGet();
  expect(result).toBe('override');
  expect(numGetApiCalls).toBe(3);
});
