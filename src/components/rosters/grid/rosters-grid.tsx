import { memo, useCallback } from "react";
import { Roster } from "../../../util/types";
import RosterItem from "../item/roster-item";
import styles from './grid.module.scss';
import Spoiler from "../../ui/spoiler";

const RosterGrid = memo(({rosters, points, header, empty}: {
    rosters: Roster[], 
    header: string, 
    empty: string,
    points: {happy: number, unhappy: number}
}) => {

    const getHeader = useCallback(() => <>
        <h2>{header}</h2>
        <p>{rosters.length}</p>
    </>, [header, rosters.length]);

    return <Spoiler header={getHeader} initial={true}>

        <div className={styles.grid}>
            {rosters.map((roster, i) => <RosterItem key={roster.id} roster={roster} points={points}/>)}
        </div>
        {rosters.length === 0 && <p className={styles.empty}>{empty}</p>}

    </Spoiler>
});

export default RosterGrid;