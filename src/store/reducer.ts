import { calcDefaultHappiness, makeSquadFromForm, makeSquadFromSquadInfo } from "../util/helpers"
import { SQUADS_INFO } from "../util/squads-info"
import { Squad, SquadsMap, TagIdMap } from "../util/types"
import { Language, translations } from "./translations";
import * as a from "./actions"

function sortSquads(squads: Squad[]) {
    return squads.sort((a, b) => a.tag.toUpperCase() > b.tag.toUpperCase() ? 1 : -1);
}

export function initStateMaker() {
    const language = (localStorage.getItem('lang') || 'en') as Language;

    const ui = translations[language];
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
    const defaultHappiness = calcDefaultHappiness(squads);

    return {squads, tagIdMap, ui, defaultHappiness};
}
export type State = ReturnType<typeof initStateMaker>;

export function reducer(state: State, action: a.Action) : State {
    let squads: Squad[];

    switch (action.type) {
        case a.ADD_SQUAD:
            const squad = makeSquadFromForm(action.info);
            squads = sortSquads([...state.squads, squad]);
            return {
                ...state,
                squads,
                tagIdMap: new Map(state.tagIdMap).set(squad.tag, squad.id).set(squad.id, squad.tag),
                defaultHappiness: calcDefaultHappiness(squads)
            }

        case a.UPDATE_SQUAD:
            squads = sortSquads([...state.squads.filter(s => s.id !== action.info.id), action.info]);

            const updState = {
                ...state,
                squads,
                defaultHappiness: calcDefaultHappiness(squads)
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
            squads = state.squads
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
                squads,
                defaultHappiness: calcDefaultHappiness(squads)
            }

        case a.SWITCH_LANGUAGE:
            return {
                ...state,
                ui: translations[action.lang]
            }

        default:
            return state;
    }

}

