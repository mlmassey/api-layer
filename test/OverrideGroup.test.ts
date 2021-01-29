import { OverrideGroup, apiLayerCreate, createGetApi } from '../src/index';

const MOCK_RESULT = 'samples/api/mock/mockSimple.json';

const apiLayer = apiLayerCreate({ mockMode: false, installGlobal: false });

function get1() {
  return Promise.resolve('get1');
}
const apiGet1 = createGetApi(get1, MOCK_RESULT, { apiLayer });

function get2() {
  return Promise.resolve('get2');
}
const apiGet2 = createGetApi(get2, MOCK_RESULT, { apiLayer });

function override1() {
  return Promise.resolve('override1');
}

function override2() {
  return Promise.resolve('override2');
}

test('Creating an override group and adding multiple overrides', async () => {
  const overrides = new OverrideGroup(apiLayer);
  overrides.add(apiGet1, override1).add(apiGet2, override2);
  let result: string = await apiGet1();
  expect(result).toBe('override1');
  result = await apiGet2();
  expect(result).toBe('override2');
  // Now remove all the overrides
  overrides.removeAll();
  result = await apiGet1();
  expect(result).toBe('get1');
  result = await apiGet2();
  expect(result).toBe('get2');
});

test('Appending a group to another group', async () => {
  const overrides1 = new OverrideGroup(apiLayer);
  overrides1.add(apiGet1, override1);
  const overrides2 = new OverrideGroup(apiLayer);
  overrides2.add(apiGet2, override2);
  overrides1.add(overrides2);
  expect(overrides1.overrides.length).toBe(2);
  let result: string = await apiGet1();
  expect(result).toBe('override1');
  result = await apiGet2();
  expect(result).toBe('override2');
  // Now remove all the overrides
  overrides1.removeAll();
  result = await apiGet1();
  expect(result).toBe('get1');
  result = await apiGet2();
  expect(result).toBe('get2');
});
