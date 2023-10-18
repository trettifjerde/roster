import { MouseEventHandler, ReactNode } from "react";
import styles from './button.module.scss';

export default function Button({children, onClick}: {children: ReactNode, onClick: MouseEventHandler}) {
    return <button type="button" className={styles.btn} onClick={onClick}>{children}</button>
}