/* eslint-disable @typescript-eslint/no-unused-vars */
import { createGetApi, apiLayerCreate, isApiLayerFunction, NodeMockResolver } from './index';

const resolver = new NodeMockResolver();
const MOCK_FUNCTION = 'samples/api/mock/mockModuleExports.js';
const MOCK_JSON = 'samples/api/mock/mockComplex.json';

function stringSucks(input: string): Promise<string> {
  const result = `${input} sucks`;
  return Promise.resolve(result);
}

function errorTest(input: string): Promise<string> {
  return Promise.reject('error result');
}

const productionLayer = apiLayerCreate({ mockMode: false, mockDelay: 0, installGlobal: false });
const mockLayer = apiLayerCreate({ mockMode: true, mockDelay: 0, mockResolver: resolver, installGlobal: false });
const apiFunction = createGetApi(stringSucks, MOCK_FUNCTION, undefined, productionLayer);

test('Default behavior with production', async () => {
  let original = 'test';
  original = await apiFunction(original);
  expect(isApiLayerFunction(apiFunction)).toBeTruthy();
  expect(original).toBe('test sucks');
});

test('Setting function name works correctly', async () => {
  const original = 'test';
  const api = createGetApi(stringSucks, 'samples/api/mock/mockModuleExports.js', 'my name', mockLayer);
  expect(isApiLayerFunction(api)).toBeTruthy();
  expect(api.apiName).toBe('my name');
});

test('Mock response with module exports', async () => {
  let original = 'test';
  const api = createGetApi(stringSucks, 'samples/api/mock/mockModuleExports.js', undefined, mockLayer);
  original = await api(original);
  expect(original).toBe('test mock');
});

test('Mock response with multiple module exports', async () => {
  let original = 'test';
  const api = createGetApi(stringSucks, 'samples/api/mock/mockMultiModuleExport.js', undefined, mockLayer);
  original = await api(original);
  expect(typeof original).toBe('object');
});

test('Mock response with simple json response', async () => {
  let original = 'test';
  const api = createGetApi(stringSucks, 'samples/api/mock/mockSimple.json', undefined, mockLayer);
  original = await api(original);
  expect(original).toBe('mock test sucks');
});

test('Mock response with complex json response', async () => {
  let original = 'test';
  const api = createGetApi(stringSucks, 'samples/api/mock/mockComplex.json', undefined, mockLayer);
  original = await api(original);
  expect(typeof original).toBe('object');
});

test('Mock response with promise response', async () => {
  let original = 'test';
  const api = createGetApi(stringSucks, 'samples/api/mock/mockPromiseExport.js', undefined, mockLayer);
  original = await api(original);
  expect(original).toBe('test mock promise');
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
  const api = createGetApi(stringSucks, MOCK_FUNCTION, undefined, delayedLayer);
  original = await api(original);
  const finish = Date.now();
  expect(original).toBe('test mock');
  expect(finish - start).toBeGreaterThanOrEqual(3000);
});

test('Not supplying a mock function throws error', () => {
  expect(() => {
    createGetApi(undefined as any, MOCK_JSON, undefined, mockLayer);
  }).toThrowError();
});

test('Not supplying a proper mock string throws error', () => {
  expect(() => {
    createGetApi(stringSucks, null as any, undefined, mockLayer);
  }).toThrowError();
});

test('Error results are properly returned', async () => {
  const errorApi = createGetApi(errorTest, MOCK_JSON, undefined, productionLayer);
  expect(errorApi('test')).rejects.toEqual('error result');
});

test('Trying to assign api layer function throws error', () => {
  const getApi = createGetApi(stringSucks, MOCK_JSON, undefined, productionLayer);
  expect(() => {
    createGetApi(getApi, MOCK_JSON, undefined, productionLayer);
  }).toThrowError();
});

test('Invalid mock path throws an error', async () => {
  const getApi = createGetApi(stringSucks, 'invalid path', undefined, mockLayer);
  expect(getApi('hello')).rejects.toBeTruthy();
});
