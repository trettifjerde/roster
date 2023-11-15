import { getSquadIdsFromMask } from "../util/helpers";
import { Side, Roster, RosterMakerRequest, RosterMakerResponse, Rotation, SideInfo, Batch } from "../util/types";

let sidesMap: Map<bigint, Side>;
let nextRosterId: number;
let allSquads: bigint;
let slotsDiff: number;

self.onmessage = ({data}: {data: RosterMakerRequest}) => {
    switch (data.command) {
        case 'init':
            sidesMap = new Map();
            nextRosterId = 0;
            allSquads = data.allSquads;
            slotsDiff = data.slotsDiff;
            break;

        case 'validate-side':
            if (!sidesMap.has(data.side.squads)) {
                sidesMap.set(data.side.squads, data.side);
                self.postMessage({status: 'side-ready', totalSides: sidesMap.size} as RosterMakerResponse)
            }
            break;

        case 'make-batches':
            self.postMessage({status: 'starting', totalSides: sidesMap.size} as RosterMakerResponse);
            const batches = makeBatches();
            self.postMessage({status: 'batches-ready', batches} as RosterMakerResponse);
            break;

        case 'validate-roster':
            const roster = isValidRoster(data.rotation);
            if (roster) {
                self.postMessage({status: 'roster-ready', roster} as RosterMakerResponse);
            }
            break;
    }
}

function makeBatches() {
    const biggestId = (allSquads + BigInt(1)) / BigInt(2);

    let sides = Array.from(sidesMap.values());
    sides.sort((a, b) => (b.squads - a.squads > 1)? 1 : -1);

    const batches : Batch[] = [];
    let sidesToHandle = sides.findIndex(s => s.squads < biggestId);

    while (sides.length > 0 && sidesToHandle > 0) {
        const prevBatch = batches[batches.length - 1];
        const limit = prevBatch ? calcLimit(prevBatch, sidesToHandle, sides) : Math.ceil(sides.length * 0.01);
        const batch : Batch = {sides: [...sides], limit};

        batches.push(batch);

        sides = sides.slice(limit);
        sidesToHandle -= limit;  
    }
    return batches;
}

function calcLimit(prevBatch: Batch, sidesToHandle: number, sides: Side[]) {
    return Math.min(sidesToHandle, Math.round((prevBatch.sides.length / sides.length) * prevBatch.limit), sides.length);
}

function isValidRoster(rot: Rotation) {
    const sorted = [...rot].sort((a, b) => b.slots - a.slots);

    for (const [i, j] of [[0, 1], [2, 3]]) {
        if (Math.abs(sorted[i].slots - sorted[j].slots) > slotsDiff) 
            return null;
    }

    const roster: Roster = {
        id: nextRosterId, 
        roster: sorted.map(side => buildSide(side)),
        averageHappiness: sorted.reduce((acc, side, i) => {
            return i === 0 ? side.happiness : ((acc * i) + side.happiness) / (i + 1)
        }, 0)
    };
    nextRosterId++;

    return roster;
}

function buildSide(side: Side) {
    return {
        squads: getSquadIdsFromMask(side.squads),
        slots: side.slots, 
        happiness: side.happiness
    } as SideInfo;
}