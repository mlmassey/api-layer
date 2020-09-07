import { apiLayerCreate, overrideApi, apiLayerMockMode, createGetApi } from 'index';

const apiLayer = apiLayerCreate();

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

function overrideFunc(input: string): Promise<string> {
  return Promise.resolve(`${input} override`);
}

function overrideFunc2(input: string): Promise<string> {
  return Promise.resolve(`${input} override2`);
}

test('Creating an api override works', async () => {
  const getApi = createGetApi(apiLayer, stringSucks, mockStringSucks);
  overrideApi(apiLayer, getApi, overrideFunc);
  const result = await getApi('test');
  expect(result).toEqual('test override');
});

test('Passing in a non-api function throws an error', async () => {
  const testFunc = (input: string) => {
    return Promise.resolve(input);
  };
  expect(() => overrideApi(apiLayer, testFunc as any, overrideFunc)).toThrowError();
});

test('Passing in an api function throws an error', async () => {
  const getApi = createGetApi(apiLayer, stringSucks, mockStringSucks);
  expect(() => overrideApi(apiLayer, getApi, getApi)).toThrowError();
});

test('Setting to mock mode for overrides still returns the same value', async () => {
  const getApi = createGetApi(apiLayer, stringSucks, mockStringSucks);
  overrideApi(apiLayer, getApi, overrideFunc);
  apiLayerMockMode(apiLayer, true);
  const result = await getApi('test');
  expect(result).toEqual('test override');
});

test('Creating multiple mocks overrides the previous', async () => {
  const getApi = createGetApi(apiLayer, stringSucks, mockStringSucks);
  overrideApi(apiLayer, getApi, overrideFunc);
  overrideApi(apiLayer, getApi, overrideFunc2);
  apiLayerMockMode(apiLayer, false);
  const result = await getApi('test');
  expect(result).toEqual('test override2');
});

test('Removing an override works ok', async () => {
  const getApi = createGetApi(apiLayer, stringSucks, mockStringSucks);
  const removeOverride = overrideApi(apiLayer, getApi, overrideFunc);
  apiLayerMockMode(apiLayer, false);
  removeOverride();
  const result = await getApi('test');
  expect(result).toEqual('test sucks');
});

test('Removing an override does nothing if already removed', async () => {
  const getApi = createGetApi(apiLayer, stringSucks, mockStringSucks);
  const removeOverride = overrideApi(apiLayer, getApi, overrideFunc);
  const override2 = overrideApi(apiLayer, getApi, overrideFunc2);
  apiLayerMockMode(apiLayer, false);
  removeOverride();
  const result = await getApi('test');
  expect(result).toEqual('test override2');
});
