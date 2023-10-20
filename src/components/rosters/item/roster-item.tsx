import { useContext } from 'react';
import { Roster, SideInfo } from '../../../util/types';
import styles from './item.module.scss';
import { StateContext } from '../../../store/context';

export default function RosterItem({roster} : {roster: Roster}) {
    return <div className={styles.roster}>
        {roster.map((side, i) => <Side key={i} side={side}/>)}
    </div>
}

function Side({side}: {side: SideInfo}) {
    const {squads, tagIdMap, ui} = useContext(StateContext).state;

    const showDetails = (id: number) => {
        const squadInfo = squads.find(s => s.id === id);
        if (squadInfo) {
            console.log(squadInfo);
        }
    };

    return <div className={styles.side}>
        <div className={styles.info}>
            <div>{ui.common.slots}: {side.slots}</div>
            <div>{ui.common.happiness}: {side.happiness}</div>
        </div>
        <div className={styles.squads}>{side.squads
            .map(squad => ({id: squad, tag: tagIdMap.get(squad) as string}))
            .sort((a, b) => a.tag.toUpperCase() < b.tag.toUpperCase() ? -1 : 1)
            .map(({id, tag}) => <span key={id} onMouseOver={() => showDetails(id)}>{tag}</span>)}</div>
    </div>
}