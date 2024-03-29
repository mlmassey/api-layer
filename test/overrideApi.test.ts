/* eslint-disable @typescript-eslint/no-unused-vars */
import { overrideApi, createGetApi, setMockFunction } from '../src';

function stringSucks(input: string): Promise<string> {
  const result = `${input} sucks`;
  return Promise.resolve(result);
}

function mockFunction(input: string): Promise<string> {
  const result = `${input} mock`;
  return Promise.resolve(result);
}

function overrideFunc(input: string): Promise<string> {
  return Promise.resolve(`${input} override`);
}

function overrideFunc2(input: string): Promise<string> {
  return Promise.resolve(`${input} override2`);
}

test('Creating an api override works', async () => {
  const getApi = createGetApi(stringSucks);
  overrideApi(getApi, overrideFunc);
  const result = await getApi('test');
  expect(result).toEqual('test override');
});

test('Passing in a non-api function throws an error', async () => {
  const testFunc = (input: string) => {
    return Promise.resolve(input);
  };
  expect(() => overrideApi(testFunc as any, overrideFunc)).toThrowError();
});

test('Passing in an api function throws an error', async () => {
  const getApi = createGetApi(stringSucks);
  expect(() => overrideApi(getApi, getApi)).toThrowError();
});

test('Setting to mock mode for overrides still returns the same value', async () => {
  const getApi = createGetApi(stringSucks);
  setMockFunction(getApi, mockFunction);
  overrideApi(getApi, overrideFunc);
  const result = await getApi('test');
  expect(result).toEqual('test override');
});

test('Creating multiple mocks overrides the previous', async () => {
  const getApi = createGetApi(stringSucks);
  overrideApi(getApi, overrideFunc);
  overrideApi(getApi, overrideFunc2);
  const result = await getApi('test');
  expect(result).toEqual('test override2');
});

test('Removing an override works ok', async () => {
  const getApi = createGetApi(stringSucks);
  const removeOverride = overrideApi(getApi, overrideFunc);
  removeOverride();
  const result = await getApi('test');
  expect(result).toEqual('test sucks');
});

test('Removing an override does nothing if already removed', async () => {
  const getApi = createGetApi(stringSucks);
  const removeOverride = overrideApi(getApi, overrideFunc);
  const override2 = overrideApi(getApi, overrideFunc2);
  removeOverride();
  const result = await getApi('test');
  expect(result).toEqual('test override2');
});
