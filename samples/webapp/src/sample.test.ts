// When we import the test api-layer, it is automatically installed globally and ready to use
import './api/testApiLayer';
import { apiGetSample } from './api/apiGetSample';
import { overrideApi } from '../../../src/overrideApi';
import { apiLayerClearOverrides } from '../../../src/ApiLayerCommon';

test('Test our sample get', async () => {
  // When testing with a global api-layer, you don't know what the state of the global layer is
  // Its best to clear out all the overrides and cache at the start of your test to ensure its in a known/empty state
  apiLayerClearOverrides();
  const result = await apiGetSample();
  expect(result).toBe('Mock sampleGet response');
});

test('Install an override', async () => {
  const override = () => {
    return Promise.resolve('override');
  };
  overrideApi(apiGetSample, override);
  const result = await apiGetSample();
  expect(result).toBe('override');
});

test('Install second override', async () => {
  const override = () => {
    return Promise.resolve('override2');
  };
  overrideApi(apiGetSample, override);
  const result = await apiGetSample();
  expect(result).toBe('override2');
});

test('Test our sample get again', async () => {
  // When testing with a global api-layer, you don't know what the state of the global layer is
  // Its best to clear out all the overrides and cache at the start of your test to ensure its in a known/empty state
  apiLayerClearOverrides();
  const result = await apiGetSample();
  expect(result).toBe('Mock sampleGet response');
});
