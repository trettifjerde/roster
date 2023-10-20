import { ChangeEventHandler, memo, useCallback, useContext, useEffect, useRef, useState } from 'react';
import formStyles from '../../ui/form.module.scss';
import styles from './form.module.scss';
import Button from '../../ui/button';
import { CalculationParams } from '../pane/roster-pane';
import { StateContext } from '../../../store/context';
import { translations } from '../../../store/translations';

function cleanOrGetError(ui: typeof translations.en.rosterForm | typeof translations.ru.rosterForm, key: InputName, v: string) {
    const value = +v;
    const info = FORM[key];

    try {

        if (!v || isNaN(value)) {
            throw new TypeError(`Invalid ${ui[key].label.toLowerCase()}`);
        }

        if (value < info.min || value > info.max) 
            throw new RangeError(`${ui[key].label.toLowerCase()} must be between ${info.min} and ${info.max}`);

        return {val: value, err: ''}
    }
    catch (err) {
        if (err instanceof RangeError || err instanceof TypeError) 
            return {val: null, err: err.message};
        else
            return {val: null, err: 'Unknown error occurred'};
    }
}

function RosterForm({startCalculating}: {
    startCalculating: (p: CalculationParams) => void
}) {
    const {ui, defaultHappiness} = useContext(StateContext).state;
    const [error, setError] = useState('');
    const ref = useRef<HTMLFormElement>(null);

    const validateForm = () => {

        if (ref.current) {

            const params : CalculationParams = {slots: 0, side: 0, squad: 0};

            for (const key of Object.keys(FORM) as InputName[]) {
                const {val, err} = cleanOrGetError(ui.rosterForm, key, ref.current[key].value);
                
                if (val) {
                    params[key] = val;
                }
                else {
                    markError(ref.current[key], err);
                    return;
                }
            }

            startCalculating(params);
        }
    };

    const setDefault = () => {
        if (ref.current) {

            for (const [key, value] of Object.entries(FORM)) {
                cleanError(ref.current[key]);
                if (key !== 'side') {
                    ref.current[key].value = value.defaultValue;
                }
                else {
                    ref.current[key].value = defaultHappiness;
                }
            }
        }
    }

    const validateValue : ChangeEventHandler<HTMLInputElement> = (e) => {
        const key = e.target.name as InputName;
        const v = e.target.value;

        const {err} = cleanOrGetError(ui.rosterForm, key, v);

        if (err) 
            markError(e.target, err);
        else
            cleanError(e.target);
    }

    const cleanError = (input: HTMLInputElement) => {
        input.classList.remove(formStyles.invalid);
        setError('');
    }

    const markError = (input: HTMLInputElement, err: string) => {
        input.classList.add(formStyles.invalid);
        setError(err);
    }

    useEffect(() => {
        if (ref.current) {
            ref.current['side'].value = defaultHappiness;
        }
    }, [ref, defaultHappiness]);

    return <form className={`${formStyles.form} ${styles.form}`} ref={ref}
        onSubmit={(e) => e.preventDefault()}>
        <p className={formStyles.err}>{error}</p>
        <div>
            {Object.entries(FORM).map(([key, value]) => <div className={styles.lblcont} key={key}>
                <label>{ui.rosterForm[key as InputName].label}
                    <input name={key} min={value.min} max={value.max} step="1" 
                        defaultValue={value.defaultValue === null ? defaultHappiness : value.defaultValue} onChange={validateValue} onFocus={(e) => cleanError(e.target)} />
                </label>
                <div className='note'>{ui.rosterForm[key as InputName].description}</div>
            </div>)}
        </div>
        <div className={formStyles.btncont}>
            <Button onClick={validateForm}>{ui.btns.formRoster}</Button>
            <Button onClick={setDefault}>{ui.btns.setDefault}</Button>
        </div>
    </form>
}

export default memo(RosterForm);

export const FORM = {
    slots: {
        defaultValue: 2,
        min: 0,
        max: 4,
    },
    side: {
        defaultValue: null,
        min: 0,
        max: 20,
    },
    squad: {
        defaultValue: -1,
        min: -6,
        max: 5,
    }
}

export type InputName = keyof typeof FORM;