import { getSquadIdsFromMask, printTime } from "../util/helpers";
import { Side, Roster, RosterMakerRequest, RosterMakerResponse, RosterSlaveRequest, RosterSlaveResponse, Rotation, SideInfo } from "../util/types";
import SlaveWorker from './roster-slave?worker';

type Batch = {sides: Side[], limit: number};

const slaves: {[key: number]: Worker} = {};
const SLAVES_NUM = 5;

let sideSet : Set<bigint>;
let sides : Side[];
let allSquads: bigint;
let slotsDiff: number;
let time : number;
let batches : Batch[];

self.onmessage = ({data}: {data: RosterMakerRequest}) => {
    switch (data.command) {
        case 'init':
            sideSet = new Set();
            sides = [];
            allSquads = data.allSquads;
            slotsDiff = data.slotsDiff;
            batches = [];
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

function makeBatches() {
    sides.sort((a, b) => (b.squads - a.squads > 1)? 1 : -1);
    const stop = (allSquads + BigInt(1)) / BigInt(2);

    while ((sides.length > 0) && (sides[0].squads > stop)) {
        const prevBatch = batches[batches.length - 1];
        const limit = prevBatch ? calcLimit(prevBatch) : Math.round(sides.length * 0.02);

        batches.push({
            sides: [...sides],
            limit
        });

        sides = sides.slice(limit);  
    }
    console.log(batches);
}

function calcLimit(prevBatch: Batch) {
    return Math.min(Math.round((prevBatch.sides.length / sides.length) * prevBatch.limit), sides.length);
}

function startCombining() {
    makeBatches();

    for (let i = 0; i < SLAVES_NUM; i++) {
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
                    if (batches.length > 0) 
                        feedNewBatchTo(worker, i.toString());
                    
                    else {
                        console.log('No more batches. Terminating slave', i);
                        worker.terminate();
                        delete slaves[i];

                        if (Object.keys(slaves).length === 0) {
                            printTime('RosterMaker done in', time);
                            self.postMessage({status: 'done'} as RosterMakerResponse);
                        }
                    }
                    break;
            }           

        };

        slaves[i] = worker;
    }

    time = performance.now();

    for (const [name, worker] of Object.entries(slaves)) {
        if (batches.length > 0) {
            feedNewBatchTo(worker, name);
        }
    }
}

function feedNewBatchTo(slave: Worker, name: string) {
    const batch = batches.shift()!;

    slave.postMessage({
        command: 'calculate',
        slaveName: name,
        limit: batch.limit,
        sides: batch.sides,
        allSquads
    } as RosterSlaveRequest);
}

function isValidRoster(rot: Rotation) {
    const sorted = [...rot].sort((a, b) => b.slots - a.slots);

    for (const [i, j] of [[0, 1], [2, 3]]) {
        if (Math.abs(sorted[i].slots - sorted[j].slots) > slotsDiff) 
            return null;
    }

    return sorted.map(side => buildSide(side)) as Roster;
}

function buildSide(side: Side) {
    return {
        squads: getSquadIdsFromMask(side.squads),
        slots: side.slots, 
        happiness: side.happiness
    } as SideInfo;
}