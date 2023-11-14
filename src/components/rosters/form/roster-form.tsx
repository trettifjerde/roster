import { ChangeEventHandler, memo, useContext, useEffect, useReducer, useRef } from 'react';

import { CalculationParams, HAPPINESS, HAPPY, INVALID, RANGE, RosterFormError, RosterFormFieldname, RosterFormNewValue, RosterFormState, Squad, UNHAPPY, UNWANTED } from '../../../util/types';
import { findRosterError, initRosterForm, updateStateHappiness, validateRosterFormField } from '../../../util/helpers';

import { StateContext } from '../../../store/context';

import Button from '../../ui/button';

import styles from './form.module.scss';


function RosterForm({startCalculating}: {
    startCalculating: (p: CalculationParams) => void
}) {
    const {squads, ui} = useContext(StateContext).state;
    const formUI = ui.rosterForm;
    const ref = useRef<HTMLFormElement>(null);
    const [formState, dispatch] = useReducer(reducer, squads, initRosterForm);

    useEffect(() => {
        dispatch({type: 'reset', squads});
    }, [squads]);

    const setDefault = () => dispatch({type: 'reset', squads});

    const handleChange : ChangeEventHandler<HTMLInputElement> = (e) => {
        const { name, value } = e.target;
        dispatch({type: 'set', field: {name: name as RosterFormFieldname, value}});
    }

    const converErrorToText = (info: RosterFormError) => {
        
        if (info) {
            const {field, error} = info;

            switch (error) {
                case  INVALID:
                    return formUI.form[field].invalid;

                case RANGE:
                    return formUI.rangeError(formUI.form[field].label, formState.form[field].min, formState.form[field].max);

                default: 
                    return formUI.unknownError;
            } 
        }

        return ''; 
    };

    const handleCheckbox : ChangeEventHandler<HTMLInputElement> = (e) => {
        dispatch({type: 'toggleUnwanted'});
    }

    const validateForm = () => {

        if (formState.error)
            return;

        if (ref.current) {

            const params : CalculationParams = {slots: 0, happiness: 0, happy: 0, unhappy: 0, unwanted: null};
            for (const [field, info] of Object.entries(formState.form)) {
                switch (field) {
                    case UNWANTED:
                        if (formState.unwantedOff) {
                            break;
                        }

                    default:
                        if (info.error || typeof info.value === 'string')
                            return;
                        params[field as RosterFormFieldname] = info.value;
                }
            }
            console.log(params);
            startCalculating(params);
        }
    };

    return <form className={`form ${styles.form}`} ref={ref}
        onSubmit={(e) => e.preventDefault()}>
        <p className="form-err">{converErrorToText(formState.error)}</p>
        <div>
            {Object.entries(formState.form).map(([name, info]) => <div key={name} className={styles.lblcont}>
                <label>
                    <div>
                        {formUI.form[name as RosterFormFieldname].label}
                        {name === UNWANTED && <input type='checkbox' 
                            checked={!formState.unwantedOff}
                            onChange={handleCheckbox}
                        /> }
                    </div>

                    <input type='number' className={info.error ? 'invalid' : ''} name={name} step={name === HAPPINESS ? 0.001 : 1} 
                        min={info.min} 
                        max={info.max}
                        value={info.value}
                        disabled={name === UNWANTED && formState.unwantedOff}
                        onChange={handleChange} />
                </label>
                <div className='note'>{formUI.form[name as RosterFormFieldname].description}</div>
            </div>)}
        </div>
        <div className="btncont">
            <Button onClick={validateForm}>{ui.btns.formRoster}</Button>
            <Button onClick={setDefault}>{ui.btns.setDefault}</Button>
        </div>
    </form>
}

export default memo(RosterForm);

const reducer = (state: RosterFormState, action: FormAction) => {
    switch (action.type) {
        case 'reset':
            return initRosterForm(action.squads);
        
        case 'set':
            const {value, error} = validateRosterFormField(state, action.field);
            const updForm = {...state.form};
            updForm[action.field.name].value = value;
            updForm[action.field.name].error = error;
            
            // update happiness config if it's either happy or unhappy that's being updated

            if (!error) {
                
                switch (action.field.name) {
                    case HAPPY:
                        if (!state.form[UNHAPPY].error) 
                        updForm.happiness = updateStateHappiness(state.squadsPerSide, value, +state.form[UNHAPPY].value);
                        break;
                        case UNHAPPY:
                        if (!state.form[HAPPY].error) 
                        updForm.happiness = updateStateHappiness(state.squadsPerSide, +state.form[HAPPY].value, value);
                    break;
                }
            }

            const currentError = error ? {field: action.field.name, error} as RosterFormError : findRosterError(updForm, state.unwantedOff);

            return {
                ...state, 
                form: updForm,
                error: currentError
            };

        case 'toggleUnwanted':

            return {
                ...state,
                unwantedOff: !state.unwantedOff,
                error: findRosterError(state.form, !state.unwantedOff)
            }

        default: 
            return state;
    }
}

type FormAction = {
    type: 'set', field: RosterFormNewValue
} | {
    type: 'reset', squads: Squad[]
} | {
    type: 'toggleUnwanted'
};