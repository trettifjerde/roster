import { MouseEventHandler, ReactNode } from "react";
import styles from './button.module.scss';

export default function Button({children, disabled, className, onClick}: {
    children: ReactNode, 
    disabled?: boolean, 
    onClick: MouseEventHandler,
    className?: string
    
}) {
    return <button type="button" className={`${styles.btn} ${className ? className : ''}`} 
        disabled={!!disabled} onClick={onClick}>
        {children}
        </button>
}