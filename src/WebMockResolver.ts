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

export class WebMockResolver extends MockResolver {
  rootPath: string;
  constructor(rootPath?: string) {
    super();
    this.rootPath = rootPath === undefined ? '/' : rootPath;
    this.resolve = this.resolve.bind(this);
  }
  resolve(api: ApiFunction): Promise<any> {
    if (!api.mockPath) {
      return Promise.reject(new Error('ApiFunction has empty mockPath'));
    }
    const filename = resolvePath(this.rootPath, api.mockPath);
    if (typeof fetch === undefined) {
      return Promise.reject(new Error('WebMockResolver requires fetch polyfill'));
    }
    return new Promise((resolve, reject) => {
      fetch(filename)
        .then((res) => res.text())
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
