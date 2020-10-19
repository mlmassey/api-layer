/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSetApi, apiLayerCreate, isApiLayerFunction, createGetApi, NodeMockResolver } from './index';

const resolver = new NodeMockResolver();
const MOCK_FUNCTION = 'samples/mock/mockModuleExports.js';
const MOCK_RESULT = 'samples/mock/mockComplex.json';

function stringSucks(input: string): Promise<string> {
  const result = `${input} sucks`;
  return Promise.resolve(result);
}

function errorTest(input: string): Promise<string> {
  return Promise.reject('error result');
}

const apiLayer = apiLayerCreate({ installGlobal: false });
const mockLayer = apiLayerCreate({ mockMode: true, mockDelay: 0, mockResolver: resolver, installGlobal: false });

test('Default behavior', async () => {
  let original = 'test';
  const api = createSetApi(stringSucks, MOCK_FUNCTION, undefined, undefined, apiLayer);
  original = await api(original);
  expect(isApiLayerFunction(api)).toBeTruthy();
  expect(original).toBe('test sucks');
});

test('Setting api layer with mock mode', async () => {
  let original = 'test';
  const api = createSetApi(stringSucks, MOCK_FUNCTION, [], undefined, mockLayer);
  original = await api(original);
  expect(isApiLayerFunction(api)).toBeTruthy();
  expect(original).toBe('test mock');
});

test('Change mock delay increases delay of mock response', async () => {
  const delayedLayer = apiLayerCreate({
    mockMode: true,
    mockDelay: 3000,
    mockResolver: resolver,
    installGlobal: false,
  });
  let original = 'test';
  const start = Date.now();
  const api = createSetApi(stringSucks, MOCK_FUNCTION, [], undefined, delayedLayer);
  original = await api(original);
  const finish = Date.now();
  expect(original).toBe('test mock');
  expect(finish - start).toBeGreaterThanOrEqual(3000);
});

test('Not supplying a mock function throws error', () => {
  expect(() => {
    createSetApi(undefined as any, MOCK_RESULT, [], undefined, apiLayer);
  }).toThrowError();
});

test('Not supplying a proper function throws error', () => {
  expect(() => {
    createSetApi(stringSucks, undefined as any, [], undefined, apiLayer);
  }).toThrowError();
});

test('Error results is properly returned', () => {
  const errorApi = createSetApi(errorTest, MOCK_RESULT, [], undefined, apiLayer);
  return errorApi('test').catch((error) => {
    expect(error).toBe('error result');
  });
});

test('Trying to assign api layer functions throws error', () => {
  const getApi = createSetApi(stringSucks, MOCK_RESULT, [], undefined, apiLayer);
  expect(() => {
    createSetApi(getApi, MOCK_RESULT, [], undefined, apiLayer);
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
  const layer = apiLayerCreate({ installGlobal: false });
  const getApi = createGetApi(test, MOCK_RESULT, undefined, layer);
  const getApiWithNoClear = createGetApi(stringSucks, MOCK_RESULT, undefined, layer);
  const setApi = createSetApi(stringSucks, MOCK_RESULT, [getApi, getApiWithNoClear], undefined, layer);
  await setApi('test');
  expect(result).toBe('clear');
});
