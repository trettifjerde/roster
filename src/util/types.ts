export const SLOTS = 'slots';
export const HAPPINESS = 'happiness';
export const HAPPY = 'happy';
export const UNHAPPY = 'unhappy';
export const INVALID = 'invalid';
export const RANGE = 'range';
export const UNKNOWN = 'unknown';
export const UNWANTED = 'unwanted';

export type Squad = {id: number, tag: string, slots: number, with: Set<number>, without: Set<number>};
export type SquadsMap = Map<number, Squad>;
export type IdTagMap = Map<number, string>;

export type SideInfo = {slots: number, squads: number[], happiness: number};
export type Roster = {id: number, roster: SideInfo[], averageHappiness: number};

export type CalculationParams = {[SLOTS]: number, [HAPPINESS]: number, [HAPPY]: number, [UNHAPPY]: number, [UNWANTED]: number | null};

export type RosterFieldConfig = {
    default: number,
    min: number,
    max: number,
};
export type RosterFormConfig = {
    form: {
        [SLOTS]: RosterFieldConfig
        [HAPPINESS]: RosterFieldConfig,
        [HAPPY]: RosterFieldConfig,
        [UNHAPPY]: RosterFieldConfig,
        [UNWANTED]: RosterFieldConfig
    },
    squadsPerSide: number,
    unwantedOff: boolean
};

export type RosterFormFieldError = typeof INVALID | typeof RANGE | typeof UNKNOWN;
export type RosterFormFieldValue = number | string;

export type RosterFormFieldState = RosterFieldConfig & {value: RosterFormFieldValue, error: RosterFormFieldError | ''};
export type RosterFormForm = {
    [SLOTS]: RosterFormFieldState,
    [HAPPINESS]: RosterFormFieldState,
    [HAPPY]: RosterFormFieldState,
    [UNHAPPY]: RosterFormFieldState,
    [UNWANTED]: RosterFormFieldState
};

export type RosterFormError = {field: RosterFormFieldname, error: RosterFormFieldError} | null;

export type RosterFormState = {
    form: RosterFormForm,
    error: RosterFormError,
    squadsPerSide: number,
    unwantedOff: boolean
}
export type RosterFormFieldname = keyof RosterFormForm;
export type RosterFormNewValue = {name: RosterFormFieldname, value: string};

export type Side = {slots: number; squads: bigint, happiness: number};
export type Rotation = Side[];
export type SideMakerMemo = {[key: string]: Side[]};

export type SidesMakerInitInfo = { 
    squads: Squad[], 
    minHappiness: number,
    slotsDiff: number,
    points: {happy: number, unhappy: number},
    unwanted: number | null
};


export type SidesMakerRequest = { 
    command: 'init',
    info: SidesMakerInitInfo
};

export type SidesMakerResponse = {status: 'side-made', side: Side} | {status: 'done'};

export type RosterMakerRequest = 
    {command: 'init', allSquads: bigint, slotsDiff: number} |
    {command: 'validate-side', side: Side} |
    {command: 'make-batches'} |
    {command: 'validate-roster', rotation: Side[]};

export type RosterMakerResponse = {status: 'starting', totalSides: number} |
    {status: 'side-ready', totalSides: number} |
    {status: 'batches-ready', batches: Batch[]} |
    {status: 'roster-ready', roster: Roster}

export type RosterSlaveRequest = {
    command: 'calculate', 
    sides: Side[], 
    allSquads: bigint,
    limit: number
};
export type RosterSlaveResponse = {status: 'sides-combined', rotation: Side[]} | {status: 'done'};

export type Batch = {sides: Side[], limit: number};

export type HappinessInfo = {tag: string, happy: string[], unhappy: string[], total: number};