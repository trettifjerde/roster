import { memo, useState } from "react";
import { Squad } from "../../util/classes";
import styles from './squad.module.scss';
import {motion} from 'framer-motion';

const variants = {
    hidden: {opacity: 0, height: '0'},
    visible: {opacity: 1, height: '100%'}
}

function printPreferences(s: Set<string>) {
    return [...s].sort((a, b) => a > b ? 1 : -1).map(tag => <p key={tag}>{tag}</p>)
}

function SquadComponent({squad} : {squad: Squad}) {

    const [open, setOpen] = useState(false);

    const toggleSpoiler = () => setOpen(prev => !prev);

    return <div className={styles.squad}>
        <div className={styles.header} onClick={toggleSpoiler}>
            <h3>{squad.tag}</h3>
            <span>{squad.slots}</span>
        </div>
        <motion.div className={styles.body} variants={variants} initial="hidden" animate={open ? 'visible' : 'hidden'}>
            <div className={styles.inner} >
                <div className={styles.info}>With</div>
                <div className={styles.info}>Without</div>
                <div>{printPreferences(squad.with)}</div>
                <div>{printPreferences(squad.without)}</div>
            </div>
        </motion.div>
    </div>
}

export default memo(SquadComponent);