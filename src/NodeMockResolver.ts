import { MockResolver } from './MockResolver';
import * as path from 'path';
import * as fs from 'fs';
import { ApiFunction } from '.';

export class NodeMockResolver extends MockResolver {
  rootPath: string;
  constructor(rootPath?: string) {
    super();
    this.rootPath = rootPath ? path.resolve(rootPath) : process.cwd();
    this.resolve = this.resolve.bind(this);
  }
  resolve(api: ApiFunction): Promise<any> {
    return new Promise((resolve, reject) => {
      const mockPath = api.mockPath;
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
