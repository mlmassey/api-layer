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
  /** Provide a callback that will load mock data. If not set, the ApiLayer will attempt to use require to load the mock data */
  onMockLoad?: (api: ApiFunction) => Promise<any>;
}

export interface ApiLayer {
  layerId: string;
  installed: ApiFunctionMap;
  overrides: ApiOverrideMap;
  options: ApiLayerOptions;
}
