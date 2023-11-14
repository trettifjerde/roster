import { Ref, forwardRef, memo, useCallback, useMemo, useState } from "react";
import {AnimatePresence, motion} from 'framer-motion';
import { Squad, IdTagMap } from "../../../util/types";
import SquadForm from "../form/squad-form";
import MotionsSpoiler from "../../ui/motion-spoiler";
import Button from "../../ui/button";
import { translations } from "../../../store/translations";
import styles from './squad.module.scss';


const SquadItem = memo(
    forwardRef<Ref<HTMLDivElement>|null, {
        squad: Squad, 
        idTagMap: IdTagMap, 
        forceCollapse: boolean,
        ui: typeof translations.en.squadItem
    }>(({squad, idTagMap, forceCollapse, ui}, ref) => {

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
            .map(id => ({id, tag: idTagMap.get(id)!}))
            .sort((a, b) => a.tag.toUpperCase() < b.tag.toUpperCase() ? -1 : 1)
            .map(entry => <p key={entry.id}>{entry.tag}</p>)
    }, [idTagMap, squad]);

    const printWiths = useMemo(() => printPreferences('with'), [printPreferences]); 
    const printWithouts = useMemo(() => printPreferences('without'), [printPreferences]);
    
    return <MotionsSpoiler coloredBg header={getHeader} forceCollapse={forceCollapse}>
        <AnimatePresence mode="wait">
            {!editMode && <motion.div className={styles.info} 
                initial={{opacity: 0, y: -100}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: 100}}>
                <div className={styles.note}>{ui.with}</div>
                <div className={styles.note}>{ui.without}</div>
                <div>{printWiths}</div>
                <div>{printWithouts}</div>
                <Button onClick={toggleMode}>{ui.edit}</Button>
            </motion.div>}

            {editMode &&<SquadForm squad={squad} toggleForm={toggleMode}/>}
        </AnimatePresence>
    </MotionsSpoiler>
}));

export default SquadItem;