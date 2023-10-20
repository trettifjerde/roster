import { MouseEvent, memo, useCallback, useContext, useMemo, useState } from 'react';
import { HappinessInfo, Roster, SideInfo, Squad, SquadsMap, TagIdMap } from '../../../util/types';
import styles from './item.module.scss';
import { StateContext } from '../../../store/context';
import HoverNote from './hover-note';

function RosterItem({roster} : {roster: Roster}) {
    return <div className={styles.roster}>
        {roster.map((side, i) => <Side key={i} side={side}/>)}
    </div>
}

export default memo(RosterItem);

function Side({side}: {side: SideInfo}) {
    const {squads, tagIdMap, ui} = useContext(StateContext).state;
    const [happinessInfo, setHappinessInfo] = useState<HappinessInfo | null>(null);
    const [position, setPosition] = useState<{X: number, Y: number}>({X: 0, Y: 0});

    const showDetails = useCallback((id: number, e: MouseEvent) => {
        const info = makeHappinessInfo(id, side.squads, squads, tagIdMap);
        setHappinessInfo(info);
        setPosition({
            X: (e.currentTarget as HTMLSpanElement).offsetLeft, 
            Y: (e.currentTarget as HTMLSpanElement).offsetTop})
    }, [squads, tagIdMap]);

    const squadTags = useMemo(() => side.squads
            .map(squad => ({id: squad, tag: tagIdMap.get(squad) as string}))
            .sort((a, b) => a.tag.toUpperCase() < b.tag.toUpperCase() ? -1 : 1)
            .map(({id, tag}) => <span key={id} className={styles.squad}
                onMouseOver={(e) => showDetails(id, e)}
                onMouseLeave={() => setHappinessInfo(null)}
            >{tag}</span>
    ), [tagIdMap, showDetails, setHappinessInfo]);

    return <div className={styles.side}>
        <div className={styles.info}>
            <div>{ui.common.slots}: {side.slots}</div>
            <div>{ui.common.happiness}: {side.happiness}</div>
        </div>
        <div className={styles.squads}>
            {squadTags}
        </div>
        {happinessInfo && <HoverNote texts={{happy: ui.rosters.happy, unhappy: ui.rosters.unhappy}} happinessInfo={happinessInfo} position={position} />}
    </div>
}

function makeHappinessInfo(id: number, side: number[], squads: Squad[], tagIdMap: TagIdMap) {
    const squad = squads.find(s => s.id === id)!;

    const info : HappinessInfo = {tag: squad.tag, total: 0, happy: [], unhappy: []};

    for (const squadId of side) {
        if (squadId === squad.id)
            continue;

        if (squad.with.has(squadId)) {
            info.happy.push(tagIdMap.get(squadId) as string);
            info.total += 1;
        }
        else if (squad.without.has(squadId)) {
            info.unhappy.push(tagIdMap.get(squadId) as string);
            info.total -= 2;
        }
    }

    return info;
}