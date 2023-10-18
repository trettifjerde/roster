import {motion} from 'framer-motion';
import styles from './spoiler.module.scss';
import { ReactNode, Ref, forwardRef, useCallback, useEffect, useState } from 'react';

const variants = {
    hidden: {opacity: 0, height: '0'},
    visible: {opacity: 1, height: '100%'}
}

function Spoiler({header, children, className, initial, forceCollapse}: {
    header: () => JSX.Element, 
    children: ReactNode,
    className?: string,
    initial?: boolean,
    forceCollapse?: boolean
}, 
    ref: Ref<HTMLDivElement> | null) {
    const [open, setOpen] = useState(!!initial);
    const toggleSpoiler = useCallback(() => setOpen(prev => !prev), [setOpen]);

    useEffect(() => {
        setOpen(!!initial)
    }, [initial, forceCollapse, setOpen]);


    return <motion.div layout className={styles.spoiler} ref={ref}>
        <motion.div layout className={styles.header} onClick={toggleSpoiler}>
            {header()}
        </motion.div>
        <motion.div layout className={styles.body} variants={variants} initial="hidden" animate={open ? 'visible' : 'hidden'}>
            <motion.div layout className={`${styles.inner} ${className ? className : ''}`} >
                {children}
            </motion.div>
        </motion.div>
    </motion.div>
}

export default forwardRef(Spoiler);