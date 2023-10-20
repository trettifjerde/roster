import { getSquadIdsFromMask } from "../util/helpers";
import { ReadySide, Roster, RosterMakerRequest, RosterMakerResponse, RosterSlaveRequest, RosterSlaveResponse, Rotation, SideInfo } from "../util/types";
import SlaveWorker from './roster-slave?worker';

const slaves: {[key: number]: Worker} = {};
const SLAVES_PARTS = [8, 6.125, 4.29, 2.52, 1];

let sideSet : Set<bigint>;
let sides : ReadySide[];
let allSquads: bigint;
let slotsDiff: number;
let slaveDone: number;
let time : number;

self.onmessage = ({data}: {data: RosterMakerRequest}) => {
    switch (data.command) {
        case 'init':
            sideSet = new Set();
            sides = [];
            allSquads = data.allSquads;
            slotsDiff = data.slotsDiff;
            slaveDone = 0;
            break;

        case 'update':
            if (!sideSet.has(data.side.squads)) {
                sides.push(data.side);
                sideSet.add(data.side.squads);
                self.postMessage({status: 'announce-side', sidesLength: sides.length} as RosterMakerResponse)
            }
            break;

        case 'start':
            self.postMessage({status: 'starting', sidesLength: sides.length} as RosterMakerResponse);
            startCombining();
            break;

        case 'terminate':
            for (const i in slaves) {
                slaves[i].terminate();
                delete slaves[i];
            }
            self.postMessage({status: 'slaves-terminated'} as RosterMakerResponse)
            break;
    }
}

function getBatches() {
    const batches : {sides: ReadySide[], limit: number}[] = [];
    
    for (let i = 0; i < SLAVES_PARTS.length; i++) {
        const batch : {sides: ReadySide[], limit: number} = {
            sides: [...sides], 
            limit: Math.round(sides.length / SLAVES_PARTS[i])
        };
        batches.push(batch);
        sides = sides.slice(batch.limit);
    }
    return batches;
}

function startCombining() {
    const batches = getBatches();

    for (let i = 0; i < batches.length; i++) {
        const worker = new SlaveWorker();

        worker.onmessage = (e: {data: RosterSlaveResponse}) => {
            const {data} = e;

            switch (data.status) {
                case 'update':
                    const roster = isValidRoster(data.rotation);
                    if (roster)
                        self.postMessage({status: 'update', roster} as RosterMakerResponse);
                    else 
                        console.log(data.rotation, 'from slave', i, 'has failed slots diff test');
                    break;

                case 'done':
                    slaveDone++;
                    console.log('Slave', i, 'done');
                    delete slaves[i];

                    if (slaveDone === batches.length) {
                        console.log('slaves ready in', ((performance.now() - time) / (60 * 1000)));
                        self.postMessage({status: 'done'} as RosterMakerResponse)
                    }
                    break;
            }           

        };

        worker.postMessage({
            command: 'init', 
            limit: batches[i].limit,
            sides: batches[i].sides, 
            allSquads
        } as RosterSlaveRequest);

        slaves[i] = worker;
    }

    time = performance.now();
    
    for (const worker of Object.values(slaves)) {
        worker.postMessage({command: 'start'} as RosterSlaveRequest);
    }
}

function isValidRoster(rot: Rotation) {
    const sorted = [...rot].sort((a, b) => b.slots - a.slots);

    for (const [i, j] of [[0, 1], [2, 3]]) {
        if (Math.abs(sorted[i].slots - sorted[j].slots) > slotsDiff) 
            return null;
    }

    return sorted.map(side => buildSide(side)) as Roster;
}

function buildSide(side: ReadySide) {
    return {
        squads: getSquadIdsFromMask(side.squads),
        slots: side.slots, 
        happiness: side.happiness
    } as SideInfo;
}