import { createGetApi } from 'api-layer';
import { DogList } from '../common/DogList';
import { DogRecord } from '../common/DogRecord';
import { useGetApi, UseGetApiOptions } from '../../hooks/useGetApi';

const API_DELAY = 2000; // In milliseconds
const CACHE_AGE = 60000;  // Set the cache age of the api to one minute

export interface GetDogListResponse {
  list: Array<DogRecord>,
  updated: Date,
}

function getDogList(breed?: string, color?: string): Promise<GetDogListResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let list = DogList.slice();
      if (breed) {
        list = list.filter(item => item.breed.toLowerCase().indexOf(breed.toLowerCase()) !== -1);
      }
      if (color) {
        list = list.filter(item => item.color.toLowerCase().indexOf(color.toLowerCase()) !== -1);
      }
      const response: GetDogListResponse = {
        list,
        updated: new Date(),
      }
      resolve(response);
    }, API_DELAY);
  })
}

export const apiGetDogList = createGetApi(getDogList, 'apiGetDogList/apiGetDogList.mock.json', { cacheAge: CACHE_AGE });

export const useApiGetDogList = (breed = '', color = '', options?: UseGetApiOptions<GetDogListResponse>) => {
  const queryKey = [breed, color];
  return useGetApi<GetDogListResponse>(apiGetDogList, queryKey, () => apiGetDogList(breed, color), options);
} 