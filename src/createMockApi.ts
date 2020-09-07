export const createMockApi = <T extends Array<any>, U extends any>(
  result: U,
  failure?: any,
  callback?: (...args: T) => Promise<U>,
  delay?: number,
) => {
  const apiFunc = (...args: T): Promise<U> => {
    return new Promise<U>((resolve, reject) => {
      const returnResult = () => {
        if (failure !== undefined) {
          reject(failure);
          return;
        }
        if (callback) {
          callback(...args)
            .then(resolve)
            .catch(reject);
          return;
        }
        resolve(result);
      };
      if (delay && delay > 0) {
        setTimeout(() => {
          returnResult();
        }, delay);
      } else {
        returnResult();
      }
    });
  };
  return apiFunc;
};
