import { memo } from "react";
import { Roster } from "../../../util/types";
import RosterItem from "../item/roster-item";
import styles from './grid.module.scss';

const RosterGrid = memo(({rosters, header, empty}: {rosters: Roster[], header: string, empty: string}) => {

    return <>
        <div className={`header ${styles.header}`}>
            <h2>{header}</h2>
            <p>{rosters.length}</p>
        </div>
        <div className="headed-cont">
            <div className={styles.grid}>
                {rosters.map((roster, i) => <RosterItem key={roster.id} roster={roster}/>)}
            </div>
            {rosters.length === 0 && <p className={styles.empty}>{empty}</p>}
        </div>

    </>
});

export default RosterGrid;