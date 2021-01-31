import React, { useState } from 'react';
import { useApiGetDogList } from './api/apiGetDogList';
import { useApiSetDogList } from './api/apiSetDogList';
import { DogRecord } from './api/common/DogRecord';
import { DogFilters, DogFilterValues } from './DogFilters';

export const DogList: React.FC<{}> = () => {
  const [ filters, setFilters ] = useState<DogFilterValues>({ breed: '', color: ''});
  const [ newRows, setNewRows ] = useState<Array<DogRecord>>([]);
  const dogList = useApiGetDogList(filters.breed, filters.color);
  const setDogList = useApiSetDogList({ onSuccess: () => {
    // Need to clear out our newRows
    setNewRows([]);
  }});
  const handleSubmit = (e: any) => {
    e.preventDefault();
    const newDogList: Array<DogRecord> = [];
    for (let i = 0; i < e.target.elements.count.length; i++) {
      const count = parseInt(e.target.elements.count.item(i).value);
      if (Number.isNaN(count)) {
        console.error(`Invalid non-number for count at index ${i}`);
        return;
      }
      newDogList[i] = {
        id: '',
        count,
        breed: e.target.elements.breed.item(i).value,
        color: e.target.elements.color.item(i).value,
      }
    }
    setDogList.mutate(newDogList);
  }
  const handleAddRow = (e: any) => {
    e.preventDefault();
    setNewRows(newRows.concat([{ id: `${Date.now()}_new`, count: 0, breed: '', color: '' }]));
  }
  const handleRefresh = (e: any) => {
    e.preventDefault();
    setNewRows([]);
    dogList.refetch();
  }
  const handleNewRowChange = (e: any, index: number) => {
    e.preventDefault();
    const rows = newRows.slice();
    const row: any = rows[index];
    row[e.target.name] = e.target.value;
    setNewRows(rows);
  };
  const isNewRowsValid = () => {
    for (let i = 0; i < newRows.length; i++) {
      if (!Number.isInteger(newRows[i].count) || !newRows[i].breed || !newRows[i].color) {
        return false;
      }
    }
    return true;
  };
  const renderRow = (row: DogRecord, index: number, onChange?: (e: any, index: number) => void) => {
    if (onChange) {
      return (
        <tr key={row.id}>
          <td><input type={'text'} disabled={setDogList.isLoading} id={`count-${index}`} name={'count'} value={row.count} onChange={e => onChange(e, index)}></input></td>
          <td><input type={'text'} disabled={setDogList.isLoading} id={`breed-${index}`} name={'breed'} value={row.breed} onChange={e => onChange(e, index)}></input></td>
          <td><input type={'text'} disabled={setDogList.isLoading} id={`color-${index}`} name={'color'} value={row.color} onChange={e => onChange(e, index)}></input></td>
        </tr>
      );
    }
    return (
      <tr key={row.id}>
        <td><input type={'text'} disabled={setDogList.isLoading} id={`count-${index}`} name={'count'} defaultValue={row.count}></input></td>
        <td><input type={'text'} disabled={setDogList.isLoading} id={`breed-${index}`} name={'breed'} defaultValue={row.breed}></input></td>
        <td><input type={'text'} disabled={setDogList.isLoading} id={`color-${index}`} name={'color'} defaultValue={row.color}></input></td>
      </tr>
    );
  }
  const renderAddRow = () => {
    if (filters.breed || filters.color) {
      return null;  // We don't want to allow adding a row while we are filtering
    }
    return (
      <tr key={'add'} >
        <td colSpan={3}>
          <button disabled={setDogList.isLoading} type={'button'} id={'add'} onClick={handleAddRow}>Add New Row</button>
        </td>
      </tr>
    );
  };
  const renderTable = () => {
    if (!dogList.data) {
      return null;
    }
    return (
      <table>
        <thead>
          <tr>
            <th>Count</th>
            <th>Breed</th>
            <th>Color</th>
          </tr>
        </thead>
        <tbody>
          {
            dogList?.data?.list.map((item, index) => renderRow(item, index))
          }
          {
            newRows.map((item, index) => renderRow(item, index, handleNewRowChange))
          }
          {renderAddRow()}
        </tbody>
      </table>
    );
  }
  const renderFilters = () => {
    return <DogFilters initialFilters={filters} disabled={setDogList.isLoading || dogList.isLoading} onFilterChange={setFilters} />;
  };  
  return (
    <>
      {renderFilters()}
      <form onSubmit={handleSubmit}>
        { dogList.isLoading && <span>Loading...</span> }
        { renderTable() }
        <div className={'footer'}>
          <button type={'button'} disabled={setDogList.isLoading} id={'refresh'} onClick={handleRefresh}>Refresh</button>
          <button type={'submit'} disabled={!isNewRowsValid() || setDogList.isLoading}>Save Changes</button>
        </div>
        { dogList.data && <span className={'updated'}>{`${dogList.data.updated}`}</span>}
      </form>
    </>
  );
};