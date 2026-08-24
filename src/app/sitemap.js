import { ENTRIES } from "@/data/folklore";

const SITE = "https://map.komi.world";

export default function sitemap() {
  return [
    { url: SITE, changeFrequency: "weekly", priority: 1 },
    ...ENTRIES.map((e) => ({
      url: `${SITE}/entry/${e.id}`,
      changeFrequency: "monthly",
      priority: 0.7,
    })),
  ];
}
