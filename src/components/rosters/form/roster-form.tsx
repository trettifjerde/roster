import { ChangeEventHandler, memo, useContext, useEffect, useRef, useState } from 'react';

import { CalculationParams, FormValues } from '../../../util/types';
import { calcDefaultFormParams } from '../../../util/helpers';

import { RosterFormUI } from '../../../store/translations';
import { StateContext } from '../../../store/context';

import Button from '../../ui/button';

import styles from './form.module.scss';

function cleanOrGetError(ui: RosterFormUI, formValues: FormValues, key: keyof FormValues, v: string) {
    const value = +v;
    const info = formValues[key];

    try {

        if (!v || isNaN(value)) {
            throw new TypeError(ui[key].invalid);
        }

        if (value < info.min || value > info.max) 
            throw new RangeError(ui.rangeError(ui[key].label, info.min, info.max))

        return {val: value, err: ''}
    }
    catch (err) {
        if (err instanceof RangeError || err instanceof TypeError) 
            return {val: null, err: err.message};
        else
            return {val: null, err: ui.unknownError};
    }
}

function RosterForm({startCalculating}: {
    startCalculating: (p: CalculationParams) => void
}) {
    const {squads, ui} = useContext(StateContext).state;
    const [error, setError] = useState('');
    const ref = useRef<HTMLFormElement>(null);
    const [formValues, setFormValues] = useState<FormValues>(calcDefaultFormParams(squads));

    useEffect(() => {setFormValues(calcDefaultFormParams(squads))}, [squads, setFormValues]);

    useEffect(() => {
        setDefault();
    }, [formValues, ref]);

    const validateForm = () => {

        if (ref.current) {

            const params : CalculationParams = {slots: 0, happiness: 0};

            for (const key of Object.keys(formValues) as (keyof FormValues)[]) {
                const {val, err} = cleanOrGetError(ui.rosterForm, formValues, key, ref.current[key].value);
                
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
            for (const [key, value] of Object.entries(formValues)) {
                cleanError(ref.current[key]);
                    ref.current[key].value = value.defaultValue;
            }
        }
    }

    const validateValue : ChangeEventHandler<HTMLInputElement> = (e) => {
        const key = e.target.name as keyof FormValues;
        const v = e.target.value;

        const {err} = cleanOrGetError(ui.rosterForm, formValues, key, v);

        if (err) 
            markError(e.target, err);
        else
            cleanError(e.target);
    }

    const cleanError = (input: HTMLInputElement) => {
        input.classList.remove("invalid");
        setError('');
    }

    const markError = (input: HTMLInputElement, err: string) => {
        input.classList.add("invalid");
        setError(err);
    }

    return <form className={`form ${styles.form}`} ref={ref}
        onSubmit={(e) => e.preventDefault()}>
        <p className="form-err">{error}</p>
        <div>
            <div className={styles.lblcont}>
                <label>{ui.rosterForm.slots.label}
                    <input name="slots" step="1" min={formValues.slots.min} max={formValues.slots.max}
                        defaultValue={formValues.slots.defaultValue} onChange={validateValue} onFocus={(e) => cleanError(e.target)} />
                </label>
                <div className='note'>{ui.rosterForm.slots.description}</div>
            </div>
            <div className={styles.lblcont}>
                <label>{ui.rosterForm.happiness.label}
                    <input name="happiness" step="1" min={formValues.happiness.min} max={formValues.happiness.max}
                        defaultValue={formValues.happiness.defaultValue} onChange={validateValue} onFocus={(e) => cleanError(e.target)} />
                </label>
                <div className='note'>{ui.rosterForm.happiness.description}</div>
            </div>
        </div>
        <div className="btncont">
            <Button onClick={validateForm}>{ui.btns.formRoster}</Button>
            <Button onClick={setDefault}>{ui.btns.setDefault}</Button>
        </div>
    </form>
}

export default memo(RosterForm);