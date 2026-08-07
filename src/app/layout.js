import "./globals.css";

const SITE = "https://map.komi.world";

export const metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Фольклорная карта Республики Коми",
    template: "%s · Фольклорная карта Коми",
  },
  description:
    "Интерактивная карта преданий, божеств, праздников и промыслов Республики Коми: сюжеты, привязанные к районам, рекам и сёлам.",
  keywords: [
    "коми", "фольклор", "мифология", "предания", "Республика Коми",
    "Пера", "Кӧрт Айка", "Яг Морт", "карта",
  ],
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: SITE,
    siteName: "Фольклорная карта Коми",
    title: "Фольклорная карта Республики Коми",
    description:
      "Предания, божества, праздники и промыслы Коми — на карте районов республики.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
