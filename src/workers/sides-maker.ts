import { getSquadIdsFromMask } from "../util/helpers";
import { Squad, SidesMakerRequest, Side, SquadsMap, SideMakerMemo, SidesMakerResponse } from "../util/types";

class SidesMaker {
    memo: SideMakerMemo;
    sortedIds: number[];
    squadsMap: SquadsMap;
    maxSlotsPerSide: number;
    minSlotsPerSide: number;
    smallestSquadSize: number;
    intermediateHappiness: number;
    intermediateHappinessCheckAtSlots: number;

    constructor(squads: Squad[], public slotsDiff: number, public sideHappiness: number) {
        this.memo = {};

        const sortedSquads = [...squads].sort((a, b) => b.slots - a.slots);
        const squadsMap : SquadsMap = new Map();
        const sortedIds : number[] = [];
        let totalSlots = 0;
        let smallestSquadSize = 1000;
        
        for (const squad of sortedSquads) {
            squadsMap.set(squad.id, squad);
            sortedIds.push(squad.id);
            totalSlots += squad.slots;
            smallestSquadSize = Math.min(smallestSquadSize, squad.slots);
        }
        
        const mltplr = Math.floor(smallestSquadSize / 2);
        const squadsPerSide = totalSlots / 4;
        this.sortedIds = sortedIds;
        this.squadsMap = squadsMap;
        this.maxSlotsPerSide = Math.ceil(squadsPerSide) + mltplr;
        this.minSlotsPerSide = Math.floor(squadsPerSide) - mltplr;
        this.smallestSquadSize = smallestSquadSize;
        this.intermediateHappiness = this.sideHappiness - Math.floor((squads.length / 8) *  (squads.length / 16) * 2);
        this.intermediateHappinessCheckAtSlots = Math.floor(this.maxSlotsPerSide * 0.6);
    }

    start() {
        this.printConfig();
        this.makeSides(this.sortedIds.length - 1, this.maxSlotsPerSide);
    }

    printConfig() {
        const str = `maxSlots: ${this.maxSlotsPerSide}, minSlots: ${this.minSlotsPerSide}, intermediateHappiness: ${this.intermediateHappiness}, intermediateCheck: ${this.intermediateHappinessCheckAtSlots}`
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
    
            if (this.canBeUpdated(side.slots, index)) {
                sides.push(side); 
            }
        }
    
        this.memo[hash] = sides;
    
        return sides;
    }

    getCurrentSquad(index: number) {
        return this.squadsMap.get(this.sortedIds[index]);
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
    
    canBeUpdated(slots: number, index: number) {
        const nextSquad = this.squadsMap.get(this.sortedIds[index + 1]);
        
        if (nextSquad) 
            return (slots + nextSquad.slots) <= this.maxSlotsPerSide;

        return false;
    }
    
    areSlotsReady(slots: number) {
        return slots >= this.minSlotsPerSide;
    }

    isTimeForHappinessCheck(side: Side) {
        return side.slots >= this.intermediateHappinessCheckAtSlots;
    }

    intermediateHappinessCheckFailed(side: Side) {
        return side.happiness < this.intermediateHappiness;
    }
    
    addSquadToSide(index: number, squad: Squad, side: Side) {
    
        const updSide = {...side};
        updSide.slots += squad.slots;
        updSide.squads |= BigInt(squad.id);

        const areSlotsReady = this.areSlotsReady(updSide.slots);
        const canBeUpdated = this.canBeUpdated(updSide.slots, index);

        if (areSlotsReady || canBeUpdated) {

            const squadIds = getSquadIdsFromMask(side.squads);
        
            for (const otherSquadId of squadIds) {
                const otherSquad = this.squadsMap.get(otherSquadId)!;

                if (squad.with.has(otherSquadId))
                    updSide.happiness += 1;
                if (otherSquad.with.has(squad.id))
                    updSide.happiness += 1;
                if (squad.without.has(otherSquadId))
                    updSide.happiness -= 2;
                if (otherSquad.without.has(squad.id))
                    updSide.happiness -= 2;
            }

            if (areSlotsReady && updSide.happiness >= this.sideHappiness) 
                this.announceReadySide(updSide);
            
            if (canBeUpdated) {       
                if (this.isTimeForHappinessCheck(updSide) && this.intermediateHappinessCheckFailed(updSide))    
                    return null;

                return updSide as Side;
            }
        }
        
        return null;  
    }

    announceReadySide(side: Side) {
        self.postMessage({status: 'update', side} as SidesMakerResponse);
    }
};

self.onmessage = (e: {data: SidesMakerRequest}) => {
    const data = e.data;

    switch (data.command) {
        case 'init':
            console.log('SidesMaker received a start command');
            const time = performance.now();
            const maker = new SidesMaker(data.squads, data.slotsDiff, data.sideHappy);
            maker.start();
            console.log('SidesMaker: permutations complete');
            console.log('SidesMaker done in', (performance.now() - time) / 60000);
            self.postMessage({status: 'done'} as SidesMakerResponse);
            break;
    }
};
