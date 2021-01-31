import { useQuery, UseQueryOptions, UseQueryResult, QueryKey, QueryFunction } from 'react-query'; 
import { isApiLayerFunction, ApiFunction } from 'api-layer';
import { getApiFunctionId } from './getApiFunctionId';

export interface UseGetApiOptions<TData = unknown, TError = unknown, TQueryFnData = TData> extends UseQueryOptions<TData, TError, TQueryFnData> {
  apiFunction?: ApiFunction<any, any>,
  preventApiKey?: boolean,
}

function _isQueryKey(value: any) {
  return typeof value === 'string' || Array.isArray(value);
}

function _useGetApi(options: any) {
  const newOptions = { ...options };
  if (!options.preventApiKey) {
    // Lets insert our apiFunction unique id as the cache query key main identifier
    const id = getApiFunctionId(newOptions.apiFunction);
    let newQueryKey = newOptions.queryKey || '';
    if (Array.isArray(newOptions.queryKey)) {
      newQueryKey = newQueryKey.slice();
      if (newQueryKey.length && newQueryKey[0] !== id) {
        newQueryKey.unshift(id);
      }
    } else {
      if (newQueryKey.indexOf(id) !== 0) {
        newQueryKey = `${id}-${newQueryKey}`;
      }
    }
    newOptions.queryKey = newQueryKey;
  }
  // Set the cache time according to the apiFunction cache age if present
  if (newOptions.apiFunction.cacheAge !== undefined && newOptions.staleTime === undefined) {
    newOptions.cacheTime = newOptions.apiFunction.cacheAge;
  } 
  return useQuery(newOptions);
}

export function useGetApi<TData = unknown, TError = unknown, TQueryFnData = TData>(options: UseGetApiOptions<TData, TError, TQueryFnData>): UseQueryResult<TData, TError>;
export function useGetApi<TData = unknown, TError = unknown, TQueryFnData = TData>(apiFunction: ApiFunction<any, any>, options: UseGetApiOptions<TData, TError, TQueryFnData>): UseQueryResult<TData, TError>;
export function useGetApi<TData = unknown, TError = unknown, TQueryFnData = TData>(apiFunction: ApiFunction<any, any>, queryKey: QueryKey, options?: UseGetApiOptions<TData, TError, TQueryFnData>): UseQueryResult<TData, TError>;
export function useGetApi<TData = unknown, TError = unknown, TQueryFnData = TData>(apiFunction: ApiFunction<any, any>, queryKey: QueryKey, queryFn: QueryFunction<TQueryFnData | TData>, options?: UseGetApiOptions<TData, TError, TQueryFnData>): UseQueryResult<TData, TError>;


export function useGetApi(arg1: any, arg2?: any, arg3?: any, arg4?: any): any {
  if (!isApiLayerFunction(arg1)) {
    return _useGetApi(arg1);
  }
  if (!_isQueryKey(arg2)) {
    return _useGetApi({ apiFunction: arg1, ...arg2 });
  }
  if (typeof arg3 === 'function') {
    return _useGetApi({ apiFunction: arg1, queryKey: arg2, queryFn: arg3, ...arg4 });
  }
  return _useGetApi({ apiFunction: arg1, queryKey: arg2, ...arg3 });
} 
