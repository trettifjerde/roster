import { ChangeEventHandler, useRef, useState } from 'react';
import formStyles from '../../ui/form.module.scss';
import styles from './form.module.scss';
import Button from '../../ui/button';
import { CalculationParams } from '../pane/roster-pane';

const DEFAULT_VALUES = {
    slots: 2,
    side: 10,
    squad: -3
};

type Key = keyof typeof DEFAULT_VALUES;

const MIN_MAX = {
    slots: [0, 4],
    side: [0, 20],
    squad: [-8, 4]
}

const KEYS : Key[] = ['slots', 'side', 'squad'];

function cleanOrGetError(key: Key, v: string) {
    const value = +v;

    try {

        if (!v || isNaN(value)) {
            throw new TypeError(`Invalid ${key}`);
        }

        switch (key) {
            case 'squad':
                if (value < MIN_MAX.squad[0] || value > MIN_MAX.squad[1]) 
                    throw new RangeError(`${key} must be between ${MIN_MAX[key][0]} and ${MIN_MAX[key][1]}`);
                break;

            case 'slots':
                if (value < MIN_MAX.slots[0] || value > MIN_MAX.slots[1]) 
                    throw new RangeError(`${key} must be between ${MIN_MAX[key][0]} and ${MIN_MAX[key][1]}`);
                break;
            case 'side':
                if (value < MIN_MAX.side[0] || value > MIN_MAX.side[1]) 
                    throw new RangeError(`${key} must be between ${MIN_MAX[key][0]} and ${MIN_MAX[key][1]}`);
                break;
        }
        return {val: value, err: ''}
    }
    catch (err) {
        if (err instanceof RangeError || err instanceof TypeError) 
            return {val: null, err: err.message};
        else
            return {val: null, err: 'Unknown error occurred'};
    }
}

export default function RosterForm({startCalculating}: {startCalculating: (p: CalculationParams) => void}) {
    const [error, setError] = useState('');

    const ref = useRef<HTMLFormElement>(null);

    const validateForm = () => {

        if (ref.current) {

            const params : Map<Key, number> = new Map();

            for (const key of KEYS) {
                const {val, err} = cleanOrGetError(key, ref.current[key].value);
                
                if (val) {
                    params.set(key, val);
                }
                else {
                    markError(ref.current[key], err);
                    return;
                }
            }

            const values : CalculationParams = {slots: 0, side: 0, squad: 0};
            for (const [key, value] of params) {
                values[key] = value;
            }

            startCalculating(values);
        }
    };

    const setDefault = () => {
        if (ref.current) {

            for (const key of KEYS) {
                cleanError(ref.current[key]);
                ref.current[key].value = DEFAULT_VALUES[key];
            }
        }
    }

    const validateValue : ChangeEventHandler<HTMLInputElement> = (e) => {
        const key = e.target.name as Key;
        const v = e.target.value;

        const {err} = cleanOrGetError(key, v);

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

    return <form className={`${formStyles.form} ${styles.form}`} ref={ref}
        onSubmit={(e) => e.preventDefault()}>
        <p className={formStyles.err}>{error}</p>
        <div className={formStyles.lblcont}>
            <div>
                <label>Min side happiness</label>
                <input name="side" min={MIN_MAX.side[0]} max={MIN_MAX.side[1]} step="1" 
                    defaultValue={DEFAULT_VALUES.side} onChange={validateValue} onFocus={(e) => cleanError(e.target)} />
            </div>
            <div>
                <label>Min squad happiness</label>
                <input name="squad" min={MIN_MAX.squad[0]} max={MIN_MAX.squad[1]} step="1" 
                    defaultValue={DEFAULT_VALUES.squad} onChange={validateValue} onFocus={(e) => cleanError(e.target)}/>
            </div>
            <div>
                <label>Slots diff</label>
                <input name="slots" min={MIN_MAX.slots[0]} max={MIN_MAX.slots[1]} step="1" 
                    defaultValue={DEFAULT_VALUES.slots} onChange={validateValue} onFocus={(e) => cleanError(e.target)}/>
            </div>
        </div>
        <div className={formStyles.btncont}>
            <Button onClick={validateForm}>Form roster</Button>
            <Button onClick={setDefault}>Set default values</Button>
        </div>
    </form>
}