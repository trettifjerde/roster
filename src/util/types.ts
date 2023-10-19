export type Squad = {id: number, tag: string, slots: number, with: Set<number>, without: Set<number>};
export type SquadsMap = Map<number, Squad>;
export type TagIdMap = Map<string|number, number|string>;

export type SideInfo = {slots: number, squads: number[], happiness: number};
export type ServerInfo = [SideInfo, SideInfo];
export type Roster = [[SideInfo, SideInfo], [SideInfo, SideInfo]];

export type Side = {slots: number; squads: bigint};
export type ReadySide = Side & {happiness: number};
export type Rotation = [ReadySide, ReadySide, ReadySide, ReadySide];
export type SideMakerMemo = {[key: string]: Side[]};

export type SidesMakerRequest = {
    squads: Squad[], 
    sideHappy: number,
    slotsDiff: number,
    squadHappy: number
};
export type SidesMakerResponse = {command: 'update', side: ReadySide} | {command: 'done'};
export type RosterMakerRequest = 
    {command: 'init', allSquads: bigint} |
    {command: 'update', side: ReadySide} |
    {command: 'done'};
export type RosterMakerResponse = {status: 'update', roster: Roster} | {status: 'done'};
export type RosterSlaveRequest = {
    command: 'init', 
    sides: ReadySide[], 
    allSquads: bigint,
    limit: number,
    slaveIndex: number
} | {command: 'start'};
export type RosterSlaveResponse = {status: 'update', rotation: Rotation} | {status: 'done'};


export type HappinessInfo = {tag: string, happy: string[], unhappy: string[], total: number};