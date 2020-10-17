import './api/testApiLayer';
import { apiSampleGet } from './api/apiSampleGet';
import { overrideApi } from '../../../src/overrideApi';
import { apiLayerClearOverrides } from '../../../src/ApiLayerCommon';

test('Test our sample get', async () => {
  apiLayerClearOverrides();
  const result = await apiSampleGet();
  expect(result).toBe('Mock sampleGet response');
});

test('Install an override', async () => {
  const override = () => {
    return Promise.resolve('override');
  };
  overrideApi(apiSampleGet, override);
  const result = await apiSampleGet();
  expect(result).toBe('override');
});

test('Install second override', async () => {
  const override = () => {
    return Promise.resolve('override2');
  };
  overrideApi(apiSampleGet, override);
  const result = await apiSampleGet();
  expect(result).toBe('override2');
});

test('Test our sample get again', async () => {
  apiLayerClearOverrides();
  const result = await apiSampleGet();
  expect(result).toBe('Mock sampleGet response');
});
