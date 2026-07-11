import { BrowserRouter } from 'react-router-dom'

import Header from './components/Header/Header';
import UpcomingList from './components/UpcomingList/UpcomingList';
import ObligationsFilters from './components/ObligationsFilters/ObligationsFilters';
import ObligationsList from './components/ObligationsList/ObligationsList';
import ObligationDetailsModal from './components/ObligationDetailsModal/ObligationDetailsModal';

import './App.css';

function App() {

  return (
    <BrowserRouter>
      <Header />
      <UpcomingList />
      <ObligationsFilters />
      <ObligationsList />
      <ObligationDetailsModal />
    </BrowserRouter>
  )
}

export default App
