import SquadGrid from './components/squads/grid/squad-grid';
import styles from './App.module.scss';
import RosterPane from './components/rosters/pane/roster-pane';
import Button from './components/ui/button';


function App() {    
  
  return (<div className={styles.cont}>
    <RosterPane />
    <SquadGrid />
  </div>
  )
}

export default App
