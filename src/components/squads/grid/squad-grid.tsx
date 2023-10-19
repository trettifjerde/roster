import { useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SquadComponent from '../squad/squad-item';
import { StateContext } from "../../../store/context";
import SquadForm from "../form/squad-form";
import Button from "../../ui/button";
import Spoiler from "../../ui/spoiler";
import styles from './grid.module.scss';

export default function SquadGrid() {

    const {squads, tagIdMap} = useContext(StateContext).state;
    const [forceCollapse, setForceCollapse] = useState(true);
    const [editMode, setEditMode] = useState(false);

    const toggleForm = useCallback(() => setEditMode(prev => !prev), [setEditMode]);
    const collapseSpoilers = useCallback(() => setForceCollapse(prev => !prev), [setForceCollapse]);
    const getHeader = useCallback(() => {
        return <div className={styles.header}>
            <h2>Squads</h2>
            <span>{squads.length} / {squads.reduce((acc, s) => acc + s.slots, 0)}</span>
        </div>
    }, [squads]);

    return <Spoiler header={getHeader} initial={true} className={styles.cont}>
        <div className={styles.grid}>
            <AnimatePresence mode="popLayout">
                {squads.map(squad => <SquadComponent key={squad.id} squad={squad} tagIdMap={tagIdMap} forceCollapse={forceCollapse}/>)}
            </AnimatePresence>
        </div>
        
        <div className={styles.new}>
            {editMode && <SquadForm toggleForm={toggleForm} />}
            {!editMode && <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}}>
                <Button onClick={toggleForm}>Add squad</Button>
                <Button onClick={collapseSpoilers}>Collapse squads</Button>
            </motion.div>}
        </div>
    </Spoiler>
}