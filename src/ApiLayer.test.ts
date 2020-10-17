/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  apiLayerCreate,
  ApiLayerOptions,
  createGetApi,
  isApiLayerFunction,
  apiLayerSetOptions,
  apiLayerClearCache,
  createSetApi,
  NodeMockResolver,
} from './index';
import { getGlobalLayer, clearGlobalLayer } from './ApiLayerCommon';

const resolver = new NodeMockResolver();
const MOCK_RESULT = 'samples/api/mock/mockModuleExports.js';

function stringSucks(input: string): Promise<string> {
  const result = `${input} sucks`;
  return Promise.resolve(result);
}

test('ApiLayer fails if no mockResolver and mockMode is true', () => {
  expect(() => {
    apiLayerCreate({ mockMode: true, installGlobal: false });
  }).toThrow(Error);
});

test('ApiLayer change mock delay', async () => {
  const options: ApiLayerOptions = {
    mockMode: true,
    mockDelay: 0,
    mockResolver: resolver,
    installGlobal: false,
  };
  const apiLayer = apiLayerCreate(options);
  const getApi = createGetApi(stringSucks, MOCK_RESULT, undefined, apiLayer);
  let start = Date.now();
  await getApi('hello');
  let finish = Date.now();
  expect(finish - start).toBeLessThan(1000);
  // Now change the delay to make sure it also changes
  options.mockDelay = 1000;
  apiLayerSetOptions(options, true, apiLayer);
  start = Date.now();
  await getApi('hello again');
  finish = Date.now();
  expect(finish - start).toBeGreaterThanOrEqual(1000);
});

test('isApiLayerFunction working properly', () => {
  const apiLayer = apiLayerCreate({ installGlobal: false });
  const getApi = createGetApi(stringSucks, MOCK_RESULT, undefined, apiLayer);
  expect(isApiLayerFunction(getApi)).toBe(true);
  const test = () => {
    return Promise.resolve('test');
  };
  expect(isApiLayerFunction(test)).toBe(false);
  expect(isApiLayerFunction(null)).toBe(false);
  expect(isApiLayerFunction(undefined)).toBe(false);
  expect(isApiLayerFunction('hello')).toBe(false);
  expect(isApiLayerFunction({ fart: true })).toBe(false);
});

test('Setting ApiLayer with nothing returns a new object of current options', () => {
  const apiLayer = apiLayerCreate({ installGlobal: false });
  const options = apiLayerSetOptions(undefined, false, apiLayer);
  expect(typeof options).toBe('object');
  expect(apiLayer.options !== options).toBeTruthy();
});

test('ApiLayer default option is mock mode off', () => {
  const apiLayer = apiLayerCreate({ installGlobal: false });
  expect(apiLayer.options.mockMode).toBeFalsy();
});

test('Creating an api layer installs it globally by default', () => {
  const apiLayer = apiLayerCreate();
  const same = getGlobalLayer() === apiLayer;
  clearGlobalLayer();
  expect(same).toBeTruthy();
});

test('Creating an api without installGlobal does not alter global layer', () => {
  const global = apiLayerCreate();
  const local = apiLayerCreate({ installGlobal: false });
  const same = global === local;
  clearGlobalLayer();
  expect(same).toBeFalsy();
});

test('Creating multiple global ApiLayers causes an exception', () => {
  apiLayerCreate();
  try {
    apiLayerCreate();
    clearGlobalLayer();
    expect('An exception should occur so this code should never be reached').toBeFalsy();
  } catch (e) {
    clearGlobalLayer();
    expect(e).toBeInstanceOf(Error);
  }
});

test('Setting ApiLayer options returns a new object', () => {
  const options: ApiLayerOptions = {
    mockMode: true,
    mockResolver: resolver.resolve,
    installGlobal: false,
  };
  const apiLayer = apiLayerCreate(options);
  let newOptions = apiLayerSetOptions(undefined, false, apiLayer);
  expect(typeof newOptions).toBe('object');
  expect(apiLayer.options !== newOptions).toBeTruthy();
  expect(newOptions !== options).toBeTruthy();
  newOptions = apiLayerSetOptions({ mockMode: false }, false, apiLayer);
  expect(typeof newOptions).toBe('object');
  expect(apiLayer.options !== newOptions).toBeTruthy();
  expect(newOptions !== options).toBeTruthy();
  expect(newOptions.mockMode).toBeTruthy();
});

test('Clear the ApiLayer cache works for all getApis', async () => {
  const apiLayer = apiLayerCreate({ installGlobal: false });
  let result = '';
  const get1Func = (value: string) => {
    return Promise.resolve(`${value} get1`);
  };
  get1Func.clear = () => {
    result += ' get1';
  };
  const get1 = createGetApi(get1Func, MOCK_RESULT, undefined, apiLayer);
  const get2Func = (value: string) => {
    return Promise.resolve(`${value} get2`);
  };
  get2Func.clear = () => {
    result += ' get2';
  };
  const get2 = createGetApi(get2Func, MOCK_RESULT, undefined, apiLayer);
  const set1Func = (value: string) => {
    return Promise.resolve(`${value} set1`);
  };
  set1Func.clear = () => {
    result += ' set1';
  };
  const set1 = createSetApi(stringSucks, MOCK_RESULT, [], undefined, apiLayer);
  apiLayerClearCache(apiLayer);
  await get1('hello');
  await get2('hello');
  await set1('hello');
  expect(result.indexOf('get1')).toBeGreaterThanOrEqual(0);
  expect(result.indexOf('get2')).toBeGreaterThanOrEqual(0);
  expect(result.indexOf('set1')).toBe(-1);
  // Now lets call them again to make sure that cache is not cleared again
  result = '';
  await get1('hello');
  await get2('hello');
  await set1('hello');
  expect(result.length).toBe(0);
});

test('ApiLayer cannot change mockMode once ApiLayer is created', async () => {
  const newLayer = apiLayerCreate({ mockMode: true, mockResolver: resolver.resolve, installGlobal: false });
  let options = apiLayerSetOptions(undefined, false, newLayer);
  options.mockMode = false;
  options = apiLayerSetOptions(options, false, newLayer);
  expect(options.mockMode).toBeTruthy();
});
