import { useCallback, useContext, useState } from "react";
import SquadComponent from '../squad/squad';
import styles from './squads.module.scss';
import { StateContext } from "../../store/context";
import { AnimatePresence, motion } from "framer-motion";
import SquadForm from "../squad-form/squad-form";
import Button from "../ui/button";

export default function SquadGrid() {

    const {squads, tagIdMap} = useContext(StateContext).state;
    const [open, setOpen] = useState(true);
    const [editMode, setEditMode] = useState(false);

    const toggleForm = useCallback(() => setEditMode(prev => !prev), [setEditMode]);

    return <div className={styles.squads}>
        <div className={styles.grid}>
            <AnimatePresence mode="popLayout">
                {squads.map(squad => <SquadComponent key={squad.id} squad={squad} tagIdMap={tagIdMap}/>)}
            </AnimatePresence>
        </div>
        <div className={styles.new}>
            {editMode && <SquadForm toggleForm={toggleForm} />}
            {!editMode && <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}}>
                <Button onClick={toggleForm}>Add squad</Button>
            </motion.div>}
        </div>
    </div>
}