import { MouseEvent, useCallback, useContext, useRef, useState } from "react";
import { StateContext } from "../../../store/context";
import Button from "../../ui/button";
import Spoiler from "../../ui/spoiler";
import styles from './pane.module.scss';
import SquadsGrid from "../grid/squads-grid";
import { SquadsData, downloadSquadsInfo, readSquadInfo } from "../../../util/helpers";
import { UploadSquads } from "../../../store/actions";
import Modal from "../../ui/modal";

export default function SquadsPane() {

    const {state, dispatch} = useContext(StateContext);
    const {squads, tagIdMap, ui} = state;
    const [forceChildCollapse, setForceChildCollapse] = useState(true);
    const importRef = useRef<HTMLInputElement>(null);
    const [importConfirmation,setImportConfirmation] = useState(false);
    const [applyNewSquads, setApplyNewSquads] = useState<(e: MouseEvent) => Function>(() => (e: MouseEvent) => () => {});

    const collapseSpoilers = useCallback(() => setForceChildCollapse(prev => !prev), [setForceChildCollapse]);
    const getHeader = useCallback(() => <div className={styles.header}>
        <h2>{ui.common.squads}</h2>
        <span>{squads.length} / {squads.reduce((acc, s) => acc + s.slots, 0)}</span>
    </div>, [squads, ui]);

    const startImportInfo = useCallback(() => {
        if (importRef.current) importRef.current.click();
    }, [importRef]);

    const clearFiles = useCallback(() => {
        if (importRef.current) {
            importRef.current.files = null;
            importRef.current.value = '';
        }
    }, [importRef]);

    const readSquadFile = useCallback(async() => {
        if (!importRef.current) return;

        const file = importRef.current.files?.[0];

        if (!file) return;

        const data = await readSquadInfo(file);

        clearFiles();

        if (!data) 
            alert(ui.squads.fileError);

        else {
            setImportConfirmation(true);
            setApplyNewSquads(() => (e: MouseEvent) => setNewSquadInfo(data));
        }
        
    }, [importRef, ui, dispatch, clearFiles, setApplyNewSquads, setImportConfirmation]);

    const setNewSquadInfo = useCallback((data: SquadsData) => {
        dispatch(new UploadSquads(
            data.squads, 
            data.tagIdMap, 
            data.nextId
        ));
        setImportConfirmation(false);
    }, [dispatch, setImportConfirmation]);

    const exportSquadsInfo = () => downloadSquadsInfo(squads, tagIdMap);


    const closeConfirmation = useCallback(() => {
        setImportConfirmation(false);
        clearFiles();
    }, [clearFiles, setImportConfirmation]);


    return <Spoiler header={getHeader} initial={true} className={styles.cont}>

        <SquadsGrid forceChildCollapse={forceChildCollapse}/>

        <div className={`btncont ${styles.btncont}`}>
            <input type="file" accept=".txt" name="importSquads" ref={importRef} onChange={readSquadFile} hidden />
            <Button onClick={startImportInfo}>{ui.btns.import}</Button>
            <Button onClick={exportSquadsInfo}>{ui.btns.export}</Button>
            <Button onClick={collapseSpoilers}>{ui.btns.collapseSquads}</Button>
        </div>

        {importConfirmation && <Modal header={ui.squads.importConfHeader}>
            {ui.squads.importConfBody}
            <div className="btncont">
                <Button onClick={applyNewSquads}>{ui.common.yes}</Button>
                <Button onClick={closeConfirmation}>{ui.common.cancel}</Button>
            </div>
        </Modal>}
    </Spoiler>
}