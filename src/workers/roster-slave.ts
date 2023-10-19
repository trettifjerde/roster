import { RosterSlaveRequest, RosterSlaveResponse, Rotation, Side } from "../util/types";

let sides: Side[];
let allSquads: bigint;
let limit: number;
let slaveIndex: number;

type RotationSideIndexes = number[];
type Rotations = RotationSideIndexes[];

self.onmessage = ({data}: {data: RosterSlaveRequest}) => {
    switch (data.command) {
        case 'init':
            sides = data.sides;
            allSquads = data.allSquads;
            limit = data.limit;
            slaveIndex = data.slaveIndex;
            console.log('Slave init: sides length', sides.length, 'limit', limit);
            break;
        
        case 'start':
            console.log('Slave start');
            startCombining();
            break;
    }
}

function startCombining() {
    combineSides(allSquads, sides.map((s, i) => i));
    console.log('Slave', slaveIndex, 'done');
    self.postMessage({status: 'done'} as RosterSlaveResponse);
    self.close();
}

function combineSides(remainingSquads: bigint, compIndexes: number[], level=3) {

    if (level < 0) {
        
        if (remainingSquads === BigInt(0))
            return [[]] as Rotations;
        else
            return [] as Rotations;
    }

    const rotations : Rotations = [];

    let roundCounter = (level === 3) ? limit : compIndexes.length;

    while (roundCounter > 0) {
        const index = compIndexes.shift()!;
        const side = sides[index];
        const remSq = remainingSquads ^ side.squads;
        const remInd = compIndexes.filter(i => (remSq & sides[i].squads) === sides[i].squads);

        const rots = combineSides(remSq, remInd, level - 1).map(rot => ([...rot, index] as RotationSideIndexes));

        if (level === 3) 
            rots.forEach(rot => announceRotation(rot));
        
        else 
            rots.forEach(rot => rotations.push(rot));

        roundCounter--;
    }

    return rotations;
}

function announceRotation(indexes: RotationSideIndexes) {
    const rotation = getRotation(indexes);
    self.postMessage({status: 'update', rotation} as RosterSlaveResponse);
}

function getRotation(rot: RotationSideIndexes) {
    return [getSide(rot[0]), getSide(rot[1]), getSide(rot[2]), getSide(rot[3])] as Rotation;
}

function getSide(i: number) {
    return sides[i];
}