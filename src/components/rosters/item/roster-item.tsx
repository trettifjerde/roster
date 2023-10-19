import { useContext } from 'react';
import { Roster, ServerInfo, SideInfo } from '../../../util/types';
import styles from './item.module.scss';
import { StateContext } from '../../../store/context';

export default function RosterItem({roster} : {roster: Roster}) {
    return <div className={styles.item}>
        <Server server={roster[0]} />
        <Server server={roster[1]} />
    </div>
}

function Server({server}: {server: ServerInfo}) {
    return <div className={styles.server}>
        <Side side={server[0]} />
        <Side side={server[1]} />
    </div>
}

function Side({side}: {side: SideInfo}) {
    const {tagIdMap} = useContext(StateContext).state;

    return <div className={styles.side}>
        <div>Slots: {side.slots}. Happiness: {side.happiness}</div>
        <div>{side.squads.map(squad => <span key={squad}>{tagIdMap.get(squad)}</span>)}</div>
    </div>
}