import { getSquadIdsFromMask } from "../util/helpers";
import { Squad, SidesMakerRequest, Side, SquadsMap, SideMakerMemo, SidesMakerResponse, ReadySide } from "../util/types";

type MakerInfo = {
    sortedIds: number[],
    squadsMap: SquadsMap,
    memo: SideMakerMemo,
    maxSlotsPerSide: number,
    minSlotsPerSide: number,
    smallestSquadSize: number,
};

let slots_diff: number;
let side_happiness_threshold: number;
let squad_happiness_threshold: number;

self.onmessage = (e: {data: SidesMakerRequest}) => {
    console.log('SidesMaker received a start command');
    console.log(e.data);
    const time = performance.now();
    permutateSquads(e.data);
    console.log('SidesMaker: permutations complete');
    console.log('SidesMaker done in', (performance.now() - time) / 60000);
};

function permutateSquads({squads, sideHappy, slotsDiff, squadHappy} : SidesMakerRequest) {
    slots_diff = slotsDiff;
    side_happiness_threshold = sideHappy;
    squad_happiness_threshold = squadHappy;

    console.log(slots_diff, side_happiness_threshold, squad_happiness_threshold);
    
    const memo : SideMakerMemo = {};
    const {maxSlotsPerSide, minSlotsPerSide, smallestSquadSize} = calcSlotsInfo(squads);
    const {squadsMap, sortedIds} = prepareSquadsInfo(squads);

    const info : MakerInfo = {sortedIds, squadsMap, memo, maxSlotsPerSide, minSlotsPerSide, smallestSquadSize};
    
    makeSides(sortedIds.length - 1, maxSlotsPerSide, info);
    self.postMessage({command: 'done'} as SidesMakerResponse);
}

function makeSides(index: number, slotsLeft: number, info: MakerInfo) {
    
    if (slotsLeft < info.smallestSquadSize || index < 0) 
    return [{slots: 0, squads: BigInt(0)}] as Side[];

    const squad = info.squadsMap.get(info.sortedIds[index]);

    if (!squad)
        throw 'Squad not found in info.squadsMap';
    
    if (squad.slots > slotsLeft) 
        return makeSides(index - 1, slotsLeft, info);

    const hash = makeHash(index, slotsLeft);

    if (info.memo[hash]) 
        return info.memo[hash];

    
    if (index === info.sortedIds.length - 1) {
        
        makeSides(index - 1, slotsLeft, info);
        
        const withSquad = makeSides(index - 1, slotsLeft - squad.slots, info);   
        for (const side of withSquad) {
            if (areSlotsReady(side.slots + squad.slots, info)) {
                
                const updSide = addSquadToSide(true, side, squad, info);   
                if (updSide)
                self.postMessage({command: 'update', side: updSide} as SidesMakerResponse);
        }
    }
        return [];
    }

    const sides : Side[] = [];
    const nextSquadSlots = info.squadsMap.get(info.sortedIds[index + 1])!.slots;
    const withSquad = makeSides(index - 1, slotsLeft - squad.slots, info);  

    for (const side of withSquad) {

        if (areSlotsReady(side.slots + squad.slots, info)) {

            const updSide = addSquadToSide(true, side, squad, info);

            if (updSide)
                self.postMessage({command: 'update', side: updSide} as SidesMakerResponse);
        }

        else if (canBeUpdated(side.slots + squad.slots, nextSquadSlots, info)) {

            const updSide = addSquadToSide(false, side, squad, info);

            if (updSide) 
                sides.push(updSide);                
        }
    }

    const withoutSquad = makeSides(index - 1, slotsLeft, info);
    
    for (const side of withoutSquad) {

        if (canBeUpdated(side.slots, nextSquadSlots, info)) 
            sides.push(side); 
    }

    info.memo[hash] = sides;

    return sides;
}

function makeHash(index: number, slotsLeft: number) {
    return `${index}-${slotsLeft}`;
}

function canBeUpdated(slots: number, nextSquadSlots: number, info: MakerInfo) {
    return (slots + nextSquadSlots) <= info.maxSlotsPerSide;
}

function areSlotsReady(slots: number, info: MakerInfo) {
    return slots >= info.minSlotsPerSide;
}

function addSquadToSide(isSideReady: boolean, side: Side, squad: Squad, info: MakerInfo) {
    const {squadsMap} = info;
    const updSide : Side = {...side};
    const squadIds = [...getSquadIdsFromMask(side.squads), squad.id];
    const happiness = getHappiness(squadIds, squadsMap, isSideReady);

    if (happiness === null)
        return null;

    updSide.slots += squad.slots;
    updSide.squads |= BigInt(squad.id);

    if (isSideReady)
        return {...updSide, happiness} as ReadySide;

    return updSide;
}

function getHappiness(ids: number[], squads: SquadsMap, isSideReady: boolean) {
    const squadsHappiness : Map<number, number> = new Map();

    for (let i = 0; i < ids.length - 1; i++) {
        const squad = squads.get(ids[i])!;

        for (let j = i + 1; j < ids.length; j++) {
            const otherSquad = squads.get(ids[j])!;

            for (const [s1, s2] of [[squad, otherSquad], [otherSquad, squad]]) {

                if (s1.with.has(s2.id)) {
                    const h = (squadsHappiness.get(s1.id) || 0) + 1;
                    squadsHappiness.set(s1.id, h);
                }
                else if (s1.without.has(s2.id)) {
                    const h = (squadsHappiness.get(s1.id) || 0) - 2;
                    if (h < squad_happiness_threshold)
                        return null;
                    squadsHappiness.set(s1.id, h);
                }
            }
        }
    }
    const happiness = Array.from(squadsHappiness.values()).reduce((acc, v) => acc + v, 0);

    if (isSideReady && (happiness < side_happiness_threshold))
        return null;

    return happiness;
}

function calcSlotsInfo(squads: Squad[]) {
    let totalSlots = 0;
    let smallestSquadSize = 100;

    for (const tag in squads) {
        const squad = squads[tag];
        totalSlots += squad.slots;
        smallestSquadSize = Math.min(smallestSquadSize, squad.slots);
    }

    const maxSlotsPerSide = Math.floor(totalSlots / 4) + slots_diff;
    const minSlotsPerSide = maxSlotsPerSide - slots_diff * 2;

    console.log('total slots', totalSlots, 'max slots per side', maxSlotsPerSide, 'min slots per side', minSlotsPerSide, 'smallest squad slots', smallestSquadSize);

    return {totalSlots, smallestSquadSize, maxSlotsPerSide, minSlotsPerSide};
}

function prepareSquadsInfo(squads: Squad[]) {
    const sortedSquads = [...squads].sort((a, b) => b.slots - a.slots);

    const squadsMap : SquadsMap = new Map();
    const sortedIds : number[] = [];
    
    for (const squad of sortedSquads) {
        squadsMap.set(squad.id, squad);
        sortedIds.push(squad.id);
    }

    return {squadsMap, sortedIds};
}