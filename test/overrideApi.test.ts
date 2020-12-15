/* eslint-disable @typescript-eslint/no-unused-vars */
import { apiLayerCreate, overrideApi, createGetApi, NodeMockResolver } from '../src/index';

const mockResolver = new NodeMockResolver();
const MOCK_RESULT = 'samples/api/mock/mockSimple.json';

const apiLayer = apiLayerCreate({ installGlobal: false });

function stringSucks(input: string): Promise<string> {
  const result = `${input} sucks`;
  return Promise.resolve(result);
}

function overrideFunc(input: string): Promise<string> {
  return Promise.resolve(`${input} override`);
}

function overrideFunc2(input: string): Promise<string> {
  return Promise.resolve(`${input} override2`);
}

test('Creating an api override works', async () => {
  const getApi = createGetApi(stringSucks, MOCK_RESULT, undefined, apiLayer);
  overrideApi(getApi, overrideFunc, apiLayer);
  const result = await getApi('test');
  expect(result).toEqual('test override');
});

test('Passing in a non-api function throws an error', async () => {
  const testFunc = (input: string) => {
    return Promise.resolve(input);
  };
  expect(() => overrideApi(testFunc as any, overrideFunc, apiLayer)).toThrowError();
});

test('Passing in an api function throws an error', async () => {
  const getApi = createGetApi(stringSucks, MOCK_RESULT, undefined, apiLayer);
  expect(() => overrideApi(getApi, getApi, apiLayer)).toThrowError();
});

test('Setting to mock mode for overrides still returns the same value', async () => {
  const mockLayer = apiLayerCreate({ mockMode: true, mockResolver, installGlobal: false });
  const getApi = createGetApi(stringSucks, MOCK_RESULT, undefined, mockLayer);
  overrideApi(getApi, overrideFunc, mockLayer);
  const result = await getApi('test');
  expect(result).toEqual('test override');
});

test('Creating multiple mocks overrides the previous', async () => {
  const getApi = createGetApi(stringSucks, MOCK_RESULT, undefined, apiLayer);
  overrideApi(getApi, overrideFunc, apiLayer);
  overrideApi(getApi, overrideFunc2, apiLayer);
  const result = await getApi('test');
  expect(result).toEqual('test override2');
});

test('Removing an override works ok', async () => {
  const getApi = createGetApi(stringSucks, MOCK_RESULT, undefined, apiLayer);
  const removeOverride = overrideApi(getApi, overrideFunc, apiLayer);
  removeOverride();
  const result = await getApi('test');
  expect(result).toEqual('test sucks');
});

test('Removing an override does nothing if already removed', async () => {
  const getApi = createGetApi(stringSucks, MOCK_RESULT, undefined, apiLayer);
  const removeOverride = overrideApi(getApi, overrideFunc, apiLayer);
  const override2 = overrideApi(getApi, overrideFunc2, apiLayer);
  removeOverride();
  const result = await getApi('test');
  expect(result).toEqual('test override2');
});
