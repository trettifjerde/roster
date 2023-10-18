import { Squad } from "../util/types";

export const ADD_SQUAD = 'ADD_SQUAD';
export const DELETE_SQUAD = 'DELETE_SQUAD';
export const UPDATE_SQUAD = 'UPDATE_SQUAD';

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

export type Action = AddSquad | UpdateSquad | DeleteSquad;