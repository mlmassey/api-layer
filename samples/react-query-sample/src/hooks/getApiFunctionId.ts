import { isApiLayerFunction, ApiFunction } from "api-layer";

export function getApiFunctionId(apiFunction: ApiFunction<any, any>): string {
  if (!isApiLayerFunction(apiFunction)) {
    throw new Error('Invalid argument');
  }
  return apiFunction.uniqueId;
}