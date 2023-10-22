import { memo, useContext } from "react";
import Button from "../../ui/button";
import styles from './header.module.scss';
import { StateContext } from "../../../store/context";
import { SwitchLanguage } from "../../../store/actions";
import { Language } from "../../../store/translations";

function Header() {
    const {state, dispatch} = useContext(StateContext);

    const switchLang = () => {
        dispatch(new SwitchLanguage(state.ui.lang as Language));
        localStorage.setItem('lang', state.ui.lang);
    };
    return <>
        <Button className={styles.btn} onClick={switchLang}>{state.ui.lang}</Button>
        <div className={styles.header}>
            <h1>{state.ui.header.title}</h1>
            <div className="note">
                {state.ui.header.description(<a href="https://sg.zone" target="_blank">SolidGames</a>)}
            </div>
        </div>
    </>
    
}

export default memo(Header);