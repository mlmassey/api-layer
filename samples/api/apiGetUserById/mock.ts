/* eslint-disable @typescript-eslint/no-unused-vars */
import { apiGetUserById } from '.';
import { setMockFunction } from '../../../src';
import mockResponse from './mock.json';

setMockFunction(apiGetUserById, (id: string) => {
  return Promise.resolve(mockResponse);
});

export { apiGetUserById };
