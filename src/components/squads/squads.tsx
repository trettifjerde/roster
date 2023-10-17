import { useState } from "react";
import { Squad } from "../../util/classes";
import SquadComponent from '../squad/squad';
import styles from './squads.module.scss';

export default function SquadGrid({squads}: {squads: Squad[]}) {

    const [open, setOpen] = useState(true);

    return <div className={styles.squads}>
        <div className={styles.grid}>
            {squads.map(squad => <SquadComponent key={squad.tag} squad={squad} />)}
        </div>
    </div>
}