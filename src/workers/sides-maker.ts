import { getMutualHappiness, getSquadIdsFromMask } from "../util/helpers";
import { Squad, SidesMakerRequest, Side, SquadsMap, SideMakerMemo, SidesMakerResponse, SidesMakerInitInfo } from "../util/types";

class SidesMaker {
    memo: SideMakerMemo;
    sortedIds: number[];
    squadsMap: SquadsMap;
    slotsDiff: number;
    minHappiness: number;
    points: {happy: number, unhappy: number};
    maxUnwanted: number;
    maxSlotsPerSide: number;
    minSlotsPerSide: number;
    smallestSquadSize: number;
    intermediateHappinessCheckAtSlots: number;
    unwantedCheckPassed: (squadIds: number[]) => boolean;

    constructor(info: SidesMakerInitInfo) {

        const sortedSquads = [...info.squads].sort((a, b) => b.slots - a.slots);
        const squadsMap : SquadsMap = new Map();
        const sortedIds : number[] = [];
        let totalSlots = 0;
        let smallestSquadSize = 1000;
        let largestSquadSize = 0;
        
        for (const squad of sortedSquads) {
            squadsMap.set(squad.id, squad);
            sortedIds.push(squad.id);
            totalSlots += squad.slots;
            smallestSquadSize = Math.min(smallestSquadSize, squad.slots);
            largestSquadSize = Math.max(largestSquadSize, squad.slots);
        }
        
        const slotsPerSide = totalSlots / 4;
        const squadsPerSide = slotsPerSide / (totalSlots / sortedSquads.length)
        const isLargestSquadOverQuarter = largestSquadSize > slotsPerSide;

        this.memo = {};
        this.sortedIds = sortedIds;
        this.squadsMap = squadsMap;
        this.minHappiness = info.minHappiness;
        this.slotsDiff = info.slotsDiff;
        this.maxSlotsPerSide = isLargestSquadOverQuarter ? largestSquadSize : Math.ceil(slotsPerSide + this.slotsDiff);
        this.minSlotsPerSide = squadsPerSide === 1 ? smallestSquadSize :
            isLargestSquadOverQuarter ? Math.ceil(((totalSlots - largestSquadSize * 2) - this.slotsDiff) / 2) : 
            Math.floor(slotsPerSide - this.slotsDiff);
        this.smallestSquadSize = smallestSquadSize;
        this.intermediateHappinessCheckAtSlots = Math.floor(this.maxSlotsPerSide * 0.7);
        this.points = info.points;

        if (info.unwanted === null) {

            this.unwantedCheckPassed = (a: any) => true;
            this.maxUnwanted = 0;
        }
        else {
            this.maxUnwanted = info.unwanted;
            this.unwantedCheckPassed = this.checkUnwanted;
        }
    }

    start() {
        this.printConfig();
        this.makeSides(this.sortedIds.length - 1, this.maxSlotsPerSide);
    }

    printConfig() {
        const str = `maxSlots: ${this.maxSlotsPerSide}, minSlots: ${this.minSlotsPerSide}, intermediateCheck: ${this.intermediateHappinessCheckAtSlots}`
        console.log(str);
    }

    makeSides(index: number, slotsLeft: number) : Side[] {
    
        if (this.isNotEnoughSlots(slotsLeft) || index < 0) 
            return [{slots: 0, squads: BigInt(0), happiness: 0}];
    
        const squad = this.getCurrentSquad(index);
    
        if (!squad)
            throw 'Squad not found in squadsMap';
        
        if (squad.slots > slotsLeft) 
            return this.makeSides(index - 1, slotsLeft);
    
        const hash = this.makeHash(index, slotsLeft);
    
        if (this.memo[hash]) 
            return this.memo[hash];
    
        const sides : Side[] = [];
        {
            const withSquad = this.makeSides(index - 1, slotsLeft - squad.slots);  
    
            for (const side of withSquad) {
                
                const updSide = this.addSquadToSide(index, squad, side);

                if (updSide) {
                    sides.push(updSide);
                }
            }
        }
    
        const withoutSquad = this.makeSides(index - 1, slotsLeft);
        
        for (const side of withoutSquad) {
    
            if (this.nextSquadSlots(side.slots, index)) {
                sides.push(side); 
            }
        }
    
        this.memo[hash] = sides;
    
        return sides;
    }

    getCurrentSquad(index: number) {
        return this.squadsMap.get(this.sortedIds[index]);
    }

    checkUnwanted(squadIds: number[]) {
        if (squadIds.length < 2) 
            return true;

        const unwantedCount = squadIds.reduce((acc, id) => {
            acc[id] = 0;
            return acc;
        }, {} as {[key: number]: number});
        
        for (let i = 0; i < squadIds.length - 1; i++) {
            const id1 = squadIds[i];
            const squad1 = this.squadsMap.get(id1)!;

            for (let j = i + 1; j < squadIds.length; j++) {
                const id2 = squadIds[j];

                const ids = [id1, id2];
                
                const mutualHappiness = getMutualHappiness(squad1, this.squadsMap.get(id2)!, this.points);

                for (let I = 0; I < ids.length; I++) {
                    if (mutualHappiness[I] < 0) {
                        unwantedCount[ids[I]] += 1;
                        if (unwantedCount[ids[I]] > this.maxUnwanted)
                            return false;
                    }
                }
            }
        }
        return true;
    }

    getNextSquadSlots(index: number) {
        return this.squadsMap.get(this.sortedIds[index + 1])!.slots;
    }

    isNotEnoughSlots(slotsLeft: number) {
        return slotsLeft < this.smallestSquadSize;
    }

    isLastSquad(index: number) {
        return index === this.sortedIds.length - 1;
    }

    makeHash(index: number, slotsLeft: number) {
        return `${index}-${slotsLeft}`;
    }
    
    nextSquadSlots(slots: number, index: number) {
        const nextSquad = this.squadsMap.get(this.sortedIds[index + 1]);
        
        if (nextSquad && ((slots + nextSquad.slots) <= this.maxSlotsPerSide)) 
            return nextSquad.slots;

        return 0;
    }
    
    areSlotsReady(slots: number) {
        return slots >= this.minSlotsPerSide;
    }
    
    addSquadToSide(index: number, squad: Squad, side: Side) {
    
        const updSide = {...side};
        updSide.slots += squad.slots;
        updSide.squads |= BigInt(squad.id);

        const areSlotsReady = this.areSlotsReady(updSide.slots);
        const nextSquadSlots = this.nextSquadSlots(updSide.slots, index);

        if (!areSlotsReady && !nextSquadSlots) 
            return null;

        const {happiness, squadIds} = this.updateSideHappinessWithSquad(side, squad);
        updSide.happiness = happiness;

        if (areSlotsReady && updSide.happiness >= this.minHappiness && this.unwantedCheckPassed(squadIds))
            this.announceReadySide(updSide);
        
        if (nextSquadSlots) {       
            if (this.isTimeForHappinessCheck(updSide) && this.intermediateHappinessCheckFailed(happiness, squadIds.length, updSide.slots, nextSquadSlots)) {    
                return null;
            }

            return updSide as Side;
        }

        return null;
    }
    isTimeForHappinessCheck(side: Side) {
        return side.slots >= this.intermediateHappinessCheckAtSlots;
    }

    intermediateHappinessCheckFailed(currentHappiness: number, currentSquads: number, currentSlots: number, nextSquadSlots: number) {
        const maxFutureSquads = Math.floor((this.maxSlotsPerSide - currentSlots) / nextSquadSlots);

        const oldHappiness = currentHappiness * currentSquads;
        const oldNewMutualHappiness = currentSquads * maxFutureSquads * this.points.happy * 2;
        const newSquadsHappiness = maxFutureSquads * (maxFutureSquads - 1) * this.points.happy;

        const maxFutureHappiness = (oldHappiness + oldNewMutualHappiness + newSquadsHappiness) / (currentSquads + maxFutureSquads);
        return maxFutureHappiness < this.minHappiness;
    }

    updateSideHappinessWithSquad(side: Side, squad: Squad) {
        const squadIds = getSquadIdsFromMask(side.squads);

        if (squadIds.length === 0) 
            return {
                happiness: 0,
                squadIds: [squad.id]
        };

        let newSquadHappiness = 0;
        let oldSquadsHappinessAdjust = 0;
    
        for (const oldSquadId of squadIds) {
            const oldSquad = this.squadsMap.get(oldSquadId)!;

            const [squadHappy, oldSquadHappy] = getMutualHappiness(squad, oldSquad, this.points);

            newSquadHappiness += squadHappy;
            oldSquadsHappinessAdjust += oldSquadHappy;
        }

        return {
            happiness: ((side.happiness * squadIds.length) + oldSquadsHappinessAdjust + newSquadHappiness) / (squadIds.length + 1),
            squadIds: [...squadIds, squad.id]
        };
    }

    announceReadySide(side: Side) {
        self.postMessage({status: 'side-made', side} as SidesMakerResponse);
    }
};

self.onmessage = (e: {data: SidesMakerRequest}) => {
    const data = e.data;

    switch (data.command) {
        case 'init':
            console.log('SidesMaker received a start command');
            const maker = new SidesMaker(data.info);
            maker.start();
            self.postMessage({status: 'done'} as SidesMakerResponse);
            break;
    }
};
