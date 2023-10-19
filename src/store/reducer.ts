import { makeSquadFromForm, makeSquadFromSquadInfo } from "../util/helpers"
import { SQUADS_INFO } from "../util/squads-info"
import { Squad, TagIdMap } from "../util/types"
import * as a from "./actions"

export type State = {
    squads: Squad[],
    tagIdMap: TagIdMap,
}

function sortSquads(squads: Squad[]) {
    return squads.sort((a, b) => a.tag.toUpperCase() > b.tag.toUpperCase() ? 1 : -1);
}

export function initStateMaker() {
    const squads: Squad[] = [];
    const tagIdMap : TagIdMap = new Map();

    for (const info of SQUADS_INFO) {
        const squad = makeSquadFromSquadInfo(info);
        squads.push(squad);
        tagIdMap.set(squad.tag, squad.id);
        tagIdMap.set(squad.id, squad.tag);
    }

    for (let i = 0; i < squads.length; i++) {
        const squad = squads[i];
        const info = SQUADS_INFO[i];
        squad.with = new Set(info.with.map(tag => tagIdMap.get(tag) as number));
        squad.without = new Set(info.without.map(tag => tagIdMap.get(tag) as number));
    }

    sortSquads(squads);
    console.log(squads);

    return {squads, tagIdMap} as State;
}
export function reducer(state: State, action: a.Action) : State {
    switch (action.type) {
        case a.ADD_SQUAD:
            const squad = makeSquadFromForm(action.info);

            return {
                ...state,
                squads: sortSquads([...state.squads, squad]),
                tagIdMap: new Map(state.tagIdMap).set(squad.tag, squad.id).set(squad.id, squad.tag),
            }

        case a.UPDATE_SQUAD:
            const updState = {
                ...state,
                squads: sortSquads([...state.squads.filter(s => s.id !== action.info.id), action.info]),
            };

            const oldTag = state.tagIdMap.get(action.info.id) as string;
            if (oldTag !== action.info.tag) {
                updState.tagIdMap = new Map(state.tagIdMap)
                    .set(action.info.id, action.info.tag)
                    .set(action.info.tag, action.info.id);
                updState.tagIdMap.delete(oldTag);
            }

            return updState;

        case a.DELETE_SQUAD:
            const updSqds = state.squads
                .filter(s => s.id !== action.id)
                .map(s => {
                    if (s.with.has(action.id) || s.without.has(action.id)) {
                        const withs = new Set(s.with);
                        const withouts = new Set(s.without);
                        withs.delete(action.id);
                        withouts.delete(action.id);
                        return {
                            ...s,
                            with: withs,
                            without: withouts
                        }
                    }

                    else return s;
                })

            const t = state.tagIdMap.get(action.id) as string;
            state.tagIdMap.delete(t);
            state.tagIdMap.delete(action.id);

            return {
                ...state,
                squads: updSqds
            }
        default:
            return state;
    }

}

