import { ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from './hover-note.module.scss';
import { HappinessInfo } from "../../../util/types";

export default function HoverNote({texts, happinessInfo, position}: {texts: {happy: string, unhappy: string}, happinessInfo: HappinessInfo, position: {X: number, Y: number}}) {
    return createPortal(<div className={styles.note} style={{top: position.Y + 35, left: position.X, transform: 'translateX(-40%)'}}>
        <h4>{happinessInfo.tag} {happinessInfo.total > 0 ? `+${happinessInfo.total}` : happinessInfo.total}</h4>
        <div className={styles.happiness}>
            <div className={styles.happy}>
                <div><b>{texts.happy}</b></div>
                <div>
                    {happinessInfo.happy.map(s => <p>{s}</p>)}
                    {happinessInfo.happy.length === 0 && <p>-</p>}
                </div>
            </div>
            <div className={styles.unhappy}>
                <div><b>{texts.unhappy}</b></div> 
                <div>
                    {happinessInfo.unhappy.map(s => <p>{s}</p>)}
                    {happinessInfo.unhappy.length === 0 && <p>-</p>}
                </div>
            </div>
        </div>
    </div>, document.getElementById('note')!);
}