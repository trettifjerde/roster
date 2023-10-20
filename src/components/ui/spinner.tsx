import Button from './button';
import styles from './spinner.module.scss';

export default function Spinner({ text, status, abort, abortText }: {
  text: string,
  status: JSX.Element,
  abortText: string,
  abort: () => void
}) {

  return <div className={styles.s}>
    <div className={styles.inner}>
      <div className="header"><h3>{text}</h3></div>
      <div className={styles.body}>
        <div className={styles.text}>{status}</div>
        <div className={styles.sp}>
          <div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
        </div>
        <Button onClick={abort}>{abortText}</Button>
      </div>
    </div>
  </div>
}