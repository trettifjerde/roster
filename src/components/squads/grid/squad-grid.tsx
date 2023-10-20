import { useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SquadComponent from '../squad/squad-item';
import { StateContext } from "../../../store/context";
import SquadForm from "../form/squad-form";
import Button from "../../ui/button";
import Spoiler from "../../ui/spoiler";
import styles from './grid.module.scss';
import formStyles from '../../ui/form.module.scss';

export default function SquadGrid() {

    const {squads, tagIdMap, ui} = useContext(StateContext).state;
    const [forceChildCollapse, setForceChildCollapse] = useState(true);
    const [editMode, setEditMode] = useState(false);

    const toggleForm = useCallback(() => setEditMode(prev => !prev), [setEditMode]);
    const collapseSpoilers = useCallback(() => setForceChildCollapse(prev => !prev), [setForceChildCollapse]);
    const getHeader = useCallback(() => {
        return <div className={styles.header}>
            <h2>{ui.common.squads}</h2>
            <span>{squads.length} / {squads.reduce((acc, s) => acc + s.slots, 0)}</span>
        </div>
    }, [squads, ui]);

    return <Spoiler header={getHeader} initial={true} className={styles.cont}>
        <div className={styles.grid}>
            <AnimatePresence mode="popLayout">
                {squads.map(squad => <SquadComponent withS={ui.squadGrid.with} withoutS={ui.squadGrid.without} edit={ui.btns.edit}
                    key={squad.id} squad={squad} tagIdMap={tagIdMap} forceCollapse={forceChildCollapse}/>)}
            </AnimatePresence>
        </div>
        
        <div className={`${formStyles.form} ${formStyles.btncont}`}>
            {editMode && <SquadForm toggleForm={toggleForm} />}
            {!editMode && <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}}>
                <Button onClick={toggleForm}>{ui.btns.addSquad}</Button>
                <Button onClick={collapseSpoilers}>{ui.btns.collapseSquads}</Button>
            </motion.div>}
        </div>
    </Spoiler>
}