import { Squad } from "../util/squadMaker";
import { SidesMakerRequest, Side, Squads, TagIdMap, SideMakerMemo } from "../util/types";

type MakerInfo = {
    tags: string[],
    squads: Squads,
    tagIdMap: TagIdMap,
    memo: SideMakerMemo,
    maxSlotsPerSide: number,
    minSlotsPerSide: number,
    smallestSquadSize: number,
};

const SQUAD_HAPPINESS_THRESHOLD = -3;
const HAPPINESS_THRESHOLD = 10;
const SLOTS_ADJUST = 2;

self.onmessage = (e: {data: SidesMakerRequest}) => {
    console.log('SidesMaker received a start command');
    const time = performance.now();
    permutateSquads(e.data);
    console.log(performance.now() - time);
    console.log('SidesMaker: permutations complete');
};

function permutateSquads({squads, tagIdMap} : SidesMakerRequest) {
    const tags = Object.entries(squads).sort((a, b) => b[1].slots - a[1].slots).map(info => info[0]);
    const memo : SideMakerMemo = {};
    const {maxSlotsPerSide, minSlotsPerSide, smallestSquadSize} = calcSlotsInfo(squads);
    const info : MakerInfo = {tags, squads, tagIdMap, memo, maxSlotsPerSide, minSlotsPerSide, smallestSquadSize};
    
    makeSides(tags.length - 1, maxSlotsPerSide, info);
    self.postMessage({command: 'done'});
}

function makeSides(index: number, slotsLeft: number, info: MakerInfo) {
    
    if (slotsLeft < info.smallestSquadSize || index < 0) 
        return [{slots: 0, squads: BigInt(0)}] as Side[];
    
    const squad = info.squads[info.tags[index]];
    
    if (squad.slots > slotsLeft) 
        return makeSides(index - 1, slotsLeft, info);

    const hash = makeHash(index, slotsLeft);

    if (info.memo[hash]) 
        return info.memo[hash];

    
    if (index === info.tags.length - 1) {
        
        makeSides(index - 1, slotsLeft, info);

        const withSquad = makeSides(index - 1, slotsLeft - squad.slots, info);   
        for (const side of withSquad) {
            if (areSlotsReady(side.slots + squad.slots, info)) {
                
                const updSide = addSquadToSide(true, side, squad, info);   
                if (updSide)
                    //completeSides.push(updSide);
                    self.postMessage({command: 'update', side: updSide});
            }
        }
        return [];
    }

    const sides : Side[] = [];
    const nextSquadSlots = info.squads[info.tags[index + 1]].slots;
    const withSquad = makeSides(index - 1, slotsLeft - squad.slots, info);  

    for (const side of withSquad) {

        if (areSlotsReady(side.slots + squad.slots, info)) {

            const updSide = addSquadToSide(true, side, squad, info);

            if (updSide)
                //completeSides.push(updSide);
                self.postMessage({command: 'update', side: updSide});
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
    const {squads, tagIdMap} = info;
    const updSide : Side = {...side};
    const squadTags = [...getSquadTagsFromMask(side.squads, tagIdMap), squad.tag];

    if (!isSideHappy(squadTags, squads, isSideReady))
        return null;

    updSide.slots += squad.slots;
    updSide.squads |= BigInt(squad.id);

    return updSide;
}

function getSquadTagsFromMask(mask: bigint, tagIdMap: TagIdMap) {
    const squadTags: string[] = [];

    let squadFlags = mask;
    let otherSquadId = 1;

    while (squadFlags > 0) {

        if (squadFlags & BigInt(0x1)) {
            squadTags.push(tagIdMap.get(otherSquadId) as string);           
        }

        otherSquadId *= 2;
        squadFlags >>= BigInt(1);
    }
    return squadTags;
}

function isSideHappy(tags: string[], squads: Squads, isSideReady: boolean) {
    const squadsHappiness : Map<string, number> = new Map();

    for (let i = 0; i < tags.length - 1; i++) {
        const squad = squads[tags[i]];

        for (let j = i + 1; j < tags.length; j++) {
            const otherSquad = squads[tags[j]];

            for (const [s1, s2] of [[squad, otherSquad], [otherSquad, squad]]) {

                if (s1.with.has(s2.tag)) {
                    const h = (squadsHappiness.get(s1.tag) || 0) + 1;
                    squadsHappiness.set(s1.tag, h);
                }
                else if (s1.without.has(s2.tag)) {
                    const h = (squadsHappiness.get(s1.tag) || 0) - 2;
                    if (h < SQUAD_HAPPINESS_THRESHOLD)
                        return false;
                    squadsHappiness.set(s1.tag, h);
                }
            }
        }
    }
    const happiness = Array.from(squadsHappiness.values()).reduce((acc, v) => acc + v, 0);

    if (isSideReady && happiness < HAPPINESS_THRESHOLD)
        return false;

    return true;
}

function calcSlotsInfo(squads: Squads) {
    let totalSlots = 0;
    let smallestSquadSize = 100;

    for (const tag in squads) {
        const squad = squads[tag];
        totalSlots += squad.slots;
        smallestSquadSize = Math.min(smallestSquadSize, squad.slots);
    }

    const maxSlotsPerSide = Math.floor(totalSlots / 4) + SLOTS_ADJUST;
    const minSlotsPerSide = maxSlotsPerSide - SLOTS_ADJUST * 2;

    console.log('total slots', totalSlots, 'max slots per side', maxSlotsPerSide, 'min slots per side', minSlotsPerSide, 'smallest squad slots', smallestSquadSize);

    return {totalSlots, smallestSquadSize, maxSlotsPerSide, minSlotsPerSide};
}