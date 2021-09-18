import { apiGetSample } from './api/apiGetSample/mock';
import { overrideApi, clearApiLayerOverrides } from '../../../src/';

test('Test our sample get', async () => {
  clearApiLayerOverrides();
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
