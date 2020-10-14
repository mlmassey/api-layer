/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  apiLayerCreate,
  ApiLayerOptions,
  createGetApi,
  isApiLayerFunction,
  apiLayerSetOptions,
  apiLayerClearCache,
  createSetApi,
} from './index';

const MOCK_RESULT = '../samples/api/mock/mockModuleExports.js';

function stringSucks(input: string): Promise<string> {
  const result = `${input} sucks`;
  return Promise.resolve(result);
}

test('ApiLayer change mock delay', async () => {
  const options: ApiLayerOptions = {
    mockMode: true,
    mockDelay: 0,
  };
  const apiLayer = apiLayerCreate(options);
  const getApi = createGetApi(apiLayer, stringSucks, require.resolve(MOCK_RESULT));
  let start = Date.now();
  await getApi('hello');
  let finish = Date.now();
  expect(finish - start).toBeLessThan(1000);
  // Now change the delay to make sure it also changes
  options.mockDelay = 1000;
  apiLayerSetOptions(apiLayer, options);
  start = Date.now();
  await getApi('hello again');
  finish = Date.now();
  expect(finish - start).toBeGreaterThanOrEqual(1000);
});

test('isApiLayerFunction working properly', () => {
  const apiLayer = apiLayerCreate();
  const getApi = createGetApi(apiLayer, stringSucks, MOCK_RESULT);
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
  const apiLayer = apiLayerCreate();
  const options = apiLayerSetOptions(apiLayer);
  expect(typeof options).toBe('object');
  expect(apiLayer.options !== options).toBeTruthy();
});

test('ApiLayer default option is mock mode off', () => {
  const apiLayer = apiLayerCreate();
  expect(apiLayer.options.mockMode).toBeFalsy();
});

test('Setting ApiLayer options returns a new object', () => {
  const options: ApiLayerOptions = {
    mockMode: true,
  };
  const apiLayer = apiLayerCreate(options);
  expect(apiLayer.options.mockMode).toBeTruthy();
  let newOptions = apiLayerSetOptions(apiLayer);
  expect(typeof newOptions).toBe('object');
  expect(apiLayer.options !== newOptions).toBeTruthy();
  expect(newOptions !== options).toBeTruthy();
  newOptions = apiLayerSetOptions(apiLayer, { mockMode: false });
  expect(typeof newOptions).toBe('object');
  expect(apiLayer.options !== newOptions).toBeTruthy();
  expect(newOptions !== options).toBeTruthy();
  expect(newOptions.mockMode).toBeTruthy();
});

test('Clear the ApiLayer cache works for all getApis', () => {
  const apiLayer = apiLayerCreate();
  let result = '';
  const get1Func = (value: string) => {
    return Promise.resolve('value ' + 'get1');
  };
  get1Func.clear = () => {
    result += ' get1';
  };
  const get1 = createGetApi(apiLayer, get1Func, MOCK_RESULT);
  const get2Func = (value: string) => {
    return Promise.resolve('value ' + 'get2');
  };
  get2Func.clear = () => {
    result += ' get2';
  };
  const get2 = createGetApi(apiLayer, get2Func, MOCK_RESULT);
  const set1Func = (value: string) => {
    return Promise.resolve('value ' + 'set1');
  };
  set1Func.clear = () => {
    result += ' set1';
  };
  const set1 = createSetApi(apiLayer, stringSucks, MOCK_RESULT);
  apiLayerClearCache(apiLayer);
  expect(result.length).toBeGreaterThan(0);
  expect(result.indexOf('get1')).toBeGreaterThanOrEqual(0);
  expect(result.indexOf('get2')).toBeGreaterThanOrEqual(0);
  expect(result.indexOf('set1')).toBe(-1);
});

test('ApiLayer onMockLoad option handler is called', async () => {
  const onMockLoad = (api: any) => {
    expect(api.mock).toBe('invalid path');
    return Promise.resolve('onMockLoad called');
  };
  const newLayer = apiLayerCreate({ mockMode: true, onMockLoad });
  const newApi = createGetApi(newLayer, stringSucks, 'invalid path');
  const result = await newApi('test');
  expect(result).toBe('onMockLoad called');
});

test('ApiLayer cannot change mockMode once ApiLayer is created', async () => {
  const newLayer = apiLayerCreate({ mockMode: true });
  let options = apiLayerSetOptions(newLayer);
  options.mockMode = false;
  options = apiLayerSetOptions(newLayer, options);
  expect(options.mockMode).toBeTruthy();
});
