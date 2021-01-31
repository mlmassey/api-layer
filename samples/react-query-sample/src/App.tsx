import React from 'react';
import { DogList } from './DogList';
import './App.css';
import { QueryClient, QueryClientProvider } from 'react-query';
import { QueryCache } from './QueryCache';

const queryClient = new QueryClient();

const App: React.FC<{}> = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <h1>Welcome to the Top Dog List!</h1>
        <DogList />
        <QueryCache />
      </div>
    </QueryClientProvider>
  );
};

export default App;
