import {
  ApiFunction,
  apiLayerCreate,
  getMockResult,
  NodeMockResolver,
  MOCK_RESULT_UNIQUE_ID,
  MOCK_RESULT_NAME,
} from '.';

const mockResolver = new NodeMockResolver();

test('Call getMockResult with no mock path results in promise reject', () => {
  return expect(getMockResult('')).rejects.toBeTruthy();
});

test('Calling mock result with valid json works ok', async () => {
  const apiLayer = apiLayerCreate({ installGlobal: false, mockResolver });
  const result = await getMockResult('samples/mock/mockSimple.json', 0, apiLayer);
  expect(result).toBe('mock test sucks');
});

test('Calling mock result with valid json and delay adds delay', async () => {
  const apiLayer = apiLayerCreate({ installGlobal: false, mockResolver });
  const start = Date.now();
  const result = await getMockResult('samples/mock/mockSimple.json', 2000, apiLayer);
  const end = Date.now();
  expect(result).toBe('mock test sucks');
  expect(end - start).toBeGreaterThanOrEqual(2000);
});

test('Calling mock result with a javascript result is a function', async () => {
  const apiLayer = apiLayerCreate({ installGlobal: false, mockResolver });
  const result = await getMockResult('samples/mock/mockModuleExports.js', 0, apiLayer);
  expect(typeof result).toBe('function');
  expect(result('test')).toBe('test mock');
});

test('Validate ApiFunction when calling resolver in getMockResult', async () => {
  const resolver = (api: ApiFunction): Promise<any> => {
    expect(api.apiName).toBe(MOCK_RESULT_NAME);
    expect(api.uniqueId).toBe(MOCK_RESULT_UNIQUE_ID);
    return Promise.resolve('result');
  };
  const apiLayer = apiLayerCreate({ installGlobal: false, mockResolver: resolver });
  const result = await getMockResult('samples/mock/mockSimple.json', 0, apiLayer);
  expect(result).toBe('result');
});

test('Calling getMockResult with no mock resolver fails', () => {
  const apiLayer = apiLayerCreate({ installGlobal: false });
  return getMockResult('samples/mock/mockSimple.json', 0, apiLayer)
    .then((result) => {
      expect(result).toBe('This should never succeed with no resolver installed');
    })
    .catch((error) => {
      expect(error).toBeTruthy();
    });
});
