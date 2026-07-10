import Header from './components/Header/Header';
import UpcomingList from './components/UpcomingList/UpcomingList';
import ObligationsFilters from './components/ObligationsFilters/ObligationsFilters';
import ObligationsList from './components/ObligationsList/ObligationsList';

import './App.css';

function App() {

  return (
    <>
      <Header />
      <UpcomingList />
      <ObligationsFilters />
      <ObligationsList />
    </>
  )
}

export default App
