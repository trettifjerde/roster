import { RosterMakerRequest, RosterSlaveRequest, RosterSlaveResponse, Side } from "../util/types";

const slaves : Worker[] = [];
const SLAVES_PARTS = [8, 6.125, 4.29, 2.52, 1];
let sides : Side[] = [];
let allSquads = BigInt(0);
let slaveUrl: string;
let time : number;
let slaveDone = 0;

self.onmessage = ({data}: {data: RosterMakerRequest}) => {
    switch (data.command) {
        case 'init':
            allSquads = data.allSquads;
            slaveUrl = data.slaveUrl;
            break;

        case 'update':
            sides.push(data.side);
            break;

        case 'done':
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
    for (const b of batches) {
        console.log(b.sides.length, b.limit);
    }
    return batches;
}

function startCombining() {
    const batches = getBatches();

    for (let i = 0; i < SLAVES_PARTS.length; i++) {
        const worker = new Worker(slaveUrl);

        worker.onmessage = (e: {data: RosterSlaveResponse}) => {
            slaveDone++;

            if (slaveDone === SLAVES_PARTS.length) {
                console.log((performance.now() - time) / (60 * 1000));
            }

            console.log('Slave', e.data.slaveIndex, 'finished');

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