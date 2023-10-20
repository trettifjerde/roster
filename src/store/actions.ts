import { Squad } from "../util/types";
import { Language } from "./translations";

export const ADD_SQUAD = 'ADD_SQUAD';
export const DELETE_SQUAD = 'DELETE_SQUAD';
export const UPDATE_SQUAD = 'UPDATE_SQUAD';
export const SWITCH_LANGUAGE = 'SWITCH_LANGUAGE';

export class AddSquad {
    public readonly type = ADD_SQUAD;
    constructor(public info: Squad) {}
};

export class DeleteSquad {
    public readonly type = DELETE_SQUAD;
    constructor(public id: number) {}
}

export class UpdateSquad {
    public readonly type = UPDATE_SQUAD;
    constructor(public info: Squad) {}
}

export class SwitchLanguage {
    public readonly type = SWITCH_LANGUAGE;
    constructor(public lang: Language) {}
}

export type Action = AddSquad | UpdateSquad | DeleteSquad | SwitchLanguage;