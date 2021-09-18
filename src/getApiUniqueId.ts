const API_UNIQUE_PREFIX = 'api';

let _uniqueIdCount = 0;

export const getApiUniqueId = (name: string): string => {
  const id = _uniqueIdCount++;
  return `${API_UNIQUE_PREFIX}_${id}_${name}`;
};
