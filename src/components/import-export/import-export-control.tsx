import { MouseEvent, useCallback, useContext, useRef, useState } from "react";
import { SquadsData, downloadSquadsInfo, readSquadInfo } from "../../util/helpers";
import { StateContext } from "../../store/context";
import { UploadSquads } from "../../store/actions";
import Modal from "../ui/modal";
import Button from "../ui/button";

export default function ImportExportControl() {

    const {state, dispatch} = useContext(StateContext);
    const {squads, tagIdMap, ui} = state;
    const importRef = useRef<HTMLInputElement>(null);
    const [importConfirmation,setImportConfirmation] = useState(false);
    const [applyNewSquads, setApplyNewSquads] = useState<(e: MouseEvent) => Function>(() => (e: MouseEvent) => () => {});
        
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
        setApplyNewSquads(() => () => {});
        clearFiles();
    }, [clearFiles, setImportConfirmation]);

    return <div>
        <div className="btncont">
            <input type="file" accept=".txt" name="importSquads" ref={importRef} onChange={readSquadFile} hidden />
            <Button onClick={startImportInfo}>{ui.btns.import}</Button>
            <Button onClick={exportSquadsInfo}>{ui.btns.export}</Button>
        </div>

        {importConfirmation && <Modal header={ui.squads.importConfHeader}>
            {ui.squads.importConfBody}
            <div className="btncont">
                <Button onClick={applyNewSquads}>{ui.common.yes}</Button>
                <Button onClick={closeConfirmation}>{ui.common.cancel}</Button>
            </div>
        </Modal>}
    </div>
}