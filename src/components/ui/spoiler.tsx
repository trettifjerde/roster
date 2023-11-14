import {motion} from 'framer-motion';
import styles from './spoiler.module.scss';
import { ReactNode, Ref, useCallback, useEffect, useState } from 'react';

const variants = {
    hidden: {opacity: 0, height: '0'},
    visible: {opacity: 1, height: '100%'}
}

export default function Spoiler({header, coloredBg, children, initial, forceCollapse}: {
    header: () => JSX.Element, 
    coloredBg?: boolean,
    children: ReactNode,
    initial?: boolean,
    forceCollapse?: boolean}) 
{
    const [open, setOpen] = useState(!!initial);
    const toggleSpoiler = useCallback(() => setOpen(prev => !prev), [setOpen]);

    useEffect(() => {
        setOpen(!!initial)
    }, [initial, forceCollapse, setOpen]);


    return <div className={styles.spoiler}>
        <div className={`header ${styles.header} ${open ? styles.open : ''}`} onClick={toggleSpoiler}>
            {header()}
        </div>
        <motion.div className={styles.body} variants={variants} initial="hidden" animate={open ? 'visible' : 'hidden'}>
            <div className={`headed-cont ${styles.inner} ${coloredBg ? styles.innerBg : ''}`} >
                {children}
            </div>
        </motion.div>
    </div>
}