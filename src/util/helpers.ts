import { SquadInfo } from "./squads-info";
import { Roster, Rotation, Side, SideInfo, Squad } from "./types";

let nextSquadId = 1;

export function makeSquadFromSquadInfo(info: SquadInfo) {
    const id = nextSquadId;
    nextSquadId *= 2;

    return {
        id,
        tag: info.tag,
        slots: info.slots,
        with: new Set(),
        without: new Set()
    } as Squad;
}

export function makeSquadFromForm(info: Squad) {
    let curId: number;

    if (info.id)
        curId = info.id;
    else {
        curId = nextSquadId;
        nextSquadId *= 2;
    }

    return {
        id: curId,
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

export function calcDefaultHappiness(squads: Squad[]) {
    const totalSlots = squads.reduce((acc, squad) => acc + squad.slots, 0);
    return Math.round(((totalSlots / 4) / (totalSlots / squads.length)) * 1.2);
}

export function printTime(string: string, start: number) {
    console.log(string, ((performance.now() - start) / 60000).toFixed(2), 'm');
}