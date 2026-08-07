"use client";

import { useState, useMemo, useCallback } from "react";
import FolkloreMap from "@/components/FolkloreMap/FolkloreMap";
import EntryPanel from "@/components/EntryPanel/EntryPanel";
import { DISTRICTS } from "@/data/districts";
import { GENRES, ENTRIES, AREA_WIDE, entriesForDistrict, GENRE_BY_ID } from "@/data/folklore";
import styles from "./MapExplorer.module.css";

export default function MapExplorer() {
  const [selected, setSelected] = useState(null);   // id пути района
  const [entry, setEntry] = useState(null);         // раскрытая запись
  const [genre, setGenre] = useState(null);         // активный фильтр

  const district = selected ? DISTRICTS[selected] : null;

  const entries = useMemo(() => {
    if (!selected) return [];
    const all = entriesForDistrict(selected);
    return genre ? all.filter((e) => e.genre === genre) : all;
  }, [selected, genre]);

  const handleSelect = useCallback((id) => {
    setSelected(id);
    setEntry(null);
  }, []);

  const close = useCallback(() => {
    setSelected(null);
    setEntry(null);
  }, []);

  const toggleGenre = useCallback((id) => {
    setGenre((cur) => (cur === id ? null : id));
    setEntry(null);
  }, []);

  return (
    <section className={styles.section}>
      {/* ─── Фильтр по разделам ─── */}
      <div className={styles.filters} role="group" aria-label="Разделы фольклора">
        <button
          className={`${styles.chip} ${!genre ? styles.chipOn : ""}`}
          onClick={() => setGenre(null)}
        >
          Все разделы
          <span className={styles.chipCount}>{ENTRIES.length}</span>
        </button>

        {GENRES.map((g) => {
          const n = ENTRIES.filter((e) => e.genre === g.id).length;
          return (
            <button
              key={g.id}
              className={`${styles.chip} ${genre === g.id ? styles.chipOn : ""}`}
              style={{ "--g": g.color }}
              onClick={() => toggleGenre(g.id)}
              aria-pressed={genre === g.id}
            >
              {g.label}
              <span className={styles.chipCount}>{n}</span>
            </button>
          );
        })}
      </div>

      <div className={`${styles.grid} ${district ? styles.gridOpen : ""}`}>
        <div className={styles.mapCol}>
          <FolkloreMap selected={selected} onSelect={handleSelect} activeGenre={genre} />
          {!district && (
            <p className={styles.hint}>
              Наведите курсор на район, чтобы увидеть название, и нажмите, чтобы открыть
              его сюжеты. Районы без записей залиты светлее.
            </p>
          )}
        </div>

        {district && (
          <EntryPanel
            district={district}
            entries={entries}
            entry={entry}
            onPick={setEntry}
            onBack={() => setEntry(null)}
            onClose={close}
          />
        )}
      </div>

      {/* ─── Сюжеты без географической привязки ─── */}
      {AREA_WIDE.length > 0 && (
        <div className={styles.areaWide}>
          <h2 className={styles.areaWideTitle}>Бытует по всей республике</h2>
          <p className={styles.areaWideLead}>
            Эти сюжеты не привязаны к одной точке — их записывали по всему краю.
          </p>
          <div className={styles.areaWideRow}>
            {AREA_WIDE.map((e) => {
              const g = GENRE_BY_ID[e.genre];
              return (
                <article key={e.id} className={styles.wideCard}>
                  <span className={styles.wideGenre} style={{ "--g": g?.color }}>
                    {g?.label}
                  </span>
                  <h3 className={styles.wideTitle}>{e.title}</h3>
                  {e.komi && <p className={styles.wideKomi}>{e.komi}</p>}
                  <p className={styles.wideLead}>{e.lead}</p>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
