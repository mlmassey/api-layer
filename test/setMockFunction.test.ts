/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  createGetApi,
  setMockFunction,
  isApiLayerFunction,
  createSetApi,
  createMockFunction,
  overrideApi,
} from '../src';

function stringSucks(input: string): Promise<string> {
  const result = `${input} sucks`;
  return Promise.resolve(result);
}

function mockFunction(input: string): Promise<string> {
  const result = `${input} mock`;
  return Promise.resolve(result);
}

function errorTest(input: string): Promise<string> {
  return Promise.reject('error result');
}

test('Setting a mock function for a GET', async () => {
  let original = 'test';
  const getApi = createGetApi(stringSucks);
  setMockFunction(getApi, mockFunction);
  original = await getApi(original);
  expect(isApiLayerFunction(getApi)).toBeTruthy();
  expect(original).toBe('test mock');
});

test('Setting a mock function for a SET', async () => {
  let original = 'test';
  const getApi = createSetApi(stringSucks);
  setMockFunction(getApi, mockFunction);
  original = await getApi(original);
  expect(isApiLayerFunction(getApi)).toBeTruthy();
  expect(original).toBe('test mock');
});

test('Setting a mock function with another apiFunction fails', async () => {
  const getApi = createGetApi(stringSucks);
  expect(() => setMockFunction(getApi, getApi)).toThrowError();
});

test('Setting a mock function using createMockFunction', async () => {
  const getApi = createGetApi(stringSucks);
  const mock = createMockFunction('new mock');
  setMockFunction(getApi, mock);
  const result = await getApi('hello');
  expect(result).toBe('new mock');
});

test('Setting a mock function and then overriding', async () => {
  const getApi = createGetApi(stringSucks);
  const mock = createMockFunction('new mock');
  setMockFunction(getApi, mock);
  const removeOverride = overrideApi(getApi, (input: string) => {
    return Promise.resolve('override');
  });
  let res = await getApi('hello');
  expect(res).toBe('override');
  // Now remove the override
  removeOverride();
  res = await getApi('hello');
  // Expect result to be a mock
  expect(res).toBe('new mock');
});
