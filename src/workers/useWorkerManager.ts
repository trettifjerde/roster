import { useCallback, useState } from "react";

import SidesMaker from './sides-maker?worker';
import RosterMaker from './roster-maker?worker';
import RosterSlave from './roster-slave?worker';
import { Batch, CalculationParams, Roster, RosterMakerRequest, RosterMakerResponse, RosterSlaveRequest, RosterSlaveResponse, SLOTS, SidesMakerRequest, SidesMakerResponse, Squad } from "../util/types";
import { printPerformance } from "../util/helpers";

const SLAVES_NUM = 5;
let time: number;

type SearchStatus = 'sides-maker' | 'roster-maker' | 'idle';

export function useWorkerManager() {

    const [sidesMaker, setSidesMaker] = useState(() => new SidesMaker());
    const [rosterMaker, setRosterMaker] = useState(() => new RosterMaker());
    const [rosterSlaves, setRosterSlaves] = useState<{[key: number]: Worker}>({});
    const [stage, setStage] = useState<SearchStatus>('idle');
    const [totalSidesFound, setTotalSidesFound] = useState(0);
    const [newRoster, setNewRoster] = useState<Roster | null>(null);

    const startCalculating = useCallback(({squads, params} : {squads: Squad[], params: CalculationParams}) => {

        setStage('sides-maker');
        setTotalSidesFound(0);
        setNewRoster(null);

        const allSquads = squads.reduce((acc, squad) => acc + BigInt(squad.id), BigInt(0));

        const {slots, happiness, happy, unhappy, unwanted} = params;

        sidesMaker.onmessage = ({data} : {data: SidesMakerResponse}) => {
            switch (data.status) {
                case 'side-made':
                    rosterMaker.postMessage({command: 'validate-side', side: data.side} as RosterMakerRequest);
                    break;
                case 'done':
                    printPerformance('SidesMaker', performance.now() - time);
                    time = performance.now();
                    rosterMaker.postMessage({command: 'make-batches'} as RosterMakerRequest);
                    break;
            }
        };

        rosterMaker.onmessage = ({data}: {data: RosterMakerResponse}) => {
            
            switch (data.status) {
                case 'side-ready':
                    setTotalSidesFound(data.totalSides);
                    break;

                case 'starting':
                    setStage('roster-maker');
                    break;

                case 'batches-ready':
                    initSlaves(data.batches, allSquads);
                    break;

                case 'roster-ready':
                    setNewRoster(data.roster);
                    break;
            }
        };

        
        rosterMaker.postMessage({command: 'init', allSquads, slotsDiff: slots} as RosterMakerRequest);
        
        time = performance.now();

        sidesMaker.postMessage({
            command: 'init',
            info: {
                squads, 
                minHappiness: happiness,
                slotsDiff: slots,
                points: {happy, unhappy},
                unwanted
            }
        } as SidesMakerRequest);  

    }, [sidesMaker, rosterMaker]);

    const initSlaves = useCallback((batches: Batch[], allSquads: bigint) => {

        function feedNewBatchTo(slave: Worker, name: number) {
            const batch = batches.shift();
    
            if (batch) {
        
                slave.postMessage({
                    command: 'calculate',
                    limit: batch.limit,
                    sides: batch.sides,
                    allSquads
                } as RosterSlaveRequest);
            }
            
            return !!batch;
        }

        const slaves: {[key: number]: Worker} = {};

        for (let i = 0; i < Math.min(SLAVES_NUM, batches.length); i++) {
            console.log('creating slave', i);
            const worker = new RosterSlave();
    
            worker.onmessage = (e: {data: RosterSlaveResponse}) => {
                const {data} = e;
    
                switch (data.status) {
                    case 'sides-combined':
                        rosterMaker.postMessage({command: 'validate-roster', rotation: data.rotation} as RosterMakerRequest);
                        break;
    
                    case 'done':
                        const isBatchConsumed = feedNewBatchTo(worker, i);
                        
                        if (!isBatchConsumed) {
                            worker.terminate();

                            setRosterSlaves(prev => {
                                const upd = {...prev};
                                delete upd[i];

                                if (Object.keys(upd).length === 0) {
                                    printPerformance('RosterMaker', performance.now() - time);
                                    setStage('idle');
                                }

                                return upd;
                            });
                        }
                        break;
                }           
    
            }
    
            slaves[i] = worker;
        }

        setRosterSlaves(slaves);

        time = performance.now();
    
        for (const [name, worker] of Object.entries(slaves))
            feedNewBatchTo(worker, +name);

    }, []);

    const abortCalculating = useCallback(() => {
        sidesMaker.terminate();
        rosterMaker.terminate();

        for (const i in rosterSlaves) 
            rosterSlaves[+i].terminate();
        
        setSidesMaker(new SidesMaker());
        setRosterMaker(new RosterMaker());
        setRosterSlaves({});
        setStage('idle');

    }, [sidesMaker, rosterMaker, rosterSlaves]);

    return { stage, newRoster, totalSidesFound, startCalculating, abortCalculating};
}