import { Ref, forwardRef, memo, useCallback, useMemo, useState } from "react";
import styles from './squad.module.scss';
import {AnimatePresence, motion} from 'framer-motion';
import Button from "../ui/button";
import SquadForm from "../squad-form/squad-form";
import { Squad, TagIdMap } from "../../util/types";

const variants = {
    hidden: {opacity: 0, height: '0'},
    visible: {opacity: 1, height: '100%'}
}

function SquadComponent({squad, tagIdMap}: {squad: Squad, tagIdMap: TagIdMap}, ref: Ref<HTMLDivElement>|null) {
    console.log(squad.tag);
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const toggleSpoiler = useCallback(() => setOpen(prev => !prev), [setOpen]);
    const toggleMode = useCallback(() => setEditMode(prev => !prev), [setEditMode]);

    const printPreferences = useCallback((a: 'with'|'without') => {
        console.log('printing prefs');
        return [...squad[a]]
            .map(id => ({id, tag: tagIdMap.get(id) as string}))
            .sort((a, b) => a.tag.toUpperCase() < b.tag.toUpperCase() ? -1 : 1)
            .map(entry => <p key={entry.id}>{entry.tag}</p>)
    }, [tagIdMap, squad]);

    const printWiths = useMemo(() => printPreferences('with'), [printPreferences]);
    const printWithouts = useMemo(() => printPreferences('without'), [printPreferences]);

    return <motion.div layout className={styles.squad} ref={ref}>
        <motion.div layout className={styles.header} onClick={toggleSpoiler}>
            <h3>{squad.tag}</h3>
            <span>{squad.slots}</span>
        </motion.div>
        <motion.div layout className={styles.body} variants={variants} initial="hidden" animate={open ? 'visible' : 'hidden'}>
            <motion.div layout className={styles.inner} >

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
                
            </motion.div>
        </motion.div>
    </motion.div>
}

export default memo(forwardRef(SquadComponent));