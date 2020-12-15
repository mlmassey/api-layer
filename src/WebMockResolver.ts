import { MockResolver } from './MockResolver';
import { ApiFunction } from '.';

function _separator(str: string): string {
  if (str) {
    return str.replace(/\\/g, '/');
  }
  return '';
}

export function resolvePath(root: string, path: string): string {
  let fullPath = _separator(root) || '';
  if (!fullPath || fullPath[fullPath.length - 1] !== '/') {
    fullPath += '/';
  }
  const newPath = _separator(path);
  if (newPath[0] === '/') {
    fullPath += newPath.slice(1);
  } else {
    fullPath += newPath;
  }
  return fullPath;
}

/**
 * The WebMockResolver is used to resolve paths to your mock files in a web application.  When you are running in your web application,
 * you don't have access to the mock files on your Node development machine.  When running in a web app you:
 * 1. Need to copy your mock files to a location on your web server that can be accessed by you application
 * 2. Use the WebMockResolver when creating your ApiLayer that helps to resolve the mockPaths in your different APIs to the location you
 *    copied the files to on your web server
 * Use the rootPath parameter when creating the instance of your resolver to the folder location on your web server.  By default, its set
 * to "/", which is the root of your server.
 * The WebMockResolver uses the browsers fetch function to make the call.  If your browser does not support fetch, you may have to add a
 * polyfill to support this, or create your own resolver.
 */
export class WebMockResolver extends MockResolver {
  rootPath: string;
  /**
   * Creates a WebMockResolver that will be provided to your ApiLayer when its created.
   * @param {string} rootPath: The root path to resolve paths to.  By default, it is "/"
   */
  constructor(rootPath?: string) {
    super();
    this.rootPath = rootPath === undefined ? '/' : rootPath;
    this.resolve = this.resolve.bind(this);
  }
  resolve(api: ApiFunction<any, any>): Promise<any> {
    if (typeof api.mock !== 'string') {
      return Promise.reject(new Error('ApiFunction has invalid mockPath'));
    }
    const filename = resolvePath(this.rootPath, api.mock);
    if (typeof fetch === undefined) {
      return Promise.reject(new Error('WebMockResolver requires fetch polyfill'));
    }
    return new Promise((resolve, reject) => {
      fetch(filename)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Fetch error: status=${res.status} ${res.statusText}`);
          }
          return res.text();
        })
        .then((data: any) => {
          return this.resolveFile(filename, data);
        })
        .then(resolve)
        .catch((error) => {
          reject(new Error(`Error resolving [${filename}]: ${error}`));
        });
    });
  }
}
