/* eslint-disable @typescript-eslint/no-unused-vars */
import { createGetApi, apiLayerCreate, isApiLayerFunction } from './index';

const MOCK_FUNCTION = '../samples/api/mock/mockModuleExports.js';
const MOCK_JSON = '../samples/api/mock/mockComplex.json';

function stringSucks(input: string): Promise<string> {
  const result = `${input} sucks`;
  return Promise.resolve(result);
}

function errorTest(input: string): Promise<string> {
  return Promise.reject('error result');
}

const productionLayer = apiLayerCreate({ mockMode: false, mockDelay: 0 });
const mockLayer = apiLayerCreate({ mockMode: true, mockDelay: 0 });
const apiFunction = createGetApi(productionLayer, stringSucks, require.resolve(MOCK_FUNCTION));

test('Default behavior with production', async () => {
  let original = 'test';
  original = await apiFunction(original);
  expect(isApiLayerFunction(apiFunction)).toBeTruthy();
  expect(original).toBe('test sucks');
});

test('Setting function name works correctly', async () => {
  const original = 'test';
  const api = createGetApi(
    mockLayer,
    stringSucks,
    require.resolve('../samples/api/mock/mockModuleExports.js'),
    'my name',
  );
  expect(isApiLayerFunction(api)).toBeTruthy();
  expect(api.apiName).toBe('my name');
});

test('Mock response with module exports', async () => {
  let original = 'test';
  const api = createGetApi(mockLayer, stringSucks, require.resolve('../samples/api/mock/mockModuleExports.js'));
  original = await api(original);
  expect(original).toBe('test mock');
});

test('Mock response with multiple module exports', async () => {
  let original = 'test';
  const api = createGetApi(mockLayer, stringSucks, require.resolve('../samples/api/mock/mockMultiModuleExport.js'));
  original = await api(original);
  expect(typeof original).toBe('object');
});

test('Mock response with simple json response', async () => {
  let original = 'test';
  const api = createGetApi(mockLayer, stringSucks, require.resolve('../samples/api/mock/mockSimple.json'));
  original = await api(original);
  expect(original).toBe('mock test sucks');
});

test('Mock response with complex json response', async () => {
  let original = 'test';
  const api = createGetApi(mockLayer, stringSucks, require.resolve('../samples/api/mock/mockComplex.json'));
  original = await api(original);
  expect(typeof original).toBe('object');
});

test('Mock response with promise response', async () => {
  let original = 'test';
  const api = createGetApi(mockLayer, stringSucks, require.resolve('../samples/api/mock/mockPromiseExport.js'));
  original = await api(original);
  expect(original).toBe('test mock promise');
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
    createGetApi(mockLayer, undefined as any, require.resolve(MOCK_JSON));
  }).toThrowError();
});

test('Not supplying a proper mock string throws error', () => {
  expect(() => {
    createGetApi(mockLayer, stringSucks, null as any);
  }).toThrowError();
});

test('Error results are properly returned', async () => {
  const errorApi = createGetApi(productionLayer, errorTest, require.resolve(MOCK_JSON));
  expect(errorApi('test')).rejects.toEqual('error result');
});

test('Trying to assign api layer functions throws error', () => {
  const getApi = createGetApi(productionLayer, stringSucks, require.resolve(MOCK_JSON));
  expect(() => {
    createGetApi(productionLayer, getApi, require.resolve(MOCK_JSON));
  }).toThrowError();
});

test('Invalid mock path throws an error', async () => {
  const getApi = createGetApi(productionLayer, stringSucks, 'invalid path');
  expect(getApi('hello')).rejects.toBeTruthy();
});

test('ApiLayer onMockLoad option handler is called', async () => {
  const onMockLoad = (api: any) => {
    expect(api.mock).toBe('invalid path');
    expect(api.apiName).toBe('my function');
    return Promise.resolve('onMockLoad called');
  };
  const newLayer = apiLayerCreate({ mockMode: true, onMockLoad });
  const newApi = createGetApi(newLayer, stringSucks, 'invalid path', 'my function');
  const result = await newApi('test');
  expect(result).toBe('onMockLoad called');
});
