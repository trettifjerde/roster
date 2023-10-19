import { Ref, forwardRef, memo, useCallback, useMemo, useState } from "react";
import {AnimatePresence, motion} from 'framer-motion';
import { Squad, TagIdMap } from "../../../util/types";
import SquadForm from "../form/squad-form";
import Spoiler from "../../ui/spoiler";
import Button from "../../ui/button";
import styles from './squad.module.scss';


function SquadComponent({squad, tagIdMap, forceCollapse}: {squad: Squad, tagIdMap: TagIdMap, forceCollapse: boolean}, ref: Ref<HTMLDivElement>|null) {
    const [editMode, setEditMode] = useState(false);

    const toggleMode = useCallback(() => setEditMode(prev => !prev), [setEditMode]);
    
    const getHeader = useCallback(() => {
        return <div className={styles.header}>
            <h3>{squad.tag}</h3>
            <span>{squad.slots}</span>
        </div>
    }, [squad]);

    const printPreferences = useCallback((a: 'with'|'without') => {
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