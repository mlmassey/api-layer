import { setMockFunction } from 'api-layer';
import { apiSetDogList } from ".";
import { DogRecord } from '../common/DogRecord';

setMockFunction(apiSetDogList, (list: Array<DogRecord>) => {
  return Promise.resolve({
    list: (list || []).slice(),
    updated: new Date(),
  });
})

export { apiSetDogList };