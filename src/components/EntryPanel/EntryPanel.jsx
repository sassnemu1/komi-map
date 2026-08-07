"use client";

import { useEffect, useRef } from "react";
import { GENRE_BY_ID } from "@/data/folklore";
import styles from "./EntryPanel.module.css";

// Боковая панель: список сюжетов выбранного района либо развёрнутая
// запись. Закрывается по Esc и по клику вне панели.
export default function EntryPanel({ district, entries, entry, onPick, onBack, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (entry) onBack();
      else onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [entry, onBack, onClose]);

  // Возвращаем скролл наверх при смене записи, иначе длинный текст
  // открывается там же, где закончился предыдущий.
  useEffect(() => {
    ref.current?.scrollTo({ top: 0 });
  }, [entry, district]);

  if (!district) return null;

  const genre = entry ? GENRE_BY_ID[entry.genre] : null;

  return (
    <aside className={styles.panel} ref={ref} aria-label="Сюжеты района">
      <header className={styles.head}>
        {entry ? (
          <button className={styles.back} onClick={onBack}>
            ← {district.name}
          </button>
        ) : (
          <div className={styles.headText}>
            <span className={styles.type}>{district.type}</span>
            <h2 className={styles.districtName}>{district.name}</h2>
          </div>
        )}
        <button className={styles.close} onClick={onClose} aria-label="Закрыть">
          ✕
        </button>
      </header>

      {!entry && (
        <div className={styles.list}>
          {entries.length === 0 && (
            <p className={styles.empty}>
              Для этого района записей пока нет. Корпус пополняется — если у вас есть
              предание, привязанное к этой земле, его место здесь.
            </p>
          )}

          {entries.map((e) => {
            const g = GENRE_BY_ID[e.genre];
            return (
              <button key={e.id} className={styles.card} onClick={() => onPick(e)}>
                <span className={styles.cardGenre} style={{ "--g": g?.color }}>
                  {g?.label}
                </span>
                <span className={styles.cardTitle}>{e.title}</span>
                {e.komi && <span className={styles.cardKomi}>{e.komi}</span>}
                <span className={styles.cardLead}>{e.lead}</span>
                <span className={styles.cardMore}>Читать →</span>
              </button>
            );
          })}
        </div>
      )}

      {entry && (
        <article className={styles.article}>
          <span className={styles.articleGenre} style={{ "--g": genre?.color }}>
            {genre?.label}
          </span>
          <h1 className={styles.articleTitle}>{entry.title}</h1>
          {entry.komi && <p className={styles.articleKomi}>{entry.komi}</p>}

          <dl className={styles.meta}>
            <div>
              <dt>Место</dt>
              <dd>{entry.place}</dd>
            </div>
            <div>
              <dt>Время</dt>
              <dd>{entry.period}</dd>
            </div>
          </dl>

          {entry.body.map((p, i) => (
            <p key={i} className={styles.para}>
              {p}
            </p>
          ))}

          {entry.sources?.length > 0 && (
            <footer className={styles.sources}>
              <span className={styles.sourcesLabel}>Источники</span>
              <ul>
                {entry.sources.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              {entry.verified === "review" && (
                <p className={styles.reviewNote}>
                  Привязка сюжета к району требует сверки с первоисточником.
                </p>
              )}
            </footer>
          )}
        </article>
      )}
    </aside>
  );
}
