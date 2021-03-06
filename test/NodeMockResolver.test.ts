import { apiLayerCreate, createGetApi } from '../src';
import { NodeMockResolver } from '../src/NodeMockResolver';

const apiLayer = apiLayerCreate({ installGlobal: false });
const apiFunction = (): Promise<void> => {
  return Promise.resolve();
};

test('Test mock resolve to json', async () => {
  const resolver = new NodeMockResolver();
  const api = createGetApi(apiFunction, 'samples/mock/mockComplex.json', { apiLayer });
  const result = await resolver.resolve(api);
  expect(result.field1).toBeTruthy();
});

test('Test mock resolve to invalid file', async () => {
  const resolver = new NodeMockResolver();
  const api = createGetApi(apiFunction, 'bunk.json', { apiLayer });
  await expect(resolver.resolve(api)).rejects.toBeTruthy();
});

test('Test mock resolve to javascript', async () => {
  const resolver = new NodeMockResolver();
  const api = createGetApi(apiFunction, 'samples/mock/mockModuleExports.js', { apiLayer });
  const result = await resolver.resolve(api);
  expect(typeof result).toBe('function');
});

test('Test mock resolve to multi-module javascript', async () => {
  const resolver = new NodeMockResolver();
  const api = createGetApi(apiFunction, 'samples/mock/mockMultiModuleExport.js', { apiLayer });
  const result = await resolver.resolve(api);
  expect(typeof result.mock1).toBe('function');
  expect(typeof result.mock2).toBe('function');
});

test('Test mock resolve to promise', async () => {
  const resolver = new NodeMockResolver();
  const api = createGetApi(apiFunction, 'samples/mock/mockPromiseExport.js', { apiLayer });
  const result = await resolver.resolve(api);
  const res = await result();
  expect(res).toBeTruthy();
});

test('Test mock resolve to javascript jsx', async () => {
  const resolver = new NodeMockResolver();
  const api = createGetApi(apiFunction, 'samples/mock/mockModuleExports.jsx', { apiLayer });
  const result = await resolver.resolve(api);
  expect(typeof result).toBe('function');
});

test('Test mock resolve to invalid javascript', async () => {
  const resolver = new NodeMockResolver();
  const api = createGetApi(apiFunction, 'samples/mock/mockInvalidJavascript.js', { apiLayer });
  await expect(resolver.resolve(api)).rejects.toBeInstanceOf(Error);
});

test('Test mock resolve to typescript fails', async () => {
  const resolver = new NodeMockResolver();
  const api = createGetApi(apiFunction, 'samples/mock/mockModuleExports.ts', { apiLayer });
  await expect(resolver.resolve(api)).rejects.toBeInstanceOf(Error);
});

test('Test mock resolve to default export fails', async () => {
  const resolver = new NodeMockResolver();
  const api = createGetApi(apiFunction, 'samples/mock/mockInvalidDefaultExport.js', { apiLayer });
  await expect(resolver.resolve(api)).rejects.toBeInstanceOf(Error);
});

test('Test mock resolve to esm export fails', async () => {
  const resolver = new NodeMockResolver();
  const api = createGetApi(apiFunction, 'samples/mock/mockInvalidExport.js', { apiLayer });
  await expect(resolver.resolve(api)).rejects.toBeInstanceOf(Error);
});

test('Test mock resolve to json with rootPath', async () => {
  const resolver = new NodeMockResolver(__dirname);
  const api = createGetApi(apiFunction, '../samples/mock/mockComplex.json', { apiLayer });
  const result = await resolver.resolve(api);
  expect(result.field1).toBeTruthy();
});
