import Header from './components/header/header';
import RosterPane from './components/rosters/pane/roster-pane';
import SquadsPane from './components/squads/pane/squads-pane';
import styles from './App.module.scss';
import ImportExportControl from './components/import-export/import-export-control';

function App() {    
  
  return (<div className={styles.cont}>
    <Header />
    <RosterPane />
    <SquadsPane />
    <ImportExportControl />
  </div>
  )
}

export default App
