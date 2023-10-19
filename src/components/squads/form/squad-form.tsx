import { FormEventHandler, MouseEventHandler, useCallback, useContext, useState } from 'react';
import {motion} from 'framer-motion';
import { AddSquad, DeleteSquad, UpdateSquad } from '../../../store/actions';
import { StateContext } from '../../../store/context';
import { Squad } from '../../../util/types';
import Button from '../../ui/button';
import styles from './form.module.scss';
import formStyles from '../../ui/form.module.scss';

export default function SquadForm({squad, toggleForm}: {squad?: Squad, toggleForm: MouseEventHandler}) {
    const {state, dispatch} = useContext(StateContext);
    const [error, setError] = useState('');
    const [deleteMode, setDeleteMode] = useState(false);

    const validateForm: MouseEventHandler<HTMLButtonElement> = useCallback((e) => {
        const form = (e.target as HTMLButtonElement).form;
        if (!form) 
            return;

        const formData = new FormData(form);
        
        const tag = formData.get('tag')?.toString().trim() || '';
        const tagLC = tag.toLowerCase();
        
        if (!tag || ((tagLC !== squad?.tag.toLowerCase()) && state.squads.some(s => s.tag.toLowerCase() === tagLC))){
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

    }, [state.squads, setError]);

    const blockSubmit : FormEventHandler = useCallback((e) => e.preventDefault(), []);
    const clearError: MouseEventHandler = useCallback((e) => setError(''), [setError]);
    const toggleDeleteSquad: MouseEventHandler = useCallback((e) => setDeleteMode(prev => !prev), [setDeleteMode]);
    const deleteSquad: MouseEventHandler = useCallback((e) => {
        if (squad)
            dispatch(new DeleteSquad(squad.id))
    }, [squad, dispatch]);

    return <motion.form layout 
        initial={{opacity: 0, y: 100}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -100}}
            className={formStyles.form} onSubmit={blockSubmit} onClickCapture={clearError}>
        <p className={formStyles.err}>{error}</p>
        <div className={formStyles.cont}>
            <label>Tag</label>
            <input name="tag" type='text' defaultValue={squad ? squad.tag : ''} />
        </div>
        <div className={formStyles.cont}>
            <label>Slots</label>
            <input name="slots" type='number' min={0} defaultValue={squad ? squad.slots : 0}/>
        </div>

        {squad && !deleteMode && <Button onClick={toggleDeleteSquad}>Delete squad</Button>}
        {squad && deleteMode && <div className={formStyles.btncont}>
            <div>Delete squad?</div>
            <Button onClick={deleteSquad}>Yes</Button>
            <Button onClick={toggleDeleteSquad}>Cancel</Button>
        </div>}

        <SquadPrefsForm squad={squad} squads={state.squads}/>
        <div className={formStyles.btncont}>
            <Button onClick={validateForm}>Save</Button>
            <Button onClick={toggleForm}>Cancel</Button>
        </div>
    </motion.form>
    
}

function SquadPrefsForm({squad, squads}: {squad?: Squad, squads: Squad[]}) {

    const sqs = useState(squad ? squads.filter(s => s.tag !== squad.tag) : squads)[0];

    return <div className={styles.prefs}>
        <label>Preferences</label>
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