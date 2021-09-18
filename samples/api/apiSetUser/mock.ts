/* eslint-disable @typescript-eslint/no-unused-vars */
import { apiSetUser } from '.';
import { setMockFunction } from '../../../src';
import { User } from '../User';

setMockFunction(apiSetUser, (user: User) => {
  return Promise.resolve(user);
});

export { apiSetUser };
