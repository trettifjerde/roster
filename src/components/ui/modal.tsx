import { ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from './modal.module.scss';

export default function Modal({header, children}: {header: string, children: ReactNode}) {
    return createPortal(<div className={styles.modal}>
        <div className={styles.inner}>
            <div className="header"><h3>{header}</h3></div>
            <div className={styles.body}>
                {children}
            </div>
        </div>
    </div>, document.getElementById('modal')!);
}
