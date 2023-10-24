import {motion} from 'framer-motion';
import styles from './spoiler.module.scss';
import { ReactNode, Ref, forwardRef, useCallback, useEffect, useState } from 'react';

const variants = {
    hidden: {opacity: 0, height: '0'},
    visible: {opacity: 1, height: '100%'}
}

function Spoiler({header, coloredBg, children, initial, forceCollapse}: {
    header: () => JSX.Element, 
    coloredBg?: boolean,
    children: ReactNode,
    initial?: boolean,
    forceCollapse?: boolean
}, 
    ref: Ref<HTMLDivElement> | null) {
    const [open, setOpen] = useState(!!initial);
    const toggleSpoiler = useCallback(() => setOpen(prev => !prev), [setOpen]);

    useEffect(() => {
        setOpen(!!initial)
    }, [initial, forceCollapse, setOpen]);


    return <motion.div layout="position" className={styles.spoiler} ref={ref}>
        <motion.div layout className={`header ${styles.header} ${open ? styles.open : ''}`} onClick={toggleSpoiler}>
            {header()}
        </motion.div>
        <motion.div layout="preserve-aspect" className={styles.body} variants={variants} initial="hidden" animate={open ? 'visible' : 'hidden'}>
            <motion.div layout="preserve-aspect" className={`headed-cont ${styles.inner} ${coloredBg ? styles.innerBg : ''}`} >
                {children}
            </motion.div>
        </motion.div>
    </motion.div>
}

export default forwardRef(Spoiler);