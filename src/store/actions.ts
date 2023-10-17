import { SquadInfo } from "../util/squads-info";

export const ADD_SQUAD = 'ADD_SQUAD';
export const DELETE_SQUAD = 'DELETE_SQUAD';

export class AddSquad {
    public readonly type = ADD_SQUAD;
    constructor(public info: SquadInfo) {}
};

export class DeleteSquad {
    public readonly type = DELETE_SQUAD;
    constructor(public tag: string) {}
}

export type Action = AddSquad | DeleteSquad;