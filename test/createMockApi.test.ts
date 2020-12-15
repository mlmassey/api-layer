import { createMockApi } from '../src/index';

test('Creating a normal mock api is ok', async () => {
  const mock = createMockApi('mock result');
  const result = await mock();
  expect(result).toBe('mock result');
});

test('Mock with an undefined result', async () => {
  const mock = createMockApi(undefined);
  const result = await mock();
  expect(result).toBe(undefined);
});

test('Mock with an null result', async () => {
  const mock = createMockApi(null);
  const result = await mock();
  expect(result).toBe(null);
});

test('Mock with delay', async () => {
  const mock = createMockApi('result', undefined, undefined, 1000);
  const start = Date.now();
  const result = await mock();
  const finish = Date.now();
  expect(result).toBe('result');
  expect(finish - start).toBeGreaterThanOrEqual(1000);
});

test('Mock with failure rejects with the error', () => {
  expect.assertions(2);
  const start = Date.now();
  const mock = createMockApi('result', 'my error', undefined, 1000);
  return mock().catch((error) => {
    const finish = Date.now();
    expect(error).toBe('my error');
    expect(finish - start).toBeGreaterThanOrEqual(1000);
  });
});

test('Using a callback function', async () => {
  const callback = () => {
    return Promise.resolve('callback');
  };
  const mock = createMockApi('result', undefined, callback);
  const result = await mock();
  expect(result).toBe('callback');
});

test('Using callback with an error', async () => {
  const callback = () => {
    return Promise.reject('callback error');
  };
  expect.assertions(1);
  const mock = createMockApi('result', undefined, callback);
  await expect(mock()).rejects.toEqual('callback error');
});
