/* eslint-disable @typescript-eslint/no-unused-vars */
import { createGetApi, isApiLayerFunction } from '../src';

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

const apiFunction = createGetApi(stringSucks);

test('Default behavior with production', async () => {
  let original = 'test';
  original = await apiFunction(original);
  expect(isApiLayerFunction(apiFunction)).toBeTruthy();
  expect(original).toBe('test sucks');
});

test('Setting function name works correctly', async () => {
  const original = 'test';
  const api = createGetApi(stringSucks, {
    apiName: 'my name',
  });
  expect(isApiLayerFunction(api)).toBeTruthy();
  expect(api.apiName).toBe('my name');
});

test('Error results are properly returned', async () => {
  const errorApi = createGetApi(errorTest);
  expect(errorApi('test')).rejects.toEqual('error result');
});

test('Trying to assign api layer function throws error', () => {
  const getApi = createGetApi(stringSucks);
  expect(() => {
    createGetApi(getApi);
  }).toThrowError();
});

test('Propagating cancellable promise return values in wrapped promise', async () => {
  const getApi = createGetApi(cancellableFunction);
  const res = getApi('test');
  expect(typeof (res as any).cancel).toBe('function');
  const cancelResult = (res as any).cancel();
  expect(cancelResult).toBe('cancelled');
});
