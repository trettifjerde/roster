import { useCallback, useContext, useState } from "react";
import RosterGrid from "../grid/rosters-grid";
import { Roster, RosterMakerRequest, RosterMakerResponse, SidesMakerRequest, SidesMakerResponse } from "../../../util/types";

import SidesMaker from '../../../workers/sides-maker?worker';
import RosterMaker from '../../../workers/roster-maker?worker';
import { StateContext } from "../../../store/context";
import Spinner from "../../ui/spinner";
import styles from './pane.module.scss';
import RosterForm from "../form/roster-form";

export type CalculationParams = {slots: number, squad: number, side: number};


export default function RosterPane() {
    const [sidesMaker, setSidesMaker] = useState(() => new SidesMaker());
    const [rosterMaker, setRosterMaker] = useState(() => new RosterMaker());
    const {squads} = useContext(StateContext).state;

    const [status, setStatus] = useState('');
    const [rosters, setRosters] = useState<Roster[]>([]);
    

    const startCalculating = useCallback(({slots, side, squad} : CalculationParams) => {
        const allSquads = squads.reduce((acc, squad) => acc + BigInt(squad.id), BigInt(0));

        sidesMaker.onmessage = (e : {data: SidesMakerResponse}) => {
            const {data} = e;
            switch (data.command) {
                case 'update':
                    rosterMaker.postMessage({command: 'update', side: data.side} as RosterMakerRequest);
                    break;
                case 'done':
                    rosterMaker.postMessage({command: 'done'} as RosterMakerRequest);
                    setStatus('Possible sides are found. Building rosters...')
                    break;
            }
        };

        rosterMaker.onmessage = (e: {data: RosterMakerResponse}) => {
            const {data} = e;
            
            switch (data.status) {
                case 'update':
                    setRosters(prev => [...prev, data.roster]);
                    break;
                case 'done':
                    setStatus('');
                    break;
            }
        };

        setStatus('Calculating possible sides...');
        
        rosterMaker.postMessage({command: 'init', allSquads} as RosterMakerRequest);

        sidesMaker.postMessage({
            squads, 
            sideHappy: side,
            squadHappy: squad,
            slotsDiff: slots
        } as SidesMakerRequest);        
    }, [squads, sidesMaker, rosterMaker, setStatus])

    return <div className={styles.pane}>
        <RosterForm startCalculating={startCalculating} />
        <RosterGrid rosters={rosters} />
        {status && <Spinner text={status} fixed />}
    </div>
}