export type Squad = {id: number, tag: string, slots: number, with: Set<number>, without: Set<number>};
export type SquadsMap = Map<number, Squad>;
export type IdTagMap = Map<number, string>;

export type SideInfo = {slots: number, squads: number[], happiness: number};
export type Roster = {id: number, roster: SideInfo[], totalHappiness: number};

export type CalculationParams = {slots: number, happiness: number};
export type FormValues = {
    slots: {
        defaultValue: number,
        min: number,
        max: number,
    },
    happiness: {
        defaultValue: number,
        min: number,
        max: number,
    },
}

export type Side = {slots: number; squads: bigint, happiness: number};
export type Rotation = Side[];
export type SideMakerMemo = {[key: string]: Side[]};

export type SidesMakerRequest = { 
    command: 'init',
    squads: Squad[], 
    sideHappy: number,
    slotsDiff: number,
    squadHappy: number
};
export type SidesMakerResponse = {status: 'update', side: Side} | {status: 'done'};

export type RosterMakerRequest = 
    {command: 'init', allSquads: bigint, slotsDiff: number} |
    {command: 'update', side: Side} |
    {command: 'start'} | 
    {command: 'terminate'};
export type RosterMakerResponse = {status: 'starting', sidesLength: number} | 
    {status: 'update', roster: Roster} | 
    {status: 'announce-side', sidesLength: number} |
    {status: 'done'} |
    {status: 'slaves-terminated'};

export type RosterSlaveRequest = {
    command: 'calculate', 
    slaveName: string,
    sides: Side[], 
    slotsDiff: number,
    allSquads: bigint,
    limit: number
};
export type RosterSlaveResponse = {status: 'update', rotation: Side[]} | {status: 'done'};


export type HappinessInfo = {tag: string, happy: string[], unhappy: string[], total: number};