import { memo } from "react";
import { Roster } from "../../../util/types";
import RosterItem from "../item/roster-item";
import styles from './grid.module.scss';

function RosterGrid({rosters}: {rosters: Roster[]}) {
    return <div className={styles.grid}>
        {rosters.map((roster, i) => <RosterItem key={i} roster={roster}/>)}
    </div>
}

export default memo(RosterGrid);