import { MockResolver } from '..';
import { ApiFunction } from './ApiFunction';

type ApiFunctionMap = Record<string, ApiFunction | undefined>;
type ApiOverrideMap = Record<string, any>;

/**
 * Options when creating an ApiLayer
 */
export interface ApiLayerOptions {
  /** If set to true, the ApiLayer is created in test/mock mode and only mock functions will be called.  This should not be changed once set */
  mockMode?: boolean;
  /** Global delay (in milliseconds) to introduce to all your mock calls.  This is ignored if your API specifies its own delay.  Default is 0, which is no delay */
  mockDelay?: number;
  /** Provide a callback that will load mock data. See the different MockResolvers for different resolver types.  This must be set if mockMode=true */
  mockResolver?: MockResolver | ((api: ApiFunction) => Promise<any>);
  /** Installs the layer as the global Api layer.  By default, when you create an ApiLayer, it will be installed globally.  You would only
   * set this to false for testing purposes.
   */
  installGlobal?: boolean;
}

export interface ApiLayer {
  layerId: string;
  options: ApiLayerOptions;
  overrides: ApiFunctionMap;
  lastCacheClear: number;
}
