import { printPerformance } from "../util/helpers";
import { Side, RosterSlaveRequest, RosterSlaveResponse, Rotation, } from "../util/types";

let slaveName: string;
let sides: Side[];
let allSquads: bigint;
let limit: number;
let time: number;
let slotsDiff: number;

self.onmessage = ({data}: {data: RosterSlaveRequest}) => {
    switch (data.command) {
        case 'calculate':
            sides = data.sides;
            allSquads = data.allSquads;
            limit = data.limit;
            slaveName = data.slaveName;
            slotsDiff = data.slotsDiff;
            time = performance.now();

            //console.log(`Slave ${slaveName} receives a new batch: {sides: ${sides.length}, limit: ${limit}}`);
            startCombining();
            //printPerformance(`Slave ${slaveName}`, performance.now() - time);

            self.postMessage({status: 'done'} as RosterSlaveResponse);
            break;
    }
}

function startCombining() {
    combineSides(allSquads, sides.map((s, i) => i));
}

function combineSides(remainingSquads: bigint, compIndexes: number[], level=3, otherSideSlots?: number) {

    if (level < 0) {
        
        if (remainingSquads === BigInt(0))
            return [[]];
        else
            return [];
    }

    const rotations : Rotation[] = [];

    let roundCounter = (level === 3) ? limit : compIndexes.length;

    while (roundCounter > 0) {
        const index = compIndexes.shift()!;
        const side = sides[index];
        const remSq = remainingSquads ^ side.squads;
        const remInd: number[] = [];
        
        for (let j = compIndexes.length - 1; j >= 0; j--) {
            const compIndex = compIndexes[j];
            const compSide = sides[compIndex];
            if (compSide.squads > remSq)
                break;
            
            if (((remSq & compSide.squads) === compSide.squads)) {
                remInd.unshift(compIndex);
            }
        }

        const rots = combineSides(remSq, remInd, level - 1)
            .map(rot => ([...rot, side] as Rotation))

        if (level === 3) 
            rots.forEach(rot => announceRotation(rot));
        
        else 
            rots.forEach(rot => rotations.push(rot));

        roundCounter--;
    }

    return rotations;
}

function announceRotation(rotation: Rotation) {
    self.postMessage({status: 'update', rotation} as RosterSlaveResponse);
}