import styles from './spinner.module.scss';

export default function Spinner({fixed, text}: {fixed?: boolean, text: string}) {
    return <div className={`${styles.s} ${fixed ? styles.f : ''}`}>
      <div className={styles.text}>{text}</div>
      <div className={styles.sp}>
        <div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
      </div>
    </div>
}