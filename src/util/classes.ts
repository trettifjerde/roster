import { SquadInfo } from "./squads-info";
export class Squad {

    static nextSquadId = 1;
    
    public tag: string;
    public id: number;
    public slots: number;
    public with: Set<string>;
    public without: Set<string>;

    constructor(squad: SquadInfo) {
        this.tag = squad.tag;
        this.slots = squad.slots;
        this.with = new Set([...squad.with]);
        this.without = new Set([...squad.without]);

        this.id = Squad.nextSquadId;
        Squad.nextSquadId *= 2;
    }
}