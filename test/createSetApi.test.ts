/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSetApi, apiLayerCreate, isApiLayerFunction, createGetApi, NodeMockResolver } from '../src/index';

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

function cancellableFunction(input: string): Promise<string> {
  const res = new Promise<string>((resolve) => {
    resolve(`cancellable ${input}`);
  });
  (res as any).cancel = () => {
    return 'cancelled';
  };
  return res;
}

const apiLayer = apiLayerCreate({ installGlobal: false });
const mockLayer = apiLayerCreate({ mockMode: true, mockDelay: 0, mockResolver: resolver, installGlobal: false });

test('Default behavior', async () => {
  let original = 'test';
  const api = createSetApi(stringSucks, MOCK_FUNCTION, undefined, { apiLayer });
  original = await api(original);
  expect(isApiLayerFunction(api)).toBeTruthy();
  expect(original).toBe('test sucks');
});

test('Setting api layer with mock mode', async () => {
  let original = 'test';
  const api = createSetApi(stringSucks, MOCK_FUNCTION, [], { apiLayer: mockLayer });
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
  const api = createSetApi(stringSucks, MOCK_FUNCTION, [], { apiLayer: delayedLayer });
  original = await api(original);
  const finish = Date.now();
  expect(original).toBe('test mock');
  expect(finish - start).toBeGreaterThanOrEqual(3000);
});

test('Not supplying a mock function throws error', () => {
  expect(() => {
    createSetApi(undefined as any, MOCK_RESULT, [], { apiLayer });
  }).toThrowError();
});

test('Not supplying a proper function throws error', () => {
  expect(() => {
    createSetApi(stringSucks, undefined as any, [], { apiLayer });
  }).toThrowError();
});

test('Error results is properly returned', () => {
  const errorApi = createSetApi(errorTest, MOCK_RESULT, [], { apiLayer });
  return errorApi('test').catch((error) => {
    expect(error).toBe('error result');
  });
});

test('Trying to assign api layer functions throws error', () => {
  const getApi = createSetApi(stringSucks, MOCK_RESULT, [], { apiLayer });
  expect(() => {
    createSetApi(getApi, MOCK_RESULT, [], { apiLayer });
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
  const getApi = createGetApi(test, MOCK_RESULT, { apiLayer: layer });
  const getApiWithNoClear = createGetApi(stringSucks, MOCK_RESULT, { apiLayer: layer });
  const setApi = createSetApi(stringSucks, MOCK_RESULT, [getApi, getApiWithNoClear], { apiLayer: layer });
  await setApi('test');
  expect(result).toBe('clear');
});

test('Using a function for mock', async () => {
  const mock = () => {
    return Promise.resolve('callback mock');
  };
  const api = createSetApi(stringSucks, mock, undefined, { apiLayer: mockLayer });
  const result = await api('test');
  expect(result).toBe('callback mock');
});

test('Propagating cancellable promise return values in wrapped promise', async () => {
  const getApi = createSetApi(cancellableFunction, MOCK_RESULT, undefined, { apiLayer });
  const res = getApi('test');
  expect(typeof (res as any).cancel).toBe('function');
  const cancelResult = (res as any).cancel();
  expect(cancelResult).toBe('cancelled');
});
