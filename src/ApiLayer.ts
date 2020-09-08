/* eslint-disable @typescript-eslint/no-empty-function */
import { ApiFunction } from './types/ApiFunction';
import { ApiType } from './types/ApiType';

// Set the default delay in milliseconds. Default is 0 for no delay
const DEFAULT_MOCK_DELAY = 0;
const API_LAYER_PREFIX = 'api';

// Global counters for creating unique ids
let _layerCreateCount = 0;
let _installCount = 0;

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

const DEFAULT_OPTIONS: ApiLayerOptions = {
  mockMode: false,
  mockDelay: DEFAULT_MOCK_DELAY,
};

interface InstallApiOptions {
  /** The API function type (Get or Set) */
  type: ApiType;
  /** Array of GET ApiFunctions that are invalidated when the SET api is called */
  invalidates?: Array<ApiFunction>;
}

export const isApiLayer = (layer: any): boolean => {
  return !!(typeof layer === 'object' && layer.layerId);
};

const checkApiLayer = (layer: any): void => {
  if (!isApiLayer(layer)) {
    throw new Error('Invalid apiLayer argument.  Was this created with apiLayerCreate?');
  }
};

const newApiLayerId = (): string => {
  _layerCreateCount++;
  return `${API_LAYER_PREFIX}${_layerCreateCount}`;
};

/**
 * Checks if the given value is an ApiFunction or not
 * @param {any} api: The function to check.
 * @returns {boolean} True if it is an ApiFunction, or false if not
 */
export const isApiLayerFunction = (api: any): boolean => {
  return !!(typeof api === 'function' && api.apiName);
};

/**
 * Creates a new API layer
 * @param {ApiLayerOptions} options: Options for creating the ApiLayer
 * @returns {ApiLayer} The newly created ApiLayer object to be used in later calls
 */
export const apiLayerCreate = (options?: ApiLayerOptions): ApiLayer => {
  const ops = { ...DEFAULT_OPTIONS, ...options };
  const newLayer: ApiLayer = {
    layerId: newApiLayerId(),
    installed: {},
    overrides: {},
    options: ops,
  };
  return newLayer;
};

/**
 * Retrieves an installed API by apiName
 * @param {ApiLayer} apiLayer: The API layer to search
 * @param {string} apiName: The api name to retrieve
 * @returns {ApiFunction|undefined} The installed ApiFunction with the given name, or undefined if not found
 */
export const apiLayerGetApi = (apiLayer: ApiLayer, apiName: string): ApiFunction | undefined => {
  return apiLayer.installed[apiName];
};

const callMock = <T extends Array<any>, U extends any>(
  apiLayer: ApiLayer,
  apiName: string,
  mockFunction: (...args: T) => Promise<U>,
  ...args: T
): Promise<U> => {
  const api = apiLayerGetApi(apiLayer, apiName);
  if (!api) {
    throw new Error(`No api found with the apiName = ${apiName}`);
  }
  if (!mockFunction) {
    throw new Error('Invalid mockFunction argument');
  }
  let callFunction = mockFunction;
  const override = apiLayer.overrides[apiName];
  if (override) {
    callFunction = override;
  }
  const delay = apiLayer.options.mockDelay || 0;
  if (delay) {
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
  return callFunction(...args).then((result) => {
    if (api.apiType === ApiType.Set) {
      // We need to invalidate all the functions attache to this
      if (api.invalidates && api.invalidates.length) {
        api.invalidates.forEach((getApi: ApiFunction) => {
          if (getApi.clear) {
            getApi.clear();
          }
        });
      }
    }
    return result;
  });
};

const callApi = <T extends Array<any>, U extends any>(
  apiLayer: ApiLayer,
  apiName: string,
  apiFunction: (...args: T) => Promise<U>,
  ...args: T
): Promise<U> => {
  const api = apiLayerGetApi(apiLayer, apiName);
  if (!api) {
    throw new Error(`No api found with the apiName = ${apiName}`);
  }
  if (apiLayer.options.mockMode) {
    return api.mock(...args);
  }
  let callFunction = apiFunction;
  const override = apiLayer.overrides[apiName];
  if (override) {
    callFunction = override;
  }
  return callFunction(...args).then((result) => {
    if (api.apiType === ApiType.Set) {
      // We need to invalidate all the functions attache to this
      if (api.invalidates && api.invalidates.length) {
        api.invalidates.forEach((getApi) => {
          if (getApi.clear) {
            getApi.clear();
          }
        });
      }
    }
    return result;
  });
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
): void => {
  if (!apiToOverride || !isApiLayerFunction(apiToOverride)) {
    throw new Error('Invalid arguments');
  }
  checkApiLayer(apiToOverride.apiLayer);
  if (isApiLayerFunction(overrideFunction)) {
    throw new Error('Do not provide an ApiFunction as the newApi');
  }
  const apiLayer = apiToOverride.apiLayer as ApiLayer;
  const current = apiLayer.installed[apiToOverride.apiName];
  if (!current) {
    throw new Error(`apiToOverride [${apiToOverride.name}] does not appear to have been installed previously`);
  }
  apiLayer.overrides[apiToOverride.apiName] = overrideFunction;
};

/**
 * Removes an installed override
 * @param {ApiFunction} api: The overridden ApiFunction
 * @param {function} overrideFunction: The installed override
 * @returns void
 */
export const apiLayerRemoveOverride = <T extends Array<any>, U extends Promise<any>>(
  api: ApiFunction,
  overrideFunction: (...args: T) => U,
): void => {
  if (!isApiLayerFunction(api)) {
    throw new Error('Invalid api argument');
  }
  const apiLayer = api.apiLayer as ApiLayer;
  checkApiLayer(apiLayer);
  const current = apiLayer.overrides[api.apiName];
  if (overrideFunction === current) {
    apiLayer.overrides[api.apiName] = undefined;
    // Clear the cache of the installed api
    const installed = apiLayer.installed[api.apiName];
    if (installed?.clear) {
      installed?.clear();
    }
  }
};

const getUniqueApiName = (apiLayer: ApiLayer, name: string): string => {
  _installCount++;
  return `${name || 'unknown'}_${apiLayer.layerId}_${_installCount}`;
};

const clearCache = (func: any) => {
  const type = typeof func;
  if ((type === 'function' || type === 'object') && typeof func.clear === 'function') {
    func.clear();
  }
};

/**
 * Installs the specified API function into the given ApiLayer and returns the newly created ApiFunction
 * that can be used instead of directly calling the api function.
 * @param {ApiLayer} apiLayer: The ApiLayer to install the function into
 * @param {string} name: The name to use for the apiName of the function
 * @param {function} api: The api function to call by the wrapper ApiFunction.  This should not be an existing ApiFunction
 * @param {function} mock: The mock version of this function that returns a positive/valid response for testing.  This should not be an existing ApiFunction
 * @param {InstallApiOptions} options: Options for creating the ApiFunction
 * @returns {ApiFunction} The newly created ApiFunction after its installed.
 */
export const apiLayerInstall = <T extends Array<any>, U extends any>(
  apiLayer: ApiLayer,
  name: string,
  api: (...args: T) => Promise<U>,
  mock: (...args: T) => Promise<U>,
  options: InstallApiOptions,
) => {
  checkApiLayer(apiLayer);
  if (typeof api !== 'function' || typeof mock !== 'function' || !options) {
    throw new Error('Invalid arguments');
  }
  if (isApiLayerFunction(api)) {
    throw new Error('Do not install an ApiFunction. Just use a regular function');
  }
  if (isApiLayerFunction(mock)) {
    throw new Error('Do not install an ApiFunction as a mock.  Just use a regular function');
  }
  // Create our new unique api name to ensure it is always unique
  const apiName = getUniqueApiName(apiLayer, name);
  const mockLayerFunc = (...args: T): Promise<U> => {
    return callMock(apiLayer, apiName, mock, ...args);
  };
  const apiLayerFunc = (...args: T): Promise<U> => {
    return callApi(apiLayer, apiName, api, ...args);
  };
  // Add our special members to designate this as an api
  const additional = {
    mock: mockLayerFunc,
    apiName,
    apiType: options.type,
    invalidates: options.invalidates,
    clear: () => {},
    apiLayer,
  };
  const newApi = Object.assign(apiLayerFunc, additional);
  newApi.clear = () => {
    clearCache(api);
    clearCache(mock);
    clearCache(apiLayer.overrides[apiName]);
  };
  // Add it to our installed list of apis and then return
  apiLayer.installed[apiName] = newApi;
  return newApi;
};

/**
 * Clears any cached function by calling their respective .clear() members (if they exist)
 * @param {ApiLayer} apiLayer: The current ApiLayer
 * @returns {void}
 */
export const apiLayerClearCache = (apiLayer: ApiLayer): void => {
  Object.values(apiLayer.installed).forEach((api) => {
    clearCache(api);
  });
  Object.values(apiLayer.overrides).forEach((api) => {
    clearCache(api);
  });
};

/**
 * Clears all override functions installed in the ApiLayer
 * @param {ApiLayer} apiLayer: The ApiLayer to clear
 * @param {boolean} clearCache: Invalidates all caches.  Default is true
 * @returns {void}
 */
export const apiLayerClearOverrides = (apiLayer: ApiLayer, clearCache = true): void => {
  checkApiLayer(apiLayer);
  apiLayer.overrides = {};
  if (clearCache) {
    apiLayerClearCache(apiLayer);
  }
};

/**
 * Changes the ApiLayers mock (testing) mode. If you want to get the current state of the mock mode, you can call
 * this function with just the apiLayer argument.
 * @param {ApiLayer} apiLayer: The ApiLayer to modify
 * @param {boolean|undefined} on: If undefined, it returns the current mock mode value.  If true, turns mock mode on, or false turns it off
 * @param {number} mockDelay: Alters the default mock delay applied to all mock functions
 * @param {boolean} clearCache: Clears all ApiFunction caches when called if the mode is changed. Default is true
 * @returns {boolean} The new state of the mock mode
 */
export const apiLayerMockMode = (apiLayer: ApiLayer, on?: boolean, mockDelay?: number, clearCache = true): boolean => {
  checkApiLayer(apiLayer);
  const current = !!apiLayer.options.mockMode;
  const newState = on === undefined ? !!apiLayer.options.mockMode : !!on;
  if (mockDelay !== undefined) {
    apiLayer.options.mockDelay = mockDelay;
  }
  if (current === newState) {
    return current;
  }
  apiLayer.options.mockMode = newState;
  if (clearCache) {
    apiLayerClearCache(apiLayer);
  }
  return newState;
};

/**
 * Sets the ApiLayer options after it has been created
 * @param {ApiLayer} apiLayer: The ApiLayer to modify
 * @param {ApiLayerOptions|undefined} options: If undefined, returns a copy of the current options.  If it has a value, the new values is merged into the current options
 * @param {boolean} clearCache: If true, clears the api cache after the options are changed.  Default is true
 * @returns {ApiLayOptions} A copy of the options that are installed
 */
export const apiLayerSetOptions = (
  apiLayer: ApiLayer,
  options?: ApiLayerOptions,
  clearCache = true,
): ApiLayerOptions => {
  checkApiLayer(apiLayer);
  if (!options) {
    return { ...apiLayer.options };
  }
  const ops = Object.assign({}, apiLayer.options, options);
  apiLayer.options = ops;
  if (clearCache) {
    apiLayerClearCache(apiLayer);
  }
  return { ...ops };
};
