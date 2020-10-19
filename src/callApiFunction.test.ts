import { apiLayerCreate, callApiFunction, NodeMockResolver, createGetApi, createSetApi } from '.';
import { apiLayerOverride, apiLayerRemoveOverride } from './ApiLayerCommon';

const mockResolver = new NodeMockResolver();

const sampleGet = (value: string): Promise<string> => {
  return Promise.resolve(`sample ${value}`);
};

test('Create call api with empty options should have original result', async () => {
  const apiLayer = apiLayerCreate({ installGlobal: false, mockResolver });
  const api = createGetApi(sampleGet, 'samples/mock/mockSimple.json', undefined, apiLayer);
  const call = callApiFunction(api, undefined, apiLayer);
  const result = await call('hello');
  expect(result).toBe('sample hello');
});

test('Create call api with preventMock option should call original', async () => {
  const apiLayer = apiLayerCreate({ mockMode: true, installGlobal: false, mockResolver });
  const api = createGetApi(sampleGet, 'samples/mock/mockSimple.json', undefined, apiLayer);
  const result = await api('hello');
  expect(result).toBe('mock test sucks');
  // Now lets create our call api function that ignores mock result
  const call = callApiFunction(api, { preventMock: true }, apiLayer);
  const callResult = await call('hello');
  expect(callResult).toBe('sample hello');
});

test('Create call api with useOverride set to false ignores installed override', async () => {
  const apiLayer = apiLayerCreate({ mockMode: true, installGlobal: false, mockResolver });
  const api = createGetApi(sampleGet, 'samples/mock/mockSimple.json', undefined, apiLayer);
  const override = () => {
    return Promise.resolve('override');
  };
  apiLayerOverride(api, override, apiLayer);
  const result = await api('hello');
  expect(result).toBe('override');
  // Now lets create our call api function that prevents calling of override
  const call = callApiFunction(api, { useOverride: false, preventMock: true }, apiLayer);
  const callResult = await call('hello');
  expect(callResult).toBe('sample hello');
});

test('Create call api with an alternate mockPath loads the different result', async () => {
  const apiLayer = apiLayerCreate({ mockMode: true, installGlobal: false, mockResolver });
  const api = createGetApi(sampleGet, 'samples/mock/mockSimple.json', undefined, apiLayer);
  const result = await api('hello');
  expect(result).toBe('mock test sucks');
  // Now lets create our call api function that loads a different mock result
  const call = callApiFunction(api, { mockPath: 'samples/mock/mockComplex.json' }, apiLayer);
  const callResult: any = await call('hello');
  expect(typeof callResult).toBe('object');
  expect(callResult.field1).toBeTruthy();
});

test('Create call api with preventInvalidation works', async () => {
  const apiLayer = apiLayerCreate({ mockMode: true, installGlobal: false, mockResolver });
  let cacheCleared = false;
  const sampleGetApi = (value: string) => {
    return Promise.resolve(value);
  };
  sampleGetApi.clear = () => {
    cacheCleared = true;
  };
  const getApi = createGetApi(sampleGetApi, 'samples/mock/mockSimple.json', undefined, apiLayer);
  const setApi = createSetApi(sampleGet, 'samples/mock/mockSimple.json', [getApi], undefined, apiLayer);
  await setApi('hello');
  expect(cacheCleared).toBeTruthy();
  // Now lets create our call api function that prevents invalidation
  cacheCleared = false; // reset our variable
  // Create a call api that does perform invalidation
  const callInvalidates = callApiFunction(setApi, { preventInvalidation: false }, apiLayer);
  await callInvalidates('hello');
  expect(cacheCleared).toBeTruthy();
  // Lets create one that does not perform invalidation
  cacheCleared = false;
  const callNoInvalidates = callApiFunction(setApi, { preventInvalidation: true }, apiLayer);
  await callNoInvalidates('hello');
  expect(cacheCleared).toBeFalsy();
});

test('Install call api as an override to allow manipulation of inputs+outputs', async () => {
  const apiLayer = apiLayerCreate({ mockMode: false, installGlobal: false, mockResolver });
  const api = createGetApi(sampleGet, 'samples/mock/mockSimple.json', undefined, apiLayer);
  const override = () => {
    return Promise.resolve('override');
  };
  apiLayerOverride(api, override, apiLayer);
  const result = await api('hello');
  expect(result).toBe('override');
  // Now lets create our call api function that will act as a new override
  const call = callApiFunction(api, { preventMock: true }, apiLayer);
  const callResult = await call('hello');
  expect(callResult).toBe('sample hello');
  // Now wrap the call with our own manipulator function
  const wrapper = async (value: string) => {
    const newValue = `wrapper ${value}`;
    const newResult = await call(newValue);
    expect(newResult).toBe(`sample wrapper ${value}`);
    // Now manipulate the output
    return newResult + ' additional';
  };
  // Lets install our wrapper as an override
  apiLayerOverride(api, wrapper, apiLayer);
  // Now lets call the original api
  const finalResult = await api('hello');
  expect(finalResult).toBe('sample wrapper hello additional');
  // Now lets remove our wrapper and we should be back to the original
  apiLayerRemoveOverride(api, wrapper, apiLayer);
  const original = await api('hello');
  expect(original).toBe('sample hello');
});
