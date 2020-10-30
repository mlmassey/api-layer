/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-empty-function */
import { ApiLayerOptions, ApiLayer } from './types/ApiLayer';
import { ApiFunction } from './types/ApiFunction';

// Set the default delay in milliseconds. Default is 0 for no delay
const DEFAULT_MOCK_DELAY = 0;
const API_LAYER_PREFIX = 'api';
const API_UNIQUE_PREFIX = 'api';

// Global counters for creating unique ids
let _layerCreateCount = 0;
let _uniqueIdCount = 0;
// Global API layer variable
let _globalApiLayer: ApiLayer | undefined;

const DEFAULT_OPTIONS: any = {
  mockMode: false,
  mockDelay: DEFAULT_MOCK_DELAY,
  mockResolver: undefined,
  installGlobal: true,
};

export const isApiLayer = (layer: any): boolean => {
  return !!(typeof layer === 'object' && layer.layerId);
};

const checkApiLayer = (layer: any): void => {
  if (!isApiLayer(layer)) {
    if (!_globalApiLayer) {
      throw new Error('Global api-layer was not installed.  Please call apiLayerCreate to install');
    }
    throw new Error('Invalid apiLayer argument.  Was this created with apiLayerCreate?');
  }
};

const newApiLayerId = (): string => {
  _layerCreateCount++;
  return `${API_LAYER_PREFIX}${_layerCreateCount}`;
};

export const getGlobalLayer = () => {
  return _globalApiLayer as ApiLayer;
};

export const clearGlobalLayer = () => {
  _globalApiLayer = undefined;
};

export const getApiUniqueId = (name: string): string => {
  const id = _uniqueIdCount++;
  return `${API_UNIQUE_PREFIX}_${id}_${name}`;
};

/**
 * Checks if the given value is an ApiFunction or not
 * @param {any} api: The function to check.
 * @returns {boolean} True if it is an ApiFunction, or false if not
 */
export const isApiLayerFunction = (api: any): boolean => {
  return !!(typeof api === 'function' && api.uniqueId);
};

/**
 * Creates a new API layer
 * @param {ApiLayerOptions} options: Options for creating the ApiLayer
 * @returns {ApiLayer} The newly created ApiLayer object to be used in later calls
 */
export const apiLayerCreate = (options?: ApiLayerOptions): ApiLayer => {
  const ops = { ...DEFAULT_OPTIONS, ...options };
  if (ops.mockMode && !ops.mockResolver) {
    throw new Error('mockResolver must be specified if in mock mode');
  }
  const newLayer: ApiLayer = {
    layerId: newApiLayerId(),
    options: ops,
    overrides: {},
    lastCacheClear: 0,
  };
  if (options?.installGlobal === undefined && _globalApiLayer) {
    throw new Error(
      'A previous ApiLayer was already installed globally.  Set installGlobal=true or false if this is expected behavior',
    );
  }
  if (ops.installGlobal) {
    _globalApiLayer = newLayer;
  }
  return newLayer;
};

function _getResolver(apiLayer: ApiLayer): any {
  const type = typeof apiLayer.options.mockResolver;
  if (type === 'function') {
    return apiLayer.options.mockResolver;
  }
  if (type === 'object' && (apiLayer.options.mockResolver as any).resolve) {
    return (apiLayer.options.mockResolver as any).resolve;
  }
  throw new Error('Invalid api-layer mockResolver option');
}

export const callMock = <T extends Array<any>, U extends any>(
  api: ApiFunction,
  apiLayer?: ApiLayer,
  override?: (...args: T) => Promise<U>,
  mockDelay?: number,
  returnResult?: boolean,
  ...args: T
): Promise<U> => {
  const layer = apiLayer || getGlobalLayer();
  checkApiLayer(layer);
  if (!layer.options.mockResolver) {
    return Promise.reject('api-layer is missing the mockResolver function');
  }
  let callFunction = (...args: T): Promise<U> => {
    return new Promise((resolve, reject) => {
      // Check if our mock is a function.  If so, call it with the args and then return
      if (typeof api.mock === 'function') {
        api
          .mock(...args)
          .then(resolve)
          .catch(reject);
        return;
      }
      // Mock is a path to a result, so resolve it
      return (_getResolver(layer) as (api: ApiFunction) => Promise<U>)(api)
        .then((res: any) => {
          if (typeof res === 'function' && !returnResult) {
            res = res(...args);
            const type = typeof res;
            // Check to see if the result is a promise
            if (res && (type === 'function' || type === 'object') && typeof res.then === 'function') {
              res.then(resolve);
              return;
            }
          }
          resolve(res as U);
        })
        .catch(reject);
    });
  };
  // Check if we are using an override. If so, we want to use that
  if (override) {
    callFunction = override;
  }
  let delay = (mockDelay !== undefined ? mockDelay : layer.options.mockDelay) || 0;
  if (delay) {
    // Add a small amount of fudge to make sure it goes over our delay
    delay += 4;
    return new Promise<any>((resolve, reject) => {
      const start = Date.now();
      callFunction(...args)
        .then((result) => {
          const now = Date.now();
          if (now - start < delay) {
            setTimeout(() => {
              resolve(result as U);
            }, delay - (now - start));
          }
        })
        .catch((error) => {
          const now = Date.now();
          if (now - start < delay) {
            setTimeout(() => {
              reject(error);
            }, delay - (now - start));
          }
        });
    });
  }
  return callFunction(...args);
};

export const getApiCallFunction = <T extends Array<any>, U extends any>(
  api: (...args: T) => Promise<U>,
  apiFunction: ApiFunction,
  useOverride?: boolean,
  preventMock?: boolean,
  apiLayer?: ApiLayer,
): ((...args: T) => Promise<U>) => {
  let callFunction = api;
  const layer = apiLayer || getGlobalLayer();
  checkApiLayer(layer);
  // If we are using an override, then switch to the override
  let override = layer.overrides ? layer.overrides[apiFunction.uniqueId] : undefined;
  if (!useOverride) {
    override = undefined;
  }
  if (override) {
    callFunction = override;
  }
  // If using mockMode, switch to the mock call.  The mock will also handle the override if its set
  if (layer.options.mockMode && !preventMock) {
    callFunction = (...innerArgs: T): Promise<U> => {
      return callMock(apiFunction, layer, override, undefined, false, ...innerArgs);
    };
  }
  // Check if this layer has called for a cache clear and we are not in mock mode
  // If there was a clearance, store the last clearance id in the function and clear the functions cache
  const lastClear = layer.lastCacheClear;
  if (!layer.options.mockMode && lastClear) {
    if (!apiFunction.lastApiCacheClear) {
      apiFunction.lastApiCacheClear = {};
    }
    const apiLastId = apiFunction.lastApiCacheClear[layer.layerId];
    if (lastClear !== apiLastId) {
      apiFunction.lastApiCacheClear[layer.layerId] = lastClear;
      apiFunction.clear();
    }
  }
  return callFunction;
};

/**
 * Overrides the specified ApiFunction with a new function.  This will replace any existing override that was installed before.
 * When someone calls the provided apiToOverride, the overrideFunction will be called instead and its return value used.
 * @param {ApiFunction} apiToOverride: The API function that you will override
 * @param {function} overrideFunction: The new function to use for the override
 * @returns {void}
 */
export const apiLayerOverride = <T extends Array<any>, U extends any>(
  apiToOverride: ApiFunction,
  overrideFunction: (...args: T) => Promise<U>,
  apiLayer?: ApiLayer,
): void => {
  if (!apiToOverride || !isApiLayerFunction(apiToOverride)) {
    throw new Error('Invalid arguments');
  }
  if (isApiLayerFunction(overrideFunction)) {
    throw new Error('Do not provide an ApiFunction as the newApi');
  }
  const layer: ApiLayer = apiLayer || getGlobalLayer();
  checkApiLayer(layer);
  layer.overrides[apiToOverride.uniqueId] = overrideFunction as ApiFunction;
};

/**
 * Removes an installed override
 * @param {ApiFunction} api: The overridden ApiFunction
 * @param {function} overrideFunction: The installed override
 * @returns void
 */
export const apiLayerRemoveOverride = <T extends Array<any>, U extends any>(
  api: ApiFunction,
  overrideFunction: (...args: T) => Promise<U>,
  apiLayer?: ApiLayer,
): void => {
  if (!isApiLayerFunction(api)) {
    throw new Error('Invalid api argument');
  }
  const layer = apiLayer || getGlobalLayer();
  checkApiLayer(layer);
  const current = layer.overrides[api.uniqueId];
  if ((overrideFunction as any) === (current as any)) {
    layer.overrides[api.uniqueId] = undefined;
    // Clear the cache of the installed api
    if (api.clear) {
      api.clear();
    }
  }
};

/**
 * Clears any cached function by calling their respective .clear() members (if they exist)
 * @param {ApiLayer} apiLayer: The current ApiLayer
 * @returns {void}
 */
export const apiLayerClearCache = (apiLayer?: ApiLayer): void => {
  const layer = apiLayer || getGlobalLayer();
  checkApiLayer(apiLayer);
  layer.lastCacheClear++;
};

/**
 * Clears all override functions installed in the ApiLayer
 * @param {ApiLayer} apiLayer: The ApiLayer to clear
 * @param {boolean} clearCache: Invalidates all caches.  Default is true
 * @returns {void}
 */
export const apiLayerClearOverrides = (apiLayer?: ApiLayer, clearCache = true): void => {
  const layer = apiLayer || getGlobalLayer();
  checkApiLayer(layer);
  layer.overrides = {};
  if (clearCache) {
    apiLayerClearCache(layer);
  }
};

/**
 * Sets the ApiLayer options after it has been created
 * @param {ApiLayer} apiLayer: The ApiLayer to modify
 * @param {ApiLayerOptions|undefined} options: If undefined, returns a copy of the current options.  If it has a value, the new values is merged into the current options
 * @param {boolean} clearCache: If true, clears the api cache after the options are changed.  Default is true
 * @returns {ApiLayOptions} A copy of the options that are installed
 */
export const apiLayerSetOptions = (
  options?: ApiLayerOptions,
  clearCache = true,
  apiLayer?: ApiLayer,
): ApiLayerOptions => {
  const layer = apiLayer || getGlobalLayer();
  checkApiLayer(layer);
  if (!options) {
    return { ...layer.options };
  }
  const mockMode = layer.options.mockMode;
  const ops = Object.assign({}, layer.options, options);
  ops.mockMode = mockMode;
  layer.options = ops;
  if (clearCache) {
    apiLayerClearCache(apiLayer);
  }
  return { ...ops };
};
