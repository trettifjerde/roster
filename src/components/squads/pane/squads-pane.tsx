import { useCallback, useContext, useState } from "react";
import { StateContext } from "../../../store/context";
import Button from "../../ui/button";
import Spoiler from "../../ui/spoiler";
import SquadsGrid from "../grid/squads-grid";

export default function SquadsPane() {

    const {squads, ui} = useContext(StateContext).state;

    const [forceChildCollapse, setForceChildCollapse] = useState(true);

    const getHeader = useCallback(() => <>
        <h2>{ui.common.squads}</h2>
        <span>{squads.length} / {squads.reduce((acc, s) => acc + s.slots, 0)}</span>
    </>, [squads, ui]);

    const collapseSpoilers = useCallback(() => setForceChildCollapse(prev => !prev), [setForceChildCollapse]);


    return <Spoiler header={getHeader} initial={true}>

        <SquadsGrid forceChildCollapse={forceChildCollapse}/>

        <div className="btncont">
            <Button onClick={collapseSpoilers}>{ui.btns.collapseSquads}</Button>
        </div>

    </Spoiler>
}