/* eslint-disable @typescript-eslint/no-unused-vars */
import { callApiFunction, createGetApi, createMockFunction, createSetApi, overrideApi, setMockFunction } from '../src';

const sampleGet = (value: string): Promise<string> => {
  return Promise.resolve(`sample ${value}`);
};

const mockGet = createMockFunction(undefined, undefined, (value: string) => {
  return Promise.resolve(`mock ${value}`);
});

test('Create call api with empty options should have original result', async () => {
  const api = createGetApi(sampleGet);
  const call = callApiFunction(api);
  const result = await call('hello');
  expect(result).toBe('sample hello');
});

test('Create call api with preventMock option should call original', async () => {
  const api = createGetApi(sampleGet);
  setMockFunction(api, mockGet);
  const result = await api('hello');
  expect(result).toBe('mock hello');
  // Now lets create our call api function that ignores mock result
  const call = callApiFunction(api, { noMock: true });
  const callResult = await call('hello');
  expect(callResult).toBe('sample hello');
});

test('Create call api with useOverride set to false ignores installed override', async () => {
  const api = createGetApi(sampleGet);
  const override = (arg: string) => {
    return Promise.resolve('override');
  };
  overrideApi(api, override);
  const result = await api('hello');
  expect(result).toBe('override');
  // Now lets create our call api function that prevents calling of override
  const call = callApiFunction(api, { noOverride: true });
  const callResult = await call('hello');
  expect(callResult).toBe('sample hello');
});

test('Create call api with preventInvalidation works', async () => {
  let cacheCleared = false;
  const sampleGetApi = (value: string) => {
    return Promise.resolve(value);
  };
  sampleGetApi.clear = () => {
    cacheCleared = true;
  };
  const getApi = createGetApi(sampleGetApi);
  const setApi = createSetApi(sampleGet, [getApi]);
  await setApi('hello');
  expect(cacheCleared).toBeTruthy();
  // Now lets create our call api function that prevents invalidation
  cacheCleared = false; // reset our variable
  // Create a call api that does perform invalidation
  const callInvalidates = callApiFunction(setApi, { noInvalidation: false });
  await callInvalidates('hello');
  expect(cacheCleared).toBeTruthy();
  // Lets create one that does not perform invalidation
  cacheCleared = false;
  const callNoInvalidates = callApiFunction(setApi, { noInvalidation: true });
  await callNoInvalidates('hello');
  expect(cacheCleared).toBeFalsy();
});

test('Install call api as an override to allow manipulation of inputs+outputs', async () => {
  const api = createGetApi(sampleGet);
  const override = (arg: string) => {
    return Promise.resolve('override');
  };
  overrideApi(api, override);
  const result = await api('hello');
  expect(result).toBe('override');
  // Now lets create our call api function that will act as a new override
  const call = callApiFunction(api, { noOverride: true });
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
  const removeOverride = overrideApi(api, wrapper);
  // Now lets call the original api
  const finalResult = await api('hello');
  expect(finalResult).toBe('sample wrapper hello additional');
  // Now lets remove our wrapper and we should be back to the original
  removeOverride();
  const original = await api('hello');
  expect(original).toBe('sample hello');
});
