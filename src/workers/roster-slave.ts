import { PossibleRotations, RosterSlaveRequest, RosterSlaveResponse, Side } from "../util/types";

let sides: Side[];
let allSquads: bigint;
let limit: number;
let slaveIndex: number;

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
    console.log('Slave done');
    self.postMessage({status: 'done', slaveIndex} as RosterSlaveResponse);
    self.close();
}

function combineSides(remainingSquads: bigint, compIndexes: number[], level=3) {

    if (level < 0) {
        
        if (remainingSquads === BigInt(0))
            return [[]] as PossibleRotations;
        else
            return [] as PossibleRotations;
    }

    const rotations : PossibleRotations = [];

    let roundCounter = (level === 3) ? limit : compIndexes.length;

    while (roundCounter > 0) {
        const index = compIndexes.shift()!;
        const side = sides[index];
        const remSq = remainingSquads ^ side.squads;
        const remInd = compIndexes.filter(i => (remSq & sides[i].squads) === sides[i].squads);

        const rots = combineSides(remSq, remInd, level - 1).map(rot => ([...rot, index]));

        if (level === 3) 
            rots.forEach(rot => announceRotation(rot));
        
        else 
            rots.forEach(rot => rotations.push(rot));

        roundCounter--;
    }

    return rotations;
}

function announceRotation(indexes: number[]) {
    let str = 'Roster\n';
    for (const i of indexes) {
        const side = sides[i];
        str += `slots: ${side.slots} squads: ${side.squads}\n`;
    }
    console.log(str);
}

function allSquadsPresent(indexes: number[]) {
    const total = indexes.reduce((acc, i) => acc | sides[i].squads, BigInt(0));
    return total === allSquads;

}

function makeHash(index: number, remainingSquads: bigint) {
    return `${index}-${remainingSquads}`;
}