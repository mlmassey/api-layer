import {
  apiLayerCreate,
  ApiLayerOptions,
  createGetApi,
  apiLayerMockMode,
  isApiLayerFunction,
  apiLayerSetOptions,
  apiLayerClearCache,
  createSetApi,
} from './index';

function stringSucks(input: string): Promise<string> {
  const result = `${input} sucks`;
  return Promise.resolve(result);
}

function mockStringSucks(input: string): Promise<string> {
  const result = `mock ${input} sucks`;
  return Promise.resolve(result);
}

test('ApiLayer change mock delay', async () => {
  const apiLayer = apiLayerCreate({ mockMode: true, mockDelay: 0 });
  const getApi = createGetApi(apiLayer, stringSucks, mockStringSucks);
  let start = Date.now();
  await getApi('hello');
  let finish = Date.now();
  expect(finish - start).toBeLessThan(1000);
  // Now change the delay to make sure it also changes
  apiLayerMockMode(apiLayer, true, 2000);
  start = Date.now();
  await getApi('hello again');
  finish = Date.now();
  expect(finish - start).toBeGreaterThanOrEqual(2000);
});

test('ApiLayer set mock mode on', async () => {
  const apiLayer = apiLayerCreate({ mockMode: false, mockDelay: 0 });
  const getApi = createGetApi(apiLayer, stringSucks, mockStringSucks);
  let result = await getApi('hello');
  expect(result).toBe('hello sucks');
  // Now change the delay to make sure it also changes
  apiLayerMockMode(apiLayer, true);
  result = await getApi('hello');
  expect(result).toBe('mock hello sucks');
});

test('isApiLayerFunction working properly', () => {
  const apiLayer = apiLayerCreate();
  const getApi = createGetApi(apiLayer, stringSucks, mockStringSucks);
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
  expect(newOptions.mockMode).toBe(false);
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
  const get1 = createGetApi(apiLayer, get1Func, mockStringSucks);
  const get2Func = (value: string) => {
    return Promise.resolve('value ' + 'get2');
  };
  get2Func.clear = () => {
    result += ' get2';
  };
  const get2 = createGetApi(apiLayer, get2Func, mockStringSucks);
  const set1Func = (value: string) => {
    return Promise.resolve('value ' + 'set1');
  };
  set1Func.clear = () => {
    result += ' set1';
  };
  const set1 = createSetApi(apiLayer, stringSucks, mockStringSucks);
  apiLayerClearCache(apiLayer);
  expect(result.length).toBeGreaterThan(0);
  expect(result.indexOf('get1')).toBeGreaterThanOrEqual(0);
  expect(result.indexOf('get2')).toBeGreaterThanOrEqual(0);
  expect(result.indexOf('set1')).toBe(-1);
});
