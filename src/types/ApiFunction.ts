/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiType } from './ApiType';

export interface ApiFunction {
  /** Main api function */
  (...args: any): Promise<any>;
  /** The original wrapped function */
  original: (...args: any) => Promise<any>;
  /** Path to mock data or mock data identifier */
  mockPath: string;
  /** Unique string identifier for the api function */
  uniqueId: string;
  /** The friendly name of the api function */
  apiName: string;
  /** The type of the api (get or set) */
  apiType: ApiType;
  /** List of apis that this function will invalidate once called */
  invalidates?: Array<ApiFunction>;
  /** Clears the cache for this api (if cached) */
  clear: () => void;
  /** Called to override this ApiFunction */
  override: (overrideFunc: (...args: any) => Promise<any>) => void;
  /** Clears the current override */
  clearOverride: (overrideFunc: (...args: any) => Promise<any>) => void;
  /** Last apiLayer cache clear identifier */
  lastApiCacheClear?: any;
}
