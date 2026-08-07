import MapExplorer from "@/components/MapExplorer/MapExplorer";
import { ENTRIES, GENRES } from "@/data/folklore";
import { DISTRICTS } from "@/data/districts";
import styles from "./page.module.css";

export default function Home() {
  const districtCount = new Set(ENTRIES.flatMap((e) => e.districts ?? [])).size;

  return (
    <main>
      <header className={styles.hero}>
        <a className={styles.back} href="https://komi.world">
          ← komi.world
        </a>

        <p className={styles.kicker}>Республика Коми · Фольклор</p>
        <h1 className={styles.title}>
          Карта
          <br />
          преданий
        </h1>
        <p className={styles.lead}>
          Предания, божества, праздники и промыслы — привязанные к той земле, где их
          записали. Выберите район, чтобы прочитать его сюжеты.
        </p>

        <dl className={styles.stats}>
          <div>
            <dt>Сюжетов</dt>
            <dd>{ENTRIES.length}</dd>
          </div>
          <div>
            <dt>Районов</dt>
            <dd>
              {districtCount} <span>/ {Object.keys(DISTRICTS).length}</span>
            </dd>
          </div>
          <div>
            <dt>Разделов</dt>
            <dd>{GENRES.length}</dd>
          </div>
        </dl>
      </header>

      <MapExplorer />

      <footer className={styles.footer}>
        <p>
          Корпус пополняется. Записи со статусом «требует сверки» помечены в тексте
          сюжета — привязка к району в них предложена составителем.
        </p>
        <a href="https://komi.world">komi.world</a>
      </footer>
    </main>
  );
}
