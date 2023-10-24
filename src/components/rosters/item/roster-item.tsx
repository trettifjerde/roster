import { MouseEvent, memo, useCallback, useContext, useMemo, useState } from 'react';
import { HappinessInfo, Roster, SideInfo, Squad, IdTagMap } from '../../../util/types';
import styles from './item.module.scss';
import { StateContext } from '../../../store/context';
import HoverNote from './hover-note';

const RosterItem = memo(({roster} : {roster: Roster}) => {
    return <div className={styles.roster} >
        {roster.roster.map((side, i) => <Side key={i} side={side}/>)}
    </div>
});

export default RosterItem;

function Side({side}: {side: SideInfo}) {
    const {squads, idTagMap, ui} = useContext(StateContext).state;
    const [currentHappinessInfo, setCurrentHappinessInfo] = useState<HappinessInfo | null>(null);
    const [position, setPosition] = useState<{X: number, Y: number}>({X: 0, Y: 0});

    const squadsHappiness = useMemo(() => squads.reduce((acc, squad) => {
        acc.set(squad.id, makeHappinessInfo(squad.id, side.squads, squads, idTagMap));
        return acc;
    }, new Map<number, HappinessInfo>()), [side]);
    
    const squadTags = useMemo(() => side.squads
        .map(squad => ({id: squad, tag: idTagMap.get(squad)!}))
        .sort((a, b) => {
            const [aInfo, bInfo] = [a, b].map(s => squadsHappiness.get(s.id)!);

            if (aInfo.total === bInfo.total) {
                return a.tag.toUpperCase() < b.tag.toUpperCase() ? -1 : 1;
            }
            else
                return bInfo.total - aInfo.total;
        
        })
        .map(({id, tag}) => <span key={id} className={styles.squad}
            onMouseOver={(e) => showDetails(id, e)}
            onMouseLeave={() => setCurrentHappinessInfo(null)}
        >{tag}</span>
    ), [side]);

    const showDetails = useCallback((id: number, e: MouseEvent) => {
        const info = squadsHappiness.get(id)!;
        setCurrentHappinessInfo(info);
        setPosition({
            X: (e.currentTarget as HTMLSpanElement).offsetLeft, 
            Y: (e.currentTarget as HTMLSpanElement).offsetTop})
    }, [squadsHappiness]);


    return <div className={styles.side}>
        <div className={styles.info}>
            <div>{ui.common.slots}: {side.slots}</div>
            <div>{ui.common.happiness}: {side.happiness}</div>
        </div>
        <div className={styles.squads}>
            {squadTags}
        </div>
        {currentHappinessInfo && <HoverNote texts={{happy: ui.rosters.happy, unhappy: ui.rosters.unhappy}} happinessInfo={currentHappinessInfo} position={position} />}
    </div>
}

function makeHappinessInfo(id: number, side: number[], squads: Squad[], idTagMap: IdTagMap) {
    const squad = squads.find(s => s.id === id)!;

    const info : HappinessInfo = {tag: squad.tag, total: 0, happy: [], unhappy: []};

    for (const squadId of side) {
        if (squadId === squad.id)
            continue;

        if (squad.with.has(squadId)) {
            info.happy.push(idTagMap.get(squadId)!);
            info.total += 1;
        }
        else if (squad.without.has(squadId)) {
            info.unhappy.push(idTagMap.get(squadId)!);
            info.total -= 2;
        }
    }

    return info;
}