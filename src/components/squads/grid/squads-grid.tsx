import { AnimatePresence, motion } from 'framer-motion';
import styles from './grid.module.scss';
import { memo, useCallback, useContext, useRef } from 'react';
import { StateContext } from '../../../store/context';
import SquadItem from '../squad/squad-item';
import Spoiler from '../../ui/spoiler';
import SquadForm from '../form/squad-form';
import squadStyles from '../squad/squad.module.scss';

const SquadsGrid = memo(({forceChildCollapse}: {forceChildCollapse: boolean}) => {
    const {squads, tagIdMap, ui} = useContext(StateContext).state;
    const newSquadFormRef = useRef<HTMLFormElement>(null);

    const newSquadHeader = useCallback(() => {
        return <div className={`${squadStyles.header} ${styles.new}`}>
            <h3>{ui.squads.newSquad}</h3>
        </div>
    }, [ui]);

    const resetNewSquadForm = useCallback(() => {
        if (newSquadFormRef.current) 
            newSquadFormRef.current.reset();
    }, [newSquadFormRef])

    return <div className={styles.grid}>
    <AnimatePresence mode="popLayout">
        {squads.map(squad => <SquadItem key={squad.id} tagIdMap={tagIdMap} squad={squad} 
            forceCollapse={forceChildCollapse} ui={ui.squadItem}/>)}

        <Spoiler key="new-squad" header={newSquadHeader} className={squadStyles.squad} forceCollapse={forceChildCollapse}>
            {<motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -10}}>
                <SquadForm toggleForm={resetNewSquadForm} ref={newSquadFormRef} />
            </motion.div>}
        </Spoiler>
    </AnimatePresence>
</div>
});

export default SquadsGrid;