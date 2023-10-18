import { SquadInfo } from "./squads-info";
import { Squad } from "./types";

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