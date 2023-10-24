import { FormEventHandler, MouseEventHandler, Ref, forwardRef, memo, useCallback, useContext, useState } from 'react';
import {motion} from 'framer-motion';
import { AddSquad, DeleteSquad, UpdateSquad } from '../../../store/actions';
import { StateContext } from '../../../store/context';
import { Squad } from '../../../util/types';
import Button from '../../ui/button';
import styles from './form.module.scss';

function SquadForm({squad, toggleForm}: {squad?: Squad, toggleForm: MouseEventHandler}, ref: Ref<HTMLFormElement>|null) {
    const {state, dispatch} = useContext(StateContext);
    const {squads, ui} = state;
    const [error, setError] = useState('');
    const [deleteMode, setDeleteMode] = useState(false);

    const validateForm: MouseEventHandler<HTMLButtonElement> = useCallback((e) => {
        const form = (e.target as HTMLButtonElement).form;
        if (!form) 
            return;

        const formData = new FormData(form);
        
        const tag = formData.get('tag')?.toString().trim() || '';
        const tagLC = tag.toLowerCase();
        
        if (!tag || ((tagLC !== squad?.tag.toLowerCase()) && squads.some(s => s.tag.toLowerCase() === tagLC))){
            setError('Invalid squad tag');
            return;
        }
        
        const slots = +(formData.get('slots')?.toString() || 0);
        if (slots <= 0) {
            setError('Invalid slots');
            return;
        }
        
        const withs: Set<number> = new Set();
        const withouts: Set<number> = new Set();
        
        formData.getAll('with').forEach(v => withs.add(+(v.toString())));
        formData.getAll('without').forEach(v => withouts.add(+(v.toString())));
        
        const updSquad : Squad = {tag, slots, with: withs, without: withouts, id: squad ? squad.id : 0};

        dispatch(squad ? new UpdateSquad(updSquad) : new AddSquad(updSquad));
        toggleForm(e);

    }, [squads, setError]);

    const blockSubmit : FormEventHandler = useCallback((e) => e.preventDefault(), []);
    const clearError: MouseEventHandler = useCallback((e) => setError(''), [setError]);
    const toggleDeleteSquad: MouseEventHandler = useCallback((e) => setDeleteMode(prev => !prev), [setDeleteMode]);
    const deleteSquad: MouseEventHandler = useCallback((e) => {
        if (squad)
            dispatch(new DeleteSquad(squad.id))
    }, [squad, dispatch]);

    return <motion.form layout ref={ref}
        initial={{opacity: 0, y: 100}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -100}}
            className="form" onSubmit={blockSubmit} onClickCapture={clearError}>
        <p className="form-err">{error}</p>
        <div className="form-control">
            <label>{ui.squadsForm.tag}</label>
            <input name="tag" type='text' defaultValue={squad ? squad.tag : ''} />
        </div>
        <div className="form-control">
            <label>{ui.common.slots}</label>
            <input name="slots" type='number' min={0} defaultValue={squad ? squad.slots : 0}/>
        </div>

        {squad && <div className='btncont'>
            {!deleteMode && <Button onClick={toggleDeleteSquad}>{ui.squadsForm.deleteSquad}</Button>}
            {deleteMode && <>
                <p>{ui.squadsForm.deleteSquad}?</p>
                <Button onClick={deleteSquad}>{ui.common.yes}</Button>
                <Button onClick={toggleDeleteSquad}>{ui.common.cancel}</Button>
            </>}
        </div>}

        <SquadPrefsForm prefs={ui.squadsForm.preferences} squad={squad} squads={squads}/>
        <div className="btncont">
            <Button onClick={validateForm}>{ui.common.save}</Button>
            <Button onClick={toggleForm}>{ui.common.cancel}</Button>
        </div>
    </motion.form>
}

export default memo(forwardRef(SquadForm));

function SquadPrefsForm({prefs, squad, squads}: {prefs: string, squad?: Squad, squads: Squad[]}) {

    const sqs = useState(squad ? squads.filter(s => s.tag !== squad.tag) : squads)[0];

    return <div className={styles.prefs}>
        <label>{prefs}</label>
        <div className={styles.checkboxes}>
            {sqs.map(s => <SquadPref key={s.tag} tag={s.tag} id={s.id}
                withS={!!squad && squad.with.has(s.id)}
                withoutS={!!squad && squad.without.has(s.id)} />)}
        </div>
    </div>
}

function SquadPref({tag, id, withS, withoutS}: {tag: string, id: number, withS: boolean, withoutS: boolean}) {
    const [withChecked, setWithChecked] = useState(withS);
    const [withoutChecked, setWithoutChecked] = useState(withoutS);

    const toggleChecks = (a: 'with' | 'without') => {
        switch(a) {
            case 'with':
                setWithChecked(prev => !prev);
                setWithoutChecked(false);
                break;

            case 'without':
                setWithoutChecked(prev => !prev);
                setWithChecked(false);
                break;
        }
    };

    return <div className={styles.chbxcont}>
        <input name="with" value={id.toString()} type="checkbox" checked={withChecked} onChange={() => toggleChecks('with')}/>
        {tag}
        <input name="without" value={id.toString()} type="checkbox" checked={withoutChecked} onChange={() => toggleChecks('without')} />
    </div>
}