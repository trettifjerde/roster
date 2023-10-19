import { getSquadIdsFromMask } from "../util/helpers";
import { ReadySide, Roster, RosterMakerRequest, RosterMakerResponse, RosterSlaveRequest, RosterSlaveResponse, Rotation, Side, SideInfo } from "../util/types";
import SlaveWorker from './roster-slave?worker';

const slaves : Worker[] = [];
const SLAVES_PARTS = [8, 6.125, 4.29, 2.52, 1];
let sides : Side[] = [];
let allSquads = BigInt(0);
let time : number;
let slaveDone = 0;
const sidesCounter : {[key: string] : number} = {};

self.onmessage = ({data}: {data: RosterMakerRequest}) => {
    switch (data.command) {
        case 'init':
            allSquads = data.allSquads;
            break;

        case 'update':
            sides.push(data.side);
            if (!(data.side.squads.toString() in sidesCounter)) {
                sidesCounter[data.side.squads.toString()] = 0;
            }
            sidesCounter[data.side.squads.toString()] += 1;
            break;

        case 'done':
            for (const [side, count] of Object.entries(sidesCounter)) {
                if (count > 1) {
                    console.log('duplicate', side);
                }
            }
            console.log('sides length', sides.length);
            startCombining();
            break;
    }
}

function getBatches() {
    const batches : {sides: Side[], limit: number}[] = [];
    
    for (let i = 0; i < SLAVES_PARTS.length; i++) {
        const batch : {sides: Side[], limit: number} = {
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
                    const roster = buildRoster(data.rotation);
                    self.postMessage({status: 'update', roster} as RosterMakerResponse)
                    break;

                case 'done':
                    slaveDone++;
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
            slaveIndex: i,
            allSquads
        } as RosterSlaveRequest);

        slaves.push(worker);
    }

    time = performance.now();
    
    for (const worker of slaves) {
        worker.postMessage({command: 'start'} as RosterSlaveRequest);
    }
}

function buildRoster(rot: Rotation) {
    return [
        [buildSide(rot[0]), buildSide(rot[1])], 
        [buildSide(rot[2]), buildSide(rot[3])]
    ] as Roster;
}

function buildSide(side: ReadySide) {
    return {
        squads: getSquadIdsFromMask(side.squads),
        slots: side.slots, 
        happiness: side.happiness
    } as SideInfo;
}