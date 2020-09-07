/* eslint-disable @typescript-eslint/no-empty-function */
import { ApiFunction } from 'types/ApiFunction';
import { ApiType } from 'types/ApiType';

const DEFAULT_MOCK_DELAY = 3000;

type ApiFunctionMap = Record<string, ApiFunction | undefined>;
type ApiOverrideMap = Record<string, any>;

export interface ApiLayerOptions {
  mockMode?: boolean;
  mockDelay?: number;
}

export interface ApiLayer {
  installed: ApiFunctionMap;
  overrides: ApiOverrideMap;
  options: ApiLayerOptions;
}

const DEFAULT_OPTIONS: ApiLayerOptions = {
  mockMode: false,
  mockDelay: DEFAULT_MOCK_DELAY,
};

interface InstallApiOptions {
  type: ApiType;
  invalidates?: Array<ApiFunction>;
}

export const isApiLayerFunction = (api: any): boolean => {
  return !!(typeof api === 'function' && api.apiName);
};

export const apiLayerCreate = (options?: ApiLayerOptions): ApiLayer => {
  const ops = { ...DEFAULT_OPTIONS, ...options };
  const newLayer: ApiLayer = {
    installed: {},
    overrides: {},
    options: ops,
  };
  return newLayer;
};

export const apiLayerGetApi = (apiLayer: ApiLayer, apiName: string): ApiFunction | undefined => {
  return apiLayer.installed[apiName];
};

const callMock = <T extends Array<any>, U extends Promise<any>>(
  apiLayer: ApiLayer,
  apiName: string,
  mockFunction: (...args: T) => Promise<U>,
  ...args: T
) => {
  const api = apiLayerGetApi(apiLayer, apiName);
  if (!api) {
    throw new Error(`No api found with the apiName = ${apiName}`);
  }
  const delay = apiLayer.options.mockDelay || 0;
  if (delay) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      mockFunction(...args)
        .then((result) => {
          const now = Date.now();
          if (now - start < delay) {
            setTimeout(() => {
              resolve(result);
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
  return mockFunction(...args).then((result) => {
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

const callApi = <T extends Array<any>, U extends Promise<any>>(
  apiLayer: ApiLayer,
  apiName: string,
  apiFunction: (...args: T) => Promise<U>,
  ...args: T
) => {
  const api = apiLayerGetApi(apiLayer, apiName);
  if (!api) {
    throw new Error(`No api found with the apiName = ${apiName}`);
  }
  let callFunction: any = apiFunction;
  const override = apiLayer.overrides[apiName];
  if (apiLayer.options.mockMode) {
    callFunction = api.mock;
  }
  if (override) {
    callFunction = override;
  }
  return callFunction(...args).then((result: any) => {
    if (callFunction !== api.mock && api.apiType === ApiType.Set) {
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

export const apiLayerOverride = <T extends Array<any>, U extends Promise<any>>(
  apiLayer: ApiLayer,
  apiToOverride: ApiFunction,
  newApi: (...args: T) => Promise<U>,
) => {
  if (!apiToOverride || !isApiLayerFunction(apiToOverride)) {
    throw new Error('Invalid arguments');
  }
  if (isApiLayerFunction(newApi)) {
    throw new Error('Do not provide an ApiFunction as the newApi');
  }
  const current = apiLayer.installed[apiToOverride.apiName];
  if (!current) {
    throw new Error(`apiToOverride [${apiToOverride.name}] does not appear to have been installed previously`);
  }
  apiLayer.overrides[apiToOverride.apiName] = newApi;
  return current;
};

export const apiLayerRemoveOverride = (
  apiLayer: ApiLayer,
  api: ApiFunction,
  overrideFunction: (...args: any) => Promise<any>,
): void => {
  if (!isApiLayerFunction(api)) {
    throw new Error('Invalid api argument');
  }
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

export const apiLayerInstall = <T extends Array<any>, U extends Promise<any>>(
  apiLayer: ApiLayer,
  name: string,
  api: (...args: T) => Promise<U>,
  mock: (...args: T) => Promise<U>,
  options: InstallApiOptions,
) => {
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
  const apiName = `${name}_${Date.now()}`;
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
  };
  const newApi = Object.assign(apiLayerFunc, additional);
  newApi.clear = () => {
    if (typeof (api as any).clear === 'function') {
      (api as any).clear();
    }
    if (typeof (mock as any).clear === 'function') {
      (mock as any).clear();
    }
  };
  // Add it to our installed list of apis and then return
  apiLayer.installed[apiName] = newApi;
  return newApi;
};

export const apiLayerClearCache = (apiLayer: ApiLayer): void => {
  Object.values(apiLayer.installed).forEach((api) => {
    if (api?.clear) {
      api?.clear();
    }
  });
};

export const apiLayerClearOverrides = (apiLayer: ApiLayer, clear = true): void => {
  apiLayer.overrides = {};
  if (clear) {
    apiLayerClearCache(apiLayer);
  }
};

export const apiLayerMockMode = (apiLayer: ApiLayer, on?: boolean, mockDelay?: number, clear = true): boolean => {
  const current = !!apiLayer.options.mockMode;
  const newState = on === undefined ? !!apiLayer.options.mockMode : !!on;
  if (mockDelay !== undefined) {
    apiLayer.options.mockDelay = mockDelay;
  }
  if (current === newState) {
    return current;
  }
  apiLayer.options.mockMode = newState;
  if (clear) {
    apiLayerClearCache(apiLayer);
  }
  return newState;
};

export const apiLayerSetOptions = (apiLayer: ApiLayer, options?: ApiLayerOptions, clear = true): ApiLayerOptions => {
  if (!options) {
    return { ...apiLayer.options };
  }
  const ops = Object.assign({}, DEFAULT_OPTIONS, options);
  apiLayer.options = ops;
  if (clear) {
    apiLayerClearCache(apiLayer);
  }
  return { ...ops };
};
