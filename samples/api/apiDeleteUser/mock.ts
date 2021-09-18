/* eslint-disable @typescript-eslint/no-unused-vars */
import { apiDeleteUser } from '.';
import { setMockFunction } from '../../../src';

setMockFunction(apiDeleteUser, (id: string) => {
  return Promise.resolve(true);
});

export { apiDeleteUser };
