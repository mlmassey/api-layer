/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiFunction } from './types/ApiFunction';

function _getExtension(filename: string): string {
  const index = filename.lastIndexOf('.');
  if (index >= 0) {
    return filename.slice(index).toLowerCase();
  }
  return '';
}

export enum ResolveFileType {
  json = 'json',
  javascript = 'javascript',
  unknown = 'unknown',
}

function _getFileType(filename: string): ResolveFileType {
  const ext = _getExtension(filename);
  switch (ext) {
    case '.js':
    case '.jsx':
      return ResolveFileType.javascript;
    case '.jsn':
    case '.json':
      return ResolveFileType.json;
    case '.ts':
    case '.tsx':
      throw new Error('MockResolver is unable to process Typescript');
    default:
      return ResolveFileType.unknown;
  }
}

function _processJson(filename: string, data: any): any {
  if (!data) {
    return '';
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    throw new Error(`Error processing JSON for file [${filename}]: ${e}`);
  }
}

function _evalInContext(js: any) {
  return function () {
    'use strict';
    const module = {
      exports: undefined,
    };
    eval(js);
    if (!module.exports) {
      throw new Error('Javascript does not appear to contain module.exports after eval');
    }
    return module.exports;
  }.call(null);
}

function _processJavascript(filename: string, data: any): any {
  if (!data) {
    return '';
  }
  // Check if this has Node module.exports, which is all we support
  if (!/\b(exports|module)\b/.test(data)) {
    throw new Error('Javascript does not appear to contain module.exports, so processing halted');
  }
  try {
    return _evalInContext(data);
  } catch (e) {
    throw new Error(`Error processing Javascript for file [${filename}]: ${e}`);
  }
}

export class MockResolver {
  resolve(api: ApiFunction): Promise<any> {
    throw new Error('This should be overridden by the parent class');
  }
  resolveFile(filename: string, data: any, type?: ResolveFileType): any {
    if (!filename) {
      throw new Error('Invalid empty filename');
    }
    let fileType: ResolveFileType | undefined = type;
    if (!type) {
      fileType = _getFileType(filename);
    }
    switch (fileType) {
      case ResolveFileType.json:
        return _processJson(filename, data);
      case ResolveFileType.javascript:
        return _processJavascript(filename, data);
      default:
        return data;
    }
  }
}
