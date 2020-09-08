/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiType } from 'types/ApiType';

export interface ApiFunction {
  /** Main api function */
  (...args: any): Promise<any>;
  /** Mock function that should return a mock result */
  mock: (...args: any) => Promise<any>;
  /** The unique name of the api */
  apiName: string;
  /** The type of the api (get or set) */
  apiType: ApiType;
  /** List of apis that this function will invalidate once called */
  invalidates?: Array<ApiFunction>;
  /** Clears the cache for this api (if cached) */
  clear?: () => void;
  /** The ApiLayer this is installed into */
  apiLayer?: any;
}
