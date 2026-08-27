import Link from "next/link";
import { notFound } from "next/navigation";
import { ENTRIES, GENRE_BY_ID } from "@/data/folklore";
import { DISTRICTS } from "@/data/districts";
import styles from "./page.module.css";

// Отдельная страница сюжета: индексация поисковиками и постоянные
// ссылки. Интерактивное чтение остаётся на карте — отсюда ведём назад.

export function generateStaticParams() {
  return ENTRIES.map((e) => ({ id: e.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const entry = ENTRIES.find((e) => e.id === id);
  if (!entry) return {};
  return {
    title: entry.title,
    description: entry.lead,
    alternates: { canonical: `/entry/${entry.id}` },
    openGraph: {
      type: "article",
      title: entry.title,
      description: entry.lead,
      url: `/entry/${entry.id}`,
    },
  };
}

export default async function EntryPage({ params }) {
  const { id } = await params;
  const entry = ENTRIES.find((e) => e.id === id);
  if (!entry) notFound();

  const genre = GENRE_BY_ID[entry.genre];
  const places = (entry.districts ?? [])
    .map((d) => DISTRICTS[d])
    .filter(Boolean);

  const related = ENTRIES.filter(
    (e) =>
      e.id !== entry.id &&
      (e.districts?.some((d) => entry.districts?.includes(d)) ||
        e.genre === entry.genre),
  ).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: entry.title,
    description: entry.lead,
    inLanguage: "ru",
    articleSection: genre?.label,
    isPartOf: {
      "@type": "WebSite",
      name: "Фольклорная карта Республики Коми",
      url: "https://map.komi.world",
    },
  };

  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className={styles.nav}>
        <Link className={styles.back} href="/">
          ← Карта преданий
        </Link>
      </nav>

      <article className={styles.article}>
        <span className={styles.genre} style={{ "--g": genre?.color }}>
          {genre?.label}
        </span>
        <h1 className={styles.title}>{entry.title}</h1>
        {entry.komi && <p className={styles.komi}>{entry.komi}</p>}

        <dl className={styles.meta}>
          <div>
            <dt>Место</dt>
            <dd>{entry.place}</dd>
          </div>
          <div>
            <dt>Время</dt>
            <dd>{entry.period}</dd>
          </div>
          {places.length > 0 && (
            <div>
              <dt>{places.length === 1 ? "Район" : "Районы"}</dt>
              <dd>{places.map((p) => p.name).join(", ")}</dd>
            </div>
          )}
          {entry.areaWide && (
            <div>
              <dt>Бытование</dt>
              <dd>По всей республике</dd>
            </div>
          )}
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
                {entry.areaWide
                  ? "Трактовка сюжета требует сверки с первоисточником."
                  : "Привязка сюжета к району требует сверки с первоисточником."}
              </p>
            )}
          </footer>
        )}
      </article>

      {related.length > 0 && (
        <section className={styles.related} aria-label="Читать дальше">
          <h2 className={styles.relatedTitle}>Читать дальше</h2>
          <div className={styles.relatedGrid}>
            {related.map((e) => {
              const g = GENRE_BY_ID[e.genre];
              return (
                <Link key={e.id} className={styles.card} href={`/entry/${e.id}`}>
                  <span className={styles.cardGenre} style={{ "--g": g?.color }}>
                    {g?.label}
                  </span>
                  <span className={styles.cardTitle}>{e.title}</span>
                  <span className={styles.cardLead}>{e.lead}</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <footer className={styles.footer}>
        <Link href="/">Карта преданий</Link>
        <a href="https://komi.world">komi.world</a>
      </footer>
    </main>
  );
}
