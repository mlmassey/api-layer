import { setMockFunction } from 'api-layer';
import { apiGetDogList, GetDogListResponse} from ".";
import mockResponse from './mock.json';

setMockFunction(apiGetDogList, (breed?: string, color?: string) => {
  return Promise.resolve(mockResponse as unknown as GetDogListResponse);
});

export { apiGetDogList };