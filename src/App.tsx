
import { useReducer } from 'react';
import { reducer, initStateMaker } from './store/reducer';
import SquadGrid from './components/squads/squads';

function App() {

  const [state, dispatch] = useReducer(reducer, null, initStateMaker);

    
    
  return (<>
    <SquadGrid squads={state.squads} />
  </>
  )
}

export default App
