import { useCallback, useContext, useEffect, useState } from "react";
import { Roster, RosterMakerRequest, RosterMakerResponse, SidesMakerRequest, SidesMakerResponse } from "../../../util/types";

import RosterGrid from "../grid/rosters-grid";
import SidesMaker from '../../../workers/sides-maker?worker';
import RosterMaker from '../../../workers/roster-maker?worker';
import { StateContext } from "../../../store/context";
import Spinner from "../../ui/spinner";
import styles from './pane.module.scss';
import RosterForm from "../form/roster-form";
import Header from "../header/header";

export type CalculationParams = {slots: number, happiness: number};

export default function RosterPane() {
    const [sidesMaker, setSidesMaker] = useState(() => new SidesMaker());
    const [rosterMaker, setRosterMaker] = useState(() => new RosterMaker());
    const {squads, ui} = useContext(StateContext).state;

    const [status, setStatus] = useState<JSX.Element | null>(null);
    const [rosters, setRosters] = useState<Roster[]>([]);
    const [isNotFound, setIfNotFound] = useState(false); 

    const startCalculating = useCallback(({slots, happiness} : CalculationParams) => {
        setRosters([]);

        const allSquads = squads.reduce((acc, squad) => acc + BigInt(squad.id), BigInt(0));

        sidesMaker.onmessage = (e : {data: SidesMakerResponse}) => {
            const {data} = e;
            switch (data.status) {
                case 'update':
                    rosterMaker.postMessage({command: 'update', side: data.side} as RosterMakerRequest);
                    break;
                case 'done':
                    rosterMaker.postMessage({command: 'start'} as RosterMakerRequest);
                    break;
            }
        };

        rosterMaker.onmessage = (e: {data: RosterMakerResponse}) => {
            const {data} = e;
            
            switch (data.status) {
                case 'starting':
                    setStatus(ui.calculations.sidesFound(data.sidesLength));
                    break;
                case 'announce-side':
                    setStatus(ui.calculations.makingSides(data.sidesLength))
                    break;
                case 'update':
                    setRosters(prev => [...prev, data.roster]);
                    setStatus(ui.calculations.rostersFound(data.totalRosters));
                    break;
                case 'done':
                    setStatus(null);
                    setIfNotFound(true);
                    break;
                case 'slaves-terminated':
                    rosterMaker.terminate();
                    setStatus(null);
                    resetWorkers();
                    break;
            }
        };

        setStatus(ui.calculations.makingSides(0));
        
        rosterMaker.postMessage({command: 'init', allSquads, slotsDiff: slots} as RosterMakerRequest);

        sidesMaker.postMessage({
            command: 'init',
            squads, 
            sideHappy: happiness,
            slotsDiff: slots
        } as SidesMakerRequest);        
        
    }, [squads, rosterMaker, sidesMaker, ui]);

    const abortCalculating = () => {
        sidesMaker.terminate();
        rosterMaker.postMessage({command: 'terminate'} as RosterMakerRequest);
    };

    const resetWorkers = () => {
        setSidesMaker(new SidesMaker());
        setRosterMaker(new RosterMaker());
    }

    return <div className={styles.pane}>
        <Header />
        <RosterForm startCalculating={startCalculating} />
        <RosterGrid header={ui.common.rosters} rosters={rosters} empty={isNotFound ? ui.rosters.notFound : ui.rosters.empty} />
        {status && <Spinner text={ui.calculations.thisMightTake} status={status} abortText={ui.calculations.abortText} 
            abort={abortCalculating}/>}
    </div>
}