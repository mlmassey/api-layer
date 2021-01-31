/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useCallback } from 'react';
import { useQueryClient } from 'react-query';
import { apiGetDogList } from './api/apiGetDogList';

/**
 * Simple component that connects to the React Query Cache and prints information on our api/cache
 */
export const QueryCache: React.FC<{}> = () => {
  const [, updateState] = useState({});
  const forceUpdate = useCallback(() => updateState({}), []);
  const queryCache = useQueryClient().getQueryCache();
  const query = queryCache.find(apiGetDogList.uniqueId);
  useEffect(() => {
    return queryCache.subscribe(() => {
      // Need to use a setTimeout because the callback from the query cache comes during a render operation (not good)
      // This gets it out of the render loop
      setTimeout(forceUpdate, 500);
    });
  }, []); 
  const renderQuery = () => {
    if (!query) {
      return <span>ApiGetDogList: Unable to find query in cache</span>;
    }
    return <span>{`ApiGetDogList [${query.state.status}] Update Count = ${query.state.dataUpdateCount}`}</span>;
  };
  console.log('Query: ', query);
  return (
    <div className={'query-cache-info'}>
      <span className={'title'}>React Query Cache Information</span>
      {renderQuery()}
    </div>
  );
};

