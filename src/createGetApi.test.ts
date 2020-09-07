import { createGetApi, apiLayerCreate, isApiLayerFunction, apiLayerMockMode } from './index';

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
let apiFunction = createGetApi(apiLayer, stringSucks, mockStringSucks);

test('Default behavior', async () => {
  let original = 'test';
  original = await apiFunction(original);
  expect(isApiLayerFunction(apiFunction)).toBeTruthy();
  expect(original).toBe('test sucks');
});

test('Setting apiName alters the api name', () => {
  apiFunction = createGetApi(apiLayer, stringSucks, mockStringSucks, 'newName');
  expect((apiFunction as any).apiName).toContain('newName');
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
  apiLayerMockMode(apiLayer, true, 3000, true);
  const start = Date.now();
  original = await apiFunction(original);
  const finish = Date.now();
  expect(original).toBe('mock test sucks');
  expect(finish - start).toBeGreaterThanOrEqual(3000);
});

test('Not supplying a mock function throws error', () => {
  expect(() => {
    createGetApi(apiLayer, undefined as any, mockStringSucks);
  }).toThrowError();
});

test('Not supplying a proper function throws error', () => {
  expect(() => {
    createGetApi(apiLayer, stringSucks, undefined as any);
  }).toThrowError();
});

test('Error results are properly returned', async () => {
  const errorApi = createGetApi(apiLayer, errorTest, mockStringSucks);
  expect(errorApi('test')).rejects.toEqual('error result');
});

test('Trying to assign api layer functions throws error', () => {
  const getApi = createGetApi(apiLayer, stringSucks, mockStringSucks);
  expect(() => {
    createGetApi(apiLayer, getApi, mockStringSucks);
  }).toThrowError();
});
