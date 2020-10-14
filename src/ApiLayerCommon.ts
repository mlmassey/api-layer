/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-empty-function */
import { ApiLayerOptions, ApiLayer } from './types/ApiLayer';
import { ApiFunction } from './types/ApiFunction';
import { ApiType } from './types/ApiType';

// Set the default delay in milliseconds. Default is 0 for no delay
const DEFAULT_MOCK_DELAY = 0;
const API_LAYER_PREFIX = 'api';

// Global counters for creating unique ids
let _layerCreateCount = 0;
let _installCount = 0;

const DEFAULT_OPTIONS: ApiLayerOptions = {
  mockMode: false,
  mockDelay: DEFAULT_MOCK_DELAY,
  onMockLoad: undefined,
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
  return !!(typeof api === 'function' && api.uniqueId);
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
 * @param {string} uniqueId: The unique Id of the api layer function
 * @returns {ApiFunction|undefined} The installed ApiFunction with the given name, or undefined if not found
 */
export const apiLayerGetApi = (apiLayer: ApiLayer, uniqueId: string): ApiFunction | undefined => {
  return apiLayer.installed[uniqueId];
};

const _mockRequire = <T extends Array<any>, U extends any>(mockPath: string, ...args: T): Promise<U> => {
  return new Promise((resolve) => {
    let res: any = require(mockPath);
    if (typeof res === 'function') {
      res = res(...args);
      const type = typeof res;
      // Check to see if the result is a promise
      if (res && (type === 'function' || type === 'object') && typeof res.then === 'function') {
        res.then(resolve);
        return;
      }
      resolve(res as U);
      return;
    }
    resolve(res as U);
  });
};

const callMock = <T extends Array<any>, U extends any>(
  apiLayer: ApiLayer,
  api: ApiFunction,
  ...args: T
): Promise<U> => {
  let callFunction: (...args: T) => Promise<U>;
  if (apiLayer.options && apiLayer.options.onMockLoad) {
    callFunction = (): Promise<U> => {
      return (apiLayer.options.onMockLoad as (api: ApiFunction) => Promise<U>)(api).then((result) => {
        return result as U;
      });
    };
  } else {
    callFunction = (): Promise<U> => {
      return _mockRequire(api.mock, ...args);
    };
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
  uniqueId: string,
  apiFunction: (...args: T) => Promise<U>,
  ...args: T
): Promise<U> => {
  const api = apiLayerGetApi(apiLayer, uniqueId);
  if (!api) {
    throw new Error(`No api found with the uniqueId = ${uniqueId}`);
  }
  let callFunction = apiFunction;
  if (apiLayer.options.mockMode) {
    callFunction = (): Promise<U> => {
      return callMock(apiLayer, api, ...args);
    };
  }
  const override = apiLayer.overrides[uniqueId];
  if (override) {
    callFunction = override;
  }
  return callFunction(...args).then((result) => {
    if (api.apiType === ApiType.Set) {
      // We need to invalidate all the functions attached to this
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
  const current = apiLayer.installed[apiToOverride.uniqueId];
  if (!current) {
    throw new Error(`apiToOverride [${apiToOverride.apiName}] does not appear to have been installed previously`);
  }
  apiLayer.overrides[apiToOverride.uniqueId] = overrideFunction;
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
  const current = apiLayer.overrides[api.uniqueId];
  if (overrideFunction === current) {
    apiLayer.overrides[api.uniqueId] = undefined;
    // Clear the cache of the installed api
    const installed = apiLayer.installed[api.uniqueId];
    if (installed?.clear) {
      installed?.clear();
    }
  }
};

const getUniqueId = (apiLayer: ApiLayer): string => {
  _installCount++;
  return `${apiLayer.layerId}_${_installCount}`;
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
  mock: string,
  options: InstallApiOptions,
) => {
  checkApiLayer(apiLayer);
  if (typeof api !== 'function' || !mock || !options) {
    throw new Error('Invalid arguments');
  }
  if (isApiLayerFunction(api)) {
    throw new Error('Do not install an ApiFunction. Just use a regular function');
  }
  // Create our new unique api name to ensure it is always unique
  const uniqueId = getUniqueId(apiLayer);
  const apiLayerFunc = (...args: T): Promise<U> => {
    return callApi(apiLayer, uniqueId, api, ...args);
  };
  // Add our special members to designate this as an api
  const additional = {
    apiName: name,
    uniqueId,
    apiType: options.type,
    invalidates: options.invalidates,
    mock,
    clear: () => {},
    apiLayer,
  };
  const newApi = Object.assign(apiLayerFunc, additional);
  newApi.clear = () => {
    clearCache(api);
    clearCache(apiLayer.overrides[uniqueId]);
  };
  // Add it to our installed list of apis and then return
  apiLayer.installed[uniqueId] = newApi;
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
  const mockMode = apiLayer.options.mockMode;
  const ops = Object.assign({}, apiLayer.options, options);
  ops.mockMode = mockMode;
  apiLayer.options = ops;
  if (clearCache) {
    apiLayerClearCache(apiLayer);
  }
  return { ...ops };
};
