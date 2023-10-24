import { memo, useCallback, useContext, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { StateContext } from '../../../store/context';

import Spoiler from '../../ui/spoiler';
import SquadItem from '../item/squad-item';
import SquadForm from '../form/squad-form';

import styles from './grid.module.scss';

const SquadsGrid = memo(({forceChildCollapse}: {forceChildCollapse: boolean}) => {
    const {squads, tagIdMap, ui} = useContext(StateContext).state;
    const newSquadFormRef = useRef<HTMLFormElement>(null);

    const newSquadHeader = useCallback(() => {
        return <h3 className={styles.new}>{ui.squads.newSquad}</h3>
    }, [ui]);

    const resetNewSquadForm = useCallback(() => {
        if (newSquadFormRef.current) 
            newSquadFormRef.current.reset();
    }, [newSquadFormRef])

    return <div className={styles.grid}>
    <AnimatePresence mode="popLayout">
        {squads.map(squad => <SquadItem key={squad.id} tagIdMap={tagIdMap} squad={squad} 
            forceCollapse={forceChildCollapse} ui={ui.squadItem}/>)}

        <Spoiler coloredBg key="new-squad" header={newSquadHeader} forceCollapse={forceChildCollapse}>
            {<motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}}>
                <SquadForm toggleForm={resetNewSquadForm} ref={newSquadFormRef} />
            </motion.div>}
        </Spoiler>
    </AnimatePresence>
</div>
});

export default SquadsGrid;