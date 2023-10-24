import { SquadInfo } from "./squads-info";
import { FormValues, Roster, Squad, IdTagMap } from "./types";

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

export function calcDefaultFormParams(squads: Squad[]) {
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
    const defaultHappiness = Math.round(squadsPerSide * 1.5 - squadsPerSide * 0.2 - 1);

    if (squadsPerSide === 1) {
        const largestSquadId = squads.find(s => s.slots === largestSquad)!.id;
        return {
            slots: {
                defaultValue: largestSquad - Math.max(...squads.filter(s => s.id !== largestSquadId).map(s => s.slots)),
                min: 0,
                max: 0
            },
            happiness: {
                defaultValue: defaultHappiness,
                min: 0, 
                max: 0
            }
        } as FormValues;
    }

    const formParams : FormValues = {
        slots: {
            defaultValue: 2,
            min: 0,
            max: 4
        },
        happiness: {
            defaultValue: defaultHappiness,
            min: Math.ceil(squadsPerSide) * -2, 
            max: Math.floor(squadsPerSide) * 2
        }
    };

    return formParams;
}

export function printTime(string: string, start: number) {
    console.log(string, ((performance.now() - start) / 60000).toFixed(2), 'm');
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
    return [...prev, newOne].sort((a, b) => b.totalHappiness - a.totalHappiness);
}