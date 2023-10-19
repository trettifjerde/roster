import { MouseEventHandler, ReactNode } from "react";
import styles from './button.module.scss';

export default function Button({children, disabled, onClick}: {children: ReactNode, disabled?: boolean, onClick: MouseEventHandler}) {
    return <button type="button" className={styles.btn} 
        disabled={!!disabled} onClick={onClick}>
        {children}
        </button>
}