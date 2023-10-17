import { Squad } from "../util/classes"
import { SQUADS_INFO } from "../util/squads-info"
import { TagIdMap } from "../util/types"
import * as a from "./actions"

type State = {
    squads: Squad[],
    tagIdMap: TagIdMap
}

export function initStateMaker() {
    const squads: Squad[] = [];
    const tagIdMap : TagIdMap = new Map();

    for (const info of SQUADS_INFO) {
        const squad = new Squad(info);
        squads.push(squad);
        tagIdMap.set(squad.tag, squad.id);
        tagIdMap.set(squad.id, squad.tag);
    }

    squads.sort((a, b) => a.tag.toUpperCase() > b.tag.toUpperCase() ? 1 : -1);

    return {squads, tagIdMap} as State;
}
export function reducer(state: State, action: a.Action) : State {
    switch (action.type) {
        case a.ADD_SQUAD:
            const squad = new Squad(action.info);

            return {
                ...state,
                squads: [...state.squads, squad],
                tagIdMap: new Map(state.tagIdMap).set(squad.tag, squad.id).set(squad.id, squad.tag)
            }

        case a.DELETE_SQUAD:
            return {
                ...state,
                squads: state.squads.filter(s => s.tag !== action.tag),
                tagIdMap: new Map([...state.tagIdMap].filter(([key, value]) => ((key !== action.tag) && (value !== action.tag))))
            }
        default:
            return state;
    }

}

