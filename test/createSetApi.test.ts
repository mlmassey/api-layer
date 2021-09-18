/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSetApi, isApiLayerFunction, createGetApi } from '../src/index';

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

test('Default behavior', async () => {
  let original = 'test';
  const api = createSetApi(stringSucks);
  original = await api(original);
  expect(isApiLayerFunction(api)).toBeTruthy();
  expect(original).toBe('test sucks');
});

test('Error results is properly returned', () => {
  const errorApi = createSetApi(errorTest);
  return errorApi('test').catch((error) => {
    expect(error).toBe('error result');
  });
});

test('Trying to assign api layer functions throws error', () => {
  const getApi = createSetApi(stringSucks);
  expect(() => {
    createSetApi(getApi);
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
  const getApi = createGetApi(test);
  const getApiWithNoClear = createGetApi(stringSucks);
  const setApi = createSetApi(stringSucks, [getApi, getApiWithNoClear]);
  await setApi('test');
  expect(result).toBe('clear');
});

test('Propagating cancellable promise return values in wrapped promise', async () => {
  const getApi = createSetApi(cancellableFunction);
  const res = getApi('test');
  expect(typeof (res as any).cancel).toBe('function');
  const cancelResult = (res as any).cancel();
  expect(cancelResult).toBe('cancelled');
});
