import { MockResolver } from './MockResolver';
import * as path from 'path';
import * as fs from 'fs';
import { ApiFunction } from '.';

/**
 * A mock resolver for a Node application or can be used in Jest/Node testing environment
 */
export class NodeMockResolver extends MockResolver {
  rootPath: string;
  /**
   * A mock resolver for a Node application or can be used in Jest/Node testing environment
   * @param {string} rootPath: The root path to use to resolve your mockPath in your APIs to files
   *  in your Node development environment.  It will use path.resolve(rootPath) to get the full
   *  path in your file system.  If not set, the default is to use the Node process.cwd().
   */
  constructor(rootPath?: string) {
    super();
    this.rootPath = rootPath ? path.resolve(rootPath) : process.cwd();
    this.resolve = this.resolve.bind(this);
  }
  resolve(api: ApiFunction): Promise<any> {
    return new Promise((resolve, reject) => {
      const mockPath = api.mock as string;
      if (!mockPath || typeof mockPath !== 'string') {
        reject(new Error('Invalid mockPath is not a string'));
        return;
      }
      const filename = this.rootPath ? path.resolve(this.rootPath, mockPath) : mockPath;
      const callback = (err: NodeJS.ErrnoException | null, data: string) => {
        if (err) {
          reject(err);
          return;
        }
        try {
          resolve(this.resolveFile(filename, data));
        } catch (e) {
          reject(e);
        }
      };
      fs.readFile(filename, 'utf8', callback);
    });
  }
}
