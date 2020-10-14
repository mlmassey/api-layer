/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSetApi, apiLayerCreate, isApiLayerFunction, createGetApi } from './index';

const MOCK_FUNCTION = '../samples/api/mock/mockModuleExports.js';
const MOCK_RESULT = '../samples/api/mock/mockComplex.json';

function stringSucks(input: string): Promise<string> {
  const result = `${input} sucks`;
  return Promise.resolve(result);
}

function errorTest(input: string): Promise<string> {
  return Promise.reject('error result');
}

const apiLayer = apiLayerCreate();
const mockLayer = apiLayerCreate({ mockMode: true, mockDelay: 0 });

test('Default behavior', async () => {
  let original = 'test';
  const api = createSetApi(apiLayer, stringSucks, require.resolve(MOCK_FUNCTION));
  original = await api(original);
  expect(isApiLayerFunction(api)).toBeTruthy();
  expect(original).toBe('test sucks');
});

test('Setting api layer with mock mode', async () => {
  let original = 'test';
  const api = createSetApi(mockLayer, stringSucks, require.resolve(MOCK_FUNCTION));
  original = await api(original);
  expect(isApiLayerFunction(api)).toBeTruthy();
  expect(original).toBe('test mock');
});

test('Change mock delay increases delay of mock response', async () => {
  const delayedLayer = apiLayerCreate({ mockMode: true, mockDelay: 3000 });
  let original = 'test';
  const start = Date.now();
  const api = createGetApi(delayedLayer, stringSucks, require.resolve(MOCK_FUNCTION));
  original = await api(original);
  const finish = Date.now();
  expect(original).toBe('test mock');
  expect(finish - start).toBeGreaterThanOrEqual(3000);
});

test('Not supplying a mock function throws error', () => {
  expect(() => {
    createSetApi(apiLayer, undefined as any, MOCK_RESULT);
  }).toThrowError();
});

test('Not supplying a proper function throws error', () => {
  expect(() => {
    createSetApi(apiLayer, stringSucks, undefined as any);
  }).toThrowError();
});

test('Error results is properly returned', () => {
  const errorApi = createSetApi(apiLayer, errorTest, MOCK_RESULT);
  return errorApi('test').catch((error) => {
    expect(error).toBe('error result');
  });
});

test('Trying to assign api layer functions throws error', () => {
  const getApi = createSetApi(apiLayer, stringSucks, MOCK_RESULT);
  expect(() => {
    createSetApi(apiLayer, getApi, MOCK_RESULT);
  }).toThrowError();
});

test('Api invalidation when set is working', async () => {
  let result = 'test';
  const test = (value: string) => {
    return Promise.resolve(value + 'test');
  };
  test.clear = () => {
    result = 'clear';
  };
  const layer = apiLayerCreate();
  const getApi = createGetApi(layer, test, require.resolve(MOCK_RESULT));
  const getApiWithNoClear = createGetApi(layer, stringSucks, require.resolve(MOCK_RESULT));
  const setApi = createSetApi(layer, stringSucks, require.resolve(MOCK_RESULT), [getApi, getApiWithNoClear]);
  await setApi('test');
  expect(result).toBe('clear');
});
