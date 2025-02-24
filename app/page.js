import TetrisModal from '../components/TetrisModal';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.home}>
      <div className={styles.content}>
        <h1 className={styles.title}>Welcome to Your Flashback</h1>
        <TetrisModal />
      </div>
    </div>
  );
}
