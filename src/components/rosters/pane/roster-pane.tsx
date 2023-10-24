import { ReactNode, memo, useCallback, useContext, useState } from "react";

import { CalculationParams, Roster, RosterMakerRequest, RosterMakerResponse, SidesMakerRequest, SidesMakerResponse } from "../../../util/types";
import { sortRosters } from "../../../util/helpers";

import RosterMaker from '../../../workers/roster-maker?worker';
import SidesMaker from '../../../workers/sides-maker?worker';

import { StateContext } from "../../../store/context";

import RosterForm from "../form/roster-form";
import RosterGrid from "../grid/rosters-grid";
import Modal from "../../ui/modal";
import Button from "../../ui/button";
import Spinner from "../../ui/spinner";

import styles from './pane.module.scss';


export default function RosterPane() {
    const [sidesMaker, setSidesMaker] = useState(() => new SidesMaker());
    const [rosterMaker, setRosterMaker] = useState(() => new RosterMaker());

    const {squads, ui} = useContext(StateContext).state;

    const [status, setStatus] = useState<JSX.Element | null>(null);
    const [rosters, setRosters] = useState<Roster[]>([]);
    const [isNotFound, setIsNotFound] = useState(false); 

    const startCalculating = useCallback(({slots, happiness} : CalculationParams) => {
        setRosters([]);
        setIsNotFound(false);

        const allSquads = squads.reduce((acc, squad) => acc + BigInt(squad.id), BigInt(0));

        sidesMaker.onmessage = ({data} : {data: SidesMakerResponse}) => {
            switch (data.status) {
                case 'update':
                    rosterMaker.postMessage({command: 'update', side: data.side} as RosterMakerRequest);
                    break;
                case 'done':
                    rosterMaker.postMessage({command: 'start'} as RosterMakerRequest);
                    break;
            }
        };

        rosterMaker.onmessage = ({data}: {data: RosterMakerResponse}) => {
            
            switch (data.status) {
                case 'starting':
                    setStatus(ui.calculations.sidesFound(data.sidesLength));
                    break;
                case 'announce-side':
                    setStatus(ui.calculations.makingSides(data.sidesLength))
                    break;
                case 'update':
                    setRosters(prev => sortRosters(prev, data.roster));
                    setStatus(ui.calculations.rostersFound(data.roster.id + 1));
                    break;
                case 'done':
                    setStatus(null);
                    setIsNotFound(true);
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

    const abortCalculating = useCallback(() => {
        sidesMaker.terminate();
        rosterMaker.postMessage({command: 'terminate'} as RosterMakerRequest);
    }, [sidesMaker, rosterMaker]);

    const resetWorkers = useCallback(() => {
        setSidesMaker(new SidesMaker());
        setRosterMaker(new RosterMaker());
    }, [])

    return <div>
        <RosterForm startCalculating={startCalculating} />
        <RosterGrid header={ui.common.rosters} rosters={rosters} empty={isNotFound ? ui.rosters.notFound : ui.rosters.empty} />
        {status && <StatusModal abort={abortCalculating}>{status}</StatusModal>}
    </div>
}

const StatusModal = memo(({children, abort}: {children: ReactNode, abort: () => void}) => {
    const {ui} = useContext(StateContext).state;

    return <Modal header={ui.calculations.thisMightTake}>
        <div className={styles['status-text']}>{children}</div>
        <Spinner />
        <Button onClick={abort}>{ui.calculations.abortText}</Button>
    </Modal>
})