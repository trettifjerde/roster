import { ReactNode, createContext, useReducer } from "react";
import { State, initStateMaker, reducer } from "./reducer";
import { Action } from "./actions";
import { translations } from "./translations";

export const StateContext = createContext<{state: State, dispatch: React.Dispatch<Action>}>({
    state: {squads: [],tagIdMap: new Map(), ui: translations.en, defaultHappiness: 0},
    dispatch: () => {}
});

export default function StateContextProvider({children}: {children: ReactNode}) {

    const [state, dispatch] = useReducer(reducer, null, initStateMaker);

    return <StateContext.Provider value={{state, dispatch}}>
        {children}
    </StateContext.Provider>
}