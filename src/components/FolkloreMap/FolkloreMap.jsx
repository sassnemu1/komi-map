"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { DISTRICTS } from "@/data/districts";
import { entriesForDistrict, GENRE_BY_ID } from "@/data/folklore";
import styles from "./FolkloreMap.module.css";

// Интерактивная карта районов. Отличие от карты на komi.world:
// здесь район не только подсвечивается, но и выбирается кликом —
// выбор поднимается наверх и открывает боковую панель с сюжетами.
// Районы без записей остаются кликабельными, но помечены как пустые.
export default function FolkloreMap({ selected, onSelect, activeGenre }) {
  const hostRef = useRef(null);
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [ready, setReady] = useState(false);

  // Колбэки живут в ref, чтобы не переподписывать слушателей на
  // каждый рендер: сам SVG вставляется один раз.
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    let cancelled = false;
    const cleanupFns = [];

    fetch("/komi-map.svg")
      .then((res) => res.text())
      .then((svgText) => {
        const host = hostRef.current;
        if (cancelled || !host) return;

        host.innerHTML = svgText;
        const svg = host.querySelector("svg");
        if (!svg) return;
        svgRef.current = svg;

        svg.removeAttribute("width");
        svg.removeAttribute("height");
        svg.style.width = "100%";
        svg.style.height = "auto";
        svg.style.display = "block";
        svg.style.overflow = "visible";

        // Слой с номерами районов лежит поверх контуров и перехватывает
        // указатель ровно там, где написана цифра. Он декоративный.
        const numbersLayer = svg.querySelector("#layer5");
        if (numbersLayer) numbersLayer.style.pointerEvents = "none";

        let defs = svg.querySelector("defs");
        if (!defs) {
          defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
          svg.insertBefore(defs, svg.firstChild);
        }

        Object.entries(DISTRICTS).forEach(([id, info]) => {
          const path = svg.querySelector(`#${id}`);
          if (!path) return;

          const entries = entriesForDistrict(id);
          path.setAttribute("data-district", info.name);
          path.setAttribute("data-count", String(entries.length));
          if (entries.length === 0) path.setAttribute("data-empty", "true");

          // Флаг района заливкой — тот же приём, что на komi.world:
          // pattern по bbox фигуры с cover-кадрированием.
          if (info.flag) {
            const bbox = path.getBBox();
            const patternId = `flag-${id}`;
            const pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
            pattern.setAttribute("id", patternId);
            pattern.setAttribute("patternUnits", "userSpaceOnUse");
            pattern.setAttribute("x", bbox.x);
            pattern.setAttribute("y", bbox.y);
            pattern.setAttribute("width", bbox.width);
            pattern.setAttribute("height", bbox.height);

            const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
            image.setAttribute("href", info.flag);
            image.setAttribute("x", "0");
            image.setAttribute("y", "0");
            image.setAttribute("width", bbox.width);
            image.setAttribute("height", bbox.height);
            image.setAttribute("preserveAspectRatio", "xMidYMid slice");

            pattern.appendChild(image);
            defs.appendChild(pattern);
            path.style.setProperty("--flag", `url(#${patternId})`);
            path.setAttribute("data-has-flag", "true");
          }

          const show = (e) => {
            const rect = host.getBoundingClientRect();
            setTooltip({
              name: info.name,
              type: info.type,
              count: entries.length,
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
            });
          };
          const hide = () => setTooltip(null);
          const click = () => onSelectRef.current?.(id);
          const key = (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelectRef.current?.(id);
            }
          };

          // Каждый район — настоящая кнопка для клавиатуры и скринридера,
          // иначе карта остаётся доступной только мышью.
          path.setAttribute("tabindex", "0");
          path.setAttribute("role", "button");
          path.setAttribute(
            "aria-label",
            `${info.name}. ${entries.length ? `Сюжетов: ${entries.length}` : "Записей пока нет"}`
          );

          path.addEventListener("pointerenter", show);
          path.addEventListener("pointerleave", hide);
          path.addEventListener("focus", show);
          path.addEventListener("blur", hide);
          path.addEventListener("click", click);
          path.addEventListener("keydown", key);

          cleanupFns.push(() => {
            path.removeEventListener("pointerenter", show);
            path.removeEventListener("pointerleave", hide);
            path.removeEventListener("focus", show);
            path.removeEventListener("blur", hide);
            path.removeEventListener("click", click);
            path.removeEventListener("keydown", key);
          });
        });

        setReady(true);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      cleanupFns.forEach((fn) => fn());
    };
  }, []);

  // Выделение и фильтр по жанру перерисовываем отдельным эффектом —
  // SVG уже в DOM, трогаем только атрибуты.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !ready) return;

    Object.keys(DISTRICTS).forEach((id) => {
      const path = svg.querySelector(`#${id}`);
      if (!path) return;

      const entries = entriesForDistrict(id);
      const matches = activeGenre
        ? entries.filter((e) => e.genre === activeGenre)
        : entries;

      path.toggleAttribute("data-selected", selected === id);
      path.toggleAttribute("data-dimmed", Boolean(activeGenre) && matches.length === 0);
      path.setAttribute("data-count", String(matches.length));
    });
  }, [selected, activeGenre, ready]);

  const clearSelection = useCallback(() => onSelectRef.current?.(null), []);

  return (
    <div className={styles.wrap}>
      <div
        ref={hostRef}
        className={styles.svgHost}
        onClick={(e) => {
          // Клик по пустому месту снимает выбор.
          if (e.target === e.currentTarget || e.target.tagName === "svg") clearSelection();
        }}
      />

      {tooltip && (
        <div className={styles.tooltip} style={{ left: tooltip.x, top: tooltip.y }}>
          <span className={styles.tooltipType}>{tooltip.type}</span>
          <span className={styles.tooltipName}>{tooltip.name}</span>
          <span className={styles.tooltipCount}>
            {tooltip.count > 0 ? `${tooltip.count} ${plural(tooltip.count)}` : "записей пока нет"}
          </span>
        </div>
      )}
    </div>
  );
}

function plural(n) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "сюжет";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "сюжета";
  return "сюжетов";
}

export { GENRE_BY_ID };
