export type Squad = {id: number, tag: string, slots: number, with: Set<number>, without: Set<number>};
export type SquadsMap = Map<number, Squad>;
export type TagIdMap = Map<string|number, number|string>;

export type SideInfo = {slots: number, squads: number[], happiness: number};
export type Roster = SideInfo[];

export type Side = {slots: number; squads: bigint};
export type ReadySide = Side & {happiness: number};
export type Rotation = ReadySide[];
export type SideMakerMemo = {[key: string]: Side[]};

export type SidesMakerRequest = { 
    command: 'init',
    squads: Squad[], 
    sideHappy: number,
    slotsDiff: number,
    squadHappy: number
};
export type SidesMakerResponse = {status: 'update', side: ReadySide} | {status: 'done'};

export type RosterMakerRequest = 
    {command: 'init', allSquads: bigint, slotsDiff: number} |
    {command: 'update', side: ReadySide} |
    {command: 'start'} | 
    {command: 'terminate'};
export type RosterMakerResponse = {status: 'starting', sidesLength: number} | 
    {status: 'update', roster: Roster} | 
    {status: 'announce-side', sidesLength: number} |
    {status: 'done'} |
    {status: 'slaves-terminated'};

export type RosterSlaveRequest = {
    command: 'init', 
    sides: ReadySide[], 
    allSquads: bigint,
    limit: number
} | {
    command: 'start'
} | {
    command: 'terminate'
};
export type RosterSlaveResponse = {status: 'update', rotation: ReadySide[]} | {status: 'done'};


export type HappinessInfo = {tag: string, happy: string[], unhappy: string[], total: number};