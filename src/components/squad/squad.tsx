import { Ref, forwardRef, memo, useCallback, useEffect, useMemo, useState } from "react";
import styles from './squad.module.scss';
import {AnimatePresence, motion} from 'framer-motion';
import Button from "../ui/button";
import SquadForm from "../squad-form/squad-form";
import { Squad, TagIdMap } from "../../util/types";
import Spoiler from "../ui/spoiler";


function SquadComponent({squad, tagIdMap, forceCollapse}: {squad: Squad, tagIdMap: TagIdMap, forceCollapse: boolean}, ref: Ref<HTMLDivElement>|null) {
    console.log(squad.tag);
    const [editMode, setEditMode] = useState(false);

    const toggleMode = useCallback(() => setEditMode(prev => !prev), [setEditMode]);
    
    const getHeader = useCallback(() => {
        return <>
            <h3>{squad.tag}</h3>
            <span>{squad.slots}</span>
        </>
    }, [squad]);

    const printPreferences = useCallback((a: 'with'|'without') => {
        console.log('printing prefs');
        return [...squad[a]]
            .map(id => ({id, tag: tagIdMap.get(id) as string}))
            .sort((a, b) => a.tag.toUpperCase() < b.tag.toUpperCase() ? -1 : 1)
            .map(entry => <p key={entry.id}>{entry.tag}</p>)
    }, [tagIdMap, squad]);

    const printWiths = useMemo(() => printPreferences('with'), [printPreferences]); 
    const printWithouts = useMemo(() => printPreferences('without'), [printPreferences]);
    
    return <Spoiler header={getHeader} className={styles.squad} forceCollapse={forceCollapse}>
            <AnimatePresence mode="wait">
                {!editMode && <motion.div layout className={styles.info} 
                    initial={{opacity: 0, y: -100}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: 100}}>
                    <div className={styles.note}>With</div>
                    <div className={styles.note}>Without</div>
                    <div>{printWiths}</div>
                    <div>{printWithouts}</div>
                    <Button onClick={toggleMode}>Edit</Button>
                </motion.div>}

                {editMode &&<SquadForm squad={squad} toggleForm={toggleMode}/>}
            </AnimatePresence>
        </Spoiler>
}

export default memo(forwardRef(SquadComponent));