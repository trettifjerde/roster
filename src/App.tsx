import SquadsPane from './components/squads/pane/squads-pane';
import styles from './App.module.scss';
import RosterPane from './components/rosters/pane/roster-pane';


function App() {    
  
  return (<div className={styles.cont}>
    <RosterPane />
    <SquadsPane />
  </div>
  )
}

export default App
