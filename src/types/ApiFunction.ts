/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiType } from './ApiType';

export interface ApiFunction<T extends Array<any>, U extends any> {
  /** Main api function */
  (...args: T): Promise<U>;
  /** The original wrapped function */
  original: (...args: T) => Promise<U>;
  /** Installed mock function */
  mock?: (...args: T) => Promise<U>;
  /** The currently installed override function */
  override?: (...args: T) => Promise<U>;
  /** Unique string identifier for the api function */
  uniqueId: string;
  /** The friendly name of the api function */
  apiName: string;
  /** The type of the api (get or set) */
  apiType: ApiType;
  /** List of apis that this function will invalidate once called */
  invalidates?: Array<ApiFunction<T, U>>;
  /** Clears the cache for this api (if cached) */
  clear: () => void;
  /** Called to override this ApiFunction */
  installOverride: (overrideFunc: (...args: T) => Promise<U>) => void;
  /** Clears the current override */
  clearOverride: (overrideFunc: (...args: T) => Promise<U>) => void;
  /** Called to install the default mock function */
  installMock: (overrideFunc: (...args: T) => Promise<U>) => void;
  /** Clears the default mock function */
  clearMock: (overrideFunc: (...args: T) => Promise<U>) => void;
  /** The cache age of this function (if applicable) in milliseconds */
  cacheAge?: number;
  /** Count of the number of times this function was called */
  callCount: number;
  /** Last time (in milliseconds) that this function was called */
  lastCallTime: number;
}
