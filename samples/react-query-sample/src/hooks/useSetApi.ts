import { MutationFunction, MutationKey, RefetchOptions, useMutation, UseMutationOptions, UseMutationResult, useQueryClient } from 'react-query'; 
import { isApiLayerFunction, ApiFunction } from 'api-layer';
import { getApiFunctionId } from './getApiFunctionId';

export interface UseSetApiOptions<TData = unknown, TError = unknown, TVariables = unknown, TContext = unknown> extends UseMutationOptions<TData, TError, TVariables, TContext> {
  /** The set api function to use for the mutation */
  apiFunction?: ApiFunction<any, any>,
  /** All linked invalidation apis will automatically be invalidated when onSuccess is called */
  preventInvalidation?: boolean,
  /** These are the options to pass to the invalidateQueries function */
  refetchActive?: boolean,
  refetchInactive?: boolean,
  refetchOptions?: RefetchOptions,
};

function _isQueryKey(value: any) {
  return typeof value === 'string' || Array.isArray(value);
}

function _useMutation(options: any, queryClient: any): any {
  if (!isApiLayerFunction(options.apiFunction)) {
    throw new Error('Invalid apiFunction argument');
  }
  const newOptions = { ...options };
  const callerOnSuccess = options.onSuccess;
  // We want to automatically invalidate all get apis that are listed in the set apis invalidation list
  newOptions.onSuccess = () => {
    return new Promise((resolve, reject) => {
      const promises: any = [];
      if (!newOptions.preventInvalidation && newOptions.apiFunction.invalidates && newOptions.apiFunction.invalidates.length) {
        newOptions.apiFunction.invalidates.forEach((func: any) => {
          const id = getApiFunctionId(func);
          const filters = {
            refetchActive: newOptions.refetchActive,
            refetchInactive: newOptions.fetchInactive,
          };
          const refetchOptions = {
            throwOnError: newOptions.throwOnError,
          };
          promises.push(queryClient.invalidateQueries(id, filters, refetchOptions));
        });
      }
      Promise.all(promises).then(() => {
        // If there was an onSuccess handler set by the caller, call it after all invalidations occurred
        if (callerOnSuccess) {
          return callerOnSuccess();
        }
        return undefined;
      }).then(resolve).catch(reject);
    });
  };
  return useMutation(newOptions);
}

export function useSetApi<TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(options: UseSetApiOptions<TData, TError, TVariables, TContext>): UseMutationResult<TData, TError, TVariables, TContext>;
export function useSetApi<TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(apiFunction: ApiFunction<any, any>, options?: UseSetApiOptions<TData, TError, TVariables, TContext>): UseMutationResult<TData, TError, TVariables, TContext>;
export function useSetApi<TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(apiFunction: ApiFunction<any, any>, mutationFn: MutationFunction<TData, TVariables>, options?: UseSetApiOptions<TData, TError, TVariables, TContext>): UseMutationResult<TData, TError, TVariables, TContext>;
export function useSetApi<TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(apiFunction: ApiFunction<any, any>, mutationKey: MutationKey, options?: UseSetApiOptions<TData, TError, TVariables, TContext>): UseMutationResult<TData, TError, TVariables, TContext>;
export function useSetApi<TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(apiFunction: ApiFunction<any, any>, mutationKey: MutationKey, mutationFn?: MutationFunction<TData, TVariables>, options?: UseSetApiOptions<TData, TError, TVariables, TContext>): UseMutationResult<TData, TError, TVariables, TContext>;

export function useSetApi(arg1: any, arg2?: any, arg3?: any, arg4?: any): any {
  const queryClient = useQueryClient();
  if (!isApiLayerFunction(arg1)) {
    return _useMutation(arg1, queryClient);
  }
  if (_isQueryKey(arg2)) {
    if (typeof arg3 === 'function') {
      return _useMutation({ apiFunction: arg1, mutationKey: arg2, mutationFn: arg3, ...arg4 }, queryClient);
    }
    return _useMutation({ apiFunction: arg1, mutationKey: arg2, mutationFn: arg1, ...arg3 }, queryClient);
  }
  if (typeof arg2 === 'function') {
    return _useMutation({ apiFunction: arg1, mutationFn: arg2, ...arg3 }, queryClient);
  }
  return _useMutation({ apiFunction: arg1, mutationFn: arg1, ...arg2 }, queryClient);
}

