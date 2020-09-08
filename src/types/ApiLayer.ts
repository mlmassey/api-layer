import { ApiFunction } from './ApiFunction';

type ApiFunctionMap = Record<string, ApiFunction | undefined>;
type ApiOverrideMap = Record<string, any>;

/**
 * Options when creating an ApiLayer
 */
export interface ApiLayerOptions {
  /** If set to true, the ApiLayer is created in test/mock mode and only mock functions will be called */
  mockMode?: boolean;
  /** Global delay (in milliseconds) to introduce to all your mock calls.  This is ignored if your API specifies its own delay.  Default is 0, which is no delay */
  mockDelay?: number;
}

export interface ApiLayer {
  layerId: string;
  installed: ApiFunctionMap;
  overrides: ApiOverrideMap;
  options: ApiLayerOptions;
}
