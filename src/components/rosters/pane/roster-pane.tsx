import { ReactNode, memo, useCallback, useContext, useEffect, useState } from "react";

import { CalculationParams, Roster } from "../../../util/types";
import { HAPPY_POINT, UNHAPPY_POINT, sortRosters } from "../../../util/helpers";
import { StateContext } from "../../../store/context";

import RosterForm from "../form/roster-form";
import RosterGrid from "../grid/rosters-grid";
import Modal from "../../ui/modal";
import Button from "../../ui/button";
import Spinner from "../../ui/spinner";

import styles from './pane.module.scss';
import { useWorkerManager } from "../../../workers/useWorkerManager";

export default function RosterPane() {

    const {squads, ui} = useContext(StateContext).state;
    const {totalSidesFound, newRoster, stage, startCalculating, abortCalculating} = useWorkerManager();

    const [rosters, setRosters] = useState<Roster[]>([]);
    const [points, setPoints] = useState({happy: HAPPY_POINT, unhappy: UNHAPPY_POINT});
    const [isNotFound, setIsNotFound] = useState(false); 

    const startSearching = useCallback((params : CalculationParams) => {
        const {happy, unhappy} = params;

        setRosters([]);
        setPoints({happy, unhappy});
        setIsNotFound(false);
        startCalculating({squads, params});

    }, [squads, startCalculating]);

    useEffect(() => {
        if (newRoster) {
            setRosters(prev => sortRosters(prev, newRoster));
        }
    }, [newRoster]);

    return <div>
        <RosterForm startCalculating={startSearching} />
        <RosterGrid header={ui.common.rosters} 
            rosters={rosters} points={points} 
            empty={isNotFound ? ui.rosters.notFound : ui.rosters.empty} />

        {stage !== 'idle' && <StatusModal abort={abortCalculating}>
            {stage === 'sides-maker' && ui.calculations.makingSides(totalSidesFound)}
            {stage === 'roster-maker' && ui.calculations.sidesFound(totalSidesFound)}
        </StatusModal>}
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