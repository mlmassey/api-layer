import { createSetApi } from 'api-layer';
import { apiGetDogList, GetDogListResponse } from '../apiGetDogList';
import { DogList } from '../common/DogList';
import { DogRecord } from '../common/DogRecord';
import { useSetApi, UseSetApiOptions } from '../../hooks/useSetApi';

const API_DELAY = 2000; // In milliseconds

export interface SetDogListResponse {
  list: Array<DogRecord>,
  updated: Date,
}

function setDogList(list: Array<DogRecord>): Promise<SetDogListResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const now = Date.now();
      for (let i = 0; i < list.length; i++) {
        DogList[i] =  { ...list[i], ...{id: `${now}_${i}`} };
      }
      DogList.length = list.length;
      const response: SetDogListResponse = {
        list: DogList.slice(),
        updated: new Date(),
      }
      resolve(response);
    }, API_DELAY);
  })
}

export const apiSetDogList = createSetApi(setDogList, 'apiSetDogList/apiSetDogList.mock.js', [apiGetDogList]);

export const useApiSetDogList = (options?: UseSetApiOptions) => {
  return useSetApi<GetDogListResponse, unknown, Array<DogRecord>>(apiSetDogList, options);
};