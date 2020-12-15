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

/**
 * The MockResolver based class is provided as base for your own resolvers to subclass.  It provides the
 * helper function `resolveFile` that is useful in parsing the mock file and turning it into a string.
 * If you want to create your own resolver, you can extend this class and create your own version of
 * the resolve function.
 */
export class MockResolver {
  /**
   * This is the resolve function that is called by the api-layer.  Its purpose is to resolve an ApiFunction
   * definition to a string of data to be used by the mock call.
   * @param {ApiFunction} api: The ApiFunction to resolve to its mock data
   * @returns {any} The returned value should be either a string of data or a javascript function that can be called
   *    If the mockPath has a JSON extension, it attempts to covert the string data to a Javascript object before
   *    returning.
   */
  resolve(api: ApiFunction<any, any>): Promise<any> {
    throw new Error('This should be overridden by the parent class');
  }
  /**
   * A helper function that converts the string data returned from resolve() and attempts to convert it to a
   * useful Javascript object for further processing by the ApiLayer.
   * @param {string} filename: The mock filename to resolve
   * @param {any} data: The returned data to parse (typically a string)
   * @param {ResolveFileType} type: (optional) Specifies the type of data being processed.  It can be "json", "javascript", or "unknown"
   */
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
