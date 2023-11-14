import { getSquadIdsFromMask, printPerformance } from "../util/helpers";
import { Side, Roster, RosterMakerRequest, RosterMakerResponse, RosterSlaveRequest, RosterSlaveResponse, Rotation, SideInfo } from "../util/types";
import SlaveWorker from './roster-slave?worker';

type Batch = {sides: Side[], limit: number};

const slaves: {[key: number]: Worker} = {};
const SLAVES_NUM = 5;

let sideSet : Set<bigint>;
let sides : Side[];
let totalRosters: number;
let allSquads: bigint;
let slotsDiff: number;
let time : number;
let batches : Batch[];

self.onmessage = ({data}: {data: RosterMakerRequest}) => {
    switch (data.command) {
        case 'init':
            sideSet = new Set();
            sides = [];
            totalRosters = 0;
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
    const biggestId = (allSquads + BigInt(1)) / BigInt(2);
    let sidesToHandle = sides.findIndex(s => s.squads < biggestId);

    while (sides.length > 0 && sidesToHandle > 0) {
        const prevBatch = batches[batches.length - 1];
        const limit = prevBatch ? calcLimit(prevBatch, sidesToHandle) : Math.ceil(sides.length * 0.01);
        const batch : Batch = {sides: [...sides], limit};

        batches.push(batch);

        sides = sides.slice(limit);
        sidesToHandle -= limit;  
    }
    //console.log(batches);
}

function calcLimit(prevBatch: Batch, sidesToHandle: number) {
    return Math.min(sidesToHandle, Math.round((prevBatch.sides.length / sides.length) * prevBatch.limit), sides.length);
}

function startCombining() {
    makeBatches();

    for (let i = 0; i < Math.min(SLAVES_NUM, batches.length); i++) {
        const worker = new SlaveWorker();

        worker.onmessage = (e: {data: RosterSlaveResponse}) => {
            const {data} = e;

            switch (data.status) {
                case 'update':
                    const roster = isValidRoster(data.rotation);
                    if (roster) {
                        self.postMessage({status: 'update', roster} as RosterMakerResponse);
                    }
                    else {
                        //console.log(data.rotation, 'from slave', i, 'has failed slots diff test');
                    }
                    break;

                case 'done':
                    if (batches.length > 0) 
                        feedNewBatchTo(worker, i.toString());
                    
                    else {
                        //console.log('No more batches. Terminating slave', i);
                        worker.terminate();
                        delete slaves[i];

                        if (Object.keys(slaves).length === 0) {
                            printPerformance('RosterMaker', performance.now() - time);
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
        slotsDiff,
        allSquads
    } as RosterSlaveRequest);
}

function isValidRoster(rot: Rotation) {
    const sorted = [...rot].sort((a, b) => b.slots - a.slots);

    for (const [i, j] of [[0, 1], [2, 3]]) {
        if (Math.abs(sorted[i].slots - sorted[j].slots) > slotsDiff) 
            return null;
    }

    const roster: Roster = {
        id: totalRosters, 
        roster: sorted.map(side => buildSide(side)),
        averageHappiness: sorted.reduce((acc, side, i) => {
            return i === 0 ? side.happiness : ((acc * i) + side.happiness) / (i + 1)
        }, 0)
    };
    totalRosters++;

    return roster;
}

function buildSide(side: Side) {
    return {
        squads: getSquadIdsFromMask(side.squads),
        slots: side.slots, 
        happiness: side.happiness
    } as SideInfo;
}