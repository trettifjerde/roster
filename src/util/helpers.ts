import { SquadInfo } from "./squads-info";
import { Roster, Squad, IdTagMap, RosterFormConfig, RosterFormState, RosterFormFieldname, RosterFormNewValue, RosterFormError, RosterFormFieldState, SLOTS, HAPPINESS, HAPPY, UNHAPPY, INVALID, RANGE, UNKNOWN, RosterFormForm, RosterFormFieldError, UNWANTED } from "./types";

export const HAPPY_POINT = 2;
export const UNHAPPY_POINT = -6;

export function makeSquadFromSquadInfo(info: SquadInfo, id: number) {       
    return {
        id,
        tag: info.tag,
        slots: info.slots,
        with: new Set(),
        without: new Set()
    } as Squad;
}

export function makeSquadFromForm(info: Squad, id: number) {
    return {
        id,
        tag: info.tag,
        slots: info.slots,
        with: info.with,
        without: info.without

    } as Squad;
}

export function getSquadIdsFromMask(mask: bigint) {
    const ids: number[] = [];

    let squadFlags = mask;
    let otherSquadId = 1;

    while (squadFlags > 0) {

        if (squadFlags & BigInt(0x1)) {
            ids.push(otherSquadId);           
        }

        otherSquadId *= 2;
        squadFlags >>= BigInt(1);
    }
    return ids;
}

export function calcDefaultFormParams(squads: Squad[], happy?: number, unhappy?: number) : RosterFormConfig {
    happy = happy || HAPPY_POINT;
    unhappy = unhappy || UNHAPPY_POINT;

    let totalSlots = 0;
    let largestSquad = 0;
    let smallestSquad = 1000;

    for (const squad of squads) {
        totalSlots += squad.slots;
        largestSquad = Math.max(largestSquad, squad.slots);
        smallestSquad = Math.min(smallestSquad, squad.slots);
    }

    const slotsPerSide = totalSlots / 4;
    const squadsPerSide = slotsPerSide / (totalSlots / squads.length); 
    const happinessConfig = calcHappinessConfig(squadsPerSide, happy, unhappy);
    
    if (squadsPerSide === 1) {
        const largestSquadId = squads.find(s => s.slots === largestSquad)!.id;
        const slotsDiff = largestSquad - Math.max(...squads.filter(s => s.id !== largestSquadId).map(s => s.slots));

        return {
            form: {
                [SLOTS]: {
                    default: slotsDiff,
                    min: slotsDiff,
                    max: largestSquad - smallestSquad
                },
                [HAPPY]: {
                    default: 0,
                    min: 0,
                    max: 0
                },
                [UNHAPPY]: {
                    default: 0,
                    min: 0,
                    max: 0
                },
                [HAPPINESS]: happinessConfig,
                [UNWANTED]: {
                    default: 0,
                    min: 0,
                    max: 0
                }
            },
            squadsPerSide,
            unwantedOff: true
        };
    }
    

    const formParams = {
        form: {
            [SLOTS]: {
                default: 2,
                min: 0,
                max: 5
            },
            [HAPPY]: {
                default: happy,
                min: 1,
                max: 20
            },
            [UNHAPPY]: {
                default: unhappy,
                min: -40,
                max: -1
            },
            [HAPPINESS]: happinessConfig,
            [UNWANTED]: {
                default: 1,
                min: 0,
                max: 5
            }
        },
        squadsPerSide,
        unwantedOff: true
    };

    return formParams;
}

export function calcHappinessConfig(squadsPerSide: number, happy: number, unhappy: number) {
    return squadsPerSide === 1 ? {
        default: 0,
        min: 0, 
        max: 0
    } : {
        default: formatHappiness((((squadsPerSide / 2) * (squadsPerSide /  3) * happy) + ((squadsPerSide / 8) * unhappy)) / squadsPerSide),
        min: unhappy, 
        max: Math.floor(squadsPerSide / 2) * happy
    }
}

export function updateStateHappiness(squadsPerSide: number, happy: number, unhappy: number) : RosterFormFieldState {
    const config = calcHappinessConfig(squadsPerSide, happy, unhappy);
    return {...config, value: config.default, error: ''};
}

export function initRosterForm(squads: Squad[]) {
    const formConfig = calcDefaultFormParams(squads);
    return Object.entries(formConfig.form).reduce((acc, [field, config]) => {
        acc.form[field as RosterFormFieldname] = {...config, value: config.default, error: ''};
        return acc;
    }, {
        form: {}, 
        squadsPerSide: formConfig.squadsPerSide,
        error: null,
        unwantedOff: formConfig.unwantedOff
    } as RosterFormState)
}

export function validateRosterFormField(state: RosterFormState, newValue: RosterFormNewValue) :  {
    value: number, error: ''} | {
    value: string, error: RosterFormFieldError
} {

    const form = state.form;
    const {name: fieldName, value} = newValue;
    const v = +value;

    try {

        if (!value || isNaN(v)) {
            throw new Error(INVALID);
        }

        if (v < form[fieldName].min || v > form[fieldName].max) 
            throw new Error(RANGE)

        return {value: v, error: ''}
    }
    catch (err) {
        if (err instanceof Error)
            return {value, error: err.message as RosterFormFieldError};
        else 
            return {value, error: UNKNOWN}
    }
}

export function findRosterError(form: RosterFormForm, unwantedOff: boolean) : RosterFormError {
    for (const [field, info] of Object.entries(form)) {
        switch (field) {
            case UNWANTED:
                if (unwantedOff)
                    break;
            
            default: 
                if (info.error) 
                    return {field: field as RosterFormFieldname, error: info.error};
        }
    }
    return null;
}

export function makeSquadsInfo(squads: Squad[], idTagMap: IdTagMap) {
    const info : SquadInfo[] = [];

    for (const squad of squads) {
        const squadInfo : SquadInfo = {
            slots: squad.slots,
            tag: squad.tag,
            with: Array.from(squad.with).map(id => idTagMap.get(id)!),
            without: Array.from(squad.without).map(id => idTagMap.get(id)!),
        };
        info.push(squadInfo);
    }
    return JSON.stringify(info);
}

export async function readSquadInfo(file: File) {
    return new Promise<SquadInfo[]>((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const text = reader.result as string;

            try {
                const data = JSON.parse(text) as SquadInfo[];
                resolve(data);
            }
            catch (error) {
                console.log(error);
                reject();
            }
        };
        reader.onerror = (err) => reject();

        reader.readAsText(file, 'utf-8');
    })
    .then(data => makeSquadsFromSquadInfo(data))
    .catch(err => null)
}

export function makeSquadsFromSquadInfo(squadsInfo: SquadInfo[]) {

    try {
        let nextId = 1;
        const squads: Squad[] = [];
        const idTagMap : IdTagMap = new Map();
        const tagIdMap : Map<string, number> = new Map();

        for (const info of squadsInfo) {
            const squad = makeSquadFromSquadInfo(info, nextId);
            squads.push(squad);
            idTagMap.set(squad.id, squad.tag);
            tagIdMap.set(squad.tag, squad.id);
            nextId *= 2;
        }

        for (let i = 0; i < squads.length; i++) {
            const squad = squads[i];
            const info = squadsInfo[i];
            squad.with = new Set(info.with.map(tag => tagIdMap.get(tag)!));
            squad.without = new Set(info.without.map(tag => tagIdMap.get(tag)!));
        }

        sortSquads(squads);

        return {squads, idTagMap, nextId};
    }
    catch(error) {
        console.log(error);
        throw '';
    }
}

export type SquadsData = ReturnType<typeof makeSquadsFromSquadInfo>;

export function sortSquads(squads: Squad[]) {
    return squads.sort((a, b) => a.tag.toUpperCase() > b.tag.toUpperCase() ? 1 : -1);
}

export function downloadSquadsInfo(squads: Squad[], idTagMap: IdTagMap) {
    const data = makeSquadsInfo(squads, idTagMap);
    const blob = new Blob([data], {type: 'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = `Squads_${new Date().toLocaleDateString()}.txt`;
    a.href = url;
    a.click();
}

export function sortRosters(prev: Roster[], newOne: Roster) {
    return [...prev, newOne].sort((a, b) => (b.averageHappiness - a.averageHappiness));
}

export function formatHappiness(happiness: number) {
    return Number.parseFloat(happiness.toFixed(3));
}

export function printPerformance(text: string, time: number) {
    console.log(text, 'done in', time / 60000);
}

export function getMutualHappiness(squad1: Squad, squad2: Squad, points: {happy: number, unhappy: number}) {
    const res = [0, 0];

    if (squad1.with.has(squad2.id)) 
        res[0] = points.happy;
    else if (squad1.without.has(squad2.id))
        res[0] = points.unhappy;

    if (squad2.with.has(squad1.id))
        res[1] = points.happy;
    else if (squad2.without.has(squad1.id))
        res[1] = points.unhappy;

    return res;
}