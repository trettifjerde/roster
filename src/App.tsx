import SquadGrid from './components/squads/grid/squad-grid';
import styles from './App.module.scss';
import RosterPane from './components/rosters/pane/roster-pane';


function App() {    
  
  return (<div className={styles.cont}>
    <SquadGrid />
    <RosterPane />
  </div>
  )
}

export default App
