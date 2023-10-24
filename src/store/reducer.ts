import { makeSquadFromForm, makeSquadsFromSquadInfo, sortSquads, } from "../util/helpers"
import { SQUADS_INFO } from "../util/squads-info"
import { Squad } from "../util/types"
import { Language, translations } from "./translations";
import * as a from "./actions"


export function initStateMaker() {
    const language = (() =>{
        let lang = localStorage.getItem('lang');
        if (!lang || (lang !== 'en' && lang !== 'ru')) 
            return 'en';
        else
            return lang as Language;
    })();

    const ui = translations[language]

    const {squads, idTagMap, nextId} = makeSquadsFromSquadInfo(SQUADS_INFO)

    return {squads, idTagMap, ui, nextId};
}
export type State = ReturnType<typeof initStateMaker>;

export function reducer(state: State, action: a.Action) : State {
    let squads: Squad[];

    switch (action.type) {
        case a.ADD_SQUAD:
            const squad = makeSquadFromForm(action.info, state.nextId);
            squads = sortSquads([...state.squads, squad]);
            return {
                ...state,
                squads,
                nextId: state.nextId * 2,
                idTagMap: new Map(state.idTagMap).set(squad.id, squad.tag),
            }

        case a.UPDATE_SQUAD:
            squads = sortSquads([...state.squads.filter(s => s.id !== action.info.id), action.info]);

            const updState = {
                ...state,
                squads,
            };

            const oldTag = state.idTagMap.get(action.info.id)!;
            if (oldTag !== action.info.tag) {
                updState.idTagMap = new Map(state.idTagMap).set(action.info.id, action.info.tag)
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
                    else 
                        return s;
                })

            const t = state.idTagMap.get(action.id)!;
            state.idTagMap.delete(action.id);

            return {
                ...state,
                squads
            }

        case a.SWITCH_LANGUAGE:
            return {
                ...state,
                ui: translations[action.lang]
            }

        case a.UPLOAD_SQUADS:
            return {
                ...state,
                squads: action.squads,
                idTagMap: action.idTagMap, 
                nextId: action.nextId
            }

        default:
            return state;
    }

}

