/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiType } from './ApiType';

export interface ApiFunction {
  /** Main api function */
  (...args: any): Promise<any>;
  /** Path to mock data or mock data identifier */
  mock: string;
  /** Unique string identifier for the api function */
  uniqueId: string;
  /** The friendly name of the api function */
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
