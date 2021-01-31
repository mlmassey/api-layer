import React from 'react';

export interface DogFilterValues {
  breed: string;
  color: string;
}

export interface DogFilterProps {
  initialFilters: DogFilterValues;
  disabled?: boolean;
  onFilterChange: (filters: DogFilterValues) => void,
}

export const DogFilters: React.FC<DogFilterProps> = ({
  initialFilters,
  disabled,
  onFilterChange,
}) => {
  const handleSubmit = (e: any) => {
    e.preventDefault();
    onFilterChange({
      breed: e.target.breed.value,
      color: e.target.color.value,
    });
  };
  return (
    <form onSubmit={handleSubmit} className={'dog-filters'}>
      <span className={'title'}>Filter Them Dogs</span>
      <div className={'filter'}>
        <label htmlFor={'breed'}>Breed</label><input disabled={disabled} type={'text'} id={'filter-breed'} name={'breed'} defaultValue={initialFilters.breed} />
      </div>
      <div className={'filter'}>
        <label htmlFor={'color'}>Color</label><input disabled={disabled} type={'text'} id={'filter-color'} name={'color'} defaultValue={initialFilters.color} />
      </div>
      <button disabled={disabled} type={'submit'}>Filter</button>
    </form>
  );
};
