/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSetApi, apiLayerCreate, isApiLayerFunction, apiLayerMockMode, createGetApi } from './index';

function stringSucks(input: string): Promise<string> {
  const result = `${input} sucks`;
  return Promise.resolve(result);
}

function mockStringSucks(input: string): Promise<string> {
  const result = `mock ${input} sucks`;
  return Promise.resolve(result);
}

function errorTest(input: string): Promise<string> {
  return Promise.reject('error result');
}

const apiLayer = apiLayerCreate({ mockDelay: 0 });
const apiFunction = createSetApi(apiLayer, stringSucks, mockStringSucks);

test('Default behavior', async () => {
  let original = 'test';
  original = await apiFunction(original);
  expect(isApiLayerFunction(apiFunction)).toBeTruthy();
  expect(original).toBe('test sucks');
});

test('Calling mock function directly', async () => {
  let original = 'test';
  original = await (apiFunction as any).mock(original);
  expect(original).toBe('mock test sucks');
});

test('Setting api layer mock mode to on', async () => {
  let original = 'test';
  apiLayerMockMode(apiLayer, true);
  original = await apiFunction(original);
  expect(original).toBe('mock test sucks');
});

test('Change mock delay increases delay of mock response', async () => {
  let original = 'test';
  apiLayerMockMode(apiLayer, true, 2000, true);
  const start = Date.now();
  original = await apiFunction(original);
  const finish = Date.now();
  expect(original).toBe('mock test sucks');
  expect(finish - start).toBeGreaterThanOrEqual(2000);
});

test('Not supplying a mock function throws error', () => {
  expect(() => {
    createSetApi(apiLayer, undefined as any, mockStringSucks);
  }).toThrowError();
});

test('Not supplying a proper function throws error', () => {
  expect(() => {
    createSetApi(apiLayer, stringSucks, undefined as any);
  }).toThrowError();
});

test('Error results is properly returned', () => {
  const errorApi = createSetApi(apiLayer, errorTest, mockStringSucks);
  return errorApi('test').catch((error) => {
    expect(error).toBe('error result');
  });
});

test('Trying to assign api layer functions throws error', () => {
  const getApi = createSetApi(apiLayer, stringSucks, mockStringSucks);
  expect(() => {
    createSetApi(apiLayer, getApi, mockStringSucks);
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
  const getApi = createGetApi(layer, test, mockStringSucks);
  const getApiWithNoClear = createGetApi(layer, stringSucks, mockStringSucks);
  const setApi = createSetApi(layer, stringSucks, mockStringSucks, [getApi, getApiWithNoClear]);
  await setApi('test');
  expect(result).toBe('clear');
});
